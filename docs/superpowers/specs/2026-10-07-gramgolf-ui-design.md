# GramGolf — Spec UI full (mobile-first, dữ liệu mock)

**Ngày:** 07/10/2026 · **Trạng thái:** chốt theo khuyến nghị (chủ dự án uỷ quyền "theo recommend hết, báo cáo chỉnh sửa sau")
**Nguồn:** `docs/product/handoff-2026-08-15.md` (sitemap, flow), `docs/product/tech-stack-review-2026-08-15.md`
(data model production, RLS matrix, import CSV-first, AI là thử nghiệm), DS `@gr/ds` (`packages/ds`, luật ở `CLAUDE.md`).

## 1. Mục tiêu & phạm vi

Dựng **toàn bộ màn UI** của GramGolf trên điện thoại, click-through được end-to-end bằng dữ liệu mock trong bộ nhớ,
cho cả 2 vai trò (Người chơi, HLV). Chưa backend, chưa camera/OCR/AI thật — mọi tác vụ nặng được **giả lập có trạng thái**
(đang tải, đang xử lý, lỗi, thử lại) để UI phản ánh đúng hành vi production sau này.

Ngoài phạm vi: Supabase, auth thật, upload thật, push thật, thanh toán.

## 2. Quyết định đã chốt

| # | Quyết định | Lý do |
|---|---|---|
| D1 | Tên sản phẩm **GramGolf**; app Expo ở `apps/golf` (giữ đường dẫn để gallery/Storybook DS không gãy), `app.json` name `GramGolf`, slug `gramgolf`, scheme `gramgolf` | Logo chủ dự án gửi 07/10 |
| D2 | **Mobile-first, Expo SDK 57 + Expo Router**, chạy Expo Go; web qua react-native-web chỉ để chụp/kiểm tra | Chủ dự án yêu cầu mobile-first; DS sẵn có là RN. Thay Next.js của bản đánh giá stack |
| D3 | **Brand = teal `#14BE96`** (step 9 thang Brand), **navy `#0B2230`** cho chữ đậm nhất / nền tối. Đổi qua token DS (thang GR → teal), không hard-code trong app | Logo + luật DS cấm literal |
| D4 | Logo vẽ lại bằng `react-native-svg` (component `Logo`), màu lấy từ token. Là bản dựng lại từ ảnh — thay bằng SVG gốc khi có | Chưa có file vector |
| D5 | Kết nối HLV–học viên **nhiều-nhiều + 1 HLV chính**; HLV tạo **mã/link mời có hạn** → học viên nhập/accept → active. Huỷ kết nối giữ lịch sử, HLV mất quyền xem ngay | Tech review §5.6, khắc phục luồng "HLV nhập tên tạo học viên" |
| D6 | Quyền xem dữ liệu mô phỏng đúng ma trận RLS (tech review §6.2) bằng hàm thuần `canViewPrivate()`; follow **không** mở dữ liệu riêng | Ràng buộc quan trọng nhất |
| D7 | Nhập số liệu: **Nhập tay (P0) + CSV TrackMan/Foresight (P0)** + Ảnh/OCR (P1, có màn review độ tin cậy từng trường) + QR (gắn nhãn "Thử nghiệm", chỉ là luồng camera giả lập) | Tech review §5.3 |
| D8 | Phân tích swing là **"ước lượng"**: job có trạng thái `queued → processing → succeeded/failed/needs_review`, kết quả có confidence, góc quay, FPS, tip gắn mốc thời gian; HLV ghi chú theo mốc thời gian | Tech review §5.5, §8 |
| D9 | Đơn vị lưu chuẩn: mph, rpm, độ, **mét**, kg; người dùng chọn hiển thị mét/yard ở Cài đặt | Tech review §6.1 |
| D10 | State: React context + reducer thuần (`apps/golf/lib/store`), không thêm thư viện state. Logic thuần có test vitest | Ít phụ thuộc, test được |
| D11 | Biểu đồ tự vẽ bằng `react-native-svg` (TrendChart, ConcentricRings) — Recharts không chạy trên RN | D2 |
| D12 | Toàn bộ UI tiếng Việt; light + dark theo hệ thống (`ThemeProvider scheme="auto"`) | Handoff §8 dark mode |
| D13 | Có công tắc vai trò **chỉ ở bản dev** (Cài đặt → Dev) để demo nhanh; không xuất hiện trong luồng thường | Handoff header demo switcher |

