import { Image, Text as RNText, View, type ImageSourcePropType } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { avatarStyles, type AvatarBackground, type AvatarShape, type AvatarSize, type AvatarTheme } from './avatarStyles';

export interface AvatarProps {
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Theme=Photo hiện ảnh `source`; theme màu hiện `initials` */
  theme?: AvatarTheme;
  background?: AvatarBackground;
  source?: ImageSourcePropType;
  /** Chữ viết tắt khi không có ảnh (Figma layer Text) */
  initials?: string;
  /** Figma Status=True: chấm online góc dưới phải */
  status?: boolean;
  accessibilityLabel?: string;
}

/** Chữ tắt từ tên: chữ đầu của 2 từ cuối, in hoa ("HLV Đỗ Minh Tuấn" → "MT") — cùng luật `initials()` của app (apps/golf/lib/format.ts). */
export const nameInitials = (name: string) => name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w.charAt(0).toUpperCase()).join('');

export function Avatar({ size = 'Medium', shape = 'Circle', theme: themeProp = 'Photo', background = 'Subtle', source, initials, status, accessibilityLabel }: AvatarProps) {
  const t = useTheme();
  const theme = themeProp === 'Photo' && !source ? 'Neutral' : themeProp;
  const s = avatarStyles(t, { size, shape, theme, background });
  const showImage = theme === 'Photo' && source;
  return (
    <View accessible={!!accessibilityLabel} accessibilityRole={accessibilityLabel ? 'image' : undefined} accessibilityLabel={accessibilityLabel}>
      <View style={s.container}>
        {showImage ? (
          <Image source={source} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={accessibilityLabel} aria-hidden={!accessibilityLabel} />
        ) : (
          <RNText style={s.text} numberOfLines={1}>{initials ?? ''}</RNText>
        )}
      </View>
      {status ? <View style={s.status} /> : null}
    </View>
  );
}
