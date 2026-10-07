import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AlertBanner, Button, Dialog, InlineMessage, Screen, Text, Toast, Tooltip, useTheme, type StatusTheme } from '@gr/ds';

const THEMES: StatusTheme[] = ['Neutral', 'Info', 'Positive', 'Warning', 'Negative'];

export default function FeedbackGallery() {
  const t = useTheme();
  const [dlg, setDlg] = useState(false);
  const gap = { gap: t.space('Spacing/Gap/Small') };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading" style={{ paddingHorizontal: t.layout('Margin-Small') }}>Alert-Banner · Medium / Small</Text>
        <View style={gap}>
          {THEMES.map((th) => <AlertBanner key={th} theme={th} text={`${th} — thông báo toàn trang`} actionText="Xem" onClose={() => {}} />)}
          <AlertBanner size="Small" theme="Info" text="Small · Info" onClose={() => {}} />
        </View>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          <Text variant="Heading/Subheading">Inline-Message</Text>
          <View style={gap}>
            {THEMES.map((th) => <InlineMessage key={th} theme={th} title={th} text="Caption mô tả chi tiết, có thể xuống dòng." actionText="Hành động" onClose={() => {}} />)}
            <InlineMessage theme="Neutral" text="Không title, không action" />
          </View>
          <Text variant="Heading/Subheading">Toast-Message</Text>
          <View style={gap}>
            <Toast type="Neutral" title="Đã lưu" caption="Bài viết đã vào bộ sưu tập" actionText="Mở" onClose={() => {}} />
            <Toast type="Subtle" title="Subtle" caption="Popover bg + border" onClose={() => {}} />
            <Toast type="Positive" title="Thành công" />
            <Toast type="Warning" title="Cảnh báo" caption="On-Brights" />
            <Toast type="Negative" title="Lỗi" actionText="Thử lại" />
          </View>
          <Text variant="Heading/Subheading">Tooltip</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/Small'), alignItems: 'center' }}>
            <Tooltip text="Default" />
            <Tooltip text="Accent" color="Accent" />
            <Tooltip text="White Overlay" color="White Overlay" />
            <Tooltip text="Black-Overlay" color="Black-Overlay" />
            <Tooltip text="Small" size="Small" />
          </View>
          <Text variant="Heading/Subheading">Modal/Dialog</Text>
          <Button text="Mở Dialog" level="Tertiary" size="Medium (Base)" onPress={() => setDlg(true)} />
          <Dialog visible={dlg} onRequestClose={() => setDlg(false)} theme="Warning" title="Xoá bài viết?" body="Hành động này không hoàn tác được." primaryText="Xoá" destructive onPrimary={() => setDlg(false)} secondaryText="Huỷ" />
        </View>
      </ScrollView>
    </Screen>
  );
}
