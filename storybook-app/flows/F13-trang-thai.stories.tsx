/**
 * F13 · Trạng thái xuyên suốt — kịch bản: docs/flows/F13/steps.json, storyboard: docs/flows/F13.md
 *
 * Trạng thái tạm thời (skeleton, spinner khi lưu/xoá, toast thất bại) đứng yên nhờ `appStory({ hold })`. Trạng thái đã có story ở luồng
 * khác → chỉ LINK (story “00 · Mục lục trạng thái”, bấm là mở story gốc), không nhân bản.
 *
 * Các bước (mỗi bước shot = một story `f13--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · 404 — đường dẫn lạ                       +not-found                      as p-minh
 *  ✓ 02 · Khung xương — tab Swing                  (player)/swings                 hold firstLoad
 *  ✓ 03 · Khung xương — tab Thông số               (player)/metrics                hold firstLoad
 *  ✓ 04 · Swing rỗng                               (player)/swings                 as p-huy
 *  ✓ 05 · Thông số rỗng                            (player)/metrics                as p-huy
 *  ✓ 06 · Bộ gậy rỗng                              (player)/metrics                as p-huy; play: Bộ gậy
 *  ✓ 07 · Dev — bật Giả lập lỗi khi lưu/xoá        settings/dev                    FAIL
 *  ✓ 08 · Nhập tay → Lưu — đang lưu                metrics/manual                  hold save; play: SAT7_FORM
 *  ✓ 09 · Lưu thất bại + Thử lại                   metrics/manual                  FAIL, hold toastError; play: SAT7_FORM
 *  ✓ 10 · Xoá phiên thất bại                       metrics/[id] ss-w1              FAIL, hold toastError; play: Xoá phiên → Xoá
 *  ✓ 11 · Xoá phiên — đang xoá                     metrics/[id] ss-w1              hold save; play: Xoá phiên → Xoá
 *  ✓ 12 · Xoá xong — phiên Gỗ 3 05/10 không còn    (player)/metrics                deleteSession ss-w1
 *  ✓ 13 · 403 — người theo dõi mở link học viên    students/[id] p-minh            as p-khoa
 *  ✓ 14 · Quay lại từ 403 → Tổng quan              (player)/home                   as p-khoa
 * Biến thể:
 *  ✓ 00 · Mục lục trạng thái                       link tới story gốc ở F01–F12
 *  ✓ 02a–02d · Đang tải — Học viên / chi tiết học viên / Thông báo / Bộ gậy        hold firstLoad
 *  ✓ 02e · Đang tải — Tổng quan                    (player)/home                   hold firstLoad
 *  ✓ 08a–08c · Đang lưu — thêm gậy / tài khoản / đăng bài                          hold save; play: điền hợp lệ → Lưu / Đăng
 *  ✓ 10a–10c · Xoá thất bại — swing / ghi chú (HLV) / gậy                           FAIL, hold toastError; play: Xoá → Dialog Xoá
 *  ✓ 12a · Toast thành công — đã lưu phiên thể lực metrics/manual?kind=fitness     hold toast
 *  ✓ 13a–13e · Không vào được (guard chuyển hướng): chưa đăng nhập, HLV mở màn người chơi, người chơi mở màn HLV, sửa gậy người khác,
 *              hồ sơ người chơi bằng id HLV (story vẽ `<Redirect>` thành “↪ Chuyển hướng tới …”)
 *
 * Chưa có:
 *  - Mất mạng / lỗi máy chủ thật — app chạy dữ liệu mẫu trong bộ nhớ; lỗi lưu/xoá là giả lập (Dev › “Giả lập lỗi khi lưu/xoá”).
 *  - Guard ở `(player)/_layout`, `(coach)/_layout` (vai sai mở nhóm tab) — Storybook không vẽ `_layout`.
 */
