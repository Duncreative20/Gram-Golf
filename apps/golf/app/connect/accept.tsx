import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, Card, Screen, Text, TextField, useTheme, type StatusTheme } from '@gr/ds';
import type { ID, InviteCheck } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { activeCoaches, profileById, validateInvite } from '../../lib/selectors';
import { parseInviteCode } from '../../lib/format';
import { newId } from '../../lib/ids';
import { StackHeader } from '../../components/StackHeader';
import { CoachSummary } from '../../components/CoachSummary';
import { AlertMessage, SavedToast } from '../../components/Feedback';

const CHECK_MESSAGES: Record<Exclude<InviteCheck, 'ok'>, { theme: StatusTheme; text: string }> = {
  not_found: { theme: 'Negative', text: 'Mã không tồn tại' },
  expired: { theme: 'Negative', text: 'Mã đã hết hạn — xin HLV mã mới' },
  used: { theme: 'Negative', text: 'Mã đã được sử dụng' },
  revoked: { theme: 'Negative', text: 'Mã đã bị thu hồi' },
  already_connected: { theme: 'Info', text: 'Bạn đã kết nối với HLV này' },
};

/** Học viên nhập mã mời: Kiểm tra → xem trước HLV → Chấp nhận kết nối → Toast → tab HLV. */
export default function AcceptInvite() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [code, setCode] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [checked, setChecked] = useState<{ result: InviteCheck; coachId?: ID }>();
  const [accepted, setAccepted] = useState<{ name: string; primary: boolean }>();
  if (me?.role !== 'player') return <Redirect href="/" />; // chưa đăng nhập → welcome; HLV tạo mã ở connect/invite
  const verdict = (c: string) => ({ result: validateInvite(state, c, NOW, me.id), coachId: state.invites.find((i) => i.code.toUpperCase() === c)?.coachId });
  const check = () => {
    if (accepted) return; // Enter trên bàn phím sau khi đã kết nối: mã giờ là "đã dùng" — không kiểm lại
    if (code.length < 6) {
      setFieldError(code ? 'Mã mời gồm 6 ký tự' : 'Nhập mã mời');
      return;
    }
    setChecked(verdict(code));
  };
  const coach = checked?.result === 'ok' && checked.coachId ? profileById(state, checked.coachId) : undefined;
  const firstCoach = !activeCoaches(state, me.id).some((c) => c.connection.isPrimary); // chưa có HLV chính → kết nối này thành HLV chính
  const accept = () => {
    const latest = verdict(code); // kiểm lại ngay lúc chấp nhận — reducer cũng bỏ qua mã không hợp lệ
    if (latest.result !== 'ok' || !coach) {
      setChecked(latest);
      return;
    }
    dispatch({ type: 'acceptInvite', code, playerId: me.id, at: NOW, id: newId('cn'), notificationId: newId('nt') });
    setAccepted({ name: coach.name, primary: firstCoach });
  };
  // Một chỗ báo lỗi (role alert) cho cả lỗi nhập lẫn kết quả kiểm mã — chữ lỗi dưới TextField của DS không được đọc lên
  const problem = fieldError ? { theme: 'Negative' as const, text: fieldError } : checked && checked.result !== 'ok' ? CHECK_MESSAGES[checked.result] : undefined;
  return (
    <Screen>
      <StackHeader title="Nhập mã mời" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">
          Nhập mã 6 ký tự HLV gửi cho bạn. Sau khi kết nối, HLV xem được thông số, swing, bộ gậy và thể lực của bạn.
        </Text>
        <TextField
          label="Mã mời"
          placeholder="Ví dụ: AB23CD"
          value={code}
          onChangeText={(v) => {
            setCode(parseInviteCode(v));
            setFieldError(undefined);
            setChecked(undefined);
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="go"
          onSubmitEditing={check}
          readOnly={!!accepted}
          error={problem?.theme === 'Negative'}
          helpText={problem ? undefined : 'Dán cả link mời cũng được'}
        />
        {problem && <AlertMessage theme={problem.theme} text={problem.text} />}
        {coach ? (
          <Card theme="Border" style={{ gap: t.space('Spacing/Gap/Medium') }}>
            <Text variant="Label/Small/DemiBold" color="Color/Content/Neutral/Light">HLV mời bạn kết nối</Text>
            <CoachSummary coach={coach} />
            <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Base">
              {firstCoach || accepted?.primary
                ? 'Đây sẽ là HLV chính của bạn. Bạn huỷ kết nối được bất cứ lúc nào trong tab HLV.'
                : 'Bạn đã có HLV chính — HLV này là HLV phụ, đổi HLV chính trong tab HLV. Huỷ kết nối được bất cứ lúc nào.'}
            </Text>
            <Button leadingIcon="user-check-line" text="Chấp nhận kết nối" disabled={!!accepted} onPress={accept} />
          </Card>
        ) : (
          <Button text="Kiểm tra" onPress={check} />
        )}
      </ScrollView>
      {accepted && (
        <SavedToast
          title={`Đã kết nối với ${accepted.name}`}
          caption={accepted.primary ? 'HLV chính của bạn' : 'HLV phụ — đổi HLV chính trong tab HLV'}
          // dismissTo: có (player) trong stack thì quay về đó và chọn tab HLV; mở thẳng / vào từ onboarding (gốc stack) thì thay màn này
          onDone={() => router.dismissTo('/(player)/coach')}
        />
      )}
    </Screen>
  );
}
