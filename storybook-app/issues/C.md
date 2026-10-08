# Nhóm C — F05 Số liệu, F06 Bộ gậy

Story: `flows/F05-so-lieu.stories.tsx` (27 story), `flows/F06-bo-gay.stories.tsx` (18 story). Ảnh sáng + tối 390: `__shots__/C/` (90 ảnh, đã xem từng ảnh — đều đúng màn / trạng thái / tài khoản, không crash, không trống, có thanh tab ở màn tab).

## Lỗi / xấu ở màn app (không sửa màn — chỉ ghi)

| Story id | File:dòng | Hiện tượng | Mức | Task | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| `f05--tong-quan` (tối) | `apps/golf/components/charts/ConcentricRings.tsx:6` (FILLS), `:25` (ô màu chú giải) | Chế độ tối: vòng ngoài và ô màu chú giải của gậy xa nhất (Driver) dùng `Color/Background/Support/Brand/Soft` → xanh rất đậm trên nền thẻ tối, ô màu cạnh chữ “Driver” gần như không thấy. Sáng thì ổn. | thấp | — | không làm: chú giải có tên gậy + số, màu chỉ phụ; thang màu chart tối cần thiết kế |
| `f06--them-gay-chon-loai` (sáng) | `packages/ds/src/ui/Popover/popoverItemStyles.ts:48` | Viền nút radio chưa chọn trong sheet “Chọn loại gậy” (`Checkbox/Border/Default`) rất nhạt trên nền trắng, có thể dưới 3:1 (WCAG non-text). Token bind theo Figma → nếu sai thì là nợ Figma của DS, không phải lỗi màn app. | thấp | 15 | đã sửa (Task 15): giữ token Figma, ghi nợ F56 |

Không thấy lỗi chức năng ở các màn `metrics/*`, `(player)/metrics`, `clubs/*`: validate, CSV (dòng lỗi, file lạ, tự gán gậy theo cột Club), OCR (trường tin cậy thấp + lỗi “Không phải số”), 403 / không tìm thấy, HLV chỉ đọc (không nút sửa / xoá / lưu trữ / “+”), guard sửa gậy đã lưu trữ đều đúng.

## Ghi chú hạ tầng cho người viết story (không sửa hạ tầng chung — đề xuất)

1. **`userEvent.type` không tới state của ô nhập** (TextInput react-native-web): DOM hiện chữ nhưng `onChangeText` không chạy, render kế tiếp trả ô về rỗng. Đo được: gõ “160” bằng `userEvent.type` → bấm Lưu → ô rỗng, lỗi “Bắt buộc”; cùng thao tác bằng `fireEvent.change(el, { target: { value } })` → đúng. F05/F06 dùng helper `fill()` (fireEvent.change). Ảnh hưởng `f04--hoc-vien-nhap-ma`: ảnh có “TUAN24” nhưng state mã vẫn rỗng — story nào gõ rồi bấm tiếp (Kiểm tra…) sẽ sai. Đề xuất ghi vào README mục “Viết một story luồng”. — **đã xử lý (Task 15): `typeIn` trong `lib/appStory.tsx` (`fireEvent.input`)**
2. **Dialog / BottomSheet là `Modal` → vẽ ngoài `#storybook-root`**: `canvas.findBy*` không thấy nội dung sheet / dialog → dùng `within(canvasElement.ownerDocument.body)`. — **đã xử lý (Task 15): README › Giới hạn ghi `screen.find*` / `within(body)`**
3. **Ảnh chụp mất dialog / sheet**: khi chụp viewport cao 3000 px, Modal (`position: fixed`) nằm giữa / đáy 3000 px — ngoài vùng cắt (ảnh chỉ thấy lớp phủ xám). F05/F06 có decorator `modalInShot` (chỉ khi `min-height: 1500px` và đang có `[aria-modal="true"]`): cắt `#sb-content` ở 844 và đặt Modal trong khung 390×844 đầu ảnh. Đề xuất chuyển 2 dòng CSS này vào `.storybook/shot.css` cho mọi luồng (F07 dialog xoá, F10 sheet…) rồi bỏ bản chép ở F05/F06. — **đã xử lý (Task 15): chụp khung cố định `shot-storybook.mjs … 390 844` — Modal trong khung, hết dải 32 px**
4. **Trạng thái theo hẹn giờ** (OCR giả lập 1,5 s ở `metrics/import-photo`) chạy đua với thời điểm chụp (~1,7 s sau khi mở) → `beforeEach: ocrTimer('never' | 'now')` vá `setTimeout(…, 1500)` trong story để ảnh ổn định. — **đã xử lý (Task 15): `DELAYS.ocr` + `hold: ['ocr']`; `ocrTimer` của F05 vẫn chạy (mặc định 1500), Task 20 thay**
5. Lúc chụp lần đầu có lỗi HMR tạm thời `SessionEntry.tsx … does not provide an export named 'AlertMessage'` (agent khác đang sửa file app) — chụp lại là hết, không phải lỗi màn. — **đã xử lý (Task 15): script chụp in exception / `console.error` của trang sau `|` → thấy ngay, chụp lại**

