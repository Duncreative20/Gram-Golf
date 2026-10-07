import type { ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { ThemeLightKey } from '../../generated/keys';

/** Figma ❖ Page-Navigations — `Page-Indicator` (40012395:25432: State Neutral|Accent|Overlay, Size Small|Medium, Dot-4..8) + `Dot`. */
export type PageIndicatorState = 'Neutral' | 'Accent' | 'Overlay';
export type PageIndicatorSize = 'Small' | 'Medium';

const PAINT: Record<PageIndicatorState, { on: ThemeLightKey; off: ThemeLightKey }> = {
  Neutral: { on: 'Color/Background/Active/Neutral/Solid', off: 'Color/Background/Active/Neutral/Subtle' },
  Accent: { on: 'Color/Background/Active/Accent/Solid', off: 'Color/Background/Active/Accent/Subtle' },
  // Overlay nằm trên ảnh → token không đổi theo scheme (Figma bind Inverse/* đảo màu khi dark, spec §7d).
  Overlay: { on: 'Color/Content/On-Dark-Overlay/Strongest', off: 'Color/Background/White-Disabled' },
};

export function pageIndicatorStyles(t: Theme, o: { state: PageIndicatorState; size: PageIndicatorSize }): { container: ViewStyle; dot: (active: boolean) => ViewStyle } {
  // Figma Small: width Popular/3XSmall, height gr-dm-6 (cùng 6) — giữ đúng bind.
  const w = o.size === 'Medium' ? t.size('Element-Size/Popular/2XSmall') : t.size('Element-Size/Popular/3XSmall');
  const h = o.size === 'Medium' ? t.size('Element-Size/Popular/2XSmall') : t.primitive('gr-dm-6');
  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space('Spacing/Gap/2XSmall'),
      paddingHorizontal: t.space('Spacing/Padding/Small'),
      paddingVertical: t.space(o.size === 'Medium' ? 'Spacing/Padding/Small' : 'Spacing/Padding/XSmall'),
    },
    dot: (active) => ({ width: w, height: h, borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color(active ? PAINT[o.state].on : PAINT[o.state].off) }),
  };
}
