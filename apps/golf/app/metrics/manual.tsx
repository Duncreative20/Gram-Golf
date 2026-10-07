import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { BottomSheet, Button, DateField, DatePicker, Divider, InlineMessage, Screen, Segmented, Toast, useTheme } from '@gr/ds';
import type { FitnessMetrics, ID, SwingMetrics } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { prefsOf } from '../../lib/selectors';
import { formatDate, vnDay, withVnDay } from '../../lib/format';
import { FITNESS_FIELDS, validateFitnessMetrics, validateSwingMetrics, type Raw } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { ClubPicker } from '../../components/ClubPicker';
import { MetricFields, SwingMetricsForm } from '../../components/SwingMetricsForm';

const KINDS = [{ label: 'Swing' }, { label: 'Thể lực' }];
const EMPTY_SWING: Raw<keyof SwingMetrics> = { clubSpeedMph: '', ballSpeedMph: '', smash: '', spinRpm: '', launchDeg: '', carryM: '' };
const EMPTY_FITNESS: Raw<keyof FitnessMetrics> = { weightKg: '', flexibility: '', gripStrengthKg: '', verticalJumpCm: '' };

export default function MetricsManual() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const [tab, setTab] = useState(kind === 'fitness' ? 1 : 0);
  const [capturedAt, setCapturedAt] = useState(NOW);
  const [picking, setPicking] = useState(false);
  const [clubId, setClubId] = useState<ID>();
  const [swing, setSwing] = useState(EMPTY_SWING);
  const [fitness, setFitness] = useState(EMPTY_FITNESS);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!saved) return;
    // ponytail: Toast hiện ngay trên màn này rồi mới quay lại — app chưa có toast toàn cục; cần toast sống qua điều hướng thì nâng lên provider ở _layout.
    const timer = setTimeout(() => (router.canGoBack() ? router.back() : router.replace('/(player)/metrics')), 1200);
    return () => clearTimeout(timer);
  }, [saved]);
  if (me?.role !== 'player') return <Redirect href="/" />;
  const units = prefsOf(state, me.id).units;
  const isSwing = tab === 0;
  const swingResult = validateSwingMetrics(swing, units);
  const fitnessResult = validateFitnessMetrics(fitness);
  const invalid = isSwing ? Object.keys(swingResult.errors).length + (clubId ? 0 : 1) : Object.keys(fitnessResult.errors).length;
  const date = formatDate(capturedAt);
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
    setSaved(true);
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
        <DateField label="Ngày" value={date} accessibilityLabel={`Ngày, ${date}`} onPress={() => setPicking(true)} />
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
        {submitted && invalid > 0 && (
          // InlineMessage không có role alert → bọc để trình đọc màn hình đọc ngay khi bấm Lưu (như Toast)
          <View accessibilityRole="alert" accessibilityLiveRegion="polite">
            <InlineMessage theme="Negative" text={`Chưa lưu: ${invalid} trường cần sửa.`} />
          </View>
        )}
        <Button text="Lưu" disabled={saved} onPress={save} />
      </View>
      <BottomSheet visible={picking} onClose={() => setPicking(false)} heading="Chọn ngày">
        <DatePicker
          value={vnDay(capturedAt)}
          maxDate={vnDay(NOW)}
          onChange={(d) => {
            setCapturedAt(withVnDay(capturedAt, d));
            setPicking(false);
          }}
        />
      </BottomSheet>
      {saved && (
        <View style={{ position: 'absolute', left: t.layout('Margin-Small'), right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
          <Toast type="Positive" title="Đã lưu" caption={`Phiên ${isSwing ? 'swing' : 'thể lực'} ngày ${date}`} />
        </View>
      )}
    </Screen>
  );
}
