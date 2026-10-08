import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, type Href } from 'expo-router';
import { Avatar, Button, Dialog, Icon, ListItem, Screen, Text, ToggleRow, useTheme } from '@gr/ds';
import type { ID, Role } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { formatValue, initials } from '../../lib/format';
import { resetTo, StackHeader } from '../../components/StackHeader';

const GROUPS: { role: Role; label: string }[] = [
  { role: 'player', label: 'Người chơi' },
  { role: 'coach', label: 'HLV' },
];

/** Kiểm tra theo luồng (docs/flows/README.md): chạm 1 luồng → đặt lại dữ liệu mẫu, tắt giả lập lỗi, đăng nhập đúng tài khoản, mở bước 1.
 *  Bước chi tiết + ảnh mong đợi ở docs/flows/F<nn>.md. */
const FLOWS: { id: string; title: string; account?: ID; start: Href; hint: string }[] = [
  // start / account = đúng `start` (bỏ ?as=) và tài khoản của docs/flows/F<nn>/steps.json — bước 1 của bảng F<nn>.md
  { id: 'F1', title: 'Người chơi mới', start: '/(auth)/welcome', hint: 'Đăng xuất · màn chào → Tạo tài khoản (Người chơi) · OTP 123456' },
  { id: 'F2', title: 'HLV mới', start: '/(auth)/welcome', hint: 'Đăng xuất · màn chào → Tạo tài khoản (Huấn luyện viên) · OTP 123456' },
  { id: 'F3', title: 'Tài khoản', start: '/(auth)/welcome', hint: 'Đăng xuất · màn chào → Đăng nhập (sai rồi đúng) · Quên mật khẩu' },
  { id: 'F4', title: 'Kết nối HLV – học viên', account: 'c-tuan', start: '/(coach)/roster', hint: 'HLV Đỗ Minh Tuấn · Học viên › Tất cả' },
  { id: 'F5', title: 'Số liệu', account: 'p-minh', start: '/(player)/home', hint: 'Nguyễn Minh Anh · Tổng quan → Thông số' },
  { id: 'F6', title: 'Bộ gậy', account: 'p-minh', start: '/(player)/metrics', hint: 'Nguyễn Minh Anh · Thông số → Bộ gậy' },
  { id: 'F7', title: 'Swing của người chơi', account: 'p-minh', start: '/(player)/swings', hint: 'Nguyễn Minh Anh · Swing' },
  { id: 'F8', title: 'HLV review swing', account: 'p-minh', start: '/(player)/swings', hint: 'Minh Anh đăng swing → đổi sang HLV Tuấn ở Dev' },
  { id: 'F9', title: 'HLV xem học viên', account: 'c-tuan', start: '/(coach)/roster', hint: 'HLV Đỗ Minh Tuấn · Học viên' },
  { id: 'F10', title: 'Cộng đồng', account: 'p-minh', start: '/(player)/community', hint: 'Nguyễn Minh Anh · Cộng đồng' },
  { id: 'F11', title: 'Thông báo', account: 'p-minh', start: '/(player)/home', hint: 'Nguyễn Minh Anh · Tổng quan → chuông (2 chưa đọc)' },
  { id: 'F12', title: 'Hồ sơ & cài đặt', account: 'p-minh', start: '/(player)/home', hint: 'Nguyễn Minh Anh · Tổng quan → avatar góc phải' },
  // typedRoutes không nhận URL không có màn → ép kiểu: đây chính là bước 1 của F13 (màn 404)
  { id: 'F13', title: 'Trạng thái xuyên suốt', account: 'p-minh', start: '/trang-khong-co' as Href, hint: 'Nguyễn Minh Anh · link không tồn tại → 404; bật Giả lập lỗi ở dưới cho bước 07' },
];

