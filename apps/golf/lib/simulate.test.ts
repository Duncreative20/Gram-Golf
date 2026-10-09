import { describe, expect, it } from 'vitest';
import type { JobStatus, UploadStatus } from './domain';
import { mockAnalysis, mockOcr, ocrPrefill, ocrEdit, readPhoto, LOW_CONFIDENCE, SAMPLE_PHOTOS, SAMPLE_VIDEOS, uploadTick, UPLOAD_TICK_MS, analysisTick, ANALYSIS_QUEUE_MS, ANALYSIS_TICK_MS, RESET_TOKENS, resetTokenStatus, SAMPLE_AVATARS, nextSampleAvatar } from './simulate';
import { validateSwingMetrics } from './validation';

/** Chạy liên tiếp từng nhịp tải lên tới khi rời trạng thái 'uploading'; trả mọi nhịp đã đi qua. */
const runUpload = (progress: number, failAt?: number) => {
  const steps: { status: UploadStatus; progress: number }[] = [];
  let s: { status: UploadStatus; progress: number } = { status: 'uploading', progress };
  while (s.status === 'uploading') {
    s = uploadTick(s.progress, failAt);
    steps.push(s);
  }
  return steps;
};

describe('mô phỏng tải video swing lên', () => {
  it('video thường: +5 % mỗi nhịp, số tròn (không trôi số thực), 20 nhịp ≈ 3 s tới 100 % rồi done', () => {
    const steps = runUpload(0);
    expect(steps).toHaveLength(20);
    expect(steps[8]).toEqual({ status: 'uploading', progress: 0.45 }); // danh sách hiện "Đang tải 45%"
    expect(steps[steps.length - 1]).toEqual({ status: 'done', progress: 1 });
    expect(steps.every((s) => s.progress <= 1)).toBe(true);
    expect(steps.length * UPLOAD_TICK_MS).toBe(3000);
  });
  it('video có failAt: lỗi đúng tại mốc lần đầu; thử lại tiếp tục từ chỗ lỗi nên thành công', () => {
    const failAt = SAMPLE_VIDEOS.find((v) => v.failAt !== undefined)!.failAt!;
    const first = runUpload(0, failAt);
    expect(first[first.length - 1]).toEqual({ status: 'failed', progress: failAt });
    const retry = runUpload(failAt, failAt);
    expect(retry.some((s) => s.status === 'failed')).toBe(false);
    expect(retry[retry.length - 1]).toEqual({ status: 'done', progress: 1 });
  });
  it('tạm dừng rồi tiếp tục khi chưa qua mốc lỗi → vẫn lỗi ở mốc (chưa lần nào thất bại)', () => {
    const steps = runUpload(0.3, 0.6);
    expect(steps[steps.length - 1]).toEqual({ status: 'failed', progress: 0.6 });
  });
});