## 3. Điều hướng (Expo Router)

```
app/
  _layout.tsx                 fonts + ThemeProvider + StoreProvider + Stack
  index.tsx                   chưa đăng nhập → (auth)/welcome; player → (player)/home; coach → (coach)/roster
  (auth)/  welcome · login · register (B1 chọn vai trò → B2 form) · forgot-password · verify-otp · onboarding
  (player)/  _layout = Tabs: home "Tổng quan" · metrics "Thông số" · swings "Swing" · community "Cộng đồng" · coach "HLV"
  (coach)/   _layout = Tabs: roster "Học viên" · community "Cộng đồng" · inbox "Thông báo" · me "Hồ sơ"
  metrics/  add · manual · import-csv · import-photo · scan-qr · [id]
  clubs/    index · new · [id] · [id]/edit
  swings/   new · [id]
  connect/  accept (học viên nhập mã) · invite (HLV tạo mã)
  coaches/[id]   hồ sơ HLV (công khai)
  students/[id]  chi tiết học viên (HLV xem): Tổng quan · Thông số · Swing · Bộ gậy · Thể lực
  community/compose · posts/[id] · users/[id] · people (khám phá)
  notifications · profile (hồ sơ của tôi)
  settings/ index · account · password · privacy · notifications · units · dev
  (dev)/ds/*                  gallery DS (giữ nguyên)
```

Top bar màn tab: logo/tiêu đề trái, chuông thông báo (badge số chưa đọc) + avatar → `profile` bên phải.

## 4. Danh mục màn & trạng thái bắt buộc

Mỗi màn danh sách có **empty state** (EmptyState của DS) và **loading** (skeleton) khi dữ liệu đến từ tác vụ giả lập;
mọi tác vụ giả lập có **lỗi + thử lại**.

