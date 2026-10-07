import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { progressStyles, skeletonStyles, skeletonTextStyles } from './progressStyles';
import { breadcrumbsStyles, paginationStyles, stepperStyles } from '../Navigation/navigationStyles';
import { otpCellStyles } from '../OtpField/otpFieldStyles';
import { stepperControlStyles } from '../StepperControl/stepperControlStyles';
import { textFieldStyles } from '../TextField/textFieldStyles';
import { avatarGroupStyles, colorSelectorStyles, connectorStyles, dockIconStyles } from '../DockIcon/dockIconStyles';

const t = createTheme({ scheme: 'light' });

describe('cụm E', () => {
  it('ProgressBar: Accent fill Active/Accent/Solid; Status Negative; Overlay White-Solid', () => {
    expect(progressStyles(t, { theme: 'Accent' }).fill.backgroundColor).toBe(t.color('Color/Background/Active/Accent/Solid'));
    expect(progressStyles(t, { theme: 'Status', status: 'Negative' }).fill.backgroundColor).toBe(t.color('Color/Background/Negative/Solid/Default'));
    expect(progressStyles(t, { theme: 'Overlay' }).fill.backgroundColor).toBe(t.color('Color/Background/Active/Overlay/Solid'));
    expect(progressStyles(t, { theme: 'Neutral' }).track.backgroundColor).toBe(t.color('Color/Background/Neutral/Subtle/Default'));
  });
  it('Skeleton: Round vuông theo Image-Size, Pill Rounded, Rectangle Base; Heading Large = Image-Size/XSmall', () => {
    const r = skeletonStyles(t, { shape: 'Round', size: 'Large - 48px' });
    expect(r.width).toBe(t.size('Image-Size/Medium'));
    expect(r.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(skeletonStyles(t, { shape: 'Rectangle', size: 'Small - 32px' }).borderRadius).toBe(t.radius('Corner-Radius/Base'));
    expect(skeletonTextStyles(t, { heading: 'Large' }).line.height).toBe(t.size('Image-Size/XSmall'));
  });
  it('Pagination Primary selected: Active/Neutral/Solid + Inverse; Secondary: Subtle + Strongest; Inline không khung', () => {
    const p = paginationStyles(t, { theme: 'Primary', size: 'XSmall' });
    expect(p.item(true).backgroundColor).toBe(t.color('Color/Background/Active/Neutral/Solid'));
    expect(p.label(true).color).toBe(t.color('Color/Content/Inverse/Strongest'));
    expect(p.item(true).width).toBe(t.size('Select-Item/Size/Small'));
    expect(p.container.backgroundColor).toBe(t.component('Button-Tertiary/Background/Default'));
    const sec = paginationStyles(t, { theme: 'Secondary', size: 'Small' });
    expect(sec.item(true).backgroundColor).toBe(t.color('Color/Background/Active/Neutral/Subtle'));
    expect(sec.item(true).width).toBe(t.size('Select-Item/Size/Medium'));
    expect(paginationStyles(t, { theme: 'Inline', size: 'XSmall' }).container.backgroundColor).toBeUndefined();
  });
  it('Breadcrumbs item radius Small, cuối Body/Base/Medium; Stepper Passed border Active weight, Error Negative/Subtle', () => {
    const b = breadcrumbsStyles(t);
    expect(b.item.borderRadius).toBe(t.radius('Corner-Radius/Small'));
    expect(b.label(true).fontSize).toBe(t.text('Body/Base/Medium').fontSize);
    const s = stepperStyles(t);
    expect(s.dot('Passed').borderWidth).toBe(t.weight('Emphasis/Border-Weight/Active'));
    expect(s.dot('Passed').backgroundColor).toBe(t.color('Color/Background/Inverse/Solid/Default'));
    expect(s.dot('Error').backgroundColor).toBe(t.color('Color/Background/Negative/Subtle/Default'));
    expect(s.dot('Default').backgroundColor).toBe(t.component('Date-Picker-Item/Background/Unselected/Hover'));
    expect(s.title('Error').color).toBe(t.color('Color/Content/Negative/Base'));
  });
});

describe('cụm F', () => {
  it('OTP cell XLarge: Input/Size/XLarge vuông, radius Input/XLarge, Heading/Subheading; focused → Focus/Neutral/Solid; error Negative; disabled Subtle-Disabled', () => {
    const c = otpCellStyles(t, { size: 'XLarge' });
    expect(c.cell.width).toBe(t.size('Input/Size/XLarge'));
    expect(c.cell.aspectRatio).toBe(1); expect(c.cell.flexShrink).toBe(1); // F53: ô vuông, co khi 6 ô không vừa khung
    expect(c.cell.borderRadius).toBe(t.radius('Corner-Radius/Input/XLarge'));
    expect(c.digit.fontSize).toBe(t.text('Heading/Subheading').fontSize);
    expect(otpCellStyles(t, { size: 'Large', focused: true }).cell.borderColor).toBe(t.color('Color/Focus/Neutral/Solid'));
    expect(otpCellStyles(t, { size: 'Large', error: true }).cell.borderColor).toBe(t.color('Color/Border/Negative/Solid/Default'));
    expect(otpCellStyles(t, { size: 'Large', disabled: true }).cell.backgroundColor).toBe(t.color('Color/Background/Subtle-Disabled'));
  });
  it('StepperControl Medium: height Align-Center/Size/Medium, radius Stepper-Control/Rounded, bg/border Stepper-Control, nút XSmall', () => {
    const s = stepperControlStyles(t, { size: 'Medium' });
    expect(s.row.height).toBe(t.size('Stepper-Control-Align-Center/Size/Medium'));
    expect(s.field.borderRadius).toBe(t.radius('Corner-Radius/Stepper-Control/Rounded'));
    expect(s.field.backgroundColor).toBe(t.component('Stepper-Control/Background/Default'));
    expect(s.buttonSize).toBe('XSmall');
    expect(stepperControlStyles(t, { size: 'Medium', focused: true }).field.borderColor).toBe(t.color('Color/Focus/Neutral/Solid'));
  });
  it('TextArea: height Text-Area/Size/Medium, alignItems flex-start; Search overlay: Input-Overlay bg/border, radius Large, chữ On-Dark-Overlay', () => {
    const a = textFieldStyles(t, { size: 'Medium (Base)', multiline: true });
    expect(a.field.height).toBe(t.size('Text-Area/Size/Medium'));
    expect(a.field.alignItems).toBe('flex-start');
    const o = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Search', overlay: true });
    expect(o.field.backgroundColor).toBe(t.component('Input-Overlay/Background/Default'));
    expect(o.field.borderColor).toBe(t.component('Input-Overlay/Border/Default'));
    expect(o.field.borderRadius).toBe(t.radius('Corner-Radius/Large'));
    expect(o.input.color).toBe(t.color('Color/Content/On-Dark-Overlay/Strongest'));
    expect(o.placeholderColor).toBe(t.color('Color/Content/On-Dark-Overlay/Placeholder'));
    const f = textFieldStyles(t, { size: 'Medium (Base)', variant: 'Search', overlay: true, focused: true });
    expect(f.field.borderColor).toBe(t.color('Color/Focus/Overlay/Subtle'));
    expect(f.field.backgroundColor).toBe(t.component('Input-Overlay/Background/Focused'));
  });
});

describe('cụm G', () => {
  it('DockIcon Medium Neutral Solid: Image-Size/Medium, Rounded, Neutral/Solid + Inverse; Accent Subtle → Accent/Light; Blue Subtle → Support/Blue', () => {
    const d = dockIconStyles(t, { size: 'Medium', theme: 'Neutral', background: 'Solid' });
    expect(d.box.width).toBe(t.size('Image-Size/Medium'));
    expect(d.box.borderRadius).toBe(t.radius('Corner-Radius/Rounded'));
    expect(d.box.backgroundColor).toBe(t.color('Color/Background/Neutral/Solid/Default'));
    expect(d.iconColor).toBe('Color/Content/Inverse/Strongest');
    expect(d.iconSize).toBe(t.size('Element-Size/Popular/Base'));
    expect(dockIconStyles(t, { size: 'Medium', theme: 'Accent', background: 'Subtle' }).iconColor).toBe('Color/Content/Accent/Light');
    expect(dockIconStyles(t, { size: 'Small', theme: 'Blue', background: 'Subtle' }).box.backgroundColor).toBe(t.color('Color/Background/Support/Blue/Subtle'));
  });
  it('Connector: Connected Accent Subtle + border Active weight + badge; Default 1px Neutral; Error Negative; Disabled Subtle-Disabled; radius Base', () => {
    const c = connectorStyles(t, { size: 'Medium', background: 'Connected' });
    expect(c.box.backgroundColor).toBe(t.color('Color/Background/Active/Accent/Subtle'));
    expect(c.box.borderWidth).toBe(t.weight('Emphasis/Border-Weight/Active'));
    expect(c.box.borderRadius).toBe(t.radius('Corner-Radius/Base'));
    expect(c.badge).not.toBeNull();
    expect(connectorStyles(t, { size: 'Medium', background: 'Default' }).box.borderWidth).toBe(1);
    expect(connectorStyles(t, { size: 'Medium', background: 'Error' }).iconColor).toBe('Color/Content/Negative/Strongest');
    expect(connectorStyles(t, { size: 'Medium', background: 'Disabled' }).box.backgroundColor).toBe(t.color('Color/Background/Subtle-Disabled'));
  });
  it('ColorSelector 32 Rounded border Subtle/Hover; AvatarGroup Medium overlap XSmall, more Accent Subtle + Heading/Subheading; Solid → On-Accent', () => {
    const c = colorSelectorStyles(t, { select: true });
    expect(c.box.width).toBe(t.size('Select-Item/Size/Small'));
    expect(c.box.borderColor).toBe(t.color('Color/Border/Neutral/Subtle/Hover'));
    const g = avatarGroupStyles(t, { size: 'Medium', background: 'Subtle' });
    expect(g.overlap.marginLeft).toBe(-t.space('Spacing/Gap/XSmall'));
    expect(g.more.backgroundColor).toBe(t.color('Color/Background/Accent/Subtle/Default'));
    expect(g.moreText.fontSize).toBe(t.text('Heading/Subheading').fontSize);
    expect(g.moreText.color).toBe(t.color('Color/Content/Accent/Strongest'));
    const sm = avatarGroupStyles(t, { size: 'Small', background: 'Solid' });
    expect(sm.moreText.color).toBe(t.color('Color/Content/On-Accent/Default'));
    expect(sm.moreText.fontSize).toBe(t.text('Body/Base/DemiBold').fontSize);
  });
});
