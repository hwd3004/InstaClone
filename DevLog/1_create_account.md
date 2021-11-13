테스트용이었던 Movie 삭제

users 생성, schema.prisma의 유저 모델과 users.typeDefs.js의 타입 유저를 매칭 시키는 작업에 주의할 것

npx prisma migrate dev

npx prisma studio

프리즈마 스튜디오로 DB 확인

```javascript
export default gql`
  type User {
    id: Int!
    firstName: String!
    lastName: String
    username: String!
    email: String!
    createdAt: String!
    updatedAt: String!
  }
```

GraphQL에선 패스워드는 필요없다. 기본적으로 패스워드를 묻지 않을 것이다