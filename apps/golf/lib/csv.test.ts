import { describe, expect, it } from 'vitest';
import { parseLaunchMonitorCsv } from './csv';
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
});
const ydToMRound = (yd: number) => Math.round(yd / 1.0936133);
