# Storybook màn app GramGolf

Storybook thứ hai (cạnh Storybook `@gr/ds` cổng 6006): vẽ **màn thật** của `apps/golf/app/**` theo **luồng chức năng** F01–F13, mỗi bước = một story, để chủ dự án duyệt từng màn / trạng thái.

## Chạy

Từ gốc repo:

```sh
pnpm storybook:app --no-open          # cổng 6007; chủ dự án chạy Storybook DS ở 6006, không trùng
lsof -ti tcp:6007 | xargs kill        # tắt — KHÔNG dùng pkill -f storybook (giết luôn Storybook DS 6006)
```

Mở http://localhost:6007 · danh mục story: http://localhost:6007/index.json. Toolbar Theme (sáng/tối), Emphasis, Viewport (390 mặc định) dùng chung preview của DS.

| File | Vai trò |
| --- | --- |
| `.storybook/main.ts` | framework react-native-web-vite; alias `@gr/ds` → `packages/ds/src`, `expo-router` → stub; `__DEV__ = true`; cache Vite ở `storybook-app/node_modules/.vite` |
| `.storybook/preview.tsx` | dùng lại preview DS + `layout: 'fullscreen'` + sắp xếp `Luồng/F01…F13`, bước theo số |
| `.storybook/shot.css` | chỉ khi chụp (viewport ≥ 1500 px cao): màn cao theo nội dung, tối thiểu 844; đang mở dialog / sheet → ảnh đúng khung 390×844 có Modal |
| `stubs/expo-router.tsx` | `router.*` ghi vào panel **Actions** (không đổi màn, không throw), `canGoBack() → true`; `<Redirect>` hiện “↪ Chuyển hướng tới …”; params từ `appStory({ params })` |
| `lib/appStory.tsx` | helper duy nhất cho story (dưới) |
| `flows/FNN-*.stories.tsx` | story theo luồng |
| `issues/*.md` | ghi chép của từng nhóm viết story (A–E) + `verify.md` (rà soát cuối); tổng hợp ở cuối README |

## Viết một story luồng

```tsx
/**
 * F07 · Swing của người chơi
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01 · Danh sách swing          (player)/swings   as p-minh, tab swings
 *  ✓ 02 · Danh sách rỗng           (player)/swings   as p-huy
 *    03 · …
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Swing dạng lưới / lọc — Phase 2.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { userEvent } from 'storybook/test';
import Swings from '../../apps/golf/app/(player)/swings';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F07 · Swing của người chơi', id: 'f07' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const DanhSach: Story = {
  name: '01 · Danh sách swing',
  render: () => <Swings />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'swings' } }),
};

export const ChiTietDaXoa: Story = {
  name: '05a · Chi tiết — swing đã bị xoá',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'sw-minh-1' }, setup: [{ type: 'deleteSwing', id: 'sw-minh-1' }] }),
};

// Trạng thái cần thao tác (gõ, bấm, mở dialog / sheet) → play với userEvent; tìm phần tử bằng find* (màn vẽ sau khi seed).
export const XoaDialog: Story = {
  name: '06 · Dialog xoá swing',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'sw-minh-1' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Xoá swing'));
  },
};
```

`appStory(options)` → `{ decorators, parameters }` (spread vào story):

| Option | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `as` | `ID` | đăng nhập người dùng mẫu (`apps/golf/lib/mock.ts`): `p-minh` (có dữ liệu, HLV chính `c-tuan` + HLV phụ `c-ha`), `p-lan`, `p-khoa`, `p-huy` (chưa có HLV), `c-tuan`, `c-ha`. Bỏ trống = chưa đăng nhập |
| `params` | `Record<string, string>` | params route cho `useLocalSearchParams` / `useGlobalSearchParams` (vd `{ id: 'sw-minh-1' }`) |
| `setup` | `Action[]` hoặc `(dispatch, state) => void \| Action[]` | action của `apps/golf/lib/reducer.ts` chạy **một lần** sau `signIn`, trước khi vẽ màn. Id / thời điểm dùng chuỗi cố định (`NOW` của `mock.ts`) để ảnh ổn định |
| `tabs` | `{ role: 'player' \| 'coach', active }` | màn trong nhóm tab → vẽ `AppTabBar` thật dưới màn; `active` = tên route tab (`home`, `metrics`, `swings`, `community`, `coach` / `roster`, `community`, `inbox`, `me`). Bấm tab ghi `tab.navigate` vào Actions |
| `hold` | `(keyof typeof DELAYS)[]` | giữ trạng thái tạm thời để chụp: 'firstLoad' (skeleton), 'toast', 'ocr' ("Đang đọc…"); Task 29 thêm 'save' (spinner), 'toastError'. Story khác luôn về độ trễ mặc định |

`typeIn(el, value)` (cùng file): gõ vào ô nhập trong `play`.

Store mới tinh mỗi story (`seedState()`), không rò trạng thái giữa các story.

