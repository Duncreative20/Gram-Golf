# GramGolf

App di động cho **người chơi golf** và **huấn luyện viên (HLV)**: lưu thông số swing / thể lực (nhập tay, CSV TrackMan /
Foresight, ảnh chụp màn hình, QR thử nghiệm), quản lý bộ gậy, đăng video swing để phân tích ước lượng, kết nối HLV – học viên
bằng mã mời, HLV ghi chú theo mốc thời gian trên swing, và cộng đồng (bảng tin, theo dõi, thích, bình luận).

Bản hiện tại là **UI đầy đủ chạy bằng dữ liệu mock trong bộ nhớ** — chưa backend, chưa auth / upload / OCR / AI thật. Mọi tác vụ
nặng được giả lập có trạng thái (đang tải, đang xử lý, lỗi, thử lại). Mở lại app = dữ liệu mẫu ban đầu.

## Cấu trúc repo

```
apps/golf/             app Expo SDK 57 + Expo Router (mobile-first, chạy Expo Go; web chỉ để chụp / kiểm tra)
  app/                 màn theo route (auth, tab người chơi, tab HLV, metrics, clubs, swings, connect, cộng đồng, cài đặt)
  components/          mảnh UI dùng ở ≥ 2 màn (header, biểu đồ SVG, form chỉ số, PostItem…)
  lib/                 logic thuần + test vitest: domain, mock (NOW + seed), reducer, selectors (quyền xem canViewPrivate),
                       validation, csv, simulate (tải lên / phân tích / OCR giả lập), format
  app/(dev)/ds/*       gallery design system
packages/ds/           design system @gr/ds (token theo tên Figma, component, Storybook)
docs/superpowers/      spec + plan
docs/screens/          ảnh nghiệm thu từng màn (sáng / tối)
docs/ds/               tài liệu design system (API cheatsheet, nợ Figma…)
scripts/               chụp web / Storybook bằng Chrome headless (CDP)
```

## Chạy

```sh
pnpm install
pnpm -F golf start            # quét QR bằng Expo Go (cùng Wi-Fi; không thấy thì thêm --tunnel)
pnpm -F golf exec expo start --web --port 8081   # bản web để xem nhanh / chụp ảnh
pnpm -F @gr/ds storybook      # Storybook design system — http://localhost:6006
```

## Tài khoản mẫu

Đăng nhập bằng email dưới đây, **mật khẩu bất kỳ từ 6 ký tự** (mock). Đăng ký mới: mã OTP là `123456`.

| Vai trò | Tên | Email | Ghi chú |
|---|---|---|---|
| Người chơi | Nguyễn Minh Anh (`p-minh`) | minhanh@gramgolf.vn | đủ dữ liệu: phiên, gậy, swing, ghi chú HLV |
| Người chơi | Trần Thu Lan (`p-lan`) | thulan@gramgolf.vn | swing chờ HLV phản hồi |
| Người chơi | Lê Đăng Khoa (`p-khoa`) | dangkhoa@gramgolf.vn | có bài cộng đồng |
| Người chơi | Phạm Quốc Huy (`p-huy`) | quochuy@gramgolf.vn | tài khoản mới, chưa có HLV |
| HLV | HLV Đỗ Minh Tuấn (`c-tuan`) | tuan.coach@gramgolf.vn | học viên: Minh Anh, Thu Lan |
| HLV | HLV Vũ Thanh Hà (`c-ha`) | ha.coach@gramgolf.vn | HLV chính của Đăng Khoa, HLV phụ của Minh Anh |

Mã mời mẫu: `TUAN24` (còn hạn), `HAEXP1` (hết hạn), `USED01` (đã dùng).

Bản dev có lối tắt: nút **Dùng tài khoản mẫu** ở màn chào / **Cài đặt → Dev** (đổi tài khoản, đặt lại dữ liệu), và thêm
`?as=<id>` vào URL bất kỳ trên web (ví dụ `/(player)/home?as=p-minh`, `/(coach)/roster?as=c-tuan`) để đăng nhập thẳng.

Mẫu giả lập lỗi để thử nhánh lỗi + thử lại: video `wedge_mang_yeu.mp4` (tải lên lỗi ở 60 %), `pw_may_chu_ban.mp4` (phân tích
lỗi lần đầu), `driver_nguoc_sang.mp4` (cần xem lại); ảnh `chup_nghieng_bi_loa.jpg` (OCR không đọc được); file
`Ghi_chep_tu_nhap.csv` (không nhận diện được); Quét QR → "Mô phỏng mã không đọc được".

## Lệnh kiểm

```sh
pnpm typecheck        # tsc cả DS và app
pnpm test             # vitest: DS + lib của app
pnpm check:literals   # cấm hex / fontSize / padding / margin / gap bằng số trong app và DS
```

## Tài liệu

- Spec: [docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md](docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md)
- Plan: [docs/superpowers/plans/2026-10-07-gramgolf-ui.md](docs/superpowers/plans/2026-10-07-gramgolf-ui.md)
- Ảnh từng màn: [docs/screens/README.md](docs/screens/README.md)
- Luật cho agent / design system: [CLAUDE.md](CLAUDE.md), [docs/ds/API-CHEATSHEET.md](docs/ds/API-CHEATSHEET.md)
