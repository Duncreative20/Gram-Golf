import { useEffect, useMemo, useRef, useState } from 'react';
import { a11yState } from '../a11y';
import { Pressable, ScrollView, Text as RNText, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import type { ComponentRef } from 'react';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../Button/Button';
import { IconButton } from '../Button/IconButton';
import { Fade } from '../Fade';
import { datePickerStyles, dayCellStyles, dayDotStyles, monthHeaderStyles, weekLabelStyles, wheelItemStyles, wheelStyles, type DatePickerSize, type MonthHeaderAlign } from './datePickerStyles';

// ---------- ngày (local, không giờ) ----------
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const lt = (a: Date, b: Date) => day0(a).getTime() < day0(b).getTime();
const same = (a?: Date | null, b?: Date | null) => !!a && !!b && key(a) === key(b);
export type DateRange = { start: Date | null; end: Date | null };
const WEEK_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_VI = (m: number, y: number) => `Tháng ${m + 1}, ${y}`;

// ---------- Day ----------
export interface DayCellProps {
  date: Date;
  size?: DatePickerSize;
  today?: boolean; selected?: boolean; inRange?: boolean; rangeEdge?: 'start' | 'end'; disabled?: boolean; outside?: boolean;
  /** Dot đánh dấu (sự kiện); trên ô Selected tự đổi Inverse */
  marked?: boolean;
  onPress?: (d: Date) => void;
}
export function DayCell({ date, size = 'Large', marked, onPress, ...st }: DayCellProps) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      {...a11yState({ disabled: st.disabled, selected: st.selected }, 'button')}
      disabled={st.disabled || !onPress}
      onPress={() => onPress?.(date)}
      style={dayCellStyles(t, { size, ...st }).cell}
    >
      {({ pressed }) => {
        const s = dayCellStyles(t, { size, pressed, ...st });
        return (
          <>
            {s.band ? <View style={s.band} /> : null}
            <View style={s.inner}>
              <RNText style={s.text}>{date.getDate()}</RNText>
              {marked ? <View style={[dayDotStyles(t, { inverse: st.selected }), { position: 'absolute', bottom: t.space('Spacing/Gap/3XSmall') }]} /> : null}
            </View>
          </>
        );
      }}
    </Pressable>
  );
}

// ---------- Week-Labels ----------
export function WeekLabels({ size = 'Large', labels = WEEK_VI }: { size?: DatePickerSize; labels?: string[] }) {
  const s = weekLabelStyles(useTheme(), { size });
  return (
    <View style={s.row}>
      {labels.map((l) => (
        <View key={l} style={s.cell}><RNText style={s.text}>{l}</RNText></View>
      ))}
    </View>
  );
}

// ---------- Month-header ----------
export interface MonthHeaderProps { title: string; align?: MonthHeaderAlign; size?: DatePickerSize; onPrev?: () => void; onNext?: () => void; onTitlePress?: () => void }
export function MonthHeader({ title, align = 'Start', size = 'Large', onPrev, onNext, onTitlePress }: MonthHeaderProps) {
  const s = monthHeaderStyles(useTheme(), { align, size });
  const prev = onPrev ? <IconButton type="Main" level="Tertiary" size="XSmall" icon="chevron-left-line-medium" accessibilityLabel="Tháng trước" onPress={onPrev} /> : null;
  const next = onNext ? <IconButton type="Main" level="Tertiary" size="XSmall" icon="chevron-right-line-medium" accessibilityLabel="Tháng sau" onPress={onNext} /> : null;
  const label = <Button type="Flat" level="Primary" size={s.titleSize} text={title} trailingIcon={onTitlePress ? 'chevron-down-line' : undefined} onPress={onTitlePress} />;
  return align === 'Center' ? (
    <View style={s.row}>{prev}{label}{next}</View>
  ) : (
    <View style={s.row}>{label}<View style={{ flex: 1 }} />{prev}{next}</View>
  );
}