## Quy tắc đặt tên

- File `flows/FNN-<slug-không-dấu>.stories.tsx`, một file một luồng.
- Meta: `title: 'Luồng/FNN · <Tên luồng>'`, `id: 'fNN'` → story id gọn `fNN--<tên-export>` (dùng cho lọc chụp và bảng Phủ route).
- Export: PascalCase không dấu (`HocVienNhapMa`). `name`: `'NN · <Bước>'` hai chữ số; trạng thái phụ của cùng bước `'NNa · …'`, `'NNb · …'` (sắp theo số: 05 < 05a < 06 < 10).
- Story của bước `shot` `"<nn>-<slug>"` trong `docs/flows/Fxx/steps.json`: export `B<nn><SlugPascal>` (hai cụm số liền nhau nối bằng `_`), id `fxx--b-<nn>-<slug>`; biến thể `'<nn><a|b…> · …'` không đặt export bắt đầu bằng `B` + số.
- Chữ hiển thị, tiêu đề, chú thích: tiếng Việt có dấu. Wrapper trong story không viết literal màu / cỡ chữ / khoảng cách — dùng `useTheme()` như app.
- Đầu file: comment mẫu (các bước + “Chưa có”) như `flows/F04-ket-noi-hlv.stories.tsx`.
- Route chưa tồn tại → **không dựng UI giả**: ghi vào “Chưa có” ở đầu file và mục “Chưa có (Phase 2)” dưới. Route có nhưng màn còn “Đang dựng” → vẫn viết story theo route (tự cập nhật khi màn xong).
- Màn app có lỗi làm hỏng / xấu story → **không sửa màn**: ghi `file:line`, hiện tượng, story id vào `issues/<nhóm>.md` + mục “Lỗi màn hình đã thấy” dưới.
- F13 (trạng thái xuyên suốt) chỉ gom những trạng thái chưa có ở luồng khác; trùng thì ghi link story id trong comment, không nhân bản.

## Chụp ảnh

Storybook 6007 đang chạy, từ gốc repo (`<outDir>` phải nằm trong `storybook-app/__shots__/`; regex lọc theo story id):

```sh
SB_URL=http://localhost:6007 CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node scripts/shot-storybook.mjs storybook-app/__shots__/f04 '^f04--' 390 844
```

Ra `<outDir>/<story-id>.<light|dark>.png`, khung cố định 390×844 (tham số cuối) — Dialog / sheet nằm trong khung. Bỏ tham số cuối thì ảnh cao theo nội dung (tối thiểu 844, `shot.css`). Story treo quá 60 s → script khởi động lại Chrome, thử lại 1 lần (dòng `TIMEOUT`); lỗi trang (exception, `console.error`) in sau dấu `|`. Storyboard của luồng chụp thẳng vào `docs/flows/Fxx/` (xem `docs/flows/README.md`).

## Luồng

