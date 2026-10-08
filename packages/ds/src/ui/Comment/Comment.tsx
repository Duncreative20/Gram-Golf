import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text as RNText, TextInput, View, type ImageSourcePropType } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { Avatar, nameInitials } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { IconButton } from '../Button/IconButton';
import { Divider } from '../Divider/Divider';
import { BottomSheet, type BottomSheetProps } from '../BottomSheet/BottomSheet';
import { Identity, SocialAction, type IdentityUser } from '../PostCard/PostCard';
import { commentMediaStyles, commentStyles, composerStyles, type CommentMediaSize, type CommentMediaType } from './commentStyles';

export interface CommentMediaItemProps { type?: CommentMediaType; size?: CommentMediaSize; source?: ImageSourcePropType; duration?: string; more?: number; onPress?: () => void; accessibilityLabel?: string }
/** Figma `.Primitives/Comment-Item/Comment-Media-Item` */
export function CommentMediaItem({ type = 'Image', size = 'Medium', source, duration, more, onPress, accessibilityLabel }: CommentMediaItemProps) {
  const t = useTheme();
  const s = commentMediaStyles(t, { type, size });
  return (
    // Tên cho screen reader theo loại; không bấm được → ảnh có tên (role image + label), không phải nút mờ (aria-disabled)
    <Pressable style={s.box} onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'imagebutton' : 'image'} accessibilityLabel={accessibilityLabel ?? (type === 'Video' ? `Video${duration ? ' ' + duration : ''}` : type === 'More' ? `Thêm ${more ?? ''} ảnh` : type === 'Loading' ? 'Đang tải' : 'Ảnh đính kèm')}>
      {source && type !== 'Loading' ? <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" aria-hidden /> : null}
      {type === 'Loading' ? <ActivityIndicator color={t.color('Color/Content/Neutral/Light')} accessibilityLabel="Đang tải" /> : null}
      {type === 'Video' ? (
        <View style={s.scrim}>
          <Icon name="play-circle-solid" size={s.playSize} color="Color/Content/On-Dark-Overlay/Strongest" />
          {duration && size === 'Medium' ? <RNText style={s.duration}>{duration}</RNText> : null}
        </View>
      ) : null}
      {type === 'More' ? <View style={s.scrim}><RNText style={s.label}>+{more ?? ''}</RNText></View> : null}
    </Pressable>
  );
}

export interface CommentData {
  id: string;
  user: IdentityUser;
  time?: string;
  text: string;
  media?: CommentMediaItemProps[];
  likes?: string;
  liked?: boolean;
  attachment?: string;
}
export interface CommentItemProps {
  comment: CommentData;
  onLike?: (c: CommentData) => void;
  onReply?: (c: CommentData) => void;
  onAttachment?: (c: CommentData) => void;
  onMore?: (c: CommentData) => void;
}
/** Figma `.Primitives/Comment-Item` */
export function CommentItem({ comment, onLike, onReply, onAttachment, onMore }: CommentItemProps) {
  const t = useTheme();
  const s = commentStyles(t);
  return (
    <View style={s.item}>
      <View style={s.avatarRing}><Avatar size="XSmall" source={comment.user.avatar} initials={nameInitials(comment.user.name)} theme={comment.user.avatar ? 'Photo' : 'Neutral'} /></View>
      <View style={s.container}>
        <View style={s.body}>
          <Identity user={comment.user} meta={comment.time} showAvatar={false} />
          <RNText style={s.text}>{comment.text}</RNText>
        </View>
        {comment.media?.length ? <View style={s.mediaRow}>{comment.media.map((m, i) => <CommentMediaItem key={i} size="Small" {...m} />)}</View> : null}
        <View style={s.actionRow}>
          <View style={s.mainActions}>
            <SocialAction size="Small" type="Like" active={comment.liked} label={comment.likes} onPress={() => onLike?.(comment)} accessibilityLabel="Thích" />
            <SocialAction size="Small" type="Comment" label="Trả lời" onPress={() => onReply?.(comment)} accessibilityLabel="Trả lời" />
            {comment.attachment ? <SocialAction size="Small" type="Attachment" label={comment.attachment} onPress={() => onAttachment?.(comment)} /> : null}
          </View>
          {onMore ? <SocialAction size="Small" type="More-item" onPress={() => onMore(comment)} accessibilityLabel="Thêm" /> : null}
        </View>
      </View>
    </View>
  );
}

