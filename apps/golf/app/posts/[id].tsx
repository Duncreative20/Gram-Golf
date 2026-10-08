import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Avatar, Button, Card, CommentComposer, CommentThread, Dialog, Divider, EmptyState, Icon, LikesSheet, Screen, Text, useTheme, type CommentData } from '@gr/ds';
import type { Comment, ID, Profile } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { canViewPrivate, commentsOf, isBlocked, likeCount, profileById } from '../../lib/selectors';
import { initials, relativeTime } from '../../lib/format';
import { StackHeader } from '../../components/StackHeader';
import { KeyboardAvoid } from '../../components/KeyboardAvoid';
import { Section } from '../../components/Section';
import { PostItem } from '../../components/PostItem';
import { SwingCard } from '../../components/SwingCard';
import { ReportSheet } from '../../components/ReportSheet';
import { SavedToast } from '../../components/Feedback';
import { useOnLeave } from '../../components/useOnLeave';
import { profileHref } from '../../components/People';

const COMMENT_MAX = 1000; // ký tự mỗi bình luận
const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** Chi tiết bài: bài đầy đủ + swing đính kèm (chỉ mở được khi có quyền xem — D6), "Ai đã thích", bình luận (ẩn người đã chặn / bị chặn)
 *  + ô viết bình luận. Tác giả: Xoá (Dialog); người khác: Báo cáo (lý do). Một trong hai đã chặn người kia → không xem được bài. */
