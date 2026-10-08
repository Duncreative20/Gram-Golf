# Ảnh nghiệm thu — mọi route (spec §3)

Chụp trên web (react-native-web) 390×844, sáng + tối, bằng `scripts/shot-web.mjs` với Metro chạy ở cổng 8081.
Route của người chơi đăng nhập thẳng bằng `?as=p-minh` (Minh Anh — đủ dữ liệu; `p-huy` cho màn cần tài khoản chưa có HLV),
route của HLV bằng `?as=c-tuan` — cơ chế đăng nhập nhanh `?as=<id>` chỉ có ở bản dev (`apps/golf/app/_layout.tsx`).
Màn xác minh OTP (`verify-otp`) nhận bản nháp đăng ký qua `?draft=`.

Chụp lại toàn bộ (vòng lặp shell, chạy tuần tự — chạy song song nhiều `shot-web.mjs` có thể trùng cổng CDP ngẫu nhiên và chụp nhầm màn):

```sh
(CI=1 pnpm -F golf exec expo start --web --port 8081 > /tmp/metro-gg.log 2>&1 &)   # đợi ~20 s
export CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
while IFS='|' read -r group slug route; do
  for scheme in light dark; do
    mkdir -p docs/screens/$group
    node scripts/shot-web.mjs "$route" $scheme docs/screens/$group/$slug-$scheme.png 390 844 < /dev/null
  done
done <<'ROUTES'
auth|welcome|/(auth)/welcome
auth|login|/(auth)/login
auth|register|/(auth)/register
auth|forgot-password|/(auth)/forgot-password
auth|verify-otp|/(auth)/verify-otp?draft=%7B%22role%22%3A%22player%22%2C%22name%22%3A%22Tr%E1%BA%A7n%20V%C4%83n%20Test%22%2C%22email%22%3A%22test%40gramgolf.vn%22%2C%22phone%22%3A%220912%20000%20111%22%2C%22handicap%22%3A18%7D
auth|onboarding|/(auth)/onboarding?as=p-huy
player|home|/(player)/home?as=p-minh
player|metrics|/(player)/metrics?as=p-minh
player|swings|/(player)/swings?as=p-minh
player|community|/(player)/community?as=p-minh
player|coach|/(player)/coach?as=p-minh
player|metrics-add|/metrics/add?as=p-minh
player|metrics-manual|/metrics/manual?as=p-minh
player|metrics-import-csv|/metrics/import-csv?as=p-minh
player|metrics-import-photo|/metrics/import-photo?as=p-minh
player|metrics-scan-qr|/metrics/scan-qr?as=p-minh
player|metrics-id|/metrics/ss-d6?as=p-minh
player|clubs|/clubs?as=p-minh
player|clubs-new|/clubs/new?as=p-minh
player|clubs-id|/clubs/cl-driver?as=p-minh
player|clubs-id-edit|/clubs/cl-driver/edit?as=p-minh
player|swings-new|/swings/new?as=p-minh
player|swings-id|/swings/sw-minh-1?as=p-minh
player|connect-accept|/connect/accept?as=p-huy
player|coaches-id|/coaches/c-tuan?as=p-minh
coach|roster|/(coach)/roster?as=c-tuan
coach|community|/(coach)/community?as=c-tuan
coach|inbox|/(coach)/inbox?as=c-tuan
coach|me|/(coach)/me?as=c-tuan
coach|connect-invite|/connect/invite?as=c-tuan
coach|students-id|/students/p-minh?as=c-tuan
coach|swings-id-coach|/swings/sw-lan-1?as=c-tuan
chung|community-compose|/community/compose?as=p-minh
chung|posts-id|/posts/post-4?as=p-minh
chung|users-id|/users/p-khoa?as=p-minh
chung|people|/people?as=p-minh
chung|notifications|/notifications?as=p-minh
chung|profile|/profile?as=p-minh
chung|settings|/settings?as=p-minh
chung|settings-account|/settings/account?as=p-minh
chung|settings-password|/settings/password?as=p-minh
chung|settings-privacy|/settings/privacy?as=p-minh
chung|settings-notifications|/settings/notifications?as=p-minh
chung|settings-units|/settings/units?as=p-minh
chung|settings-dev|/settings/dev?as=p-minh
ROUTES
pkill -f "expo start"
```

## Xác thực

