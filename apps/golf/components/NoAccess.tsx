import { router } from 'expo-router';
import { EmptyState } from '@gr/ds';

const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** 403 — chặn xem dữ liệu riêng (D6): chỉ chủ dữ liệu và HLV có kết nối active xem được, theo dõi KHÔNG mở. Có nút Quay lại như màn 404 theo đối tượng.
 *  `reason` thay câu giải thích mặc định. */
export function NoAccess({ reason = 'Chỉ HLV đã kết nối mới xem được dữ liệu này.' }: { reason?: string }) {
  return <EmptyState icon="lock-01-line" title="Không có quyền xem" caption={reason} primaryText="Quay lại" onPrimary={back} />;
}
