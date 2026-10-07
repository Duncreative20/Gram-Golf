import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { SizeKey, TextStylesKey, ThemeLightKey } from '../../generated/keys';

/** Figma ❖ Badge — set `Badge` (260:4825): Size × Theme × Background, Leading-Icon/Remove boolean. */
export type BadgeSize = 'Medium' | 'Small' | 'XSmall';
export type BadgeBackground = 'Solid' | 'Subtle';
type SupportTheme = 'Orange' | 'Crimson' | 'Pink' | 'Plum' | 'Purple' | 'Violet' | 'Indigo' | 'Blue' | 'Cyan' | 'Teal' | 'Brown';
export type BadgeTheme = 'Accent' | 'Neutral' | 'Yellow' | 'Red' | 'Green' | 'Inverse' | 'On-Color' | SupportTheme;

interface Paint { bg: ThemeLightKey; border?: ThemeLightKey; content: ThemeLightKey; icon: ThemeLightKey }
type ThemePaint = Record<BadgeBackground, Paint>;

const support = <N extends SupportTheme>(n: N): ThemePaint => ({
  Solid: { bg: `Color/Background/Support/${n}/Solid`, content: 'Color/Content/On-Colors', icon: 'Color/Content/On-Colors' },
  Subtle: { bg: `Color/Background/Support/${n}/Subtle`, content: `Color/Content/Support/${n}/Strongest`, icon: `Color/Content/Support/${n}/Light` },
});

const THEME: Record<BadgeTheme, ThemePaint> = {
  Neutral: {
    Solid: { bg: 'Color/Background/Neutral/Solid/Default', content: 'Color/Content/Inverse/Strongest', icon: 'Color/Content/Inverse/Strongest' },
    Subtle: { bg: 'Color/Background/Neutral/Subtle/Default', content: 'Color/Content/Neutral/Strongest', icon: 'Color/Content/Neutral/Light' },
  },
  Accent: {
    Solid: { bg: 'Color/Background/Accent/Solid/Default', content: 'Color/Content/On-Accent/Default', icon: 'Color/Content/On-Accent/Default' },
    Subtle: { bg: 'Color/Background/Accent/Subtle/Default', border: 'Color/Border/Accent/Subtle/Default', content: 'Color/Content/Accent/Base', icon: 'Color/Content/Accent/Base' },
  },
  Yellow: {
    Solid: { bg: 'Color/Background/Warning/Solid/Default', content: 'Color/Content/On-Brights', icon: 'Color/Content/On-Brights' },
    Subtle: { bg: 'Color/Background/Warning/Subtle/Default', border: 'Color/Border/Warning/Subtle/Default', content: 'Color/Content/Warning/Strongest', icon: 'Color/Content/Warning/Light' },
  },
  Red: {
    Solid: { bg: 'Color/Background/Negative/Solid/Default', content: 'Color/Content/On-Colors', icon: 'Color/Content/On-Colors' },
    Subtle: { bg: 'Color/Background/Negative/Subtle/Default', content: 'Color/Content/Negative/Strongest', icon: 'Color/Content/Negative/Light' },
  },
  Green: {
    Solid: { bg: 'Color/Background/Positive/Solid/Default', content: 'Color/Content/On-Colors', icon: 'Color/Content/On-Colors' },
    Subtle: { bg: 'Color/Background/Positive/Subtle/Default', content: 'Color/Content/Positive/Strongest', icon: 'Color/Content/Positive/Light' },
  },
  // Figma chỉ có Solid cho Inverse và On-Color → Subtle dùng lại Solid (spec §7 Open).
  Inverse: {
    Solid: { bg: 'Color/Background/Inverse/Solid/Default', content: 'Color/Content/Neutral/Strongest', icon: 'Color/Content/Neutral/Strongest' },
    Subtle: { bg: 'Color/Background/Inverse/Solid/Default', content: 'Color/Content/Neutral/Strongest', icon: 'Color/Content/Neutral/Strongest' },
  },
  'On-Color': {
    Solid: { bg: 'Color/Background/White-Solid/Default', content: 'Color/Content/On-White-Overlay/Strongest', icon: 'Color/Content/On-White-Overlay/Strongest' },
    Subtle: { bg: 'Color/Background/White-Solid/Default', content: 'Color/Content/On-White-Overlay/Strongest', icon: 'Color/Content/On-White-Overlay/Strongest' },
  },
  Orange: support('Orange'),
  Crimson: support('Crimson'),
  Pink: support('Pink'),
  Plum: support('Plum'),
  Purple: support('Purple'),
  Violet: support('Violet'),
  Indigo: support('Indigo'),
  Blue: support('Blue'),
  Cyan: support('Cyan'),
  Teal: support('Teal'),
  Brown: support('Brown'),
};

const LABEL: Record<BadgeSize, TextStylesKey> = { Medium: 'Body/Base/DemiBold', Small: 'Body/XSmall/DemiBold', XSmall: 'Caption/DemiBold' };
const ICON: Record<BadgeSize, SizeKey> = { Medium: 'Element-Size/Popular/Small', Small: 'Element-Size/Popular/XSmall', XSmall: 'Element-Size/Popular/XSmall' };

export interface BadgeStyles { container: ViewStyle; label: TextStyle; iconSize: number; iconColor: PaintKey; contentColor: PaintKey; removeColor: PaintKey }

export function badgeStyles(t: Theme, o: { size: BadgeSize; theme: BadgeTheme; background: BadgeBackground }): BadgeStyles {
  const p = THEME[o.theme][o.background];
  const s = o.size;
  return {
    container: {
      height: t.size(`Badge/Size/${s}`),
      minWidth: t.size(`Badge/Size/${s}`),
      paddingHorizontal: t.size(`Badge/Spacing/${s}/Horizontal-Padding`),
      paddingVertical: t.size(`Badge/Spacing/${s}/Vertical-Padding`),
      gap: t.size(`Badge/Spacing/${s}/Gap`),
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: t.color(p.bg),
      ...(p.border ? { borderWidth: 1, borderColor: t.color(p.border) } : {}),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    label: { ...t.text(LABEL[s]), color: paint(t, p.content), paddingHorizontal: t.size(`Badge/Spacing/${s}/Text-Wrapper-Padding`) },
    iconSize: t.size(ICON[s]),
    iconColor: p.icon,
    contentColor: p.content,
    // Figma Remove=True: × bind Neutral/Light (Subtle), Accent Subtle = Accent/Light, Solid = màu chữ (parity §7e).
    removeColor: o.theme === 'On-Color' ? 'Color/Content/Neutral/Strongest' : o.background === 'Solid' ? p.content : o.theme === 'Accent' ? 'Color/Content/Accent/Light' : 'Color/Content/Neutral/Light',
  };
}
