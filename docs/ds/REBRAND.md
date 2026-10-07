# Báo cáo rebrand DS → GramGolf (phân tích theme, 07/10/2026)

Rebrand report for @gr/ds: GramGolf teal #14BE96 with navy #0B2230

I tried the swap on a copy of `packages/ds` in the scratchpad (`.../scratchpad/w/packages/ds`); the real repo was not modified. Baseline: all 12 theme/audit tests pass. The prototype files are `.../scratchpad/w/packages/ds/tokens/brand/gramgolf*.dtcg.json` and `.../scratchpad/w/packages/ds/tokens/build.mjs`, and the scale generator is `.../scratchpad/scale_lib.py` (scratchpad = /private/tmp/claude-502/-Users-duncreative-Coding-Agent-Gram-Golf/73147e2c-ce74-4470-915f-ed7dea6e97bd/scratchpad). The checks below were run on that copy.

**The fix that matters most: the app never shows teal buttons today.** `ThemeProvider` defaults to `emphasis='neutral'`, and `apps/golf/app/_layout.tsx` renders `<ThemeProvider scheme="auto">`. So the Primary button is black (`Neutral.12`). You need `emphasis="brand"` in `_layout.tsx` and in `.storybook/preview.tsx`, which has no emphasis toggle.

## (1) How brand colors flow

Pipeline: `tokens/compact/*.json` (Figma dump) → `tokens/compact-to-dtcg.mjs` → `tokens/figma/*.dtcg.json` → `tokens/build.mjs` (Style Dictionary, alias resolution) → `src/generated/*.ts`.

Each layer and the file it lives in:
1. **Global:** `figma/global-colors.gr.dtcg.json` defines `global-colors.{GR-Light|GR-Dark}.{GR|GR-Alpha}.1..12`. The current GR is a custom green, not a Radix scale:
   - Light step 9 is `#1b795c`, and steps 2 and 3 are identical (`#f1f8f6`).
   - Dark step 9 is `#73e3be`.
2. **Base:** `figma/base-colors.gr.dtcg.json` maps `base-colors.{Light|Dark}.Brand.n` to `GR.n` and `Brand-Alpha.n` to `GR-Alpha.n` (48 aliases). The foreground colours are raw hex, not aliases:
   - `Light.On-Brand-Default/Hover/Pressed` = `#ffffff`
   - `Dark.On-Brand-Default` = `#ffffff`
   - `Dark.On-Brand-Hover/Pressed` = `#000000db`
   - `Neutral`/`Neutral-Alpha` point to `Gray`/`Gray-Alpha`.
3. **Semantic:** `figma/semantic.{light,dark}.dtcg.json`. These 44 keys reference Brand, with the same steps in light and dark unless noted:

   | Group | Keys → step |
   |---|---|
   | Content/Accent | `Strongest` → 12, `Base` → 11, `Light` → 10 |
   | Content/On-Accent | `Default/Hover/Pressed` → `On-Brand-Default/Hover/Pressed` |
   | Background/Accent/Solid | `Default` → 9, `Hover` → 10, `Pressed` → 11 |
   | Background/Accent/Subtle | Light: 4/5/6. Dark: Alpha 3/4/5 |
   | Background/Accent/Flat, Ghost | `Hover` → Alpha 2, `Pressed` → Alpha 3 |
   | Background/Active/Accent | `Solid` → 9, `Subtle` → Alpha 3 |
   | Background/Support/Brand | `Solid` → 9, `Subtle` → Alpha 3, `Soft` → 5, `Deep` → 12, `Pale` → Alpha 2 |
   | Border/Accent | `Solid` → 9/10/11, `Subtle` → Alpha 5/6/7 |
   | Border/Active/Accent | `Solid` → 9, `Subtle` → Alpha 6 |
   | Border/Support/Brand | `Solid` → 9, `Subtle` → Alpha 5 |
   | Focus/Accent | `Solid` → 9, `Subtle` → Alpha 6 |

   Three quirks in the Figma data:
   - `Color/Background/Canvas/Accent` points straight at global GR, skipping base: light → `GR-Light.GR.10`, dark → `GR-Dark.GR.2`.
   - In dark, `Border/Active/Accent/Subtle` points at `base-colors.Light.Brand-Alpha.6`. This is a Figma bug.
   - The `Darkmode` boolean is the only other key at the root.
