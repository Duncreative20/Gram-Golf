import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { tagStyles } from './tagStyles';

const t = createTheme({ scheme: 'light' });

describe('tagStyles', () => {
  it('Medium default: Tag/Size, Tag bg/border, label Body/Base/Medium, remove Placeholder', () => {
    const s = tagStyles(t, { size: 'Medium' });
    expect(s.container.height).toBe(t.size('Tag/Size/Medium'));
    expect(s.container.backgroundColor).toBe(t.component('Tag/Background/Default'));
    expect(s.container.borderColor).toBe(t.component('Tag/Border/Default'));
    expect(s.label.fontSize).toBe(t.text('Body/Base/Medium').fontSize);
    expect(s.label.paddingHorizontal).toBe(t.size('Tag/Spacing/Medium/Text-Wrapper-Padding'));
    expect(s.removeColor).toBe('Color/Content/Placeholder');
    expect(s.iconColor).toBe('Color/Content/Neutral/Base');
  });
  it('error: Negative bg/border + remove Negative/Light; disabled: border Disabled, chữ Disabled, không shadow; pressed → Hover', () => {
    const e = tagStyles(t, { size: 'Small', error: true });
    expect(e.container.backgroundColor).toBe(t.color('Color/Background/Negative/Subtle/Default'));
    expect(e.container.borderColor).toBe(t.color('Color/Border/Negative/Solid/Default'));
    expect(e.removeColor).toBe('Color/Content/Negative/Light');
    const d = tagStyles(t, { size: 'Small', disabled: true });
    expect(d.container.borderColor).toBe(t.color('Color/Border/Disabled'));
    expect(d.label.color).toBe(t.color('Color/Content/Disabled'));
    expect(d.container.shadowColor).toBeUndefined();
    expect(tagStyles(t, { size: 'Small', pressed: true }).container.backgroundColor).toBe(t.component('Tag/Background/Hover'));
  });
});
