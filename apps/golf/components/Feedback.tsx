// Phản hồi sau thao tác, dùng ở nhiều màn (số liệu, gậy, swing, kết nối HLV, cộng đồng, cài đặt).
import { useEffect } from 'react';
import { View } from 'react-native';
import { InlineMessage, Toast, useTheme, type InlineMessageProps } from '@gr/ds';

/** InlineMessage mà trình đọc màn hình đọc ngay khi hiện — InlineMessage của DS không có role alert (Toast có). */
export function AlertMessage(props: InlineMessageProps) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      <InlineMessage {...props} />
    </View>
  );
}

/** Toast thành công ở đáy màn; sau 1,2 s gọi `onDone` (quay lại, đổi màn, hoặc chỉ ẩn toast). */
export function SavedToast({ title, caption, onDone }: { title: string; caption?: string; onDone: () => void }) {
  const t = useTheme();
  useEffect(() => {
    // ponytail: Toast hiện trên màn vừa lưu rồi mới quay lại — app chưa có toast toàn cục; cần toast sống qua điều hướng thì nâng lên provider ở _layout.
    const timer = setTimeout(onDone, 1200);
    return () => clearTimeout(timer);
  }, []); // hẹn giờ một lần khi hiện; toast mới → đổi `key` để hiện lại từ đầu
  return (
    <View style={{ position: 'absolute', left: t.layout('Margin-Small'), right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
      <Toast type="Positive" title={title} caption={caption} />
    </View>
  );
}
