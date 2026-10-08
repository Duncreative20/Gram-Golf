# Nhóm D — F07 Swing của người chơi · F08 HLV review swing

Story: `flows/F07-swing.stories.tsx` (19 story), `flows/F08-hlv-review-swing.stories.tsx` (9 story). Ảnh sáng/tối: `__shots__/D/` (2026-10-08) — đã xem từng ảnh, tất cả đúng trạng thái.

## Lỗi / xấu ở màn app

| Story id | File:dòng | Hiện tượng | Task | Trạng thái |
| --- | --- | --- | --- | --- |
| — | — | Không thấy lỗi màn nào ở `(player)/swings`, `swings/new`, `swings/[id]`, `(coach)/roster`, `students/[id]` trong các trạng thái đã dựng. | — | — |

## Vấn đề hạ tầng chụp (không phải lỗi màn — đề xuất cho người giữ `.storybook/`)

| # | Hiện tượng | Cách xử lý trong F07/F08 | Đề xuất chung | Trạng thái |
| --- | --- | --- | --- | --- |
| H1 | Chụp với viewport cao 3000 (`shot.css`): `Modal` của RN-web là `position: fixed` theo viewport → `Dialog` nằm ở y≈1500, `BottomSheet` ở đáy 3000 → **rơi ra ngoài ảnh** (ảnh chỉ thấy lớp mờ). Ảnh hưởng mọi luồng có dialog / sheet (F04 thu hồi mã, F06 lưu trữ gậy, F10 chặn / báo cáo…). | Decorator `phoneFrame` trong F07 (story `f07--chon-gay`, `f07--xoa-dialog`): khi chụp, `#storybook-root` cao 844 + `[aria-modal="true"]` cao 844 → ảnh đúng khung điện thoại 390×844. | Đưa vào `shot.css`: `body:has([aria-modal="true"]) #storybook-root { height: 844px; min-height: 0; overflow: hidden }` và `[aria-modal="true"] { bottom: auto; height: 844px }` (trong cùng `@media (min-height: 1500px)`), rồi bỏ `phoneFrame` khỏi F07. | đã xử lý (Task 15): chụp khung cố định `shot-storybook.mjs … 390 844` — Modal trong khung, hết dải 32 px |
| H2 | `userEvent.type` vào `MessageInput` (ô ghi chú `swings/[id]`) khi chụp bằng Chrome headless: chữ hiện trong ô nhưng React **không nhận onChange** (state rỗng → không có nút Gửi, không có lỗi). Gọi `fireEvent.input` (setter gốc + sự kiện `input`) thì đúng. `userEvent.type` ở ô mã F04 vẫn chạy — chưa rõ gốc. | F08 gõ bằng `fireEvent.input` (`typeNote`). | Ghi vào README mục Giới hạn: ô nhập không nhận chữ khi chụp → dùng `fireEvent.input(el, { target: { value } })`. | đã xử lý (Task 15): `typeIn` trong `lib/appStory.tsx` (`fireEvent.input`) |
| H3 | Mô phỏng tải lên / phân tích (`setInterval` 150 / 250 ms trong `SwingUpload`, `swings/[id]`) chạy theo thời gian thật → ảnh chụp rơi vào % ngẫu nhiên; trạng thái cần ~3 s (tải xong) không kịp trước lúc chụp (script chụp ~1,7 s sau khi có chữ). | Decorator `ticks(n)` trong F07: trong story, bộ đếm mô phỏng chạy ngay `n` nhịp rồi đứng yên (9 nhịp = 45 %, 20 nhịp = đủ tới lỗi 60 % / tải xong). Bộ đếm khác (phát video, Storybook) không đổi. | Nếu luồng khác cần (F13), chuyển `SimTicks` sang `lib/`. | giữ `ticks(n)` ở F07 (Task 15): nhịp mô phỏng tải lên / phân tích không thuộc `DELAYS` |
| — | Lần chụp đầu `f07--danh-sach` (sáng) báo lỗi module `SessionEntry.tsx` không có export `AlertMessage` — HMR đúng lúc agent khác đang sửa file; chụp lại thì hết. | — | — | đã xử lý (Task 15): script chụp in exception / `console.error` của trang sau `|` → thấy ngay, chụp lại |

## Bước “Chưa có” (route không tồn tại — không dựng UI giả)

| Luồng | Bước | Ghi chú |
| --- | --- | --- |
| F07 | Swing dạng lưới / lọc theo gậy, trạng thái | Đã làm (Task 19): Danh sách / Lưới, lọc 7 / 30 ngày, Mới nhất ⇄ Cũ nhất trước — story `f07--b-02-luoi`, `f07--b-03-loc-sap-xep`; lọc theo gậy / trạng thái không có trong MVP |
| F07 | Popup báo file video lỗi / không đọc được khi chọn video | Đã làm (Task 19): popup “Video quá dung lượng” / “File không phải video” + Chọn video khác — story `f07--b-05-qua-dung-luong`, `f07--b-06-khong-phai-video`; vẫn chọn video mẫu, chưa mở thư viện |
| F07 | Quay video trong app (camera) | Phase 2 |
| F08 | Sửa / xoá ghi chú HLV | Đã làm (Task 18): nút Sửa / Xoá dưới ghi chú của chính HLV, Chèn mốc, chip “Tua tới …” — story `f08--b-09-dang-sua`, `f08--b-10-xoa-ghi-chu` |
| F08 | Ghi chú vẽ / đánh dấu trên khung hình video | Phase 2 |

## Phủ route

| Route | Story id |
| --- | --- |
| `(player)/swings` | `f07--danh-sach`, `f07--danh-sach-rong` |
| `swings/new` | `f07--huong-dan-quay`, `f07--chon-video`, `f07--chon-gay`, `f07--loi-chua-chon-gay`, `f07--dang-tai`, `f07--tam-dung`, `f07--loi-tai`, `f07--thu-lai-tai-xong` |
| `swings/[id]` | `f07--chi-tiet-tai-do`, `f07--chi-tiet-chua-phan-tich`, `f07--chi-tiet-dang-phan-tich`, `f07--chi-tiet-da-phan-tich`, `f07--bam-goi-y`, `f07--chi-tiet-can-xem-lai`, `f07--chi-tiet-loi-phan-tich`, `f07--xoa-dialog`, `f07--da-xoa`, `f08--swing-hoc-vien`, `f08--chua-co-ghi-chu`, `f08--dang-viet`, `f08--loi-trong`, `f08--da-gui`, `f08--khong-co-quyen`, `f08--hoc-vien-xem-ghi-chu` |
| `(coach)/roster` | `f08--can-phan-hoi` |
| `students/[id]` | `f08--tab-swing` |
