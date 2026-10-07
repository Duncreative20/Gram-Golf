import type { TextStyle, ViewStyle } from 'react-native';
import { INPUT_RESET } from '../inputReset';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { IconName } from '../../icons/generated';
import type { TextStylesKey } from '../../generated/keys';

/**
 * Figma ❖ Input — `Input/Text-Field` (421:4108: Size × State, Label/Help-Text boolean) và ❖ Search — `Search/Default` (40012330:33961: Type × Size × State).
 * State Figma (Default/Hover/Focused/Typing/Inputted/Read-Only/Disabled/Inputted-Error/Blank-Error) suy từ focus/value/props.
 */
export type InputSize = 'Small' | 'Medium (Base)' | 'Large' | 'XLarge';
/** Message = ❖ Input `Input/Message-Input` (40012928:33331) pill + nút gửi; overlay = `Input/Message-Input-Overlay` (40012870:36201, tên Figma sai — NỢ FIGMA F42). */
export type InputVariant = 'Text' | 'Search' | 'Message';
export type SearchType = 'Default' | 'Rounded';
type SizeToken = 'Small' | 'Medium' | 'Large' | 'XLarge';
const SIZE_KEY: Record<InputSize, SizeToken> = { Small: 'Small', 'Medium (Base)': 'Medium', Large: 'Large', XLarge: 'XLarge' };
const TEXT: Record<SizeToken, TextStylesKey> = { Small: 'Body/XSmall/Medium', Medium: 'Body/XSmall/Medium', Large: 'Body/Base/Medium', XLarge: 'Body/Base/Medium' };

export interface TextFieldStyles {
  wrapper: ViewStyle;
  field: ViewStyle;
  input: TextStyle;
  placeholderColor: string;
  label: TextStyle;
  help: TextStyle;
  helpIcon: IconName;
  helpIconColor: PaintKey;
  helpIconSize: number;
  iconSize: number;
  iconColor: PaintKey;
  /** Chỉ variant Message: nút gửi (Button/Size/Small tròn) */
  send?: { button: ViewStyle; iconColor: PaintKey; iconSize: number };
}

