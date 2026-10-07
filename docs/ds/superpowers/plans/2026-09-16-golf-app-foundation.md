# Golf app foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Monorepo pnpm với `@gr/ds` (token DTCG dump từ Figma → Style Dictionary → theme TS + 3 primitive) và `apps/golf` (Expo SDK 57) chạy màn Onboarding Intro trên iPhone qua Expo Go, 0 literal style trong app.

**Architecture:** Figma variables/styles được dump qua `use_figma` (Plugin API) thành DTCG JSON commit trong `packages/ds/tokens/figma/`; `build.mjs` (Style Dictionary v5) resolve alias và sinh object phẳng `{ '<Figma/Path>': value } as const` trong `src/generated/`; `createTheme()` gom các map theo (scheme, emphasis) và `ThemeProvider/useTheme` đưa vào RN; UI primitive chỉ đọc theme. App Expo Router import `@gr/ds` qua workspace.

**Tech Stack:** pnpm 10 (corepack), Expo SDK 57, expo-router, expo-font, react-native-safe-area-context, TypeScript 5 strict, style-dictionary ^5, vitest ^3, Figma MCP (`use_figma`, `get_design_context`, `download_assets`).

**Spec:** `docs/ds/superpowers/specs/2026-09-16-golf-app-foundation-design.md`

## Global Constraints

- Expo SDK 57, chạy Expo Go (không dev build, không native module).
- pnpm workspaces, `.npmrc` có `node-linker=hoisted` (yêu cầu của Expo cho pnpm).
- Key token = đúng tên Figma (`'Color/Content/Neutral/Strongest'`), text style variant = tên style Figma (`'Body/Base/DemiBold'`). Không camelCase.
- Primitive (`global-colors`, `global-dimensions`) sinh `primitives.ts`, KHÔNG re-export từ `@gr/ds`.
- Mode mặc định: scheme `auto`, emphasis `neutral`, typography `Base 14`, breakpoint `Mobile`, brand `gr`.
- Font MiSans Latin static `.ttf`, `fontFamily` = tên file (`MiSansLatin-Demibold`).
- `apps/golf/app/**` không chứa literal màu hex, `fontSize:`, `padding*:`, `margin*:`, `gap:` với số.
- Figma file key `wES4PDFvfC7546zuPPVhiW`. Intro node `40013027:105509`.
- Commit sau mỗi task, message tiếng Việt, kết thúc bằng `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Máy Windows: shell Git Bash; đường dẫn có khoảng trắng → luôn quote.

## File map

| File | Trách nhiệm |
|---|---|
| `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `tsconfig.base.json` | root workspace |
| `packages/ds/package.json` | `@gr/ds`, scripts `build:tokens`, `test`, `typecheck` |
| `packages/ds/tokens/figma/*.dtcg.json` | nguồn sự thật (1 file / collection·mode + `text-styles`, `effects`) |
| `packages/ds/tokens/build.mjs` | Style Dictionary: DTCG → `src/generated/*.ts` |
| `packages/ds/tokens/README.md` | script `use_figma` nguyên văn để dump lại |
| `packages/ds/src/generated/*.ts` | output sinh, commit |
| `packages/ds/src/theme/createTheme.ts` | pure: `(opts) => Theme` — test được không cần RN |
| `packages/ds/src/theme/ThemeProvider.tsx`, `useTheme.ts` | RN context + `useColorScheme` |
| `packages/ds/src/theme/fonts.ts` | `fontAssets`, `fontFamilyFor(style)` |
| `packages/ds/src/ui/Text.tsx`, `Button.tsx`, `buttonStyles.ts`, `Screen.tsx` | primitives; `buttonStyles` pure để test |
| `packages/ds/src/index.ts` | public API |
| `packages/ds/assets/fonts/*.ttf` | font |
| `apps/golf/app/_layout.tsx`, `index.tsx`, `(onboarding)/intro.tsx` | app |
| `CLAUDE.md` | luật cho agent |

---

### Task 1: Monorepo + `@gr/ds` stub + Expo Go hiển thị text từ ds

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `tsconfig.base.json`
- Create: `packages/ds/package.json`, `packages/ds/tsconfig.json`, `packages/ds/src/index.ts`
- Create: `apps/golf/*` (qua `create-expo-app`), sửa `apps/golf/package.json`, `apps/golf/app/index.tsx`, `apps/golf/tsconfig.json`
- Move: `MiSans Latin/ttf/*.ttf` → `packages/ds/assets/fonts/`

**Interfaces:**
- Produces: package `@gr/ds` export `DS_VERSION: string` (tạm, xoá ở Task 3); app import được `@gr/ds`.

- [ ] **Step 1: Bật pnpm, tạo root workspace**

