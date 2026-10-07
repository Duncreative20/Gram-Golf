import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { dayCellStyles, dayDotStyles, monthHeaderStyles, weekLabelStyles, wheelItemStyles, wheelStyles } from './datePickerStyles';

const t = createTheme({ scheme: 'light' });

describe('datePickerStyles', () => {
  it('Day Large Default: 48 tròn, nền Unselected/Default, chữ Body/Base/DemiBold Content/Default', () => {
    const s = dayCellStyles(t, { size: 'Large' });
    expect(s.inner.width).toBe(t.size('Button/Size/Medium'));
    expect(s.inner.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(s.inner.backgroundColor).toBe(t.component('Date-Picker-Item/Background/Unselected/Default'));
    expect(s.text.fontSize).toBe(t.text('Body/Base/DemiBold').fontSize);
    expect(s.text.color).toBe(t.component('Date-Picker-Item/Content/Default'));
    expect(s.band).toBeUndefined();
    expect(dayCellStyles(t, { size: 'Small' }).inner.height).toBe(t.size('Button/Size/Small'));
  });
  it('Today viền Border/Today; Selected nền Selected + chữ Selected; pressed → Hover', () => {
    expect(dayCellStyles(t, { size: 'Large', today: true }).inner.borderColor).toBe(t.component('Date-Picker-Item/Border/Today'));
    const sel = dayCellStyles(t, { size: 'Large', selected: true });
    expect(sel.inner.backgroundColor).toBe(t.component('Date-Picker-Item/Background/Selected/Default'));
    expect(sel.text.color).toBe(t.component('Date-Picker-Item/Content/Selected'));
    expect(dayCellStyles(t, { size: 'Large', selected: true, pressed: true }).inner.backgroundColor).toBe(t.component('Date-Picker-Item/Background/Selected/Hover'));
    expect(dayCellStyles(t, { size: 'Large', pressed: true }).inner.backgroundColor).toBe(t.component('Date-Picker-Item/Background/Unselected/Hover'));
  });
  it('Range: Start band nửa phải, End nửa trái, Middle band đủ + nền Unselected; Middle-Hover nền In-Range/Hover', () => {
    const st = dayCellStyles(t, { size: 'Large', selected: true, rangeEdge: 'start' });
    expect(st.band).toMatchObject({ left: '50%', right: 0, backgroundColor: t.component('Date-Picker-Item/Background/Selected-In-Range/Default') });
    expect(dayCellStyles(t, { size: 'Large', selected: true, rangeEdge: 'end' }).band).toMatchObject({ left: 0, right: '50%' });
    const mid = dayCellStyles(t, { size: 'Large', inRange: true });
    expect(mid.band).toMatchObject({ left: 0, right: 0 });
    expect(mid.inner.backgroundColor).toBe(t.component('Date-Picker-Item/Background/Unselected/Default'));
    expect(dayCellStyles(t, { size: 'Large', inRange: true, pressed: true }).inner.backgroundColor).toBe(t.component('Date-Picker-Item/Background/Selected-In-Range/Hover'));
  });
  it('Disabled / Outside chữ; Dot Accent | Inverse', () => {
    expect(dayCellStyles(t, { size: 'Large', disabled: true }).text.color).toBe(t.component('Date-Picker-Item/Content/Disabled'));
    expect(dayCellStyles(t, { size: 'Large', outside: true }).text.color).toBe(t.component('Date-Picker-Item/Content/Outside'));
    expect(dayDotStyles(t, {})).toMatchObject({ width: t.size('Element-Size/Popular/2XSmall'), backgroundColor: t.color('Color/Background/Accent/Solid/Default') });
    expect(dayDotStyles(t, { inverse: true }).backgroundColor).toBe(t.color('Color/Background/Inverse/Solid/Default'));
  });
  it('Week-Labels: nền Flat, chữ Neutral/Light, Small = Body/XSmall/DemiBold, ô cao bằng Day', () => {
    const s = weekLabelStyles(t, { size: 'Small' });
    expect(s.cell.height).toBe(t.size('Button/Size/Small'));
    expect(weekLabelStyles(t, { size: 'Large' }).cell.height).toBe(t.size('Button/Size/Medium'));
    expect(s.cell.backgroundColor).toBe(t.color('Color/Background/Neutral/Flat/Default'));
    expect(s.text.color).toBe(t.color('Color/Content/Neutral/Light'));
    expect(s.text.fontSize).toBe(t.text('Body/XSmall/DemiBold').fontSize);
  });
  it('Month-header gap theo Align; Wheel: nền Surface/Alt, thanh chọn Accent/Subtle, item Heading/4 Accent/Strongest | Disabled', () => {
    expect(monthHeaderStyles(t, { align: 'Start' }).row.gap).toBe(t.space('Spacing/Padding/2XSmall'));
    expect(monthHeaderStyles(t, { align: 'Center' }).row).toMatchObject({ gap: t.space('Spacing/Gap/2XSmall'), justifyContent: 'space-between' });
    expect(monthHeaderStyles(t, { align: 'Start', size: 'Large' }).titleSize).toBe('Small');
    expect(monthHeaderStyles(t, { align: 'Start', size: 'Small' }).titleSize).toBe('XSmall');
    const w = wheelStyles(t);
    expect(w.container.backgroundColor).toBe(t.color('Color/Background/Surface/Alt'));
    expect(w.container.paddingHorizontal).toBe(t.space('Spacing/Padding/4XLarge'));
    expect(w.indicator.backgroundColor).toBe(t.color('Color/Background/Active/Accent/Subtle'));
    expect(w.indicator.top).toBe(w.itemHeight * 2);
    expect(wheelItemStyles(t, { active: true }).text.color).toBe(t.color('Color/Content/Accent/Strongest'));
    expect(wheelItemStyles(t, {}).text.color).toBe(t.color('Color/Content/Disabled'));
    expect(wheelItemStyles(t, {}).text.fontSize).toBe(t.text('Heading/4').fontSize);
  });
});
