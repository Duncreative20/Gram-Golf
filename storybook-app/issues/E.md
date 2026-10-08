# Vấn đề — luồng F10 · F11 · F12 · F13 (người viết E, 2026-10-08)

Không sửa màn app; chỉ ghi lại. Ảnh: `storybook-app/__shots__/E/<story-id>.<light|dark>.png`.

## Hạ tầng Storybook (ảnh hưởng mọi luồng)

| Vấn đề | Hiện tượng | Cách né trong story của E | Trạng thái |
| --- | --- | --- | --- |
| `userEvent.type` không tới `onChangeText` | Với TextInput react-native-web 0.21 + React 19, chữ có trong DOM nhưng state React vẫn rỗng (đếm ký tự “0/2000”, danh sách Khám phá không lọc, tag không tách). Gõ thật (CDP `Input.insertText`) thì chạy. | `fireEvent.change(el, { target: { value } })` (helper `typeIn` trong F10, F12). F04 / F05 / F06 cũng đã đổi sang cách này. Nên ghi vào README mục Giới hạn. | đã xử lý (Task 15): `typeIn` trong `lib/appStory.tsx` (`fireEvent.input`) |
| Sheet / Dialog ra ngoài ảnh chụp | `scripts/shot-storybook.mjs` mở viewport cao 3000 rồi cắt theo chiều cao nội dung. Modal của RN-web là `position: fixed` theo viewport, nên BottomSheet nằm ở đáy 3000 px và Dialog nằm giữa (~1500 px) đều rơi ra ngoài vùng cắt. Ảnh chỉ còn lớp nền mờ. | Chụp lại các story có sheet / dialog bằng bản sao script với viewport cố định 390×844 (`$SCRATCHPAD/shot-fixed.mjs`, chỉ đổi `H = 844` và bỏ bước nới viewport). Nên sửa ở `shot.css` (giới hạn modal cố định vào 844 px đầu) hoặc thêm cờ `H` cho script. | đã xử lý (Task 15): chụp khung cố định `shot-storybook.mjs … 390 844` — Modal trong khung, hết dải 32 px |
| Toast tự tắt | `SavedToast` gọi `onDone` sau 1,2 s. Nếu `onDone` xoá toast (báo cáo, bỏ chặn), ảnh chụp có lúc có toast, có lúc không. | Không làm story “Đã gửi báo cáo”, “Đã bỏ chặn”. Toast còn lại sau `onDone` (đăng bài, lưu tài khoản) thì có story. | đã xử lý (Task 15): `appStory({ hold: ['toast'] })` giữ toast (`f13--toast-da-luu`) |
| HMR khi agent khác sửa file app | Lúc Task 13 đang sửa `components/SessionEntry.tsx` → `Feedback.tsx`, vài lần chụp báo “does not provide an export named 'SavedToast'” hoặc “useStore: bọc app trong <StoreProvider>”. | Chụp lại sau khi file ổn định thì hết lỗi. | đã xử lý (Task 15): script chụp in exception / `console.error` của trang sau `|` → thấy ngay, chụp lại |

## Lỗi / xấu ở màn app

