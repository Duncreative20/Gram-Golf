import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { alertBannerStyles, dialogStyles, inlineMessageStyles, toastStyles, tooltipStyles } from './feedbackStyles';
import { listItemStyles } from '../ListItem/listItemStyles';
import { cardStyles } from '../Card/cardStyles';
import { accordionStyles } from '../Accordion/accordionStyles';

const t = createTheme({ scheme: 'light' });

describe('alertBannerStyles', () => {
  it('Medium Warning: bg Warning/Solid, chữ On-Brights, paddingH Large; Small: Body/XSmall/Medium, icon Small', () => {
    const s = alertBannerStyles(t, { size: 'Medium', theme: 'Warning' });
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Warning/Solid/Default'));
    expect(s.text.color).toBe(t.color('Color/Content/On-Brights'));
    expect(s.container.paddingHorizontal).toBe(t.space('Spacing/Padding/Large'));
    expect(s.iconSize).toBe(t.size('Element-Size/Popular/Base'));
    const sm = alertBannerStyles(t, { size: 'Small', theme: 'Neutral' });
    expect(sm.text.fontSize).toBe(t.text('Body/XSmall/Medium').fontSize);
    expect(sm.text.color).toBe(t.color('Color/Content/Inverse/Strongest'));
    expect(sm.iconSize).toBe(t.size('Element-Size/Popular/Small'));
  });
});

describe('inlineMessageStyles / toastStyles / tooltipStyles', () => {
  it('Inline Info: bg Subtle, radius Large, icon Info/Light', () => {
    const s = inlineMessageStyles(t, { theme: 'Info' });
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Info/Subtle/Default'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/Large'));
    expect(s.iconColor).toBe('Color/Content/Info/Base');
    expect(s.title.color).toBe(t.color('Color/Content/Info/Strongest'));
  });
  it('Toast Subtle: Popover bg + border; Negative: Solid + On-Colors; radius 2XLarge', () => {
    const s = toastStyles(t, { type: 'Subtle' });
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Popover/Default'));
    expect(s.container.borderColor).toBe(t.color('Color/Border/Popover/Subtle'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/2XLarge'));
    const n = toastStyles(t, { type: 'Negative' });
    expect(n.container.backgroundColor).toBe(t.color('Color/Background/Negative/Solid/Default'));
    expect(n.title.color).toBe(t.color('Color/Content/On-Colors'));
    expect(n.container.borderWidth).toBeUndefined();
  });
  it('Tooltip: 4 màu, radius Small, Medium padding XSmall/2XSmall', () => {
    const s = tooltipStyles(t, { color: 'Black-Overlay', size: 'Medium' });
    expect(s.container.backgroundColor).toBe(t.color('Color/Background/Black-Overlay/Default'));
    expect(s.text.color).toBe(t.color('Color/Content/On-Dark-Overlay/Strongest'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/Small'));
    expect(s.container.paddingHorizontal).toBe(t.space('Spacing/Padding/XSmall'));
    expect(tooltipStyles(t, { color: 'Accent', size: 'Small' }).container.backgroundColor).toBe(t.color('Color/Background/Accent/Solid/Default'));
  });
  it('Dialog: XGiant, Container bg + border, Modal-Padding', () => {
    const s = dialogStyles(t);
    expect(s.box.borderRadius).toBe(t.radius('Corner-Radius/XGiant'));
    expect(s.box.backgroundColor).toBe(t.color('Color/Background/Container'));
    expect(s.content.padding).toBe(t.layout('Modal-Padding'));
  });
});

describe('listItemStyles / cardStyles / accordionStyles', () => {
  it('ListItem Inline paddingH Margin-Small (Selected → Comfortable + Accent Subtle); Grouped Padding/Small + radius Base; Radio-Card bg White-Solid', () => {
    const s = listItemStyles(t, { type: 'Inline' });
    expect(s.container.paddingHorizontal).toBe(t.layout('Margin-Small'));
    expect(s.container.borderRadius).toBe(0);
    const sel = listItemStyles(t, { type: 'Inline', selected: true });
    expect(sel.container.paddingHorizontal).toBe(t.layout('Margin-Comfortable'));
    expect(sel.container.backgroundColor).toBe(t.color('Color/Background/Active/Accent/Subtle'));
    const g = listItemStyles(t, { type: 'Grouped' });
    expect(g.container.paddingHorizontal).toBe(t.space('Spacing/Padding/Small'));
    expect(g.container.borderRadius).toBe(t.radius('Corner-Radius/Base'));
    expect(listItemStyles(t, { type: 'Radio-Card' }).container.backgroundColor).toBe(t.color('Color/Background/Surface/Default'));
    expect(s.leadingSize).toBe(t.size('Image-Size/Medium'));
  });
  it('Card Medium: Card-padding-medium + 2XLarge; Small: Large; Pale bg; Border stroke; Shadow', () => {
    const m = cardStyles(t, { theme: 'Default', spacing: 'Medium' });
    expect(m.container.padding).toBe(t.layout('Card-padding-medium'));
    expect(m.container.borderRadius).toBe(t.radius('Corner-Radius/2XLarge'));
    expect(m.container.backgroundColor).toBe(t.color('Color/Background/Surface/Default'));
    expect(cardStyles(t, { theme: 'Default', spacing: 'Small' }).container.borderRadius).toBe(t.radius('Corner-Radius/Large'));
    expect(cardStyles(t, { theme: 'Pale', spacing: 'Medium' }).container.backgroundColor).toBe(t.color('Color/Background/Support/Neutral/Pale'));
    expect(cardStyles(t, { theme: 'Border', spacing: 'Medium' }).container.borderColor).toBe(t.color('Color/Border/Neutral/Pale/Default'));
    expect(cardStyles(t, { theme: 'Shadow', spacing: 'Medium' }).container.shadowColor).toBe(t.shadow('Shadow/Bottom/Level-2').shadowColor);
  });
  it('Accordion XLarge Box: Padding/XLarge, Heading/3, icon Large, radius 2XLarge; Divider: borderBottom Subtle', () => {
    const s = accordionStyles(t, { size: 'XLarge', theme: 'Box' });
    expect(s.container.padding).toBe(t.space('Spacing/Padding/XLarge'));
    expect(s.title.fontSize).toBe(t.text('Heading/3').fontSize);
    expect(s.iconSize).toBe(t.size('Element-Size/Popular/Large'));
    expect(s.container.borderRadius).toBe(t.radius('Corner-Radius/2XLarge'));
    const d = accordionStyles(t, { size: 'Large', theme: 'Divider' });
    expect(d.container.borderBottomColor).toBe(t.color('Color/Border/Neutral/Subtle/Default'));
    expect(d.title.fontSize).toBe(t.text('Heading/4').fontSize);
  });
});
