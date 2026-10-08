# MVP issue #1 — đối chiếu sau Phase 2

Nguồn: https://github.com/Duncreative20/Gram-Golf/issues/1 (38 mục). Quyết định chủ dự án 08/10/2026: spec + plan 07/10 (mobile-first) thắng
mọi mâu thuẫn với MVP; mục mâu thuẫn không làm, có lý do một dòng. Ảnh ở `docs/flows/<Fxx>/` (sinh từ story của Storybook app, sáng + tối);
cách kiểm (Expo Go, Storybook app, lượt đi tự động) ở `docs/flows/README.md`.

| Mã | Mục MVP | Kết quả | Luồng · file · ảnh / lý do |
|---|---|---|---|
| M1.1 | Khung Mobile — Bottom Navigation | Xong | F1, F2 · `apps/golf/components/AppTabBar.tsx`, `app/(player)/_layout.tsx`, `app/(coach)/_layout.tsx` · `F01/f01--b-07-tong-quan-trong.light.png`, `F02/f02--b-05-hoc-vien-trong.light.png` |
| M1.2 | Khung Web/Desktop — Sidebar | Không làm | Mâu thuẫn spec D2: mobile-first, web chỉ để chụp/kiểm tra. |
| M1.3 | Header: Back, Tiêu đề, Avatar nhỏ, Icon thông báo | Xong | F5, F12 · `components/TabHeader.tsx` (tiêu đề + chuông có số + avatar ảnh, vùng chạm ≥ 44 px), `components/StackHeader.tsx` (Back + tiêu đề) · `F05/f05--b-01-tong-quan-truoc.light.png`, `F05/f05--b-07-chi-tiet.light.png` |
| M2.1 | Đăng nhập Email/Password | Xong | F3 · `app/(auth)/login.tsx` · `F03/f03--b-01-dang-nhap-sai.light.png`, `F03/f03--b-06-vao-app.light.png` |
| M2.2 | Đăng ký + chọn vai trò | Xong | F1, F2 · `app/(auth)/register.tsx`, `lib/validation.ts` · `F01/f01--b-02-chon-vai-tro.light.png`, `F02/f02--b-01-dang-ky-hlv.light.png` |
| M2.3 | Quên mật khẩu (nhận link) | Xong | F3 · `app/(auth)/forgot-password.tsx` · `F03/f03--b-03-da-gui-link.light.png` |
| M2.4 | Đặt lại mật khẩu từ link | Xong | F3 · `app/(auth)/reset-password.tsx`, `lib/simulate.ts` (`resetTokenStatus`) · `F03/f03--b-04-dat-lai-loi.light.png`, `F03/f03--b-11-link-het-han.light.png` |
| M2.5 | Onboarding: Avatar bắt buộc, Tên, Bio HLV | Xong một phần | Tên: bắt buộc ở đăng ký (F1). Bio HLV: `app/(auth)/onboarding.tsx` · `F02/f02--b-02-bio-bat-buoc.light.png`. **Avatar bắt buộc: không làm** — mâu thuẫn plan Task 4 (avatar tuỳ chọn, cho dùng chữ tắt). |
| M3.1 | Dashboard: thẻ chỉ số, xu hướng 5 buổi (Recharts) | Xong (trừ Recharts) | F5, F1 · `app/(player)/home.tsx`, `components/charts/TrendChart.tsx` · `F05/f05--b-01-tong-quan-truoc.light.png`, `F05/f05--b-20-tong-quan-sau.light.png`. Recharts: mâu thuẫn spec D11 (biểu đồ SVG tự vẽ, Recharts không chạy trên RN). "Buổi" = phiên: 1 dòng CSV = 1 phiên (plan Task 7), nên 5 buổi gần nhất có thể là nhiều cú cùng ngày. |
| M3.2 | My Swings: Lưới/Danh sách, lọc/sắp xếp theo ngày | Xong | F7 · `app/(player)/swings.tsx`, `lib/selectors.ts` (`filterSwings`) · `F07/f07--b-01-danh-sach.light.png`, `F07/f07--b-02-luoi.light.png`, `F07/f07--b-03-loc-sap-xep.light.png` |
| M3.3 | Chi tiết Swing: player, thông số gậy/ngày | Xong | F7 · `app/swings/[id].tsx` · `F07/f07--b-11-phan-tich-xong.light.png`, `F07/f07--b-13-gay-cua-swing.light.png` |
| M3.4 | Đọc phản hồi: Coach Note, chạm mốc để tua | Xong | F8 · `app/swings/[id].tsx` (SeekRow, chip "Tua tới") · `F08/f08--b-15-tua-theo-moc.light.png` |
| M3.5 | My Clubs: Active / Archived | Xong | F6 · `app/clubs/index.tsx`, `app/clubs/[id]/index.tsx` · `F06/f06--b-10-luu-tru.light.png`, `F06/f06--b-11-gay-luu-tru.light.png` |
| M3.6 | Lịch sử luyện tập | Xong | F5 · `app/(player)/metrics.tsx`, `components/SessionRow.tsx` · `F05/f05--b-02-lich-su.light.png`, `F05/f05--b-10-the-luc.light.png` |
| M3.7 | Quản lý kết nối HLV: HLV hiện tại, Huỷ kết nối | Xong | F4 · `app/(player)/coach.tsx` · `F04/f04--b-15-doi-hlv-chinh.light.png`, `F04/f04--b-26-hoc-vien-huy.light.png`, `F04/f04--b-28-ha-mat-quyen-403.light.png` (HLV mất quyền ngay khi học viên huỷ) |
| M3.8 | Duyệt lời mời: Chấp nhận/Từ chối yêu cầu từ HLV | Xong | F4 · `app/(player)/coach.tsx`, `app/coaches/[id].tsx`, `lib/reducer.ts` (`respondConnection`) · `F04/f04--b-07-tab-hlv-loi-moi.light.png`, `F04/f04--b-08-da-ket-noi.light.png` |
| M3.9 | Hồ sơ & Cài đặt: Profile, gạt đơn vị, Đăng xuất | Xong (đơn vị theo plan) | F12, F3 · `app/profile.tsx`, `app/settings/*` · `F12/f12--b-07-don-vi.light.png`, `F03/f03--b-09-dang-xuat.light.png`. "Nút gạt": dùng RadioRow theo plan Task 13; hệ Imperial đầy đủ: mâu thuẫn D9 (chỉ m/yd). |
| M3.10 | Trung tâm thông báo, chạm → đúng swing | Xong | F11, F8 · `components/NotificationsScreen.tsx` · `F11/f11--b-02-ghi-chu-den-swing.light.png`, `F08/f08--b-15-tua-theo-moc.light.png` |
| M4.1 | Roster: học viên active | Xong | F9 · `app/(coach)/roster.tsx` · `F09/f09--b-01-tim.light.png`, `F09/f09--b-02-can-phan-hoi.light.png` |
| M4.2 | Lời mời đang chờ: Duyệt/Từ chối học viên, Tạo/Copy mã | Xong | F4 · `app/(coach)/roster.tsx`, `app/connect/invite.tsx` · `F04/f04--b-03-tao-ma.light.png`, `F04/f04--b-13-hlv-duyet.light.png`, `F04/f04--b-14-roster-co-khoa.light.png` |
| M4.3 | Tổng quan học viên (chỉ đọc) | Xong | F9 · `app/students/[id].tsx` · `F09/f09--b-03-tong-quan.light.png` … `F09/f09--b-09-the-luc.light.png` |
| M4.4 | Video học viên: Đã review / Chưa review | Xong | F8 · `app/students/[id].tsx`, `lib/selectors.ts` (`swingsByReview`) · `F08/f08--b-05-swing-chua-review.light.png`, `F08/f08--b-16-da-review.light.png`, `F08/f08--b-17-chua-review.light.png` |
| M4.5 | Review Workspace: player, form note, nút chèn Timestamp | Xong | F8 · `app/swings/[id].tsx` · `F08/f08--b-06-workspace.light.png`, `F08/f08--b-07-chen-moc.light.png` |
| M4.6 | Hồ sơ HLV: cập nhật profile, Bio | Xong | F2, F12 · `app/(coach)/me.tsx`, `app/settings/account.tsx` · `F02/f02--b-07-ho-so-hlv.light.png`, `F12/f12--b-12-ho-so-hlv-moi.light.png` |
| M4.7 | Thông báo HLV: học viên nhận lời, vừa upload swing | Xong | F4, F8 · `lib/reducer.ts` (`swing_uploaded`), `components/NotificationsScreen.tsx` · `F04/f04--b-09-hlv-nhan-thong-bao.light.png`, `F04/f04--b-24-ha-nhan-thong-bao.light.png`, `F08/f08--b-03-thong-bao-swing-moi.light.png` |
| M5.1 | Upload video: file → progress → Gậy & Ngày | Xong (thứ tự theo plan) | F7 · `app/swings/new.tsx`, `components/SwingUpload.tsx` · `F07/f07--b-07-chon-video-gay-ngay.light.png`, `F07/f07--b-09-loi-mang.light.png`. Thứ tự "file → progress → form": mâu thuẫn plan Task 9 (chọn gậy + ngày trước khi tải). |
| M5.2 | Form thêm/sửa Metrics (Distance, Club/Ball Speed, Direction…) | Xong (trừ Direction) | F5 · `app/metrics/manual.tsx`, `lib/validation.ts` (`swingRaw`) · `F05/f05--b-04-loi-truong.light.png`, `F05/f05--b-09-sau-sua.light.png`, `F05/f05--b-11-the-luc-sau-sua.light.png`. Direction: không làm — không vừa bộ 6 trường bắt buộc của CSV/OCR/form (trường có dấu, đổi m/yd, file mẫu không có cột). |
| M5.3 | Form thêm/sửa Gậy (Tên, Loại) | Xong | F6 · `app/clubs/new.tsx` (`ClubForm`) · `F06/f06--b-02-16-loai.light.png`, `F06/f06--b-03-form-tuy-chinh.light.png`, `F06/f06--b-08-sua-xong.light.png` |
| M5.4 | Form sửa Coach Note | Xong | F8 · `app/swings/[id].tsx` · `F08/f08--b-09-dang-sua.light.png` |
| M5.5 | Popup xác nhận xoá: video, gậy, metrics, Note | Xong | F7, F6, F5, F8 · `F07/f07--b-14-xoa-swing.light.png`, `F06/f06--b-12-xoa-gay.light.png`, `F05/f05--b-19-sau-xoa.light.png`, `F08/f08--b-10-xoa-ghi-chu.light.png` |
| M5.6 | Popup hành động nhạy cảm: huỷ kết nối học viên/HLV | Xong | F4 · `app/(player)/coach.tsx`, `app/students/[id].tsx` · `F04/f04--b-29-hlv-huy-ket-noi.light.png`, `F04/f04--b-30-mat-quyen-403.light.png` |
| M6.1 | Empty states (Video, Gậy, Học viên, Metrics) | Xong | F13, F1, F2 · `F13/f13--b-04-trong-swing.light.png`, `F13/f13--b-05-trong-thong-so.light.png`, `F13/f13--b-06-trong-bo-gay.light.png`, `F02/f02--b-05-hoc-vien-trong.light.png`. Minh hoạ là icon DS (spec §4). |
| M6.2 | Loading: Skeleton, Spinner khi gửi form | Xong | F13 · `components/ListSkeleton.tsx` (`useFirstLoad`), `components/Feedback.tsx` (`SavingRow`) · `F13/f13--b-02-skeleton-swing.light.png`, `F13/f13--b-08-dang-luu.light.png` |
| M6.3 | Toasts: "Lưu thành công", "Xóa thất bại" | Xong (vị trí theo mobile) | F13, F4 · `components/Feedback.tsx` · `F13/f13--b-09-luu-that-bai.light.png`, `F13/f13--b-10-xoa-that-bai.light.png`, `F04/f04--b-05-da-gui-loi-moi.light.png`. "Góc màn hình" trên desktop: mâu thuẫn D2. |
| M6.4 | Lỗi form validation | Xong | F5, F1, F3 · `lib/validation.ts` · `F05/f05--b-04-loi-truong.light.png`, `F01/f01--b-03-loi-form.light.png`, `F03/f03--b-07-doi-mk-loi.light.png` |
| M6.5 | Popup lỗi Media/Upload | Xong | F7 · `app/swings/new.tsx`, `lib/validation.ts` (`videoFileError`) · `F07/f07--b-05-qua-dung-luong.light.png`, `F07/f07--b-06-khong-phai-video.light.png` |
| M6.6 | Lỗi mã mời: sai, hết hạn, xung đột HLV active khác | Xong một phần | F4 · `app/connect/accept.tsx` · `F04/f04--b-16-ma-sai.light.png` … `F04/f04--b-20-da-ket-noi-ma.light.png`. Dạng popup: mâu thuẫn plan Task 10 (lỗi inline). Xung đột HLV khác: mâu thuẫn D5 (nhiều HLV + 1 HLV chính). |
| M6.7 | Trang lỗi 404, 403 | Xong | F13, F9, F4 · `app/+not-found.tsx`, `components/NoAccess.tsx` · `F13/f13--b-01-404.light.png`, `F13/f13--b-13-403.light.png`, `F09/f09--b-10-403-nguoi-theo-doi.light.png` |

**Tổng:**
- 35 mục **Xong** — trong đó 5 mục có một phần không làm, có lý do (M3.1, M3.9, M5.1, M5.2, M6.3);
- 2 mục **Xong một phần** (M2.5, M6.6);
- 1 mục **Không làm** (M1.2).
