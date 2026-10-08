import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Button, Divider, Screen, Segmented, useTheme } from '@gr/ds';
import type { FitnessMetrics, ID, MetricSession, SwingMetrics } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { FITNESS_FIELDS, fitnessRaw, swingRaw, validateFitnessMetrics, validateSwingMetrics, type Raw } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { ClubPicker } from '../../components/ClubPicker';
import { MetricFields, SwingMetricsForm } from '../../components/SwingMetricsForm';
import { AlertMessage, SavedToast, SavingRow, useSimulatedWrite } from '../../components/Feedback';
import { backToMetrics, SessionDateField } from '../../components/SessionEntry';
import { KeyboardAvoid } from '../../components/KeyboardAvoid';

const KINDS = [{ label: 'Swing' }, { label: 'Thể lực' }];
const EMPTY_SWING: Raw<keyof SwingMetrics> = { clubSpeedMph: '', ballSpeedMph: '', smash: '', spinRpm: '', launchDeg: '', carryM: '' };
const EMPTY_FITNESS: Raw<keyof FitnessMetrics> = { weightKg: '', flexibility: '', gripStrengthKg: '', verticalJumpCm: '' };

/** Nhập tay một phiên. `?id=<phiên>` = sửa phiên đã lưu (MVP "Form Thêm/Chỉnh sửa Metrics"): điền sẵn theo đơn vị hiển thị
 *  (carry yard khi imperial — swingRaw), khoá loại phiên, lưu bằng updateSession (giữ nguồn/hãng, gắn editedAt). */
export default function MetricsManual() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { kind, id } = useLocalSearchParams<{ kind?: string; id?: string }>();
  const editing = id ? state.sessions.find((x) => x.id === id) : undefined;
  const units = me ? prefsOf(state, me.id).units : 'metric';
  const [tab, setTab] = useState(editing ? (editing.kind === 'fitness' ? 1 : 0) : kind === 'fitness' ? 1 : 0);
  const [capturedAt, setCapturedAt] = useState(editing?.capturedAt ?? NOW);
  const [clubId, setClubId] = useState<ID | undefined>(editing?.clubId);
  const [swing, setSwing] = useState(() => (editing?.kind === 'swing' ? swingRaw(editing.swing, units) : EMPTY_SWING));
  const [fitness, setFitness] = useState(() => (editing?.kind === 'fitness' ? fitnessRaw(editing.fitness) : EMPTY_FITNESS));
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<string>(); // chú thích Toast, chốt lúc lưu
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
  if (me?.role !== 'player') return <Redirect href="/" />;
  // phiên không có / của người khác → màn chi tiết xử lý 404 / 403 (cùng cách clubs/[id]/edit)
  if (id && (!editing || editing.playerId !== me.id)) return <Redirect href={{ pathname: '/metrics/[id]', params: { id } }} />;
  const isSwing = tab === 0;
  const swingResult = validateSwingMetrics(swing, units);
  const fitnessResult = validateFitnessMetrics(fitness);
  const invalid = isSwing ? Object.keys(swingResult.errors).length + (clubId ? 0 : 1) : Object.keys(fitnessResult.errors).length;
  const save = () => {
    setSubmitted(true);
    const base = editing ?? { id: newId('ss'), playerId: me.id, source: 'manual' as const };
    let session: MetricSession;
    if (isSwing) {
      if (!swingResult.value || !clubId) return;
      session = { ...base, capturedAt, kind: 'swing', clubId, swing: swingResult.value };
    } else {
      if (!fitnessResult.value) return;
      session = { ...base, capturedAt, kind: 'fitness', fitness: fitnessResult.value };
    }
    run(
      () => {
        dispatch(editing ? { type: 'updateSession', session, at: NOW } : { type: 'addSession', session });
        setSaved(`Phiên ${isSwing ? 'swing' : 'thể lực'} ngày ${formatDate(capturedAt)}`);
      },
      () => setFailed(true),
    );
  };
  return (
    <Screen>
      <StackHeader title={editing ? 'Sửa phiên' : 'Nhập tay'} />
      <KeyboardAvoid>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
          {!editing && (
            <Segmented
              items={KINDS}
              selectedIndex={tab}
              onChange={(i) => {
                setTab(i);
                setSubmitted(false);
              }}
            />
          )}
          <SessionDateField value={capturedAt} onChange={setCapturedAt} />
          {isSwing ? (
            <>
              <ClubPicker playerId={me.id} value={clubId} onChange={setClubId} error={submitted && !clubId ? 'Bắt buộc' : undefined} />
              <SwingMetricsForm values={swing} onChange={setSwing} errors={submitted ? swingResult.errors : {}} />
            </>
          ) : (
            <MetricFields fields={FITNESS_FIELDS} values={fitness} onChange={setFitness} errors={submitted ? fitnessResult.errors : {}} />
          )}
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
          {submitted && invalid > 0 && <AlertMessage theme="Negative" text={`Chưa lưu: ${invalid} trường cần sửa.`} />}
          {busy && <SavingRow />}
          <Button text="Lưu" disabled={!!saved || busy} onPress={save} />
        </View>
      </KeyboardAvoid>
      {saved && <SavedToast title={editing ? 'Đã lưu thay đổi' : 'Đã lưu'} caption={saved} onDone={backToMetrics} />}
      {failed && (
        <SavedToast
          type="Negative"
          title="Lưu thất bại"
          caption="Mất kết nối — số liệu chưa được lưu, form giữ nguyên."
          actionText="Thử lại"
          onAction={() => {
            setFailed(false);
            save();
          }}
          onDone={() => setFailed(false)}
        />
      )}
    </Screen>
  );
}
