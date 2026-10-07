import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { topNavigationStyles } from './topNavigationStyles';

const t = createTheme({ scheme: 'light' });

describe('topNavigationStyles', () => {
  it('Default/Center/Medium: padding Medium/Small, gap Navigation-Action, heading Subheading', () => {
    const s = topNavigationStyles(t, { surface: 'Default', align: 'Center', size: 'Medium', divider: true });
    expect(s.bar.paddingHorizontal).toBe(t.space('Spacing/Padding/Medium'));
    expect(s.bar.gap).toBe(t.size('Navigation-Action/Text/Spacing/Horizontal-Padding'));
    expect(s.bar.backgroundColor).toBeUndefined(); // Figma thanh không có fill (parity §7e)
    expect(s.titleBlock.alignItems).toBe('center');
    expect(s.heading.fontSize).toBe(t.text('Heading/Subheading').fontSize);
    expect(s.heading.color).toBe(t.color('Color/Content/Neutral/Strongest'));
    expect(s.subtitle.color).toBe(t.color('Color/Content/Neutral/Base'));
    expect(s.divider.backgroundColor).toBe(t.color('Color/Border/Neutral/Pale/Default'));
  });
  it('Overlay: không nền, heading Inverse; Left align; Large → Heading/3, XSmall → Body/XSmall', () => {
    const s = topNavigationStyles(t, { surface: 'Overlay', align: 'Left', size: 'Large' });
    expect(s.bar.backgroundColor).toBeUndefined();
    expect(s.heading.color).toBe(t.color('Color/Content/On-Dark-Overlay/Strongest'));
    expect(s.heading.fontSize).toBe(t.text('Heading/3').fontSize);
    expect(s.titleBlock.alignItems).toBe('flex-start');
    expect(s.divider.height).toBe(0);
    expect(topNavigationStyles(t, { surface: 'Default', align: 'Left', size: 'XSmall' }).heading.fontSize).toBe(t.text('Body/XSmall/DemiBold').fontSize);
  });
});
