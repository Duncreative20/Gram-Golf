import { spacing } from '../generated/spacing';
import { radius } from '../generated/radius';
import { size } from '../generated/size';
import { breakpoints } from '../generated/breakpoints';
import { themeLight } from '../generated/theme.light';
import { themeDark } from '../generated/theme.dark';
import { componentNeutralLight } from '../generated/component.neutral.light';
import { componentNeutralDark } from '../generated/component.neutral.dark';
import { componentBrandLight } from '../generated/component.brand.light';
import { componentBrandDark } from '../generated/component.brand.dark';
import { textStyles } from '../generated/textStyles';
import { effects } from '../generated/effects';
import { globalDimensions } from '../generated/primitives';
import { emphasis as emphasisTokens } from '../generated/weight';
import { fontFamilyFor } from './fonts';
import type {
  SpacingKey, RadiusKey, SizeKey, BreakpointsKey, ThemeLightKey, ComponentNeutralLightKey, TextStylesKey, EffectsKey, PrimitivesKey, WeightKey,
} from '../generated/keys';

export type Scheme = 'light' | 'dark';
export type Emphasis = 'neutral' | 'brand';
export interface ThemeOptions {
  scheme: Scheme;
  emphasis?: Emphasis;
}

const COMPONENT = {
  neutral: { light: componentNeutralLight, dark: componentNeutralDark },
  brand: { light: componentBrandLight, dark: componentBrandDark },
} as const;

export interface TextProps { fontFamily?: string; fontSize: number; lineHeight: number; letterSpacing: number }
export interface ShadowStyle { shadowColor: string; shadowOffset: { width: number; height: number }; shadowOpacity: number; shadowRadius: number; elevation: number }
const NO_SHADOW: ShadowStyle = { shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 };

/**
 * Alias dark mode sai trong Figma (đo 2026-09-17, spec §7d). Giá trị thay = token semantic đúng nghĩa, KHÔNG bịa hex.
 * - Input/Background/Default dark = #fafafa (sáng) trong khi Focused = #191919 → nền input tối như Surface.
 * - Color/Content/On-Accent/Default dark = #ffffff trên Accent/Solid dark = #73e3be (mint sáng) → 1.56:1 → dùng On-Brights (chữ tối).
 * - Button-Accent/Content/* dark = #ffffff, Button-Accent-Overlay/Content/* dark = #ddf8ef trên nền #fafafa → On-Brights.
 */
const DARK_FIXUP: { color: Partial<Record<ThemeLightKey, ThemeLightKey>>; component: Partial<Record<ComponentNeutralLightKey, ThemeLightKey>> } = {
  color: { 'Color/Content/On-Accent/Default': 'Color/Content/On-Brights' },
  component: {
    'Input/Background/Default': 'Color/Background/Surface/Default',
    'Button-Accent/Content/Default': 'Color/Content/On-Brights',
    'Button-Accent/Content/Pressed': 'Color/Content/On-Brights',
    'Button-Accent-Overlay/Content/Default': 'Color/Content/On-Brights',
    'Button-Accent-Overlay/Content/Pressed': 'Color/Content/On-Brights',
    // Nền *-Overlay/Background cố định trắng 20 % nhưng Figma dark alias Content → #1a1a1a (NỢ FIGMA F49)
    'Button-Primary-Overlay/Content/Default': 'Color/Content/On-Dark-Overlay/Strongest',
    'Button-Primary-Overlay/Content/Hover': 'Color/Content/On-Dark-Overlay/Strongest',
    'Button-Primary-Overlay/Content/Pressed': 'Color/Content/On-Dark-Overlay/Strongest',
    'Button-Tertiary-Overlay/Content/Default': 'Color/Content/On-Dark-Overlay/Strongest',
  },
};

// Pure: không đụng RN runtime, test được bằng vitest. Key = đúng tên Figma.
export function createTheme(opts: ThemeOptions) {
  const emphasis: Emphasis = opts.emphasis ?? 'neutral';
  const colors = opts.scheme === 'dark' ? themeDark : themeLight;
  const component = COMPONENT[emphasis][opts.scheme];
  return {
    scheme: opts.scheme,
    emphasis,
    // Audit tương phản 2026-09-17 (src/audit/contrast.test.ts): vài alias DARK trong Figma trỏ sai → chữ tàng hình.
    // Override tại đây, có danh sách ở DARK_FIXUP; Dũng sửa trong Figma + dump lại thì xoá dòng tương ứng.
    color: (k: ThemeLightKey): string => (opts.scheme === 'dark' && DARK_FIXUP.color[k] ? (colors[DARK_FIXUP.color[k]] as string) : (colors[k] as string)),
    component: (k: ComponentNeutralLightKey): string => {
      const fix = opts.scheme === 'dark' ? DARK_FIXUP.component[k] : undefined;
      return fix ? (colors[fix] as string) : (component[k] as string);
    },
    space: (k: SpacingKey): number => spacing[k],
    radius: (k: RadiusKey): number => radius[k],
    size: (k: SizeKey): number => size[k],
    layout: (k: BreakpointsKey): number => breakpoints[k],
    // Chỉ khi Figma bind thẳng primitive (vd Icon-Flat icon = gr-dm-28); app không import primitives trực tiếp.
    primitive: (k: PrimitivesKey): number => globalDimensions[k],
    // Emphasis Level: font-weight số và border-weight (vd Tab indicator = Emphasis/Border-Weight/Active).
    weight: (k: WeightKey): number => emphasisTokens[k],
    text: (k: TextStylesKey): TextProps => {
      const s = textStyles[k];
      const fontFamily = fontFamilyFor(s.fontFamily, s.fontStyle);
      return { ...(fontFamily ? { fontFamily } : {}), fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing };
    },
    // ponytail: RN chỉ vẽ 1 shadow; lấy lớp đầu (bóng lớn nhất). Nhiều lớp → dùng thư viện shadow khi cần.
    shadow: (k: EffectsKey): ShadowStyle => {
      const s = effects[k][0];
      if (!s) return NO_SHADOW;
      const alpha = s.color.length === 9 ? parseInt(s.color.slice(7), 16) / 255 : 1;
      return {
        shadowColor: s.color.slice(0, 7),
        shadowOffset: { width: s.offsetX, height: s.offsetY },
        shadowOpacity: Math.round(alpha * 100) / 100,
        shadowRadius: s.blur / 2,
        elevation: Math.max(1, Math.round(s.blur / 2)),
      };
    },
  };
}
export type Theme = ReturnType<typeof createTheme>;
