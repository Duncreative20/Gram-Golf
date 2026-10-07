import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

let seq = 0;
/** #rgb / #rrggbb / #rrggbbaa → { rgb hex đục, alpha 0–1 } — để gradient nhận token có alpha (vd Black-Overlay/Hover, alpha cc). */
function split(hex: string): { color: string; alpha: number } {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) return { color: hex, alpha: 1 };
  return { color: `#${m[1]}`, alpha: m[2] ? parseInt(m[2], 16) / 255 : 1 };
}

export interface FadeProps {
  /** Màu đậm nhất (token; alpha trong token được giữ) */
  color: string;
  /** Mép đậm: 'bottom' = đậm dưới nhạt lên trên (scrim đáy Story), 'top' ngược lại */
  side: 'top' | 'bottom';
  /** Điểm giữa tuỳ chọn (token có alpha) tại 50 % — scrim 2 bậc */
  mid?: string;
}

/**
 * Lớp gradient phủ kín cha (absolute inset 0, không bắt touch): scrim chữ trên ảnh, fade mép Wheel.
 * Figma không có token scrim (docs/ds/figma-debt.md §E) → màu lấy từ token Black-Overlay/*, không bịa số.
 */
export function Fade({ color, side, mid }: FadeProps) {
  const id = `gr-fade-${++seq}`;
  const c = split(color);
  const m = mid ? split(mid) : null;
  const top = side === 'top';
  return (
    <Svg pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1={top ? '0' : '1'} x2="0" y2={top ? '1' : '0'}>
          {[
            <Stop key="a" offset="0" stopColor={c.color} stopOpacity={String(c.alpha)} />,
            ...(m ? [<Stop key="m" offset="0.5" stopColor={m.color} stopOpacity={String(m.alpha)} />] : []),
            <Stop key="z" offset="1" stopColor={c.color} stopOpacity="0" />,
          ]}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
