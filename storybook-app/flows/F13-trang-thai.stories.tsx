/**
 * F13 · Trạng thái xuyên suốt
 *
 * Gom các màn rỗng / lỗi / 403 / không tìm thấy / chuyển hướng tiêu biểu. Trạng thái đã có story ở luồng khác → chỉ LINK
 * (story “00 · Mục lục trạng thái”, bấm là mở story gốc), không nhân bản. Chỉ dựng story mới cho trạng thái chưa luồng nào có:
 * guard theo vai / đăng nhập ở màn sâu (story vẽ `<Redirect>` thành “↪ Chuyển hướng tới …”).
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 00 · Mục lục trạng thái                       link tới story gốc ở F01–F12
 *  ✓ 01 · Chưa đăng nhập mở màn trong app          (player)/home          chưa đăng nhập → ↪ /
 *  ✓ 02 · HLV mở màn chỉ dành cho người chơi       swings/new             as c-tuan → ↪ /
 *  ✓ 03 · Người chơi mở màn chỉ dành cho HLV       connect/invite         as p-minh → ↪ /
 *  ✓ 04 · Sửa gậy không phải của mình             clubs/[id]/edit cl-driver   as c-tuan → ↪ chi tiết gậy
 *  ✓ 05 · Hồ sơ người chơi mở bằng id HLV          users/[id] c-tuan      as p-minh → ↪ /coaches/c-tuan
 *  ✓ 90 · Đang tải — Tổng quan (giữ skeleton)     (player)/home          as p-minh, hold firstLoad
 *  ✓ 91 · Toast — đã lưu phiên thể lực            metrics/manual?kind=fitness + gõ 4 ô + Lưu, hold toast
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Màn 404 chung cho đường dẫn lạ (+not-found) — Phase 2; hiện mỗi màn chi tiết tự hiện “Không tìm thấy …”.
 *  - Mất mạng / lỗi máy chủ / đang tải dữ liệu — app chạy dữ liệu mẫu trong bộ nhớ, chưa có lớp gọi API.
 *  - Guard ở `(player)/_layout`, `(coach)/_layout` (vai sai mở nhóm tab) — Storybook không vẽ `_layout`.
 */
