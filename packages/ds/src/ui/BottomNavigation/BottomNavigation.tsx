import { Pressable, Text as RNText, View } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Badge } from '../Badge/Badge';
import { bottomNavItemStyles, bottomNavigationStyles, type BottomNavTheme, type BottomNavType } from './bottomNavigationStyles';

export interface BottomNavItem {
  /** Figma Label-Text */
  label: string;
  /** Icon-Src khi chưa chọn (line) */
  icon: IconName;
  /** Icon khi chọn (solid); mặc định dùng `icon` */
  iconSelected?: IconName;
  /** Figma Noti=True: true = chấm đỏ, chuỗi = số (Notification-Dot Style=Number) */
  noti?: boolean | string;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  selectedIndex: number;
  onChange?: (index: number) => void;
  type?: BottomNavType;
  theme?: BottomNavTheme;
}

export function BottomNavigation({ items, selectedIndex, onChange, type = 'Floating', theme = 'Neutral' }: BottomNavigationProps) {
  const t = useTheme();
  const dense = items.length >= 5;
  const s = bottomNavigationStyles(t, { type, dense });
  return (
    <View style={s.bar} accessibilityRole="tablist">
      <View style={s.items}>
        {items.map((it, i) => {
          const selected = i === selectedIndex;
          const st = bottomNavItemStyles(t, { theme, selected, dense });
          return (
            <Pressable key={i} accessibilityRole="tab" {...a11yState({ selected }, 'tab')} onPress={() => onChange?.(i)} style={st.item}>
              <View style={st.inner}>
                <View>
                  <Icon name={selected && it.iconSelected ? it.iconSelected : it.icon} size={st.iconSize} color={st.iconColor} />
                  {it.noti === true ? <View style={st.noti} /> : null}
                  {typeof it.noti === 'string' ? (
                    <View style={{ position: 'absolute', top: -t.space('Spacing/Gap/2XSmall'), left: st.iconSize - t.space('Spacing/Gap/XSmall') }}>
                      <Badge text={it.noti} size="XSmall" theme="Red" background="Solid" />
                    </View>
                  ) : null}
                </View>
                <RNText style={st.label} numberOfLines={1}>{it.label}</RNText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
