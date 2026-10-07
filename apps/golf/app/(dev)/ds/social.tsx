import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, CollectionCard, CollectionListItem, CollectionPickerSheet, LikesSheet, MediaItem, Screen, ShareActionLabel, ShareSheet, Text, useTheme, type SocialUser } from '@gr/ds';

const IMG = (n: number) => ({ uri: `https://picsum.photos/seed/s${n}/300/300` });
const USERS: SocialUser[] = Array.from({ length: 8 }, (_, i) => ({ id: String(i), name: `Golfer ${i + 1}`, handle: `@golfer${i + 1}`, avatar: { uri: `https://i.pravatar.cc/96?img=${20 + i}` }, verified: i % 3 === 0, following: i % 2 === 0 }));
const COLS = [{ id: 'a', title: 'Sân yêu thích', count: 12, covers: [IMG(1), IMG(2), IMG(3)] }, { id: 'b', title: 'Kỹ thuật swing', count: 4, cover: IMG(4) }, { id: 'c', title: 'Đã lưu', count: 1, cover: IMG(5) }];

export default function SocialGallery() {
  const t = useTheme();
  const [likes, setLikes] = useState(false);
  const [share, setShare] = useState(false);
  const [picker, setPicker] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [colSel, setColSel] = useState<string[]>(['a']);
  const [msg, setMsg] = useState('');
  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Small'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Sheets</Text>
        <View style={row}>
          <Button level="Tertiary" size="Small" text="Likes-Sheet" onPress={() => setLikes(true)} />
          <Button level="Tertiary" size="Small" text="Share-Sheet" onPress={() => setShare(true)} />
          <Button level="Tertiary" size="Small" text="Collection-Picker" onPress={() => setPicker(true)} />
        </View>
        <LikesSheet visible={likes} onClose={() => setLikes(false)} users={USERS} onFollow={() => {}} />
        <ShareSheet visible={share} onClose={() => setShare(false)} users={USERS} selectedIds={sel} onToggleUser={(u) => setSel(toggle(sel, u.id))} message={msg} onChangeMessage={setMsg} onSend={() => { setSel([]); setShare(false); }}
          actions={[{ icon: 'link-01-line', label: 'Sao chép' }, { icon: 'plus-line', label: 'Story', active: true }, { icon: 'share-01-line', label: 'Khác' }]} />
        <CollectionPickerSheet visible={picker} onClose={() => setPicker(false)} collections={COLS} selectedIds={colSel} disabledIds={['c']} onToggle={(c) => setColSel(toggle(colSel, c.id))} onCreate={() => {}} />
        <Text variant="Heading/Subheading">Share-Sheet/Action-Label</Text>
        <View style={row}><ShareActionLabel icon="link-01-line" label="Sao chép" /><ShareActionLabel icon="check-line" label="Active" active /></View>
        <Text variant="Heading/Subheading">Colection-List-Item · 4 state</Text>
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          <CollectionListItem collection={COLS[1]} />
          <CollectionListItem collection={COLS[0]} state="Selected" />
          <CollectionListItem collection={COLS[2]} state="Disabled" />
          <CollectionListItem state="Create-New" onPress={() => {}} />
        </View>
        <Text variant="Heading/Subheading">Collection-Card</Text>
        <View style={row}>
          {COLS.map((c) => <View key={c.id} style={{ width: t.size('Image-Size/3XLarge') + t.size('Image-Size/Medium') }}><CollectionCard collection={c} onMore={() => {}} /></View>)}
        </View>
        <Text variant="Heading/Subheading">Create-Post/Media-Item</Text>
        <View style={row}>
          <MediaItem source={IMG(6)} /><MediaItem source={IMG(7)} state="Selected" /><MediaItem source={IMG(8)} state="Disabled" /><MediaItem source={IMG(9)} type="Video" duration="0:40" state="Selected" /><MediaItem source={IMG(10)} state="Media-Strip" onRemove={() => {}} />
        </View>
      </ScrollView>
    </Screen>
  );
}
