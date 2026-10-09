import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Button, EmptyState, InlineMessage, Screen, Tag, Text, useTheme } from '@gr/ds';
import { NOW } from '../../lib/mock';
import { useStore } from '../../lib/store';
import { activeCoaches, isBlocked, openConnection, profileById } from '../../lib/selectors';
import { newId } from '../../lib/ids';
import { StackHeader } from '../../components/StackHeader';
import { CoachSummary } from '../../components/CoachSummary';
import { PostsSection, useShareToast } from '../../components/PostItem';
import { BlockedNotice, FollowButton, FollowCounts, ProfileScreen } from '../../components/People';

/** Hồ sơ công khai HLV: ai cũng xem được; theo dõi KHÔNG mở dữ liệu riêng (D6). Một trong hai đã chặn người kia → không theo dõi, không xem bài.
 *  Báo cáo / Chặn ở header (ProfileScreen) — người chơi bị HLV gửi yêu cầu lặp lại có đường chặn. */
export default function CoachPublicProfile() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const share = useShareToast();
  if (!me) return <Redirect href="/" />;
  const coach = profileById(state, id);
  if (coach?.role !== 'coach') {
    return (
      <Screen>
        <StackHeader title="Hồ sơ HLV" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState
            icon="file-search-line"
            title="Không tìm thấy HLV"
            caption="Hồ sơ này không tồn tại."
            primaryText="Quay lại"
            onPrimary={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
        </View>
      </Screen>
    );
  }
  const blocked = isBlocked(state, me.id, coach.id);
  const myCoach = activeCoaches(state, me.id).some((c) => c.coach.id === coach.id);
  // Người chơi tự tìm HLV: gửi yêu cầu (HLV duyệt ở tab Học viên › Lời mời); HLV đang mời mình → trả lời luôn ở đây
  const canRequest = me.role === 'player' && !myCoach && !isBlocked(state, me.id, coach.id);
  const conn = canRequest ? openConnection(state, coach.id, me.id) : undefined; // chỉ có thể là kết nối đang chờ
  const hasPrimary = activeCoaches(state, me.id).some((c) => c.connection.isPrimary);
  const request = () => dispatch({ type: 'requestConnection', id: newId('cn'), coachId: coach.id, playerId: me.id, by: 'player', at: NOW, notificationId: newId('nt') });
  const respond = (accept: boolean) => conn && dispatch({ type: 'respondConnection', id: conn.id, accept, at: NOW, notificationId: newId('nt') });
  return (
    <ProfileScreen title="Hồ sơ HLV" user={coach}>
      <ScrollView contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
        <View style={{ paddingHorizontal: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
          <CoachSummary coach={coach} />
          {blocked ? (
            <BlockedNotice userId={coach.id} />
          ) : (
            <>
              {myCoach && <Tag text="HLV của bạn" icon="user-check-line" />}
              {coach.bio ? <Text variant="Body/Base/Regular">{coach.bio}</Text> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Medium') }}>
                <View style={{ flex: 1 }}>
                  <FollowCounts userId={coach.id} />
                </View>
                <FollowButton userId={coach.id} size="Medium (Base)" />
              </View>
              {canRequest &&
                (conn?.requestedBy === 'player' ? (
                  <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
                    <InlineMessage theme="Info" text="Đã gửi yêu cầu kết nối — chờ HLV duyệt." />
                    <Button level="Tertiary" size="Medium (Base)" text="Huỷ yêu cầu" accessibilityLabel={`Huỷ yêu cầu kết nối với ${coach.name}`} onPress={() => dispatch({ type: 'revokeConnection', id: conn.id, at: NOW })} />
                  </View>
                ) : conn ? (
                  <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
                    <InlineMessage theme="Info" text={`${coach.name} mời bạn kết nối — nhận lời thì là ${hasPrimary ? 'HLV phụ' : 'HLV chính'} của bạn.`} />
                    <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/Small') }}>
                      <View style={{ flex: 1 }}>
                        <Button size="Medium (Base)" leadingIcon="user-check-line" text="Chấp nhận" accessibilityLabel={`Chấp nhận lời mời của ${coach.name}`} onPress={() => respond(true)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button level="Tertiary" size="Medium (Base)" text="Từ chối" accessibilityLabel={`Từ chối lời mời của ${coach.name}`} onPress={() => respond(false)} />
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: t.space('Spacing/Gap/XSmall') }}>
                    <Button size="Medium (Base)" leadingIcon="user-plus-line" text="Gửi yêu cầu kết nối" onPress={request} />
                    <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">
                      {hasPrimary ? 'Bạn đã có HLV chính — HLV này duyệt thì thành HLV phụ.' : 'HLV duyệt thì đây là HLV chính của bạn.'}
                    </Text>
                  </View>
                ))}
            </>
          )}
        </View>
        {!blocked && <PostsSection authorId={coach.id} onShared={share.onShared} />}
      </ScrollView>
      {share.toast}
    </ProfileScreen>
  );
}
