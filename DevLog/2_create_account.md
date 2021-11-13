/users/users.mutations.js

```javascript
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
    },
  },
};
```

사용자의 계정 생성 작업 중, 계정을 생성하기 전에 유저네임이나 이메일이 이미 있는지 확인하는 작업이다

findFirst는 기준과 일치하는 목록의 첫 번째 레코드를 반환한다

findUnique를 써도 되지 않을까 싶은 생각이 드는데, 둘은 차이가 있다

https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findunique

https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#findfirst

둘이 사용하는 옵션이 다르고, where로 조건 추가할 때 findFirst는 and, not, or과 모든 필드가 가능하고, findUnique는 유니크 필드만 가능하다. 필요에 따라 좋아 보이는 것을 쓰면 될듯하다
