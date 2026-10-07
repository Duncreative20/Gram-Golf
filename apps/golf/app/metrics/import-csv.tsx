import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Button, Divider, DockIcon, EmptyState, Icon, InlineMessage, ListItem, Screen, Stepper, Tag, Text, useTheme } from '@gr/ds';
import { VENDOR_LABELS, type ID, type SwingMetrics } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { clubsOf, prefsOf } from '../../lib/selectors';
import { clubTypeFromCsv, parseLaunchMonitorCsv } from '../../lib/csv';
import { SAMPLE_FILES } from '../../lib/simulate';
import { formatDate, formatDistance, formatSpeed, formatValue } from '../../lib/format';
import { SWING_FIELDS } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { ClubPicker } from '../../components/ClubPicker';
import { AlertMessage, SavedToast, SessionDateField } from '../../components/SessionEntry';

type SampleFile = (typeof SAMPLE_FILES)[number];
// Chỉ số phụ của một dòng (tốc độ đầu gậy + carry đã ở tiêu đề); khoảng trắng không ngắt → chỉ xuống dòng sau " · "
const detail = (v: SwingMetrics) =>
  SWING_FIELDS.filter((f) => f.key !== 'clubSpeedMph' && f.key !== 'carryM')
    .map((f) => `${f.label} ${formatValue(v[f.key], f.unit, f.digits)}`.replace(/ /g, '\u00a0'))
    .join('\u00a0· ');

/** Nhập file CSV của máy đo: chọn file → xem trước (nhận diện hãng, dòng lỗi bị bỏ qua) → xác nhận gậy, ngày → lưu.
 *  `?file=<tên file mẫu>` (từ Quét QR) mở thẳng bước xem trước. */
