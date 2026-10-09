import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, CommentComposer, CommentItem, CommentMediaItem, CommentsSheet, CommentThread, Screen, Text, useTheme, type CommentData } from '@gr/ds';

const IMG = (n: number) => ({ uri: `https://picsum.photos/seed/c${n}/300/300` });
const u = (i: number, name: string) => ({ name, handle: `@u${i}`, avatar: { uri: `https://i.pravatar.cc/96?img=${i}` }, verified: i % 2 === 0 });
const ROOT: CommentData = { id: 'r1', user: u(5, 'Lê Hoàng'), time: '1 giờ', text: 'Swing đẹp quá anh ơi! Gậy này là driver gì vậy?', likes: '12', media: [{ source: IMG(1) }, { type: 'Video', source: IMG(2), duration: '00:44' }, { type: 'More', source: IMG(3), more: 3 }], attachment: 'Long Thành' };
const REPLIES: CommentData[] = [1, 2, 3, 4].map((i) => ({ id: `p${i}`, user: u(10 + i, `Golfer ${i}`), time: `${i * 10} phút`, text: `Trả lời số ${i}: mình cũng thấy vậy, đường bóng rất ổn.`, likes: String(i) }));

export default function CommentGallery() {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');
  const [reply, setReply] = useState<string | undefined>();
  const [att, setAtt] = useState(false);
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }} keyboardShouldPersistTaps="handled">
        <Text variant="Heading/Subheading">Comment-Item</Text>
        <CommentItem comment={ROOT} onReply={(c) => setReply(c.user.name)} onMore={() => {}} />
        <Text variant="Heading/Subheading">Comment-Thread · Preview → Expand</Text>
        <CommentThread root={{ ...ROOT, media: undefined, attachment: undefined }} replies={REPLIES} onReply={(c) => setReply(c.user.name)} />
        <Text variant="Heading/Subheading">Comment-Media-Item</Text>
        <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/2XSmall') }}>
          <CommentMediaItem source={IMG(4)} /><CommentMediaItem type="Video" source={IMG(5)} duration="00:12" /><CommentMediaItem type="More" source={IMG(6)} more={5} /><CommentMediaItem type="Loading" />
        </View>
        <Text variant="Heading/Subheading">Comment-Composer · Default → Typing → Attachment</Text>
        <CommentComposer value={val} onChangeText={setVal} replyTo={reply} onCancelReply={() => setReply(undefined)} attachments={att ? [{ source: IMG(7) }, { type: 'Video', source: IMG(8) }] : undefined} onAddMedia={() => setAtt(!att)} onAddLocation={() => {}} onSend={() => { setVal(''); setAtt(false); setReply(undefined); }} />
        <Button level="Tertiary" size="Medium (Base)" text="Mở Comments-Sheet" onPress={() => setOpen(true)} />
        <CommentsSheet visible={open} onClose={() => setOpen(false)} threads={[{ root: ROOT, replies: REPLIES }, { root: { ...ROOT, id: 'r2', media: undefined, text: 'Bình luận thứ hai không có ảnh.' } }]} composer={{ value: val, onChangeText: setVal, replyTo: reply, onCancelReply: () => setReply(undefined), onAddMedia: () => {}, onSend: () => setVal('') }} onReply={(c) => setReply(c.user.name)} />
      </ScrollView>
    </Screen>
  );
}
