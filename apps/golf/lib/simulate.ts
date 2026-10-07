import type { CameraView, SwingAnalysis, SwingMetrics, Vendor } from './domain';

export const SAMPLE_FILES: { name: string; vendor: Vendor; content: string }[] = [
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
];

export const SAMPLE_VIDEOS: { fileName: string; durationSec: number; cameraView: CameraView; failAt?: number; quality: 'good' | 'low' }[] = [
  { fileName: 'driver_face_on_60fps.mp4', durationSec: 4.2, cameraView: 'face-on', quality: 'good' },
  { fileName: 'sat7_dtl_sang_som.mp4', durationSec: 3.8, cameraView: 'down-the-line', quality: 'good' },
  { fileName: 'wedge_mang_yeu.mp4', durationSec: 3.1, cameraView: 'face-on', failAt: 0.6, quality: 'good' },
  { fileName: 'driver_nguoc_sang.mp4', durationSec: 4.0, cameraView: 'face-on', quality: 'low' },
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

export interface OcrField { key: keyof SwingMetrics; raw: string; confidence: number }
/** OCR giả lập: trả từng trường + độ tin cậy; spin cố ý thấp để màn review có trường cần sửa. */
export function mockOcr(vendor: Vendor): OcrField[] {
  const v = vendor === 'trackman'
    ? { clubSpeedMph: '104,8', ballSpeedMph: '153,2', smash: '1,46', spinRpm: '2B10', launchDeg: '12,1', carryM: '231' }
    : { clubSpeedMph: '84,9', ballSpeedMph: '115,6', smash: '1,36', spinRpm: '6B40', launchDeg: '17,5', carryM: '149' };
  return (Object.keys(v) as (keyof SwingMetrics)[]).map((key) => ({ key, raw: v[key], confidence: key === 'spinRpm' ? 0.62 : 0.97 }));
}
export const LOW_CONFIDENCE = 0.8;
