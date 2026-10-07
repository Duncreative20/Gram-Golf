import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Text, useTheme } from '@gr/ds';

/** Khối có tiêu đề: tiêu đề + chú thích lề Margin-Small, nội dung tràn lề (ListItem Inline) — con nào cần lề thì tự thêm. */
export function Section({ title, caption, children }: PropsWithChildren<{ title: string; caption?: string }>) {
  const t = useTheme();
  return (
    <View>
      <View style={{ paddingHorizontal: t.layout('Margin-Small'), paddingBottom: t.space('Spacing/Padding/XSmall'), gap: t.space('Spacing/Gap/3XSmall') }}>
        <Text variant="Heading/Subheading" accessibilityRole="header">{title}</Text>
        {caption ? <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">{caption}</Text> : null}
      </View>
      {children}
    </View>
  );
}