## Bước “Chưa có” (route không tồn tại — không dựng UI giả)

| Luồng | Bước | Ghi chú |
| --- | --- | --- |
| F06 | Danh sách gậy đã lưu trữ + khôi phục gậy | Phase 2. Hiện chỉ lưu trữ một chiều; gậy lưu trữ chỉ mở được qua link chi tiết (`f06--da-luu-tru`). |
| F05 | — | Đủ route. Chọn file CSV / ảnh thật của hệ điều hành là bản thử (file / ảnh mẫu) ngay trong màn. |

## Phủ route

| Route | Story id |
| --- | --- |
| `metrics/add` | `f05--chon-nguon` |
| `metrics/manual` | `f05--nhap-tay`, `f05--nhap-tay-loi`, `f05--nhap-tay-da-luu`, `f05--nhap-tay-the-luc`, `f05--nhap-tay-yard` |
| `metrics/import-csv` | `f05--csv-chon-file`, `f05--csv-xem-truoc`, `f05--csv-file-la`, `f05--csv-xac-nhan`, `f05--csv-da-nhap`, `f05--csv-thieu-gay` |
| `metrics/import-photo` | `f05--anh-chon-hang`, `f05--anh-dang-doc`, `f05--anh-kiem-tra` |
| `metrics/scan-qr` | `f05--quet-qr`, `f05--quet-qr-da-lien-ket` |
| `metrics/[id]` | `f05--chi-tiet-phien`, `f05--chi-tiet-the-luc`, `f05--chi-tiet-xoa-dialog`, `f05--chi-tiet-hlv-xem`, `f05--chi-tiet-khong-quyen`, `f05--chi-tiet-khong-thay` |
| `(player)/metrics` | `f05--danh-sach-swing`, `f05--danh-sach-the-luc`, `f05--danh-sach-rong`, `f06--tab-thong-so` |
| `(player)/home` | `f05--tong-quan` |
| `clubs/index` | `f06--danh-sach`, `f06--danh-sach-rong`, `f06--hlv-xem-bo-gay`, `f06--khong-quyen-bo-gay` |
| `clubs/new` | `f06--them-gay`, `f06--them-gay-loi`, `f06--them-gay-chon-loai`, `f06--them-gay-wedge`, `f06--them-gay-tuy-chinh` |
| `clubs/[id]/index` | `f06--chi-tiet`, `f06--luu-tru-dialog`, `f06--da-luu-tru`, `f06--hlv-xem-chi-tiet`, `f06--khong-quyen-chi-tiet`, `f06--khong-tim-thay` |
| `clubs/[id]/edit` | `f06--sua-gay`, `f06--sua-gay-da-luu-tru` |
