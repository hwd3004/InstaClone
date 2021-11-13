import client from "../client";

export default {
  Mutation: {
    createAccount: async (
      root,
      { firstName, lastName, username, email, password }
    ) => {
      const existingUser = await client.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      console.log(existingUser);

      client.user.findFirst({});

      client.user.findUnique({});
    },
  },
};