| Mã | Luồng | Các bước |
| --- | --- | --- |
| F01 | Người chơi mới | welcome → đăng ký (Người chơi; lỗi bỏ trống, email / SĐT đã có) → OTP (sai mã, thiếu thông tin) → onboarding (ảnh mẫu / chữ tắt, đơn vị đo, mã mời → Để sau) → Tổng quan trống → nhập tay: chưa có gậy → “Thêm gậy mới” → về form đã chọn sẵn gậy vừa thêm → lưu → Tổng quan có dữ liệu (1 buổi: chữ thay biểu đồ, 1 gậy: chỉ chú giải). Storyboard: `docs/flows/F01.md` |
| F02 | HLV mới | welcome → đăng ký (HLV) → OTP → onboarding → Học viên trống → tạo mã mời |
| F03 | Tài khoản | đăng nhập (đúng/sai), quên mật khẩu, đổi mật khẩu, đăng xuất (hồ sơ) |
| F04 | Kết nối HLV–học viên | HLV tạo/chia sẻ/thu hồi mã, mời học viên cụ thể → học viên Chấp nhận / Từ chối ở tab HLV; học viên gửi yêu cầu từ hồ sơ HLV → HLV Duyệt / Từ chối ở Học viên › Lời mời; nhập mã (lỗi: sai/hết hạn/đã dùng/đã thu hồi/đã kết nối) → xem trước HLV chính/phụ → chấp nhận; đặt làm HLV chính; học viên / HLV huỷ kết nối → 403 ngay. Storyboard: `docs/flows/F04.md` |
| F05 | Số liệu | Tổng quan → Thông số (lịch sử Swing / Thể lực, rỗng) → chọn nguồn → nhập tay (bắt buộc, ngoài khoảng, đã lưu; thể lực; theo yard) → chi tiết phiên → sửa phiên (lỗi “Không phải số”, theo yard, thể lực) → dòng “Đã sửa” / CSV (chọn file, xem trước có dòng lỗi, xác nhận gậy + ngày, thiếu gậy, file lạ, đã nhập) / ảnh OCR (chọn hãng, đang đọc, không đọc được → chọn ảnh khác, review trường độ tin cậy thấp) / QR → đơn vị Yard → xoá phiên → Tổng quan sau. Storyboard: `docs/flows/F05.md` |
| F06 | Bộ gậy | tab Thông số › Bộ gậy → thêm (16 loại, tuỳ chỉnh, lỗi validate, wedge bounce) → gậy mới có ở chọn gậy (nhập tay, đăng swing); “Thêm gậy mới” từ chọn gậy → về form đã chọn sẵn gậy vừa thêm → sửa → lưu trữ → dòng “Gậy đã lưu trữ” → Bộ gậy › Đang dùng / Lưu trữ → khôi phục (toast) → xoá gậy chưa gắn phiên/swing (dialog); gậy đã gắn chỉ lưu trữ; HLV xem chỉ đọc; không quyền → 403. Storyboard: `docs/flows/F06.md` |
| F07 | Swing của người chơi | Danh sách / Lưới, lọc 7 / 30 ngày, Mới nhất ⇄ Cũ nhất trước (các trạng thái, rỗng) → đăng swing (hướng dẫn, popup file quá dung lượng / không phải video, chọn video/gậy/ngày/góc, đang tải, tạm dừng, lỗi tải + thử lại) → chi tiết (đang phân tích, đã phân tích + tip theo mốc, mục Gậy có thông số → chi tiết gậy, cần xem lại, lỗi) → dialog xoá. Storyboard: `docs/flows/F07.md` |
| F08 | HLV review swing | học viên đăng swing → HLV nhận thông báo “vừa tải lên swing mới” → roster “Cần phản hồi” → chi tiết học viên tab Swing (Chưa review / Đã review) → workspace (Chèn mốc, gửi, sửa / xoá ghi chú của mình) → HLV phụ thấy ghi chú nhưng không sửa / xoá; HLV đã huỷ kết nối → 403 → học viên nhận thông báo, bấm chip “Tua tới …”. Storyboard: `docs/flows/F08.md` |
| F09 | HLV xem học viên | roster (tìm không dấu, lọc Tất cả/Cần phản hồi/Lời mời, rỗng) → chi tiết học viên 5 tab chỉ đọc (Tổng quan, Thông số → phiên không Sửa / Xoá, Swing Chưa review / Đã review, Bộ gậy → gậy không Sửa / Lưu trữ / Xoá, Thể lực) → mở thẳng link: người theo dõi / HLV đã huỷ → 403 (cả chi tiết swing), học viên không tồn tại → 404. Storyboard: `docs/flows/F09.md` |
| F10 | Cộng đồng | bảng tin / khám phá (theo dõi) → đăng bài (lỗi + hợp lệ) → chi tiết bài + bình luận → hồ sơ người dùng → chặn/báo cáo → danh sách người theo dõi |
| F11 | Thông báo | danh sách (mới/trước đó), rỗng |
| F12 | Hồ sơ & cài đặt | hồ sơ người chơi / HLV, cài đặt, tài khoản, mật khẩu, quyền riêng tư, thông báo, đơn vị, dev |
| F13 | Trạng thái xuyên suốt | các màn rỗng / lỗi / 403 tiêu biểu (link story ở luồng khác nếu trùng) |

Ngoài các bước: thêm story cho trạng thái khó bấm tới (rỗng / đang tải / lỗi / 403 `NoAccess` / lỗi validate).

## Phủ route

Route `apps/golf/app/**` (bỏ `_layout`, `(dev)/**`): **45/45 route có story** (297 story; chỉ `f13--muc-luc` không gắn route — trang mục lục). Rà lần cuối 2026-10-08: id nào trong bảng cũng có trong `index.json`, thêm story mới thì thêm id vào đây.

