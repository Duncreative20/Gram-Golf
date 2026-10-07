import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text, TopNavigation, useTheme } from '@gr/ds';
import { darkDemo } from '../../../lib/demo';

export default function TopNavGallery() {
  const t = useTheme();
  const back = { icon: 'chevron-left-line-medium' as const, accessibilityLabel: 'Quay lại', onPress: () => router.back() };
  const [share, more] = [
    { icon: 'share-01-line' as const, accessibilityLabel: 'Chia sẻ' },
    { icon: 'dots-horizontal-line' as const, accessibilityLabel: 'Thêm' },
  ];
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Top-Navigations</Text>
        <TopNavigation heading="@birdiehunter101" leadingAction={back} trailingActions={[more]} divider />
        <TopNavigation heading="Bình luận" subtitle="128 bình luận" align="Left" leadingAction={back} trailingActions={[share, more]} divider />
        <TopNavigation heading="Tiêu đề lớn" size="Large" align="Left" />
        <TopNavigation heading="Small" subtitle="Phụ đề" size="Small" leadingAction={back} />
        <TopNavigation type="Search" triggerText="Tìm sân golf" triggerIcon="search-medium-line" leadingAction={back} trailingActions={[share]} divider />
        <TopNavigation type="Package-Select" triggerText="Gói Play & Stay" leadingAction={back} />
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Surface=Overlay (nền tối)</Text>
        <View style={{ backgroundColor: darkDemo(t).backgroundColor }}>
          <TopNavigation surface="Overlay" heading="Overlay" subtitle="Trên ảnh" leadingAction={back} trailingActions={[share, more]} />
          <TopNavigation surface="Overlay" type="Search" triggerText="Tìm kiếm" triggerIcon="search-medium-line" leadingAction={back} />
        </View>
      </ScrollView>
    </Screen>
  );
}
