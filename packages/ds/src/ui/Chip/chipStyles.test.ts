import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { chipStyles } from './chipStyles';

const t = createTheme({ scheme: 'light' });

describe('chipStyles', () => {
  it('Normal Secondary Small unselected: Chip/Size, padding, Rounded, border Default, chữ Neutral/Base', () => {
    const s = chipStyles(t, { variant: 'Normal', size: 'Small', level: 'Secondary', select: false });
    expect(s.container.height).toBe(t.size('Chip/Size/Small'));
    expect(s.container.paddingHorizontal).toBe(t.size('Chip/Spacing/Small/Horizontal-Padding'));
    expect(s.container.backgroundColor).toBe(t.component('Chip-Secondary/Background/Unselected/Default'));
    expect(s.container.borderColor).toBe(t.component('Chip-Secondary/Border/Default'));
    expect(s.label.color).toBe(t.color('Color/Content/Neutral/Base'));
    expect(s.label.fontSize).toBe(t.text('Body/XSmall/DemiBold').fontSize);
    expect(s.photoSize).toBe('XSmall');
  });
  it('selected Secondary → Selected bg/border/content; Primary selected không border; pressed → Hover', () => {
    const s = chipStyles(t, { variant: 'Normal', size: 'Medium', level: 'Secondary', select: true });
    expect(s.container.backgroundColor).toBe(t.component('Chip-Secondary/Background/Selected/Default'));
    expect(s.container.borderColor).toBe(t.component('Chip-Secondary/Border/Selected'));
    expect(s.label.color).toBe(t.component('Chip-Secondary/Content/Selected'));
    const p = chipStyles(t, { variant: 'Normal', size: 'Medium', level: 'Primary', select: true });
    expect(p.container.borderWidth).toBeUndefined();
    expect(p.container.backgroundColor).toBe(t.component('Chip-Primary/Background/Selected/Default'));
    expect(chipStyles(t, { variant: 'Normal', size: 'Medium', level: 'Primary', select: false, pressed: true }).container.backgroundColor).toBe(t.component('Chip-Primary/Background/Unselected/Hover'));
  });
  it('Advanced label Body/Base/Medium (Medium) + trailing Base; Number-Only vuông, Body/Base/DemiBold', () => {
    const a = chipStyles(t, { variant: 'Advanced', size: 'Medium', level: 'Secondary', select: false });
    expect(a.label.fontSize).toBe(t.text('Body/Base/Medium').fontSize);
    expect(a.label.color).toBe(t.component('Chip-Secondary/Content/Default'));
    expect(a.trailingSize).toBe(t.size('Element-Size/Popular/Base'));
    expect(a.iconColor).toBe('Color/Content/Neutral/Light');
    const n = chipStyles(t, { variant: 'Number-Only', size: 'Small', level: 'Primary', select: false });
    expect(n.container.width).toBe(n.container.height);
    expect(n.container.paddingHorizontal).toBeUndefined();
    expect(n.label.fontSize).toBe(t.text('Body/Base/DemiBold').fontSize);
  });
});
