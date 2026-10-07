import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { tabBarStyles, tabItemStyles } from './tabStyles';

const t = createTheme({ scheme: 'light' });

describe('tabStyles', () => {
  it('bar Indicator: border dưới Pale, gap Large; Subtle: gap 3XSmall, không border', () => {
    const i = tabBarStyles(t, { style: 'Indicator' });
    expect(i.borderBottomColor).toBe(t.color('Color/Border/Neutral/Pale/Default'));
    expect(i.gap).toBe(t.space('Spacing/Gap/Large'));
    const s = tabBarStyles(t, { style: 'Subtle' });
    expect(s.borderBottomWidth).toBeUndefined();
    expect(s.gap).toBe(t.space('Spacing/Gap/3XSmall'));
  });
  it('item Indicator selected: content Selected + indicator 2px Tab/Border/Selected', () => {
    const s = tabItemStyles(t, { style: 'Indicator', size: 'Medium', icon: 'Leading', selected: true });
    expect(s.outer.height).toBe(t.size('Tab-Item/Size/Medium/Height'));
    expect(s.inner.minWidth).toBe(t.size('Tab-Item/Size/Medium/Min-Width'));
    expect(s.label.color).toBe(t.component('Tab/Content/Selected'));
    expect(s.indicator?.height).toBe(t.weight('Emphasis/Border-Weight/Active'));
    expect(s.indicator?.backgroundColor).toBe(t.component('Tab/Border/Selected'));
    expect(s.iconSize).toBe(t.size('Element-Size/Popular/Base'));
  });
  it('item Indicator unselected/disabled/pressed; Icon=None → không icon; Top → column, vẫn Height (Figma)', () => {
    expect(tabItemStyles(t, { style: 'Indicator', size: 'Medium', icon: 'None', selected: false }).indicator?.backgroundColor).toBe('transparent');
    expect(tabItemStyles(t, { style: 'Indicator', size: 'Medium', icon: 'Leading', selected: false }).badgeTop).toBeNull();
    expect(tabItemStyles(t, { style: 'Top', size: 'Medium', icon: 'Top', selected: false }).badgeTop).toMatchObject({ position: 'absolute', top: -t.space('Spacing/Gap/XSmall'), right: -t.space('Spacing/Gap/Small') });
    expect(tabItemStyles(t, { style: 'Indicator', size: 'Medium', icon: 'None', selected: false }).iconSize).toBe(0);
    expect(tabItemStyles(t, { style: 'Indicator', size: 'Medium', icon: 'Leading', selected: false, disabled: true }).label.color).toBe(t.color('Color/Content/Disabled'));
    expect(tabItemStyles(t, { style: 'Indicator', size: 'Medium', icon: 'Leading', selected: false, pressed: true }).inner.backgroundColor).toBe(t.component('Tab/Background/Hover'));
    const top = tabItemStyles(t, { style: 'Top', size: 'Medium', icon: 'Top', selected: false });
    expect(top.inner.flexDirection).toBe('column');
    expect(top.outer.height).toBe(t.size('Tab-Item/Size/Medium/Height'));
  });
  it('item Subtle selected: nền Tab/Background/Selected, không indicator', () => {
    const s = tabItemStyles(t, { style: 'Subtle', size: 'Medium', icon: 'Leading', selected: true });
    expect(s.inner.backgroundColor).toBe(t.component('Tab/Background/Selected'));
    expect(s.indicator).toBeNull();
    expect(s.inner.paddingHorizontal).toBe(t.space('Spacing/Padding/Small'));
  });
});
