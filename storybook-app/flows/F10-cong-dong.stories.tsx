/**
 * F10 · Cộng đồng — kịch bản: docs/flows/F10/steps.json, storyboard: docs/flows/F10.md
 *
 * Tài khoản: p-minh (theo dõi c-tuan, c-ha, p-khoa; có bài post-4; đã thích post-1, post-2, post-5), p-huy (chưa theo dõi ai, chưa có bài),
 * c-tuan (HLV của p-minh — thấy swing riêng tư của p-minh), p-khoa (không có quyền xem swing của p-minh).
 * Bước ghi dữ liệu của lượt đi (bỏ thích + thích lại và bình luận 02, bài mới 05, theo dõi Lan 06, chặn Khoa 08) → `setup` của bước sau.
 *
 * Các bước (mỗi bước shot = một story `f10--b-<nn>-<slug>`; ✓ = đã có):
 *  ✓ 01  · Minh Anh mở Cộng đồng             (player)/community        as p-minh, tab community
 *  ✓ 02  · Bài HLV Tuấn → bình luận → Gửi    posts/[id]  post-1        play: gõ bình luận + Gửi
 *  ✓ 03  · Ai đã thích                       posts/[id]  post-1        LikesSheet (Trần Thu Lan, Nguyễn Minh Anh)
 *  ✓ 04  · Đăng bài — đủ thông tin           community/compose         play: tiêu đề, nội dung, tag driver + tempo, swing Driver
 *  ✓ 05  · Đăng                              community/compose         Toast “Đã đăng bài” (hold toast)
 *  ✓ 06  · Khám phá → “lan” → Theo dõi       (player)/community        play: tab Khám phá, gõ “lan”, Theo dõi
 *  ✓ 07  · Hồ sơ Trần Thu Lan                users/[id]  p-lan         đã theo dõi; không thông số / swing / bộ gậy
 *  ✓ 08  · Chặn Lê Đăng Khoa — dialog        users/[id]  p-khoa        play: nút Chặn trên header
 *  ✓ 09  · Bảng tin sau khi chặn             (player)/community        bài p-khoa biến mất, bài mới ở đầu
 *  ✓ 10  · Báo cáo bài HLV Hà                posts/[id]  post-2        play: Báo cáo → Spam → Gửi báo cáo, hold toast
 * Biến thể:
 *  ✓ 01a · Bảng tin — rỗng                   (player)/community        as p-huy
 *  ✓ 01b · Bảng tin của HLV                  (coach)/community         as c-tuan, tab coach/community
 *  ✓ 01c · Chia sẻ bài → Gửi → toast         (player)/community        play: Chia sẻ bài đầu → chọn Lan → Gửi (1), hold toast
 *  ✓ 02a · Chi tiết bài + bình luận          posts/[id]  post-1
 *  ✓ 02b · Chi tiết bài của mình             posts/[id]  post-4
 *  ✓ 02c · Trả lời bình luận                 bấm “Trả lời” + gõ
 *  ✓ 02d · Xoá bài — dialog                  post-4
 *  ✓ 02e · Swing đính kèm — có quyền         bài có swingId sw-minh-1   as c-tuan
 *  ✓ 02f · Swing đính kèm — riêng tư         như trên                   as p-khoa
 *  ✓ 02g · Không tìm thấy bài viết           posts/[id]  post-x
 *  ✓ 04a · Đăng bài — form trống             community/compose
 *  ✓ 04b · Đăng bài — lỗi bắt buộc           bấm Đăng khi trống
 *  ✓ 04c · Đăng bài — chọn swing đính kèm    sheet “Đính kèm swing”
 *  ✓ 06a · Khám phá (theo dõi)               bấm tab Khám phá
 *  ✓ 06b · Khám phá — không tìm thấy         gõ “xyz”
 *  ✓ 07a · Hồ sơ học viên khi HLV xem        users/[id]  p-minh         as c-tuan (nút “Xem dữ liệu học viên”, không có Chặn)
 *  ✓ 07b · Hồ sơ không tìm thấy              users/[id]  p-x
 *  ✓ 07c · Người theo dõi                    people                     as p-minh
 *  ✓ 07d · Đang theo dõi                     people?tab=following
 *  ✓ 07e · Danh sách rỗng                    people                     as p-huy
 *  ✓ 08a · Hồ sơ HLV — bị chặn               coaches/[id] c-ha          as p-huy, c-ha đã chặn p-huy
 *  ✓ 08b · Đã chặn — hồ sơ                   p-minh chặn p-khoa
 *  ✓ 08c · Bị chặn — hồ sơ                   p-khoa chặn p-minh
 *  ✓ 08d · Danh sách của người đã chặn       people?userId=p-khoa, p-minh chặn p-khoa
 *  ✓ 09a · Bài của người đã chặn             post-5, p-minh chặn p-khoa
 *  ✓ 10a · Báo cáo — lỗi chưa chọn lý do     bấm “Gửi báo cáo”
 *  ✓ 10b · Báo cáo người dùng — đã chọn lý do   users/[id] p-khoa
 *
 * Hồ sơ HLV bình thường (coaches/[id]) = f04--ho-so-hlv — không nhân bản.
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Sửa bài viết, xoá / sửa bình luận của mình, bỏ chặn từ hồ sơ (bỏ chặn ở settings/privacy — F12).
 *  - Ảnh / video trong bài và bình luận (nút “+” của CommentComposer thay bằng avatar).
 *  - Tin nhắn thật khi “Gửi” trong ShareSheet (chỉ giả lập).
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { expect, fireEvent, screen, userEvent, waitFor } from 'storybook/test';
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

// Dữ liệu lượt đi (docs/flows/F10/steps.json): mỗi hằng = mọi việc đã ghi tới hết bước đó → `setup` của bước sau.
const COMMENT = 'Cảm ơn thầy, em sẽ thử 70 nhịp.';
const POST = { title: 'Buổi tập driver sáng nay', content: 'Giữ tempo 3:1 theo bài của HLV Tuấn, tốc độ đầu gậy ổn định 104 mph.' };
const like = (n: number): Action => ({ type: 'toggleLike', userId: 'p-minh', postId: 'post-1', at: NOW, notificationId: `nt-f10-like-${n}` });
// 02: bỏ thích rồi thích lại (Minh Anh xuống cuối "Ai đã thích"), bình luận
const COMMENTED: Action[] = [like(1), like(2), { type: 'addComment', comment: { id: 'cm-f10', postId: 'post-1', authorId: 'p-minh', text: COMMENT, createdAt: NOW }, notificationId: 'nt-f10-cm' }];
const POSTED: Action[] = [...COMMENTED, { type: 'addPost', post: { id: 'post-f10', authorId: 'p-minh', createdAt: NOW, ...POST, tags: ['driver', 'tempo'], swingId: 'sw-minh-1' } }]; // 05
const FOLLOWED: Action[] = [...POSTED, { type: 'toggleFollow', followerId: 'p-minh', followedId: 'p-lan', at: NOW, notificationId: 'nt-f10-fl' }]; // 06
const BLOCKED: Action[] = [...FOLLOWED, block('p-minh', 'p-khoa')]; // 08
// Sheet là Modal → đợi đóng hẳn trước khi chụp.
const sheetClosed = () => waitFor(() => expect(document.querySelector('[aria-modal="true"]')).toBeNull());

// ── 01 · Bảng tin ─────────────────────────────────────────────
export const B01BangTin: Story = {
  name: '01 · Minh Anh mở Cộng đồng',
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

// "Gửi" trong sheet chép lời nhắn + link bài (chưa có tin nhắn trong app) → toast ở cấp màn cho người nhìn thấy đã chép.
export const ChiaSeGui: Story = {
  name: '01c · Chia sẻ bài → Gửi → toast',
  render: () => <Community />,
  ...appStory({ ...playerFeed, hold: ['toast'] }),
  play: async ({ canvas }) => {
    await userEvent.click((await canvas.findAllByLabelText('Chia sẻ'))[0]!);
    await userEvent.click(await screen.findByRole('checkbox', { name: /Trần Thu Lan/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Gửi (1)' }));
    await sheetClosed();
    await canvas.findByText('Đã sao chép bài viết để gửi');
  },
};

// ── 02 · Chi tiết bài + bình luận ─────────────────────────────
export const B02BinhLuan: Story = {
  name: '02 · Mở bài HLV Tuấn → viết bình luận → Gửi',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' } }),
  play: async ({ canvas }) => {
    typeIn(await canvas.findByLabelText('Bình luận'), COMMENT);
    await userEvent.click(await canvas.findByLabelText('Gửi'));
  },
};

export const ChiTietBai: Story = {
  name: '02a · Chi tiết bài + bình luận',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' } }),
};

export const ChiTietBaiCuaMinh: Story = {
  name: '02b · Chi tiết bài của mình',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
};

export const TraLoiBinhLuan: Story = {
  name: '02c · Trả lời bình luận',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
  play: async ({ canvas }) => {
    await userEvent.click((await canvas.findAllByLabelText('Trả lời'))[0]);
    typeIn(await canvas.findByLabelText('Bình luận'), 'Dạ em cảm ơn thầy, tuần sau em tập ạ!');
  },
};

export const XoaBaiDialog: Story = {
  name: '02d · Xoá bài — dialog',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-4' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Xoá bài viết'));
  },
};

export const SwingDinhKemCoQuyen: Story = {
  name: '02e · Swing đính kèm — có quyền',
  render: () => <PostDetail />,
  ...appStory({ as: 'c-tuan', params: { id: 'post-swing' }, setup: [postWithSwing] }),
};

export const SwingDinhKemRiengTu: Story = {
  name: '02f · Swing đính kèm — riêng tư',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-khoa', params: { id: 'post-swing' }, setup: [postWithSwing] }),
};

export const BaiKhongTimThay: Story = {
  name: '02g · Không tìm thấy bài viết',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-x' } }),
};

// ── 03 · Ai đã thích ──────────────────────────────────────────
export const B03AiDaThich: Story = {
  name: '03 · Ai đã thích',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' }, setup: COMMENTED }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: /Ai đã thích/ }));
  },
};

// ── 04 · Đăng bài ─────────────────────────────────────────────
const fillPost = async (canvas: Canvas) => {
  typeIn(await canvas.findByLabelText('Tiêu đề'), POST.title);
  typeIn(await canvas.findByLabelText('Nội dung'), POST.content);
  const tag = await canvas.findByPlaceholderText('VD: driver, tempo');
  typeIn(tag, 'driver,');
  typeIn(tag, 'tempo,');
  await userEvent.click(await canvas.findByLabelText(/^Đính kèm swing/));
  await userEvent.click(await screen.findByRole('radio', { name: /^Driver · 05\/10\/2026/ }));
  await sheetClosed();
};

export const B04SoanBai: Story = {
  name: '04 · Đăng bài: tiêu đề, nội dung, tag driver + tempo, đính kèm swing Driver',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh', setup: COMMENTED }),
  play: async ({ canvas }) => {
    await fillPost(canvas);
  },
};

export const DangBai: Story = {
  name: '04a · Đăng bài — form trống',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
};

export const DangBaiLoi: Story = {
  name: '04b · Đăng bài — lỗi bắt buộc',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Đăng' }));
  },
};

export const DangBaiChonSwing: Story = {
  name: '04c · Đăng bài — chọn swing đính kèm',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh' }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText(/^Đính kèm swing/));
  },
};

// ── 05 · Đã đăng ──────────────────────────────────────────────
export const B05BaiMoi: Story = {
  name: '05 · Đăng — toast “Đã đăng bài”',
  render: () => <Compose />,
  ...appStory({ as: 'p-minh', setup: COMMENTED, hold: ['toast'] }),
  play: async ({ canvas }) => {
    await fillPost(canvas);
    await userEvent.click(await canvas.findByRole('button', { name: 'Đăng' }));
    await canvas.findByText('Đã đăng bài'); // lưu giả lập 0,6 s (DELAYS.save) → chờ toast
  },
};

// ── 06 · Khám phá ─────────────────────────────────────────────
const openDiscover = async (canvas: Canvas) =>
  userEvent.click(await canvas.findByRole('tab', { name: /Khám phá/ }));

export const B06KhamPha: Story = {
  name: '06 · Khám phá → “lan” → Theo dõi',
  render: () => <Community />,
  ...appStory({ ...playerFeed, setup: POSTED }),
  play: async ({ canvas }) => {
    await openDiscover(canvas);
    typeIn(await canvas.findByPlaceholderText('Tìm người chơi, HLV'), 'lan');
    await userEvent.click(await canvas.findByRole('button', { name: 'Theo dõi Trần Thu Lan' }));
    await canvas.findByRole('button', { name: 'Đang theo dõi Trần Thu Lan' });
  },
};

export const KhamPha: Story = {
  name: '06a · Khám phá (theo dõi)',
  render: () => <Community />,
  ...appStory(playerFeed),
  play: async ({ canvas }) => {
    await openDiscover(canvas);
  },
};

export const KhamPhaKhongThay: Story = {
  name: '06b · Khám phá — không tìm thấy',
  render: () => <Community />,
  ...appStory(playerFeed),
  play: async ({ canvas }) => {
    await openDiscover(canvas);
    typeIn(await canvas.findByPlaceholderText('Tìm người chơi, HLV'), 'xyz');
  },
};

// ── 07 · Hồ sơ người dùng ─────────────────────────────────────
export const B07HoSoNguoiChoi: Story = {
  name: '07 · Mở hồ sơ Lan',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-lan' }, setup: FOLLOWED }),
};

export const HoSoHlvXemHocVien: Story = {
  name: '07a · Hồ sơ học viên khi HLV xem',
  render: () => <UserProfile />,
  ...appStory({ as: 'c-tuan', params: { id: 'p-minh' } }),
};

export const HoSoKhongTimThay: Story = {
  name: '07b · Hồ sơ không tìm thấy',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-x' } }),
};

export const NguoiTheoDoi: Story = {
  name: '07c · Người theo dõi',
  render: () => <People />,
  ...appStory({ as: 'p-minh' }),
};

export const DangTheoDoi: Story = {
  name: '07d · Đang theo dõi',
  render: () => <People />,
  ...appStory({ as: 'p-minh', params: { tab: 'following' } }),
};

export const TheoDoiRong: Story = {
  name: '07e · Danh sách rỗng',
  render: () => <People />,
  ...appStory({ as: 'p-huy' }),
};

// ── 08 · Chặn ─────────────────────────────────────────────────
export const B08Chan: Story = {
  name: '08 · Khám phá → Lê Đăng Khoa → nút Chặn trên header',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' }, setup: FOLLOWED }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Chặn Lê Đăng Khoa'));
  },
};

export const HoSoHlvBiChan: Story = {
  name: '08a · Hồ sơ HLV — bị chặn',
  render: () => <CoachProfile />,
  ...appStory({ as: 'p-huy', params: { id: 'c-ha' }, setup: [block('c-ha', 'p-huy')] }),
};

export const DaChan: Story = {
  name: '08b · Đã chặn — hồ sơ',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' }, setup: [block('p-minh', 'p-khoa')] }),
};

export const BiChan: Story = {
  name: '08c · Bị chặn — hồ sơ',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' }, setup: [block('p-khoa', 'p-minh')] }),
};

export const TheoDoiNguoiDaChan: Story = {
  name: '08d · Danh sách của người đã chặn',
  render: () => <People />,
  ...appStory({ as: 'p-minh', params: { userId: 'p-khoa' }, setup: [block('p-minh', 'p-khoa')] }),
};

// ── 09 · Bảng tin sau khi chặn ────────────────────────────────
export const B09SauChan: Story = {
  name: '09 · Chặn → Bảng tin',
  render: () => <Community />,
  ...appStory({ ...playerFeed, setup: BLOCKED }),
};

export const BaiNguoiDaChan: Story = {
  name: '09a · Bài của người đã chặn',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-5' }, setup: [block('p-minh', 'p-khoa')] }),
};

// ── 10 · Báo cáo ──────────────────────────────────────────────
export const B10BaoCao: Story = {
  name: '10 · Mở bài HLV Hà → Báo cáo bài viết → Spam → Gửi báo cáo',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-2' }, setup: BLOCKED, hold: ['toast'] }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Báo cáo bài viết'));
    // Sheet là Modal → vẽ ngoài canvas
    await userEvent.click(await screen.findByText('Spam'));
    await userEvent.click(await screen.findByRole('button', { name: 'Gửi báo cáo' }));
    await sheetClosed();
  },
};

export const BaoCaoLoi: Story = {
  name: '10a · Báo cáo — lỗi chưa chọn lý do',
  render: () => <PostDetail />,
  ...appStory({ as: 'p-minh', params: { id: 'post-1' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Báo cáo bài viết'));
    // Sheet là Modal → vẽ ngoài canvas
    await userEvent.click(await screen.findByRole('button', { name: 'Gửi báo cáo' }));
  },
};

export const BaoCaoNguoiDung: Story = {
  name: '10b · Báo cáo người dùng — đã chọn lý do',
  render: () => <UserProfile />,
  ...appStory({ as: 'p-minh', params: { id: 'p-khoa' } }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByLabelText('Báo cáo người dùng'));
    await userEvent.click(await screen.findByText('Quấy rối'));
  },
};
