import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { Button } from '../Button/Button';
import { alertBannerStyles, STATUS_ICON, type AlertBannerSize, type StatusTheme } from './feedbackStyles';

export interface AlertBannerProps {
  text: string;
  theme?: StatusTheme;
  size?: AlertBannerSize;
  /** Figma Action=True: Button Main-Overlay Accent Small */
  actionText?: string;
  onAction?: () => void;
  /** Figma Close=True */
  onClose?: () => void;
}

/** Figma `Alert-Banner` (Theme Default = Neutral) */
export function AlertBanner({ text, theme = 'Neutral', size = 'Medium', actionText, onAction, onClose }: AlertBannerProps) {
  const t = useTheme();
  const s = alertBannerStyles(t, { size, theme });
  return (
    <View accessibilityRole="alert" style={s.container}>
      <Icon name={STATUS_ICON[theme]} size={s.iconSize} color={s.content} />
      <RNText style={s.text} numberOfLines={2}>{text}</RNText>
      {actionText ? <Button type="Main" overlay level="Accent" size="Small" text={actionText} onPress={onAction} /> : null}
      {onClose ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={t.space('Spacing/Gap/XSmall')}>
          <Icon name="x-small-line" size={s.closeSize} color={s.content} />
        </Pressable>
      ) : null}
    </View>
  );
}