| Story id | File:dòng | Hiện tượng | Task | Trạng thái |
| --- | --- | --- | --- | --- |
| `f10--chi-tiet-bai`, `f10--da-gui-binh-luan` | `packages/ds/src/ui/Comment/Comment.tsx:70` + `apps/golf/app/posts/[id].tsx:140` | Bình luận của chính mình vẫn có nút “⋯” (Thêm). Màn cố ý truyền `onMore={undefined}`, nhưng CommentItem luôn vẽ nút nên bấm không làm gì. DS nên ẩn nút khi không có `onMore`. | 15 | đã sửa (Task 15) |
| `f10--tra-loi-binh-luan` | `packages/ds/src/ui/Comment/Comment.tsx:155-156` + `apps/golf/app/posts/[id].tsx:151` | Khi ô bình luận mở rộng (đang gõ / trả lời), CommentComposer hiện nút “Thêm ảnh” và “Thêm địa điểm”, nhưng màn không truyền `onAddMedia` / `onAddLocation`. Hai nút này bấm không làm gì. | 15 | đã sửa (Task 15) |
| `f10--dang-bai`, `f12--tai-khoan` | `packages/ds/src/ui/TextField/TextArea.tsx` | Nhãn và chữ trong TextArea (“Nội dung”, “Giới thiệu”) to hơn nhãn TextField bên cạnh (“Tiêu đề”, “Họ tên”), nên form lệch cỡ chữ. | — | không làm: đúng Figma (TextArea khác Text-Field) |
| `f11--tab-hlv`, `f11--tab-hlv-rong` | `apps/golf/components/NotificationsScreen.tsx:101` | Tab Thông báo của HLV dùng `TabHeader`, nên header vẫn có nút chuông (kèm badge) mở `/notifications`, tức là chính màn đang xem. Nên ẩn chuông ở tab này. | 27 | chờ Task 27 |
| `f11--danh-sach` | `apps/golf/components/NotificationsScreen.tsx:19` | “Lê Đăng Khoa đã bình luận” thiếu tân ngữ, khác với like (“đã thích bài viết của bạn”). Gợi ý: “đã bình luận bài viết của bạn”. | 27 | chờ Task 27 |
| `f12--tai-khoan-hlv` | `apps/golf/app/settings/account.tsx:26` | Đơn giá điền sẵn “450000” không có dấu chấm, trong khi placeholder (“VD: 450.000”) và helpText (“Tối đa 10.000.000 đ”) đều có. | 28 | chờ Task 28 |
| `f12--mat-khau` | `apps/golf/app/settings/password.tsx:13,15` | Placeholder “••••••••” ở ô trống trông như đã có mật khẩu, nhất là ở theme tối. Nên dùng placeholder bằng chữ. | 25 | chờ Task 25 |
| `f12--dev` | `packages/ds` ListItem `selected` | Hàng đang chọn (Nguyễn Minh Anh) có avatar lệch phải vài px so với các hàng khác. | — | không làm: theo variant Figma, chỉ màn Dev |

Không có màn nào crash hoặc trống. Console chỉ có cảnh báo `"shadow*" style props are deprecated` (từ DS).

## Bước “Chưa có” (route không tồn tại — không dựng UI giả)

| Luồng | Bước | Ghi chú |
| --- | --- | --- |
| F10 | Sửa bài viết; xoá / sửa bình luận của mình | Chưa có action / UI |
| F10 | Ảnh / video trong bài và bình luận | Nút “+” của CommentComposer được thay bằng avatar |
| F10 | Gửi bài qua ShareSheet thành tin nhắn thật | Hiện chỉ giả lập (ponytail trong `PostItem.tsx`) |
| F10 | Bỏ chặn ngay ở hồ sơ người dùng | Bỏ chặn chỉ có ở `settings/privacy` (`f12--quyen-rieng-tu-da-chan`) |
| F11 | Thông báo đẩy (push), lời mời 2 chiều trong danh sách | Phase 2 |
| F12 | Đổi ảnh đại diện | Chưa có chọn ảnh, `avatarUrl` chỉ đọc |
| F12 | Đổi email / xác thực lại SĐT bằng OTP khi sửa | — |
| F12 | `settings/dev` ở bản release (Redirect khi `!__DEV__`) | Storybook luôn đặt `__DEV__ = true` |
| F13 | Màn 404 chung cho đường dẫn lạ (`+not-found`) | Phase 2. Hiện mỗi màn chi tiết tự hiện “Không tìm thấy …” |
| F13 | Mất mạng / lỗi máy chủ / đang tải dữ liệu | App chạy dữ liệu mẫu trong bộ nhớ, chưa có lớp API |
| F13 | Guard vai ở `(player)/_layout`, `(coach)/_layout` | Storybook không vẽ `_layout` |

## Trùng luồng khác (link, không nhân bản)

