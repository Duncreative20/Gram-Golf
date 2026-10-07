import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { DateField, FieldGroup, MessageInput, NumberField, Screen, Text, useTheme } from '@gr/ds';
import { darkDemo } from '../../../lib/demo';

export default function Input3Gallery() {
  const t = useTheme();
  const [msg, setMsg] = useState('');
  const [msg2, setMsg2] = useState('Hẹn 7h sân A nhé');
  const [n, setN] = useState<number | null>(2);
  const [m, setM] = useState<number | null>(null);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }} keyboardShouldPersistTaps="handled">
        <Text variant="Heading/Subheading">Input/Message-Input</Text>
        <MessageInput placeholder="Nhắn gì đó…" value={msg} onChangeText={setMsg} onSend={() => setMsg('')} />
        <MessageInput value={msg2} onChangeText={setMsg2} onSend={() => setMsg2('')} helpText="Có chữ → nút gửi" />
        <MessageInput value="Không gửi được" onChangeText={() => {}} error="Mất kết nối" />
        <MessageInput value="Chỉ đọc" onChangeText={() => {}} readOnly />
        <MessageInput placeholder="Disabled" disabled />
        <Text variant="Heading/Subheading">Input/Message-Input-Overlay</Text>
        <View style={[darkDemo(t), { gap: t.space('Spacing/Gap/Small') }]}>
          <MessageInput overlay placeholder="Trả lời story…" value={msg} onChangeText={setMsg} onSend={() => setMsg('')} />
          <MessageInput overlay value={msg2} onChangeText={setMsg2} onSend={() => setMsg2('')} />
          <MessageInput overlay value="Lỗi" onChangeText={() => {}} error="Mất kết nối" />
          <MessageInput overlay placeholder="Disabled" disabled />
        </View>
        <Text variant="Heading/Subheading">Input/Date-Field</Text>
        <DateField label="Ngày chơi" placeholder="Chọn ngày" onPress={() => {}} helpText="Mở Date-Picker" />
        <DateField label="Đã chọn" value="24/09/2026" onPress={() => {}} />
        <DateField label="Lỗi" placeholder="Chọn ngày" error="Bắt buộc" onPress={() => {}} />
        <DateField label="Read-only" value="24/09/2026" readOnly onPress={() => {}} />
        <DateField label="Disabled" placeholder="—" disabled onPress={() => {}} />
        <Text variant="Heading/Subheading">Input/Number-Align-Left</Text>
        <NumberField label="Số người" value={n} onChange={setN} min={1} max={4} helpText="Tối đa 4" />
        <NumberField label="Trống" value={m} onChange={setM} error="Nhập số" />
        <NumberField label="Read-only" value={3} onChange={() => {}} readOnly />
        <NumberField label="Disabled" value={0} onChange={() => {}} disabled />
        <NumberField label="Small" size="Small" value={n} onChange={setN} />
        <NumberField label="XLarge" size="XLarge" value={n} onChange={setN} />
        <Text variant="Heading/Subheading">Input/Number-Align-Center</Text>
        <NumberField align="Center" value={n} onChange={setN} min={0} max={9} />
        <NumberField align="Center" value={m} onChange={setM} error="Nhập số" />
        <NumberField align="Center" value={5} onChange={() => {}} disabled />
        <NumberField align="Center" size="Small" value={n} onChange={setN} />
        <NumberField align="Center" size="XLarge" value={n} onChange={setN} />
        <Text variant="Heading/Subheading">Input/Field-Group</Text>
        <FieldGroup label="Địa chỉ" rows={[{ key: 'street', placeholder: 'Số nhà, đường' }, { key: 'ward', placeholder: 'Phường' }, { key: 'city', placeholder: 'Thành phố', leadingIcon: 'marker-pin-01-line' }]} />
        <FieldGroup size="Small" rows={[{ key: 'a', placeholder: 'Small 1' }, { key: 'b', placeholder: 'Small 2' }]} />
        <FieldGroup size="XLarge" label="XLarge" rows={[{ key: 'a', value: 'Đã nhập' }, { key: 'b', placeholder: 'Dòng 2' }]} />
      </ScrollView>
    </Screen>
  );
}