import { ScrollView, Text as RNText, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { screen, userEvent } from 'storybook/test';
import { Screen, Text, TopNavigation, useTheme } from '@gr/ds';
import NotFound from '../../apps/golf/app/+not-found';
import Home from '../../apps/golf/app/(player)/home';
import PlayerSwings from '../../apps/golf/app/(player)/swings';
import PlayerMetrics from '../../apps/golf/app/(player)/metrics';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import StudentDetail from '../../apps/golf/app/students/[id]';
import Notifications from '../../apps/golf/app/notifications';
import Clubs from '../../apps/golf/app/clubs/index';
import ClubNew from '../../apps/golf/app/clubs/new';
import ClubDetail from '../../apps/golf/app/clubs/[id]/index';
import ClubEdit from '../../apps/golf/app/clubs/[id]/edit';
import DevSettings from '../../apps/golf/app/settings/dev';
import AccountSettings from '../../apps/golf/app/settings/account';
import ComposePost from '../../apps/golf/app/community/compose';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import MetricSessionDetail from '../../apps/golf/app/metrics/[id]';
import SwingNew from '../../apps/golf/app/swings/new';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import CreateInvite from '../../apps/golf/app/connect/invite';
import UserProfile from '../../apps/golf/app/users/[id]';
import { Section } from '../../apps/golf/components/Section';
import { appStory, typeIn, type AppStoryOptions } from '../lib/appStory';

const meta = { title: 'Luồng/F13 · Trạng thái xuyên suốt', id: 'f13' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// [story id, mô tả]. Id đổi ở luồng gốc → sửa ở đây (kiểm: mọi id phải có trong http://localhost:6007/index.json).
const GROUPS: { title: string; caption?: string; items: [string, string][] }[] = [
  {
    title: 'Rỗng',
    items: [
      ['f01--b-07-tong-quan-trong', 'Tổng quan — người chơi mới'],
      ['f05--danh-sach-rong', 'Thông số — chưa có phiên'],
      ['f06--danh-sach-rong', 'Bộ gậy — chưa có gậy'],
      ['f07--danh-sach-rong', 'Swing — chưa có swing'],
      ['f04--tab-hlv-chua-ket-noi', 'Tab HLV — chưa kết nối HLV'],
      ['f04--hlv-chua-co-loi-moi', 'Mời học viên — chưa có lời mời'],
      ['f02--b-05-hoc-vien-trong', 'Học viên — HLV mới'],
      ['f09--chua-co-hoc-vien', 'Học viên — đã huỷ hết kết nối'],
      ['f09--can-phan-hoi-rong', 'Học viên — “Cần phản hồi” rỗng'],
      ['f09--loi-moi-rong', 'Học viên — “Lời mời” rỗng'],
      ['f09--tim-khong-thay', 'Học viên — tìm không thấy'],
      ['f09--tong-quan-rong', 'Chi tiết học viên — chưa có dữ liệu'],
      ['f08--chua-co-ghi-chu', 'Swing — chưa có ghi chú HLV'],
      ['f10--bang-tin-rong', 'Bảng tin — chưa theo dõi ai'],
      ['f10--kham-pha-khong-thay', 'Khám phá — không tìm thấy'],
      ['f10--theo-doi-rong', 'Người theo dõi — rỗng'],
      ['f11--rong', 'Thông báo — rỗng'],
      ['f11--tab-hlv-rong', 'Tab Thông báo HLV — rỗng'],
      ['f12--b-05-quyen-rieng-tu', 'Quyền riêng tư — chưa chặn ai'],
    ],
  },
  {
    title: 'Lỗi nhập / kiểm tra',
    items: [
      ['f01--b-03-loi-form', 'Đăng ký — bỏ trống'],
      ['f01--dang-ky-trung-tai-khoan', 'Đăng ký — email / SĐT đã có tài khoản'],
      ['f02--dang-ky-loi', 'Đăng ký HLV — lỗi thông tin'],
      ['f01--xac-minh-otp-sai', 'OTP — sai mã'],
      ['f01--xac-minh-otp-thieu-thong-tin', 'OTP — thiếu thông tin đăng ký'],
      ['f03--dang-nhap-bo-trong', 'Đăng nhập — bỏ trống'],
      ['f03--b-01-dang-nhap-sai', 'Đăng nhập — sai tài khoản / mật khẩu'],
      ['f03--b-02-quen-mk-loi', 'Quên mật khẩu — email không hợp lệ'],
      ['f03--b-07-doi-mk-loi', 'Đổi mật khẩu — lỗi'],
      ['f12--tai-khoan-loi', 'Tài khoản — lỗi'],
      ['f04--nhap-ma-de-trong', 'Mã mời — để trống'],
      ['f04--b-16-ma-sai', 'Mã mời — không tồn tại'],
      ['f04--b-17-ma-het-han', 'Mã mời — hết hạn'],
      ['f04--b-18-ma-da-dung', 'Mã mời — đã dùng'],
      ['f04--b-19-ma-thu-hoi', 'Mã mời — đã thu hồi'],
      ['f04--b-20-da-ket-noi-ma', 'Mã mời — đã kết nối HLV này'],
      ['f05--b-04-loi-truong', 'Nhập tay — lỗi'],
      ['f05--b-12-csv-xem-truoc', 'CSV — dòng lỗi'],
      ['f05--csv-file-la', 'CSV — file lạ'],
      ['f05--csv-thieu-gay', 'CSV — thiếu gậy'],
      ['f05--b-16-ocr-kiem-tra', 'Ảnh OCR — trường tin cậy thấp'],
      ['f06--them-gay-loi', 'Thêm gậy — lỗi'],
      ['f07--loi-chua-chon-gay', 'Đăng swing — chưa chọn gậy'],
      ['f08--loi-trong', 'Ghi chú HLV — trống'],
      ['f10--dang-bai-loi', 'Đăng bài — thiếu tiêu đề / nội dung'],
      ['f10--bao-cao-loi', 'Báo cáo — chưa chọn lý do'],
    ],
  },
  {
    title: 'Lỗi tác vụ',
    caption: 'Tải lên, phân tích swing, đọc ảnh',
    items: [
      ['f07--b-09-loi-mang', 'Tải swing lên — mất mạng'],
      ['f05--b-15-ocr-loi', 'Ảnh OCR — không đọc được (ảnh mờ)'],
      ['f07--b-17-phan-tich-loi', 'Phân tích swing — lỗi'],
      ['f07--b-16-can-xem-lai', 'Phân tích swing — cần xem lại'],
    ],
  },
  {
    title: '403 — không có quyền',
    caption: 'Dữ liệu riêng chỉ chủ và HLV có kết nối active xem được (D6)',
    items: [
      ['f05--chi-tiet-khong-quyen', 'Chi tiết phiên số liệu'],
      ['f06--khong-quyen-bo-gay', 'Bộ gậy của học viên'],
      ['f06--khong-quyen-chi-tiet', 'Chi tiết gậy'],
      ['f08--khong-co-quyen', 'Swing của học viên — kết nối đã huỷ'],
      ['f09--b-11-403-da-huy', 'Chi tiết học viên — kết nối đã huỷ'],
      ['f09--b-10-403-nguoi-theo-doi', 'Chi tiết học viên — chỉ là người theo dõi'],
      ['f10--swing-dinh-kem-rieng-tu', 'Swing đính kèm bài viết — riêng tư'],
    ],
  },
  {
    title: 'Đã chặn',
    items: [
      ['f10--da-chan', 'Hồ sơ — bạn đã chặn'],
      ['f10--bi-chan', 'Hồ sơ — bị người kia chặn'],
      ['f10--ho-so-hlv-bi-chan', 'Hồ sơ HLV — bị chặn'],
      ['f10--bai-nguoi-da-chan', 'Bài viết — của người đã chặn'],
      ['f10--theo-doi-nguoi-da-chan', 'Danh sách theo dõi — người đã chặn'],
    ],
  },
  {
    title: 'Không tìm thấy',
    items: [
      ['f05--chi-tiet-khong-thay', 'Phiên số liệu'],
      ['f06--khong-tim-thay', 'Gậy'],
      ['f07--da-xoa', 'Swing (đã xoá)'],
      ['f09--b-13-404-hoc-vien', 'Học viên'],
      ['f04--ho-so-hlv-khong-co', 'Hồ sơ HLV'],
      ['f10--ho-so-khong-tim-thay', 'Hồ sơ người dùng'],
      ['f10--bai-khong-tim-thay', 'Bài viết'],
    ],
  },
  {
    title: 'Chuyển hướng (guard)',
    items: [
      ['f03--da-dang-xuat', 'Chưa đăng nhập → màn chào'],
      ['f03--vao-app-nguoi-choi', 'Người chơi → Tổng quan'],
      ['f03--vao-app-hlv', 'HLV → Học viên'],
      ['f06--sua-gay-da-luu-tru', 'Sửa gậy đã lưu trữ → chi tiết gậy'],
      ['f13--chua-dang-nhap', 'Chưa đăng nhập mở màn trong app'],
      ['f13--hlv-mo-man-nguoi-choi', 'HLV mở màn của người chơi'],
      ['f13--nguoi-choi-mo-man-hlv', 'Người chơi mở màn của HLV'],
      ['f13--sua-gay-nguoi-khac', 'Sửa gậy không phải của mình'],
      ['f13--ho-so-id-hlv', 'Hồ sơ người chơi mở bằng id HLV'],
    ],
  },
];

// react-native-web vẽ Text có `href` thành thẻ <a>; target _top để mở story ở khung Storybook ngoài (không trong iframe).
const linkProps = (id: string) => ({ href: `/?path=/story/${id}`, hrefAttrs: { target: '_top' } }) as object;

function StateIndex() {
  const t = useTheme();
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  return (
    <Screen>
      <TopNavigation heading="Mục lục trạng thái" subtitle="Bấm để mở story gốc" align="Left" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        {GROUPS.map((g) => (
          <Section key={g.title} title={`${g.title} (${g.items.length})`} caption={g.caption}>
            <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
              {g.items.map(([id, label]) => (
                <RNText key={id} accessibilityRole="link" {...linkProps(id)}>
                  <Text variant="Body/Base/DemiBold" color="Color/Content/Accent/Base">{label}</Text>
                  {'\n'}
                  <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{id}</Text>
                </RNText>
              ))}
            </View>
          </Section>
        ))}
      </ScrollView>
    </Screen>
  );
}

export const MucLuc: Story = {
  name: '00 · Mục lục trạng thái',
  render: () => <StateIndex />,
  ...appStory(),
};

// ── Bước của luồng ───────────────────────────────────────────────────────────
type Play = NonNullable<Story['play']>;
const FAIL = { type: 'setSimulateFailure', on: true } as const;
const PLAYER_TAB = (active: string): AppStoryOptions => ({ as: 'p-minh', tabs: { role: 'player', active } });
const HUY_TAB = (active: string): AppStoryOptions => ({ as: 'p-huy', tabs: { role: 'player', active } });
const click = (el: Promise<HTMLElement>) => el.then((e) => userEvent.click(e));
// Bước 08: Sắt 7 + 6 chỉ số hợp lệ → Lưu (như steps.json). Sheet chọn gậy / Dialog là Modal ngoài #storybook-root → `screen`.
const SAT7_FORM: Play = async ({ canvas }) => {
  await click(canvas.findByRole('combobox', { name: 'Gậy, chưa chọn' }));
  await click(screen.findByRole('radio', { name: /^Sắt 7/ }));
  for (const [label, v] of [['Tốc độ đầu gậy (mph)', '85'], ['Tốc độ bóng (mph)', '116'], ['Smash factor', '1,36'], ['Spin (rpm)', '6700'], ['Góc bắn (°)', '17,5'], ['Carry (m)', '150']]) {
    await typeIn(await canvas.findByLabelText(label), v);
  }
  await click(canvas.findByRole('button', { name: 'Lưu' }));
};
// Xoá → Dialog xác nhận "Xoá". `trigger` = nút / nút icon mở Dialog.
const confirmDelete = (trigger: RegExp | string): Play => async ({ canvas }) => {
  await click(canvas.findAllByRole('button', { name: trigger }).then((all) => all[0]!));
  await click(screen.findByRole('button', { name: 'Xoá' }));
};
// Chờ trạng thái cuối của play hiện ra (spinner / toast sau DELAYS.save 0,6 s) để ảnh không chụp giữa chừng.
const thenShows = (play: Play, text: string): Play => async (ctx) => {
  await play(ctx);
  await screen.findAllByText(text); // "Đang xoá…" có ở cả nút lẫn SavingRow
};

export const B01_404: Story = {
  name: '01 · Mở link không có màn',
  render: () => <NotFound />,
  ...appStory({ as: 'p-minh' }),
};

export const B02SkeletonSwing: Story = {
  name: '02 · Tab Swing lần đầu — khung xương',
  render: () => <PlayerSwings />,
  ...appStory({ ...PLAYER_TAB('swings'), hold: ['firstLoad'] }),
};

export const DangTaiHocVien: Story = {
  name: '02a · Đang tải — Học viên',
  render: () => <CoachRoster />,
  ...appStory({ as: 'c-tuan', tabs: { role: 'coach', active: 'roster' }, hold: ['firstLoad'] }),
};

export const DangTaiChiTietHocVien: Story = {
  name: '02b · Đang tải — chi tiết học viên',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-minh' }, hold: ['firstLoad'] }),
};

export const DangTaiThongBao: Story = {
  name: '02c · Đang tải — Thông báo',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh', hold: ['firstLoad'] }),
};

export const DangTaiBoGay: Story = {
  name: '02d · Đang tải — Bộ gậy',
  render: () => <Clubs />,
  ...appStory({ as: 'p-minh', hold: ['firstLoad'] }),
};

export const DangTaiTongQuan: Story = {
  name: '02e · Đang tải — Tổng quan',
  render: () => <Home />,
  ...appStory({ ...PLAYER_TAB('home'), hold: ['firstLoad'] }),
};

export const B03SkeletonThongSo: Story = {
  name: '03 · Tab Thông số lần đầu — khung xương',
  render: () => <PlayerMetrics />,
  ...appStory({ ...PLAYER_TAB('metrics'), hold: ['firstLoad'] }),
};

export const B04TrongSwing: Story = {
  name: '04 · Phạm Quốc Huy mở tab Swing',
  render: () => <PlayerSwings />,
  ...appStory(HUY_TAB('swings')),
};

export const B05TrongThongSo: Story = {
  name: '05 · Tab Thông số',
  render: () => <PlayerMetrics />,
  ...appStory(HUY_TAB('metrics')),
};

export const B06TrongBoGay: Story = {
  name: '06 · Segment Bộ gậy',
  render: () => <PlayerMetrics />,
  ...appStory(HUY_TAB('metrics')),
  play: ({ canvas }) => click(canvas.findByRole('tab', { name: /Bộ gậy/ })),
};

export const B07BatGiaLapLoi: Story = {
  name: '07 · Dev → bật Giả lập lỗi khi lưu/xoá',
  render: () => <DevSettings />,
  ...appStory({ as: 'p-minh', setup: [FAIL] }),
  // đầu màn Dev là "Kiểm tra theo luồng" (Task 30) → cuộn tới công tắc
  play: async ({ canvas }) => (await canvas.findByText('Giả lập lỗi khi lưu/xoá')).scrollIntoView({ block: 'center' }),
};

export const B08DangLuu: Story = {
  name: '08 · Nhập tay đủ 6 chỉ số → Lưu',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', hold: ['save'] }),
  play: thenShows(SAT7_FORM, 'Đang lưu…'),
};

export const DangLuuThemGay: Story = {
  name: '08a · Đang lưu — thêm gậy',
  render: () => <ClubNew />,
  ...appStory({ as: 'p-minh', hold: ['save'] }),
  play: thenShows(async ({ canvas }) => {
    await click(canvas.findByRole('combobox', { name: 'Loại gậy, chưa chọn' }));
    await click(screen.findByRole('radio', { name: 'Hybrid 3' }));
    for (const [label, v] of [['Hãng', 'Ping'], ['Model', 'G430'], ['Hãng cán', 'Alta CB'], ['Loft (°)', '19'], ['Lie (°)', '59']]) {
      await typeIn(await canvas.findByLabelText(label), v);
    }
    await click(canvas.findByRole('button', { name: 'Lưu' }));
  }, 'Đang lưu…'),
};

export const DangLuuTaiKhoan: Story = {
  name: '08b · Đang lưu — tài khoản',
  render: () => <AccountSettings />,
  ...appStory({ as: 'p-minh', hold: ['save'] }),
  play: thenShows(async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('CLB / sân tập (tuỳ chọn)'), 'Sân tập Hồ Tây');
    await click(canvas.findByRole('button', { name: 'Lưu' }));
  }, 'Đang lưu…'),
};

