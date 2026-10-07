import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, EmptyState, Screen, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { swingsOf } from '../../lib/selectors';
import { TabHeader } from '../../components/TabHeader';
import { SwingCard } from '../../components/SwingCard';

export default function PlayerSwings() {
  const t = useTheme();
  const { state, me } = useStore();
  if (!me) return <Redirect href="/" />;
  const swings = swingsOf(state, me.id);
  const post = () => router.push('/swings/new');
  return (
    <Screen edges={['top']}>
      <TabHeader title="Swing" />
      {swings.length > 0 ? (
        <>
          <ScrollView
            contentContainerStyle={{
              padding: t.layout('Margin-Small'),
              // chừa chỗ cho nút nổi "Đăng swing"
              paddingBottom: t.size('Button/Size/Medium') + 2 * t.layout('Margin-Small'),
              gap: t.space('Spacing/Gap/Small'),
            }}
          >
            {swings.map((w) => (
              <SwingCard key={w.id} swing={w} />
            ))}
          </ScrollView>
          <View style={{ position: 'absolute', right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
            <Button size="Medium (Base)" leadingIcon="video-recorder-line" text="Đăng swing" onPress={post} />
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState
            icon="video-recorder-line"
            title="Chưa có swing nào"
            caption="Quay video swing theo hướng dẫn rồi đăng lên để nhận phân tích ước lượng và ghi chú từ HLV."
            primaryText="Đăng swing"
            onPrimary={post}
          />
        </View>
      )}
    </Screen>
  );
}
