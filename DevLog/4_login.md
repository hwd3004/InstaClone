/users/users.typeDefs.js

```javascript
...
  type LoginResult {
    # 토큰과 에러는 필수가 아니다. 성공 여부는 필수
    ok: Boolean!
    token: String
    error: String
  }
...
    # 로그인은 성공, 실패 여부를 리턴
    login(username: String!, password: String!): LoginResult!
...
```

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "../client";

...
    login: async (_, { username, password }) => {
      const user = await client.user.findFirst({ where: { username } });
      if (!user) {
        return {
          ok: false,
          error: "User not found.",
        };
      }

      // bcrypt.compare(전달받은 비밀번호, DB에 있는 해쉬된 비밀번호)
      const passwordOk = await bcrypt.compare(password, user.password);
      if (!passwordOk) {
        return {
          ok: false,
          error: "Incorrect password.",
        };
      }
    },
...
```
