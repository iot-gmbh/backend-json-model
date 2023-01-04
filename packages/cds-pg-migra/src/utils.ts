import fs from 'fs';
import path from 'path';

const { dirname, join, resolve } = path;
const root = process.cwd();

export function isdir(x) {
  try {
    const y = resolve(root, x);
    const ls = fs.lstatSync(y);

    if (ls.isDirectory()) return y;
    if (ls.isSymbolicLink()) {
      return isdir(join(dirname(y), fs.readlinkSync(y)));
    }
  } catch (e) {
    return false;
  }
}

export async function read(file, _encoding) {
  const f = resolve(root, file);
  const src = await fs.promises.readFile(
    f,
    (_encoding !== 'json' && _encoding) || 'utf8',
  );
  return _encoding === 'json' || (!_encoding && f.endsWith('.json'))
    ? JSON.parse(src.toString())
    : src;
}
