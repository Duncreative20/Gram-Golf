import { router, type Href } from 'expo-router';
import { TopNavigation, type TopNavAction } from '@gr/ds';

/** Header màn stack: nút quay lại + tiêu đề trái. Mở thẳng bằng URL (không có lịch sử) thì "quay lại" về `/`.
 *  `onBack`: màn nhiều bước tự lùi một bước thay vì rời màn (vd Đăng ký bước 2 → bước 1). */
export function StackHeader({ title, subtitle, actions, onBack }: { title: string; subtitle?: string; actions?: TopNavAction[]; onBack?: () => void }) {
  const back: TopNavAction = {
    icon: 'chevron-left-line-medium',
    accessibilityLabel: 'Quay lại',
    onPress: onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/'))),
  };
  return <TopNavigation heading={title} subtitle={subtitle} align="Left" leadingAction={back} trailingActions={actions} />;
}

/** Rời một luồng (đăng ký xong, đổi tài khoản, đăng xuất): đóng các màn đang chồng trong stack rồi thay bằng `href`
 *  → back / vuốt lui không quay về welcome, form đăng ký hay màn của phiên cũ. */
export const resetTo = (href: Href) => {
  if (router.canDismiss()) router.dismissAll();
  router.replace(href);
};
