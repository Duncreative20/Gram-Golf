import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { textFieldStyles } from './textFieldStyles';
import { INPUT_RESET } from '../inputReset';

const t = createTheme({ scheme: 'light' });

describe('textFieldStyles', () => {
  it('Medium (Base) Default: size/padding/radius/bg/border token, text XSmall Medium', () => {
    const s = textFieldStyles(t, { size: 'Medium (Base)' });
    expect(s.field.height).toBe(t.size('Input/Size/Medium'));
    expect(s.field.paddingHorizontal).toBe(t.size('Input/Spacing-Regt/Medium/Horizontal-Padding'));
    expect(s.field.borderRadius).toBe(t.radius('Corner-Radius/Input/Medium'));
    expect(s.field.backgroundColor).toBe(t.component('Input/Background/Default'));
    expect(s.field.borderColor).toBe(t.component('Input/Border/Default'));
    expect(s.input.fontSize).toBe(t.text('Body/XSmall/Medium').fontSize);
    expect(s.placeholderColor).toBe(t.color('Color/Content/Placeholder'));
    expect(s.wrapper.gap).toBe(t.size('Input/Spacing-Regt/Medium/Outside-Field-Gap'));
    expect(s.label.color).toBe(t.color('Color/Content/Neutral/Light'));
    expect(s.helpIcon).toBe('info-circle-line');
  });
  it('Large text Body/Base; focused → Focus border + Focused bg; error → Negative border, help Caption/Medium', () => {
    expect(textFieldStyles(t, { size: 'Large' }).input.fontSize).toBe(t.text('Body/Base/Medium').fontSize);
    const f = textFieldStyles(t, { size: 'Small', focused: true });
    expect(f.field.borderColor).toBe(t.color('Color/Focus/Neutral/Solid'));
    expect(f.field.backgroundColor).toBe(t.component('Input/Background/Focused'));
    const e = textFieldStyles(t, { size: 'Small', focused: true, error: true });
    expect(e.field.borderColor).toBe(t.color('Color/Border/Negative/Solid/Default'));
    expect(e.help.color).toBe(t.color('Color/Content/Negative/Light'));
    expect(e.helpIcon).toBe('alert-octagon-line');
  });
  it('readOnly / disabled', () => {
    const r = textFieldStyles(t, { size: 'XLarge', readOnly: true });
    expect(r.field.backgroundColor).toBe(t.color('Color/Background/Neutral/Subtle/Default'));
    const d = textFieldStyles(t, { size: 'XLarge', disabled: true });
    expect(d.field.backgroundColor).toBe(t.color('Color/Background/Active/Neutral/Subtle'));
    expect(d.input.color).toBe(t.color('Color/Content/Disabled'));
    expect(d.label.color).toBe(t.color('Color/Content/Disabled'));
  });
  it('Search: text Body/Base, shadow Effect/Input, Rounded → Corner-Radius/Input/Rounded', () => {
    const s = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Search', searchType: 'Rounded' });
    expect(s.input.fontSize).toBe(t.text('Body/Base/Medium').fontSize);
    expect(s.field.borderRadius).toBe(t.radius('Corner-Radius/Input/Rounded'));
    expect(s.field.shadowColor).toBeDefined();
    expect(textFieldStyles(t, { size: 'Medium (Base)', variant: 'Search', searchType: 'Default' }).field.borderRadius).toBe(t.radius('Corner-Radius/Input/Medium'));
  });
  it('Message: pill Rounded, padding Spacing-Pill (phải gr-dm-8), nút gửi Button/Size/Small Accent; overlay → Input-Overlay + Accent/Subtle + shadow', () => {
    const s = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Message' });
    expect(s.field.borderRadius).toBe(t.radius('Corner-Radius/Input/Rounded'));
    expect(s.field.paddingLeft).toBe(t.size('Input/Spacing-Pill/Medium/Horizontal-Padding'));
    expect(s.field.paddingRight).toBe(t.primitive('gr-dm-8'));
    expect(s.field.gap).toBe(t.size('Input/Spacing-Pill/Medium/Inside-Field-Gap'));
    expect(s.field.height).toBe(t.size('Input/Size/Medium'));
    expect(s.field.shadowColor).toBeUndefined();
    expect(s.send?.button.width).toBe(t.size('Button/Size/Small'));
    expect(s.send?.button.backgroundColor).toBe(t.component('Button-Accent/Background/Default'));
    expect(s.send?.iconColor).toBe('Button-Accent/Content/Default');
    expect(textFieldStyles(t, { size: 'Medium (Base)' }).send).toBeUndefined();
    const o = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Message', overlay: true, focused: true });
    expect(o.field.backgroundColor).toBe(t.component('Input-Overlay/Background/Focused'));
    expect(o.field.borderColor).toBe(t.color('Color/Focus/Overlay/Subtle'));
    expect(o.field.shadowColor).toBeDefined();
    expect(o.send?.button.backgroundColor).toBe(t.color('Color/Background/Accent/Subtle/Default'));
    expect(o.send?.iconColor).toBe('Color/Content/Accent/Base');
    const oe = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Message', overlay: true, error: true });
    expect(oe.field.borderColor).toBe(t.color('Color/Border/Negative/Subtle/Default'));
    const od = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Message', overlay: true, disabled: true });
    expect(od.field.backgroundColor).toBe(t.color('Color/Background/Active/Overlay/Subtle'));
    expect(od.input.color).toBe(t.color('Color/Content/On-Dark-Overlay/Disabled'));
    expect(od.send?.button.backgroundColor).toBe(t.color('Color/Background/Subtle-Disabled'));
    expect(textFieldStyles(t, { size: 'Medium (Base)', variant: 'Message', overlay: true, readOnly: true }).field.borderColor).toBe(t.color('Color/Border/Overlay/Subtle/Default'));
  });
  it('INPUT_RESET: ngoài trình duyệt (native/vitest) là {} — không rò outlineStyle sang RN; input TextField có spread reset', () => {
    expect(INPUT_RESET).toEqual({});
    const t = createTheme({ scheme: 'light' });
    expect(textFieldStyles(t, { size: 'Medium (Base)' }).input).toMatchObject(INPUT_RESET);
  });
});
