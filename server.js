require("dotenv").config();
import { ApolloServer } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import express from "express";
import { schema } from "./schema";
import { getUser } from "./users/users.utils";
import morgan from "morgan";
import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";

const PORT = process.env.PORT;

const startServer = async () => {
  // SubscriptionServer
  const app = express();
  const httpServer = createServer(app);
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      // https://www.apollographql.com/docs/apollo-server/data/subscriptions/#onconnect-and-ondisconnect
      onConnect: async ({ token }, webSockt, context) => {
        if (!token) {
          throw new Error("You can't listen");
        }
        const loggedInUser = await getUser(token);
        console.log("Connected");
        return loggedInUser;
      },
      onDisconnect(webSocket, context) {
        console.log("Disconnected");
      },
    },
    { server: httpServer }
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      if (req) {
        return {
          loggedInUser: await getUser(req.headers.token),
        };
      }
    },
    plugins: [
      {
        // SubscriptionServer
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(graphqlUploadExpress());
  app.use(morgan("tiny"));
  app.use("/static", express.static("uploads"));

  server.applyMiddleware({ app });

  await new Promise((resolve) =>
    // app.listen({ port: process.env.PORT }, resolve)
    httpServer.listen({ port: process.env.PORT }, resolve)
  );

  console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
  console.log(
    `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
  );
};

startServer();
