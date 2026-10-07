import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { segmentedContainerStyles, segmentedItemStyles } from './segmentedStyles';

const t = createTheme({ scheme: 'light' });

// Level = tên token item (NỢ FIGMA F1: set Figma đặt tên ngược).
describe('segmentedStyles', () => {
  it('container: Primary → Surface/Default + Effect/Overlay, Secondary → Surface/Alt, padding 2XSmall', () => {
    expect(segmentedContainerStyles(t, { level: 'Primary' }).backgroundColor).toBe(t.color('Color/Background/Surface/Default'));
    expect(segmentedContainerStyles(t, { level: 'Secondary' }).backgroundColor).toBe(t.color('Color/Background/Surface/Alt'));
    expect(segmentedContainerStyles(t, { level: 'Primary' }).padding).toBe(t.space('Spacing/Padding/2XSmall'));
  });
  it('item Level=Primary dùng Segmented-Item-Primary; Secondary dùng Segmented-Item-Secondary + viền Pale', () => {
    const sel = segmentedItemStyles(t, { level: 'Primary', size: 'Medium', selected: true });
    expect(sel.item.backgroundColor).toBe(t.component('Segmented-Item-Primary/Background/Selected/Default'));
    expect(sel.item.borderColor).toBe(t.component('Segmented-Item-Primary/Border/Selected'));
    expect(sel.label.color).toBe(t.component('Segmented-Item-Primary/Content/Selected'));
    expect(sel.item.height).toBe(t.size('Segmented/Size/Medium'));
    const un = segmentedItemStyles(t, { level: 'Primary', size: 'Medium', selected: false });
    expect(un.item.backgroundColor).toBe(t.component('Segmented-Item-Primary/Background/Unselected/Default'));
    expect(un.label.color).toBe(t.color('Color/Content/Neutral/Light'));
    expect(un.item.borderWidth).toBeUndefined();
    const sec = segmentedItemStyles(t, { level: 'Secondary', size: 'Medium', selected: true });
    expect(sec.item.backgroundColor).toBe(t.component('Segmented-Item-Secondary/Background/Selected/Default'));
    expect(sec.item.borderColor).toBe(t.color('Color/Border/Neutral/Pale/Default'));
  });
  it('Small: label XSmall + Text-Wrapper-Padding 2; pressed → Hover', () => {
    const sel = segmentedItemStyles(t, { level: 'Secondary', size: 'Small', selected: true });
    expect(sel.label.fontSize).toBe(t.text('Body/XSmall/Medium').fontSize);
    expect(sel.label.paddingHorizontal).toBe(t.size('Segmented/Spacing/Small/Text-Wrapper-Padding 2'));
    expect(segmentedItemStyles(t, { level: 'Primary', size: 'Small', selected: false, pressed: true }).item.backgroundColor).toBe(t.component('Segmented-Item-Primary/Background/Unselected/Hover'));
  });
});
