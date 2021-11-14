import client from "../../client.js";

export default {
  Query: {
    seeProfile: (_, { username }) =>
      client.user.findUnique({
        where: {
          username,
        },
      }),
  },
};