| Route | Story id | Ghi chú |
| --- | --- | --- |
| `index` | `f03--vao-app-nguoi-choi`, `f03--vao-app-hlv`, `f03--da-dang-xuat` | Chỉ chuyển hướng theo vai / chưa đăng nhập (story vẽ “↪ Chuyển hướng tới …”); lượt F01 bắt đầu ở `/` chưa đăng nhập → welcome (`f01--b-01-chao`) |
| `(auth)/welcome` | `f01--b-01-chao`, `f02--man-chao` |  |
| `(auth)/register` | `f01--b-02-chon-vai-tro`, `f01--b-03-loi-form`, `f01--dang-ky-thong-tin`, `f01--dang-ky-trung-tai-khoan`, `f02--dang-ky-chon-vai`, `f02--dang-ky-thong-tin`, `f02--dang-ky-loi` |  |
| `(auth)/verify-otp` | `f01--b-04-otp`, `f01--xac-minh-otp-sai`, `f01--xac-minh-otp-thieu-thong-tin`, `f02--xac-minh-otp` | Đếm ngược “Gửi lại mã sau 59 s” chạy theo giây |
| `(auth)/onboarding` | `f01--b-05-anh-dai-dien`, `f01--onboarding-don-vi`, `f01--b-06-ma-moi`, `f02--onboarding-anh`, `f02--onboarding-moi-hoc-vien` |  |
| `(auth)/login` | `f03--dang-nhap`, `f03--dang-nhap-bo-trong`, `f03--dang-nhap-sai` |  |
| `(auth)/forgot-password` | `f03--quen-mat-khau`, `f03--quen-mat-khau-email-sai`, `f03--quen-mat-khau-da-gui` |  |
| `(player)/home` | `f01--b-07-tong-quan-trong`, `f01--b-10-tong-quan-co-du-lieu`, `f05--b-01-tong-quan-truoc`, `f05--b-20-tong-quan-sau`, `f13--chua-dang-nhap`, `f13--dang-tai-tong-quan` | `f13--chua-dang-nhap` = guard chưa đăng nhập; `f13--dang-tai-tong-quan` = skeleton (`hold: ['firstLoad']`) |
| `(player)/metrics` | `f05--b-02-lich-su`, `f05--b-06-da-luu`, `f05--b-10-the-luc`, `f05--b-18-yard-lich-su`, `f05--b-19-sau-xoa`, `f05--danh-sach-rong`, `f06--b-01-bo-gay`, `f06--b-04-them-xong`, `f06--b-09-sau-luu-tru` | `f06--b-09-sau-luu-tru` = dòng “Gậy đã lưu trữ” trên lưới |
| `(player)/swings` | `f07--b-01-danh-sach`, `f07--b-02-luoi`, `f07--b-03-loc-sap-xep`, `f07--b-15-sau-xoa`, `f07--danh-sach`, `f07--danh-sach-rong`, `f07--loc-7-ngay-rong` | Danh sách / Lưới, lọc 7 / 30 ngày, sắp xếp theo ngày quay |
| `(player)/community` | `f10--bang-tin`, `f10--bang-tin-rong`, `f10--kham-pha`, `f10--kham-pha-tim`, `f10--kham-pha-khong-thay`, `f10--bang-tin-sau-khi-chan` |  |
| `(player)/coach` | `f04--b-07-tab-hlv-loi-moi`, `f04--b-08-da-ket-noi`, `f04--b-15-doi-hlv-chinh`, `f04--b-23-hai-hlv`, `f04--b-26-hoc-vien-huy`, `f04--tab-hlv-chua-ket-noi`, `f04--tu-choi-loi-moi`, `f04--tab-hlv`, `f04--huy-ket-noi-dialog`, `f04--da-huy-hlv-chinh` |  |
| `(coach)/roster` | `f04--b-01-roster`, `f04--b-02-loi-moi`, `f04--b-13-hlv-duyet`, `f04--b-14-roster-co-khoa`, `f04--b-21-ha-yeu-cau-mau`, `f04--b-25-ha-roster-co-huy`, `f04--b-27-ha-roster-mat-huy`, `f04--b-31-roster-sau-huy`, `f04--loi-moi-da-gui`, `f04--loi-moi-trong`, `f02--hoc-vien-trong`, `f02--hoc-vien-trong-loi-moi`, `f02--hoc-vien-loi-moi-dang-cho`, `f09--danh-sach`, `f09--b-01-tim`, `f09--tim-khong-thay`, `f09--b-02-can-phan-hoi`, `f09--can-phan-hoi-rong`, `f09--loi-moi`, `f09--loi-moi-rong`, `f09--chua-co-hoc-vien`, `f08--b-04-can-phan-hoi` | Tab HLV; F02 (HLV mới), F08 (Cần phản hồi), F09 (tìm, lọc) |
| `(coach)/community` | `f10--bang-tin-hlv` |  |
| `(coach)/inbox` | `f04--b-09-hlv-nhan-thong-bao`, `f04--b-24-ha-nhan-thong-bao`, `f08--b-03-thong-bao-swing-moi`, `f11--tab-hlv`, `f11--tab-hlv-rong` |  |
| `(coach)/me` | `f12--ho-so-hlv-tab` |  |
| `connect/invite` | `f04--b-03-tao-ma`, `f04--b-04-tim-hoc-vien`, `f04--b-05-da-gui-loi-moi`, `f04--hlv-chia-se-ma`, `f04--hlv-chua-co-loi-moi`, `f04--hlv-thu-hoi-dialog`, `f04--tim-khong-co`, `f02--moi-chua-co-ma`, `f02--moi-da-tao-ma`, `f13--nguoi-choi-mo-man-hlv` | `f13--nguoi-choi-mo-man-hlv` = guard vai; ShareSheet chỉ giả lập gửi |
| `connect/accept` | `f04--b-16-ma-sai`, `f04--b-17-ma-het-han`, `f04--b-18-ma-da-dung`, `f04--b-19-ma-thu-hoi`, `f04--b-20-da-ket-noi-ma`, `f04--b-22-xem-truoc-hlv-phu`, `f04--nhap-ma-de-trong`, `f04--xem-truoc-hlv-chinh`, `f04--chap-nhan-ket-noi` |  |
| `coaches/[id]` | `f04--b-11-ho-so-hlv`, `f04--b-12-da-gui-yeu-cau`, `f04--ho-so-hlv`, `f04--ho-so-hlv-dang-moi`, `f04--ho-so-hlv-khong-co`, `f10--ho-so-hlv-bi-chan` | `f10--ho-so-hlv-bi-chan` = trạng thái bị chặn |
| `metrics/add` | `f01--chon-nguon-so-lieu`, `f05--b-03-chon-nguon` | `presentation: modal` của layout không thể hiện |
| `metrics/manual` | `f01--b-08-chua-co-gay`, `f01--b-09-gay-chon-san`, `f01--nhap-tay-loi`, `f01--nhap-tay-da-luu`, `f05--b-04-loi-truong`, `f05--b-05-ngoai-khoang`, `f05--b-08-sua-loi`, `f05--nhap-tay`, `f05--nhap-tay-the-luc`, `f05--nhap-tay-yard`, `f05--nhap-tay-da-luu`, `f05--sua-phien-yard`, `f05--sua-phien-the-luc`, `f06--b-05-gay-moi-trong-picker`, `f06--b-06-chon-san-gay-moi`, `f13--toast-da-luu` | `?id=<phiên>` = sửa phiên (`f05--b-08-sua-loi`, `f05--sua-phien-*`); `f05--nhap-tay-da-luu`, `f13--toast-da-luu` = toast giữ nguyên (`hold: ['toast']`) |
| `metrics/import-csv` | `f05--b-12-csv-xem-truoc`, `f05--b-13-csv-da-nhap`, `f05--csv-chon-file`, `f05--csv-file-la`, `f05--csv-xac-nhan`, `f05--csv-thieu-gay` | Chọn file mẫu ngay trong màn (chưa mở file hệ điều hành) |
| `metrics/import-photo` | `f05--b-14-ocr-dang-doc`, `f05--b-15-ocr-loi`, `f05--b-16-ocr-kiem-tra`, `f05--anh-chon-hang` | OCR giả lập `DELAYS.ocr` 1,5 s — `hold: ['ocr']` giữ “Đang đọc…”, story khác chờ kết quả trong `play` |
| `metrics/scan-qr` | `f05--b-17-qr`, `f05--quet-qr` | Thử nghiệm: nút mô phỏng quét |
| `metrics/[id]` | `f05--b-07-chi-tiet`, `f05--b-09-sau-sua`, `f05--b-11-the-luc-sau-sua`, `f05--chi-tiet-xoa-dialog`, `f05--chi-tiet-hlv-xem`, `f05--chi-tiet-khong-quyen`, `f05--chi-tiet-khong-thay`, `f09--b-05-phien-chi-doc` | Sửa phiên / Xoá phiên chỉ chủ phiên (`f09--b-05-phien-chi-doc` = HLV xem); dòng “Đã sửa” khi phiên đã sửa |
| `clubs/index` | `f06--b-10-luu-tru`, `f06--b-13-sau-xoa`, `f06--danh-sach`, `f06--danh-sach-rong`, `f06--hlv-xem-bo-gay`, `f06--khong-quyen-bo-gay` | `?view=archived` mở thẳng mục Lưu trữ (`f06--b-10-luu-tru`, `f06--b-13-sau-xoa`) |
| `clubs/new` | `f06--b-02-16-loai`, `f06--b-03-form-tuy-chinh`, `f06--them-gay`, `f06--them-gay-loi`, `f06--them-gay-wedge` |  |
| `clubs/[id]/index` | `f06--b-08-sua-xong`, `f06--b-11-gay-luu-tru`, `f06--b-12-xoa-gay`, `f06--b-14-driver-khong-xoa`, `f06--luu-tru-dialog`, `f06--da-khoi-phuc`, `f06--hlv-xem-chi-tiet`, `f06--khong-quyen-chi-tiet`, `f06--khong-tim-thay`, `f07--b-13-gay-cua-swing`, `f09--b-08-gay-chi-doc` | Khôi phục / Xoá gậy chỉ chủ gậy; Xoá chỉ khi chưa gắn phiên/swing (`f06--b-14-driver-khong-xoa`); `f07--b-13-gay-cua-swing` = mở từ mục Gậy của swing |
| `clubs/[id]/edit` | `f06--sua-gay`, `f06--sua-gay-da-luu-tru`, `f13--sua-gay-nguoi-khac` | `f06--sua-gay-da-luu-tru`, `f13--sua-gay-nguoi-khac` = guard → chi tiết gậy |
| `swings/new` | `f06--b-07-gay-moi-o-dang-swing`, `f07--b-04-huong-dan`, `f07--b-05-qua-dung-luong`, `f07--b-06-khong-phai-video`, `f07--b-07-chon-video-gay-ngay`, `f07--b-08-tam-dung`, `f07--b-09-loi-mang`, `f07--chon-gay`, `f07--loi-chua-chon-gay`, `f07--dang-tai`, `f07--thu-lai-tai-xong`, `f08--b-01-tai-xong`, `f13--hlv-mo-man-nguoi-choi` | Mô phỏng tải lên chạy theo nhịp (`ticks`); `f13--hlv-mo-man-nguoi-choi` = guard vai |
| `swings/[id]` | `f07--b-10-dang-phan-tich`, `f07--b-11-phan-tich-xong`, `f07--b-12-tua-theo-tip`, `f07--b-14-xoa-swing`, `f07--b-16-can-xem-lai`, `f07--b-17-phan-tich-loi`, `f07--chi-tiet-tai-do`, `f07--chi-tiet-chua-phan-tich`, `f07--da-xoa`, `f08--b-02-phan-tich-xong`, `f08--b-06-workspace`, `f08--b-07-chen-moc`, `f08--b-08-da-gui`, `f08--b-09-dang-sua`, `f08--b-10-xoa-ghi-chu`, `f08--b-11-sau-xoa`, `f08--b-13-ha-xem-ghi-chu`, `f08--b-15-tua-theo-moc`, `f08--chua-co-ghi-chu`, `f08--dang-viet`, `f08--loi-trong`, `f08--khong-co-quyen`, `f09--b-12-403-swing` | F07 người chơi, F08 HLV ghi chú (Chèn mốc, sửa / xoá, Tua tới); `f09--b-12-403-swing` = người theo dõi |
| `students/[id]` | `f04--b-10-chi-tiet-hoc-vien`, `f04--b-28-ha-mat-quyen-403`, `f04--b-29-hlv-huy-ket-noi`, `f04--b-30-mat-quyen-403`, `f09--b-03-tong-quan`, `f09--tong-quan-rong`, `f09--b-04-thong-so`, `f09--b-06-swing`, `f09--swing-can-phan-hoi`, `f09--b-07-bo-gay`, `f09--b-09-the-luc`, `f09--b-11-403-da-huy`, `f09--b-10-403-nguoi-theo-doi`, `f09--b-13-404-hoc-vien`, `f08--b-05-swing-chua-review`, `f08--b-12-ha-chua-review`, `f08--b-16-da-review`, `f08--b-17-chua-review`, `f08--da-review-rong` | F08: Chưa review / Đã review của HLV; F09: 5 tab chỉ đọc, 403 (người theo dõi / đã huỷ), 404 |
| `community/compose` | `f10--dang-bai`, `f10--dang-bai-loi`, `f10--dang-bai-hop-le`, `f10--dang-bai-chon-swing`, `f10--dang-bai-da-dang` |  |
| `posts/[id]` | `f10--chi-tiet-bai`, `f10--chi-tiet-bai-cua-minh`, `f10--tra-loi-binh-luan`, `f10--da-gui-binh-luan`, `f10--ai-da-thich`, `f10--xoa-bai-dialog`, `f10--swing-dinh-kem-co-quyen`, `f10--swing-dinh-kem-rieng-tu`, `f10--bai-khong-tim-thay`, `f10--bai-nguoi-da-chan`, `f10--bao-cao-bai`, `f10--bao-cao-loi` |  |
| `users/[id]` | `f10--ho-so-nguoi-dung`, `f10--ho-so-hlv-xem-hoc-vien`, `f10--ho-so-khong-tim-thay`, `f10--chan-dialog`, `f10--da-chan`, `f10--bi-chan`, `f10--bao-cao-nguoi-dung`, `f13--ho-so-id-hlv` | `f13--ho-so-id-hlv` = id HLV → chuyển sang `coaches/[id]` |
| `people` | `f10--nguoi-theo-doi`, `f10--dang-theo-doi`, `f10--theo-doi-rong`, `f10--theo-doi-nguoi-da-chan` |  |
| `notifications` | `f04--b-06-thong-bao-loi-moi`, `f08--b-14-hoc-vien-nhan-thong-bao`, `f11--danh-sach`, `f11--da-doc-tat-ca`, `f11--rong` |  |
| `profile` | `f03--ho-so`, `f03--ho-so-dang-xuat`, `f12--ho-so-nguoi-choi`, `f12--ho-so-hlv` | Đăng xuất (dialog) ở F03 |
| `settings/index` | `f03--cai-dat`, `f12--cai-dat` |  |
| `settings/account` | `f12--tai-khoan`, `f12--tai-khoan-hlv`, `f12--tai-khoan-loi`, `f12--tai-khoan-da-luu` |  |
| `settings/password` | `f03--doi-mat-khau`, `f03--doi-mat-khau-loi`, `f03--doi-mat-khau-xong`, `f12--mat-khau` | Trạng thái lỗi / đã đổi ở F03 |
| `settings/privacy` | `f12--quyen-rieng-tu`, `f12--quyen-rieng-tu-da-chan`, `f12--xoa-tai-khoan`, `f12--xoa-tai-khoan-lan-cuoi`, `f12--quyen-rieng-tu-hlv` |  |
| `settings/notifications` | `f12--cai-dat-thong-bao`, `f12--cai-dat-thong-bao-hlv` |  |
| `settings/units` | `f12--don-vi-met`, `f12--don-vi-yard` |  |
| `settings/dev` | `f12--dev`, `f12--dev-dat-lai` | Chỉ `__DEV__`; Storybook luôn `__DEV__ = true` |

