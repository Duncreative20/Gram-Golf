import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, Text, useTheme } from '@gr/ds';
import { Logo } from '../../components/Logo';

export default function Welcome() {
  const t = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, padding: t.layout('Margin-Comfortable'), gap: t.space('Spacing/Gap/Large') }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: t.space('Spacing/Gap/Large') }}>
          <Logo variant="full" size={t.primitive('gr-dm-64')} />
          <Text variant="Heading/3" color="Color/Content/Neutral/Base" style={{ textAlign: 'center' }}>
            Theo dõi phong độ. Kết nối HLV. Cùng tiến bộ.
          </Text>
        </View>
        <View style={{ gap: t.space('Spacing/Gap/Small') }}>
          <Button text="Tạo tài khoản" onPress={() => router.push('/(auth)/register')} />
          <Button level="Secondary" text="Đăng nhập" onPress={() => router.push('/(auth)/login')} />
          {__DEV__ && <Button type="Flat" level="Primary" size="Small" text="Dùng tài khoản mẫu" onPress={() => router.push('/settings/dev')} />}
        </View>
      </View>
    </Screen>
  );
}
