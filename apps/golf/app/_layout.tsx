// Đăng nhập nhanh khi dev (chụp ảnh/kiểm thử): thêm `?as=<userId>` vào URL bất kỳ, ví dụ
//   node scripts/shot-web.mjs "/(player)/home?as=p-minh" light out.png 390 844
// → signIn userId đó một lần trước khi vẽ màn (chỉ __DEV__, bỏ qua id không có trong dữ liệu mẫu).
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, fontAssets } from '@gr/ds';
import { StoreProvider, useStore } from '../lib/store';
import { profileById } from '../lib/selectors';

SplashScreen.preventAutoHideAsync();

function DevQuickLogin({ children }: PropsWithChildren) {
  const { as } = useGlobalSearchParams<{ as?: string }>();
  const { state, dispatch } = useStore();
  const [handled, setHandled] = useState<string>();
  const pending = __DEV__ && !!as && as !== handled;
  useEffect(() => {
    if (!pending) return;
    if (as !== state.sessionUserId && profileById(state, as)) dispatch({ type: 'signIn', userId: as });
    setHandled(as);
  }, [pending, as]); // chạy một lần mỗi giá trị `as`
  return pending ? null : children;
}

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);
  if (!loaded) return null;
  return (
    <ThemeProvider scheme="auto" emphasis="brand">
      <StoreProvider>
        <DevQuickLogin>
          <Stack screenOptions={{ headerShown: false }} />
        </DevQuickLogin>
      </StoreProvider>
    </ThemeProvider>
  );
}
