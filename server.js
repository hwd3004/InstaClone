require("dotenv").config();
import { ApolloServer } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import express from "express";
import { typeDefs, resolvers } from "./schema.js";
import { getUser } from "./users/users.utils.js";
import morgan from "morgan";

const PORT = process.env.PORT;

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      return {
        loggedInUser: await getUser(req.headers.token),
      };
    },
  });

  await server.start();

  const app = express();

  app.use(graphqlUploadExpress());
  app.use(morgan("tiny"));
  app.use("/static", express.static("uploads"));

  server.applyMiddleware({ app });

  await new Promise((resolve) =>
    app.listen({ port: process.env.PORT }, resolve)
  );

  console.log(`Server is running on http://localhost:${PORT}/graphql`);
};

startServer();
