import { View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BottomNavigation, useTheme, type IconName } from '@gr/ds';

/** Icon theo tên route tab (cả nhóm player lẫn coach). Nhãn lấy từ `options.title` của `Tabs.Screen`. */
const TAB_ICONS: Record<string, { icon: IconName; iconSelected?: IconName }> = {
  home: { icon: 'home-02-line', iconSelected: 'home-02-solid' },
  metrics: { icon: 'bar-chart-square-02-line', iconSelected: 'bar-chart-square-02-solid' },
  swings: { icon: 'video-recorder-line', iconSelected: 'video-recorder-solid' },
  community: { icon: 'message-chat-circle-line', iconSelected: 'message-chat-circle-solid' },
  coach: { icon: 'user-check-line', iconSelected: 'user-check-solid' },
  roster: { icon: 'users-line', iconSelected: 'users-solid' },
  inbox: { icon: 'bell-01-line', iconSelected: 'bell-01-solid' },
  me: { icon: 'user-circle-line', iconSelected: 'user-circle-solid' },
};

/** `tabBar` cho `Tabs` của expo-router: BottomNavigation của DS ở đáy, chừa inset an toàn. */
export function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const t = useTheme();
  const items = state.routes.map((r) => ({ label: descriptors[r.key]?.options.title ?? r.name, ...TAB_ICONS[r.name]! }));
  return (
    <View
      style={{
        backgroundColor: t.color('Color/Background/Canvas/Alt'),
        paddingTop: t.space('Spacing/Padding/XSmall'),
        paddingBottom: Math.max(insets.bottom, t.space('Spacing/Padding/XSmall')),
      }}
    >
      <BottomNavigation items={items} selectedIndex={state.index} onChange={(i) => navigation.navigate(state.routes[i]!.name)} theme="Accent" />
    </View>
  );
}