- Đổi mật khẩu lỗi / đã đổi → `f03--doi-mat-khau-loi`, `f03--doi-mat-khau-xong`. Đăng xuất → `f03--ho-so-dang-xuat`. Hồ sơ HLV bình thường → `f04--ho-so-hlv`.
- F12 vẫn giữ `01 · Hồ sơ`, `03 · Cài đặt`, `05 · Mật khẩu` làm bước của luồng. Ảnh giống `f03--ho-so`, `f03--cai-dat`, `f03--doi-mat-khau`.
- F13 `00 · Mục lục trạng thái` (`f13--muc-luc`) link tới 76 story trạng thái của F01–F13 (bấm là mở story gốc). Lúc viết, mọi id đều có trong `index.json`. Luồng gốc đổi tên export thì sửa `GROUPS` trong `F13-trang-thai.stories.tsx`.

## Phủ route

| Route | Story id |
| --- | --- |
| `(player)/community` | `f10--bang-tin`, `f10--bang-tin-rong`, `f10--kham-pha`, `f10--kham-pha-tim`, `f10--kham-pha-khong-thay`, `f10--bang-tin-sau-khi-chan` |
| `(coach)/community` | `f10--bang-tin-hlv` |
| `community/compose` | `f10--dang-bai`, `f10--dang-bai-loi`, `f10--dang-bai-hop-le`, `f10--dang-bai-chon-swing`, `f10--dang-bai-da-dang` |
| `posts/[id]` | `f10--chi-tiet-bai`, `f10--chi-tiet-bai-cua-minh`, `f10--tra-loi-binh-luan`, `f10--da-gui-binh-luan`, `f10--ai-da-thich`, `f10--xoa-bai-dialog`, `f10--swing-dinh-kem-co-quyen`, `f10--swing-dinh-kem-rieng-tu`, `f10--bai-khong-tim-thay`, `f10--bai-nguoi-da-chan`, `f10--bao-cao-bai`, `f10--bao-cao-loi` |
| `users/[id]` | `f10--ho-so-nguoi-dung`, `f10--ho-so-hlv-xem-hoc-vien`, `f10--ho-so-khong-tim-thay`, `f10--chan-dialog`, `f10--da-chan`, `f10--bi-chan`, `f10--bao-cao-nguoi-dung`, `f13--ho-so-id-hlv` |
| `coaches/[id]` | `f10--ho-so-hlv-bi-chan` (trạng thái thường ở `f04--ho-so-hlv`) |
| `people` | `f10--nguoi-theo-doi`, `f10--dang-theo-doi`, `f10--theo-doi-rong`, `f10--theo-doi-nguoi-da-chan` |
| `notifications` | `f11--danh-sach`, `f11--da-doc-tat-ca`, `f11--rong` |
| `(coach)/inbox` | `f11--tab-hlv`, `f11--tab-hlv-rong` |
| `profile` | `f12--ho-so-nguoi-choi`, `f12--ho-so-hlv` |
| `(coach)/me` | `f12--ho-so-hlv-tab` |
| `settings/index` | `f12--cai-dat` |
| `settings/account` | `f12--tai-khoan`, `f12--tai-khoan-hlv`, `f12--tai-khoan-loi`, `f12--tai-khoan-da-luu` |
| `settings/password` | `f12--mat-khau` |
| `settings/privacy` | `f12--quyen-rieng-tu`, `f12--quyen-rieng-tu-da-chan`, `f12--xoa-tai-khoan`, `f12--xoa-tai-khoan-lan-cuoi`, `f12--quyen-rieng-tu-hlv` |
| `settings/notifications` | `f12--cai-dat-thong-bao`, `f12--cai-dat-thong-bao-hlv` |
| `settings/units` | `f12--don-vi-met`, `f12--don-vi-yard` |
| `settings/dev` | `f12--dev`, `f12--dev-dat-lai` |
| `(player)/home` | `f13--chua-dang-nhap` (guard) |
| `swings/new` | `f13--hlv-mo-man-nguoi-choi` (guard) |
| `connect/invite` | `f13--nguoi-choi-mo-man-hlv` (guard) |
| `clubs/[id]/edit` | `f13--sua-gay-nguoi-khac` (guard) |
