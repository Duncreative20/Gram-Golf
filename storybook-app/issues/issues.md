# Vấn đề phát hiện khi dựng Storybook màn app

Người viết story ghi tiếp vào đây. **Không sửa màn app** từ việc viết story — chỉ ghi lại.

## Lỗi / xấu ở màn app

| Story id | File:dòng | Hiện tượng | Task | Trạng thái |
| --- | --- | --- | --- | --- |
| — | — | Chưa có. Hạ tầng (2026-10-08): `f04--hlv-tao-ma`, `f04--hoc-vien-nhap-ma`, thử thêm `(player)/home` + tab, `(coach)/roster` + tab, guard `Redirect` — đều vẽ đúng sáng/tối. Console chỉ có cảnh báo `"shadow*" style props are deprecated` (từ style đổ bóng của DS, không vỡ màn). | — | — |

## Bước “Chưa có” (route không tồn tại — không dựng UI giả)

| Luồng | Bước | Ghi chú |
| --- | --- | --- |
| F04 | Lời mời 2 chiều (HLV gửi lời mời trong app, học viên nhận / từ chối) | Đã làm (Task 17): mục “Mời học viên cụ thể” ở `connect/invite`; `ShareSheet` vẫn chỉ giả lập gửi |

## Phân loại Phase 2

Task 15 (2026-10-08) gom mọi lỗi màn / minor để lại về task sở hữu. Nguồn: `README.md` › “Lỗi màn hình đã thấy” (= `A`–`E.md` + `verify.md`), minor
để lại của Task 12–14 (`progress.md`, `task-1{2,3,4}-review.md`), concern / cannot-verify của `task-1{2,3,4}-report.md`. Luật: lỗi thật và chữ sai →
sửa (bước code nằm sẵn trong task sở hữu, cột “Bước”); thuần đẹp hơn → “Không làm” dưới. Task sở hữu sửa xong thì đổi Trạng thái thành
`đã sửa (Task NN)`.

