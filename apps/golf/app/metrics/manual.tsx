import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Button, Divider, Screen, Segmented, useTheme } from '@gr/ds';
import type { FitnessMetrics, ID, SwingMetrics } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { FITNESS_FIELDS, validateFitnessMetrics, validateSwingMetrics, type Raw } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { ClubPicker } from '../../components/ClubPicker';
import { MetricFields, SwingMetricsForm } from '../../components/SwingMetricsForm';
import { AlertMessage, SavedToast } from '../../components/Feedback';
import { backToMetrics, SessionDateField } from '../../components/SessionEntry';

const KINDS = [{ label: 'Swing' }, { label: 'Thể lực' }];
const EMPTY_SWING: Raw<keyof SwingMetrics> = { clubSpeedMph: '', ballSpeedMph: '', smash: '', spinRpm: '', launchDeg: '', carryM: '' };
const EMPTY_FITNESS: Raw<keyof FitnessMetrics> = { weightKg: '', flexibility: '', gripStrengthKg: '', verticalJumpCm: '' };

export default function MetricsManual() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const [tab, setTab] = useState(kind === 'fitness' ? 1 : 0);
  const [capturedAt, setCapturedAt] = useState(NOW);
  const [clubId, setClubId] = useState<ID>();
  const [swing, setSwing] = useState(EMPTY_SWING);
  const [fitness, setFitness] = useState(EMPTY_FITNESS);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<string>(); // chú thích Toast, chốt lúc lưu
  if (me?.role !== 'player') return <Redirect href="/" />;
  const units = prefsOf(state, me.id).units;
  const isSwing = tab === 0;
  const swingResult = validateSwingMetrics(swing, units);
  const fitnessResult = validateFitnessMetrics(fitness);
  const invalid = isSwing ? Object.keys(swingResult.errors).length + (clubId ? 0 : 1) : Object.keys(fitnessResult.errors).length;
  const save = () => {
    setSubmitted(true);
    const base = { id: newId('ss'), playerId: me.id, capturedAt, source: 'manual' as const };
    if (isSwing) {
      if (!swingResult.value || !clubId) return;
      dispatch({ type: 'addSession', session: { ...base, kind: 'swing', clubId, swing: swingResult.value } });
    } else {
      if (!fitnessResult.value) return;
      dispatch({ type: 'addSession', session: { ...base, kind: 'fitness', fitness: fitnessResult.value } });
    }
    setSaved(`Phiên ${isSwing ? 'swing' : 'thể lực'} ngày ${formatDate(capturedAt)}`);
  };
  return (
    <Screen>
      <StackHeader title="Nhập tay" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Segmented
          items={KINDS}
          selectedIndex={tab}
          onChange={(i) => {
            setTab(i);
            setSubmitted(false);
          }}
        />
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
        <Button text="Lưu" disabled={!!saved} onPress={save} />
      </View>
      {saved && <SavedToast title="Đã lưu" caption={saved} onDone={backToMetrics} />}
    </Screen>
  );
}
