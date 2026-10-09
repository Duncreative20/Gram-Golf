# Kiểm tra GramGolf theo luồng chức năng

13 luồng F1–F13, kiểm được 3 cách: trên điện thoại (Expo Go), trong **Storybook app** (màn thật, từng bước, cả trạng thái khó bấm tới), và lượt đi
tự động trên web. Mỗi luồng gồm:
- `F<nn>.md`: tài khoản, bảng bước (route · thao tác · kết quả mong đợi · ảnh), bảng "Trạng thái khác" (story biến thể), mục "Đã biết / chưa làm";
  bảng bước do `flow-web.mjs` ghi, chạy lại không đổi: route bỏ query, id sinh trong luồng ghi `<tiền tố>-<id>`, mã mời giữ `${code}`;
- `F<nn>/`: ảnh storyboard 390×844 sáng + tối, **sinh từ story** của Storybook app (`<story-id>.light.png` / `.dark.png`; ảnh của bước `nn` là
  `f<nn>--b-<nn>-<bước>.*.png`), và `steps.json` — kịch bản lượt đi tự động.

| Luồng | Nội dung | Bắt đầu với | Tài liệu |
|---|---|---|---|
| F1 Người chơi mới | chào → đăng ký → OTP → onboarding → Tổng quan trống → số liệu đầu tiên → Tổng quan có dữ liệu | (đăng xuất) | [F01.md](F01.md) |
| F2 HLV mới | đăng ký HLV → OTP → onboarding + giới thiệu nghề nghiệp → Học viên trống → mã mời | (đăng xuất) | [F02.md](F02.md) |
| F3 Tài khoản | đăng nhập sai/đúng → quên mật khẩu → link → đặt lại → đăng nhập lại; đổi mật khẩu; đăng xuất | (đăng xuất) | [F03.md](F03.md) |
| F4 Kết nối HLV–học viên | mã mời (tạo/chia sẻ/thu hồi/5 lỗi) → học viên nhập mã → HLV nhận thông báo + thấy trong roster; lời mời 2 chiều, HLV chính/phụ, huỷ kết nối 2 phía → 403 | HLV Đỗ Minh Tuấn | [F04.md](F04.md) |
| F5 Số liệu | nhập tay / CSV / ảnh (lỗi + thử lại) / QR → lịch sử Swing / Thể lực → chi tiết → sửa → xoá → Tổng quan; m ↔ yd | Nguyễn Minh Anh | [F05.md](F05.md) |
| F6 Bộ gậy | thêm (16 loại + tuỳ chỉnh) → sửa → lưu trữ / khôi phục → xoá; gậy mới trong chọn gậy của số liệu và đăng swing | Nguyễn Minh Anh | [F06.md](F06.md) |
| F7 Swing của người chơi | hướng dẫn → video + gậy + góc + ngày → popup file lỗi → tải (tạm dừng, lỗi mạng) → phân tích → lưới/lọc/sắp xếp → xoá | Nguyễn Minh Anh | [F07.md](F07.md) |
| F8 HLV review swing | thông báo swing mới → Cần phản hồi → học viên → swing Chưa review → workspace (chèn mốc, viết/sửa/xoá ghi chú) → học viên đọc, tua → Đã review | Nguyễn Minh Anh → HLV Tuấn | [F08.md](F08.md) |
| F9 HLV xem học viên | roster (tìm, lọc) → chi tiết 5 tab chỉ đọc → 403 / 404 | HLV Đỗ Minh Tuấn | [F09.md](F09.md) |
| F10 Cộng đồng | bảng tin → thích / bỏ thích → bình luận → ai đã thích → đăng bài → khám phá → chặn / báo cáo | Nguyễn Minh Anh | [F10.md](F10.md) |
| F11 Thông báo | mỗi loại → đúng màn → đã đọc; đánh dấu tất cả; số trên chuông | Nguyễn Minh Anh | [F11.md](F11.md) |
| F12 Hồ sơ & cài đặt | hồ sơ, tài khoản (ảnh, tên, handicap, bio), quyền riêng tư + bỏ chặn, thông báo, đơn vị, xoá tài khoản | Nguyễn Minh Anh | [F12.md](F12.md) |
| F13 Trạng thái | 404, skeleton, empty state, spinner khi lưu/xoá, toast lỗi + Thử lại, 403 | Nguyễn Minh Anh (404) / Phạm Quốc Huy / Lê Đăng Khoa | [F13.md](F13.md) |

## Kiểm trên điện thoại (Expo Go)
1. Máy tính, lần đầu: `pnpm install`. Chạy `pnpm -F golf start` rồi quét QR bằng Expo Go; điện thoại và máy tính cùng Wi-Fi. Không thấy máy thì
   chạy `pnpm -F golf start --tunnel`.
2. Trong app, mở **Kiểm tra theo luồng** bằng một trong hai đường:
   - Chạm avatar góc phải (Hồ sơ của tôi) → Cài đặt → Dev;
   - màn chào → "Dùng tài khoản mẫu" (khi chưa đăng nhập).
3. Chạm luồng cần kiểm. App sẽ đặt lại dữ liệu mẫu, đăng nhập đúng tài khoản và mở đúng màn của bước 1 trong `F<nn>.md`.
4. Làm theo bảng "Các bước" trong `F<nn>.md`, so với ảnh. Bước đổi tài khoản: Hồ sơ → Cài đặt → Dev → chạm tên. Dữ liệu vừa tạo trong phiên
   được giữ.
