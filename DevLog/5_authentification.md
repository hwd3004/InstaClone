https://victorydntmd.tistory.com/116

JWT에 대한 설명

/login/login.resolvers.js

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "../../client";

export default {
  Mutation: {
    login: async (_, { username, password }) => {
      const user = await client.user.findFirst({ where: { username } });
      if (!user) {
        return {
          ok: false,
          error: "User not found.",
        };
      }
      const passwordOk = await bcrypt.compare(password, user.password);
      if (!passwordOk) {
        return {
          ok: false,
          error: "Incorrect password.",
        };
      }

      const token = await jwt.sign({ id: user.id }, process.env.SECRET_KEY);

      return {
        ok: true,
        token,
      };
    },
  },
};
```

사용자가 로그인 성공 시 토큰 생성, jwt.sign()에 넣을 payload에는 해당 사용자의 고유 값이지만 중요하지 않은 것, 주로 DB에 자동 생성되는 id를 넣어주고, 2번 파라미터로 서버 키를 넣어준다

https://tech.kakao.com/2019/08/01/graphql-basic/

리졸버 함수의 인자들

세번째 인자는 context로 모든 리졸버에게 전달이 됩니다.
주로 미들웨어를 통해 입력된 값들이 들어 있습니다.
로그인 정보 혹은 권한과 같이 주요 컨텍스트 관련 정보를 가지고 있습니다.

#

server.js

```javascript
require("dotenv").config();
import { ApolloServer } from "apollo-server";
import schema from "./schema";
import { getUser } from "./users/users.utils";

const PORT = process.env.PORT;
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    return {
      loggedInUser: await getUser(req.headers.token),
    };
  },
});
server
  .listen(PORT)
  .then(() =>
    console.log(`🚀Server is running on http://localhost:${PORT} ✅`)
  );
```

ApolloServer 객체 생성에서 context를 넣어주면, 모든 리졸버들에게 세 번째 파라미터로 context가 전달된다

context에는 오브젝트를 넣어줄 수도 있고, 함수를 넣어줄 수도 있다

현재는 context.req.headers.token, HTTP 헤더에 있는 토큰을 읽어서 유저의 인증을 확인하는데, 이를 테스트해보려면 Altair 같은 프로그램에서 헤더에 토큰을 설정할 수 있다

#

/users/users.utils.js

```javascript
import jwt from "jsonwebtoken";
import client from "../client";

export const getUser = async (token) => {
  try {
    if (!token) {
      return null;
    }
    const { id } = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await client.user.findUnique({ where: { id } });
    if (user) {
      return user;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

// export const protectedResolver = (ourResolver) => {
// return (root, args, context, info) => {
// if (!context.loggedInUser) {
// return {
// ok: false,
// error: "Please log in to perform this action.",
// };
// }
// return ourResolver(root, args, context, info);
// };
// };

export function protectedResolver(ourResolver) {
  return function (root, args, context, info) {
    if (!context.loggedInUser) {
      return {
        ok: false,
        error: "Please log in to perform this action.",
      };
    }
    return ourResolver(root, args, context, info);
  };
}
```

토큰으로 사용자를 확인하려면 jwt.verify()로 토큰과 서버 키를 전달하여, 인증이 된 토큰인지 확인한다

리턴된 user는 위의 server.js의 server의 context의 loggedInUser에 전달한다

#

/editProfile/editProfile.resolvers.js

```javascript
import bcrypt from "bcrypt";
import client from "../../client";
import { protectedResolver } from "../users.utils";

const resolverFn = async (
  _,
  { firstName, lastName, username, email, password: newPassword },
  { loggedInUser }
) => {
  let uglyPassword = null;
  if (newPassword) {
    uglyPassword = await bcrypt.hash(newPassword, 10);
  }
  const updatedUser = await client.user.update({
    where: {
      id: loggedInUser.id,
    },
    data: {
      firstName,
      lastName,
      username,
      email,
      ...(uglyPassword && { password: uglyPassword }),
    },
  });
  if (updatedUser.id) {
    return {
      ok: true,
    };
  } else {
    return {
      ok: false,
      error: "Could not update profile.",
    };
  }
};

export default {
  Mutation: {
    editProfile: protectedResolver(resolverFn),
  },
};
```

protectedResolver라고 이름 지은, 직접 만든 리졸버는 사용자의 인증이 필요한 쿼리나 뮤테이션마다 사용자 인증 코드나 함수를 넣는 작업을 줄이기 위해 만들어졌다

```javascript
export default {
  Mutation: {
    editProfile: protectedResolver(resolverFn),
  },
};
```

editProfile은 사용자가 본인의 데이터를 수정하기 위한 뮤테이션으로, 사용자 본인만 가능하여야한다

protectedResolver 함수를 호출하면 context에 loggedInUser가 있는지 확인하고 없으면 에러를 리턴, 있으면 파라미터로 전달받은 함수를 호출한다
