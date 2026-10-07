import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { OtpField, Screen, SearchField, SelectField, StepperControl, Text, TextArea, useTheme } from '@gr/ds';
import { darkDemo } from '../../../lib/demo';

export default function Input2Gallery() {
  const t = useTheme();
  const [otp, setOtp] = useState('12');
  const [qty, setQty] = useState(2);
  const [q, setQ] = useState('');
  const [note, setNote] = useState('');
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }} keyboardShouldPersistTaps="handled">
        <Text variant="Heading/Subheading">Input/Text-Area</Text>
        <TextArea label="Ghi chú" placeholder="Nhập ghi chú…" value={note} onChangeText={setNote} helpText="Tối đa 500 ký tự" />
        <TextArea size="Small" placeholder="Small · error" error="Không được để trống" />
        <TextArea size="Large" placeholder="Large · disabled" disabled />
        <Text variant="Heading/Subheading">Input/Select-Field</Text>
        <SelectField label="Sân" placeholder="Chọn sân" onPress={() => {}} />
        <SelectField label="Đã chọn" value="Sân 18 lỗ" onPress={() => {}} />
        <SelectField label="Lỗi" placeholder="Chọn" error="Bắt buộc" onPress={() => {}} />
        <SelectField label="Disabled" value="—" disabled onPress={() => {}} />
        <Text variant="Heading/Subheading">OTP-Field · 6 XLarge / 4 Large</Text>
        <OtpField value={otp} onChangeText={setOtp} length={6} helpText="Nhập mã 6 số" />
        <OtpField value="1234" onChangeText={() => {}} length={4} size="Large" error="Mã không đúng" />
        <OtpField value="" onChangeText={() => {}} length={4} size="Large" disabled />
        <Text variant="Heading/Subheading">Stepper-Control-Split</Text>
        <View style={{ gap: t.space('Spacing/Gap/Small') }}>
          <StepperControl value={qty} onChange={setQty} min={0} max={9} size="XLarge" />
          <StepperControl value={qty} onChange={setQty} min={0} max={9} size="Large" />
          <StepperControl value={qty} onChange={setQty} min={0} max={9} size="Medium" />
          <StepperControl value={qty} onChange={setQty} min={0} max={9} size="Small" />
          <StepperControl value={1} onChange={() => {}} disabled />
        </View>
        <Text variant="Heading/Subheading">Search/Overlay</Text>
        <View style={[darkDemo(t), { gap: t.space('Spacing/Gap/Small') }]}>
          <SearchField overlay placeholder="Tìm trên nền tối" value={q} onChangeText={setQ} />
          <SearchField overlay type="Rounded" placeholder="Rounded" />
        </View>
      </ScrollView>
    </Screen>
  );
}
