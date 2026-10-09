import { useState } from 'react';
import { Clipboard, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Identity, ShareSheet, SocialAction, Tag, Text, useTheme } from '@gr/ds';
import type { ID, Post } from '../lib/domain';
import { NOW } from '../lib/mock';
import { useStore } from '../lib/store';
import { commentsOf, discover, likeCount, likedBy, postsBy, profileById } from '../lib/selectors';
import { relativeTime } from '../lib/format';
import { newId } from '../lib/ids';
import { profileHref } from './People';
import { Section } from './Section';
import { SavedToast } from './Feedback';

// ponytail: link bài giả (chưa có domain / deep link thật) — có backend thì lấy link chia sẻ từ server, mở app bằng universal link.
const postLink = (id: string) => `https://gramgolf.app/p/${id}`;

/** Bài cộng đồng (DS Identity + SocialAction; PostCard bắt buộc khung ảnh nên không dùng cho bài chữ): tác giả + Badge HLV
 *  (+ xác minh) → hồ sơ, thời gian tương đối, tiêu đề, nội dung, tag; Thích · Bình luận · Chia sẻ (ShareSheet).
 *  Có `onOpen` (bảng tin, hồ sơ): nội dung rút gọn 4 dòng, chạm bài / Bình luận → mở bài. Không có (posts/[id]): bài đầy đủ.
 *  `onShared`: "Gửi" trong sheet đã chép bài → màn chủ hiện toast (SavedToast position:absolute nên không đặt trong hàng). */
export function PostItem({ post, onOpen, onShared }: { post: Post; onOpen?: () => void; onShared: () => void }) {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [sharing, setSharing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  if (!me) return null;
  const author = profileById(state, post.authorId);
  const name = author?.name ?? 'Người dùng';
  const coach = author?.role === 'coach';
  const time = relativeTime(post.createdAt, NOW);
  const liked = likedBy(state, me.id, post.id);
  const likes = likeCount(state, post.id, me.id);
  const comments = commentsOf(state, post.id, me.id).length;
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  const closeShare = () => {
    setSharing(false);
    setSelected([]);
    setMessage('');
    setCopied(false);
  };
  return (
    <View style={{ backgroundColor: t.color('Color/Background/Surface/Default'), paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/Small') }}>
      <View style={[pad, { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XSmall') }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${name}${coach ? ', HLV' : ''}, ${time}`}
          disabled={!author}
          onPress={() => author && router.push(profileHref(author))}
          style={{ flex: 1 }}
        >
          <Identity user={{ name, verified: author?.verified, avatar: author?.avatarUrl ? { uri: author.avatarUrl } : undefined }} meta={time} avatarSize="Small" />
        </Pressable>
        {coach && <Badge text="HLV" theme="Accent" />}
      </View>
      {onOpen ? (
        <Pressable accessibilityRole="button" accessibilityLabel={post.title} accessibilityHint="Mở bài viết" onPress={onOpen} style={[pad, { gap: t.space('Spacing/Gap/2XSmall') }]}>
          <Text variant="Heading/Subheading">{post.title}</Text>
          <Text variant="Body/Base/Regular" numberOfLines={4}>{post.content}</Text>
        </Pressable>
      ) : (
        <View style={[pad, { gap: t.space('Spacing/Gap/2XSmall') }]}>
          <Text variant="Heading/Subheading" accessibilityRole="header">{post.title}</Text>
          <Text variant="Body/Base/Regular" selectable>{post.content}</Text>
        </View>
      )}
      {post.tags.length > 0 && (
        <View style={[pad, { flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }]}>
          {post.tags.map((tag) => (
            <Tag key={tag} size="Small" text={`#${tag}`} />
          ))}
        </View>
      )}
      <View style={[pad, { flexDirection: 'row', alignItems: 'center', gap: t.space('Spacing/Gap/XLarge') }]}>
        <SocialAction
          type="Like"
          active={liked}
          label={likes ? String(likes) : undefined}
          accessibilityLabel={`Thích, ${likes} lượt thích`}
          onPress={() => dispatch({ type: 'toggleLike', userId: me.id, postId: post.id, at: NOW, notificationId: newId('nt') })}
        />
        {/* bài đầy đủ: phần Bình luận nằm ngay dưới, không cần nút mở */}
        {onOpen && <SocialAction type="Comment" label={comments ? String(comments) : undefined} accessibilityLabel={`Bình luận, ${comments} bình luận`} onPress={onOpen} />}
        <SocialAction type="Share" accessibilityLabel="Chia sẻ" onPress={() => setSharing(true)} />
      </View>
      <ShareSheet
        visible={sharing}
        onClose={closeShare}
        heading="Chia sẻ bài viết"
        users={discover(state, me.id, '').map((p) => ({ id: p.id, name: p.name, avatar: p.avatarUrl ? { uri: p.avatarUrl } : undefined }))}
        selectedIds={selected}
        onToggleUser={(u) => setSelected(selected.includes(u.id) ? selected.filter((x) => x !== u.id) : [...selected, u.id])}
        message={message}
        onChangeMessage={setMessage}
        onSend={() => {
          // ponytail: chưa có tin nhắn trong app — "Gửi" chép lời nhắn + link bài để dán vào ứng dụng nhắn tin; có hộp thư thì gửi thật cho người đã chọn.
          Clipboard.setString([message.trim(), postLink(post.id)].filter(Boolean).join('\n'));
          onShared();
          closeShare();
        }}
        actions={[
          {
            icon: copied ? 'check-line' : 'copy-line',
            label: copied ? 'Đã sao chép' : 'Sao chép liên kết',
            active: copied,
            onPress: () => {
              // ponytail: Clipboard của RN core (deprecated) vì không thêm dependency — nâng cấp: expo-clipboard.
              Clipboard.setString(postLink(post.id));
              setCopied(true);
            },
          },
        ]}
      />
    </View>
  );
}

/** Toast "Đã sao chép bài viết để gửi" ở cấp màn cho `onShared` của PostItem / PostsSection; gửi tiếp khi toast còn hiện → key mới, hiện lại từ đầu. */
export function useShareToast() {
  const [key, setKey] = useState(0);
  return { onShared: () => setKey((k) => k + 1), toast: key > 0 && <SavedToast key={key} title="Đã sao chép bài viết để gửi" onDone={() => setKey(0)} /> };
}

/** Mục "Bài đăng" của một người (hồ sơ HLV, hồ sơ người dùng, tab Hồ sơ của HLV): bài mới → cũ, chạm → chi tiết bài. */
export function PostsSection({ authorId, onShared }: { authorId: ID; onShared: () => void }) {
  const t = useTheme();
  const { state } = useStore();
  const posts = postsBy(state, authorId);
  return (
    <Section title="Bài đăng" caption={posts.length ? `${posts.length} bài` : undefined}>
      {posts.length ? (
        <View style={{ gap: t.space('Spacing/Gap/Small') }}>
          {posts.map((p) => (
            <PostItem key={p.id} post={p} onOpen={() => router.push(`/posts/${p.id}`)} onShared={onShared} />
          ))}
        </View>
      ) : (
        <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={{ paddingHorizontal: t.layout('Margin-Small') }}>
          Chưa có bài đăng.
        </Text>
      )}
    </Section>
  );
}
