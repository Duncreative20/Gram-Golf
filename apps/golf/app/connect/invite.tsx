import { useState } from 'react';
import { Clipboard, ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Button, Card, Dialog, ListItem, Screen, ShareSheet, Text, useTheme } from '@gr/ds';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { discover, pendingInvites, roster } from '../../lib/selectors';
import { formatDate, timeLeft } from '../../lib/format';
import { newInvite } from '../../lib/ids';
import { StackHeader } from '../../components/StackHeader';
import { Section } from '../../components/Section';
import { SavedToast } from '../../components/Feedback';

const inviteLink = (code: string) => `https://gramgolf.app/i/${code}`;

/** HLV tạo mã mời 6 ký tự (hạn 7 ngày), chia sẻ / sao chép link, xem và thu hồi lời mời đang chờ.
 *  `?code=` (chạm một lời mời ở tab Học viên) hiện lại thẻ của mã đang chờ đó để sao chép / chia sẻ lại. */
export default function CreateInvite() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [current, setCurrent] = useState(code); // mã đang hiện: mở từ tab Học viên hoặc vừa tạo ở màn này
  const [sharing, setSharing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [copiedInSheet, setCopiedInSheet] = useState(false);
  const [revoking, setRevoking] = useState<string>(); // giữ mã để tiêu đề Dialog không trống khi Dialog mờ dần lúc đóng
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<{ key: number; title: string }>();
  if (me?.role !== 'coach') return <Redirect href="/" />; // chưa đăng nhập → welcome; học viên nhập mã ở connect/accept
  const pending = pendingInvites(state, me.id, NOW);
  const shown = pending.find((i) => i.code === current); // thu hồi / hết hạn → ẩn thẻ mã
  const notify = (title: string) => setToast((prev) => ({ key: (prev?.key ?? 0) + 1, title })); // key mới → Toast hiện lại từ đầu
  const create = () => {
    const invite = newInvite(me.id, NOW, state.invites.map((i) => i.code));
    dispatch({ type: 'createInvite', invite });
    setCurrent(invite.code);
  };
  // ponytail: Clipboard của RN core (deprecated, bản dev cảnh báo một lần) vì không thêm dependency — nâng cấp: expo-clipboard.
  const copy = (code: string) => Clipboard.setString(inviteLink(code));
  const closeSheet = () => {
    setSharing(false);
    setSelected([]);
    setMessage('');
    setCopiedInSheet(false);
  };
  // Học viên có thể mời: người chơi chưa kết nối với HLV này, không chặn nhau
  const players = discover(state, me.id, '')
    .filter((p) => p.role === 'player' && !roster(state, me.id).some((r) => r.id === p.id))
    .map((p) => ({ id: p.id, name: p.name, avatar: p.avatarUrl ? { uri: p.avatarUrl } : undefined }));
  return (
    <Screen>
      <StackHeader title="Mời học viên" />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          {shown ? (
            <Card theme="Border" style={{ alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}>
              <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">Mã mời</Text>
              <Text variant="Display/2" selectable accessibilityLabel={`Mã mời ${shown.code.split('').join(' ')}`}>{shown.code}</Text>
              <Text variant="Body/Small/Regular" color="Color/Content/Accent/Base" selectable style={{ textAlign: 'center' }}>{inviteLink(shown.code)}</Text>
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                {`Hết hạn ${formatDate(shown.expiresAt)} · ${timeLeft(shown.expiresAt, NOW).toLowerCase()}`}
              </Text>
              <View style={{ flexDirection: 'row', alignSelf: 'stretch', gap: t.space('Spacing/Gap/Small') }}>
                <View style={{ flex: 1 }}>
                  <Button size="Medium (Base)" leadingIcon="share-01-line" text="Chia sẻ" accessibilityLabel="Chia sẻ mã mời" onPress={() => setSharing(true)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    level="Secondary"
                    size="Medium (Base)"
                    leadingIcon="copy-line"
                    text="Sao chép"
                    accessibilityLabel="Sao chép link mời"
                    onPress={() => {
                      copy(shown.code);
                      notify('Đã sao chép link mời');
                    }}
                  />
                </View>
              </View>
            </Card>
          ) : (
            <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">
              Tạo mã mời có hạn 7 ngày rồi gửi cho học viên. Học viên nhập mã ở tab HLV — kết nối xong bạn xem được thông số, swing, bộ gậy và thể lực của họ.
            </Text>
          )}
          <Button level={shown ? 'Tertiary' : 'Primary'} size="Medium (Base)" leadingIcon="plus-line" text={shown ? 'Tạo mã khác' : 'Tạo mã mời'} onPress={create} />
        </View>
        <Section title="Lời mời đang chờ" caption={pending.length ? 'Mã còn hạn, chưa có học viên dùng' : undefined}>
          {pending.length ? (
            pending.map((i) => (
              <ListItem
                key={i.code}
                title={i.code}
                caption={`${timeLeft(i.expiresAt, NOW)} · tạo ${formatDate(i.createdAt)}`}
                trailing={
                  <Button
                    level="Tertiary"
                    size="Small"
                    text="Thu hồi"
                    accessibilityLabel={`Thu hồi mã ${i.code}`}
                    onPress={() => {
                      setRevoking(i.code);
                      setConfirm(true);
                    }}
                  />
                }
                trailingInteractive
              />
            ))
          ) : (
            <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
              Chưa có lời mời nào đang chờ.
            </Text>
          )}
        </Section>
      </ScrollView>
      {shown && (
        <ShareSheet
          visible={sharing}
          onClose={closeSheet}
          heading="Chia sẻ mã mời"
          users={players}
          selectedIds={selected}
          onToggleUser={(u) => setSelected(selected.includes(u.id) ? selected.filter((x) => x !== u.id) : [...selected, u.id])}
          message={message}
          onChangeMessage={setMessage}
          onSend={() => {
            // ponytail: gửi trong app chỉ giả lập (chưa có tin nhắn / thông báo lời mời cho người nhận) — học viên vẫn nhập mã ở tab HLV.
            notify(`Đã gửi mã ${shown.code} cho ${selected.length} người`);
            closeSheet();
          }}
          actions={[
            {
              icon: copiedInSheet ? 'check-line' : 'copy-line',
              label: copiedInSheet ? 'Đã sao chép' : 'Sao chép',
              active: copiedInSheet,
              onPress: () => {
                copy(shown.code);
                setCopiedInSheet(true);
              },
            },
          ]}
        />
      )}
      <Dialog
        visible={confirm}
        onRequestClose={() => setConfirm(false)}
        theme="Warning"
        title={`Thu hồi mã ${revoking ?? ''}?`}
        body="Học viên sẽ không dùng được mã này để kết nối nữa. Các kết nối đã có không bị ảnh hưởng."
        primaryText="Thu hồi"
        destructive
        onPrimary={() => {
          setConfirm(false);
          if (!revoking) return;
          dispatch({ type: 'revokeInvite', code: revoking });
          notify(`Đã thu hồi mã ${revoking}`);
        }}
        secondaryText="Giữ mã"
      />
      {toast && <SavedToast key={toast.key} title={toast.title} onDone={() => setToast(undefined)} />}
    </Screen>
  );
}
