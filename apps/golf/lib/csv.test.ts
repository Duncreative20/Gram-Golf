import { describe, expect, it } from 'vitest';
import { clubTypeFromCsv, parseLaunchMonitorCsv } from './csv';
import { SAMPLE_FILES } from './simulate';

describe('parseLaunchMonitorCsv', () => {
  it('nhận diện TrackMan, đổi yard → mét, giữ dòng lỗi', () => {
    const r = parseLaunchMonitorCsv(SAMPLE_FILES.find((f) => f.vendor === 'trackman')!.content);
    expect(r.vendor).toBe('trackman');
    expect(r.rows.length).toBe(5);
    const ok = r.rows.filter((x) => x.value);
    expect(ok.length).toBe(4);
    expect(ok[0]!.value!.carryM).toBeCloseTo(ydToMRound(250), 0);
    expect(r.rows.find((x) => !x.value)!.errors.some((e) => e.startsWith('Tốc độ đầu gậy: '))).toBe(true);
  });
  it('nhận diện Foresight (mét sẵn)', () => {
    const r = parseLaunchMonitorCsv(SAMPLE_FILES.find((f) => f.vendor === 'foresight')!.content);
    expect(r.vendor).toBe('foresight');
    expect(r.rows.every((x) => x.value)).toBe(true);
  });
  it('file lạ → vendor null, không dòng', () => {
    expect(parseLaunchMonitorCsv('a,b\n1,2')).toEqual({ vendor: null, rows: [] });
  });
  it('mỗi file mẫu nhận diện đúng hãng ghi kèm; có đúng 1 file lạ cho nhánh lỗi của màn nhập', () => {
    for (const f of SAMPLE_FILES) expect(parseLaunchMonitorCsv(f.content).vendor).toBe(f.vendor);
    expect(SAMPLE_FILES.filter((f) => f.vendor === null)).toHaveLength(1);
  });
});

describe('clubTypeFromCsv', () => {
  it('tên gậy ở cột Club của máy đo → loại gậy trong app', () => {
    expect(clubTypeFromCsv('Driver')).toBe('Driver');
    expect(clubTypeFromCsv('7 Iron')).toBe('Sắt 7');
    expect(clubTypeFromCsv(' 3 wood ')).toBe('Gỗ 3');
    expect(clubTypeFromCsv('4Hybrid')).toBe('Hybrid 4');
    expect(clubTypeFromCsv('PW')).toBe('PW');
    expect(clubTypeFromCsv('Sand Wedge')).toBe('SW');
    expect(clubTypeFromCsv('Putter')).toBe('Putter');
  });
  it('loại không có trong CLUB_TYPES / tên lạ → undefined', () => {
    expect(clubTypeFromCsv('2 Iron')).toBeUndefined();
    expect(clubTypeFromCsv('7 Wood')).toBeUndefined();
    expect(clubTypeFromCsv('Chipper')).toBeUndefined();
    expect(clubTypeFromCsv('')).toBeUndefined();
  });
});
const ydToMRound = (yd: number) => Math.round(yd / 1.0936133);
