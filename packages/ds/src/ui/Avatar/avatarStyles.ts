import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { RadiusKey, SizeKey, TextStylesKey, ThemeLightKey } from '../../generated/keys';

/**
 * Figma ❖ Avatar — set `Avatar/Single` (223:9050): Shape × Size × Theme × Background; Status boolean.
 * Đợt 1 (spec D4): bỏ Focus / Button- / Selected.
 */
export type AvatarSize = '3XLarge' | '2XLarge' | 'XLarge' | 'Large' | 'Medium' | 'Small' | 'XSmall' | '2XSmall';
export type AvatarShape = 'Circle' | 'Square';
export type AvatarBackground = 'Solid' | 'Subtle';
type SupportTheme = 'Yellow' | 'Orange' | 'Red' | 'Crimson' | 'Pink' | 'Plum' | 'Purple' | 'Violet' | 'Indigo' | 'Blue' | 'Cyan' | 'Teal' | 'Green' | 'Brown';
export type AvatarTheme = 'Photo' | 'Accent' | 'Neutral' | SupportTheme;

const SQUARE_RADIUS: Record<AvatarSize, RadiusKey> = {
  '3XLarge': 'Corner-Radius/3XLarge', '2XLarge': 'Corner-Radius/XLarge', XLarge: 'Corner-Radius/Large', Large: 'Corner-Radius/Base',
  Medium: 'Corner-Radius/Base', Small: 'Corner-Radius/Small', XSmall: 'Corner-Radius/XSmall', '2XSmall': 'Corner-Radius/XSmall',
};
const TEXT: Record<AvatarSize, TextStylesKey> = {
  '3XLarge': 'Display/4', '2XLarge': 'Heading/3', XLarge: 'Heading/4', Large: 'Heading/4',
  Medium: 'Heading/Subheading', Small: 'Body/Base/DemiBold', XSmall: 'Body/XSmall/DemiBold', '2XSmall': 'Body/XSmall/DemiBold',
};
const STATUS: Record<AvatarSize, SizeKey> = {
  '3XLarge': 'Element-Size/Popular/Small', '2XLarge': 'Element-Size/Popular/Small', XLarge: 'Element-Size/Popular/XSmall', Large: 'Element-Size/Popular/2XSmall',
  Medium: 'Element-Size/Popular/2XSmall', Small: 'Element-Size/Popular/2XSmall', XSmall: 'Element-Size/Popular/2XSmall', '2XSmall': 'Element-Size/Popular/2XSmall',
};

interface Paint { bg: ThemeLightKey; border: ThemeLightKey; content: ThemeLightKey }
const SURFACE: ThemeLightKey = 'Color/Background/Surface/Default';
const support = <N extends SupportTheme>(n: N): Record<AvatarBackground, Paint> => ({
  Solid: { bg: `Color/Background/Support/${n}/Solid`, border: `Color/Border/Support/${n}/Subtle`, content: n === 'Yellow' ? 'Color/Content/On-Brights' : 'Color/Content/On-Colors' },
  Subtle: { bg: `Color/Background/Support/${n}/Subtle`, border: `Color/Border/Support/${n}/Subtle`, content: `Color/Content/Support/${n}/Strongest` },
});
const THEME: Record<AvatarTheme, Record<AvatarBackground, Paint>> = {
  Photo: {
    Solid: { bg: SURFACE, border: 'Color/Border/Inverse', content: 'Color/Content/Accent/Base' },
    Subtle: { bg: SURFACE, border: 'Color/Border/Inverse', content: 'Color/Content/Accent/Base' },
  },
  Accent: {
    Solid: { bg: 'Color/Background/Accent/Solid/Default', border: 'Color/Border/Active/Accent/Subtle', content: 'Color/Content/On-Accent/Default' },
    Subtle: { bg: 'Color/Background/Accent/Subtle/Default', border: 'Color/Border/Active/Accent/Subtle', content: 'Color/Content/Accent/Strongest' },
  },
  Neutral: {
    Solid: { bg: 'Color/Background/Neutral/Solid/Default', border: 'Color/Border/Inverse', content: 'Color/Content/Inverse/Strongest' },
    Subtle: { bg: 'Color/Background/Neutral/Subtle/Default', border: 'Color/Border/Support/Neutral/Subtle', content: 'Color/Content/Neutral/Strongest' },
  },
  Yellow: support('Yellow'), Orange: support('Orange'), Red: support('Red'), Crimson: support('Crimson'), Pink: support('Pink'),
  Plum: support('Plum'), Purple: support('Purple'), Violet: support('Violet'), Indigo: support('Indigo'), Blue: support('Blue'),
  Cyan: support('Cyan'), Teal: support('Teal'), Green: support('Green'), Brown: support('Brown'),
};

export interface AvatarStyles { container: ViewStyle; text: TextStyle; status: ViewStyle }

export function avatarStyles(t: Theme, o: { size: AvatarSize; shape: AvatarShape; theme: AvatarTheme; background: AvatarBackground }): AvatarStyles {
  const p = THEME[o.theme][o.background];
  const dim = t.size(`Image-Size/${o.size}`);
  const statusDim = t.size(STATUS[o.size]);
  return {
    container: {
      width: dim,
      height: dim,
      borderRadius: o.shape === 'Circle' ? t.radius('Corner-Radius/Rounded') : t.radius(SQUARE_RADIUS[o.size]),
      borderWidth: 1,
      borderColor: t.color(p.border),
      backgroundColor: t.color(p.bg),
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      // Figma: initials (không Photo) có Effect/Overlay (parity §7e).
      ...(o.theme === 'Photo' ? {} : t.shadow('Effect/Overlay')),
    },
    text: { ...t.text(TEXT[o.size]), color: t.color(p.content) },
    status: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: statusDim,
      height: statusDim,
      borderRadius: t.radius('Corner-Radius/Rounded'),
      borderWidth: 1,
      borderColor: t.color('Color/Border/Inverse'),
      backgroundColor: t.color('Color/Background/Positive/Solid/Default'),
    },
  };
}
