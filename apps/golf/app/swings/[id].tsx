import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import {
  AlertBanner, Avatar, Button, Chip, Dialog, Divider, EmptyState, Icon, InlineMessage, ListItem, MessageInput, ProgressBar, Screen, Tag, Text, VideoControlOverlay, useTheme,
  type VideoState,
} from '@gr/ds';
import { CAMERA_VIEW_LABELS, type CoachNote, type JobStatus, type Profile, type Swing, type SwingAnalysis } from '../../lib/domain';
import { NOW } from '../../lib/mock';
import { newId } from '../../lib/ids';
import { useStore } from '../../lib/store';
import { canViewPrivate, clubById, clubLabel, notesFor, profileById } from '../../lib/selectors';
import { formatDate, formatNumber, formatSec, formatTempo, formatValue, initials, insertMark, noteMarks, relativeTime } from '../../lib/format';
import { ANALYSIS_QUEUE_MS, ANALYSIS_TICK_MS, analysisTick } from '../../lib/simulate';
import { StackHeader } from '../../components/StackHeader';
import { KeyboardAvoid } from '../../components/KeyboardAvoid';
import { StatTile } from '../../components/StatTile';
import { SwingUpload } from '../../components/SwingUpload';
import { AlertMessage, SavedToast, SavingRow, useSimulatedWrite } from '../../components/Feedback';
import { NoAccess } from '../../components/NoAccess';
import { useOnLeave } from '../../components/useOnLeave';

const PHASES = [
  { key: 'address', label: 'Chuẩn bị' },
  { key: 'top', label: 'Đỉnh' },
  { key: 'impact', label: 'Chạm bóng' },
  { key: 'finish', label: 'Kết thúc' },
] as const;
const PLAY_TICK_MS = 100;
// ponytail: nhãn mốc rộng 1/4 thanh thời gian, so le 2 hàng — đủ cho video mẫu (3–4 s); video dài làm 2 nhãn cùng hàng chồng nhau → có video thật thì cho phóng to timeline.
const LABEL_PCT = 25;
const ESTIMATE = 'Kết quả là ước lượng từ video, không phải đo đạc';

function Section({ title, children }: PropsWithChildren<{ title: string }>) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space('Spacing/Gap/Small') }}>
      <Text variant="Heading/Subheading" accessibilityRole="header" style={{ paddingHorizontal: t.layout('Margin-Small') }}>{title}</Text>
      {children}
    </View>
  );
}

/** Hàng chạm để tua video tới `sec` (tip, ghi chú HLV có mốc). Không có mốc → chỉ hiển thị. */
function SeekRow({ sec, label, onSeek, children }: PropsWithChildren<{ sec?: number; label: string; onSeek: (sec: number) => void }>) {
  const t = useTheme();
  const row = { flexDirection: 'row', gap: t.space('Spacing/Gap/Small'), paddingHorizontal: t.layout('Margin-Small'), paddingVertical: t.space('Spacing/Padding/XSmall') } as const;
  if (sec === undefined) return <View style={row}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Tua video tới mốc này"
      onPress={() => onSeek(sec)}
      style={({ pressed }) => [row, pressed && { backgroundColor: t.color('Color/Background/Neutral/Flat/Hover') }]}
    >
      {children}
    </Pressable>
  );
}

/** Thanh thời gian dưới video: phần đã phát, vạch 4 mốc swing, chấm ghi chú HLV theo `atSec` (chỉ để nhìn);
 *  nhãn mốc nằm ngay dưới vạch của nó (so le 2 hàng vì Đỉnh và Chạm bóng chỉ cách 0,3 s) và là nút tua. */
