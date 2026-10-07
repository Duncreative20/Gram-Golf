import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { bottomNavItemStyles, bottomNavigationStyles } from './bottomNavigationStyles';

const t = createTheme({ scheme: 'light' });

describe('bottomNavigationStyles', () => {
  it('bar Floating: Margin-Small, items Glass bg, Rounded, gap Small', () => {
    const s = bottomNavigationStyles(t, { type: 'Floating' });
    expect(s.bar.paddingHorizontal).toBe(t.layout('Margin-Small'));
    expect(s.items.backgroundColor).toBe(t.color('Color/Background/Surface/Glass'));
    expect(s.items.gap).toBe(t.space('Spacing/Gap/Small'));
    expect(bottomNavigationStyles(t, { type: 'Floating-Glass' }).items.backgroundColor).toBe(t.color('Color/Background/Surface/Glass'));
  });
  it('item Neutral: off content Light; on bg Active/Neutral/Subtle + Strongest; icon size token', () => {
    const off = bottomNavItemStyles(t, { theme: 'Neutral', selected: false });
    expect(off.item.backgroundColor).toBeUndefined();
    expect(off.label.color).toBe(t.color('Color/Content/Neutral/Light'));
    expect(off.iconSize).toBe(t.size('Navigation-Mobile/Bottom/Icon-Size'));
    const on = bottomNavItemStyles(t, { theme: 'Neutral', selected: true });
    expect(on.item.backgroundColor).toBe(t.color('Color/Background/Active/Neutral/Subtle'));
    expect(on.label.color).toBe(t.color('Color/Content/Neutral/Strongest'));
    expect(on.noti.backgroundColor).toBe(t.color('Color/Background/Negative/Solid/Default'));
  });
  it('Accent-Solid on: bg Active/Accent/Solid, icon On-Accent, shadow; Neutral-Solid off label Placeholder', () => {
    const s = bottomNavItemStyles(t, { theme: 'Accent-Solid', selected: true });
    expect(s.item.backgroundColor).toBe(t.color('Color/Background/Active/Accent/Solid'));
    expect(s.iconColor).toBe('Color/Content/On-Accent/Default');
    expect(s.item.shadowColor).toBeDefined();
    expect(bottomNavItemStyles(t, { theme: 'Neutral-Solid', selected: false }).label.color).toBe(t.color('Color/Content/Placeholder'));
  });
  it('5 mục không vừa khung: mục flexShrink + minWidth 0, hàng maxWidth 100 %, nhãn maxWidth 100 % (ellipsis) — không tràn 2 mép', () => {
    const t = createTheme({ scheme: 'light' });
    const bar = bottomNavigationStyles(t, { type: 'Floating' });
    const it = bottomNavItemStyles(t, { theme: 'Neutral', selected: false });
    expect(bar.items.maxWidth).toBe('100%');
    expect(it.item.flexShrink).toBe(1); expect(it.item.minWidth).toBe(0);
    expect(it.inner.minWidth).toBe(0); expect(it.label.maxWidth).toBe('100%');
  });
  it('dense (≥5 mục, NỢ FIGMA F55): pill trải hết bề ngang, mục chia đều flex 1, gap + padding ngang trong thu nhỏ để nhãn không bị cắt ở 390', () => {
    const bar = bottomNavigationStyles(t, { type: 'Floating', dense: true });
    expect(bar.items.alignSelf).toBe('stretch');
    expect(bar.items.gap).toBe(t.space('Spacing/Gap/3XSmall'));
    const it5 = bottomNavItemStyles(t, { theme: 'Accent', selected: false, dense: true });
    expect(it5.item.flex).toBe(1);
    expect(it5.inner.paddingHorizontal).toBe(t.space('Spacing/Padding/3XSmall'));
    // mặc định (≤4 mục) giữ đúng Figma
    expect(bottomNavigationStyles(t, { type: 'Floating' }).items.alignSelf).toBeUndefined();
    expect(bottomNavItemStyles(t, { theme: 'Accent', selected: false }).item.flex).toBeUndefined();
    expect(bottomNavItemStyles(t, { theme: 'Accent', selected: false }).inner.paddingHorizontal).toBe(t.space('Spacing/Padding/Small'));
  });
});
