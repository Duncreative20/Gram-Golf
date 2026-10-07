import type { ReactNode } from 'react';
import { a11yState } from '../a11y';
import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Avatar, type AvatarProps } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import {
  avatarGroupStyles, colorSelectorStyles, connectorStyles, dockIconStyles, emptyStateStyles,
  type AvatarGroupSize, type ConnectorBackground, type DockIconBackground, type DockIconSize, type DockIconTheme,
} from './dockIconStyles';

export interface DockIconProps { icon: IconName; size?: DockIconSize; theme?: DockIconTheme; background?: DockIconBackground; accessibilityLabel?: string }
/** Figma `Dock-Icon` */
export function DockIcon({ icon, size = 'Medium', theme = 'Neutral', background = 'Subtle', accessibilityLabel }: DockIconProps) {
  const t = useTheme();
  const s = dockIconStyles(t, { size, theme, background });
  return (
    <View style={s.box} accessibilityLabel={accessibilityLabel} accessibilityRole={accessibilityLabel ? 'image' : 'none'}>
      <Icon name={icon} size={s.iconSize} color={s.iconColor} />
    </View>
  );
}

export interface IntegrationConnectorProps { icon: IconName; size?: DockIconSize; background?: ConnectorBackground; accessibilityLabel?: string }
/** Figma `Integration-Connector` (Theme chỉ có Neutral) */
export function IntegrationConnector({ icon, size = 'Medium', background = 'Default', accessibilityLabel }: IntegrationConnectorProps) {
  const t = useTheme();
  const s = connectorStyles(t, { size, background });
  return (
    <View style={s.box} accessibilityLabel={accessibilityLabel}>
      <Icon name={icon} size={s.iconSize} color={s.iconColor} />
      {s.badge ? <View style={s.badge}><Icon name="check-circle-solid" size={s.badgeSize} color="Color/Content/Accent/Base" /></View> : null}
    </View>
  );
}

export interface ColorSelectorProps { color?: string; select: boolean; onPress?: () => void; accessibilityLabel: string }
/** Figma `Color-Selector`: nền = màu truyền vào (dữ liệu), dấu check khi Select=Yes */
export function ColorSelector({ color, select, onPress, accessibilityLabel }: ColorSelectorProps) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole="radio" {...a11yState({ checked: select })} accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => colorSelectorStyles(t, { color, select, pressed }).box}>
      {select ? <Icon name="check-line" size={colorSelectorStyles(t, { color, select }).iconSize} color="Color/Content/On-Colors" /> : null}
    </Pressable>
  );
}

export interface AvatarGroupProps {
  avatars: Pick<AvatarProps, 'source' | 'initials' | 'theme' | 'accessibilityLabel'>[];
  size?: AvatarGroupSize;
  background?: 'Subtle' | 'Solid';
  /** Figma Number 1..5: số avatar hiện; phần dư gom vào "+N" (More=True) */
  max?: number;
}
/** Figma `Avatar/Group` */
export function AvatarGroup({ avatars, size = 'Medium', background = 'Subtle', max = 5 }: AvatarGroupProps) {
  const t = useTheme();
  const s = avatarGroupStyles(t, { size, background });
  const shown = avatars.slice(0, max);
  const rest = avatars.length - shown.length;
  return (
    <View style={s.row}>
      {shown.map((a, i) => (
        <View key={i} style={[s.ring, i > 0 ? s.overlap : null]}>
          <Avatar size={size} {...a} />
        </View>
      ))}
      {rest > 0 ? (
        <View style={[s.ring, s.overlap]}>
          <View style={s.more}><RNText style={s.moreText}>+{rest}</RNText></View>
        </View>
      ) : null}
    </View>
  );
}

export interface EmptyStateProps {
  /** Figma Illustration slot; mặc định Dock-Icon Pale XLarge */
  illustration?: ReactNode;
  icon?: IconName;
  title: string;
  caption?: string;
  primaryText?: string;
  onPrimary?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
}
/** Figma `Empty-State` */
export function EmptyState({ illustration, icon = 'user-circle-line', title, caption, primaryText, onPrimary, secondaryText, onSecondary }: EmptyStateProps) {
  const t = useTheme();
  const s = emptyStateStyles(t);
  return (
    <View style={s.wrapper}>
      {illustration ?? <DockIcon icon={icon} size="XLarge" theme="Pale" />}
      <View style={s.content}>
        <View style={{ alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
          <RNText style={s.title}>{title}</RNText>
          {caption ? <RNText style={s.caption}>{caption}</RNText> : null}
        </View>
        {primaryText || secondaryText ? (
          <View style={s.cta}>
            {secondaryText ? <Button level="Tertiary" size="Medium (Base)" text={secondaryText} onPress={onSecondary} /> : null}
            {primaryText ? <Button level="Primary" size="Medium (Base)" text={primaryText} onPress={onPrimary} /> : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