function Timeline({ duration, position, phases, notes, onSeek }: { duration: number; position: number; phases?: SwingAnalysis['phases']; notes: CoachNote[]; onSeek: (sec: number) => void }) {
  const t = useTheme();
  const pct = (sec: number) => (Math.min(sec, duration) / duration) * 100;
  const left = (sec: number) => `${pct(sec)}%` as const;
  const dot = t.size('Element-Size/Popular/XSmall');
  const tick = t.weight('Emphasis/Border-Weight/Active');
  const row = t.size('Element-Size/Popular/2XLarge'); // một hàng nhãn: tên + thời điểm, đủ cao để chạm
  return (
    <View style={{ gap: t.space('Spacing/Gap/2XSmall') }}>
      <View aria-hidden>
        <View style={{ height: dot }}>
          {notes.map((n) =>
            n.atSec === undefined ? null : (
              <View
                key={n.id}
                style={{
                  position: 'absolute',
                  left: left(n.atSec),
                  width: dot,
                  height: dot,
                  borderRadius: t.radius('Corner-Radius/Rounded'),
                  backgroundColor: t.color('Color/Background/Warning/Solid/Default'),
                  transform: [{ translateX: -dot / 2 }],
                }}
              />
            ),
          )}
        </View>
        <View style={{ height: dot, justifyContent: 'center' }}>
          <ProgressBar value={position / duration} />
          {phases &&
            PHASES.map((p) => (
              <View
                key={p.key}
                style={{
                  position: 'absolute',
                  left: left(phases[p.key]),
                  width: tick,
                  height: dot,
                  backgroundColor: t.color('Color/Border/Neutral/Solid/Default'),
                  transform: [{ translateX: -tick / 2 }],
                }}
              />
            ))}
        </View>
      </View>
      {phases ? (
        <View style={{ height: 2 * row }}>
          {PHASES.map((p, i) => (
            <Pressable
              key={p.key}
              accessibilityRole="button"
              accessibilityLabel={`${p.label}, ${formatSec(phases[p.key])}`}
              accessibilityHint="Tua video tới mốc này"
              onPress={() => onSeek(phases[p.key])}
              style={({ pressed }) => ({
                position: 'absolute',
                top: i % 2 ? row : 0,
                left: `${Math.min(100 - LABEL_PCT, Math.max(0, pct(phases[p.key]) - LABEL_PCT / 2))}%`,
                width: `${LABEL_PCT}%`,
                height: row,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: t.radius('Corner-Radius/Base'),
                backgroundColor: pressed ? t.color('Color/Background/Neutral/Flat/Hover') : undefined,
              })}
            >
              <Text variant="Label/Small/DemiBold" numberOfLines={1}>{p.label}</Text>
              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{formatSec(phases[p.key])}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
          Phân tích xong sẽ đánh dấu 4 mốc: Chuẩn bị · Đỉnh · Chạm bóng · Kết thúc
        </Text>
      )}
    </View>
  );
}

/** Cổng quyền (D6) đứng TRƯỚC mọi state/effect của màn: người không có quyền xem chỉ thấy NoAccess — job phân tích của chủ swing
 *  (effect trong SwingView) không chạy trên máy họ. */
export default function SwingDetail() {
  const t = useTheme();
  const { state, me } = useStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const swing = state.swings.find((w) => w.id === id);
  if (!me) return <Redirect href="/" />;
  if (!swing || !canViewPrivate(state, me.id, swing.playerId)) {
    const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
    return (
      <Screen>
        <StackHeader title="Chi tiết swing" />
        <View style={{ flex: 1, justifyContent: 'center', padding: t.layout('Margin-Small') }}>
          {swing ? (
            <NoAccess />
          ) : (
            <EmptyState icon="file-search-line" title="Không tìm thấy swing" caption="Swing này không tồn tại hoặc đã bị xoá." primaryText="Quay lại" onPrimary={back} />
          )}
        </View>
      </Screen>
    );
  }
  return <SwingView key={swing.id} swing={swing} me={me} />;
}

/** Màn swing cho người đã qua cổng quyền: chủ swing (phân tích, tải tiếp, xoá) hoặc HLV có kết nối active (xem + ghi chú). */
function SwingView({ swing, me }: { swing: Swing; me: Profile }) {
  const t = useTheme();
  const { state, dispatch } = useStore();
  const [positionSec, setPositionSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string>();
  const [sent, setSent] = useState<string>();
  const [editing, setEditing] = useState<CoachNote>(); // ghi chú của chính HLV đang sửa trong ô dưới cùng
  const draft = useRef(''); // ghi chú mới chưa gửi, cất lại khi bấm Sửa — Huỷ sửa / lưu / xoá ghi chú đang sửa thì trả về ô nhập
  const [deleting, setDeleting] = useState<CoachNote>(); // giữ ghi chú để Dialog không trống khi mờ dần
  const [confirmNoteDelete, setConfirmNoteDelete] = useState(false);
  // Xoá sau khi màn đã rời (unmount) — xoá trước khi quay lại thì màn đang rời nháy "Không tìm thấy swing".
  const deleteOnLeave = useOnLeave(() => dispatch({ type: 'deleteSwing', id: swing.id }));
  const { busy, run } = useSimulatedWrite();
  const [failed, setFailed] = useState<{ title: string; caption: string; retry: () => void }>();
  // xác nhận / lỗi nằm ở helpText của MessageInput (không phải live region) → đọc cho VoiceOver / TalkBack
  useEffect(() => {
    const msg = sent ?? noteError;
    if (msg) AccessibilityInfo.announceForAccessibility(msg);
  }, [sent, noteError]);

  // Phát giả lập (chưa có video thật): vị trí chạy theo thời gian thực tới hết video.
  useEffect(() => {
    if (!playing) return;
    let p = positionSec;
    const timer = setInterval(() => {
      p = Math.min(swing.durationSec, p + PLAY_TICK_MS / 1000);
      setPositionSec(p);
      if (p >= swing.durationSec) {
        clearInterval(timer);
        setPlaying(false);
      }
    }, PLAY_TICK_MS);
    return () => clearInterval(timer);
  }, [playing]);

  // ponytail: job phân tích (mô phỏng worker) chỉ chạy khi màn của người có quyền xem đang mở (chủ swing hoặc HLV có kết nối) — rời màn
  // thì dừng, mở lại chạy tiếp từ tiến độ trong store (danh sách vẫn thấy "Đang phân tích"). Worker thật chạy nền, màn chỉ đọc trạng thái.
  const jobStatus = swing.job.status;
  useEffect(() => {
    if (jobStatus !== 'queued' && jobStatus !== 'processing') return;
    const update = (r: { status: JobStatus; progress: number; analysis?: SwingAnalysis }) =>
      dispatch({ type: 'jobUpdate', id: swing.id, ...r, at: NOW, notificationId: newId('nt') });
    if (jobStatus === 'queued') {
      const timer = setTimeout(() => update({ status: 'processing', progress: swing.job.progress }), ANALYSIS_QUEUE_MS);
      return () => clearTimeout(timer);
    }
    let p = swing.job.progress;
    const timer = setInterval(() => {
      const r = analysisTick(p, swing.fileName, swing.durationSec);
      p = r.progress;
      if (r.status !== 'processing') clearInterval(timer);
      update(r);
    }, ANALYSIS_TICK_MS);
    return () => clearInterval(timer);
  }, [swing.id, jobStatus]);

  const own = swing.playerId === me.id; // chủ swing: phân tích, tải tiếp, xoá
  const coach = me.role === 'coach'; // đã qua canViewPrivate → HLV có kết nối active: xem + ghi chú
  const uploaded = swing.upload.status === 'done';
  const duration = swing.durationSec;
  const club = clubById(state, swing.clubId);
  const notes = notesFor(state, swing.id);
  const pad = { paddingHorizontal: t.layout('Margin-Small') };
  const seek = (sec: number) => {
    setPlaying(false);
    setPositionSec(Math.min(sec, duration)); // mốc gõ tay có thể quá độ dài video
  };
  // mốc của ghi chú = mốc đầu tiên HLV chèn vào nội dung; không chèn → vị trí đang phát (như Task 9); quá độ dài video → cuối video
  const noteAt = (text: string) => Math.min(noteMarks(text)[0] ?? Math.round(positionSec * 100) / 100, duration);
  const removeSwing = () =>
    run(
      () => {
        deleteOnLeave(); // xoá khi màn đã rời (Task 21)
        if (router.canGoBack()) router.back();
        else router.replace('/(player)/swings');
      },
      () => setFailed({ title: 'Xoá thất bại', caption: 'Mất kết nối — swing vẫn còn.', retry: removeSwing }),
    );
  const removeNote = (n: CoachNote) =>
    run(
      () => {
        dispatch({ type: 'deleteNote', id: n.id, coachId: me.id });
        if (editing?.id === n.id) endEdit();
        setSent('Đã xoá ghi chú');
      },
      () => setFailed({ title: 'Xoá thất bại', caption: 'Mất kết nối — ghi chú vẫn còn.', retry: () => removeNote(n) }),
    );
  // Thử lại sau lỗi: job chạy tiếp từ tiến độ lúc lỗi (lần đầu: 0)
  const analyze = () => dispatch({ type: 'jobUpdate', id: swing.id, status: 'queued', progress: swing.job.progress, at: NOW, notificationId: newId('nt') });
  const sendNote = (text: string) => {
    const body = text.trim();
    if (!body) return setNoteError('Nhập nội dung ghi chú');
    if (editing) {
      dispatch({ type: 'editNote', id: editing.id, coachId: me.id, text: body, at: NOW });
      endEdit();
      setSent('Đã lưu ghi chú');
      return;
    }
    const atSec = noteAt(body);
    dispatch({ type: 'addNote', note: { id: newId('note'), swingId: swing.id, coachId: me.id, atSec, text: body, createdAt: NOW }, notificationId: newId('nt') });
    setNote('');
    setSent(`Đã gửi ghi chú tại ${formatSec(atSec)}`);
  };
  const startEdit = (n: CoachNote) => {
    if (!editing) draft.current = note; // đang sửa ghi chú khác → ô nhập là chữ sửa, nháp đã cất từ trước
    setEditing(n);
    setNote(n.text);
    setNoteError(undefined);
    setSent(undefined);
  };
  const endEdit = () => {
    setEditing(undefined);
    setNote(draft.current);
    draft.current = '';
    setNoteError(undefined);
  };
  const askDeleteNote = (n: CoachNote) => {
    setDeleting(n);
    setConfirmNoteDelete(true);
  };
  const overlay: VideoState = playing ? 'Playing' : positionSec >= duration ? 'Ended' : 'Paused';
  const tags = (a: SwingAnalysis) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall') }}>
      <Tag size="Small" text={`Độ tin cậy ${Math.round(a.confidence * 100)}%`} />
      <Tag size="Small" text={`${a.fps} fps · ${CAMERA_VIEW_LABELS[swing.cameraView]}`} />
    </View>
  );

  const analysis = () => {
    const a = swing.analysis;
    switch (swing.job.status) {
      case 'none':
        return (
          <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
            <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Base">{ESTIMATE}</Text>
            {own ? (
              <Button leadingIcon="stars-01-line" text="Phân tích swing" onPress={analyze} />
            ) : (
              <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">Học viên chưa yêu cầu phân tích swing này.</Text>
            )}
          </View>
        );
      case 'queued':
      case 'processing':
        return (
          <View style={pad}>
            <ProgressBar value={swing.job.progress} label="Đang phân tích… thường mất dưới 1 phút" />
          </View>
        );
      case 'failed':
        return (
          <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
            <AlertMessage theme="Negative" text="Phân tích chưa thành công. Video vẫn được giữ — thử lại sau ít phút." />
            {own && <Button level="Secondary" size="Medium (Base)" leadingIcon="refresh-cw-01-line" text="Thử lại" onPress={analyze} />}
          </View>
        );
      case 'needs_review':
        return (
          <>
            <AlertBanner theme="Warning" text="Video chưa đủ rõ — thử quay lại theo hướng dẫn" />
            <View style={[pad, { gap: t.space('Spacing/Gap/Small') }]}>
              {a && tags(a)}
              {own && <Button level="Secondary" size="Medium (Base)" leadingIcon="video-recorder-line" text="Quay lại hướng dẫn" onPress={() => router.push('/swings/new')} />}
            </View>
          </>
        );
      case 'succeeded':
        if (!a) return null;
        return (
          <>
            <View style={[pad, { gap: t.space('Spacing/Gap/Medium') }]}>
              {tags(a)}
              <View style={{ flexDirection: 'row', gap: t.space('Spacing/Gap/XSmall') }}>
                <StatTile label="Tempo" value={formatTempo(a.tempoRatio)} />
                <StatTile label="Backswing" value={formatNumber(a.backswingMs)} unit="ms" />
                <StatTile label="Downswing" value={formatNumber(a.downswingMs)} unit="ms" />
              </View>
              <View style={{ gap: t.space('Spacing/Gap/3XSmall') }}>
                <Text variant="Label/Small/DemiBold" color="Color/Content/Neutral/Light">Mặt phẳng swing</Text>
                <Text variant="Body/Base/Regular">{a.plane}</Text>
              </View>
              <Text variant="Body/XSmall/Regular" color="Color/Content/Neutral/Light">{ESTIMATE}</Text>
            </View>
            {a.tips.length > 0 && (
              <View>
                <Text variant="Label/Small/DemiBold" color="Color/Content/Neutral/Light" style={[pad, { paddingBottom: t.space('Spacing/Padding/2XSmall') }]}>
                  Gợi ý theo mốc
                </Text>
                {a.tips.map((tip) => (
                  <SeekRow key={tip.text} sec={tip.startSec} onSeek={seek} label={`${formatSec(tip.startSec)}: ${tip.text}`}>
                    <Icon name="play-circle-line" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Accent/Base" />
                    <Text variant="Body/Small/DemiBold" color="Color/Content/Accent/Base">{formatSec(tip.startSec)}</Text>
                    <Text variant="Body/Base/Regular" style={{ flex: 1 }}>{tip.text}</Text>
                  </SeekRow>
                ))}
              </View>
            )}
          </>
        );
    }
  };

  return (
    <Screen>
      <StackHeader
        title={club ? clubLabel(club) : 'Swing'}
        subtitle={[own ? undefined : profileById(state, swing.playerId)?.name, formatDate(swing.capturedAt), CAMERA_VIEW_LABELS[swing.cameraView]].filter(Boolean).join(' · ')}
        // ponytail: "menu" của chủ swing chỉ có 1 mục (Xoá) → action thẳng trên header; thêm mục thì đổi sang BottomSheet menu
        actions={own ? [{ icon: 'trash-line', accessibilityLabel: 'Xoá swing', onPress: () => !busy && setConfirmDelete(true) }] : undefined}
      />
      {busy && <SavingRow text="Đang xoá…" />}
      <KeyboardAvoid>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: t.space('Spacing/Padding/Medium'), gap: t.space('Spacing/Gap/XLarge') }}>
          {uploaded ? (
            <>
              <View style={[pad, { gap: t.space('Spacing/Gap/Medium') }]}>
                {/* khung video dọc 9:16 nền tối (chưa có video thật: bóng người thay khung hình) */}
                <View
                  style={{
                    alignSelf: 'center',
                    width: '50%',
                    aspectRatio: 9 / 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: t.radius('Corner-Radius/Large'),
                    backgroundColor: t.color('Color/Background/Black-Overlay/Pressed'),
                  }}
                >
                  <Icon name="user-solid" size={t.size('Image-Size/2XLarge')} color="Color/Content/On-Dark-Overlay/Light" />
                  <VideoControlOverlay
                    state={overlay}
                    onPlay={() => setPlaying(true)}
                    onReplay={() => {
                      setPositionSec(0);
                      setPlaying(true);
                    }}
                  />
                  {playing && <Pressable accessibilityRole="button" accessibilityLabel="Tạm dừng" onPress={() => setPlaying(false)} style={StyleSheet.absoluteFill} />}
                  <View style={{ position: 'absolute', left: t.space('Spacing/Padding/Small'), bottom: t.space('Spacing/Padding/Small'), pointerEvents: 'none' }}>
                    <Text variant="Caption/Medium" color="Color/Content/On-Dark-Overlay/Strongest">{`${formatSec(positionSec)} / ${formatSec(duration)}`}</Text>
                  </View>
                </View>
                <Timeline duration={duration} position={positionSec} phases={swing.analysis?.phases} notes={notes} onSeek={seek} />
              </View>
              {club && (
                <Section title="Gậy">
                  {/* MVP "hiển thị thông số gậy": loft, lie, cán, flex; chạm → chi tiết gậy (đã qua cổng quyền nên HLV cũng xem được) */}
                  <ListItem
                    title={`${clubLabel(club)} · ${club.brand} ${club.model}`}
                    caption={[`Loft ${formatValue(club.loftDeg, '°')}`, `Lie ${formatValue(club.lieDeg, '°')}`, club.shaftBrand, club.shaftFlex].join(' · ')}
                    trailing={<Icon name="chevron-right-line-medium" size={t.size('Element-Size/Popular/Base')} color="Color/Content/Neutral/Light" />}
                    onPress={() => router.push(`/clubs/${club.id}`)}
                  />
                </Section>
              )}
              <Section title="Phân tích">{analysis()}</Section>
              <Section title="Ghi chú HLV">
                {notes.length
                  ? notes.map((n) => {
                      const authorP = profileById(state, n.coachId);
                      const author = authorP?.name ?? 'HLV';
                      const when = [n.atSec !== undefined && `Tại ${formatSec(n.atSec)}`, relativeTime(n.createdAt, NOW), n.editedAt && 'đã sửa'].filter(Boolean).join(' · ');
                      const marks = noteMarks(n.text);
                      const mine = coach && n.coachId === me.id; // chỉ tác giả sửa/xoá — reducer cũng chặn người khác và HLV đã mất kết nối
                      return (
                        <View key={n.id}>
                          <SeekRow sec={n.atSec} onSeek={seek} label={`${author}, ${when}: ${n.text}`}>
                            <Avatar size="Small" theme={authorP?.avatarUrl ? 'Photo' : 'Accent'} source={authorP?.avatarUrl ? { uri: authorP.avatarUrl } : undefined} initials={initials(author)} />
                            <View style={{ flex: 1, gap: t.space('Spacing/Gap/3XSmall') }}>
                              <Text variant="Body/Base/DemiBold" numberOfLines={1}>{author}</Text>
                              <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">{when}</Text>
                              <Text variant="Body/Base/Regular">{n.text}</Text>
                            </View>
                          </SeekRow>
                          {/* hàng nút nằm ngoài SeekRow: không lồng nút trong nút (web) */}
                          {(marks.length > 0 || mine) && (
                            <View style={[pad, { flexDirection: 'row', flexWrap: 'wrap', gap: t.space('Spacing/Gap/XSmall'), paddingBottom: t.space('Spacing/Padding/XSmall') }]}>
                              {marks.map((m, i) => (
                                <Chip key={`${m}-${i}`} size="XSmall" icon="play-circle-line" text={`Tua tới ${formatSec(m)}`} onPress={() => seek(m)} />
                              ))}
                              {mine && (
                                <>
                                  {/* trích đoạn: 2 ghi chú cùng mốc + cùng lúc vẫn có nhãn khác nhau; khoá khi đang xoá (một lần xoá chờ một lúc) */}
                                  <Button level="Tertiary" size="XSmall" leadingIcon="edit-02-line" text="Sửa" accessibilityLabel={`Sửa ghi chú ${when}: ${n.text.slice(0, 30)}`} disabled={busy} onPress={() => startEdit(n)} />
                                  <Button level="Tertiary" size="XSmall" leadingIcon="trash-line" text="Xoá" accessibilityLabel={`Xoá ghi chú ${when}: ${n.text.slice(0, 30)}`} disabled={busy} onPress={() => askDeleteNote(n)} />
                                </>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })
                  : (
                    <Text variant="Body/Base/Regular" color="Color/Content/Neutral/Light" style={pad}>
                      {coach ? 'Chưa có ghi chú. Tua tới mốc cần nhận xét, bấm Chèn mốc rồi viết ghi chú ở dưới.' : 'Chưa có ghi chú từ HLV.'}
                    </Text>
                  )}
              </Section>
            </>
          ) : (
            <View style={[pad, { gap: t.space('Spacing/Gap/Medium') }]}>
              <SwingUpload swing={swing} controls={own} />
              <Text variant="Body/Small/Regular" color="Color/Content/Neutral/Light">
                Video cần tải lên xong trước khi phân tích và nhận ghi chú HLV.
              </Text>
            </View>
          )}
        </ScrollView>
        {coach && uploaded && (
          <>
            <Divider />
            <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/XSmall') }}>
              {editing && (
                <InlineMessage
                  theme="Info"
                  text={`Đang sửa ghi chú${editing.atSec !== undefined ? ` tại ${formatSec(editing.atSec)}` : ''}`}
                  actionText="Huỷ sửa"
                  onAction={endEdit}
                />
              )}
              <View style={{ flexDirection: 'row' }}>
                {/* MVP "Nút chèn Timestamp": chèn vị trí đang phát vào nội dung, chạm được để tua ở chip dưới ghi chú */}
                <Chip
                  size="Small"
                  icon="clock-line"
                  text={`Chèn mốc ${formatSec(positionSec)}`}
                  onPress={() => {
                    setNote((v) => insertMark(v, positionSec));
                    setNoteError(undefined);
                    setSent(undefined);
                  }}
                />
              </View>
              <MessageInput
                placeholder={editing ? 'Sửa ghi chú' : `Ghi chú tại ${formatSec(positionSec)}`}
                value={note}
                onChangeText={(v) => {
                  setNote(v);
                  setNoteError(undefined);
                  setSent(undefined);
                }}
                onSend={sendNote}
                maxLength={500}
                error={noteError}
                helpText={sent ?? (note && !editing ? `Ghi chú tại ${formatSec(noteAt(note))}` : undefined)}
              />
            </View>
          </>
        )}
      </KeyboardAvoid>
      <Dialog
        visible={confirmDelete}
        onRequestClose={() => setConfirmDelete(false)}
        theme="Warning"
        title="Xoá swing này?"
        body={
          notes.length
            ? `Video, kết quả phân tích và ${notes.length} ghi chú HLV sẽ bị xoá, không khôi phục được.`
            : 'Video và kết quả phân tích sẽ bị xoá, không khôi phục được.'
        }
        primaryText="Xoá"
        destructive
        onPrimary={() => {
          setConfirmDelete(false);
          removeSwing();
        }}
        secondaryText="Huỷ"
      />
      <Dialog
        visible={confirmNoteDelete}
        onRequestClose={() => setConfirmNoteDelete(false)}
        theme="Warning"
        title="Xoá ghi chú này?"
        body="Học viên sẽ không còn thấy ghi chú này. Không khôi phục được."
        primaryText="Xoá"
        destructive
        onPrimary={() => {
          setConfirmNoteDelete(false);
          if (deleting) removeNote(deleting);
        }}
        secondaryText="Huỷ"
      />
      {failed && (
        <SavedToast
          type="Negative"
          title={failed.title}
          caption={failed.caption}
          actionText="Thử lại"
          onAction={() => {
            const retry = failed.retry;
            setFailed(undefined);
            retry();
          }}
          onDone={() => setFailed(undefined)}
        />
      )}
    </Screen>
  );
}
