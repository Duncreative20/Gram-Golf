import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { SizeKey, TextStylesKey } from '../../generated/keys';

/**
 * Figma ❖ Segmented — set `Segmented` (1238:892, Level) + `Primitives/Segmented/Item` (1204:11690).
 * Figma ghép chéo Level ↔ token item (NỢ FIGMA F1) → code lấy Level = tên token item.
 */
export type SegmentedLevel = 'Primary' | 'Secondary';
export type SegmentedSize = 'Medium' | 'Small';
// NỢ FIGMA F1 (docs/ds/figma-debt.md): set `Segmented` đặt tên Level ngược với token item (Level=Secondary dùng Segmented-Item-Primary).
// Code lấy chuẩn: Level = tên token item; Primary = container Surface/Default + Item-Primary, Secondary = Surface/Alt + Item-Secondary.

const LABEL: Record<SegmentedSize, TextStylesKey> = { Medium: 'Body/Base/Medium', Small: 'Body/XSmall/Medium' };
const ICON: Record<SegmentedSize, SizeKey> = { Medium: 'Element-Size/Popular/Base', Small: 'Element-Size/Popular/Small' };
// Figma đặt tên token Small có hậu tố " 2" (lỗi đặt tên trong DS) → giữ đúng key.
const TEXT_WRAP: Record<SegmentedSize, SizeKey> = { Medium: 'Segmented/Spacing/Medium/Text-Wrapper-Padding', Small: 'Segmented/Spacing/Small/Text-Wrapper-Padding 2' };

export function segmentedContainerStyles(t: Theme, o: { level: SegmentedLevel }): ViewStyle {
  return {
    flexDirection: 'row',
    padding: t.space('Spacing/Padding/2XSmall'),
    // ponytail: Figma chỉ có Container-Corner-Radius-Medium; Small dùng chung.
    borderRadius: t.size('Segmented/Container-Corner-Radius-Medium'),
    backgroundColor: t.color(o.level === 'Primary' ? 'Color/Background/Surface/Default' : 'Color/Background/Surface/Alt'),
    ...t.shadow('Effect/Overlay'),
  };
}

export interface SegmentedItemStyles { item: ViewStyle; label: TextStyle; iconSize: number; iconColor: PaintKey; contentColor: PaintKey }

export function segmentedItemStyles(t: Theme, o: { level: SegmentedLevel; size: SegmentedSize; selected: boolean; pressed?: boolean }): SegmentedItemStyles {
  const L = o.level;
  const s = o.size;
  const content: PaintKey = o.selected ? `Segmented-Item-${L}/Content/Selected` : o.pressed ? 'Color/Content/Neutral/Strongest' : 'Color/Content/Neutral/Light';
  const bg: PaintKey = o.selected ? `Segmented-Item-${L}/Background/Selected/Default` : o.pressed ? `Segmented-Item-${L}/Background/Unselected/Hover` : `Segmented-Item-${L}/Background/Unselected/Default`;
  const border: PaintKey = L === 'Primary' ? 'Segmented-Item-Primary/Border/Selected' : 'Color/Border/Neutral/Pale/Default';
  return {
    item: {
      // grow chia đều khi container kéo giãn; basis auto để container hug (Picker góc dưới) không cắt chữ (cổng UI app 2026-09-24)
      flexGrow: 1, flexShrink: 1, flexBasis: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: t.size(`Segmented/Size/${s}`),
      paddingHorizontal: t.size(`Segmented/Spacing/${s}/Horizontal-Padding`),
      paddingVertical: t.size(`Segmented/Spacing/${s}/Vertical-Padding`),
      gap: t.size(`Segmented/Spacing/${s}/Gap`),
      borderRadius: t.size('Segmented/Item-Corner-Radius-Medium'),
      backgroundColor: paint(t, bg),
      ...(o.selected ? { borderWidth: 1, borderColor: paint(t, border), ...t.shadow('Shadow/Action/Basic') } : {}),
    },
    label: { ...t.text(LABEL[s]), color: paint(t, content), paddingHorizontal: t.size(TEXT_WRAP[s]) },
    iconSize: t.size(ICON[s]),
    iconColor: content,
    contentColor: content,
  };
}
