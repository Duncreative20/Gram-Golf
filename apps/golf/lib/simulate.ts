import type { CameraView, JobStatus, SwingAnalysis, SwingMetrics, UploadStatus, Units, Vendor } from './domain';
import { formatNumber, mToYd, parseNumberVN } from './format';
import { SWING_FIELDS } from './validation';

/** File CSV mẫu cho màn nhập (bản thử chưa mở file thật). `vendor: null` = file không phải của máy đo hỗ trợ → nhánh lỗi. */
export const SAMPLE_FILES: { name: string; vendor: Vendor | null; content: string }[] = [
  {
    name: 'TrackMan_Session_2026-10-05.csv', vendor: 'trackman',
    content: [
      'Club,Club Speed [mph],Ball Speed [mph],Smash Factor,Spin Rate [rpm],Launch Angle [deg],Carry [yds]',
      'Driver,104.2,152.1,1.46,2650,12.4,250',
      'Driver,105.0,154.0,1.47,2510,11.9,255',
      'Driver,103.1,149.8,1.45,2790,13.1,246',
      'Driver,,150.2,1.46,2600,12.2,248',
      'Driver,106.4,156.3,1.47,2480,12.0,259',
    ].join('\n'),
  },
  {
    name: 'FSX_Export_7i.csv', vendor: 'foresight',
    content: [
      'Club;ClubSpeed (mph);BallSpeed (mph);Smash;BackSpin (rpm);VLA (deg);Carry (m)',
      '7 Iron;84.0;114.5;1.36;6820;17.8;148',
      '7 Iron;85.2;116.0;1.36;6650;17.2;151',
      '7 Iron;83.6;113.1;1.35;6990;18.4;145',
    ].join('\n'),
  },
  {
    name: 'Ghi_chep_tu_nhap.csv', vendor: null,
    content: ['Ngay,Gay,Khoang cach (m)', '05/10/2026,Driver,230', '05/10/2026,Sat 7,145'].join('\n'),
  },
];

/** Video mẫu cho màn đăng swing. `failAt` = tải lên lỗi tại mốc đó; `analysisFailAt` = job phân tích lỗi tại mốc đó (máy chủ bận);
 *  thử lại chạy tiếp từ mốc lỗi nên lần sau thành công. `quality: 'low'` → kết quả needs_review. */
