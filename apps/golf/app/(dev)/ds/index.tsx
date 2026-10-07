// Gallery @gr/ds — nghiệm thu hình ảnh từng component trên Expo Go. Không phải màn app.
import { Pressable, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen, Text, useTheme } from '@gr/ds';
import { Logo } from '../../../components/Logo';

export const GALLERY: { name: string; href: string }[] = [
  { name: 'Icon', href: '/(dev)/ds/icon' },
  { name: 'Divider', href: '/(dev)/ds/divider' },
  { name: 'Button · IconButton', href: '/(dev)/ds/button' },
  { name: 'Badge', href: '/(dev)/ds/badge' },
  { name: 'Avatar', href: '/(dev)/ds/avatar' },
  { name: 'Checkbox', href: '/(dev)/ds/checkbox' },
  { name: 'Segmented', href: '/(dev)/ds/segmented' },
  { name: 'Tab-Bar', href: '/(dev)/ds/tab' },
  { name: 'TextField · SearchField', href: '/(dev)/ds/textfield' },
  { name: 'Popover/Item-Select', href: '/(dev)/ds/popover' },
  { name: 'Top-Navigation', href: '/(dev)/ds/topnav' },
  { name: 'Bottom-Navigation', href: '/(dev)/ds/bottomnav' },
  { name: 'Bottom-Sheet', href: '/(dev)/ds/bottomsheet' },
  { name: 'Page-Indicator', href: '/(dev)/ds/pageindicator' },
  { name: 'Radio · RadioRow · CheckboxRow', href: '/(dev)/ds/radio' },
  { name: 'Toggle · ToggleRow', href: '/(dev)/ds/toggle' },
  { name: 'Chip', href: '/(dev)/ds/chip' },
  { name: 'Tag', href: '/(dev)/ds/tag' },
  { name: 'List-Item · Card · Accordion', href: '/(dev)/ds/listitem' },
  { name: 'Alert · Inline · Toast · Tooltip · Dialog', href: '/(dev)/ds/feedback' },
  { name: 'Progress · Skeleton · Pagination · Breadcrumbs · Stepper', href: '/(dev)/ds/progress' },
  { name: 'TextArea · Select · OTP · StepperControl · Search/Overlay', href: '/(dev)/ds/input2' },
  { name: 'Message-Input · Date-Field · Number-Field · Field-Group', href: '/(dev)/ds/input3' },
  { name: 'Date-Picker · Wheel', href: '/(dev)/ds/datepicker' },
  { name: 'Dock-Icon · Connector · Color · AvatarGroup · Empty', href: '/(dev)/ds/misc' },
  { name: 'Post-Card · Post-Media · Post-action · Pill', href: '/(dev)/ds/post' },
  { name: 'Story-Viewer', href: '/(dev)/ds/story' },
  { name: 'Comment-Item · Thread · Composer · Comments-Sheet', href: '/(dev)/ds/comment' },
  { name: 'Likes · Share · Collection · Media-Item', href: '/(dev)/ds/social' },
];

export default function DsIndex() {
  const t = useTheme();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
        <Text variant="Heading/Subheading">@gr/ds gallery · {t.scheme}</Text>
        <Text variant="Body/Base/DemiBold">Brand · Logo</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space('Spacing/Gap/Large') }}>
          <Logo />
          <Logo variant="full" />
          <View style={{ backgroundColor: t.color('Color/Background/Accent/Solid/Default'), padding: t.space('Spacing/Padding/Small'), borderRadius: t.radius('Corner-Radius/Base') }}>
            <Logo variant="full" tone="onBrand" />
          </View>
        </View>
        {GALLERY.map((g) => (
          <Link key={g.href} href={g.href as never} asChild>
            <Pressable style={{ paddingVertical: t.space('Spacing/Gap/Small') }}>
              <Text variant="Body/Base/DemiBold" color="Color/Content/Accent/Base">{g.name}</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </Screen>
  );
}
