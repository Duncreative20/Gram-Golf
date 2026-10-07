import { View } from 'react-native';
import { Avatar, Badge, Icon, Text, useTheme } from '@gr/ds';
import type { Profile } from '../lib/domain';
import { formatNumber, formatVnd, initials } from '../lib/format';

/** Tóm tắt HLV: avatar, tên + huy hiệu xác minh, học viện; đánh giá · kinh nghiệm · học phí (mục nào chưa có thì bỏ). Tab HLV, xem trước mã mời, hồ sơ HLV. */
export function CoachSummary({ coach }: { coach: Profile }) {
  const t = useTheme();
  const stats = [
    coach.rating !== undefined && { label: 'Đánh giá', value: formatNumber(coach.rating, 1), a11y: `Đánh giá ${formatNumber(coach.rating, 1)} trên 5`, star: true },
    coach.yearsExperience !== undefined && { label: 'Kinh nghiệm', value: `${coach.yearsExperience} năm`, a11y: `${coach.yearsExperience} năm kinh nghiệm`, star: false },
    coach.ratePerHourVnd !== undefined && { label: 'Học phí', value: `${formatVnd(coach.ratePerHourVnd)}/giờ`, a11y: `Học phí ${formatVnd(coach.ratePerHourVnd)} mỗi giờ`, star: false },
  ].filter((s) => s !== false);
  return (
    <View style={{ gap: t.space('Spacing/Gap/Medium') }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
        <View aria-hidden>
          <Avatar
            size="XLarge"
            theme={coach.avatarUrl ? 'Photo' : 'Accent'}
            background="Solid"
            source={coach.avatarUrl ? { uri: coach.avatarUrl } : undefined}
            initials={initials(coach.name)}
          />
        </View>
        <View style={{ flex: 1, gap: t.space('Spacing/Gap/2XSmall') }}>
          <Text variant="Heading/4" numberOfLines={2}>{coach.name}</Text>
          {coach.verified && <Badge text="Đã xác minh" theme="Accent" leadingIcon="check-verified-solid" />}
          {coach.academy ? <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">{coach.academy}</Text> : null}
        </View>
      </View>
      {stats.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t.space('Spacing/Gap/Large'), rowGap: t.space('Spacing/Gap/XSmall') }}>
          {stats.map((s) => (
            <View key={s.label} accessible accessibilityLabel={s.a11y}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/3XSmall') }}>
                {s.star && <Icon name="star-01-solid" size={t.size('Element-Size/Popular/Small')} color="Color/Content/Warning/Base" />}
                <Text variant="Body/Base/DemiBold">{s.value}</Text>
              </View>
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{s.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
