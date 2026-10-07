import { describe, expect, it } from 'vitest';
import { mockAnalysis, mockOcr, ocrPrefill, LOW_CONFIDENCE } from './simulate';
import { validateSwingMetrics } from './validation';
describe('simulate', () => {
  it('video tốt → succeeded, tempo ~3:1, tip có mốc', () => {
    const r = mockAnalysis('driver_face_on_60fps.mp4', 4.2);
    expect(r.status).toBe('succeeded');
    expect(r.analysis.tempoRatio).toBeCloseTo(3.1, 1);
    expect(r.analysis.tips.every((t) => t.startSec < t.endSec)).toBe(true);
  });
  it('video kém → needs_review, confidence thấp', () => {
    expect(mockAnalysis('driver_nguoc_sang.mp4', 4).status).toBe('needs_review');
  });
  it('OCR có đúng 1 trường dưới ngưỡng', () => {
    expect(mockOcr('trackman').filter((f) => f.confidence < LOW_CONFIDENCE).map((f) => f.key)).toEqual(['spinRpm']);
  });
  it('ocrPrefill: điền sẵn nguyên chuỗi OCR, tô trường dưới ngưỡng tin cậy', () => {
    const r = ocrPrefill(mockOcr('trackman'), 'metric');
    expect(r.values).toEqual({ clubSpeedMph: '104,8', ballSpeedMph: '153,2', smash: '1,46', spinRpm: '2B10', launchDeg: '12,1', carryM: '231' });
    expect(r.highlight).toEqual({ spinRpm: true });
  });
  it('ocrPrefill: imperial → carry (mét) đổi sang yard cho ô "Carry (yd)"', () => {
    const r = ocrPrefill(mockOcr('trackman'), 'imperial');
    expect(r.values.carryM).toBe('253');
    expect(r.values.clubSpeedMph).toBe('104,8');
    // lưu bằng cùng đơn vị → về lại mét (D9), không lưu nhầm yard thành mét
    expect(validateSwingMetrics({ ...r.values, spinRpm: '2610' }, 'imperial').value!.carryM).toBeCloseTo(231, 0);
  });
  it('ocrPrefill: carry không phải số giữ nguyên để form báo lỗi; trường OCR thiếu → trống', () => {
    const r = ocrPrefill([{ key: 'carryM', raw: '2B1', confidence: 0.5 }], 'imperial');
    expect(r.values.carryM).toBe('2B1');
    expect(r.values.clubSpeedMph).toBe('');
    expect(r.highlight).toEqual({ carryM: true });
  });
});
