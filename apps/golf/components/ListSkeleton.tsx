import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Skeleton, SkeletonText, useTheme } from '@gr/ds';
import { DELAYS } from '../lib/simulate';

const seen = new Set<string>();
/** Giả lập lần tải đầu của màn `key` trong phiên (dữ liệu mock có sẵn nên không có pha tải thật): true trong DELAYS.firstLoad đầu, các lần mở sau false.
 *  ponytail: bộ nhớ "đã tải" theo phiên JS — backend thật dùng trạng thái isLoading của truy vấn. */
export function useFirstLoad(key: string) {
  const [loading, setLoading] = useState(() => !seen.has(key));
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      seen.add(key);
      setLoading(false);
    }, DELAYS.firstLoad);
    return () => clearTimeout(timer);
  }, []);
  return loading;
}

/** Khung xương danh sách: `rows` hàng (ô tròn + 2 dòng chữ). Hình khối DS ẩn với trình đọc màn hình — khung đọc một lần "Đang tải". */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  const t = useTheme();
  return (
    <View accessible accessibilityLabel="Đang tải" style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}>
          <Skeleton shape="Round" size="Medium - 40px" />
          <View style={{ flex: 1 }}>
            <SkeletonText lines={2} />
          </View>
        </View>
      ))}
    </View>
  );
}
