import type { ReactNode } from 'react';
import { Image, Pressable, Text as RNText, TextInput, View, type ImageSourcePropType, type ImageStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { IconButton } from '../Button/IconButton';
import { ProgressBar } from '../Progress/ProgressBar';
import { Identity, SocialAction, type IdentityUser } from '../PostCard/PostCard';
import { storyStyles, type StoryRatio } from './storyStyles';
import { Fade } from '../Fade';

export interface StoryHeaderProps {
  user: IdentityUser;
  time?: string;
  location?: string;
  /** Số đoạn story + đoạn đang xem + tiến độ đoạn đó (0..1) */
  count: number;
  active: number;
  progress: number;
  following?: boolean;
  onFollow?: () => void;
  onMore?: () => void;
  onClose?: () => void;
}
/** Figma `.Primitives/Story-Viewer/Header` */
export function StoryHeader({ user, time, location, count, active, progress, following, onFollow, onMore, onClose }: StoryHeaderProps) {
  const t = useTheme();
  const s = storyStyles(t);
  return (
    <View style={s.header}>
      <View style={s.progressRow}>
        {Array.from({ length: count }, (_, i) => (
          <View key={i} style={{ flex: 1 }}><ProgressBar theme="Overlay" value={i < active ? 1 : i === active ? progress : 0} /></View>
        ))}
      </View>
      <View style={s.identity}>
        <Identity user={user} meta={time} location={location} overlay />
        {onFollow && !following ? <Button type="Main" overlay level="Primary" size="XSmall" text="Theo dõi" onPress={onFollow} /> : null}
        <SocialAction type="More-item" overlay onPress={onMore} accessibilityLabel="Thêm" />
        {onClose ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={onClose} hitSlop={t.space('Spacing/Gap/XSmall')}>
            <Icon name="x-small-line" size={t.size('Element-Size/Popular/Base')} color="Color/Content/On-Dark-Overlay/Strongest" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export interface StoryBottomContentProps {
  /** Figma Type=Caption */
  caption?: string;
  /** Figma Type=Story-Reply: có ô trả lời */
  reply?: boolean;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  liked?: boolean;
  onLike?: () => void;
  onSend?: () => void;
  /** State Sending | Sent */
  sending?: boolean;
  sent?: boolean;
  /** Scrim gradient phía sau (Bottom-Scrim, Figma không có → docs/ds/figma-debt.md §E); tắt khi đặt trên màn đã tối (Moment) hoặc khi StoryViewer đã phủ */
  scrim?: boolean;
}
/** Figma `.Primitives/Story-Viewer/Bottom-Content` */
export function StoryBottomContent({ caption, reply = true, value, onChangeText, placeholder = 'Gửi tin nhắn…', liked, onLike, onSend, sending, sent, scrim = true }: StoryBottomContentProps) {
  const t = useTheme();
  const s = storyStyles(t);
  const parts = (caption ?? '').split(/(\s[@#][\w\p{L}]+)/u);
  return (
    <View style={s.bottom}>
      {scrim ? <Fade side="bottom" color={s.scrim.color} mid={s.scrim.mid} /> : null}
      {caption ? (
        <View style={s.captionWrap}>
          <RNText style={s.caption}>{parts.map((p, i) => (/^\s[@#]/.test(p) ? <RNText key={i} style={s.captionLink}>{p}</RNText> : p))}</RNText>
        </View>
      ) : null}
      {reply ? (
        <View style={s.replyRow}>
          <View style={s.replyField(!!sending)}>
            {sent ? <Badge text="Đã gửi" size="XSmall" theme="Neutral" background="Solid" leadingIcon="check-line" /> : null}
            <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={s.replyPlaceholder} editable={!sending} style={s.replyInput} accessibilityLabel="Trả lời story" />
          </View>
          <IconButton overlay level="Primary" size="Small" icon={liked ? 'heart-solid' : 'heart-line'} accessibilityLabel="Thích" onPress={onLike} />
          <IconButton overlay level="Primary" size="Small" icon="paper-plane-line" accessibilityLabel="Gửi" onPress={onSend} disabled={sending || !value} />
        </View>
      ) : null}
    </View>
  );
}

export interface StoryViewerProps extends StoryHeaderProps {
  source?: ImageSourcePropType;
  /** Slot video/player thay ảnh */
  media?: ReactNode;
  ratio?: StoryRatio;
  bottom?: StoryBottomContentProps;
  /** Chừa status bar / home indicator (app truyền từ safe-area) */
  topInset?: number;
  bottomInset?: number;
  onPrev?: () => void;
  onNext?: () => void;
}
/** Figma `Story-Viewer/Default` — chạm nửa trái/phải = prev/next */
export function StoryViewer({ source, media, ratio = 'Fill', bottom, topInset = 0, bottomInset = 0, onPrev, onNext, ...header }: StoryViewerProps) {
  const t = useTheme();
  const s = storyStyles(t);
  return (
    <View style={s.screen}>
      {media ?? (source ? <Image source={source} style={s.media(ratio) as ImageStyle} resizeMode={ratio === 'Fill' ? 'cover' : 'contain'} /> : null)}
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' }}>
        <Pressable style={{ flex: 1 }} onPress={onPrev} accessibilityRole="button" accessibilityLabel="Trước" />
        <Pressable style={{ flex: 1 }} onPress={onNext} accessibilityRole="button" accessibilityLabel="Sau" />
      </View>
      {/* header/bottom không absolute (Android không nhận touch ngoài bounds cha) — lớp ngoài absolute, inset = View rỗng (review lượt 2). */}
      {/* scrim gradient phủ cả inset (đậm ở mép màn, nhạt dần vào ảnh) — chữ On-Dark-Overlay đọc được trên ảnh sáng */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} pointerEvents="box-none">
        <Fade side="top" color={s.scrim.color} mid={s.scrim.mid} />
        <View style={{ height: topInset }} />
        <StoryHeader {...header} />
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
        {bottom?.scrim === false ? null : <Fade side="bottom" color={s.scrim.color} mid={s.scrim.mid} />}
        <StoryBottomContent {...bottom} scrim={false} />
        <View style={{ height: bottomInset }} />
      </View>
    </View>
  );
}
