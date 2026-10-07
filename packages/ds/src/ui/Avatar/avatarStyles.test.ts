import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { avatarStyles } from './avatarStyles';

const t = createTheme({ scheme: 'light' });

describe('avatarStyles', () => {
  it('Circle Medium Photo: Image-Size, Rounded, border Inverse, surface bg', () => {
    const s = avatarStyles(t, { size: 'Medium', shape: 'Circle', theme: 'Photo', background: 'Subtle' });
    expect(s.container.width).toBe(t.size('Image-Size/Medium'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(s.container.borderColor).toBe(t.color('Color/Border/Inverse'));
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Surface/Default'));
    expect(s.text.fontSize).toBe(t.text('Heading/Subheading').fontSize);
    expect(s.status.width).toBe(t.size('Element-Size/Popular/2XSmall'));
  });
  it('Square radius theo size; 3XLarge text Display/4, status 16', () => {
    expect(avatarStyles(t, { size: '3XLarge', shape: 'Square', theme: 'Neutral', background: 'Solid' }).container.borderRadius).toBe(t.radius('Corner-Radius/3XLarge'));
    expect(avatarStyles(t, { size: 'Small', shape: 'Square', theme: 'Neutral', background: 'Solid' }).container.borderRadius).toBe(t.radius('Corner-Radius/Small'));
    const xl = avatarStyles(t, { size: '3XLarge', shape: 'Circle', theme: 'Accent', background: 'Solid' });
    expect(xl.text.fontSize).toBe(t.text('Display/4').fontSize);
    expect(xl.status.width).toBe(t.size('Element-Size/Popular/Small'));
  });
  it('Theme Solid/Subtle: Accent, Neutral, Support(Orange), Yellow content On-Brights', () => {
    expect(avatarStyles(t, { size: 'Medium', shape: 'Circle', theme: 'Accent', background: 'Solid' }).container.backgroundColor).toBe(t.color('Color/Background/Accent/Solid/Default'));
    expect(avatarStyles(t, { size: 'Medium', shape: 'Circle', theme: 'Accent', background: 'Subtle' }).text.color).toBe(t.color('Color/Content/Accent/Strongest'));
    expect(avatarStyles(t, { size: 'Medium', shape: 'Circle', theme: 'Orange', background: 'Solid' }).container.backgroundColor).toBe(t.color('Color/Background/Support/Orange/Solid'));
    expect(avatarStyles(t, { size: 'Medium', shape: 'Circle', theme: 'Orange', background: 'Subtle' }).container.borderColor).toBe(t.color('Color/Border/Support/Orange/Subtle'));
    expect(avatarStyles(t, { size: 'Medium', shape: 'Circle', theme: 'Yellow', background: 'Solid' }).text.color).toBe(t.color('Color/Content/On-Brights'));
    expect(avatarStyles(t, { size: 'Medium', shape: 'Circle', theme: 'Neutral', background: 'Solid' }).text.color).toBe(t.color('Color/Content/Inverse/Strongest'));
  });
});
