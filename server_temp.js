require("dotenv").config();
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import logger from "morgan";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { typeDefs, resolvers } from "./schema";
import { getUser } from "./users/users.utils";
import { graphqlUploadExpress } from "graphql-upload";

const PORT = process.env.PORT;

const startServer = async () => {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer }
  ); //subscriptions 서버를 만듭니다.

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

  app.use(logger("tiny"));
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });
  app.use("/static", express.static("uploads"));

  httpServer.listen(PORT, () =>
    console.log(
      `🚀 Server is running on http://localhost:${PORT}${server.graphqlPath} ✅`
    )
  );
};
startServer();