5. Màn Dev chỉ có ở bản phát triển. Tải lại app (reload) là dữ liệu mẫu nạp lại từ đầu.
6. Chỉ kiểm được trên máy thật (lượt đi web không thay được): bàn phím không che ô / nút ở form có footer cố định (Nhập tay, Thêm gậy, Tài khoản,
   Mật khẩu, Đăng ký — iOS và Android); đổi tài khoản / đăng xuất / xoá tài khoản không để màn cũ dưới stack (vuốt lui); xoá phiên / swing / gậy /
   bài: màn đang rời không nháy "Không tìm thấy…".

## Kiểm trong Storybook app (màn thật theo luồng)
1. Từ gốc repo: `pnpm storybook:app --no-open` → mở http://localhost:6007 (cổng 6006 là Storybook của design system — khác). Tắt:
   `lsof -ti tcp:6007 | xargs kill`.
2. Sidebar **Luồng** → `Luồng/F<nn> · <tên luồng>`. Story `nn · <bước>` = bước `nn` trong bảng của `F<nn>.md`; story `nna · …`, `nnb · …` = trạng
   thái khác của bước đó (lỗi, rỗng, đang tải, 403, 404…). Toolbar: Theme sáng/tối, Viewport (Mobile 390 mặc định).
3. Mỗi story là một màn đã dựng sẵn dữ liệu của bước (đăng nhập đúng tài khoản, các thao tác trước đã làm). Bấm điều hướng trong story **không**
   đổi màn — chỉ ghi vào panel Actions; đi xuyên màn thì dùng Expo Go hoặc lượt đi tự động.
4. Sinh lại storyboard của một luồng sau khi sửa màn (Storybook app đang chạy):
   `SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/shot-storybook.mjs docs/flows/F04 '^f04--' 390 844`
   rồi chạy lượt đi của luồng (mục dưới) để bảng `F04.md` trỏ đúng ảnh.
5. Cách viết story, bảng "Phủ route" (route → story id): `storybook-app/README.md`.

## Kiểm trên web (lượt đi tự động)
Lượt đi bấm như người dùng trên web 390×844, đổi tài khoản qua Cài đặt › Dev trong cùng phiên — chứng minh bàn giao giữa màn và giữa hai vai trò
(điều story không làm được). Ảnh storyboard thì lấy từ story.
1. Chạy nền `pnpm -F golf exec expo start --web --port 8081` và `pnpm storybook:app --no-open`.
2. Một luồng: `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F04/steps.json`. Kết quả
   `PASS F04: … bước, … bước chụp, … story biến thể`; bảng bước trong `F04.md` được ghi lại. Script cũng FAIL nếu bước chụp nào chưa có story / ảnh.
3. Cả 13 luồng: `for f in docs/flows/F*/steps.json; do node scripts/flow-web.mjs "$f" || break; done`.
4. Lỗi thì script in bước hỏng và đường dẫn ảnh chụp lúc lỗi (thư mục tạm của máy); ảnh điểm kiểm của lượt đi ở `$TMPDIR/flow-F<nn>/`.
5. Mở tay một màn: thêm `?as=<id>` để đăng nhập nhanh (chỉ bản dev), vd `http://localhost:8081/(player)/home?as=p-minh`.

## Tài khoản mẫu
| id | Tên | Vai trò | Dùng để kiểm |
|---|---|---|---|
| p-minh | Nguyễn Minh Anh | Người chơi | đủ dữ liệu (12 phiên, 8 gậy, 3 swing); HLV chính Tuấn + HLV phụ Hà |
| p-lan | Trần Thu Lan | Người chơi | HLV Tuấn; swing chưa có ghi chú → "Cần phản hồi"; kết nối cũ với Hà đã huỷ |
| p-khoa | Lê Đăng Khoa | Người chơi | HLV chính Hà; theo dõi Minh Anh (theo dõi ≠ quyền xem → 403) |
| p-huy | Phạm Quốc Huy | Người chơi | chưa có dữ liệu (empty state); đang chờ HLV Hà duyệt yêu cầu kết nối |
| c-tuan | HLV Đỗ Minh Tuấn | HLV | 2 học viên; mã mời TUAN24 |
| c-ha | HLV Vũ Thanh Hà | HLV | 2 học viên; 1 yêu cầu kết nối chờ duyệt (Huy) |

## Mã và link thử
- OTP: `123456`. Mã mời: `TUAN24` (còn hạn), `HAEXP1` (hết hạn), `USED01` (đã dùng).
- Đăng nhập: email hoặc SĐT của tài khoản mẫu, mật khẩu bất kỳ ≥ 6 ký tự (auth mock).
- Link đặt lại mật khẩu: nút "Mở link (thử)" sau khi gửi, hoặc `gramgolf://reset-password?token=GG-RESET-OK`. `GG-RESET-EXPIRED` là link hết hạn.
- Video mẫu lỗi:
  - `swing_4k_120fps_dai.mov`: quá dung lượng;
  - `anh_tu_the_chuan_bi.jpg`: không phải video;
  - `wedge_mang_yeu.mp4`: mất mạng ở 60 %;
  - `driver_nguoc_sang.mp4`: cần xem lại;
  - `pw_may_chu_ban.mp4`: phân tích lỗi ở 50 % (máy chủ bận), Thử lại chạy tiếp.
- Giả lập lỗi khi lưu/xoá: Cài đặt › Dev › công tắc "Giả lập lỗi khi lưu/xoá".

## Phạm vi
- Mobile-first 390×844 (spec D2), không có giao diện web/desktop.
- Đối chiếu từng mục MVP issue #1: [../product/mvp-checklist.md](../product/mvp-checklist.md).