4. **Component:** `figma/component.{brand,neutral}-emphasis-s1.dtcg.json`. Both files have the same keys; 49 of them differ between brand and neutral.
   - **Brand Button-Primary background** is `Background/Accent/Solid/{Default,Hover,Pressed}`, which resolves to Brand 9/10/11.
   - **Brand Button-Primary content:**
     - `Content/Default` and `Content/Hover` → `Content/On-Accent/Default` (the "text on brand" token).
     - `Content/Pressed` → `Content/Inverse/Strongest`.
   - **Neutral emphasis** swaps these: Button-Primary becomes `Neutral/Solid` with `Inverse/Strongest` text, and Button-Accent takes Accent Solid with `On-Accent`.
   - Other brand-emphasis users of Accent: Checkbox, Radio, Chip, Toggle, Tab, Segmented, Date-Picker, Bubble-Chat-You, Table-Cell, Chart.
   - Many components also bind Accent directly in both emphases (Badge/Avatar/DockIcon/PageIndicator/Progress/BottomNav Accent, Button Main/Accent). That is why the contrast audit sees the brand colour even in neutral mode.
5. **Runtime:** `src/theme/createTheme.ts` reads the generated maps. `DARK_FIXUP` swaps only `color('Color/Content/On-Accent/Default')` for `On-Brights`. It does not touch component keys that alias On-Accent, which leads to the dark/brand failures under (3).

## (2) The swap that survives regeneration

| Where you edit | Lost when |
|---|---|
| `figma/global-colors.gr.dtcg.json` | someone reruns `compact-to-dtcg.mjs` |
| `compact/05-global-colors-3.json` rows `GR-Light/GR/n`, `GR-Alpha/n` (+ `06/07` base rows for On-Brand) | someone re-dumps from Figma |
| **Override layer (recommended, prototyped)** | nothing; Figma dumps stay upstream GR |

The override layer is three files under `packages/ds/tokens/brand/`:
- `gramgolf.dtcg.json`: `global-colors.{GR-Light,GR-Dark}.{GR,GR-Alpha}.1..12` plus `base-colors.{Light,Dark}.On-Brand-*`.
- `gramgolf.semantic.light.dtcg.json` and `gramgolf.semantic.dark.dtcg.json`: optional semantic remaps.

It needs two edits in `tokens/build.mjs`:
```js
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const COLORS = (scheme) => ['global-colors.gr.dtcg.json', 'base-colors.gr.dtcg.json', `semantic.${scheme}.dtcg.json`,
  '../brand/gramgolf.dtcg.json', `../brand/gramgolf.semantic.${scheme}.dtcg.json`];
// line 49: set.source.filter((f) => existsSync(resolve(FIG, f))).map(...)   // was present.has(f), which drops ../brand
```
Style Dictionary lets the later source win, and collision warnings are already off in `build.mjs`. Every alias, including component and `primitives.colors.ts`, picks up the override. I confirmed that the output exactly matches patching the figma JSON directly. No keys change, so `keys.ts` and the types stay the same. Put both modes in one global/base file: dark semantic references `Light.Brand-Alpha.6`, so splitting by scheme leaves green behind. Add a note to `tokens/README.md`.

Candidate scale. It is OKLCH, hue 170.3, with step 9 equal to the logo colour in both modes (Radix convention):
- **GR-Light:** `#f8fffc #eefdf7 #d8fbee #c2f7e4 #a8f0d6 #8ee6c8 #6cd5b3 #38c39d #14be96 #08ad88 #03755b #06372a`
- **GR-Light-Alpha** (over white): `#00ff9207 #00e18711 #00e59027 #00de8e3d #00d38757 #00c78371 #00b67b93 #00b281c7 #00b88deb #00aa84f7 #007359fc #003225f9`
- **GR-Dark:** `#101815 #101f1a #0b2c22 #05372a #024333 #00503e #03614b #037b60 #14be96 #4dd5ae #67ddb9 #c9f5e5`
- **GR-Dark-Alpha:** `#aaffdf18 #84ffd61f #40ffc524 #17ffc337 #08ffc243 #00ffc650 #08ffc561 #06ffc77b #1bffc9be #5cffd0d5 #77ffd5dd #d1ffeef5`
  - These are computed over black, then step 3 was lowered by hand. Computing them over `#111`/`#171717` gave near-opaque mid steps, because teal's red channel is about 0.
- **On-Brand:**
  - Light: `Default/Hover` = `#0b2230`, `Pressed` = `#ffffff`. Pressed background is step 11 `#03755b`, where white gives 5.6 and navy only 2.88.
  - Dark: all three = `#0b2230`.
- **Semantic remap:** `Color.Content.Accent.Light` → `{base-colors.<Mode>.Brand.11}`. Step 10 cannot be both the navy-text hover fill and readable accent text on white (2.86). The remap fixes Chip Advanced, Chip pressed and DockIcon Subtle, because component aliases resolve through it.

