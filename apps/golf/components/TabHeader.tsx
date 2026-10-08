import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar, Badge, IconButton, Text, useTheme } from '@gr/ds';
import { useStore } from '../lib/store';
import { unreadCount } from '../lib/selectors';
import { initials } from '../lib/format';
import { Logo } from './Logo';

/** Header màn tab: logo (hoặc tiêu đề) trái; chuông thông báo + avatar → hồ sơ phải. */
export function TabHeader({ title }: { title?: string }) {
  const t = useTheme();
  const { state, me } = useStore();
  const unread = me ? unreadCount(state, me.id) : 0;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space('Spacing/Gap/XSmall'),
        paddingHorizontal: t.layout('Margin-Small'),
        paddingVertical: t.space('Spacing/Padding/XSmall'),
      }}
    >
      <View style={{ flex: 1 }}>
        {title ? <Text variant="Heading/3" accessibilityRole="header" numberOfLines={1}>{title}</Text> : <Logo variant="full" size={t.primitive('gr-dm-32')} />}
      </View>
      <View>
        <IconButton
          type="Flat"
          level="Secondary"
          size="Small"
          icon="bell-01-line"
          accessibilityLabel={unread > 0 ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
          onPress={() => router.push('/notifications')}
        />
        {unread > 0 && (
          <View aria-hidden style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none' }}>
            <Badge text={String(unread)} size="XSmall" theme="Red" background="Solid" />
          </View>
        )}
      </View>
      {me && (
        // avatar XSmall < 44 px → nới vùng chạm
        <Pressable accessibilityRole="button" accessibilityLabel="Hồ sơ của tôi" hitSlop={t.space('Spacing/Gap/Small')} onPress={() => router.push('/profile')}>
          <Avatar size="XSmall" theme={me.avatarUrl ? 'Photo' : 'Accent'} source={me.avatarUrl ? { uri: me.avatarUrl } : undefined} initials={initials(me.name)} />
        </Pressable>
      )}
    </View>
  );
}
