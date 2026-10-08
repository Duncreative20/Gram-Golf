# Vấn đề phát hiện khi viết story F01 · F02 · F03

**Không sửa màn app** — chỉ ghi lại. Ảnh: `storybook-app/__shots__/A/<story-id>.<light|dark>.png`.

## Lỗi / xấu ở màn app

| Story id | File:dòng | Hiện tượng | Gợi ý | Task | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| `f01--tong-quan-co-du-lieu` | `apps/golf/app/(player)/home.tsx:146-151` + `apps/golf/components/charts/ConcentricRings.tsx:19` | Người chơi mới có 1 gậy: "Carry theo gậy" vẽ **một đĩa đặc to** (bán kính = max) trông như vết màu, không còn là vòng đồng tâm; caption vẫn ghi "Carry trung bình của 3 gậy xa nhất". | Chỉ hiện mục khi ≥ 2 gậy, hoặc caption theo số gậy thật. | 20 | đã sửa (Task 20) |
| `f01--tong-quan-co-du-lieu` | `apps/golf/app/(player)/home.tsx:132-143` | "Xu hướng tốc độ đầu gậy (Driver, 1 buổi)" vẽ biểu đồ chỉ một điểm — chưa phải xu hướng. | Dưới 2 buổi → dòng gợi ý ("Cần ít nhất 2 buổi Driver") thay cho biểu đồ. | 20 | đã sửa (Task 20) |
| `f02--onboarding-anh` | `apps/golf/app/(auth)/onboarding.tsx:32` | Trang "Ảnh đại diện" của **HLV** vẫn ghi "Giúp HLV và bạn bè nhận ra bạn." | Theo vai: HLV → "Giúp học viên và bạn bè nhận ra bạn." | 24 | đã sửa (Task 24) |
| `f01--dang-ky-thong-tin`, `f02--dang-ky-thong-tin` | `apps/golf/app/(auth)/register.tsx:83` | Bước cuối (Thông tin) nút vẫn là "Tiếp →" dù bấm là gửi mã OTP. Nhỏ, không vỡ. | "Tạo tài khoản" / "Gửi mã xác minh" ở bước 2. | — | không làm: chữ không sai (bước kế là xác minh OTP) |

Console chỉ có cảnh báo DS `"shadow*" style props are deprecated` (không vỡ màn).

## Hạ tầng Storybook (không phải lỗi màn — báo cho người viết story khác)

| Vấn đề | Bằng chứng | Cách xử lý trong F01–F03 | Trạng thái |
| --- | --- | --- | --- |
| **`userEvent.type` không tới state React** của `TextInput` (react-native-web 0.21 + React 19): giá trị DOM đổi nhưng `onChangeText` không chạy → bấm Lưu / Tiếp báo "Bắt buộc", ô bị xoá trắng khi màn vẽ lại. | Trước khi sửa: `f01--dang-ky-trung-tai-khoan` (gõ đủ 5 ô rồi bấm Tiếp → cả 5 ô "Bắt buộc", ô trống), `f01--xac-minh-otp-sai` (gõ 111111 → ô OTP vẫn "•", không báo sai). Agent B gặp cùng lỗi (comment trong `F04-ket-noi-hlv.stories.tsx`). **Ảnh hiện tại của `f05--nhap-tay-loi` vẫn dính lỗi này** (gõ 160 / abc / 2650 nhưng cả 3 ô báo "Bắt buộc"). Các file còn gọi `userEvent.type` vào TextField: `F05` (dòng ~84-86, ~106), `F06` (~77-79, ~110), `F09` (~45), `F10` (~117, ~127, ~133-135, ~200, ~209) — cần soát ảnh. | Đặt giá trị bằng `fireEvent.input(el, { target: { value } })` (`storybook/test`, set qua native setter) — kiểm bằng giá trị `<input>` + chữ lỗi trên ảnh. Đáng đưa vào `lib/appStory.tsx` / README thành helper chung. | đã xử lý (Task 15): `typeIn` trong `lib/appStory.tsx` (`fireEvent.input`) |
| **Modal (Dialog / BottomSheet) nằm ngoài ảnh** khi chụp bằng `scripts/shot-storybook.mjs` (viewport 3000 px → Modal canh giữa ở ~1500 px). Agent B đã ghi ở `issues/B.md`. | `f03--ho-so-dang-xuat` chỉ còn lớp phủ mờ. | Chụp lại story này ở khung cố định 390×844 (script nháp ngoài repo) và thay vào `__shots__/A/`. | đã xử lý (Task 15): chụp khung cố định `shot-storybook.mjs … 390 844` — Modal trong khung, hết dải 32 px |
| Portal của Modal (BottomSheet, Dialog) nằm **ngoài `canvas`** của `play` → `canvas.findBy*` không thấy. | `f01--nhap-tay-da-luu`: `canvas.findByRole('radio', { name: /Driver/ })` trong sheet Chọn gậy → không tìm thấy. | Dùng `screen.findBy*` cho phần tử trong Modal. | đã xử lý (Task 15): README › Giới hạn ghi `screen.find*` / `within(body)` |
| HMR giữa lúc chụp: Task 12–14 sửa file app (vd. dời `AlertMessage` / `SavedToast` từ `components/SessionEntry.tsx` sang `components/Feedback.tsx`) → story tạm vỡ "does not provide an export named 'AlertMessage'". | Một lượt chụp đầu của F01. | Chụp lại sau khi file app ổn định; đã chụp lại toàn bộ F01–F03. | đã xử lý (Task 15): script chụp in exception / `console.error` của trang sau `|` → thấy ngay, chụp lại |

