import { Stack } from 'expo-router';

// Stack riêng cho luồng xác thực: rời luồng bằng `router.replace('/')` thay cả nhóm (auth) ở stack gốc (native) → không "quay lại" được màn đăng ký.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
