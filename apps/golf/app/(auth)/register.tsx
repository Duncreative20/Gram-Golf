import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, RadioRow, Screen, Stepper, TextField, useTheme, type TextFieldProps } from '@gr/ds';
import type { Role } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { validateRegistration, type RegistrationRaw } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';

const ROLES: { role: Role; label: string; caption: string }[] = [
  { role: 'player', label: 'Người chơi', caption: 'Lưu thông số, bộ gậy, video swing và nhận góp ý từ HLV.' },
  { role: 'coach', label: 'Huấn luyện viên', caption: 'Mời học viên, theo dõi tiến bộ và ghi chú trên từng cú swing.' },
];
const EMPTY: RegistrationRaw = { name: '', email: '', phone: '', password: '', handicap: '', academy: '', yearsExperience: '' };

export default function Register() {
  const t = useTheme();
  const { state } = useStore();
  const [role, setRole] = useState<Role>();
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const result = role ? validateRegistration(role, raw, state.profiles) : undefined;
  const field = (key: keyof RegistrationRaw, props: Omit<TextFieldProps, 'value' | 'onChangeText' | 'error'>) => (
    <TextField {...props} value={raw[key]} onChangeText={(v) => setRaw((r) => ({ ...r, [key]: v }))} error={submitted ? result?.errors[key] : undefined} />
  );
  const next = () => {
    if (step === 0) return setStep(1);
    setSubmitted(true);
    // Mật khẩu không đi qua params (URL) — bản mock không lưu mật khẩu.
    if (result?.value) router.push({ pathname: '/(auth)/verify-otp', params: { draft: JSON.stringify(result.value) } });
  };
  return (
    <Screen>
      <StackHeader title="Tạo tài khoản" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Stepper current={step} steps={[{ title: 'Vai trò', caption: 'Bạn là ai' }, { title: 'Thông tin', caption: 'Hồ sơ cơ bản' }]} />
        {step === 0 ? (
          <View accessibilityRole="radiogroup" accessibilityLabel="Vai trò" style={{ gap: t.space('Spacing/Gap/Small') }}>
            {ROLES.map((r) => (
              <Card
                key={r.role}
                theme={role === r.role ? 'Semi-Pale' : 'Border'}
                spacing="Small"
                style={role === r.role ? { borderColor: t.color('Color/Border/Accent/Solid/Default') } : undefined}
              >
                <RadioRow label={r.label} caption={r.caption} select={role === r.role} onPress={() => setRole(r.role)} />
              </Card>
            ))}
          </View>
        ) : (
          <View style={{ gap: t.space('Spacing/Gap/Medium') }}>
            {field('name', { label: 'Họ tên', placeholder: 'Nguyễn Văn A', autoComplete: 'name' })}
            {field('email', { label: 'Email', placeholder: 'ban@email.com', autoCapitalize: 'none', autoComplete: 'email', keyboardType: 'email-address' })}
            {field('phone', { label: 'Số điện thoại', placeholder: '0912345678', autoComplete: 'tel', keyboardType: 'phone-pad' })}
            {field('password', {
              label: 'Mật khẩu',
              placeholder: 'Tối thiểu 8 ký tự, có chữ số',
              autoComplete: 'new-password',
              secureTextEntry: !showPassword,
              trailingIcon: showPassword ? 'eye-off-line' : 'eye-line',
              trailingAccessibilityLabel: showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu',
              onTrailingPress: () => setShowPassword((s) => !s),
            })}
            {role === 'player'
              ? field('handicap', { label: 'Handicap', placeholder: 'VD: 18,5', helpText: 'Từ 0 đến 54', keyboardType: 'decimal-pad' })
              : (
                <>
                  {field('academy', { label: 'Học viện / CLB', placeholder: 'VD: Học viện Golf Sông Bé' })}
                  {field('yearsExperience', { label: 'Số năm kinh nghiệm', placeholder: 'VD: 8', helpText: 'Từ 0 đến 60', keyboardType: 'number-pad' })}
                </>
              )}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
          {step === 1 && (
            <View style={{ flex: 1 }}>
              <Button level="Tertiary" text="Quay lại" onPress={() => setStep(0)} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Button text="Tiếp" trailingIcon="arrow-right-line" disabled={!role} onPress={next} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
