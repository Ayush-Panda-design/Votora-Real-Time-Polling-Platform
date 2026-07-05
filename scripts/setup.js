import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const copies = [
  ['server/.env.example', 'server/.env'],
  ['client/.env.example', 'client/.env'],
];

for (const [from, to] of copies) {
  const src = path.join(root, from);
  const dest = path.join(root, to);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`Created ${to}`);
  } else {
    console.log(`Skipped ${to} (already exists)`);
  }
}

console.log('\nSetup complete. Update server/.env with your MongoDB URI and JWT secret, then run: npm run dev');
