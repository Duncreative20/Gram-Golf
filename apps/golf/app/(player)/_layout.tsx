import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useStore } from '../../lib/store';
import { AppTabBar } from '../../components/AppTabBar';

export default function PlayerTabs() {
  const { me } = useStore();
  if (me?.role !== 'player') return <Redirect href="/" />;
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <AppTabBar {...p} />}>
      <Tabs.Screen name="home" options={{ title: 'Tổng quan' }} />
      <Tabs.Screen name="metrics" options={{ title: 'Thông số' }} />
      <Tabs.Screen name="swings" options={{ title: 'Swing' }} />
      <Tabs.Screen name="community" options={{ title: 'Cộng đồng' }} />
      <Tabs.Screen name="coach" options={{ title: 'HLV' }} />
    </Tabs>
  );
}