export default function MetricsImportCsv() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { file: preset } = useLocalSearchParams<{ file?: string }>();
  const [file, setFile] = useState(() => SAMPLE_FILES.find((f) => f.name === preset));
  const [confirming, setConfirming] = useState(false);
  const [clubId, setClubId] = useState<ID>();
  const [capturedAt, setCapturedAt] = useState(NOW);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<{ title: string; caption: string }>(); // chốt lúc lưu
  if (me?.role !== 'player') return <Redirect href="/" />;
  const units = prefsOf(state, me.id).units;
  const result = file && parseLaunchMonitorCsv(file.content);
  const vendor = result?.vendor;
  const rows = result?.rows ?? [];
  const valid = rows.filter((r) => r.value);
  const skipped = rows.length - valid.length;
  // ponytail: một gậy cho cả file (file mẫu chỉ có một gậy) — file nhiều gậy cần chọn gậy theo từng nhóm dòng
  const csvClub = valid[0]?.club ?? '';
  const club = clubId ?? clubsOf(state, me.id).find((c) => c.type === clubTypeFromCsv(csvClub))?.id;
  const step = !file ? 0 : confirming ? 2 : 1;
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  const pick = (f?: SampleFile) => {
    setFile(f);
    setConfirming(false);
    setClubId(undefined);
    setSubmitted(false);
  };
  const save = () => {
    setSubmitted(true);
    if (!club || !vendor) return;
    const sessions = valid.map((r) => ({ id: newId('ss'), playerId: me.id, capturedAt, source: 'csv' as const, vendor, clubId: club, kind: 'swing' as const, swing: r.value! }));
    dispatch({ type: 'addSessions', sessions });
    setSaved({ title: `Đã nhập ${sessions.length} phiên`, caption: `${VENDOR_LABELS[vendor]} · ngày ${formatDate(capturedAt)}` });
  };
  const footer = (back: { text: string; onPress: () => void }, next: { text: string; onPress: () => void; disabled?: boolean }, alert?: string) => (
    <>
      <Divider />
      <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
        {alert && <AlertMessage theme="Negative" text={alert} />}
        <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
          <View style={{ flex: 1 }}>
            <Button level="Tertiary" text={back.text} disabled={!!saved} onPress={back.onPress} />
          </View>
          <View style={{ flex: 1 }}>
            <Button text={next.text} disabled={next.disabled || !!saved} onPress={next.onPress} />
          </View>
        </View>
      </View>
    </>
  );

  let body;
  if (!file) {
    body = (
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Small'), gap: t.space('Spacing/Gap/Small') }}>
        {/* ponytail: bản thử chưa mở file thật — bản chính dùng trình chọn file của hệ điều hành */}
        <View style={pad}>
          <InlineMessage theme="Info" text="Bản thử: chọn file mẫu" />
        </View>
        <View>
          {SAMPLE_FILES.map((f) => (
            <ListItem
              key={f.name}
              title={f.name}
              leading={<DockIcon icon="file-chart-line" />}
              trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />}
              onPress={() => pick(f)}
            />
          ))}
        </View>
      </ScrollView>
    );
  } else if (!vendor) {
    body = (
      <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
        <EmptyState
          icon="file-x-line"
          title="Không nhận diện được file"
          caption={`${file.name} không phải file xuất từ TrackMan hoặc Foresight.`}
          primaryText="Chọn file khác"
          onPrimary={() => pick(undefined)}
        />
      </View>
    );
  } else if (!confirming) {
    body = (
      <>
        <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <View style={[pad, { gap: t.space('Spacing/Gap/XSmall') }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }}>
              <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
                Hãng nhận diện
              </Text>
              <Tag size="Small" icon="check-line" text={VENDOR_LABELS[vendor]} />
            </View>
            <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" numberOfLines={1}>
              {file.name}
            </Text>
            <Text variant="Body/Base/DemiBold">{`${valid.length} dòng hợp lệ${skipped ? ` · ${skipped} dòng lỗi (bỏ qua)` : ''}`}</Text>
          </View>
          {/* ponytail: vẽ hết mọi dòng trong ScrollView — đủ cho file mẫu; file thật hàng trăm cú thì đổi FlatList */}
          <View>
            {rows.map((r) =>
              r.value ? (
                <ListItem
                  key={r.line}
                  title={`Dòng ${r.line} · ${formatSpeed(r.value.clubSpeedMph)} · ${formatDistance(r.value.carryM, units)}`}
                  caption={detail(r.value)}
                  leading={<Icon name="check-circle-line" size={t.size('Element-Size/Popular/Medium')} color="Color/Content/Positive/Base" />}
                />
              ) : (
                <View key={r.line} style={{ paddingBottom: t.space('Spacing/Padding/XSmall') }}>
                  <ListItem title={`Dòng ${r.line} · bỏ qua`} leading={<Icon name="alert-circle-line" size={t.size('Element-Size/Popular/Medium')} color="Color/Content/Negative/Base" />} />
                  <View style={pad}>
                    <InlineMessage theme="Negative" text={r.errors.join('\n')} />
                  </View>
                </View>
              ),
            )}
          </View>
        </ScrollView>
        {footer({ text: 'Chọn file khác', onPress: () => pick(undefined) }, { text: 'Tiếp tục', disabled: !valid.length, onPress: () => setConfirming(true) })}
      </>
    );
  } else {
    body = (
      <>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          <Text variant="Body/Base/Regular">{`${valid.length} phiên swing từ file ${VENDOR_LABELS[vendor]} sẽ được gắn cùng gậy và ngày dưới đây.`}</Text>
          <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
            <ClubPicker playerId={me.id} value={club} onChange={setClubId} error={submitted && !club ? 'Bắt buộc' : undefined} />
            {!!csvClub && (
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                {`Cột Club trong file: ${csvClub}`}
              </Text>
            )}
          </View>
          <SessionDateField value={capturedAt} onChange={setCapturedAt} />
        </ScrollView>
        {footer({ text: 'Quay lại', onPress: () => setConfirming(false) }, { text: `Nhập ${valid.length} phiên`, onPress: save }, submitted && !club ? `Chưa nhập: chọn gậy cho ${valid.length} phiên.` : undefined)}
      </>
    );
  }

  return (
    <Screen>
      <StackHeader title="Nhập file CSV" />
      <View style={[pad, { paddingBottom: t.space('Spacing/Padding/Small') }]}>
        <Stepper current={step} steps={[{ title: 'Chọn file' }, { title: 'Xem trước', error: !!file && !vendor }, { title: 'Xác nhận' }]} />
      </View>
      {body}
      {saved && <SavedToast title={saved.title} caption={saved.caption} />}
    </Screen>
  );
}
