import { View } from 'react-native';
import { InlineMessage, TextField, useTheme } from '@gr/ds';
import type { SwingMetrics } from '../lib/domain';
import { useStore } from '../lib/store';
import { prefsOf } from '../lib/selectors';
import { rangeText, swingFields, type FieldSpec } from '../lib/validation';

interface FieldsProps<K extends string> {
  values: Record<K, string>;
  onChange: (next: Record<K, string>) => void;
  errors: Partial<Record<K, string>>;
  /** Trường độ tin cậy thấp (OCR) — cảnh báo dưới ô để người dùng kiểm tra lại. */
  highlight?: Partial<Record<K, boolean>>;
}

/** Ô số theo `FieldSpec`: nhãn + đơn vị, gợi ý khoảng hợp lệ, lỗi theo trường. Dùng cho swing và thể lực. */
export function MetricFields<K extends string>({ fields, values, onChange, errors, highlight }: FieldsProps<K> & { fields: FieldSpec<K>[] }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space('Spacing/Gap/Medium') }}>
      {fields.map((f) => (
        <View key={f.key} style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          <TextField
            label={f.unit ? `${f.label} (${f.unit})` : f.label}
            helpText={`Khoảng hợp lệ ${rangeText(f)}`}
            value={values[f.key]}
            onChangeText={(v) => onChange({ ...values, [f.key]: v })}
            error={errors[f.key]}
            // decimal-pad của iOS không có dấu trừ → ô cho phép số âm (góc bắn) dùng bàn phím có dấu
            keyboardType={f.min < 0 ? 'numbers-and-punctuation' : 'decimal-pad'}
          />
          {highlight?.[f.key] && <InlineMessage theme="Warning" text="Độ tin cậy thấp — kiểm tra lại" />}
        </View>
      ))}
    </View>
  );
}

/** 6 chỉ số swing theo `SWING_FIELDS`. Carry nhập theo đơn vị trong prefs (m/yd) — lưu bằng `validateSwingMetrics(values, units)` để đổi về mét. */
export function SwingMetricsForm(props: FieldsProps<keyof SwingMetrics>) {
  const { state, me } = useStore();
  return <MetricFields fields={swingFields(me ? prefsOf(state, me.id).units : 'metric')} {...props} />;
}
