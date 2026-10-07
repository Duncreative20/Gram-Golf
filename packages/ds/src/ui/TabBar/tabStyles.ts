import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';

/**
 * Figma ❖ Tab — set `Tab-Bar` (1577:5477, Style=Indicator|Subtle|Top) + `Primitives/Tab-Item` (40012691:10947).
 * Style=Top = Indicator với Icon=Top. Hover → pressed.
 */
export type TabStyle = 'Indicator' | 'Subtle' | 'Top';
export type TabSize = 'Medium' | 'Small';
export type TabIcon = 'Leading' | 'None' | 'Top';

export function tabBarStyles(t: Theme, o: { style: TabStyle }): ViewStyle {
  if (o.style === 'Subtle') return { flexDirection: 'row', gap: t.space('Spacing/Gap/3XSmall'), alignItems: 'center' };
  return {
    flexDirection: 'row',
    gap: t.space('Spacing/Gap/Large'),
    paddingHorizontal: t.space('Spacing/Gap/Medium'),
    borderBottomWidth: 1,
    borderBottomColor: t.color('Color/Border/Neutral/Pale/Default'),
    alignItems: 'flex-end',
  };
}

export interface TabItemStyles { outer: ViewStyle; inner: ViewStyle; label: TextStyle; indicator: ViewStyle | null; iconSize: number; iconColor: PaintKey; /** Icon=Top: badge neo góc trên-phải icon */ badgeTop: ViewStyle | null }

export function tabItemStyles(
  t: Theme,
  o: { style: TabStyle; size: TabSize; icon: TabIcon; selected: boolean; pressed?: boolean; disabled?: boolean },
): TabItemStyles {
  const s = o.size;
  const content: PaintKey = o.disabled ? 'Color/Content/Disabled' : o.selected ? 'Tab/Content/Selected' : o.pressed ? 'Tab/Content/Hover' : 'Tab/Content/Default';
  // Figma Icon=None không có icon; Small → Popular/Small (parity đợt 4).
  const iconSize = o.icon === 'None' ? 0 : t.size(s === 'Small' ? 'Element-Size/Popular/Small' : 'Element-Size/Popular/Base');
  const label: TextStyle = { ...t.text('Body/Small/DemiBold'), color: paint(t, content) };
  if (o.style === 'Subtle') {
    return {
      // ponytail: Figma Subtle Select=Yes cao 40 (Button/Size/Small) vs 48 khi No → layout nhảy; đợt 1 giữ Medium cả hai (spec §7 Open).
      outer: { height: t.size(s === 'Small' ? 'Tab-Item/Size/Small/Height' : 'Button/Size/Medium'), justifyContent: 'center' },
      badgeTop: null,
      inner: {
        flexDirection: o.icon === 'Top' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.size(`Tab-Item/Spacing/${s}/Gap`),
        paddingHorizontal: t.space(s === 'Small' ? 'Spacing/Padding/XSmall' : 'Spacing/Padding/Small'),
        paddingVertical: t.space('Spacing/Padding/XSmall'),
        minWidth: t.size(`Tab-Item/Size/${s}/Min-Width`),
        borderRadius: t.radius('Corner-Radius/Rounded'),
        backgroundColor: paint(t, o.selected ? 'Tab/Background/Selected' : o.pressed ? 'Tab/Background/Hover' : 'Tab/Background/Default'),
      },
      label,
      indicator: null,
      iconSize,
      iconColor: content,
    };
  }
  const top = o.style === 'Top' || o.icon === 'Top';
  return {
    outer: {
      // Figma Icon=Top và Tab-Bar Style=Top đều bind `Height` (token Icon-Top-Height không được dùng — NỢ FIGMA F41).
      height: t.size(`Tab-Item/Size/${s}/Height`),
      paddingTop: t.space(s === 'Small' ? 'Spacing/Padding/3XSmall' : 'Spacing/Padding/2XSmall'), // Small Icon=None Figma bind 2XSmall (NỢ FIGMA F38)
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    inner: {
      flexDirection: top ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.size(`Tab-Item/Spacing/${s}/Gap`),
      paddingHorizontal: t.size(`Tab-Item/Spacing/${s}/Horizontal-Padding`),
      paddingVertical: t.space('Spacing/Padding/XSmall'),
      minWidth: t.size(`Tab-Item/Size/${s}/Min-Width`),
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: paint(t, o.pressed ? 'Tab/Background/Hover' : 'Tab/Background/Default'),
    },
    label,
    // Icon=Top: badge không xếp trong cột (rơi ra ngoài ô) mà neo góc trên-phải icon như Figma.
    badgeTop: top ? { position: 'absolute', top: -t.space('Spacing/Gap/XSmall'), right: -t.space('Spacing/Gap/Small') } : null,
    indicator: o.selected
      ? { alignSelf: 'stretch', height: t.weight('Emphasis/Border-Weight/Active'), backgroundColor: paint(t, 'Tab/Border/Selected'), borderRadius: t.radius('Corner-Radius/Rounded') }
      : { alignSelf: 'stretch', height: t.weight('Emphasis/Border-Weight/Active'), backgroundColor: 'transparent' },
    iconSize,
    iconColor: content,
  };
}
