import { describe, expect, it } from 'vitest';
import { createTheme } from '../../theme/createTheme';
import { identityStyles, mediaPillStyles, postCardStyles, postMediaStyles, RATIO, socialActionStyles, videoOverlayStyles } from './postCardStyles';
import { storyStyles } from '../Story/storyStyles';
import { commentMediaStyles, commentStyles, composerStyles } from '../Comment/commentStyles';
import { collectionCardStyles, collectionItemStyles, mediaItemStyles, shareActionLabelStyles, sheetBodyStyles } from '../Social/socialStyles';

const t = createTheme({ scheme: 'light' });

describe('Post-Card', () => {
  it('Post-action Medium: icon Medium, Off Neutral/Light, On Neutral/Base, label Body/Base/DemiBold; Small: icon Small, Body/XSmall/DemiBold; More-item icon Base; overlay Inverse', () => {
    const off = socialActionStyles(t, { type: 'Like', size: 'Medium', active: false });
    expect(off.icon).toBe('heart-line');
    expect(off.iconSize).toBe(t.size('Element-Size/Popular/Medium'));
    expect(off.iconColor).toBe('Color/Content/Neutral/Light');
    expect(off.label.fontSize).toBe(t.text('Body/Base/DemiBold').fontSize);
    const on = socialActionStyles(t, { type: 'Share', size: 'Medium', active: true });
    expect(on.icon).toBe('paper-plane-solid');
    expect(on.iconColor).toBe('Color/Content/Neutral/Base');
    const sm = socialActionStyles(t, { type: 'Attachment', size: 'Small', active: true });
    expect(sm.icon).toBe('marker-pin-01-solid');
    expect(sm.iconSize).toBe(t.size('Element-Size/Popular/Small'));
    expect(sm.label.fontSize).toBe(t.text('Body/XSmall/DemiBold').fontSize);
    expect(socialActionStyles(t, { type: 'More-item', size: 'Medium', active: false }).iconSize).toBe(t.size('Element-Size/Popular/Base'));
    expect(socialActionStyles(t, { type: 'Like', size: 'Medium', active: false, overlay: true }).iconColor).toBe('Color/Content/On-Dark-Overlay/Base');
  });
  it('Identity: name Body/XSmall/DemiBold Strongest (overlay Inverse), meta Body/XSmall/Regular Neutral/Base, gap XSmall', () => {
    const s = identityStyles(t, {});
    expect(s.name.color).toBe(t.color('Color/Content/Neutral/Strongest'));
    expect(s.meta.color).toBe(t.color('Color/Content/Neutral/Base'));
    expect(s.row.gap).toBe(t.space('Spacing/Gap/XSmall'));
    expect(s.verifiedSize).toBe(t.size('Element-Size/Popular/XSmall'));
    expect(identityStyles(t, { overlay: true }).name.color).toBe(t.color('Color/Content/On-Dark-Overlay/Strongest'));
  });
  it('Media-Info-Pill: Surface/Overlay + border Active/Overlay/Subtle, Caption/Medium Inverse; Counter icon gr-dm-12, Muted gr-dm-16 + padding XSmall', () => {
    const c = mediaPillStyles(t, { type: 'Counter' });
    expect(c.pill.backgroundColor).toBe(t.color('Color/Background/Surface/Overlay'));
    expect(c.pill.borderColor).toBe(t.color('Color/Border/Active/Overlay/Subtle'));
    expect(c.text.color).toBe(t.color('Color/Content/On-Dark-Overlay/Strongest'));
    expect(c.iconSize).toBe(t.primitive('gr-dm-12'));
    expect(c.icon).toBe('image-list-line');
    const m = mediaPillStyles(t, { type: 'Muted' });
    expect(m.iconSize).toBe(t.primitive('gr-dm-16'));
    expect(m.pill.paddingVertical).toBe(t.space('Spacing/Padding/XSmall'));
    expect(mediaPillStyles(t, { type: 'Link' }).icon).toBe('globe-01-line');
  });
  it('Post-Media: radius Large, ratio Square 1 / Portrait 4:5 / Landscape 16:9; Video overlay bg Black-Overlay (Playing trong suốt); card footer paddingH Medium', () => {
    const s = postMediaStyles(t);
    expect(s.viewport.borderRadius).toBe(t.radius('Corner-Radius/Large'));
    expect(s.frame('Portrait').aspectRatio).toBe(RATIO.Portrait);
    expect(RATIO.Landscape).toBeCloseTo(16 / 9);
    expect(videoOverlayStyles(t, { state: 'Paused' }).scrim.backgroundColor).toBe(t.color('Color/Background/Black-Overlay/Default'));
    expect(videoOverlayStyles(t, { state: 'Playing' }).scrim.backgroundColor).toBe('transparent');
    expect(videoOverlayStyles(t, { state: 'Error' }).caption.color).toBe(t.color('Color/Content/On-Dark-Overlay/Base'));
    const c = postCardStyles(t);
    expect(c.footer.paddingHorizontal).toBe(t.space('Spacing/Padding/Medium'));
    expect(c.footer.paddingVertical).toBe(t.space('Spacing/Padding/XSmall'));
    expect(c.captionLink.color).toBe(t.color('Color/Content/Accent/Base'));
  });
});