export const DangDangBai: Story = {
  name: '08c · Đang đăng bài',
  render: () => <ComposePost />,
  ...appStory({ as: 'p-minh', hold: ['save'] }),
  play: thenShows(async ({ canvas }) => {
    await typeIn(await canvas.findByLabelText('Tiêu đề'), '3 bài tập giữ tempo cho driver');
    await typeIn(await canvas.findByLabelText('Nội dung'), 'Đếm nhịp 1-2-3 khi lên gậy, giữ đỉnh nửa nhịp rồi mới xuống.');
    await click(canvas.findByRole('button', { name: 'Đăng' }));
  }, 'Đang đăng…'),
};

export const B09LuuThatBai: Story = {
  name: '09 · Chờ 0,6 giây — Lưu thất bại',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', setup: [FAIL], hold: ['toastError'] }),
  play: thenShows(SAT7_FORM, 'Lưu thất bại'),
};

export const B10XoaThatBai: Story = {
  name: '10 · Phiên Gỗ 3 05/10 → Xoá phiên → Xoá',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-w1' }, setup: [FAIL], hold: ['toastError'] }),
  play: thenShows(confirmDelete('Xoá phiên'), 'Xoá thất bại'),
};

export const XoaSwingThatBai: Story = {
  name: '10a · Xoá swing thất bại',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'sw-minh-2' }, setup: [FAIL], hold: ['toastError'] }),
  play: thenShows(confirmDelete('Xoá swing'), 'Xoá thất bại'),
};

