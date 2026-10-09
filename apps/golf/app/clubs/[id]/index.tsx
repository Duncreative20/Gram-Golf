import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, Dialog, EmptyState, Icon, InlineMessage, ListItem, Screen, Tag, Text, useTheme } from '@gr/ds';
import { CAMERA_VIEW_LABELS, SOURCE_LABELS, type MetricSession } from '../../../lib/domain';
import { NOW } from '../../../lib/mock';
import { useStore } from '../../../lib/store';
import { canViewPrivate, clubById, clubLabel, clubLinkCount, notesFor, prefsOf, profileById, sessionsOf, swingsOf } from '../../../lib/selectors';
import { formatDate, formatDistance, formatSpeed, formatValue } from '../../../lib/format';
import { CLUB_FIELDS } from '../../../lib/validation';
import { StackHeader } from '../../../components/StackHeader';
import { Section } from '../../../components/Section';
import { NoAccess } from '../../../components/NoAccess';
import { SavedToast, SavingRow, useSimulatedWrite } from '../../../components/Feedback';
import { useOnLeave } from '../../../components/useOnLeave';

// ponytail: mỗi danh sách chỉ hiện 3 mục gần nhất, chưa có màn lọc theo gậy — cần xem hết thì thêm bộ lọc gậy ở tab Thông số / Swing.
const RECENT = 3;