// ---------- Month-Grid ----------
export interface MonthGridProps {
  year: number; month: number;
  size?: DatePickerSize;
  selected?: Date | null;
  range?: DateRange;
  minDate?: Date; maxDate?: Date;
  /** key YYYY-MM-DD */
  marked?: ReadonlySet<string>;
  weekStartsOn?: 0 | 1;
  onSelect?: (d: Date) => void;
}
export function MonthGrid({ year, month, size = 'Large', selected, range, minDate, maxDate, marked, weekStartsOn = 1, onSelect }: MonthGridProps) {
  const s = datePickerStyles(useTheme());
  const today = day0(new Date());
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const cells = useMemo(() => Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - offset + i)), [year, month, offset]);
  const start = range?.start, end = range?.end;
  return (
    <View style={s.grid}>
      {Array.from({ length: 6 }, (_, r) => (
        <View key={r} style={s.row}>
          {cells.slice(r * 7, r * 7 + 7).map((d) => {
            const outside = d.getMonth() !== month;
            const isStart = same(d, start), isEnd = same(d, end);
            const mid = !!start && !!end && lt(start, d) && lt(d, end);
            return (
              <DayCell
                key={key(d)}
                date={d}
                size={size}
                outside={outside}
                today={same(d, today)}
                selected={same(d, selected) || isStart || isEnd}
                rangeEdge={isStart && end && !isEnd ? 'start' : isEnd && start && !isStart ? 'end' : undefined}
                inRange={mid}
                disabled={(minDate && lt(d, minDate)) || (maxDate && lt(maxDate, d))}
                marked={marked?.has(key(d))}
                onPress={onSelect}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ---------- Date-Picker ----------
export type DatePickerProps = {
  size?: DatePickerSize;
  /** Paged: một tháng + nút ‹ ›; Scroll: cuộn dọc `months` tháng từ `initialMonth` */
  type?: 'Paged' | 'Scroll';
  months?: number;
  initialMonth?: Date;
  minDate?: Date; maxDate?: Date;
  markedDates?: Iterable<string>;
  headerAlign?: MonthHeaderAlign;
  weekStartsOn?: 0 | 1;
  monthTitle?: (month: number, year: number) => string;
} & ({ mode?: 'single'; value: Date | null; onChange: (d: Date) => void } | { mode: 'range'; value: DateRange; onChange: (r: DateRange) => void });

export function DatePicker(props: DatePickerProps) {
  const { size = 'Large', type = 'Paged', months = 12, initialMonth, minDate, maxDate, markedDates, headerAlign = 'Start', weekStartsOn = 1, monthTitle = MONTH_VI } = props;
  const s = datePickerStyles(useTheme());
  const seed = initialMonth ?? (props.mode === 'range' ? props.value.start : props.value) ?? new Date();
  const [cursor, setCursor] = useState(new Date(seed.getFullYear(), seed.getMonth(), 1));
  const marked = useMemo(() => new Set(markedDates ?? []), [markedDates]);
  const onSelect = (d: Date) => {
    if (props.mode === 'range') {
      const { start, end } = props.value;
      if (!start || end) props.onChange({ start: d, end: null });
      else if (lt(d, start)) props.onChange({ start: d, end: null });
      else props.onChange({ start, end: d });
    } else props.onChange(d);
  };
  const grid = (y: number, m: number) => (
    <MonthGrid year={y} month={m} size={size} selected={props.mode === 'range' ? null : props.value} range={props.mode === 'range' ? props.value : undefined} minDate={minDate} maxDate={maxDate} marked={marked} weekStartsOn={weekStartsOn} onSelect={onSelect} />
  );
  if (type === 'Scroll') {
    const list = Array.from({ length: months }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth() + i, 1));
    return (
      <ScrollView contentContainerStyle={s.container}>
        {list.map((d) => (
          <View key={key(d)} style={{ gap: s.container.gap }}>
            <MonthHeader title={monthTitle(d.getMonth(), d.getFullYear())} align={headerAlign} size={size} />
            <WeekLabels size={size} />
            {grid(d.getFullYear(), d.getMonth())}
          </View>
        ))}
      </ScrollView>
    );
  }
  return (
    <View style={s.container}>
      <MonthHeader
        title={monthTitle(cursor.getMonth(), cursor.getFullYear())}
        align={headerAlign}
        size={size}
        onPrev={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        onNext={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
      />
      <WeekLabels size={size} />
      {grid(cursor.getFullYear(), cursor.getMonth())}
    </View>
  );
}

// ---------- Wheel ----------
export interface WheelColumn<V = number> { key: string; items: { label: string; value: V }[]; value: V; /** flex của cột (mặc định 1) */ weight?: number }
export interface WheelPickerProps<V = number> { columns: WheelColumn<V>[]; onChange: (key: string, value: V) => void; accessibilityLabel?: string }

function WheelColumnView<V>({ col, onChange, itemHeight, visible }: { col: WheelColumn<V>; onChange: (v: V) => void; itemHeight: number; visible: number }) {
  const t = useTheme();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const pad = itemHeight * Math.floor(visible / 2);
  const index = Math.max(0, col.items.findIndex((i) => i.value === col.value));
  // contentOffset không chạy trên web → cuộn tới giá trị hiện tại sau mount / khi value đổi từ ngoài.
  useEffect(() => { ref.current?.scrollTo({ y: index * itemHeight, animated: false }); }, [index, itemHeight]);
  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.min(col.items.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / itemHeight)));
    const item = col.items[i];
    if (item && item.value !== col.value) onChange(item.value);
  };
  return (
    <ScrollView
      ref={ref}
      style={{ flex: col.weight ?? 1 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      decelerationRate="fast"
      contentContainerStyle={{ paddingVertical: pad }}
      onMomentumScrollEnd={settle}
      onScrollEndDrag={settle}
    >
      {col.items.map((item, i) => {
        const s = wheelItemStyles(t, { active: i === index });
        return (
          <Pressable key={String(item.value)} accessibilityRole="button" accessibilityLabel={item.label} {...a11yState({ selected: i === index }, 'button')} onPress={() => { ref.current?.scrollTo({ y: i * itemHeight, animated: true }); onChange(item.value); }} style={s.item}>
            <RNText style={s.text} numberOfLines={1}>{item.label}</RNText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Wheel (Date|Time): các cột cuộn snap, thanh chọn giữa, fade trên/dưới. */
export function WheelPicker<V = number>({ columns, onChange, accessibilityLabel }: WheelPickerProps<V>) {
  const s = wheelStyles(useTheme());
  const fade = s.itemHeight * Math.floor(s.visible / 2);
  return (
    <View style={s.container} accessibilityLabel={accessibilityLabel}>
      <View style={s.indicator} />
      {columns.map((col) => (
        <WheelColumnView key={col.key} col={col} itemHeight={s.itemHeight} visible={s.visible} onChange={(v) => onChange(col.key, v)} />
      ))}
      {/* Fade-overlay (40012370:2903): nền → trong suốt ở mép trên/dưới */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: fade }}><Fade side="top" color={s.fadeColor} /></View>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: fade }}><Fade side="bottom" color={s.fadeColor} /></View>
    </View>
  );
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Wheel Property=Date: ngày / tháng / năm. */
export function DateWheel({ value, onChange, minYear = value.getFullYear() - 100, maxYear = value.getFullYear() + 10 }: { value: Date; onChange: (d: Date) => void; minYear?: number; maxYear?: number }) {
  const y = value.getFullYear(), m = value.getMonth(), d = value.getDate();
  const days = new Date(y, m + 1, 0).getDate();
  const set = (k: string, v: number) => {
    const ny = k === 'y' ? v : y, nm = k === 'm' ? v : m;
    onChange(new Date(ny, nm, Math.min(k === 'd' ? v : d, new Date(ny, nm + 1, 0).getDate())));
  };
  return (
    <WheelPicker
      accessibilityLabel="Chọn ngày"
      onChange={set}
      columns={[
        { key: 'd', value: d, items: range(1, days).map((v) => ({ label: pad2(v), value: v })) },
        { key: 'm', value: m, weight: 1.5, items: range(0, 11).map((v) => ({ label: `Tháng ${v + 1}`, value: v })) },
        { key: 'y', value: y, items: range(minYear, maxYear).map((v) => ({ label: String(v), value: v })) },
      ]}
    />
  );
}

/** Wheel Property=Time: giờ / phút (24h). */
export function TimeWheel({ hour, minute, onChange, minuteStep = 1 }: { hour: number; minute: number; onChange: (hour: number, minute: number) => void; minuteStep?: number }) {
  return (
    <WheelPicker
      accessibilityLabel="Chọn giờ"
      onChange={(k, v) => (k === 'h' ? onChange(v, minute) : onChange(hour, v))}
      columns={[
        { key: 'h', value: hour, items: range(0, 23).map((v) => ({ label: pad2(v), value: v })) },
        { key: 'mi', value: minute, items: range(0, Math.floor(59 / minuteStep)).map((i) => ({ label: pad2(i * minuteStep), value: i * minuteStep })) },
      ]}
    />
  );
}
