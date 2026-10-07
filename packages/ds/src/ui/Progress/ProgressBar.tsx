import { Text as RNText, View } from 'react-native';
import { a11yValue } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { progressStyles, skeletonStyles, skeletonTextStyles, type ProgressStatus, type ProgressTheme, type SkeletonHeading, type SkeletonShape, type SkeletonSize } from './progressStyles';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  theme?: ProgressTheme;
  /** Theme=Status */
  status?: ProgressStatus;
  /** Figma Label=True */
  label?: string;
}

export function ProgressBar({ value, theme = 'Accent', status, label }: ProgressBarProps) {
  const t = useTheme();
  const s = progressStyles(t, { theme, status });
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View style={s.wrapper} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Tiến trình'} {...a11yValue({ min: 0, max: 100, now: pct })}>
      {label ? <RNText style={s.label}>{label}</RNText> : null}
      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

export interface SkeletonProps { shape?: SkeletonShape; size?: SkeletonSize; width?: number }
/** Figma `Skeleton/Shapes` — tĩnh; ponytail: thêm shimmer (Animated) khi cần */
export function Skeleton({ shape = 'Rectangle', size = 'Medium - 40px', width }: SkeletonProps) {
  const t = useTheme();
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={skeletonStyles(t, { shape, size, width })} />;
}

export interface SkeletonTextProps { lines?: 1 | 2 | 3 | 5; heading?: SkeletonHeading }
/** Figma `Skeleton/Body-Text` (lines) / `Skeleton/Heading-Text` (heading) */
export function SkeletonText({ lines = 1, heading }: SkeletonTextProps) {
  const t = useTheme();
  const s = skeletonTextStyles(t, { heading });
  const n = heading ? 1 : lines;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.column}>
      {Array.from({ length: n }, (_, i) => <View key={i} style={[s.line, i === n - 1 && n > 1 ? { width: '60%' } : null]} />)}
    </View>
  );
}
