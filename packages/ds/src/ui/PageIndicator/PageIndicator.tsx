import { View } from 'react-native';
import { a11yValue } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { pageIndicatorStyles, type PageIndicatorSize, type PageIndicatorState } from './pageIndicatorStyles';

export interface PageIndicatorProps {
  /** Số chấm (Figma Dot-4…Dot-8) */
  count: number;
  /** Chỉ số chấm đang Active=On */
  active: number;
  state?: PageIndicatorState;
  size?: PageIndicatorSize;
}

export function PageIndicator({ count, active, state = 'Neutral', size = 'Medium' }: PageIndicatorProps) {
  const t = useTheme();
  const s = pageIndicatorStyles(t, { state, size });
  return (
    <View style={s.container} accessibilityRole="progressbar" accessibilityLabel={`Trang ${active + 1} / ${count}`} {...a11yValue({ min: 1, max: count, now: active + 1 })}>
      {Array.from({ length: count }, (_, i) => <View key={i} style={s.dot(i === active)} />)}
    </View>
  );
}
