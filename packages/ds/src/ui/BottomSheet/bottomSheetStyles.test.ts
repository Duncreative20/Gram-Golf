import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { bottomSheetStyles } from './bottomSheetStyles';

const t = createTheme({ scheme: 'light' });

describe('bottomSheetStyles', () => {
  it('Modal: radius 3XLarge, Surface/Default, border Container/Subtle, header padding Medium', () => {
    const s = bottomSheetStyles(t, { type: 'Modal', size: 'Medium', align: 'Start', secondary: 'None', divider: true });
    expect(s.container.borderTopLeftRadius).toBe(t.radius('Corner-Radius/3XLarge'));
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Surface/Default'));
    expect(s.container.borderColor).toBe(t.color('Color/Border/Container/Subtle'));
    expect(s.header.padding).toBe(t.space('Spacing/Padding/Medium'));
    expect(s.heading.fontSize).toBe(t.text('Heading/Subheading').fontSize);
    expect(s.divider.backgroundColor).toBe(t.color('Color/Border/Neutral/Pale/Default'));
    expect(s.actions.flexDirection).toBe('row');
    expect(s.actions.gap).toBe(t.space('Spacing/Gap/Small'));
  });
  it('Action: nền Container, grabber Support/Neutral/Solid; Secondary-Vertical → column gap XSmall; Center align', () => {
    const s = bottomSheetStyles(t, { type: 'Action', size: 'Small', align: 'Center', secondary: 'Secondary-Vertical' });
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Container'));
    expect(s.grabber.backgroundColor).toBe(t.color('Color/Background/Support/Neutral/Solid'));
    expect(s.actions.flexDirection).toBe('column');
    expect(s.actions.gap).toBe(t.space('Spacing/Gap/XSmall'));
    expect(s.titleBlock.alignItems).toBe('center');
    expect(s.heading.fontSize).toBe(t.text('Body/Base/DemiBold').fontSize);
    expect(s.footer.paddingHorizontal).toBe(t.layout('Modal-Padding'));
  });
});
