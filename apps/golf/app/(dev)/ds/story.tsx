import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoryViewer } from '@gr/ds';

const USER = { name: 'Trần Quang Huy', avatar: { uri: 'https://i.pravatar.cc/96?img=32' }, verified: true };

export default function StoryGallery() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(1);
  const [liked, setLiked] = useState(false);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <StoryViewer
      source={{ uri: `https://picsum.photos/seed/story${active}/900/1600` }}
      user={USER} time="3 giờ" location="Đà Lạt Palace Golf" count={4} active={active} progress={0.4}
      onFollow={() => {}} onMore={() => {}} onClose={() => {}}
      onPrev={() => setActive(Math.max(0, active - 1))} onNext={() => setActive(Math.min(3, active + 1))}
      topInset={insets.top} bottomInset={insets.bottom}
      bottom={{ caption: 'Sương sớm trên green #dalat @golfrelax', value: msg, onChangeText: (v) => { setMsg(v); setSent(false); }, liked, onLike: () => setLiked(!liked), onSend: () => { setSent(true); setMsg(''); }, sent }}
    />
  );
}
