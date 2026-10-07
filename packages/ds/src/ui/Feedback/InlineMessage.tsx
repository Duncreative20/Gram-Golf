import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Button } from '../Button/Button';
import { inlineMessageStyles, STATUS_ICON, type StatusTheme } from './feedbackStyles';

export interface InlineMessageProps {
  theme?: StatusTheme;
  /** Figma Title=True */
  title?: string;
  /** Figma Caption (nội dung chính) */
  text: string;
  /** Theme=Custom: icon tự chọn */
  icon?: IconName;
  /** Figma Action=True: Button Flat Small */
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
}

/** Figma `Inline-Message` */
export function InlineMessage({ theme = 'Neutral', title, text, icon, actionText, onAction, onClose }: InlineMessageProps) {
  const t = useTheme();
  const s = inlineMessageStyles(t, { theme });
  return (
    <View style={s.container}>
      <Icon name={icon ?? STATUS_ICON[theme]} size={s.iconSize} color={s.iconColor} />
      <View style={s.body}>
        {title ? <RNText style={s.title}>{title}</RNText> : null}
        <RNText style={s.caption}>{text}</RNText>
        {actionText ? (
          <View style={{ alignSelf: 'flex-start' }}>
            <Button type="Flat" level="Primary" size="Small" text={actionText} onPress={onAction} />
          </View>
        ) : null}
      </View>
      {onClose ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={t.space('Spacing/Gap/XSmall')}>
          <Icon name="x-medium-line" size={s.iconSize} color={s.closeColor} />
        </Pressable>
      ) : null}
    </View>
  );
}
