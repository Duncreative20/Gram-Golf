import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import type { TextStylesKey } from '../../generated/keys';
import type { InputSize } from './textFieldStyles';

/** Figma ❖ Input — `Input/Field-Group` (40012571:16727: Size XLarge|Large|Medium|Small): nhãn + khung chung, các dòng nhập chỉ có vạch ngăn. */
type SizeToken = 'Small' | 'Medium' | 'Large' | 'XLarge';
const SIZE_KEY: Record<InputSize, SizeToken> = { Small: 'Small', 'Medium (Base)': 'Medium', Large: 'Large', XLarge: 'XLarge' };
const TEXT: Record<SizeToken, TextStylesKey> = { Small: 'Body/XSmall/Medium', Medium: 'Body/XSmall/Medium', Large: 'Body/Base/Medium', XLarge: 'Body/Base/Medium' };

export interface FieldGroupStyles { wrapper: ViewStyle; label: TextStyle; group: ViewStyle; row: ViewStyle; rowDivider: ViewStyle; input: TextStyle; placeholderColor: string }

export function fieldGroupStyles(t: Theme, o: { size: InputSize }): FieldGroupStyles {
  const s = SIZE_KEY[o.size];
  return {
    // Figma bind XLarge/Outside-Field-Gap cho mọi Size — code lấy theo Size (NỢ FIGMA F45).
    wrapper: { gap: t.size(`Input/Spacing-Regt/${s}/Outside-Field-Gap`), alignSelf: 'stretch' },
    label: { ...t.text('Body/Base/DemiBold'), color: t.color('Color/Content/Neutral/Strongest'), paddingHorizontal: t.space('Spacing/Padding/XSmall') },
    group: { borderRadius: t.radius(`Corner-Radius/Input/${s}`), borderWidth: 1, borderColor: t.component('Input/Border/Default'), backgroundColor: t.component('Input/Background/Default'), overflow: 'hidden' },
    row: {
      flexDirection: 'row', alignItems: 'center',
      height: t.size(`Input/Size/${s}`),
      paddingHorizontal: t.size(`Input/Spacing-Regt/${s}/Horizontal-Padding`),
      paddingVertical: t.size(`Input/Spacing-Regt/${s}/Vertical-Padding`),
      gap: t.size(`Input/Spacing-Regt/${s}/Inside-Field-Gap`),
    },
    rowDivider: { borderTopWidth: 1, borderTopColor: t.component('Input/Border/Default') },
    // Figma Field-Group chưa có state Focused → giữ outline trình duyệt trên web (docs/ds/figma-debt.md §E)
    input: { ...t.text(TEXT[s]), color: t.color('Color/Content/Neutral/Strongest'), flex: 1, paddingVertical: 0 },
    placeholderColor: t.color('Color/Content/Placeholder'),
  };
}
