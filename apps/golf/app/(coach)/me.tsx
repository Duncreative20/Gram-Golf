import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, Screen, Text, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { TabHeader } from '../../components/TabHeader';
import { CoachSummary } from '../../components/CoachSummary';
import { PostsSection, useShareToast } from '../../components/PostItem';
import { FollowCounts } from '../../components/People';

/** Tab Hồ sơ của HLV: hồ sơ công khai của chính mình (như người khác thấy ở coaches/[id]) + sửa hồ sơ, cài đặt; bài đã đăng. */
export default function CoachMe() {
  const t = useTheme();
  const { me } = useStore();
  const share = useShareToast();
  if (!me) return <Redirect href="/" />;
  return (
    <Screen edges={['top']}>
      <TabHeader title="Hồ sơ" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <CoachSummary coach={me} />
          {me.bio ? <Text variant="Body/Base/Regular">{me.bio}</Text> : null}
          <FollowCounts userId={me.id} />
          <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
            <View style={{ flex: 1 }}>
              <Button level="Secondary" size="Medium (Base)" leadingIcon="edit-02-line" text="Chỉnh sửa hồ sơ" onPress={() => router.push('/settings/account')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button level="Tertiary" size="Medium (Base)" leadingIcon="settings-01-line" text="Cài đặt" onPress={() => router.push('/settings')} />
            </View>
          </View>
        </View>
        <PostsSection authorId={me.id} onShared={share.onShared} />
      </ScrollView>
      {share.toast}
    </Screen>
  );
}
