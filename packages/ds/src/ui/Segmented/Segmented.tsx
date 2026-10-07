import { Pressable, Text as RNText, View } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Badge } from '../Badge/Badge';
import { segmentedContainerStyles, segmentedItemStyles, type SegmentedLevel, type SegmentedSize } from './segmentedStyles';

export interface SegmentedItem {
  /** Figma Label */
  label?: string;
  /** Figma Icon-Src */
  icon?: IconName;
  /** Figma Badge=True: số/đếm */
  badge?: string;
}

export interface SegmentedProps {
  items: SegmentedItem[];
  selectedIndex: number;
  onChange?: (index: number) => void;
  level?: SegmentedLevel;
  size?: SegmentedSize;
}

export function Segmented({ items, selectedIndex, onChange, level = 'Primary', size = 'Medium' }: SegmentedProps) {
  const t = useTheme();
  return (
    <View style={segmentedContainerStyles(t, { level })} accessibilityRole="tablist">
      {items.map((it, i) => {
        const selected = i === selectedIndex;
        return (
          <Pressable
            key={i}
            accessibilityRole="tab"
            {...a11yState({ selected }, 'tab')}
            onPress={() => onChange?.(i)}
            style={({ pressed }) => segmentedItemStyles(t, { level, size, selected, pressed }).item}
          >
            {({ pressed }) => {
              const s = segmentedItemStyles(t, { level, size, selected, pressed });
              return (
                <>
                  {it.icon ? <Icon name={it.icon} size={s.iconSize} color={s.iconColor} /> : null}
                  {it.label ? <RNText style={s.label} numberOfLines={1}>{it.label}</RNText> : null}
                  {it.badge ? (
                    <Badge text={it.badge} size="XSmall" theme={selected && level === 'Primary' ? 'Inverse' : 'Neutral'} background={selected ? 'Solid' : 'Subtle'} />
                  ) : null}
                </>
              );
            }}
          </Pressable>
        );
      })}
    </View>
  );
}
