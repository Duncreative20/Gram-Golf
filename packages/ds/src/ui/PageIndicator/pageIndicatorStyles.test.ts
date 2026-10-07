import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { pageIndicatorStyles } from './pageIndicatorStyles';

const t = createTheme({ scheme: 'light' });

describe('pageIndicatorStyles', () => {
  it('Medium Neutral: dot 8px, gap 2XSmall, active Solid / inactive Subtle', () => {
    const s = pageIndicatorStyles(t, { state: 'Neutral', size: 'Medium' });
    expect(s.dot(true).width).toBe(t.size('Element-Size/Popular/2XSmall'));
    expect(s.dot(true).backgroundColor).toBe(t.color('Color/Background/Active/Neutral/Solid'));
    expect(s.dot(false).backgroundColor).toBe(t.color('Color/Background/Active/Neutral/Subtle'));
    expect(s.container.gap).toBe(t.space('Spacing/Gap/2XSmall'));
    expect(s.container.paddingVertical).toBe(t.space('Spacing/Padding/Small'));
  });
  it('Small: dot 6 (gr-dm-6), padding V XSmall; Accent/Overlay màu', () => {
    const s = pageIndicatorStyles(t, { state: 'Accent', size: 'Small' });
    expect(s.dot(true).width).toBe(6);
    expect(s.container.paddingVertical).toBe(t.space('Spacing/Padding/XSmall'));
    expect(s.dot(true).backgroundColor).toBe(t.color('Color/Background/Active/Accent/Solid'));
    expect(pageIndicatorStyles(t, { state: 'Overlay', size: 'Medium' }).dot(false).backgroundColor).toBe(t.color('Color/Background/Inverse-Disabled'));
  });
});
