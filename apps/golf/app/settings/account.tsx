import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Button, Divider, Screen, TextArea, TextField, useTheme, type TextFieldProps } from '@gr/ds';
import { useStore } from '../../lib/store';
import { formatValue, formatVnd } from '../../lib/format';
import { BIO_MAX, BIO_MIN, RATE_MAX_VND, validateAccount, type AccountRaw } from '../../lib/validation';
import { StackHeader } from '../../components/StackHeader';
import { AlertMessage, SavedToast } from '../../components/Feedback';
import { KeyboardAvoid } from '../../components/KeyboardAvoid';

const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

/** Sửa hồ sơ: tên, SĐT, giới thiệu + (người chơi) handicap, CLB / (HLV) học viện, kinh nghiệm, đơn giá. Lỗi theo trường sau lần Lưu đầu. */
export default function AccountSettings() {
  const t = useTheme();
  const { state, dispatch, me } = useStore();
  const [raw, setRaw] = useState<AccountRaw>(() => ({
    name: me?.name ?? '',
    phone: me?.phone ?? '',
    bio: me?.bio ?? '',
    handicap: me?.handicap === undefined ? '' : formatValue(me.handicap),
    homeClub: me?.homeClub ?? '',
    academy: me?.academy ?? '',
    yearsExperience: me?.yearsExperience === undefined ? '' : String(me.yearsExperience),
    ratePerHourVnd: me?.ratePerHourVnd === undefined ? '' : String(me.ratePerHourVnd),
  }));
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!me) return <Redirect href="/" />;
  const result = validateAccount(me.role, raw, state.profiles.filter((p) => p.id !== me.id));
  const errors = submitted ? result.errors : {};
  const invalid = Object.keys(result.errors).length;
  const field = (key: keyof AccountRaw, props: Omit<TextFieldProps, 'value' | 'onChangeText' | 'error'>) => (
    <TextField {...props} value={raw[key]} onChangeText={(v) => setRaw((r) => ({ ...r, [key]: v }))} error={errors[key]} />
  );
  const save = () => {
    setSubmitted(true);
    if (!result.value) return;
    dispatch({ type: 'updateProfile', id: me.id, patch: result.value });
    setSaved(true);
  };
  return (
    <Screen>
      <StackHeader title="Tài khoản" />
      <KeyboardAvoid>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Medium') }}
        >
          {field('name', { label: 'Họ tên', placeholder: 'Nguyễn Văn A', autoComplete: 'name' })}
          {field('phone', { label: 'Số điện thoại', placeholder: '0912345678', autoComplete: 'tel', keyboardType: 'phone-pad' })}
          <TextArea
            label="Giới thiệu"
            placeholder={me.role === 'coach' ? 'VD: 8 năm dạy swing cơ bản và tempo cho người mới, chuyên short game.' : 'Vài dòng về lối chơi, mục tiêu của bạn'}
            // HLV: bắt buộc 20–300 ký tự như bước onboarding; người chơi: tuỳ chọn
            helpText={me.role === 'coach' ? `${raw.bio.trim().length}/${BIO_MAX} ký tự · tối thiểu ${BIO_MIN}` : `Tuỳ chọn, tối đa ${BIO_MAX} ký tự`}
            maxLength={BIO_MAX}
            value={raw.bio}
            onChangeText={(bio) => setRaw((r) => ({ ...r, bio }))}
            error={errors.bio}
          />
          {me.role === 'player' ? (
            <>
              {field('handicap', { label: 'Handicap', placeholder: 'VD: 18,5', helpText: 'Từ 0 đến 54', keyboardType: 'decimal-pad' })}
              {field('homeClub', { label: 'CLB / sân tập (tuỳ chọn)', placeholder: 'VD: Sân tập Mỹ Đình' })}
            </>
          ) : (
            <>
              {field('academy', { label: 'Học viện / CLB', placeholder: 'VD: Học viện Golf Sông Bé' })}
              {field('yearsExperience', { label: 'Số năm kinh nghiệm', placeholder: 'VD: 8', helpText: 'Từ 0 đến 60', keyboardType: 'number-pad' })}
              {field('ratePerHourVnd', { label: 'Đơn giá (đ/giờ, tuỳ chọn)', placeholder: 'VD: 450.000', helpText: `Tối đa ${formatVnd(RATE_MAX_VND)}`, keyboardType: 'number-pad' })}
            </>
          )}
        </ScrollView>
        <Divider />
        <View style={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Small') }}>
          {submitted && invalid > 0 && <AlertMessage theme="Negative" text={`Chưa lưu: ${invalid} trường cần sửa.`} />}
          <Button text="Lưu" disabled={saved} onPress={save} />
        </View>
      </KeyboardAvoid>
      {saved && <SavedToast title="Đã lưu hồ sơ" onDone={back} />}
    </Screen>
  );
}