export interface CommentThreadProps extends Omit<CommentItemProps, 'comment'> {
  root: CommentData;
  replies?: CommentData[];
  /** Figma State: Single (không reply) | Preview (2 reply đầu) | Expand (tất cả) */
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
  previewCount?: number;
}
/** Figma `.Primitives/Comment-Thread` */
export function CommentThread({ root, replies = [], expanded, onToggle, previewCount = 2, ...handlers }: CommentThreadProps) {
  const t = useTheme();
  const s = commentStyles(t);
  const [inner, setInner] = useState(false);
  const open = expanded ?? inner;
  const shown = open ? replies : replies.slice(0, previewCount);
  const hidden = replies.length - shown.length;
  return (
    <View style={s.replyList}>
      <CommentItem comment={root} {...handlers} />
      {shown.length ? (
        <View style={[s.replyIndent, s.replyList]}>
          <Divider color="Default" />
          {shown.map((r) => <CommentItem key={r.id} comment={r} {...handlers} />)}
          {hidden > 0 ? (
            <View style={s.viewMore}>
              <View style={{ flex: 1 }}><Divider color="Default" /></View>
              <Button type="Flat" level="Primary" size="XSmall" text={`Xem thêm ${hidden} trả lời`} onPress={() => { setInner(true); onToggle?.(true); }} />
              <View style={{ flex: 1 }}><Divider color="Default" /></View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export interface CommentComposerProps {
  value: string;
  onChangeText: (v: string) => void;
  onSend?: () => void;
  placeholder?: string;
  /** State=Typing/Rich-Text: đang trả lời ai */
  replyTo?: string;
  onCancelReply?: () => void;
  /** State=Attachment */
  attachments?: CommentMediaItemProps[];
  onAddMedia?: () => void;
  onAddLocation?: () => void;
  /** Slot avatar/ảnh người dùng bên trái (Figma Icon-Button · Plus khi Default) */
  leading?: ReactNode;
  sending?: boolean;
}
/** Figma `Comment-Composer` */
export function CommentComposer({ value, onChangeText, onSend, placeholder = 'Viết bình luận…', replyTo, onCancelReply, attachments, onAddMedia, onAddLocation, leading, sending }: CommentComposerProps) {
  const t = useTheme();
  const s = composerStyles(t);
  const expanded = !!(value || replyTo || attachments?.length);
  const send = <IconButton level="Primary" size="XSmall" icon="arrow-up-line" accessibilityLabel="Gửi" onPress={onSend} disabled={sending || (!value && !attachments?.length)} />;
  return (
    <View style={s.surface(expanded)}>
      {replyTo ? (
        <View style={s.replyContext}>
          <Icon name="reply-solid" size={t.size('Element-Size/Popular/XSmall')} color="Color/Content/Neutral/Light" />
          <RNText style={s.replyText}>Trả lời {replyTo}</RNText>
          <Pressable onPress={onCancelReply} accessibilityRole="button" accessibilityLabel="Bỏ trả lời" hitSlop={t.space('Spacing/Gap/XSmall')}>
            <Icon name="x-circle-solid" size={t.size('Element-Size/Popular/XSmall')} color="Color/Content/Neutral/Light" />
          </Pressable>
        </View>
      ) : null}
      <View style={s.row}>
        {!expanded ? (leading ?? <IconButton level="Tertiary" size="XSmall" icon="plus-line" accessibilityLabel="Thêm" onPress={onAddMedia} />) : null}
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={s.placeholder} multiline style={s.input} accessibilityLabel="Bình luận" />
        {!expanded ? send : null}
      </View>
      {attachments?.length ? <View style={s.mediaRow}>{attachments.map((m, i) => <CommentMediaItem key={i} size="Small" {...m} />)}</View> : null}
      {expanded ? (
        <View style={s.actionRow}>
          <View style={s.leadingActions}>
            {onAddMedia ? <IconButton type="Flat" level="Secondary" size="XSmall" icon="image-solid" accessibilityLabel="Thêm ảnh" onPress={onAddMedia} /> : null}
            {onAddLocation ? <IconButton type="Flat" level="Secondary" size="XSmall" icon="marker-pin-02-line" accessibilityLabel="Thêm địa điểm" onPress={onAddLocation} /> : null}
          </View>
          {send}
        </View>
      ) : null}
    </View>
  );
}

export interface CommentsSheetProps extends Pick<BottomSheetProps, 'visible' | 'onClose'> {
  threads: Omit<CommentThreadProps, keyof CommentItemProps | 'expanded' | 'onToggle'>[];
  composer: CommentComposerProps;
  heading?: string;
  onLike?: CommentItemProps['onLike'];
  onReply?: CommentItemProps['onReply'];
  onMore?: CommentItemProps['onMore'];
}
/** Figma `Comments-Sheet` = Bottom-Sheet Modal + Comment-Thread list + Comment-Composer */
export function CommentsSheet({ visible, onClose, threads, composer, heading = 'Bình luận', onLike, onReply, onMore }: CommentsSheetProps) {
  const t = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} heading={heading} divider>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: t.space('Spacing/Gap/Large'), paddingBottom: t.space('Spacing/Padding/Medium') }}>
        {threads.map((th) => <CommentThread key={th.root.id} {...th} onLike={onLike} onReply={onReply} onMore={onMore} />)}
      </ScrollView>
      <CommentComposer {...composer} />
    </BottomSheet>
  );
}
