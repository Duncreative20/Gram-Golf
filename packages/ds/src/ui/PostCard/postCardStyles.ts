import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { IconName } from '../../icons/generated';
import type { ThemeLightKey } from '../../generated/keys';

/**
 * Figma ❖ Golf Insider — `Post-Card/Default` (40012843:13289) và primitives:
 * `.Primitives/Post-Card/Header/Post` (40012832:10584), `Post-action` (40012763:9705: Type Comment|Like|Save|Share|More-item, Active, Count),
 * `Media-Info-Pill` (40012832:11127: Type Counter|Muted|Duration-Muted|Duration|Link), `Post-Media` (40012832:10750: Type Single|Video|Multi|Link, Indicator None|Counter|Page-Control),
 * `Media-Frame` (40012832:4450: Ratio Square|Portrait|Landscape), `Video-Control-Overlay` (40012843:12034: State Ended|Error|Loading|Playing|Paused), `Post-Caption` (40012939:42763).
 * `.Primitives/Comment-Item/Comment-Action` (40012942:46863) cùng khuôn Post-action ở cỡ Small.
 * Text `Label/Mobile/Label 3` (style cũ) → `Caption/Medium`; `BG/Base` → Surface/Default (spec §7c).
 * Chữ/icon TRÊN ẢNH: Figma bind `Inverse/*` (đảo màu khi dark → chữ tối trên ảnh) → dùng `On-Dark-Overlay/*` (không đổi theo scheme), spec §7d.
 */
export type SocialActionType = 'Like' | 'Comment' | 'Share' | 'Save' | 'Attachment' | 'More-item';
export type SocialActionSize = 'Medium' | 'Small';
const ACTION_ICON: Record<SocialActionType, { off: IconName; on: IconName }> = {
  Like: { off: 'heart-line', on: 'heart-solid' },
  Comment: { off: 'message-text-circle-line', on: 'message-text-circle-solid' },
  Share: { off: 'paper-plane-line', on: 'paper-plane-solid' },
  Save: { off: 'bookmark-line', on: 'bookmark-solid' },
  Attachment: { off: 'marker-pin-01-line', on: 'marker-pin-01-solid' },
  'More-item': { off: 'dots-horizontal-line', on: 'dots-horizontal-line' },
};

export function socialActionStyles(t: Theme, o: { type: SocialActionType; size: SocialActionSize; active: boolean; overlay?: boolean }): { row: ViewStyle; icon: IconName; iconSize: number; iconColor: ThemeLightKey; label: TextStyle } {
  const color: ThemeLightKey = o.overlay ? (o.active ? 'Color/Content/On-Dark-Overlay/Strongest' : 'Color/Content/On-Dark-Overlay/Base') : o.active ? 'Color/Content/Neutral/Base' : 'Color/Content/Neutral/Light';
  const m = o.size === 'Medium';
  return {
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') },
    icon: o.active ? ACTION_ICON[o.type].on : ACTION_ICON[o.type].off,
    // More-item: khung Medium/Small nhưng icon Base
    iconSize: o.type === 'More-item' ? t.size('Element-Size/Popular/Base') : t.size(m ? 'Element-Size/Popular/Medium' : 'Element-Size/Popular/Small'),
    iconColor: color,
    label: { ...t.text(m ? 'Body/Base/DemiBold' : 'Body/XSmall/DemiBold'), color: t.color(color) },
  };
}

export interface IdentityStyles { row: ViewStyle; avatarSize: 'XSmall'; text: ViewStyle; nameRow: ViewStyle; name: TextStyle; verifiedSize: number; verifiedColor: ThemeLightKey; dotSize: number; dotColor: ThemeLightKey; meta: TextStyle; time: TextStyle; metaIconSize: number }
/** Author block dùng chung Post header, Story header, Comment header (overlay = trên ảnh) */
export function identityStyles(t: Theme, o: { overlay?: boolean }): IdentityStyles {
  return {
    row: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall'), flex: 1 },
    avatarSize: 'XSmall',
    text: { flex: 1, gap: t.space('Spacing/Gap/3XSmall') },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') },
    name: { ...t.text('Body/XSmall/DemiBold'), color: t.color(o.overlay ? 'Color/Content/On-Dark-Overlay/Strongest' : 'Color/Content/Neutral/Strongest') },
    verifiedSize: t.size('Element-Size/Popular/XSmall'),
    verifiedColor: 'Color/Content/Accent/Light',
    dotSize: t.size('Element-Size/Popular/3XSmall'),
    dotColor: o.overlay ? 'Color/Content/On-Dark-Overlay/Base' : 'Color/Content/Neutral/Light',
    meta: { ...t.text('Body/XSmall/Regular'), color: t.color(o.overlay ? 'Color/Content/On-Dark-Overlay/Base' : 'Color/Content/Neutral/Base') },
    // Figma Header/Post: thời gian Caption/Regular (handle Body/XSmall/Regular) — parity §7e.
    time: { ...t.text('Caption/Regular'), color: t.color(o.overlay ? 'Color/Content/On-Dark-Overlay/Base' : 'Color/Content/Neutral/Base') },
    metaIconSize: t.size('Element-Size/Popular/3XSmall'),
  };
}

