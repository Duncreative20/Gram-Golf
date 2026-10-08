import { ScrollView, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Screen, ToggleRow, useTheme } from '@gr/ds';
import type { NotificationType, Role } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';

/** Nhãn 8 loại thông báo; `roles` = vai trò nhận được loại đó (HLV không nhận ghi chú/phân tích, người chơi không nhận "học viên đăng swing mới"). */
const TYPES: { type: NotificationType; label: string; roles: Role[] }[] = [
  { type: 'coach_note', label: 'Ghi chú của HLV', roles: ['player'] },
  { type: 'analysis_done', label: 'Phân tích swing xong', roles: ['player'] },
  { type: 'swing_uploaded', label: 'Học viên đăng swing mới', roles: ['coach'] },
  { type: 'connect_request', label: 'Lời mời và yêu cầu kết nối', roles: ['player', 'coach'] },
  { type: 'invite_accepted', label: 'Kết nối được chấp nhận', roles: ['player', 'coach'] },
  { type: 'follow', label: 'Người theo dõi mới', roles: ['player', 'coach'] },
  { type: 'like', label: 'Lượt thích bài viết', roles: ['player', 'coach'] },
  { type: 'comment', label: 'Bình luận bài viết', roles: ['player', 'coach'] },
];

/** Bật/tắt thông báo đẩy theo loại + giờ yên lặng. Danh sách trong app (chuông) vẫn đủ mọi loại. */
export default function NotificationSettings() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  if (!me) return <Redirect href="/" />;
  const prefs = prefsOf(state, me.id);
  const rows = { paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/XSmall') };
  return (
    <Screen>
      <StackHeader title="Thông báo" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <Section title="Nhận thông báo khi" caption="Thông báo đẩy về điện thoại. Mục trong chuông thông báo vẫn hiện đủ.">
          <View style={rows}>
            {TYPES.filter((x) => x.roles.includes(me.role)).map((x) => (
              <ToggleRow
                key={x.type}
                label={x.label}
                select={prefs.notify[x.type]}
                onChange={(on) => dispatch({ type: 'setPrefs', userId: me.id, patch: { notify: { ...prefs.notify, [x.type]: on } } })}
              />
            ))}
          </View>
        </Section>
        <Section title="Giờ yên lặng">
          <View style={rows}>
            <ToggleRow
              label="Giờ yên lặng (22:00–07:00)"
              caption="Không rung, không chuông trong khung giờ này"
              select={prefs.quietHours}
              onChange={(quietHours) => dispatch({ type: 'setPrefs', userId: me.id, patch: { quietHours } })}
            />
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}
