import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { PageIndicator, Screen, Text, useTheme } from '@gr/ds';
import { darkDemo } from '../../../lib/demo';

export default function PageIndicatorGallery() {
  const t = useTheme();
  const [a, setA] = useState(0);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Page-Indicator</Text>
        <Pressable onPress={() => setA((a + 1) % 5)}><Text variant="Caption/Regular" color="Color/Content/Accent/Base">Bấm để đổi active ({a + 1}/5)</Text></Pressable>
        {([4, 5, 6, 7, 8] as const).map((n) => <PageIndicator key={n} count={n} active={a % n} />)}
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">State=Accent · Size Medium / Small</Text>
        <PageIndicator count={5} active={a} state="Accent" />
        <PageIndicator count={5} active={a} state="Accent" size="Small" />
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">State=Overlay</Text>
        <View style={[darkDemo(t), { alignItems: 'center' }]}>
          <PageIndicator count={5} active={a} state="Overlay" />
          <PageIndicator count={5} active={a} state="Overlay" size="Small" />
        </View>
      </ScrollView>
    </Screen>
  );
}
