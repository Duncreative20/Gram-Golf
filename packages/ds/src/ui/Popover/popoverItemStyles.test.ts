import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { popoverItemStyles } from './popoverItemStyles';

const t = createTheme({ scheme: 'light' });

describe('popoverItemStyles', () => {
  it('Item: padding Medium/Small, radius Base, nền Flat; pressed → Accent/Flat/Hover', () => {
    const s = popoverItemStyles(t, { type: 'Item' });
    expect(s.container.paddingHorizontal).toBe(t.space('Spacing/Padding/Medium'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/Base'));
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Neutral/Flat/Default'));
    expect(s.container.gap).toBe(t.space('Spacing/Gap/Medium'));
    expect(s.label.color).toBe(t.color('Color/Content/Neutral/Strongest'));
    expect(s.caption.fontSize).toBe(t.text('Body/XSmall/Medium').fontSize);
    expect(popoverItemStyles(t, { type: 'Item', pressed: true }).container.backgroundColor).toBe(t.color('Color/Background/Accent/Flat/Hover'));
  });
  it('Radio: box Checkbox token, selected → Selected bg + dot Icon-Check; Follow-User gap Small', () => {
    const u = popoverItemStyles(t, { type: 'Radio' });
    expect(u.radio.box.borderColor).toBe(t.component('Checkbox/Border/Default'));
    const s = popoverItemStyles(t, { type: 'Radio', selected: true });
    expect(s.radio.box.backgroundColor).toBe(t.component('Checkbox/Background/Selected/Default'));
    expect(s.radio.box.borderWidth).toBeUndefined();
    expect(s.radio.dot.backgroundColor).toBe(t.component('Checkbox/Icon-Check/Default'));
    expect(popoverItemStyles(t, { type: 'Follow-User' }).container.gap).toBe(t.space('Spacing/Gap/Small'));
  });
});