import { ScrollView, Text as RNText, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { userEvent } from 'storybook/test';
import { Screen, Text, TopNavigation, useTheme } from '@gr/ds';
import Home from '../../apps/golf/app/(player)/home';
import SwingNew from '../../apps/golf/app/swings/new';
import CreateInvite from '../../apps/golf/app/connect/invite';
import ClubEdit from '../../apps/golf/app/clubs/[id]/edit';
import UserProfile from '../../apps/golf/app/users/[id]';
import MetricsManual from '../../apps/golf/app/metrics/manual';
import { Section } from '../../apps/golf/components/Section';
import { appStory, typeIn } from '../lib/appStory';

const meta = { title: 'Luồng/F13 · Trạng thái xuyên suốt', id: 'f13' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// [story id, mô tả]. Id đổi ở luồng gốc → sửa ở đây (kiểm: mọi id phải có trong http://localhost:6007/index.json).
const GROUPS: { title: string; caption?: string; items: [string, string][] }[] = [
  {
    title: 'Rỗng',
    items: [
      ['f01--tong-quan-trong', 'Tổng quan — người chơi mới'],
      ['f05--danh-sach-rong', 'Thông số — chưa có phiên'],
      ['f06--danh-sach-rong', 'Bộ gậy — chưa có gậy'],
      ['f07--danh-sach-rong', 'Swing — chưa có swing'],
      ['f04--tab-hlv-chua-ket-noi', 'Tab HLV — chưa kết nối HLV'],
      ['f04--hlv-chua-co-loi-moi', 'Mời học viên — chưa có lời mời'],
      ['f02--hoc-vien-trong', 'Học viên — HLV mới'],
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
      ['f12--quyen-rieng-tu', 'Người đã chặn — chưa chặn ai'],
    ],
  },
  {
    title: 'Lỗi nhập / kiểm tra',
    items: [
      ['f01--dang-ky-loi-bo-trong', 'Đăng ký — bỏ trống'],
      ['f01--dang-ky-trung-tai-khoan', 'Đăng ký — email / SĐT đã có tài khoản'],
      ['f02--dang-ky-loi', 'Đăng ký HLV — lỗi thông tin'],
      ['f01--xac-minh-otp-sai', 'OTP — sai mã'],
      ['f01--xac-minh-otp-thieu-thong-tin', 'OTP — thiếu thông tin đăng ký'],
      ['f03--dang-nhap-bo-trong', 'Đăng nhập — bỏ trống'],
      ['f03--dang-nhap-sai', 'Đăng nhập — sai tài khoản / mật khẩu'],
      ['f03--quen-mat-khau-email-sai', 'Quên mật khẩu — email không hợp lệ'],
      ['f03--doi-mat-khau-loi', 'Đổi mật khẩu — lỗi'],
      ['f12--tai-khoan-loi', 'Tài khoản — lỗi'],
      ['f04--nhap-ma-de-trong', 'Mã mời — để trống'],
      ['f04--nhap-ma-sai', 'Mã mời — không tồn tại'],
      ['f04--nhap-ma-het-han', 'Mã mời — hết hạn'],
      ['f04--nhap-ma-da-dung', 'Mã mời — đã dùng'],
      ['f04--nhap-ma-da-thu-hoi', 'Mã mời — đã thu hồi'],
      ['f04--nhap-ma-da-ket-noi', 'Mã mời — đã kết nối HLV này'],
      ['f05--nhap-tay-loi', 'Nhập tay — lỗi'],
      ['f05--csv-xem-truoc', 'CSV — dòng lỗi'],
      ['f05--csv-file-la', 'CSV — file lạ'],
      ['f05--csv-thieu-gay', 'CSV — thiếu gậy'],
      ['f05--anh-kiem-tra', 'Ảnh OCR — trường tin cậy thấp'],
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
      ['f07--loi-tai', 'Tải swing lên — mất mạng'],
      ['f05--anh-khong-doc-duoc', 'Ảnh OCR — không đọc được (ảnh mờ)'],
      ['f07--chi-tiet-loi-phan-tich', 'Phân tích swing — lỗi'],
      ['f07--chi-tiet-can-xem-lai', 'Phân tích swing — cần xem lại'],
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
      ['f09--khong-quyen-da-huy', 'Chi tiết học viên — kết nối đã huỷ'],
      ['f09--khong-quyen-nguoi-theo-doi', 'Chi tiết học viên — chỉ là người theo dõi'],
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
      ['f09--khong-tim-thay', 'Học viên'],
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

export const ChuaDangNhap: Story = {
  name: '01 · Chưa đăng nhập mở màn trong app',
  render: () => <Home />,
  ...appStory(),
};

export const HlvMoManNguoiChoi: Story = {
  name: '02 · HLV mở màn chỉ dành cho người chơi',
  render: () => <SwingNew />,
  ...appStory({ as: 'c-tuan' }),
};

export const NguoiChoiMoManHlv: Story = {
  name: '03 · Người chơi mở màn chỉ dành cho HLV',
  render: () => <CreateInvite />,
  ...appStory({ as: 'p-minh' }),
};

export const SuaGayNguoiKhac: Story = {
  name: '04 · Sửa gậy không phải của mình',
  render: () => <ClubEdit />,
  ...appStory({ as: 'c-tuan', params: { id: 'cl-driver' } }),
};

export const HoSoIdHlv: Story = {
  name: '05 · Hồ sơ người chơi mở bằng id HLV',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'c-tuan' } }),
};

export const DangTaiTongQuan: Story = {
  name: '90 · Đang tải — Tổng quan (giữ skeleton)',
  render: () => <Home />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'home' }, hold: ['firstLoad'] }),
};

export const ToastDaLuu: Story = {
  name: '91 · Toast — đã lưu phiên thể lực (giữ toast)',
  render: () => <MetricsManual />,
  ...appStory({ as: 'p-minh', params: { kind: 'fitness' }, hold: ['toast'] }),
  play: async ({ canvas }) => {
    for (const [label, value] of [['Cân nặng (kg)', '72,5'], ['Độ dẻo (/10)', '7'], ['Lực nắm (kg)', '45'], ['Bật cao (cm)', '48']] as const) {
      await typeIn(await canvas.findByLabelText(label), value);
    }
    await userEvent.click(await canvas.findByRole('button', { name: 'Lưu' }));
  },
};
