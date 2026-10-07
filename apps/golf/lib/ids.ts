import type { CoachInvite, ID, ISO } from './domain';

let n = 0;
// ponytail: id cục bộ theo bộ đếm — đủ cho mock trong bộ nhớ; backend thật dùng UUID.
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(n++).toString(36)}`;

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // A–Z bỏ O, I + số 2–9: đọc mã không nhầm O/0, I/1
const INVITE_DAYS = 7;
/** Lời mời mới của HLV: mã 6 ký tự in hoa không trùng `taken`, hạn 7 ngày từ `now`. */
// ponytail: Math.random phía máy — đủ cho mock; backend thật sinh mã ở server (ngẫu nhiên mật mã + ràng buộc unique).
export function newInvite(coachId: ID, now: ISO, taken: string[], rand = Math.random): CoachInvite {
  let code: string;
  do code = Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)]).join('');
  while (taken.includes(code));
  return { code, coachId, createdAt: now, expiresAt: new Date(Date.parse(now) + INVITE_DAYS * 86400000).toISOString() };
}
