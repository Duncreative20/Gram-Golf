import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Card, EmptyState, IconButton, Screen, Segmented, Text, useTheme } from '@gr/ds';
import type { Club } from '../../lib/domain';
import { useStore } from '../../lib/store';
import { archivedClubsOf, canViewPrivate, clubLabel, clubsOf, groupClubs, profileById } from '../../lib/selectors';
import { formatValue } from '../../lib/format';
import { StackHeader } from '../../components/StackHeader';
import { NoAccess } from '../../components/NoAccess';
import { ListSkeleton, useFirstLoad } from '../../components/ListSkeleton';

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
  const { playerId, view } = useLocalSearchParams<{ playerId?: string; view?: string }>();
  const [seg, setSeg] = useState(view === 'archived' ? 1 : 0); // MVP "My Clubs — Active / Archived"
  const loading = useFirstLoad('clubs');
  if (!me || (!playerId && me.role !== 'player')) return <Redirect href="/" />;
  const ownerId = playerId ?? me.id;
  if (!canViewPrivate(state, me.id, ownerId)) {
    return (
      <Screen>
        <StackHeader title="Bộ gậy" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <NoAccess />
        </View>
      </Screen>
    );
  }
  const canEdit = ownerId === me.id && me.role === 'player';
  const ownerName = profileById(state, ownerId)?.name ?? 'Học viên';
  const active = clubsOf(state, ownerId);
  const archived = canEdit ? archivedClubsOf(state, ownerId) : []; // HLV xem chỉ đọc: chỉ gậy đang dùng
  const archivedView = canEdit && seg === 1;
  const clubs = archivedView ? archived : active;
  const add = () => router.push('/clubs/new');
  const margin = t.layout('Margin-Small');
  return (
    <Screen>
      <StackHeader title="Bộ gậy" subtitle={canEdit ? `${active.length} gậy đang dùng` : `${ownerName} · ${active.length} gậy`} />
      {canEdit && (
        <View style={{ paddingHorizontal: margin, paddingBottom: t.space('Spacing/Padding/Small') }}>
          <Segmented
            items={[
              { label: 'Đang dùng', badge: String(active.length) },
              { label: 'Lưu trữ', badge: String(archived.length) },
            ]}
            selectedIndex={seg}
            onChange={setSeg}
          />
        </View>
      )}
      {loading ? <ListSkeleton /> : clubs.length ? (
        <>
          {/* chừa chỗ cho nút "+" nổi (chỉ mục Đang dùng) */}
          <ScrollView contentContainerStyle={{ padding: margin, paddingBottom: canEdit && !archivedView ? t.size('Button/Size/Large') + 2 * margin : margin }}>
            <ClubGrid clubs={clubs} />
          </ScrollView>
          {canEdit && !archivedView && (
            <View style={{ position: 'absolute', right: margin, bottom: margin }}>
              <IconButton icon="plus-line" accessibilityLabel="Thêm gậy" onPress={add} />
            </View>
          )}
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', padding: margin }}>
          {archivedView ? (
            <EmptyState icon="archive-line" title="Chưa lưu trữ gậy nào" caption="Gậy lưu trữ ẩn khỏi danh sách chọn gậy nhưng giữ nguyên lịch sử phiên và swing." />
          ) : canEdit ? (
            <EmptyState icon="flag-01-line" title="Chưa có gậy nào" caption="Thêm gậy để gắn với từng phiên số liệu và video swing." primaryText="Thêm gậy" onPrimary={add} />
          ) : (
            <EmptyState icon="flag-01-line" title="Chưa có gậy nào" caption={`${ownerName} chưa thêm gậy vào bộ gậy.`} />
          )}
        </View>
      )}
    </Screen>
  );
}
