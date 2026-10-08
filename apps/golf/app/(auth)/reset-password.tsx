import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, EmptyState, Screen, Text, TextField, useTheme } from '@gr/ds';
import { resetTokenStatus } from '../../lib/simulate';
import { validateNewPassword } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';

/** Đặt lại mật khẩu từ link trong email (mô phỏng): `?token=` hợp lệ → nhập mật khẩu mới 2 lần → Đăng nhập (kèm thông báo).
 *  Link hết hạn / thiếu / sai → xin link mới. Deep link: gramgolf://reset-password?token=… */
export default function ResetPassword() {
  const t = useTheme();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const status = resetTokenStatus(token);
  const errors = submitted ? validateNewPassword(password, confirm) : {};
  const save = () => {
    setSubmitted(true);
    if (Object.keys(validateNewPassword(password, confirm)).length) return;
    // ponytail: bản mock không lưu mật khẩu (đăng nhập nhận mọi mật khẩu ≥ 6 ký tự) — backend thật đổi mật khẩu + vô hiệu token.
    router.replace({ pathname: '/(auth)/login', params: { reset: '1' } });
  };
  if (status !== 'ok') {
    const expired = status === 'expired';
    return (
      <Screen>
        <StackHeader title="Đặt lại mật khẩu" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState
            icon="link-broken-01-line"
            title={expired ? 'Link đã hết hạn' : 'Link không hợp lệ'}
            caption={expired ? 'Link đặt lại mật khẩu chỉ dùng được trong 30 phút. Gửi lại link mới để tiếp tục.' : 'Link bị thiếu hoặc sai. Mở link mới nhất trong email, hoặc gửi lại link.'}
            primaryText="Gửi lại link"
            onPrimary={() => router.replace('/(auth)/forgot-password')}
          />
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <StackHeader title="Đặt lại mật khẩu" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">Đặt mật khẩu mới cho tài khoản của bạn.</Text>
        <TextField
          label="Mật khẩu mới"
          placeholder="Tối thiểu 8 ký tự, có chữ số"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leadingIcon="lock-01-line"
          secureTextEntry={!show}
          autoComplete="new-password"
          autoCapitalize="none"
          trailingIcon={show ? 'eye-off-line' : 'eye-line'}
          trailingAccessibilityLabel={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onTrailingPress={() => setShow((s) => !s)}
        />
        <TextField
          label="Nhập lại mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          leadingIcon="lock-01-line"
          secureTextEntry={!show}
          autoComplete="new-password"
          autoCapitalize="none"
          onSubmitEditing={save}
        />
        <Button text="Đặt lại mật khẩu" onPress={save} />
      </ScrollView>
    </Screen>
  );
}
