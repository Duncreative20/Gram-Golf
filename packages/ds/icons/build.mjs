// svg (export Figma ❖ Iconography) → src/icons/generated.ts. Chạy: pnpm -F @gr/ds build:icons
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, '..', 'assets', 'icons');
const files = readdirSync(dir).filter((f) => f.endsWith('.svg')).sort();
const entries = files.map((f) => {
  const name = f.replace(/\.svg$/, '');
  let svg = readFileSync(join(dir, f), 'utf8')
    .replace(/<\?xml[^>]*>\s*/, '')
    .replace(/\s*\n\s*/g, '')
    .replace(/ xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '')
    .trim();
  // Màu cứng của path → currentColor để <Icon color> đổi màu; rect trong clipPath giữ "white" (không vẽ).
  svg = svg.replace(/(stroke|fill)="#[0-9a-fA-F]{3,8}"/g, '$1="currentColor"');
  return `  ${JSON.stringify(name)}: ${JSON.stringify(svg)},`;
});
const out = `// Sinh bởi icons/build.mjs — KHÔNG sửa tay. Nguồn: assets/icons/*.svg (export Figma ❖ Iconography)\nexport const ICONS = {\n${entries.join('\n')}\n} as const;\nexport type IconName = keyof typeof ICONS;\n`;
writeFileSync(join(here, '..', 'src', 'icons', 'generated.ts'), out);
console.log(files.length + ' icons → src/icons/generated.ts');