| Route | Sáng | Tối |
|---|---|---|
| `/(auth)/welcome` | [welcome-light](auth/welcome-light.png) | [welcome-dark](auth/welcome-dark.png) |
| `/(auth)/login` | [login-light](auth/login-light.png) | [login-dark](auth/login-dark.png) |
| `/(auth)/register` | [register-light](auth/register-light.png) | [register-dark](auth/register-dark.png) |
| `/(auth)/forgot-password` | [forgot-password-light](auth/forgot-password-light.png) | [forgot-password-dark](auth/forgot-password-dark.png) |
| `/(auth)/verify-otp ?draft=…` | [verify-otp-light](auth/verify-otp-light.png) | [verify-otp-dark](auth/verify-otp-dark.png) |
| `/(auth)/onboarding?as=p-huy` | [onboarding-light](auth/onboarding-light.png) | [onboarding-dark](auth/onboarding-dark.png) |

## Người chơi

| Route | Sáng | Tối |
|---|---|---|
| `/(player)/home?as=p-minh` | [home-light](player/home-light.png) | [home-dark](player/home-dark.png) |
| `/(player)/metrics?as=p-minh` | [metrics-light](player/metrics-light.png) | [metrics-dark](player/metrics-dark.png) |
| `/(player)/swings?as=p-minh` | [swings-light](player/swings-light.png) | [swings-dark](player/swings-dark.png) |
| `/(player)/community?as=p-minh` | [community-light](player/community-light.png) | [community-dark](player/community-dark.png) |
| `/(player)/coach?as=p-minh` | [coach-light](player/coach-light.png) | [coach-dark](player/coach-dark.png) |
| `/metrics/add?as=p-minh` | [metrics-add-light](player/metrics-add-light.png) | [metrics-add-dark](player/metrics-add-dark.png) |
| `/metrics/manual?as=p-minh` | [metrics-manual-light](player/metrics-manual-light.png) | [metrics-manual-dark](player/metrics-manual-dark.png) |
| `/metrics/import-csv?as=p-minh` | [metrics-import-csv-light](player/metrics-import-csv-light.png) | [metrics-import-csv-dark](player/metrics-import-csv-dark.png) |
| `/metrics/import-photo?as=p-minh` | [metrics-import-photo-light](player/metrics-import-photo-light.png) | [metrics-import-photo-dark](player/metrics-import-photo-dark.png) |
| `/metrics/scan-qr?as=p-minh` | [metrics-scan-qr-light](player/metrics-scan-qr-light.png) | [metrics-scan-qr-dark](player/metrics-scan-qr-dark.png) |
| `/metrics/ss-d6?as=p-minh` | [metrics-id-light](player/metrics-id-light.png) | [metrics-id-dark](player/metrics-id-dark.png) |
| `/clubs?as=p-minh` | [clubs-light](player/clubs-light.png) | [clubs-dark](player/clubs-dark.png) |
| `/clubs/new?as=p-minh` | [clubs-new-light](player/clubs-new-light.png) | [clubs-new-dark](player/clubs-new-dark.png) |
| `/clubs/cl-driver?as=p-minh` | [clubs-id-light](player/clubs-id-light.png) | [clubs-id-dark](player/clubs-id-dark.png) |
| `/clubs/cl-driver/edit?as=p-minh` | [clubs-id-edit-light](player/clubs-id-edit-light.png) | [clubs-id-edit-dark](player/clubs-id-edit-dark.png) |
| `/swings/new?as=p-minh` | [swings-new-light](player/swings-new-light.png) | [swings-new-dark](player/swings-new-dark.png) |
| `/swings/sw-minh-1?as=p-minh` | [swings-id-light](player/swings-id-light.png) | [swings-id-dark](player/swings-id-dark.png) |
| `/connect/accept?as=p-huy` | [connect-accept-light](player/connect-accept-light.png) | [connect-accept-dark](player/connect-accept-dark.png) |
| `/coaches/c-tuan?as=p-minh` | [coaches-id-light](player/coaches-id-light.png) | [coaches-id-dark](player/coaches-id-dark.png) |

## HLV

