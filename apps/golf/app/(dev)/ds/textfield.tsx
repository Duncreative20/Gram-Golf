import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Screen, SearchField, Text, TextField, useTheme, type InputSize } from '@gr/ds';

const SIZES: InputSize[] = ['Small', 'Medium (Base)', 'Large', 'XLarge'];

export default function TextFieldGallery() {
  const t = useTheme();
  const [v, setV] = useState('');
  const [q, setQ] = useState('');
  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }} keyboardShouldPersistTaps="handled">
          <Text variant="Heading/Subheading">Input/Text-Field · Search</Text>
          <TextField label="Họ tên" placeholder="Nhập họ tên" helpText="Tên hiển thị trên hồ sơ" value={v} onChangeText={setV} clearable leadingIcon="user-circle-line" />
          {SIZES.map((s) => <TextField key={s} size={s} placeholder={`Size=${s}`} />)}
          <TextField label="Email" placeholder="you@example.com" error="Email không hợp lệ" />
          <TextField label="Read-only" value="Không sửa được" readOnly />
          <TextField label="Disabled" placeholder="Disabled" disabled helpText="Không khả dụng" />
          <TextField label="Mật khẩu" placeholder="••••••" secureTextEntry trailingIcon="eye-line" trailingAccessibilityLabel="Hiện mật khẩu" onTrailingPress={() => {}} />
          <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Search/Default · Type=Default / Rounded</Text>
          <SearchField placeholder="Tìm sân golf" value={q} onChangeText={setQ} />
          <SearchField type="Rounded" placeholder="Tìm sân golf" value={q} onChangeText={setQ} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