export const XoaGhiChuThatBai: Story = {
  name: '10b · Xoá ghi chú thất bại (HLV)',
  render: () => <SwingDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'sw-minh-1' }, setup: [FAIL], hold: ['toastError'] }),
  play: thenShows(confirmDelete(/^Xoá ghi chú/), 'Xoá thất bại'),
};

export const XoaGayThatBai: Story = {
  name: '10c · Xoá gậy thất bại',
  render: () => <ClubDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'cl-pw' }, setup: [FAIL], hold: ['toastError'] }),
  play: thenShows(confirmDelete('Xoá gậy'), 'Xoá thất bại'),
};

export const B11DangXoa: Story = {
  name: '11 · Tắt giả lập → xoá lại phiên Gỗ 3',
  render: () => <MetricSessionDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'ss-w1' }, hold: ['save'] }),
  play: thenShows(confirmDelete('Xoá phiên'), 'Đang xoá…'),
};

export const B12XoaThanhCong: Story = {
  name: '12 · Xoá xong — về danh sách',
  render: () => <PlayerMetrics />,
  ...appStory({ ...PLAYER_TAB('metrics'), setup: [{ type: 'deleteSession', id: 'ss-w1' }] }),
};

export const ToastDaLuu: Story = {
  name: '12a · Toast thành công — đã lưu phiên thể lực',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { kind: 'fitness' }, hold: ['toast'] }),
  play: thenShows(async ({ canvas }) => {
    for (const [label, value] of [['Cân nặng (kg)', '72,5'], ['Độ dẻo (/10)', '7'], ['Lực nắm (kg)', '45'], ['Bật cao (cm)', '48']] as const) {
      await typeIn(await canvas.findByLabelText(label), value);
    }
    await click(canvas.findByRole('button', { name: 'Lưu' }));
  }, 'Đã lưu'),
};

