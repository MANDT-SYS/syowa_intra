export const MAX_UPLOAD_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const MAX_UPLOAD_FILE_SIZE_MESSAGE = "ファイルは50MB以下にしてください。";

export const assertFileSize = (file: File): void => {
  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error(MAX_UPLOAD_FILE_SIZE_MESSAGE);
  }
};