describe('Story-Viewer', () => {
  it('nền Inverse/Solid; header padding Small/XSmall gap XSmall; caption Inverse/Base paddingH XLarge; reply pill Input/Size/Small Rounded Input-Overlay (sending → Active/Overlay/Subtle)', () => {
    const s = storyStyles(t);
    expect(s.screen.backgroundColor).toBe(t.color('Color/Background/Black-Solid/Default'));
    expect(s.header.paddingHorizontal).toBe(t.space('Spacing/Padding/Small'));
    expect(s.header.gap).toBe(t.space('Spacing/Gap/XSmall'));
    expect(s.caption.color).toBe(t.color('Color/Content/On-Dark-Overlay/Base'));
    expect(s.captionWrap.paddingHorizontal).toBe(t.space('Spacing/Padding/XLarge'));
    expect(s.replyField(false).height).toBe(t.size('Input/Size/Small'));
    expect(s.replyField(false).borderRadius).toBe(t.radius('Corner-Radius/Input/Rounded'));
    expect(s.replyField(true).backgroundColor).toBe(t.color('Color/Background/Active/Overlay/Subtle'));
    expect(s.media('16:9').aspectRatio).toBeCloseTo(16 / 9);
  });
});

describe('Comment', () => {
  it('Comment-Item: gap XSmall, container gap Small, text Body/Small/Regular Strongest, avatar ring Border/Inverse, reply thụt = avatar XSmall + gap', () => {
    const s = commentStyles(t);
    expect(s.item.gap).toBe(t.space('Spacing/Gap/XSmall'));
    expect(s.container.gap).toBe(t.space('Spacing/Gap/Small'));
    expect(s.text.fontSize).toBe(t.text('Body/Small/Regular').fontSize);
    expect(s.avatarRing.borderColor).toBe(t.color('Color/Border/Inverse'));
    expect(s.replyIndent.paddingLeft).toBe(t.size('Image-Size/XSmall') + t.space('Spacing/Gap/XSmall'));
    expect(s.actionRow.gap).toBe(t.space('Spacing/Gap/Medium'));
  });
  it('Comment-Media-Item: Medium 72 / Small 48, radius Small, scrim Black-Overlay, play gr-dm-24/16, Loading bg Subtle-Disabled', () => {
    const m = commentMediaStyles(t, { type: 'Video', size: 'Medium' });
    expect(m.box.width).toBe(t.size('Image-Size/XLarge'));
    expect(m.box.borderRadius).toBe(t.radius('Corner-Radius/Small'));
    expect(m.scrim.backgroundColor).toBe(t.color('Color/Background/Black-Overlay/Default'));
    expect(m.playSize).toBe(t.primitive('gr-dm-24'));
    expect(commentMediaStyles(t, { type: 'Video', size: 'Small' }).playSize).toBe(t.primitive('gr-dm-16'));
    expect(commentMediaStyles(t, { type: 'Image', size: 'Small' }).box.width).toBe(t.size('Image-Size/Medium'));
    expect(commentMediaStyles(t, { type: 'Loading', size: 'Small' }).box.backgroundColor).toBe(t.color('Color/Background/Subtle-Disabled'));
    expect(m.label.fontSize).toBe(t.text('Caption/DemiBold').fontSize);
  });
  it('Composer: Input bg/border, padding XSmall, Input/Medium (Default) → XLarge (expanded); reply-context Badge Small', () => {
    const s = composerStyles(t);
    expect(s.surface(false).borderRadius).toBe(t.radius('Corner-Radius/Input/Medium')); // Figma Comment-Composer (parity §7e)
    expect(s.surface(true).borderRadius).toBe(t.radius('Corner-Radius/XLarge'));
    expect(s.surface(false).backgroundColor).toBe(t.component('Input/Background/Default'));
    expect(s.surface(false).padding).toBe(t.space('Spacing/Padding/XSmall'));
    expect(s.replyContext.height).toBe(t.size('Badge/Size/Small'));
  });
});

