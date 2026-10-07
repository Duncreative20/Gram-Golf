import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { Button } from '../Button/Button';
import { STATUS_ICON, toastStyles, type ToastType } from './feedbackStyles';

export interface ToastProps {
  type?: ToastType;
  title: string;
  caption?: string;
  /** Figma Action=True: Button Main-Overlay Small */
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
}

/** Figma `Toast-Message` — chỉ là khung; định vị/hẹn giờ do app quyết. */
export function Toast({ type = 'Neutral', title, caption, actionText, onAction, onClose }: ToastProps) {
  const t = useTheme();
  const s = toastStyles(t, { type });
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.container}>
      <Icon name={STATUS_ICON[type === 'Subtle' ? 'Neutral' : type]} size={s.iconSize} color={s.content} />
      <View style={s.body}>
        <RNText style={s.title}>{title}</RNText>
        {caption ? <RNText style={s.caption}>{caption}</RNText> : null}
      </View>
      {actionText ? <Button type="Main" overlay level={type === 'Subtle' ? 'Tertiary' : 'Accent'} size="Small" text={actionText} onPress={onAction} /> : null}
      {onClose ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={t.space('Spacing/Gap/XSmall')}>
          <Icon name="x-medium-line" size={s.iconSize} color={s.content} />
        </Pressable>
      ) : null}
    </View>
  );
}
