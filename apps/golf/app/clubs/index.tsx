import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Card, EmptyState, IconButton, Screen, Text, useTheme } from '@gr/ds';
import type { Club } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { canViewPrivate, clubLabel, clubsOf, groupClubs, profileById } from '../../lib/selectors';
import { formatValue } from '../../lib/format';
import { StackHeader } from '../../components/StackHeader';

/** Lưới thẻ gậy theo nhóm, 2 cột; chạm thẻ → chi tiết gậy (sửa/lưu trữ chỉ chủ gậy thấy ở đó). Không có lề ngoài — màn dùng tự bọc. */
export function ClubGrid({ clubs }: { clubs: Club[] }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space('Spacing/Gap/Large') }}>
      {groupClubs(clubs).map((g) => (
        <View key={g.label} style={{ gap: t.space('Spacing/Gap/Small') }}>
          <Text variant="Heading/Subheading" accessibilityRole="header">{g.label}</Text>
          {/* từng hàng 2 thẻ chia đều; hàng lẻ thêm ô trống để thẻ cuối giữ nửa chiều ngang */}
          {Array.from({ length: Math.ceil(g.clubs.length / 2) }, (_, i) => g.clubs.slice(i * 2, i * 2 + 2)).map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: t.layout('Gutter') }}>
              {row.map((c) => (
                <Card key={c.id} theme="Border" spacing="Small" style={{ flex: 1, gap: t.space('Spacing/Gap/2XSmall') }} onPress={() => router.push(`/clubs/${c.id}`)}>
                  <Text variant="Heading/4" numberOfLines={1}>{clubLabel(c)}</Text>
                  <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light" numberOfLines={2}>{`${c.brand} ${c.model}`}</Text>
                  {/* marginTop auto: thẻ cạnh có tên hãng 2 dòng thì dòng loft vẫn thẳng hàng ở đáy */}
                  <Text variant="Body/Small/DemiBold" color="Color/Content/Neutral/Base" style={{ marginTop: 'auto' }}>
                    {`${formatValue(c.loftDeg, '°')} · ${c.shaftFlex}`}
                  </Text>
                </Card>
              ))}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Bộ gậy của người chơi đang đăng nhập; HLV xem bộ gậy học viên bằng `?playerId=` — chỉ đọc, cần kết nối active (D6). */
export default function Clubs() {
  const t = useTheme();
  const { state, me } = useStore();
  const { playerId } = useLocalSearchParams<{ playerId?: string }>();
  if (!me || (!playerId && me.role !== 'player')) return <Redirect href="/" />;
  const ownerId = playerId ?? me.id;
  if (!canViewPrivate(state, me.id, ownerId)) {
    return (
      <Screen>
        <StackHeader title="Bộ gậy" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          {/* Tạm — Task 11 thay bằng <NoAccess />. Follow không mở dữ liệu riêng (D6). */}
          <EmptyState icon="lock-01-line" title="Không có quyền xem" caption="Chỉ HLV đã kết nối mới xem được dữ liệu này." />
        </View>
      </Screen>
    );
  }
  const canEdit = ownerId === me.id && me.role === 'player';
  const ownerName = profileById(state, ownerId)?.name ?? 'Học viên';
  const clubs = clubsOf(state, ownerId);
  const add = () => router.push('/clubs/new');
  return (
    <Screen>
      <StackHeader title="Bộ gậy" subtitle={canEdit ? `${clubs.length} gậy` : `${ownerName} · ${clubs.length} gậy`} />
      {clubs.length ? (
        <>
          {/* chừa chỗ cho nút "+" nổi */}
          <ScrollView
            contentContainerStyle={{
              padding: t.layout('Margin-Small'),
              paddingBottom: canEdit ? t.size('Button/Size/Large') + 2 * t.layout('Margin-Small') : t.layout('Margin-Small'),
            }}
          >
            <ClubGrid clubs={clubs} />
          </ScrollView>
          {canEdit && (
            <View style={{ position: 'absolute', right: t.layout('Margin-Small'), bottom: t.layout('Margin-Small') }}>
              <IconButton icon="plus-line" accessibilityLabel="Thêm gậy" onPress={add} />
            </View>
          )}
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          {canEdit ? (
            <EmptyState icon="flag-01-line" title="Chưa có gậy nào" caption="Thêm gậy để gắn với từng phiên số liệu và video swing." primaryText="Thêm gậy" onPrimary={add} />
          ) : (
            <EmptyState icon="flag-01-line" title="Chưa có gậy nào" caption={`${ownerName} chưa thêm gậy vào bộ gậy.`} />
          )}
        </View>
      )}
    </Screen>
  );
}
