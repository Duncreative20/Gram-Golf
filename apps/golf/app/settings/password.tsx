import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Divider, Screen, TextField, useTheme } from '@gr/ds';
import { validatePasswordChange } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { AlertMessage, SavedToast } from '../../components/Feedback';
import { KeyboardAvoid } from '../../components/KeyboardAvoid';

const back = () => (router.canGoBack() ? router.back() : router.replace('/settings'));
type Key = 'current' | 'next' | 'confirm';
const FIELDS: { key: Key; label: string; placeholder: string; helpText?: string; autoComplete: 'current-password' | 'new-password' }[] = [
  { key: 'current', label: 'Mật khẩu hiện tại', placeholder: '••••••••', autoComplete: 'current-password' },
  { key: 'next', label: 'Mật khẩu mới', placeholder: 'Tối thiểu 8 ký tự, có chữ số', helpText: 'Tối thiểu 8 ký tự, có ít nhất 1 chữ số', autoComplete: 'new-password' },
  { key: 'confirm', label: 'Nhập lại mật khẩu mới', placeholder: '••••••••', autoComplete: 'new-password' },
];

/** Đổi mật khẩu (mock — không gọi server, không lưu mật khẩu). */
export default function PasswordSettings() {
  const t = useTheme();
  const [raw, setRaw] = useState<Record<Key, string>>({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const all = validatePasswordChange(raw);
  const errors = submitted ? all : {};
  const invalid = Object.keys(all).length;
  return (
    <Screen>
      <StackHeader title="Mật khẩu" />
      <KeyboardAvoid>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          {FIELDS.map((f) => (
            <TextField
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              helpText={f.helpText}
              autoComplete={f.autoComplete}
              autoCapitalize="none"
              secureTextEntry={!show}
              value={raw[f.key]}
              onChangeText={(v) => setRaw((r) => ({ ...r, [f.key]: v }))}
              error={errors[f.key]}
              // hiện/ẩn áp cho cả 3 ô — so được mật khẩu mới với ô nhập lại
              trailingIcon={show ? 'eye-off-line' : 'eye-line'}
              trailingAccessibilityLabel={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onTrailingPress={() => setShow((s) => !s)}
            />
          ))}
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
          {submitted && invalid > 0 && <AlertMessage theme="Negative" text={`Chưa đổi: ${invalid} trường cần sửa.`} />}
          <Button
            text="Đổi mật khẩu"
            disabled={done}
            onPress={() => {
              setSubmitted(true);
              if (!invalid) setDone(true);
            }}
          />
        </View>
      </KeyboardAvoid>
      {done && <SavedToast title="Đã đổi mật khẩu" onDone={back} />}
    </Screen>
  );
}
