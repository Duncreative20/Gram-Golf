import { useState } from 'react';
import { a11yState } from '../a11y';
import { Image, Pressable, ScrollView, Text as RNText, View, type ImageSourcePropType } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Avatar, nameInitials } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { IconButton } from '../Button/IconButton';
import { Checkbox } from '../Checkbox/Checkbox';
import { BottomSheet, type BottomSheetProps } from '../BottomSheet/BottomSheet';
import { SearchField } from '../TextField/SearchField';
import { TextField } from '../TextField/TextField';
import { Identity, type IdentityUser } from '../PostCard/PostCard';
import { collectionCardStyles, collectionItemStyles, mediaItemStyles, shareActionLabelStyles, sheetBodyStyles, type CollectionItemState, type MediaItemState } from './socialStyles';

type SheetBase = Pick<BottomSheetProps, 'visible' | 'onClose'>;
export interface SocialUser extends IdentityUser { id: string; following?: boolean }

export interface LikesSheetProps extends SheetBase {
  users: SocialUser[];
  onFollow?: (u: SocialUser) => void;
  onPressUser?: (u: SocialUser) => void;
  heading?: string;
  search?: boolean;
}
/** Figma `Likes-Sheet`: Search + danh sách người thích với nút Theo dõi */
export function LikesSheet({ visible, onClose, users, onFollow, onPressUser, heading = 'Lượt thích', search = true }: LikesSheetProps) {
  const t = useTheme();
  const s = sheetBodyStyles(t, { pad: 'Medium' });
  const [q, setQ] = useState('');
  const list = q ? users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())) : users;
  return (
    <BottomSheet visible={visible} onClose={onClose} heading={heading} divider>
      <View style={s.body}>
        {search ? <SearchField placeholder="Tìm kiếm" value={q} onChangeText={setQ} /> : null}
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.items}>
          {list.map((u) => (
            <Pressable key={u.id} onPress={() => onPressUser?.(u)} accessible={false} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
              <Identity user={u} meta={u.handle} avatarSize="Small" />
              {onFollow ? <Button level={u.following ? 'Tertiary' : 'Secondary'} size="XSmall" text={u.following ? 'Đang theo dõi' : 'Theo dõi'} onPress={() => onFollow(u)} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

export interface ShareAction { icon: IconName; label: string; onPress?: () => void; active?: boolean }
/** Figma `.Primitives/Share-Sheet/Action-Label` */
export function ShareActionLabel({ icon, label, onPress, active = false }: ShareAction) {
  const t = useTheme();
  const s = shareActionLabelStyles(t, { active });
  return (
    <Pressable style={s.wrap} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} {...a11yState({ selected: active }, 'button')}>
      <View style={s.circle}><Icon name={icon} size={s.iconSize} color={s.iconColor} /></View>
      <RNText style={s.label}>{label}</RNText>
    </Pressable>
  );
}

export interface ShareSheetProps extends SheetBase {
  users: SocialUser[];
  selectedIds?: string[];
  onToggleUser?: (u: SocialUser) => void;
  /** State=Typing-Message: lời nhắn kèm khi đã chọn bạn */
  message?: string;
  onChangeMessage?: (v: string) => void;
  onSend?: () => void;
  actions?: ShareAction[];
  heading?: string;
}
/** Figma `Story-Share` / `Post-Share-Sheet`: Search + lưới bạn bè (chọn nhiều) + hàng Action-Label */
export function ShareSheet({ visible, onClose, users, selectedIds = [], onToggleUser, message, onChangeMessage, onSend, actions = [], heading = 'Chia sẻ' }: ShareSheetProps) {
  const t = useTheme();
  const s = sheetBodyStyles(t, { pad: 'XLarge' });
  const [q, setQ] = useState('');
  const list = q ? users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())) : users;
  const hasSel = selectedIds.length > 0;
  return (
    <BottomSheet visible={visible} onClose={onClose} heading={heading} divider>
      <View style={s.body}>
        <SearchField placeholder="Tìm bạn bè" value={q} onChangeText={setQ} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.items, { flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/Medium') }]}>
          {list.map((u) => {
            const sel = selectedIds.includes(u.id);
            return (
              <Pressable key={u.id} onPress={() => onToggleUser?.(u)} accessibilityRole="checkbox" {...a11yState({ checked: sel })} style={{ alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall'), width: t.size('Image-Size/XLarge') }}>
                <View>
                  <Avatar size="Large" source={u.avatar} initials={nameInitials(u.name)} theme={u.avatar ? 'Photo' : 'Neutral'} />
                  {sel ? <View style={{ position: 'absolute', right: 0, bottom: 0 }}><Icon name="check-circle-solid" size={t.size('Element-Size/Popular/Small')} color="Color/Content/Accent/Base" /></View> : null}
                </View>
                <RNText style={{ ...t.text('Caption/Medium'), color: t.color('Color/Content/Neutral/Base') }} numberOfLines={1}>{u.name}</RNText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={s.footer}>
        {hasSel ? (
          <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <TextField size="Small" placeholder="Viết lời nhắn…" value={message} onChangeText={onChangeMessage} />
            <Button level="Accent" size="Medium (Base)" text={`Gửi (${selectedIds.length})`} onPress={onSend} />
          </View>
        ) : (
          <View style={s.actionRow}>{actions.map((a) => <ShareActionLabel key={a.label} {...a} />)}</View>
        )}
      </View>
    </BottomSheet>
  );
}

export interface CollectionData { id: string; title: string; count?: number; cover?: ImageSourcePropType; covers?: ImageSourcePropType[] }
export interface CollectionListItemProps { collection?: CollectionData; state?: CollectionItemState; onPress?: () => void; createLabel?: string; createCaption?: string }
/** Figma `.Primitives/Collection-Picker-Sheet/Colection-List-Item` */
export function CollectionListItem({ collection, state = 'Default', onPress, createLabel = 'Bộ sưu tập mới', createCaption = 'Lưu bài, viết địa điểm,...' }: CollectionListItemProps) {
  const t = useTheme();
  const create = state === 'Create-New';
  return (
    <Pressable onPress={onPress} disabled={state === 'Disabled'} accessibilityRole={state === 'Default' ? undefined : 'button'} accessible={state !== 'Default'} {...a11yState({ selected: state === 'Selected', disabled: state === 'Disabled' })} style={({ pressed }) => collectionItemStyles(t, { state, pressed }).row}>
      {({ pressed }) => {
        const s = collectionItemStyles(t, { state, pressed });
        return (
          <>
            <View style={s.cover}>
              {create ? <Icon name="plus-line" size={s.trailingSize} color="Color/Content/Neutral/Strongest" /> : collection?.cover ? <Image source={collection.cover} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
            </View>
            <View style={s.info}>
              <View style={{ flex: 1 }}>
                <RNText style={s.title} numberOfLines={1}>{create ? createLabel : collection?.title}</RNText>
                <RNText style={s.count} numberOfLines={1}>{create ? createCaption : `${collection?.count ?? 0} bài viết`}</RNText>
              </View>
              {state === 'Default' ? <Checkbox shape="Rounded" select={false} accessibilityLabel="Chọn" onChange={onPress} /> : null}
              {state === 'Selected' ? <Icon name="bookmark-solid" size={s.trailingSize} color="Color/Content/Neutral/Strongest" /> : null}
              {state === 'Disabled' ? <Icon name="bookmark-line" size={s.trailingSize} color="Color/Content/Disabled" /> : null}
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

export interface CollectionPickerSheetProps extends SheetBase {
  collections: CollectionData[];
  selectedIds?: string[];
  disabledIds?: string[];
  onToggle?: (c: CollectionData) => void;
  onCreate?: () => void;
  heading?: string;
}
/** Figma `Collection-Picker-Sheet` */
export function CollectionPickerSheet({ visible, onClose, collections, selectedIds = [], disabledIds = [], onToggle, onCreate, heading = 'Lưu vào bộ sưu tập' }: CollectionPickerSheetProps) {
  const t = useTheme();
  const s = sheetBodyStyles(t, { pad: 'Medium' });
  return (
    <BottomSheet visible={visible} onClose={onClose} heading={heading} divider>
      <ScrollView contentContainerStyle={[s.body, s.items]}>
        {onCreate ? <CollectionListItem state="Create-New" onPress={onCreate} /> : null}
        {collections.map((c) => (
          <CollectionListItem key={c.id} collection={c} state={disabledIds.includes(c.id) ? 'Disabled' : selectedIds.includes(c.id) ? 'Selected' : 'Default'} onPress={() => onToggle?.(c)} />
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

export interface CollectionCardProps { collection: CollectionData; onPress?: () => void; onMore?: () => void }
/** Figma `.Primitives/Collection-Card` — bìa ghép 1 lớn + 2 nhỏ */
export function CollectionCard({ collection, onPress, onMore }: CollectionCardProps) {
  const t = useTheme();
  const s = collectionCardStyles(t);
  const [a, b, c] = collection.covers ?? [collection.cover];
  const img = (src?: ImageSourcePropType) => (src ? <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null);
  return (
    // có nút "Thêm" con → card không nhận role/accessible (tránh button lồng button)
    <Pressable style={s.card} onPress={onPress} accessibilityRole={onMore ? undefined : 'button'} accessible={!onMore} accessibilityLabel={collection.title}>
      <View style={s.cover}>
        <View style={s.coverMain}>{img(a)}</View>
        <View style={s.coverSide}>
          <View style={s.coverSmall}>{img(b)}</View>
          <View style={{ flex: 1 }}>{img(c)}</View>
        </View>
      </View>
      <View style={s.info}>
        <View style={s.texts}>
          <RNText style={s.title} numberOfLines={1}>{collection.title}</RNText>
          <RNText style={s.count}>{collection.count ?? 0} bài viết</RNText>
        </View>
        {onMore ? <IconButton type="Flat" level="Secondary" size="XSmall" icon="dots-horizontal-line" accessibilityLabel="Thêm" onPress={onMore} /> : null}
      </View>
    </Pressable>
  );
}

export interface MediaItemProps { source: ImageSourcePropType; type?: 'Image' | 'Video'; state?: MediaItemState; duration?: string; onPress?: () => void; onRemove?: () => void; /** Cạnh ô (mặc định Image-Size/2XLarge); lưới picker truyền width/3 */ size?: number; /** Ô lưới vuông không bo góc */ square?: boolean }
/** Figma `.Primitives/Create-Post/Media-Item` (chọn ảnh khi tạo bài / dải media đã chọn) */
export function MediaItem({ source, type = 'Image', state = 'Default', duration, onPress, onRemove, size, square }: MediaItemProps) {
  const t = useTheme();
  const s = mediaItemStyles(t, { state, size, square });
  return (
    // Checkbox / nút Bỏ ở góc là phần tử a11y; khung ngoài chỉ bắt tap (không role → không lồng control)
    <Pressable style={s.box} onPress={onPress} disabled={state === 'Disabled'} accessible={false}>
      <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      {type === 'Video' && duration ? <RNText style={s.duration}>{duration}</RNText> : null}
      <View style={s.corner}>
        {state === 'Media-Strip'
          ? <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel="Bỏ" hitSlop={t.space('Spacing/Gap/XSmall')}><Icon name="x-circle-solid" size={s.removeSize} color="Color/Content/Neutral/Strongest" /></Pressable>
          : <Checkbox shape="Rounded" select={state === 'Selected'} disabled={state === 'Disabled'} onChange={onPress} accessibilityLabel="Chọn" />}
      </View>
    </Pressable>
  );
}
