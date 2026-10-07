import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Breadcrumbs, Pagination, ProgressBar, Screen, Skeleton, SkeletonText, Stepper, Text, useTheme } from '@gr/ds';

export default function ProgressGallery() {
  const t = useTheme();
  const [page, setPage] = useState(3);
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: t.space('Spacing/Gap/Small'), alignItems: 'center' as const };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Progress-Bar</Text>
        <ProgressBar value={0.25} theme="Accent" label="Accent · 25%" />
        <ProgressBar value={0.5} theme="Neutral" label="Neutral · 50%" />
        <ProgressBar value={0.75} theme="Status" status="Warning" label="Status Warning" />
        <ProgressBar value={1} theme="Status" status="Positive" />
        <View style={{ padding: t.space('Spacing/Padding/Small'), backgroundColor: t.color('Color/Background/Black-Overlay/Default'), borderRadius: t.radius('Corner-Radius/Base') }}>
          <ProgressBar value={0.6} theme="Overlay" label="Overlay" />
        </View>
        <Text variant="Heading/Subheading">Skeleton</Text>
        <View style={row}>
          <Skeleton shape="Round" size="Large - 48px" />
          <Skeleton shape="Square" size="Medium - 40px" />
          <Skeleton shape="Pill" size="Small - 32px" width={t.layout('Card-padding-medium') * 6} />
          <Skeleton shape="Rectangle" size="XSmall" width={t.layout('Card-padding-medium') * 4} />
        </View>
        <SkeletonText heading="Large" />
        <SkeletonText lines={3} />
        <Text variant="Heading/Subheading">Pagination</Text>
        <Pagination page={page} count={12} onChange={setPage} theme="Primary" />
        <Pagination page={page} count={12} onChange={setPage} theme="Secondary" size="Small" />
        <Pagination page={page} count={12} onChange={setPage} theme="Inline" />
        <Text variant="Heading/Subheading">Breadcrumbs</Text>
        <Breadcrumbs items={[{ label: 'Home', icon: 'home-03-line', onPress: () => {} }, { label: 'Sân golf', onPress: () => {} }, { label: 'Chi tiết' }]} />
        <Text variant="Heading/Subheading">Stepper</Text>
        <Stepper current={1} steps={[{ title: 'Chọn sân', caption: 'Đã xong' }, { title: 'Thời gian', caption: 'Đang chọn' }, { title: 'Thanh toán' }]} />
        <Stepper current={2} steps={[{ title: 'Bước 1' }, { title: 'Lỗi', caption: 'Thiếu thông tin', error: true }, { title: 'Bước 3', icon: 'settings-01-line' }]} />
      </ScrollView>
    </Screen>
  );
}
