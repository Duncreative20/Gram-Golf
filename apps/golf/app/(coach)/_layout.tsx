import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useStore } from '../../lib/store';
import { AppTabBar } from '../../components/AppTabBar';

export default function CoachTabs() {
  const { me } = useStore();
  if (me?.role !== 'coach') return <Redirect href="/" />;
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <AppTabBar {...p} />}>
      <Tabs.Screen name="roster" options={{ title: 'Học viên' }} />
      <Tabs.Screen name="community" options={{ title: 'Cộng đồng' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Thông báo' }} />
      <Tabs.Screen name="me" options={{ title: 'Hồ sơ' }} />
    </Tabs>
  );
}
