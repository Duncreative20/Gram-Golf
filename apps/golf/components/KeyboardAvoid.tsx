import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

/** Bọc ScrollView + footer cố định của form: bàn phím mở thì vùng này co lại, ô đang nhập và nút ở footer không bị che.
 *  ponytail: Android để hệ điều hành tự đẩy (adjustResize mặc định) — máy thật vẫn che footer thì đổi behavior="height" cho Android. */
export function KeyboardAvoid({ children }: PropsWithChildren) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {children}
    </KeyboardAvoidingView>
  );
}
