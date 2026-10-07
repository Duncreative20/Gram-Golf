import type { AccessibilityRole, AccessibilityState, AccessibilityValue } from 'react-native';

/**
 * react-native-web 0.21 BỎ `accessibilityState` / `accessibilityValue` (chỉ nhận `aria-*`), còn native đọc cả hai.
 * → mọi control phát CẢ HAI dạng qua helper này (audit axe 2026-09-26: 28 checkbox/radio/switch thiếu `aria-checked`,
 * 14 progressbar thiếu tên/giá trị trên web).
 * `selected` trên web phụ thuộc role (axe aria-allowed-attr): tab/option/row/gridcell/treeitem → `aria-selected`;
 * button → `aria-pressed`; role khác không có thuộc tính hợp lệ → chỉ native nhận qua accessibilityState.
 */
const SELECTABLE: ReadonlySet<string> = new Set(['tab', 'option', 'row', 'gridcell', 'treeitem']);

export function a11yState(s: AccessibilityState, role?: AccessibilityRole) {
  const r = role as string | undefined;
  return {
    accessibilityState: s,
    'aria-checked': s.checked,
    'aria-disabled': s.disabled,
    'aria-expanded': s.expanded,
    'aria-busy': s.busy,
    'aria-selected': r && SELECTABLE.has(r) ? s.selected : undefined,
    'aria-pressed': r === 'button' ? s.selected : undefined,
  } as const;
}

export function a11yValue(v: AccessibilityValue) {
  return { accessibilityValue: v, 'aria-valuemin': v.min, 'aria-valuemax': v.max, 'aria-valuenow': v.now, 'aria-valuetext': v.text } as const;
}
