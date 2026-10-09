import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, EmptyState, OtpField, Screen, Text, useTheme } from '@gr/ds';
import { useStore } from '../../lib/store';
import { newId } from '../../lib/ids';
import { NOW } from '../../lib/mock';
import { parseRegistrationDraft } from '../../lib/validation';
import { resetTo, StackHeader } from '../../components/StackHeader';

// ponytail: mã OTP cố định cho bản mock — gửi/kiểm mã thật ở backend.
const MOCK_OTP = '123456';
const RESEND_SEC = 60;

export default function VerifyOtp() {
  const t = useTheme();
  const { dispatch } = useStore();
  const draft = parseRegistrationDraft(useLocalSearchParams<{ draft?: string }>().draft);
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const [wait, setWait] = useState(RESEND_SEC);
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  if (!draft) {
    return (
      <Screen>
        <StackHeader title="Xác minh" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState icon="alert-triangle-line" title="Thiếu thông tin đăng ký" caption="Vui lòng điền lại biểu mẫu đăng ký." primaryText="Đăng ký lại" onPrimary={() => router.replace('/(auth)/register')} />
        </View>
      </Screen>
    );
  }
  const verify = (c = code) => {
    if (c !== MOCK_OTP) return setWrong(true);
    dispatch({ type: 'register', profile: { ...draft, id: newId('u'), createdAt: NOW } });
    resetTo('/(auth)/onboarding'); // welcome + form đăng ký không còn dưới onboarding
  };
  return (
    <Screen>
      <StackHeader title="Xác minh số điện thoại" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">
          Nhập mã 6 số đã gửi tới {draft.phone}.
        </Text>
        <OtpField
          value={code}
          onChangeText={(v) => (setCode(v), setWrong(false))}
          onComplete={verify}
          error={wrong ? 'Mã không đúng, vui lòng thử lại' : undefined}
        />
        {__DEV__ && <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Mã thử: {MOCK_OTP}</Text>}
        <Button text="Xác nhận" disabled={code.length < 6} onPress={() => verify()} />
        <Button
          level="Tertiary"
          size="Medium (Base)"
          text={wait > 0 ? `Gửi lại mã sau ${wait} s` : 'Gửi lại mã'}
          disabled={wait > 0}
          onPress={() => (setWait(RESEND_SEC), setCode(''), setWrong(false))}
        />
      </ScrollView>
    </Screen>
  );
}
