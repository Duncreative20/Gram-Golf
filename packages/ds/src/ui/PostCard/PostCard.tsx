import { useState, type ReactNode } from 'react';
import { a11yState } from '../a11y';
import { ActivityIndicator, Image, Pressable, ScrollView, Text as RNText, View, type ImageSourcePropType, type ImageStyle, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { Avatar, nameInitials } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { IconButton } from '../Button/IconButton';
import { PageIndicator } from '../PageIndicator/PageIndicator';
import {
  identityStyles, mediaPillStyles, postCardStyles, postMediaStyles, socialActionStyles, videoOverlayStyles,
  type MediaPillType, type MediaRatio, type SocialActionSize, type SocialActionType, type VideoState,
} from './postCardStyles';

export interface SocialActionProps {
  type: SocialActionType;
  /** Figma Active=On */
  active?: boolean;
  /** Figma Count=True: số hoặc nhãn ("Trả lời") */
  label?: string;
  size?: SocialActionSize;
  /** Trên ảnh/nền tối (Story header) */
  overlay?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}
/** Figma `.Primitives/Post-Card/Post-action` (Medium) / `Comment-Item/Comment-Action` (Small) */
export function SocialAction({ type, active = false, label, size = 'Medium', overlay, onPress, accessibilityLabel }: SocialActionProps) {
  const t = useTheme();
  const s = socialActionStyles(t, { type, size, active, overlay });
  return (
    <Pressable accessibilityRole="button" {...a11yState({ selected: active }, 'button')} accessibilityLabel={accessibilityLabel ?? type} onPress={onPress} hitSlop={t.space('Spacing/Gap/XSmall')} style={s.row}>
      <Icon name={s.icon} size={s.iconSize} color={s.iconColor} />
      {label ? <RNText style={s.label}>{label}</RNText> : null}
    </Pressable>
  );
}

export interface IdentityUser { name: string; handle?: string; avatar?: ImageSourcePropType; verified?: boolean }
export interface IdentityProps {
  user: IdentityUser;
  /** Dòng phụ: thời gian / địa điểm (Figma Time + Additional Icon) */
  meta?: string;
  location?: string;
  overlay?: boolean;
  avatarSize?: 'XSmall' | 'Small' | 'Medium';
  /** false: bỏ avatar — Comment-Item tự vẽ avatar có viền ở cột trái, header chỉ còn tên · thời gian */
  showAvatar?: boolean;
}
/** Author block: Avatar + Username · verified · time (+ location) */
export function Identity({ user, meta, location, overlay, avatarSize, showAvatar = true }: IdentityProps) {
  const t = useTheme();
  const s = identityStyles(t, { overlay });
  return (
    <View style={s.row}>
      {showAvatar ? <Avatar size={avatarSize ?? s.avatarSize} source={user.avatar} initials={nameInitials(user.name)} theme={user.avatar ? 'Photo' : 'Neutral'} /> : null}
      <View style={s.text}>
        <View style={s.nameRow}>
          <RNText style={s.name} numberOfLines={1}>{user.name}</RNText>
          {user.verified ? <Icon name="check-verified-solid" size={s.verifiedSize} color={s.verifiedColor} /> : null}
          {meta ? <Icon name="circle-small-solid" size={s.dotSize} color={s.dotColor} /> : null}
          {meta ? <RNText style={s.time}>{meta}</RNText> : null}
        </View>
        {location ? (
          <View style={s.nameRow}>
            <Icon name="marker-pin-01-line" size={s.metaIconSize} color={overlay ? 'Color/Content/On-Dark-Overlay/Base' : 'Color/Content/Neutral/Base'} />
            <RNText style={s.meta} numberOfLines={1}>{location}</RNText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export interface MediaInfoPillProps { type: MediaPillType; text?: string }
/** Figma `.Primitives/Post-Card/Media-Info-Pill` */
export function MediaInfoPill({ type, text }: MediaInfoPillProps) {
  const t = useTheme();
  const s = mediaPillStyles(t, { type });
  return (
    <View style={s.pill}>
      <Icon name={s.icon} size={s.iconSize} color="Color/Content/On-Dark-Overlay/Strongest" />
      {type !== 'Muted' && text ? <RNText style={s.text}>{text}</RNText> : null}
    </View>
  );
}

export interface VideoControlOverlayProps { state: VideoState; onReplay?: () => void; onRetry?: () => void; onPlay?: () => void; errorTitle?: string; errorCaption?: string }
/** Figma `..Primitives/Post-Card/Video-Control-Overlay` */
export function VideoControlOverlay({ state, onReplay, onRetry, onPlay, errorTitle = 'Không thể phát video', errorCaption = 'Vui lòng chờ một lúc và thử lại' }: VideoControlOverlayProps) {
  const t = useTheme();
  const s = videoOverlayStyles(t, { state });
  if (state === 'Playing') return null;
  return (
    <View style={s.scrim} pointerEvents="box-none">
      {state === 'Ended' ? <Button level="Tertiary" size="XSmall" leadingIcon="refresh-ccw-01-line" text="Xem lại" onPress={onReplay} /> : null}
      {state === 'Paused' ? <IconButton level="Tertiary" size="XSmall" icon="play-solid" accessibilityLabel="Phát" onPress={onPlay} /> : null}
      {state === 'Loading' ? <ActivityIndicator color={t.color('Color/Content/On-Dark-Overlay/Strongest')} accessibilityLabel="Đang tải" /> : null}
      {state === 'Error' ? (
        <>
          <View style={s.textBlock}>
            <RNText style={s.title}>{errorTitle}</RNText>
            <RNText style={s.caption}>{errorCaption}</RNText>
          </View>
          <Button level="Tertiary" size="XSmall" text="Thử lại" onPress={onRetry} />
        </>
      ) : null}
    </View>
  );
}

export interface PostMediaProps {
  /** Figma Type: Single|Multi (theo số ảnh), Video, Link */
  type?: 'Image' | 'Video' | 'Link';
  sources: ImageSourcePropType[];
  ratio?: MediaRatio;
  /** Figma Indicator (Multi) */
  indicator?: 'None' | 'Counter' | 'Page-Control';
  /** Video */
  videoState?: VideoState;
  muted?: boolean;
  duration?: string;
  onToggleMute?: () => void;
  videoOverlayProps?: Omit<VideoControlOverlayProps, 'state'>;
  /** Link */
  domain?: string;
  onOpenLink?: () => void;
  /** Slot video player thật (expo-video) thay ảnh đầu */
  player?: ReactNode;
}
/** Figma `.Primitives/Post-Card/Post-Media` — carousel = ScrollView paging */
export function PostMedia({ type = 'Image', sources, ratio = 'Square', indicator = 'Page-Control', videoState = 'Paused', muted = true, duration, onToggleMute, videoOverlayProps, domain, onOpenLink, player }: PostMediaProps) {
  const t = useTheme();
  const s = postMediaStyles(t);
  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);
  const multi = type === 'Image' && sources.length > 1;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => { if (width) setPage(Math.round(e.nativeEvent.contentOffset.x / width)); };
  return (
    <View style={s.viewport} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {multi ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onScroll}>
          {sources.map((src, i) => <Image key={i} source={src} style={[s.frame(ratio) as ImageStyle, { width }]} resizeMode="cover" />)}
        </ScrollView>
      ) : (
        <View style={s.frame(ratio)}>
          {player ?? <Image source={sources[0]} style={{ width: '100%', height: '100%' }} resizeMode="cover" />}
          {type === 'Video' ? <VideoControlOverlay state={videoState} {...videoOverlayProps} /> : null}
        </View>
      )}
      {multi && indicator === 'Page-Control' ? <View style={s.dots} pointerEvents="none"><PageIndicator count={sources.length} active={Math.min(page, sources.length - 1)} state="Overlay" /></View> : null}
      {multi && indicator === 'Counter' ? <View style={s.topRight}><MediaInfoPill type="Counter" text={`${Math.min(page, sources.length - 1) + 1}/${sources.length}`} /></View> : null}
      {type === 'Video' ? (
        <Pressable style={s.bottomRight} onPress={onToggleMute} accessibilityRole="button" accessibilityLabel={muted ? 'Bật tiếng' : 'Tắt tiếng'}>
          {duration ? <MediaInfoPill type={muted ? 'Duration-Muted' : 'Duration'} text={duration} /> : <MediaInfoPill type="Muted" />}
        </Pressable>
      ) : null}
      {type === 'Link' ? (
        <>
          <Pressable style={s.bottomLeft} onPress={onOpenLink} accessibilityRole="link"><MediaInfoPill type="Link" text={domain} /></Pressable>
          <View style={s.topRight}><IconButton overlay level="Primary" size="2XSmall" icon="link-01-line" accessibilityLabel="Mở liên kết" onPress={onOpenLink} /></View>
        </>
      ) : null}
    </View>
  );
}

export interface PostCaptionProps { text: string; expanded?: boolean; onToggle?: (next: boolean) => void; moreText?: string }
/** Figma `.Primitives/Post-Caption` — @mention/#hashtag tô Accent/Base */
export function PostCaption({ text, expanded, onToggle, moreText = 'xem thêm' }: PostCaptionProps) {
  const t = useTheme();
  const s = postCardStyles(t);
  const [inner, setInner] = useState(false);
  const [long, setLong] = useState(false);
  const open = expanded ?? inner;
  const parts = text.split(/(\s[@#][\w\p{L}]+)/u);
  const body = parts.map((p, i) => (/^\s[@#]/.test(p) ? <RNText key={i} style={s.captionLink}>{p}</RNText> : p));
  return (
    <Pressable style={s.caption} onPress={() => { setInner(!open); onToggle?.(!open); }} accessibilityRole="text" disabled={!long}>
      <RNText style={s.captionText} numberOfLines={open ? undefined : 2}>{body}</RNText>
      {/* Text ẩn không giới hạn dòng để đo: iOS chỉ báo số dòng đã render khi có numberOfLines (review lượt 2). */}
      <RNText style={[s.captionText, { position: 'absolute', opacity: 0 }]} onTextLayout={(e) => setLong(e.nativeEvent.lines.length > 2)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{body}</RNText>
      {!open && long ? <RNText style={s.captionMore}>{moreText}</RNText> : null}
    </Pressable>
  );
}

export interface PostCardProps {
  user: IdentityUser;
  time?: string;
  location?: string;
  following?: boolean;
  onFollow?: () => void;
  onMore?: () => void;
  media: PostMediaProps;
  likes?: string;
  liked?: boolean;
  onLike?: () => void;
  comments?: string;
  onComment?: () => void;
  shares?: string;
  onShare?: () => void;
  saved?: boolean;
  onSave?: () => void;
  caption?: string;
}
/** Figma `Post-Card/Default` */
export function PostCard({ user, time, location, following, onFollow, onMore, media, likes, liked, onLike, comments = 'Trả lời', onComment, shares, onShare, saved, onSave, caption }: PostCardProps) {
  const t = useTheme();
  const s = postCardStyles(t);
  return (
    <View style={s.card}>
      <View style={s.header}>
        <Identity user={user} meta={time} location={location} />
        {onFollow && !following ? <Button level="Secondary" size="XSmall" text="Theo dõi" onPress={onFollow} /> : null}
        <SocialAction type="More-item" onPress={onMore} accessibilityLabel="Thêm" />
      </View>
      <PostMedia {...media} />
      <View style={s.footer}>
        <View style={s.footerLeft}>
          <SocialAction type="Like" active={liked} label={likes} onPress={onLike} accessibilityLabel="Thích" />
          <SocialAction type="Comment" label={comments} onPress={onComment} accessibilityLabel="Bình luận" />
          <SocialAction type="Share" label={shares} onPress={onShare} accessibilityLabel="Chia sẻ" />
        </View>
        <SocialAction type="Save" active={saved} onPress={onSave} accessibilityLabel="Lưu" />
      </View>
      {caption ? <PostCaption text={caption} /> : null}
    </View>
  );
}
