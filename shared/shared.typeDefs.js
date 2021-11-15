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
    !existsSync(folderName) && mkdirSync(folderName);

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
