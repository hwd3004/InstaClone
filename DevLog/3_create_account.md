```javascript
...
import bcrypt from "bcrypt";

...

      // 2번 파라미터 - 암호화에 사용되는 소금입니다. 숫자로 지정되면 지정된 라운드 수로 소금이 생성되어 사용됩니다.
      const uglyPassword = await bcrypt.hash(password, 10);

      // const user = await client.user.create(...);
      // return user; 이것과 아래 방식으로 리턴하는 것은 동일하다. 브라우저가 prisma가 끝날 때까지 기다린다
      return client.user.create({
        data: {
          firstName,
          lastName,
          username,
          email,
          password: uglyPassword,
        },
      });
...
```