/** D13 — chỉ bản dev: đổi hồ sơ mẫu (vai trò), giả lập lỗi khi lưu/xoá, đặt lại dữ liệu, mở gallery DS. */
export default function DevSettings() {
  const t = useTheme();
  const { state, dispatch } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!__DEV__) return <Redirect href="/" />; // D13: deep link ở bản release không được đổi tài khoản
  const startFlow = (f: (typeof FLOWS)[number]) => {
    dispatch({ type: 'reset' });
    dispatch({ type: 'setSimulateFailure', on: false });
    dispatch(f.account ? { type: 'signIn', userId: f.account } : { type: 'signOut' });
    resetTo(f.start); // như đổi hồ sơ mẫu (Task 14): Hồ sơ / Cài đặt / Dev của phiên cũ không nằm dưới stack
  };
  const section = (label: string) => (
    <Text variant="Label/Small/DemiBold" color="Color/Content/Neutral/Light" accessibilityRole="header" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
      {label}
    </Text>
  );
  return (
    <Screen>
      <StackHeader title="Dev" subtitle="Chỉ có ở bản phát triển" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Large') }}>
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          {section('Kiểm tra theo luồng')}
          <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
            Chạm một luồng: đặt lại dữ liệu mẫu, đăng nhập đúng tài khoản và mở bước 1. Bước chi tiết và ảnh mong đợi ở docs/flows.
          </Text>
          <View>
            {FLOWS.map((f) => (
              <ListItem
                key={f.id}
                title={`${f.id} · ${f.title}`}
                caption={f.hint}
                leading={<Icon name="play-circle-line" size={t.size('Element-Size/Popular/Medium')} color="Color/Content/Accent/Base" />}
                onPress={() => startFlow(f)}
              />
            ))}
          </View>
        </View>
        {GROUPS.map((g) => (
          <View key={g.role} style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            {section(g.label)}
            <View>
              {state.profiles
                .filter((p) => p.role === g.role)
                .map((p) => (
                  <ListItem
                    key={p.id}
                    title={p.name}
                    caption={p.role === 'player' ? `${p.id} · Handicap ${p.handicap === undefined ? '—' : formatValue(p.handicap)}` : `${p.id} · ${p.academy ?? ''}`}
                    leading={<Avatar size="Medium" initials={initials(p.name)} theme="Accent" />}
                    selected={p.id === state.sessionUserId}
                    onPress={() => {
                      dispatch({ type: 'signIn', userId: p.id });
                      resetTo('/'); // vào từ welcome / hồ sơ: không để welcome hay màn của tài khoản cũ dưới tab
                    }}
                  />
                ))}
            </View>
          </View>
        ))}
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          {section('Giả lập')}
          <View style={{ paddingHorizontal: t.layout('Margin-Small') }}>
            <ToggleRow
              label="Giả lập lỗi khi lưu/xoá"
              caption="Lưu số liệu, gậy, tài khoản, bài viết và các nút xoá sẽ thất bại sau 0,6 giây — để xem toast lỗi và Thử lại"
              select={state.simulateFailure}
              onChange={(on) => dispatch({ type: 'setSimulateFailure', on })}
            />
          </View>
        </View>
        <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          {section('Dữ liệu')}
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
            <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="refresh-cw-01-line" text="Đặt lại dữ liệu mẫu" onPress={() => setConfirmReset(true)} />
            <Button level="Tertiary" size="Medium (Base)" leadingIcon="palette-line" text="Gallery DS" onPress={() => router.push('/(dev)/ds')} />
          </View>
        </View>
      </ScrollView>
      <Dialog
        visible={confirmReset}
        onRequestClose={() => setConfirmReset(false)}
        theme="Warning"
        title="Đặt lại dữ liệu mẫu?"
        body="Mọi thay đổi trong phiên (thông số, swing, bài viết, kết nối…) sẽ mất. Hồ sơ đang đăng nhập được giữ."
        primaryText="Đặt lại"
        destructive
        onPrimary={() => {
          setConfirmReset(false);
          dispatch({ type: 'reset' });
        }}
        secondaryText="Huỷ"
      />
    </Screen>
  );
}
