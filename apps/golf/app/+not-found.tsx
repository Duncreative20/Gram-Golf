import { View } from 'react-native';
import { router } from 'expo-router';
import { EmptyState, Screen, useTheme } from '@gr/ds';
import { StackHeader } from '../components/StackHeader';

/** 404 cho mọi URL / deep link không có màn (thay màn "Unmatched Route" tiếng Anh của Expo Router). "/" tự chia theo vai trò. */
export default function NotFound() {
  const t = useTheme();
  return (
    <Screen>
      <StackHeader title="Không tìm thấy" />
      <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
        <EmptyState
          icon="file-search-line"
          title="Không tìm thấy trang"
          caption="Đường dẫn này không tồn tại hoặc đã bị đổi. Về trang chủ để tiếp tục."
          primaryText="Về trang chủ"
          onPrimary={() => router.replace('/')}
        />
      </View>
    </Screen>
  );
}