| # | Nguồn | Lỗi | Task | Bước | Trạng thái |
|---|---|---|---|---|---|
| 1 | README · `f01--tong-quan-co-du-lieu` | `charts/ConcentricRings.tsx:17-21`: 1 gậy → vẽ một đĩa đặc to | 20 | Step 4b | đã sửa (Task 20) |
| 2 | README · `f01--tong-quan-co-du-lieu` | "Xu hướng … (Driver, 1 buổi)" vẽ biểu đồ một điểm (`charts/TrendChart.tsx`, dùng ở `(player)/home.tsx:173`, `students/[id].tsx:90`) | 20 | Step 4b | đã sửa (Task 20) |
| 3 | README · `f10--chi-tiet-bai` | DS `Comment/Comment.tsx:70`: "⋯" của bình luận của mình bấm không làm gì | 15 | Step 13 | đã sửa (Task 15) |
| 4 | README · `f10--tra-loi-binh-luan` | DS `Comment/Comment.tsx:155-156`: "Thêm ảnh" / "Thêm địa điểm" không có handler | 15 | Step 13 | đã sửa (Task 15) |
| 5 | README · `f11--tab-hlv` + report Task 13 | `NotificationsScreen.tsx:101`: tab Thông báo của HLV vẫn có chuông mở chính màn đó | 27 | Step 3 | đã sửa (Task 27) |
| 6 | README · `f04--ho-so-hlv`, `f10--*` | DS `PostCard.tsx:56`, `Social.tsx:91`, `Comment.tsx:57`: chữ tắt `name.slice(0, 1)` → mọi HLV hiện "H" | 15 | Step 13 | đã sửa (Task 15) |
| 7 | README · `f02--onboarding-anh` | `(auth)/onboarding.tsx:32`: HLV vẫn đọc "Giúp HLV và bạn bè nhận ra bạn." | 24 | Step 3 | đã sửa (Task 24) |
| 8 | README · `f11--danh-sach` | `NotificationsScreen.tsx:19`: "… đã bình luận" thiếu tân ngữ | 27 | Step 3 | đã sửa (Task 27) |
| 9 | README · `f11--tab-hlv-rong` + review Task 13 #3 | `NotificationsScreen.tsx:124`: rỗng của HLV nói "Ghi chú của HLV…" | 27 | Step 3 | đã sửa (Task 27) |
| 10 | README · `f12--tai-khoan-hlv` + review Task 13 #4 | `settings/account.tsx:26`: đơn giá điền sẵn "450000", placeholder "450.000" | 28 | Step 3 | đã sửa (Task 28) |
| 11 | README · `f12--mat-khau` | `settings/password.tsx:13,15`: placeholder "••••••••" ở ô trống trông như đã có mật khẩu | 25 | Step 5 | đã sửa (Task 25) |
| 12 | `verify.md` · `f10--kham-pha` | `components/People.tsx:66`: "hcp 14", màn khác "Handicap 14" | 26 | Step 1b | đã sửa (Task 23) |
| 13 | `verify.md` · `f09--tong-quan-rong` | `students/[id].tsx:72`: "chưa có phiên swing nào" dễ lẫn với video swing | 22 | Step 1b | đã sửa (Task 22) |
| 14 | README · `f06--them-gay-chon-loai` + review Task 14 #3 | Viền Radio chưa chọn (`Checkbox/Border/Default`) và Toggle tắt (`Color/Border/Neutral/Pale/Default`) < 3:1 trên nền sáng — token Figma | 15 | Step 13 (nợ Figma F56, giữ token) | đã sửa (Task 15): ghi nợ F56 |
| 15 | review Task 12 #1 | Khối "Bài đăng" chép y hệt ở `coaches/[id].tsx:60`, `users/[id].tsx:85`, `(coach)/me.tsx:35` | 26 | Step 1b | đã sửa (Task 23): `PostsSection` |
| 16 | review Task 12 #3 | `PostItem.tsx:83`: nhãn Chia sẻ kẹt "Đã sao chép" mãi sau một lần gửi | 26 | Step 1b | đã sửa (Task 23) |
| 17 | review Task 12 #5 | `PostItem.tsx` thân bài (Pressable) không có nhãn / gợi ý a11y | 26 | Step 1b | đã sửa (Task 23) |
| 18 | review Task 12 #7 | Link giả `https://gramgolf.app/p/<id>` (`PostItem.tsx:13`) và `/i/<code>` (`connect/invite.tsx:14`) thiếu comment `ponytail:` | 26, 17 | 26 Step 1b · 17 Step 4 | đã sửa (Task 17) phần `/i/<code>`; đã sửa (Task 23) phần `/p/<id>` |
| 19 | review Task 12 #8 | `posts/[id].tsx:195`: xoá bài gọi `back()` rồi `dispatch` cùng nhịp → màn đang rời nháy "Không tìm thấy" | 26 | Step 1b | đã sửa (Task 23): `useOnLeave` |
| 20 | review Task 13 #1 | `settings/password.tsx`: thiếu guard `if (!me) return <Redirect href="/" />` (mở được khi đã đăng xuất) | 25 | Step 5 | đã sửa (Task 25) |
| 21 | review Task 13 #2 | `settings/privacy.tsx:39,86-92`: Dialog xoá tài khoản trống chữ khi mờ dần lúc đóng | 28 | Step 4 | đã sửa (Task 28) |
| 22 | review Task 13 #5 + report Task 13 | Thông báo của người đã chặn vẫn hiện và vẫn tính vào số trên chuông | 27 | Step 3 | đã sửa (Task 27) |
| 23 | review Task 14 #1 | `CLAUDE.md:24` nói tải lần đầu có "lỗi + thử lại" — skeleton không có nhánh lỗi | 30 | Step 5 | chờ Task 30 |
| 24 | review Task 14 #2 | Mẫu `deleteOnLeave` chép ở `metrics/[id].tsx:18-25`, `swings/[id].tsx:179-186`; xoá gậy (Task 21) là nơi thứ 3 | 21 | Step 5 | đã sửa (Task 21): `components/useOnLeave.ts`, dùng ở 3 màn |
| 25 | review Task 14 #5 | Story F01/F03/F05/F10/F13 vẽ Tổng quan / bảng tin có skeleton 400 ms | 15 | Step 5, 6 (`DELAYS` + `hold`; story dùng `find*`) | đã sửa (Task 15) |
| 26 | issues A–E "Hạ tầng" + `verify.md` | `userEvent.type` không tới `onChangeText`; Modal ra ngoài ảnh / thừa 32 px; toast tự tắt; script chụp treo | 15 | Step 6, 8, 9 | đã sửa (Task 15) |
| 27 | review Task 14 cannot-verify + report Task 14 | Bàn phím iOS/Android (`KeyboardAvoid`), `resetTo` và xoá-khi-rời trên native chỉ kiểm trên web | 30 | Step 3 (mục "Kiểm trên điện thoại") | chờ Task 30 |

**Không làm (nice-to-have):**
- `(auth)/register.tsx:85` nút "Tiếp" ở bước gửi OTP — chữ không sai (bước kế là xác minh OTP).
- `charts/ConcentricRings.tsx:6,25` vòng ngoài / ô chú giải `Support/Brand/Soft` mờ ở chế độ tối — chú giải có tên gậy + số, màu chỉ phụ; đổi thang
  màu chart tối cần thiết kế.
