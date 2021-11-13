import { gql } from "apollo-server";

export default gql`
  type User {
    id: String!
    firstName: String!
    lastName: String
    username: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }
  type LoginResult {
    # 토큰과 에러는 필수가 아니다. 성공 여부는 필수
    ok: Boolean!
    token: String
    error: String
  }
  type Mutation {
    createAccount(
      firstName: String!
      lastName: String
      username: String!
      email: String!
      password: String!
    ): User

    # 로그인은 성공, 실패 여부를 리턴
    login(username: String!, password: String!): LoginResult!
  }
  type Query {
    seeProfile(username: String!): User
  }
`;