## Chưa có (Phase 2)

Bước của luồng cần màn Phase 2 — task luồng xoá dòng của mình khi story đã có. Bước ngoài Phase 2: mục "Đã biết / chưa làm" của `docs/flows/F<nn>.md`.

| Luồng | Bước chưa có màn | Task |
| --- | --- | --- |
| F02 | Onboarding HLV: bước "Giới thiệu nghề nghiệp" (bắt buộc, 20–300 ký tự) | 24 |
| F03 | Đặt lại mật khẩu từ link (hợp lệ / hết hạn / sai); "Mở link (thử)" ở quên mật khẩu; đăng nhập sau khi đặt lại | 25 |
| F11 | Thông báo `connect_request`, `swing_uploaded` | 27 |
| F12 | Đổi ảnh đại diện ở Tài khoản; Dev › "Kiểm tra theo luồng" | 28, 30 |
| F13 | 404; 403 có Quay lại; skeleton các màn danh sách; spinner khi lưu/xoá; toast thất bại + Thử lại; Dev › "Giả lập lỗi khi lưu/xoá" | 29 |

## Lỗi màn hình đã thấy

Tổng hợp `issues/A.md` … `issues/E.md` + `issues/verify.md` (chi tiết, gợi ý sửa ở đó). Không màn nào crash / trống; console chỉ có cảnh báo DS `"shadow*" style props are deprecated`. Đã chụp lại 2026-10-08. Task 15 phân loại từng lỗi về task sở hữu (bảng đầy đủ + minor của review Task 12–14: `issues/issues.md` › “Phân loại Phase 2”); task đó sửa xong thì đổi Trạng thái thành `đã sửa (Task NN)`.

