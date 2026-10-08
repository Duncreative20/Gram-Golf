/**
 * F11 · Thông báo — kịch bản: docs/flows/F11/steps.json, storyboard: docs/flows/F11.md
 *
 * Tài khoản: p-minh (seed: 2 chưa đọc — HLV Tuấn ghi chú swing, Khoa theo dõi; 2 đã đọc — HLV Tuấn thích bài, phân tích xong),
 * p-khoa bình luận bài post-4 của p-minh (thông báo `comment` mới), c-tuan (1 chưa đọc — Trần Thu Lan chấp nhận lời mời),
 * c-ha (1 chưa đọc — Phạm Quốc Huy muốn kết nối, nt-6). Bước ghi dữ liệu của lượt đi (đọc từng thông báo, đọc tất cả, bình luận) → `setup`.
 * Loại còn lại đi ở luồng khác: `connect_request` / `invite_accepted` gửi người chơi → F04 06–08; `swing_uploaded` → F08 03.
 *
 * Các bước (mỗi bước shot = một story `f11--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01 · Minh Anh chạm chuông                  notifications               as p-minh — Mới / Trước đó
 *  ✓ 02 · Thông báo ghi chú → swing             swings/[id] sw-minh-1       as p-minh, play: cuộn tới mục Ghi chú HLV
 *  ✓ 03 · Quay lại — ghi chú đã đọc             notifications               nt-1 đã đọc, còn 1 chưa đọc
 *  ✓ 04 · Thông báo theo dõi → hồ sơ            users/[id] p-khoa
 *  ✓ 05 · Thông báo thích → bài                 posts/[id] post-4
 *  ✓ 06 · Chuông hết số                         (player)/home               mọi thông báo đã đọc
 *  ✓ 07 · Khoa bình luận → chuông               notifications               Mới: Lê Đăng Khoa đã bình luận bài viết của bạn
 *  ✓ 08 · Đánh dấu đã đọc tất cả                notifications               không còn mục Mới
 *  ✓ 09 · Thông báo bình luận → bài             posts/[id] post-4           có bình luận của Khoa
 *  ✓ 10 · HLV Tuấn — tab Thông báo              (coach)/inbox               as c-tuan (không chuông trên header)
 *  ✓ 11 · Chấp nhận lời mời → học viên          students/[id] p-lan         as c-tuan
 *  ✓ 12 · HLV Hà — yêu cầu → Lời mời            (coach)/roster ?seg=loi-moi as c-ha, nt-6 đã đọc
 * Biến thể:
 *  ✓ 01a · Rỗng                                 notifications               as p-huy
 *  ✓ 10a · Tab Thông báo HLV — rỗng             (coach)/inbox               HLV mới đăng ký (c-tuan / c-ha đều có thông báo)
 *
 * Chưa có (ngoài phạm vi — spec §1): thông báo đẩy (push).
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import Notifications from '../../apps/golf/app/notifications';
import CoachInbox from '../../apps/golf/app/(coach)/inbox';
import CoachRoster from '../../apps/golf/app/(coach)/roster';
import PlayerHome from '../../apps/golf/app/(player)/home';
import SwingDetail from '../../apps/golf/app/swings/[id]';
import UserProfile from '../../apps/golf/app/users/[id]';
import PostDetail from '../../apps/golf/app/posts/[id]';
import StudentDetail from '../../apps/golf/app/students/[id]';
import { NOW } from '../../apps/golf/lib/mock';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F11 · Thông báo', id: 'f11' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// Dữ liệu lượt đi (docs/flows/F11/steps.json) → `setup` của bước sau.
const READ_ALL = { type: 'markRead', userId: 'p-minh', at: NOW } as const;
const CM_KHOA = { type: 'addComment', comment: { id: 'cm-sb-khoa', postId: 'post-4', authorId: 'p-khoa', text: 'Đỉnh quá, chúc mừng Minh Anh!', createdAt: NOW }, notificationId: 'nt-cm-khoa' } as const;
const COACH_INBOX = { role: 'coach', active: 'inbox' } as const;

export const B01TrungTam: Story = {
  name: '01 · Minh Anh chạm chuông (2 chưa đọc)',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh' }),
};

export const Rong: Story = {
  name: '01a · Rỗng',
  render: () => <Notifications />,
  ...appStory({ as: 'p-huy' }),
};

export const B02GhiChuDenSwing: Story = {
  name: '02 · Chạm thông báo ghi chú',
  render: () => <SwingDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'sw-minh-1' } }),
  // khung 390×844: cuộn mục Ghi chú HLV (dưới phần Phân tích) vào giữa ảnh
  play: async ({ canvas }) => (await canvas.findByText('Ghi chú HLV')).scrollIntoView({ block: 'center' }),
};

export const B03DaDoc: Story = {
  name: '03 · Quay lại — ghi chú đã đọc',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh', setup: [{ type: 'markRead', userId: 'p-minh', at: NOW, ids: ['nt-1'] }] }),
};

export const B04TheoDoiDenHoSo: Story = {
  name: '04 · Chạm thông báo theo dõi',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' } }),
};

export const B05ThichDenBai: Story = {
  name: '05 · Chạm thông báo thích',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
};

export const B06ChuongHetSo: Story = {
  name: '06 · Đã đọc hết → Tổng quan, chuông không còn số',
  render: () => <PlayerHome />,
  ...appStory({ as: 'p-minh', tabs: { role: 'player', active: 'home' }, setup: [READ_ALL] }),
};

export const B07BinhLuanMoi: Story = {
  name: '07 · Khoa bình luận bài của Minh Anh → chuông',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh', setup: [READ_ALL, CM_KHOA] }),
};

export const B08DocTatCa: Story = {
  name: '08 · Đánh dấu đã đọc tất cả',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh', setup: [READ_ALL, CM_KHOA, READ_ALL] }),
};

export const B09BinhLuanDenBai: Story = {
  name: '09 · Chạm thông báo bình luận',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' }, setup: [CM_KHOA] }),
};

export const B10HopThuHlv: Story = {
  name: '10 · HLV Tuấn — tab Thông báo',
  render: () => <CoachInbox />,
  ...appStory({ as: 'c-tuan', tabs: COACH_INBOX }),
};

// c-tuan và c-ha đều có thông báo trong seed (nt-5, nt-6) → HLV mới đăng ký.
export const TabHlvRong: Story = {
  name: '10a · Tab Thông báo HLV — rỗng',
  render: () => <CoachInbox />,
  ...appStory({
    tabs: COACH_INBOX,
    setup: [{ type: 'register', profile: { id: 'c-moi', role: 'coach', name: 'HLV Ngô Bảo Châu', email: 'chau.coach@vidu.vn', phone: '0977111222', createdAt: NOW } }],
  }),
};

export const B11ChapNhanDenHocVien: Story = {
  name: '11 · Chạm thông báo chấp nhận lời mời',
  render: () => <StudentDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-lan' } }),
};

export const B12YeuCauDenLoiMoi: Story = {
  name: '12 · HLV Hà → Thông báo → Phạm Quốc Huy muốn kết nối',
  render: () => <CoachRoster />,
  ...appStory({
    as: 'c-ha',
    tabs: { role: 'coach', active: 'roster' },
    params: { seg: 'loi-moi', from: 'nt-6' },
    setup: [{ type: 'markRead', userId: 'c-ha', at: NOW, ids: ['nt-6'] }], // đã chạm thông báo → chuông hết số
  }),
};
