import { Redirect } from 'expo-router';
import { useStore } from '../lib/store';

export default function Index() {
  const { me } = useStore();
  if (!me) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href={me.role === 'player' ? '/(player)/home' : '/(coach)/roster'} />;
}
