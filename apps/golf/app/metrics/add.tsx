import { ScrollView, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { DockIcon, Icon, ListItem, Screen, Tag, useTheme, type IconName } from '@gr/ds';
import { useStore } from '../../lib/store';
import { StackHeader } from '../../components/StackHeader';

const SOURCES: { href: Href; icon: IconName; title: string; caption: string; beta?: boolean }[] = [
  { href: '/metrics/manual', icon: 'keyboard-number-line', title: 'Nhập tay', caption: 'Gõ chỉ số swing hoặc thể lực của một buổi tập' },
  { href: '/metrics/import-csv', icon: 'file-chart-line', title: 'Nhập file CSV', caption: 'File xuất từ máy đo TrackMan hoặc Foresight' },
  { href: '/metrics/import-photo', icon: 'image-line', title: 'Ảnh chụp màn hình', caption: 'Đọc số từ ảnh màn hình máy đo, bạn kiểm tra lại trước khi lưu' },
  { href: '/metrics/scan-qr', icon: 'scan-line', title: 'Quét QR', caption: 'Liên kết phiên ở sân tập có máy đo', beta: true },
];

/** Chọn nguồn số liệu — mở dạng sheet (`presentation: 'modal'` khai ở `app/_layout.tsx`). */
export default function MetricsAdd() {
  const t = useTheme();
  const { me } = useStore();
  if (me?.role !== 'player') return <Redirect href="/" />;
  return (
    <Screen>
      <StackHeader title="Nhập số liệu" subtitle="Chọn nguồn dữ liệu" />
      <ScrollView>
        {SOURCES.map((s) => (
          <ListItem
            key={s.title}
            title={s.title}
            caption={s.caption}
            leading={<DockIcon icon={s.icon} theme="Accent" />}
            trailing={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
                {s.beta && <Tag size="Small" text="Thử nghiệm" />}
                <Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />
              </View>
            }
            // thay sheet bằng màn đã chọn → "quay lại"/lưu xong về đúng màn đã mở sheet
            onPress={() => router.replace(s.href)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}
