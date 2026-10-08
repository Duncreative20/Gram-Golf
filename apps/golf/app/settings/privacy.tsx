import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Avatar, Button, Dialog, ListItem, Screen, Text, ToggleRow, useTheme } from '@gr/ds';
import type { Preferences, Profile } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { prefsOf, profileById } from '../../lib/selectors';
import { initials } from '../../lib/format';
import { resetTo, StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';
import { SavedToast } from '../../components/Feedback';

const DELETE_STEPS = [
  {
    title: 'Xoá tài khoản?',
    body: 'Hồ sơ, thông số, swing, bộ gậy, bài đăng và kết nối với HLV sẽ bị xoá vĩnh viễn.',
    primaryText: 'Tiếp tục',
  },
  {
    title: 'Xác nhận lần cuối',
    body: 'Không thể hoàn tác. Bạn sẽ được đăng xuất ngay sau khi xoá.',
    primaryText: 'Xoá vĩnh viễn',
  },
];

/** Quyền riêng tư: công khai bộ gậy / swing (người chơi), người đã chặn + Bỏ chặn, xoá tài khoản (Dialog 2 bước). */
export default function PrivacySettings() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [deleteStep, setDeleteStep] = useState(-1); // -1 đóng; 0, 1 = bước trong DELETE_STEPS (một Dialog đổi nội dung, không mở Dialog chồng)
  const [toast, setToast] = useState<{ key: number; title: string }>();
  if (!me) return <Redirect href="/" />;
  const prefs = prefsOf(state, me.id);
  const setPref = (patch: Partial<Preferences>) => dispatch({ type: 'setPrefs', userId: me.id, patch });
  const blocked = state.blocks
    .filter((b) => b.blockerId === me.id)
    .map((b) => profileById(state, b.blockedId))
    .filter((p): p is Profile => !!p);
  const step = DELETE_STEPS[Math.max(deleteStep, 0)]!; // đóng (-1) vẫn giữ chữ bước đầu trong lúc Dialog mờ dần
  return (
    <Screen>
      <StackHeader title="Quyền riêng tư" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        {me.role === 'player' && (
          <Section title="Ai xem được dữ liệu của bạn" caption="Mặc định chỉ bạn và HLV đã kết nối xem được">
            <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/XSmall') }}>
              <ToggleRow label="Công khai bộ gậy" select={prefs.publicClubs} onChange={(publicClubs) => setPref({ publicClubs })} />
              <ToggleRow label="Công khai danh sách swing" select={prefs.publicSwings} onChange={(publicSwings) => setPref({ publicSwings })} />
            </View>
          </Section>
        )}
        <Section title="Người đã chặn" caption="Hai bên không thấy bài của nhau và không theo dõi được nhau.">
          {blocked.length ? (
            blocked.map((p) => (
              <ListItem
                key={p.id}
                title={p.name}
                leading={<Avatar size="Medium" theme={p.avatarUrl ? 'Photo' : 'Accent'} source={p.avatarUrl ? { uri: p.avatarUrl } : undefined} initials={initials(p.name)} />}
                trailing={
                  <Button
                    level="Tertiary"
                    size="Small"
                    text="Bỏ chặn"
                    accessibilityLabel={`Bỏ chặn ${p.name}`}
                    onPress={() => {
                      dispatch({ type: 'unblock', blockerId: me.id, blockedId: p.id });
                      setToast((prev) => ({ key: (prev?.key ?? 0) + 1, title: `Đã bỏ chặn ${p.name}` }));
                    }}
                  />
                }
                trailingInteractive
              />
            ))
          ) : (
            <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
              Bạn chưa chặn ai.
            </Text>
          )}
        </Section>
        <Section title="Tài khoản" caption="Xoá vĩnh viễn hồ sơ và toàn bộ dữ liệu của bạn trên GramGolf.">
          <View style={{ paddingHorizontal: t.layout('Margin-Small') }}>
            <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="trash-line" text="Xoá tài khoản" onPress={() => setDeleteStep(0)} />
          </View>
        </Section>
      </ScrollView>
      <Dialog
        visible={deleteStep >= 0}
        onRequestClose={() => setDeleteStep(-1)}
        theme="Negative"
        title={step.title}
        body={step.body}
        primaryText={step.primaryText}
        destructive
        onPrimary={() => {
          if (deleteStep < DELETE_STEPS.length - 1) return setDeleteStep(deleteStep + 1);
          // ponytail: mock chỉ đăng xuất, dữ liệu vẫn trong store — bản thật gọi API xoá tài khoản rồi mới đăng xuất.
          setDeleteStep(-1);
          dispatch({ type: 'signOut' });
          resetTo('/');
        }}
        secondaryText="Huỷ"
      />
      {toast && <SavedToast key={toast.key} title={toast.title} onDone={() => setToast(undefined)} />}
    </Screen>
  );
}
