/**
 * F10 · Cộng đồng
 *
 * Tài khoản: p-minh (theo dõi c-tuan, c-ha, p-khoa; có bài post-4), p-huy (chưa theo dõi ai, chưa có bài),
 * c-tuan (HLV của p-minh — thấy swing riêng tư của p-minh), p-khoa (không có quyền xem swing của p-minh).
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Bảng tin                         (player)/community        as p-minh, tab community
 *  ✓ 01a · Bảng tin — rỗng                  (player)/community        as p-huy
 *  ✓ 01b · Bảng tin của HLV                 (coach)/community         as c-tuan, tab coach/community
 *  ✓ 02  · Khám phá (theo dõi)              (player)/community        bấm tab Khám phá
 *  ✓ 02a · Khám phá — tìm không dấu         gõ “khoa”
 *  ✓ 02b · Khám phá — không tìm thấy        gõ “xyz”
 *  ✓ 03  · Đăng bài — form trống            community/compose         as p-minh
 *  ✓ 03a · Đăng bài — lỗi bắt buộc          bấm Đăng khi trống
 *  ✓ 03b · Đăng bài — hợp lệ                gõ tiêu đề, nội dung, tag
 *  ✓ 03c · Đăng bài — chọn swing đính kèm   sheet “Đính kèm swing”
 *  ✓ 03d · Đăng bài — đã đăng               Toast “Đã đăng bài”
 *  ✓ 04  · Chi tiết bài + bình luận         posts/[id]  post-1 (của c-tuan)   as p-minh
 *  ✓ 04a · Chi tiết bài của mình            posts/[id]  post-4             as p-minh
 *  ✓ 04b · Trả lời bình luận                bấm “Trả lời” + gõ
 *  ✓ 04c · Đã gửi bình luận                 bấm “Gửi”
 *  ✓ 04d · Ai đã thích                      LikesSheet
 *  ✓ 04e · Xoá bài — dialog                 post-4
 *  ✓ 04f · Swing đính kèm — có quyền        bài có swingId sw-minh-1   as c-tuan
 *  ✓ 04g · Swing đính kèm — riêng tư        như trên                   as p-khoa
 *  ✓ 04h · Không tìm thấy bài viết          posts/[id]  post-x
 *  ✓ 04i · Bài của người đã chặn            post-5, p-minh chặn p-khoa
 *  ✓ 05  · Hồ sơ người dùng                 users/[id]  p-khoa         as p-minh
 *  ✓ 05a · Hồ sơ học viên khi HLV xem       users/[id]  p-minh         as c-tuan (nút “Xem dữ liệu học viên”, không có Chặn)
 *  ✓ 05b · Hồ sơ không tìm thấy             users/[id]  p-x
 *  ✓ 05c · Hồ sơ HLV — bị chặn              coaches/[id] c-ha          as p-huy, c-ha đã chặn p-huy
 *  ✓ 06  · Chặn — dialog                    users/[id]  p-khoa
 *  ✓ 06a · Đã chặn — hồ sơ                  p-minh chặn p-khoa
 *  ✓ 06b · Bị chặn — hồ sơ                  p-khoa chặn p-minh
 *  ✓ 06c · Bảng tin sau khi chặn            bài p-khoa biến mất
 *  ✓ 07  · Báo cáo bài viết                 posts/[id]  post-1, ReportSheet
 *  ✓ 07a · Báo cáo — lỗi chưa chọn lý do    bấm “Gửi báo cáo”
 *  ✓ 07b · Báo cáo người dùng — đã chọn lý do   users/[id] p-khoa
 *  ✓ 08  · Người theo dõi                   people                     as p-minh
 *  ✓ 08a · Đang theo dõi                    people?tab=following
 *  ✓ 08b · Danh sách rỗng                   people                     as p-huy
 *  ✓ 08c · Danh sách của người đã chặn      people?userId=p-khoa, p-minh chặn p-khoa
 *
 * Hồ sơ HLV bình thường (coaches/[id]) = f04--ho-so-hlv — không nhân bản.
 * Toast “Đã gửi báo cáo” tự tắt sau 1,2 s (SavedToast) → không chụp ổn định, không làm story.
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Sửa bài viết, xoá / sửa bình luận của mình, bỏ chặn từ hồ sơ (bỏ chặn dự kiến ở settings/privacy — F12).
 *  - Ảnh / video trong bài và bình luận (nút “+” của CommentComposer thay bằng avatar).
 *  - Tin nhắn thật khi “Gửi” trong ShareSheet (chỉ giả lập).
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fireEvent, screen, userEvent } from 'storybook/test';
import Community from '../../apps/golf/app/(player)/community';
import CoachCommunity from '../../apps/golf/app/(coach)/community';
import Compose from '../../apps/golf/app/community/compose';
import PostDetail from '../../apps/golf/app/posts/[id]';
import UserProfile from '../../apps/golf/app/users/[id]';
import CoachProfile from '../../apps/golf/app/coaches/[id]';
import People from '../../apps/golf/app/people';
import type { Action } from '../../apps/golf/lib/reducer';
import { NOW } from '../../apps/golf/lib/mock';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F10 · Cộng đồng', id: 'f10' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

// userEvent.type chỉ đổi chữ trong DOM, KHÔNG gọi onChangeText của TextInput (RNW 0.21 + React 19) → gõ bằng fireEvent.change.
const typeIn = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } });
const block = (blockerId: string, blockedId: string): Action => ({ type: 'block', blockerId, blockedId });
// Bài của p-minh có đính kèm swing sw-minh-1 (seed không có bài nào đính kèm swing).
const postWithSwing: Action = {
  type: 'addPost',
  post: { id: 'post-swing', authorId: 'p-minh', createdAt: NOW, title: 'Swing driver sáng nay', content: 'Nhờ mọi người góp ý tempo, em thấy downswing hơi vội.', tags: ['driver', 'tempo'], swingId: 'sw-minh-1' },
};
const playerFeed = { as: 'p-minh', tabs: { role: 'player', active: 'community' } } as const;

// ── 01 · Bảng tin ─────────────────────────────────────────────
export const BangTin: Story = {
  name: '01 · Bảng tin',
  render: () => <Community />,
  ...appStory(playerFeed),
};

export const BangTinRong: Story = {
  name: '01a · Bảng tin — rỗng',
  render: () => <Community />,
  ...appStory({ as: 'p-huy', tabs: { role: 'player', active: 'community' } }),
};

export const BangTinHlv: Story = {
  name: '01b · Bảng tin của HLV',
  render: () => <CoachCommunity />,
  ...appStory({ as: 'c-tuan', tabs: { role: 'coach', active: 'community' } }),
};

// ── 02 · Khám phá ─────────────────────────────────────────────
const openDiscover = async (canvas: Canvas) =>
  userEvent.click(await canvas.findByRole('tab', { name: /Khám phá/ }));

export const KhamPha: Story = {
  name: '02 · Khám phá (theo dõi)',
  render: () => <Community />,
  ...appStory(playerFeed),
  play: async ({ canvas }) => {
    await openDiscover(canvas);
  },
};

export const KhamPhaTim: Story = {
  name: '02a · Khám phá — tìm không dấu',
  render: () => <Community />,
  ...appStory(playerFeed),
  play: async ({ canvas }) => {
    await openDiscover(canvas);
    typeIn(await canvas.findByPlaceholderText('Tìm người chơi, HLV'), 'khoa');
  },
};

export const KhamPhaKhongThay: Story = {
  name: '02b · Khám phá — không tìm thấy',
  render: () => <Community />,
  ...appStory(playerFeed),
  play: async ({ canvas }) => {
    await openDiscover(canvas);
    typeIn(await canvas.findByPlaceholderText('Tìm người chơi, HLV'), 'xyz');
  },
};

// ── 03 · Đăng bài ─────────────────────────────────────────────
const fillPost = async (canvas: Canvas) => {
  typeIn(await canvas.findByLabelText('Tiêu đề'), 'Tập tempo 3:1 với metronome');
  typeIn(await canvas.findByLabelText('Nội dung'), 'Tuần này em tập 20 cú mỗi buổi theo bài của HLV Tuấn, tempo ổn định hơn hẳn.');
  typeIn(await canvas.findByPlaceholderText('VD: driver, tempo'), 'Driver, tempo,');
};

export const DangBai: Story = {
  name: '03 · Đăng bài — form trống',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
};

export const DangBaiLoi: Story = {
  name: '03a · Đăng bài — lỗi bắt buộc',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Đăng' }));
  },
};

export const DangBaiHopLe: Story = {
  name: '03b · Đăng bài — hợp lệ',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fillPost(canvas);
  },
};

export const DangBaiChonSwing: Story = {
  name: '03c · Đăng bài — chọn swing đính kèm',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText(/^Đính kèm swing/));
  },
};

export const DangBaiDaDang: Story = {
  name: '03d · Đăng bài — đã đăng',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await fillPost(canvas);
    await userEvent.click(await canvas.findByRole('button', { name: 'Đăng' }));
  },
};

// ── 04 · Chi tiết bài + bình luận ─────────────────────────────
export const ChiTietBai: Story = {
  name: '04 · Chi tiết bài + bình luận',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' } }),
};

export const ChiTietBaiCuaMinh: Story = {
  name: '04a · Chi tiết bài của mình',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
};

export const TraLoiBinhLuan: Story = {
  name: '04b · Trả lời bình luận',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
  play: async ({ canvas }) => {
    await userEvent.click((await canvas.findAllByLabelText('Trả lời'))[0]);
    typeIn(await canvas.findByLabelText('Bình luận'), 'Dạ em cảm ơn thầy, tuần sau em tập ạ!');
  },
};

export const DaGuiBinhLuan: Story = {
  name: '04c · Đã gửi bình luận',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' } }),
  play: async ({ canvas }) => {
    typeIn(await canvas.findByLabelText('Bình luận'), 'Thầy cho em xin file metronome với ạ.');
    await userEvent.click(await canvas.findByLabelText('Gửi'));
  },
};

export const AiDaThich: Story = {
  name: '04d · Ai đã thích',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: /Ai đã thích/ }));
  },
};

export const XoaBaiDialog: Story = {
  name: '04e · Xoá bài — dialog',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Xoá bài viết'));
  },
};

export const SwingDinhKemCoQuyen: Story = {
  name: '04f · Swing đính kèm — có quyền',
  render: () => <PostDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'post-swing' }, setup: [postWithSwing] }),
};

export const SwingDinhKemRiengTu: Story = {
  name: '04g · Swing đính kèm — riêng tư',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-khoa', params: { id: 'post-swing' }, setup: [postWithSwing] }),
};

export const BaiKhongTimThay: Story = {
  name: '04h · Không tìm thấy bài viết',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-x' } }),
};

export const BaiNguoiDaChan: Story = {
  name: '04i · Bài của người đã chặn',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-5' }, setup: [block('p-minh', 'p-khoa')] }),
};

// ── 05 · Hồ sơ người dùng ─────────────────────────────────────
export const HoSoNguoiDung: Story = {
  name: '05 · Hồ sơ người dùng',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' } }),
};

export const HoSoHlvXemHocVien: Story = {
  name: '05a · Hồ sơ học viên khi HLV xem',
  render: () => <UserProfile />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-minh' } }),
};

export const HoSoKhongTimThay: Story = {
  name: '05b · Hồ sơ không tìm thấy',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-x' } }),
};

export const HoSoHlvBiChan: Story = {
  name: '05c · Hồ sơ HLV — bị chặn',
  render: () => <CoachProfile />,
  ...appStory({ as: 'p-huy', params: { id: 'c-ha' }, setup: [block('c-ha', 'p-huy')] }),
};

// ── 06 · Chặn ─────────────────────────────────────────────────
export const ChanDialog: Story = {
  name: '06 · Chặn — dialog',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Chặn Lê Đăng Khoa'));
  },
};

export const DaChan: Story = {
  name: '06a · Đã chặn — hồ sơ',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' }, setup: [block('p-minh', 'p-khoa')] }),
};

export const BiChan: Story = {
  name: '06b · Bị chặn — hồ sơ',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' }, setup: [block('p-khoa', 'p-minh')] }),
};

export const BangTinSauKhiChan: Story = {
  name: '06c · Bảng tin sau khi chặn',
  render: () => <Community />,
  ...appStory({ ...playerFeed, setup: [block('p-minh', 'p-khoa')] }),
};

// ── 07 · Báo cáo ──────────────────────────────────────────────
export const BaoCaoBai: Story = {
  name: '07 · Báo cáo bài viết',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Báo cáo bài viết'));
  },
};

export const BaoCaoLoi: Story = {
  name: '07a · Báo cáo — lỗi chưa chọn lý do',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Báo cáo bài viết'));
    // Sheet là Modal → vẽ ngoài canvas
    await userEvent.click(await screen.findByRole('button', { name: 'Gửi báo cáo' }));
  },
};

export const BaoCaoNguoiDung: Story = {
  name: '07b · Báo cáo người dùng — đã chọn lý do',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Báo cáo người dùng'));
    await userEvent.click(await screen.findByText('Quấy rối'));
  },
};

// ── 08 · Danh sách người theo dõi ─────────────────────────────
export const NguoiTheoDoi: Story = {
  name: '08 · Người theo dõi',
  render: () => <People />,
  ...appStory({ as: 'p-minh' }),
};

export const DangTheoDoi: Story = {
  name: '08a · Đang theo dõi',
  render: () => <People />,
  ...appStory({ as: 'p-minh', params: { tab: 'following' } }),
};

export const TheoDoiRong: Story = {
  name: '08b · Danh sách rỗng',
  render: () => <People />,
  ...appStory({ as: 'p-huy' }),
};

export const TheoDoiNguoiDaChan: Story = {
  name: '08c · Danh sách của người đã chặn',
  render: () => <People />,
  ...appStory({ as: 'p-minh', params: { userId: 'p-khoa' }, setup: [block('p-minh', 'p-khoa')] }),
};
