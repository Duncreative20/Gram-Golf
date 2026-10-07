import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { ThemeLightKey } from '../../generated/keys';

/**
 * Figma ❖ Golf Insider — `Likes-Sheet` (40012970:68233), `.Archive/Share-Sheet` (40012928:25261) + `Story-Share` (40012924:22767) + `.Primitive/Post-Card/Post-Share-Sheet` (40012968:64016),
 * `.Primitives/Share-Sheet/Action-Label` (40012928:25018: State Default|Active), `Collection-Picker-Sheet` (40012970:86878) + `Colection-List-Item` (40012970:70232: State Default|Disabled|Selected|Create-New),
 * `.Primitives/Collection-Card` (40012970:88940), `.Primitives/Create-Post/Media-Item` (40012990:57804: Type Image|Video, State Default|Selected|Disabled|Media-Strip).
 * Sheet dùng lại `BottomSheet`; body padding theo Figma. Action-Label chữ không dump → Caption/Medium (spec §7c).
 */
export function sheetBodyStyles(t: Theme, o: { pad: 'Medium' | 'XLarge' }): { body: ViewStyle; items: ViewStyle; footer: ViewStyle; actionRow: ViewStyle } {
  return {
    body: { gap: t.space('Spacing/Gap/2XSmall'), paddingHorizontal: t.space(`Spacing/Padding/${o.pad}`), paddingVertical: t.space(`Spacing/Padding/${o.pad}`) },
    items: { gap: t.space(o.pad === 'Medium' ? 'Spacing/Gap/XSmall' : 'Spacing/Gap/2XSmall') },
    footer: { paddingHorizontal: t.space('Spacing/Padding/XLarge'), paddingVertical: t.space('Spacing/Padding/Small'), backgroundColor: t.color('Color/Background/Container') },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', gap: t.space('Spacing/Gap/XSmall') },
  };
}

export function shareActionLabelStyles(t: Theme, o: { active: boolean }): { wrap: ViewStyle; circle: ViewStyle; iconSize: number; iconColor: ThemeLightKey; label: TextStyle } {
  return {
    wrap: { alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') },
    circle: {
      width: t.size('Button/Size/Large'), height: t.size('Button/Size/Large'), borderRadius: t.radius('Corner-Radius/Rounded'), alignItems: 'center', justifyContent: 'center',
      ...(o.active
        ? { backgroundColor: t.color('Color/Background/Accent/Subtle/Default') }
        : { backgroundColor: t.component('Button-Tertiary/Background/Default'), borderWidth: 1, borderColor: t.component('Button-Tertiary/Border/Default'), ...t.shadow('Shadow/Action/Tertiary') }),
    },
    iconSize: t.size('Element-Size/Popular/Base'),
    iconColor: o.active ? 'Color/Content/Accent/Base' : 'Color/Content/Neutral/Strongest',
    label: { ...t.text('Body/XSmall/Medium'), color: t.color('Color/Content/Neutral/Base') },
  };
}

export type CollectionItemState = 'Default' | 'Disabled' | 'Selected' | 'Create-New';
export function collectionItemStyles(t: Theme, o: { state: CollectionItemState; pressed?: boolean }): { row: ViewStyle; cover: ViewStyle; info: ViewStyle; title: TextStyle; count: TextStyle; trailingSize: number } {
  return {
    row: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space('Spacing/Gap/XSmall'), paddingVertical: t.space('Spacing/Padding/XSmall'),
      borderRadius: t.radius(o.state === 'Create-New' ? 'Corner-Radius/Large' : 'Corner-Radius/XLarge'),
      backgroundColor: t.color(o.pressed ? 'Color/Background/Neutral/Flat/Hover' : 'Color/Background/Surface/Default'), borderWidth: 1, borderColor: t.color('Color/Border/Container/Subtle'),
    },
    cover: { width: t.size('Image-Size/Large'), height: t.size('Image-Size/Large'), borderRadius: t.radius('Corner-Radius/Base'), overflow: 'hidden', backgroundColor: t.color('Color/Background/Surface/Alt'), alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.space('Spacing/Padding/Small'), paddingVertical: t.space('Spacing/Padding/XSmall'), gap: t.space('Spacing/Gap/XSmall') },
    // Figma Disabled chỉ đổi icon trailing (Neutral/Light), chữ giữ nguyên — parity §7e.
    title: { ...t.text('Body/Small/DemiBold'), color: t.color('Color/Content/Neutral/Base') },
    count: { ...t.text('Body/XSmall/Medium'), color: t.color('Color/Content/Neutral/Light') },
    trailingSize: t.size('Element-Size/Popular/Medium'),
  };
}

export function collectionCardStyles(t: Theme): { card: ViewStyle; cover: ViewStyle; coverMain: ViewStyle; coverSide: ViewStyle; coverSmall: ViewStyle; info: ViewStyle; texts: ViewStyle; title: TextStyle; count: TextStyle } {
  return {
    card: { gap: t.space('Spacing/Gap/3XSmall'), borderRadius: t.radius('Corner-Radius/XLarge'), overflow: 'hidden' },
    cover: { flexDirection: 'row', aspectRatio: 175 / 116, borderRadius: t.radius('Corner-Radius/Base'), overflow: 'hidden', backgroundColor: t.color('Color/Background/Surface/Alt') },
    coverMain: { flex: 2 },
    coverSide: { flex: 1, borderLeftWidth: 1, borderLeftColor: t.color('Color/Border/Neutral/Subtle/Default') },
    coverSmall: { flex: 1, borderBottomWidth: 1, borderBottomColor: t.color('Color/Border/Neutral/Subtle/Default') },
    info: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall'), paddingHorizontal: t.space('Spacing/Padding/XSmall'), paddingVertical: t.space('Spacing/Padding/XSmall') },
    texts: { flex: 1 },
    title: { ...t.text('Body/Small/DemiBold'), color: t.color('Color/Content/Neutral/Base') },
    count: { ...t.text('Body/XSmall/Medium'), color: t.color('Color/Content/Neutral/Light') },
  };
}

export type MediaItemState = 'Default' | 'Selected' | 'Disabled' | 'Media-Strip';
export function mediaItemStyles(t: Theme, o: { state: MediaItemState; size?: number; square?: boolean }): { box: ViewStyle; corner: ViewStyle; duration: TextStyle; removeSize: number } {
  const dim = o.size ?? t.size('Image-Size/2XLarge');
  // square=true (lưới chọn ảnh trong Media-Picker): không bo góc, cạnh = ô lưới.
  return {
    box: { width: dim, height: dim, borderRadius: o.square ? 0 : t.radius('Corner-Radius/Base'), overflow: 'hidden', borderWidth: 1, borderColor: t.color('Color/Border/Overlay/Subtle/Default') /* Figma bind Border/Active/Overlay/Solid: light gần trong suốt, dark xám đặc (F51) */, backgroundColor: t.color('Color/Background/Surface/Alt') },
    corner: { position: 'absolute', top: t.space('Spacing/Padding/3XSmall'), right: t.space('Spacing/Padding/3XSmall') },
    duration: { ...t.text('Body/XSmall/DemiBold'), color: t.color('Color/Content/On-Dark-Overlay/Strongest'), position: 'absolute', left: t.space('Spacing/Padding/3XSmall'), bottom: t.space('Spacing/Padding/3XSmall') },
    removeSize: t.size('Element-Size/Popular/Base'),
  };
}
