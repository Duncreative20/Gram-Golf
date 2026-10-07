import { useState, type ReactNode } from 'react';
import { a11yState } from '../a11y';
import { Pressable, Text as RNText, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Icon } from '../../icons/Icon';
import { accordionStyles, type AccordionSize, type AccordionTheme } from './accordionStyles';

export interface AccordionProps {
  title: string;
  size?: AccordionSize;
  theme?: AccordionTheme;
  /** Figma Expanded — controlled; bỏ trống thì tự quản */
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
  defaultExpanded?: boolean;
  children?: ReactNode;
}

export function Accordion({ title, size = 'Large', theme = 'Divider', expanded, onToggle, defaultExpanded = false, children }: AccordionProps) {
  const t = useTheme();
  const [inner, setInner] = useState(defaultExpanded);
  const open = expanded ?? inner;
  const s = accordionStyles(t, { size, theme });
  const toggle = () => { setInner(!open); onToggle?.(!open); };
  return (
    <View style={s.container}>
      <Pressable accessibilityRole="button" {...a11yState({ expanded: open })} onPress={toggle} style={s.header}>
        <RNText style={s.title}>{title}</RNText>
        <Icon name={open ? 'chevron-up-line' : 'chevron-down-line'} size={s.iconSize} color="Color/Content/Neutral/Strongest" />
      </Pressable>
      {open ? (typeof children === 'string' ? <RNText style={s.body}>{children}</RNText> : children) : null}
    </View>
  );
}
