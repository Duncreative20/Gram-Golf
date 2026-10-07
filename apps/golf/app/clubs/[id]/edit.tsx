import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@gr/ds';
import { useStore } from '../../../lib/store';
import { clubById, clubLabel } from '../../../lib/selectors';
import { StackHeader } from '../../../components/StackHeader';
import { ClubForm } from '../new';

export default function ClubEdit() {
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!me) return <Redirect href="/" />;
  const club = clubById(state, id);
  // Chỉ chủ gậy sửa được gậy đang dùng; còn lại về màn chi tiết — nơi xử lý không tìm thấy / không có quyền / HLV chỉ đọc.
  if (!club || club.playerId !== me.id || club.archivedAt) return <Redirect href={{ pathname: '/clubs/[id]', params: { id } }} />;
  return (
    <Screen>
      <StackHeader title="Sửa gậy" subtitle={`${clubLabel(club)} · ${club.brand} ${club.model}`} />
      <ClubForm
        initial={club}
        onSubmit={(c) => {
          dispatch({ type: 'upsertClub', club: c });
          if (router.canGoBack()) router.back();
          else router.replace({ pathname: '/clubs/[id]', params: { id: c.id } });
        }}
      />
    </Screen>
  );
}
