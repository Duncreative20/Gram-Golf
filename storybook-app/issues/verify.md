> Ảnh chụp lịch sử (08/10) — id story hiện hành: `storybook-app/README.md` › Phủ route.

# Rà soát toàn bộ Storybook màn app (2026-10-08)

Chụp 225 story × sáng/tối (390 px) vào `storybook-app/__shots__/all/` — xem hết 450 ảnh. Không story nào crash, trống hay hiện lớp lỗi; tài khoản / dữ liệu đúng như mô tả ở đầu từng file luồng; chế độ tối không vỡ.

## Đã sửa phía story (không đụng màn app)

| Story | Vấn đề | Sửa |
| --- | --- | --- |
| `f05--anh-dang-doc`, `f05--anh-kiem-tra` | `play` bấm nút “Chọn ảnh” — màn `metrics/import-photo` đã đổi thành chọn ảnh mẫu + nút “Đọc số liệu” → `play` lỗi, ảnh đứng ở bước 1. | Bấm “Đọc số liệu”. Thêm `f05--anh-khong-doc-duoc` (ảnh mờ → “Không đọc được số liệu”), link vào mục lục F13. |
| `f07--bam-goi-y`, `f08--*` (bấm mốc) | `formatSec` đổi từ “1,3s” sang “1,3 s” → `findByRole(name: '1,3s: …')` không thấy. | Tên nút so bằng regex `1,3 ?s` / `1,6 ?s`. |
| `f06--sua-gay-da-luu-tru`, `f13--sua-gay-nguoi-khac` | `<Redirect>` với href dạng object hiện JSON thô `{"pathname":"/clubs/[id]",…}`. | `stubs/expo-router.tsx` ghép params vào pathname → “↪ Chuyển hướng tới /clubs/cl-driver”. |
| Mọi story mở dialog / sheet (F03, F04, F10, F12…) | Ảnh chụp chỉ còn lớp phủ (Modal fixed ở giữa viewport 3000 px). F05 / F06 / F07 mỗi file tự chép một decorator vá. | Chuyển 2 dòng CSS vào `.storybook/shot.css` (chỉ khi chụp + có `[aria-modal]`), bỏ 3 bản chép. |

Còn lại phía chụp (không phải lỗi màn): ảnh có dialog / sheet thừa dải 32 px dưới khung 844 (script cộng 32 px vào chiều cao đo). — **đã xử lý (Task 15): chụp khung cố định `shot-storybook.mjs … 390 844` — Modal trong khung, hết dải 32 px**

## Lỗi / xấu ở màn app mới thấy ở lượt này

| Story id | File:dòng | Hiện tượng | Mức | Task | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| `f10--kham-pha`, `f10--nguoi-theo-doi`, `f10--dang-theo-doi` | `apps/golf/components/People.tsx:66` | Hàng người dùng ghi “hcp 14”, các màn khác ghi “Handicap 14”. | thấp | 26 | đã sửa (Task 23) |
| `f11--tab-hlv-rong` | `apps/golf/components/NotificationsScreen.tsx:124` | Thông báo rỗng của HLV vẫn ghi “Ghi chú của HLV, người theo dõi mới…” (câu viết cho người chơi). | thấp | 27 | đã sửa (Task 27) |
| `f10--tra-loi-binh-luan` | `packages/ds/src/ui/Comment/commentStyles.ts:54` | Chip “↩ Trả lời HLV Đỗ Minh Tuấn ⊗”: gap `Badge/Spacing/Small/Gap` quá nhỏ, icon dính sát chữ. | thấp | — | không làm: token Figma `Badge/Spacing/Small/Gap` |
| `f09--tong-quan-rong` | `apps/golf/app/students/[id].tsx:72` | Tab Tổng quan ghi “Học viên chưa có phiên swing nào.” trong khi tab Swing có badge 1 (một video swing) — “phiên swing” (số liệu) dễ lẫn với video swing. | thấp | 22 | đã sửa (Task 22) |
| `f12--dev` | `packages/ds/src/ui/ListItem/listItemStyles.ts:22` | Gốc của lỗi “avatar lệch phải” (E): hàng `selected` đổi `paddingHorizontal` sang `Margin-Comfortable`. | thấp | — | không làm: theo variant Figma, chỉ màn Dev |

Lỗi đã ghi ở A–E vẫn còn (chụp lại xác nhận): xem tổng hợp ở `README.md` mục “Lỗi màn hình đã thấy”. Riêng `f01--tong-quan-co-du-lieu`: caption “Carry trung bình của 3 gậy” đã thành “của 1 gậy” (đúng số), nhưng vẫn vẽ một đĩa đặc.
