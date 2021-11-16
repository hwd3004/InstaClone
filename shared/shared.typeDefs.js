import { gql } from "apollo-server";
import { createWriteStream, existsSync, mkdirSync } from "fs";

export default gql`
  type MutationResponse {
    ok: Boolean!
    error: String
  }
`;

export const uploadLocal = async (file, userId, folderName) => {
  try {
    // https://itinerant.tistory.com/55
    // [nodejs] 폴더 없으면 생성하도록 하는 방법
    !existsSync(`uploads/${folderName}`) && mkdirSync(`uploads/${folderName}`);

    // https://dev.to/kingmaker9841/apollo-server-express-file-upload-on-local-storage-and-on-aws-s3-1km8
    // 나중에 비동기 처리 해주어야한다
    const { filename, createReadStream } = await file.file;
    const objectName = `${folderName}/${userId}-${Date.now()}-${filename}`;
    const readStream = createReadStream();
    const writeStream = createWriteStream(
      process.cwd() + "/uploads/" + objectName
    );
    readStream.pipe(writeStream);
    const Location = `http://localhost:4000/static/${objectName}`;

    return Location;
  } catch (error) {
    console.log(error);
    return error;
  }
};
