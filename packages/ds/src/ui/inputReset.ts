import type { TextStyle } from 'react-native';

/**
 * Web (Storybook / react-native-web): `<input>` giữ outline focus mặc định của trình duyệt (viền đen vuông bên trong khung).
 * CHỈ spread vào input mà styles đã vẽ state Focused (Text-Field/Search/Area/Message, Number/Stepper) — tắt outline ở ô không có
 * state focus riêng là mất dấu focus (WCAG 2.4.7); Field-Group/Comment/Story reply giữ outline trình duyệt (docs/ds/figma-debt.md §E).
 * Nhận diện web bằng `document` (không import `Platform` runtime — vitest/node không nạp được `react-native`). Native → {}.
 */
export const INPUT_RESET: TextStyle = typeof document !== 'undefined' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};
