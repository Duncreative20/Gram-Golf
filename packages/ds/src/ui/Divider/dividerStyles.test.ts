import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { dividerStyles } from './dividerStyles';

describe('dividerStyles', () => {
  const t = createTheme({ scheme: 'light' });
  it('Horizontal: Default→Pale, Medium→Subtle, High→Solid, cao 1px', () => {
    expect(dividerStyles(t, { color: 'Default', direction: 'Horizontal' })).toMatchObject({ height: 1, backgroundColor: t.color('Color/Border/Neutral/Pale/Default') });
    expect(dividerStyles(t, { color: 'Medium', direction: 'Horizontal' }).backgroundColor).toBe(t.color('Color/Border/Neutral/Subtle/Default'));
    expect(dividerStyles(t, { color: 'High', direction: 'Horizontal' }).backgroundColor).toBe(t.color('Color/Border/Neutral/Solid/Default'));
  });
  it('Vertical: rộng 1px, Default bound Subtle như Figma', () => {
    const s = dividerStyles(t, { color: 'Default', direction: 'Vertical' });
    expect(s.width).toBe(1);
    expect(s.height).toBeUndefined();
    expect(s.backgroundColor).toBe(t.color('Color/Border/Neutral/Subtle/Default'));
  });
  it('dark scheme đổi màu', () => {
    const d = createTheme({ scheme: 'dark' });
    expect(dividerStyles(d, { color: 'High', direction: 'Horizontal' }).backgroundColor).toBe(d.color('Color/Border/Neutral/Solid/Default'));
  });
});