describe('Sheets · Collection · Media-Item', () => {
  it('Likes body padding Medium items gap XSmall; Share body XLarge, footer Container; Action-Label Large Tertiary / Active Accent Subtle', () => {
    const l = sheetBodyStyles(t, { pad: 'Medium' });
    expect(l.body.paddingHorizontal).toBe(t.space('Spacing/Padding/Medium'));
    expect(l.items.gap).toBe(t.space('Spacing/Gap/XSmall'));
    const sh = sheetBodyStyles(t, { pad: 'XLarge' });
    expect(sh.body.paddingHorizontal).toBe(t.space('Spacing/Padding/XLarge'));
    expect(sh.footer.backgroundColor).toBe(t.color('Color/Background/Container'));
    const a = shareActionLabelStyles(t, { active: false });
    expect(a.circle.width).toBe(t.size('Button/Size/Large'));
    expect(a.circle.backgroundColor).toBe(t.component('Button-Tertiary/Background/Default'));
    const act = shareActionLabelStyles(t, { active: true });
    expect(act.circle.backgroundColor).toBe(t.color('Color/Background/Accent/Subtle/Default'));
    expect(act.iconColor).toBe('Color/Content/Accent/Base');
  });
  it('Collection item: radius XLarge (Create-New Large), border Container/Subtle, cover Image-Size/Large Base, title Body/Small/DemiBold; card radius XLarge', () => {
    const d = collectionItemStyles(t, { state: 'Default' });
    expect(d.row.borderRadius).toBe(t.radius('Corner-Radius/XLarge'));
    expect(d.row.borderColor).toBe(t.color('Color/Border/Container/Subtle'));
    expect(d.cover.width).toBe(t.size('Image-Size/Large'));
    expect(d.title.fontSize).toBe(t.text('Body/Small/DemiBold').fontSize);
    expect(collectionItemStyles(t, { state: 'Create-New' }).row.borderRadius).toBe(t.radius('Corner-Radius/Large'));
    expect(collectionItemStyles(t, { state: 'Disabled' }).title.color).toBe(t.color('Color/Content/Neutral/Base')); // Figma Disabled chỉ đổi icon (parity §7e)
    expect(collectionCardStyles(t).card.borderRadius).toBe(t.radius('Corner-Radius/XLarge'));
    expect(collectionCardStyles(t).coverSide.borderLeftColor).toBe(t.color('Color/Border/Neutral/Subtle/Default'));
  });
  it('Media-Item: Image-Size/2XLarge, border Overlay/Subtle (F51), duration Body/XSmall/DemiBold Inverse', () => {
    const m = mediaItemStyles(t, { state: 'Selected' });
    expect(m.box.width).toBe(t.size('Image-Size/2XLarge'));
    expect(m.box.borderColor).toBe(t.color('Color/Border/Overlay/Subtle/Default'));
    expect(m.duration.color).toBe(t.color('Color/Content/On-Dark-Overlay/Strongest'));
    expect(m.removeSize).toBe(t.size('Element-Size/Popular/Base'));
  });
});
