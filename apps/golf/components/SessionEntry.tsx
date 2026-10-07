// Mảnh dùng chung của các màn nhập số liệu (nhập tay, CSV, ảnh chụp, QR).
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { BottomSheet, DateField, DatePicker, InlineMessage, Toast, useTheme, type InlineMessageProps } from '@gr/ds';
import type { ISO } from '../lib/domain';
import { NOW } from '../lib/mock';
import { formatDate, vnDay, withVnDay } from '../lib/format';

/** Ô "Ngày" của phiên: BottomSheet DatePicker, không chọn được ngày sau NOW; đổi ngày giữ nguyên giờ trong ngày (giờ VN). */
export function SessionDateField({ value, onChange }: { value: ISO; onChange: (iso: ISO) => void }) {
  const [open, setOpen] = useState(false);
  const date = formatDate(value);
  return (
    <>
      <DateField label="Ngày" value={date} accessibilityLabel={`Ngày, ${date}`} onPress={() => setOpen(true)} />
      <BottomSheet visible={open} onClose={() => setOpen(false)} heading="Chọn ngày">
        <DatePicker
          value={vnDay(value)}
          maxDate={vnDay(NOW)}
          onChange={(d) => {
            onChange(withVnDay(value, d));
            setOpen(false);
          }}
        />
      </BottomSheet>
    </>
  );
}

/** InlineMessage mà trình đọc màn hình đọc ngay khi hiện — InlineMessage của DS không có role alert (Toast có). */
export function AlertMessage(props: InlineMessageProps) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      <InlineMessage {...props} />
    </View>
  );
}

/** Toast thành công ở đáy màn rồi tự quay lại màn trước sau 1,2 s (mở thẳng URL, không có lịch sử → tab Thông số). */
export function SavedToast({ title, caption }: { title: string; caption: string }) {
  const t = useTheme();
  useEffect(() => {
    // ponytail: Toast hiện trên màn vừa lưu rồi mới quay lại — app chưa có toast toàn cục; cần toast sống qua điều hướng thì nâng lên provider ở _layout.
    const timer = setTimeout(() => (router.canGoBack() ? router.back() : router.replace('/(player)/metrics')), 1200);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={{ position: 'absolute', left: t.layout('Margin-Small'), right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
      <Toast type="Positive" title={title} caption={caption} />
    </View>
  );
}
