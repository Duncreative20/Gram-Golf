/**
 * F11 · Thông báo
 *
 * Tài khoản: p-minh (seed: 2 chưa đọc — ghi chú HLV, theo dõi; 2 đã đọc — lượt thích, phân tích xong), p-huy (không có thông báo),
 * c-tuan (1 chưa đọc — học viên chấp nhận lời mời), c-ha (không có thông báo).
 * Vào từ chuông trên TabHeader (người chơi, badge = số chưa đọc) hoặc tab Thông báo (HLV).
 *
 * Các bước (mỗi bước = một story; ✓ = đã có):
 *  ✓ 01  · Danh sách — Mới / Trước đó        notifications       as p-minh (+ p-khoa bình luận post-4 → đủ 5 loại của người chơi)
 *  ✓ 01a · Danh sách — đã đọc tất cả         notifications       as p-minh, bấm “Đánh dấu đã đọc tất cả”
 *  ✓ 02  · Rỗng                              notifications       as p-huy
 *  ✓ 03  · Tab Thông báo của HLV             (coach)/inbox       as c-tuan, tab coach/inbox
 *  ✓ 03a · Tab Thông báo của HLV — rỗng      (coach)/inbox       as c-ha
 *
 * Chạm một thông báo → markRead + điều hướng (swing / hồ sơ / bài / học viên): story chỉ ghi router.push vào Actions.
 *
 * Chưa có (route không tồn tại — không dựng UI giả):
 *  - Thông báo đẩy (push) và lời mời 2 chiều trong danh sách — Phase 2.
 */
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { userEvent } from 'storybook/test';
import Notifications from '../../apps/golf/app/notifications';
import CoachInbox from '../../apps/golf/app/(coach)/inbox';
import type { Action } from '../../apps/golf/lib/reducer';
import { appStory } from '../lib/appStory';

const meta = { title: 'Luồng/F11 · Thông báo', id: 'f11' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// p-khoa bình luận bài post-4 của p-minh → thêm thông báo loại “comment” (chưa đọc) cho p-minh.
const khoaComments: Action = {
  type: 'addComment',
  comment: { id: 'cm-khoa-2', postId: 'post-4', authorId: 'p-khoa', text: 'Tuần sau đi tập chung không?', createdAt: '2026-10-07T07:30:00Z' },
  notificationId: 'nt-khoa-2',
};

export const DanhSach: Story = {
  name: '01 · Danh sách — Mới / Trước đó',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh', setup: [khoaComments] }),
};

export const DaDocTatCa: Story = {
  name: '01a · Danh sách — đã đọc tất cả',
  render: () => <Notifications />,
  ...appStory({ as: 'p-minh', setup: [khoaComments] }),
  play: async ({ canvas }) => {
    await userEvent.click(await canvas.findByRole('button', { name: /Đánh dấu đã đọc tất cả/ }));
  },
};

export const Rong: Story = {
  name: '02 · Rỗng',
  render: () => <Notifications />,
  ...appStory({ as: 'p-huy' }),
};

export const TabHlv: Story = {
  name: '03 · Tab Thông báo của HLV',
  render: () => <CoachInbox />,
  ...appStory({ as: 'c-tuan', tabs: { role: 'coach', active: 'inbox' } }),
};

export const TabHlvRong: Story = {
  name: '03a · Tab Thông báo của HLV — rỗng',
  render: () => <CoachInbox />,
  ...appStory({ as: 'c-ha', tabs: { role: 'coach', active: 'inbox' } }),
};