| Nhóm | Màn | Nội dung chính |
|---|---|---|
| Auth | welcome | Logo, tagline, CTA Đăng ký / Đăng nhập |
| | login | email/SĐT + mật khẩu, quên mật khẩu, lỗi sai mật khẩu |
| | register | B1 chọn vai trò (2 thẻ); B2 form: họ tên, email, SĐT, mật khẩu (+ handicap / CLB + số năm kinh nghiệm), validate |
| | verify-otp | OtpField 6 số, gửi lại sau 60s |
| | onboarding | 3 bước: ảnh đại diện, đơn vị đo, (player) có mã mời HLV không |
| Player | home | Hero hồ sơ (tên, handicap, HLV chính, followers/following), 4 ô chỉ số swing mới nhất, xu hướng tốc độ đầu gậy 5 buổi, vòng tròn carry theo 3 gậy, ghi chú HLV mới nhất, CTA nhập số liệu |
| | metrics | Segmented Swing / Thể lực / Bộ gậy; danh sách buổi (ngày, nguồn, gậy, chỉ số chính); FAB thêm |
| | metrics/add | Bottom sheet chọn nguồn: Nhập tay · Nhập CSV · Ảnh chụp màn hình · Quét QR (Thử nghiệm) |
| | metrics/manual | Chọn loại; form số có khoảng hợp lệ + đơn vị; chọn gậy, ngày |
| | metrics/import-csv | Chọn file (mock 2 file mẫu TrackMan/Foresight) → nhận diện hãng → preview bảng + cảnh báo dòng lỗi → xác nhận gậy/ngày → lưu |
| | metrics/import-photo | Chọn hãng → khung crop hướng dẫn → đang đọc → review từng trường (trường độ tin cậy thấp được tô cảnh báo, sửa được) → lưu |
| | metrics/scan-qr | Khung camera giả lập, nhãn Thử nghiệm, kết quả "đã liên kết phiên" → về import |
| | metrics/[id] | Chi tiết 1 buổi: toàn bộ chỉ số, nguồn, raw vendor, xoá |
| | clubs | Lưới thẻ gậy theo nhóm (Gỗ, Hybrid, Sắt, Wedge, Putter); thêm |
| | clubs/new, [id]/edit | Loại (16 + Tuỳ chỉnh), hãng, model, hãng cán, flex, trọng lượng cán, loft, lie, bounce |
| | clubs/[id] | Thông số gậy, swing gần đây dùng gậy này, sửa, lưu trữ (Dialog xác nhận) |
| | swings | Danh sách swing: thumbnail, gậy, ngày, trạng thái upload/phân tích, badge có ghi chú HLV |
| | swings/new | Chọn video (mock), chọn gậy + góc quay, hướng dẫn quay (60fps, toàn thân), upload có tiến độ, tạm dừng/thử lại |
| | swings/[id] | Video (khung + VideoControlOverlay), timeline mốc address/top/impact/finish, kết quả ước lượng (tempo, plane, confidence), tips theo mốc, ghi chú HLV theo mốc, nút Phân tích / Thử lại |
| | coach (tab HLV) | HLV chính + HLV khác, trạng thái kết nối, nhập mã mời, huỷ kết nối, giải thích quyền xem dữ liệu |
| Coach | roster | Hero HLV (rating, học viên, followers), tìm kiếm, lọc (Tất cả / Cần phản hồi / Chờ chấp nhận), danh sách học viên, CTA mời |
| | connect/invite | Tạo mã 6 ký tự + link, hạn 7 ngày, chia sẻ (ShareSheet), danh sách lời mời đang chờ, thu hồi |
| | students/[id] | TabBar 5 tab như §3; tab Swing → swings/[id] với composer ghi chú theo mốc |
| | inbox | = notifications cho HLV |
| | me | Hồ sơ HLV: CLB, kinh nghiệm, đơn giá, rating, bài đã đăng, sửa hồ sơ |
| Chung | community | TabBar Bảng tin / Khám phá; feed = bài người đang follow + của mình; PostCard (avatar, tên, badge HLV, tag, like, comment); FAB đăng bài |
| | community/compose | Tiêu đề, nội dung, tag (Chip), đính kèm swing/ảnh (mock) |
| | posts/[id] | Bài đầy đủ + CommentThread + CommentComposer, LikesSheet |
| | people | Tìm kiếm + danh sách người dùng, nút Theo dõi/Đang theo dõi |
| | users/[id] | Hồ sơ công khai: followers/following, bài đăng; menu Chặn / Báo cáo |
| | notifications | Nhóm Hôm nay / Trước đó; loại: ghi chú HLV, follow, like, comment, lời mời, phân tích xong; đánh dấu đã đọc |
| | profile | Hồ sơ của tôi + vào Cài đặt, Đăng xuất |
| | settings/* | Tài khoản, đổi mật khẩu, quyền riêng tư (công khai bộ gậy, công khai swing), thông báo theo loại + giờ yên lặng, đơn vị, giao diện, Dev (đổi vai trò, reset dữ liệu mock) |

## 5. Mô hình dữ liệu UI (rút từ tech review §6, dạng client)

Định nghĩa đầy đủ ở `apps/golf/lib/domain.ts` (plan Task 2). Nguyên tắc: id string, thời gian ISO UTC, đơn vị chuẩn D9,
`likedByMe`/đếm follower là **selector**, không lưu.

## 6. Tiêu chí nghiệm thu

1. `pnpm typecheck`, `pnpm test`, `pnpm check:literals` xanh.
2. Mọi route ở §3 mở được trên web 390px không lỗi runtime; ảnh chụp sáng/tối của từng màn lưu ở `docs/screens/`.
3. Đi được hết các flow: đăng ký player → onboarding → nhập tay → nhập CSV → thêm gậy → đăng swing → phân tích → xem tip;
   đăng ký coach → tạo mã mời → (đổi vai trò dev) player nhập mã → coach thấy học viên → ghi chú swing → player nhận thông báo.
4. Follow không cho xem dữ liệu riêng (có test); huỷ kết nối làm HLV mất quyền ngay (có test).
5. Không literal màu/spacing/font trong `apps/golf/app/**` và `apps/golf/components/**`.
