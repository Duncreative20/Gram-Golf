import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { checkboxStyles } from './checkboxStyles';

const t = createTheme({ scheme: 'light' });

describe('checkboxStyles', () => {
  it('unselected: 20px, border Default, radius XSmall, không icon', () => {
    const s = checkboxStyles(t, { type: 'Default', select: false, shape: 'Default' });
    expect(s.box.width).toBe(t.size('Checkbox/Size/Medium'));
    expect(s.box.borderRadius).toBe(t.radius('Corner-Radius/XSmall'));
    expect(s.box.borderColor).toBe(t.component('Checkbox/Border/Default'));
    expect(s.box.backgroundColor).toBe(t.component('Checkbox/Background/Unselected/Default'));
    expect(s.icon).toBeNull();
  });
  it('selected: nền Selected, icon check; Indeterminate → minus; Rounded → Rounded', () => {
    const s = checkboxStyles(t, { type: 'Default', select: true, shape: 'Rounded' });
    expect(s.box.backgroundColor).toBe(t.component('Checkbox/Background/Selected/Default'));
    expect(s.box.borderWidth).toBeUndefined();
    expect(s.box.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(s.icon).toBe('check-line');
    expect(s.iconColor).toBe('Checkbox/Icon-Check/Default');
    expect(checkboxStyles(t, { type: 'Indeterminate', select: true, shape: 'Default' }).icon).toBe('minus-line');
  });
  it('pressed → Hover token; disabled → Disabled token', () => {
    expect(checkboxStyles(t, { type: 'Default', select: false, shape: 'Default', pressed: true }).box.borderColor).toBe(t.component('Checkbox/Border/Hover'));
    expect(checkboxStyles(t, { type: 'Default', select: true, shape: 'Default', pressed: true }).box.backgroundColor).toBe(t.component('Checkbox/Background/Selected/Hover'));
    expect(checkboxStyles(t, { type: 'Default', select: false, shape: 'Default', disabled: true }).box.backgroundColor).toBe(t.color('Color/Background/Solid-Disabled'));
    expect(checkboxStyles(t, { type: 'Default', select: true, shape: 'Default', disabled: true }).box.backgroundColor).toBe(t.color('Color/Background/Subtle-Disabled'));
  });
});
