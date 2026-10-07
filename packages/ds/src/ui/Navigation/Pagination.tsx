import { Pressable, Text as RNText, View } from 'react-native';
import { a11yState, a11yValue } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { IconButton } from '../Button/IconButton';
import { breadcrumbsStyles, paginationStyles, stepperStyles, type PaginationSize, type PaginationTheme, type StepState } from './navigationStyles';

export interface PaginationProps {
  /** 1-based */
  page: number;
  count: number;
  onChange: (page: number) => void;
  theme?: PaginationTheme;
  size?: PaginationSize;
  /** Số nút trang hiển thị tối đa (cửa sổ trượt quanh trang hiện tại) */
  window?: number;
}

/** Figma `Pagination` (Theme Manually bỏ) */
export function Pagination({ page, count, onChange, theme = 'Primary', size = 'XSmall', window = 5 }: PaginationProps) {
  const t = useTheme();
  const s = paginationStyles(t, { theme, size });
  const half = Math.floor(window / 2);
  const start = Math.max(1, Math.min(page - half, count - window + 1));
  const pages = Array.from({ length: Math.min(window, count) }, (_, i) => start + i);
  return (
    <View style={s.container}>
      <IconButton level="Tertiary" size="XSmall" icon="chevron-left-line-small" accessibilityLabel="Trang trước" disabled={page <= 1} onPress={() => onChange(page - 1)} />
      <View style={s.pages}>
        {pages.map((p) => (
          <Pressable key={p} accessibilityRole="button" {...a11yState({ selected: p === page }, 'button')} onPress={() => onChange(p)} style={({ pressed }) => s.item(p === page, pressed)}>
            <RNText style={s.label(p === page)}>{p}</RNText>
          </Pressable>
        ))}
      </View>
      <IconButton level="Tertiary" size="XSmall" icon="chevron-right-line-medium" accessibilityLabel="Trang sau" disabled={page >= count} onPress={() => onChange(page + 1)} />
    </View>
  );
}

export interface BreadcrumbItem { label: string; icon?: IconName; onPress?: () => void }
export interface BreadcrumbsProps { items: BreadcrumbItem[] }

/** Figma `Breadcrumbs`: item đầu (Master) có icon, item cuối Emphasis=Medium. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = useTheme();
  const s = breadcrumbsStyles(t);
  return (
    <View style={s.row}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/3XSmall') }}>
            <Pressable accessibilityRole={it.onPress ? 'link' : undefined} disabled={!it.onPress} onPress={it.onPress} style={s.item}>
              {it.icon ? <Icon name={it.icon} size={s.iconSize} color="Color/Content/Neutral/Strongest" /> : null}
              <RNText style={s.label(last)}>{it.label}</RNText>
            </Pressable>
            {last ? null : <Icon name="chevron-right-line-medium" size={s.dashSize} color="Color/Content/Neutral/Light" />}
          </View>
        );
      })}
    </View>
  );
}

export interface StepItem { title: string; caption?: string; icon?: IconName; error?: boolean }
export interface StepperProps {
  steps: StepItem[];
  /** 0-based bước hiện tại; bước trước = Passed */
  current: number;
}

/** Figma `.Primitives/Stepper/Step-Horizontal` xếp ngang */
export function Stepper({ steps, current }: StepperProps) {
  const t = useTheme();
  const s = stepperStyles(t);
  const stateOf = (i: number, it: StepItem): StepState => (it.error ? 'Error' : i < current ? 'Passed' : i === current ? 'Focused' : 'Default');
  return (
    <View style={s.row} accessibilityRole="progressbar" accessibilityLabel={`Bước ${current + 1} / ${steps.length}`} {...a11yValue({ min: 0, max: steps.length, now: current })}>
      {steps.map((it, i) => {
        const st = stateOf(i, it);
        return (
          <View key={i} style={s.step}>
            <View style={s.head}>
              <View style={s.dot(st)}>
                {st === 'Passed' ? <Icon name="check-solid" size={s.iconSize} color="Color/Content/Neutral/Strongest" />
                  : st === 'Error' ? <Icon name="info-octagon-solid" size={s.iconSize} color="Color/Content/Negative/Light" />
                  : it.icon ? <Icon name={it.icon} size={s.iconSize} color={st === 'Focused' ? 'Color/Content/Inverse/Strongest' : 'Color/Content/Neutral/Light'} />
                  : <RNText style={s.dotLabel(st)}>{i + 1}</RNText>}
              </View>
              {i < steps.length - 1 ? <View style={s.line(st)} /> : null}
            </View>
            <View style={s.contents}>
              <RNText style={s.title(st)} numberOfLines={1}>{it.title}</RNText>
              {it.caption ? <RNText style={s.caption(st)} numberOfLines={2}>{it.caption}</RNText> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
