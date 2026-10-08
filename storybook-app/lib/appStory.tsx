// appStory() — helper DUY NHẤT cho story màn app: dựng store mẫu (seedState), đăng nhập `as`, chạy `setup` MỘT lần trước khi vẽ màn,
// cấp params route qua stub expo-router, (tuỳ chọn) vẽ AppTabBar thật dưới màn, và giữ trạng thái tạm thời (`hold`) để ảnh chụp tất định.
import { useEffect, useState, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import type { Decorator } from '@storybook/react-native-web-vite';
import { action } from 'storybook/actions';
import { fireEvent } from 'storybook/test';
import { StoreProvider, useStore } from '../../apps/golf/lib/store';
import type { Action } from '../../apps/golf/lib/reducer';
import type { AppState, ID } from '../../apps/golf/lib/domain';
import { DELAYS } from '../../apps/golf/lib/simulate';
import { AppTabBar } from '../../apps/golf/components/AppTabBar';
import { resetFirstLoad } from '../../apps/golf/components/ListSkeleton';
import { ParamsContext } from '../stubs/expo-router';

type Setup = Action[] | ((dispatch: (a: Action) => void, state: AppState) => void | Action[]);
export type AppStoryOptions = {
  /** Id người dùng mẫu (lib/mock.ts): p-minh, p-lan, p-khoa, p-huy, c-tuan, c-ha. Bỏ trống = chưa đăng nhập. */
  as?: ID;
  /** Params route, vd `{ id: 'sw-minh-1' }` cho swings/[id]. */
  params?: Record<string, string>;
  /** Action dựng trạng thái sau khi đăng nhập (mảng, hoặc hàm nhận dispatch + state seed và trả mảng). */
  setup?: Setup;
  /** Màn thuộc nhóm tab → vẽ thanh tab thật, `active` = tên route tab (home, metrics, roster…). */
  tabs?: { role: 'player' | 'coach'; active: string };
  /** Giữ trạng thái tạm thời để ảnh tất định: khoá `DELAYS` (apps/golf/lib/simulate.ts) liệt kê ở đây thành vô hạn trong story này —
   *  'firstLoad' giữ skeleton, 'save' giữ spinner "Đang lưu…" / "Đang xoá…", 'toast' giữ toast thành công, 'toastError' giữ toast thất bại,
   *  'ocr' giữ "Đang đọc…". */
  hold?: (keyof typeof DELAYS)[];
};

// Chép từ apps/golf/app/(player|coach)/_layout.tsx (Tabs.Screen name + title) — layout đổi tab thì sửa ở đây.
const TABS = {
  player: { home: 'Tổng quan', metrics: 'Thông số', swings: 'Swing', community: 'Cộng đồng', coach: 'HLV' },
  coach: { roster: 'Học viên', community: 'Cộng đồng', inbox: 'Thông báo', me: 'Hồ sơ' },
} as const;

const DEFAULT_DELAYS = { ...DELAYS };
const FOREVER = 2_147_483_647; // setTimeout tối đa (~24,8 ngày)

/** Gõ vào ô nhập trong `play`: setter gốc + sự kiện input. `userEvent.type` KHÔNG tới `onChangeText` của TextInput react-native-web 0.21 + React 19
 *  (chữ có trong DOM nhưng state React rỗng — issues/A.md, E.md), nên story không dùng `userEvent.type` cho ô nhập. */
export const typeIn = async (el: HTMLElement, value: string) => void (await fireEvent.input(el, { target: { value } }));

// Cổng nạp state: StoreProvider không nhận state ban đầu (lib/store.tsx) → dispatch signIn + setup một lần rồi mới vẽ màn.
function Seed({ as, setup, children }: PropsWithChildren<Pick<AppStoryOptions, 'as' | 'setup'>>) {
  const { state, dispatch } = useStore();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (as) dispatch({ type: 'signIn', userId: as });
    const actions = typeof setup === 'function' ? setup(dispatch, state) : setup;
    actions?.forEach(dispatch);
    setReady(true);
  }, []); // một lần — như DevQuickLogin của app
  return ready ? children : null;
}

function TabBar({ role, active }: NonNullable<AppStoryOptions['tabs']>) {
  const routes = Object.entries(TABS[role]).map(([name, title]) => ({ key: name, name, title }));
  const index = routes.findIndex((r) => r.name === active);
  const props = {
    state: { index, routes },
    descriptors: Object.fromEntries(routes.map((r) => [r.key, { options: { title: r.title } }])),
    navigation: { navigate: action('tab.navigate') },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return <AppTabBar {...(props as unknown as Parameters<typeof AppTabBar>[0])} />;
}

export function appStory({ as, params = {}, setup, tabs, hold = [] }: AppStoryOptions = {}) {
  const decorator: Decorator = (Story) => {
    // ponytail: sửa object dùng chung lúc vẽ — mỗi story đặt lại TOÀN BỘ về mặc định trước (DELAYS + bộ nhớ firstLoad) nên `hold` không rò sang story sau;
    // cần vẽ nhiều story cùng lúc trong một trang thì chuyển DELAYS vào context.
    Object.assign(DELAYS, DEFAULT_DELAYS, Object.fromEntries(hold.map((k) => [k, FOREVER])));
    resetFirstLoad(); // `seen` của useFirstLoad cũng là state module — story nào cũng bắt đầu như lần mở đầu trong phiên
    return (
      <StoreProvider>
        <ParamsContext.Provider value={params}>
          <Seed as={as} setup={setup}>
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <Story />
              </View>
              {tabs && <TabBar {...tabs} />}
            </View>
          </Seed>
        </ParamsContext.Provider>
      </StoreProvider>
    );
  };
  return { decorators: [decorator], parameters: { layout: 'fullscreen' } };
}
