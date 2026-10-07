import { SvgXml } from 'react-native-svg';
import { useTheme } from '../theme/useTheme';
import { paint, type PaintKey } from '../theme/paint';
import { ICONS, type IconName } from './generated';

export interface IconProps {
  /** Tên icon Figma bỏ tiền tố `icon-`, vd "chevron-left-line-medium" */
  name: IconName;
  /** Figma vẽ 20/24; component (Button…) truyền size token */
  size?: number;
  /** Màu semantic `Color/...` hoặc component `Button-.../Content/...`; mặc định content neutral mạnh nhất */
  color?: PaintKey;
}

export function Icon({ name, size = 24, color = 'Color/Content/Neutral/Strongest' }: IconProps) {
  const t = useTheme();
  return <SvgXml xml={ICONS[name]} width={size} height={size} color={paint(t, color)} />;
}
