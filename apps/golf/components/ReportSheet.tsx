import { useState } from 'react';
import { View } from 'react-native';
import { BottomSheet, RadioRow, Text, useTheme } from '@gr/ds';
import type { ID } from '../lib/domain';
import { NOW } from '../lib/mock';
import { newId } from '../lib/ids';
import { useStore } from '../lib/store';

const REASONS = ['Spam', 'Nội dung không phù hợp', 'Quấy rối', 'Khác'];

/** Báo cáo bài viết / bình luận / người dùng: chọn lý do (bắt buộc) → `report` → `onReported` (màn đóng sheet + Toast). */
export function ReportSheet({ visible, heading, targetUserId, postId, onClose, onReported }: {
  visible: boolean; heading: string; targetUserId?: ID; postId?: ID; onClose: () => void; onReported: () => void;
}) {
  const t = useTheme();
  const { dispatch, me } = useStore();
  const [reason, setReason] = useState<string>();
  const [missing, setMissing] = useState(false);
  const reset = () => {
    setReason(undefined);
    setMissing(false);
  };
  const send = () => {
    if (!reason || !me) return setMissing(true);
    dispatch({ type: 'report', report: { id: newId('rp'), reporterId: me.id, targetUserId, postId, reason, createdAt: NOW } });
    reset();
    onReported();
  };
  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
      heading={heading}
      subtitle="Người bị báo cáo không biết ai đã báo cáo."
      divider
      primary={{ text: 'Gửi báo cáo', onPress: send }}
    >
      <View style={{ paddingHorizontal: t.space('Spacing/Padding/Medium'), paddingVertical: t.space('Spacing/Padding/XSmall'), gap: t.space('Spacing/Gap/XSmall') }}>
        <View accessibilityRole="radiogroup" accessibilityLabel="Lý do báo cáo" style={{ gap: t.space('Spacing/Gap/XSmall') }}>
          {REASONS.map((r) => (
            <RadioRow
              key={r}
              label={r}
              select={reason === r}
              onPress={() => {
                setReason(r);
                setMissing(false);
              }}
            />
          ))}
        </View>
        {missing && (
          <Text variant="Body/Small/Regular" color="Color/Content/Negative/Base" accessibilityRole="alert">
            Chọn một lý do để gửi báo cáo.
          </Text>
        )}
      </View>
    </BottomSheet>
  );
}
