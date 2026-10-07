# Token pipeline

Nguồn: Figma `wES4PDFvfC7546zuPPVhiW` (GR_DESIGN-SYSTEM). Plan Pro → không có REST Variables API; dump bằng `use_figma` (Figma MCP, skill `figma-use`). Server MCP cắt output ở **20 KB/call** nên dump ở dạng tuple gọn, phân trang.

## Dump lại khi DS đổi

1. Mở `dump-variables.js`, sửa `TARGET` (tên collection) và `OFFSET/LIMIT` (giữ mỗi kết quả < 20 KB: ~400 dòng FLOAT, ~250 dòng COLOR alias, ~500 dòng hex). Chạy nội dung qua `use_figma`.
2. Lưu nguyên kết quả vào `compact/<nn>-<mô-tả>.json` (thứ tự file không quan trọng, converter gộp theo `<slug>.<mode>`). Xoá file compact cũ của collection đó trước khi lưu bản mới.
3. Text/effect style: `dump-styles.js` → `compact/`.
4. `node tokens/compact-to-dtcg.mjs` → `figma/<slug>.<mode>.dtcg.json`.
5. `pnpm -F @gr/ds build:tokens` → `src/generated/*.ts`. Commit cả `compact/`, `figma/`, `src/generated/`.

## Quy ước

- Root group = collection slug (`global-colors`, `global-dimensions`, `base-colors`, `semantic`, `component`, `component-size`, `spacing`, `radius`, `emphasis`, `breakpoints`, `typography`); 1 file / mode.
- Alias DTCG `{slug.seg.seg}`; `.` trong tên Figma → `_`.
- Key trong code = đúng tên Figma (`'Spacing/Gap/Medium'`). Không camelCase.
- Primitive (`primitives*.ts`) không export qua `@gr/ds`.
- Paint styles (22) bỏ qua: đã có variable tương ứng.
- Tên đã đổi / collision: (chưa có)

## Lớp override brand GramGolf (`tokens/brand/`)

Brand GramGolf (teal `#14be96`, navy `#0b2230`) **chưa có trong Figma** — Figma vẫn thang GR xanh cũ. Màu brand đi qua lớp override code-side, `build.mjs` nạp SAU các file `figma/` (Style Dictionary: nguồn sau thắng), nên mọi alias (semantic, component, `primitives.colors.ts`) tự nhận màu mới; tên token không đổi → `keys.ts` không đổi.

- `brand/gramgolf.dtcg.json`: `global-colors.{GR-Light,GR-Dark}.{GR,GR-Alpha}.1..12` (thang teal OKLCH, step 9 = màu logo cả 2 mode) + `base-colors.{Light,Dark}.On-Brand-*` (navy; light `Pressed` = trắng trên step 11). Cả 2 mode chung 1 file vì semantic dark có alias trỏ `Light.Brand-Alpha.6` (tách theo mode sẽ sót xanh cũ).
- `brand/gramgolf.semantic.{light,dark}.dtcg.json`: remap `Color/Content/Accent/Light` → Brand 11 (step 10 không đọc được làm chữ trên trắng).

**Vì sao không sửa `figma/` hay `compact/`:** `figma/*.dtcg.json` bị ghi đè mỗi lần chạy `compact-to-dtcg.mjs`, `compact/*.json` bị ghi đè mỗi lần dump lại từ Figma → sửa ở đó sẽ mất. Lớp `brand/` sống sót qua cả hai. Khi Figma có brand GramGolf thật: dump lại, xoá `tokens/brand/` và 2 dòng trong `COLORS()` của `build.mjs`. Phân tích: `docs/ds/REBRAND.md`; nợ: `docs/ds/figma-debt.md` mục F.
