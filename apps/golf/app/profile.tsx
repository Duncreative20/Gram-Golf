import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Avatar, Badge, Button, Dialog, Screen, Text, useTheme } from '@gr/ds';
import { useStore } from '../lib/store';
import { formatValue, initials } from '../lib/format';
import { resetTo, StackHeader } from '../components/StackHeader';
import { FollowCounts } from '../components/People';

export default function Profile() {
  const t = useTheme();
  const { dispatch, me } = useStore();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  if (!me) return <Redirect href="/" />;
  const details =
    me.role === 'player'
      ? [me.handicap !== undefined && `Handicap ${formatValue(me.handicap)}`, me.homeClub]
      : [me.academy, me.yearsExperience !== undefined && `${me.yearsExperience} năm kinh nghiệm`];
  return (
    <Screen>
      <StackHeader title="Hồ sơ" />
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <View style={{ alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
          <Avatar size="2XLarge" theme={me.avatarUrl ? 'Photo' : 'Accent'} source={me.avatarUrl ? { uri: me.avatarUrl } : undefined} initials={initials(me.name)} accessibilityLabel={`Ảnh đại diện ${me.name}`} />
          <Text variant="Heading/3" style={{ textAlign: 'center' }}>{me.name}</Text>
          <View>
            <Badge text={me.role === 'player' ? 'Người chơi' : 'Huấn luyện viên'} theme="Accent" />
          </View>
          <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ textAlign: 'center' }}>
            {details.filter(Boolean).join(' · ')}
          </Text>
        </View>
        <FollowCounts userId={me.id} centered />
        <View style={{ gap: t.space('Spacing/Gap/Small') }}>
          <Button level="Secondary" size="Medium (Base)" leadingIcon="edit-02-line" text="Chỉnh sửa hồ sơ" onPress={() => router.push('/settings/account')} />
          <Button level="Tertiary" size="Medium (Base)" leadingIcon="settings-01-line" text="Cài đặt" onPress={() => router.push('/settings')} />
          <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="log-out-01-line" text="Đăng xuất" onPress={() => setConfirmSignOut(true)} />
        </View>
      </ScrollView>
      <Dialog
        visible={confirmSignOut}
        onRequestClose={() => setConfirmSignOut(false)}
        title="Đăng xuất?"
        body="Bạn sẽ cần đăng nhập lại để tiếp tục."
        primaryText="Đăng xuất"
        destructive
        onPrimary={() => {
          setConfirmSignOut(false);
          dispatch({ type: 'signOut' });
          resetTo('/');
        }}
        secondaryText="Huỷ"
      />
    </Screen>
  );
}
