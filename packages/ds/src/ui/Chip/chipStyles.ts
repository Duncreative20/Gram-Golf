import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { SizeKey, TextStylesKey } from '../../generated/keys';
import type { AvatarSize } from '../Avatar/avatarStyles';

/**
 * Figma ❖ Chip/Pill — `Chip/Normal` (512:6843: Size Medium|Small|XSmall, Level Primary|Secondary, Theme Text-Only|Leading-Icon|Leading-Photo, Select),
 * `Chip/Advanced` (512:7659: Counter badge + trailing chevron, Secondary), `Chip/Number-Only` (1536:26687: vuông).
 * Hover/Press → pressed.
 */
export type ChipVariant = 'Normal' | 'Advanced' | 'Number-Only';
export type ChipSize = 'Medium' | 'Small' | 'XSmall';
export type ChipLevel = 'Primary' | 'Secondary';

const LABEL: Record<ChipVariant, Record<ChipSize, TextStylesKey>> = {
  Normal: { Medium: 'Body/XSmall/DemiBold', Small: 'Body/XSmall/DemiBold', XSmall: 'Body/XSmall/DemiBold' },
  Advanced: { Medium: 'Body/Base/Medium', Small: 'Body/XSmall/Medium', XSmall: 'Body/XSmall/Medium' },
  'Number-Only': { Medium: 'Body/Base/DemiBold', Small: 'Body/Base/DemiBold', XSmall: 'Body/Base/DemiBold' },
};
const ICON: Record<ChipSize, SizeKey> = { Medium: 'Element-Size/Popular/Base', Small: 'Element-Size/Popular/Base', XSmall: 'Element-Size/Popular/Small' };
const PHOTO: Record<ChipSize, AvatarSize> = { Medium: 'Small', Small: 'XSmall', XSmall: '2XSmall' };

export interface ChipStyles { container: ViewStyle; label: TextStyle; iconSize: number; iconColor: PaintKey; photoSize: AvatarSize; trailingSize: number }

export function chipStyles(t: Theme, o: { variant: ChipVariant; size: ChipSize; level: ChipLevel; select: boolean; pressed?: boolean }): ChipStyles {
  const L = o.level;
  const s = o.size;
  const bg: PaintKey = o.select ? (o.pressed ? `Chip-${L}/Background/Selected/Hover` : `Chip-${L}/Background/Selected/Default`) : o.pressed ? `Chip-${L}/Background/Unselected/Hover` : `Chip-${L}/Background/Unselected/Default`;
  // Primary Selected không có stroke trong Figma.
  const border: PaintKey | null = o.select ? (L === 'Primary' ? null : 'Chip-Secondary/Border/Selected') : `Chip-${L}/Border/Default`;
  // Normal unselected chữ Neutral/Base; Advanced/Number-Only dùng Chip-Secondary/Content/Default (kể cả Level Primary, như Figma).
  const content: PaintKey = o.select ? `Chip-${L}/Content/Selected` : o.variant === 'Normal' && !o.pressed ? 'Color/Content/Neutral/Base' : 'Chip-Secondary/Content/Default';
  const height = t.size(`Chip/Size/${s}`);
  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height,
      ...(o.variant === 'Number-Only' ? { width: height } : { paddingHorizontal: t.size(`Chip/Spacing/${s}/Horizontal-Padding`) }),
      paddingVertical: t.size(`Chip/Spacing/${s}/Vertical-Padding`),
      gap: t.size(`Chip/Spacing/${s}/Gap`),
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: paint(t, bg),
      ...(border ? { borderWidth: 1, borderColor: paint(t, border) } : {}),
      ...t.shadow('Shadow/Action/Tertiary'),
    },
    label: { ...t.text(LABEL[o.variant][s]), color: paint(t, content) },
    iconSize: t.size(ICON[s]),
    iconColor: o.variant === 'Advanced' && !o.select && !o.pressed ? 'Color/Content/Neutral/Light' : content,
    photoSize: PHOTO[s],
    trailingSize: t.size(s === 'Medium' ? 'Element-Size/Popular/Base' : 'Element-Size/Popular/Small'),
  };
}