describe('mô phỏng job phân tích swing', () => {
  it('processing +10 % mỗi nhịp, nhịp thứ 10 trả kết quả mockAnalysis; cả job (kể cả chờ queued) ≈ 3 s', () => {
    const seen: { status: JobStatus; progress: number }[] = [];
    let s: ReturnType<typeof analysisTick> = { status: 'processing', progress: 0 };
    while (s.status === 'processing') {
      s = analysisTick(s.progress, 'driver_face_on_60fps.mp4', 4.2);
      seen.push(s);
    }
    expect(seen).toHaveLength(10);
    expect(seen[3]).toEqual({ status: 'processing', progress: 0.4 });
    expect(s).toEqual({ status: 'succeeded', progress: 1, analysis: mockAnalysis('driver_face_on_60fps.mp4', 4.2).analysis });
    expect(ANALYSIS_QUEUE_MS + seen.length * ANALYSIS_TICK_MS).toBe(3000);
  });
  it('video "máy chủ bận": lỗi đúng tại mốc lần đầu; thử lại chạy tiếp từ mốc lỗi nên thành công (nhánh failed đi tới được)', () => {
    const v = SAMPLE_VIDEOS.find((x) => x.analysisFailAt !== undefined)!;
    const run = (progress: number) => {
      let s: ReturnType<typeof analysisTick> = { status: 'processing', progress };
      while (s.status === 'processing') s = analysisTick(s.progress, v.fileName, v.durationSec);
      return s;
    };
    expect(run(0)).toEqual({ status: 'failed', progress: v.analysisFailAt });
    expect(run(v.analysisFailAt!)).toMatchObject({ status: 'succeeded', progress: 1 });
    expect(run(0.6).status).toBe('succeeded'); // video khác / đã qua mốc: không lỗi
  });
  it('video ngược sáng → needs_review khi xong; tiếp tục từ tiến độ dở dang (mở lại màn) không chạy lại từ đầu', () => {
    expect(analysisTick(0.9, 'driver_nguoc_sang.mp4', 4)).toMatchObject({ status: 'needs_review', progress: 1 });
    expect(analysisTick(0.5, 'driver_nguoc_sang.mp4', 4)).toEqual({ status: 'processing', progress: 0.6 });
  });
});

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
  it('ảnh mẫu mờ → không đọc được (null, màn báo lỗi + chọn ảnh khác); ảnh rõ → điền sẵn như ocrPrefill', () => {
    const blurry = SAMPLE_PHOTOS.find((p) => !p.readable)!;
    const clear = SAMPLE_PHOTOS.find((p) => p.readable)!;
    expect(readPhoto(blurry.fileName, 'trackman', 'metric')).toBeNull();
    expect(readPhoto(clear.fileName, 'foresight', 'imperial')).toEqual(ocrPrefill(mockOcr('foresight'), 'imperial'));
  });
  it('ocrEdit: sửa trường độ tin cậy thấp → bỏ cảnh báo của trường đó, trường khác giữ nguyên', () => {
    const r = { values: { ...ocrPrefill(mockOcr('trackman'), 'metric').values }, highlight: { spinRpm: true, carryM: true } };
    const once = ocrEdit(r, { ...r.values, spinRpm: '2610' });
    expect(once).toEqual({ values: { ...r.values, spinRpm: '2610' }, highlight: { carryM: true } });
    expect(ocrEdit(once, { ...once.values, clubSpeedMph: '105' }).highlight).toEqual({ carryM: true }); // sửa trường không cảnh báo: không đổi
  });
  it('ocrPrefill: điền sẵn nguyên chuỗi OCR, tô trường dưới ngưỡng tin cậy', () => {
    const r = ocrPrefill(mockOcr('trackman'), 'metric');
    expect(r.values).toEqual({ clubSpeedMph: '104,8', ballSpeedMph: '153,2', smash: '1,46', spinRpm: '2B10', launchDeg: '12,1', carryM: '231' });
    expect(r.highlight).toEqual({ spinRpm: true });
  });
  it('ocrPrefill: imperial → carry (mét) đổi sang yard 1 chữ số thập phân cho ô "Carry (yd)" (như swingRaw)', () => {
    const r = ocrPrefill(mockOcr('trackman'), 'imperial');
    expect(r.values.carryM).toBe('252,6');
    expect(r.values.clubSpeedMph).toBe('104,8');
    // lưu bằng cùng đơn vị → về lại mét (D9), không lưu nhầm yard thành mét
    expect(validateSwingMetrics({ ...r.values, spinRpm: '2610' }, 'imperial').value!.carryM).toBe(231);
    const half = ocrPrefill(mockOcr('trackman').map((f) => (f.key === 'carryM' ? { ...f, raw: '198,5' } : f)), 'imperial');
    expect(validateSwingMetrics({ ...half.values, spinRpm: '2610' }, 'imperial').value!.carryM).toBeCloseTo(198.5, 1); // lệch < 0,05 m
  });
  it('ocrPrefill: carry không phải số giữ nguyên để form báo lỗi; trường OCR thiếu → trống', () => {
    const r = ocrPrefill([{ key: 'carryM', raw: '2B1', confidence: 0.5 }], 'imperial');
    expect(r.values.carryM).toBe('2B1');
    expect(r.values.clubSpeedMph).toBe('');
    expect(r.highlight).toEqual({ carryM: true });
  });
});

describe('link đặt lại mật khẩu, ảnh đại diện mẫu', () => {
  it('token trong link: hợp lệ / hết hạn / thiếu hoặc lạ (phân biệt hoa thường như token thật)', () => {
    expect(resetTokenStatus(RESET_TOKENS.ok)).toBe('ok');
    expect(resetTokenStatus(RESET_TOKENS.expired)).toBe('expired');
    expect(resetTokenStatus(undefined)).toBe('invalid');
    expect(resetTokenStatus('gg-reset-ok')).toBe('invalid');
  });
  it('ảnh mẫu xoay vòng; chưa có ảnh hoặc ảnh lạ → ảnh đầu', () => {
    expect(nextSampleAvatar()).toBe(SAMPLE_AVATARS[0]);
    expect(nextSampleAvatar(SAMPLE_AVATARS[0])).toBe(SAMPLE_AVATARS[1]);
    expect(nextSampleAvatar(SAMPLE_AVATARS[SAMPLE_AVATARS.length - 1])).toBe(SAMPLE_AVATARS[0]);
    expect(nextSampleAvatar('https://example.com/a.png')).toBe(SAMPLE_AVATARS[0]);
  });
});
