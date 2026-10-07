import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { RadiusKey, SizeKey, SpacingKey, TextStylesKey } from '../../generated/keys';

/**
 * Figma ❖ Accordion — `Accordion/Text` (239:16847: Size XLarge|Large|Medium, Theme Divider|Box, Expanded).
 * Parity đợt 4: header gap theo size (XLarge Medium, Large Small, Medium XSmall); XLarge icon có wrapper pad 2XSmall trong Figma (bỏ qua).
 */
export type AccordionSize = 'XLarge' | 'Large' | 'Medium';
export type AccordionTheme = 'Divider' | 'Box';

const SIZE: Record<AccordionSize, { pad: SpacingKey; gap: SpacingKey; title: TextStylesKey; icon: SizeKey; radius: RadiusKey }> = {
  XLarge: { pad: 'Spacing/Padding/XLarge', gap: 'Spacing/Gap/Medium', title: 'Heading/3', icon: 'Element-Size/Popular/Large', radius: 'Corner-Radius/2XLarge' },
  Large: { pad: 'Spacing/Padding/Medium', gap: 'Spacing/Gap/Small', title: 'Heading/4', icon: 'Element-Size/Popular/Medium', radius: 'Corner-Radius/Large' },
  Medium: { pad: 'Spacing/Padding/Medium', gap: 'Spacing/Gap/XSmall', title: 'Heading/Subheading', icon: 'Element-Size/Popular/Base', radius: 'Corner-Radius/Large' },
};

export interface AccordionStyles { container: ViewStyle; header: ViewStyle; title: TextStyle; body: TextStyle; iconSize: number }

export function accordionStyles(t: Theme, o: { size: AccordionSize; theme: AccordionTheme }): AccordionStyles {
  const c = SIZE[o.size];
  const box = o.theme === 'Box';
  return {
    container: {
      gap: t.space('Spacing/Gap/Medium'),
      padding: t.space(c.pad),
      ...(box
        ? { backgroundColor: t.color('Color/Background/Support/Neutral/Pale'), borderRadius: t.radius(c.radius) }
        : { paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: t.color('Color/Border/Neutral/Subtle/Default') }),
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.space(c.gap) },
    title: { ...t.text(c.title), color: t.color('Color/Content/Neutral/Strongest'), flex: 1 },
    body: { ...t.text('Body/Base/Regular'), color: t.color('Color/Content/Neutral/Base') },
    iconSize: t.size(c.icon),
  };
}