export function textFieldStyles(
  t: Theme,
  o: { size: InputSize; variant?: InputVariant; searchType?: SearchType; focused?: boolean; error?: boolean; readOnly?: boolean; disabled?: boolean; overlay?: boolean; multiline?: boolean },
): TextFieldStyles {
  const s = SIZE_KEY[o.size];
  const search = o.variant === 'Search';
  const message = o.variant === 'Message';
  // overlay = ❖ Search `Search/Overlay` (40012631:12015) / Message-Input-Overlay: token Input-Overlay/*, chữ On-Dark-Overlay.
  let bg: PaintKey = o.overlay ? 'Input-Overlay/Background/Default' : 'Input/Background/Default';
  let border: PaintKey = o.overlay ? 'Input-Overlay/Border/Default' : 'Input/Border/Default';
  if (o.disabled) { bg = o.overlay ? 'Color/Background/Active/Overlay/Subtle' : 'Color/Background/Active/Neutral/Subtle'; }
  else if (o.readOnly) { bg = o.overlay ? 'Input-Overlay/Background/Default' : 'Color/Background/Neutral/Subtle/Default'; border = o.overlay ? 'Color/Border/Overlay/Subtle/Default' : 'Color/Border/Neutral/Subtle/Default'; }
  // Text-Area (450:7027) khác Text-Field: lỗi giữ nền Default, focus viền Border/Active/Neutral/Solid (ring Focus/Neutral/Subtle bỏ) — parity §7e.
  else if (o.error) { bg = o.overlay ? 'Input-Overlay/Background/Focused' : o.multiline ? 'Input/Background/Default' : 'Input/Background/Focused'; border = o.overlay ? 'Color/Border/Negative/Subtle/Default' : 'Color/Border/Negative/Solid/Default'; }
  // Overlay Typing: Figma bind Border/Active/Overlay/Subtle, Focused bind Focus/Overlay/Subtle — code lấy Focus (NỢ FIGMA F46).
  else if (o.focused) { bg = o.overlay ? 'Input-Overlay/Background/Focused' : 'Input/Background/Focused'; border = o.overlay ? 'Color/Focus/Overlay/Subtle' : o.multiline ? 'Color/Border/Active/Neutral/Solid' : 'Color/Focus/Neutral/Solid'; }
  const contentColor: PaintKey = o.disabled ? (o.overlay ? 'Color/Content/On-Dark-Overlay/Disabled' : 'Color/Content/Disabled') : o.overlay ? 'Color/Content/On-Dark-Overlay/Strongest' : 'Color/Content/Neutral/Strongest';
  const radius = (search && o.searchType === 'Rounded') || message ? t.radius('Corner-Radius/Input/Rounded') : o.overlay ? t.radius('Corner-Radius/Large') : t.radius(`Corner-Radius/Input/${s}`);
  // Message: padding/gap họ Spacing-Pill, mép phải gr-dm-8 (nút gửi tròn sát mép) — Figma bind thẳng primitive.
  const spacing: ViewStyle = message
    ? { paddingLeft: t.size(`Input/Spacing-Pill/${s}/Horizontal-Padding`), paddingRight: t.primitive('gr-dm-8'), paddingVertical: t.size(`Input/Spacing-Pill/${s}/Vertical-Padding`), gap: t.size(`Input/Spacing-Pill/${s}/Inside-Field-Gap`) }
    : { paddingHorizontal: t.size(`Input/Spacing-Regt/${s}/Horizontal-Padding`), paddingVertical: t.size(`Input/Spacing-Regt/${s}/Vertical-Padding`), gap: t.size(`Input/Spacing-Regt/${s}/Inside-Field-Gap`) };
  // Nút gửi: mặc định Button-Accent; overlay nền Accent/Subtle + icon Accent/Base (không trùng level IconButton nào → vẽ tại chỗ).
  const send: TextFieldStyles['send'] = message
    ? {
        button: {
          width: t.size('Button/Size/Small'), height: t.size('Button/Size/Small'), padding: t.space('Spacing/Padding/Small'), borderRadius: t.radius('Corner-Radius/Rounded'),
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: paint(t, o.disabled ? (o.overlay ? 'Color/Background/Subtle-Disabled' : 'Color/Background/Solid-Disabled') : o.overlay ? 'Color/Background/Accent/Subtle/Default' : 'Button-Accent/Background/Default'),
        },
        iconColor: o.disabled ? 'Color/Content/Disabled' : o.overlay ? 'Color/Content/Accent/Base' : 'Button-Accent/Content/Default',
        iconSize: t.size('Element-Size/Popular/Base'),
      }
    : undefined;
  return {
    wrapper: { gap: t.size(`Input/Spacing-Regt/${s}/Outside-Field-Gap`), alignSelf: 'stretch' },
    field: {
      flexDirection: 'row',
      alignItems: o.multiline ? 'flex-start' : 'center',
      // multiline = ❖ Input `Input/Text-Area` (450:7027): cao Text-Area/Size/<S>, còn lại như Text-Field.
      height: o.multiline ? t.size(`Text-Area/Size/${s === 'XLarge' ? 'Large' : s}`) : t.size(`Input/Size/${s}`),
      ...spacing,
      borderRadius: radius,
      borderWidth: o.multiline && o.disabled ? 0 : 1,
      borderColor: paint(t, border),
      backgroundColor: paint(t, bg),
      ...(search || o.multiline || (message && o.overlay) ? t.shadow('Effect/Input') : {}),
    },
    input: { ...INPUT_RESET, ...t.text(search || (o.multiline && s !== 'Small') ? 'Body/Base/Medium' : TEXT[s]), color: paint(t, contentColor), flex: 1, paddingVertical: 0, ...(o.multiline ? { textAlignVertical: 'top' as const, alignSelf: 'stretch' as const } : {}) },
    placeholderColor: t.color(o.overlay ? 'Color/Content/On-Dark-Overlay/Placeholder' : 'Color/Content/Placeholder'),
    label: { ...t.text('Label/Small/DemiBold'), color: t.color(o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Light') },
    help: { ...t.text(o.error ? 'Caption/Medium' : 'Caption/Regular'), color: t.color(o.error ? 'Color/Content/Negative/Light' : 'Color/Content/Neutral/Light'), flex: 1 },
    helpIcon: o.error ? 'alert-octagon-line' : 'info-circle-line',
    helpIconColor: o.error ? 'Color/Content/Negative/Light' : 'Color/Content/Neutral/Light',
    helpIconSize: t.size('Element-Size/Popular/XSmall'),
    iconSize: t.size('Element-Size/Popular/Base'),
    iconColor: o.disabled ? 'Color/Content/Disabled' : o.overlay ? 'Color/Content/On-Dark-Overlay/Base' : 'Color/Content/Neutral/Light',
    send,
  };
}