export const SAMPLE_VIDEOS: { fileName: string; durationSec: number; cameraView: CameraView; failAt?: number; analysisFailAt?: number; quality: 'good' | 'low' }[] = [
  { fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', quality: 'good' },
  { fileName: 'sat7_dtl_sang_som.mp4', durationSec: 3.8, cameraView: 'down-the-line', quality: 'good' },
  { fileName: 'wedge_mang_yeu.mp4', durationSec: 3.1, cameraView: 'face-on', failAt: 0.6, quality: 'good' },
  { fileName: 'driver_nguoc_sang.mp4', durationSec: 4.0, cameraView: 'face-on', quality: 'low' },
  { fileName: 'pw_may_chu_ban.mp4', durationSec: 3.4, cameraView: 'down-the-line', analysisFailAt: 0.5, quality: 'good' },
];

/** Kết quả phân tích giả lập, xác định theo tên file (không ngẫu nhiên → test được). */
export function mockAnalysis(fileName: string, durationSec: number): { status: 'succeeded' | 'needs_review'; analysis: SwingAnalysis } {
  const low = SAMPLE_VIDEOS.find((v) => v.fileName === fileName)?.quality === 'low';
  const address = 0.4, top = address + 0.92, impact = top + 0.3, finish = Math.min(durationSec - 0.2, impact + 1.1);
  return {
    status: low ? 'needs_review' : 'succeeded',
    analysis: {
      tempoRatio: Math.round(((top - address) / (impact - top)) * 10) / 10,
      backswingMs: Math.round((top - address) * 1000), downswingMs: Math.round((impact - top) * 1000),
      plane: low ? 'Không đủ rõ để ước lượng mặt phẳng swing' : 'Hơi dốc ở đầu downswing (over the top nhẹ)',
      confidence: low ? 0.41 : 0.78, fps: 60,
      phases: { address, top, impact, finish },
      tips: low ? [] : [
        { text: 'Giữ góc cổ tay lâu hơn ở đầu downswing', startSec: top, endSec: top + 0.2 },
        { text: 'Hông xoay sớm hơn vai khi bắt đầu downswing', startSec: top + 0.05, endSec: impact },
        { text: 'Trọng tâm dồn về chân trước tốt ở impact', startSec: impact - 0.05, endSec: impact + 0.1 },
      ],
      modelVersion: 'pose-mock-0.1',
    },
  };
}

const round2 = (x: number) => Math.round(x * 100) / 100;

/** Tải video lên giả lập: màn gọi `uploadTick` mỗi `UPLOAD_TICK_MS` (+5 % → 3 s cho cả video). */
export const UPLOAD_TICK_MS = 150;
/** Một nhịp tải lên. Đi qua mốc `failAt` của video → lỗi đúng tại mốc. Thử lại tải tiếp từ chỗ lỗi (tải lên nối tiếp)
 *  nên không đi qua mốc lần nữa → thành công. */
export function uploadTick(progress: number, failAt?: number): { status: UploadStatus; progress: number } {
  const next = Math.min(1, round2(progress + 0.05));
  if (failAt !== undefined && progress < failAt && next >= failAt) return { status: 'failed', progress: failAt };
  return { status: next >= 1 ? 'done' : 'uploading', progress: next };
}

/** Job phân tích giả lập ≈ 3 s: chờ `queued` 0,5 s → `processing` +10 % mỗi `ANALYSIS_TICK_MS` → kết quả `mockAnalysis`. */
export const ANALYSIS_QUEUE_MS = 500;
export const ANALYSIS_TICK_MS = 250;
/** Một nhịp của job đang `processing`; đủ 100 % → trạng thái cuối (succeeded / needs_review) kèm kết quả.
 *  Đi qua mốc `analysisFailAt` của video → `failed` tại mốc; thử lại tiếp từ mốc (như tải lên) nên không lỗi lần hai. */
export function analysisTick(progress: number, fileName: string, durationSec: number): { status: JobStatus; progress: number; analysis?: SwingAnalysis } {
  const next = Math.min(1, round2(progress + 0.1));
  const failAt = SAMPLE_VIDEOS.find((v) => v.fileName === fileName)?.analysisFailAt;
  if (failAt !== undefined && progress < failAt && next >= failAt) return { status: 'failed', progress: failAt };
  if (next < 1) return { status: 'processing', progress: next };
  const r = mockAnalysis(fileName, durationSec);
  return { status: r.status, progress: 1, analysis: r.analysis };
}

export interface OcrField { key: keyof SwingMetrics; raw: string; confidence: number }
/** OCR giả lập: trả từng trường + độ tin cậy; spin cố ý thấp để màn review có trường cần sửa. */
export function mockOcr(vendor: Vendor): OcrField[] {
  const v = vendor === 'trackman'
    ? { clubSpeedMph: '104,8', ballSpeedMph: '153,2', smash: '1,46', spinRpm: '2B10', launchDeg: '12,1', carryM: '231' }
    : { clubSpeedMph: '84,9', ballSpeedMph: '115,6', smash: '1,36', spinRpm: '6B40', launchDeg: '17,5', carryM: '149' };
  return (Object.keys(v) as (keyof SwingMetrics)[]).map((key) => ({ key, raw: v[key], confidence: key === 'spinRpm' ? 0.62 : 0.97 }));
}
export const LOW_CONFIDENCE = 0.8;

/** Ảnh chụp màn hình mẫu (bản thử chưa mở thư viện ảnh). `readable: false` = ảnh mờ, loá → OCR không đọc được (nhánh lỗi). */
export const SAMPLE_PHOTOS: { fileName: string; readable: boolean }[] = [
  { fileName: 'ket_qua_may_do.jpg', readable: true },
  { fileName: 'chup_nghieng_bi_loa.jpg', readable: false },
];
/** Kết quả OCR → giá trị điền sẵn cho `SwingMetricsForm` + trường cần kiểm tra lại (dưới ngưỡng tin cậy).
 *  Carry của OCR là mét (D9); ô carry nhập theo đơn vị hiển thị → imperial đổi sang yard. Chuỗi không phải số giữ nguyên để form báo lỗi. */
export function ocrPrefill(fields: OcrField[], units: Units) {
  const values = Object.fromEntries(SWING_FIELDS.map((f) => [f.key, ''])) as Record<keyof SwingMetrics, string>;
  const highlight: Partial<Record<keyof SwingMetrics, boolean>> = {};
  for (const f of fields) {
    const m = f.key === 'carryM' && units === 'imperial' ? parseNumberVN(f.raw) : null;
    values[f.key] = m === null ? f.raw : formatNumber(mToYd(m));
    if (f.confidence < LOW_CONFIDENCE) highlight[f.key] = true;
  }
  return { values, highlight };
}
export type OcrReview = ReturnType<typeof ocrPrefill>;
/** Đọc ảnh mẫu (giả lập): ảnh mờ → null; ảnh rõ → giá trị điền sẵn + trường cần kiểm tra. */
export const readPhoto = (fileName: string, vendor: Vendor, units: Units): OcrReview | null =>
  SAMPLE_PHOTOS.find((p) => p.fileName === fileName)?.readable === false ? null : ocrPrefill(mockOcr(vendor), units);
/** Người dùng sửa ô → bỏ cảnh báo độ tin cậy thấp của các ô vừa đổi (đã tự kiểm tra lại). */
export const ocrEdit = (review: OcrReview, values: OcrReview['values']): OcrReview => ({
  values,
  highlight: Object.fromEntries(Object.entries(review.highlight).filter(([k]) => values[k as keyof SwingMetrics] === review.values[k as keyof SwingMetrics])),
});

/** Độ trễ giả lập (ms) của trạng thái tạm thời. Màn đọc lúc chạy (không chép ra hằng riêng) để Storybook app (`appStory({ hold })`) kéo dài
 *  được khi chụp ảnh. firstLoad = skeleton lần đầu mở màn; toast = toast thành công tự đóng; ocr = "Đang đọc…" khi nhập ảnh. */
export const DELAYS = { firstLoad: 400, toast: 1200, ocr: 1500 };
