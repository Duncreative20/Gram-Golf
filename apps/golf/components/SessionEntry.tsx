// Mảnh dùng chung của các màn nhập số liệu (nhập tay, CSV, ảnh chụp, QR).
import { useState } from 'react';
import { router } from 'expo-router';
import { BottomSheet, DateField, DatePicker } from '@gr/ds';
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

/** Lưu xong ở màn nhập số liệu → quay lại màn trước (mở thẳng URL, không có lịch sử → tab Thông số). */
export const backToMetrics = () => (router.canGoBack() ? router.back() : router.replace('/(player)/metrics'));
