import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { BottomSheet, Button, Chip, Divider, PopoverItem, Screen, SelectField, Text, TextField, useTheme } from '@gr/ds';
import { CLUB_GROUPS, SHAFT_FLEXES, type Club, type ClubType } from '../../lib/domain';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { formatValue } from '../../lib/format';
import { CLUB_FIELDS, clubRaw, defaultLoft, loftOnTypeChange, rangeText, validateClub } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { AlertMessage, SavedToast, SavingRow, useSimulatedWrite } from '../../components/Feedback';
import { KeyboardAvoid } from '../../components/KeyboardAvoid';

const WEDGES = CLUB_GROUPS.find((g) => g.label === 'Wedge')!.types;
type TextKey = 'customName' | 'brand' | 'model' | 'shaftBrand';
type InputKey = TextKey | (typeof CLUB_FIELDS)[number]['key'];

/** Form gậy dùng chung cho Thêm (không `initial`) và Sửa (`clubs/[id]/edit`). Lỗi theo trường hiện sau lần bấm Lưu đầu;
 *  hợp lệ → `onSubmit` đúng một lần (nút khoá, id cố định từ lúc mở form). */
export function ClubForm({ initial, onSubmit }: { initial?: Club; onSubmit: (club: Club) => void }) {
  const t = useTheme();
  const { me } = useStore();
  const [raw, setRaw] = useState(() => clubRaw(initial));
  const [id] = useState(() => initial?.id ?? newId('cl'));
  const [typeOpen, setTypeOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState(false);
  const result = validateClub(raw);
  const errors = submitted ? result.errors : {};
  const invalid = Object.keys(result.errors).length;
  const suggested = raw.type ? defaultLoft(raw.type) : undefined;
  // gậy không phải wedge có bounce: ô đã hiện thì giữ — xoá trống ô không làm ô biến mất (mất focus / bàn phím)
  const bounceTyped = useRef(false);
  bounceTyped.current ||= raw.bounceDeg.trim() !== '';
  const showBounce = (raw.type !== undefined && WEDGES.includes(raw.type)) || bounceTyped.current;
  const set = (key: InputKey, v: string) => setRaw((r) => ({ ...r, [key]: v }));
  const pickType = (type: ClubType) => {
    setRaw((r) => ({ ...r, type, loftDeg: loftOnTypeChange(r.loftDeg, r.type, type) }));
    setTypeOpen(false);
  };
  const save = () => {
    setSubmitted(true);
    setFailed(false); // toast lỗi lần trước gỡ ra → lỗi lần này hiện lại đủ giờ
    if (!result.value || !me) return;
    const club = { ...initial, id, playerId: initial?.playerId ?? me.id, ...result.value };
    run(
      () => {
        setDone(true);
        onSubmit(club);
      },
      () => setFailed(true),
    );
  };
  const text = (key: TextKey, label: string, placeholder: string) => (
    <TextField label={label} placeholder={placeholder} value={raw[key]} onChangeText={(v) => set(key, v)} error={errors[key]} />
  );
  return (
    <>
      <KeyboardAvoid>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}
        >
          <SelectField
            label="Loại gậy"
            placeholder="Chọn loại gậy"
            value={raw.type}
            error={errors.type}
            onPress={() => setTypeOpen(true)}
            // label mặc định chỉ là "Loại gậy" → trình đọc màn hình không nghe được loại đang chọn
            accessibilityLabel={`Loại gậy, ${raw.type ?? 'chưa chọn'}`}
          />
          {raw.type === 'Tuỳ chỉnh' && text('customName', 'Tên gậy', 'VD: Chipper 37°')}
          {text('brand', 'Hãng', 'VD: TaylorMade')}
          {text('model', 'Model', 'VD: Qi10')}
          {text('shaftBrand', 'Hãng cán', 'VD: Fujikura Ventus Blue 6')}
          <View style={{ gap: t.size('Input/Spacing-Regt/Medium/Outside-Field-Gap') }}>
            <Text variant="Label/Small/DemiBold" color="Color/Content/Neutral/Light">Flex</Text>
            <View accessibilityRole="radiogroup" accessibilityLabel="Flex" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }}>
              {SHAFT_FLEXES.map((f) => (
                <Chip key={f} size="Medium" text={f} select={raw.shaftFlex === f} onPress={() => setRaw((r) => ({ ...r, shaftFlex: f }))} />
              ))}
            </View>
          </View>
          {CLUB_FIELDS.filter((f) => f.key !== 'bounceDeg' || showBounce).map((f) => (
            <TextField
              key={f.key}
              label={`${f.label} (${f.unit}${f.optional ? ', tuỳ chọn' : ''})`}
              helpText={
                f.key === 'loftDeg' && suggested !== undefined
                  ? `Gợi ý cho ${raw.type}: ${formatValue(suggested, '°')} · khoảng hợp lệ ${rangeText(f)}`
                  : `Khoảng hợp lệ ${rangeText(f)}`
              }
              value={raw[f.key]}
              onChangeText={(v) => set(f.key, v)}
              error={errors[f.key]}
              keyboardType="decimal-pad"
            />
          ))}
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
          {submitted && invalid > 0 && <AlertMessage theme="Negative" text={`Chưa lưu: ${invalid} trường cần sửa.`} />}
          {busy && <SavingRow />}
          <Button text="Lưu" disabled={done || busy} onPress={save} />
        </View>
      </KeyboardAvoid>
      <BottomSheet visible={typeOpen} onClose={() => setTypeOpen(false)} heading="Chọn loại gậy" divider>
        <ScrollView>
          <View accessibilityRole="radiogroup" accessibilityLabel="Loại gậy">
            {CLUB_GROUPS.map((g) => (
              <View key={g.label}>
                <Text
                  variant="Label/Small/DemiBold"
                  color="Color/Content/Neutral/Light"
                  accessibilityRole="header"
                  style={{ paddingHorizontal: t.space('Spacing/Padding/Medium'), paddingTop: t.space('Spacing/Padding/Small'), paddingBottom: t.space('Spacing/Padding/2XSmall') }}
                >
                  {g.label}
                </Text>
                {g.types.map((type) => (
                  <PopoverItem key={type} type="Radio" label={type} selected={raw.type === type} onPress={() => pickType(type)} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </BottomSheet>
      {failed && (
        <SavedToast
          type="Negative"
          title="Lưu thất bại"
          caption="Mất kết nối — gậy chưa được lưu, form giữ nguyên."
          actionText="Thử lại"
          onAction={save}
          onDone={() => setFailed(false)}
        />
      )}
    </>
  );
}

export default function ClubNew() {
  const { dispatch, me } = useStore();
  if (me?.role !== 'player') return <Redirect href="/" />;
  return (
    <Screen>
      <StackHeader title="Thêm gậy" />
      <ClubForm
        onSubmit={(club) => {
          dispatch({ type: 'upsertClub', club });
          if (router.canGoBack()) router.back();
          else router.replace('/clubs');
        }}
      />
    </Screen>
  );
}
