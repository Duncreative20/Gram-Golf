import { Redirect } from 'expo-router';
import { useStore } from '../lib/store';

export default function Index() {
  const { me } = useStore();
  // Tạm trỏ màn chọn hồ sơ dev — Task 4 đổi thành /(auth)/welcome.
  if (!me) return <Redirect href="/settings/dev" />;
  return <Redirect href={me.role === 'player' ? '/(player)/home' : '/(coach)/roster'} />;
}
