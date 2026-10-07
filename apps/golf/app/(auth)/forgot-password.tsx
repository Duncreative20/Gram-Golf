import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, EmptyState, Screen, Text, TextField, useTheme } from '@gr/ds';
import { EMAIL_RE } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';

export default function ForgotPassword() {
  const t = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const value = email.trim();
  const error = !submitted ? undefined : !value ? 'Bắt buộc' : !EMAIL_RE.test(value) ? 'Email không hợp lệ' : undefined;
  return (
    <Screen>
      <StackHeader title="Quên mật khẩu" />
      {sent ? (
        // Không tiết lộ email có tài khoản hay không — luôn báo đã gửi.
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState icon="mail-01-line" title="Kiểm tra hộp thư" caption={`Đã gửi hướng dẫn đặt lại mật khẩu tới ${value}.`} primaryText="Về đăng nhập" onPrimary={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))} />
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">
            Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </Text>
          <TextField label="Email" placeholder="ban@email.com" value={email} onChangeText={setEmail} error={error} leadingIcon="mail-01-line" autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
          <Button
            text="Gửi hướng dẫn"
            onPress={() => {
              setSubmitted(true);
              if (EMAIL_RE.test(value)) setSent(true);
            }}
          />
        </ScrollView>
      )}
    </Screen>
  );
}
