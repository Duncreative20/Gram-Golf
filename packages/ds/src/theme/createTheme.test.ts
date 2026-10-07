import { describe, expect, it } from 'vitest';
import { createTheme } from './createTheme';

describe('createTheme dimensions', () => {
  const t = createTheme({ scheme: 'light' });
  it('resolves spacing alias to number', () => {
    expect(t.space('Spacing/Gap/Medium')).toBe(16);
    expect(t.space('Spacing/Padding/Small')).toBe(12);
  });
  it('resolves radius, size, layout (mobile)', () => {
    expect(t.radius('Corner-Radius/Base')).toBe(12);
    expect(t.size('Button/Size/Large')).toBe(56);
    expect(t.layout('Viewport-Width')).toBe(390);
    expect(t.layout('Margin-Small')).toBe(16);
  });
});

describe('createTheme colors', () => {
  it('light semantic resolves through base → global to Figma hex', () => {
    expect(createTheme({ scheme: 'light' }).color('Color/Content/Neutral/Strongest')).toBe('#1a1a1a');
  });
  it('dark differs from light', () => {
    const k = 'Color/Content/Neutral/Strongest';
    expect(createTheme({ scheme: 'dark' }).color(k)).not.toBe(createTheme({ scheme: 'light' }).color(k));
  });
  it('component color follows emphasis and scheme', () => {
    const k = 'Button-Primary/Background/Default';
    const neutral = createTheme({ scheme: 'light' }).component(k);
    expect(neutral).toBe('#1a1a1a'); // Neutral.Solid.Default → Neutral.12
    expect(createTheme({ scheme: 'light', emphasis: 'brand' }).component(k)).toBe('#14be96'); // Accent.Solid.Default → Brand.9 (GramGolf teal, tokens/brand/)
    expect(createTheme({ scheme: 'dark' }).component(k)).not.toBe(neutral);
  });
});

describe('createTheme typography & effects', () => {
  const t = createTheme({ scheme: 'light' });
  it('DARK_FIXUP: chữ nút overlay dark = On-Dark-Overlay/Strongest (Figma alias #1a1a1a trên nền trắng mờ — F49)', () => {
    const d = createTheme({ scheme: 'dark' });
    expect(d.component('Button-Primary-Overlay/Content/Default')).toBe(d.color('Color/Content/On-Dark-Overlay/Strongest'));
    expect(d.component('Button-Tertiary-Overlay/Content/Default')).toBe(d.color('Color/Content/On-Dark-Overlay/Strongest'));
    expect(createTheme({ scheme: 'light' }).component('Button-Primary-Overlay/Content/Default')).not.toBe('#1a1a1a');
  });
  it('text style → RN props with MiSans file name', () => {
    expect(t.text('Body/Base/DemiBold')).toEqual({ fontFamily: 'MiSansLatin-Demibold', fontSize: 14, lineHeight: 18, letterSpacing: -0.32 });
  });
  it('non-MiSans text style falls back to system font', () => {
    expect(t.text('Body/Code/Regular').fontFamily).toBeUndefined();
  });
  it('shadow → RN style', () => {
    const s = t.shadow('Shadow/Bottom/Level-1');
    expect(s.shadowColor).toBe('#000000');
    expect(s.shadowRadius).toBe(4);
    expect(s.shadowOpacity).toBeCloseTo(0.08, 2);
    expect(s.elevation).toBeGreaterThan(0);
  });
});