export const B13_403: Story = {
  name: '13 · Người theo dõi mở link dữ liệu học viên',
  render: () => <StudentDetail />,
  ...appStory({ as: 'p-khoa', params: { id: 'p-minh' } }),
};

// ── Không vào được: guard chuyển hướng (story vẽ <Redirect> thành “↪ Chuyển hướng tới …”) ──
export const ChuaDangNhap: Story = {
  name: '13a · Chưa đăng nhập mở màn trong app',
  render: () => <Home />,
  ...appStory(),
};

export const HlvMoManNguoiChoi: Story = {
  name: '13b · HLV mở màn chỉ dành cho người chơi',
  render: () => <SwingNew />,
  ...appStory({ as: 'c-tuan' }),
};

export const NguoiChoiMoManHlv: Story = {
  name: '13c · Người chơi mở màn chỉ dành cho HLV',
  render: () => <CreateInvite />,
  ...appStory({ as: 'p-minh' }),
};

export const SuaGayNguoiKhac: Story = {
  name: '13d · Sửa gậy không phải của mình',
  render: () => <ClubEdit />,
  ...appStory({ as: 'c-tuan', params: { id: 'cl-driver' } }),
};

export const HoSoIdHlv: Story = {
  name: '13e · Hồ sơ người chơi mở bằng id HLV',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'c-tuan' } }),
};

export const B14QuayLaiTu403: Story = {
  name: '14 · Chạm Quay lại → Tổng quan của Khoa',
  render: () => <Home />,
  ...appStory({ as: 'p-khoa', tabs: { role: 'player', active: 'home' } }),
};
