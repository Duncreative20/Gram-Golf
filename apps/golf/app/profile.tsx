import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Avatar, Badge, Button, Dialog, Screen, Text, useTheme } from '@gr/ds';
import { useStore } from '../lib/store';
import { followerCount, followingCount } from '../lib/selectors';
import { initials } from '../lib/format';
import { StackHeader } from '../components/StackHeader';

export default function Profile() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  if (!me) return <Redirect href="/" />;
  const details =
    me.role === 'player'
      ? [me.handicap !== undefined && `Handicap ${me.handicap}`, me.homeClub]
      : [me.academy, me.yearsExperience !== undefined && `${me.yearsExperience} năm kinh nghiệm`];
  const counts = [
    { n: followerCount(state, me.id), label: 'Người theo dõi' },
    { n: followingCount(state, me.id), label: 'Đang theo dõi' },
  ];
  return (
    <Screen>
      <StackHeader title="Hồ sơ" />
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <View style={{ alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
          <Avatar size="2XLarge" initials={initials(me.name)} theme="Accent" accessibilityLabel={`Ảnh đại diện ${me.name}`} />
          <Text variant="Heading/3" style={{ textAlign: 'center' }}>{me.name}</Text>
          <View>
            <Badge text={me.role === 'player' ? 'Người chơi' : 'Huấn luyện viên'} theme="Accent" />
          </View>
          <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ textAlign: 'center' }}>
            {details.filter(Boolean).join(' · ')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: t.space('Spacing/Gap/2XLarge') }}>
          {counts.map((c) => (
            <View key={c.label} accessible accessibilityLabel={`${c.n} ${c.label}`} style={{ alignItems: 'center' }}>
              <Text variant="Heading/4">{String(c.n)}</Text>
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{c.label}</Text>
            </View>
          ))}
        </View>
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
          router.replace('/');
        }}
        secondaryText="Huỷ"
      />
    </Screen>
  );
}