export type MediaRatio = 'Square' | 'Portrait' | 'Landscape';
export const RATIO: Record<MediaRatio, number> = { Square: 1, Portrait: 4 / 5, Landscape: 16 / 9 };

export type MediaPillType = 'Counter' | 'Muted' | 'Duration-Muted' | 'Duration' | 'Link';
const PILL_ICON: Record<MediaPillType, IconName> = { Counter: 'image-list-line', Muted: 'volume-x-line', 'Duration-Muted': 'volume-x-line', Duration: 'volume-max-line', Link: 'globe-01-line' };
export function mediaPillStyles(t: Theme, o: { type: MediaPillType }): { pill: ViewStyle; text: TextStyle; icon: IconName; iconSize: number } {
  const iconOnly = o.type === 'Muted';
  return {
    pill: {
      flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/3XSmall'),
      paddingHorizontal: t.space('Spacing/Padding/XSmall'), paddingVertical: t.space(iconOnly ? 'Spacing/Padding/XSmall' : 'Spacing/Padding/2XSmall'),
      borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color('Color/Background/Surface/Overlay'),
      borderWidth: 1, borderColor: t.color('Color/Border/Active/Overlay/Subtle'), ...t.shadow('Effect/Input'),
    },
    text: { ...t.text('Caption/Medium'), color: t.color('Color/Content/On-Dark-Overlay/Strongest') },
    icon: PILL_ICON[o.type],
    iconSize: o.type === 'Counter' || o.type === 'Duration' ? t.primitive('gr-dm-12') : t.primitive('gr-dm-16'),
  };
}

export interface PostMediaStyles { viewport: ViewStyle; frame: (ratio: MediaRatio) => ViewStyle; dots: ViewStyle; topRight: ViewStyle; bottomRight: ViewStyle; bottomLeft: ViewStyle }
export function postMediaStyles(t: Theme): PostMediaStyles {
  const pad = t.space('Spacing/Padding/Small');
  return {
    viewport: { alignSelf: 'stretch', borderRadius: t.radius('Corner-Radius/Large'), overflow: 'hidden', backgroundColor: t.color('Color/Background/Surface/Alt') },
    frame: (ratio) => ({ width: '100%', aspectRatio: RATIO[ratio] }),
    dots: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingHorizontal: pad, paddingVertical: t.space('Spacing/Padding/XSmall') },
    topRight: { position: 'absolute', top: pad, right: pad },
    bottomRight: { position: 'absolute', bottom: pad, right: pad },
    bottomLeft: { position: 'absolute', bottom: pad, left: pad },
  };
}

export type VideoState = 'Ended' | 'Error' | 'Loading' | 'Playing' | 'Paused';
export function videoOverlayStyles(t: Theme, o: { state: VideoState }): { scrim: ViewStyle; title: TextStyle; caption: TextStyle; textBlock: ViewStyle } {
  return {
    scrim: { ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as ViewStyle), alignItems: 'center', justifyContent: 'center', gap: t.space('Spacing/Gap/Small'), borderRadius: t.radius('Corner-Radius/Large'), backgroundColor: o.state === 'Playing' ? 'transparent' : t.color('Color/Background/Black-Overlay/Default') /* Figma bind Background/Overlay: đổi theo scheme (F50) */ },
    textBlock: { alignItems: 'center', gap: t.primitive('gr-dm-2') },
    title: { ...t.text('Body/Base/DemiBold'), color: t.color('Color/Content/On-Dark-Overlay/Strongest') },
    caption: { ...t.text('Body/XSmall/Regular'), color: t.color('Color/Content/On-Dark-Overlay/Base') },
  };
}

export function postCardStyles(t: Theme): { card: ViewStyle; header: ViewStyle; footer: ViewStyle; footerLeft: ViewStyle; caption: ViewStyle; captionText: TextStyle; captionLink: TextStyle; captionMore: TextStyle } {
  return {
    card: { alignSelf: 'stretch', backgroundColor: t.color('Color/Background/Surface/Default') },
    header: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall'), paddingHorizontal: t.space('Spacing/Padding/Medium'), paddingVertical: t.space('Spacing/Padding/Small') },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.space('Spacing/Padding/Medium'), paddingVertical: t.space('Spacing/Padding/XSmall'), backgroundColor: t.color('Color/Background/Surface/Default') },
    footerLeft: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') },
    caption: { paddingHorizontal: t.space('Spacing/Padding/Medium'), paddingVertical: t.space('Spacing/Padding/2XSmall') },
    captionText: { ...t.text('Body/Small/Regular'), color: t.color('Color/Content/Neutral/Base') },
    captionLink: { color: t.color('Color/Content/Accent/Base') },
    captionMore: { ...t.text('Body/Small/Regular'), color: t.color('Color/Content/Neutral/Light') },
  };
}
