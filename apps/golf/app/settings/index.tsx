import { ScrollView } from 'react-native';
import { router, type Href } from 'expo-router';
import { Icon, ListItem, Screen, type IconName } from '@gr/ds';
import { useStore } from '../../lib/store';
import { StackHeader } from '../../components/StackHeader';

const ROWS: { title: string; caption?: string; icon: IconName; href: Href }[] = [
  { title: 'Tài khoản', caption: 'Tên, số điện thoại, giới thiệu', icon: 'user-circle-line', href: '/settings/account' },
  { title: 'Mật khẩu', icon: 'lock-01-line', href: '/settings/password' },
  { title: 'Quyền riêng tư', caption: 'Ai xem được bộ gậy, swing; người đã chặn', icon: 'shield-line', href: '/settings/privacy' },
  { title: 'Thông báo', icon: 'bell-01-line', href: '/settings/notifications' },
  { title: 'Đơn vị đo', caption: 'Mét hoặc yard', icon: 'sliders-01-line', href: '/settings/units' },
  ...(__DEV__ ? [{ title: 'Dev', caption: 'Đổi hồ sơ mẫu, đặt lại dữ liệu', icon: 'code-snippet-02-line' as const, href: '/settings/dev' as const }] : []),
];

export default function Settings() {
  const { me } = useStore();
  return (
    <Screen>
      <StackHeader title="Cài đặt" />
      <ScrollView>
        {ROWS.map((r) => (
          <ListItem
            key={r.title}
            title={r.title}
            // HLV không có công tắc công khai bộ gậy / swing (settings/privacy)
            caption={me?.role === 'coach' && r.href === '/settings/privacy' ? 'Người đã chặn, xoá tài khoản' : r.caption}
            leading={<Icon name={r.icon} />}
            trailing={<Icon name="chevron-right-line-medium" color="Color/Content/Neutral/Light" />}
            onPress={() => router.push(r.href)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}