Ảnh không ổn định từng giây (không phải lỗi): `verify-otp` đếm ngược "Gửi lại mã sau 59s/58s"; `register.tsx` / `connect/invite` dùng `NOW` cố định nên ổn định.

## Bước “Chưa có” (route không tồn tại — không dựng UI giả)

| Luồng | Bước | Ghi chú |
| --- | --- | --- |
| F03 | Đặt lại mật khẩu từ link trong email (màn nhập mật khẩu mới sau "Quên mật khẩu") | Phase 2; `(auth)/forgot-password` chỉ báo "Kiểm tra hộp thư". |
| F01 | — | Mọi bước đã có route. |
| F02 | — | Mọi bước đã có route. |

## Phủ route

| Route | Story id |
| --- | --- |
| `index` | `f03--vao-app-nguoi-choi`, `f03--vao-app-hlv`, `f03--da-dang-xuat` |
| `(auth)/welcome` | `f01--man-chao`, `f02--man-chao` |
| `(auth)/register` | `f01--dang-ky-chon-vai`, `f01--dang-ky-thong-tin`, `f01--dang-ky-loi-bo-trong`, `f01--dang-ky-trung-tai-khoan`, `f02--dang-ky-chon-vai`, `f02--dang-ky-thong-tin`, `f02--dang-ky-loi` |
| `(auth)/verify-otp` | `f01--xac-minh-otp`, `f01--xac-minh-otp-sai`, `f01--xac-minh-otp-thieu-thong-tin`, `f02--xac-minh-otp` |
| `(auth)/onboarding` | `f01--onboarding-anh`, `f01--onboarding-don-vi`, `f01--onboarding-ma-moi`, `f02--onboarding-anh`, `f02--onboarding-moi-hoc-vien` |
| `(auth)/login` | `f03--dang-nhap`, `f03--dang-nhap-bo-trong`, `f03--dang-nhap-sai` |
| `(auth)/forgot-password` | `f03--quen-mat-khau`, `f03--quen-mat-khau-email-sai`, `f03--quen-mat-khau-da-gui` |
| `(player)/home` | `f01--tong-quan-trong`, `f01--tong-quan-co-du-lieu` |
| `(coach)/roster` | `f02--hoc-vien-trong`, `f02--hoc-vien-trong-loi-moi`, `f02--hoc-vien-loi-moi-dang-cho` |
| `connect/invite` | `f02--moi-chua-co-ma`, `f02--moi-da-tao-ma` |
| `metrics/add` | `f01--chon-nguon-so-lieu` |
| `metrics/manual` | `f01--nhap-tay-chua-co-gay`, `f01--nhap-tay-loi`, `f01--nhap-tay-da-luu` |
| `settings/index` | `f03--cai-dat` |
| `settings/password` | `f03--doi-mat-khau`, `f03--doi-mat-khau-loi`, `f03--doi-mat-khau-xong` |
| `profile` | `f03--ho-so`, `f03--ho-so-dang-xuat` |
