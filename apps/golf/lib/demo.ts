import type { Theme } from '@gr/ds';

/**
 * Hộp demo cho component overlay (token On-Dark-Overlay/* chỉ đúng trên nền TỐI cố định).
 * Neutral/Solid và Inverse/Solid đều ĐẢO theo theme → chọn theo scheme để hộp luôn tối.
 */
export const darkDemo = (t: Theme) => ({
  backgroundColor: t.color(t.scheme === 'dark' ? 'Color/Background/Inverse/Solid/Default' : 'Color/Background/Neutral/Solid/Default'),
  padding: t.space('Spacing/Padding/Medium'),
  borderRadius: t.radius('Corner-Radius/Large'),
});
