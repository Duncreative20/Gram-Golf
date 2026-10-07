import type { ReactNode } from 'react';
import { Modal, Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { Button } from '../Button/Button';
import { dialogStyles, STATUS_ICON, type StatusTheme } from './feedbackStyles';

export interface DialogProps {
  visible: boolean;
  onRequestClose: () => void;
  /** Figma Theme Default|Info|Positive|Warning|Negative: chỉ đổi icon đầu */
  theme?: StatusTheme | 'Default';
  title: string;
  /** Chuỗi → Body/Base/Regular; node → render thẳng */
  body?: ReactNode;
  primaryText: string;
  onPrimary: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
  /** Negative → nút chính Accent vẫn giữ; chuyển `destructive` khi cần Negative level */
  destructive?: boolean;
}

/** Figma `Modal/Dialog` */
export function Dialog({ visible, onRequestClose, theme = 'Default', title, body, primaryText, onPrimary, secondaryText, onSecondary, destructive }: DialogProps) {
  const t = useTheme();
  const s = dialogStyles(t);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable style={s.scrim} onPress={onRequestClose} accessible={false}>
        <Pressable style={s.box} onPress={() => {}} accessibilityViewIsModal accessible={false}>
          <View style={s.content}>
            {theme !== 'Default' ? <Icon name={STATUS_ICON[theme]} size={t.size('Element-Size/Popular/2XLarge')} color={`Color/Content/${theme}/Light`} /> : null}
            <RNText style={s.title} accessibilityRole="header">{title}</RNText>
            {typeof body === 'string' ? <RNText style={s.body}>{body}</RNText> : body}
          </View>
          <View style={s.actions}>
            {secondaryText ? <Button type="Main" level="Tertiary" size="Medium (Base)" text={secondaryText} onPress={onSecondary ?? onRequestClose} /> : null}
            <Button type="Main" level={destructive ? 'Danger' : 'Accent'} size="Medium (Base)" text={primaryText} onPress={onPrimary} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
