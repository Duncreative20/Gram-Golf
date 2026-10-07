// Stub Expo Router cho Storybook (trang gallery chỉ dùng router.push/back và <Link>).
import type { PropsWithChildren } from 'react';
import { Pressable } from 'react-native';

const noop = () => undefined;
export const router = { push: noop, replace: noop, back: noop, navigate: noop };
export const useRouter = () => router;
export const useLocalSearchParams = () => ({});
export function Link({ children, asChild: _asChild, href: _href, ...rest }: PropsWithChildren<{ href?: unknown; asChild?: boolean }>) {
  return <Pressable {...rest}>{children}</Pressable>;
}