export default function ClubDetail() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string>();
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deleteClub', id })); // xoá SAU khi rời màn — không nháy "Không tìm thấy gậy"
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
  if (!me) return <Redirect href="/" />;
  const club = clubById(state, id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/clubs'));
  const removeClub = () => {
    setFailed(false); // toast lỗi lần trước gỡ ra → lỗi lần này hiện lại đủ giờ
    run(
      () => {
        deleteOnLeave();
        back();
      },
      () => setFailed(true),
    );
  };
  if (!club || !canViewPrivate(state, me.id, club.playerId)) {
    return (
      <Screen>
        <StackHeader title="Chi tiết gậy" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          {club ? (
            <NoAccess />
          ) : (
            <EmptyState icon="file-search-line" title="Không tìm thấy gậy" caption="Gậy này không tồn tại." primaryText="Quay lại" onPrimary={back} />
          )}
        </View>
      </Screen>
    );
  }
  const own = club.playerId === me.id;
  const canEdit = own && !club.archivedAt; // HLV xem chỉ đọc; gậy đã lưu trữ không sửa được
  const units = prefsOf(state, me.id).units;
  const swings = swingsOf(state, club.playerId).filter((w) => w.clubId === club.id);
  const sessions = sessionsOf(state, club.playerId).filter((s): s is Extract<MetricSession, { kind: 'swing' }> => s.kind === 'swing' && s.clubId === club.id);
  const linked = clubLinkCount(state, club.id);
  const specs = [
    { label: 'Loại', value: club.type },
    { label: 'Hãng', value: club.brand },
    { label: 'Model', value: club.model },
    { label: 'Hãng cán', value: club.shaftBrand },
    { label: 'Flex', value: club.shaftFlex },
    ...CLUB_FIELDS.flatMap((f) => {
      const v = club[f.key];
      return v === undefined ? [] : [{ label: f.label, value: formatValue(v, f.unit) }];
    }),
  ];
  const shown = (n: number, unit: string) => (n > RECENT ? `${RECENT} gần nhất trong ${n} ${unit}` : undefined);
  const empty = (text: string) => (
    <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>{text}</Text>
  );
  const chevron = <Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />;
  const brandModel = `${club.brand} ${club.model}`;
  return (
    <Screen>
      <StackHeader
        title={clubLabel(club)}
        subtitle={own ? brandModel : `${profileById(state, club.playerId)?.name ?? 'Học viên'} · ${brandModel}`}
        actions={canEdit ? [{ icon: 'edit-02-line', accessibilityLabel: 'Sửa gậy', onPress: () => router.push(`/clubs/${club.id}/edit`) }] : undefined}
      />
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Large') }}>
        {club.archivedAt && (
          <View style={{ paddingHorizontal: t.layout('Margin-Small') }}>
            <InlineMessage text={`Đã lưu trữ ngày ${formatDate(club.archivedAt)} — gậy ẩn khỏi danh sách và chọn gậy, dữ liệu cũ giữ nguyên.${own ? ' Khôi phục để dùng lại.' : ''}`} />
          </View>
        )}
        <Section title="Thông số">
          {specs.map((r) => (
            <ListItem
              key={r.label}
              title={r.label}
              trailing={
                // cột giá trị tối đa gr-dm-240: tên hãng/cán dài xuống dòng thay vì đẩy nhãn ra khỏi hàng (ô trailing của ListItem không co)
                <View style={{ maxWidth: t.primitive('gr-dm-240') }}>
                  <Text variant="Body/Base/DemiBold" numberOfLines={2} style={{ textAlign: 'right' }}>{r.value}</Text>
                </View>
              }
            />
          ))}
        </Section>
        <Section title="Swing gần đây dùng gậy này" caption={shown(swings.length, 'swing')}>
          {swings.length
            ? swings.slice(0, RECENT).map((w) => {
                const notes = notesFor(state, w.id).length;
                return (
                  <ListItem
                    key={w.id}
                    title={formatDate(w.capturedAt)}
                    caption={[CAMERA_VIEW_LABELS[w.cameraView], w.analysis && 'Đã phân tích', notes > 0 && `${notes} ghi chú HLV`].filter(Boolean).join(' · ')}
                    trailing={chevron}
                    onPress={() => router.push(`/swings/${w.id}`)}
                  />
                );
              })
            : empty('Chưa có swing nào dùng gậy này.')}
        </Section>
        <Section title="Phiên số liệu gần đây" caption={shown(sessions.length, 'phiên')}>
          {sessions.length
            ? sessions.slice(0, RECENT).map((s) => (
                <ListItem
                  key={s.id}
                  title={formatDate(s.capturedAt)}
                  caption={`${formatSpeed(s.swing.clubSpeedMph)} · ${formatDistance(s.swing.carryM, units)}`}
                  trailing={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
                      <Tag size="Small" text={SOURCE_LABELS[s.source]} />
                      {chevron}
                    </View>
                  }
                  onPress={() => router.push(`/metrics/${s.id}`)}
                />
              ))
            : empty('Chưa có phiên số liệu nào với gậy này.')}
        </Section>
        {own && (
          <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
            {club.archivedAt ? (
              <Button
                level="Secondary"
                size="Medium (Base)"
                leadingIcon="refresh-ccw-01-line"
                text="Khôi phục gậy"
                onPress={() => {
                  dispatch({ type: 'unarchiveClub', id: club.id });
                  setToast('Đã khôi phục — gậy về danh sách Đang dùng');
                }}
              />
            ) : (
              <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="archive-line" text="Lưu trữ gậy" onPress={() => setConfirmArchive(true)} />
            )}
            {linked === 0 ? (
              <>
                <Button level="Danger Subtle" size="Medium (Base)" leadingIcon="trash-line" text="Xoá gậy" disabled={busy} onPress={() => setConfirmDelete(true)} />
                {busy && <SavingRow text="Đang xoá…" />}
              </>
            ) : (
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                {`Gậy đã gắn với ${linked} phiên/swing nên chỉ lưu trữ được — không xoá để giữ lịch sử.`}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
      <Dialog
        visible={confirmArchive}
        onRequestClose={() => setConfirmArchive(false)}
        theme="Warning"
        title="Lưu trữ gậy này?"
        body={linked > 0 ? `Gậy đã gắn với ${linked} phiên/swing sẽ được ẩn khỏi danh sách, dữ liệu cũ giữ nguyên.` : 'Gậy sẽ được ẩn khỏi danh sách.'}
        primaryText="Lưu trữ"
        destructive
        onPrimary={() => {
          setConfirmArchive(false);
          dispatch({ type: 'archiveClub', id: club.id, at: NOW });
          back();
        }}
        secondaryText="Huỷ"
      />
      <Dialog
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        theme="Warning"
        title="Xoá gậy này?"
        body="Gậy chưa gắn với phiên hay swing nào. Xoá xong không khôi phục được."
        primaryText="Xoá"
        destructive
        onPrimary={() => {
          setConfirmDelete(false);
          removeClub();
        }}
        secondaryText="Huỷ"
      />
      {toast && <SavedToast title={toast} onDone={() => setToast(undefined)} />}
      {failed && (
        <SavedToast
          type="Negative"
          title="Xoá thất bại"
          caption="Mất kết nối — gậy vẫn còn."
          actionText="Thử lại"
          onAction={removeClub}
          onDone={() => setFailed(false)}
        />
      )}
    </Screen>
  );
}
