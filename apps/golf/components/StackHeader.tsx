import { router, type Href } from 'expo-router';
import { TopNavigation, type TopNavAction } from '@gr/ds';

/** Header màn stack: nút quay lại + tiêu đề trái. Mở thẳng bằng URL (không có lịch sử) thì "quay lại" về `/`. */
export function StackHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: TopNavAction[] }) {
  const back: TopNavAction = {
    icon: 'chevron-left-line-medium',
    accessibilityLabel: 'Quay lại',
    onPress: () => (router.canGoBack() ? router.back() : router.replace('/')),
  };
  return <TopNavigation heading={title} subtitle={subtitle} align="Left" leadingAction={back} trailingActions={actions} />;
}

/** Rời một luồng (đăng ký xong, đổi tài khoản, đăng xuất): đóng các màn đang chồng trong stack rồi thay bằng `href`
 *  → back / vuốt lui không quay về welcome, form đăng ký hay màn của phiên cũ. */
export const resetTo = (href: Href) => {
  if (router.canDismiss()) router.dismissAll();
  router.replace(href);
};
