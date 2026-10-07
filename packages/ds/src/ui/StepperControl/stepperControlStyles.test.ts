import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { numberFieldStyles, stepperControlStyles } from './stepperControlStyles';

const t = createTheme({ scheme: 'light' });

describe('stepperControlStyles (Split)', () => {
  it('Medium: cao Align-Center/Size, radius Rounded, nút XSmall; focused → Focus border', () => {
    const s = stepperControlStyles(t, { size: 'Medium' });
    expect(s.row.height).toBe(t.size('Stepper-Control-Align-Center/Size/Medium'));
    expect(s.field.borderRadius).toBe(t.radius('Corner-Radius/Stepper-Control/Rounded'));
    expect(s.buttonSize).toBe('XSmall');
    expect(stepperControlStyles(t, { size: 'Small', focused: true }).field.borderColor).toBe(t.color('Color/Focus/Neutral/Solid'));
  });
});

describe('numberFieldStyles', () => {
  it('Align-Left Medium: size/padding trái-phải/gap Align-Left, radius Stepper-Control/Medium, nhãn Body/XSmall/Regular, nút 2XSmall', () => {
    const s = numberFieldStyles(t, { size: 'Medium (Base)', align: 'Left' });
    expect(s.field.height).toBe(t.size('Stepper-Control-Align-Left/Size/Medium'));
    expect(s.field.paddingLeft).toBe(t.size('Stepper-Control-Align-Left/Spacing/Medium/Horizontal-Padding-Left'));
    expect(s.field.paddingRight).toBe(t.size('Stepper-Control-Align-Left/Spacing/Medium/Horizontal-Padding-Right'));
    expect(s.field.gap).toBe(t.size('Stepper-Control-Align-Left/Spacing/Medium/Button-Gap'));
    expect(s.field.borderRadius).toBe(t.radius('Corner-Radius/Stepper-Control/Medium'));
    expect(s.field.backgroundColor).toBe(t.component('Stepper-Control/Background/Default'));
    expect(s.label?.fontSize).toBe(t.text('Body/XSmall/Regular').fontSize);
    expect(s.label?.color).toBe(t.color('Color/Content/Neutral/Strongest'));
    expect(s.value.textAlign).toBe('left');
    expect(s.buttonSize).toBe('2XSmall');
    expect(s.wrapper.gap).toBe(t.size('Input/Spacing-Regt/Medium/Outside-Field-Gap'));
  });
  it('Align-Center Medium: Align-Center token, radius Rounded, không nhãn, nút XSmall, chữ giữa', () => {
    const s = numberFieldStyles(t, { size: 'Medium (Base)', align: 'Center' });
    expect(s.field.height).toBe(t.size('Stepper-Control-Align-Center/Size/Medium'));
    expect(s.field.paddingHorizontal).toBe(t.size('Stepper-Control-Align-Center/Spacing/Medium/Horizontal-Padding'));
    expect(s.field.borderRadius).toBe(t.radius('Corner-Radius/Stepper-Control/Rounded'));
    expect(s.label).toBeUndefined();
    expect(s.value.textAlign).toBe('center');
    expect(s.buttonSize).toBe('XSmall');
    expect(numberFieldStyles(t, { size: 'XLarge', align: 'Center' }).buttonSize).toBe('XSmall');
    expect(numberFieldStyles(t, { size: 'Small', align: 'Center' }).buttonSize).toBe('2XSmall');
    expect(numberFieldStyles(t, { size: 'XLarge', align: 'Left' }).buttonSize).toBe('XSmall');
  });
  it('states: focused Focus/Neutral/Solid + Focused bg; error Negative border + help Caption/Medium; readOnly viền Subtle; disabled nền Active/Neutral/Subtle + chữ Disabled', () => {
    const f = numberFieldStyles(t, { size: 'Large', align: 'Left', focused: true });
    expect(f.field.borderColor).toBe(t.color('Color/Focus/Neutral/Solid'));
    expect(f.field.backgroundColor).toBe(t.component('Stepper-Control/Background/Focused'));
    const e = numberFieldStyles(t, { size: 'Large', align: 'Center', error: true });
    expect(e.field.borderColor).toBe(t.color('Color/Border/Negative/Solid/Default'));
    expect(e.help.color).toBe(t.color('Color/Content/Negative/Light'));
    expect(e.helpIconColor).toBe('Color/Content/Negative/Light');
    expect(numberFieldStyles(t, { size: 'Small', align: 'Left', readOnly: true }).field.borderColor).toBe(t.color('Color/Border/Neutral/Subtle/Default'));
    const d = numberFieldStyles(t, { size: 'XLarge', align: 'Left', disabled: true });
    expect(d.field.backgroundColor).toBe(t.color('Color/Background/Active/Neutral/Subtle'));
    expect(d.value.color).toBe(t.color('Color/Content/Disabled'));
    expect(d.label?.color).toBe(t.color('Color/Content/Disabled'));
  });
});