- DS `TextArea` nhãn to hơn `TextField` — đúng Figma (`TextArea.tsx` ghi "label Body/XSmall/Regular … khác Text-Field").
- DS `ListItem` `selected` đổi padding (`listItemStyles.ts:22`, avatar lệch ở Dev) — theo variant Figma; chỉ màn Dev.
- DS chip "Trả lời …" gap nhỏ (`commentStyles.ts:54`) — token Figma `Badge/Spacing/Small/Gap`.
- `PostItem` gọi `discover()` + dựng `ShareSheet` ở mỗi hàng (review Task 12 #2) — 6 bài mẫu, không đo được chậm.
- `FollowCounts` / tiêu đề `LikesSheet` đếm cả người bị chặn trong khi danh sách ẩn họ (review Task 12 #4) — chỉ lệch khi người xem đã chặn một
  người trong danh sách; ẩn là có chủ đích.
- Hồ sơ bị chặn vẫn hiện "Handicap · CLB" (review Task 12 #6) — thông tin công khai.
- DS `Chip` không nhận `accessibilityLabel` (report Task 12) — trợ giúp của ô tag đã nói "chạm tag để bỏ".
- `BottomSheet` primary / `ShareSheet` "Gửi (N)" màu khác nút app (review Task 12 #10) — DS dùng `level` theo Figma Share-Sheet; đổi là quyết
  định Figma, chủ dự án xem ảnh `f04--hlv-chia-se-ma` rồi quyết.
- Đơn giá vượt 10.000.000 báo "Số tiền không hợp lệ" (review Task 13 #4, nửa sau) — trợ giúp ô đã ghi "Tối đa 10.000.000 đ".
- 14 chỗ chép prop avatar ảnh / chữ tắt (review Task 13 #6) — refactor không đổi hành vi.
- `target()` / `SENTENCE` của `NotificationsScreen` chưa có unit test (review Task 13 #7) — lượt đi F4 / F8 / F11 bấm từng loại thông báo.
- Nút hiện/ẩn mật khẩu lặp ở 3 ô `settings/password` (review Task 13 #8) — review chấp nhận.
- `ShareSheet` chọn người nhận nhưng "Gửi (N)" chép cùng một lời nhắn (review Task 14 #4) — có `ponytail:`; mời người cụ thể trong app là mục
  "Mời học viên cụ thể" (Task 17).
- Công khai bộ gậy / swing và tắt từng loại thông báo chưa có hiệu lực thấy được (report Task 13) — mock không có push, không có màn xem dữ liệu
  công khai.

Kiểm đếm: 27 dòng → Task 15 (6: #3, #4, #6, #14, #25, #26), 17 (1, chung #18), 20 (2), 21 (1), 22 (1), 24 (1), 25 (2), 26 (6, gồm #18), 27 (4),
28 (2), 30 (2); 16 mục không làm.

### Lượt chụp Task 15 (2026-10-08, 227 story × sáng/tối, khung 390×844)

`shot-storybook.mjs … '^f[0-9]{2}--' 390 844`: 454 dòng `ok`, không `ERROR` / `TIMEOUT` / lỗi trang. Đã đọc cả 454 ảnh: `hold` giữ skeleton
(`f13--dang-tai-tong-quan`) và toast (`f13--toast-da-luu`), story khác cùng màn (`f05--tong-quan`, `f10--bang-tin`) không skeleton; Dialog / sheet nằm
trong khung; story gõ chữ có chữ và không báo "Bắt buộc" sai; bình luận của mình không còn "⋯", ô bình luận mở rộng chỉ còn nút Gửi, avatar chữ tắt 2 chữ.

| Story id | File:dòng | Hiện tượng | Task | Trạng thái |
| --- | --- | --- | --- | --- |
| `f05--quet-qr-da-lien-ket` | `flows/F05-so-lieu.stories.tsx` (`QuetQrDaLienKet`) + `apps/golf/app/metrics/scan-qr.tsx:21` | Ảnh lúc "Đã liên kết", lúc "Đang liên kết…" (hẹn giờ 1 s chạy đua với lúc chụp — script mới chụp ngay khi `play` xong) | 15 | đã sửa (Task 15): `play` chờ chữ "Đã liên kết phiên" (story, không đổi màn) |
| `f10--bao-cao-*`, `f01--onboarding-don-vi` | DS `RadioRow` (`ui/Radio/Radio.tsx:67`) trong `components/ReportSheet.tsx:44`, `(auth)/onboarding.tsx:49` | Các hàng radio sát nhau (~30 px/hàng, không gap) | — | không làm: theo variant Figma, vùng chạm ≥ 24 px (WCAG 2.5.8) |
