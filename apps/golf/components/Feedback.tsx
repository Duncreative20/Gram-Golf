// Phản hồi sau thao tác, dùng ở nhiều màn (số liệu, gậy, swing, kết nối HLV, cộng đồng, cài đặt).
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, View } from 'react-native';
import { InlineMessage, Text, Toast, useTheme, type InlineMessageProps } from '@gr/ds';
import { DELAYS } from '../lib/simulate';
import { useStore } from '../lib/store';

/** InlineMessage mà trình đọc màn hình đọc ngay khi hiện — InlineMessage của DS không có role alert (Toast có). */
export function AlertMessage(props: InlineMessageProps) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      <InlineMessage {...props} />
    </View>
  );
}

/** Toast kết quả ở đáy màn (MVP "Toasts": "Lưu thành công", "Xóa thất bại"…). Thành công tự đóng sau 1,2 s; thất bại (`type="Negative"`)
 *  giữ 4 s và có nút `actionText` (vd "Thử lại"). Hết giờ → `onDone` (quay lại, đổi màn, hoặc chỉ ẩn toast). */
export function SavedToast({ title, caption, onDone, type = 'Positive', actionText, onAction }: {
  title: string; caption?: string; onDone: () => void; type?: 'Positive' | 'Negative'; actionText?: string; onAction?: () => void;
}) {
  const t = useTheme();
  useEffect(() => {
    Keyboard.dismiss(); // toast nằm ngoài KeyboardAvoid — bấm Lưu khi bàn phím đang mở thì bàn phím che toast (iOS)
    // ponytail: Toast hiện trên màn vừa lưu rồi mới quay lại — app chưa có toast toàn cục; cần toast sống qua điều hướng thì nâng lên provider ở _layout.
    const timer = setTimeout(onDone, type === 'Negative' ? DELAYS.toastError : DELAYS.toast);
    return () => clearTimeout(timer);
  }, []); // hẹn giờ một lần khi hiện; toast mới → đổi `key` để hiện lại từ đầu
  return (
    <View style={{ position: 'absolute', left: t.layout('Margin-Small'), right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
      <Toast type={type} title={title} caption={caption} actionText={actionText} onAction={onAction} />
    </View>
  );
}

/** Lưu/xoá giả lập có độ trễ: `busy` trong DELAYS.save (nút khoá + SavingRow), rồi gọi `done()` — hoặc `fail()` (không ghi gì) khi bật
 *  Cài đặt › Dev › "Giả lập lỗi khi lưu/xoá". Rời màn khi đang chờ → huỷ như request bị huỷ. */
export function useSimulatedWrite() {
  const { state } = useStore();
  const [busy, setBusy] = useState(false);
  const failing = useRef(state.simulateFailure);
  failing.current = state.simulateFailure;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const run = (done: () => void, fail: () => void) => {
    setBusy(true);
    clearTimeout(timer.current); // bấm lại khi đang chờ (vd mở lại Dialog xoá từ header) → chỉ lần cuối chạy, không xoá / quay lại 2 lần
    timer.current = setTimeout(() => {
      setBusy(false);
      (failing.current ? fail : done)();
    }, DELAYS.save);
  };
  return { busy, run };
}

/** Spinner + chữ khi đang gửi (MVP "Spinner khi gửi form"); trình đọc màn hình đọc ngay. */
export function SavingRow({ text = 'Đang lưu…' }: { text?: string }) {
  const t = useTheme();
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
      <ActivityIndicator color={t.color('Color/Content/Accent/Base')} accessibilityLabel={text} />
      <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Base">{text}</Text>
    </View>
  );
}
