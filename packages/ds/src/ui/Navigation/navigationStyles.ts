import type { TextStyle, ViewStyle } from 'react-native';
import type { Theme } from '../../theme/createTheme';
import { paint } from '../../theme/paint';

/**
 * Figma ❖ Pagination — `Pagination` (774:29083: Theme Primary|Secondary|Inline|Manually) + `.Primitives/Pagination/Item` (774:15999: Size XSmall|Small, Level, Select).
 * ❖ Breadcrumbs — `Breadcrumbs` (4031:20161) + `.Primitives/Breadcrumbs/Item` (292:43787: Level Sub|Master, Emphasis Default|Medium).
 * ❖ Stepper — `.Primitives/Stepper/Item` (1625:4827: State Default|Focused|Passed|Error, Style Text|Icon) + `Step-Horizontal` (1625:8089).
 * Manually (nhập số trang) bỏ; Focused của Stepper không dump được → Active/Neutral/Solid + Inverse (spec §7).
 */
export type PaginationTheme = 'Primary' | 'Secondary' | 'Inline';
export type PaginationSize = 'XSmall' | 'Small';

export function paginationStyles(t: Theme, o: { theme: PaginationTheme; size: PaginationSize }): { container: ViewStyle; pages: ViewStyle; item: (select: boolean, pressed?: boolean) => ViewStyle; label: (select: boolean) => TextStyle } {
  const dim = t.size(o.size === 'Small' ? 'Select-Item/Size/Medium' : 'Select-Item/Size/Small');
  const radius = t.radius(o.size === 'Small' ? 'Corner-Radius/Action/Small' : 'Corner-Radius/Action/XSmall');
  const primary = o.theme === 'Primary';
  return {
    container: {
      flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall'), alignSelf: 'flex-start',
      ...(o.theme === 'Inline' ? {} : {
        padding: t.space('Spacing/Padding/XSmall'), borderRadius: t.radius('Corner-Radius/Rounded'),
        backgroundColor: paint(t, 'Button-Tertiary/Background/Default'), borderWidth: 1, borderColor: paint(t, 'Button-Tertiary/Border/Default'), ...t.shadow('Shadow/Action/Tertiary'),
      }),
    },
    pages: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall') },
    item: (select, pressed) => ({
      width: dim, height: dim, borderRadius: radius, alignItems: 'center', justifyContent: 'center',
      backgroundColor: select
        ? t.color(primary ? 'Color/Background/Active/Neutral/Solid' : 'Color/Background/Active/Neutral/Subtle')
        : t.color(pressed ? 'Color/Background/Neutral/Flat/Hover' : 'Color/Background/Neutral/Flat/Default'),
    }),
    label: (select) => ({ ...t.text('Body/XSmall/Medium'), color: t.color(select && primary ? 'Color/Content/Inverse/Strongest' : 'Color/Content/Neutral/Strongest') }),
  };
}

export function breadcrumbsStyles(t: Theme): { row: ViewStyle; item: ViewStyle; label: (last: boolean) => TextStyle; iconSize: number; dashSize: number } {
  return {
    row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.space('Spacing/Gap/3XSmall') },
    item: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/2XSmall'), padding: t.space('Spacing/Padding/2XSmall'), borderRadius: t.radius('Corner-Radius/Small'), backgroundColor: t.color('Color/Background/Neutral/Flat/Default') },
    label: (last) => ({ ...t.text(last ? 'Body/Base/Medium' : 'Body/Base/Regular'), color: t.color('Color/Content/Neutral/Strongest') }),
    iconSize: t.size('Element-Size/Popular/Small'),
    dashSize: t.size('Element-Size/Popular/Base'),
  };
}

export type StepState = 'Default' | 'Focused' | 'Passed' | 'Error';
export interface StepperStyles { row: ViewStyle; step: ViewStyle; head: ViewStyle; dot: (st: StepState) => ViewStyle; dotLabel: (st: StepState) => TextStyle; line: (st: StepState) => ViewStyle; contents: ViewStyle; title: (st: StepState) => TextStyle; caption: (st: StepState) => TextStyle; iconSize: number }
export function stepperStyles(t: Theme): StepperStyles {
  const dim = t.size('Select-Item/Size/Small');
  return {
    row: { flexDirection: 'row', alignSelf: 'stretch' },
    step: { flex: 1, gap: t.space('Spacing/Gap/XSmall') },
    head: { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') },
    dot: (st) => ({
      width: dim, height: dim, borderRadius: t.radius('Corner-Radius/Action/XSmall'), alignItems: 'center', justifyContent: 'center',
      ...(st === 'Default' ? { backgroundColor: t.component('Date-Picker-Item/Background/Unselected/Hover') }
        : st === 'Passed' ? { backgroundColor: t.color('Color/Background/Inverse/Solid/Default'), borderWidth: t.weight('Emphasis/Border-Weight/Active'), borderColor: t.color('Color/Border/Active/Neutral/Solid') }
        : st === 'Error' ? { backgroundColor: t.color('Color/Background/Negative/Subtle/Default') }
        : { backgroundColor: t.color('Color/Background/Neutral/Solid/Default') }),
    }),
    dotLabel: (st) => ({ ...t.text('Body/XSmall/Medium'), color: t.color(st === 'Focused' ? 'Color/Content/Inverse/Strongest' : st === 'Error' ? 'Color/Content/Negative/Light' : 'Color/Content/Neutral/Light') }),
    line: (st) => ({ flex: 1, height: t.weight('Emphasis/Border-Weight/Active'), borderRadius: t.radius('Corner-Radius/Rounded'), backgroundColor: t.color(st === 'Passed' ? 'Color/Background/Active/Neutral/Solid' : st === 'Error' ? 'Color/Background/Negative/Solid/Default' : 'Color/Border/Neutral/Subtle/Default') }),
    contents: { gap: t.space('Spacing/Gap/3XSmall'), paddingRight: t.space('Spacing/Padding/XSmall') },
    title: (st) => ({ ...t.text('Body/Base/DemiBold'), color: t.color(st === 'Error' ? 'Color/Content/Negative/Base' : st === 'Default' ? 'Color/Content/Neutral/Light' : 'Color/Content/Neutral/Strongest') }),
    caption: (st) => ({ ...t.text('Caption/Regular'), color: t.color(st === 'Error' ? 'Color/Content/Negative/Strongest' : 'Color/Content/Neutral/Light') }),
    iconSize: t.size('Element-Size/Popular/XSmall'),
  };
}
