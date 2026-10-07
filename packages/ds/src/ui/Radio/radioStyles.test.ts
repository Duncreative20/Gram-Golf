import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { controlRowStyles, radioStyles } from './radioStyles';

const t = createTheme({ scheme: 'light' });

describe('radioStyles', () => {
  it('unselected: Checkbox token, Rounded; pressed → Hover; disabled border Disabled', () => {
    const s = radioStyles(t, { select: false });
    expect(s.box.width).toBe(t.size('Checkbox/Size/Medium'));
    expect(s.box.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(s.box.borderColor).toBe(t.component('Checkbox/Border/Default'));
    expect(s.dot).toBeNull();
    expect(radioStyles(t, { select: false, pressed: true }).box.borderColor).toBe(t.component('Checkbox/Border/Hover'));
    expect(radioStyles(t, { select: false, disabled: true }).box.borderColor).toBe(t.color('Color/Border/Disabled'));
  });
  it('selected: bg Selected + dot Icon-Check; disabled → Solid-Disabled', () => {
    const s = radioStyles(t, { select: true });
    expect(s.box.backgroundColor).toBe(t.component('Checkbox/Background/Selected/Default'));
    expect(s.dot?.backgroundColor).toBe(t.component('Checkbox/Icon-Check/Default'));
    expect(s.dot?.width).toBe(t.size('Element-Size/Popular/2XSmall'));
    expect(radioStyles(t, { select: true, disabled: true }).box.backgroundColor).toBe(t.color('Color/Background/Solid-Disabled'));
  });
});

describe('controlRowStyles', () => {
  it('gap theo kind; Right → row-reverse; disabled label Disabled', () => {
    expect(controlRowStyles(t, { kind: 'Radio', side: 'Left' }).row.gap).toBe(t.space('Spacing/Gap/Small'));
    expect(controlRowStyles(t, { kind: 'Checkbox', side: 'Left' }).row.gap).toBe(t.space('Spacing/Gap/XSmall'));
    expect(controlRowStyles(t, { kind: 'Toggle', side: 'Right' }).row.flexDirection).toBe('row-reverse');
    expect(controlRowStyles(t, { kind: 'Toggle', side: 'Right' }).row.gap).toBe(t.space('Spacing/Gap/Medium'));
    const s = controlRowStyles(t, { kind: 'Checkbox', side: 'Left', disabled: true });
    expect(s.label.color).toBe(t.color('Color/Content/Disabled'));
    expect(s.caption.fontSize).toBe(t.text('Caption/Regular').fontSize);
    expect(s.label.fontSize).toBe(t.text('Body/Base/Regular').fontSize);
  });
});