```bash
cd "D:/01_WORKS/01_DC_FREELANCE/2026/Mobile App - Test"
corepack enable pnpm && corepack use pnpm@10
```
`package.json` (root):
```json
{
  "name": "golf-relax-monorepo",
  "private": true,
  "packageManager": "pnpm@10.17.0",
  "scripts": {
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test"
  },
  "devDependencies": { "typescript": "~5.9.2" }
}
```
(Giữ `packageManager` đúng phiên bản corepack in ra.)
`pnpm-workspace.yaml`:
```yaml
packages:
  - packages/*
  - apps/*
```
`.npmrc`:
```
node-linker=hoisted
```
`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "module": "esnext",
    "target": "es2022",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 2: Tạo `packages/ds` stub**

`packages/ds/package.json`:
```json
{
  "name": "@gr/ds",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build:tokens": "node tokens/build.mjs",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": { "react": "*", "react-native": "*", "react-native-safe-area-context": "*" },
  "devDependencies": {
    "@types/react": "~19.1.10",
    "style-dictionary": "^5.0.0",
    "typescript": "~5.9.2",
    "vitest": "^3.2.0"
  }
}
```
`packages/ds/tsconfig.json`:
```json
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "types": ["react", "react-native"] }, "include": ["src", "tokens/build.mjs"] }
```
`packages/ds/src/index.ts`:
```ts
export const DS_VERSION = '0.1.0';
```
Font:
```bash
mkdir -p packages/ds/assets/fonts && cp "MiSans Latin/ttf/"*.ttf packages/ds/assets/fonts/ && rm -rf "MiSans Latin"
```

- [ ] **Step 3: Tạo app Expo**

```bash
cd apps && npx create-expo-app@latest golf --template blank-typescript --no-install && cd ..
```
Sửa `apps/golf/package.json`: thêm `"@gr/ds": "workspace:*"` vào `dependencies`, thêm scripts `"typecheck": "tsc --noEmit"`, `"start": "expo start"`, và `"main": "expo-router/entry"`. Sau đó:
```bash
pnpm install
pnpm -F golf exec npx expo install expo-router expo-font expo-splash-screen expo-constants expo-linking react-native-safe-area-context react-native-screens
```
`apps/golf/app.json` → trong `expo` thêm `"scheme": "golf"`, `"plugins": ["expo-router", "expo-font"]`, `"userInterfaceStyle": "automatic"`.
`apps/golf/tsconfig.json`:
```json
{ "extends": "expo/tsconfig.base", "compilerOptions": { "strict": true, "paths": { "@gr/ds": ["../../packages/ds/src"] } }, "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"] }
```
Xoá `apps/golf/App.tsx`, `apps/golf/index.ts` nếu template tạo. Tạo `apps/golf/app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```
`apps/golf/app/index.tsx`:
```tsx
import { Text, View } from 'react-native';
import { DS_VERSION } from '@gr/ds';
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>ds {DS_VERSION}</Text>
    </View>
  );
}
```
`apps/golf/metro.config.js` (Expo SDK ≥52 tự nhận monorepo; file này chỉ để chốt root):
```js
const { getDefaultConfig } = require('expo/metro-config');
module.exports = getDefaultConfig(__dirname);
```

- [ ] **Step 4: Kiểm tra bundle được**

```bash
pnpm -r typecheck
pnpm -F golf exec npx expo export --platform ios --output-dir /tmp/golf-export
```
Expected: typecheck 0 lỗi; export ra `/tmp/golf-export/_expo/static/js/ios/*.hbc` hoặc `.js` không lỗi resolve `@gr/ds`. Nếu lỗi "Unable to resolve @gr/ds": thêm vào `metro.config.js` `config.watchFolders = [path.resolve(__dirname, '../..')]` và `config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, '../../node_modules')]`.

- [ ] **Step 5: Chạy trên iPhone**

```bash
pnpm -F golf start
```
Người dùng mở Expo Go, quét QR (cùng Wi-Fi). Không kết nối → `pnpm -F golf exec npx expo start --tunnel`. Expected: màn trắng chữ `ds 0.1.0`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: monorepo pnpm, @gr/ds stub, apps/golf Expo 57 chạy Expo Go

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Pipeline token end-to-end với collection FLOAT (spacing/radius/size/dimensions)

**Files:**
- Create: `packages/ds/tokens/figma/global-dimensions.mode-1.dtcg.json`, `spacing.standard.dtcg.json`, `radius.rounded.dtcg.json`, `component-size.default.dtcg.json`
- Create: `packages/ds/tokens/build.mjs`, `packages/ds/tokens/README.md`, `packages/ds/tokens/dump-variables.js` (script use_figma, lưu để chạy lại)
- Create: `packages/ds/src/generated/{primitives,spacing,radius,size,keys}.ts`
- Create: `packages/ds/src/theme/createTheme.ts`, `packages/ds/src/theme/createTheme.test.ts`, `packages/ds/vitest.config.ts`
- Modify: `packages/ds/src/index.ts`, `apps/golf/app/index.tsx`

**Interfaces:**
- Produces: `createTheme(opts: { scheme: 'light'|'dark'; emphasis?: 'neutral'|'brand' }): Theme` với `theme.space(key)`, `theme.radius(key)`, `theme.size(key)`; types `SpaceKey`, `RadiusKey`, `SizeKey` từ `generated/keys.ts`.
- Produces: quy ước DTCG: root group = collection slug; alias `"{<slug>.<seg>.<seg>}"`; `$extensions.figma = { id, name, collection, mode, scopes }`.

- [ ] **Step 1: Script dump (dùng cho mọi collection, chạy qua `use_figma`)**

Lưu vào `packages/ds/tokens/dump-variables.js` (nguyên văn, để README tham chiếu). Tham số: sửa `TARGET` = danh sách tên collection cần dump (≤ 2 collection/lần).
```js
// use_figma — read-only. Sửa TARGET rồi chạy. Trả về { files: { '<slug>.<mode>.dtcg.json': {...} }, renamed: [...] , collisions: [...] }
const TARGET = ['Global Dimensions', 'Spacing', 'Corner Radius', 'Component Size'];
const SLUG = {
  'Global Colors': 'global-colors', 'Global Dimensions': 'global-dimensions',
  'Base Colors (Golf Relax)': 'base-colors', 'Mode Colors (Semantic)': 'semantic',
  'Component Colors (Theme)': 'component', 'Component Size': 'component-size',
  'Spacing': 'spacing', 'Corner Radius': 'radius', 'Emphasis Level': 'emphasis',
  'Breakpoint & Grids': 'breakpoints', 'Typography Configuration': 'typography',
};
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const seg = s => s.replace(/\./g, '_').replace(/[{}]/g, '');
const hex = c => {
  const h = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 1 ? h(c.a) : '');
};
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const byId = new Map(vars.map(v => [v.id, v]));
const collById = new Map(colls.map(c => [c.id, c]));
const files = {}; const renamed = []; const collisions = [];
for (const c of colls) {
  if (!TARGET.includes(c.name)) continue;
  const slug = SLUG[c.name];
  for (const m of c.modes) {
    const root = {}; const fname = `${slug}.${slugify(m.name)}.dtcg.json`;
    for (const v of vars) {
      if (v.variableCollectionId !== c.id) continue;
      const parts = v.name.split('/').map(seg);
      if (parts.join('/') !== v.name) renamed.push(v.name);
      let node = root;
      for (const p of parts.slice(0, -1)) { if (node[p] && node[p].$value !== undefined) collisions.push(v.name); node = node[p] = node[p] || {}; }
      const leaf = parts[parts.length - 1];
      const raw = v.valuesByMode[m.modeId];
      let $type, $value;
      if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
        const t = byId.get(raw.id); const tc = collById.get(t.variableCollectionId);
        $value = `{${SLUG[tc.name]}.${t.name.split('/').map(seg).join('.')}}`;
        $type = { COLOR: 'color', FLOAT: 'number', STRING: 'string', BOOLEAN: 'boolean' }[v.resolvedType];
      } else if (v.resolvedType === 'COLOR') { $type = 'color'; $value = hex(raw); }
      else if (v.resolvedType === 'FLOAT') { $type = 'number'; $value = raw; }
      else if (v.resolvedType === 'STRING') { $type = 'fontFamily'; $value = raw; }
      else { $type = 'boolean'; $value = raw; }
      if (node[leaf] && node[leaf].$value === undefined) { collisions.push(v.name); node[leaf + '/'] = {}; node = node; }
      node[leaf] = { $type, $value, $extensions: { figma: { id: v.id, name: v.name, collection: c.name, mode: m.name, scopes: v.scopes } } };
    }
    files[fname] = { [slug]: root };
  }
}
return { files, renamed, collisions };
```
Chạy `use_figma` với nội dung trên (skillNames `figma-use`). Kết quả nhỏ → trả trực tiếp; lớn → harness lưu file `tool-results/*.txt` dạng `[{type:'text',text:'...'}]`.

- [ ] **Step 2: Lưu JSON ra `tokens/figma/`**

Nếu kết quả nằm trong file tool-results, chạy:
```bash
python - <<'EOF'
import json,sys,pathlib
src=pathlib.Path(r"<đường dẫn tool-results .txt>")
d=json.loads(src.read_text(encoding='utf-8')); t=''.join(x['text'] for x in d); r=json.loads(t)
out=pathlib.Path("packages/ds/tokens/figma"); out.mkdir(parents=True,exist_ok=True)
for name,obj in r['files'].items(): (out/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding='utf-8'); print(name)
print('renamed',r['renamed']); print('collisions',r['collisions'])
EOF
```
Nếu trả trực tiếp trong chat: ghi từng file bằng Write với nội dung `files[<name>]`. Expected: 4 file; `renamed` và `collisions` = `[]` (khác rỗng → ghi vào README mục "Tên đã đổi", xử lý ở build bằng key đã đổi).

- [ ] **Step 3: Viết test cho createTheme (fail trước)**

`packages/ds/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
```
`packages/ds/src/theme/createTheme.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createTheme } from './createTheme';

describe('createTheme dimensions', () => {
  const t = createTheme({ scheme: 'light' });
  it('resolves spacing alias to number', () => {
    expect(t.space('Spacing/Gap/Medium')).toBe(16);
    expect(t.space('Spacing/Padding/Small')).toBe(12);
  });
  it('resolves radius and size', () => {
    expect(t.radius('Corner-Radius/Base')).toBe(12);
    expect(t.size('Button/Size/Large')).toBe(56);
  });
});
```

- [ ] **Step 4: Chạy test, xác nhận fail**

```bash
pnpm -F @gr/ds exec vitest run
```
Expected: FAIL — `Cannot find module './createTheme'`.

- [ ] **Step 5: Viết `tokens/build.mjs`**

```js
// DTCG (tokens/figma/*.dtcg.json) → src/generated/*.ts. Chạy: pnpm -F @gr/ds build:tokens
import StyleDictionary from 'style-dictionary';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const FIG = resolve(here, 'figma');
const OUT = resolve(here, '../src/generated');
mkdirSync(OUT, { recursive: true });
const has = f => readdirSync(FIG).includes(f);
const src = (...names) => names.filter(has).map(n => resolve(FIG, n));

StyleDictionary.registerFormat({
  name: 'gr/ts-flat',
  format: ({ dictionary, options }) => {
    const rows = dictionary.allTokens
      .filter(t => t.path[0] === options.group)
      .map(t => `  ${JSON.stringify(t.path.slice(1).join('/'))}: ${JSON.stringify(t.$value)},`)
      .sort();
    return `// generated by tokens/build.mjs — do not edit\nexport const ${options.exportName} = {\n${rows.join('\n')}\n} as const;\n`;
  },
});

// Mỗi "set" = nguồn đủ để resolve alias + các file cần sinh từ set đó.
const BASE = ['global-dimensions.mode-1.dtcg.json', 'spacing.standard.dtcg.json', 'radius.rounded.dtcg.json',
  'component-size.default.dtcg.json', 'emphasis.medium.dtcg.json', 'breakpoints.mobile.dtcg.json', 'typography.global-base-14.dtcg.json'];
const COLORS = scheme => ['global-colors.gr.dtcg.json', 'base-colors.gr.dtcg.json', `semantic.${scheme}.dtcg.json`];
const SETS = [
  { name: 'base', source: BASE, files: [
    ['primitives.ts', 'globalDimensions', 'global-dimensions'],
    ['spacing.ts', 'spacing', 'spacing'], ['radius.ts', 'radius', 'radius'], ['size.ts', 'size', 'component-size'],
    ['weight.ts', 'emphasis', 'emphasis'], ['breakpoints.ts', 'breakpoints', 'breakpoints'], ['typography.ts', 'typography', 'typography'],
  ]},
  { name: 'light', source: COLORS('light'), files: [['theme.light.ts', 'themeLight', 'semantic'], ['primitives.colors.ts', 'globalColors', 'global-colors']] },
  { name: 'dark', source: COLORS('dark'), files: [['theme.dark.ts', 'themeDark', 'semantic']] },
  ...['light', 'dark'].flatMap(scheme => ['neutral-emphasis-s1', 'brand-emphasis-s1'].map(em => ({
    name: `component-${em}-${scheme}`,
    source: [...COLORS(scheme), `component.${em}.dtcg.json`, ...BASE],
    files: [[`component.${em.split('-')[0]}.${scheme}.ts`, `component${em[0].toUpperCase()}${em.split('-')[0].slice(1)}${scheme[0].toUpperCase()}${scheme.slice(1)}`, 'component']],
  }))),
];

for (const set of SETS) {
  const source = src(...set.source);
  if (source.length === 0) continue;
  const files = set.files.filter(([, , group]) => source.some(p => p.includes(`/${group}.`) || p.includes(`\\${group}.`)));
  if (files.length === 0) continue;
  const sd = new StyleDictionary({
    usesDtcg: true, log: { verbosity: 'silent', warnings: 'disabled' }, source,
    platforms: { ts: { buildPath: OUT + '/', files: files.map(([destination, exportName, group]) => ({ destination, format: 'gr/ts-flat', options: { exportName, group } })) } },
  });
  await sd.buildAllPlatforms();
}

// keys.ts: union type cho từng map đã sinh
const gen = readdirSync(OUT).filter(f => f.endsWith('.ts') && f !== 'keys.ts' && f !== 'index.ts');
const imports = []; const types = [];
for (const f of gen) {
  const name = f.replace(/\.ts$/, ''); const id = name.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
  imports.push(`import { ${exportNameOf(f)} } from './${name}';`);
  types.push(`export type ${id[0].toUpperCase() + id.slice(1)}Key = keyof typeof ${exportNameOf(f)};`);
}
writeFileSync(resolve(OUT, 'keys.ts'), `// generated\n${imports.join('\n')}\n${types.join('\n')}\n`);
function exportNameOf(f) { for (const s of SETS) for (const [d, e] of s.files) if (d === f) return e; throw new Error('no export for ' + f); }
```
Ghi chú: các set thiếu file nguồn (chưa dump) tự bỏ qua → task này chỉ sinh `primitives.ts, spacing.ts, radius.ts, size.ts, keys.ts`.

- [ ] **Step 6: Build token, kiểm tra alias đã resolve**

```bash
pnpm -F @gr/ds build:tokens && grep -c '"{' packages/ds/src/generated/*.ts; head -5 packages/ds/src/generated/spacing.ts
```
Expected: grep = 0 ở mọi file; `spacing.ts` có `"Spacing/Gap/Medium": 16,`. Nếu Style Dictionary báo reference lỗi → tên bị `seg()` đổi; kiểm tra `renamed` ở Step 2.

- [ ] **Step 7: Viết `createTheme.ts` tối thiểu**

```ts
import { spacing } from '../generated/spacing';
import { radius } from '../generated/radius';
import { size } from '../generated/size';
import type { SpacingKey, RadiusKey, SizeKey } from '../generated/keys';

export type Scheme = 'light' | 'dark';
export type Emphasis = 'neutral' | 'brand';
export interface ThemeOptions { scheme: Scheme; emphasis?: Emphasis }

export function createTheme(opts: ThemeOptions) {
  const emphasis: Emphasis = opts.emphasis ?? 'neutral';
  return {
    scheme: opts.scheme,
    emphasis,
    space: (k: SpacingKey) => spacing[k],
    radius: (k: RadiusKey) => radius[k],
    size: (k: SizeKey) => size[k],
  };
}
export type Theme = ReturnType<typeof createTheme>;
```
`packages/ds/src/index.ts`:
```ts
export { createTheme } from './theme/createTheme';
export type { Theme, Scheme, Emphasis, ThemeOptions } from './theme/createTheme';
export type * from './generated/keys';
```

- [ ] **Step 8: Test pass + typecheck**

```bash
pnpm -F @gr/ds exec vitest run && pnpm -r typecheck
```
Expected: 2 test PASS, 0 lỗi TS.

- [ ] **Step 9: Nhìn thấy trên máy**

`apps/golf/app/index.tsx`:
```tsx
import { View, Text } from 'react-native';
import { createTheme } from '@gr/ds';
const t = createTheme({ scheme: 'light' });
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space('Spacing/Gap/Medium') }}>
      <View style={{ width: t.size('Button/Size/Large'), height: t.size('Button/Size/Large'), borderRadius: t.radius('Corner-Radius/Base'), backgroundColor: 'gray' }} />
      <Text>gap {t.space('Spacing/Gap/Medium')} · radius {t.radius('Corner-Radius/Base')}</Text>
    </View>
  );
}
```
`pnpm -F golf start` → Expo Go: ô xám 56×56 bo 12, chữ `gap 16 · radius 12`. (`'gray'` literal tạm, xoá ở Task 3.)

- [ ] **Step 10: README + commit**

`packages/ds/tokens/README.md`:
```md
# Token pipeline
Nguồn: Figma `wES4PDFvfC7546zuPPVhiW` (GR_DESIGN-SYSTEM). Plan Pro → không REST Variables; dump bằng `use_figma` (Figma MCP, skill figma-use).
## Dump lại
1. Mở `dump-variables.js`, sửa `TARGET` (≤ 2 collection/lần; Global Colors chạy riêng).
2. Chạy nội dung qua `use_figma`. Lưu `files[*]` vào `figma/` (script python trong plan Task 2 Step 2).
3. Text/effect style: `dump-styles.js`.
4. `pnpm -F @gr/ds build:tokens` → commit cả JSON lẫn `src/generated`.
## Quy ước
- Root group = collection slug (`semantic`, `component`, …); alias `{slug.seg.seg}`; `.` trong tên Figma → `_`.
- Mode = 1 file / mode. Key trong code = đúng tên Figma.
- Tên đã đổi / collision: (ghi khi có)
```
```bash
git add -A && git commit -m "feat(ds): pipeline DTCG → Style Dictionary, spacing/radius/size chạy tới màn hình

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Màu semantic light/dark + ThemeProvider + Screen

**Files:**
- Create: `packages/ds/tokens/figma/global-colors.gr.dtcg.json`, `base-colors.gr.dtcg.json`, `semantic.light.dtcg.json`, `semantic.dark.dtcg.json`
- Create: `packages/ds/src/generated/{theme.light,theme.dark,primitives.colors}.ts` (sinh)
- Create: `packages/ds/src/theme/ThemeProvider.tsx`, `useTheme.ts`, `packages/ds/src/ui/Screen.tsx`
- Modify: `createTheme.ts`, `createTheme.test.ts`, `index.ts`, `apps/golf/app/_layout.tsx`, `apps/golf/app/index.tsx`

**Interfaces:**
- Produces: `theme.color(key: ThemeLightKey): string` (theo scheme); `<ThemeProvider scheme?: 'auto'|Scheme emphasis?>`; `useTheme(): Theme`; `<Screen background?: ThemeLightKey edges?>`.

- [ ] **Step 1: Dump 2 lần** — `TARGET = ['Global Colors']` (960 var, chạy riêng), rồi `TARGET = ['Base Colors (Golf Relax)', 'Mode Colors (Semantic)']`. Lưu bằng script Step 2 Task 2. Expected: 4 file; semantic có 2 mode → 2 file; BOOLEAN var duy nhất trong semantic giữ nguyên (`$type: boolean`), không ảnh hưởng.

- [ ] **Step 2: Test fail**

Thêm vào `createTheme.test.ts`:
```ts
describe('createTheme colors', () => {
  it('light semantic resolves through base → global to Figma hex', () => {
    expect(createTheme({ scheme: 'light' }).color('Color/Content/Neutral/Strongest')).toBe('#1a1a1a');
  });
  it('dark differs from light', () => {
    const k = 'Color/Content/Neutral/Strongest';
    expect(createTheme({ scheme: 'dark' }).color(k)).not.toBe(createTheme({ scheme: 'light' }).color(k));
  });
});
```
Chạy `pnpm -F @gr/ds exec vitest run` → FAIL `t.color is not a function`.

- [ ] **Step 3: Build + createTheme**

`pnpm -F @gr/ds build:tokens` → sinh `theme.light.ts`, `theme.dark.ts`, `primitives.colors.ts`; `grep -c '"{'` = 0.
`createTheme.ts` thêm:
```ts
import { themeLight } from '../generated/theme.light';
import { themeDark } from '../generated/theme.dark';
import type { ThemeLightKey } from '../generated/keys';
// trong return:
    color: (k: ThemeLightKey): string => (opts.scheme === 'dark' ? themeDark : themeLight)[k] as string,
```
Test → PASS. Nếu `#1a1a1a` fail vì Figma trả `#1a1a1aff`: sửa `hex()` chỉ thêm alpha khi `a < 1` (đã có) — kiểm tra JSON.

- [ ] **Step 4: ThemeProvider / useTheme / Screen**

`packages/ds/src/theme/ThemeProvider.tsx`:
```tsx
import { createContext, type PropsWithChildren, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { createTheme, type Emphasis, type Scheme, type Theme } from './createTheme';

export const ThemeContext = createContext<Theme | null>(null);
export function ThemeProvider({ scheme = 'auto', emphasis = 'neutral', children }: PropsWithChildren<{ scheme?: 'auto' | Scheme; emphasis?: Emphasis }>) {
  const system = useColorScheme();
  const resolved: Scheme = scheme === 'auto' ? (system === 'dark' ? 'dark' : 'light') : scheme;
  const theme = useMemo(() => createTheme({ scheme: resolved, emphasis }), [resolved, emphasis]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
```
`packages/ds/src/theme/useTheme.ts`:
```ts
import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
export function useTheme() {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme: bọc app trong <ThemeProvider>');
  return t;
}
```
`packages/ds/src/ui/Screen.tsx`:
```tsx
import type { PropsWithChildren } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import type { ThemeLightKey } from '../generated/keys';

export function Screen({ background = 'Color/Background/Canvas/Alt', edges = ['top', 'bottom'], children }: PropsWithChildren<{ background?: ThemeLightKey; edges?: Edge[] }>) {
  const t = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: t.color(background) }}>
      <StatusBar barStyle={t.scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
```
`index.ts` thêm: `export { ThemeProvider } from './theme/ThemeProvider'; export { useTheme } from './theme/useTheme'; export { Screen } from './ui/Screen';`. Xoá `DS_VERSION`.

- [ ] **Step 5: App dùng provider**

`apps/golf/app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '@gr/ds';
export default function RootLayout() {
  return (
    <ThemeProvider scheme="auto">
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
```
`apps/golf/app/index.tsx`:
```tsx
import { View, Text } from 'react-native';
import { Screen, useTheme } from '@gr/ds';
export default function Index() {
  const t = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space('Spacing/Gap/Medium') }}>
        <View style={{ width: t.size('Button/Size/Large'), height: t.size('Button/Size/Large'), borderRadius: t.radius('Corner-Radius/Base'), backgroundColor: t.color('Color/Background/Accent/Subtle/Default') }} />
        <Text style={{ color: t.color('Color/Content/Neutral/Strongest') }}>{t.scheme}</Text>
      </View>
    </Screen>
  );
}
```
`pnpm -r typecheck && pnpm -F golf start` → Expo Go: chữ `light`; bật Dark Mode trong Settings iPhone → nền tối, chữ `dark`.

- [ ] **Step 6: Commit** — `feat(ds): màu semantic light/dark, ThemeProvider, Screen`.

---

### Task 4: Typography — text style Figma → font MiSans → `<Text variant>`

**Files:**
- Create: `packages/ds/tokens/dump-styles.js`, `tokens/figma/typography.global-base-14.dtcg.json`, `typography.global-base-16.dtcg.json`, `emphasis.medium.dtcg.json`, `text-styles.dtcg.json`, `effects.dtcg.json`
- Create: `packages/ds/src/generated/{typography,weight,textStyles,effects}.ts`, `packages/ds/src/theme/fonts.ts`, `packages/ds/src/ui/Text.tsx`
- Modify: `build.mjs`, `createTheme.ts`, `createTheme.test.ts`, `index.ts`, `apps/golf/app/_layout.tsx`, `index.tsx`

**Interfaces:**
- Produces: `theme.text(key: TextStylesKey): { fontFamily: string; fontSize: number; lineHeight: number; letterSpacing: number }`; `theme.shadow(key: EffectsKey): ViewStyle`; `fontAssets: Record<string, number>`; `<Text variant color>`.

- [ ] **Step 1: Dump variables** — `TARGET = ['Typography Configuration', 'Emphasis Level']` bằng `dump-variables.js`. Expected 3 file (typography 2 mode, emphasis 1).

- [ ] **Step 2: Dump styles** — `packages/ds/tokens/dump-styles.js`, chạy qua `use_figma`:
```js
// use_figma read-only: text styles + effect styles → DTCG, giá trị resolve ở mode mặc định (Base 14)
const vars = await figma.variables.getLocalVariablesAsync();
const byId = new Map(vars.map(v => [v.id, v]));
const seg = s => s.replace(/\./g, '_');
const hex = c => { const h = n => Math.round(n * 255).toString(16).padStart(2, '0'); return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a < 1 ? h(c.a) : ''); };
const put = (root, name, tok) => { const p = name.split('/').map(seg); let n = root; for (const s of p.slice(0, -1)) n = n[s] = n[s] || {}; n[p[p.length - 1]] = tok; };
const text = {};
for (const s of await figma.getLocalTextStylesAsync()) {
  const bound = {}; for (const [k, b] of Object.entries(s.boundVariables || {})) bound[k] = byId.get(b.id)?.name;
  const lh = s.lineHeight.unit === 'PIXELS' ? s.lineHeight.value : s.lineHeight.unit === 'PERCENT' ? Math.round(s.fontSize * s.lineHeight.value / 100) : Math.round(s.fontSize * 1.2);
  const ls = s.letterSpacing.unit === 'PIXELS' ? s.letterSpacing.value : s.fontSize * s.letterSpacing.value / 100;
  put(text, s.name, { $type: 'typography', $value: { fontFamily: s.fontName.family, fontStyle: s.fontName.style, fontSize: s.fontSize, lineHeight: lh, letterSpacing: ls }, $extensions: { figma: { id: s.id, name: s.name, boundVariables: bound } } });
}
const effects = {};
for (const s of await figma.getLocalEffectStylesAsync()) {
  const shadows = s.effects.filter(e => e.visible !== false && (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')).map(e => ({ type: e.type, color: hex(e.color), offsetX: e.offset.x, offsetY: e.offset.y, blur: e.radius, spread: e.spread || 0 }));
  const blur = s.effects.find(e => e.type === 'BACKGROUND_BLUR' || e.type === 'LAYER_BLUR');
  put(effects, s.name, { $type: 'shadow', $value: shadows, $extensions: { figma: { id: s.id, name: s.name, blur: blur ? { type: blur.type, radius: blur.radius } : null } } });
}
return { files: { 'text-styles.dtcg.json': { 'text-styles': text }, 'effects.dtcg.json': { effects } } };
```
Lưu 2 file. Kiểm tra: `python -c "import json;d=json.load(open('packages/ds/tokens/figma/text-styles.dtcg.json'));print(d['text-styles']['Body']['Base']['DemiBold']['$value'])"` → `{fontFamily:'MiSans Latin', fontStyle:'Demibold', fontSize:14, lineHeight:18, letterSpacing:-0.32}`. Ghi lại tập `fontStyle` xuất hiện (dự kiến Regular/Medium/Demibold, có thể Semibold/Bold) — dùng cho `fonts.ts`. Nếu có `fontFamily` ≠ `MiSans Latin` (Display) → báo Dũng, tạm map về MiSans.

- [ ] **Step 3: build.mjs — thêm set styles**

Thêm vào `SETS`:
```js
  { name: 'styles', source: ['text-styles.dtcg.json', 'effects.dtcg.json'], files: [['textStyles.ts', 'textStyles', 'text-styles'], ['effects.ts', 'effects', 'effects']] },
```
Format `gr/ts-flat` đã `JSON.stringify($value)` nên object/array giữ nguyên. Chạy build → có `typography.ts`, `weight.ts`, `textStyles.ts`, `effects.ts`; `keys.ts` thêm `TextStylesKey`, `EffectsKey`, `TypographyKey`, `WeightKey`.

- [ ] **Step 4: Test fail rồi pass**

Thêm test:
```ts
describe('createTheme typography & effects', () => {
  const t = createTheme({ scheme: 'light' });
  it('text style → RN props', () => {
    expect(t.text('Body/Base/DemiBold')).toEqual({ fontFamily: 'MiSansLatin-Demibold', fontSize: 14, lineHeight: 18, letterSpacing: -0.32 });
  });
  it('shadow → RN style', () => {
    const s = t.shadow('Shadow/Bottom/Level-1');
    expect(s.shadowColor).toMatch(/^#/); expect(s.shadowRadius).toBeGreaterThan(0); expect(s.elevation).toBeGreaterThan(0);
  });
});
```
`packages/ds/src/theme/fonts.ts`:
```ts
export const fontAssets = {
  'MiSansLatin-Regular': require('../../assets/fonts/MiSansLatin-Regular.ttf'),
  'MiSansLatin-Medium': require('../../assets/fonts/MiSansLatin-Medium.ttf'),
  'MiSansLatin-Demibold': require('../../assets/fonts/MiSansLatin-Demibold.ttf'),
  'MiSansLatin-Semibold': require('../../assets/fonts/MiSansLatin-Semibold.ttf'),
  'MiSansLatin-Bold': require('../../assets/fonts/MiSansLatin-Bold.ttf'),
};
export const fontFamilyFor = (fontStyle: string) => `MiSansLatin-${fontStyle.replace(/\s+/g, '')}`;
```
(Thêm file cho weight khác nếu Step 2 phát hiện.) `createTheme.ts` thêm:
```ts
import { textStyles } from '../generated/textStyles';
import { effects } from '../generated/effects';
import { fontFamilyFor } from './fonts';
import type { TextStylesKey, EffectsKey } from '../generated/keys';
// return:
    text: (k: TextStylesKey) => { const s = textStyles[k]; return { fontFamily: fontFamilyFor(s.fontStyle), fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing }; },
    shadow: (k: EffectsKey) => { const s = effects[k][0]; if (!s) return {}; const a = s.color.length === 9 ? parseInt(s.color.slice(7), 16) / 255 : 1;
      return { shadowColor: s.color.slice(0, 7), shadowOffset: { width: s.offsetX, height: s.offsetY }, shadowOpacity: a, shadowRadius: s.blur / 2, elevation: Math.max(1, Math.round(s.blur / 2)) }; },
```
`require` trong package cần `declare module '*.ttf'`? Không — `require` trả `any`. Test → PASS; typecheck xanh (nếu TS phàn nàn `require` trong ESM: thêm `"types": ["react", "react-native", "node"]` + `@types/node` dev dep).

- [ ] **Step 5: `Text` component**

`packages/ds/src/ui/Text.tsx`:
```tsx
import { Text as RNText, type TextProps } from 'react-native';
import { useTheme } from '../theme/useTheme';
import type { TextStylesKey, ThemeLightKey } from '../generated/keys';

export interface DsTextProps extends TextProps { variant?: TextStylesKey; color?: ThemeLightKey }
export function Text({ variant = 'Body/Base/Regular', color = 'Color/Content/Neutral/Strongest', style, ...rest }: DsTextProps) {
  const t = useTheme();
  return <RNText {...rest} style={[t.text(variant), { color: t.color(color) }, style]} />;
}
```
(Nếu `Body/Base/Regular` không tồn tại trong textStyles → TS báo; chọn variant có thật từ keys.) `index.ts` export `Text`, `fontAssets`.

- [ ] **Step 6: App load font**

`apps/golf/app/_layout.tsx`:
```tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, fontAssets } from '@gr/ds';
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;
  return (
    <ThemeProvider scheme="auto">
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
```
`index.tsx` thay `<Text>` RN bằng `<Text variant="Heading/Subheading">Golf Relax</Text>` + `<Text variant="Body/Base/DemiBold" color="Color/Content/Accent/Base">MiSans Demibold</Text>` từ `@gr/ds`. Chạy → Expo Go hiển thị font MiSans (so với SF: chữ "g" một tầng, khoảng cách hẹp). Nếu font không đổi: kiểm tra Metro serve `.ttf` từ `packages/ds/assets` (Expo SDK 57 tự thêm assetExts; nếu không → `config.watchFolders` như Task 1).

- [ ] **Step 7: Commit** — `feat(ds): text style Figma → MiSans, Text component, shadow`.

---

### Task 5: Component colors + Button

**Files:**
- Create: `tokens/figma/component.neutral-emphasis-s1.dtcg.json`, `component.brand-emphasis-s1.dtcg.json`; generated `component.{neutral,brand}.{light,dark}.ts`
- Create: `packages/ds/src/ui/buttonStyles.ts`, `buttonStyles.test.ts`, `Button.tsx`
- Modify: `createTheme.ts`, `createTheme.test.ts`, `index.ts`, `apps/golf/app/index.tsx`

**Interfaces:**
- Produces: `theme.component(key: ComponentNeutralLightKey): string`; `buttonStyles(theme, { variant, size, pressed, disabled }): { container: ViewStyle; label: TextStyle }`; `<Button variant size label onPress disabled />`.

- [ ] **Step 1: Dump** — `TARGET = ['Component Colors (Theme)']` → 2 file. Build → 4 file `component.*.ts`; `grep -c '"{'` = 0.

- [ ] **Step 2: Test fail**

`createTheme.test.ts` thêm:
```ts
it('component color follows emphasis', () => {
  const k = 'Button-Primary/Background/Default';
  expect(createTheme({ scheme: 'light' }).component(k)).toMatch(/^#/);
  expect(createTheme({ scheme: 'light', emphasis: 'brand' }).component(k)).not.toBe(createTheme({ scheme: 'light' }).component(k));
});
```
`packages/ds/src/ui/buttonStyles.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { createTheme } from '../theme/createTheme';
import { buttonStyles } from './buttonStyles';
describe('buttonStyles', () => {
  const t = createTheme({ scheme: 'light' });
  it('primary large uses size + component tokens', () => {
    const s = buttonStyles(t, { variant: 'primary', size: 'l' });
    expect(s.container.height).toBe(56);
    expect(s.container.backgroundColor).toBe(t.component('Button-Primary/Background/Default'));
    expect(s.label.color).toBe(t.component('Button-Primary/Content/Default'));
  });
  it('pressed swaps background', () => {
    expect(buttonStyles(t, { variant: 'primary', size: 'l', pressed: true }).container.backgroundColor).toBe(t.component('Button-Primary/Background/Pressed'));
  });
});
```

- [ ] **Step 3: Implement**

`createTheme.ts` thêm:
```ts
import { componentNeutralLight } from '../generated/component.neutral.light';
import { componentNeutralDark } from '../generated/component.neutral.dark';
import { componentBrandLight } from '../generated/component.brand.light';
import { componentBrandDark } from '../generated/component.brand.dark';
import type { ComponentNeutralLightKey } from '../generated/keys';
const COMPONENT = { neutral: { light: componentNeutralLight, dark: componentNeutralDark }, brand: { light: componentBrandLight, dark: componentBrandDark } } as const;
// return:
    component: (k: ComponentNeutralLightKey): string => COMPONENT[emphasis][opts.scheme][k] as string,
```
`packages/ds/src/ui/buttonStyles.ts`:
```ts
import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../theme/createTheme';
export type ButtonVariant = 'primary' | 'accent' | 'tertiary';
export type ButtonSize = 'xs' | 's' | 'm' | 'l';
const VARIANT = { primary: 'Button-Primary', accent: 'Button-Accent', tertiary: 'Button-Tertiary' } as const;
const SIZE = { xs: 'XSmall', s: 'Small', m: 'Medium', l: 'Large' } as const;
const LABEL = { xs: 'Button-Label/XS', s: 'Button-Label/S', m: 'Button-Label/M', l: 'Button-Label/L' } as const;
export function buttonStyles(t: Theme, o: { variant: ButtonVariant; size: ButtonSize; pressed?: boolean; disabled?: boolean }): { container: ViewStyle; label: TextStyle } {
  const v = VARIANT[o.variant]; const s = SIZE[o.size];
  const state = o.disabled ? 'Disabled' : o.pressed ? 'Pressed' : 'Default';
  const c = (k: string) => t.component(k as never);
  const sz = (k: string) => t.size(k as never);
  return {
    container: {
      height: sz(`Button/Size/${s}`), paddingHorizontal: sz(`Button/Spacing/${s}/Horizontal-Padding`), gap: sz(`Button/Spacing/${s}/Gap`),
      borderRadius: t.radius(`Corner-Radius/Action/${s}` as never), backgroundColor: c(`${v}/Background/${state}`),
      borderWidth: o.variant === 'tertiary' ? 1 : 0, borderColor: c(`${v}/Border/${state}`),
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    },
    label: { ...t.text(LABEL[o.size] as never), color: c(`${v}/Content/${state}`) },
  };
}
```
**Trước khi chốt tên key**: chạy `grep -o '"Button[^"]*"' packages/ds/src/generated/component.neutral.light.ts packages/ds/src/generated/size.ts packages/ds/src/generated/textStyles.ts | sort -u` — đối chiếu các tên `Button-Tertiary/Border/Disabled`, `Button/Spacing/Large/Gap`, `Button-Label/L`, `Corner-Radius/Action/Large` có thật; tên nào không có → dùng tên gần nhất có thật (ví dụ không có `/Disabled` → dùng `/Default` + `opacity: 0.4`). `as never` là cố ý: key ghép động, tính đúng đã kiểm bằng test + grep; ghi `// ponytail: key ghép động, đổi sang map tường minh khi thêm variant thứ 4`.
`packages/ds/src/ui/Button.tsx`:
```tsx
import { Pressable, Text as RNText } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles';
export function Button({ label, variant = 'primary', size = 'l', disabled, onPress }: { label: string; variant?: ButtonVariant; size?: ButtonSize; disabled?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => buttonStyles(t, { variant, size, pressed, disabled }).container}>
      {({ pressed }) => <RNText style={buttonStyles(t, { variant, size, pressed, disabled }).label}>{label}</RNText>}
    </Pressable>
  );
}
```
`index.ts` export `Button`, types. Test + typecheck xanh.

- [ ] **Step 4: Trên máy** — `index.tsx` thêm 3 `<Button>` (primary/accent/tertiary, size l), nhấn giữ thấy đổi màu Pressed. Đổi `<ThemeProvider emphasis="brand">` tạm để thấy khác màu, rồi trả về `neutral`.

- [ ] **Step 5: Commit** — `feat(ds): component colors theo emphasis, Button`.

---

### Task 6: Breakpoints Mobile + kiểm tra idempotent + CLAUDE.md + plugin Expo

**Files:**
- Create: `tokens/figma/breakpoints.{desktop,tablet,mobile}.dtcg.json`; generated `breakpoints.ts`
- Create: `CLAUDE.md`
- Modify: `createTheme.ts` (thêm `layout(key)`), `createTheme.test.ts`

- [ ] **Step 1: Dump** `TARGET = ['Breakpoint & Grids']` → 3 file (chỉ `mobile` vào BASE của build). Build. Test: `expect(t.layout('Viewport-Width')).toBe(390)` (getter `layout: (k: BreakpointsKey) => breakpoints[k]`). Pass.

- [ ] **Step 2: Idempotent**

```bash
pnpm -F @gr/ds build:tokens && pnpm -F @gr/ds build:tokens && git status --short packages/ds/src/generated
```
Expected: rỗng (không diff sau lần 2). Khác rỗng → format thiếu sort ổn định; sửa `.sort()` trong `gr/ts-flat` (đã có).

- [ ] **Step 3: `CLAUDE.md` gốc repo**

```md
# Golf Relax app — luật cho agent
- Stack: pnpm monorepo, Expo SDK 57 + Expo Router (apps/golf), design system @gr/ds (packages/ds). Chạy: `pnpm -F golf start` → Expo Go.
- Mọi màu/spacing/radius/size/font trong `apps/golf/app/**` đi qua `useTheme()` hoặc component của `@gr/ds`. Cấm literal hex, `fontSize:`, `padding*:`, `margin*:`, `gap:` số. Kiểm: `pnpm check:literals`.
- Key token = đúng tên Figma (`t.color('Color/Content/Neutral/Strongest')`, `<Text variant="Body/Base/DemiBold">`). Không đặt tên mới, không camelCase.
- Không import `packages/ds/src/generated/primitives*` từ app.
- Token đổi → dump lại theo `packages/ds/tokens/README.md`, `pnpm -F @gr/ds build:tokens`, commit JSON + generated.
- Thêm component mới vào `packages/ds/src/ui/` chỉ khi ≥ 2 màn cần; style tính bằng hàm pure có test (mẫu: `buttonStyles.ts`).
- Figma: file `wES4PDFvfC7546zuPPVhiW`; đọc màn bằng `get_design_context` theo node-id, KHÔNG `get_metadata` cả page Design (3 MB).
```
Root `package.json` thêm script:
```json
"check:literals": "grep -rEn \"#[0-9a-fA-F]{6}|fontSize:\\s*[0-9]|(padding|margin)[A-Za-z]*:\\s*[0-9]|gap:\\s*[0-9]\" apps/golf/app && exit 1 || echo OK"
```

- [ ] **Step 4: Plugin Expo cho Claude Code**

Người dùng chạy trong phiên interactive: `/plugin install expo@claude-plugins-official` (agent không tự cài plugin). Ghi vào CLAUDE.md dòng: "Plugin `expo` (MCP screenshot/log) — cài bằng /plugin install expo@claude-plugins-official".

- [ ] **Step 5: Commit** — `chore: breakpoints, CLAUDE.md, check:literals`.

---

### Task 7: Màn Intro từ Figma + asset + verification + GitHub

**Files:**
- Create: `apps/golf/app/(onboarding)/intro.tsx`, `apps/golf/assets/images/intro-booking.png` (từ Figma)
- Modify: `apps/golf/app/index.tsx` (redirect), `docs/ds/superpowers/specs/...` (ghi kết quả)

- [ ] **Step 1: Đọc màn**

Gọi `get_design_context(fileKey, nodeId '40013027:105509', clientLanguages 'typescript', clientFrameworks 'react-native')` và `get_screenshot` cùng node. Ghi ra danh sách: text (nội dung + text style), nút (variant/size), ảnh (node id), spacing giữa các khối (biến nào). Ảnh: `download_assets` node ảnh → lưu `apps/golf/assets/images/intro-booking.png` (nếu ảnh không phải của Dũng/không license → thay bằng `View` màu `Color/Background/Surface/Alt`).

- [ ] **Step 2: Viết màn**

`apps/golf/app/(onboarding)/intro.tsx` (khung; thay variant/key theo Step 1):
```tsx
import { Image, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, Text, useTheme } from '@gr/ds';

export default function Intro() {
  const t = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Image source={require('../../assets/images/intro-booking.png')} style={{ width: '100%', flex: 1, borderRadius: t.radius('Corner-Radius/Large') }} resizeMode="cover" />
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          <Text variant="Heading/Subheading">Đặt sân trong vài chạm</Text>
          <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">Tìm sân, chọn giờ, thanh toán — tất cả trong một ứng dụng.</Text>
        </View>
        <Button label="Tiếp tục" variant="accent" size="l" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
```
(Nội dung chữ, thứ tự khối, variant lấy đúng từ `get_design_context`; không tự nghĩ text.) `apps/golf/app/index.tsx`:
```tsx
import { Redirect } from 'expo-router';
export default function Index() { return <Redirect href="/(onboarding)/intro" />; }
```

- [ ] **Step 3: Verify**

```bash
pnpm -r typecheck && pnpm -r test && pnpm check:literals
```
Expected: 0 lỗi, tất cả test PASS, `OK`. `pnpm -F golf start` → Expo Go: màn Intro; chụp màn iPhone, đặt cạnh screenshot Figma, Dũng duyệt. Bật Dark Mode → nền/chữ đổi.

- [ ] **Step 4: GitHub + push**

```bash
gh repo create golf-relax-app --private --source . --remote origin --push
```
Expected: remote `origin` trỏ GitHub private, nhánh `main` đã push.

- [ ] **Step 5: Đồng bộ memory + docs (luật memory-sync)**

Cập nhật memory `golf-app-stack-decision.md` (đã có repo GitHub, đường dẫn package, lệnh chạy); ghi vào spec mục "Kết quả" ngày hoàn thành và sai lệch (nếu có) so với thiết kế. Commit + push.

---

## Self-review

- **Spec coverage:** D1 (T1), D2 (T1), D3 (T2 dump, T3–T6), D4 (T2 build.mjs), D5 (T3 ThemeProvider), D6 (T2/T4 key = tên Figma), D7 (T2/T3 primitives tách), D8 (T3 auto scheme), D9 (T2 BASE chỉ `mobile`, `base-14`; T5 emphasis neutral), D10 (T4 fonts.ts), D11 (T7 ảnh + text), D12 (T7 gh). Spec §4.1 paint styles bỏ qua → README ghi. Spec §7 DoD: #1 T6 Step 2, #2 T2–T5 test, #3 T6 Step 3 + T7 Step 3, #4 T7 Step 3.
- **Sai lệch nhỏ so với spec:** component colors sinh 4 file (`component.{neutral,brand}.{light,dark}.ts`) thay vì 2, vì Component Colors alias sang semantic phụ thuộc scheme. Đã cập nhật spec §3.
- **Placeholder scan:** không TBD; các chỗ "theo Step 1" ở T7 là dữ liệu chỉ có khi đọc Figma lúc thực thi, có khung code sẵn.
- **Type consistency:** `createTheme` getters: `space/radius/size` (T2), `color` (T3), `text/shadow` (T4), `component` (T5), `layout` (T6). Key types từ `keys.ts` theo tên file: `SpacingKey`, `RadiusKey`, `SizeKey`, `ThemeLightKey`, `TextStylesKey`, `EffectsKey`, `ComponentNeutralLightKey`, `BreakpointsKey` — khớp cách `build.mjs` đặt tên (`spacing.ts`→`SpacingKey`, `theme.light.ts`→`ThemeLightKey`, `component.neutral.light.ts`→`ComponentNeutralLightKey`).
