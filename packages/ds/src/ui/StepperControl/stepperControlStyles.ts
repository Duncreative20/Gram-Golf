import type { TextStyle, ViewStyle } from 'react-native';
import { INPUT_RESET } from '../inputReset';
import type { Theme } from '../../theme/createTheme';
import { paint, type PaintKey } from '../../theme/paint';
import type { IconButtonSize } from '../Button/buttonStyles';

/** Figma ❖ Input — `Stepper-Control-Split` (40012434:16146: Size XLarge|Large|Medium|Small, State, Plus/Minus boolean). Nút = Icon-Main Tertiary. */
export type StepperControlSize = 'XLarge' | 'Large' | 'Medium' | 'Small';
const BUTTON: Record<StepperControlSize, IconButtonSize> = { XLarge: 'Small', Large: 'XSmall', Medium: 'XSmall', Small: '2XSmall' };

export interface StepperControlStyles { row: ViewStyle; field: ViewStyle; value: TextStyle; buttonSize: IconButtonSize }

export function stepperControlStyles(t: Theme, o: { size: StepperControlSize; focused?: boolean; error?: boolean; disabled?: boolean }): StepperControlStyles {
  let bg: PaintKey = 'Stepper-Control/Background/Default';
  let border: PaintKey = 'Stepper-Control/Border/Default';
  if (o.disabled) { /* Figma Disabled giữ Background/Default + Border/Default, chỉ chữ Disabled (parity §7e) */ }
  else if (o.error) { bg = 'Stepper-Control/Background/Focused'; border = 'Color/Border/Negative/Solid/Default'; }
  else if (o.focused) { bg = 'Stepper-Control/Background/Focused'; border = 'Color/Focus/Neutral/Solid'; }
  return {
    row: { flexDirection: 'row', alignItems: 'center', gap: t.size(`Stepper-Control-Align-Center/Spacing/${o.size}/Button-Gap`), height: t.size(`Stepper-Control-Align-Center/Size/${o.size}`) },
    field: {
      flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: t.size(`Stepper-Control-Align-Center/Spacing/${o.size}/Horizontal-Padding`),
      paddingVertical: t.size(`Stepper-Control-Align-Center/Spacing/${o.size}/Vertical-Padding`),
      borderRadius: t.radius('Corner-Radius/Stepper-Control/Rounded'),
      borderWidth: 1, borderColor: paint(t, border), backgroundColor: paint(t, bg),
      // Figma bind Stepper-Control/Shadow/Base (màu), lớp effect = Effect/Input (spec §7).
      ...t.shadow('Effect/Input'),
    },
    value: { ...INPUT_RESET, ...t.text('Body/Base/Medium'), color: t.color(o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Strongest'), textAlign: 'center' },
    buttonSize: BUTTON[o.size],
  };
}

/**
 * Figma ❖ Input — `Input/Number-Align-Left` (40012330:6943) / `Input/Number-Align-Center` (40012330:14156): Size × State, nút ± NẰM TRONG ô.
 * Left: nhãn + số bên trái, nút ± bên phải, radius Stepper-Control/<S>. Center: số giữa, nút hai mép, radius Rounded.
 */
export type NumberFieldSize = 'Small' | 'Medium (Base)' | 'Large' | 'XLarge';
export type NumberFieldAlign = 'Left' | 'Center';
const NF_SIZE: Record<NumberFieldSize, StepperControlSize> = { Small: 'Small', 'Medium (Base)': 'Medium', Large: 'Large', XLarge: 'XLarge' };
// Nút ± theo Figma (dump State=Default mọi Size): Left Small/Medium = 2XSmall, Large/XLarge = XSmall; Center Small = 2XSmall, còn lại XSmall.
const NF_BUTTON: Record<NumberFieldAlign, Record<StepperControlSize, IconButtonSize>> = {
  Left: { XLarge: 'XSmall', Large: 'XSmall', Medium: '2XSmall', Small: '2XSmall' },
  Center: { XLarge: 'XSmall', Large: 'XSmall', Medium: 'XSmall', Small: '2XSmall' },
};

export interface NumberFieldStyles { wrapper: ViewStyle; label?: TextStyle; field: ViewStyle; value: TextStyle; placeholderColor: string; help: TextStyle; helpIconColor: PaintKey; helpIconSize: number; buttonSize: IconButtonSize }

export function numberFieldStyles(t: Theme, o: { size: NumberFieldSize; align: NumberFieldAlign; focused?: boolean; error?: boolean; readOnly?: boolean; disabled?: boolean }): NumberFieldStyles {
  const s = NF_SIZE[o.size];
  let bg: PaintKey = 'Stepper-Control/Background/Default';
  let border: PaintKey = 'Stepper-Control/Border/Default';
  if (o.disabled) { bg = 'Color/Background/Active/Neutral/Subtle'; }
  else if (o.readOnly) { border = 'Color/Border/Neutral/Subtle/Default'; }
  else if (o.error) { bg = 'Stepper-Control/Background/Focused'; border = 'Color/Border/Negative/Solid/Default'; }
  else if (o.focused) { bg = 'Stepper-Control/Background/Focused'; border = 'Color/Focus/Neutral/Solid'; }
  const left = o.align === 'Left';
  return {
    wrapper: { gap: t.size(`Input/Spacing-Regt/${s}/Outside-Field-Gap`), alignSelf: 'stretch' },
    label: left ? { ...t.text('Body/XSmall/Regular'), color: t.color(o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Strongest') } : undefined,
    field: {
      flexDirection: 'row', alignItems: 'center',
      ...(left
        ? {
            height: t.size(`Stepper-Control-Align-Left/Size/${s}`),
            // Left Large: Figma bind Horizontal-Padding-Left cho paddingTop — code lấy Vertical-Padding (NỢ FIGMA F44).
            paddingVertical: t.size(`Stepper-Control-Align-Left/Spacing/${s}/Vertical-Padding`),
            paddingLeft: t.size(`Stepper-Control-Align-Left/Spacing/${s}/Horizontal-Padding-Left`),
            paddingRight: t.size(`Stepper-Control-Align-Left/Spacing/${s}/Horizontal-Padding-Right`),
            gap: t.size(`Stepper-Control-Align-Left/Spacing/${s}/Button-Gap`),
            borderRadius: t.radius(`Corner-Radius/Stepper-Control/${s}`),
          }
        : {
            height: t.size(`Stepper-Control-Align-Center/Size/${s}`),
            // Center Large: Figma bind Horizontal-Padding cho trên/dưới (như Split F40) — code lấy Vertical-Padding (NỢ FIGMA F48).
            paddingVertical: t.size(`Stepper-Control-Align-Center/Spacing/${s}/Vertical-Padding`),
            paddingHorizontal: t.size(`Stepper-Control-Align-Center/Spacing/${s}/Horizontal-Padding`),
            gap: t.size(`Stepper-Control-Align-Center/Spacing/${s}/Button-Gap`),
            borderRadius: t.radius('Corner-Radius/Stepper-Control/Rounded'),
          }),
      borderWidth: 1, borderColor: paint(t, border), backgroundColor: paint(t, bg),
      ...t.shadow('Effect/Input'),
    },
    value: { ...INPUT_RESET, ...t.text('Body/Base/Medium'), color: t.color(o.disabled ? 'Color/Content/Disabled' : 'Color/Content/Neutral/Strongest'), flex: 1, textAlign: left ? 'left' : 'center', paddingVertical: 0 },
    placeholderColor: t.color('Color/Content/Placeholder'),
    help: { ...t.text(o.error ? 'Caption/Medium' : 'Caption/Regular'), color: t.color(o.error ? 'Color/Content/Negative/Light' : 'Color/Content/Neutral/Light'), flex: 1 },
    helpIconColor: o.error ? 'Color/Content/Negative/Light' : 'Color/Content/Neutral/Light',
    helpIconSize: t.size('Element-Size/Popular/XSmall'),
    buttonSize: NF_BUTTON[o.align][s],
  };
}
