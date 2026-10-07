import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { toggleStyles } from './toggleStyles';

const t = createTheme({ scheme: 'light' });

describe('toggleStyles', () => {
  it('Medium off: bar 44×24, dot Toggle/Item/Size/Medium, nền Subtle, dot Unselected + border Pale', () => {
    const s = toggleStyles(t, { size: 'Medium', select: false });
    expect(s.bar.width).toBe(44);
    expect(s.bar.height).toBe(24);
    expect(s.dot.width).toBe(t.size('Toggle/Item/Size/Medium'));
    expect(s.bar.backgroundColor).toBe(t.color('Color/Background/Neutral/Subtle/Default'));
    expect(s.dot.backgroundColor).toBe(t.component('Toggle/Dot/Background/Unselected-Default'));
    expect(s.dot.borderColor).toBe(t.color('Color/Border/Neutral/Pale/Default'));
    expect(s.bar.justifyContent).toBe('flex-start');
  });
  it('on: bar Selected, dot Selected, flex-end; Small 36×20; Large 52×28', () => {
    const s = toggleStyles(t, { size: 'Medium', select: true });
    expect(s.bar.backgroundColor).toBe(t.component('Toggle/Bar/Background/Selected/Default'));
    expect(s.dot.backgroundColor).toBe(t.component('Toggle/Dot/Background/Selected-Default'));
    expect(s.bar.justifyContent).toBe('flex-end');
    expect(toggleStyles(t, { size: 'Small', select: false }).bar.width).toBe(36);
    expect(toggleStyles(t, { size: 'Large', select: false }).bar.height).toBe(28);
  });
  it('disabled: token Disabled, dot vẫn Shadow/Action/Basic (Figma); pressed off → Hover', () => {
    const d = toggleStyles(t, { size: 'Medium', select: true, disabled: true });
    expect(d.bar.backgroundColor).toBe(t.component('Toggle/Bar/Background/Selected/Disabled'));
    expect(d.dot.backgroundColor).toBe(t.component('Toggle/Dot/Background/Selected-Disabled'));
    expect(d.dot.shadowColor).toBe(t.shadow('Shadow/Action/Basic').shadowColor);
    expect(toggleStyles(t, { size: 'Medium', select: false, pressed: true }).bar.backgroundColor).toBe(t.component('Toggle/Bar/Background/Unselected/Hover'));
  });
});
