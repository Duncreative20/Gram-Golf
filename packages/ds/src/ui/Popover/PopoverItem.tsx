import { Pressable, Text as RNText, View, type ImageSourcePropType } from 'react-native';
import { a11yState } from '../a11y';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import type { IconName } from '../../icons/generated';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { popoverItemStyles, type PopoverItemType } from './popoverItemStyles';

export interface PopoverItemProps {
  type?: PopoverItemType;
  label: string;
  /** Figma Content Caption=True */
  caption?: string;
  /** Type=Item: Icon-Src */
  icon?: IconName;
  /** Type=Radio: Select; Type=Item: State=Single-Selected (dấu ✓ cuối) */
  selected?: boolean;
  /** Type=Follow-User | Like: ảnh avatar */
  avatar?: ImageSourcePropType;
  /** Figma Trailing=True */
  trailingIcon?: IconName;
  /** Type=Follow-User, Follow-Button=True */
  followText?: string;
  onFollow?: () => void;
  onPress?: () => void;
}

export function PopoverItem({ type = 'Item', label, caption, icon, selected, avatar, trailingIcon, followText, onFollow, onPress }: PopoverItemProps) {
  const t = useTheme();
  return (
    <Pressable
      // Follow-User có Button con → hàng không nhận role/accessible (tránh button lồng button)
      accessibilityRole={followText ? undefined : type === 'Radio' ? 'radio' : 'button'}
      accessible={!followText}
      {...(type === 'Radio' ? a11yState({ checked: !!selected }) : a11yState({ selected: !!selected }, followText ? undefined : 'button'))}
      onPress={onPress}
      style={({ pressed }) => popoverItemStyles(t, { type, selected, pressed }).container}
    >
      {({ pressed }) => {
        const s = popoverItemStyles(t, { type, selected, pressed });
        return (
          <>
            {type === 'Radio' ? <View style={s.radio.box}>{selected ? <View style={s.radio.dot} /> : null}</View> : null}
            {type === 'Item' && icon ? <Icon name={icon} size={s.iconSize} color={s.iconColor} /> : null}
            {(type === 'Follow-User' || type === 'Like') && avatar ? <Avatar size="Small" source={avatar} /> : null}
            <View style={s.content}>
              <RNText style={s.label} numberOfLines={1}>{label}</RNText>
              {caption ? <RNText style={s.caption} numberOfLines={1}>{caption}</RNText> : null}
            </View>
            {type === 'Follow-User' && followText ? <Button level="Tertiary" size="XSmall" text={followText} onPress={onFollow} /> : null}
            {type === 'Item' && selected ? <Icon name="check-line" size={s.trailingSize} color={s.iconColor} /> : null}
            {trailingIcon ? <Icon name={trailingIcon} size={s.trailingSize} color={s.iconColor} /> : null}
          </>
        );
      }}
    </Pressable>
  );
}
