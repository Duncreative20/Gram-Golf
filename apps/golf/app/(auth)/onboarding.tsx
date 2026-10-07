import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { Avatar, Button, PageIndicator, RadioRow, Screen, Text, useTheme } from '@gr/ds';
import type { Units } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { initials } from '../../lib/format';

// ponytail: ảnh mẫu thay cho thư viện ảnh/camera — bản thật dùng expo-image-picker + upload.
const SAMPLE_AVATARS = [12, 33, 47, 59].map((n) => `https://i.pravatar.cc/300?img=${n}`);
const UNITS: { value: Units; label: string; caption: string }[] = [
  { value: 'metric', label: 'Mét', caption: 'Khoảng cách theo mét (m)' },
  { value: 'imperial', label: 'Yard', caption: 'Khoảng cách theo yard (yd)' },
];

export default function Onboarding() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [step, setStep] = useState(0);
  if (!me) return <Redirect href="/" />;
  const units = prefsOf(state, me.id).units;
  // Thay cả nhóm (auth) ở stack gốc → không quay lại được luồng đăng ký.
  const finish = (href: Href = '/') => router.replace(href);
  const pickAvatar = () => {
    const i = me.avatarUrl ? SAMPLE_AVATARS.indexOf(me.avatarUrl) : -1;
    dispatch({ type: 'updateProfile', id: me.id, patch: { avatarUrl: SAMPLE_AVATARS[(i + 1) % SAMPLE_AVATARS.length] } });
  };
  const pages = [
    {
      title: 'Ảnh đại diện',
      caption: 'Giúp HLV và bạn bè nhận ra bạn.',
      body: (
        <View style={{ alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
          <Avatar size="3XLarge" theme={me.avatarUrl ? 'Photo' : 'Accent'} source={me.avatarUrl ? { uri: me.avatarUrl } : undefined} initials={initials(me.name)} accessibilityLabel={`Ảnh đại diện ${me.name}`} />
          <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
            <Button level="Secondary" size="Medium (Base)" leadingIcon="image-plus-line" text={me.avatarUrl ? 'Đổi ảnh' : 'Chọn ảnh'} onPress={pickAvatar} />
            {me.avatarUrl && <Button level="Tertiary" size="Medium (Base)" text="Dùng chữ tắt" onPress={() => dispatch({ type: 'updateProfile', id: me.id, patch: { avatarUrl: undefined } })} />}
          </View>
        </View>
      ),
    },
    {
      title: 'Đơn vị đo',
      caption: 'Đổi lại bất cứ lúc nào trong Cài đặt.',
      body: (
        <View accessibilityRole="radiogroup" accessibilityLabel="Đơn vị đo">
          {UNITS.map((u) => (
            <RadioRow key={u.value} label={u.label} caption={u.caption} select={units === u.value} onPress={() => dispatch({ type: 'setPrefs', userId: me.id, patch: { units: u.value } })} />
          ))}
        </View>
      ),
    },
    me.role === 'player'
      ? {
          title: 'Bạn có mã mời từ HLV?',
          caption: 'Nhập mã để kết nối — HLV sẽ xem được thông số, swing và bộ gậy của bạn.',
          body: <Button level="Secondary" leadingIcon="key-line" text="Nhập mã" onPress={() => finish('/connect/accept')} />,
        }
      : {
          title: 'Mời học viên đầu tiên',
          caption: 'Tạo mã mời có hạn 7 ngày và gửi cho học viên.',
          body: <Button level="Secondary" leadingIcon="user-plus-line" text="Tạo mã mời" onPress={() => finish('/connect/invite')} />,
        },
  ];
  const page = pages[step]!;
  const last = step === pages.length - 1;
  return (
    <Screen>
      <View style={{ flex: 1, padding: t.layout('Margin-Comfortable'), gap: t.space('Spacing/Gap/Large') }}>
        <View style={{ alignItems: 'center' }}>
          <PageIndicator count={pages.length} active={step} state="Accent" />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: t.space('Spacing/Gap/XLarge') }}>
          <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <Text variant="Heading/2" accessibilityRole="header" style={{ textAlign: 'center' }}>{page.title}</Text>
            <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ textAlign: 'center' }}>{page.caption}</Text>
          </View>
          {page.body}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
          <View style={{ flex: 1 }}>
            {step > 0 && <Button level="Tertiary" text="Quay lại" onPress={() => setStep(step - 1)} />}
          </View>
          <View style={{ flex: 1 }}>
            <Button level={last ? 'Tertiary' : 'Primary'} text={last ? 'Để sau' : 'Tiếp'} onPress={() => (last ? finish() : setStep(step + 1))} />
          </View>
        </View>
      </View>
    </Screen>
  );
}
