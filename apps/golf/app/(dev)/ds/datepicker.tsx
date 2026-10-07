import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { DatePicker, DateWheel, Screen, Text, TimeWheel, useTheme, type DateRange } from '@gr/ds';

export default function DatePickerGallery() {
  const t = useTheme();
  const today = new Date();
  const [d, setD] = useState<Date | null>(today);
  const [r, setR] = useState<DateRange>({ start: new Date(today.getFullYear(), today.getMonth(), 5), end: new Date(today.getFullYear(), today.getMonth(), 12) });
  const [w, setW] = useState(today);
  const [hm, setHm] = useState({ h: 7, m: 30 });
  const marked = [3, 9, 21].map((day) => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Date-Picker · Paged · Large · single</Text>
        <View style={{ backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Large') }}>
          <DatePicker value={d} onChange={setD} markedDates={marked} minDate={new Date(today.getFullYear(), today.getMonth(), 2)} />
        </View>
        <Text variant="Heading/Subheading">Date-Picker · Paged · Small · range · header Center</Text>
        <View style={{ backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Large') }}>
          <DatePicker mode="range" size="Small" headerAlign="Center" value={r} onChange={setR} />
        </View>
        <Text variant="Heading/Subheading">Date-Picker · Scroll · 3 tháng</Text>
        <View style={{ height: t.primitive('gr-dm-240') * 2, backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Large') }}>
          <DatePicker type="Scroll" months={3} value={d} onChange={setD} />
        </View>
        <Text variant="Heading/Subheading">Wheel · Date</Text>
        <DateWheel value={w} onChange={setW} />
        <Text variant="Body/Base/Regular">{w.toLocaleDateString('vi-VN')}</Text>
        <Text variant="Heading/Subheading">Wheel · Time</Text>
        <TimeWheel hour={hm.h} minute={hm.m} minuteStep={5} onChange={(h, m) => setHm({ h, m })} />
        <Text variant="Body/Base/Regular">{`${hm.h}:${String(hm.m).padStart(2, '0')}`}</Text>
      </ScrollView>
    </Screen>
  );
}
