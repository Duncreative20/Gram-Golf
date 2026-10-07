import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Avatar, Button, Dialog, ListItem, Screen, Text, useTheme } from '@gr/ds';
import type { Role } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { initials } from '../../lib/format';
import { StackHeader } from '../../components/StackHeader';

const GROUPS: { role: Role; label: string }[] = [
  { role: 'player', label: 'Người chơi' },
  { role: 'coach', label: 'HLV' },
];

/** D13 — chỉ bản dev: đổi hồ sơ mẫu (vai trò), đặt lại dữ liệu, mở gallery DS. */
export default function DevSettings() {
  const t = useTheme();
  const { state, dispatch } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!__DEV__) return <Redirect href="/" />; // D13: deep link ở bản release không được đổi tài khoản
  const section = (label: string) => (
    <Text variant="Label/Small/DemiBold" color="Color/Content/Neutral/Light" accessibilityRole="header" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
      {label}
    </Text>
  );
  return (
    <Screen>
      <StackHeader title="Dev" subtitle="Chỉ có ở bản phát triển" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Large') }}>
        {GROUPS.map((g) => (
          <View key={g.role} style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            {section(g.label)}
            <View>
              {state.profiles
                .filter((p) => p.role === g.role)
                .map((p) => (
                  <ListItem
                    key={p.id}
                    title={p.name}
                    caption={p.role === 'player' ? `${p.id} · Handicap ${p.handicap ?? '—'}` : `${p.id} · ${p.academy ?? ''}`}
                    leading={<Avatar size="Medium" initials={initials(p.name)} theme="Accent" />}
                    selected={p.id === state.sessionUserId}
                    onPress={() => {
                      dispatch({ type: 'signIn', userId: p.id });
                      router.replace('/');
                    }}
                  />
                ))}
            </View>
          </View>
        ))}
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          {section('Dữ liệu')}
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
            <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="refresh-cw-01-line" text="Đặt lại dữ liệu mẫu" onPress={() => setConfirmReset(true)} />
            <Button level="Tertiary" size="Medium (Base)" leadingIcon="palette-line" text="Gallery DS" onPress={() => router.push('/(dev)/ds')} />
          </View>
        </View>
      </ScrollView>
      <Dialog
        visible={confirmReset}
        onRequestClose={() => setConfirmReset(false)}
        theme="Warning"
        title="Đặt lại dữ liệu mẫu?"
        body="Mọi thay đổi trong phiên (thông số, swing, bài viết, kết nối…) sẽ mất. Hồ sơ đang đăng nhập được giữ."
        primaryText="Đặt lại"
        destructive
        onPrimary={() => {
          setConfirmReset(false);
          dispatch({ type: 'reset' });
        }}
        secondaryText="Huỷ"
      />
    </Screen>
  );
}
