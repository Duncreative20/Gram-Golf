// tokens/compact/*.json (kết quả use_figma) → tokens/figma/*.dtcg.json
//  - file có `pages`  : variables, gộp theo "<slug>.<mode>" → <slug>.<mode>.dtcg.json
//  - file styles.json : text styles + effect styles → text-styles.dtcg.json, effects.dtcg.json
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const IN = resolve(here, 'compact');
const OUT = resolve(here, 'figma');
const TYPE = { COLOR: 'color', FLOAT: 'number', STRING: 'fontFamily', BOOLEAN: 'boolean' };
const seg = (s) => s.replace(/\./g, '_');
const collisions = [];

function put(root, name, token) {
  const parts = name.split('/').map(seg);
  let node = root;
  for (const p of parts.slice(0, -1)) {
    if (node[p]?.$value !== undefined) collisions.push(name);
    node = node[p] = node[p] || {};
  }
  const leaf = parts.at(-1);
  if (node[leaf] && node[leaf].$value === undefined) collisions.push(name);
  node[leaf] = token;
}
const write = (file, obj) => writeFileSync(resolve(OUT, file), JSON.stringify(obj, null, 2) + '\n');

const merged = {};
let styles = null;
for (const f of readdirSync(IN).filter((f) => f.endsWith('.json')).sort()) {
  const data = JSON.parse(readFileSync(resolve(IN, f), 'utf8'));
  if (data.pages) for (const [key, rows] of Object.entries(data.pages)) (merged[key] = merged[key] || []).push(...rows);
  if (data.text || data.effects) styles = data;
}

for (const [key, rows] of Object.entries(merged)) {
  const slug = key.split('.')[0];
  const root = {};
  for (const [name, val, rt] of rows) {
    const isAlias = typeof val === 'string' && !val.startsWith('#') && rt !== 'STRING';
    put(root, name, { $type: TYPE[rt], $value: isAlias ? `{${val.split('.').map(seg).join('.')}}` : val, $extensions: { figma: { name } } });
  }
  write(`${key}.dtcg.json`, { [slug]: root });
  console.log(key, rows.length);
}

if (styles) {
  const text = {};
  for (const [name, value] of styles.text) put(text, name, { $type: 'typography', $value: value, $extensions: { figma: { name } } });
  write('text-styles.dtcg.json', { 'text-styles': text });
  const effects = {};
  for (const [name, shadows, blur] of styles.effects) put(effects, name, { $type: 'shadow', $value: shadows, $extensions: { figma: { name, blur } } });
  write('effects.dtcg.json', { effects });
  console.log('text-styles', styles.text.length, '| effects', styles.effects.length);
}
if (collisions.length) console.log('COLLISIONS', collisions);
