import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BottomSheet, Button, PopoverItem, Screen, Text, useTheme, type BottomSheetSecondary } from '@gr/ds';

const LAYOUTS: BottomSheetSecondary[] = ['None', 'Button', 'Icon', 'Text', 'Secondary-Vertical', 'Text-Vertical'];

export default function BottomSheetGallery() {
  const t = useTheme();
  const [open, setOpen] = useState<null | { type: 'Modal' | 'Action'; layout: BottomSheetSecondary }>(null);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
        <Text variant="Heading/Subheading">Bottom-Sheet</Text>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Type=Modal · Actions Secondary=…</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }}>
          {LAYOUTS.map((l) => <Button key={l} level="Secondary" size="Small" text={l} onPress={() => setOpen({ type: 'Modal', layout: l })} />)}
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Type=Action</Text>
        <Button level="Tertiary" size="Medium (Base)" text="Mở Action sheet" onPress={() => setOpen({ type: 'Action', layout: 'None' })} />
      </ScrollView>
      <BottomSheet
        visible={!!open}
        onClose={() => setOpen(null)}
        type={open?.type}
        heading={open?.type === 'Action' ? 'Tuỳ chọn bài viết' : 'Chia sẻ bài viết'}
        subtitle={open?.type === 'Action' ? undefined : 'Chọn nơi muốn chia sẻ'}
        divider
        primary={open?.type === 'Action' ? undefined : { text: 'Chia sẻ', icon: 'share-01-line', onPress: () => setOpen(null) }}
        secondary={open?.layout === 'None' ? undefined : { text: 'Huỷ', icon: 'x-medium-line', onPress: () => setOpen(null) }}
        secondaryLayout={open?.layout}
      >
        {open?.type === 'Action' ? (
          <>
            <PopoverItem type="Item" icon="bookmark-line" label="Lưu bài viết" />
            <PopoverItem type="Item" icon="link-01-line" label="Sao chép liên kết" />
            <PopoverItem type="Item" icon="trash-line" label="Xoá" caption="Không thể hoàn tác" />
          </>
        ) : (
          <View style={{ padding: t.space('Spacing/Padding/Medium') }}>
            <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">Nội dung sheet (Items slot).</Text>
          </View>
        )}
      </BottomSheet>
    </Screen>
  );
}
