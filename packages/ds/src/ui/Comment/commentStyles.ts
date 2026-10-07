import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';

/**
 * Figma ❖ Golf Insider — `.Primitives/Comment-Item` (40012948:47534), `Comment-Item/Header` (40012942:47075),
 * `Comment-Media-Item` (40012945:47266: Type Image|Video|More|Loading, Size Medium|Small), `Comment-Thread` (40012948:48926: State Expand|Preview|Single),
 * `Comments-Sheet` (40012948:49092), `Comment-Composer` (40012967:50479: State Default|Typing|Rich-Text|Attachment).
 * Avatar stroke `Border-divider/Inverse` (style cũ) → `Color/Border/Inverse`. Composer shadow 3 lớp → `Effect/Input` (spec §7c).
 */
export type CommentMediaType = 'Image' | 'Video' | 'More' | 'Loading';
export type CommentMediaSize = 'Medium' | 'Small';

export interface CommentStyles { item: ViewStyle; avatarRing: ViewStyle; container: ViewStyle; body: ViewStyle; text: TextStyle; mediaRow: ViewStyle; actionRow: ViewStyle; mainActions: ViewStyle; replyList: ViewStyle; replyIndent: ViewStyle; viewMore: ViewStyle }
export function commentStyles(t: Theme): CommentStyles {
  return {
    item: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space('Spacing/Gap/XSmall'), alignSelf: 'stretch' },
    avatarRing: { borderRadius: t.radius('Corner-Radius/Rounded'), borderWidth: 1, borderColor: t.color('Color/Border/Inverse') },
    container: { flex: 1, gap: t.space('Spacing/Gap/Small') },
    body: { gap: t.space('Spacing/Gap/3XSmall') },
    text: { ...t.text('Body/Small/Regular'), color: t.color('Color/Content/Neutral/Strongest') },
    mediaRow: { flexDirection: 'row', gap: t.space('Spacing/Gap/2XSmall') },
    actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.space('Spacing/Gap/Medium') },
    mainActions: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') },
    replyList: { gap: t.space('Spacing/Gap/Small') },
    replyIndent: { paddingLeft: t.size('Image-Size/XSmall') + t.space('Spacing/Gap/XSmall') },
    viewMore: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') },
  };
}

export function commentMediaStyles(t: Theme, o: { type: CommentMediaType; size: CommentMediaSize }): { box: ViewStyle; scrim: ViewStyle; playSize: number; label: TextStyle; duration: TextStyle } {
  const dim = t.size(o.size === 'Medium' ? 'Image-Size/XLarge' : 'Image-Size/Medium');
  return {
    box: { width: dim, height: dim, borderRadius: t.radius('Corner-Radius/Small'), overflow: 'hidden', backgroundColor: t.color(o.type === 'Loading' ? 'Color/Background/Subtle-Disabled' : 'Color/Background/Surface/Alt'), alignItems: 'center', justifyContent: 'center' },
    scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: t.radius('Corner-Radius/Small'), backgroundColor: t.color('Color/Background/Black-Overlay/Default') /* Figma bind Background/Overlay: đổi theo scheme, chìm trên ảnh sáng ở light (F50) */, alignItems: 'center', justifyContent: 'center' },
    playSize: o.size === 'Medium' ? t.primitive('gr-dm-24') : t.primitive('gr-dm-16'),
    label: { ...t.text('Caption/DemiBold'), color: t.color('Color/Content/On-Dark-Overlay/Strongest') },
    duration: { ...t.text('Caption/Medium'), color: t.color('Color/Content/On-Dark-Overlay/Strongest'), position: 'absolute', bottom: t.space('Spacing/Padding/3XSmall'), right: t.space('Spacing/Padding/3XSmall') },
  };
}

export interface ComposerStyles { surface: (expanded: boolean) => ViewStyle; row: ViewStyle; input: TextStyle; placeholder: string; replyContext: ViewStyle; replyText: TextStyle; actionRow: ViewStyle; leadingActions: ViewStyle; mediaRow: ViewStyle }
export function composerStyles(t: Theme): ComposerStyles {
  return {
    surface: (expanded) => ({
      alignSelf: 'stretch', gap: t.size('Input/Spacing-Regt/Medium/Inside-Field-Gap'), padding: t.space('Spacing/Padding/XSmall'),
      // Figma Comment-Composer: radius Input/Medium (Typing: XLarge), Shadow/Bottom/Level-3 — parity §7e.
      borderRadius: expanded ? t.radius('Corner-Radius/XLarge') : t.radius('Corner-Radius/Input/Medium'),
      backgroundColor: t.component('Input/Background/Default'), borderWidth: 1, borderColor: t.component('Input/Border/Default'), ...t.shadow('Shadow/Bottom/Level-3'),
    }),
    row: { flexDirection: 'row', alignItems: 'center', gap: t.size('Input/Spacing-Regt/Medium/Inside-Field-Gap'), paddingVertical: t.space('Spacing/Padding/2XSmall') },
    // Comment-Composer chưa có state Focused trong Figma → giữ outline trình duyệt (docs/ds/figma-debt.md §E)
    input: { ...t.text('Body/Base/Medium'), color: t.color('Color/Content/Neutral/Strongest'), flex: 1, paddingVertical: 0, paddingHorizontal: t.space('Spacing/Padding/XSmall') },
    placeholder: t.color('Color/Content/Placeholder'),
    replyContext: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: t.size('Badge/Spacing/Small/Gap'), height: t.size('Badge/Size/Small'), paddingHorizontal: t.size('Badge/Spacing/Small/Horizontal-Padding'), borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color('Color/Background/Neutral/Subtle/Default') },
    replyText: { ...t.text('Body/XSmall/Medium'), color: t.color('Color/Content/Neutral/Base') },
    actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    leadingActions: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') },
    mediaRow: { flexDirection: 'row', gap: t.space('Spacing/Gap/2XSmall'), paddingHorizontal: t.space('Spacing/Padding/XSmall') },
  };
}