| Route | Sáng | Tối |
|---|---|---|
| `/(coach)/roster?as=c-tuan` | [roster-light](coach/roster-light.png) | [roster-dark](coach/roster-dark.png) |
| `/(coach)/community?as=c-tuan` | [community-light](coach/community-light.png) | [community-dark](coach/community-dark.png) |
| `/(coach)/inbox?as=c-tuan` | [inbox-light](coach/inbox-light.png) | [inbox-dark](coach/inbox-dark.png) |
| `/(coach)/me?as=c-tuan` | [me-light](coach/me-light.png) | [me-dark](coach/me-dark.png) |
| `/connect/invite?as=c-tuan` | [connect-invite-light](coach/connect-invite-light.png) | [connect-invite-dark](coach/connect-invite-dark.png) |
| `/students/p-minh?as=c-tuan` | [students-id-light](coach/students-id-light.png) | [students-id-dark](coach/students-id-dark.png) |
| `/swings/sw-lan-1?as=c-tuan` | [swings-id-coach-light](coach/swings-id-coach-light.png) | [swings-id-coach-dark](coach/swings-id-coach-dark.png) |

## Chung (cả hai vai trò)

| Route | Sáng | Tối |
|---|---|---|
| `/community/compose?as=p-minh` | [community-compose-light](chung/community-compose-light.png) | [community-compose-dark](chung/community-compose-dark.png) |
| `/posts/post-4?as=p-minh` | [posts-id-light](chung/posts-id-light.png) | [posts-id-dark](chung/posts-id-dark.png) |
| `/users/p-khoa?as=p-minh` | [users-id-light](chung/users-id-light.png) | [users-id-dark](chung/users-id-dark.png) |
| `/people?as=p-minh` | [people-light](chung/people-light.png) | [people-dark](chung/people-dark.png) |
| `/notifications?as=p-minh` | [notifications-light](chung/notifications-light.png) | [notifications-dark](chung/notifications-dark.png) |
| `/profile?as=p-minh` | [profile-light](chung/profile-light.png) | [profile-dark](chung/profile-dark.png) |
| `/settings?as=p-minh` | [settings-light](chung/settings-light.png) | [settings-dark](chung/settings-dark.png) |
| `/settings/account?as=p-minh` | [settings-account-light](chung/settings-account-light.png) | [settings-account-dark](chung/settings-account-dark.png) |
| `/settings/password?as=p-minh` | [settings-password-light](chung/settings-password-light.png) | [settings-password-dark](chung/settings-password-dark.png) |
| `/settings/privacy?as=p-minh` | [settings-privacy-light](chung/settings-privacy-light.png) | [settings-privacy-dark](chung/settings-privacy-dark.png) |
| `/settings/notifications?as=p-minh` | [settings-notifications-light](chung/settings-notifications-light.png) | [settings-notifications-dark](chung/settings-notifications-dark.png) |
| `/settings/units?as=p-minh` | [settings-units-light](chung/settings-units-light.png) | [settings-units-dark](chung/settings-units-dark.png) |
| `/settings/dev?as=p-minh` | [settings-dev-light](chung/settings-dev-light.png) | [settings-dev-dark](chung/settings-dev-dark.png) |

## Trạng thái khó bấm tới bằng URL (Task 14)

| Trạng thái | Ảnh |
|---|---|
| Tổng quan — khung xương lúc tải lần đầu | [home-skeleton-light](task14/home-skeleton-light.png) |
| Bảng tin — khung xương lúc tải lần đầu | [community-skeleton-dark](task14/community-skeleton-dark.png) |
| Nhập từ ảnh — ảnh mờ, không đọc được số liệu | [import-photo-unreadable-light](task14/import-photo-unreadable-light.png) |
| Nhập từ ảnh — sửa ô độ tin cậy thấp thì tắt cảnh báo | [import-photo-warning-cleared-light](task14/import-photo-warning-cleared-light.png) |
| Quét QR — đang liên kết phiên | [scan-qr-linking-light](task14/scan-qr-linking-light.png) |
| Quét QR — mã không đọc được | [scan-qr-invalid-dark](task14/scan-qr-invalid-dark.png) |
| Swing — phân tích lỗi + Thử lại | [swing-analysis-failed-light](task14/swing-analysis-failed-light.png) |
| Swing — thử lại thành công | [swing-analysis-retried-light](task14/swing-analysis-retried-light.png) |
| Biểu đồ tốc độ — đoạn cuối đi xuống, nhãn nằm dưới điểm | [home-trend-last-down-light](task14/home-trend-last-down-light.png) |
| Mời học viên — "Gửi" chép lời mời (không giả vờ đã gửi) | [invite-share-copied-light](task14/invite-share-copied-light.png) |

## Thư mục theo task

`task1/` … `task13/` giữ ảnh kiểm tra của từng task (trạng thái lỗi, luồng, biến thể) — không bị thay bởi bộ ảnh theo route ở trên.
