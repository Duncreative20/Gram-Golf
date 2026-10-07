import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';

/**
 * Figma ❖ Golf Insider — `Story-Viewer/Default` (40012918:36082), `.Primitives/Story-Viewer/Header` (40012893:10725),
 * `.Primitives/Media-Viewer/Story-Viewer` (40012902:4727: Ratio Fill|1.1|16:9), `.Primitives/Story-Viewer/Bottom-Content` (40012918:39803: Type Caption|Story-Reply, State Default|Liked|Sending|Sent|Typing).
 * Nền `Black` (primitive) → `Color/Background/Black-Solid/Default` (không đổi theo scheme); chữ trên ảnh `On-Dark-Overlay/*` (§7d); Keyboard (remote) bỏ; scrim gradient → phẳng (spec §7c).
 */
export type StoryRatio = 'Fill' | '1.1' | '16:9';

export interface StoryStyles {
  screen: ViewStyle; media: (ratio: StoryRatio) => ViewStyle;
  header: ViewStyle; progressRow: ViewStyle; identity: ViewStyle;
  bottom: ViewStyle; /** Scrim gradient (đậm ở mép): màu token Black-Overlay/*, KHÔNG đổi theo scheme (Overlay đổi 25 %→45 % nên chìm trên ảnh sáng ở light) */ scrim: { color: string; mid: string }; caption: TextStyle; captionWrap: ViewStyle; captionLink: TextStyle;
  replyRow: ViewStyle; replyField: (sending: boolean) => ViewStyle; replyInput: TextStyle; replyPlaceholder: string;
}
export function storyStyles(t: Theme): StoryStyles {
  return {
    screen: { flex: 1, backgroundColor: t.color('Color/Background/Black-Solid/Default'), justifyContent: 'center' },
    media: (ratio) => (ratio === 'Fill' ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } : { width: '100%', aspectRatio: ratio === '1.1' ? 1 : 16 / 9 }),
    header: { gap: t.space('Spacing/Gap/XSmall'), paddingHorizontal: t.space('Spacing/Padding/Small'), paddingVertical: t.space('Spacing/Padding/XSmall') },
    progressRow: { flexDirection: 'row', gap: t.space('Spacing/Gap/2XSmall') },
    identity: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') },
    bottom: { backgroundColor: 'transparent' },
    scrim: { color: t.color('Color/Background/Black-Overlay/Hover'), mid: t.color('Color/Background/Black-Overlay/Default') },
    captionWrap: { paddingHorizontal: t.space('Spacing/Padding/XLarge'), paddingVertical: t.space('Spacing/Padding/Medium') },
    caption: { ...t.text('Body/Small/Regular'), color: t.color('Color/Content/On-Dark-Overlay/Base') },
    captionLink: { color: t.color('Color/Content/On-Accent/Hover') },
    replyRow: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall'), paddingHorizontal: t.space('Spacing/Padding/Medium'), paddingBottom: t.space('Spacing/Padding/Medium') },
    replyField: (sending) => ({
      flex: 1, flexDirection: 'row', alignItems: 'center', height: t.size('Input/Size/Small'),
      paddingHorizontal: t.size('Input/Spacing-Pill/Small/Horizontal-Padding'), paddingVertical: t.size('Input/Spacing-Pill/Small/Vertical-Padding'), gap: t.size('Input/Spacing-Pill/Small/Inside-Field-Gap'),
      borderRadius: t.radius('Corner-Radius/Input/Rounded'), backgroundColor: sending ? t.color('Color/Background/Active/Overlay/Subtle') : t.component('Input-Overlay/Background/Default'), borderWidth: 1, borderColor: t.component('Input-Overlay/Border/Default'), ...t.shadow('Effect/Input'),
    }),
    replyInput: { ...t.text('Body/XSmall/Medium'), color: t.color('Color/Content/On-Dark-Overlay/Strongest'), flex: 1, paddingVertical: 0 },
    replyPlaceholder: t.color('Color/Content/On-Dark-Overlay/Placeholder'),
  };
}
