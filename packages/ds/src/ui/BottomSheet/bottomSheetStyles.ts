import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { TextStylesKey } from '../../generated/keys';

/**
 * Figma ❖ Bottom Sheet — `Bottom-Sheet` (4059:14161: Type Modal|Action, Stack, Search/Action/System-Indicator/Fade-Overlay boolean)
 * + `.Primitives/Bottom-Sheet/Header` + `Title-Block` (Type Start|Center, Size) + `Actions` (Secondary None|Button|Icon|Text|Secondary-Vertical|Text-Vertical).
 * Đợt 1 (spec D5): chỉ layout/visual trong Modal RN, không gesture kéo.
 */
export type BottomSheetType = 'Modal' | 'Action';
export type BottomSheetTitleSize = 'Medium' | 'Small' | 'XSmall';
export type BottomSheetAlign = 'Start' | 'Center';
export type BottomSheetSecondary = 'None' | 'Button' | 'Icon' | 'Text' | 'Secondary-Vertical' | 'Text-Vertical';

const HEADING: Record<BottomSheetTitleSize, TextStylesKey> = { Medium: 'Heading/Subheading', Small: 'Body/Base/DemiBold', XSmall: 'Body/XSmall/DemiBold' };
const SUBTITLE: Record<BottomSheetTitleSize, TextStylesKey> = { Medium: 'Body/Base/Regular', Small: 'Body/XSmall/Regular', XSmall: 'Body/XSmall/Regular' };

export interface BottomSheetStyles {
  scrim: ViewStyle;
  keyboard: ViewStyle;
  container: ViewStyle;
  grabberWrap: ViewStyle;
  grabber: ViewStyle;
  header: ViewStyle;
  titleBlock: ViewStyle;
  heading: TextStyle;
  subtitle: TextStyle;
  divider: ViewStyle;
  body: ViewStyle;
  footer: ViewStyle;
  actions: ViewStyle;
}

export function bottomSheetStyles(t: Theme, o: { type: BottomSheetType; size: BottomSheetTitleSize; align: BottomSheetAlign; secondary: BottomSheetSecondary; divider?: boolean }): BottomSheetStyles {
  const vertical = o.secondary === 'Secondary-Vertical' || o.secondary === 'Text-Vertical';
  return {
    // ponytail: Figma scrim bind style cũ BG/Overlay/dark-strong → dùng Color/Background/Overlay (spec §7 Open).
    scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: t.color('Color/Background/Overlay') },
    keyboard: { flexShrink: 1, maxHeight: '100%' },
    // flexShrink + minHeight 0 để ScrollView trong body cuộn được thay vì đẩy sheet tràn màn (review lượt 2).
    container: {
      flexShrink: 1,
      borderTopLeftRadius: t.radius('Corner-Radius/3XLarge'),
      borderTopRightRadius: t.radius('Corner-Radius/3XLarge'),
      backgroundColor: t.color(o.type === 'Action' ? 'Color/Background/Container' : 'Color/Background/Surface/Default'),
      borderWidth: 1,
      borderColor: t.color('Color/Border/Container/Subtle'),
      ...t.shadow('Effect/Container'),
    },
    grabberWrap: { alignItems: 'center', paddingTop: t.space('Spacing/Padding/XSmall') },
    // Figma System/Top-Indicator (836:8399): 40×4, bind primitive.
    grabber: {
      width: t.primitive('gr-dm-40'),
      height: t.primitive('gr-dm-4'),
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: t.color(o.type === 'Action' ? 'Color/Background/Support/Neutral/Solid' : 'Color/Background/Overlay'),
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: t.size('Navigation-Action/Text/Spacing/Horizontal-Padding'), padding: t.space('Spacing/Padding/Medium') },
    titleBlock: { flex: 1, alignItems: o.align === 'Center' ? 'center' : 'flex-start', gap: t.space(o.size === 'XSmall' ? 'Spacing/Gap/2XSmall' : 'Spacing/Gap/3XSmall') },
    heading: { ...t.text(HEADING[o.size]), color: t.color('Color/Content/Neutral/Strongest') },
    subtitle: { ...t.text(SUBTITLE[o.size]), color: t.color('Color/Content/Neutral/Base') },
    divider: o.divider ? { height: 1, backgroundColor: t.color('Color/Border/Neutral/Pale/Default') } : { height: 0 },
    body: { flexShrink: 1, minHeight: 0, padding: t.space('Spacing/Padding/2XSmall'), gap: t.space('Spacing/Gap/2XSmall') },
    footer: { paddingHorizontal: t.layout('Modal-Padding'), paddingVertical: t.space('Spacing/Padding/Medium') },
    actions: { flexDirection: vertical ? 'column' : 'row', gap: t.space(o.secondary === 'None' ? 'Spacing/Gap/Small' : 'Spacing/Gap/XSmall') },
  };
}
