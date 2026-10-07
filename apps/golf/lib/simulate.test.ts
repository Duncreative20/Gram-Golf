import { describe, expect, it } from 'vitest';
import { mockAnalysis, mockOcr, LOW_CONFIDENCE } from './simulate';
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
});