| Mức | Story id | File:dòng | Hiện tượng | Task | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| vừa | `f01--b-10-tong-quan-co-du-lieu` | `apps/golf/app/(player)/home.tsx:187-190` + `apps/golf/components/charts/ConcentricRings.tsx:19` | Một gậy → “Carry theo gậy” vẽ một đĩa đặc to, không còn là vòng đồng tâm | 20 | đã sửa (Task 20) |
| vừa | `f01--b-10-tong-quan-co-du-lieu` | `apps/golf/app/(player)/home.tsx:173` | “Xu hướng … (Driver, 1 buổi)” vẽ biểu đồ một điểm | 20 | đã sửa (Task 20) |
| vừa | `f10--chi-tiet-bai`, `f10--da-gui-binh-luan` | `packages/ds/src/ui/Comment/Comment.tsx:70` + `apps/golf/app/posts/[id].tsx:140` | Bình luận của mình vẫn có nút “⋯”, bấm không làm gì (DS luôn vẽ dù `onMore` trống) | 15 | đã sửa (Task 15) |
| vừa | `f10--tra-loi-binh-luan` | `packages/ds/src/ui/Comment/Comment.tsx:155-156` + `apps/golf/app/posts/[id].tsx:151` | Ô bình luận mở rộng hiện “Thêm ảnh” / “Thêm địa điểm” nhưng màn không truyền handler — bấm không làm gì | 15 | đã sửa (Task 15) |
| vừa | `f11--tab-hlv`, `f11--tab-hlv-rong` | `apps/golf/components/NotificationsScreen.tsx:101` | Tab Thông báo của HLV dùng `TabHeader` → vẫn có chuông (kèm badge) mở chính màn đang xem | 27 | chờ Task 27 |
| thấp | `f04--ho-so-hlv`, `f04--hlv-chia-se-ma`, `f10--*` | `packages/ds/src/ui/PostCard/PostCard.tsx:56`, `packages/ds/src/ui/Social/Social.tsx:91`, `packages/ds/src/ui/Comment/Comment.tsx:57` | Avatar không ảnh lấy `name.slice(0, 1)` → mọi HLV hiện “H”, khác “MT” ở màn app (`initials()`) | 15 | đã sửa (Task 15) |
| thấp | `f02--onboarding-anh` | `apps/golf/app/(auth)/onboarding.tsx:32` | Onboarding của HLV vẫn ghi “Giúp HLV và bạn bè nhận ra bạn.” | 24 | chờ Task 24 |
| thấp | `f01--dang-ky-thong-tin`, `f02--dang-ky-thong-tin` | `apps/golf/app/(auth)/register.tsx:85` | Bước cuối vẫn là “Tiếp →” dù bấm là gửi mã OTP | — | không làm: chữ không sai (bước kế là xác minh OTP) |
| thấp | `f05--b-01-tong-quan-truoc`, `f01--b-10-tong-quan-co-du-lieu` (tối) | `apps/golf/components/charts/ConcentricRings.tsx:6`, `:25` | Tối: vòng ngoài + ô chú giải gậy xa nhất (`Support/Brand/Soft`) gần như chìm vào nền thẻ | — | không làm: chú giải có tên gậy + số, màu chỉ phụ; thang màu chart tối cần thiết kế |
| thấp | `f06--b-02-16-loai` (sáng) | `packages/ds/src/ui/Popover/popoverItemStyles.ts:48` | Viền radio chưa chọn (`Checkbox/Border/Default`) rất nhạt, có thể < 3:1 — nợ Figma của DS | 15 | đã sửa (Task 15): giữ token Figma, ghi nợ F56 |
| thấp | `f10--dang-bai`, `f12--tai-khoan` | `packages/ds/src/ui/TextField/TextArea.tsx:18` | Nhãn / chữ TextArea to hơn TextField bên cạnh → form lệch cỡ chữ | — | không làm: đúng Figma (TextArea khác Text-Field) |
| thấp | `f11--danh-sach` | `apps/golf/components/NotificationsScreen.tsx:19` | “Lê Đăng Khoa đã bình luận” thiếu tân ngữ | 27 | chờ Task 27 |
| thấp | `f11--tab-hlv-rong` | `apps/golf/components/NotificationsScreen.tsx:124` | Thông báo rỗng của HLV ghi câu viết cho người chơi (“Ghi chú của HLV…”) | 27 | chờ Task 27 |
| thấp | `f12--tai-khoan-hlv` | `apps/golf/app/settings/account.tsx:26` | Đơn giá điền sẵn “450000” không có dấu chấm (placeholder / helpText có) | 28 | chờ Task 28 |
| thấp | `f12--mat-khau`, `f03--doi-mat-khau` | `apps/golf/app/settings/password.tsx:13,15` | Placeholder “••••••••” ở ô trống trông như đã có mật khẩu | 25 | chờ Task 25 |
| thấp | `f12--dev` | `packages/ds/src/ui/ListItem/listItemStyles.ts:22` | Hàng `selected` đổi padding → avatar lệch phải vài px | — | không làm: theo variant Figma, chỉ màn Dev |
| thấp | `f10--kham-pha`, `f10--nguoi-theo-doi`, `f10--dang-theo-doi` | `apps/golf/components/People.tsx:66` | “hcp 14” — màn khác ghi “Handicap 14” | 26 | đã sửa (Task 23) |
| thấp | `f10--tra-loi-binh-luan` | `packages/ds/src/ui/Comment/commentStyles.ts:54` | Chip “↩ Trả lời … ⊗” gap quá nhỏ, icon dính chữ | — | không làm: token Figma `Badge/Spacing/Small/Gap` |
| thấp | `f09--tong-quan-rong` | `apps/golf/app/students/[id].tsx:72` | “Học viên chưa có phiên swing nào.” trong khi tab Swing có 1 video — dễ lẫn số liệu với video | 22 | đã sửa (Task 22) |

