import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { MediaInfoPill, PostCard, PostMedia, Screen, SocialAction, Text, useTheme, type VideoState } from '@gr/ds';

const IMG = (n: number) => ({ uri: `https://picsum.photos/seed/golf${n}/800/800` });
const USER = { name: 'Nguyễn Minh Anh', handle: '@minhanh', avatar: { uri: 'https://i.pravatar.cc/96?img=12' }, verified: true };

export default function PostGallery() {
  const t = useTheme();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [vs, setVs] = useState<VideoState>('Paused');
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Medium'), alignItems: 'center' as const, paddingHorizontal: t.layout('Margin-Small') };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Post-Card/Default · Multi + Page-Control</Text>
        <PostCard
          user={USER} time="2 giờ" location="Sân golf Long Thành" onFollow={() => {}} onMore={() => {}}
          media={{ sources: [IMG(1), IMG(2), IMG(3)], ratio: 'Square' }}
          likes="128" liked={liked} onLike={() => setLiked(!liked)} comments="Trả lời" shares="12" saved={saved} onSave={() => setSaved(!saved)}
          caption="Buổi sáng đẹp trời ở @longthanh — thử gậy mới, birdie hố 7 #golf #golfrelax. Cảm ơn team đã đi cùng, hẹn tuần sau quay lại làm vòng 18 lỗ nữa nhé!"
        />
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Post-Media · Video (bấm đổi state) · Counter · Link</Text>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <PostMedia type="Video" sources={[IMG(4)]} ratio="Landscape" videoState={vs} duration="00:44" videoOverlayProps={{ onPlay: () => setVs('Playing'), onReplay: () => setVs('Playing'), onRetry: () => setVs('Loading') }} onToggleMute={() => {}} />
          <View style={row}>
            {(['Paused', 'Playing', 'Loading', 'Ended', 'Error'] as VideoState[]).map((s) => <SocialAction key={s} type="Comment" size="Small" label={s} active={vs === s} onPress={() => setVs(s)} />)}
          </View>
          <PostMedia sources={[IMG(5), IMG(6)]} ratio="Portrait" indicator="Counter" />
          <PostMedia type="Link" sources={[IMG(7)]} ratio="Landscape" domain="golfrelax.app.vn" onOpenLink={() => {}} />
        </View>
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Post-action · Media-Info-Pill</Text>
        <View style={row}>
          <SocialAction type="Like" label="00" /><SocialAction type="Like" label="00" active /><SocialAction type="Comment" label="Trả lời" /><SocialAction type="Share" label="00" active /><SocialAction type="Save" /><SocialAction type="Save" active /><SocialAction type="More-item" />
        </View>
        <View style={[row, { backgroundColor: t.color('Color/Background/Inverse/Solid/Default'), paddingVertical: t.space('Spacing/Padding/Small') }]}>
          <MediaInfoPill type="Counter" text="1/4" /><MediaInfoPill type="Muted" /><MediaInfoPill type="Duration-Muted" text="00:44" /><MediaInfoPill type="Duration" text="00:44" /><MediaInfoPill type="Link" text="golfrelax.app.vn" />
        </View>
      </ScrollView>
    </Screen>
  );
}
