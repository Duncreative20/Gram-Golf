import { describe, expect, it } from 'vitest';
import { newInvite } from './ids';
import { reduce } from './reducer';
import { pendingInvites, validateInvite } from './selectors';
import { NOW, seedState } from './mock';

describe('newInvite', () => {
  it('mã 6 ký tự in hoa, chỉ A–Z bỏ O/I và số 2–9 (không nhầm O/0, I/1 khi đọc)', () => {
    for (let i = 0; i < 500; i++) expect(newInvite('c-tuan', NOW, []).code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(newInvite('c-tuan', NOW, [], () => 0).code).toBe('AAAAAA');
    expect(newInvite('c-tuan', NOW, [], () => 0.999999).code).toBe('999999');
  });
  it('trùng mã đã có → sinh lại', () => {
    const draws = [0, 0, 0, 0, 0, 0, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999, 0.999999];
    let k = 0;
    expect(newInvite('c-tuan', NOW, ['AAAAAA'], () => draws[k++]!).code).toBe('999999');
  });
  it('hạn đúng 7 ngày từ now, vào đầu danh sách đang chờ của HLV', () => {
    const inv = newInvite('c-tuan', NOW, [], () => 0.5);
    expect(inv).toMatchObject({ code: 'SSSSSS', coachId: 'c-tuan', createdAt: NOW });
    expect(Date.parse(inv.expiresAt) - Date.parse(NOW)).toBe(7 * 24 * 3600 * 1000);
    const s = reduce(seedState(), { type: 'createInvite', invite: inv });
    expect(pendingInvites(s, 'c-tuan', NOW).map((i) => i.code)).toEqual(['SSSSSS', 'TUAN24']);
    expect(validateInvite(s, 'SSSSSS', '2026-10-14T07:59:59Z', 'p-huy')).toBe('ok');
    expect(validateInvite(s, 'SSSSSS', '2026-10-14T08:00:00Z', 'p-huy')).toBe('expired');
  });
});