What the tests do:
- **`figmaParity.test.ts`:** stays green. It compares token names only.
- **`createTheme.test.ts`:** one assertion breaks, on line 27 of the test (`emphasis:'brand'` → `'#1b795c'`). Change it to `'#14be96'`.
- **`contrast.test.ts`:** fails, which is correct; it is the real guard.
  - With On-Brand still white it reports 15 unknown pairs, including Button Main/Accent, Badge, Tooltip and Avatar at 2.38.
  - With the full override, these are left:

    | Mode | Remaining pairs |
    |---|---|
    | Light | PageIndicator Accent on 2.38 (vs canvas); Progress Accent fill vs track 1.98; Toggle on bar vs canvas 2.38; Toggle on dot vs bar 2.38; BottomNav `Accent-Solid` on label 2.18 |
    | Dark | Toggle on dot vs bar 2.28 |

  - The BottomNav label is bound to `Content/Inverse/Strongest` in `src/ui/BottomNavigation/bottomNavigationStyles.ts:19`. Switch it to `Content/On-Accent/Default` (a brand fixup), and check parity afterwards.
  - The rest are inherent to a light brand fill (2.38:1 on white). Either add them to `KNOWN_DESIGN` with a written reason (they are shape/track elements), or point them at Brand 11 through a theme fixup.
- **Hole in the audit:** `evaluate()` calls `createTheme({ scheme })`, so brand emphasis is never tested. Make it loop `emphasis: ['neutral','brand']`; I prototyped this. On the current GR tokens, dark/brand already fails: Button Main/Primary 1.56, Checkbox check 1.41, Toggle 1.49. The navy On-Brand fixes these.
- **Cleanup once navy is in:** remove the `DARK_FIXUP` entry for `'Color/Content/On-Accent/Default'` and its comments in `createTheme.ts:36-41` and `dockIconStyles.ts:26`. Otherwise dark mode shows `#000000db` instead of navy.

## (3) Text on step 9

| Pair | Ratio |
|---|---|
| white / #14BE96 | 2.38 (fails AA everywhere, including 3:1 large text) |
| navy #0B2230 / #14BE96 | **6.87** (AA normal text) |
| navy / step 10 #08ad88 | 5.71 |
| #14BE96 / white canvas (non-text) | 2.38 (< 3:1, WCAG 1.4.11) |
| #14BE96 / dark canvas #171717 | 7.54 |

Recommendation: keep the exact logo colour as step 9 and put navy on it. That needs no change to Figma names. Use white only on the pressed state (step 11).

The alternative is a darker step 9 (around `#0a7d62`, white 5.09) with #14BE96 moved to step 8 for illustration. That loses brand fidelity.

Either way, a focus ring or thin solid border in step 9 on white sits at 2.38. Consider a fixup that sends `Focus/Accent/Solid` to Brand 11.

## (4) Navy-tinted neutral: not now

`Neutral` is `Gray` through base-colors. The semantic files reference Neutral about 92 times (light) and 103 times (dark), and the base layer about 48 times; `Content/Neutral/Strongest` (`#1a1a1a`) and Inverse are among them.

Tinting would mean overriding 96 values (`Gray` and `Gray-Alpha` × 12 steps × 2 modes) in the same override file. Two `#1a1a1a` assertions in `createTheme.test.ts` would break (the Strongest key and neutral Button-Primary). Borderline pairs such as `Button Main/Secondary pressed` (4.26) would move.

Raw-hex keys stay grey: `On-Brights #000000db`, Overlay Black/White, and shadows `#000000`. The result would be a half-tinted UI unless those are overridden too.

A light-mode navy-tinted gray candidate is `#f9fbfd … #0d222d` (hue 235, chroma ≤ 0.035), if wanted later.

Suggested phase 2, only if a navy dark mode is wanted: override `GR-Dark.Gray` 1–8 (and Alpha) at low chroma, hue about 235. Navy as a canvas holds contrast: white on #0B2230 is 16.3.

## (5) Fonts

- **Text styles** (`figma/text-styles.dtcg.json`) use:
  - MiSans Latin Regular, Medium and Demibold.
  - IBM Plex Sans Light/Medium for `Body/Code*`. This font is not bundled; `fontFamilyFor()` returns `undefined`, so the system font is used.
- **Mapping:** `src/theme/fonts.ts` turns `'MiSans Latin'` plus a style into `MiSansLatin-<Style>` (spaces stripped).
- **Native loading:** `src/theme/fontAssets.ts` registers Regular, Medium, Demibold, Semibold and Bold from `packages/ds/assets/fonts/*.ttf`. `apps/golf/app/_layout.tsx` loads them with `useFonts(fontAssets)` behind `SplashScreen`.
- **Web/Storybook loading:** `.storybook/fonts.css` declares `@font-face` with the same family names.
- **Unused files:** Thin, ExtraLight, Light, Normal and Heavy TTFs ship in `assets/fonts/` but are never loaded.
- **Vietnamese:** I checked the cmap of `MiSansLatin-Regular.ttf`. All Vietnamese diacritics are present (ạ…ỹ, đ, ơ, ư).