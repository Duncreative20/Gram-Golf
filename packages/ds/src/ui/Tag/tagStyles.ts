import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { TextStylesKey } from '../../generated/keys';

/** Figma ❖ Tag — `Tag` (288:32046: Theme Text-Only|Leading-Photo|Leading-Icon, State Default|Hover|Focused|Error|Disabled, Remove). Size Medium|Small từ token `Tag/Size/*` (Figma chỉ vẽ Medium). */
export type TagSize = 'Medium' | 'Small';
const LABEL: Record<TagSize, TextStylesKey> = { Medium: 'Body/Base/Medium', Small: 'Body/XSmall/Medium' };

export interface TagStyles { container: ViewStyle; label: TextStyle; iconSize: number; iconColor: PaintKey; removeColor: PaintKey }

export function tagStyles(t: Theme, o: { size: TagSize; error?: boolean; disabled?: boolean; pressed?: boolean }): TagStyles {
  const s = o.size;
  const bg: PaintKey = o.error ? 'Color/Background/Negative/Subtle/Default' : o.pressed ? 'Tag/Background/Hover' : 'Tag/Background/Default';
  const border: PaintKey = o.disabled ? 'Color/Border/Disabled' : o.error ? 'Color/Border/Negative/Solid/Default' : o.pressed ? 'Tag/Border/Hover' : 'Tag/Border/Default';
  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: t.size(`Tag/Size/${s}`),
      paddingHorizontal: t.size(`Tag/Spacing/${s}/Horizontal-Padding`),
      paddingVertical: t.size(`Tag/Spacing/${s}/Vertical-Padding`),
      gap: t.size(`Tag/Spacing/${s}/Gap`),
      borderRadius: t.radius('Corner-Radius/Rounded'),
      backgroundColor: paint(t, bg),
      borderWidth: 1,
      borderColor: paint(t, border),
      ...(o.disabled ? {} : t.shadow('Shadow/Action/Tertiary')),
      alignSelf: 'flex-start',
    },
    label: { ...t.text(LABEL[s]), color: t.color(o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Strongest'), paddingHorizontal: t.size(`Tag/Spacing/${s}/Text-Wrapper-Padding`) },
    iconSize: t.size('Element-Size/Popular/Small'),
    iconColor: o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Base',
    removeColor: o.error ? 'Color/Content/Negative/Light' : 'Color/Content/Placeholder',
  };
}
