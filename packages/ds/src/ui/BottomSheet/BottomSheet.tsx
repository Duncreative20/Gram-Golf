import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import type { IconName } from '../../icons/generated';
import { Button } from '../Button/Button';
import { IconButton } from '../Button/IconButton';
import { bottomSheetStyles, type BottomSheetAlign, type BottomSheetSecondary, type BottomSheetTitleSize, type BottomSheetType } from './bottomSheetStyles';

export interface BottomSheetAction { text: string; onPress?: () => void; icon?: IconName }

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  type?: BottomSheetType;
  heading?: string;
  subtitle?: string;
  /** Title-Block Size / Type */
  size?: BottomSheetTitleSize;
  align?: BottomSheetAlign;
  /** Header Divider=True */
  divider?: boolean;
  /** Figma Action=True: nút chính (Accent Large) */
  primary?: BottomSheetAction;
  /** Actions Secondary: None|Button|Icon|Text|Secondary-Vertical|Text-Vertical */
  secondary?: BottomSheetAction;
  secondaryLayout?: BottomSheetSecondary;
  /** Figma System-Indicator=True: chừa chỗ home indicator */
  systemIndicator?: boolean;
  /** Nút × ở header (Trailing-Action) */
  closeButton?: boolean;
}

export function BottomSheet({ visible, onClose, type = 'Modal', heading, subtitle, size = 'Medium', align = 'Start', divider, primary, secondary, secondaryLayout, systemIndicator = true, closeButton = true, children }: PropsWithChildren<BottomSheetProps>) {
  const t = useTheme();
  const layout: BottomSheetSecondary = secondaryLayout ?? (secondary ? 'Button' : 'None');
  const s = bottomSheetStyles(t, { type, size, align, secondary: layout, divider });
  const flat = layout === 'Text' || layout === 'Text-Vertical';
  const iconLayout = layout === 'Icon' && !!secondary?.icon; // Icon thiếu icon → rơi về Button, không nuốt im lặng
  const vertical = layout.endsWith('Vertical');
  const secondaryButton = secondary
    ? iconLayout
      ? <IconButton level="Tertiary" size="Large" icon={secondary.icon!} accessibilityLabel={secondary.text} onPress={secondary.onPress} />
      : flat
        ? <Button type="Flat" level="Primary" size="Large" text={secondary.text} onPress={secondary.onPress} />
        : <Button level="Tertiary" size="Large" text={secondary.text} onPress={secondary.onPress} />
    : null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* accessible={false} cả 2 lớp: Pressable mặc định accessible → iOS gộp cả sheet thành một phần tử "Đóng" (review lượt 2). */}
      <Pressable style={s.scrim} onPress={onClose} accessible={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.keyboard}>
        <Pressable style={s.container} onPress={() => {}} accessible={false}>
          <View style={s.grabberWrap}><View style={s.grabber} /></View>
          {heading || closeButton ? (
            <View style={s.header}>
              <View style={s.titleBlock}>
                {heading ? <RNText style={s.heading}>{heading}</RNText> : null}
                {subtitle ? <RNText style={s.subtitle}>{subtitle}</RNText> : null}
              </View>
              {closeButton ? <IconButton type="Flat" level="Primary" size="Small" icon="x-medium-line" accessibilityLabel="Đóng" onPress={onClose} /> : null}
            </View>
          ) : null}
          <View style={s.divider} />
          <View style={s.body}>{children}</View>
          {primary || secondary ? (
            <View style={s.footer}>
              <View style={s.actions}>
                {secondaryButton && !vertical ? (iconLayout ? secondaryButton : <View style={{ flex: 1 }}>{secondaryButton}</View>) : null}
                {primary ? <View style={{ flex: vertical ? undefined : 1 }}><Button level="Accent" size="Large" text={primary.text} leadingIcon={primary.icon} onPress={primary.onPress} /></View> : null}
                {secondaryButton && vertical ? secondaryButton : null}
              </View>
            </View>
          ) : null}
          {systemIndicator ? <View style={{ height: t.space('Spacing/Padding/2XLarge') }} /> : null}
        </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
