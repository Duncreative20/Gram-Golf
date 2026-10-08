import { useEffect, useRef } from 'react';

/** Chạy `fn` khi màn rời stack (unmount), chỉ khi đã gọi hàm trả về. Dùng để xoá dữ liệu SAU khi rời màn — xoá trước khi quay lại thì màn
 *  đang rời nháy "Không tìm thấy …". Ví dụ: `const deleteOnLeave = useOnLeave(() => dispatch(…)); … deleteOnLeave(); back();` */
export function useOnLeave(fn: () => void) {
  const armed = useRef(false);
  useEffect(
    () => () => {
      if (armed.current) fn();
    },
    [], // fn chỉ đọc id cố định của màn (param / prop) → closure lần đầu là đủ
  );
  return () => {
    armed.current = true;
  };
}
