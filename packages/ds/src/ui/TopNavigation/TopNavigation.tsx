import { Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import type { IconName } from '../../icons/generated';
import { Button } from '../Button/Button';
import { IconButton } from '../Button/IconButton';
import { topNavigationStyles, type TopNavAlign, type TopNavSurface, type TopNavTitleSize, type TopNavType } from './topNavigationStyles';

export interface TopNavAction { icon: IconName; accessibilityLabel: string; onPress?: () => void }

export interface TopNavigationProps {
  /** Figma Type: Title = tiêu đề; Search / Package-Select = nút trigger (Button Tertiary XLarge) ở giữa */
  type?: TopNavType;
  surface?: TopNavSurface;
  heading?: string;
  subtitle?: string;
  /** Title-Block Size */
  size?: TopNavTitleSize;
  /** Container/Title Align */
  align?: TopNavAlign;
  leadingAction?: TopNavAction;
  trailingActions?: TopNavAction[];
  /** Figma Divider=True */
  divider?: boolean;
  /** Type=Search | Package-Select: chữ trên trigger */
  triggerText?: string;
  triggerIcon?: IconName;
  onTriggerPress?: () => void;
}

export function TopNavigation({ type = 'Title', surface = 'Default', heading, subtitle, size = 'Medium', align = 'Center', leadingAction, trailingActions = [], divider, triggerText, triggerIcon, onTriggerPress }: TopNavigationProps) {
  const t = useTheme();
  const s = topNavigationStyles(t, { surface, align, size, divider });
  const action = (a: TopNavAction, key: string) =>
    surface === 'Overlay'
      ? <IconButton key={key} overlay level="Primary" size="Small" icon={a.icon} accessibilityLabel={a.accessibilityLabel} onPress={a.onPress} />
      : <IconButton key={key} level="Tertiary" size="Small" icon={a.icon} accessibilityLabel={a.accessibilityLabel} onPress={a.onPress} />;
  return (
    <View>
      <View style={s.bar}>
        <View style={s.leading}>{leadingAction ? action(leadingAction, 'lead') : null}</View>
        {type === 'Title' ? (
          <View style={s.titleBlock}>
            {heading ? <RNText style={s.heading} numberOfLines={1}>{heading}</RNText> : null}
            {subtitle ? <RNText style={s.subtitle} numberOfLines={1}>{subtitle}</RNText> : null}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Button overlay={surface === 'Overlay' ? true : undefined} level={surface === 'Overlay' ? 'Tertiary' : 'Tertiary'} size="XLarge" text={triggerText ?? ''} leadingIcon={triggerIcon} trailingIcon={type === 'Package-Select' ? 'chevron-down-line' : undefined} onPress={onTriggerPress} />
          </View>
        )}
        <View style={s.trailing}>{trailingActions.map((a, i) => action(a, `t${i}`))}</View>
      </View>
      <View style={s.divider} />
    </View>
  );
}
