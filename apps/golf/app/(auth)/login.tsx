import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, InlineMessage, Screen, TextField, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { StackHeader } from '../../components/StackHeader';

export default function Login() {
  const t = useTheme();
  const { state, dispatch } = useStore();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failed, setFailed] = useState(false);
  const { reset } = useLocalSearchParams<{ reset?: string }>();
  const q = account.trim();
  const submit = () => {
    setSubmitted(true);
    if (!q || !password) return;
    // ponytail: mock — khớp email (không phân biệt hoa thường) hoặc SĐT, mật khẩu bất kỳ ≥6 ký tự; auth thật thay ở backend.
    const digits = (v: string) => v.replace(/\s/g, '');
    const found = state.profiles.find((p) => p.email.toLowerCase() === q.toLowerCase() || digits(p.phone) === digits(q));
    if (!found || password.length < 6) return setFailed(true);
    dispatch({ type: 'signIn', userId: found.id });
    router.replace('/');
  };
  return (
    <Screen>
      <StackHeader title="Đăng nhập" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
        {reset === '1' && !failed && <InlineMessage theme="Positive" text="Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới." />}
        {failed && <InlineMessage theme="Negative" text="Email/SĐT hoặc mật khẩu không đúng" />}
        <TextField
          label="Email hoặc số điện thoại"
          placeholder="ban@email.com"
          value={account}
          onChangeText={(v) => (setAccount(v), setFailed(false))}
          error={submitted && !q ? 'Bắt buộc' : undefined}
          leadingIcon="user-circle-line"
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="email-address"
        />
        <TextField
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={password}
          onChangeText={(v) => (setPassword(v), setFailed(false))}
          error={submitted && !password ? 'Bắt buộc' : undefined}
          leadingIcon="lock-01-line"
          secureTextEntry={!showPassword}
          autoComplete="current-password"
          trailingIcon={showPassword ? 'eye-off-line' : 'eye-line'}
          trailingAccessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onTrailingPress={() => setShowPassword((s) => !s)}
          onSubmitEditing={submit}
        />
        <View style={{ alignItems: 'flex-end' }}>
          <Button type="Flat" level="Accent" size="Small" text="Quên mật khẩu?" onPress={() => router.push('/(auth)/forgot-password')} />
        </View>
        <Button text="Đăng nhập" onPress={submit} />
        <Button level="Tertiary" size="Medium (Base)" text="Chưa có tài khoản? Tạo tài khoản" onPress={() => router.replace('/(auth)/register')} />
      </ScrollView>
    </Screen>
  );
}
