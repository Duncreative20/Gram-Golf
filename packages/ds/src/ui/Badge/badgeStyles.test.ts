import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { badgeStyles } from './badgeStyles';

const t = createTheme({ scheme: 'light' });

describe('badgeStyles', () => {
  it('Neutral Solid Medium: size/padding/label/color token', () => {
    const s = badgeStyles(t, { size: 'Medium', theme: 'Neutral', background: 'Solid' });
    expect(s.container.height).toBe(t.size('Badge/Size/Medium'));
    expect(s.container.paddingHorizontal).toBe(t.size('Badge/Spacing/Medium/Horizontal-Padding'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Neutral/Solid/Default'));
    expect(s.container.borderWidth).toBeUndefined();
    expect(s.label.color).toBe(t.color('Color/Content/Inverse/Strongest'));
    expect(s.label.fontFamily).toBe('MiSansLatin-Demibold');
    expect(s.iconSize).toBe(t.size('Element-Size/Popular/Small'));
  });
  it('Accent Subtle có border; XSmall label Caption + icon XSmall', () => {
    const s = badgeStyles(t, { size: 'XSmall', theme: 'Accent', background: 'Subtle' });
    expect(s.container.borderColor).toBe(t.color('Color/Border/Accent/Subtle/Default'));
    expect(s.label.fontSize).toBe(t.text('Caption/DemiBold').fontSize);
    expect(s.iconSize).toBe(t.size('Element-Size/Popular/XSmall'));
  });
  it('Support theme (Orange) map sang Color/*/Support/Orange; Yellow → Warning; Red → Negative', () => {
    expect(badgeStyles(t, { size: 'Small', theme: 'Orange', background: 'Solid' }).container.backgroundColor).toBe(t.color('Color/Background/Support/Orange/Solid'));
    expect(badgeStyles(t, { size: 'Small', theme: 'Orange', background: 'Subtle' }).label.color).toBe(t.color('Color/Content/Support/Orange/Strongest'));
    expect(badgeStyles(t, { size: 'Small', theme: 'Yellow', background: 'Solid' }).container.backgroundColor).toBe(t.color('Color/Background/Warning/Solid/Default'));
    expect(badgeStyles(t, { size: 'Small', theme: 'Red', background: 'Subtle' }).iconColor).toBe('Color/Content/Negative/Light');
  });
  it('dark scheme đổi màu', () => {
    const d = createTheme({ scheme: 'dark' });
    expect(badgeStyles(d, { size: 'Small', theme: 'Neutral', background: 'Subtle' }).container.backgroundColor).toBe(d.color('Color/Background/Neutral/Subtle/Default'));
  });
});
