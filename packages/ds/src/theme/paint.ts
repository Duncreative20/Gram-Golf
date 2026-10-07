import type { Theme } from './createTheme';
import type { ComponentNeutralLightKey, ThemeLightKey } from '../generated/keys';

/** Figma bind màu từ 2 collection: semantic `Color/...` và component `Button-.../...`. Một hàm resolve cả hai. */
export type PaintKey = ThemeLightKey | ComponentNeutralLightKey;

export function paint(t: Theme, k: PaintKey): string {
  return k.startsWith('Color/') ? t.color(k as ThemeLightKey) : t.component(k as ComponentNeutralLightKey);
}