export default function PostDetail() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scroll = useRef<ScrollView>(null);
  const stickToEnd = useRef(false); // vừa gửi bình luận → cuộn xuống khi nội dung cao thêm
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string>();
  const [likesOpen, setLikesOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // `report` giữ đích báo cáo để tiêu đề sheet không trống khi sheet trượt xuống lúc đóng
  const [report, setReport] = useState<{ heading: string; targetUserId: ID }>();
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState<{ key: number; title: string }>();
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deletePost', id })); // xoá SAU khi rời màn
  if (!me) return <Redirect href="/" />;
  const post = state.posts.find((p) => p.id === id);
  if (!post || isBlocked(state, me.id, post.authorId)) {
    return (
      <Screen>
        <StackHeader title="Bài viết" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          <EmptyState
            icon={post ? 'slash-circle-01-line' : 'file-search-line'}
            title={post ? 'Không xem được bài viết' : 'Không tìm thấy bài viết'}
            caption={post ? 'Bài viết bị ẩn vì một trong hai người đã chặn người kia.' : 'Bài viết đã bị xoá hoặc không tồn tại.'}
            primaryText="Quay lại"
            onPrimary={back}
          />
        </View>
      </Screen>
    );
  }
  const own = post.authorId === me.id;
  const swing = post.swingId ? state.swings.find((w) => w.id === post.swingId) : undefined;
  const comments = commentsOf(state, post.id, me.id);
  const likers = state.likes
    .filter((l) => l.postId === post.id)
    .map((l) => profileById(state, l.userId))
    .filter((p): p is Profile => !!p && !isBlocked(state, me.id, p.id));
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  const openReport = (heading: string, targetUserId: ID) => {
    setReport({ heading, targetUserId });
    setReportOpen(true);
  };
  const commentData = (c: Comment): CommentData => {
    const a = profileById(state, c.authorId);
    return { id: c.id, user: { name: a?.name ?? 'Người dùng', verified: a?.verified, avatar: a?.avatarUrl ? { uri: a.avatarUrl } : undefined }, time: relativeTime(c.createdAt, NOW), text: c.text };
  };
  const send = () => {
    const body = text.trim();
    if (!body) return;
    dispatch({
      type: 'addComment',
      comment: { id: newId('cm'), postId: post.id, authorId: me.id, text: replyTo ? `@${replyTo} ${body}` : body, createdAt: NOW },
      notificationId: newId('nt'),
    });
    setText('');
    setReplyTo(undefined);
    stickToEnd.current = true;
  };
  return (
    <Screen>
      <StackHeader
        title="Bài viết"
        // ponytail: "menu ⋯" mỗi vai chỉ có 1 mục → action thẳng trên header (như xoá swing, Task 9) — mở Dialog/sheet ngay khi
        // một Modal khác đang đóng bị kẹt trên iOS; thêm mục thì đổi sang menu BottomSheet
        actions={[
          own
            ? { icon: 'trash-line', accessibilityLabel: 'Xoá bài viết', onPress: () => setConfirmDelete(true) }
            : { icon: 'flag-01-line', accessibilityLabel: 'Báo cáo bài viết', onPress: () => openReport('Báo cáo bài viết', post.authorId) },
        ]}
      />
      <KeyboardAvoid>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (!stickToEnd.current) return;
            stickToEnd.current = false;
            scroll.current?.scrollToEnd();
          }}
          contentContainerStyle={{ paddingBottom: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}
        >
          <PostItem post={post} />
          {swing && (
            <View style={pad}>
              {canViewPrivate(state, me.id, swing.playerId) ? (
                <SwingCard swing={swing} />
              ) : (
                <Card theme="Border" spacing="Small">
                  <View accessible style={{ flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/Small') }}>
                    <Icon name="lock-01-line" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />
                    <View style={{ flex: 1, gap: t.space('Spacing/Gap/3XSmall') }}>
                      <Text variant="Body/Base/DemiBold">Swing riêng tư</Text>
                      <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">Chỉ người chơi và HLV đã kết nối xem được swing này.</Text>
                    </View>
                  </View>
                </Card>
              )}
            </View>
          )}
          {likeCount(state, post.id) > 0 && (
            <View style={[pad, { alignItems: 'flex-start' }]}>
              <Button type="Flat" level="Primary" size="Small" leadingIcon="heart-line" text="Ai đã thích" onPress={() => setLikesOpen(true)} />
            </View>
          )}
          <Section title="Bình luận" caption={comments.length ? `${comments.length} bình luận` : undefined}>
            <View style={[pad, { gap: t.space('Spacing/Gap/Large') }]}>
              {comments.length ? (
                comments.map((c) => (
                  <CommentThread
                    key={c.id}
                    root={commentData(c)}
                    onReply={(d) => setReplyTo(d.user.name)}
                    // ⋯ của bình luận người khác = báo cáo; bình luận của mình chưa có thao tác (chưa có xoá bình luận)
                    onMore={c.authorId === me.id ? undefined : () => openReport('Báo cáo bình luận', c.authorId)}
                  />
                ))
              ) : (
                <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light">Chưa có bình luận. Hãy là người đầu tiên!</Text>
              )}
            </View>
          </Section>
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small') }}>
          <CommentComposer
            value={text}
            onChangeText={(v) => setText(v.slice(0, COMMENT_MAX))}
            onSend={send}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(undefined)}
            // avatar của mình thay nút "+" (bình luận chưa đính kèm ảnh được)
            leading={<Avatar size="XSmall" theme={me.avatarUrl ? 'Photo' : 'Accent'} source={me.avatarUrl ? { uri: me.avatarUrl } : undefined} initials={initials(me.name)} />}
          />
        </View>
      </KeyboardAvoid>
      <LikesSheet
        visible={likesOpen}
        onClose={() => setLikesOpen(false)}
        heading={`${likeCount(state, post.id)} lượt thích`}
        search={false}
        users={likers.map((p) => ({ id: p.id, name: p.name, handle: p.role === 'coach' ? 'HLV' : undefined, verified: p.verified, avatar: p.avatarUrl ? { uri: p.avatarUrl } : undefined }))}
        onPressUser={(u) => {
          setLikesOpen(false);
          const p = profileById(state, u.id);
          if (p) router.push(profileHref(p));
        }}
      />
      <ReportSheet
        visible={reportOpen}
        heading={report?.heading ?? ''}
        targetUserId={report?.targetUserId}
        postId={post.id}
        onClose={() => setReportOpen(false)}
        onReported={() => {
          setReportOpen(false);
          setToast((prev) => ({ key: (prev?.key ?? 0) + 1, title: 'Đã gửi báo cáo' }));
        }}
      />
      <Dialog
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        theme="Warning"
        title="Xoá bài viết?"
        body="Bài viết cùng lượt thích và bình luận sẽ bị xoá, không khôi phục được."
        primaryText="Xoá"
        destructive
        onPrimary={() => {
          setConfirmDelete(false);
          deleteOnLeave();
          back();
        }}
        secondaryText="Huỷ"
      />
      {toast && <SavedToast key={toast.key} title={toast.title} onDone={() => setToast(undefined)} />}
    </Screen>
  );
}
