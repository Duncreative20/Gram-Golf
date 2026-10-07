import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { paint } from '../../theme/paint';
import { buttonStyles } from './buttonStyles';

const t = createTheme({ scheme: 'light' });

describe('buttonStyles Main', () => {
  it('Primary Large: size/spacing/radius/label/content token', () => {
    const s = buttonStyles(t, { kind: 'Main', level: 'Primary', size: 'Large' });
    expect(s.container.height).toBe(t.size('Button/Size/Large'));
    expect(s.container.paddingHorizontal).toBe(t.size('Button/Spacing/Large/Horizontal-Padding'));
    expect(s.container.gap).toBe(t.size('Button/Spacing/Large/Gap'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/Action/Large'));
    expect(s.container.backgroundColor).toBe(t.component('Button-Primary/Background/Default'));
    expect(s.container.shadowColor).toBeDefined();
    expect(s.label.color).toBe(t.component('Button-Primary/Content/Default'));
    expect(s.label.fontFamily).toBe('MiSansLatin-Demibold');
    expect(s.iconSize).toBe(t.size('Element-Size/Popular/Base'));
  });
  it('Medium (Base) map sang key Medium; XLarge icon Large; XSmall icon Small', () => {
    expect(buttonStyles(t, { kind: 'Main', level: 'Accent', size: 'Medium (Base)' }).container.height).toBe(t.size('Button/Size/Medium'));
    expect(buttonStyles(t, { kind: 'Main', level: 'Accent', size: 'XLarge' }).iconSize).toBe(t.size('Element-Size/Popular/Large'));
    expect(buttonStyles(t, { kind: 'Main', level: 'Accent', size: 'XSmall' }).iconSize).toBe(t.size('Element-Size/Popular/Small'));
  });
  it('Pressed đổi nền + content; Disabled dùng token Disabled, không opacity, không shadow', () => {
    const p = buttonStyles(t, { kind: 'Main', level: 'Accent', size: 'Large', pressed: true });
    expect(p.container.backgroundColor).toBe(t.component('Button-Accent/Background/Pressed'));
    expect(p.label.color).toBe(t.component('Button-Accent/Content/Pressed'));
    const d = buttonStyles(t, { kind: 'Main', level: 'Primary', size: 'Large', disabled: true });
    expect(d.container.backgroundColor).toBe(t.color('Color/Background/Solid-Disabled'));
    expect(d.label.color).toBe(t.color('Color/Content/Disabled'));
    expect(d.container.opacity).toBeUndefined();
    expect(d.container.shadowColor).toBeUndefined();
  });
  it('Tertiary có border, Disabled đổi border; Secondary không shadow; Danger Subtle pressed content Base', () => {
    const s = buttonStyles(t, { kind: 'Main', level: 'Tertiary', size: 'Small' });
    expect(s.container.borderWidth).toBe(1);
    expect(s.container.borderColor).toBe(t.component('Button-Tertiary/Border/Default'));
    expect(buttonStyles(t, { kind: 'Main', level: 'Tertiary', size: 'Small', disabled: true }).container.borderColor).toBe(t.color('Color/Border/Disabled'));
    expect(buttonStyles(t, { kind: 'Main', level: 'Secondary', size: 'Small' }).container.shadowColor).toBeUndefined();
    expect(buttonStyles(t, { kind: 'Main', level: 'Danger Subtle', size: 'Small', pressed: true }).label.color).toBe(t.color('Color/Content/Negative/Base'));
  });
});

describe('buttonStyles Flat / Overlay / Icon', () => {
  it('Flat: nền Flat token, không shadow, không border', () => {
    const s = buttonStyles(t, { kind: 'Flat', level: 'Accent', size: 'Large' });
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Accent/Flat/Default'));
    expect(s.container.shadowColor).toBeUndefined();
    expect(s.container.borderWidth).toBeUndefined();
  });
  it('Main-Overlay Primary: token Overlay + border; disabled Inverse-Disabled', () => {
    const s = buttonStyles(t, { kind: 'Main-Overlay', level: 'Primary', size: 'Large' });
    expect(s.container.backgroundColor).toBe(t.component('Button-Primary-Overlay/Background/Default'));
    expect(s.container.borderColor).toBe(t.component('Button-Primary-Overlay/Border/Default'));
    expect(buttonStyles(t, { kind: 'Main-Overlay', level: 'Accent', size: 'Large', disabled: true }).container.backgroundColor).toBe(t.color('Color/Background/Inverse-Disabled'));
  });
  it('Icon-Main: vuông, Rounded, không padding; 2XSmall = 28, icon XSmall', () => {
    const s = buttonStyles(t, { kind: 'Icon-Main', level: 'Danger', size: 'Large' });
    expect(s.container.width).toBe(s.container.height);
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(s.container.paddingHorizontal).toBeUndefined();
    expect(paint(t, s.iconColor)).toBe(t.color('Color/Content/On-Colors'));
    const xs = buttonStyles(t, { kind: 'Icon-Main', level: 'Primary', size: '2XSmall' });
    expect(xs.container.height).toBe(28);
    expect(xs.iconSize).toBe(t.size('Element-Size/Popular/XSmall'));
  });
  it('Icon-Flat Overlay: nền Inverse Flat; Icon-Main-Overlay Liquid Glass = Primary-Overlay', () => {
    expect(buttonStyles(t, { kind: 'Icon-Flat', level: 'Overlay', size: 'Medium' }).container.backgroundColor).toBe(t.color('Color/Background/Inverse/Flat/Default'));
    expect(buttonStyles(t, { kind: 'Icon-Main-Overlay', level: 'Liquid Glass', size: 'Medium' }).container.backgroundColor).toBe(t.component('Button-Primary-Overlay/Background/Default'));
  });
  it('Level không thuộc set → throw', () => {
    expect(() => buttonStyles(t, { kind: 'Flat', level: 'Danger', size: 'Large' })).toThrow(/Level/);
  });
  it('dark scheme đổi màu', () => {
    const d = createTheme({ scheme: 'dark' });
    expect(buttonStyles(d, { kind: 'Main', level: 'Primary', size: 'Large' }).container.backgroundColor).toBe(d.component('Button-Primary/Background/Default'));
  });
});
