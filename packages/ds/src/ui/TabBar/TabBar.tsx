import { Pressable, Text as RNText, View } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Badge } from '../Badge/Badge';
import { tabBarStyles, tabItemStyles, type TabSize, type TabStyle } from './tabStyles';

export interface TabItem {
  /** Figma Text (Label=True) */
  label?: string;
  /** Figma Icon-Src */
  icon?: IconName;
  /** Icon khi Selected (Figma đổi line → solid); bỏ trống = giữ `icon` */
  iconSelected?: IconName;
  /** Figma Badge=True */
  badge?: string;
  disabled?: boolean;
}

export interface TabBarProps {
  items: TabItem[];
  selectedIndex: number;
  onChange?: (index: number) => void;
  /** Figma Tab-Bar Style; Top = icon trên chữ */
  style?: TabStyle;
  size?: TabSize;
}

export function TabBar({ items, selectedIndex, onChange, style = 'Indicator', size = 'Medium' }: TabBarProps) {
  const t = useTheme();
  return (
    <View style={tabBarStyles(t, { style })} accessibilityRole="tablist">
      {items.map((it, i) => {
        const selected = i === selectedIndex;
        const icon = style === 'Top' ? 'Top' : it.icon ? 'Leading' : 'None';
        return (
          <Pressable
            key={i}
            accessibilityRole="tab"
            {...a11yState({ selected, disabled: it.disabled }, 'tab')}
            disabled={it.disabled}
            onPress={() => onChange?.(i)}
            style={({ pressed }) => tabItemStyles(t, { style, size, icon, selected, pressed, disabled: it.disabled }).outer}
          >
            {({ pressed }) => {
              const s = tabItemStyles(t, { style, size, icon, selected, pressed, disabled: it.disabled });
              return (
                <>
                  <View style={s.inner}>
                    {it.icon ? (
                      <View>
                        <Icon name={selected && it.iconSelected ? it.iconSelected : it.icon} size={s.iconSize} color={s.iconColor} />
                        {it.badge && s.badgeTop ? <View style={s.badgeTop}><Badge text={it.badge} size="XSmall" theme={selected ? 'Accent' : 'Neutral'} background="Subtle" /></View> : null}
                      </View>
                    ) : null}
                    {it.label ? <RNText style={s.label} numberOfLines={1}>{it.label}</RNText> : null}
                    {it.badge && !s.badgeTop ? <Badge text={it.badge} size="XSmall" theme={selected ? 'Accent' : 'Neutral'} background="Subtle" /> : null}
                  </View>
                  {s.indicator ? <View style={s.indicator} /> : null}
                </>
              );
            }}
          </Pressable>
        );
      })}
    </View>
  );
}
