import { useEffect } from 'react';
import { View } from 'react-native';
import { Button, ProgressBar, useTheme, type IconName, type ProgressStatus, type ProgressTheme } from '@gr/ds';
import type { Swing, UploadStatus } from '../lib/domain';
import { useStore } from '../lib/store';
import { SAMPLE_VIDEOS, UPLOAD_TICK_MS, uploadTick } from '../lib/simulate';
import { NOW } from '../lib/mock';
import { newId } from '../lib/ids';
import { AlertMessage } from './Feedback';

const UI: Record<UploadStatus, { label: (pct: string) => string; theme: ProgressTheme; status?: ProgressStatus; action?: { icon: IconName; text: string } }> = {
  uploading: { label: (pct) => `Đang tải lên ${pct}`, theme: 'Accent', action: { icon: 'pause-circle-line', text: 'Tạm dừng' } },
  paused: { label: (pct) => `Đã tạm dừng ở ${pct}`, theme: 'Neutral', action: { icon: 'play-circle-line', text: 'Tiếp tục' } },
  failed: { label: (pct) => `Lỗi tải lên ở ${pct}`, theme: 'Status', status: 'Negative', action: { icon: 'refresh-cw-01-line', text: 'Thử lại' } },
  done: { label: () => 'Đã tải lên', theme: 'Status', status: 'Positive' },
};

/** Tải video swing lên (mô phỏng) — dùng ở màn đăng swing và chi tiết swing. Tiến độ nằm trong store nên danh sách cũng thấy.
 *  `controls={false}`: chỉ xem (HLV không điều khiển, cũng không chạy tiếp việc tải của học viên). */
export function SwingUpload({ swing, controls = true }: { swing: Swing; controls?: boolean }) {
  const t = useTheme();
  const { dispatch } = useStore();
  const { status, progress } = swing.upload;
  const set = (next: UploadStatus, p: number) => dispatch({ type: 'uploadUpdate', id: swing.id, status: next, progress: p, at: NOW, notificationId: newId('nt') });
  // ponytail: bộ đếm chạy trong màn, dọn khi rời màn → danh sách giữ tiến độ cuối ("Đang tải 45%"), mở lại swing thì tải tiếp.
  // Bản thật tải nền (background upload), màn chỉ đọc trạng thái.
  useEffect(() => {
    if (status !== 'uploading' || !controls) return;
    const failAt = SAMPLE_VIDEOS.find((v) => v.fileName === swing.fileName)?.failAt;
    let p = progress;
    const timer = setInterval(() => {
      const next = uploadTick(p, failAt);
      p = next.progress;
      if (next.status !== 'uploading') clearInterval(timer);
      set(next.status, next.progress);
    }, UPLOAD_TICK_MS);
    return () => clearInterval(timer);
  }, [status]);
  const ui = UI[status];
  const action = controls ? ui.action : undefined;
  return (
    <View style={{ gap: t.space('Spacing/Gap/Medium') }}>
      <ProgressBar value={progress} theme={ui.theme} status={ui.status} label={ui.label(`${Math.round(progress * 100)}%`)} />
      {status === 'failed' && <AlertMessage theme="Negative" text="Mất kết nối khi đang tải lên. Kiểm tra mạng rồi thử lại — video tải tiếp từ chỗ dừng." />}
      {action && (
        <Button
          level="Secondary"
          size="Medium (Base)"
          leadingIcon={action.icon}
          text={action.text}
          onPress={() => set(status === 'uploading' ? 'paused' : 'uploading', progress)}
        />
      )}
    </View>
  );
}
