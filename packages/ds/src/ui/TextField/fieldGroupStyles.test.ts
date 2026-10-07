import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { fieldGroupStyles } from './fieldGroupStyles';

const t = createTheme({ scheme: 'light' });

describe('fieldGroupStyles', () => {
  it('Medium: khung Input bg/border radius Input/Medium, dòng cao Input/Size/Medium + padding Regt, chữ Body/XSmall/Medium, nhãn Body/Base/DemiBold', () => {
    const s = fieldGroupStyles(t, { size: 'Medium (Base)' });
    expect(s.group.borderRadius).toBe(t.radius('Corner-Radius/Input/Medium'));
    expect(s.group.backgroundColor).toBe(t.component('Input/Background/Default'));
    expect(s.group.borderColor).toBe(t.component('Input/Border/Default'));
    expect(s.row.height).toBe(t.size('Input/Size/Medium'));
    expect(s.row.paddingHorizontal).toBe(t.size('Input/Spacing-Regt/Medium/Horizontal-Padding'));
    expect(s.row.gap).toBe(t.size('Input/Spacing-Regt/Medium/Inside-Field-Gap'));
    expect(s.rowDivider.borderTopColor).toBe(t.component('Input/Border/Default'));
    expect(s.input.fontSize).toBe(t.text('Body/XSmall/Medium').fontSize);
    expect(s.label.fontSize).toBe(t.text('Body/Base/DemiBold').fontSize);
    expect(s.label.paddingHorizontal).toBe(t.space('Spacing/Padding/XSmall'));
    expect(s.wrapper.gap).toBe(t.size('Input/Spacing-Regt/Medium/Outside-Field-Gap'));
  });
  it('XLarge: radius Input/XLarge, chữ Body/Base/Medium, gap XLarge', () => {
    const s = fieldGroupStyles(t, { size: 'XLarge' });
    expect(s.group.borderRadius).toBe(t.radius('Corner-Radius/Input/XLarge'));
    expect(s.input.fontSize).toBe(t.text('Body/Base/Medium').fontSize);
    expect(s.wrapper.gap).toBe(t.size('Input/Spacing-Regt/XLarge/Outside-Field-Gap'));
  });
});