## Giới hạn

- Điều hướng không đổi màn (chỉ ghi Actions) — mỗi màn của luồng là một story riêng; trạng thái giữa chừng (đã gõ, dialog, sheet, toast) dựng bằng `setup` hoặc `play`.
- Không vẽ `_layout`: guard theo vai ở `(player)/_layout` / `(coach)/_layout` không chạy trong story; thanh tab do `appStory({ tabs })` vẽ (danh sách tab chép tay từ hai layout đó). `presentation: 'modal'` của `metrics/add` không thể hiện.
- `Seed` vẽ màn sau một khung trống (đợi seed) — `play` phải dùng `find*`, không dùng `get*`.
- Gõ chữ vào ô nhập: **không dùng `userEvent.type`** (react-native-web 0.21 + React 19: chữ vào DOM nhưng `onChangeText` không chạy → bấm Lưu / Tiếp màn coi như ô trống). Dùng `fireEvent.change(el, { target: { value } })` hoặc `fireEvent.input(...)` từ `storybook/test`. Story mới dùng `typeIn` của `lib/appStory.tsx`.
- Dialog / BottomSheet là Modal vẽ ngoài `#storybook-root` → `canvas.findBy*` không thấy; dùng `screen.findBy*` / `within(canvasElement.ownerDocument.body)`.
- Chữ trên màn đổi (vd `formatSec` “1,3s” → “1,3 s”, nút “Chọn ảnh” → “Đọc số liệu”) làm `play` âm thầm hỏng: ảnh vẫn chụp nhưng đứng ở bước trước. Sau khi màn đổi, chụp lại và xem console có `TestingLibraryElementError`.
