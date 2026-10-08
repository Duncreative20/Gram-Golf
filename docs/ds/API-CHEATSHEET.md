# @gr/ds — API cheatsheet (đã kiểm chứng với source)

> Sinh 07/10/2026 bởi workflow đọc + kiểm chứng song song từng nhóm component. Nguồn sự thật vẫn là `packages/ds/src`; ví dụ dùng thật ở `apps/golf/app/(dev)/ds/*.tsx`. DS đổi → cập nhật file này.

## Mục lục
- [core](#nhóm-core)
- [nav](#nhóm-nav)
- [input](#nhóm-input)
- [display](#nhóm-display)
- [social](#nhóm-social)

---

<a id="nhóm-core"></a>
# Nhóm: core

# @gr/ds API cheatsheet: Screen, Text, Button, IconButton, Divider, Badge, Avatar, Card, Fade, Icon

I checked every prop, type, literal union and default in this sheet against the source in `/Users/duncreative/Coding Agent/Gram-Golf/packages/ds/src` (2026-10-07). That covers `index.ts`, `ui/Screen.tsx`, `ui/Text.tsx`, `ui/Button/{Button,IconButton,buttonStyles}.ts(x)`, `ui/Divider/*`, `ui/Badge/*`, `ui/Avatar/*`, `ui/Card/*`, `ui/Fade.tsx`, `icons/Icon.tsx`, `icons/generated.ts`, `theme/*` and `generated/*`.

To test the snippets, I put all of them in a temporary file in `apps/golf` and ran the repo's `tsc --noEmit -p apps/golf/tsconfig.json` on it. Each "this is a TS error" claim was marked with `@ts-expect-error`. The run reported no errors, so every valid snippet compiles and every claimed error really is one. I also added a deliberate error to confirm that `tsc` was checking the temp file. Both temp files are deleted.

Import everything from `'@gr/ds'`. The package entry is `packages/ds/src/index.ts`.

**What changed from the draft:**
- The full list of `t.layout` keys.
- The theme members that were missing: `t.emphasis`, `t.primitive` and `t.weight`.
- Exports that were missing: `createTheme`, `paint`, the theme types, and every generated key type.
- Content colours that were missing: Info, Placeholder, On-Accent, On-Brights, On-White-Overlay, Hyperlink and Support.
- Badge: how the × colour is actually chosen.
- Avatar: `source` is ignored for non-Photo themes.
- Fade: `#rgb` does not parse.
- Divider: you can override its a11y role.
- Icon: the set of accepted colour keys is wider than the draft said, and there are more chevron families.
- Button: the label is not clamped to one line.

---

## 0. Setup you need for everything below

```tsx
import { ThemeProvider, fontAssets, useTheme } from '@gr/ds';
// root layout (as in apps/golf/app/_layout.tsx)
const [loaded] = useFonts(fontAssets);       // expo-font; render nothing until loaded
<ThemeProvider scheme="auto">{/* app */}</ThemeProvider>
```

- **`ThemeProvider`** takes two props besides `children`:
  - `scheme?: 'auto' | 'light' | 'dark'`, default `'auto'`, which follows `useColorScheme()`.
  - `emphasis?: 'neutral' | 'brand'`, default `'neutral'`. This picks which component-colour collection is used.
- **`fontAssets`** maps 5 MiSans Latin files: Regular, Medium, Demibold, Semibold and Bold.
- **Every component on this page calls `useTheme()`.** If there is no `<ThemeProvider>` above it, it throws `useTheme: bọc app trong <ThemeProvider>`.

### What `useTheme()` returns

`useTheme()` returns `t`, of type `Theme` (`ReturnType<typeof createTheme>`). Use these token resolvers instead of raw numbers or hex.

**Colour**
- `t.color(k: ThemeLightKey)` returns a string.
  - Example: `'Color/Content/Neutral/Light'`.
  - In dark scheme a few aliases are swapped through `DARK_FIXUP`. For example, `Color/Content/On-Accent/Default` becomes On-Brights.
- `t.component(k: ComponentNeutralLightKey)` returns a string for component colour keys.
  - Prefixes: `Button-Primary/`, `Button-Accent/`, `Button-Tertiary/`, `Button-*-Overlay/`, `Input/`, `Input-Overlay/`, `Chip-Primary/`, `Chip-Secondary/`, `Tag/`, `Toggle/`, `Tab/`, `Checkbox/`, `Radio-Button/`, `Segmented-Item-*/`, `Stepper-Control/`, `Popover/`, `Container/`, `Chart/`, `Table-Cell/`, `Date-Picker-Item/`, `Bubble-Chat-You/`.
- `paint(t, k: PaintKey)` is also exported. It resolves either a `Color/...` key or a component key.

**Spacing**

`t.space(k: SpacingKey)` takes one of these keys:

| Key | Values |
|---|---|
| `Spacing/Gap/*` | `3XSmall`=2, `2XSmall`=4, `XSmall`=8, `Small`=12, `Medium`=16, `Large`=24, `XLarge`=32, `2XLarge`=40, `3XLarge`=48, `Giant`=64, `XGiant`=88, `2XGiant`=144 |
| `Spacing/Padding/*` | `3XSmall`=2, `2XSmall`=4, `XSmall`=8, `Small`=12, `Medium`=16, `Large`=20, `XLarge`=24, `2XLarge`=32, `3XLarge`=40, `4XLarge`=48 |

**Layout**

`t.layout(k: BreakpointsKey)` takes one of these keys:

| Key | Value |
|---|---|
| `Margin-Small` | 16 |
| `Margin-Comfortable` | 20 |
| `Gutter` | 12 |
| `Modal-Padding` | 16 |
| `Card-padding-medium` | 16 |
| `Card-padding-small` | 12 |
| `Card-padding-xsmall` | 8 |
| `Viewport-Width` | 390 |
| `Viewport-Height` | 844 |

**Radius**

`t.radius(k: RadiusKey)` takes:
- `Corner-Radius/{2XSmall,XSmall,Small,Base,Large,XLarge,2XLarge,3XLarge,Giant,XGiant,Rounded}`
- `Corner-Radius/Action/*`
- `Corner-Radius/Input/*`
- `Corner-Radius/Stepper-Control/*`

**Size**

`t.size(k: SizeKey)` takes:
- `Element-Size/Popular/{4XSmall,3XSmall,2XSmall,XSmall,Small,Base,Medium,Large,XLarge,2XLarge,3XLarge}`
- `Image-Size/{3XSmall,2XSmall,XSmall,Small,Medium,Large,XLarge,2XLarge,3XLarge}`
- Component sizes such as `Button/Size/*` and `Badge/Size/*`.

**Text and shadow**
- `t.text(k: TextStylesKey)` returns `{ fontFamily?, fontSize, lineHeight, letterSpacing }`.
- `t.shadow(k: EffectsKey)` returns an RN shadow style plus `elevation`. React Native only draws the first layer. The keys are:
  - `Effect/{Container,Glass,Input,Liquid-glass,Overlay,Popover}`
  - `Shadow/Action/{Basic,Tertiary}`
  - `Shadow/{Bottom,Top}/Level-{1..4}`

**Other members**
- `t.primitive(k: PrimitivesKey)` returns a raw dimension such as `gr-dm-128`. Use it only where Figma binds a primitive directly.
- `t.weight(k: WeightKey)` returns an emphasis weight, either a font weight or a border weight.
- `t.scheme` is `'light' | 'dark'`.
- `t.emphasis` is `'neutral' | 'brand'`.

### Other exports and environment notes

- **Theme exports:** `createTheme(opts: ThemeOptions)` (pure, testable outside React) and the types `Theme`, `Scheme`, `Emphasis`, `ThemeOptions`.
- **Generated key types:** `export type *` from `generated/keys`, which includes `ThemeLightKey`, `ComponentNeutralLightKey`, `TextStylesKey`, `SpacingKey`, `BreakpointsKey`, `RadiusKey`, `SizeKey`, `EffectsKey`, `PrimitivesKey` and `WeightKey`.
- **`Screen` uses `react-native-safe-area-context`.** Expo Router already supplies `SafeAreaProvider`. Outside Expo Router you have to add it yourself.
- **Peer dependencies:** `react`, `react-native`, `react-native-safe-area-context`, `react-native-svg`.
- **Prop values are verbatim Figma strings.** They are case-sensitive and include spaces, for example `"Medium (Base)"`, `"Danger Subtle"` and `"Liquid Glass"`.

---

## 1. `Screen`

There is no exported props type. The inline type is `PropsWithChildren<{ background?: ThemeLightKey; edges?: Edge[]; bottomIndicator?: boolean }>`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `background` | `ThemeLightKey` (any `'Color/...'` key) | `'Color/Background/Canvas/Alt'` | Background of the `SafeAreaView`. |
| `edges` | `Edge[]` from safe-area-context (`'top' \| 'bottom' \| 'left' \| 'right'`) | `['top','bottom']` | Safe-area insets that get applied. |
| `bottomIndicator` | `boolean` | `undefined` | Draws the Figma `System/Bottom-Indicator` bar under the content: a pill of `gr-dm-128 × gr-dm-4` (128×4; Figma is 121×4) in `Color/Background/Neutral/Subtle/Pressed`. It has padding Medium on top, XSmall below, and `Margin-Comfortable` at the sides. |
| `children` | `ReactNode` | none | Wrapped in `<View style={{flex:1}}>`. |

```tsx
<Screen>
  <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
    <Text variant="Heading/Subheading">Title</Text>
  </ScrollView>
</Screen>
```

Gotchas:
- `Screen` does not scroll. Put a `ScrollView` or `FlatList` inside it.
- It has no `style`, `padding` or `testID` prop. Every gallery pads with `t.layout('Margin-Small')` inside the ScrollView.
- **It renders React Native's own `<StatusBar>`:** `light-content` in dark scheme, `dark-content` in light. Don't add a second one, and don't add `expo-status-bar`'s either.
- On a screen with a top tab or header that draws its own inset, pass `edges={['bottom']}`.

---

## 2. `Text` (props type `DsTextProps`)

`interface DsTextProps extends TextProps` (React Native), so all RN Text props pass through: `numberOfLines`, `onPress`, `style`, `accessibilityRole`, `testID`, and so on.

| Prop | Type | Default |
|---|---|---|
| `variant` | `TextStylesKey` | `'Body/Base/Regular'` |
| `color` | `ThemeLightKey` (semantic `'Color/...'` only) | `'Color/Content/Neutral/Strongest'` |
| `style` | `StyleProp<TextStyle>` | none. Applied last as `[t.text(variant), {color}, style]`, so it overrides the variant and colour. |

All 42 `TextStylesKey` values:
- `All-Caps/M`, `All-Caps/S`
- `Body/{Base,Extra,Small,XSmall}/{Regular,Medium,DemiBold}`
- `Body/Code/{Regular,DemiBold}`
- `Button-Label/{XL,L,M,S,XS}`
- `Caption/{Regular,Medium,DemiBold}`
- `Display/{1,2,3,4}`
- `Display-Extra/{1,2,3}`
- `Heading/{1,2,3,4}`, `Heading/Subheading`
- `Label/{Large,Medium,Small}/{Medium,DemiBold}`

Content colours (all `Color/Content/...` keys that exist):
- `Neutral/{Strongest,Base,Light}`
- `Accent/{Strongest,Base,Light}`
- `{Negative,Positive,Warning,Info}/{Strongest,Base,Light}`
- `Inverse/{Strongest,Base,Light}`
- `On-Colors`, `On-Brights`, `Disabled`, `Placeholder`
- `On-Accent/{Default,Hover,Pressed}`
- `On-Dark-Overlay/{Strongest,Base,Light,Placeholder,Disabled}` and `On-White-Overlay/{same}`
- `Hyperlink/{Default,Pressed,Visited}`
- `Support/<Hue>/{Strongest,Base,Light}`. The hues are Blue, Bronze, Brown, Crimson, Cyan, Golden, Green, Indigo, Orange, Pink, Plum, Purple, Red, Teal, Violet and Yellow.

```tsx
<Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Caption</Text>
```

Gotchas:
- `color` does not accept component keys such as `'Button-Primary/Content/Default'`. That is a TS error.
- `color` does accept any `ThemeLightKey`, including `Color/Background/*` and `Color/Border/*`. TS will not stop you from using a background colour as a text colour.
- Fonts (MiSans Latin) only render correctly after `useFonts(fontAssets)` has resolved.

---

## 3. `Button` (props type `ButtonProps`)

The props are a discriminated union over `type` + `overlay` + `level`, intersected with the common props.

| Variant | `type` | `overlay` | `level` (default `'Primary'`) |
|---|---|---|---|
| Main | `'Main'` (default) or omitted | `false` or omitted | `MainLevel` = `'Primary' \| 'Accent' \| 'Secondary' \| 'Tertiary' \| 'Danger' \| 'Danger Subtle' \| 'Positive' \| 'Positive Subtle'` |
| Main-Overlay | `'Main'` or omitted | `true` | `MainOverlayLevel` = `'Primary' \| 'Accent' \| 'Tertiary'` |
| Flat | `'Flat'` | `false` or omitted | `FlatLevel` = `'Primary' \| 'Accent'` |

| Common prop | Type | Default | Required |
|---|---|---|---|
| `text` | `string` | none | **yes** |
| `size` | `ButtonSize` = `'XLarge' \| 'Large' \| 'Medium (Base)' \| 'Small' \| 'XSmall'` | `'Large'` | no |
| `leadingIcon` | `IconName` | none | no |
| `trailingIcon` | `IconName` | none | no |
| `disabled` | `boolean` | none | no |
| `onPress` | `PressableProps['onPress']` | none | no |
| `accessibilityLabel` | `string` | none (the screen reader reads `text`) | no |

Exported level and size types: `ButtonSize`, `MainLevel`, `FlatLevel`, `MainOverlayLevel`.

```tsx
<Button text="Start round" leadingIcon="plus-line" onPress={() => {}} />
<Button size="Medium (Base)" level="Tertiary" text="Cancel" />
<Button type="Flat" level="Accent" text="See all" trailingIcon="chevron-right-line-medium" />
<View style={darkBox}><Button overlay level="Primary" text="Retake" /></View>
```

Gotchas:
- **The medium size is `"Medium (Base)"`, not `"Medium"`.** `size="Medium"` is a TS error. `IconButton` is the opposite: it uses `'Medium'`.
- **Some combinations are TS errors:**
  - `type="Flat"` with `level="Danger"` (or any level other than Primary/Accent).
  - `type="Flat"` together with `overlay`.
  - `overlay` with `level="Secondary"`.
- Any invalid level that slips past TS, for example through a cast, throws at runtime: `Button: Level "X" không có trong set <kind>`.
- **There is no `style`, `testID`, `loading` or `fullWidth` prop.** Passing `style` is a TS error.
  - Width comes from the parent. In a column with the default `alignItems: 'stretch'` the button fills the width. In a row it hugs its content. For full width inside a row, wrap it in `<View style={{flex:1}}>`.
- **The label has no `numberOfLines`.** Long text wraps inside the fixed `Button/Size/*` height. Keep labels short.
- **Overlay buttons need a dark background, whatever the scheme.** Their content uses On-Dark-Overlay tokens.
  - The gallery wraps them in `darkDemo(t)` from `apps/golf/lib/demo.ts`, which is app code, not DS.
  - `darkDemo(t)` returns `backgroundColor: t.color(t.scheme==='dark' ? 'Color/Background/Inverse/Solid/Default' : 'Color/Background/Neutral/Solid/Default')`, plus padding Medium and radius Large.
  - Over photos or video these buttons are fine.
- `disabled` drops the shadow and switches to the disabled palette. Flat/Primary keeps its Flat background when disabled, as in Figma.
- There are no Hover/Focused states (touch only).

---

## 4. `IconButton` (props type `IconButtonProps`)

Same union shape as `Button`, with different level sets:

| Variant | `type` | `overlay` | `level` (default `'Primary'`) |
|---|---|---|---|
| Icon-Main | `'Main'` or omitted | `false` or omitted | `IconMainLevel` = `'Primary' \| 'Accent' \| 'Secondary' \| 'Tertiary' \| 'Danger' \| 'Danger Secondary' \| 'Positive' \| 'Positive Secondary'` |
| Icon-Main-Overlay | `'Main'` or omitted | `true` | `IconMainOverlayLevel` = `'Primary' \| 'Accent' \| 'Liquid Glass'` |
| Icon-Flat | `'Flat'` | `false` or omitted | `IconFlatLevel` = `'Primary' \| 'Secondary' \| 'Accent' \| 'Danger' \| 'Positive' \| 'Overlay'` |

| Prop | Type | Default | Required |
|---|---|---|---|
| `icon` | `IconName` | none | **yes** |
| `accessibilityLabel` | `string` | none | **yes**. Omitting it is a TS error. |
| `size` | `IconButtonSize` = `'XLarge' \| 'Large' \| 'Medium' \| 'Small' \| 'XSmall' \| '2XSmall'` | `'Large'` | no |
| `disabled` | `boolean` | none | no |
| `onPress` | `PressableProps['onPress']` | none | no |

Exported types: `IconButtonSize`, `IconMainLevel`, `IconFlatLevel`, `IconMainOverlayLevel`.

```tsx
<IconButton icon="heart-line" accessibilityLabel="Like" />
<IconButton type="Flat" level="Secondary" size="Small" icon="dots-horizontal-line" accessibilityLabel="More" />
<View style={darkBox}><IconButton overlay level="Liquid Glass" icon="share-01-line" accessibilityLabel="Share" /></View>
```

Gotchas:
- **The level names differ from `Button`.** IconButton uses `'Danger Secondary'` and `'Positive Secondary'`; Button uses `'Danger Subtle'` and `'Positive Subtle'`.
- **Sizes differ too.** IconButton has `'Medium'` and `'2XSmall'`; `'Medium (Base)'` is a TS error here.
- **Some levels need a dark background:**
  - Every `overlay` level.
  - `type="Flat" level="Overlay"`, because its content is `Color/Content/Inverse/Strongest`, which is white in light scheme.
- `'Liquid Glass'` currently renders with the Primary-Overlay background and content, but with no blur, no border and no shadow.
- It is always a perfect circle: width equals height, from `Button/Size/*` (XLarge 64, Large 56, Medium 48, Small 40, XSmall 32, 2XSmall 28). Radius is `Rounded`.
- Icon size:
  - `Element-Size/Popular/Base` for Large, Medium and Small.
  - `Large` for XLarge.
  - `Small` for XSmall.
  - `XSmall` for 2XSmall.
- There is no `style` or `testID` prop. Passing `style` is a TS error.

---

## 5. `Divider` (props type `DividerProps`)

`interface DividerProps extends ViewProps`, so `style`, `testID` and the rest pass through. `style` is merged last.

| Prop | Type | Default |
|---|---|---|
| `color` | `DividerColor` = `'Default' \| 'Medium' \| 'High'` | `'Default'` |
| `direction` | `DividerDirection` = `'Horizontal' \| 'Vertical'` | `'Horizontal'` |

```tsx
<Divider />
<View style={{ flexDirection: 'row', height: 24 }}><Divider direction="Vertical" color="Medium" /></View>
```

Gotchas:
- It is 1px with `alignSelf: 'stretch'`.
  - A Horizontal divider needs a column parent. In a row parent it gets 0 width.
  - A Vertical divider needs a row parent with a defined height or stretch. In a column parent it gets 0 height.
- `color` is a Figma enum, not a colour token. It maps to these border tokens:
  - Horizontal: `Default` uses `Color/Border/Neutral/Pale/Default`, `Medium` uses `Subtle/Default`, and `High` uses `Solid/Default`.
  - Vertical: `Default` and `Medium` both use `Subtle/Default`, and `High` uses `Solid/Default`. This matches Figma.
- `accessibilityRole="none"` is set before `{...rest}`, so a caller can override it.

---

## 6. `Badge` (props type `BadgeProps`)

| Prop | Type | Default | Required |
|---|---|---|---|
| `text` | `string` | none | **yes** |
| `size` | `BadgeSize` = `'Medium' \| 'Small' \| 'XSmall'` | `'Small'` | no |
| `theme` | `BadgeTheme` = `'Accent' \| 'Neutral' \| 'Yellow' \| 'Red' \| 'Green' \| 'Inverse' \| 'On-Color' \| 'Orange' \| 'Crimson' \| 'Pink' \| 'Plum' \| 'Purple' \| 'Violet' \| 'Indigo' \| 'Blue' \| 'Cyan' \| 'Teal' \| 'Brown'` | `'Neutral'` | no |
| `background` | `BadgeBackground` = `'Solid' \| 'Subtle'` | `'Subtle'` | no |
| `leadingIcon` | `IconName` | none | no |
| `onRemove` | `() => void` | none | no. When present it shows an `x-small-line` × button. |

```tsx
<Badge text="Pro" theme="Accent" background="Solid" leadingIcon="check-line" />
<Badge text="Driver" onRemove={() => {}} />
```

Gotchas:
- **The badge itself is not pressable.** Only the × is. For tappable pills, use `Chip` or `Tag`; both have `onPress`.
- **The × has a hard-coded English label, `"Remove"`, that you cannot override.** Avoid `onRemove` where a localised a11y label matters. Its `hitSlop` is `Spacing/Gap/XSmall`.
- **The × is drawn in the text colour (`contentColor`).**
  - `badgeStyles` also computes a Figma-parity `removeColor`: Neutral/Light for Subtle and Accent/Light for Accent Subtle.
  - `Badge.tsx` never reads `removeColor`, so it currently has no effect.
- **The theme name `'On-Color'` has a hyphen.** It is a white pill meant to sit on coloured or photo backgrounds.
- For `'Inverse'` and `'On-Color'`, Subtle renders the same as Solid.
- Accent Subtle and Yellow Subtle have a 1px border.
- Label text styles:
  - Medium uses `Body/Base/DemiBold`.
  - Small uses `Body/XSmall/DemiBold`.
  - XSmall uses `Caption/DemiBold`.
- The text is single-line (`numberOfLines={1}`) and the badge uses `alignSelf: 'flex-start'`, so it never stretches.
- There is no `style` prop. Passing one is a TS error.

---

## 7. `Avatar` (props type `AvatarProps`)

| Prop | Type | Default |
|---|---|---|
| `size` | `AvatarSize` = `'3XLarge' \| '2XLarge' \| 'XLarge' \| 'Large' \| 'Medium' \| 'Small' \| 'XSmall' \| '2XSmall'` | `'Medium'` |
| `shape` | `AvatarShape` = `'Circle' \| 'Square'` | `'Circle'` |
| `theme` | `AvatarTheme` = `'Photo' \| 'Accent' \| 'Neutral' \| 'Yellow' \| 'Orange' \| 'Red' \| 'Crimson' \| 'Pink' \| 'Plum' \| 'Purple' \| 'Violet' \| 'Indigo' \| 'Blue' \| 'Cyan' \| 'Teal' \| 'Green' \| 'Brown'` | `'Photo'` |
| `background` | `AvatarBackground` = `'Solid' \| 'Subtle'` | `'Subtle'` |
| `source` | `ImageSourcePropType` | none |
| `initials` | `string` | none |
| `status` | `boolean` | none. When true, draws a green online dot (`Positive/Solid`, with an Inverse border) at the bottom-right. |
| `accessibilityLabel` | `string` | none |

No prop is required. The dimension comes from `Image-Size/<size>`.

```tsx
<Avatar source={{ uri: user.avatarUrl }} status accessibilityLabel="Minh" />
<Avatar theme="Accent" background="Solid" initials="VA" size="Large" />
```

Gotchas:
- **`theme` defaults to `'Photo'`, but if there is no `source` it silently falls back to `'Neutral'`.** It then renders `initials`, or an empty circle if there are none. Always pass `initials` as a fallback when a photo URL may be missing.
- **The image shows only when `theme` is `'Photo'` and `source` is set.**
  - With `theme='Photo'` and a `source`, `initials` is ignored.
  - With any colour theme, `source` is ignored and the initials are shown.
- **Without `accessibilityLabel`, the avatar is hidden from the screen reader** (decorative). With it, the outer view is `accessible`, its role is `image`, and the label is set.
- `resizeMode="cover"`.
- Initials avatars get an `Effect/Overlay` shadow; photo avatars do not.
- Square radius depends on size:
  - 3XLarge uses `3XLarge`.
  - 2XLarge uses `XLarge`.
  - XLarge uses `Large`.
  - Large and Medium use `Base`.
  - Small uses `Small`.
  - XSmall and 2XSmall use `XSmall`.
- There is no `onPress` and no `style` prop. Both are TS errors. Wrap the avatar in a `Pressable` if you need it tappable.
- `nameInitials(name)` (cùng file `ui/Avatar/Avatar.tsx`): chữ tắt 2 chữ — chữ đầu của 2 từ cuối, in hoa ("HLV Đỗ Minh Tuấn" → "MT"), cùng luật `initials()` của app. Identity / ShareSheet / CommentItem dùng (trước 2026-10-08 là `name.slice(0, 1)` → mọi HLV hiện "H").
- **For stacks, use `AvatarGroup`, which is exported from `ui/DockIcon/DockIcon`.** Its props are:
  - `avatars: Pick<AvatarProps,'source'|'initials'|'theme'|'accessibilityLabel'>[]`
  - `size?: AvatarGroupSize`, default `'Medium'`
  - `background?: 'Subtle' | 'Solid'`
  - `max?: number`, default 5. Avatars past `max` are grouped into a "+N" bubble.

---

## 8. `Card` (props type `CardProps`)

| Prop | Type | Default |
|---|---|---|
| `theme` | `CardTheme` = `'Default' \| 'Pale' \| 'Border' \| 'Shadow' \| 'Semi-Pale'` | `'Default'` |
| `spacing` | `CardSpacing` = `'Medium' \| 'Small' \| 'Xsmall'` | `'Medium'` |
| `onPress` | `() => void` | none. When present the whole card becomes a `Pressable` with `accessibilityRole="button"` (Figma Active=True). Without it the card is a plain `View`. |
| `subActionIcon` | `IconName` | none. When present it shows a Flat/Secondary/Small `IconButton` at the top-right. |
| `onSubAction` | `() => void` | none |
| `subActionLabel` | `string` | `'More'`. This is the a11y label of the sub-action. |
| `style` | `StyleProp<ViewStyle>` | none. It is merged after the computed style. |
| `children` | `ReactNode` | none |

```tsx
<Card theme="Border" spacing="Small" subActionIcon="dots-horizontal-line" onSubAction={() => {}}>
  <Text variant="Body/Base/Regular">Border · Sub-Action</Text>
</Card>
<Card theme="Shadow" onPress={() => {}}><Text variant="Body/Base/Regular">Shadow · Active</Text></Card>
```

Gotchas:
- **The spacing value is `'Xsmall'`, with a lowercase s.** It is not `'XSmall'`, which is a TS error.
- Padding comes from `t.layout`: `Card-padding-medium` (16), `-small` (12) or `-xsmall` (8).
- Radius is `Corner-Radius/2XLarge` for Medium and `Corner-Radius/Large` for Small and Xsmall.
- **The sub-action is absolutely positioned at `top: pad, right: pad` and does not reserve space.** Leave right padding in your children so text doesn't run under it.
- **There is no `accessibilityLabel` prop.** That is a TS error. A pressable card reads its children's text.
- **When both `onPress` and `subActionIcon` are set**, the card is marked `accessible={false}` so the inner button stays reachable. The card's own tap then has no a11y element of its own.
- When pressed, the background switches to `Color/Background/Neutral/Flat/Hover`.
- Backgrounds:
  - Default, Border and Shadow use `Color/Background/Surface/Default`.
  - Pale and Semi-Pale use `Color/Background/Support/Neutral/Pale`.
- Border and Semi-Pale add a 1px `Color/Border/Neutral/Pale/Default` border.
- Shadows:
  - Shadow uses `Shadow/Bottom/Level-1`.
  - Pale and Semi-Pale use `Effect/Overlay`.

---

## 9. `Fade` (props type `FadeProps`)

| Prop | Type | Required | Notes |
|---|---|---|---|
| `color` | `string` | **yes** | A resolved hex string, **not a token name**. Only `#rrggbb` or `#rrggbbaa` is parsed. Alpha in the hex is kept as the stop opacity. |
| `side` | `'top' \| 'bottom'` | **yes** | The opaque edge. `'bottom'` is dark at the bottom fading upward (the usual scrim under a caption). |
| `mid` | `string` | no | Optional colour stop at 50%, for a two-step scrim. Parsed the same way as `color`. |

```tsx
<View style={{ height: 120, overflow: 'hidden' }}>
  <Image ... style={StyleSheet.absoluteFill} />
  <Fade side="bottom" color={t.color('Color/Background/Black-Overlay/Hover')} mid={t.color('Color/Background/Black-Overlay/Default')} />
  {/* caption text here, rendered after Fade so it sits on top */}
</View>
```

Gotchas:
- **`color` is typed as a plain `string`, so passing a token name compiles but renders wrong.** Always wrap it in `t.color(...)`.
- **`#rgb` and `rgba()` are not parsed, even though the source comment mentions `#rgb`.** They pass through as the stop colour with opacity 1, so you lose the alpha.
- **It fills its parent with an absolute layer (inset 0).** It is an SVG `LinearGradient`. The parent needs a real size. Render the content that should sit above it after the `Fade`.
- `pointerEvents="none"`, so it never blocks touches.
- For text over photos, use the `Black-Overlay/*` tokens. They are the same in both schemes: Default `#01010148`, Hover `#000000cc`, Pressed `#000000e5`. `StoryViewer` and `storyStyles` use Hover as `color` and Default as `mid`.
- Pair it with `Color/Content/On-Dark-Overlay/*` text.

---

## 10. `Icon` (props type `IconProps`) plus `ICONS` and `IconName`

| Prop | Type | Default | Required |
|---|---|---|---|
| `name` | `IconName` (one of 1,230 keys of `ICONS`) | none | **yes** |
| `size` | `number` (px) | `24` | no |
| `color` | `PaintKey` = `ThemeLightKey \| ComponentNeutralLightKey` | `'Color/Content/Neutral/Strongest'` | no |

`PaintKey` accepts `'Color/...'` keys and every component key family listed in §0, not only `Button-*`.

```tsx
<Icon name="flag-01-line" size={20} color="Color/Content/Accent/Base" />
```

Gotchas:
- **Names are the Figma names with the `icon-` prefix removed.**
  - Most come in `-line` / `-solid` pairs: 694 `-line` and 530 `-solid`.
  - Some have numbered variants (`home-01-line`); some don't (`heart-line`).
  - Two names follow neither pattern: `Golf-Relax` and `shopping-cart-line-2`.
- **Chevron and search naming is inconsistent:**
  - `chevron-left-line-medium`, `chevron-right-line-medium`, `chevron-left-line-small` and `chevron-right-line-small`.
  - `chevron-down-line` and `chevron-up-line`, which have no size suffix.
  - Numbered and double variants also exist: `chevron-{left,right,up,down}-01-line` and `chevron-{left,right,up,down}-double-line`.
  - Search icons: `search-small-line`, `search-medium-line`, `search-large-line`.
- **`Icon` has no a11y props, no `style` and no `testID`, and it is decorative.** Passing `accessibilityLabel` is a TS error. For tappable icons, use `IconButton`, which requires a label.
- It renders `ICONS[name]` through `SvgXml`. The source SVGs are drawn on a 20px viewBox and scale to `size`.
- Colour goes through `currentColor`, resolved by `paint(t, color)`.
- **`"Golf-Relax"` (capitalised) is the brand logo glyph.**
- **There are no icons for QR, trophy, award, medal, cup, crown, golf ball or golf club.** For example, `name="qr-code-line"` is a TS error. Use these instead:
  - For QR: `scan-line`.
  - For achievements: `star-01-line`, `stars-01-line` or `check-verified-line`.
  - For targets and flags: `target-01/03/04/05-line` or `flag-01/02/03-line`.

### Icon names that exist, grouped for a golf app

I checked each name below against `icons/generated.ts`. All of them exist.

| Need | Names |
|---|---|
| Home / nav | `home-01-line`, `home-01-solid`, `home-02-line`, `menu-01-line`, `dots-horizontal-line`, `dots-vertical-line`, `dots-grid-line` |
| Charts / stats | `bar-chart-01-line`, `bar-chart-square-02-line`, `line-chart-up-line`, `trend-up-01-line`, `trend-down-01-line`, `pie-chart-01-line`, `presentation-chart-line`, `speedometer-02-line`, `activity-line`, `activity-heart-line` |
| Video / media | `video-line`, `video-solid`, `video-recorder-line`, `play-line`, `play-solid`, `play-circle-line`, `pause-solid`, `film-01-line`, `clapperboard-line`, `recording-01-line` |
| Camera / image | `camera-line`, `camera-solid`, `camera-plus-line`, `camera-off-line`, `image-line`, `image-plus-line`, `image-user-line` |
| Upload / download | `upload-01-line`, `upload-cloud-line`, `download-01-line`, `download-cloud-01-line` |
| QR / scan | `scan-line` (there is no `qr-*`) |
| Users | `user-line`, `user-solid`, `user-circle-line`, `user-plus-line`, `user-check-line`, `users-line`, `users-solid` |
| Notifications / settings | `bell-01-line`, `bell-01-solid`, `bell-off-line`, `settings-01-line`, `settings-02-line`, `sliders-01-line` |
| Social | `heart-line`, `heart-solid`, `message-circle-line`, `message-chat-circle-line`, `share-01-line`, `send-01-line`, `paper-plane-line`, `bookmark-line`, `bookmark-solid`, `thumbs-up-line` |
| CRUD | `plus-line`, `plus-circle-line`, `trash-line`, `edit-01-line`, `edit-02-line`, `pencil-line`, `copy-line` |
| Search / filter | `search-medium-line`, `search-small-line`, `search-large-line`, `filter-lines-line`, `filter-funnel-line` |
| Chevrons / arrows | `chevron-left-line-medium`, `chevron-right-line-medium`, `chevron-left-line-small`, `chevron-right-line-small`, `chevron-down-line`, `chevron-up-line`, `arrow-left-line`, `arrow-right-line` |
| Status | `check-line`, `check-circle-line`, `check-circle-solid`, `check-verified-line`, `x-medium-line`, `x-small-line`, `x-large-line`, `x-circle-line`, `info-circle-line`, `alert-circle-line`, `alert-triangle-line`, `help-circle-line` |
| Auth / contact | `lock-01-line`, `lock-unlocked-01-line`, `eye-line`, `eye-off-line`, `mail-01-line`, `phone-line`, `log-in-01-line`, `log-out-01-line`, `face-id-line`, `fingerprint-line` |
| Date / time | `calendar-line`, `calendar-check-line`, `calendar-plus-line`, `clock-line`, `clock-stopwatch-line`, `hourglass-line` |
| Golf-ish | `flag-01-line`, `flag-01-solid`, `flag-02-line`, `target-04-line`, `target-01-line`, `star-01-line`, `star-01-solid`, `stars-01-line`, `marker-pin-01-line`, `map-line`, `route-line`, `navigation-pointer-01-line`, `wind-01-line`, `sun-line`, `cloud-sun-01-line`, `thermometer-01-line`, `Golf-Relax` (logo) |
| Files | `file-doc-line`, `file-chart-line`, `file-plus-line`, `attachment-01-line`, `link-01-line`, `refresh-cw-01-line`, `globe-01-line` |

To browse every icon, open the gallery route `/(dev)/ds/icon` (`apps/golf/app/(dev)/ds/icon.tsx`).

---

## Cross-cutting rules for screen builders

1. **Use tokens for all spacing, colour and text.** Use `t.space`, `t.layout`, `t.color` and `Text variant`. The galleries never use raw numbers, apart from `Icon size={20|24}`.
2. **Overlay variants need a dark or photo background, whatever the scheme.** That covers:
   - Button `overlay`.
   - IconButton `overlay` and Flat `Overlay`.
   - Badge `On-Color`.
   - `Fade`.
   - On-Dark-Overlay text.
3. **Only `Text`, `Divider` and `Card` accept `style`.**
   - `Text` and `Divider` pass all RN props through; `Card` has an explicit `style`.
   - Button, IconButton, Badge, Avatar, Icon and Screen have no `style`. Position and size them from a wrapping `View`.
4. **A11y labels:**
   - Required on `IconButton`.
   - Optional on `Button`; it falls back to `text`.
   - Optional on `Avatar`; without one it is hidden from the screen reader.
   - `Card` has no label prop; only the sub-action has one, through `subActionLabel`.
   - `Badge`'s × label is hard-coded to "Remove".
   - `Icon` is always decorative.
5. **None of these components keep state of their own.** Selected, liked and similar state belongs to the screen. Pass handlers through `onPress`, `onRemove` and `onSubAction`.

---

<a id="nhóm-nav"></a>
# Nhóm: nav

# @gr/ds API cheatsheet: Navigation, Tabs, Indicators, Dock-Icon family

I checked this against the source in `/Users/duncreative/Coding Agent/Gram-Golf/packages/ds/src/ui/{TopNavigation,BottomNavigation,TabBar,Segmented,PageIndicator,Navigation,DockIcon}/*`, the export list in `packages/ds/src/index.ts`, the token tables in `packages/ds/src/generated/theme.{light,dark}.ts`, and the gallery pages in `apps/golf/app/(dev)/ds/{topnav,bottomnav,tab,segmented,pageindicator,progress,misc}.tsx`.

How it was checked:
- `tsc --noEmit` on `packages/ds` passes (exit 0).
- Every snippet below was put in one scratch file with the import lists exactly as written here and type-checked against the current source (strict mode, `noUncheckedIndexedAccess`). It passes with exit 0.
- Two `@ts-expect-error` checks confirm what the types enforce: a numeric `noti` and a `TopNavAction` without `accessibilityLabel` are both rejected.
- Every icon name used below exists in `ICONS`.

## Rules that apply to every component here

1. **Import from `'@gr/ds'`.** Every component and prop-type union below is re-exported from the package root (`packages/ds/src/index.ts`), so never deep-import. The package root does **not** export the style helpers (`tabItemStyles`, `DOCK_SIZE`, etc.) or the internal type `TabIcon`.
2. **Put a `<ThemeProvider>` above them.** Every component calls `useTheme()`. Without a provider it throws `useTheme: bọc app trong <ThemeProvider>`.
   - `ThemeProvider` props: `scheme?: 'auto' | 'light' | 'dark'` (default `'auto'`) and `emphasis?: 'neutral' | 'brand'` (default `'neutral'`).
   - `<Screen>` renders `SafeAreaView` from `react-native-safe-area-context`, so it also needs a `SafeAreaProvider`. Its `edges` default to `['top','bottom']`.
3. **None of these components accepts `style`, `testID` or a ref.** They are plain function components with no `forwardRef`. To control margin, width or position, wrap the component in a `View`.
   - **TabBar trap:** `TabBar` has a prop called `style`, but it holds the Figma variant (`'Indicator' | 'Subtle' | 'Top'`), not a React Native style.
4. **Variant values are verbatim Figma strings and are case-sensitive.** Examples: `'Package-Select'`, `'Floating-Glass'`, `'Neutral-Surface'`. Button size is `"Medium (Base)"`. No component in this sheet exposes that size; `EmptyState` uses it internally.
5. **Value-driven components are controlled only.** `TabBar`, `Segmented`, `BottomNavigation`, `Pagination` and `ColorSelector` keep no internal state: if `onChange`/`onPress` doesn't update the value, nothing moves. `PageIndicator` and `Stepper` are display-only and just render the `active`/`current` you pass in.
6. **Icon props are typed as `IconName`.** This is a generated union exported from `@gr/ds`; `ICONS` holds the runtime map. An unknown icon name is a type error.
7. **Only two Overlay variants use fixed dark-background tokens.**
   - **`TopNavigation surface="Overlay"`** uses fixed `On-Dark-Overlay/*` text tokens and overlay buttons.
   - **`PageIndicator state="Overlay"`** uses `On-Dark-Overlay/Strongest` for the active dot and `Background/White-Disabled` for the others.
   - Those tokens have the same value in light and dark, so put these two variants on a dark background. The galleries use this app-side helper:
     ```ts
     // apps/golf/lib/demo.ts (app-side helper, not exported by @gr/ds)
     const darkDemo = (t: Theme) => ({
       backgroundColor: t.color(t.scheme === 'dark' ? 'Color/Background/Inverse/Solid/Default' : 'Color/Background/Neutral/Solid/Default'),
       padding: t.space('Spacing/Padding/Medium'),
       borderRadius: t.radius('Corner-Radius/Large'),
     });
     ```
   - **`BottomNavigation theme="Overlay"` is different.** It uses tokens that change with the colour scheme:
     - Unselected items use `Content/Accent/Strongest`: `#0e4031` (dark green) in light mode, `#f2fcf9` in dark mode.
     - The selected item uses `Surface/Default`, and the bar uses `Surface/Glass`.
     - Its gallery background is `Background/Inverse/Solid/Default`, which is **white (`#ffffff`) in light mode** and `#171717` in dark mode. So it is not a fixed dark background.
     - Do not put this variant on a photo or a fixed dark background in light mode: the dark-green labels become unreadable.
8. **Built-in accessibility strings are Vietnamese and hard-coded.** For example: `PageIndicator` uses `"Trang 2 / 5"`, `Pagination` uses `"Trang trước"`/`"Trang sau"`, and `Stepper` uses `"Bước 2 / 3"`. You cannot override them.

---

## 1. `TopNavigation`

Source: `ui/TopNavigation/TopNavigation.tsx` and `topNavigationStyles.ts`. Figma: `❖ Top-Navigations (Mobile)`.

```ts
import { TopNavigation, type TopNavigationProps, type TopNavAction,
  type TopNavType, type TopNavSurface, type TopNavAlign, type TopNavTitleSize } from '@gr/ds';
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `'Title' \| 'Search' \| 'Package-Select'` | `'Title'` | `'Title'` renders the heading and subtitle. `'Search'` and `'Package-Select'` replace the title with a full-width trigger `Button` (`level="Tertiary" size="XLarge"`). `'Package-Select'` adds a trailing `chevron-down-line` icon. |
| `surface` | `'Default' \| 'Overlay'` | `'Default'` | `'Overlay'` switches several parts to overlay styling: heading → `On-Dark-Overlay/Strongest`, subtitle → `On-Dark-Overlay/Base`, actions → `IconButton overlay level="Primary"`, trigger → `Button overlay level="Tertiary"`. Use it only on a dark background. |
| `heading` | `string` | none | Used only when `type="Title"`. Limited to 1 line. Not rendered when empty. |
| `subtitle` | `string` | none | Used only when `type="Title"`. Limited to 1 line. Not rendered when empty. |
| `size` | `'Large' \| 'Medium' \| 'Small' \| 'XSmall'` | `'Medium'` | Title-Block size. Heading text style: Large `Heading/3`, Medium `Heading/Subheading`, Small `Body/Base/DemiBold`, XSmall `Body/XSmall/DemiBold`. Subtitle text style: Large `Body/Base/Regular`, all others `Body/XSmall/Regular`. |
| `align` | `'Center' \| 'Left'` | `'Center'` | Title alignment. |
| `leadingAction` | `TopNavAction` | none | Usually a back button. |
| `trailingActions` | `TopNavAction[]` | `[]` | |
| `divider` | `boolean` | none (off) | Adds a 1px `Border/Neutral/Pale/Default` line under the bar. |
| `triggerText` | `string` | none (rendered as `''`) | Label of the Search/Package-Select trigger. |
| `triggerIcon` | `IconName` | none | Leading icon of the trigger. |
| `onTriggerPress` | `() => void` | none | |

`TopNavAction` is `{ icon: IconName; accessibilityLabel: string /* REQUIRED */; onPress?: () => void }`. Each action renders as `IconButton size="Small" level="Tertiary"`, or as `IconButton overlay level="Primary" size="Small"` when `surface="Overlay"`.

**Gotchas**
- No prop is required, but each action must have an `accessibilityLabel`; the type enforces it.
- When `type` is `'Search'` or `'Package-Select'`, the props `heading`, `subtitle`, `size` and `align` are ignored.
- The title can drift off-centre. The leading slot is always rendered, even when empty, and the title (or trigger) has `flex: 1` between the leading and trailing slots. So `align="Center"` centres the title in the leftover space, not on the screen. If the two sides hold different numbers of actions, the title shifts.
- The bar does not handle safe-area insets. Put it inside `<Screen>`, whose `edges` default to `['top','bottom']`, or add the inset yourself.

```tsx
const back = { icon: 'chevron-left-line-medium' as const, accessibilityLabel: 'Quay lại', onPress: () => router.back() };
const more = { icon: 'dots-horizontal-line' as const, accessibilityLabel: 'Thêm' };

<TopNavigation heading="Bình luận" subtitle="128 bình luận" align="Left" leadingAction={back} trailingActions={[more]} divider />
<TopNavigation type="Search" triggerText="Tìm sân golf" triggerIcon="search-medium-line" leadingAction={back} onTriggerPress={openSearch} />
<TopNavigation type="Package-Select" triggerText="Gói Play & Stay" leadingAction={back} />
{/* Overlay: needs a dark background */}
<View style={{ backgroundColor: darkDemo(t).backgroundColor }}>
  <TopNavigation surface="Overlay" heading="Overlay" subtitle="Trên ảnh" leadingAction={back} trailingActions={[more]} />
</View>
```

---

## 2. `BottomNavigation`

Source: `ui/BottomNavigation/BottomNavigation.tsx` and `bottomNavigationStyles.ts`. Figma: `Bottom-Navigation/Mobile/Floating` and `Floating-Glass`.

```ts
import { BottomNavigation, type BottomNavigationProps, type BottomNavItem,
  type BottomNavType, type BottomNavTheme } from '@gr/ds';
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` **(required)** | `BottomNavItem[]` | none | |
| `selectedIndex` **(required)** | `number` | none | 0-based. Controlled. |
| `onChange` | `(index: number) => void` | none | Without it, taps do nothing. |
| `type` | `'Floating' \| 'Floating-Glass'` | `'Floating'` | **Currently has no visual effect.** The styles ignore this prop: both values render the same `Surface/Glass` pill with a `Shadow/Bottom/Level-2` shadow. Blur is not implemented yet (open item in the spec). |
| `theme` | `'Neutral' \| 'Accent' \| 'Neutral-Surface' \| 'Accent-Surface' \| 'Neutral-Solid' \| 'Accent-Solid' \| 'Overlay'` | `'Neutral'` | Selected-item styling. The `*-Surface`, `*-Solid` and `Overlay` themes add a `Shadow/Bottom/Level-1` shadow to the selected item. `Overlay` is described below. |

How `theme="Overlay"` is painted:
- Unselected items use `Content/Accent/Strongest`.
- The selected item has a `Surface/Default` background with `Content/Accent/Strongest` content.
- All of these tokens change with the scheme (see rule 7), so this is not a fixed dark-background variant.
- The gallery renders it with `type="Floating-Glass"` on a `Background/Inverse/Solid/Default` box. That box is white in light mode and dark in dark mode.

`BottomNavItem` fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | yes | Figma Label-Text. Text style `Label/Medium/DemiBold`, limited to 1 line. This is also the tab's accessible name, because no `accessibilityLabel` is set. |
| `icon` | `IconName` | yes | Line icon, used when the item is not selected. |
| `iconSelected` | `IconName` | no | Solid icon used when the item is selected. Falls back to `icon`. |
| `noti` | `boolean \| string` | no | `true` shows a red dot (`Background/Negative/Solid/Default`). A string such as `'3'` shows a `Badge size="XSmall" theme="Red" background="Solid"` with that text. It must be a string; a number is a type error. An empty string `''` still renders an empty badge. |

**Gotchas**
- Accessibility roles: `tablist` on the container, and `tab` with `aria-selected` on each item.
- The bar is not absolutely positioned and does not handle safe-area insets. It is a centred pill with `paddingHorizontal: Margin-Small`, so you position it at the bottom yourself.
- Items are keyed by array index.
- With 5 or more items the bar switches to a dense layout (NỢ FIGMA F55): the pill stretches to full width, items share it equally (`flex: 1`), and the gap and inner horizontal padding drop to `3XSmall`, so 5 Vietnamese labels fit at 390px. With 4 or fewer items the Figma spacing is unchanged.

```tsx
const [i, setI] = useState(0);
const items = [
  { label: 'Trang chủ', icon: 'home-02-line' as const, iconSelected: 'home-02-solid' as const },
  { label: 'Khám phá', icon: 'search-medium-line' as const },
  { label: 'Chuyến đi', icon: 'luggage-02-line' as const, iconSelected: 'luggage-02-solid' as const, noti: true },
  { label: 'Cửa hàng', icon: 'shopping-cart-line-2' as const, noti: '3' },
  { label: 'Hội viên', icon: 'user-circle-line' as const, iconSelected: 'user-circle-solid' as const },
];
<BottomNavigation items={items} selectedIndex={i} onChange={setI} theme="Neutral" />
```

---

## 3. `TabBar`

Source: `ui/TabBar/TabBar.tsx` and `tabStyles.ts`. Figma: `❖ Tab`, which covers `Tab-Bar` and `Primitives/Tab-Item`.

```ts
import { TabBar, type TabBarProps, type TabItem, type TabStyle, type TabSize } from '@gr/ds';
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` **(required)** | `TabItem[]` | none | |
| `selectedIndex` **(required)** | `number` | none | 0-based. Controlled. |
| `onChange` | `(index: number) => void` | none | |
| `style` | `'Indicator' \| 'Subtle' \| 'Top'` | `'Indicator'` | Figma variant, **not an RN style**. `Indicator` draws an underline (`Tab/Border/Selected`) under the selected tab and a bottom border on the bar. `Top` is `Indicator` with the icon above the label. `Subtle` gives pill-shaped items, a `Tab/Background/Selected` fill on the selected item, no underline and no bar border. |
| `size` | `'Medium' \| 'Small'` | `'Medium'` | |

`TabItem` fields (all optional): `label?: string`, `icon?: IconName`, `iconSelected?: IconName` (shown instead of `icon` when the tab is selected), `badge?: string`, `disabled?: boolean`.

**Gotchas**
- **Icon position:** you don't set it; the `style` prop decides. With `style="Top"`, the icon sits above the label. With any other style, the icon sits before the label when `icon` is set, and no icon is shown otherwise.
- **Badges with `style="Top"`:** the badge is pinned to the icon's top-right corner, so **an item with no `icon` shows no badge**. With the other styles, the badge appears inline after the label.
- **Badge styling:** each badge is a `Badge size="XSmall" background="Subtle"`, with `theme` `'Accent'` when the tab is selected and `'Neutral'` otherwise.
- **No scrolling:** the bar does not scroll. For `Subtle`, or for many tabs, wrap it in `<ScrollView horizontal>` as the gallery does.
- **Disabled tabs:** an item with `disabled` gets RN `disabled` plus `aria-disabled`. It can't be pressed and its content uses `Content/Disabled`.
- **Accessibility roles:** `tablist` on the bar, and `tab` with `aria-selected` on each item. Labels are limited to 1 line.

```tsx
const [i, setI] = useState(0);
const items = [
  { label: 'Bài viết', icon: 'home-03-line' as const, iconSelected: 'home-03-solid' as const },
  { label: 'Lưu', icon: 'bookmark-line' as const, iconSelected: 'bookmark-solid' as const, badge: '3' },
  { label: 'Tắt', icon: 'eye-off-line' as const, disabled: true },
];
<TabBar items={items} selectedIndex={i} onChange={setI} style="Indicator" />
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  <TabBar items={items} selectedIndex={i} onChange={setI} style="Subtle" />
</ScrollView>
```

---

## 4. `Segmented`

Source: `ui/Segmented/Segmented.tsx` and `segmentedStyles.ts`. Figma: `❖ Segmented`.

```ts
import { Segmented, type SegmentedProps, type SegmentedItem, type SegmentedLevel, type SegmentedSize } from '@gr/ds';
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` **(required)** | `SegmentedItem[]` | none | |
| `selectedIndex` **(required)** | `number` | none | 0-based. Controlled. |
| `onChange` | `(index: number) => void` | none | |
| `level` | `'Primary' \| 'Secondary'` | `'Primary'` | `Primary` puts the items on a `Surface/Default` container and uses the `Segmented-Item-Primary/*` tokens. `Secondary` uses a `Surface/Alt` container and the `Segmented-Item-Secondary/*` tokens. |
| `size` | `'Medium' \| 'Small'` | `'Medium'` | |

`SegmentedItem` fields (all optional): `label?: string`, `icon?: IconName`, `badge?: string`.

**Gotchas**
- **No `iconSelected`:** the icon stays the same when an item is selected. Items also cannot be disabled.
- **Width:** items use `flexGrow: 1, flexShrink: 1, flexBasis: 'auto'`. They share the width when the parent stretches the control, and size to their content when the parent hugs it. For a fixed width, wrap the control in a sized `View`.
- **Figma level names are swapped (debt F1 in `docs/ds/figma-debt.md`):** Figma's "Level=Secondary" uses the `Segmented-Item-Primary` tokens. The code names levels after the item tokens, so Figma's `Level=Secondary` corresponds to code `level="Primary"`, and vice versa.
- **Badge styling:** the badge theme is `Inverse` when the item is selected **and** `level="Primary"`, and `Neutral` otherwise. The badge background is `Solid` when the item is selected, and `Subtle` otherwise.
- **Accessibility roles:** `tablist` on the container, and `tab` with `aria-selected` on each item.

```tsx
const [i, setI] = useState(0);
<Segmented
  items={[{ label: 'Tất cả', badge: '12' }, { label: 'Sân golf', icon: 'globe-01-line' }, { label: 'Resort' }]}
  selectedIndex={i}
  onChange={setI}
  level="Primary"
  size="Medium"
/>
```

---

## 5. `PageIndicator`

Source: `ui/PageIndicator/PageIndicator.tsx` and `pageIndicatorStyles.ts`. Figma: `❖ Page-Navigations / Page-Indicator`.

```ts
import { PageIndicator, type PageIndicatorProps, type PageIndicatorState, type PageIndicatorSize } from '@gr/ds';
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `count` **(required)** | `number` | none | Number of dots. Figma defines Dot-4 to Dot-8; the code accepts any number. |
| `active` **(required)** | `number` | none | **0-based** index of the active dot. Not range-checked. |
| `state` | `'Neutral' \| 'Accent' \| 'Overlay'` | `'Neutral'` | `Neutral` and `Accent` use `Background/Active/{Neutral,Accent}/{Solid,Subtle}`. `Overlay` uses `On-Dark-Overlay/Strongest` for the active dot and `White-Disabled` for the others; neither changes with the scheme. Use `Overlay` on photos or dark backgrounds. |
| `size` | `'Small' \| 'Medium'` | `'Medium'` | |

**Gotchas**
- It only shows position and can't be pressed. Keep `active` in sync with your pager or carousel.
- Accessibility: role `progressbar`, label `Trang ${active+1} / ${count}`, value with min 1, max `count` and now `active+1`.

```tsx
<PageIndicator count={5} active={page} />
<View style={[darkDemo(t), { alignItems: 'center' }]}>
  <PageIndicator count={5} active={page} state="Overlay" size="Small" />
</View>
```

---

## 6. `ui/Navigation`: `Pagination`, `Breadcrumbs`, `Stepper`

All three live in `ui/Navigation/Pagination.tsx`. Their styles are in `navigationStyles.ts`.

```ts
import { Pagination, Breadcrumbs, Stepper,
  type PaginationProps, type BreadcrumbsProps, type BreadcrumbItem, type StepperProps, type StepItem,
  type PaginationTheme, type PaginationSize, type StepState } from '@gr/ds';
```

`StepState` is `'Default' | 'Focused' | 'Passed' | 'Error'`. It is exported, but it is not a prop; the stepper derives each step's state.

### 6a. `Pagination`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `page` **(required)** | `number` | none | **1-based** current page. Controlled. Not clamped to `1..count`. |
| `count` **(required)** | `number` | none | Total number of pages. |
| `onChange` **(required)** | `(page: number) => void` | none | Called with the new 1-based page from the prev/next buttons or a page button. |
| `theme` | `'Primary' \| 'Secondary' \| 'Inline'` | `'Primary'` | `Primary` shows the selected page solid (`Active/Neutral/Solid`) with inverse text. `Secondary` shows it subtle (`Active/Neutral/Subtle`). `Inline` drops the pill container's padding, background, border and shadow. Figma's `Manually` theme was dropped. |
| `size` | `'XSmall' \| 'Small'` | `'XSmall'` | Page button size: XSmall uses `Select-Item/Size/Small`, Small uses `Select-Item/Size/Medium`. |
| `window` | `number` | `5` | Maximum number of page buttons. The window slides to keep the current page in the middle, and stops sliding at the first and last pages. |

**Gotchas**
- There is no ellipsis and no jump to the first or last page.
- Prev is disabled when `page <= 1`, and next is disabled when `page >= count`.
- Prev/next are `IconButton level="Tertiary" size="XSmall"` buttons labelled "Trang trước"/"Trang sau".
- Page buttons have role `button`, with `aria-pressed` on the current page. They have no explicit accessibility label; the screen reader reads the page number.
- It aligns itself to the start of its row (`alignSelf: 'flex-start'`).

```tsx
const [page, setPage] = useState(1);
<Pagination page={page} count={12} onChange={setPage} theme="Primary" />
```

### 6b. `Breadcrumbs`

| Prop | Type | Default |
|---|---|---|
| `items` **(required)** | `BreadcrumbItem[]` | none |

`BreadcrumbItem` fields: `label: string` (required), `icon?: IconName`, `onPress?: () => void`.

- An item without `onPress` is disabled and can't be pressed. An item with `onPress` gets role `link`.
- The last item uses `Body/Base/Medium`; the others use `Body/Base/Regular`.
- Items are separated by a `chevron-right-line-medium` icon and wrap to the next line when they don't fit (`flexWrap: 'wrap'`).
- Figma shows an icon only on the first (Master) item, but the code renders an icon on any item that sets `icon`.

```tsx
<Breadcrumbs items={[{ label: 'Home', icon: 'home-03-line', onPress: goHome }, { label: 'Sân golf', onPress: goList }, { label: 'Chi tiết' }]} />
```

### 6c. `Stepper` (progress steps; not `StepperControl`)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `steps` **(required)** | `StepItem[]` | none | |
| `current` **(required)** | `number` | none | **0-based** index of the current step. |

`StepItem` fields: `title: string` (required, 1 line), `caption?: string` (up to 2 lines), `icon?: IconName`, `error?: boolean`.

Each step's state is derived like this:
- `error: true` makes the step `Error`, whatever its position. It shows an `info-octagon-solid` icon, and its connector line is red.
- A step before `current` is `Passed` and shows a `check-solid` icon.
- The step at `current` is `Focused`.
- Steps after `current` are `Default`.

`Passed` and `Error` always show their fixed icon. A `Default` or `Focused` step shows its own `icon` if it has one, and its 1-based number otherwise. A connector line follows every step except the last.

**Gotchas**
- It is display-only and can't be pressed. It lays out horizontally and stretches to fill the row; each step has `flex: 1`.
- Accessibility: role `progressbar` with label `Bước ${current+1} / ${steps.length}`. The accessibility value has min 0, max `steps.length` and now `current`. That value is 0-based even though the label is 1-based.

```tsx
<Stepper current={1} steps={[{ title: 'Chọn sân', caption: 'Đã xong' }, { title: 'Thời gian', caption: 'Đang chọn' }, { title: 'Thanh toán' }]} />
```

---

## 7. `ui/DockIcon`: `DockIcon`, `IntegrationConnector`, `ColorSelector`, `AvatarGroup`, `EmptyState`

All five live in `ui/DockIcon/DockIcon.tsx`. Their styles are in `dockIconStyles.ts`.

```ts
import { DockIcon, IntegrationConnector, ColorSelector, AvatarGroup, EmptyState,
  type DockIconProps, type IntegrationConnectorProps, type ColorSelectorProps, type AvatarGroupProps, type EmptyStateProps,
  type DockIconSize, type DockIconTheme, type DockIconBackground, type ConnectorBackground, type AvatarGroupSize } from '@gr/ds';
```

Several of these components share these unions:
- `DockIconSize`: `'XLarge' | 'Large' | 'Medium' | 'Small' | 'XSmall'`. Box sizes come from the `Image-Size/*` tokens, and icon sizes from `Element-Size/Popular/{Large,Medium,Base,Small,XSmall}`.
- `DockIconTheme`: `'Accent' | 'Neutral' | 'Inverse' | 'Pale' | 'Yellow' | 'Orange' | 'Red' | 'Crimson' | 'Pink' | 'Plum' | 'Purple' | 'Violet' | 'Indigo' | 'Blue' | 'Cyan' | 'Teal' | 'Green' | 'Brown'`. Figma's On-Color, Emoji and Golden themes were dropped.
- `DockIconBackground`: `'Solid' | 'Subtle'`.
- `ConnectorBackground`: `'Connected' | 'Default' | 'Disabled' | 'Error'`.
- `AvatarGroupSize`: `'Medium' | 'Small'`.

### 7a. `DockIcon`

A circular tile with an icon in it.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` **(required)** | `IconName` | none | |
| `size` | `DockIconSize` | `'Medium'` | |
| `theme` | `DockIconTheme` | `'Neutral'` | `Inverse` and `Pale` ignore `background` and look the same with `Solid` and `Subtle`. With `Yellow` and a `Solid` background, the icon uses `On-Brights` (dark) instead of white. |
| `background` | `'Solid' \| 'Subtle'` | `'Subtle'` | |
| `accessibilityLabel` | `string` | none | Without a label the tile is decorative (role `none`). With a label it gets role `image`. |

The tile can't be pressed. To make it pressable, wrap it in a `Pressable` and put the accessibility label on the wrapper.

```tsx
<DockIcon icon="home-03-solid" size="Large" theme="Accent" background="Solid" />
```

### 7b. `IntegrationConnector`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `icon` **(required)** | `IconName` | none | |
| `size` | `DockIconSize` | `'Medium'` | The corner radius depends on size: XLarge uses `Corner-Radius/2XLarge`, Large uses `Corner-Radius/XLarge`, and all other sizes use `Corner-Radius/Base`. |
| `background` | `'Connected' \| 'Default' \| 'Disabled' \| 'Error'` | `'Default'` | `Connected` adds a `check-circle-solid` badge (in `Accent/Base`) at the bottom-right. |
| `accessibilityLabel` | `string` | none | No role is set. |

There is no `theme` prop (Figma only has Neutral), and the component can't be pressed. `Disabled` only changes the colours and drops the border.

```tsx
<IntegrationConnector icon="link-01-line" background="Connected" />
```

### 7c. `ColorSelector`

A colour swatch that behaves like a radio button.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `select` **(required)** | `boolean` | none | Controlled. When `true`, a `check-line` icon in `Content/On-Colors` (`#ffffff` in both schemes) is shown. |
| `accessibilityLabel` **(required)** | `string` | none | |
| `color` | `string` (a raw colour, e.g. a hex string) | `Color/Background/Active/Accent/Solid` | A data value used directly as `backgroundColor`, not a token key. |
| `onPress` | `() => void` | none | |

**Gotchas**
- Accessibility: role `radio` with `aria-checked`. There is no `radiogroup` wrapper; add one yourself if you need it.
- The check icon is always white, so it has poor contrast on light swatches.
- While pressed, the border changes from `Border/Neutral/Subtle/Hover` to `Focus/Neutral/Solid`.

```tsx
{palette.map((c, i) => (
  <ColorSelector key={c} color={c} select={color === i} onPress={() => setColor(i)} accessibilityLabel={`Màu ${i + 1}`} />
))}
```

### 7d. `AvatarGroup`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `avatars` **(required)** | `Pick<AvatarProps, 'source' \| 'initials' \| 'theme' \| 'accessibilityLabel'>[]` | none | See the field list below this table. |
| `size` | `AvatarGroupSize` (`'Medium' \| 'Small'`) | `'Medium'` | Only these two values, even though `Avatar` itself has 8 sizes. |
| `background` | `'Subtle' \| 'Solid'` | `'Subtle'` | An inline literal union; there is no named exported type for it. It only affects the "+N" bubble: Accent Solid or Accent Subtle. |
| `max` | `number` | `5` | How many avatars are shown. The rest are counted in a "+N" bubble. |

Fields of each entry in `avatars`:
- `source?: ImageSourcePropType`
- `initials?: string`
- `theme?: AvatarTheme`, which is `'Photo' | 'Accent' | 'Neutral' | <14 support colours>`. It defaults to `'Photo'`. A `Photo` avatar with no `source` falls back to `Neutral` and shows its `initials` (empty if none).
- `accessibilityLabel?: string`

You can't set `shape`, `status` or `background` per avatar.

**Gotchas**
- The ring around each avatar uses `Surface/Default`, so the group only looks right on surface-coloured backgrounds.
- The "+N" bubble has no accessibility label.
- There is no `onPress`.
- Avatars are keyed by index.

```tsx
const avatars = [1, 2, 3, 4, 5, 6, 7].map((i) => ({ source: { uri: `https://i.pravatar.cc/96?img=${i}` } }));
<AvatarGroup avatars={avatars} size="Small" background="Solid" max={3} />
```

### 7e. `EmptyState`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` **(required)** | `string` | none | Text style `Heading/4`, centred. |
| `caption` | `string` | none | Text style `Body/Base/Regular` in `Content/Neutral/Light`, centred. |
| `icon` | `IconName` | `'user-circle-line'` | Rendered as `<DockIcon size="XLarge" theme="Pale" />`. Ignored when `illustration` is set. |
| `illustration` | `ReactNode` | none | Replaces the default dock icon. |
| `primaryText` / `onPrimary` | `string` / `() => void` | none | The primary button renders only when `primaryText` is set. It is a `Button level="Primary" size="Medium (Base)"`. |
| `secondaryText` / `onSecondary` | `string` / `() => void` | none | The secondary button renders only when `secondaryText` is set. It is a `Button level="Tertiary" size="Medium (Base)"` and sits to the **left** of the primary button. |

It stretches to the width of its parent (`alignSelf: 'stretch'`) but is not centred vertically. To centre it on a screen, wrap it.

```tsx
<EmptyState title="Chưa có bài viết" caption="Theo dõi golfer khác để thấy bài viết ở đây." primaryText="Khám phá" onPrimary={goExplore} secondaryText="Để sau" onSecondary={dismiss} />
<EmptyState icon="search-medium-line" title="Không tìm thấy" />
```

---

## Quick reference

| Component | Required props | Controlled value | Index base |
|---|---|---|---|
| TopNavigation | none (each action needs `accessibilityLabel`) | none | n/a |
| BottomNavigation | `items`, `selectedIndex` | `selectedIndex` + `onChange` | 0 |
| TabBar | `items`, `selectedIndex` | `selectedIndex` + `onChange` | 0 |
| Segmented | `items`, `selectedIndex` | `selectedIndex` + `onChange` | 0 |
| PageIndicator | `count`, `active` | `active` (display only) | 0 |
| Pagination | `page`, `count`, `onChange` | `page` + `onChange` | **1** |
| Breadcrumbs | `items` | none | n/a |
| Stepper | `steps`, `current` | `current` (display only) | 0 |
| DockIcon | `icon` | none | n/a |
| IntegrationConnector | `icon` | none | n/a |
| ColorSelector | `select`, `accessibilityLabel` | `select` + `onPress` | n/a |
| AvatarGroup | `avatars` | none | n/a |
| EmptyState | `title` | none | n/a |

---

## What changed from the draft

1. **Rule 7 and BottomNavigation `theme="Overlay"` were wrong.** That theme does not use `On-Dark-Overlay/*` tokens. It uses `Content/Accent/Strongest`, `Surface/Default` and `Surface/Glass`, which all change with the scheme. Its gallery background, `Background/Inverse/Solid/Default`, is **white in light mode** (`#ffffff`), not dark. Only TopNavigation `surface="Overlay"` and PageIndicator `state="Overlay"` use fixed dark-background tokens.
2. **Stepper:** added that `Error` steps show `info-octagon-solid` with a red connector line, that `Passed` and `Error` always override a custom `icon`, and that the number shows only for `Default` or `Focused` steps without an icon. Added the line limits for title and caption.
3. **TopNavigation:** `triggerText` has no default value (it renders as `''`). Added the subtitle text style for each size and the exact Button/IconButton props in Overlay mode.
4. **Segmented:** the accessibility roles include `aria-selected` on each tab. Clarified which item tokens each level uses (the F1 mapping is confirmed in `docs/ds/figma-debt.md`).
5. **AvatarGroup:** `background` is an inline union with no named type. `AvatarTheme` defaults to `'Photo'`. Per-avatar `shape`, `status` and `background` can't be set. `AvatarGroupSize` is now named in the shared-unions list.
6. **Pagination:** the window stops sliding at the first and last pages, `page` is not clamped, page buttons have no explicit accessibility label, and each size maps to a page-button size token.
7. **Other details added:**
   - BottomNavigation: the dot and badge tokens for `noti`, and that `''` still renders an empty badge.
   - IntegrationConnector: the `check-circle-solid` badge, and that `Disabled` drops the border.
   - ColorSelector: the border while pressed.
   - DockIcon: Yellow with a Solid background uses `On-Brights`.
   - The `ThemeProvider` `emphasis` union.
   - The `StepState`, `DockIconBackground` and `ConnectorBackground` unions are now spelled out.
   - Rule 5 now separates the controlled components from the display-only ones.
8. **Verified with no change needed:**
   - Every other prop name, type, literal union and default.
   - All exports in `index.ts`: no component or type from these folders is missing.
   - All icon names used in the snippets.

---

<a id="nhóm-input"></a>
# Nhóm: input

# @gr/ds API cheatsheet: Inputs, Selection controls, DatePicker, Popover

Source: `/Users/duncreative/Coding Agent/Gram-Golf/packages/ds/src/ui/**`. Galleries: `/Users/duncreative/Coding Agent/Gram-Golf/apps/golf/app/(dev)/ds/{textfield,input2,input3,datepicker,checkbox,radio,toggle,popover}.tsx`.
Everything below is a named export from `@gr/ds` (package `main` = `src/index.ts`). `IconName`, `Theme`, `Scheme` and `Emphasis` are also exported as types.

## 0. Rules that apply to every component

- **A parent `<ThemeProvider>` is required.** Every component calls `useTheme()`, which throws `useTheme: bọc app trong <ThemeProvider>` when there is no provider. The app root already has one (`apps/golf/app/_layout.tsx`: `<ThemeProvider scheme="auto">`). Props: `scheme?: 'auto' | Scheme` (default `'auto'`, which follows `useColorScheme()`) and `emphasis?: Emphasis` (default `'neutral'`).
- **No component takes `style` or a container style prop.** The TextInput-based ones `Omit` `style` from their props. To control layout, wrap the component in a `View`.
  - Width: TextField, TextArea, SelectField, DateField, MessageInput, FieldGroup, NumberField and OtpField have a wrapper with `alignSelf: 'stretch'`, so they fill the parent's width. SearchField has no wrapper (its root is the field itself, without `alignSelf`), and StepperControl's value box is `flex: 1`. Both fill the width in a normal column parent. Checkbox, Radio and Toggle have a fixed size.
- **Figma enum values are verbatim strings**, for example `'Medium (Base)'` (with the space and parentheses). Sizes are not shared across component families:
  - `InputSize` = `'Small' | 'Medium (Base)' | 'Large' | 'XLarge'`. Used by TextField, SearchField, SelectField, MessageInput, DateField, FieldGroup. TextArea excludes `'XLarge'`.
  - `NumberFieldSize` = `'Small' | 'Medium (Base)' | 'Large' | 'XLarge'`.
  - `StepperControlSize` = `'XLarge' | 'Large' | 'Medium' | 'Small'`. **This is `'Medium'`, not `'Medium (Base)'`.**
  - `OtpSize` = `'XLarge' | 'Large'`. `ToggleSize` = `'Large' | 'Medium' | 'Small'`. `DatePickerSize` = `'Large' | 'Small'`.
- **The `error` pattern** (`error?: boolean | string`): a string replaces `helpText` and gets error styling (an `alert-octagon-line` icon in red). `true` applies error styling to the field. If `helpText` is set, it is still shown, in error styling. With `error={true}` and no `helpText`, no message row is drawn. (StepperControl is the exception: `error?: boolean` only.)
- **There is no `editable` prop** on TextField, TextArea or MessageInput. Use `readOnly` or `disabled`, which both resolve to `editable={false}`.
- **Some props you pass are silently overridden:** SearchField forces `returnKeyType="search"`. TextArea forces `multiline`. MessageInput replaces your `onSubmitEditing` with its own (which calls `onSend`). CheckboxRow and ToggleRow replace `onPress` with their toggle handler.
- **Overlay variants must sit on a fixed dark background.** This applies to `SearchField overlay` and `MessageInput overlay`. They use the `On-Dark-Overlay/*` and `Input-Overlay/*` tokens, which are only correct on a dark background that does not flip with the theme. The galleries use `darkDemo(t)` from `apps/golf/lib/demo.ts`. That helper is app-local, not part of the DS:
  ```ts
  export const darkDemo = (t: Theme) => ({
    backgroundColor: t.color(t.scheme === 'dark' ? 'Color/Background/Inverse/Solid/Default' : 'Color/Background/Neutral/Solid/Default'),
    padding: t.space('Spacing/Padding/Medium'),
    borderRadius: t.radius('Corner-Radius/Large'),
  });
  ```
- Some built-in a11y strings are hard-coded and mixed Vietnamese/English, with no prop to change them: "Xoá nội dung" (TextField and SearchField clear), "Gửi" (MessageInput send), "Giảm" / "Tăng" (± buttons), "Số lượng" (number default), "OTP", "Tin nhắn" and "Tìm kiếm" (label fallbacks), "Tháng trước" / "Tháng sau" (MonthHeader arrows), "Chọn ngày" (DateWheel), "Chọn giờ" (TimeWheel).

---

## 1. Text inputs (`ui/TextField/*`)

### TextField
`import { TextField, type TextFieldProps, type InputSize } from '@gr/ds'`

`TextFieldProps extends Omit<TextInputProps, 'style' | 'editable' | 'placeholderTextColor'>`, so every other RN `TextInput` prop passes through (`placeholder`, `secureTextEntry`, `keyboardType`, `defaultValue`, `onSubmitEditing`, and so on).

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | – | Rendered above the field (`Label/Small/DemiBold`). |
| `helpText` | `string` | – | Shown below the field with an `info-circle-line` icon. |
| `size` | `InputSize` | `'Medium (Base)'` | |
| `error` | `boolean \| string` | – | See the error pattern in §0. |
| `readOnly` | `boolean` | – | Sets `editable={false}` and uses the read-only colours. |
| `disabled` | `boolean` | – | |
| `leadingIcon` | `IconName` | – | Decorative only. |
| `trailingIcon` | `IconName` | – | Interactive only when `onTrailingPress` is set. |
| `trailingAccessibilityLabel` | `string` | – | **Required in practice whenever `onTrailingPress` is set.** The trailing button has no other name. |
| `onTrailingPress` | `() => void` | – | |
| `clearable` | `boolean` | – | Shows the `x-circle-solid` clear button (a11y "Xoá nội dung") only while `value` is truthy. Pressing it calls `onChangeText('')`. It is drawn before `trailingIcon`. |
| `value`, `onChangeText`, `onFocus`, `onBlur` | from RN | – | `onFocus` and `onBlur` are wrapped. Your handlers are still called. |

- The input's `accessibilityLabel` resolves in this order: the `accessibilityLabel` prop, then `label`, then `placeholder`.
- **Controlled vs uncontrolled:** both work through RN (`value` or `defaultValue`). However, `clearable` only appears when `value` is passed, so it effectively requires controlled use.
- Focus state is internal. A focused field gets the focus border.

```tsx
const [v, setV] = useState('');
<TextField label="Họ tên" placeholder="Nhập họ tên" helpText="Tên hiển thị trên hồ sơ" value={v} onChangeText={setV} clearable leadingIcon="user-circle-line" />
<TextField label="Mật khẩu" placeholder="••••••" secureTextEntry trailingIcon="eye-line" trailingAccessibilityLabel="Hiện mật khẩu" onTrailingPress={() => {}} />
```

### SearchField
`import { SearchField, type SearchFieldProps, type SearchType } from '@gr/ds'`

`SearchFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'>`. Note that `editable` is **not** omitted here.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `SearchType` = `'Default' \| 'Rounded'` | `'Default'` | `'Rounded'` gives the pill radius. |
| `size` | `InputSize` | `'Medium (Base)'` | |
| `overlay` | `boolean` | – | Figma `Search/Overlay`. **Needs a dark background** (see §0). |

- There is **no** `label`, `helpText`, `error`, `disabled` or `readOnly`. If you need to block input, pass `editable={false}`. This has no visual effect: the field keeps its normal styling.
- The `search-medium-line` icon is always shown. `returnKeyType="search"` is forced.
- The clear button (an `IconButton` `x-small-line`, size 2XSmall, Tertiary, or Primary overlay when `overlay`; a11y "Xoá nội dung") shows only while `value` is truthy, and it calls `onChangeText('')`. **Use it controlled.**
- a11y label fallback: the `accessibilityLabel` prop, then `placeholder`, then `'Tìm kiếm'`.

```tsx
const [q, setQ] = useState('');
<SearchField placeholder="Tìm sân golf" value={q} onChangeText={setQ} />
<SearchField type="Rounded" placeholder="Tìm sân golf" value={q} onChangeText={setQ} />
// on a dark box:
<View style={darkDemo(t)}><SearchField overlay placeholder="Tìm trên nền tối" value={q} onChangeText={setQ} /></View>
```

### TextArea
`import { TextArea, type TextAreaProps } from '@gr/ds'`

The type is:
```ts
type TextAreaProps = Omit<TextFieldProps, 'leadingIcon' | 'trailingIcon' | 'onTrailingPress' | 'clearable' | 'size'> & { size?: Exclude<InputSize, 'XLarge'> }
```

- `size`: `'Small' | 'Medium (Base)' | 'Large'`. Default `'Medium (Base)'`. **`'XLarge'` is a type error.**
- The remaining props are `label`, `helpText`, `error`, `readOnly`, `disabled`, plus RN TextInput props. `multiline` is forced on.
- Height is fixed from the token `Text-Area/Size/<S>`, and the text is top-aligned.
- The label uses a different typography from TextField: `Body/XSmall/Regular`, colour Strongest (Disabled when `disabled`).
- In the disabled state the field has no border. In the error state the background stays Default (unlike TextField).
- `trailingAccessibilityLabel` is still allowed by the type but does nothing. It gets spread into the TextInput.

```tsx
const [note, setNote] = useState('');
<TextArea label="Ghi chú" placeholder="Nhập ghi chú…" value={note} onChangeText={setNote} helpText="Tối đa 500 ký tự" />
```

### SelectField
`import { SelectField, type SelectFieldProps } from '@gr/ds'`

This is not a TextInput. It is a pressable read-only field with a `chevron-down-line` icon. **You supply the picker yourself** (for example a BottomSheet or a Popover).

| Prop | Type | Default | Required |
|---|---|---|---|
| `onPress` | `() => void` | – | **yes** |
| `label` | `string` | – | |
| `helpText` | `string` | – | |
| `size` | `InputSize` | `'Medium (Base)'` | |
| `placeholder` | `string` | – | Shown when `value` is empty. |
| `value` | `string` | – | The display string of the current choice. |
| `error` | `boolean \| string` | – | |
| `disabled` | `boolean` | – | |
| `accessibilityLabel` | `string` | falls back to `label` | |

- There is **no `readOnly`**, and no other props (it does not extend any RN props).
- The a11y role is `combobox` with `expanded: false` hard-coded. The component does not track whether your picker is open.
- **If there is no `label`, pass `accessibilityLabel`.** Otherwise the control has no name.
- Long values are truncated to one line.

```tsx
<SelectField label="Sân" placeholder="Chọn sân" value={course} onPress={() => setSheetOpen(true)} />
```

### DateField
`import { DateField, type DateFieldProps } from '@gr/ds'`

Same shape as SelectField, plus `readOnly`. The icon is `calendar-line`, and the a11y role is `button`.

| Prop | Type | Default | Required |
|---|---|---|---|
| `onPress` | `() => void` | – | **yes**. It opens your DatePicker, for example inside a BottomSheet. |
| `label`, `helpText`, `placeholder`, `accessibilityLabel` | `string` | – | `accessibilityLabel` falls back to `label`. |
| `size` | `InputSize` | `'Medium (Base)'` | |
| `value` | `string` | – | **An already-formatted string.** The component does no date formatting. |
| `error` | `boolean \| string` | – | |
| `readOnly` | `boolean` | – | Disables the press (a11y disabled too), uses the read-only colours and greys the icon (`Color/Content/Disabled`). |
| `disabled` | `boolean` | – | |

```tsx
<DateField label="Ngày chơi" placeholder="Chọn ngày" value={date ? date.toLocaleDateString('vi-VN') : undefined} onPress={() => setPickerOpen(true)} helpText="Mở Date-Picker" />
```

### MessageInput
`import { MessageInput, type MessageInputProps } from '@gr/ds'`

`extends Omit<TextInputProps, 'style' | 'editable' | 'placeholderTextColor'>`. It is a pill-shaped input with a round send button, and it has **no `label`**.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `helpText` | `string` | – | |
| `size` | `InputSize` | `'Medium (Base)'` | |
| `error` | `boolean \| string` | – | |
| `readOnly` | `boolean` | – | |
| `disabled` | `boolean` | – | |
| `overlay` | `boolean` | – | `Input/Message-Input-Overlay`. **Needs a dark background.** |
| `onSend` | `(text: string) => void` | – | Called from the send button and from `onSubmitEditing`, but only when `value` is truthy. |

- The send button (`arrow-right-line`, a11y "Gửi") is **visible while focused or while `value` is non-empty**.
- The send button is **disabled when `!value`**, `disabled` or `readOnly`. Without a `value` prop it can never be pressed, so **use it controlled.**
- Your own `onSubmitEditing` is overridden (see §0). Use `onSend`.
- The component does not clear itself after sending. Clear it in `onSend`.
- a11y label fallback: the `accessibilityLabel` prop, then `placeholder`, then `'Tin nhắn'`.

```tsx
const [msg, setMsg] = useState('');
<MessageInput placeholder="Nhắn gì đó…" value={msg} onChangeText={setMsg} onSend={() => setMsg('')} />
<View style={darkDemo(t)}><MessageInput overlay placeholder="Trả lời story…" value={msg} onChangeText={setMsg} onSend={() => setMsg('')} /></View>
```

### FieldGroup
`import { FieldGroup, type FieldGroupProps, type FieldGroupRow } from '@gr/ds'`

Several inputs share one frame, separated by dividers (for example street, ward, city).

```ts
interface FieldGroupRow extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> { key: string; leadingIcon?: IconName }
interface FieldGroupProps { label?: string; size?: InputSize /* default 'Medium (Base)' */; rows: FieldGroupRow[] /* required */ }
```

- Every row needs a unique `key`. Each row is a full RN TextInput, so set `value`, `onChangeText` and the rest **per row**. `editable` is not omitted, so `editable={false}` works per row (with no visual change).
- There is **no** `error`, `helpText`, `disabled` or `readOnly`, and no focus styling. On web the browser outline shows instead.
- The leading icon colour is fixed (`Color/Content/Neutral/Light`).
- The label uses `Body/Base/DemiBold`, which is larger than TextField's label.
- Per-row a11y label fallback: the row's `accessibilityLabel`, then the row's `placeholder`, then the group `label`.

```tsx
<FieldGroup label="Địa chỉ" rows={[
  { key: 'street', placeholder: 'Số nhà, đường', value: street, onChangeText: setStreet },
  { key: 'ward', placeholder: 'Phường' },
  { key: 'city', placeholder: 'Thành phố', leadingIcon: 'marker-pin-01-line' },
]} />
```

---

## 2. Number inputs (`ui/StepperControl/*`)

### NumberField
`import { NumberField, type NumberFieldProps, type NumberFieldSize, type NumberFieldAlign } from '@gr/ds'`

A number box with the − and + buttons inside the field. **It is controlled only.** It does not extend RN `TextInputProps`, so only the props below exist.

| Prop | Type | Default | Required |
|---|---|---|---|
| `value` | `number \| null` | – | **yes**. `null` means empty. |
| `onChange` | `(next: number \| null) => void` | – | **yes** |
| `label` | `string` | – | **Rendered only when `align='Left'`**, inside the box above the number (`Body/XSmall/Regular`). In Center mode it is used only as the a11y label. |
| `helpText` | `string` | – | |
| `placeholder` | `string` | `'0'` | |
| `min` | `number` | `0` | |
| `max` | `number` | `Number.MAX_SAFE_INTEGER` | |
| `step` | `number` | `1` | |
| `size` | `NumberFieldSize` = `'Small' \| 'Medium (Base)' \| 'Large' \| 'XLarge'` | `'Medium (Base)'` | |
| `align` | `NumberFieldAlign` = `'Left' \| 'Center'` | `'Left'` | `'Left'`: label and number on the left, ± on the right. `'Center'`: number in the middle, − and + at the two edges, pill radius. |
| `error` | `boolean \| string` | – | |
| `readOnly`, `disabled` | `boolean` | – | Either one locks both typing and the ± buttons. |
| `accessibilityLabel` | `string` | falls back to `label`, then `'Số lượng'` | |

Behaviour:
- **Typed text is committed only on blur.** The draft is parsed with `parseInt`, clamped to `[min, max]`, and then `onChange` is called. If the text is not a number, it clears the draft and calls `onChange(null)`. `onChange` fires on every blur, even when nothing changed.
- The draft re-syncs whenever `value` changes from outside. Text is selected on focus.
- When `value` is `null`, the ± buttons treat it as `0`. With the default `min=0`, the − button is therefore disabled. The ± buttons are disabled at `min` and at `max`.
- The keyboard is `number-pad`, so negative and decimal input is not practical.

```tsx
const [n, setN] = useState<number | null>(2);
<NumberField label="Số người" value={n} onChange={setN} min={1} max={4} helpText="Tối đa 4" />
<NumberField align="Center" value={n} onChange={setN} min={0} max={9} />
```

### StepperControl
`import { StepperControl, type StepperControlProps, type StepperControlSize } from '@gr/ds'`

Figma `Stepper-Control-Split`: the ± buttons sit **outside** a pill-shaped value box. **It is controlled only.**

| Prop | Type | Default | Required |
|---|---|---|---|
| `value` | `number` | – | **yes**. It cannot be null. |
| `onChange` | `(next: number) => void` | – | **yes** |
| `min` / `max` / `step` | `number` | `0` / `Number.MAX_SAFE_INTEGER` / `1` | |
| `size` | `StepperControlSize` = `'XLarge' \| 'Large' \| 'Medium' \| 'Small'` | `'Medium'` | **This is not `'Medium (Base)'`.** |
| `error` | `boolean` | – | **boolean only, there is no message.** |
| `disabled` | `boolean` | – | Locks typing and the ± buttons. Only the number greys out; the box keeps its normal background and border. |
| `editable` | `boolean` | `true` | `false` turns off typing, but the ± buttons keep working. |
| `accessibilityLabel` | `string` | `'Số lượng'` | |

- It has no `label`, `helpText` or `readOnly`. Put a label next to it yourself if you need one.
- On blur, invalid text reverts to `value` without calling `onChange`. Valid text calls `onChange(clamp(n))`, even when it equals `value`.
- The ± buttons are disabled at `min` and at `max`.

```tsx
const [qty, setQty] = useState(2);
<StepperControl value={qty} onChange={setQty} min={0} max={9} size="Medium" />
```

---

## 3. OtpField (`ui/OtpField/*`)
`import { OtpField, type OtpFieldProps, type OtpSize } from '@gr/ds'`

| Prop | Type | Default | Required |
|---|---|---|---|
| `value` | `string` | – | **yes** |
| `onChangeText` | `(next: string) => void` | – | **yes** |
| `length` | `4 \| 6` | `6` | |
| `size` | `OtpSize` = `'XLarge' \| 'Large'` | `'XLarge'` | |
| `error` | `boolean \| string` | – | |
| `disabled` | `boolean` | – | |
| `helpText` | `string` | – | |
| `onComplete` | `(code: string) => void` | – | Fires whenever a change results in exactly `length` digits. |

- **It is controlled only.** A hidden one-pixel TextInput receives the keystrokes, and the cells are display-only. Tapping the row focuses the hidden input (not when `disabled`).
- Input is sanitised: non-digits are stripped and the value is truncated to `length`. SMS autofill works (`textContentType="oneTimeCode"`, `autoComplete="one-time-code"`). Empty cells show `•`.
- The a11y label is hard-coded to `"OTP"` and there is no prop to change it. Put a visible instruction in `helpText` or in a heading.
- With `length=6` and `size='XLarge'`, the cells shrink to fit narrow screens while staying square.

```tsx
const [otp, setOtp] = useState('');
<OtpField value={otp} onChangeText={setOtp} length={6} helpText="Nhập mã 6 số" onComplete={(code) => verify(code)} />
```

---

## 4. Selection controls

All of them are **controlled only.** The `select` prop is the source of truth, and none of them keep internal checked state. The label-row variants (`*Row`) automatically use `label` as the control's a11y name. **The bare marks need an explicit `accessibilityLabel`.**

### Checkbox
`import { Checkbox, type CheckboxProps, type CheckboxType, type CheckboxShape } from '@gr/ds'`

| Prop | Type | Default | Required |
|---|---|---|---|
| `select` | `boolean` | – | **yes**. Figma `Select=Yes/No`. |
| `type` | `CheckboxType` = `'Default' \| 'Indeterminate'` | `'Default'` | `'Indeterminate'` shows `minus-line` only when `select` is true, and reports aria-checked `'mixed'`. |
| `shape` | `CheckboxShape` = `'Rounded' \| 'Default'` | `'Default'` | |
| `disabled` | `boolean` | – | |
| `onChange` | `(next: boolean) => void` | – | Receives `!select`. Without it, the box still looks pressable but does nothing. |
| `accessibilityLabel` | `string` | – | **Pass it.** The box has no other name. |

It has a single fixed size (`Checkbox/Size/Medium`) and `hitSlop` = `Spacing/Gap/XSmall`.

```tsx
const [a, setA] = useState(true);
<Checkbox select={a} onChange={setA} accessibilityLabel="Đồng ý điều khoản" />
```

### Radio
`import { Radio, type RadioProps } from '@gr/ds'`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `select` | `boolean` | – | **required** |
| `disabled` | `boolean` | – | |
| `onPress` | `() => void` | – | **This is `onPress`, not `onChange`.** There is no deselect logic, so the group manages its own value. |
| `accessibilityLabel` | `string` | – | **Pass it** unless `decorative`. |
| `decorative` | `boolean` | – | Draws the mark only: no role, no focus, `aria-hidden`, press disabled. Use it inside a card or row that is itself the radio. |

```tsx
const [v, setV] = useState('a');
<Radio select={v === 'a'} onPress={() => setV('a')} accessibilityLabel="Phương án A" />
```

### RadioRow, CheckboxRow, ControlRow (label rows)
`import { RadioRow, CheckboxRow, ControlRow, type ControlRowProps, type ControlSide, type ControlKind } from '@gr/ds'`

```ts
interface ControlRowProps { label: string /* required */; caption?: string; side?: ControlSide /* 'Left' | 'Right', default 'Left' */; disabled?: boolean; onPress?: () => void }
// RadioRow:    ControlRowProps & { select: boolean }
// CheckboxRow: ControlRowProps & Pick<CheckboxProps, 'select' | 'onChange' | 'type' | 'shape'>
//              = ControlRowProps & { select: boolean; onChange?: (next: boolean) => void; type?: CheckboxType; shape?: CheckboxShape }
// ControlRow (low-level): ControlRowProps & { kind: ControlKind /* 'Checkbox' | 'Radio' | 'Toggle', required */; control: ReactNode /* required */ }
```

- `side` is Figma Radio-Side / Check-Side. `'Right'` puts the control on the right.
- Tapping the label also toggles the control. The row press is disabled when `disabled` is set or when there is no `onPress`.
- The row itself has `accessible={false}`, so the inner control is the a11y element and its name is `label` (the caption is not part of the name).
- `RadioRow` passes `onPress` to both the row and the radio.
- For `CheckboxRow`, use `onChange`. The `onPress` from `ControlRowProps` is overridden.

```tsx
<RadioRow label="Left side" caption="Caption đi kèm" select={v === 'a'} onPress={() => setV('a')} />
<CheckboxRow label="Nhận thông báo" caption="Qua email và push" select={c} onChange={setC} />
```

### Toggle and ToggleRow
`import { Toggle, ToggleRow, type ToggleProps, type ToggleSize } from '@gr/ds'`

| Toggle prop | Type | Default |
|---|---|---|
| `select` | `boolean` | **required** |
| `onChange` | `(next: boolean) => void` | – (receives `!select`) |
| `size` | `ToggleSize` = `'Large' \| 'Medium' \| 'Small'` | `'Medium'` |
| `disabled` | `boolean` | – |
| `accessibilityLabel` | `string` | – (**pass it** for a bare Toggle) |

- The role is `switch`. There is no animation: the knob jumps between `flex-start` and `flex-end`.
- `ToggleRow` props are `Omit<ControlRowProps, 'side'> & Pick<ToggleProps, 'select' | 'onChange' | 'size'> & { theme?: 'Text-First' | 'Toggle-First' }`.
  - `theme` defaults to `'Text-First'`, which puts the toggle on the right. `'Toggle-First'` puts it on the left.
  - **`side` is not accepted. Use `theme`.** (`theme` here is a Figma variant, unrelated to `ThemeProvider`.)
  - Use `onChange`. The `onPress` from `ControlRowProps` is overridden.

```tsx
const [b, setB] = useState(false);
<Toggle select={b} onChange={setB} accessibilityLabel="Chế độ tối" />
<ToggleRow label="Chế độ tối" caption="Theo hệ thống" select={b} onChange={setB} />
```

---

## 5. Date pickers (`ui/DatePicker/*`)

`import { DatePicker, DayCell, WeekLabels, MonthHeader, MonthGrid, WheelPicker, DateWheel, TimeWheel, type DatePickerProps, type DateRange, type DatePickerSize, type MonthHeaderAlign, type DayCellProps, type MonthHeaderProps, type MonthGridProps, type WheelColumn, type WheelPickerProps } from '@gr/ds'`

`WeekLabels`, `DateWheel` and `TimeWheel` have inline prop types with no exported name (use `ComponentProps<typeof DateWheel>` if you need them).

### DatePicker
Shared props:

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `DatePickerSize` = `'Large' \| 'Small'` | `'Large'` | |
| `type` | `'Paged' \| 'Scroll'` | `'Paged'` | `'Paged'` shows one month with ‹ › buttons. `'Scroll'` shows a vertical ScrollView of `months` months, starting at the seeded month, with no navigation. |
| `months` | `number` | `12` | Used only by `type='Scroll'`. |
| `initialMonth` | `Date` | from `value` (or `value.start`), else today | **Read once on mount** (useState seed). Changing it or `value` later does not move the visible month. |
| `minDate` / `maxDate` | `Date` | – | Compared at day level. Days outside the range are disabled. |
| `markedDates` | `Iterable<string>` | – | Keys in **local** `'YYYY-MM-DD'` format. Draws an event dot (inverse colour on a selected day). |
| `headerAlign` | `MonthHeaderAlign` = `'Start' \| 'Center'` | `'Start'` | |
| `weekStartsOn` | `0 \| 1` | `1` (Monday) | See the gotcha below. |
| `monthTitle` | `(month: number, year: number) => string` | `` `Tháng ${m+1}, ${y}` `` | `month` is 0-based. |

Mode union. `value` and `onChange` are **required** and controlled:
- `{ mode?: 'single'; value: Date | null; onChange: (d: Date) => void }`
- `{ mode: 'range'; value: DateRange; onChange: (r: DateRange) => void }`, where `DateRange = { start: Date | null; end: Date | null }`

How range selection works:
- If there is no start, or the range is already complete, a tap sets `{ start: d, end: null }`.
- A tap before the current start resets the start.
- Otherwise the tap sets `end`. Tapping the start date again makes a one-day range.

Gotchas:
- **There is no background, card or modal.** Wrap it in a surface yourself. The gallery uses `Color/Background/Surface/Default` with `Corner-Radius/Large`. It is usually placed inside a BottomSheet and opened from a `DateField`. The picker itself adds padding (`gr-dm-12`).
- **`type='Scroll'` needs a parent with a bounded height.** The gallery uses a fixed-height `View` (`t.primitive('gr-dm-240') * 2`).
- **`weekStartsOn={0}` is broken visually.** The `WeekLabels` header is always `T2…CN` (Monday first) because DatePicker does not pass `labels`, so the columns would be mislabelled. Keep the default `1`.
- **Days from neighbouring months are shown and selectable** (unless outside `minDate`/`maxDate`). Selecting one does not move the visible month.
- The month title is a Flat `Button` with no press handler and no chevron. In Scroll mode the headers have no arrows.
- The day a11y label uses the `vi-VN` locale (weekday, day, month, year). Today's date gets a ring border.

```tsx
const [d, setD] = useState<Date | null>(new Date());
<View style={{ backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Large') }}>
  <DatePicker value={d} onChange={setD} markedDates={['2026-10-03']} minDate={new Date()} />
</View>

const [r, setR] = useState<DateRange>({ start: null, end: null });
<DatePicker mode="range" size="Small" headerAlign="Center" value={r} onChange={setR} />
```

### Building blocks (only for custom layouts)
- `MonthGrid`: `{ year: number; month: number /* 0-based */; size?: DatePickerSize /* 'Large' */; selected?: Date | null; range?: DateRange; minDate?: Date; maxDate?: Date; marked?: ReadonlySet<string>; weekStartsOn?: 0 | 1 /* 1 */; onSelect?: (d: Date) => void }`. Always renders 6×7 cells, including days from the neighbouring months.
- `MonthHeader`: `{ title: string /* required */; align?: MonthHeaderAlign /* 'Start' */; size?: DatePickerSize /* 'Large' */; onPrev?: () => void; onNext?: () => void; onTitlePress?: () => void }`. Each arrow (`chevron-left-line-medium` / `chevron-right-line-medium`, a11y "Tháng trước" / "Tháng sau") renders only if its handler is passed. A `chevron-down-line` appears on the title only when `onTitlePress` is set.
- `WeekLabels`: `{ size?: DatePickerSize /* 'Large' */; labels?: string[] /* ['T2','T3','T4','T5','T6','T7','CN'] */ }`. Labels are used as React keys, so they must be unique.
- `DayCell`: `{ date: Date /* required */; size?: DatePickerSize /* 'Large' */; today?: boolean; selected?: boolean; inRange?: boolean; rangeEdge?: 'start' | 'end'; disabled?: boolean; outside?: boolean; marked?: boolean; onPress?: (d: Date) => void }`. It is not pressable when there is no `onPress`.

### WheelPicker, DateWheel, TimeWheel
The wheels draw their own background (`Color/Background/Surface/Alt`) and are 5 items tall (item height `Button/Size/Medium`), with a selection bar and top and bottom fades.

- `WheelPicker<V = number>`: `{ columns: WheelColumn<V>[] /* required */; onChange: (key: string, value: V) => void /* required */; accessibilityLabel?: string }`.
  - `WheelColumn<V>` = `{ key: string; items: { label: string; value: V }[]; value: V; weight?: number /* flex, default 1 */ }`.
  - Items are keyed by `String(value)`, so values must stringify uniquely. The current item is found with `===`.
  - If a column's `value` is not among its `items`, the wheel highlights the first item and does not call `onChange`.
  - `onChange` can fire twice per gesture (on drag end and on momentum end). Make your handler idempotent. Tapping an item scrolls to it and calls `onChange`.
- `DateWheel`: `{ value: Date /* required */; onChange: (d: Date) => void /* required */; minYear?: number; maxYear?: number }`.
  - Columns are day, month (`Tháng N`, wider column) and year. No `accessibilityLabel` prop (hard-coded "Chọn ngày").
  - The day is clamped to the month length.
  - **The `minYear` and `maxYear` defaults (`value.year − 100` and `value.year + 10`) are recomputed from `value` on every render**, so the year range slides as the value changes. Pass explicit values for a fixed range.
- `TimeWheel`: `{ hour: number /* required */; minute: number /* required */; onChange: (hour: number, minute: number) => void /* required */; minuteStep?: number /* 1 */ }`.
  - 24-hour clock. No `accessibilityLabel` prop (hard-coded "Chọn giờ").
  - `minute` must be a multiple of `minuteStep`. If it is not, the wheel highlights `00` but does not call `onChange`.

```tsx
const [w, setW] = useState(new Date());
<DateWheel value={w} onChange={setW} minYear={1940} maxYear={2030} />
const [hm, setHm] = useState({ h: 7, m: 30 });
<TimeWheel hour={hm.h} minute={hm.m} minuteStep={5} onChange={(h, m) => setHm({ h, m })} />
```

---

## 6. PopoverItem (`ui/Popover/*`)
`import { PopoverItem, type PopoverItemProps, type PopoverItemType } from '@gr/ds'`

**The DS has no Popover container or anchor component.** Only the row is provided, and you build the floating card yourself. The gallery card is:
```ts
{ backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Large'), padding: t.space('Spacing/Padding/2XSmall'), ...t.shadow('Effect/Popover') }
```
The card does not need a dark background.

| Prop | Type | Default | Used by Type |
|---|---|---|---|
| `type` | `PopoverItemType` = `'Radio' \| 'Item' \| 'Follow-User' \| 'Like'` | `'Item'` | |
| `label` | `string` | – | **required**, all types. One line. |
| `caption` | `string` | – | all types. One line. |
| `icon` | `IconName` | – | `'Item'` only (leading icon) |
| `selected` | `boolean` | – | `'Radio'`: filled dot, a11y `radio` checked. `'Item'`: trailing `check-line` (drawn before `trailingIcon`). No visual on the other types. |
| `avatar` | `ImageSourcePropType` | – | `'Follow-User'` and `'Like'` only (`Avatar` size Small) |
| `trailingIcon` | `IconName` | – | any type |
| `followText` | `string` | – | `'Follow-User'` only. Renders a Tertiary XSmall `Button`. |
| `onFollow` | `() => void` | – | the follow button's handler |
| `onPress` | `() => void` | – | press handler for the whole row |

- The row is controlled: you track which item is selected.
- With `followText` set, the row gets no a11y role and is not accessible, which avoids a button inside a button. Screen readers reach the Follow button only, although touch `onPress` on the row still works. **This happens whenever `followText` is set, whatever the `type`**, but the button is drawn only for `'Follow-User'`. Do not pass `followText` to other types.
- In the pressed state the row background is `Color/Background/Accent/Flat/Hover`.

```tsx
const [r, setR] = useState(0);
<View style={card}>
  {['Mới nhất', 'Phổ biến', 'Gần tôi'].map((l, i) => (
    <PopoverItem key={l} type="Radio" label={l} selected={r === i} onPress={() => setR(i)} />
  ))}
</View>
<PopoverItem type="Item" icon="share-01-line" label="Chia sẻ" trailingIcon="chevron-right-line-medium" onPress={share} />
<PopoverItem type="Follow-User" avatar={photo} label="Vũ An" caption="@birdiehunter101" followText="Theo dõi" onFollow={follow} />
```

---

## 7. Quick reference: required props and control model

| Component | Required props | Model |
|---|---|---|
| TextField / TextArea | none | controlled or uncontrolled (`clearable` needs `value`) |
| SearchField | none | controlled in practice (clear button needs `value`) |
| MessageInput | none | controlled in practice (send needs `value`) |
| SelectField / DateField | `onPress` | display only; you supply the picker |
| FieldGroup | `rows` (each with `key`) | per row, RN TextInput |
| NumberField | `value: number \| null`, `onChange` | controlled; typed text commits on blur |
| StepperControl | `value: number`, `onChange` | controlled; typed text commits on blur |
| OtpField | `value`, `onChangeText` | controlled |
| Checkbox / Toggle | `select` (+ `onChange`) | controlled; **pass `accessibilityLabel`** |
| Radio | `select` (+ `onPress`) | controlled; **pass `accessibilityLabel`** |
| RadioRow / CheckboxRow / ToggleRow | `label`, `select` | controlled; label is the a11y name |
| ControlRow | `label`, `kind`, `control` | low-level layout row |
| DatePicker | `value`, `onChange` (+ `mode: 'range'` for ranges) | controlled; visible month is internal and seeded once |
| DateWheel / TimeWheel / WheelPicker | `value` (or `hour` and `minute`, or `columns`), `onChange` | controlled |
| PopoverItem | `label` | controlled `selected`; no container provided |

<!--
Verification (2026-10-07) against packages/ds/src: every prop name, type, union and default in the draft matched source.
Corrections/additions: darkDemo also sets padding + borderRadius; width note (SearchField/StepperControl have no alignSelf wrapper);
silently overridden props (SearchField returnKeyType, TextArea multiline, MessageInput onSubmitEditing, CheckboxRow/ToggleRow onPress);
SearchField/FieldGroup editable={false} has no visual change; StepperControl disabled keeps box colours and valid blur always calls onChange;
NumberField re-syncs draft and clears it on invalid blur; DatePicker outside days selectable, title not pressable, Scroll headers have no arrows;
WheelPicker value-not-found highlights first item; DateWheel/TimeWheel have no accessibilityLabel prop and no exported props type;
PopoverItem followText kills row a11y for any type; ControlRow kind/control required; extra hard-coded a11y strings.
-->

---

<a id="nhóm-display"></a>
# Nhóm: display

# @gr/ds API cheatsheet: ListItem, Accordion, Chip, Tag, Feedback, Progress, BottomSheet

I checked every prop name, type, literal union and default against the source in `/Users/duncreative/Coding Agent/Gram-Golf/packages/ds/src/ui/{ListItem,Accordion,Chip,Tag,Feedback,Progress,BottomSheet}/*`, the barrel `packages/ds/src/index.ts`, `theme/ThemeProvider.tsx`, `theme/useTheme.ts` and `ui/a11y.ts`. I also checked the galleries at `apps/golf/app/(dev)/ds/{listitem,chip,tag,feedback,progress,bottomsheet}.tsx`; Accordion's gallery is in `listitem.tsx`. Every icon name used below exists in `icons/generated.ts`.

## Rules for every component below

- **Import from `@gr/ds` only.** Every component and type listed here is re-exported from `packages/ds/src/index.ts`. The style helpers (`listItemStyles`, `chipStyles`, `STATUS_ICON` and the rest) are **not** exported.
- **A `ThemeProvider` must wrap the tree.** Every component calls `useTheme()`. Without a provider it throws `useTheme: bọc app trong <ThemeProvider>`. The app root already has one (`apps/golf/app/_layout.tsx`: `<ThemeProvider scheme="auto">`).
  - `ThemeProvider` takes `scheme?: 'auto' | 'light' | 'dark'` (default `'auto'`) and `emphasis?: 'neutral' | 'brand'` (default `'neutral'`).
  - The `Scheme` and `Emphasis` types are exported, but there is no named props type for `ThemeProvider`.
- **Figma values are exact strings.** Enum values are the literal Figma names, including spaces, hyphens and casing. Examples: `'Radio-Card'`, `'Number-Only'`, `'White Overlay'` (with a space) next to `'Black-Overlay'` (with a hyphen), `'Medium - 40px'`, and Button `size="Medium (Base)"`.
- **No `style`, `testID` or `accessibilityLabel` passthrough.** None of these components accepts those props. No table below lists them.
- **State is controlled.** Selection and visibility (`select`, `selected`, `visible`) are never stored inside the component. The only exception is `Accordion`, which can manage itself.
- **Some built-in labels are hardcoded.** You can't change any of these:
  - The close (×) buttons in AlertBanner, InlineMessage and Toast are labelled `"Close"` in English.
  - Tag's remove button is labelled `"Remove"`.
  - BottomSheet's close button is labelled `"Đóng"`.
  - ProgressBar's accessibility label falls back to `"Tiến trình"` when there is no `label`.
- **String-only text wrapping.** Accordion `children` and Dialog `body` are wrapped in a styled `<Text>` only when they are a single **string**. A number, or mixed text such as `Điểm: {n}` (React passes that as an array), is rendered raw inside a `View`, and on native that raises "Text strings must be rendered within a <Text>". Pass one template string (`` {`Điểm: ${n}`} ``) or your own `<Text>`. BottomSheet `children` go into a `View` and are never wrapped.

---

## ListItem

```ts
import { ListItem, type ListItemProps, type ListItemType } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `title` | `string` | – | **yes** | Limited to 1 line (`numberOfLines={1}`). Font Body/Base/Medium |
| `type` | `'Inline' \| 'Grouped' \| 'Radio-Card'` | `'Inline'` | | |
| `selected` | `boolean` | `undefined` | | Figma State=Selected. Gives an Active/Accent/Subtle background and an Accent/Strongest title |
| `caption` | `string` | – | | Limited to 2 lines. Font Body/XSmall/Regular |
| `leading` | `ReactNode` | – | | Figma Leading slot (Avatar, DockIcon, Icon) |
| `trailing` | `ReactNode` | – | | Figma Trailing slot. **Ignored when `type='Radio-Card'`** |
| `trailingInteractive` | `boolean` | `undefined` | | Set to `true` when `trailing` is a pressable control (Button, Toggle, Checkbox) |
| `onPress` | `() => void` | – | | |
| `accessibilityLabel` | `string` | – | | Spoken label for a pressable row instead of its title + caption (e.g. spelling an invite code letter by letter). Ignored when the row is not accessible (no `onPress`, or `trailingInteractive`) |

Gotchas:
- **Without `onPress` the row is inert.** The Pressable gets `disabled={!onPress}` and `accessible={false}`, so it shows no pressed feedback and screen readers read title and caption as separate elements. `Inline` and `Grouped` rows also get no role. A `Radio-Card` row keeps `role="radio"` but can't be focused, so give it `onPress`. `selected` styling still applies.
- **Pressable trailing controls need `trailingInteractive`.** Without it, a row with `onPress` takes `role="button"` and wraps the control. On web that is a button inside a button; on iOS the row swallows the child's taps. With `trailingInteractive` the row has no role and is not `accessible`. (`Radio-Card` ignores this, because it ignores `trailing`.)
- **On web, a selected button row is announced as pressed.** When the row is `role="button"`, `selected` becomes `aria-pressed` (through `a11yState`).
- **`Radio-Card` draws its own radio.** The row is `role="radio"` with `checked = !!selected`, and its trailing element is a decorative `<Radio decorative>` that is not focusable. Pass `onPress` and keep the selected index in parent state.
- **Inline rows have no side margin of their own.**
  - `Inline` uses horizontal padding `Margin-Small` (or `Margin-Comfortable` when selected) and radius 0, so it is meant to run full-bleed. Place it outside your screen's horizontal padding.
  - `Grouped` and `Radio-Card` use padding `Spacing/Padding/Small` and radius `Corner-Radius/Base`.
  - The minimum row height is `gr-dm-56` for every type.
- **Background by type.** Inline and Grouped use Neutral/Flat/Default (Hover while pressed). Radio-Card uses Surface/Default.
- **You size the leading element.** The component doesn't size `leading` (its style has a `leadingSize` value, but nothing uses it). The gallery uses `<Avatar size="Medium" .../>`.

```tsx
const [sel, setSel] = useState(0);
const [on, setOn] = useState(true);
const avatar = <Avatar size="Medium" source={{ uri: 'https://i.pravatar.cc/96' }} />;

<ListItem title="Nguyễn Văn A" caption="Handicap 12 · Hà Nội" leading={avatar}
  trailing={<Button size="Small" level="Tertiary" text="Theo dõi" />} trailingInteractive onPress={() => {}} />
<ListItem title="Selected" caption="State=Selected" leading={avatar} selected
  trailing={<Toggle select={on} onChange={setOn} accessibilityLabel="Bật" />} trailingInteractive />
{['Sân 18 lỗ', 'Sân 9 lỗ'].map((x, i) => (
  <ListItem key={x} type="Radio-Card" title={x} caption="Radio-Card" selected={sel === i} onPress={() => setSel(i)} />
))}
<ListItem type="Grouped" title="Grouped" caption="Padding/Small, radius Base" onPress={() => {}} />
```

---

## Accordion

```ts
import { Accordion, type AccordionProps, type AccordionSize, type AccordionTheme } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `title` | `string` | – | **yes** | No line limit. Font: XLarge→Heading/3, Large→Heading/4, Medium→Heading/Subheading |
| `size` | `'XLarge' \| 'Large' \| 'Medium'` | `'Large'` | | Padding: XLarge→Padding/XLarge, otherwise Padding/Medium |
| `theme` | `'Divider' \| 'Box'` | `'Divider'` | | `Divider`: bottom border (Border/Neutral/Subtle), no horizontal padding. `Box`: Support/Neutral/Pale background, radius 2XLarge for XLarge and Large otherwise |
| `expanded` | `boolean` | `undefined` | | **Controlled** when defined |
| `onToggle` | `(next: boolean) => void` | – | | |
| `defaultExpanded` | `boolean` | `false` | | Starting state when uncontrolled |
| `children` | `ReactNode` | – | | |

Gotchas:
- **Controlled or uncontrolled.** The open state is `expanded ?? inner`. If `expanded` is set, the parent owns the state and must update it in `onToggle`. Passing `expanded` without `onToggle` locks the accordion.
- **Only string children are styled.** A single **string** child is wrapped in `Body/Base/Regular` text in Neutral/Base. Anything else is rendered as-is, so numbers and mixed `text {expr}` children need your own `<Text>` (see the rules section).
- **Header accessibility is built in.** The header is `role="button"` with an `expanded` state (and `aria-expanded` on web). The chevron switches between `chevron-down-line` and `chevron-up-line`.
- **Content is mounted only while open.** Closing unmounts it, and there is no animation.

```tsx
<Accordion title="Divider · Large" defaultExpanded>Nội dung mở sẵn. Theme Divider có đường kẻ dưới.</Accordion>
<Accordion title="Box · XLarge" size="XLarge" theme="Box">Theme Box: nền Pale, bo 2XLarge.</Accordion>
// controlled
const [open, setOpen] = useState(false);
<Accordion title="Controlled" expanded={open} onToggle={setOpen}>Nội dung.</Accordion>
```

---

## Chip

```ts
import { Chip, type ChipProps, type ChipVariant, type ChipSize, type ChipLevel } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `text` | `string` | – | **yes** | 1 line. Also the accessible name |
| `variant` | `'Normal' \| 'Advanced' \| 'Number-Only'` | `'Normal'` | | `Advanced` always shows a trailing `chevron-down-line`. `Number-Only` is square (width = height) |
| `size` | `'Medium' \| 'Small' \| 'XSmall'` | `'Small'` | | Height comes from the `Chip/Size/*` token |
| `level` | `'Primary' \| 'Secondary'` | `'Secondary'` | | Primary + selected has no border |
| `icon` | `IconName` | – | | Figma Theme=Leading-Icon |
| `photo` | `ImageSourcePropType` | – | | Figma Theme=Leading-Photo, rendered as an Avatar (Medium→`Small`, Small→`XSmall`, XSmall→`2XSmall`). **Wins over `icon`** |
| `counter` | `string` | – | | Shown only when `variant='Advanced'` (Badge XSmall Neutral Subtle) |
| `select` | `boolean` | `false` | | Controlled |
| `onPress` | `() => void` | – | | |

Gotchas:
- **Always announced as a button.** The chip is `role="button"` with `selected` (`aria-pressed` on web), even without `onPress`. There is no `disabled` prop. The Pressable is never disabled, so a chip without `onPress` still shows the pressed (Hover) colors when touched.
- **You manage selection.** There is no internal toggle; update `select` from `onPress`. For single-select, keep one value in parent state.
- **`Number-Only` needs short text.** The chip is a fixed square, so use 1–2 characters.

```tsx
const [sel, setSel] = useState('Sân 18 lỗ');
{['Sân 18 lỗ', 'Sân 9 lỗ', 'Driving range'].map((x) => (
  <Chip key={x} size="Small" text={x} select={sel === x} onPress={() => setSel(x)} />
))}
<Chip level="Primary" text="Icon" icon="globe-01-line" select />
<Chip variant="Advanced" size="Medium" text="Bộ lọc" counter="3" />
<Chip variant="Number-Only" size="Medium" text="2" select />
```

---

## Tag

```ts
import { Tag, type TagProps, type TagSize } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `text` | `string` | – | **yes** | 1 line |
| `size` | `'Medium' \| 'Small'` | `'Medium'` | | |
| `icon` | `IconName` | – | | Figma Theme=Leading-Icon |
| `photo` | `ImageSourcePropType` | – | | Always an Avatar `2XSmall`, at both sizes. **Wins over `icon`** |
| `error` | `boolean` | – | | Figma State=Error: Negative/Subtle background, Negative border and a Negative remove icon |
| `disabled` | `boolean` | – | | Disables both the press and the remove button, drops the shadow and greys the text. The disabled border wins over the error border; the error background stays |
| `onRemove` | `() => void` | – | | Figma Remove=Yes: shows an `x-small-line` button labelled `"Remove"` |
| `onPress` | `() => void` | – | | Makes the tag pressable (`role="button"`) and turns on the pressed style |

Gotchas:
- **With `onRemove`, the tag body can't be focused.** The outer Pressable is `accessible={!onRemove}`, so screen readers reach only the inner "Remove" button. If you combine `onPress` and `onRemove`, assistive technology can't reach the tag body.
- **Without `onPress` there is no pressed style.** The tag is static.
- **It doesn't stretch.** It uses `alignSelf: 'flex-start'`, so put tags in a `flexDirection: 'row', flexWrap: 'wrap'` container.

```tsx
<Tag text="Remove" onRemove={() => {}} />
<Tag text="Leading-Photo" photo={{ uri: 'https://i.pravatar.cc/64' }} onRemove={() => {}} />
<Tag text="Error" error onRemove={() => {}} />
<Tag size="Small" text="Icon" icon="globe-01-line" />
<Tag text="Pressable" onPress={() => {}} />
```

---

## Feedback

Shared types:
```ts
import { type StatusTheme, type AlertBannerSize, type ToastType, type TooltipColor, type TooltipSize } from '@gr/ds';
// StatusTheme     = 'Neutral' | 'Info' | 'Positive' | 'Warning' | 'Negative'
// AlertBannerSize = 'Medium' | 'Small'
// ToastType       = StatusTheme | 'Subtle'
// TooltipColor    = 'Default' | 'Accent' | 'White Overlay' | 'Black-Overlay'
// TooltipSize     = 'Medium' | 'Small'
```
The status icons are fixed: Neutral and Info use `info-circle-line`, Positive uses `check-solid`, Warning uses `alert-triangle-solid` and Negative uses `x-circle-solid`.

### AlertBanner

```ts
import { AlertBanner, type AlertBannerProps } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `text` | `string` | – | **yes** | Up to 2 lines |
| `theme` | `StatusTheme` | `'Neutral'` | | Solid background. Neutral uses Neutral/Solid with Inverse text, so it flips with light/dark mode |
| `size` | `'Medium' \| 'Small'` | `'Medium'` | | |
| `actionText` | `string` | – | | Renders `<Button type="Main" overlay level="Accent" size="Small">` |
| `onAction` | `() => void` | – | | The button shows whenever `actionText` is set, even without `onAction` |
| `onClose` | `() => void` | – | | Figma Close=True: `x-small-line` button labelled `"Close"` |

Gotchas:
- **Screen readers announce it right away.** It has `accessibilityRole="alert"`.
- **Full-bleed by design.** It has no radius and no margin. The gallery places it outside the screen's horizontal padding.

```tsx
<AlertBanner theme="Info" text="Info — thông báo toàn trang" actionText="Xem" onAction={() => {}} onClose={() => {}} />
<AlertBanner size="Small" theme="Info" text="Small · Info" onClose={() => {}} />
```

### InlineMessage

```ts
import { InlineMessage, type InlineMessageProps } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `text` | `string` | – | **yes** | Figma Caption (Body/XSmall/Regular). No line limit |
| `theme` | `StatusTheme` | `'Neutral'` | | Subtle background, radius Large |
| `title` | `string` | – | | Figma Title=True (Body/Base/DemiBold) |
| `icon` | `IconName` | – | | Figma Theme=Custom: replaces the status icon |
| `actionText` | `string` | – | | Renders `<Button type="Flat" level="Primary" size="Small">` under the text |
| `onAction` | `() => void` | – | | |
| `onClose` | `() => void` | – | | `x-medium-line` button labelled `"Close"` |

Gotcha:
- **It isn't announced automatically.** Unlike AlertBanner and Toast, it has no `alert` role.

```tsx
<InlineMessage theme="Warning" title="Warning" text="Caption mô tả chi tiết, có thể xuống dòng." actionText="Hành động" onAction={() => {}} onClose={() => {}} />
<InlineMessage text="Không title, không action" />
```

### Toast

```ts
import { Toast, type ToastProps } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `title` | `string` | – | **yes** | Body/Base/DemiBold, no line limit |
| `type` | `ToastType` | `'Neutral'` | | `'Subtle'` uses the Popover background with a border and the Neutral icon |
| `caption` | `string` | – | | |
| `actionText` | `string` | – | | `<Button type="Main" overlay size="Small">`, level `Tertiary` for Subtle and `Accent` for the others |
| `onAction` | `() => void` | – | | |
| `onClose` | `() => void` | – | | `x-medium-line` button labelled `"Close"` |

Gotchas:
- **It is only the visual box.** There is no positioning, auto-dismiss timer, animation, queue or provider. The app must render it in an absolutely positioned layer and handle the timeout.
- **How it is announced.** It has `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"` (Android).

```tsx
<Toast type="Neutral" title="Đã lưu" caption="Bài viết đã vào bộ sưu tập" actionText="Mở" onAction={() => {}} onClose={() => {}} />
<Toast type="Negative" title="Lỗi" actionText="Thử lại" onAction={retry} />
```

### Tooltip

```ts
import { Tooltip, type TooltipProps } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `text` | `string` | – | **yes** | Font: Caption/Medium at both sizes |
| `color` | `'Default' \| 'Accent' \| 'White Overlay' \| 'Black-Overlay'` | `'Default'` | | Spell these exactly as shown: **`'White Overlay'`** has a space and **`'Black-Overlay'`** has a hyphen |
| `size` | `'Medium' \| 'Small'` | `'Medium'` | | Medium uses radius Small. Small uses the pill radius (Rounded) |

Gotchas:
- **It is only the bubble.** There is no anchor, arrow (the Figma arrow was dropped), positioning or show/hide logic; the app places it. It is `accessibilityRole="text"`.
- **It doesn't stretch.** It uses `alignSelf: 'flex-start'`.
- **`White Overlay` and `Black-Overlay` are meant for photos or media.** `White Overlay` is a white bubble (White-Solid) and has little contrast on a white page.

```tsx
<Tooltip text="Default" />
<Tooltip text="Accent" color="Accent" />
<Tooltip text="Small" size="Small" />
```

### Dialog

```ts
import { Dialog, type DialogProps } from '@gr/ds';
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `visible` | `boolean` | – | **yes** | Controlled |
| `onRequestClose` | `() => void` | – | **yes** | Called on a scrim tap, on Android back, and by the default secondary button |
| `title` | `string` | – | **yes** | Heading/3, `role="header"` |
| `primaryText` | `string` | – | **yes** | |
| `onPrimary` | `() => void` | – | **yes** | **Doesn't close the dialog by itself** |
| `theme` | `StatusTheme \| 'Default'` | `'Default'` | | Adds only a 2XLarge status icon at the top, colored `Color/Content/<theme>/Light`. `'Default'` has no icon. `'Neutral'` is different and shows `info-circle-line` |
| `body` | `ReactNode` | – | | A string is rendered as Body/Base/Regular; anything else is rendered as-is |
| `secondaryText` | `string` | – | | Renders a Main Tertiary `"Medium (Base)"` button to the left of the primary button |
| `onSecondary` | `() => void` | `onRequestClose` | | |
| `destructive` | `boolean` | – | | Primary button uses `level="Danger"` instead of `"Accent"`. It is not tied to `theme`: `theme="Negative"` does **not** turn it on |

Gotchas:
- **Built on RN `<Modal>`.** It uses `transparent animationType="fade"`. Render it once with `visible` from state; no portal is needed.
- **You close it.** Set your state to false in `onPrimary` yourself.
- **Layout.** The buttons are right-aligned in a row, secondary first, at `Medium (Base)` size. The box has radius XGiant and sits centered over a `Color/Background/Overlay` scrim.

```tsx
const [dlg, setDlg] = useState(false);
<Button text="Mở Dialog" level="Tertiary" size="Medium (Base)" onPress={() => setDlg(true)} />
<Dialog visible={dlg} onRequestClose={() => setDlg(false)} theme="Warning" title="Xoá bài viết?"
  body="Hành động này không hoàn tác được." primaryText="Xoá" destructive onPrimary={() => setDlg(false)} secondaryText="Huỷ" />
```

---

## Progress

```ts
import { ProgressBar, Skeleton, SkeletonText,
  type ProgressBarProps, type SkeletonProps, type SkeletonTextProps,
  type ProgressTheme, type ProgressStatus, type SkeletonShape, type SkeletonSize, type SkeletonHeading } from '@gr/ds';
```

### ProgressBar

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `value` | `number` | – | **yes** | Range **0..1**, not 0..100. Clamped, then rounded to a whole percent |
| `theme` | `'Accent' \| 'Neutral' \| 'Status' \| 'Overlay'` | `'Accent'` | | |
| `status` | `'Positive' \| 'Warning' \| 'Negative'` | `'Positive'` (in effect) | | Read **only** when `theme='Status'` |
| `label` | `string` | – | | Figma Label=True: Body/Base/Regular text above the bar. Also the accessibility label (falls back to `"Tiến trình"`) |

Gotchas:
- **Accessibility.** It is `role="progressbar"` with value min 0, max 100 and now = the percent (`aria-*` on web).
- **No animation and no indeterminate mode.** The bar stretches (`alignSelf: 'stretch'`) and its height is `Element-Size/Popular/4XSmall`.
- **`theme="Overlay"` needs a dark background.** Its track is White-Overlay and its label is On-Dark-Overlay. The gallery wraps it in a `Color/Background/Black-Overlay/Default` box.

```tsx
<ProgressBar value={0.25} theme="Accent" label="Accent · 25%" />
<ProgressBar value={0.75} theme="Status" status="Warning" label="Status Warning" />
<View style={{ padding: t.space('Spacing/Padding/Small'), backgroundColor: t.color('Color/Background/Black-Overlay/Default'), borderRadius: t.radius('Corner-Radius/Base') }}>
  <ProgressBar value={0.6} theme="Overlay" label="Overlay" />
</View>
```

### Skeleton

| Prop | Type | Default | Notes |
|---|---|---|---|
| `shape` | `'Pill' \| 'Round' \| 'Square' \| 'Rectangle'` | `'Rectangle'` | Pill and Round use the Rounded radius. Square and Rectangle use Base |
| `size` | `'Large - 48px' \| 'Medium - 40px' \| 'Small - 32px' \| 'XSmall' \| '2XSmall'` | `'Medium - 40px'` | Exact strings, including the ` - 48px` suffix. Height comes from Image-Size Medium, Small, XSmall, 2XSmall or 3XSmall |
| `width` | `number` | – | **Ignored** for `Round` and `Square`, which are always height×height. `Pill` and `Rectangle` stretch to the parent's width when there is no `width` |

### SkeletonText

| Prop | Type | Default | Notes |
|---|---|---|---|
| `lines` | `1 \| 2 \| 3 \| 5` | `1` | Only these values (there is no 4). With more than one line, the last line is 60% wide |
| `heading` | `'Large' \| 'Medium' \| 'Small'` | – | When set, `lines` is ignored and exactly 1 thicker line is drawn |

Gotchas for both skeletons:
- **Static.** There is no shimmer.
- **Hidden from screen readers.** They set `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`.

```tsx
<Skeleton shape="Round" size="Large - 48px" />
<Skeleton shape="Pill" size="Small - 32px" width={t.layout('Card-padding-medium') * 6} />
<SkeletonText heading="Large" />
<SkeletonText lines={3} />
```

---

## BottomSheet

```ts
import { BottomSheet, type BottomSheetProps, type BottomSheetAction,
  type BottomSheetType, type BottomSheetTitleSize, type BottomSheetAlign, type BottomSheetSecondary } from '@gr/ds';
// BottomSheetAction = { text: string; onPress?: () => void; icon?: IconName }
```

| Prop | Type | Default | Req | Notes |
|---|---|---|---|---|
| `visible` | `boolean` | – | **yes** | Controlled |
| `onClose` | `() => void` | – | **yes** | Called on a scrim tap, by the × button and on Android back |
| `children` | `ReactNode` | – | | The content slot. **Not declared in `BottomSheetProps`**; the component takes `PropsWithChildren<BottomSheetProps>`, so a wrapper typed with `BottomSheetProps` has to add `children` itself. Body padding is only `Padding/2XSmall` (gap 2XSmall), so add your own padding |
| `type` | `'Modal' \| 'Action'` | `'Modal'` | | Changes only the colors. Modal uses Surface/Default with an Overlay grabber. Action uses the Container background with a Support/Neutral/Solid grabber |
| `heading` | `string` | – | | |
| `subtitle` | `string` | – | | |
| `size` | `'Medium' \| 'Small' \| 'XSmall'` | `'Medium'` | | Title-Block size. Heading font: Heading/Subheading, Body/Base/DemiBold or Body/XSmall/DemiBold. Subtitle font: Body/Base/Regular, Body/XSmall/Regular or Body/XSmall/Regular |
| `align` | `'Start' \| 'Center'` | `'Start'` | | Title alignment |
| `divider` | `boolean` | – | | Line under the header (Border/Neutral/Pale) |
| `primary` | `BottomSheetAction` | – | | Main Accent Large button. Its `icon` becomes the button's `leadingIcon` |
| `secondary` | `BottomSheetAction` | – | | |
| `secondaryLayout` | `'None' \| 'Button' \| 'Icon' \| 'Text' \| 'Secondary-Vertical' \| 'Text-Vertical'` | `secondary ? 'Button' : 'None'` | | See the list below |
| `systemIndicator` | `boolean` | `true` | | Adds a fixed `Padding/2XLarge` spacer at the bottom |
| `closeButton` | `boolean` | `true` | | `x-medium-line` IconButton (Flat Primary Small) in the header, labelled `"Đóng"` |

What each `secondaryLayout` value renders:
- `Button` and `Secondary-Vertical`: a Main Tertiary Large button.
- `Icon`: an IconButton Main Tertiary Large, with `secondary.text` as its accessibility label.
- `Text` and `Text-Vertical`: a Flat Primary Large button.
- The two `*-Vertical` values stack the buttons with primary on top.

Gotchas:
- **Built on RN `<Modal>`.** It uses `transparent animationType="slide"` with a bottom-aligned scrim and a `KeyboardAvoidingView` (padding behavior on iOS). There is **no drag or swipe gesture**; the grabber is only decoration.
- **The header needs a heading or the close button.** The header row renders only when `heading || closeButton`. With `closeButton={false}` and no `heading`, the header is gone, **and so is `subtitle`**.
- **The footer needs a primary or secondary action.** The footer renders only when `primary || secondary`.
- **`secondaryLayout='Icon'` needs `secondary.icon`.** Without an icon it quietly falls back to a Tertiary `Button`.
- **To hide the secondary button, omit `secondary`.** If you pass `secondary` with `secondaryLayout='None'`, a Tertiary button still renders in the row.
- **Horizontal button order.** Secondary is on the left and primary on the right, each `flex: 1`. The Icon layout keeps its natural width.
- **Long content.** Put a `ScrollView` in `children`. The container uses `flexShrink: 1` and the body uses `minHeight: 0`, so the body scrolls instead of overflowing.
- **`systemIndicator` is not a real safe-area inset.** It is a fixed spacer.

```tsx
const [open, setOpen] = useState(false);
<BottomSheet
  visible={open}
  onClose={() => setOpen(false)}
  heading="Chia sẻ bài viết"
  subtitle="Chọn nơi muốn chia sẻ"
  divider
  primary={{ text: 'Chia sẻ', icon: 'share-01-line', onPress: () => setOpen(false) }}
  secondary={{ text: 'Huỷ', icon: 'x-medium-line', onPress: () => setOpen(false) }}
  secondaryLayout="Button"
>
  <View style={{ padding: t.space('Spacing/Padding/Medium') }}>
    <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">Nội dung sheet (Items slot).</Text>
  </View>
</BottomSheet>

// Action sheet (menu list)
<BottomSheet visible={open} onClose={() => setOpen(false)} type="Action" heading="Tuỳ chọn bài viết" divider>
  <PopoverItem type="Item" icon="bookmark-line" label="Lưu bài viết" />
  <PopoverItem type="Item" icon="trash-line" label="Xoá" caption="Không thể hoàn tác" />
</BottomSheet>
```

---

## Quick table: what each component needs

| Component | Controlled prop | Built on a Modal | Background it needs | Built-in announcement |
|---|---|---|---|---|
| ListItem | `selected` | no | any | `button` (selected → `aria-pressed` on web) or `radio` + checked. No role with `trailingInteractive`. Not focusable without `onPress` |
| Accordion | `expanded` (optional) | no | any | header `button` + expanded |
| Chip | `select` | no | any | `button` + selected/pressed |
| Tag | – | no | any | plain text. `button` with `onPress`. Only the inner "Remove" button when `onRemove` is set |
| AlertBanner | – | no | full-bleed | `alert` |
| InlineMessage | – | no | any | none |
| Toast | – | no (the app positions it) | any | `alert` + polite live region |
| Tooltip | – | no (the app anchors it) | Overlay colors are meant for media | `text` |
| Dialog | `visible` | yes (fade) | – | `header` on the title |
| ProgressBar | `value` | no | **dark** for `theme="Overlay"` | `progressbar` with a value, label falls back to "Tiến trình" |
| Skeleton / SkeletonText | – | no | any | hidden |
| BottomSheet | `visible` | yes (slide) | – | close button "Đóng" |

---

### Changes from the draft (all checked against the source)

1. **ThemeProvider.** `emphasis` is `'neutral' | 'brand'`. `Scheme` and `Emphasis` are exported; there is no props type.
2. **Hardcoded labels.** Added ProgressBar's `"Tiến trình"` fallback.
3. **String-only wrapping (new).** Accordion `children` and Dialog `body` are wrapped only when they are a single string. A number or mixed text crashes on native.
4. **ListItem.**
   - Without `onPress`, `Radio-Card` keeps `role="radio"`. Every row without `onPress` is `accessible={false}`.
   - A selected button row maps to `aria-pressed` on web.
   - Added the minimum height `gr-dm-56` and the backgrounds for each type.
   - `leadingSize` is computed but never used.
5. **Chip.** A chip without `onPress` still shows pressed colors, because the Pressable is never disabled.
6. **Tag.**
   - `disabled` also drops the shadow and greys the text; the error background stays.
   - `photo` is 2XSmall at both sizes.
   - Fixed the quick-table row: plain text, a button with `onPress`, or only "Remove" when `onRemove` is set.
7. **Feedback.**
   - Close icons differ: `x-small-line` in AlertBanner, `x-medium-line` in InlineMessage and Toast.
   - Dialog `theme='Neutral'` shows an icon, unlike `'Default'`. The icon is colored `Content/<theme>/Light`. Added the button layout.
   - Tooltip radius is Small for Medium and Rounded for Small. Its role is `text`.
8. **Progress.** Added the bar height token, the Skeleton radius and height mapping, and the label font.
9. **BottomSheet.**
   - `children` is not part of `BottomSheetProps` (it comes from `PropsWithChildren`).
   - `subtitle` disappears when there is no header.
   - The footer renders only when `primary || secondary`.
   - The close button is an `x-medium-line` IconButton (Flat Primary Small).
   - Added the subtitle fonts and grabber colors.
   - `Secondary-Vertical` uses the Tertiary Button.
---

<a id="nhóm-social"></a>
# Nhóm: social

# @gr/ds API cheatsheet: PostCard, Story, Comment, Social

> **Verification notes (2026-10-07):** I checked every prop name, type, literal union, default and export in this sheet against `packages/ds/src/ui/{PostCard,Story,Comment,Social}/*.tsx`, their `*Styles.ts` files and `packages/ds/src/index.ts` (lines 114–125). The draft's prop tables were accurate: no prop, union or default was wrong, and no exported component or type was missing. These are the corrections and additions:
> - The overlay rule was too broad. `VideoControlOverlay` draws its own black scrim, and `StoryBottomContent` draws its own bottom scrim by default. `MediaInfoPill`'s background is translucent **white** in light mode.
> - The sheets do not pass `type='Modal'`. They get it from `BottomSheet`'s default.
> - "Count fields are strings" has exceptions: `CollectionData.count`, `CommentMediaItem.more`, and `StoryHeader` `count`/`active`/`progress` are numbers.
> - The `More-item` ("Thêm") action always renders in `PostCard` and `StoryHeader`, even without `onMore`. `CommentItem` không có `onMore` → không vẽ ⋯ (2026-10-08).
> - `CommentItem` used to render a second, initials-only avatar; fixed 2026-10-08 with `Identity showAvatar={false}` (see its gotchas).
> - Added the hard-coded placeholders and accessibility labels, the "+" / image / location button wiring in `CommentComposer`, and the `CommentMediaItem` label when a video has no `duration`.

Everything below comes from the source files under `/Users/duncreative/Coding Agent/Gram-Golf/packages/ds/src/ui/{PostCard,Story,Comment,Social}/` and the galleries in `/Users/duncreative/Coding Agent/Gram-Golf/apps/golf/app/(dev)/ds/{post,story,comment,social}.tsx`. The usage snippets are copied or adapted from those galleries. `apps/golf` passes `tsc --noEmit` with exit 0, so the gallery code compiles.

## Rules that apply to all four groups

- **Import** everything from `'@gr/ds'`, both components and types (including `StoryRatio`, `CommentMediaType`, `CollectionItemState` and so on). `IconName` is exported from there too.
- **ThemeProvider is required.** Every component calls `useTheme()`, which throws `useTheme: bọc app trong <ThemeProvider>` when there is no provider above it. The app already wraps its root in `<ThemeProvider scheme="auto">` (`apps/golf/app/_layout.tsx`). Isolated renders such as tests or Storybook need their own provider.
- **User-facing strings are hard-coded in Vietnamese** and most cannot be changed through props: "Theo dõi", "Thích", "Trả lời", "Đã gửi", "bài viết", the search placeholders, the accessibility labels, and so on. The props that do let you change text are listed with their defaults in each section.
- **Display counts take strings, not numbers.** `likes`, `comments`, `shares`, `label`, `duration` and `time` are all `string`. Format them yourself (for example `"1,2K"`). There are exceptions that take `number`: `CollectionData.count`, `CommentMediaItem.more`, and `StoryHeader`'s `count`, `active` and `progress`.
- **Overlay-colored content needs a dark area behind it.** Anything marked `overlay`, plus `MediaInfoPill`, `VideoControlOverlay`, `StoryHeader` and `StoryBottomContent`, draws its text and icons with `Color/Content/On-Dark-Overlay/*`. That is near-white (`#ffffffef` / `#ffffffc6`) in both light and dark mode. Some of these components bring their own backing and some do not:
  - `MediaInfoPill`'s own background is `Color/Background/Surface/Overlay`. That is translucent **white** (`#ffffff34`) in light mode and translucent black in dark mode, so in light mode on a light background it is unreadable.
  - `VideoControlOverlay` paints its own `Black-Overlay` scrim (`#01010148`) in every state except `Playing`.
  - `StoryBottomContent` paints a bottom gradient scrim by default (`scrim = true`).
  - `StoryHeader` has **no** scrim of its own. `StoryViewer` adds one.
- **The four sheets** (`CommentsSheet`, `LikesSheet`, `ShareSheet`, `CollectionPickerSheet`) wrap `BottomSheet` with `heading` and `divider`. They do not pass `type`, so they get `BottomSheet`'s default, `type='Modal'`. They take `visible: boolean` and `onClose: () => void` (both **required**) from `Pick<BottomSheetProps, 'visible' | 'onClose'>`. You cannot pass other `BottomSheet` props such as `primary`, `closeButton` or `subtitle` through them.
- **There is no `style` prop on any of these components.** Control width and margins with a wrapping `View`.

---

## 1. PostCard group (`ui/PostCard/PostCard.tsx`)

Exported components: `SocialAction`, `Identity`, `MediaInfoPill`, `VideoControlOverlay`, `PostMedia`, `PostCaption`, `PostCard`.
Exported types: `SocialActionProps`, `IdentityProps`, `IdentityUser`, `MediaInfoPillProps`, `VideoControlOverlayProps`, `PostMediaProps`, `PostCaptionProps`, `PostCardProps`. These literal-union types come from `postCardStyles.ts`: `SocialActionType`, `SocialActionSize`, `MediaRatio`, `MediaPillType`, `VideoState`.

Literal unions:
```ts
type SocialActionType = 'Like' | 'Comment' | 'Share' | 'Save' | 'Attachment' | 'More-item';
type SocialActionSize = 'Medium' | 'Small';
type MediaRatio      = 'Square' | 'Portrait' | 'Landscape';   // aspectRatio 1 | 4/5 | 16/9 (width/height)
type MediaPillType   = 'Counter' | 'Muted' | 'Duration-Muted' | 'Duration' | 'Link';
type VideoState      = 'Ended' | 'Error' | 'Loading' | 'Playing' | 'Paused';
interface IdentityUser { name: string; handle?: string; avatar?: ImageSourcePropType; verified?: boolean }
```

### `SocialAction` (Figma Post-action at Medium, Comment-Action at Small)
| Prop | Type | Default | Req |
|---|---|---|---|
| `type` | `SocialActionType` | — | **yes** |
| `active` | `boolean` | `false` | |
| `label` | `string` (count, or text such as "Trả lời") | — | |
| `size` | `SocialActionSize` | `'Medium'` | |
| `overlay` | `boolean` (on a photo or dark background) | — | |
| `onPress` | `() => void` | — | |
| `accessibilityLabel` | `string` | **falls back to `type`** (for example the English "Like" or "More-item") | |

```tsx
<SocialAction type="Like" label="128" active={liked} onPress={() => setLiked(!liked)} accessibilityLabel="Thích" />
```
Gotchas:
- **Always pass `accessibilityLabel`.** Without it, screen readers announce the raw type name in English.
- `active` switches the icon from `-line` to `-solid`. It is exposed as `accessibilityState.selected`, and on web as `aria-pressed`. The component is stateless, so the parent owns `active`.
- `label` is only rendered when it is truthy. `""` or `undefined` gives an icon-only action.
- Icons by type:
  - `Like`: `heart-*`
  - `Comment`: `message-text-circle-*`
  - `Share`: `paper-plane-*`
  - `Save`: `bookmark-*`
  - `Attachment`: `marker-pin-01-*` (map pin)
  - `More-item`: `dots-horizontal-line`, even when active
- The `More-item` icon is always `Element-Size/Popular/Base`, whatever `size` is.
- Colors: Neutral/Light when inactive and Neutral/Base when active. With `overlay`, On-Dark-Overlay/Base when inactive and /Strongest when active.

### `Identity` (author block: avatar, name, verified badge, time, optional location)
| Prop | Type | Default | Req |
|---|---|---|---|
| `user` | `IdentityUser` | — | **yes** |
| `meta` | `string` (time) | — | |
| `location` | `string` | — | |
| `overlay` | `boolean` | — | |
| `avatarSize` | `'XSmall' \| 'Small' \| 'Medium'` | `'XSmall'` | |
| `showAvatar` | `boolean` (`false` drops the avatar; `CommentItem` uses it because it draws its own ringed avatar) | `true` | |

```tsx
<Identity user={{ name: 'Nguyễn Minh Anh', avatar: { uri: '…' }, verified: true }} meta="2 giờ" location="Sân golf Long Thành" />
```
Gotchas:
- **`user.handle` is NOT rendered.** To show a handle, pass it as `meta` (this is what `LikesSheet` does).
- The "·" separator dot only appears when `meta` is set. `location` gets its own second row with a `marker-pin-01-line` icon.
- **An avatar is rendered unless `showAvatar={false}`.** With no `avatar`, it shows the first character of `name` using the `'Neutral'` theme. With an avatar it uses the `'Photo'` theme.
- The root has `flex: 1`, so it takes all free space in a row.

### `MediaInfoPill`
| Prop | Type | Default | Req |
|---|---|---|---|
| `type` | `MediaPillType` | — | **yes** |
| `text` | `string` | — | |

```tsx
<MediaInfoPill type="Duration-Muted" text="00:44" />
```
Gotchas:
- This is an overlay pill with white text on a translucent background (white in light mode), so it needs a dark or image background. The gallery puts it on `Color/Background/Inverse/Solid/Default`.
- `type='Muted'` is icon-only and ignores `text`.
- Icons by type:
  - `Counter`: `image-list-line`
  - `Muted` and `Duration-Muted`: `volume-x-line`
  - `Duration`: `volume-max-line`
  - `Link`: `globe-01-line`
- The pill has no press handler or accessibility role of its own. Wrap it in a `Pressable` if it needs to be tappable.

### `VideoControlOverlay`
| Prop | Type | Default | Req |
|---|---|---|---|
| `state` | `VideoState` | — | **yes** |
| `onPlay` | `() => void` (state `Paused`, play IconButton labelled "Phát") | — | |
| `onReplay` | `() => void` (state `Ended`, button "Xem lại") | — | |
| `onRetry` | `() => void` (state `Error`, button "Thử lại") | — | |
| `errorTitle` | `string` | `'Không thể phát video'` | |
| `errorCaption` | `string` | `'Vui lòng chờ một lúc và thử lại'` | |

Gotchas:
- It returns `null` when `state='Playing'`.
- It is positioned `absolute` and fills its parent, so the parent must be positioned and sized. Normally you use it through `PostMedia type="Video"`, not directly.
- In every state except `Playing` it paints its own `Black-Overlay` scrim with `Corner-Radius/Large` corners.
- `Loading` shows an `ActivityIndicator` (accessibility label "Đang tải").

### `PostMedia` (carousel, video, or link frame)
| Prop | Type | Default | Req |
|---|---|---|---|
| `sources` | `ImageSourcePropType[]` | — | **yes** |
| `type` | `'Image' \| 'Video' \| 'Link'` | `'Image'` | |
| `ratio` | `MediaRatio` | `'Square'` | |
| `indicator` | `'None' \| 'Counter' \| 'Page-Control'` | `'Page-Control'` | |
| `videoState` | `VideoState` | `'Paused'` | |
| `muted` | `boolean` | `true` | |
| `duration` | `string` | — | |
| `onToggleMute` | `() => void` | — | |
| `videoOverlayProps` | `Omit<VideoControlOverlayProps, 'state'>` | — | |
| `domain` | `string` (Link) | — | |
| `onOpenLink` | `() => void` (Link) | — | |
| `player` | `ReactNode` (slot for a real video player such as expo-video; replaces the first image) | — | |

```tsx
<PostMedia type="Video" sources={[IMG(4)]} ratio="Landscape" videoState={vs} duration="00:44"
  videoOverlayProps={{ onPlay: () => setVs('Playing'), onReplay: () => setVs('Playing'), onRetry: () => setVs('Loading') }}
  onToggleMute={() => {}} />
<PostMedia sources={[IMG(5), IMG(6)]} ratio="Portrait" indicator="Counter" />
<PostMedia type="Link" sources={[IMG(7)]} ratio="Landscape" domain="golfrelax.app.vn" onOpenLink={() => {}} />
```
Gotchas:
- Multi-image mode is **automatic**. It turns on when `type==='Image'` and `sources.length > 1`, and renders a paging horizontal `ScrollView`.
  - The current page is internal state, updated on `onMomentumScrollEnd`, and is not exposed.
  - Images get their width from `onLayout`, so they have width 0 on the first frame.
  - `player` is ignored in multi mode.
- `indicator` only applies in multi mode. `'Counter'` shows a top-right "n/N" pill (1-based). `'Page-Control'` shows overlay dots at the bottom. `'None'` shows neither.
- Video mode:
  - `videoState` is fully controlled. The component never changes state itself; you drive it from your player.
  - `muted` only changes the pill and its accessibility label. It does not mute anything.
  - The mute pill in the bottom-right is always pressable and calls `onToggleMute`. Its accessibility label is "Bật tiếng" when muted and "Tắt tiếng" otherwise.
  - **With no `duration`, the pill always shows the `Muted` icon, even when `muted={false}`.** The accessibility label still switches.
- Link mode:
  - The domain pill (bottom-left, `accessibilityRole="link"`) and the top-right link `IconButton` (accessibility label "Mở liên kết") both call `onOpenLink`.
  - It shows only `sources[0]`.
- The frame has rounded `Corner-Radius/Large` corners, a `Surface/Alt` background, and fills its parent's width (`alignSelf: 'stretch'`).

### `PostCaption`
| Prop | Type | Default | Req |
|---|---|---|---|
| `text` | `string` | — | **yes** |
| `expanded` | `boolean` (controlled when set) | internal state | |
| `onToggle` | `(next: boolean) => void` | — | |
| `moreText` | `string` | `'xem thêm'` | |

Gotchas:
- It works both ways: leave out `expanded` for uncontrolled behaviour, or pass `expanded` together with `onToggle` to control it. A tap toggles in both directions (expand and collapse).
- It clamps to 2 lines. Tapping is disabled unless the text actually runs past 2 lines, which is measured with a hidden, unclamped copy of the text. `moreText` only shows while collapsed and too long.
- `@mention` and `#hashtag` are colored `Accent/Base` only when **preceded by whitespace** (regex `\s[@#][\w\p{L}]+`). A tag at the very start of the string is not highlighted. The highlighted tags are not tappable.

### `PostCard` (Figma `Post-Card/Default`)
| Prop | Type | Default | Req |
|---|---|---|---|
| `user` | `IdentityUser` | — | **yes** |
| `media` | `PostMediaProps` | — | **yes** |
| `time` | `string` | — | |
| `location` | `string` | — | |
| `following` | `boolean` | — | |
| `onFollow` | `() => void` | — | |
| `onMore` | `() => void` | — | |
| `likes` | `string` | — | |
| `liked` | `boolean` | — | |
| `onLike` | `() => void` | — | |
| `comments` | `string` | `'Trả lời'` | |
| `onComment` | `() => void` | — | |
| `shares` | `string` | — | |
| `onShare` | `() => void` | — | |
| `saved` | `boolean` | — | |
| `onSave` | `() => void` | — | |
| `caption` | `string` | — | |

```tsx
<PostCard
  user={USER} time="2 giờ" location="Sân golf Long Thành" onFollow={() => {}} onMore={() => {}}
  media={{ sources: [IMG(1), IMG(2), IMG(3)], ratio: 'Square' }}
  likes="128" liked={liked} onLike={() => setLiked(!liked)} comments="Trả lời" shares="12"
  saved={saved} onSave={() => setSaved(!saved)}
  caption="Buổi sáng đẹp trời ở @longthanh — birdie hố 7 #golf"
/>
```
Gotchas:
- `liked` and `saved` are controlled. The parent toggles them.
- The "Theo dõi" button (Secondary, XSmall) only renders when `onFollow` is set **and** `following` is falsy. Once you follow, it is hidden, not swapped to "Đang theo dõi".
- **The "Thêm" (More-item) action always renders**, even without `onMore`.
- The Save action never shows a count.
- The caption is always the uncontrolled `PostCaption`. You cannot control expand from `PostCard`.
- Action accessibility labels are fixed: "Thích", "Bình luận", "Chia sẻ", "Lưu", "Thêm".
- The card stretches to the full width with a `Surface/Default` background.
  - The header, footer and caption have `Spacing/Padding/Medium` horizontal padding.
  - The media sits edge to edge with no horizontal padding, but keeps its `Corner-Radius/Large` rounding.

---

## 2. Story group (`ui/Story/StoryViewer.tsx`)

Exported components: `StoryHeader`, `StoryBottomContent`, `StoryViewer`.
Exported types: `StoryHeaderProps`, `StoryBottomContentProps`, `StoryViewerProps`, and `StoryRatio` (from `storyStyles.ts`).

```ts
type StoryRatio = 'Fill' | '1.1' | '16:9';   // '1.1' means 1:1 (Figma name, verbatim)
```

### `StoryHeader`
| Prop | Type | Default | Req |
|---|---|---|---|
| `user` | `IdentityUser` | — | **yes** |
| `count` | `number` (number of segments) | — | **yes** |
| `active` | `number` (0-based index of the current segment) | — | **yes** |
| `progress` | `number` (0..1, progress of the current segment) | — | **yes** |
| `time` | `string` | — | |
| `location` | `string` | — | |
| `following` | `boolean` | — | |
| `onFollow` | `() => void` | — | |
| `onMore` | `() => void` | — | |
| `onClose` | `() => void` (the × button, labelled "Đóng", only shows when set) | — | |

Gotchas:
- Everything here is overlay colored, and it has no scrim of its own. **It must sit on a dark or image background.**
- Segment bars (`ProgressBar theme="Overlay"`) fill as follows: index `< active` is full, index `=== active` shows `progress`, later ones are empty.
- **No animation or timer is built in.** The app drives `progress` and `active`.
- The follow button (Primary overlay, "Theo dõi") follows the same rule as in PostCard: it shows when `onFollow` is set and `!following`.
- **The "Thêm" (More-item) action always renders**, even without `onMore`.

### `StoryBottomContent`
| Prop | Type | Default | Req |
|---|---|---|---|
| `caption` | `string` | — | |
| `reply` | `boolean` (show the reply row) | `true` | |
| `value` | `string` | — | |
| `onChangeText` | `(v: string) => void` | — | |
| `placeholder` | `string` | `'Gửi tin nhắn…'` | |
| `liked` | `boolean` | — | |
| `onLike` | `() => void` | — | |
| `onSend` | `() => void` | — | |
| `sending` | `boolean` (makes the input non-editable and disables send) | — | |
| `sent` | `boolean` (shows an "Đã gửi" badge in the field) | — | |
| `scrim` | `boolean` (bottom gradient) | `true` | |

Gotchas:
- **The send button is disabled whenever `!value`.** You have to control `value` and `onChangeText`; otherwise send can never be pressed.
- `sent` is not reset automatically. The gallery resets it in `onChangeText`.
- Fixed accessibility labels: the input is "Trả lời story", the like button is "Thích" (`heart-solid` when `liked`), and send is "Gửi".
- Caption hashtag and mention highlighting follows the same whitespace rule as `PostCaption`.

### `StoryViewer` (full screen)
`StoryViewerProps extends StoryHeaderProps`, so `user`, `count`, `active` and `progress` are **required** at the top level. The rest of the header props pass through as well. It adds these:

| Prop | Type | Default | Req |
|---|---|---|---|
| `source` | `ImageSourcePropType` | — | |
| `media` | `ReactNode` (video or player slot, takes priority over `source`) | — | |
| `ratio` | `StoryRatio` | `'Fill'` (`Fill` uses `cover` and is absolute-filled; the others use `contain`, full width, centered vertically) | |
| `bottom` | `StoryBottomContentProps` | — | |
| `topInset` | `number` | `0` | |
| `bottomInset` | `number` | `0` | |
| `onPrev` | `() => void` (tap the left half) | — | |
| `onNext` | `() => void` (tap the right half) | — | |

```tsx
const insets = useSafeAreaInsets();
<StoryViewer
  source={{ uri: `https://picsum.photos/seed/story${active}/900/1600` }}
  user={USER} time="3 giờ" location="Đà Lạt Palace Golf" count={4} active={active} progress={0.4}
  onFollow={() => {}} onMore={() => {}} onClose={() => {}}
  onPrev={() => setActive(Math.max(0, active - 1))} onNext={() => setActive(Math.min(3, active + 1))}
  topInset={insets.top} bottomInset={insets.bottom}
  bottom={{ caption: 'Sương sớm trên green #dalat @golfrelax', value: msg,
    onChangeText: (v) => { setMsg(v); setSent(false); }, liked, onLike: () => setLiked(!liked),
    onSend: () => { setSent(true); setMsg(''); }, sent }}
/>
```
Gotchas:
- The root is `flex: 1` with a fixed `Color/Background/Black-Solid/Default` background that does not change with the scheme. Render it as a full screen, not inside a `Screen` component or a `ScrollView`.
- **Safe-area handling is your job.** Pass the insets from `react-native-safe-area-context` as `topInset` and `bottomInset`.
- **If `bottom` is omitted, the reply row still renders**, because `reply` defaults to `true`. Pass `bottom={{ reply: false }}` to hide it.
- `StoryViewer` draws both scrim gradients. The top one is always on, and the inner `StoryBottomContent` is always rendered with `scrim={false}`. `bottom.scrim === false` turns off the bottom gradient only.
- The prev and next tap zones cover the whole screen underneath the header and bottom content. Their accessibility labels are "Trước" and "Sau".
- Clamping `active`, auto-advancing and timing are all the app's job.

---

## 3. Comment group (`ui/Comment/Comment.tsx`)

Exported components: `CommentMediaItem`, `CommentItem`, `CommentThread`, `CommentComposer`, `CommentsSheet`.
Exported types: `CommentMediaItemProps`, `CommentData`, `CommentItemProps`, `CommentThreadProps`, `CommentComposerProps`, `CommentsSheetProps`, plus `CommentMediaType` and `CommentMediaSize` from `commentStyles.ts`.

```ts
type CommentMediaType = 'Image' | 'Video' | 'More' | 'Loading';
type CommentMediaSize = 'Medium' | 'Small';   // Medium = Image-Size/XLarge, Small = Image-Size/Medium (square)
interface CommentData {
  id: string;               // required, used as the React key for replies
  user: IdentityUser;
  time?: string;
  text: string;
  media?: CommentMediaItemProps[];
  likes?: string;
  liked?: boolean;
  attachment?: string;      // e.g. a place name, rendered as an Attachment (pin) action
}
```

### `CommentMediaItem`
| Prop | Type | Default | Req |
|---|---|---|---|
| `type` | `CommentMediaType` | `'Image'` | |
| `size` | `CommentMediaSize` | `'Medium'` | |
| `source` | `ImageSourcePropType` (ignored when `type='Loading'`) | — | |
| `duration` | `string` (Video, **only shown at size `Medium`**) | — | |
| `more` | `number` (type `More`, renders "+N") | — | |
| `onPress` | `() => void` | — | |
| `accessibilityLabel` | `string` | Depends on type: Video gives "Video {duration}", or just "Video" with no duration. More gives "Thêm {more} ảnh". Loading gives "Đang tải". Image gives "Ảnh đính kèm". | |

```tsx
<CommentMediaItem source={IMG(4)} />
<CommentMediaItem type="Video" source={IMG(5)} duration="00:12" />
<CommentMediaItem type="More" source={IMG(6)} more={5} />
<CommentMediaItem type="Loading" />
```
Gotchas:
- With no `onPress`, it is disabled and has the role `image`. With `onPress`, the role is `imagebutton`.
- Video and More draw a `Black-Overlay` scrim over the image.

### `CommentItem`
| Prop | Type | Req |
|---|---|---|
| `comment` | `CommentData` | **yes** |
| `onLike` | `(c: CommentData) => void` | |
| `onReply` | `(c: CommentData) => void` | |
| `onAttachment` | `(c: CommentData) => void` | |
| `onMore` | `(c: CommentData) => void` | |

```tsx
<CommentItem comment={ROOT} onReply={(c) => setReply(c.user.name)} />
```
Gotchas:
- Handlers receive the whole `CommentData`.
- `liked` is controlled through the data you pass in. Update your list after `onLike`.
- The reply action's label is always "Trả lời" and there is no reply count.
- **`CommentItem` không có `onMore` → không vẽ ⋯** ("Thêm", More-item): không có thao tác thì không có nút (trước 2026-10-08 nút luôn vẽ, bấm không làm gì).
- Media renders at size `Small` unless an item sets its own `size`.
- The attachment action has no accessibility label, so it is announced by its visible text.
- `user.handle` is not shown.
- **One avatar only.** `CommentItem` draws its own ringed XSmall avatar and renders `Identity` with `showAvatar={false}` (before 2026-10-08 a second, initials-only avatar appeared beside the name).

### `CommentThread`
It accepts everything in `CommentItemProps` except `comment` (that is, the four handlers, which are passed down to every item), plus:

| Prop | Type | Default | Req |
|---|---|---|---|
| `root` | `CommentData` | — | **yes** |
| `replies` | `CommentData[]` | `[]` | |
| `expanded` | `boolean` (controlled when set) | internal state | |
| `onToggle` | `(next: boolean) => void` | — | |
| `previewCount` | `number` | `2` | |

```tsx
<CommentThread root={ROOT} replies={REPLIES} onReply={(c) => setReply(c.user.name)} />
```
Gotchas:
- Collapsed, it shows the first `previewCount` replies plus a Flat button "Xem thêm N trả lời". That button only **expands**: `onToggle` is only ever called with `true`, and there is no collapse UI.
- If you control `expanded`, you must set it to `true` in `onToggle`.
- Replies are indented and keyed by `reply.id`.

### `CommentComposer`
| Prop | Type | Default | Req |
|---|---|---|---|
| `value` | `string` | — | **yes** (always controlled) |
| `onChangeText` | `(v: string) => void` | — | **yes** |
| `onSend` | `() => void` | — | |
| `placeholder` | `string` | `'Viết bình luận…'` | |
| `replyTo` | `string` (name, shown as "Trả lời {replyTo}" with an × button labelled "Bỏ trả lời") | — | |
| `onCancelReply` | `() => void` | — | |
| `attachments` | `CommentMediaItemProps[]` | — | |
| `onAddMedia` | `() => void` | — | |
| `onAddLocation` | `() => void` | — | |
| `leading` | `ReactNode` (replaces the "+" button in the compact state) | — | |
| `sending` | `boolean` | — | |

```tsx
<CommentComposer value={val} onChangeText={setVal} replyTo={reply} onCancelReply={() => setReply(undefined)}
  attachments={att ? [{ source: IMG(7) }, { type: 'Video', source: IMG(8) }] : undefined}
  onAddMedia={() => setAtt(!att)}
  onSend={() => { setVal(''); setAtt(false); setReply(undefined); }} />
```
Gotchas:
- The layout switches **automatically** between two states:
  - **Compact** (no `value`, `replyTo` or `attachments`): the leading "+" button (labelled "Thêm", calls `onAddMedia`) or your `leading` slot, then the input, then send.
  - **Expanded** (as soon as there is a `value`, a `replyTo` or any `attachments`): the input, an attachment row, then an action row with an image button ("Thêm ảnh", calls `onAddMedia`), a location button ("Thêm địa điểm", calls `onAddLocation`) and send. **`CommentComposer` không có `onAddMedia` / `onAddLocation` → không vẽ nút tương ứng** (2026-10-08); nút "+" của trạng thái gọn vẫn vẽ khi không có `leading`.
- Send ("Gửi") is disabled when `sending`, or when the value is empty and there are no attachments.
- `sending` does not disable the text input.
- Attachments render at size `Small` unless an item sets its own `size`.
- The input is `multiline`. Clearing `value`, `replyTo` and `attachments` after sending is up to you.

### `CommentsSheet`
| Prop | Type | Default | Req |
|---|---|---|---|
| `visible` | `boolean` | — | **yes** |
| `onClose` | `() => void` | — | **yes** |
| `threads` | `Array<{ root: CommentData; replies?: CommentData[]; previewCount?: number }>` | — | **yes** |
| `composer` | `CommentComposerProps` | — | **yes** |
| `heading` | `string` | `'Bình luận'` | |
| `onLike` / `onReply` / `onMore` | `(c: CommentData) => void` | — | |

```tsx
<CommentsSheet visible={open} onClose={() => setOpen(false)}
  threads={[{ root: ROOT, replies: REPLIES }, { root: { ...ROOT, id: 'r2', media: undefined, text: 'Bình luận thứ hai không có ảnh.' } }]}
  composer={{ value: val, onChangeText: setVal, replyTo: reply, onCancelReply: () => setReply(undefined), onSend: () => setVal('') }}
  onReply={(c) => setReply(c.user.name)} />
```
Gotchas:
- **`onAttachment` is not wired.** Attachment actions inside the sheet do nothing when tapped.
- Per-thread `expanded` and `onToggle` cannot be passed (the type is `Omit<CommentThreadProps, keyof CommentItemProps | 'expanded' | 'onToggle'>`), so each thread expands with its own internal state.
- `root.id` is the React key for each thread and must be unique.
- The composer sits under the scrolling thread list (`keyboardShouldPersistTaps="handled"`).

---

## 4. Social group (`ui/Social/Social.tsx`)

Exported components: `LikesSheet`, `ShareActionLabel`, `ShareSheet`, `CollectionListItem`, `CollectionPickerSheet`, `CollectionCard`, `MediaItem`.
Exported types: `SocialUser`, `LikesSheetProps`, `ShareAction`, `ShareSheetProps`, `CollectionData`, `CollectionListItemProps`, `CollectionPickerSheetProps`, `CollectionCardProps`, `MediaItemProps`, plus `CollectionItemState` and `MediaItemState` from `socialStyles.ts`.

```ts
interface SocialUser extends IdentityUser { id: string; following?: boolean }
interface ShareAction { icon: IconName; label: string; onPress?: () => void; active?: boolean }
interface CollectionData { id: string; title: string; count?: number; cover?: ImageSourcePropType; covers?: ImageSourcePropType[] }
type CollectionItemState = 'Default' | 'Disabled' | 'Selected' | 'Create-New';
type MediaItemState      = 'Default' | 'Selected' | 'Disabled' | 'Media-Strip';
```

### `LikesSheet`
| Prop | Type | Default | Req |
|---|---|---|---|
| `visible` | `boolean` | — | **yes** |
| `onClose` | `() => void` | — | **yes** |
| `users` | `SocialUser[]` | — | **yes** |
| `onFollow` | `(u: SocialUser) => void` (the follow button only shows when set) | — | |
| `onPressUser` | `(u: SocialUser) => void` | — | |
| `heading` | `string` | `'Lượt thích'` | |
| `search` | `boolean` | `true` | |

```tsx
<LikesSheet visible={likes} onClose={() => setLikes(false)} users={USERS} onFollow={() => {}} />
```
Gotchas:
- Search is internal and local, with the placeholder "Tìm kiếm" fixed. It filters `name` case-insensitively, **but is not diacritic-insensitive**: "nguyen" will not match "Nguyễn".
- The button reads "Đang theo dõi" (Tertiary) when `u.following` is true and "Theo dõi" (Secondary) otherwise. Update `following` in your data after `onFollow`.
- Rows are `accessible={false}`, so `onPressUser` cannot be reached with a screen reader.
- Each row shows `handle` as the meta text, with a `Small` avatar.

### `ShareActionLabel`
Its props are `ShareAction`:
- `icon: IconName` (**required**)
- `label: string` (**required**, also used as the accessibility label)
- `onPress?`
- `active?` (default `false`). It uses the Accent-subtle circle and is exposed as selected (`aria-pressed` on web).

```tsx
<ShareActionLabel icon="link-01-line" label="Sao chép" />
<ShareActionLabel icon="check-line" label="Active" active />
```

### `ShareSheet`
| Prop | Type | Default | Req |
|---|---|---|---|
| `visible` | `boolean` | — | **yes** |
| `onClose` | `() => void` | — | **yes** |
| `users` | `SocialUser[]` | — | **yes** |
| `selectedIds` | `string[]` (controlled) | `[]` | |
| `onToggleUser` | `(u: SocialUser) => void` | — | |
| `message` | `string` | — | |
| `onChangeMessage` | `(v: string) => void` | — | |
| `onSend` | `() => void` | — | |
| `actions` | `ShareAction[]` | `[]` | |
| `heading` | `string` | `'Chia sẻ'` | |

```tsx
<ShareSheet visible={share} onClose={() => setShare(false)} users={USERS}
  selectedIds={sel} onToggleUser={(u) => setSel(toggle(sel, u.id))}
  message={msg} onChangeMessage={setMsg} onSend={() => { setSel([]); setShare(false); }}
  actions={[{ icon: 'link-01-line', label: 'Sao chép' }, { icon: 'plus-line', label: 'Story', active: true }, { icon: 'share-01-line', label: 'Khác' }]} />
```
Gotchas:
- Selection is fully controlled. Toggle `selectedIds` in `onToggleUser`.
- Users appear as a wrapping grid of Large avatars with names. Each tile has `accessibilityRole="checkbox"` with a checked state and an Accent check badge when selected.
- The footer swaps between two states:
  - With nothing selected, it shows the `actions` row.
  - With one or more selected, it shows a message `TextField` (placeholder "Viết lời nhắn…") and an Accent button "Gửi (N)".
- The search field (placeholder "Tìm bạn bè") is always shown; there is no `search` prop. It uses the same local, not diacritic-insensitive filter as `LikesSheet`.
- `actions` are keyed by `label`, so labels must be unique.

### `CollectionListItem`
| Prop | Type | Default | Req |
|---|---|---|---|
| `collection` | `CollectionData` (needed unless `state='Create-New'`) | — | |
| `state` | `CollectionItemState` | `'Default'` | |
| `onPress` | `() => void` | — | |
| `createLabel` | `string` | `'Bộ sưu tập mới'` | |
| `createCaption` | `string` | `'Lưu bài, viết địa điểm,...'` | |

```tsx
<CollectionListItem collection={COLS[1]} />
<CollectionListItem collection={COLS[0]} state="Selected" />
<CollectionListItem collection={COLS[2]} state="Disabled" />
<CollectionListItem state="Create-New" onPress={() => {}} />
```
Gotchas:
- The trailing element depends on `state`:
  - `Default`: an unchecked rounded Checkbox.
  - `Selected`: a solid bookmark. The row is still pressable and calls `onPress`, so the parent can deselect.
  - `Disabled`: a greyed bookmark, and the row is not pressable.
  - `Create-New`: a "+" cover tile.
- In `Default`, the row is not an accessibility element. The Checkbox is, with the label "Chọn", and it calls `onPress`. In every other state the row has the role `button`.
- The count is rendered as `${count ?? 0} bài viết`.
- The cover uses `collection.cover`. `covers` is ignored here.

### `CollectionPickerSheet`
| Prop | Type | Default | Req |
|---|---|---|---|
| `visible` | `boolean` | — | **yes** |
| `onClose` | `() => void` | — | **yes** |
| `collections` | `CollectionData[]` | — | **yes** |
| `selectedIds` | `string[]` | `[]` | |
| `disabledIds` | `string[]` | `[]` | |
| `onToggle` | `(c: CollectionData) => void` | — | |
| `onCreate` | `() => void` (the "Create-New" row only shows when set, at the top of the list) | — | |
| `heading` | `string` | `'Lưu vào bộ sưu tập'` | |

```tsx
<CollectionPickerSheet visible={picker} onClose={() => setPicker(false)} collections={COLS}
  selectedIds={colSel} disabledIds={['c']} onToggle={(c) => setColSel(toggle(colSel, c.id))} onCreate={() => {}} />
```
Gotchas:
- When an id is in both lists, Disabled wins over Selected, and Selected wins over Default.
- There is no "Done" button. Each `onToggle` is the commit.

### `CollectionCard`
| Prop | Type | Req |
|---|---|---|
| `collection` | `CollectionData` | **yes** |
| `onPress` | `() => void` | |
| `onMore` | `() => void` (adds a Flat "Thêm" `dots-horizontal-line` IconButton) | |

```tsx
<View style={{ width: t.size('Image-Size/3XLarge') + t.size('Image-Size/Medium') }}>
  <CollectionCard collection={c} onMore={() => {}} />
</View>
```
Gotchas:
- **It has no intrinsic width.** Wrap it in a sized `View`. The cover aspect ratio is fixed at 175/116.
- The cover is a mosaic of one large tile and two small tiles, filled from `covers[0..2]`.
  - If `covers` is set, `cover` is ignored.
  - If you only give `cover`, it fills the large tile and the two side tiles stay empty.
- When `onMore` is set, the card itself is not an accessibility element (to avoid a button inside a button). Otherwise it is a button labelled with `collection.title`.

### `MediaItem` (Create-Post media tile)
| Prop | Type | Default | Req |
|---|---|---|---|
| `source` | `ImageSourcePropType` | — | **yes** |
| `type` | `'Image' \| 'Video'` | `'Image'` | |
| `state` | `MediaItemState` | `'Default'` | |
| `duration` | `string` (shown only when `type='Video'`) | — | |
| `onPress` | `() => void` | — | |
| `onRemove` | `() => void` (only used in `Media-Strip`) | — | |
| `size` | `number` (tile side in px) | `t.size('Image-Size/2XLarge')` | |
| `square` | `boolean` (no corner radius, for picker grids) | — | |

```tsx
<MediaItem source={IMG(7)} state="Selected" />
<MediaItem source={IMG(9)} type="Video" duration="0:40" state="Selected" />
<MediaItem source={IMG(10)} state="Media-Strip" onRemove={() => {}} />
```
Gotchas:
- What sits in the top-right corner depends on `state`:
  - In `Media-Strip`, an "×" remove button (accessibility label "Bỏ") that calls `onRemove`.
  - In every other state, a rounded Checkbox (label "Chọn"). Its `onChange` is `onPress`. It is checked when `Selected` and disabled when `Disabled`.
- In `Disabled`, the whole tile is not pressable.
- The outer tile is `accessible={false}`. Only the Checkbox or the remove button is announced.
- Selection is controlled through `state`.
- For a 3-column picker grid, pass `size={width/3}` together with `square`.
