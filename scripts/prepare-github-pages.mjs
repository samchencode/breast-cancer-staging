import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');
const noJekyllPath = join(distDir, '.nojekyll');

const html = readFileSync(indexPath, 'utf8')
  .replaceAll('href="/', 'href="./')
  .replaceAll('src="/', 'src="./');

writeFileSync(indexPath, html);
writeFileSync(noJekyllPath, '');
