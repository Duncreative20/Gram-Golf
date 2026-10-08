// Stub Expo Router cho Storybook màn app: điều hướng KHÔNG đổi màn — chỉ ghi vào panel Actions; không bao giờ throw.
// Params của route (useLocalSearchParams / useGlobalSearchParams) lấy từ ParamsContext do appStory() đặt cho từng story.
import { cloneElement, createContext, isValidElement, useContext, useEffect, type PropsWithChildren, type ReactElement } from 'react';
import { Pressable, View } from 'react-native';
import { action } from 'storybook/actions';
import { Text, useTheme } from '@gr/ds';

export type Href = string | object;

const log = (name: string) => (...args: unknown[]) => void action(`router.${name}`)(...args);
export const router = {
  push: log('push'),
  replace: log('replace'),
  navigate: log('navigate'),
  back: log('back'),
  dismiss: log('dismiss'),
  dismissTo: log('dismissTo'),
  dismissAll: log('dismissAll'),
  setParams: log('setParams'),
  canGoBack: () => true,
  canDismiss: () => true,
};
export const useRouter = () => router;

export const ParamsContext = createContext<Record<string, string>>({});
export const useLocalSearchParams = <T = Record<string, string>,>() => useContext(ParamsContext) as T;
export const useGlobalSearchParams = useLocalSearchParams;

// Href dạng object { pathname: '/clubs/[id]', params: { id } } → '/clubs/cl-driver' (params thừa → ?query).
const hrefText = (href: Href) => {
  if (typeof href === 'string') return href;
  const { pathname = '', params = {} } = href as { pathname?: string; params?: Record<string, unknown> };
  const rest = { ...params };
  const path = pathname.replace(/\[(\w+)\]/g, (_, k: string) => {
    const v = rest[k];
    delete rest[k];
    return String(v);
  });
  const query = new URLSearchParams(Object.entries(rest).map(([k, v]) => [k, String(v)])).toString();
  return query ? `${path}?${query}` : path;
};

/** Guard của màn hiện thành thông báo (không chuyển màn) để thấy được trong story. */
export function Redirect({ href }: { href: Href }) {
  const t = useTheme();
  useEffect(() => log('Redirect')(href), [href]);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: t.layout('Margin-Small'), backgroundColor: t.color('Color/Background/Canvas/Alt') }}>
      <Text variant="Body/Base/DemiBold" color="Color/Content/Neutral/Strongest">{`↪ Chuyển hướng tới ${hrefText(href)}`}</Text>
    </View>
  );
}

export function Link({ href, asChild, children, ...rest }: PropsWithChildren<{ href: Href; asChild?: boolean }>) {
  const onPress = () => log('Link')(href);
  if (asChild && isValidElement(children)) return cloneElement(children as ReactElement<{ onPress?: () => void }>, { onPress });
  return <Pressable {...rest} onPress={onPress}>{children}</Pressable>;
}

// Chỉ _layout dùng Stack (story không vẽ layout) — trả null cho an toàn.
export function Stack(_: PropsWithChildren<{ screenOptions?: unknown }>) {
  return null;
}
Stack.Screen = function StackScreen(_: { name?: string; options?: unknown }) {
  return null;
};
