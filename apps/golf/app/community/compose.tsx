import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { BottomSheet, Button, Chip, PopoverItem, Screen, SelectField, TextArea, TextField, useTheme } from '@gr/ds';
import { CAMERA_VIEW_LABELS, type ID, type Swing } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { clubById, clubLabel, swingsOf } from '../../lib/selectors';
import { formatDate } from '../../lib/format';
import { POST_CONTENT_MAX, POST_TAGS_MAX, POST_TITLE_MAX, addTags, validatePost } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { SavedToast } from '../../components/SessionEntry';

/** Đăng bài: tiêu đề + nội dung bắt buộc (lỗi theo trường sau lần bấm Đăng đầu), tag (Enter / dấu phẩy → Chip, chạm để bỏ,
 *  tối đa 5, chữ thường, bỏ trùng), đính kèm một swing đã tải lên của mình (tuỳ chọn). Đăng → addPost → Toast → về bảng tin. */
export default function ComposePost() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [swingId, setSwingId] = useState<ID>();
  const [picking, setPicking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [posted, setPosted] = useState(false);
  if (!me) return <Redirect href="/" />;
  const result = validatePost({ title, content });
  const errors = submitted ? result.errors : {};
  const swings = swingsOf(state, me.id).filter((w) => w.upload.status === 'done');
  const describe = (w: Swing) => {
    const club = clubById(state, w.clubId);
    return `${club ? clubLabel(club) : 'Chưa gắn gậy'} · ${formatDate(w.capturedAt)}`;
  };
  const attached = swings.find((w) => w.id === swingId);
  const full = tags.length >= POST_TAGS_MAX;
  const onTagInput = (v: string) => {
    if (!v.includes(',')) return setTagInput(v);
    const parts = v.split(',');
    setTagInput(parts.pop() ?? ''); // phần sau dấu phẩy cuối: còn đang gõ
    setTags((cur) => addTags(cur, parts.join(',')));
  };
  const submit = () => {
    setSubmitted(true);
    if (!result.value) return;
    setPosted(true);
    // tag còn trong ô (chưa Enter / dấu phẩy) vẫn được tính
    dispatch({ type: 'addPost', post: { id: newId('post'), authorId: me.id, createdAt: NOW, ...result.value, tags: addTags(tags, tagInput), swingId } });
  };
  const backToFeed = () => (router.canGoBack() ? router.back() : router.replace(me.role === 'player' ? '/(player)/community' : '/(coach)/community'));
  return (
    <Screen>
      <StackHeader title="Đăng bài" />
      <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}>
        <TextField label="Tiêu đề" placeholder="VD: 3 bài tập giữ tempo cho driver" value={title} onChangeText={setTitle} maxLength={POST_TITLE_MAX} error={errors.title} />
        <TextArea
          label="Nội dung"
          placeholder="Chia sẻ kinh nghiệm, câu hỏi hoặc kết quả buổi tập…"
          value={content}
          onChangeText={setContent}
          maxLength={POST_CONTENT_MAX}
          error={errors.content}
          helpText={`${content.length}/${POST_CONTENT_MAX} ký tự`}
        />
        <TextField
          label={`Tag (${tags.length}/${POST_TAGS_MAX})`}
          placeholder={full ? `Đã đủ ${POST_TAGS_MAX} tag` : 'VD: driver, tempo'}
          leadingIcon="hash-01-line"
          value={tagInput}
          onChangeText={onTagInput}
          onSubmitEditing={() => {
            setTags((cur) => addTags(cur, tagInput));
            setTagInput('');
          }}
          blurOnSubmit={false} // Enter thêm tag rồi gõ tiếp tag sau
          autoCapitalize="none"
          maxLength={30}
          disabled={full}
          helpText="Enter hoặc dấu phẩy để thêm · chạm tag để bỏ"
        />
        {tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }}>
            {tags.map((tag) => (
              <Chip key={tag} size="Small" icon="x-small-line" text={`#${tag}`} onPress={() => setTags(tags.filter((x) => x !== tag))} />
            ))}
          </View>
        )}
        {swings.length > 0 && (
          <SelectField
            label="Đính kèm swing (tuỳ chọn)"
            placeholder="Không đính kèm"
            value={attached && describe(attached)}
            onPress={() => setPicking(true)}
            accessibilityLabel={`Đính kèm swing, ${attached ? describe(attached) : 'không đính kèm'}`}
          />
        )}
        <Button size="Medium (Base)" leadingIcon="send-01-line" text="Đăng" disabled={posted} onPress={submit} />
      </ScrollView>
      <BottomSheet visible={picking} onClose={() => setPicking(false)} heading="Đính kèm swing" divider>
        <ScrollView>
          <View accessibilityRole="radiogroup" accessibilityLabel="Swing đính kèm">
            {[undefined, ...swings].map((w) => (
              <PopoverItem
                key={w?.id ?? 'none'}
                type="Radio"
                label={w ? describe(w) : 'Không đính kèm'}
                caption={w ? CAMERA_VIEW_LABELS[w.cameraView] : undefined}
                selected={w?.id === swingId}
                onPress={() => {
                  setSwingId(w?.id);
                  setPicking(false);
                }}
              />
            ))}
          </View>
        </ScrollView>
      </BottomSheet>
      {posted && <SavedToast title="Đã đăng bài" onDone={backToFeed} />}
    </Screen>
  );
}
