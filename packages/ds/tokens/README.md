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
