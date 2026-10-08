import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Accordion, Button, Dialog, EmptyState, ListItem, Screen, Text, useTheme } from '@gr/ds';
import { SOURCE_LABELS, VENDOR_LABELS } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { canViewPrivate, clubById, clubLabel, prefsOf } from '../../lib/selectors';
import { formatDate, formatValue, mToYd } from '../../lib/format';
import { FITNESS_FIELDS, swingFields } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { NoAccess } from '../../components/NoAccess';
import { useOnLeave } from '../../components/useOnLeave';
import { SavedToast, SavingRow, useSimulatedWrite } from '../../components/Feedback';

export default function MetricSessionDetail() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Xoá sau khi màn đã rời (unmount) — xoá trước khi quay lại thì màn đang rời nháy "Không tìm thấy phiên".
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deleteSession', id: id! }));
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
  if (!me) return <Redirect href="/" />;
  const session = state.sessions.find((s) => s.id === id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!session || !canViewPrivate(state, me.id, session.playerId)) {
    return (
      <Screen>
        <StackHeader title="Chi tiết phiên" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          {session ? (
            <NoAccess />
          ) : (
            <EmptyState icon="file-search-line" title="Không tìm thấy phiên" caption="Phiên này không tồn tại hoặc đã bị xoá." primaryText="Quay lại" onPrimary={back} />
          )}
        </View>
      </Screen>
    );
  }
  const units = prefsOf(state, me.id).units;
  const club = clubById(state, session.clubId);
  const remove = () =>
    run(
      () => {
        deleteOnLeave(); // xoá khi màn đã rời (Task 21)
        back();
      },
      () => setFailed(true),
    );
  const info = [
    { label: 'Ngày', value: formatDate(session.capturedAt) },
    ...(session.kind === 'swing' ? [{ label: 'Gậy', value: club ? `${clubLabel(club)} · ${club.brand} ${club.model}` : 'Chưa gắn gậy' }] : []),
    { label: 'Nguồn', value: [SOURCE_LABELS[session.source], session.vendor && VENDOR_LABELS[session.vendor]].filter(Boolean).join(' · ') },
    ...(session.editedAt ? [{ label: 'Đã sửa', value: formatDate(session.editedAt) }] : []),
  ];
  const metrics =
    session.kind === 'swing'
      ? swingFields(units).map((f) => ({ label: f.label, value: formatValue(f.key === 'carryM' && units === 'imperial' ? mToYd(session.swing.carryM) : session.swing[f.key], f.unit, f.digits) }))
      : FITNESS_FIELDS.map((f) => ({ label: f.label, value: formatValue(session.fitness[f.key], f.unit, f.digits) }));
  const section = (title: string, rows: { label: string; value: string }[]) => (
    <View>
      <Text variant="Heading/Subheading" accessibilityRole="header" style={{ paddingHorizontal: t.layout('Margin-Small'), paddingBottom: t.space('Spacing/Padding/XSmall') }}>
        {title}
      </Text>
      {rows.map((r) => (
        <ListItem key={r.label} title={r.label} trailing={<Text variant="Body/Base/DemiBold">{r.value}</Text>} />
      ))}
    </View>
  );
  return (
    <Screen>
      <StackHeader title={session.kind === 'swing' ? 'Phiên swing' : 'Phiên thể lực'} subtitle={[club && clubLabel(club), formatDate(session.capturedAt)].filter(Boolean).join(' · ')} />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Large') }}>
        {section('Thông tin', info)}
        {section('Chỉ số', metrics)}
        {(session.source === 'csv' || session.source === 'photo') && (
          <View style={{ paddingHorizontal: t.layout('Margin-Small') }}>
            <Accordion title="Dữ liệu gốc" size="Medium">
              <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
                <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                  {`Bản ghi nhận từ ${session.source === 'csv' ? 'file CSV' : 'ảnh chụp màn hình'}${session.vendor ? ` ${VENDOR_LABELS[session.vendor]}` : ''} (mô phỏng)`}
                </Text>
                {/* ponytail: chưa lưu bản ghi gốc của máy đo — hiện số đã chuẩn hoá dạng JSON; bản thật đọc cột raw của phiên. */}
                <Text variant="Body/Code/Regular" color="Color/Content/Neutral/Base">
                  {JSON.stringify({ vendor: session.vendor, capturedAt: session.capturedAt, ...(session.kind === 'swing' ? session.swing : session.fitness) }, null, 2)}
                </Text>
              </View>
            </Accordion>
          </View>
        )}
        {session.playerId === me.id && (
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
            <Button level="Secondary" size="Medium (Base)" leadingIcon="edit-02-line" text="Sửa phiên" onPress={() => router.push({ pathname: '/metrics/manual', params: { id: session.id } })} />
            <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="trash-line" text={busy ? 'Đang xoá…' : 'Xoá phiên'} disabled={busy} onPress={() => setConfirmDelete(true)} />
            {busy && <SavingRow text="Đang xoá…" />}
          </View>
        )}
      </ScrollView>
      <Dialog
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        theme="Warning"
        title="Xoá phiên này?"
        body="Số liệu của phiên sẽ bị xoá và không khôi phục được."
        primaryText="Xoá"
        destructive
        onPrimary={() => {
          setConfirmDelete(false);
          remove();
        }}
        secondaryText="Huỷ"
      />
      {failed && (
        <SavedToast
          type="Negative"
          title="Xoá thất bại"
          caption="Mất kết nối — phiên vẫn còn."
          actionText="Thử lại"
          onAction={() => {
            setFailed(false);
            remove();
          }}
          onDone={() => setFailed(false)}
        />
      )}
    </Screen>
  );
}
