import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_DIRS = [
  path.join(__dirname, '../../public/uploads/avatars'),
];

export const ensureUploadDirs = () => {
  UPLOAD_DIRS.forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });
};

export default ensureUploadDirs;
