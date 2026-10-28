# GramGolf — Đặc tả nghiệp vụ

**Phiên bản:** 1.0 · **Ngày:** 2026-10-28 · **Căn cứ:** code ở nhánh `main` (commit `3bc63dc`) và các tài liệu nguồn ở Phụ lục.
**Người đọc:** người thiết kế lại UI (§12 Đặc tả màn hình), developer làm backend thật (Supabase), và người mới vào dự án (designer, developer, QA).

## Mục lục

- [Cách đọc](#cách-đọc)
- [1. Tổng quan sản phẩm & phạm vi](#1-tổng-quan-sản-phẩm--phạm-vi)
- [2. Thuật ngữ](#2-thuật-ngữ)
- [3. Vai trò & ma trận quyền](#3-vai-trò--ma-trận-quyền)
- [4. Mô hình dữ liệu](#4-mô-hình-dữ-liệu) — [4.1 Profile](#41-profile--hồ-sơ-người-dùng-libdomaints5-11) · [4.2 Preferences](#42-preferences--tuỳ-chọn-mỗi-người-một-bản-ghi-libdomaints84-88) · [4.3 CoachConnection](#43-coachconnection--kết-nối-hlv--người-chơi-libdomaints13-19) · [4.4 CoachInvite](#44-coachinvite--mã-mời-libdomaints20) · [4.5 MetricSession](#45-metricsession--phiên-số-liệu-libdomaints29-32) · [4.6 Club](#46-club--gậy-libdomaints50-54) · [4.7 Swing](#47-swing--video-swing-libdomaints56-71) · [4.8 CoachNote](#48-coachnote--ghi-chú-hlv-libdomaints72) · [4.9 Post](#49-post--bài-viết-libdomaints75) · [4.10 Like, Comment, Follow, Block, Report](#410-like-comment-follow-block-report-libdomaints74-79) · [4.11 AppNotification](#411-appnotification--thông-báo-libdomaints81-82) · [4.12 Phiên đăng nhập và dữ liệu tạm](#412-phiên-đăng-nhập-và-dữ-liệu-tạm-không-lưu)
- [5. Luật nghiệp vụ theo mảng](#5-luật-nghiệp-vụ-theo-mảng) — [5.1 Tài khoản](#51-tài-khoản--đăng-ký-otp-onboarding-đăng-nhập-mật-khẩu-hồ-sơ-đăng-xuất-xoá-br-taikhoan) · [5.2 Kết nối HLV – học viên và quyền xem](#52-kết-nối-hlv--học-viên-và-quyền-xem-br-ketnoi) · [5.3 Số liệu swing và thể lực](#53-số-liệu-swing-và-thể-lực-br-solieu) · [5.4 Bộ gậy](#54-bộ-gậy-br-bogay) · [5.5 Swing video](#55-swing-video--đăng-tải-lên-phân-tích-ghi-chú-hlv-xoá-br-swing) · [5.6 Cộng đồng và thông báo](#56-cộng-đồng-và-thông-báo-br-congdong) · [5.7 Hồ sơ, cài đặt và trạng thái dùng chung](#57-hồ-sơ-cài-đặt-và-trạng-thái-dùng-chung-br-caidat)
- [6. Vòng đời & trạng thái](#6-vòng-đời--trạng-thái) — [6.1 Phiên đăng nhập và tài khoản](#61-phiên-đăng-nhập-và-tài-khoản) · [6.2 Kết nối](#62-kết-nối-coachconnectionstatus) · [6.3 Mã mời](#63-mã-mời-coachinvite) · [6.4 Tải lên video](#64-tải-lên-video-uploadstatus) · [6.5 Job phân tích](#65-job-phân-tích-jobstatus) · [6.6 Swing và ghi chú](#66-swing-và-ghi-chú) · [6.7 Phiên số liệu và luồng nhập](#67-phiên-số-liệu-và-luồng-nhập) · [6.8 Gậy](#68-gậy) · [6.9 Cộng đồng: bài viết, theo dõi, lượt thích, chặn](#69-cộng-đồng-bài-viết-theo-dõi-lượt-thích-chặn) · [6.10 Thông báo](#610-thông-báo) · [6.11 Ghi giả lập và tải lần đầu](#611-ghi-giả-lập-và-tải-lần-đầu)
- [7. Thông báo](#7-thông-báo)
- [8. Kiểm tra dữ liệu (validate)](#8-kiểm-tra-dữ-liệu-validate)
- [9. Giả lập trong bản hiện tại & yêu cầu cho backend thật](#9-giả-lập-trong-bản-hiện-tại--yêu-cầu-cho-backend-thật) — [9.1 Những gì đang giả lập](#91-những-gì-đang-giả-lập) · [9.2 Backend thật phải bảo đảm](#92-backend-thật-phải-bảo-đảm)
- [10. Quyết định đã chốt & hạng mục không làm](#10-quyết-định-đã-chốt--hạng-mục-không-làm) — [10.1 Quyết định trong spec](#101-quyết-định-trong-spec-d1d13-spec15-31) · [10.2 Quyết định của chủ dự án và ruling ảnh hưởng nghiệp vụ](#102-quyết-định-của-chủ-dự-án-và-ruling-ảnh-hưởng-nghiệp-vụ-báo-cáo18-24-phụ-lục-a63-99) · [10.3 Quyết định tự chốt trong lúc build](#103-quyết-định-tự-chốt-trong-lúc-build-báo-cáo26-44) · [10.4 Hạng mục không làm](#104-hạng-mục-không-làm)
- [11. Lệch tài liệu & câu hỏi mở](#11-lệch-tài-liệu--câu-hỏi-mở) — [11.1 Lệch tài liệu](#111-lệch-tài-liệu-code-là-chuẩn-nên-sửa-tài-liệu-cho-khớp) · [11.2 Câu hỏi mở](#112-câu-hỏi-mở-cần-chủ-dự-án-quyết)
- [12. Đặc tả màn hình (cho thiết kế lại UI)](#12-đặc-tả-màn-hình-cho-thiết-kế-lại-ui) — [12.0 Cách dùng phần này](#120-cách-dùng-phần-này) · [12.1 Quy ước chung toàn app](#121-quy-ước-chung-toàn-app) · [12.2 Bắt đầu & đăng nhập](#122-bắt-đầu--đăng-nhập) · [12.3 Tổng quan & thông số](#123-tổng-quan--thông-số) · [12.4 Bộ gậy & swing](#124-bộ-gậy--swing) · [12.5 HLV & kết nối](#125-hlv--kết-nối) · [12.6 Cộng đồng & thông báo](#126-cộng-đồng--thông-báo) · [12.7 Hồ sơ & cài đặt](#127-hồ-sơ--cài-đặt) · [12.8 Khoảng trống cho thiết kế lại](#128-khoảng-trống-cho-thiết-kế-lại)
- [Phụ lục: tài liệu nguồn](#phụ-lục-tài-liệu-nguồn)

---

## Cách đọc

- **Mã luật** có dạng `BR-<MẢNG>-<số>`. Có 7 mảng: `TAIKHOAN` (tài khoản), `KETNOI` (kết nối HLV–học viên, quyền xem), `SOLIEU` (số liệu swing và thể lực), `BOGAY` (bộ gậy), `SWING` (video swing), `CONGDONG` (cộng đồng và thông báo), `CAIDAT` (hồ sơ, cài đặt, trạng thái dùng chung). Mã giữ nguyên như lúc trích từ code, nên số có thể không liền nhau.
- **Mã gộp:** hai luật trùng nhau giữa các mảng chỉ giữ một mã. Mã còn lại ghi dòng *"Đã gộp vào …"* để tra ngược.
- **"Nguồn"** là `file:dòng`.
  - Đường dẫn code tính từ `apps/golf/` (vd `lib/reducer.ts:47`, `app/swings/[id].tsx:145`, `components/People.tsx:116`). Riêng `packages/ds/…` tính từ gốc repo.
  - Tài liệu dùng tên tắt:

    | Tên tắt | File |
    |---|---|
    | `spec` | `docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md` |
    | `plan` | `docs/superpowers/plans/2026-10-07-gramgolf-ui.md` |
    | `báo cáo` | `docs/superpowers/reports/2026-10-08-gramgolf-ui-bao-cao.md` |
    | `handoff` | `docs/product/handoff-2026-08-15.md` |
    | `tech review` | `docs/product/tech-stack-review-2026-08-15.md` |
    | `MVP` | `docs/product/mvp-checklist.md` (đối chiếu issue #1) |
    | `F01` … `F13` | `docs/flows/F01.md` … `docs/flows/F13.md` |

- **Code là nguồn sự thật.** Tài liệu nói khác code thì đặc tả này mô tả theo code và ghi **"Lệch tài liệu: …"**. Danh sách lệch đầy đủ ở §11.
- **"Chỉ UI chặn"** nghĩa là luật hiện chỉ do màn hình đảm bảo (ẩn nút, chuyển hướng), còn reducer không kiểm. Backend thật phải tự thi hành các luật này (§9).
- Câu chữ trong ngoặc kép là chữ thật trên UI, giữ nguyên để QA đối chiếu.

---

## 1. Tổng quan sản phẩm & phạm vi

**GramGolf** (tên cũ trong handoff: *Swingboard*) là nền tảng theo dõi phong độ và mạng xã hội cho người chơi golf và huấn luyện viên (HLV). Sản phẩm có hai lớp giá trị (handoff:15-23):

1. **Dữ liệu hiệu suất:** người chơi ghi thông số swing, thể lực, bộ gậy và video swing. HLV đã kết nối xem dữ liệu này và ghi chú theo mốc thời gian trên video.
2. **Mạng xã hội:** theo dõi (follow), bảng tin, thích, bình luận, chia sẻ, chặn, báo cáo.

**Hai vai trò:** Người chơi (`player`) và HLV (`coach`). Mỗi tài khoản chọn vai một lần lúc đăng ký và không đổi được (BR-TAIKHOAN-01).

| Vai | Tab chính | Màn chung |
|---|---|---|
| Người chơi | Tổng quan · Thông số · Swing · Cộng đồng · HLV | Hồ sơ (`/profile`), Thông báo, Cài đặt, hồ sơ công khai, chi tiết phiên / gậy / swing / bài |
| HLV | Học viên · Cộng đồng · Thông báo · Hồ sơ | Như trên, cộng mã mời (`/connect/invite`) và chi tiết học viên (`/students/[id]`) |

(spec:33-52)

**Nền tảng của bản hiện tại:**
- Mobile-first: Expo SDK 57 + Expo Router, chạy bằng Expo Go. Bản web (react-native-web) chỉ dùng để chụp và kiểm tra (spec D2).
- Toàn bộ UI tiếng Việt. Giao diện sáng / tối tự theo hệ điều hành (spec D12).
- State là React context + reducer thuần (`lib/store.tsx`, `lib/reducer.ts`). Logic nằm ở `lib/` và có test vitest (spec D10).

**Phần chạy thật và phần giả lập.** Bản hiện tại **không có backend**. Dữ liệu là mock trong bộ nhớ và mất khi tải lại app. "Bây giờ" là hằng `NOW = 2026-10-07T08:00:00Z` (`lib/mock.ts:4`).

| Chạy thật (luật trong code) | Giả lập (chi tiết ở §9.1) |
|---|---|
| Mọi luật validate (`lib/validation.ts`) | Mật khẩu, OTP, email đặt lại, phiên đăng nhập |
| Quyền xem `canViewPrivate` ở mọi màn dữ liệu riêng | Lưu trữ dữ liệu (chỉ trong bộ nhớ) |
| Máy trạng thái kết nối, mã mời, tải lên, phân tích | Chọn file CSV / video / ảnh (chỉ có file mẫu), camera QR |
| Sinh thông báo trong app, chống lặp, ẩn theo chặn | Tải lên video, job phân tích, OCR (bộ đếm trên màn, kết quả cố định) |
| Parser CSV TrackMan / Foresight, đổi đơn vị | Push, email, SMS, chia sẻ ra ngoài (chỉ chép clipboard) |
| Chặn, theo dõi, thích, bình luận, báo cáo | Độ trễ lưu / xoá 0,6 s và lỗi bật bằng cờ Dev |

**Ngoài phạm vi bản này** (spec:13): Supabase, auth thật, upload thật, push thật, thanh toán.

**Hạng mục MVP issue #1 không làm** (MVP; chủ dự án quyết ngày 08/10/2026: spec + plan 07/10 thắng mọi mâu thuẫn với MVP):

| Mã MVP | Không làm | Lý do |
|---|---|---|
| M1.2 | Khung web / desktop có sidebar | Mâu thuẫn D2 (mobile-first) |
| M2.5 (một phần) | Avatar bắt buộc ở onboarding | Plan Task 4: avatar tuỳ chọn, được dùng chữ tắt |
| M3.1 (một phần) | Recharts | D11: biểu đồ SVG tự vẽ, vì Recharts không chạy trên RN |
| M3.9 (một phần) | Hệ Imperial đầy đủ (km/h…) | D9: chỉ khoảng cách đổi m ↔ yd |
| M5.1 (một phần) | Thứ tự upload "file → tiến độ → gậy & ngày" | Plan Task 9: chọn gậy và ngày trước khi tải |
| M5.2 (một phần) | Trường Direction (hướng / lệch) | Không khớp bộ 6 trường bắt buộc của CSV / OCR / form |
| M6.3 (một phần) | Toast ở góc màn hình desktop | Mâu thuẫn D2 |
| M6.6 (một phần) | Lỗi mã mời dạng popup; lỗi "xung đột HLV active khác" | Plan Task 10 dùng lỗi inline; D5 cho phép nhiều HLV + 1 HLV chính |
| (báo cáo Phụ lục A, mục i) | Form nhập dạng bottom sheet | Plan Task 6/8/9: form toàn màn hình |

Mảng Cộng đồng nằm ngoài MVP issue #1. Phần đã làm (lấy từ handoff) được giữ nguyên (F10:59; báo cáo:81).

---

## 2. Thuật ngữ

| Thuật ngữ | Nghĩa trong GramGolf |
|---|---|
| **Người chơi** (`player`) | Người tự theo dõi phong độ: nhập số liệu, quản lý bộ gậy, đăng swing. Khi có kết nối active với HLV thì gọi là **học viên** của HLV đó. |
| **HLV** (`coach`) | Huấn luyện viên. Kèm nhiều học viên, xem dữ liệu riêng của học viên và ghi chú trên swing. Không có dữ liệu số liệu, gậy hay swing của riêng mình. |
| **Kết nối** (`CoachConnection`) | Quan hệ chính thức HLV ↔ người chơi. Có 4 trạng thái: `pending` (chờ trả lời), `active`, `revoked` (đã huỷ hoặc đã đóng), `declined` (bị từ chối). Bản ghi không bao giờ bị xoá. |
| **HLV chính / HLV phụ** | Một người chơi có thể có nhiều kết nối active, nhưng tối đa **1** HLV chính (`isPrimary = true`). Các HLV active còn lại là phụ. Quyền xem của chính và phụ như nhau. |
| **Mã mời** (`CoachInvite`) | Mã 6 ký tự do HLV tạo, có hạn 7 ngày, dùng một lần. Người chơi nhập mã thì kết nối active ngay, không cần HLV duyệt. |
| **Lời mời / yêu cầu kết nối** | Kết nối gửi trong app, không qua mã. HLV gửi cho người chơi thì gọi là *lời mời*. Người chơi gửi cho HLV thì gọi là *yêu cầu*. Cả hai tạo kết nối `pending` và chờ bên nhận trả lời. |
| **Roster** | Danh sách học viên của một HLV, tức người chơi có kết nối active với HLV đó (tab Học viên). |
| **Cần phản hồi** | Học viên có ít nhất một swing đã có kết quả phân tích mà chính HLV đang xem chưa ghi chú. |
| **Đã review / Chưa review** | Swing mà HLV đang xem đã / chưa có ghi chú của chính HLV đó. |
| **Dữ liệu riêng** | Thông số swing, thể lực, bộ gậy, video swing kèm phân tích và ghi chú. Chỉ chủ sở hữu và HLV có kết nối active xem được (`canViewPrivate`). |
| **Hồ sơ công khai** | Tên, ảnh, handicap · CLB hoặc tóm tắt HLV, giới thiệu, số theo dõi, bài đăng. Không bao giờ chứa dữ liệu riêng. |
| **Theo dõi** (follow) | Quan hệ mạng xã hội một chiều. Chỉ ảnh hưởng bảng tin. **Không** mở dữ liệu riêng. |
| **Chặn** (block) | Lưu theo một chiều nhưng có hiệu lực **hai chiều**: hai người không thấy bài của nhau và không theo dõi được nhau. |
| **Phiên số liệu** (`MetricSession`) | Một bản ghi số liệu, thuộc loại **swing** (6 chỉ số) hoặc **thể lực** (4 chỉ số). "Buổi" trên UI = phiên. Một dòng CSV = một phiên. |
| **Nguồn / Hãng** | Nguồn của phiên: `manual` (Nhập tay), `csv`, `photo` (Ảnh / OCR), `qr`. Hãng máy đo: TrackMan, Foresight. |
| **Swing** | Một video swing của người chơi, kèm trạng thái tải lên, job phân tích và kết quả ước lượng. |
| **Job phân tích** | Tác vụ phân tích video. Trạng thái: `none`, `queued`, `processing`, `succeeded`, `failed`, `needs_review`. Kết quả chỉ là **ước lượng**, không phải đo đạc. |
| **Mốc** | Vị trí theo giây trên video: 4 mốc swing (Chuẩn bị · Đỉnh · Chạm bóng · Kết thúc), mốc của ghi chú (`atSec`), mốc của gợi ý (tip). |
| **Ghi chú HLV** (`CoachNote`) | Nhận xét của HLV trên một swing, gắn một mốc thời gian. |
| **Gậy đang dùng / lưu trữ** | Gậy lưu trữ (có `archivedAt`) bị ẩn khỏi danh sách và khỏi ô chọn gậy, nhưng dữ liệu cũ vẫn giữ. |
| **Đơn vị chuẩn** | Dữ liệu luôn lưu bằng mph, rpm, độ, **mét**, kg, cm. Người dùng chỉ chọn cách *hiển thị* khoảng cách (mét / yard). |
| **Ghi giả lập** | Lưu / xoá có độ trễ 0,6 s, trạng thái "Đang lưu…", lỗi và nút "Thử lại" (`useSimulatedWrite`). |
| **Khung xương** | Placeholder hiện 0,4 s ở lần mở đầu tiên một màn danh sách trong phiên làm việc. |
| **403 / 404** | 403 = có dữ liệu nhưng không có quyền xem (màn "Không có quyền xem"). 404 = đường dẫn hoặc đối tượng không tồn tại. |
| **Bản dev** | Bản chạy `__DEV__`. Có Cài đặt › Dev, tham số `?as=<userId>` và nút "Dùng tài khoản mẫu". Bản phát hành không có các lối này. |
| **`NOW`** | Mốc "bây giờ" cố định của bản mock: `2026-10-07T08:00:00Z`, tức 07/10/2026 15:00 giờ VN. |

---

## 3. Vai trò & ma trận quyền

**Cách đọc cột.** Hàng nói về dữ liệu hoặc hồ sơ của một người chơi **P**:
- **Chủ (P)**: chính P;
- **Người chơi khác**: mọi người chơi khác P, kể cả người đang theo dõi P;
- **HLV active**: HLV có kết nối `active` với P, kể cả HLV phụ;
- **HLV khác**: HLV không có kết nối active với P (kết nối `pending` / `declined` / `revoked`, hoặc chỉ theo dõi).

Hàng không gắn với P (vd tạo mã mời) thì cột chỉ có nghĩa là *vai* của người thao tác. **Khách** = chưa đăng nhập; khách mở màn trong app thì bị chuyển về `/` rồi tới màn chào (BR-TAIKHOAN-02).

Ký hiệu: ✓ được · ✗ không · — không áp dụng. "(UI)" = chỉ UI chặn, backend phải tự kiểm (§9).

| Hành động | Khách | Chủ (P) | Người chơi khác | HLV active | HLV khác | Luật |
|---|---|---|---|---|---|---|
| Đăng ký, đăng nhập, quên / đặt lại mật khẩu | ✓ | — | — | — | — | BR-TAIKHOAN-04…23 |
| Sửa hồ sơ của mình, đổi mật khẩu, xoá tài khoản, đăng xuất | ✗ | ✓ chỉ của mình | ✓ chỉ của mình | ✓ chỉ của mình | ✓ chỉ của mình | BR-TAIKHOAN-24…31 |
| Xem hồ sơ công khai của P | ✗ | ✓ | ✓ (chặn nhau thì phần lớn bị ẩn) | ✓ | ✓ (như cột người chơi khác) | BR-CAIDAT-09, BR-CONGDONG-29 |
| Xem phiên số liệu, Tổng quan, thể lực của P | ✗ | ✓ | ✗ 403 | ✓ chỉ đọc | ✗ 403 | BR-KETNOI-27/28, BR-SOLIEU-02 |
| Tạo / nhập phiên số liệu | ✗ | ✓ chỉ cho mình | ✓ chỉ cho mình | ✗ | ✗ | BR-SOLIEU-01 |
| Sửa / xoá phiên của P | ✗ | ✓ | ✗ | ✗ (UI; reducer xoá không kiểm) | ✗ | BR-SOLIEU-03 |
| Xem bộ gậy đang dùng của P | ✗ | ✓ | ✗ 403 | ✓ chỉ đọc | ✗ 403 | BR-BOGAY-14/15 |
| Xem danh sách gậy lưu trữ của P | ✗ | ✓ | ✗ | ✗ (chỉ mở được một gậy lưu trữ qua liên kết từ swing) | ✗ | BR-BOGAY-15/18 |
| Thêm / sửa / lưu trữ / khôi phục / xoá gậy | ✗ | ✓ (UI) | ✗ | ✗ | ✗ | BR-BOGAY-02/13/16/19/20 |
| Đăng swing, điều khiển tải lên, yêu cầu / thử lại phân tích, xoá swing | ✗ | ✓ (UI) | ✗ | ✗ chỉ xem | ✗ | BR-SWING-01/09/14/16/32 |
| Xem chi tiết swing, phân tích, ghi chú của P | ✗ | ✓ | ✗ 403 | ✓ | ✗ 403 | BR-SWING-31 |
| Viết ghi chú trên swing của P | ✗ | ✗ | ✗ | ✓ (sau khi video tải xong) | ✗ (reducer từ chối) | BR-SWING-21 |
| Sửa / xoá một ghi chú | ✗ | ✗ | ✗ | ✓ chỉ ghi chú của chính mình | ✗ | BR-SWING-25/26 |
| Mở chi tiết học viên `/students/[id]` | ✗ | ✓ (không có lối vào trong UI) | ✗ 403 | ✓ | ✗ 403 | BR-KETNOI-28 |
| Xem swing đính kèm bài của P | ✗ | ✓ | ✗ thẻ khoá | ✓ | ✗ thẻ khoá | BR-CONGDONG-10 |
| Tạo, chia sẻ, thu hồi mã mời | ✗ | ✗ | ✗ | ✓ mã của mình (UI) | ✓ mã của mình (UI) | BR-KETNOI-01…06 |
| Nhập mã mời | ✗ | ✓ | ✓ | ✗ | ✗ | BR-KETNOI-07…12 |
| Gửi yêu cầu kết nối tới một HLV | ✗ | ✓ (chưa có kết nối mở, không chặn nhau) | ✓ (như cột Chủ) | ✗ | ✗ | BR-KETNOI-14/15 |
| Gửi lời mời trong app tới P | ✗ | ✗ | ✗ | ✗ (đã kết nối) | ✓ (chưa có kết nối mở, không chặn nhau) | BR-KETNOI-13/14 |
| Trả lời lời mời / yêu cầu đang chờ | ✗ | ✓ nếu là bên nhận (UI) | — | — | ✓ nếu là bên nhận (UI) | BR-KETNOI-17 |
| Huỷ lời mời / yêu cầu đang chờ | ✗ | ✓ nếu là bên gửi (UI) | — | — | ✓ nếu là bên gửi (UI) | BR-KETNOI-18 |
| Huỷ kết nối active với P | ✗ | ✓ (UI) | ✗ | ✓ (UI) | — | BR-KETNOI-24/25 |
| Đổi HLV chính của P | ✗ | ✓ (UI) | ✗ | ✗ | ✗ | BR-KETNOI-21 |
| Chặn P | ✗ | ✗ (không tự chặn) | ✓ | ✗ phải huỷ kết nối trước (UI) | ✓ | BR-CONGDONG-26, BR-KETNOI-32 |
| Theo dõi P | ✗ | ✗ (không tự theo dõi) | ✓ (trừ khi chặn nhau) | ✓ | ✓ | BR-CONGDONG-20 |
| Đăng bài; thích, bình luận, chia sẻ bài đọc được | ✗ | ✓ | ✓ | ✓ | ✓ | BR-CONGDONG-01/12/15/25 |
| Xoá bài | ✗ | ✓ chỉ bài của mình (UI) | ✓ chỉ bài của mình (UI) | ✓ chỉ bài của mình (UI) | ✓ chỉ bài của mình (UI) | BR-CONGDONG-11 |
| Sửa / xoá bình luận | ✗ | ✗ | ✗ | ✗ | ✗ | BR-CONGDONG-19 |
| Báo cáo bài, bình luận, người dùng khác | ✗ | ✓ | ✓ | ✓ | ✓ | BR-CONGDONG-31 |
| Xem thông báo | ✗ | ✓ chỉ của mình | ✓ chỉ của mình | ✓ chỉ của mình | ✓ chỉ của mình | BR-CONGDONG-36 |
| Bật công tắc công khai bộ gậy / swing | ✗ | ✓ (chưa có tác dụng) | ✓ của mình | ✗ không có công tắc | ✗ | BR-CAIDAT-11 |
| Công cụ Dev (đổi tài khoản không mật khẩu, `?as=`, giả lập lỗi) | Chỉ bản dev | Chỉ bản dev | Chỉ bản dev | Chỉ bản dev | Chỉ bản dev | BR-TAIKHOAN-32, BR-CAIDAT-28 |

**Luật gốc của quyền xem dữ liệu riêng:** `canViewPrivate(viewer, player)` (`lib/selectors.ts:8-10`) trả `true` khi và chỉ khi người xem là chính người chơi đó, **hoặc** người xem là HLV có kết nối `active` với người chơi đó. Theo dõi và kết nối `pending` / `declined` / `revoked` không mở quyền. Hàm **không** xét chặn (BR-KETNOI-27). Backend thật phải làm RLS theo đúng luật này (§9.2).

---

## 4. Mô hình dữ liệu

**Quy ước chung**
- Mọi id là chuỗi. Bản mock sinh id theo bộ đếm: `<tiền tố>-<thời gian base36>-<bộ đếm>`. Các tiền tố: `u` hồ sơ, `cn` kết nối, `ss` phiên, `cl` gậy, `sw` swing, `note` ghi chú, `post` bài, `cm` bình luận, `rp` báo cáo, `nt` thông báo (`lib/ids.ts:4-5`). Backend dùng UUID.
- Mọi mốc thời gian lưu ISO-8601 UTC (`lib/domain.ts:2`). Hiển thị theo giờ Việt Nam UTC+7 cố định, dạng `dd/mm/yyyy` (`lib/format.ts:36-42`).
- **Đơn vị chuẩn khi lưu** (spec D9): tốc độ mph · spin rpm · góc độ (°) · khoảng cách **mét** · khối lượng kg · chiều cao cm · độ dẻo thang /10 · trọng lượng cán gram · thời gian video giây (mốc) và ms (tempo) · tiền VND (số nguyên).
- Giá trị tính ra (số lượt thích, `likedByMe`, số theo dõi, nhãn gậy, số liên kết của gậy) là **selector**, không lưu (spec:99-100).

**Quan hệ chính**

```
Profile (player) 1─* MetricSession *─0..1 Club
Profile (player) 1─* Club
Profile (player) 1─* Swing *─0..1 Club ;  Swing 1─* CoachNote *─1 Profile (coach)
Profile (coach) 1─* CoachInvite ;  CoachInvite.usedBy → Profile (player)
Profile (coach) *─* Profile (player)  qua CoachConnection (≤1 kết nối mở mỗi cặp, ≤1 HLV chính mỗi người chơi)
Profile 1─* Post 1─* Comment ;  Post 1─* Like ;  Post 0..1─ Swing (đính kèm)
Profile *─* Profile qua Follow, Block ;  Profile 1─* Report ;  Profile 1─* AppNotification ;  Profile 1─1 Preferences
```

### 4.1 Profile — hồ sơ người dùng (`lib/domain.ts:5-11`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID | có | Sinh lúc xác minh OTP (`app/(auth)/verify-otp.tsx:40`). Backend: `profiles.id = auth.users.id`. |
| `role` | `'player' \| 'coach'` | có | Chọn ở bước 1 đăng ký. Không đổi được (BR-TAIKHOAN-01). |
| `name` | string | có | Bỏ khoảng trắng hai đầu, gộp khoảng trắng liên tiếp, không rỗng. Không giới hạn độ dài. |
| `email` | string | có | Bỏ khoảng trắng hai đầu, lưu nguyên hoa / thường. Khớp `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Duy nhất, so không phân biệt hoa thường. Không sửa được sau đăng ký. |
| `phone` | string | có | Bỏ mọi khoảng trắng. Khớp `^0\d{9}$`. Duy nhất, so sau khi bỏ khoảng trắng. Seed lưu có khoảng trắng (`0912 345 678`), bản ghi mới lưu liền số. |
| `createdAt` | ISO | có | Mock = `NOW`. |
| `avatarUrl` | URL | không | Không có thì Avatar hiện chữ tắt. |
| `bio` | string | HLV: có · người chơi: không | HLV 20–300 ký tự, người chơi ≤ 300, đếm sau khi bỏ khoảng trắng hai đầu. |
| `handicap` | number | người chơi: có | 0–54, cho phép số thập phân. |
| `homeClub` | string | không | Chỉ người chơi. Chỉ nhập ở màn Tài khoản. |
| `academy` | string | HLV: có | Không rỗng sau khi bỏ khoảng trắng hai đầu. |
| `yearsExperience` | integer | HLV: có | 0–60. |
| `ratePerHourVnd` | integer (VND / giờ) | không | Chỉ HLV, chỉ nhập ở màn Tài khoản. 0–10.000.000. |
| `rating` | number | không | Chỉ có trong seed. Người dùng không đặt được. |
| `verified` | boolean | không | Chỉ có trong seed. Người dùng không đặt được. |

Nguồn: `lib/validation.ts:114-221`, `lib/mock.ts:11-18`. Tech review:200-201 đề xuất tách `profiles` / `player_profiles` / `coach_profiles` ở backend.

### 4.2 Preferences — tuỳ chọn, mỗi người một bản ghi (`lib/domain.ts:84-88`)

| Trường | Kiểu | Mặc định | Ràng buộc |
|---|---|---|---|
| `units` | `'metric' \| 'imperial'` (Mét / Yard) | `metric` | Chỉ đổi cách hiển thị và cách nhập khoảng cách (carry). Dữ liệu luôn lưu mét. |
| `publicClubs`, `publicSwings` | boolean | `false` | Chỉ người chơi thấy công tắc. Hiện mới lưu, chưa có tác dụng (BR-CAIDAT-11). |
| `quietHours` | boolean | `false` | Khung cố định 22:00–07:00. Chỉ lưu. |
| `notify` | `Record<NotificationType, boolean>`, 8 khoá | mọi loại `true` | Chỉ áp cho push (chưa làm). Không lọc danh sách trong app. |

Tài khoản mới nhận `DEFAULT_PREFS` (`lib/reducer.ts:47`). Người chưa có bản ghi cũng dùng mặc định (`lib/selectors.ts:6`). Mỗi lần đổi chỉ ghi khoá vừa đổi (BR-CAIDAT-19).

### 4.3 CoachConnection — kết nối HLV ↔ người chơi (`lib/domain.ts:13-19`)

Bản ghi không bao giờ bị xoá. Huỷ hay từ chối chỉ đổi `status`, và bản ghi giữ lại làm lịch sử.

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID (`cn-…`) | có | |
| `coachId` | ID | có | Hồ sơ phải có `role = 'coach'`. Kết nối bằng mã: lấy HLV chủ mã. |
| `playerId` | ID | có | Hồ sơ phải có `role = 'player'`. |
| `status` | `pending \| active \| revoked \| declined` | có | Mỗi cặp (coachId, playerId) có **tối đa 1** kết nối mở (`pending` hoặc `active`) (`lib/selectors.ts:93-95`). |
| `isPrimary` | boolean | có | Chỉ kết nối `active` mới được `true`. Mỗi người chơi có **tối đa 1** kết nối active mang `isPrimary = true`. `pending` luôn `false`. Huỷ thì về `false`. |
| `invitedAt` | ISO | có | Kết nối bằng mã: `createdAt` của mã. Lời mời / yêu cầu trong app: lúc gửi. |
| `acceptedAt` | ISO | không | Ghi lúc chuyển sang `active`. |
| `revokedAt` | ISO | không | Ghi khi huỷ bằng `revokeConnection`, hoặc khi tự đóng vì người chơi dùng mã của cùng HLV. **Không** ghi khi đóng do chặn. |
| `requestedBy` | `'player' \| 'coach'` | không | Bên gửi lời mời / yêu cầu trong app. Không có trường này = kết nối qua mã mời, active ngay. |
| `declinedAt` | ISO | không | Ghi khi bên nhận từ chối. |

### 4.4 CoachInvite — mã mời (`lib/domain.ts:20`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `code` | string, 6 ký tự | có | Mã sinh mới chỉ dùng bảng 32 ký tự: A–Z bỏ O và I, cộng 2–9. Không trùng **bất kỳ** mã nào đã có, kể cả mã đã dùng, thu hồi hay hết hạn (`lib/ids.ts:7-14`). Khi so mã: không phân biệt hoa thường, bỏ khoảng trắng hai đầu (`lib/selectors.ts:13`). |
| `coachId` | ID | có | HLV tạo mã. |
| `createdAt` | ISO | có | |
| `expiresAt` | ISO | có | `createdAt + 7 × 24 giờ`. Tới đúng mốc là đã hết hạn. |
| `usedBy` | ID người chơi | không | Ghi một lần khi mã được dùng, không bao giờ xoá. |
| `revoked` | boolean | không | `true` khi HLV thu hồi. Không có trường thời điểm thu hồi. |

Trạng thái mã được **tính ra** lúc kiểm, không lưu cột riêng. Kết quả kiểm `InviteCheck`: `ok | not_found | expired | used | revoked | already_connected` (`lib/domain.ts:21`).

### 4.5 MetricSession — phiên số liệu (`lib/domain.ts:29-32`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID (`ss-…`) | có | |
| `playerId` | ID | có | Luôn là người đang đăng nhập khi tạo. Không đổi khi sửa. |
| `kind` | `'swing' \| 'fitness'` | có | Mỗi phiên chỉ mang khối số của loại mình. Không đổi khi sửa. |
| `capturedAt` | ISO | có | Ngày buổi tập. Không được sau hôm nay. |
| `source` | `manual \| csv \| photo \| qr` | có | Nhãn: Nhập tay / CSV / Ảnh / QR. Hiện chưa luồng nào ghi `qr`. |
| `vendor` | `trackman \| foresight` | không | Có với phiên từ CSV hoặc ảnh. |
| `clubId` | ID gậy | không theo kiểu | Bắt buộc với phiên swing tạo mới ở cả 3 màn nhập. Phiên thể lực không gắn gậy. Gậy phải thuộc cùng người chơi (chỉ UI đảm bảo). |
| `note` | string | không | Có trong kiểu dữ liệu nhưng chưa màn nào ghi hay hiển thị. |
| `editedAt` | ISO | không | Hệ thống gắn khi sửa và form có thay đổi. |
| `swing` | SwingMetrics | khi `kind='swing'` | Bảng dưới. |
| `fitness` | FitnessMetrics | khi `kind='fitness'` | Bảng dưới. |

**SwingMetrics:** 6 trường, đều bắt buộc (`lib/validation.ts:6-13`).

| Trường | Nhãn UI | Đơn vị lưu | Khoảng hợp lệ (gồm hai biên) | Số lẻ khi hiển thị |
|---|---|---|---|---|
| `clubSpeedMph` | Tốc độ đầu gậy | mph | 40–150 | 0 |
| `ballSpeedMph` | Tốc độ bóng | mph | 50–220 | 0 |
| `smash` | Smash factor | — | 1–1,56 | 2 |
| `spinRpm` | Spin | rpm | 500–12000 | 0 |
| `launchDeg` | Góc bắn | ° | −10–45 | 1 |
| `carryM` | Carry | **m** | 10–350 m (nhập theo yard: 10,9–382,8 yd) | 0 |

**FitnessMetrics:** 4 trường, đều bắt buộc (`lib/validation.ts:14-19`).

| Trường | Nhãn UI | Đơn vị | Khoảng | Số lẻ |
|---|---|---|---|---|
| `weightKg` | Cân nặng | kg | 30–200 | 1 |
| `flexibility` | Độ dẻo | /10 | 0–10 | 0 |
| `gripStrengthKg` | Lực nắm | kg | 5–100 | 0 |
| `verticalJumpCm` | Bật cao | cm | 5–120 | 0 |

### 4.6 Club — gậy (`lib/domain.ts:50-54`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID (`cl-…`) | có | Client sinh lúc **mở** form, giữ cố định qua các lần Lưu / Thử lại, nên lưu là upsert theo id. |
| `playerId` | ID | có | Người thêm. Sửa thì giữ chủ cũ. |
| `type` | 1 trong 16 loại, hoặc `'Tuỳ chỉnh'` | có | Danh mục ở bảng dưới. |
| `customName` | string | khi `type = 'Tuỳ chỉnh'` | Bỏ khoảng trắng hai đầu. Loại khác thì luôn rỗng. |
| `brand`, `model`, `shaftBrand` | string | có | Bỏ khoảng trắng hai đầu, không rỗng, không giới hạn độ dài. |
| `shaftFlex` | `Ladies \| Senior \| Regular \| Stiff \| X-Stiff` | có | Form mới mặc định `Regular`. Mọi loại gậy đều có Flex, kể cả Putter. |
| `shaftWeightG` | number (g) | không | 30–150. |
| `loftDeg` | number (°) | có | 0–64. |
| `lieDeg` | number (°) | có | 45–80. |
| `bounceDeg` | number (°) | không | 0–20. Ô nhập chỉ hiện với wedge, nhưng validate không ràng buộc theo loại. |
| `archivedAt` | ISO | không | Có giá trị = gậy đã lưu trữ. |

Giá trị tính ra (`lib/selectors.ts:56,137-139`):
- `clubLabel`: bằng `type`; loại Tuỳ chỉnh thì bằng `customName`, thiếu thì "Gậy tuỳ chỉnh".
- `clubLinkCount`: số phiên số liệu cộng số swing đang gắn gậy.

**Danh mục loại, nhóm và loft gợi ý** (`lib/domain.ts:34-47`, `lib/validation.ts:92-97`):

| Nhóm (thứ tự hiển thị) | Loại → loft gợi ý |
|---|---|
| Gỗ | Driver 10,5° · Gỗ 3 15° · Gỗ 5 18° |
| Hybrid | Hybrid 3 19° · Hybrid 4 22° |
| Sắt | Sắt 4 21° · Sắt 5 24,5° · Sắt 6 28° · Sắt 7 31,5° · Sắt 8 35° · Sắt 9 38,5° (= 21 + (số − 4) × 3,5) |
| Wedge | PW 46° · GW 50° · SW 56° · LW 60° |
| Putter | Putter 3° |
| Khác | Tuỳ chỉnh (không có gợi ý) |

### 4.7 Swing — video swing (`lib/domain.ts:56-71`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID (`sw-…`) | có | Sinh một lần khi mở màn đăng, nên bấm "Tải lên" 2 lần vẫn chỉ ra 1 swing. |
| `playerId` | ID | có | Người đăng, phải có vai `player`. |
| `clubId` | ID gậy | không theo kiểu, **bắt buộc theo UI** | Gậy chưa lưu trữ của chính người chơi. Seed có swing không gắn gậy, hiển thị "Chưa gắn gậy". |
| `capturedAt` | ISO | có | Mặc định `NOW`. Không sau hôm nay theo ngày lịch VN. |
| `fileName` | string | có | |
| `durationSec` | number (s) | có | Trần cho mốc ghi chú và vị trí tua. |
| `cameraView` | `'face-on' \| 'down-the-line'` | có | Nhãn: Face-on / Down-the-line. |
| `upload.status` | `uploading \| paused \| failed \| done` | có | Lúc tạo là `uploading`. |
| `upload.progress` | 0..1 | có | Làm tròn 2 chữ số. |
| `job.status` | `none \| queued \| processing \| succeeded \| failed \| needs_review` | có | Lúc tạo là `none`. |
| `job.progress` | 0..1 | có | |
| `analysis` | SwingAnalysis | không | Chỉ có khi job đã vào `succeeded` hoặc `needs_review`. Lần cập nhật job sau mà không kèm kết quả thì giữ kết quả cũ. |

**SwingAnalysis** (`lib/domain.ts:61-65`; mock ở `lib/simulate.ts:46-66`):

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `tempoRatio` | number | (top − address) / (impact − top), làm tròn 1 chữ số. |
| `backswingMs`, `downswingMs` | integer ms | |
| `plane` | string | Câu mô tả mặt phẳng swing. |
| `confidence` | 0..1 | |
| `fps` | number | |
| `phases` | `{address, top, impact, finish}` (giây) | 4 mốc swing. |
| `tips` | `SwingTip[]` | Rỗng khi `needs_review`. `SwingTip = { text, startSec, endSec }`, với `startSec < endSec`. |
| `modelVersion` | string | Không hiển thị. |

**File video đầu vào** (chỉ kiểm lúc chọn, không lưu vào Swing): `mimeType` phải bắt đầu bằng `video/`; `sizeMb` ≤ `MAX_VIDEO_MB` = 300, là số tạm (`lib/validation.ts:259-264`).

### 4.8 CoachNote — ghi chú HLV (`lib/domain.ts:72`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID (`note-…`) | có | |
| `swingId` | ID | có | Swing phải tồn tại. |
| `coachId` | ID | có | Có vai `coach` và có kết nối **active** với chủ swing (`lib/reducer.ts:81`). |
| `atSec` | number (s, tối đa 2 chữ số thập phân) | không theo kiểu, UI luôn gán | Lấy mốc `[x s]` đầu tiên trong nội dung. Không có mốc thì lấy vị trí đang phát. Kẹp về `durationSec`. |
| `text` | string | có | Bỏ khoảng trắng hai đầu, không rỗng. Ô nhập giới hạn 500 ký tự (chỉ khi gõ). |
| `createdAt` | ISO | có | |
| `editedAt` | ISO | không | Chỉ gán khi nội dung thật sự đổi. |

### 4.9 Post — bài viết (`lib/domain.ts:75`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID (`post-…`) | có | |
| `authorId` | ID | có | Người đăng, người chơi hoặc HLV. |
| `createdAt` | ISO | có | |
| `title` | string | có | 1–120 ký tự sau khi bỏ khoảng trắng hai đầu. |
| `content` | string | có | 1–2000 ký tự sau khi bỏ khoảng trắng hai đầu. |
| `tags` | string[] | có, có thể rỗng | Tối đa 5. Chữ thường, không `#` ở đầu, khoảng trắng gộp, không trùng. Một tag gõ tối đa 30 ký tự (chỉ UI). |
| `swingId` | ID swing | không | Tối đa 1. Phải là swing của chính tác giả và đã tải xong (chỉ UI lọc). |

Không lưu `authorName`, `likes`, `likedByMe`; các giá trị này là selector.

### 4.10 Like, Comment, Follow, Block, Report (`lib/domain.ts:74-79`)

| Thực thể | Trường | Ràng buộc |
|---|---|---|
| **Like** | `userId`, `postId` | Mỗi cặp tối đa 1 bản ghi; thao tác bật / tắt. Không có `createdAt`. Xoá theo bài. |
| **Comment** | `id` (`cm-…`), `postId`, `authorId`, `text`, `createdAt` | `text` bỏ khoảng trắng hai đầu, không rỗng. Phần thân ≤ 1000 ký tự (UI cắt khi gõ). Trả lời thì đầu chuỗi có thêm `@<tên> `. Không lồng cấp (không `parentId`), không `editedAt`. Xoá theo bài. |
| **Follow** | `followerId`, `followedId` | `followerId ≠ followedId`. Mỗi cặp tối đa 1 bản ghi, thao tác bật / tắt. Không tạo được khi hai người chặn nhau, chiều nào cũng vậy (`lib/reducer.ts:105-111`). |
| **Block** | `blockerId`, `blockedId` | Lưu một chiều, xét hai chiều (`isBlocked`, `lib/selectors.ts:69`). Reducer không chống trùng, không chống tự chặn; chỉ UI ngăn. |
| **Report** | `id` (`rp-…`), `reporterId`, `targetUserId?`, `postId?`, `reason`, `createdAt` | `reason` do UI giới hạn trong 4 giá trị: `Spam`, `Nội dung không phù hợp`, `Quấy rối`, `Khác`. Không có `commentId`, không có trạng thái xử lý. |

### 4.11 AppNotification — thông báo (`lib/domain.ts:81-82`)

| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| `id` | ID (`nt-…`) | có | `swing_uploaded` sinh N bản ghi với id `<nt>-<i>`. |
| `userId` | ID người nhận | có | Luôn khác `actorId` (không tự báo cho mình). |
| `type` | `coach_note \| follow \| like \| comment \| invite_accepted \| analysis_done \| connect_request \| swing_uploaded` | có | 8 loại, xem §7. |
| `actorId` | ID | không | Không có ở `analysis_done` (thông báo hệ thống). |
| `refId` | ID swing / bài / kết nối | không | Không có ở `follow`. Không có cột loại đối tượng; app phân biệt bằng tiền tố id `sw-` / `post-` / `cn-`. |
| `createdAt` | ISO | có | |
| `readAt` | ISO | không | Có giá trị = đã đọc. |

### 4.12 Phiên đăng nhập và dữ liệu tạm (không lưu)

| Cấu trúc | Nội dung | Nguồn |
|---|---|---|
| `AppState.sessionUserId` | `ID \| null`. `null` = chưa đăng nhập. `me` = hồ sơ có id này; không tìm thấy hồ sơ thì coi như chưa đăng nhập. | `lib/domain.ts:91`, `lib/selectors.ts:5` |
| Bản nháp đăng ký | Truyền qua URL `?draft=`. Chỉ giữ các khoá `role, name, email, phone, handicap?, academy?, yearsExperience?`. **Không có mật khẩu.** | `lib/validation.ts:166-177` |
| Mã OTP | 6 chữ số. Mock dùng mã cố định `123456`. | `app/(auth)/verify-otp.tsx:11-12` |
| Token đặt lại mật khẩu | `?token=` trong link. 3 trạng thái `ok / expired / invalid`. | `lib/simulate.ts:136-139` |
| `CsvRow`, `CsvResult` | `{ line, club, value, errors[] }`, `{ vendor, rows }` | `lib/csv.ts:5-6` |
| `OcrField` | `{ key, raw, confidence }`. Ngưỡng độ tin cậy thấp `LOW_CONFIDENCE` = 0,8. | `lib/simulate.ts:94,102` |
| `AccountRaw` | Form Tài khoản: giữ nguyên chữ người dùng gõ. | `lib/validation.ts:190` |
| `AppState.simulateFailure` | Cờ dev: mọi lần lưu / xoá có độ trễ đều thất bại. Không phải dữ liệu người dùng. | `lib/domain.ts:96-97` |

---

## 5. Luật nghiệp vụ theo mảng

Mỗi luật có ba phần: nội dung luật; **Thông báo**, tức câu chữ lỗi hay xác nhận trên UI; và **Nguồn**.

### 5.1 Tài khoản — đăng ký, OTP, onboarding, đăng nhập, mật khẩu, hồ sơ, đăng xuất, xoá (`BR-TAIKHOAN`)

#### Vai trò và điều hướng

**BR-TAIKHOAN-01 — Có đúng 2 vai trò. Vai được chọn một lần lúc đăng ký và không đổi được.**
Người dùng chọn Người chơi hoặc HLV ở bước 1 của đăng ký, và hồ sơ lưu `role` đó. Form Tài khoản không có ô vai trò, và dữ liệu form gửi đi không chứa `role`.
- Thông báo (mô tả trên thẻ chọn vai): "Người chơi: Lưu thông số, bộ gậy, video swing và nhận góp ý từ HLV." / "Huấn luyện viên: Mời học viên, theo dõi tiến bộ và ghi chú trên từng cú swing."
- Nguồn: `lib/domain.ts:3`, `app/(auth)/register.tsx:11-14`, `lib/validation.ts:162,203-218`; handoff:27-34; tech review:126-127.

**BR-TAIKHOAN-02 — Điểm vào app chuyển hướng theo trạng thái đăng nhập và vai trò. Nhóm tab của vai này đóng với vai kia.**
- Chưa đăng nhập → `/(auth)/welcome`. Người chơi → `/(player)/home`. HLV → `/(coach)/roster`.
- Mở nhóm tab sai vai, hoặc mở khi chưa đăng nhập → đưa về `/` rồi chuyển tiếp như trên.
- Các màn cần đăng nhập (onboarding, Hồ sơ, Tài khoản, Mật khẩu, Quyền riêng tư) cũng đưa về `/` khi không có `me`.
- Thông báo: không có (chuyển hướng im lặng).
- Nguồn: `app/index.tsx:4-8`, `app/(player)/_layout.tsx:8`, `app/(coach)/_layout.tsx:8`, `app/(auth)/onboarding.tsx:24`, `app/profile.tsx:14`, `app/settings/account.tsx:34`, `app/settings/password.tsx:27`, `app/settings/privacy.tsx:34`; spec:38.

**BR-TAIKHOAN-03 — Màn chào có 2 lối vào: Tạo tài khoản và Đăng nhập. Lối "Dùng tài khoản mẫu" chỉ có ở bản dev.**
- Thông báo: tagline "Theo dõi phong độ. Kết nối HLV. Cùng tiến bộ."; nút "Tạo tài khoản", "Đăng nhập", "Dùng tài khoản mẫu" (chỉ khi `__DEV__`).
- Nguồn: `app/(auth)/welcome.tsx:13-20`; spec:63.

#### Đăng ký

**BR-TAIKHOAN-04 — Đăng ký gồm 2 bước. Bước 1 bắt buộc chọn vai. Đổi vai thì lỗi đang hiện bị xoá.**
Nút "Tiếp" bị tắt khi chưa chọn vai. Bước 2 có "Quay lại" (nút dưới form và nút back trên header): quay về bước 1 mà không mất dữ liệu đã gõ. Chọn lại vai ở bước 1 thì xoá cờ "đã bấm Tiếp", nên lỗi của vai cũ không hiện sang vai mới.
- Thông báo: Stepper "Vai trò · Bạn là ai" / "Thông tin · Hồ sơ cơ bản".
- Nguồn: `app/(auth)/register.tsx:20-24,29-30,37,40,50,79-85`; spec:65.

**BR-TAIKHOAN-05 — Lỗi form đăng ký chỉ hiện sau lần bấm "Tiếp" đầu tiên ở bước 2, theo từng trường. Hợp lệ hết mới sang màn OTP.**
- Thông báo: theo BR-TAIKHOAN-06 … -10.
- Nguồn: `app/(auth)/register.tsx:25-27,31-33`; F01:13.

**BR-TAIKHOAN-06 — Họ tên bắt buộc và được chuẩn hoá trước khi lưu.**
Bỏ khoảng trắng hai đầu, gộp khoảng trắng liên tiếp thành một (`" Lê  Văn Hải "` → `"Lê Văn Hải"`).
- Thông báo: "Bắt buộc".
- Nguồn: `lib/validation.ts:139,142`, `lib/validation.test.ts:125-128`.

**BR-TAIKHOAN-07 — Email bắt buộc, đúng định dạng, và chưa thuộc tài khoản nào (so không phân biệt hoa thường).**
Email được bỏ khoảng trắng hai đầu và lưu nguyên hoa / thường như người dùng gõ.
- Thông báo: "Bắt buộc" / "Email không hợp lệ" / "Email đã có tài khoản".
- Nguồn: `lib/validation.ts:114,140,143-145`, `lib/validation.test.ts:157-160`; F01:27.

**BR-TAIKHOAN-08 — SĐT bắt buộc: số Việt Nam 10 chữ số bắt đầu bằng 0, và chưa thuộc tài khoản nào.**
Khoảng trắng bị bỏ trước khi kiểm và trước khi lưu. Khi so trùng, SĐT đã lưu cũng được bỏ khoảng trắng. Không nhận dạng `+84`.
- Thông báo: "Bắt buộc" / "Gồm 10 số, bắt đầu bằng 0" / "Số điện thoại đã có tài khoản".
- Nguồn: `lib/validation.ts:115-120,141,146-147`, `lib/validation.test.ts:142-145,157-160`.

**BR-TAIKHOAN-09 — Mật khẩu (đăng ký, đặt lại, đổi) dài tối thiểu 8 ký tự và có ít nhất 1 chữ số. Không có luật nào khác.**
Không đòi chữ cái hay ký tự đặc biệt, không có độ dài tối đa: `12345678` là hợp lệ. Bản mock chỉ kiểm, không lưu mật khẩu: mật khẩu không đi qua URL và không nằm trong hồ sơ.
- Thông báo: "Bắt buộc" / "Tối thiểu 8 ký tự, có ít nhất 1 chữ số" (`PASSWORD_RULE`). Placeholder "Tối thiểu 8 ký tự, có chữ số".
- Nguồn: `lib/validation.ts:121-122,148-149`, `app/(auth)/register.tsx:32-33,59-67`, `lib/validation.test.ts:142-146,236-243`; plan:966.

**BR-TAIKHOAN-10 — Trường riêng theo vai.**
- Người chơi: handicap bắt buộc, 0–54, được dùng số thập phân.
- HLV: học viện / CLB bắt buộc; số năm kinh nghiệm bắt buộc, số nguyên 0–60.

Ô số đọc theo kiểu VN: dấu phẩy hay dấu chấm đều là dấu thập phân. Trường của vai kia bị bỏ qua (HLV gõ handicap rác vẫn hợp lệ).
- Thông báo: ô trống "Bắt buộc"; không phải số "Không phải số"; handicap ngoài khoảng "Trong khoảng 0–54"; số năm sai "Số nguyên 0–60"; học viện trống "Bắt buộc". Gợi ý dưới ô: "Từ 0 đến 54 — mới chơi, chưa có handicap thì nhập 54" / "Từ 0 đến 60".
- Nguồn: `lib/validation.ts:124-129,150-161`, `lib/format.ts:75-79`, `app/(auth)/register.tsx:68-75`, `lib/validation.test.ts:130-133,148-155`; handoff:87.

**BR-TAIKHOAN-11 — Bản nháp đăng ký truyền qua URL chỉ giữ các khoá được phép. Thiếu dữ liệu thì chặn bước OTP.**
Sửa link bằng tay không chèn được `verified`, `rating`, `id`, `ratePerHourVnd`, `avatarUrl`… vào hồ sơ. Vai lạ, thiếu họ tên / email / SĐT, hoặc JSON hỏng thì hiện màn lỗi.
- Thông báo: "Thiếu thông tin đăng ký" · "Vui lòng điền lại biểu mẫu đăng ký." · nút "Đăng ký lại" (thay màn bằng form đăng ký).
- Nguồn: `lib/validation.ts:166-177`, `app/(auth)/verify-otp.tsx:18,28-36`, `lib/validation.test.ts:164-177`; F01:29.

#### Xác minh OTP

**BR-TAIKHOAN-12 — Tài khoản chỉ được tạo khi nhập đúng mã OTP 6 số gửi tới SĐT đã khai. Tạo xong thì người dùng đăng nhập ngay và vào onboarding, không quay lại được form đăng ký.**
Mã được kiểm tự động khi gõ đủ 6 số, hoặc khi bấm "Xác nhận" (nút tắt khi chưa đủ 6 số). Mã đúng thì `register` làm 3 việc: thêm hồ sơ, tạo `Preferences` mặc định, đặt `sessionUserId` = hồ sơ mới. Sau đó `resetTo('/(auth)/onboarding')` xoá màn chào và form đăng ký khỏi stack.
- Thông báo: "Xác minh số điện thoại"; "Nhập mã 6 số đã gửi tới {SĐT}."; bản dev có thêm "Mã thử: 123456".
- Nguồn: `app/(auth)/verify-otp.tsx:38-42,45-57`, `lib/reducer.ts:47`, `components/StackHeader.tsx:17-20`, `packages/ds/src/ui/OtpField/OtpField.tsx:46-48`; spec:66; plan:967.

**BR-TAIKHOAN-13 — Mã sai thì báo lỗi ngay tại ô, gõ lại thì lỗi mất. "Gửi lại mã" chỉ bấm được sau 60 giây, và mỗi lần bấm thì đếm lại 60 giây.**
Bấm gửi lại thì xoá mã đang gõ và xoá lỗi. Bản mock không giới hạn số lần nhập sai hay gửi lại, và mã không có hạn.
- Thông báo: "Mã không đúng, vui lòng thử lại"; nút "Gửi lại mã sau {n} s" (tắt) → "Gửi lại mã".
- Nguồn: `app/(auth)/verify-otp.tsx:13,20-26,39,50-55,58-64`; F01:28.

#### Onboarding

**BR-TAIKHOAN-14 — Onboarding chạy ngay sau OTP, số bước theo vai.**
- Người chơi, 3 bước: Ảnh đại diện → Đơn vị đo → Mã mời từ HLV.
- HLV, 4 bước: Ảnh đại diện → Đơn vị đo → Giới thiệu nghề nghiệp → Mời học viên đầu tiên.

Có PageIndicator. Từ bước 2 có "Quay lại". Nút chính là "Tiếp"; ở bước cuối đổi thành "Để sau" và đưa về `/`.
- Thông báo: bước ảnh: người chơi "Giúp HLV và bạn bè nhận ra bạn." / HLV "Giúp học viên và bạn bè nhận ra bạn."; bước đơn vị: "Đổi lại bất cứ lúc nào trong Cài đặt."
- Nguồn: `app/(auth)/onboarding.tsx:30-34,44-47,55-92,110-122`; F01:15-17; F02:12-15.
- Lệch tài liệu: spec:67 và plan Task 4 ghi onboarding "3 bước". HLV có 4 bước vì thêm bước Giới thiệu bắt buộc theo MVP M2.5.

**BR-TAIKHOAN-15 — Ảnh đại diện không bắt buộc. Ở onboarding, chọn hay bỏ ảnh được lưu vào hồ sơ ngay lúc bấm.**
"Chọn ảnh" / "Đổi ảnh" lấy ảnh mẫu kế tiếp (xoay vòng). "Dùng chữ tắt" xoá ảnh. Không có ảnh thì Avatar hiện chữ tắt.
- Thông báo: nút "Chọn ảnh" / "Đổi ảnh" / "Dùng chữ tắt".
- Nguồn: `app/(auth)/onboarding.tsx:28,36-39`, `lib/simulate.ts:141-144`, `lib/format.ts:89`; MVP:16.
- Lệch tài liệu: MVP M2.5 ghi "Avatar bắt buộc". Code để tuỳ chọn (báo cáo:84, mục c).

**BR-TAIKHOAN-16 — Đơn vị đo chọn ở onboarding (Mét / Yard) được lưu vào tuỳ chọn ngay lúc chạm. Mặc định Mét.** Áp dụng như BR-SOLIEU-30.
- Thông báo: "Mét · Khoảng cách theo mét (m)" / "Yard · Khoảng cách theo yard (yd)".
- Nguồn: `app/(auth)/onboarding.tsx:13-16,25,49-51`, `lib/mock.ts:7`, `app/settings/units.tsx:16,34`; spec D9.

**BR-TAIKHOAN-17 — HLV phải viết giới thiệu nghề nghiệp 20–300 ký tự (đếm sau khi bỏ khoảng trắng hai đầu) mới qua được bước 3. Giới thiệu chỉ được lưu khi hợp lệ.**
Lỗi chỉ hiện sau lần bấm "Tiếp" đầu tiên ở bước này. Ô nhập chặn cứng ở 300 ký tự.
- Thông báo: "Bắt buộc" / "Tối thiểu 20 ký tự" / "Tối đa 300 ký tự"; dòng đếm "{n}/300 ký tự · tối thiểu 20".
- Nguồn: `app/(auth)/onboarding.tsx:23,29,57-77`, `lib/validation.ts:179-188`, `lib/validation.test.ts:244-249`; F02:12-14; MVP:16.

**BR-TAIKHOAN-18 — Bước cuối onboarding mở lối kết nối theo vai.**
- Người chơi bấm "Nhập mã" → `/connect/accept`.
- HLV bấm "Tạo mã mời" → `/connect/invite`.

Cả hai lối đều thay màn onboarding, nên không quay lại onboarding được.
- Thông báo: người chơi "Bạn có mã mời từ HLV?" · "Nhập mã để kết nối — HLV sẽ xem được thông số, swing và bộ gậy của bạn."; HLV "Mời học viên đầu tiên" · "Tạo mã mời có hạn 7 ngày và gửi cho học viên."
- Nguồn: `app/(auth)/onboarding.tsx:27,81-91`; plan:968.

**BR-TAIKHOAN-19 — Không có cổng onboarding.** Người dùng đã đăng nhập (sau OTP) mà thoát app giữa chừng thì lần sau vào thẳng tab chính, không làm tiếp các bước còn lại. Hệ quả: HLV bỏ ngang ở bước Giới thiệu sẽ có hồ sơ thiếu `bio`. Hồ sơ đó chỉ bị bắt nhập giới thiệu khi HLV bấm Lưu ở màn Tài khoản (BR-TAIKHOAN-26).
- Thông báo: không có.
- Nguồn: `app/index.tsx:6-7`; F01:42; F02:42.
- Lệch tài liệu: tech review:131 muốn wizard "cho phép resume". Code lưu từng bước nhưng không có resume.

#### Đăng nhập

**BR-TAIKHOAN-20 — Đăng nhập bằng email (không phân biệt hoa thường) hoặc SĐT (so sau khi bỏ khoảng trắng), kèm mật khẩu. Thông báo sai không nói rõ trường nào sai.**
Cả hai ô đều bắt buộc. Lỗi "Bắt buộc" chỉ hiện sau lần bấm đầu tiên. Bản mock nhận mọi mật khẩu dài từ 6 ký tự. Đăng nhập thành công thì đặt `sessionUserId` rồi thay màn bằng `/`, từ đó chuyển hướng theo vai (BR-TAIKHOAN-02). Gõ lại bất kỳ ô nào thì lỗi đăng nhập mất.
- Thông báo: "Email/SĐT hoặc mật khẩu không đúng"; "Bắt buộc"; link "Quên mật khẩu?", "Chưa có tài khoản? Tạo tài khoản".
- Nguồn: `app/(auth)/login.tsx:17-27,33,38-39,49-50,60-63`; plan:965; F03:12,46.

#### Quên, đặt lại và đổi mật khẩu

**BR-TAIKHOAN-21 — Quên mật khẩu chỉ nhận email. Email đúng định dạng thì màn luôn báo "đã gửi link", không cho biết email đó có tài khoản hay không.**
- Thông báo: "Bắt buộc" / "Email không hợp lệ"; sau khi gửi: "Kiểm tra hộp thư" · "Đã gửi link đặt lại mật khẩu tới {email}. Link có hiệu lực 30 phút." · "Về đăng nhập"; bản dev có thêm "Mở link (thử)".
- Nguồn: `app/(auth)/forgot-password.tsx:14-15,19-29,34-43`; F03:13-14,48; MVP:14.

**BR-TAIKHOAN-22 — Link đặt lại mật khẩu chỉ mở form khi token hợp lệ. Token hết hạn, sai hoặc thiếu thì màn yêu cầu gửi lại link.**
Token có hiệu lực 30 phút (theo câu chữ UI) và phân biệt hoa / thường. Deep link: `gramgolf://reset-password?token=…`.
- Thông báo: hết hạn: "Link đã hết hạn" · "Link đặt lại mật khẩu chỉ dùng được trong 30 phút. Gửi lại link mới để tiếp tục."; sai / thiếu: "Link không hợp lệ" · "Link bị thiếu hoặc sai. Mở link mới nhất trong email, hoặc gửi lại link."; nút "Gửi lại link" (mở lại màn Quên mật khẩu).
- Nguồn: `app/(auth)/reset-password.tsx:9-10,18,26-41`, `lib/simulate.ts:136-139`, `lib/simulate.test.ts:119-122`; F03:6,22-23; MVP:15.

**BR-TAIKHOAN-23 — Đặt lại mật khẩu: mật khẩu mới theo BR-TAIKHOAN-09 và ô nhập lại phải khớp. Thành công thì sang màn Đăng nhập kèm thông báo, và xoá stack để nút back không quay lại các màn quên / đặt lại.**
- Thông báo: "Bắt buộc" / "Tối thiểu 8 ký tự, có ít nhất 1 chữ số" / "Mật khẩu nhập lại không khớp"; màn Đăng nhập hiện "Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới." (ẩn khi lần đăng nhập sau đó thất bại).
- Nguồn: `app/(auth)/reset-password.tsx:19-24,48-75`, `lib/validation.ts:253-257`, `app/(auth)/login.tsx:16,32`; F03:15-16.

**BR-TAIKHOAN-24 — Đổi mật khẩu (Cài đặt › Mật khẩu) cần 3 ô.**
- Mật khẩu hiện tại: bắt buộc.
- Mật khẩu mới: theo BR-TAIKHOAN-09, và phải khác mật khẩu hiện tại.
- Nhập lại: phải khớp mật khẩu mới.

Bản mock không đối chiếu mật khẩu hiện tại với server và không có nhánh lỗi lưu (ghi ngay, BR-CAIDAT-26). Đổi thành công thì nút "Đổi mật khẩu" bị tắt, hiện toast rồi quay lại. Nút hiện / ẩn mật khẩu áp cho cả 3 ô.
- Thông báo: "Bắt buộc" / "Tối thiểu 8 ký tự, có ít nhất 1 chữ số" / "Phải khác mật khẩu hiện tại" / "Mật khẩu nhập lại không khớp"; dòng tổng "Chưa đổi: {n} trường cần sửa."; toast "Đã đổi mật khẩu".
- Nguồn: `lib/validation.ts:223-229`, `app/settings/password.tsx:11-17,28-30,48-51,57-68`, `lib/validation.test.ts:210-216`; F03:18-19.

#### Hồ sơ (màn Tài khoản)

**BR-TAIKHOAN-25 — Ai cũng chỉ sửa được hồ sơ của chính mình, qua Hồ sơ › "Chỉnh sửa hồ sơ" (`/settings/account`); HLV vào được cả từ tab Hồ sơ. Email, vai, `rating`, `verified` không sửa được.** *(Gộp BR-CAIDAT-02.)*
Form chỉ ghi vào hồ sơ có `id` của người đang đăng nhập. Ô hiện theo vai: người chơi có Handicap và CLB; HLV có Học viện, Số năm kinh nghiệm và Đơn giá. Form không có ô email, vai, đánh giá hay xác minh, và không gửi các trường đó đi, nên giá trị cũ được giữ.
- Thông báo: nút "Chỉnh sửa hồ sơ"; dòng Cài đặt "Tài khoản · Tên, số điện thoại, giới thiệu". Nhãn ô: "Họ tên", "Số điện thoại", "Giới thiệu", "Handicap", "CLB / sân tập (tuỳ chọn)", "Học viện / CLB", "Số năm kinh nghiệm", "Đơn giá (đ/giờ, tuỳ chọn)".
- Nguồn: `app/settings/account.tsx:34-36,45-48,70-93`, `app/profile.tsx:35`, `app/(coach)/me.tsx:26`, `app/settings/index.tsx:8`, `lib/reducer.ts:48`, `lib/validation.ts:190-221`; F12 bước 02, 11.

**BR-TAIKHOAN-26 — Trường chung khi sửa hồ sơ.** *(Gộp BR-CAIDAT-03, BR-CAIDAT-04.)*
- Họ tên: bắt buộc, chuẩn hoá như lúc đăng ký.
- SĐT: theo BR-TAIKHOAN-08, không trùng hồ sơ *khác*; giữ nguyên SĐT của mình vẫn hợp lệ. Đổi SĐT **không** phải xác minh OTP lại.
- Giới thiệu: HLV bắt buộc 20–300 ký tự (đếm sau khi bỏ khoảng trắng hai đầu); người chơi tuỳ chọn, tối đa 300. Ô nhập không cho gõ quá 300. Để trống thì giá trị cũ bị xoá.
- Thông báo: "Bắt buộc" / "Gồm 10 số, bắt đầu bằng 0" / "Số điện thoại đã có tài khoản" / "Tối thiểu 20 ký tự" / "Tối đa 300 ký tự". Gợi ý ô Giới thiệu: HLV "{n}/300 ký tự · tối thiểu 20" (đếm trực tiếp), người chơi "Tuỳ chọn, tối đa 300 ký tự".
- Nguồn: `lib/validation.ts:116-120,179-188,193-203`, `app/settings/account.tsx:35,70-81`, `lib/validation.test.ts:196-200,244-254`; F12:21,52; MVP:32.

**BR-TAIKHOAN-27 — Trường theo vai khi sửa hồ sơ.** *(Gộp BR-CAIDAT-05, BR-CAIDAT-06.)*
- **Người chơi:** handicap bắt buộc, 0–54, được dùng số thập phân và viết kiểu VN (`13,5`). Không nhận số âm (không có "plus handicap"). CLB / sân tập tuỳ chọn.
- **HLV:** học viện bắt buộc. Số năm kinh nghiệm bắt buộc, nguyên 0–60. Đơn giá tuỳ chọn: trước khi kiểm, bỏ dấu chấm và khoảng trắng, nên `450.000`, `450 000` hay `450000` đều được. Phần còn lại chỉ được gồm chữ số, tối đa 10.000.000 đ; số 0 hợp lệ. Có dấu phẩy (`450,000`), có chữ (`45k`) hay số âm đều không hợp lệ.

Trường tuỳ chọn (giới thiệu, CLB, đơn giá) để trống thì giá trị cũ bị xoá.
- Thông báo: "Bắt buộc" / "Trong khoảng 0–54" / "Số nguyên 0–60" / "Không phải số" / "Số tiền không hợp lệ" / "Tối đa 10.000.000 đ". Gợi ý "Từ 0 đến 54", "Từ 0 đến 60", "Tối đa 10.000.000 đ". Placeholder "VD: 18,5", "VD: Sân tập Mỹ Đình".
- Nguồn: `lib/validation.ts:123-129,189-192,205-218`, `app/settings/account.tsx:27,82-93`, `lib/validation.test.ts:184-206`.

**BR-TAIKHOAN-28 — Lưu màn Tài khoản.** *(Gộp BR-CAIDAT-07, BR-CAIDAT-08.)*
- **Ảnh đại diện:** "Chọn ảnh" / "Đổi ảnh" lấy ảnh mẫu kế tiếp, "Dùng chữ tắt" bỏ ảnh. Cả hai chỉ đổi bản xem trước; ảnh chỉ được ghi khi bấm "Lưu", cùng các trường khác (khác onboarding, BR-TAIKHOAN-15). Không có ảnh thì Avatar hiện chữ tắt của tên đang gõ; tên đang trống thì lấy tên đã lưu.
- **Lỗi:** chỉ hiện sau lần Lưu đầu tiên, từ đó cập nhật theo từng phím gõ, kèm dòng tổng số trường lỗi. Form còn lỗi thì không ghi gì.
- **Ghi:** form hợp lệ thì chạy ghi giả lập (BR-CAIDAT-25). Đang lưu hoặc đã lưu xong thì nút "Lưu" bị tắt. Lưu xong thì toast rồi quay lại; không có lịch sử điều hướng thì về `/profile`. Lưu thất bại thì form giữ nguyên, toast có nút "Thử lại", bấm vào thì chạy lại toàn bộ Lưu, kể cả bước kiểm.
- **Rời màn:** không có hộp thoại hỏi; thay đổi chưa lưu bị mất. Rời màn khi đang lưu thì lần lưu đó bị huỷ.
- Thông báo: "Chọn ảnh" (chưa có ảnh) / "Đổi ảnh" (đã có); "Dùng chữ tắt" chỉ hiện khi đang có ảnh. "Chưa lưu: {n} trường cần sửa."; "Đang lưu…"; toast "Đã lưu hồ sơ"; lỗi: "Lưu thất bại" · "Mất kết nối — thông tin tài khoản chưa được lưu." · "Thử lại".
- Nguồn: `app/settings/account.tsx:13,29-53,62-68,96-112`, `components/Feedback.tsx:19-54`, `lib/simulate.ts:134,141-144`; F12:12-13; F13 story 08b.

**BR-TAIKHOAN-29 — `rating` và `verified` chỉ có trong dữ liệu mẫu.** Hồ sơ HLV chỉ hiện mục Đánh giá / Học phí / Kinh nghiệm khi có giá trị, và chỉ hiện huy hiệu "Đã xác minh" khi `verified`. HLV mới đăng ký không có đánh giá và không có huy hiệu.
- Thông báo: "Đánh giá {x,x}", "{n} năm", "{giá} đ/giờ", huy hiệu "Đã xác minh".
- Nguồn: `components/CoachSummary.tsx:6-13,28`, `lib/validation.ts:166-173`, `lib/mock.ts:16-17`; F02:40; tech review:128-129.

#### Đăng xuất và xoá tài khoản

**BR-TAIKHOAN-30 — Cả 2 vai đăng xuất ở màn Hồ sơ (`/profile`, mở bằng avatar trên header tab), qua Dialog xác nhận.** Xác nhận thì xoá phiên (`sessionUserId = null`), xoá stack và về màn chào. Tab Hồ sơ của HLV (`/(coach)/me`) không có nút Đăng xuất. Đăng xuất không xoá dữ liệu nào trong bộ nhớ.
- Thông báo: nút "Đăng xuất"; Dialog "Đăng xuất?" · "Bạn sẽ cần đăng nhập lại để tiếp tục." · "Đăng xuất" (nút huỷ diệt) / "Huỷ".
- Nguồn: `app/profile.tsx:13,37,40-53`, `lib/reducer.ts:46`, `components/TabHeader.tsx:46`, `app/(coach)/me.tsx:24-31`; F03:20-21; spec:94.

**BR-TAIKHOAN-31 — Cả 2 vai xoá tài khoản ở Cài đặt › Quyền riêng tư, qua Dialog 2 bước. Nội dung bước 1 khác nhau theo vai. Bản mock chỉ đăng xuất; dữ liệu vẫn nằm trong bộ nhớ.** *(Gộp BR-CAIDAT-14.)*
Huỷ ở bước nào cũng đóng Dialog. Bước cuối: đóng Dialog → `signOut` → `resetTo('/')` → màn chào. Thao tác ghi ngay, không qua ghi giả lập.
- Thông báo: mục "Tài khoản · Xoá vĩnh viễn hồ sơ và toàn bộ dữ liệu của bạn trên GramGolf." · nút "Xoá tài khoản".
  - Bước 1, tiêu đề "Xoá tài khoản?". Nội dung với người chơi: "Hồ sơ, thông số, swing, bộ gậy, bài đăng và kết nối với HLV sẽ bị xoá vĩnh viễn."; với HLV: "Hồ sơ, bài đăng và kết nối với học viên sẽ bị xoá vĩnh viễn." Nút "Tiếp tục".
  - Bước 2: "Xác nhận lần cuối" · "Không thể hoàn tác. Bạn sẽ được đăng xuất ngay sau khi xoá." · "Xoá vĩnh viễn".
  - Cả hai bước có nút "Huỷ".
- Nguồn: `app/settings/privacy.tsx:13-25,31,84-106`, `app/settings/index.tsx:27`; F12:23-24,53.
- Lệch tài liệu: Dialog nói "xoá vĩnh viễn… Không thể hoàn tác", nhưng bản mock chỉ đăng xuất (F12:53).

#### Bản dev

**BR-TAIKHOAN-32 — Đổi tài khoản không cần mật khẩu chỉ có ở bản dev.** Có 3 lối: Cài đặt › Dev; tham số URL `?as=<userId>` (chỉ đăng nhập khi id có trong dữ liệu, và mỗi giá trị chỉ một lần); nút "Dùng tài khoản mẫu". Bản phát hành mở deep link `/settings/dev` thì bị đưa về `/`. Chi tiết màn Dev ở BR-CAIDAT-28.
- Thông báo: "Dev · Chỉ có ở bản phát triển".
- Nguồn: `app/_layout.tsx:14-24`, `app/settings/dev.tsx:36,41,88-91`, `app/settings/index.tsx:13`, `app/(auth)/welcome.tsx:20`; spec D13; báo cáo:66.

### 5.2 Kết nối HLV – học viên và quyền xem (`BR-KETNOI`)

#### A. Mã mời

**BR-KETNOI-01 — Chỉ HLV đã đăng nhập mới tạo được mã mời.** Vai khác mở `connect/invite` thì bị chuyển về `/`. Lối vào: roster › Lời mời › "Mời học viên"; trạng thái trống của roster; bước cuối onboarding HLV ("Mời học viên đầu tiên").
- Thông báo: câu giới thiệu trên màn "Tạo mã mời có hạn 7 ngày rồi gửi cho học viên. Học viên nhập mã ở tab HLV — kết nối xong bạn xem được thông số, swing, bộ gậy và thể lực của họ."
- Nguồn: `app/connect/invite.tsx:33,92-94`; `app/(coach)/roster.tsx:44,203,208-214`; `app/(auth)/onboarding.tsx:87-91`; spec D5, spec:84.

**BR-KETNOI-02 — Mỗi lần HLV bấm "Tạo mã mời" (hoặc "Tạo mã khác"), hệ thống sinh một mã mới.**
- Mã gồm 6 ký tự lấy ngẫu nhiên từ 32 ký tự (bỏ O, I, 0, 1 để đọc không nhầm).
- Trùng một mã đã có trong hệ thống thì sinh lại.
- Hạn đúng 7 ngày tính từ lúc tạo. Tới đúng mốc `expiresAt` là hết hạn: còn 1 giây thì vẫn `ok`.
- Mã mới đứng đầu danh sách mã đang chờ, và thẻ mã hiện ngay ở đầu màn.
- Nguồn: `lib/ids.ts:7-15`; `lib/reducer.ts:84`; `app/connect/invite.tsx:42-46`; `lib/ids.test.ts:8-26`; spec:84.

**BR-KETNOI-03 — Một HLV được giữ nhiều mã còn hạn cùng lúc, không giới hạn số lượng.** Bấm "Tạo mã khác" không thu hồi mã đang hiện.
- Thông báo: nút ghi "Tạo mã mời" khi chưa có thẻ mã, "Tạo mã khác" khi đã có.
- Nguồn: `app/connect/invite.tsx:96`; `lib/reducer.ts:84`.

**BR-KETNOI-04 — "Mã đang chờ" của một HLV là mã thoả cả 4 điều kiện: của chính HLV đó, chưa thu hồi, chưa dùng, còn hạn. Danh sách xếp mới → cũ.** Thứ tự này có được vì mã mới được chèn vào đầu mảng (`createInvite`); selector `pendingInvites` không tự sắp, backend phải `ORDER BY created_at DESC`.
- Danh sách hiện ở `connect/invite` (mục "Lời mời đang chờ") và roster › Lời mời (mục "Mã mời đang chờ").
- Mã hết hạn, bị thu hồi hoặc đã dùng thì tự rời danh sách, và thẻ mã ở đầu màn cũng ẩn theo.
- Chạm một mã thì thẻ của mã đó hiện lại để sao chép / chia sẻ lần nữa. Ở roster, chạm mã mở `connect/invite?code=<mã>`.
- Thông báo: khi trống: `connect/invite` "Chưa có lời mời nào đang chờ.", roster "Chưa có mã mời nào đang chờ.". Chú thích khi có mã: "Mã còn hạn, chưa có học viên dùng" (ở roster thêm "— chạm để sao chép hoặc chia sẻ lại").
- Nguồn: `lib/selectors.ts:22`; `app/connect/invite.tsx:34-35,124-154`; `app/(coach)/roster.tsx:34,187-200`; `lib/reducer.test.ts:57-63`.

**BR-KETNOI-05 — Chia sẻ mã.**
- Link mời có dạng `https://gramgolf.app/i/<MÃ>`. "Sao chép" chép link vào clipboard.
- "Chia sẻ" mở ShareSheet. Danh sách người nhận gồm người chơi chưa là học viên active của HLV, trừ chính HLV và những người đã chặn nhau với HLV.
- "Gửi" trong sheet chỉ chép lời nhắn kèm link vào clipboard, chưa gửi thật cho ai.
- Thông báo: toast "Đã sao chép link mời" (Sao chép), "Đã sao chép lời mời để gửi" (Gửi). Nút Sao chép trong sheet đổi thành "Đã sao chép".
- Nguồn: `app/connect/invite.tsx:15-16,48,55-58,72-89,157-185`; `lib/selectors.ts:84-85`.

**BR-KETNOI-06 — HLV thu hồi mã đang chờ bằng nút "Thu hồi" trên dòng mã, qua bước xác nhận.**
- Mã nhận `revoked = true` và rời danh sách chờ.
- Người nhập mã đó sau này gặp lỗi `revoked` và không tạo được kết nối.
- Kết nối đã tạo từ trước không bị ảnh hưởng. Không ai nhận thông báo.
- Reducer không kiểm người thu hồi có phải chủ mã (chỉ UI chặn: màn chỉ liệt kê mã của chính HLV đó).
- Thông báo: Dialog Warning "Thu hồi mã <MÃ>?" · "Học viên sẽ không dùng được mã này để kết nối nữa. Các kết nối đã có không bị ảnh hưởng." · "Thu hồi" (huỷ diệt) / "Giữ mã"; toast "Đã thu hồi mã <MÃ>".
- Nguồn: `lib/reducer.ts:85`; `app/connect/invite.tsx:135-146,186-201`; `lib/reducer.test.ts:57-63`.

**BR-KETNOI-07 — Chỉ người chơi nhập được mã mời.** Vai khác mở `connect/accept` thì bị chuyển về `/`. Lối vào: tab HLV (nút ở trạng thái trống, hoặc "Nhập mã mời" khi đã có HLV); Tổng quan khi người chơi chưa có HLV; bước cuối onboarding người chơi.
- Thông báo: "Nhập mã 6 ký tự HLV gửi cho bạn. Sau khi kết nối, HLV xem được thông số, swing, bộ gậy và thể lực của bạn."
- Nguồn: `app/connect/accept.tsx:31,58-60`; `app/(player)/coach.tsx:38,110-118,189`; `app/(player)/home.tsx:81,130-136`; `app/(auth)/onboarding.tsx:81-86`.

**BR-KETNOI-08 — Ô nhập mã tự chuẩn hoá chữ gõ hoặc dán.** Chuỗi có link dạng `…/i/<mã>` thì lấy phần mã. Sau đó đổi in hoa, bỏ mọi ký tự ngoài A–Z và 0–9, cắt còn tối đa 6 ký tự. Ô nhận cả 0, 1, O, I (mã mẫu có dùng). Mỗi lần sửa ô thì lỗi cũ và kết quả kiểm cũ bị xoá.
- Thông báo: chú thích "Dán cả link mời cũng được", placeholder "Ví dụ: AB23CD".
- Nguồn: `lib/format.ts:71-73`; `app/connect/accept.tsx:61-78`; `lib/format.test.ts:107-114`.

**BR-KETNOI-09 — Bấm "Kiểm tra" (hoặc Enter) khi ô chưa đủ 6 ký tự thì báo lỗi ngay, không đem mã đi kiểm.**
- Thông báo: ô trống "Nhập mã mời"; 1–5 ký tự "Mã mời gồm 6 ký tự". Ô viền đỏ, lỗi hiện bằng AlertMessage (Negative).
- Nguồn: `app/connect/accept.tsx:33-40,53,76,79`.

**BR-KETNOI-10 — Mã được kiểm theo thứ tự cố định và dừng ở điều kiện đầu tiên khớp.**

| Thứ tự | Điều kiện | Kết quả | Câu hiện cho người chơi (AlertMessage) |
|---|---|---|---|
| 1 | Không có mã này, **hoặc** HLV chủ mã và người chơi đã chặn nhau (chiều nào cũng tính) | `not_found` (cố ý không lộ việc bị chặn) | "Mã không tồn tại" — Negative, ô đỏ |
| 2 | Mã đã bị thu hồi | `revoked` | "Mã đã bị thu hồi" — Negative |
| 3 | Mã đã được dùng | `used` | "Mã đã được sử dụng" — Negative |
| 4 | `expiresAt ≤ now` | `expired` | "Mã đã hết hạn — xin HLV mã mới" — Negative |
| 5 | Người chơi đang có kết nối **active** với HLV chủ mã | `already_connected` | "Bạn đã kết nối với HLV này" — Info, ô **không** đỏ |
| 6 | Không rơi vào trường hợp nào ở trên | `ok` | Thẻ xem trước HLV (BR-KETNOI-11) |

Kết nối `pending` với HLV chủ mã không làm mã thành `already_connected`.
- Nguồn: `lib/selectors.ts:12-21`; `app/connect/accept.tsx:15-21,53,76`; `lib/reducer.test.ts:17-43`; `lib/ids.test.ts:24-25`; báo cáo:37 (#8); F04:28-32.

**BR-KETNOI-11 — Mã hợp lệ thì màn hiện thẻ xem trước HLV: avatar, tên, học viện, đánh giá, kinh nghiệm, học phí.** Kèm câu báo trước vai HLV sẽ nhận và nút "Chấp nhận kết nối".
- Thông báo: nhãn "HLV mời bạn kết nối". Người chơi chưa có HLV chính: "Đây sẽ là HLV chính của bạn. Bạn huỷ kết nối được bất cứ lúc nào trong tab HLV." Đã có: "Bạn đã có HLV chính — HLV này là HLV phụ, đổi HLV chính trong tab HLV. Huỷ kết nối được bất cứ lúc nào."
- Nguồn: `app/connect/accept.tsx:41-42,80-93`; `components/CoachSummary.tsx:6`.

**BR-KETNOI-12 — Bấm "Chấp nhận kết nối" thì mã được kiểm lại ngay lúc đó trên màn, rồi kiểm thêm một lần trong reducer.** Kết quả không còn `ok` (hoặc người dùng không phải người chơi) thì state giữ nguyên, mã không bị tiêu, và màn hiện lỗi mới. Kết quả `ok` thì hệ thống làm 6 việc trong **cùng một bước**:
1. Tạo kết nối `active` ngay, không cần HLV duyệt.
2. `isPrimary = true` nếu người chơi **chưa có HLV chính active**, ngược lại `false`.
3. `invitedAt` = ngày tạo mã, `acceptedAt` = lúc chấp nhận.
4. Ghi `usedBy` vào mã. Mã chỉ dùng được một lần và vẫn ở trạng thái "đã dùng" cả khi kết nối sau này bị huỷ.
5. Đóng mọi lời mời / yêu cầu `pending` của **đúng cặp** HLV – người chơi này: chuyển `revoked` và ghi `revokedAt`.
6. Gửi thông báo `invite_accepted` cho HLV chủ mã.

Đã kết nối xong thì ô mã chuyển sang chỉ đọc, nút bị khoá, Enter không kiểm lại. Hết toast thì app về tab HLV.
- Thông báo: toast "Đã kết nối với <tên HLV>", dòng phụ "HLV chính của bạn" hoặc "HLV phụ — đổi HLV chính trong tab HLV".
- Nguồn: `lib/reducer.ts:86-98`; `app/connect/accept.tsx:34,43-51,75,89,95-101`; `lib/reducer.test.ts:10-16,28-35,44-47,248-255`; spec D5.

#### B. Lời mời và yêu cầu kết nối trong app (hai chiều)

**BR-KETNOI-13 — HLV tìm người chơi để mời ở mục "Mời học viên cụ thể" (màn `connect/invite`).** Một người chơi hiện trong kết quả khi thoả đủ 4 điều kiện:
- có `role = 'player'` (HLV không bao giờ có trong kết quả);
- **chưa có kết nối mở** (`pending` hoặc `active`) với HLV này;
- hai bên không chặn nhau;
- khớp ít nhất một cách: tên, so không dấu (đ = d) và chứa chuỗi tìm; email, so không phân biệt hoa thường và chứa chuỗi tìm; SĐT, khi chuỗi tìm có **từ 3 chữ số trở lên** (chỉ so phần chữ số).

Ô tìm trống thì không hiện kết quả. Người chơi từng có kết nối đã huỷ thì mời lại được.
- Thông báo: placeholder "Tên, email hoặc số điện thoại". Không có kết quả: "Không có người chơi phù hợp — hoặc người đó đã kết nối hoặc đang có lời mời / yêu cầu kết nối chờ trả lời (xem Học viên › Lời mời)."
- Nguồn: `lib/selectors.ts:83,105-118`; `app/connect/invite.tsx:98-123`; `lib/selectors.test.ts:104-113`.
- Ghi chú: tìm khớp một phần theo email / SĐT chỉ dùng cho dữ liệu mẫu. Backend thật phải **khớp chính xác** (báo cáo:43 #14; F04:79).

**BR-KETNOI-14 — Gửi lời mời hoặc yêu cầu (`requestConnection`) tạo một kết nối `pending` với `isPrimary = false`, `requestedBy` = bên gửi, `invitedAt` = lúc gửi. Bên nhận nhận thông báo `connect_request`.**
Hai chiều gửi:
- HLV gửi lời mời cho người chơi, từ kết quả tìm ở BR-KETNOI-13;
- người chơi gửi yêu cầu cho HLV, từ hồ sơ HLV (`coaches/[id]`).

Lệnh bị **bỏ qua, state không đổi** khi: `coachId` không phải HLV hoặc `playerId` không phải người chơi; cặp đã có kết nối mở (xét cả hai chiều); hai bên đang chặn nhau. Kết nối đã bị từ chối hay đã huỷ thì gửi lại được.
- Thông báo: phía HLV có toast "Đã gửi lời mời tới <tên>", và người đó rời khỏi kết quả tìm. Phía người chơi, hồ sơ HLV đổi sang InlineMessage "Đã gửi yêu cầu kết nối — chờ HLV duyệt." kèm nút "Huỷ yêu cầu" (không có toast).
- Nguồn: `lib/reducer.ts:159-165`; `app/connect/invite.tsx:37-41`; `app/coaches/[id].tsx:44,63-68`; `lib/reducer.test.ts:208-229,256-263`.

**BR-KETNOI-15 — Trên hồ sơ HLV (`coaches/[id]`), cụm nút kết nối chỉ hiện khi người xem là người chơi, HLV này chưa là HLV active của họ, và hai bên không chặn nhau.**

| Tình huống | Hồ sơ hiện |
|---|---|
| Người chơi đã gửi yêu cầu, đang chờ | Thông báo đã gửi + nút "Huỷ yêu cầu" |
| HLV đang mời người chơi | Nút "Chấp nhận" / "Từ chối" ngay trên hồ sơ |
| Chưa có kết nối mở | Nút "Gửi yêu cầu kết nối" + câu báo trước vai |
| HLV đã là HLV active của người chơi | Tag "HLV của bạn" (không có cụm nút) |

- Thông báo: "<tên HLV> mời bạn kết nối — nhận lời thì là HLV chính / HLV phụ của bạn."; "Bạn đã có HLV chính — HLV này duyệt thì thành HLV phụ." hoặc "HLV duyệt thì đây là HLV chính của bạn."
- Nguồn: `app/coaches/[id].tsx:38-45,55,63-88`.

**BR-KETNOI-16 — Danh sách chờ của một người dùng gồm các kết nối `pending` mà người đó là một bên, bỏ các cặp đang chặn nhau, xếp mới → cũ theo `invitedAt`.** Danh sách chia làm `incoming` (bên kia gửi, chờ mình trả lời) và `outgoing` (mình gửi, chờ bên kia).

| Vai | Nơi hiện | incoming | outgoing |
|---|---|---|---|
| Người chơi | Tab HLV | "Lời mời từ HLV" (Chấp nhận / Từ chối) | "Yêu cầu đã gửi" (Huỷ yêu cầu) |
| HLV | Roster › Lời mời | "Yêu cầu từ học viên" (Duyệt / Từ chối) | "Lời mời đã gửi" (Huỷ lời mời) |

Roster › Lời mời còn có mục "Mã mời đang chờ" và nút "Mời học viên". Số trên nhãn "Lời mời" = số mã đang chờ + số incoming + số outgoing. Ở roster, chạm một dòng lời mời / yêu cầu mở **hồ sơ công khai** (`users/[id]`), không mở dữ liệu riêng.
- Thông báo: dòng phía người chơi "Mời bạn kết nối · <thời gian> · nhận lời → HLV chính/phụ" / "Bạn gửi yêu cầu · <thời gian> · chờ HLV duyệt". Dòng phía HLV "Muốn kết nối · <thời gian> · bạn sẽ là HLV chính/phụ" / "Bạn mời · <thời gian> · chờ học viên trả lời".
- Nguồn: `lib/selectors.ts:96-104`; `app/(player)/coach.tsx:46,59-107`; `app/(coach)/roster.tsx:35-36,75-114,158-205`; `lib/selectors.test.ts:99-103`.

**BR-KETNOI-17 — Chỉ trả lời được khi kết nối còn `pending` và hai bên không chặn nhau; ngoài ra state không đổi.**
- **Từ chối:** kết nối → `declined`, ghi `declinedAt`. Bên gửi **không** nhận thông báo. Quyền xem không mở.
- **Chấp nhận / Duyệt:** kết nối → `active`, ghi `acceptedAt`. Vai chính / phụ được xét **lúc kích hoạt**, không phải lúc gửi: người chơi chưa có HLV chính thì đây là HLV chính, có rồi thì là phụ. Bên gửi nhận `invite_accepted`.
- Reducer không kiểm người trả lời có đúng là bên nhận (chỉ UI chặn: nút chỉ hiện ở dòng incoming).
- Thông báo: người chơi: toast "Đã kết nối với <tên> — HLV chính" (hoặc "— HLV phụ"), "Đã từ chối lời mời của <tên>". HLV: toast "Đã duyệt <tên>", "Đã từ chối yêu cầu của <tên>". Trên hồ sơ HLV, Chấp nhận / Từ chối không có toast.
- Nguồn: `lib/reducer.ts:166-178`; `app/(player)/coach.tsx:52-58`; `app/(coach)/roster.tsx:38-41`; `app/coaches/[id].tsx:45`; `lib/reducer.test.ts:230-270`.

**BR-KETNOI-18 — Bên gửi huỷ được lời mời / yêu cầu đang chờ: kết nối → `revoked`, ghi `revokedAt`.** Không có hộp thoại xác nhận, không báo bên kia. Sau khi huỷ, mọi lần trả lời đều không có tác dụng. Reducer `revokeConnection` không kiểm người gọi có phải bên gửi, cũng không kiểm trạng thái hiện tại của kết nối (chỉ UI chặn; áp cả cho huỷ kết nối active ở BR-KETNOI-24/25).
- Thông báo: tab HLV của người chơi: toast "Đã huỷ yêu cầu gửi <tên>". Roster: toast "Đã huỷ lời mời gửi <tên>". Nút "Huỷ yêu cầu" trên hồ sơ HLV không có toast.
- Nguồn: `lib/reducer.ts:99`; `app/(player)/coach.tsx:78-89`; `app/(coach)/roster.tsx:99-110`; `app/coaches/[id].tsx:67`; `lib/reducer.test.ts:283-289`.

**BR-KETNOI-19 — Mỗi cặp HLV – người chơi có tối đa một kết nối mở.** Hệ quả:
- không gửi được lời mời / yêu cầu thứ hai, kể cả theo chiều ngược lại;
- người chơi nhập mã của một HLV đang có lời mời / yêu cầu chờ với mình thì kết nối chờ đó tự đóng, chỉ còn 1 kết nối active;
- trả lời lời mời cũ sau đó không đổi gì.
- Nguồn: `lib/selectors.ts:93-95`; `lib/reducer.ts:94,161`; `lib/reducer.test.ts:221-225,248-255`; F04:75.

#### C. HLV chính và HLV phụ

**BR-KETNOI-20 — Một người chơi kết nối active được với nhiều HLV cùng lúc, nhưng có tối đa 1 HLV chính.** Mỗi lần một kết nối được kích hoạt (bằng mã, Chấp nhận hay Duyệt):
- chưa có HLV chính active → kết nối mới thành HLV chính, **kể cả khi người chơi đang có HLV phụ**;
- đã có HLV chính → kết nối mới là phụ.

Vì xét lúc kích hoạt: người chơi có HLV chính *sau* lúc gửi yêu cầu thì lúc duyệt, kết nối đó thành phụ.
- Nguồn: `lib/reducer.ts:89-90,170-175`; `lib/reducer.test.ts:44-47,241-247`; spec D5; báo cáo:21.
- Lệch tài liệu: handoff:34 ghi "Một người chơi chỉ có 1 HLV chính thức tại một thời điểm".

**BR-KETNOI-21 — Người chơi đổi HLV chính bằng nút "Đặt làm HLV chính" ở một HLV trong mục "HLV khác" của tab HLV.** Kết nối được chọn thành chính, mọi kết nối active khác của người chơi thành phụ. Không có hộp thoại xác nhận, không có thông báo. Chỉ áp cho kết nối `active`; chọn kết nối ở trạng thái khác thì state không đổi. Reducer không kiểm người bấm có đúng là người chơi (chỉ UI chặn).
- Thông báo: toast "Đã đặt <tên> làm HLV chính".
- Nguồn: `lib/reducer.ts:100-104`; `app/(player)/coach.tsx:149-186`; `lib/reducer.test.ts:65-71`; F04:27.

**BR-KETNOI-22 — HLV chính bị huỷ thì hệ thống không tự đôn HLV phụ lên; người chơi phải tự chọn HLV chính mới.** Trong lúc chưa chọn:
- tab HLV hiện InlineMessage;
- Tổng quan hiện dòng "Chưa có HLV chính". Chạm vào thì tới tab HLV nếu còn HLV phụ, hoặc tới màn nhập mã nếu không còn HLV nào.
- Thông báo: tab HLV "Chưa có HLV chính. Chọn “Đặt làm HLV chính” ở một HLV bên dưới."; Tổng quan "Chọn HLV chính ở tab HLV" (còn HLV) hoặc "Nhập mã mời từ HLV để kết nối" (không còn).
- Nguồn: `lib/reducer.ts:99`; `app/(player)/coach.tsx:143-146`; `app/(player)/home.tsx:80-81,128-136`; `lib/reducer.test.ts:48-56`.

**BR-KETNOI-23 — Danh sách HLV của người chơi luôn đặt HLV chính lên đầu, còn lại theo thứ tự tạo kết nối.** Tab HLV gồm:
- "HLV chính": thẻ có nút "Xem hồ sơ" / "Huỷ kết nối";
- "HLV khác" (chú thích "Cũng xem được dữ liệu và ghi chú swing cho bạn"): mỗi HLV có nút "Đặt làm HLV chính" / "Huỷ kết nối";
- nút "Nhập mã mời" và lời dẫn tìm HLV ở Cộng đồng › Khám phá.

Chưa có HLV nào thì hiện trạng thái trống. Các câu báo trước "sẽ là HLV chính / phụ" chỉ để báo; vai thật do reducer quyết lúc kích hoạt (BR-KETNOI-20).
- Thông báo: trạng thái trống "Chưa kết nối HLV" · "Nhập mã mời HLV gửi cho bạn để HLV xem thông số, swing, bộ gậy và góp ý cho bạn." · "Nhập mã mời" / "Tìm HLV". Dòng phụ "Kết nối từ <dd/mm/yyyy>" (lấy `acceptedAt`, thiếu thì `invitedAt`).
- Nguồn: `lib/selectors.ts:24-29`; `app/(player)/coach.tsx:34-37,52-53,108-194`.

#### D. Huỷ kết nối

**BR-KETNOI-24 — Người chơi huỷ được kết nối active với bất kỳ HLV nào (chính hay phụ) ở tab HLV, qua bước xác nhận.** Kết nối → `revoked`, `isPrimary = false`, ghi `revokedAt`.
- Thông báo: Dialog Warning "Huỷ kết nối với <tên HLV>?" · "HLV sẽ mất quyền xem dữ liệu của bạn ngay lập tức. Lịch sử ghi chú vẫn được giữ." · "Huỷ kết nối" (huỷ diệt) / "Giữ kết nối"; toast "Đã huỷ kết nối với <tên>".
- Nguồn: `app/(player)/coach.tsx:40-43,139,182,219-234`; `lib/reducer.ts:99`; MVP:23,39.

**BR-KETNOI-25 — HLV huỷ được kết nối với học viên đang active bằng icon trên header màn chi tiết học viên (`students/[id]`), qua bước xác nhận.** Huỷ xong, chính màn đó chuyển ngay sang 403.
- Thông báo: Dialog Warning "Huỷ kết nối với <tên học viên>?" · "Bạn sẽ mất quyền xem thông số, swing, bộ gậy và thể lực của học viên ngay lập tức. Ghi chú đã gửi vẫn được giữ." · "Huỷ kết nối" / "Giữ kết nối". Màn 403: "Không có quyền xem" · "Kết nối với học viên này đã bị huỷ nên bạn không còn xem được dữ liệu của họ." · "Quay lại". Câu này chỉ hiện khi kết nối từng active (có `acceptedAt`).
- Nguồn: `app/students/[id].tsx:37-57,60-61,200-203,223-237`; `components/NoAccess.tsx:8-9`; F04:41-42.

**BR-KETNOI-26 — Huỷ kết nối, dù bên nào huỷ, có tác dụng ngay.**

| Hệ quả | Chi tiết |
|---|---|
| Quyền xem | HLV mất quyền xem toàn bộ dữ liệu riêng, **kể cả dữ liệu cũ** (BR-KETNOI-27) |
| Roster | Học viên rời roster của HLV |
| Ghi chú | HLV mất quyền thêm / sửa / xoá ghi chú. Ghi chú đã viết vẫn còn và vẫn hiện cho người chơi |
| Thông báo swing | HLV thôi nhận `swing_uploaded` |
| Báo bên kia | **Không** có thông báo |
| Mã mời | Mã đã dùng vẫn ở trạng thái "đã dùng" |
| Kết nối lại | Cần mã mới hoặc lời mời / yêu cầu mới. Hệ thống tạo **bản ghi mới**; bản ghi cũ giữ làm lịch sử |

- Thông báo: tab HLV có dòng "Huỷ kết nối bất cứ lúc nào: HLV mất quyền xem ngay, ghi chú cũ vẫn được giữ."
- Nguồn: `lib/reducer.ts:62-64,81,99,153`; `lib/selectors.ts:9-10,30-31`; `app/(player)/coach.tsx:212-214`; `lib/reducer.test.ts:48-56,304-310,313-352`; `lib/selectors.test.ts:104-113`; F04:76; spec D5, spec:108.
- Lệch tài liệu: tech review:178 nói RLS chỉ ngừng quyền đọc *dữ liệu mới* và để ngỏ chuyện dữ liệu cũ. Code cắt toàn bộ. Cần chủ dự án xác nhận (§11).

#### E. Quyền xem dữ liệu riêng

**BR-KETNOI-27 — `canViewPrivate(viewer, player)` trả `true` trong đúng hai trường hợp: người xem là chính người chơi đó, hoặc người xem là HLV có kết nối `active` với người chơi.** Theo dõi và kết nối `pending`, `declined`, `revoked` đều **không** mở quyền. Hàm **không xét chặn**; tính nhất quán dựa vào BR-KETNOI-32.
- Nguồn: `lib/selectors.ts:8-10`; `lib/reducer.test.ts:73-81,212,261`; spec D6, spec:108; tech review:231-265; handoff:157.

**BR-KETNOI-28 — Mọi màn chứa dữ liệu riêng kiểm `canViewPrivate` trước khi hiện bất kỳ dữ liệu nào.** Riêng chi tiết swing đặt cổng trước mọi state / effect của màn (phần có dữ liệu tách thành component con). Các màn khác vẫn khai báo hook trước cổng (state form, hẹn giờ khung xương, `useSimulatedWrite`), nhưng không hook nào đọc hay ghi dữ liệu riêng. Các màn được bảo vệ:
- chi tiết học viên `students/[id]`;
- chi tiết phiên `metrics/[id]`;
- bộ gậy `clubs?playerId=` và `clubs/[id]`;
- chi tiết swing `swings/[id]` (nhờ vậy job phân tích không chạy trên máy người không có quyền);
- swing đính kèm trong bài `posts/[id]`.

Không có quyền thì màn hiện 403; riêng swing trong bài hiện thẻ khoá.
- Thông báo: 403 "Không có quyền xem" · "Chỉ HLV đã kết nối mới xem được dữ liệu này." · "Quay lại". Thẻ khoá "Swing riêng tư" · "Chỉ người chơi và HLV đã kết nối xem được swing này."
- Nguồn: `app/students/[id].tsx:25-26,37`; `app/metrics/[id].tsx:27`; `app/clubs/index.tsx:52`; `app/clubs/[id]/index.tsx:43`; `app/swings/[id].tsx:145-160`; `app/posts/[id].tsx:113-122`; `components/NoAccess.tsx:6-9`.

**BR-KETNOI-29 — HLV có kết nối active được xem nhưng không sửa dữ liệu học viên.**

| HLV được làm | HLV không được làm |
|---|---|
| Xem thông số, swing, bộ gậy (chỉ gậy đang dùng), thể lực | Sửa gậy; xem danh sách gậy đã lưu trữ |
| Ghi chú swing theo mốc thời gian | Sửa / xoá phiên số liệu |
| Sửa / xoá ghi chú **của chính mình** khi kết nối còn active | Phân tích, điều khiển tải lên, xoá swing |

Đơn vị trên màn chi tiết học viên theo cài đặt của **người xem**.
- Nguồn: `app/clubs/index.tsx:62-65`; `app/clubs/[id]/index.tsx:57-58`; `app/metrics/[id].tsx:94`; `app/swings/[id].tsx:231-232,443`; `lib/reducer.ts:78-83,148-158`; `app/students/[id].tsx:59`; tech review:137.

**BR-KETNOI-30 — Hồ sơ công khai không bao giờ hiện dữ liệu riêng.** HLV có kết nối active, khi xem hồ sơ người chơi (`users/[id]`), thấy thêm nút "Xem dữ liệu học viên". Tab HLV của người chơi có Accordion "HLV xem được gì?" giải thích phạm vi quyền.
- Thông báo: Accordion liệt kê "Thông số swing của mọi buổi tập"; "Video swing, kết quả phân tích — và ghi chú cho bạn theo mốc thời gian"; "Bộ gậy và thông số từng gậy"; "Chỉ số thể lực". Sau đó: "Người theo dõi bạn **không** xem được những dữ liệu này — họ chỉ thấy hồ sơ công khai và bài đăng."
- Nguồn: `app/users/[id].tsx:13-14,35,61-63`; `app/(player)/coach.tsx:16-22,196-216`.

**BR-KETNOI-31** — *Đã gộp vào BR-CAIDAT-11* (công tắc công khai bộ gậy / swing chưa mở quyền xem).

#### F. Chặn và kết nối

**BR-KETNOI-32 — Không chặn được người đang có kết nối active với mình, xét cả hai chiều** (HLV đang kèm học viên đó, hoặc người chơi với HLV của mình). Với các cặp này nút Chặn bị ẩn, và phải huỷ kết nối trước. Nút Chặn cũng ẩn trên hồ sơ của chính mình và khi hai bên đã chặn nhau (BR-CONGDONG-26). Reducer `block` không kiểm và không gỡ kết nối active; luật này hiện chỉ do UI chặn.
- Thông báo: không có câu báo; nút đơn giản là không hiện.
- Nguồn: `components/People.tsx:116-117,125-134`; `lib/reducer.ts:127-136`; báo cáo:36 (#7).

**BR-KETNOI-33** — *Đã gộp vào BR-CONGDONG-27* (dữ liệu đổi khi chặn: đóng lời mời / yêu cầu `pending` của cặp, gỡ follow hai chiều) *và BR-CONGDONG-30* (bỏ chặn không mở lại lời mời / yêu cầu đã đóng).

**BR-KETNOI-34 — Trong lúc hai bên đang chặn nhau (chiều nào cũng tính):**
- **Mã mời:** nhập mã của HLV kia báo "Mã không tồn tại"; mã không bị tiêu.
- **Lời mời / yêu cầu:** không gửi được, không trả lời được. Các lời mời / yêu cầu chờ của cặp bị ẩn khỏi danh sách chờ.
- **Tìm kiếm:** người kia không có trong tìm học viên, danh sách ShareSheet hay Khám phá.
- **Hồ sơ:** hiện BlockedNotice thay cho nội dung, ẩn mọi nút kết nối.
- **Thông báo:** thông báo do người kia gây ra bị ẩn và không tính vào số chưa đọc.
- Thông báo: câu chặn trên hồ sơ theo BR-CONGDONG-29.
- Nguồn: `lib/selectors.ts:14-15,84-85,87-90,100,115`; `lib/reducer.ts:161,168`; `app/coaches/[id].tsx:38,41,51-53`; `components/People.tsx:103-114`; `lib/reducer.test.ts:36-43,221-229,264-270`; `lib/selectors.test.ts:99-103`.

#### G. Roster và "Cần phản hồi"

**BR-KETNOI-35 — Roster của HLV gồm người chơi có kết nối active với HLV đó, bất kể HLV là chính hay phụ, giữ thứ tự tạo kết nối.**
- Hero hiện số học viên.
- Ô tìm theo tên (so không dấu, chứa chuỗi tìm) chỉ hiện ở mục "Tất cả" / "Cần phản hồi" khi đã có học viên.
- Mỗi dòng: "Handicap <số>" · "Swing mới <thời gian>" (hoặc "Chưa có swing"), kèm badge "Cần phản hồi" nếu có. Chạm dòng mở `students/[id]`.
- Mở roster từ thông báo `connect_request` thì vào thẳng mục "Lời mời".
- Thông báo: chưa có học viên: "Chưa có học viên" · "Tạo mã mời rồi gửi cho học viên — kết nối xong bạn xem được thông số, swing, bộ gậy và thể lực của họ." · "Mời học viên". Tìm không thấy: "Không tìm thấy học viên nào tên “<chuỗi>”."
- Nguồn: `lib/selectors.ts:30-31`; `app/(coach)/roster.tsx:22-28,32,42-43,50-74,145-149,169-173,206-219`; `lib/reducer.test.ts:34`.
- Lệch tài liệu: spec:83 đặt tên bộ lọc thứ ba là "Chờ chấp nhận". Code đặt "Lời mời" và gộp yêu cầu đến, lời mời đã gửi, mã đang chờ.

**BR-KETNOI-36 — "Cần phản hồi" (tính riêng cho từng HLV X).** *(Gộp BR-SWING-30.)* Một swing "chờ X phản hồi" khi đã có kết quả phân tích (`succeeded` **hoặc** `needs_review`) và chính X chưa ghi chú trên swing đó. Học viên thuộc "Cần phản hồi" của X khi nằm trong roster của X và có ít nhất 1 swing như vậy. Ghi chú của HLV khác không tính; swing chưa phân tích không bao giờ tính. Thẻ của swing đó có badge "Cần phản hồi". Số trên nhãn bộ lọc = số học viên như vậy.
- Thông báo: badge "Cần phản hồi"; Segmented "Cần phản hồi (n)"; trống: "Không có học viên nào cần phản hồi. Swing phân tích xong mà bạn chưa ghi chú sẽ hiện ở đây."
- Nguồn: `lib/selectors.ts:65-67`; `lib/selectors.test.ts:39-49`; `app/(coach)/roster.tsx:33,67,161,220-221`; `app/students/[id].tsx:63,150`; `components/SwingCard.tsx:57`; F08:14,44; báo cáo:89.

**BR-KETNOI-37 — Tab Swing ở chi tiết học viên chia "Chưa review" / "Đã review", tính riêng cho HLV đang xem.** *(Gộp BR-SWING-29.)* "Đã review" là swing mà HLV đó có ít nhất 1 ghi chú. "Chưa review" là mọi swing còn lại, **kể cả** swing chưa phân tích hay đang tải. Mỗi nhóm xếp mới → cũ. Luật này khác "Cần phản hồi" (BR-KETNOI-36), vì "Cần phản hồi" chỉ xét swing đã phân tích.
- Thông báo: Segmented "Chưa review (n)" / "Đã review (n)"; gợi ý "Chạm một swing để xem phân tích, chèn mốc và ghi chú."; nhóm rỗng: "Không còn swing nào chờ bạn review." / "Bạn chưa ghi chú swing nào của học viên này."; học viên chưa có swing: "Học viên chưa đăng swing nào."
- Nguồn: `lib/selectors.ts:119-125`; `lib/selectors.test.ts:114-121`; `app/students/[id].tsx:32,125-157`; MVP:30 (M4.4); F08:15,22,26-27,44.

#### H. Thông báo của mảng kết nối

**BR-KETNOI-38 — Ba loại thông báo gắn với kết nối: `connect_request`, `invite_accepted`, `swing_uploaded`.** Người nhận, câu chữ và màn đích ở §7. `swing_uploaded` gửi tới **mọi** HLV active (chính và phụ), mỗi swing một lần, lúc tải lên xong lần đầu; HLV đang chờ kết nối hoặc đã bị huỷ không nhận. Các thao tác sau **không** sinh thông báo: từ chối, huỷ lời mời / yêu cầu, huỷ kết nối, đổi HLV chính, tạo mã, thu hồi mã. Công tắc push "Lời mời và yêu cầu kết nối" và "Kết nối được chấp nhận" có cho cả hai vai; "Học viên đăng swing mới" chỉ HLV có.
- Nguồn: `components/NotificationsScreen.tsx:15-52`; `lib/reducer.ts:56-66,96,164,176`; `app/settings/notifications.tsx:10-16,22`; `lib/reducer.test.ts:292-310`; F04:76; MVP:33 (M4.7).

### 5.3 Số liệu swing và thể lực (`BR-SOLIEU`)

#### Quyền và loại phiên

**BR-SOLIEU-01 — Chỉ người chơi mở được các màn nhập số liệu (chọn nguồn, nhập tay, CSV, ảnh, QR).** Mọi phiên tạo ra đều thuộc chính người đó. HLV không nhập số liệu thay học viên được; vai khác mở các màn này thì bị chuyển về `/`.
- Nguồn: `app/metrics/add.tsx:18`, `app/metrics/manual.tsx:40,58`, `app/metrics/import-csv.tsx:38,59`, `app/metrics/import-photo.tsx:49,57`, `app/metrics/scan-qr.tsx:24`, `app/(player)/_layout.tsx:8`; tech review:240-241.

**BR-SOLIEU-02 — Chỉ chủ phiên và HLV có kết nối `active` với chủ phiên xem được một phiên** (`canViewPrivate`, BR-KETNOI-27). Người theo dõi, HLV đã bị huỷ kết nối hay đang `pending` đều không xem được. Quyền được kiểm trước khi màn hiện nội dung.
- Thông báo: 403 "Không có quyền xem" · "Chỉ HLV đã kết nối mới xem được dữ liệu này." · "Quay lại". Phiên không tồn tại: "Không tìm thấy phiên" · "Phiên này không tồn tại hoặc đã bị xoá." · "Quay lại". Ở chi tiết học viên, HLV từng kết nối rồi bị huỷ thấy "Kết nối với học viên này đã bị huỷ nên bạn không còn xem được dữ liệu của họ."
- Nguồn: `lib/selectors.ts:9-10`, `app/metrics/[id].tsx:27-35`, `components/NoAccess.tsx:8-9`, `app/students/[id].tsx:36-44`, `lib/reducer.test.ts:51-53,77-78`; spec D6; tech review:240-242.

**BR-SOLIEU-03 — Chỉ chủ phiên được sửa hoặc xoá phiên.** Nút "Sửa phiên" và "Xoá phiên" chỉ hiện với chủ phiên, nên HLV chỉ xem. Mở `/metrics/manual?id=` với phiên không tồn tại hoặc của người khác thì bị chuyển sang màn chi tiết phiên, nơi hiện 404 hoặc 403. Khi ghi, reducer từ chối bản sửa nếu phiên không tồn tại, đổi chủ hoặc đổi loại. Lệnh **xoá** trong reducer không kiểm chủ phiên (chỉ UI chặn).
- Thông báo: không có (từ chối = không đổi state).
- Nguồn: `app/metrics/[id].tsx:94-100`, `app/metrics/manual.tsx:42`, `lib/reducer.ts:52,141-145`, `lib/reducer.test.ts:364-370`.

**BR-SOLIEU-04 — Một phiên là swing hoặc thể lực.** Khi nhập tay mới, người chơi chọn loại bằng segment "Swing" / "Thể lực". Mở từ nút "+" ở segment Thể lực thì form chọn sẵn Thể lực. Khi sửa phiên, segment bị ẩn và loại bị khoá. Đổi segment thì xoá trạng thái "đã bấm Lưu", nên lỗi đang hiện cũng mất.
- Nguồn: `app/metrics/manual.tsx:19,31,82-91`, `app/(player)/metrics.tsx:16`, `lib/reducer.ts:143`.

#### Đơn vị, khoảng hợp lệ, cách đọc số

**BR-SOLIEU-05 — Số liệu luôn lưu theo đơn vị chuẩn: mph, rpm, độ, mét, kg, cm, thang /10.** Người dùng chọn yard thì chỉ carry đổi sang yard, cả khi hiển thị lẫn khi nhập; giá trị lưu vẫn là mét. Tốc độ luôn là mph, không có km/h.
- Nguồn: `lib/validation.ts:51-56`, `lib/format.ts:3-4,7`, `app/settings/units.tsx:16,26`; spec D9; báo cáo:40,93; F05:64.

**BR-SOLIEU-06 — Ở mọi nguồn nhập, cả 6 chỉ số swing (hoặc cả 4 chỉ số thể lực) đều bắt buộc.** Mỗi giá trị phải là số nằm trong khoảng ở §4.5, tính cả hai biên. Phiên chỉ lưu được khi không còn trường nào lỗi. Dưới mỗi ô có dòng gợi ý khoảng hợp lệ.
- Thông báo: ô trống "Bắt buộc"; không phải số "Không phải số"; ngoài khoảng "Trong khoảng {min}–{max}{đơn vị}" (vd "Trong khoảng 10–350 m", "Trong khoảng 1–1,56", "Trong khoảng 0–10/10"). Gợi ý "Khoảng hợp lệ 40–150 mph". Nhãn ô "{Nhãn} ({đơn vị})", vd "Tốc độ đầu gậy (mph)".
- Nguồn: `lib/validation.ts:29,35-50`, `components/SwingMetricsForm.tsx:24-25`, `lib/validation.test.ts:9-16,30-33`; F05:15-16.

**BR-SOLIEU-07 — Cách đọc số người dùng gõ.**
- Dấu phẩy và dấu chấm đều là dấu thập phân. Số âm viết với "-"; chỉ góc bắn có khoảng âm, và ô góc bắn dùng bàn phím có dấu trừ. Không chấp nhận dấu ngăn nghìn.
- Với ô hiển thị 0 số lẻ (tốc độ, spin, carry, độ dẻo, lực nắm, bật cao), chuỗi dạng ngăn nghìn như "2.650" hay "12,000" bị báo đúng nguyên nhân, thay vì bị hiểu thành 2,65.
- Ô có số lẻ hiển thị thì đọc theo thập phân: "72.500" kg là 72,5.
- Ô hiển thị 0 số lẻ **vẫn nhận số lẻ**: "104,8" mph lưu là 104,8. Số lẻ chỉ ảnh hưởng cách hiển thị.
- Thông báo: "Không dùng dấu chấm ngăn nghìn (vd 2650)". Câu này giữ chữ "dấu chấm" cả khi người dùng gõ dấu phẩy.
- Nguồn: `lib/format.ts:75-79`, `lib/validation.ts:40-42`, `components/SwingMetricsForm.tsx:29-30`, `lib/validation.test.ts:35-41`, `lib/format.test.ts:77-80`.

**BR-SOLIEU-08 — Đơn vị yard: ô "Carry (yd)" nhận 10,9–382,8 yd.** Đây là khoảng 10–350 m đổi sang yard, làm tròn ra phía ngoài tới 0,1 yd. Khi lưu, giá trị đổi về mét (1 m = 1,0936133 yd), làm tròn 0,1 m, rồi kẹp vào 10–350 m. Nhờ vậy, carry sát biên mở form ra rồi lưu nguyên không bị báo lỗi. Form sửa phiên và dữ liệu điền sẵn từ OCR hiện carry theo yard với 1 số lẻ.
- Thông báo: "Trong khoảng 10,9–382,8 yd".
- Nguồn: `lib/validation.ts:21-27,52-56,268-269`, `lib/simulate.ts:109-120`, `lib/validation.test.ts:45-62,273-282`; F05:65.

#### Nhập tay, sửa, xoá

**BR-SOLIEU-09 — Nhập tay phiên swing bắt buộc chọn gậy.** Danh sách chỉ gồm gậy chưa lưu trữ của chính người chơi, chia theo nhóm. Mục "Thêm gậy mới" mở form thêm gậy; quay lại thì gậy vừa thêm được chọn sẵn. Ngoại lệ: sửa một phiên vốn chưa gắn gậy thì được lưu mà không chọn gậy. Phiên thể lực không có ô gậy.
- Thông báo: ô Gậy "Bắt buộc" (tính vào số trường cần sửa). Chưa có gậy nào: "Chưa có gậy — thêm gậy mới".
- Nguồn: `app/metrics/manual.tsx:46-48,95`, `components/ClubPicker.tsx:16,21-26,31,67-75`; F01:18-19; F05:15.

**BR-SOLIEU-10 — Ngày của phiên (nhập tay, CSV) mặc định là hôm nay (`NOW`), chọn bằng lịch, không chọn được ngày sau hôm nay.** Đổi ngày thì giữ nguyên giờ trong ngày theo giờ VN.
- Thông báo: không có (ngày tương lai bị khoá trên lịch).
- Nguồn: `components/SessionEntry.tsx:9-28`, `app/metrics/manual.tsx:32,92`, `app/metrics/import-csv.tsx:35,166`, `lib/format.ts:44-52`.

**BR-SOLIEU-11 — Ở form nhập tay, lỗi theo trường chỉ hiện sau lần bấm "Lưu" đầu tiên, từ đó cập nhật ngay khi gõ.** Chân form có dòng tổng số trường còn lỗi, tính cả ô Gậy.
- Thông báo: "Chưa lưu: {N} trường cần sửa." (để trống cả form swing rồi bấm Lưu thì báo 7 trường: gậy và 6 ô).
- Nguồn: `app/metrics/manual.tsx:48,56,96,99,104`; F05:15.

**BR-SOLIEU-12 — Lưu ở nhập tay (tạo mới và sửa) là ghi giả lập 0,6 s (BR-CAIDAT-25).** Trong lúc đó nút Lưu bị khoá và hiện "Đang lưu…". Thành công thì toast rồi tự quay về màn trước (không có lịch sử thì về tab Thông số). Thất bại (bật ở Cài đặt › Dev) thì không ghi gì, form giữ nguyên, toast lỗi có nút thử lại. Đã lưu thành công thì nút Lưu bị khoá để không tạo phiên trùng.
- Thông báo: thành công: toast "Đã lưu" (tạo mới) hoặc "Đã lưu thay đổi" (sửa), chú thích "Phiên swing ngày dd/mm/yyyy" / "Phiên thể lực ngày dd/mm/yyyy", tự đóng sau 1,2 s. Thất bại: "Lưu thất bại" · "Mất kết nối — số liệu chưa được lưu, form giữ nguyên." · "Thử lại", giữ 4 s.
- Nguồn: `app/metrics/manual.tsx:55-76,105-119`, `components/Feedback.tsx:17-54`, `components/SessionEntry.tsx:31`, `lib/simulate.ts:134`; F13:22-23,59.

**BR-SOLIEU-13 — Sửa phiên dùng chung màn nhập tay với tham số `?id=`.** Form điền sẵn số đã lưu theo kiểu viết VN (carry theo đơn vị của người xem). Bản sửa giữ nguyên `source` và `vendor` gốc, và hệ thống gắn `editedAt`. Form y hệt lúc mở (cùng ngày, gậy, mọi ô) thì không ghi gì, không gắn "Đã sửa", chỉ hiện toast. Với phiên từ CSV hoặc ảnh, bản sửa ghi đè số đang lưu; bản mock không giữ số gốc.
- Thông báo: tiêu đề màn "Sửa phiên"; màn chi tiết hiện dòng "Đã sửa" với ngày sửa (dd/mm/yyyy).
- Nguồn: `app/metrics/manual.tsx:23-24,29-35,49-54,58,68,79`, `lib/reducer.ts:141-145`, `lib/validation.ts:266-272`, `app/metrics/[id].tsx:57`, `lib/reducer.test.ts:355-362`; F05:19-20,63; MVP:35.

**BR-SOLIEU-14 — Xoá phiên (chỉ chủ phiên) phải xác nhận qua hộp thoại. Phiên bị xoá vĩnh viễn.** Ghi giả lập 0,6 s (nút khoá, "Đang xoá…"). Phiên chỉ bị xoá khỏi state sau khi màn chi tiết đã đóng. Không có dữ liệu nào khác bị xoá theo và không có thông báo. Bật giả lập lỗi thì phiên vẫn còn và có nút thử lại.
- Thông báo: hộp thoại "Xoá phiên này?" · "Số liệu của phiên sẽ bị xoá và không khôi phục được." · "Xoá" / "Huỷ". Thất bại: "Xoá thất bại" · "Mất kết nối — phiên vẫn còn." · "Thử lại".
- Nguồn: `app/metrics/[id].tsx:19-23,43-52,97-125`, `lib/reducer.ts:52`; F05:30; F13:24-26; MVP:38.

#### Nhập CSV

**BR-SOLIEU-15 — CSV nhận diện hãng máy đo theo dòng tiêu đề.** TrackMan dùng phân cách ",", Foresight dùng ";". Một hãng được nhận khi tiêu đề, tách theo phân cách của hãng đó, có cột tốc độ đầu gậy của hãng; TrackMan được thử trước. BOM UTF-8 ở đầu file được bỏ qua. File không nhận diện được thì dừng ở bước Xem trước, và bước này bị đánh dấu lỗi.

| Chỉ số | Cột TrackMan | Cột Foresight |
|---|---|---|
| Gậy | `Club` | `Club` |
| Tốc độ đầu gậy | `Club Speed [mph]` | `ClubSpeed (mph)` |
| Tốc độ bóng | `Ball Speed [mph]` | `BallSpeed (mph)` |
| Smash | `Smash Factor` | `Smash` |
| Spin | `Spin Rate [rpm]` | `BackSpin (rpm)` |
| Góc bắn | `Launch Angle [deg]` | `VLA (deg)` |
| Carry | `Carry [yds]` (yard, đổi sang mét) | `Carry (m)` |

- Thông báo: "Không nhận diện được file" · "{tên file} không phải file xuất từ TrackMan hoặc Foresight." · "Chọn file khác".
- Nguồn: `lib/csv.ts:8-18`, `app/metrics/import-csv.tsx:101-112,177`, `lib/csv.test.ts:5-31`; spec D7, spec:72.
- Lệch tài liệu: handoff:54,92-95,158 ghi hãng "Trackman / GC Quad". Code và spec D7 dùng TrackMan / Foresight.

**BR-SOLIEU-16 — CSV kiểm từng dòng dữ liệu độc lập, theo đúng luật BR-SOLIEU-06/-07 (carry tính bằng mét).** Số dòng hiển thị là số dòng trong file (tiêu đề là dòng 1). Thiếu cột hoặc ô trống thì báo "Bắt buộc". Carry của TrackMan đổi từ yard sang mét và **làm tròn tới 1 m** trước khi kiểm. Dòng lỗi không chặn cả file: dòng đó bị bỏ qua, kèm lý do theo từng trường.
- Thông báo: dòng tổng "{N} dòng hợp lệ · {M} dòng lỗi (bỏ qua)" (phần "· {M} dòng lỗi (bỏ qua)" chỉ hiện khi M > 0). Dòng lỗi có tiêu đề "Dòng {n} · bỏ qua" và lý do dạng "{Nhãn}: {lỗi}" (vd "Tốc độ đầu gậy: Bắt buộc"), mỗi lý do một dòng. Dòng hợp lệ có tiêu đề "Dòng {n} · {tốc độ đầu gậy} · {carry theo đơn vị người xem}", chú thích là các chỉ số còn lại.
- Nguồn: `lib/csv.ts:21-28`, `app/metrics/import-csv.tsx:21-24,43-44,127,131-147`, `lib/csv.test.ts:6-14`; F05:23; tech review:266-273.

**BR-SOLIEU-17 — Ở bước Xác nhận, cả file dùng chung một gậy và một ngày.** Mỗi dòng hợp lệ thành một phiên swing riêng, với `source='csv'`, `vendor` theo hãng, cùng `capturedAt` và `clubId`.
- **Gậy gợi ý:** lấy từ cột Club của dòng hợp lệ đầu tiên. Tên như "Driver", "3 Wood", "4 Hybrid", "7 Iron", "PW", "Sand Wedge" (không phân biệt hoa thường) được đổi sang loại gậy trong app, rồi lấy gậy chưa lưu trữ đầu tiên của người chơi có loại đó (BR-BOGAY-23). Người chơi đổi được gậy gợi ý. Gậy là bắt buộc.
- File không có dòng hợp lệ nào thì nút "Tiếp tục" bị khoá.
- Lưu CSV ghi ngay: không có độ trễ giả lập, không chịu công tắc giả lập lỗi.
- Thông báo: thiếu gậy: ô Gậy "Bắt buộc", chân màn "Chưa nhập: chọn gậy cho {N} phiên.". Gợi ý dưới ô gậy "Cột Club trong file: {giá trị}". Câu dẫn "{N} phiên swing từ file {Hãng} sẽ được gắn cùng gậy và ngày dưới đây." Nút "Nhập {N} phiên". Thành công: toast "Đã nhập {N} phiên" · "{Hãng} · ngày dd/mm/yyyy", sau đó quay về màn trước.
- Nguồn: `app/metrics/import-csv.tsx:45-47,56-62,150,157-168,180`, `lib/csv.ts:32-43`, `lib/csv.test.ts:34-49`; F05:24,61; báo cáo:44.

#### Nhập từ ảnh (OCR) và QR

**BR-SOLIEU-18 — Nhập từ ảnh chụp màn hình có 3 bước: chọn hãng (TrackMan / Foresight), đặt ảnh theo khung hướng dẫn tỉ lệ 4:3, rồi "Đọc số liệu".** Bước đọc mất 1,5 s giả lập và có nút "Huỷ". Huỷ hoặc rời màn thì bỏ kết quả và quay về bước chọn. Ảnh mờ hoặc loá thì không đọc được, người chơi chọn ảnh khác.
- Thông báo: khung hướng dẫn "Đặt bảng số liệu vào khung" · "Chụp thẳng màn hình kết quả {Hãng}, đủ sáng, không bị loá". Khi đọc "Đang đọc…" · "Nhận diện số liệu trên ảnh {Hãng}". Không đọc được "Không đọc được số liệu" · "Ảnh mờ hoặc bị loá. Chụp thẳng màn hình kết quả {Hãng}, đủ sáng rồi thử lại với ảnh khác." · "Chọn ảnh khác".
- Nguồn: `app/metrics/import-photo.tsx:20-21,38-48,85-90,105,109-133`, `lib/simulate.ts:104-108,123-124`, `lib/simulate.test.ts:83-87`; F05:25-27; tech review:274-279.

**BR-SOLIEU-19 — Bước Kiểm tra của ảnh / OCR điền sẵn giá trị đọc được vào form 6 chỉ số.**
- Chuỗi OCR không phải số được giữ nguyên để form báo lỗi.
- Đơn vị yard: carry (mét) đổi sang yard với 1 số lẻ.
- Trường có độ tin cậy dưới 0,8 bị đánh dấu.
- Khác nhập tay, lỗi validate ở đây hiện ngay, không đợi bấm Lưu.
- Sửa giá trị một trường bị đánh dấu thì cảnh báo của trường đó tắt; các trường khác giữ nguyên.
- Thông báo: banner "{N} trường độ tin cậy thấp — kiểm tra trước khi lưu"; dưới ô bị đánh dấu "Độ tin cậy thấp — kiểm tra lại".
- Nguồn: `lib/simulate.ts:94-129`, `app/metrics/import-photo.tsx:50-51,138-141`, `components/SwingMetricsForm.tsx:32`, `lib/simulate.test.ts:81,89-110`; F05:27; tech review:154,278.

**BR-SOLIEU-20 — Lưu phiên từ ảnh cần gậy và đủ 6 chỉ số hợp lệ.** Phiên được ghi với `source='photo'`, `vendor` theo hãng đã chọn, và `capturedAt = NOW`: màn này **không có ô chọn ngày**. Lưu ghi ngay, không có độ trễ hay giả lập lỗi. Nút "Chọn ảnh khác" bỏ kết quả đang kiểm tra.
- Thông báo: "Chưa lưu: {N} trường cần sửa." (tính cả gậy); ô Gậy "Bắt buộc". Thành công: toast "Đã lưu" · "Phiên swing ngày dd/mm/yyyy · ảnh {Hãng}".
- Nguồn: `app/metrics/import-photo.tsx:52,54-59,142,147-158,176`.

**BR-SOLIEU-21 — Quét QR mang nhãn "Thử nghiệm" và chỉ là giả lập.** Quét thành công thì liên kết phiên (1 s); sau đó nút "Nhập dữ liệu phiên" mở màn CSV ở bước Xem trước với file TrackMan mẫu. Dữ liệu vì thế đi qua luật CSV (BR-SOLIEU-15…17), và phiên lưu với `source='csv'`, không phải `'qr'`. Mã không đọc được thì báo lỗi và cho quét lại.
- Thông báo: giới thiệu "QR của sân tập dùng để liên kết phiên — đang chờ xác nhận định dạng với đối tác". Đang liên kết: "Đã đọc mã — đang liên kết phiên với sân tập…", nút "Đang liên kết phiên…" bị khoá. Thành công "Đã liên kết phiên TrackMan #A1F3". Lỗi "Không đọc được mã — mã mờ hoặc không phải mã phiên của sân tập. Căn mã vào giữa khung rồi quét lại." · "Quét lại".
- Nguồn: `app/metrics/scan-qr.tsx:10-11,18-23,38,53-73`, `app/metrics/import-csv.tsx:31-32,59`; F05:28-29; tech review:155-157.
- Lệch tài liệu: handoff:92 ghi QR "tự động điền dữ liệu". Trong code, QR chỉ liên kết phiên.

**BR-SOLIEU-22 — Sheet chọn nguồn có 4 nguồn: Nhập tay · Nhập file CSV · Ảnh chụp màn hình · Quét QR (Thử nghiệm).** Màn nguồn thay chỗ sheet, nên khi quay lại hoặc lưu xong thì về đúng màn đã mở sheet. Nút "+" ở tab Thông số theo segment: Swing mở sheet chọn nguồn, Thể lực mở thẳng nhập tay thể lực, Bộ gậy mở form thêm gậy.
- Nguồn: `app/metrics/add.tsx:7-12,36`, `app/(player)/metrics.tsx:13-18,62`; báo cáo:34,68.

#### Hiển thị: tab Thông số, chi tiết phiên, Tổng quan

**BR-SOLIEU-23 — Tab Thông số liệt kê phiên của chính người chơi theo segment Swing / Thể lực, xếp mới → cũ theo `capturedAt`.** Lần đầu mở tab trong phiên làm việc thì hiện khung xương 0,4 s. Chạm một hàng thì mở chi tiết phiên.
- Thông báo: rỗng (Swing): "Chưa có phiên swing" · "Nhập số liệu từ máy đo (file CSV, ảnh chụp màn hình) hoặc nhập tay để theo dõi tiến bộ." · "Nhập số liệu". Rỗng (Thể lực): "Chưa có phiên thể lực" · "Ghi cân nặng, độ dẻo, lực nắm và bật cao để theo dõi thể lực." · "Nhập thể lực".
- Nguồn: `app/(player)/metrics.tsx:14-16,24,31,38,66-75`, `lib/selectors.ts:33-35`, `components/SessionRow.tsx:10-33`; F05:13,21; F13:17,19.

**BR-SOLIEU-24 — Chi tiết phiên có 3 phần.**
- "Thông tin": Ngày; Gậy (chỉ phiên swing: "{loại} · {hãng} {model}" hoặc "Chưa gắn gậy"); Nguồn ("{nguồn} · {hãng}"); "Đã sửa" nếu có.
- "Chỉ số": đủ chỉ số, theo đơn vị của **người xem**.
- "Dữ liệu gốc" (accordion): chỉ có với phiên từ CSV hoặc ảnh.
- Thông báo: "Bản ghi nhận từ file CSV {Hãng} (mô phỏng)" / "Bản ghi nhận từ ảnh chụp màn hình {Hãng} (mô phỏng)".
- Nguồn: `app/metrics/[id].tsx:41,53-62,75,79-93`.
- Lệch tài liệu: spec:75 hứa "raw vendor". Code hiện JSON số đã chuẩn hoá.

**BR-SOLIEU-25 — Tổng quan, mục "Chỉ số swing gần nhất": lấy phiên swing có `capturedAt` mới nhất (bất kể gậy hay nguồn) và hiện 4 ô: Tốc độ đầu gậy, Tốc độ bóng, Smash, Carry.**
- Mỗi ô có chênh lệch so với **phiên swing liền trước cùng gậy**, tức phiên có `capturedAt` nhỏ hơn hẳn. Phiên không gắn gậy, hoặc chưa có phiên trước cùng gậy, thì không có chênh lệch.
- Cả 4 chỉ số đều càng cao càng tốt. Chênh lệch được làm tròn theo số lẻ hiển thị rồi mới xét dấu: ≥ 0 màu xanh, < 0 màu đỏ.
- Trường hợp biên: các phiên nhập từ một file CSV có cùng `capturedAt`. Phiên thêm sau đứng trước, và trong cùng file thì dòng trên đứng trước, nên "gần nhất" là dòng hợp lệ đầu tiên của file. Các phiên cùng thời điểm không làm "phiên trước" của nhau.
- Thông báo: dòng phụ "{gậy} · dd/mm/yyyy" kèm tag nguồn. Chú thích "So với phiên {gậy} ngày dd/mm/yyyy" hoặc "Chưa có phiên trước cùng gậy để so sánh". Chênh lệch dạng "+1 mph", "-0,01", "+5 yd", "0".
- Nguồn: `app/(player)/home.tsx:74-77,143-159`, `lib/selectors.ts:33-42`, `lib/format.ts:16-34`, `lib/reducer.ts:51`, `components/StatTile.tsx:5-22`, `lib/selectors.test.ts:23-30`, `lib/format.test.ts:39-56`; F05:12,31.

**BR-SOLIEU-26 — Mục "Xu hướng tốc độ đầu gậy": lấy tối đa 5 phiên swing gần nhất có gậy loại Driver và vẽ tốc độ đầu gậy từ cũ đến mới.** Lọc theo `type === 'Driver'`, nên tính cả Driver đã lưu trữ nhưng không tính gậy "Tuỳ chỉnh". Mỗi dòng CSV là một phiên, nên 5 điểm có thể là 5 cú trong cùng một ngày.
- Thông báo: tiêu đề "Xu hướng tốc độ đầu gậy (Driver, {N} buổi)"; chưa có phiên Driver: "Chưa có buổi Driver nào.".
- Nguồn: `lib/selectors.ts:43-46`, `app/(player)/home.tsx:78,162-174`, `lib/selectors.test.ts:9-13`; MVP:17; báo cáo:44 (#15); F05:61.

**BR-SOLIEU-27 — Mục "Carry theo gậy": carry trung bình trên mọi phiên swing của từng gậy.** Phiên không gắn gậy và gậy đã lưu trữ bị loại. Lấy 3 gậy có carry trung bình cao nhất, xếp giảm dần, hiển thị theo đơn vị người xem (số nguyên). Không gậy nào đủ điều kiện thì ẩn cả mục.
- Thông báo: chú thích "Carry trung bình của {N} gậy xa nhất" (N > 1) hoặc "Carry trung bình".
- Nguồn: `lib/selectors.ts:47-52`, `app/(player)/home.tsx:79,176-182`, `lib/selectors.test.ts:14-22`; spec:68; handoff:51.

**BR-SOLIEU-28 — Người chơi chưa có phiên swing nào thì Tổng quan thay 3 mục trên bằng empty state.** Có dữ liệu thì có nút nổi "Nhập số liệu". Phiên thể lực không làm mất empty state này.
- Thông báo: "Chưa có số liệu" · "Nhập buổi tập đầu tiên để xem chỉ số swing, xu hướng tốc độ và carry theo gậy." · "Nhập số liệu đầu tiên".
- Nguồn: `app/(player)/home.tsx:141,185-191,219-223`; F01:17.

**BR-SOLIEU-29 — HLV xem học viên (qua cổng BR-SOLIEU-02) chỉ đọc, ở 3 tab.**
- "Tổng quan": 4 ô và xu hướng Driver, cùng luật BR-SOLIEU-25/-26. **Không có** vòng carry theo gậy.
- "Thông số": danh sách phiên swing.
- "Thể lực": 4 chỉ số của phiên thể lực gần nhất, cùng lịch sử.

Carry hiển thị theo đơn vị của HLV, không theo đơn vị của học viên.
- Thông báo: chưa có phiên swing "Học viên chưa có phiên số liệu swing nào (nhập tay, CSV, ảnh). Video swing ở tab Swing."; chưa có phiên thể lực "Học viên chưa có phiên thể lực nào.". Dòng phụ "{gậy} · dd/mm/yyyy · {nguồn}". Lịch sử "{N} phiên".
- Nguồn: `app/students/[id].tsx:25-26,59,77-122,170-188`; F09:13-14,19; handoff:69-73.

**BR-SOLIEU-30 — Mỗi người dùng tự chọn đơn vị hiển thị khoảng cách (Mét / Yard), ở onboarding hoặc Cài đặt › Đơn vị đo. Chọn là lưu ngay, mặc định Mét.** *(Gộp BR-CAIDAT-17.)* Cả hai vai đều chọn được. Lựa chọn chỉ áp cho carry ở Tổng quan, Thông số, Bộ gậy và ô carry của form nhập. Tốc độ (mph), spin (rpm), góc (°), khối lượng (kg) không đổi. Dữ liệu đã lưu không đổi, vì luôn lưu bằng mét. Đơn vị là của **người xem**: HLV xem học viên thì thấy theo đơn vị của HLV.
- Thông báo: khối "Khoảng cách", dòng phụ "Áp dụng cho carry ở Tổng quan, Thông số, Bộ gậy và form nhập. Dữ liệu đã lưu không đổi."; "Ví dụ: Carry 228 m" / "Ví dụ: Carry 249 yd". Onboarding: "Khoảng cách theo mét (m)" / "Khoảng cách theo yard (yd)" · "Đổi lại bất cứ lúc nào trong Cài đặt.".
- Nguồn: `app/settings/units.tsx:11-38`, `app/(auth)/onboarding.tsx:13-15,44-53`, `lib/selectors.ts:6`, `lib/mock.ts:7`, `lib/format.ts:3-7`, `app/students/[id].tsx:59`; spec D9; báo cáo:40,93; F05:29; F12 bước 07-08; MVP:25.

**BR-SOLIEU-31 — Phiên gắn gậy thì gậy đó không xoá được, chỉ lưu trữ được** (BR-BOGAY-20; số liên kết đếm cả phiên và swing). Lưu trữ gậy thì phiên vẫn giữ `clubId` và vẫn hiện tên gậy. Gậy lưu trữ biến khỏi ô chọn gậy và khỏi mục Carry theo gậy, nhưng vẫn được tính trong xu hướng Driver. Màn chi tiết gậy hiện tối đa 3 phiên gần nhất của gậy đó.
- Nguồn: `lib/selectors.ts:54-55,138-139`, `lib/reducer.ts:147`, `lib/reducer.test.ts:196-202`, `app/clubs/[id]/index.tsx:18,61-62,124-135`; tech review:208-210.

**BR-SOLIEU-32 — Tạo, nhập, sửa, xoá phiên số liệu đều không sinh thông báo, kể cả tới HLV đang kết nối.** Thông báo "có dữ liệu mới" cho HLV chỉ có với video swing (`swing_uploaded`).
- Nguồn: `lib/domain.ts:81`, `lib/reducer.ts:50-52,141-145`.

### 5.4 Bộ gậy (`BR-BOGAY`)

#### Thêm và sửa

**BR-BOGAY-01 — Danh mục loại gậy.** Khi thêm hoặc sửa, người chơi chọn một trong 16 loại cố định (Driver → Putter) hoặc "Tuỳ chỉnh". Sheet "Chọn loại gậy" chia theo 6 nhóm Gỗ / Hybrid / Sắt / Wedge / Putter / Khác (§4.6).
- Thông báo: ô "Loại gậy", placeholder "Chọn loại gậy"; chưa chọn: "Bắt buộc".
- Nguồn: `lib/domain.ts:34-47`; `app/clubs/new.tsx:66-74,110-130`; `lib/validation.ts:74`; spec:77; F06 bước 02.

**BR-BOGAY-02 — Chỉ người chơi được thêm gậy, và gậy luôn thuộc về chính người thêm.** HLV mở `/clubs/new` thì bị chuyển về `/`. Nút "+ Thêm gậy" chỉ hiện cho chủ bộ gậy, ở mục Đang dùng.
- Nguồn: `app/clubs/new.tsx:47,145-147`; `app/clubs/index.tsx:62,91-95`; `app/(player)/metrics.tsx:17,61-63`; handoff:106.

**BR-BOGAY-03 — Trường bắt buộc: Loại, Hãng, Model, Hãng cán (tính sau khi bỏ khoảng trắng hai đầu), Loft, Lie.** Loại "Tuỳ chỉnh" bắt buộc thêm "Tên gậy". Còn một lỗi là không lưu được gì.
- Thông báo: "Bắt buộc" dưới từng ô.
- Nguồn: `lib/validation.ts:45,72-80`; `lib/validation.test.ts:79-86`.

**BR-BOGAY-04 — Khoảng hợp lệ của ô số: Trọng lượng cán 30–150 g (tuỳ chọn), Loft 0–64°, Lie 45–80°, Bounce 0–20° (tuỳ chọn).** Ô tuỳ chọn để trống là hợp lệ và không lưu giá trị.
- Thông báo: ngoài khoảng "Trong khoảng 30–150 g" / "Trong khoảng 0–64°" / "Trong khoảng 45–80°" / "Trong khoảng 0–20°"; gõ chữ "Không phải số"; ô số nguyên (Trọng lượng cán, Bounce) gõ kiểu ngăn nghìn như "1.000" thì "Không dùng dấu chấm ngăn nghìn (vd 1000)". Dưới mỗi ô luôn có "Khoảng hợp lệ …". Nhãn ô: "Trọng lượng cán (g, tuỳ chọn)", "Loft (°)", "Lie (°)", "Bounce (°, tuỳ chọn)".
- Nguồn: `lib/validation.ts:29,35-50,61-66`; `app/clubs/new.tsx:87-101`; `lib/validation.test.ts:79-82`.

**BR-BOGAY-05 — Cách đọc số: dấu phẩy hay dấu chấm đều là dấu thập phân ("10,5" = "10.5").** Code không giới hạn số chữ số thập phân, kể cả ở ô "số nguyên": Bounce "12,5" vẫn lưu là 12,5. Thuộc tính `digits` chỉ dùng để bắt lỗi gõ ngăn nghìn.
- Nguồn: `lib/format.ts:75-79`; `lib/validation.ts:42`; `lib/validation.test.ts:76`.

**BR-BOGAY-06 — Flex.** Mọi loại gậy, kể cả Putter và Tuỳ chỉnh, đều có đúng một giá trị Flex, chọn bằng nhóm chip chọn-một. Form mới chọn sẵn "Regular" và không có cách bỏ chọn.
- Thông báo: nhãn nhóm chip "Flex".
- Nguồn: `app/clubs/new.tsx:79-86`; `lib/validation.ts:110`; `lib/domain.ts:48`; `lib/mock.ts:28` (Putter mẫu có Flex "Stiff").

**BR-BOGAY-07 — Tên gậy tuỳ chỉnh.** Ô "Tên gậy" chỉ hiện khi chọn loại "Tuỳ chỉnh", và chỉ được lưu với loại này (đã bỏ khoảng trắng hai đầu). Đổi gậy tuỳ chỉnh sang loại thường rồi lưu thì tên riêng bị xoá. Gậy thường lấy tên hiển thị theo loại.
- Thông báo: "Bắt buộc"; placeholder "VD: Chipper 37°".
- Nguồn: `app/clubs/new.tsx:75`; `lib/validation.ts:75-76,85`; `lib/selectors.ts:56`; `lib/validation.test.ts:85-87`; F06:52.

**BR-BOGAY-08 — Ô Bounce chỉ hiện khi loại thuộc nhóm Wedge (PW / GW / SW / LW), hoặc khi ô đã có giá trị.** Ô đã có giá trị thì không biến mất, kể cả khi xoá trống hay đổi sang loại khác. Validate không ràng buộc bounce theo loại, nên gậy không phải wedge vẫn lưu được bounce.
- Nguồn: `app/clubs/new.tsx:14,34-37,87`; `lib/validation.ts:60,72-90`.

**BR-BOGAY-09 — Loft gợi ý theo loại (bảng ở §4.6).**
- Chọn hoặc đổi loại: ô Loft đang trống, hoặc vẫn đúng số gợi ý của loại cũ, thì điền gợi ý của loại mới. Người dùng đã tự gõ số khác thì giữ nguyên.
- Đổi sang "Tuỳ chỉnh" mà loft chưa bị sửa tay thì ô Loft thành trống.
- Gợi ý của mọi loại (trừ Tuỳ chỉnh) đều qua được validate.
- Thông báo: trợ giúp ô Loft "Gợi ý cho {loại}: {x}° · khoảng hợp lệ 0–64°" (vd "Gợi ý cho Sắt 7: 31,5° · khoảng hợp lệ 0–64°").
- Nguồn: `lib/validation.ts:92-104`; `app/clubs/new.tsx:33,39-42,91-95`; `lib/validation.test.ts:89-111`.

**BR-BOGAY-10 — Bấm Lưu.**
- Lỗi theo từng ô chỉ hiện sau lần bấm Lưu đầu tiên. Còn lỗi thì hiện dòng tổng và không ghi gì.
- Hợp lệ thì chạy ghi giả lập (BR-CAIDAT-25); nút Lưu khoá trong lúc lưu và sau khi lưu xong.
- Lưu là upsert theo id: id mới thì thêm, id đã có thì thay tại chỗ. Id cố định từ lúc mở form, nên bấm lại hay Thử lại không tạo bản sao.
- Thông báo: "Chưa lưu: {N} trường cần sửa."; "Đang lưu…".
- Nguồn: `app/clubs/new.tsx:18-19,24,30-31,43-55,105-107`; `lib/reducer.ts:53`; `lib/reducer.test.ts:186-195`.

**BR-BOGAY-11 — Lưu thất bại (giả lập): gậy không được ghi, form giữ nguyên những gì đã nhập, có nút thử lại.**
- Thông báo: toast "Lưu thất bại" · "Mất kết nối — gậy chưa được lưu, form giữ nguyên." · "Thử lại".
- Nguồn: `app/clubs/new.tsx:131-140`; `components/Feedback.tsx:36-54`.

**BR-BOGAY-12 — Sau khi lưu.** Thêm xong thì quay lại màn trước (không có thì về `/clubs`). Sửa xong thì quay lại (không có thì về chi tiết gậy). Mở "Thêm gậy mới" từ ô chọn gậy của một form khác thì khi quay lại, gậy vừa thêm được chọn sẵn.
- Nguồn: `app/clubs/new.tsx:152-156`; `app/clubs/[id]/edit.tsx:20-24`; `components/ClubPicker.tsx:19-26,67-75`; F06 bước 06.

**BR-BOGAY-13 — Sửa gậy: chỉ chủ gậy, và chỉ khi gậy chưa lưu trữ.**
- Trường hợp khác (không tìm thấy, không phải chủ, gậy đã lưu trữ) đều bị chuyển về màn chi tiết gậy. Nút "Sửa gậy" (icon trên thanh tiêu đề) chỉ hiện khi sửa được.
- Khi sửa, ô tuỳ chọn để trống (Trọng lượng cán, Bounce) thì xoá giá trị cũ.
- Form sửa điền sẵn số kiểu VN ("10,5"). Mở form rồi lưu nguyên thì gậy không đổi.
- Thông báo: tiêu đề "Sửa gậy", dòng phụ "{tên gậy} · {Hãng} {Model}".
- Nguồn: `app/clubs/[id]/edit.tsx:11-17`; `app/clubs/[id]/index.tsx:57-58,85`; `app/clubs/new.tsx:47`; `lib/validation.ts:81-87,106-112`; `lib/validation.test.ts:113-118`.

#### Quyền xem

**BR-BOGAY-14 — Chỉ chủ gậy, hoặc HLV có kết nối active với chủ gậy, mới xem được bộ gậy và chi tiết gậy** (`canViewPrivate`). Theo dõi không mở quyền. HLV vừa bị huỷ kết nối mất quyền ngay. Cổng này áp ở `/clubs?playerId=`, `/clubs/[id]` và tab "Bộ gậy" của `students/[id]`.
- Thông báo: không có quyền: "Không có quyền xem" · "Chỉ HLV đã kết nối mới xem được dữ liệu này." · "Quay lại"; ở `students/[id]` khi kết nối đã huỷ: "Kết nối với học viên này đã bị huỷ nên bạn không còn xem được dữ liệu của họ.". Gậy không tồn tại: "Không tìm thấy gậy" · "Gậy này không tồn tại." · "Quay lại".
- Nguồn: `lib/selectors.ts:8-10`; `app/clubs/index.tsx:50-61`; `app/clubs/[id]/index.tsx:43-56`; `app/students/[id].tsx:37-44,160-165`; `components/NoAccess.tsx:8-9`; spec D6; tech review:137,244-247.

**BR-BOGAY-15 — HLV chỉ được đọc, và danh sách chỉ có gậy đang dùng.**
- Ở danh sách, HLV không thấy thanh "Đang dùng / Lưu trữ", nút "+" hay danh sách gậy lưu trữ.
- Ở chi tiết gậy, HLV không thấy nút Sửa / Lưu trữ / Khôi phục / Xoá.
- HLV vẫn mở được chi tiết một gậy **đã lưu trữ** qua liên kết "Gậy" ở chi tiết swing. Khi đó băng thông báo không có câu "Khôi phục để dùng lại.".
- Người chơi mở `/clubs` không kèm `playerId` thì xem bộ gậy của mình. Người không phải người chơi mở mà không kèm `playerId` thì bị chuyển về `/`.
- Thông báo: dòng phụ khi HLV xem "{Tên học viên} · {n} gậy". Bộ gậy rỗng khi HLV xem: "Chưa có gậy nào" · "{Tên} chưa thêm gậy vào bộ gậy."; ở tab của `students/[id]`: "Học viên chưa thêm gậy nào.".
- Nguồn: `app/clubs/index.tsx:50-51,62-67,72-84,103-104`; `app/clubs/[id]/index.tsx:57-58,84,88-92,141`; `app/swings/[id].tsx:424-431`; `app/students/[id].tsx:160-165`; F06:51; tech review:137.
- Lệch tài liệu: handoff:32,108 ghi "HLV xem được toàn bộ bộ gậy".

#### Lưu trữ, khôi phục, xoá

**BR-BOGAY-16 — Lưu trữ gậy: chỉ chủ gậy, với gậy đang dùng, sau hộp thoại xác nhận.** Xác nhận xong thì ghi `archivedAt` = thời điểm hiện tại rồi quay lại màn trước. Thao tác ghi ngay: không có pha đang lưu, không giả lập lỗi, không gửi thông báo. Lưu trữ được bất kể gậy đã gắn dữ liệu hay chưa.
- Thông báo: nút "Lưu trữ gậy". Hộp thoại "Lưu trữ gậy này?", nội dung khi gậy đã gắn dữ liệu "Gậy đã gắn với {N} phiên/swing sẽ được ẩn khỏi danh sách, dữ liệu cũ giữ nguyên.", khi chưa gắn "Gậy sẽ được ẩn khỏi danh sách."; nút "Lưu trữ" / "Huỷ".
- Nguồn: `app/clubs/[id]/index.tsx:154-156,170-184`; `lib/reducer.ts:54`; `lib/reducer.test.ts:196-202`.

**BR-BOGAY-17 — Hệ quả của lưu trữ.**
- Gậy lưu trữ bị loại khỏi: lưới Bộ gậy (của chủ và của HLV); ô chọn gậy ở nhập tay / CSV / ảnh / đăng swing; bước tự khớp gậy khi nhập CSV; vòng carry "3 gậy xa nhất" ở Tổng quan.
- Phiên và swing cũ vẫn giữ `clubId` và vẫn hiện tên gậy.
- Biểu đồ tốc độ Driver và phần so sánh với phiên trước cùng gậy **không** loại gậy lưu trữ.
- Sửa một phiên cũ đang gắn gậy lưu trữ: ô chọn gậy vẫn hiện gậy đó và lưu lại được, dù danh sách chọn không có nó.
- Thông báo: chi tiết gậy lưu trữ hiện "Đã lưu trữ ngày {dd/mm/yyyy} — gậy ẩn khỏi danh sách và chọn gậy, dữ liệu cũ giữ nguyên." Người xem là chủ gậy thì thêm " Khôi phục để dùng lại.".
- Nguồn: `lib/selectors.ts:39-52,55`; `components/ClubPicker.tsx:16-17`; `app/metrics/import-csv.tsx:47`; `app/metrics/manual.tsx:33,47`; `app/clubs/[id]/index.tsx:88-92`; `lib/reducer.test.ts:196-202`; `lib/selectors.test.ts:20-21,78`.

**BR-BOGAY-18 — Danh sách gậy lưu trữ chỉ chủ gậy thấy; gậy lưu trữ gần nhất đứng trước.** Lối vào: dòng "Gậy đã lưu trữ" ở Thông số › Bộ gậy (chỉ hiện khi có ít nhất 1 gậy lưu trữ), nút phụ của màn trống, hoặc `/clubs?view=archived` (mở sẵn mục Lưu trữ).
- Thông báo: dòng vào "Gậy đã lưu trữ" · "{n} gậy — khôi phục hoặc xoá". Thanh chọn "Đang dùng ({n})" / "Lưu trữ ({n})". Rỗng: "Chưa lưu trữ gậy nào" · "Gậy lưu trữ ẩn khỏi danh sách chọn gậy nhưng giữ nguyên lịch sử phiên và swing.".
- Nguồn: `lib/selectors.ts:134-136`; `app/(player)/metrics.tsx:29-30,44-52,73`; `app/clubs/index.tsx:48,65-66,73-84,99-100`; MVP:21.

**BR-BOGAY-19 — Khôi phục gậy: chủ gậy bấm "Khôi phục gậy" trên một gậy đã lưu trữ, không cần xác nhận.** `archivedAt` bị xoá, gậy về mục Đang dùng, người dùng ở lại màn chi tiết và nút Sửa hiện lại. Ghi ngay, không giả lập lỗi.
- Thông báo: toast "Đã khôi phục — gậy về danh sách Đang dùng".
- Nguồn: `app/clubs/[id]/index.tsx:143-153,199`; `lib/reducer.ts:146`; `lib/reducer.test.ts:374-381`.

**BR-BOGAY-20 — Chỉ xoá được gậy chưa gắn dữ liệu.**
- Chủ gậy chỉ xoá được khi `clubLinkCount = 0`, tức không có phiên số liệu hay swing nào gắn gậy. Áp cho cả gậy đang dùng lẫn gậy lưu trữ.
- Phải xác nhận. Xoá là vĩnh viễn.
- Reducer kiểm lại điều kiện lúc ghi: gậy đã gắn dữ liệu thì lệnh xoá không làm gì.
- Gậy đã gắn dữ liệu thì không có nút Xoá, chỉ lưu trữ được.
- Số liên kết tính theo dữ liệu hiện tại: xoá hết phiên / swing gắn gậy thì gậy lại xoá được.
- Thông báo: hộp thoại "Xoá gậy này?" · "Gậy chưa gắn với phiên hay swing nào. Xoá xong không khôi phục được." · "Xoá" / "Huỷ". Khi đã gắn dữ liệu, thay nút Xoá bằng dòng "Gậy đã gắn với {N} phiên/swing nên chỉ lưu trữ được — không xoá để giữ lịch sử.".
- Nguồn: `lib/selectors.ts:137-139`; `lib/reducer.ts:147`; `app/clubs/[id]/index.tsx:157-166,185-198`; `lib/reducer.test.ts:382-388`; tech review:210; F06:50 và bước 12–14.
- Lệch tài liệu: handoff:107 ghi "Mỗi gậy có thể xoá (icon thùng rác)".

**BR-BOGAY-21 — Diễn biến khi xoá.** Xoá là ghi giả lập; trong lúc chờ, nút Xoá khoá và hiện "Đang xoá…". Thành công thì quay lại màn trước; gậy chỉ bị gỡ khỏi dữ liệu sau khi màn chi tiết đã đóng (để màn không nháy "Không tìm thấy gậy"). Thất bại (giả lập) thì gậy vẫn còn và có nút thử lại.
- Thông báo: "Đang xoá…"; thất bại: toast "Xoá thất bại" · "Mất kết nối — gậy vẫn còn." · "Thử lại".
- Nguồn: `app/clubs/[id]/index.tsx:27-42,159-160,200-209`; `components/useOnLeave.ts:3-16`; `components/Feedback.tsx:36-54`.

#### Gậy ở các form khác

**BR-BOGAY-22 — Ô chọn gậy (`ClubPicker`) chỉ liệt kê gậy đang dùng của chính người chơi, nhóm theo danh mục, kèm mục "Thêm gậy mới".** Ô này bắt buộc ở: nhập tay phiên swing (trừ khi sửa một phiên vốn chưa gắn gậy), nhập CSV, nhập ảnh, đăng swing.
- Thông báo: placeholder "Chọn gậy"; chưa có gậy nào "Chưa có gậy — thêm gậy mới"; sheet "Chọn gậy"; chưa chọn "Bắt buộc". Riêng đăng swing có thêm "Chưa tải lên: chọn gậy cho video này.".
- Nguồn: `components/ClubPicker.tsx:11-18,29-37,67-75`; `app/metrics/manual.tsx:46-47,95`; `app/metrics/import-csv.tsx:159`; `app/metrics/import-photo.tsx:52,142`; `app/swings/new.tsx:156,165`; F06 bước 05–07.

**BR-BOGAY-23 — Tự khớp gậy khi nhập CSV.** Tên ở cột "Club" của dòng hợp lệ đầu tiên được đổi sang loại gậy: "Driver", "Putter", "{n} Wood/Hybrid/Iron", "PW / Pitching Wedge / Sand Wedge…". Nếu người dùng chưa tự chọn gậy, app lấy gậy **đang dùng** đầu tiên có cùng loại. Không khớp thì người dùng phải chọn. Gậy "Tuỳ chỉnh" không bao giờ được tự khớp. Một file CSV chỉ gắn một gậy.
- Thông báo: không khớp thì ô Gậy báo "Bắt buộc" (như BR-BOGAY-22).
- Nguồn: `lib/csv.ts:31-43`; `app/metrics/import-csv.tsx:45-47`.

**BR-BOGAY-24 — Sắp xếp và nhóm.** Lưới gậy và sheet chọn gậy xếp theo nhóm Gỗ → Hybrid → Sắt → Wedge → Putter → Khác, bỏ nhóm không có gậy. Trong nhóm, gậy xếp theo thứ tự loại; cùng loại thì theo thứ tự thêm vào. Lưới hiển thị 2 cột.
- Nguồn: `lib/selectors.ts:57-59`; `app/clubs/index.tsx:13-41`; `lib/selectors.test.ts:80-89`.

**BR-BOGAY-25 — Không giới hạn số lượng và không chống trùng.** Code không chặn hai gậy cùng loại (vd hai Driver), không chặn trùng tên gậy tuỳ chỉnh, không giới hạn tổng số gậy, không giới hạn độ dài ô chữ.
- Nguồn: `lib/validation.ts:72-90` (không có các kiểm tra này); `lib/reducer.ts:53`.

**BR-BOGAY-26 — Thêm / sửa / lưu trữ / khôi phục / xoá gậy không tạo thông báo cho ai, kể cả HLV đang kết nối.**
- Nguồn: `lib/reducer.ts:53-54,146-147` (cả 4 nhánh không gọi `notify`).

**BR-BOGAY-27** — *Đã gộp vào BR-CAIDAT-11* (công tắc "Công khai bộ gậy" chỉ được lưu, chưa có tác dụng).

### 5.5 Swing video — đăng, tải lên, phân tích, ghi chú HLV, xoá (`BR-SWING`)

#### Đăng swing

**BR-SWING-01 — Chỉ người chơi đăng swing.** Tài khoản không có vai `player` mở `/swings/new` thì bị chuyển về `/`. HLV không có nút đăng swing. Reducer `addSwing` không kiểm vai (chỉ UI chặn).
- Nguồn: `app/swings/new.tsx:42`; `app/(player)/swings.tsx:65,109`; `lib/reducer.ts:55`; spec:80.

**BR-SWING-02 — Hướng dẫn quay đứng trước bước chọn video.** Màn đăng có 3 bước "Hướng dẫn quay" → "Chọn video" → "Tải lên". Bước 1 nêu 4 điều kiện quay; người chơi bấm "Tiếp tục" để sang bước 2. Ở bước 2, nút "Hướng dẫn" quay về bước 1.
- Thông báo: "60 fps trở lên" · "Toàn thân và đầu gậy" · "Face-on hoặc down-the-line" · "Tránh ngược sáng"; minh hoạ "Cả người và đầu gậy nằm trọn trong khung".
- Nguồn: `app/swings/new.tsx:19-27,105-107,122,167`; tech review:289-297 (§8.3).

**BR-SWING-03 — Kiểm file ngay khi chọn.** File có MIME không bắt đầu bằng `video/` bị từ chối trước. Sau đó, file lớn hơn 300 MB bị từ chối. Khi từ chối, video đang chọn được giữ nguyên và Dialog lỗi hiện ra. Thời lượng video không bị kiểm.
- Thông báo: quá dung lượng: "Video quá dung lượng" · "`<tên file>` nặng `<dung lượng>` — tối đa 300 MB. Cắt ngắn đoạn swing hoặc quay ở 1080p rồi chọn lại."; không phải video: "File không phải video" · "`<tên file>` là ảnh, không phân tích swing được. Chọn một video (.mp4, .mov)."; nút "Chọn video khác".
- Nguồn: `lib/validation.ts:259-264`; `app/swings/new.tsx:142-151,203-217`; `lib/validation.test.ts:256-263`; MVP:44 (M6.5); F07:16-17,51.
- Lệch tài liệu: handoff:98 ghi người chơi "chọn file video/ảnh". Code từ chối ảnh.

**BR-SWING-04 — Gậy bắt buộc.** Chỉ chọn được gậy chưa lưu trữ của chính mình, xếp theo nhóm (BR-BOGAY-22). Mục "Thêm gậy mới" mở `/clubs/new`; quay lại thì gậy vừa thêm được chọn sẵn. Bấm "Tải lên" khi chưa chọn gậy thì không tạo swing và hiện lỗi.
- Thông báo: ô Gậy "Bắt buộc"; chân màn "Chưa tải lên: chọn gậy cho video này."; placeholder "Chọn gậy" hoặc "Chưa có gậy — thêm gậy mới".
- Nguồn: `app/swings/new.tsx:47-48,156,165`; `components/ClubPicker.tsx:16,21-26,31,69-73`; F07:38 (07b).

**BR-SWING-05 — Ngày quay mặc định là hôm nay; chỉ chọn được từ hôm nay trở về trước theo ngày lịch VN (UTC+7).** Không giới hạn ngày cũ nhất.
- Nguồn: `app/swings/new.tsx:39,157`; `components/SessionEntry.tsx:10-28`; `lib/format.ts:43-52`.

**BR-SWING-06 — Góc quay là face-on hoặc down-the-line.** Khi chọn video, góc quay tự lấy theo video đó; người chơi đổi được bằng Segmented "Góc quay".
- Nguồn: `app/swings/new.tsx:20,35,150,158-161`; `lib/domain.ts:56-57`.

**BR-SWING-07 — Swing được tạo khi bấm "Tải lên".** Đã chọn gậy thì hệ thống tạo swing với tải lên `uploading` 0 % và job `none`, rồi chuyển sang bước 3. Màn đăng giữ một id swing cố định, nên bấm lần nữa không tạo thêm swing.
- Nguồn: `app/swings/new.tsx:38,46-57`.

**BR-SWING-08 — Swing đã đăng không sửa được.** Không có thao tác sửa gậy, ngày hay góc quay của swing. Muốn đổi thì xoá rồi đăng lại.
- Nguồn: danh sách action `lib/reducer.ts:6-36` (có `addSwing`, `uploadUpdate`, `jobUpdate`, `deleteSwing`; không có action sửa swing).

#### Tải lên

**BR-SWING-09 — Chỉ chủ swing điều khiển tải lên: tạm dừng khi đang tải, tiếp tục khi đã dừng, thử lại khi lỗi.** Tiến độ được giữ nguyên qua mọi chuyển trạng thái. HLV có kết nối chỉ thấy thanh tiến độ: không có nút, và máy của HLV không chạy tiếp việc tải.
- Thông báo: "Đang tải lên `X%`" + "Tạm dừng"; "Đã tạm dừng ở `X%`" + "Tiếp tục"; "Lỗi tải lên ở `X%`" + "Thử lại"; "Đã tải lên".
- Nguồn: `components/SwingUpload.tsx:11-16,18-20,27-28,40,45-53`; `app/swings/[id].tsx:481`; tech review:163; spec:80.

**BR-SWING-10 — Lỗi tải lên thì tải tiếp từ chỗ dừng.** Lỗi mạng thì giữ tiến độ tại điểm lỗi; "Thử lại" tải tiếp từ đó, không tải lại từ đầu.
- Thông báo: "Mất kết nối khi đang tải lên. Kiểm tra mạng rồi thử lại — video tải tiếp từ chỗ dừng."
- Nguồn: `components/SwingUpload.tsx:44,51`; `lib/simulate.ts:72-78`; `lib/simulate.test.ts:26-38`; F07:20.

**BR-SWING-11 — Báo HLV khi tải xong.** Lần đầu tải lên chuyển sang `done`, mỗi HLV có kết nối **active** với người chơi (cả chính lẫn phụ) nhận một thông báo `swing_uploaded` (actor = người chơi, ref = swing). Các nhịp tải giữa chừng không tạo thông báo. Gửi lại `done`, hoặc lỗi rồi thử lại tới `done`, cũng chỉ báo 1 lần. HLV có kết nối đang chờ hoặc đã huỷ không nhận. Chi tiết ở §7.
- Thông báo: "`<tên học viên>` vừa tải lên swing mới".
- Nguồn: `lib/reducer.ts:56-66`; `lib/reducer.test.ts:292-311`; `components/NotificationsScreen.tsx:24`; MVP:33 (M4.7); F08:13.

**BR-SWING-12 — Phải tải xong mới phân tích và ghi chú được.** Video chưa tải xong thì màn chi tiết chỉ hiện tiến độ tải lên kèm câu giải thích, không có mục video, gậy, phân tích, ghi chú hay ô ghi chú cho HLV. Trên màn đăng, nút "Phân tích ngay" / "Để sau" chỉ hiện khi đã tải xong. Reducer `addNote` / `jobUpdate` không kiểm trạng thái tải lên (chỉ UI chặn).
- Thông báo: "Video cần tải lên xong trước khi phân tích và nhận ghi chú HLV."
- Nguồn: `app/swings/[id].tsx:233,392,479-486,488`; `app/swings/new.tsx:183-191`; `lib/reducer.ts:67-83`.

#### Phân tích

**BR-SWING-13 — Tải xong thì màn đăng cho 2 lựa chọn: phân tích ngay hoặc để sau.** "Phân tích ngay" đưa job vào `queued` (0 %); "Để sau" giữ job ở `none`. Cả hai đều thay màn đăng bằng màn chi tiết swing, nên quay lại sẽ về danh sách.
- Thông báo: "Kết quả là ước lượng từ video, không phải đo đạc"; nút "Để sau" và "Phân tích ngay".
- Nguồn: `app/swings/new.tsx:58-62,183-191`; F08:11.

**BR-SWING-14 — Chỉ chủ swing yêu cầu phân tích.** Khi job ở `none`, chủ swing thấy nút "Phân tích swing" (đưa job vào `queued`, giữ tiến độ hiện tại). HLV chỉ thấy một câu thông tin. Reducer `jobUpdate` không kiểm người gọi.
- Thông báo: chủ swing: "Kết quả là ước lượng từ video, không phải đo đạc" + "Phân tích swing"; HLV: "Học viên chưa yêu cầu phân tích swing này."
- Nguồn: `app/swings/[id].tsx:231,266-267,310-320`; `lib/reducer.ts:67-75`.

**BR-SWING-15 — Đang phân tích.** `queued` và `processing` đều hiện thanh tiến độ, và thẻ swing ghi "Đang phân tích". Bản mock chỉ chạy job khi màn chi tiết đang mở trên máy người có quyền xem (chủ swing **hoặc** HLV active). Rời màn thì job dừng; mở lại thì chạy tiếp từ tiến độ đã lưu.
- Thông báo: "Đang phân tích… thường mất dưới 1 phút".
- Nguồn: `app/swings/[id].tsx:210-229,321-327`; `components/SwingCard.tsx:11-12`; `lib/simulate.ts:80-92`; spec D8; F07:53.
- Lệch tài liệu: F08:47 ghi "người chơi phải ở màn swing ~3 giây". Code chạy job trên màn của bất kỳ ai có quyền xem.

**BR-SWING-16 — Lỗi phân tích.** Job `failed` thì mọi người xem đều thấy thông báo lỗi, và video không mất. Chỉ chủ swing có nút "Thử lại": job về `queued` và chạy tiếp từ tiến độ lúc lỗi. Job lỗi không tạo thông báo.
- Thông báo: "Phân tích chưa thành công. Video vẫn được giữ — thử lại sau ít phút."; "Thử lại"; badge thẻ "Lỗi phân tích".
- Nguồn: `app/swings/[id].tsx:266-267,328-334`; `lib/simulate.ts:83-88`; `lib/simulate.test.ts:53-63`; `lib/reducer.ts:72-74`; F07:28.

**BR-SWING-17 — Kết quả thành công (`succeeded`).** Mục Phân tích hiện theo thứ tự:
1. tag "Độ tin cậy `N%`" và "`fps` fps · `góc quay`";
2. 3 ô Tempo, Backswing (ms), Downswing (ms);
3. "Mặt phẳng swing";
4. câu nhắc kết quả chỉ là ước lượng;
5. "Gợi ý theo mốc", khi có tip. Chạm một gợi ý thì video tua tới `startSec` của gợi ý.
- Thông báo: "Kết quả là ước lượng từ video, không phải đo đạc"; badge thẻ "Đã phân tích".
- Nguồn: `app/swings/[id].tsx:300-305,345-377`; `components/SwingCard.tsx:13`; spec D8, spec:81; tech review:173; F07:22-23.

**BR-SWING-18 — Cần xem lại (`needs_review`).** Video không đủ rõ thì mục Phân tích hiện banner cảnh báo kèm 2 tag (độ tin cậy; fps · góc quay). Không hiện tempo, mặt phẳng hay gợi ý; 4 mốc vẫn có trên timeline. Chủ swing có nút "Quay lại hướng dẫn" để mở màn đăng một swing **mới**. Không có nút phân tích lại cùng video.
- Thông báo: "Video chưa đủ rõ — thử quay lại theo hướng dẫn"; "Quay lại hướng dẫn"; badge thẻ "Cần xem lại".
- Nguồn: `app/swings/[id].tsx:335-344,422`; `lib/simulate.ts:47-58`; `components/SwingCard.tsx:14`; F07:27.

**BR-SWING-19 — Báo người chơi khi phân tích xong.** Job **lần đầu** vào `succeeded` hoặc `needs_review` thì chủ swing nhận đúng 1 thông báo `analysis_done`. Đây là thông báo hệ thống, không có actor. Hai màn cùng nhận trạng thái cuối thì vẫn chỉ báo 1 lần.
- Thông báo: "Phân tích swing đã xong".
- Nguồn: `lib/reducer.ts:67-75`; `lib/reducer.test.ts:148-153,176-182`; `components/NotificationsScreen.tsx:15,22`.

**BR-SWING-20 — Timeline 4 mốc và tua.** Có kết quả thì timeline đánh dấu 4 mốc Chuẩn bị · Đỉnh · Chạm bóng · Kết thúc; mỗi nhãn mốc là một nút tua. Chấm ghi chú HLV hiện theo `atSec`, chỉ để nhìn. Mọi lần tua đều dừng phát và kẹp vị trí về độ dài video.
- Thông báo: chưa có kết quả: "Phân tích xong sẽ đánh dấu 4 mốc: Chuẩn bị · Đỉnh · Chạm bóng · Kết thúc".
- Nguồn: `app/swings/[id].tsx:23-28,62-143,238-241`; spec:81; MVP:20 (M3.4).

#### Ghi chú HLV

**BR-SWING-21 — Chỉ HLV có kết nối active với chủ swing (chính hoặc phụ) mới thêm được ghi chú.**
- Người chơi không tự ghi chú.
- HLV đã bị huỷ kết nối bị reducer từ chối: không có ghi chú mới, không có thông báo.
- Ô ghi chú chỉ hiện cho HLV, và chỉ khi video đã tải xong. Swing chưa phân tích vẫn ghi chú được.
- Nguồn: `lib/reducer.ts:78-83`; `lib/reducer.test.ts:340-348`; `app/swings/[id].tsx:232,488`; tech review:250,253-254; spec D6.

**BR-SWING-22 — Nội dung ghi chú được bỏ khoảng trắng hai đầu và không được rỗng.** Ô nhập giới hạn 500 ký tự khi gõ.
- Thông báo: "Nhập nội dung ghi chú"; placeholder "Ghi chú tại `X s`" (khi sửa: "Sửa ghi chú").
- Nguồn: `app/swings/[id].tsx:268-270,514,522-523`; F08:35 (08a).

**BR-SWING-23 — Mốc thời gian của ghi chú.**
- Nút "Chèn mốc `X s`" thêm `[x,y s]` (vị trí đang phát) vào cuối nội dung, cách chữ trước 1 khoảng trắng.
- Mốc của ghi chú là mốc `[…s]` đầu tiên trong nội dung. Mốc gõ tay như `[1,6s]` hay `[1.6 s]` cũng được nhận, tối đa 2 chữ số thập phân.
- Không có mốc nào thì lấy vị trí đang phát, làm tròn 0,01 s.
- Mốc vượt độ dài video thì kẹp về cuối video. UI kẹp, và reducer kẹp lại lần nữa.
- Thông báo: trợ giúp "Ghi chú tại `X s`".
- Nguồn: `lib/format.ts:80-85`; `app/swings/[id].tsx:242-243,501-511,524`; `lib/reducer.ts:40-41,82`; `lib/format.test.ts:118`; `lib/reducer.test.ts:334-340`; MVP:31 (M4.5); F08:17.

**BR-SWING-24 — Gửi ghi chú thành công thì chủ swing nhận thông báo `coach_note` (actor = HLV, ref = swing), và ô nhập được xoá trắng.** Thêm ghi chú áp dụng ngay, không qua ghi giả lập.
- Thông báo: xác nhận "Đã gửi ghi chú tại `X s`"; thông báo "`<tên HLV>` đã ghi chú swing của bạn".
- Nguồn: `lib/reducer.ts:82`; `app/swings/[id].tsx:277-280`; `components/NotificationsScreen.tsx:17`; `lib/reducer.test.ts:142-147`; spec:107; F08:24.

**BR-SWING-25 — Sửa ghi chú: chỉ tác giả, và chỉ khi còn kết nối active.**
- Nội dung mới được bỏ khoảng trắng hai đầu. Rỗng hoặc giống hệt bản cũ thì không thay đổi gì và không gắn "đã sửa".
- Mốc lấy theo `[…s]` đầu tiên trong nội dung mới; không có thì giữ mốc cũ. Vẫn kẹp về độ dài video.
- Lưu thành công thì gắn `editedAt`. Sửa **không** gửi lại thông báo, và áp dụng ngay (không qua ghi giả lập).
- Bản nháp ghi chú mới đang gõ dở được cất lại khi bấm "Sửa", và trả về ô nhập khi Huỷ sửa, khi lưu, hoặc khi xoá chính ghi chú đang sửa.
- Thông báo: "Đang sửa ghi chú tại `X s`" + "Huỷ sửa"; xác nhận "Đã lưu ghi chú"; dòng meta thêm "đã sửa".
- Nguồn: `lib/reducer.ts:148-158`; `lib/reducer.test.ts:313-339`; `app/swings/[id].tsx:181-182,271-276,282-294,441,492-498`; MVP:37 (M5.4); F08:19-20,45.

**BR-SWING-26 — Xoá ghi chú: chỉ tác giả còn kết nối active, qua Dialog xác nhận.** Ghi giả lập 0,6 s; bật giả lập lỗi thì xoá thất bại và hiện toast có "Thử lại". Trong lúc chờ, nút Sửa / Xoá bị khoá. Xoá **không** thu hồi thông báo `coach_note` đã gửi.
- Thông báo: Dialog "Xoá ghi chú này?" · "Học viên sẽ không còn thấy ghi chú này. Không khôi phục được." · "Xoá" / "Huỷ"; xoá xong "Đã xoá ghi chú"; lỗi: toast "Xoá thất bại" · "Mất kết nối — ghi chú vẫn còn." · "Thử lại".
- Nguồn: `lib/reducer.ts:148-154`; `lib/reducer.test.ts:349-351`; `app/swings/[id].tsx:255-265,463-464,548-561`; `components/Feedback.tsx:38-54`; `lib/simulate.ts:134`; MVP:38 (M5.5); F08:20-21,45.

**BR-SWING-27 — Ai qua được cổng xem swing (chủ swing, HLV active) đều thấy mọi ghi chú của mọi HLV trên swing đó, xếp theo mốc tăng dần.** Ghi chú không có mốc tính là 0.
- Mỗi ghi chú hiện: avatar, tên tác giả (thiếu tên thì ghi "HLV"), dòng meta "Tại `X s` · `thời gian tương đối` · đã sửa", nội dung; mỗi mốc trong nội dung thành một chip "Tua tới `X s`".
- Chạm ghi chú có mốc thì video tua tới mốc đó.
- Nút Sửa / Xoá chỉ hiện cho tác giả. HLV khác (kể cả HLV chính) không có.
- Ghi chú của HLV đã bị huỷ kết nối vẫn còn và vẫn hiện cho người chơi.
- Thông báo: chưa có ghi chú: với HLV "Chưa có ghi chú. Tua tới mốc cần nhận xét, bấm Chèn mốc rồi viết ghi chú ở dưới."; với người chơi "Chưa có ghi chú từ HLV."
- Nguồn: `lib/selectors.ts:62`; `app/swings/[id].tsx:436-477`; F08:23; MVP:20 (M3.4).

**BR-SWING-28 — Thẻ "Ghi chú mới từ HLV" ở Tổng quan người chơi lấy ghi chú có `createdAt` mới nhất trên các swing của chính người chơi.** Chạm thẻ thì mở swing đó, nhưng chưa tự tua tới mốc.
- Nguồn: `lib/selectors.ts:63-64`; `app/(player)/home.tsx:82-84,194-209`; F08:48.

#### Review của HLV

**BR-SWING-29** — *Đã gộp vào BR-KETNOI-37* (Đã review / Chưa review).

**BR-SWING-30** — *Đã gộp vào BR-KETNOI-36* ("Cần phản hồi" và badge trên thẻ swing).

#### Quyền xem

**BR-SWING-31 — Chi tiết swing chỉ mở cho chủ swing hoặc HLV có kết nối active với chủ swing** (BR-KETNOI-27). Theo dõi không mở quyền. HLV bị huỷ kết nối mất quyền ngay. Cổng quyền đứng trước mọi effect của màn, nên người không có quyền không làm job chạy được.
- Swing không tồn tại → màn 404 riêng.
- Swing đính kèm bài viết: người không có quyền chỉ thấy thẻ khoá.
- Thông báo cũ trỏ tới swing (vd HLV đã bị huỷ kết nối) vẫn mở được, nhưng ra 403.
- Thông báo: 403 "Không có quyền xem" · "Chỉ HLV đã kết nối mới xem được dữ liệu này." · "Quay lại"; 404 "Không tìm thấy swing" · "Swing này không tồn tại hoặc đã bị xoá." · "Quay lại"; trong bài viết "Swing riêng tư" · "Chỉ người chơi và HLV đã kết nối xem được swing này."
- Nguồn: `lib/selectors.ts:8-10`; `app/swings/[id].tsx:145-169`; `components/NoAccess.tsx:8-9`; `app/posts/[id].tsx:111-121`; spec D5, D6, spec:108; tech review:248-250; F08:36 (13a).

#### Xoá swing

**BR-SWING-32 — Chỉ chủ swing có nút thùng rác "Xoá swing" trên header, qua Dialog xác nhận.** Xoá được ở mọi trạng thái tải lên hay phân tích.
- Ghi giả lập 0,6 s, hiện "Đang xoá…". Bấm thùng rác lần nữa trong lúc chờ không có tác dụng.
- Thành công: quay lại màn trước (không có lịch sử thì về tab Swing). Swing chỉ bị xoá khỏi dữ liệu **sau khi** màn đã rời.
- Lỗi: toast có "Thử lại".
- Thông báo: Dialog "Xoá swing này?". Nội dung khi có ghi chú: "Video, kết quả phân tích và `n` ghi chú HLV sẽ bị xoá, không khôi phục được."; khi không có: "Video và kết quả phân tích sẽ bị xoá, không khôi phục được.". Nút "Xoá" / "Huỷ". Lỗi: "Xoá thất bại" · "Mất kết nối — swing vẫn còn." · "Thử lại".
- Nguồn: `app/swings/[id].tsx:186,231,244-254,383-389,530-547`; `components/useOnLeave.ts:3-16`; `components/Feedback.tsx:38-54`; MVP:38 (M5.5); F07:25-26,43; báo cáo:33,71.

**BR-SWING-33 — Hệ quả khi xoá swing.**
- Xoá theo: mọi ghi chú HLV của swing; mọi thông báo có `refId` = swing (`swing_uploaded`, `analysis_done`, `coach_note`) (BR-CONGDONG-41).
- **Không** xoá: bài viết đính kèm swing. Bài vẫn giữ `swingId` nhưng không hiện thẻ swing nữa.
- Gậy bớt 1 liên kết. Gậy hết liên kết thì xoá hẳn được; còn liên kết thì chỉ lưu trữ được.
- Nguồn: `lib/reducer.ts:76-77,147`; `lib/reducer.test.ts:163-175`; `app/posts/[id].tsx:60,111`; `lib/selectors.ts:137-139`; tech review:210.

#### Danh sách và liên kết

**BR-SWING-34 — Tab Swing của người chơi chỉ liệt kê swing của chính người chơi, mặc định mới → cũ theo ngày quay.**
- Hai chế độ hiển thị: Danh sách / Lưới 2 cột.
- Lọc: Tất cả, 7 ngày, 30 ngày. Khoảng lọc tính lùi n × 24 giờ từ hiện tại, gồm cả mốc biên.
- Chip đảo thứ tự "Mới nhất trước" / "Cũ nhất trước".
- Nút nổi "Đăng swing". Lần đầu mở tab hiện khung xương.
- Thông báo: trống "Chưa có swing nào" · "Quay video swing theo hướng dẫn rồi đăng lên để nhận phân tích ước lượng và ghi chú từ HLV." · "Đăng swing"; lọc rỗng "Không có swing nào trong `7 ngày|30 ngày` qua."
- Nguồn: `app/(player)/swings.tsx:14-22,54-125`; `lib/selectors.ts:61,126-133`; `lib/selectors.test.ts:122`; MVP:18 (M3.2); F07:12-14,52.

**BR-SWING-35 — Badge trạng thái của swing.** Chưa tải xong thì badge theo tải lên: "Đang tải `X%`", "Tạm dừng", "Lỗi tải lên". Đã tải xong thì badge theo job: "Chưa phân tích", "Đang phân tích", "Đã phân tích", "Cần xem lại", "Lỗi phân tích". Thẻ hiện tên gậy hoặc "Chưa gắn gậy"; thẻ dạng danh sách (`SwingCard`) hiện thêm số ghi chú HLV, ô dạng lưới thì không.
- Thông báo: "`n` ghi chú HLV"; "Chưa gắn gậy".
- Nguồn: `components/SwingCard.tsx:9-22,50,56`; `app/(player)/swings.tsx:25-52`; spec:79.

**BR-SWING-36 — Mục "Gậy" trên chi tiết swing hiện loại gậy · hãng mẫu, cùng Loft, Lie, cán, flex.** Chạm vào thì mở chi tiết gậy; HLV active cũng mở được. Gậy đã lưu trữ vẫn hiện ở đây. Chi tiết gậy liệt kê 3 swing gần nhất dùng gậy đó.
- Nguồn: `app/swings/[id].tsx:424-434`; `lib/selectors.ts:54`; `app/clubs/[id]/index.tsx:17,60,107-121`; MVP:19 (M3.3).

**BR-SWING-37** — *Đã gộp vào BR-CONGDONG-05* (đính kèm swing vào bài viết).

**BR-SWING-38 — Chạm thông báo `swing_uploaded`, `coach_note` hoặc `analysis_done` thì mở `/swings/<refId>` và đánh dấu đã đọc.** Thông báo có actor bị chặn (một trong hai chiều) bị ẩn; `analysis_done` không có actor nên không bao giờ bị ẩn. Công tắc theo loại ở Cài đặt › Thông báo chỉ áp cho **push**: người chơi thấy "Ghi chú của HLV" và "Phân tích swing xong", HLV thấy "Học viên đăng swing mới". Danh sách trong chuông vẫn đủ mọi loại.
- Nguồn: `components/NotificationsScreen.tsx:33-39,62-69`; `lib/selectors.ts:88-90`; `app/settings/notifications.tsx:10-14,22,33`; MVP:26 (M3.10).

### 5.6 Cộng đồng và thông báo (`BR-CONGDONG`)

Cộng đồng nằm ngoài MVP issue #1; phần đã làm được giữ nguyên (F10:59).

#### Bài viết

**BR-CONGDONG-01 — Mọi người dùng đã đăng nhập, người chơi hay HLV, đều đăng được bài bằng nút nổi "Đăng bài" ở Cộng đồng › Bảng tin.** Hai vai dùng chung một màn. Chưa đăng nhập thì bị chuyển về `/`.
- Nguồn: `components/CommunityScreen.tsx:14-16,75-77`; `app/(player)/community.tsx:2`; `app/(coach)/community.tsx:2`; `app/community/compose.tsx:30`; handoff:120.

**BR-CONGDONG-02 — Tiêu đề bắt buộc, 1–120 ký tự sau khi bỏ khoảng trắng hai đầu.** Ô nhập cũng chặn gõ quá 120 ký tự. Lỗi theo trường chỉ hiện sau lần bấm "Đăng" đầu tiên.
- Thông báo: "Bắt buộc" · "Tối đa 120 ký tự".
- Nguồn: `lib/validation.ts:231,235-244`; `app/community/compose.tsx:31-32,47,65`; `lib/validation.test.ts:221-226`.

**BR-CONGDONG-03 — Nội dung bắt buộc, 1–2000 ký tự sau khi bỏ khoảng trắng hai đầu.** Bộ đếm `n/2000 ký tự` dưới ô đếm cả khoảng trắng.
- Thông báo: "Bắt buộc" · "Tối đa 2000 ký tự".
- Nguồn: `lib/validation.ts:232,238,242`; `app/community/compose.tsx:66-74`; `lib/validation.test.ts:221-226`.

**BR-CONGDONG-04 — Tag không bắt buộc.** Chuỗi gõ vào được tách thành tag theo dấu phẩy hoặc phím Enter, rồi chuẩn hoá: bỏ `#` ở đầu và khoảng trắng hai đầu; gộp nhiều khoảng trắng thành một; chuyển chữ thường; bỏ tag rỗng và tag trùng. Một bài có tối đa 5 tag; phần vượt bị bỏ mà không báo lỗi. Đủ 5 tag thì ô nhập bị khoá. Chạm một chip để bỏ tag đó. Chữ còn trong ô (chưa Enter hay phẩy) lúc bấm Đăng vẫn được tính thành tag.
- Thông báo: không có lỗi. Placeholder khi đủ "Đã đủ 5 tag"; gợi ý "Enter hoặc dấu phẩy để thêm · chạm tag để bỏ"; nhãn ô "Tag (n/5)".
- Nguồn: `lib/validation.ts:233,245-250`; `app/community/compose.tsx:39-45,50-51,75-97`; `lib/validation.test.ts:227-232`; handoff:120.

**BR-CONGDONG-05 — Đính kèm swing là tuỳ chọn, tối đa 1 swing mỗi bài.** *(Gộp BR-SWING-37.)* Danh sách chọn chỉ gồm swing **của chính người đăng** đã tải lên xong (`upload.status = 'done'`), bất kể trạng thái phân tích. Không có swing nào như vậy thì ô chọn bị ẩn. Mỗi lựa chọn hiện `<tên gậy | Chưa gắn gậy> · dd/mm/yyyy`, kèm góc quay. Chưa đính kèm được ảnh hay video khác.
- Thông báo: ô chọn "Đính kèm swing (tuỳ chọn)" / "Không đính kèm".
- Nguồn: `app/community/compose.tsx:24,33-38,98-128`; `lib/domain.ts:75`; F10:14,64.
- Lệch tài liệu: spec:89 ghi "đính kèm swing/ảnh (mock)". Code chỉ đính kèm swing.

**BR-CONGDONG-06 — Gửi bài là ghi giả lập 600 ms (BR-CAIDAT-25); trong lúc đó nút bị khoá và hiện "Đang đăng…".**
- Thành công: gọi `addPost`, bài mới lên đầu danh sách. Toast "Đã đăng bài" hiện trên màn Đăng bài, rồi app quay về bảng tin.
- Thất bại (chỉ khi bật Dev › giả lập lỗi): bài không được ghi, nội dung form giữ nguyên, toast lỗi có nút thử lại.
- Đăng bài không sinh thông báo cho người theo dõi.
- Thông báo: "Đăng bài thất bại" · "Mất kết nối — bài chưa được đăng, nội dung giữ nguyên." · "Thử lại".
- Nguồn: `app/community/compose.tsx:46-59,107-108,129-139`; `components/Feedback.tsx:36-54`; `lib/simulate.ts:134`; `lib/reducer.ts:113`; F10:62-63.

**BR-CONGDONG-07 — Bảng tin của người dùng U gồm bài của chính U và bài của những người U đang theo dõi, xếp mới → cũ theo `createdAt`.** Bài của người đã chặn U, hoặc bị U chặn, bị loại. Trên bảng tin, nội dung bị cắt còn 4 dòng; chạm bài hoặc nút Bình luận để mở chi tiết. Lần đầu mở bảng tin trong phiên hiện khung xương 400 ms. Bảng tin chưa phân trang.
- Thông báo: bảng tin rỗng: "Chưa có bài viết" · "Theo dõi người chơi và HLV để thấy bài của họ ở đây, hoặc đăng bài đầu tiên của bạn." · nút "Khám phá người chơi" (sang tab Khám phá).
- Nguồn: `lib/selectors.ts:74-75`; `components/CommunityScreen.tsx:28-32,56-73`; `components/PostItem.tsx:58-62,85`; `lib/reducer.test.ts:92-101`; tech review:181.

**BR-CONGDONG-08 — Mục "Bài đăng" ở hồ sơ công khai (người chơi hoặc HLV) và ở tab Hồ sơ của HLV liệt kê mọi bài của tác giả, mới → cũ.** Người xem không cần theo dõi tác giả. Hai người đã chặn nhau thì mục này bị ẩn. Tab Hồ sơ của người chơi không có mục bài đăng; người chơi thấy bài của mình ở bảng tin.
- Thông báo: "Chưa có bài đăng."; chú thích "n bài".
- Nguồn: `components/PostItem.tsx:126-146`; `lib/selectors.ts:76`; `app/users/[id].tsx:67`; `app/coaches/[id].tsx:92`; `app/(coach)/me.tsx:33`.

**BR-CONGDONG-09 — Bài không tồn tại, hoặc người xem và tác giả đã chặn nhau (chiều nào cũng vậy): màn chi tiết bài thay toàn bộ nội dung bằng thông báo trạng thái kèm nút "Quay lại".**
- Thông báo: bị chặn "Không xem được bài viết" · "Bài viết bị ẩn vì một trong hai người đã chặn người kia."; không có bài "Không tìm thấy bài viết" · "Bài viết đã bị xoá hoặc không tồn tại."
- Nguồn: `app/posts/[id].tsx:42-58`.

**BR-CONGDONG-10 — Swing đính kèm chỉ hiện đầy đủ khi người xem có quyền xem dữ liệu riêng của chủ swing** (`canViewPrivate`: chính chủ swing hoặc HLV active). Người theo dõi không mở được. Người không có quyền thấy thẻ khoá. Swing bị xoá sau khi đăng bài thì thẻ swing biến mất, nhưng `swingId` trong bài vẫn còn.
- Thông báo: "Swing riêng tư" · "Chỉ người chơi và HLV đã kết nối xem được swing này."
- Nguồn: `app/posts/[id].tsx:60,111-127`; `lib/selectors.ts:8-10`; `lib/reducer.ts:77`; spec D6.

**BR-CONGDONG-11 — Chỉ tác giả xoá được bài, bằng nút thùng rác trên header chi tiết bài; người khác ở vị trí đó thấy nút Báo cáo.** Bấm xoá mở hộp xác nhận.
- Xác nhận thì app quay lại màn trước rồi mới xoá (sau khi đã rời màn). Xoá bài ghi ngay, không giả lập lỗi.
- Xoá là **xoá cứng** và kéo theo: mọi lượt thích, mọi bình luận, mọi thông báo có `refId` = id bài (`like`, `comment`).
- Báo cáo trỏ tới bài **không** bị xoá.
- Reducer `deletePost` không kiểm người xoá có phải tác giả (chỉ UI chặn).
- Chưa có chức năng sửa bài.
- Thông báo: Dialog "Xoá bài viết?" · "Bài viết cùng lượt thích và bình luận sẽ bị xoá, không khôi phục được." · "Xoá" / "Huỷ".
- Nguồn: `app/posts/[id].tsx:40,59,93-97,187-201`; `components/useOnLeave.ts:3-16`; `lib/reducer.ts:114`; `lib/reducer.test.ts:130-140`; F10:64.

#### Thích

**BR-CONGDONG-12 — Ai mở được bài thì thích được bài đó (ở bảng tin, hồ sơ, chi tiết), kể cả bài của chính mình.** Bấm lần nữa để bỏ thích. Mỗi người có tối đa 1 lượt thích trên một bài. Thao tác có hiệu lực ngay, không có độ trễ. Reducer không kiểm chặn; việc chặn được bảo đảm vì UI không cho người bị chặn mở bài (BR-CONGDONG-07, -09).
- Thông báo: nhãn trợ năng "Thích, n lượt thích".
- Nguồn: `components/PostItem.tsx:34-35,77-83`; `lib/reducer.ts:115-122`; `lib/reducer.test.ts:118-124`.

**BR-CONGDONG-13 — Lần thích đầu tiên của người A trên bài P sinh một thông báo `like` cho tác giả P.** Bỏ thích rồi thích lại không sinh thêm, vì app kiểm đã có thông báo `like` với cùng (A, P). Tự thích bài mình thì không có thông báo. Bỏ thích không xoá thông báo đã gửi.
- Nguồn: `lib/reducer.ts:38-39,118-121`; `lib/reducer.test.ts:125-129`.

**BR-CONGDONG-14 — Số lượt thích tính theo người xem: lượt thích của người đã chặn người xem, hoặc bị người xem chặn, không được đếm.** Nút thích chỉ hiện số khi số > 0. Nút "Ai đã thích" ở chi tiết bài chỉ hiện khi số lượt thích người xem thấy > 0. Bấm nút mở sheet `n lượt thích` liệt kê người đã thích (bỏ người chặn / bị chặn; HLV có nhãn `HLV`). Chạm một người để mở hồ sơ.
- Nguồn: `lib/selectors.ts:77-79`; `components/PostItem.tsx:80`; `app/posts/[id].tsx:62-65,128-132,164-175`; `lib/selectors.test.ts:68-76`.

#### Bình luận

**BR-CONGDONG-15 — Ai mở được chi tiết bài thì bình luận được.** Văn bản được bỏ khoảng trắng hai đầu; rỗng thì không gửi. Phần thân tối đa 1000 ký tự, ô nhập cắt phần thừa ngay khi gõ. Bình luận gửi ngay, không có độ trễ hay lỗi giả lập. Gửi xong thì ô nhập trống lại và màn cuộn xuống cuối. Reducer không kiểm độ dài, nội dung rỗng hay chặn.
- Thông báo: chưa có bình luận "Chưa có bình luận. Hãy là người đầu tiên!".
- Nguồn: `app/posts/[id].tsx:21,75-86,103-107,146,153-161`; `lib/reducer.ts:123-126`.

**BR-CONGDONG-16 — Chạm "Trả lời" trên một bình luận thì vào chế độ trả lời (huỷ được).** Khi gửi, văn bản lưu thành `@<tên người được trả lời> <nội dung>`. Bình luận vẫn phẳng, không lồng. Giới hạn 1000 ký tự chỉ áp cho phần thân, nên chuỗi lưu có thể dài hơn 1000. Người được `@` **không** nhận thông báo.
- Nguồn: `app/posts/[id].tsx:33,80,140,157-158`; `lib/reducer.ts:123-126`.

**BR-CONGDONG-17 — Mỗi bình luận sinh 1 thông báo `comment` cho tác giả bài, không gộp, không chống lặp.** Tác giả tự bình luận bài mình thì không có thông báo. Những người khác đã bình luận trong bài không nhận gì.
- Nguồn: `lib/reducer.ts:38-39,123-126`; F11:19.

**BR-CONGDONG-18 — Bình luận xếp cũ → mới theo `createdAt`.** Bình luận của người đã chặn người xem, hoặc bị người xem chặn, bị ẩn **với người xem đó**; người thứ ba vẫn thấy đủ. Số bình luận trên nút và ở tiêu đề mục (`n bình luận`) cũng tính theo người xem.
- Nguồn: `lib/selectors.ts:80-82`; `components/PostItem.tsx:36,85`; `app/posts/[id].tsx:61,133`; `lib/selectors.test.ts:54-62`; tech review:192.

**BR-CONGDONG-19 — Không ai sửa hay xoá được bình luận, kể cả tác giả bình luận hay tác giả bài.** Bình luận chỉ mất khi bài bị xoá. Nút ⋯ trên bình luận của người khác mở Báo cáo bình luận; trên bình luận của chính mình thì không có thao tác.
- Nguồn: `app/posts/[id].tsx:141-142`; `lib/reducer.ts:114`; F10:64.

#### Theo dõi

**BR-CONGDONG-20 — Người dùng theo dõi được bất kỳ người chơi hay HLV nào khác; bấm lần nữa để bỏ theo dõi, không có hộp xác nhận.**
- Nút có ở hàng người dùng (Khám phá, danh sách Theo dõi) và ở hồ sơ công khai. Nút ẩn trên hồ sơ của chính mình.
- Không tự theo dõi được.
- Hai người đã chặn nhau (chiều nào cũng vậy) thì thao tác không có tác dụng và không gửi thông báo.
- Thông báo: nhãn nút "Theo dõi" / "Đang theo dõi".
- Nguồn: `components/People.tsx:19-36`; `lib/reducer.ts:105-112`; `lib/reducer.test.ts:84-91,102-107`; handoff:114-117.

**BR-CONGDONG-21 — Mỗi lần bật theo dõi sinh 1 thông báo `follow` cho người được theo dõi (không có `refId`).** Không chống lặp: bỏ theo dõi rồi theo dõi lại thì người kia nhận thêm thông báo. Bỏ theo dõi không sinh thông báo và không xoá thông báo cũ.
- Nguồn: `lib/reducer.ts:109-111`.

**BR-CONGDONG-22** — *Đã gộp vào BR-KETNOI-27 và BR-KETNOI-30* (theo dõi không mở dữ liệu riêng; nút "Xem dữ liệu học viên" chỉ cho HLV active).

**BR-CONGDONG-23 — Số người theo dõi và số đang theo dõi tính theo người xem: người đã chặn người xem, hoặc bị người xem chặn, không được đếm.** Chạm vào số thì mở `/people` ở tab tương ứng.
- `/people` có hai tab "Người theo dõi" / "Đang theo dõi", mỗi tab có badge số và bỏ người chặn / bị chặn.
- Người được xem đã chặn người xem, hoặc bị người xem chặn, thì màn hiện thông báo chặn (BR-CONGDONG-29) thay cho danh sách.
- Thông báo: không có hồ sơ "Không tìm thấy người dùng" · "Hồ sơ này không tồn tại."; rỗng "Chưa có người theo dõi" · "<Bạn|tên> chưa có người theo dõi nào." / "Chưa theo dõi ai" · "<Bạn|tên> chưa theo dõi người chơi hay HLV nào."
- Nguồn: `lib/selectors.ts:71-73`; `components/People.tsx:38-64`; `app/people.tsx:11-75`; `lib/selectors.test.ts:68-76`.

#### Khám phá và chia sẻ

**BR-CONGDONG-24 — Tab Khám phá tìm người dùng theo tên, khớp một phần, bỏ qua dấu và hoa thường.** Chuỗi tìm được chuẩn hoá: NFD, bỏ dấu, `đ` → `d`, chữ thường, bỏ khoảng trắng hai đầu.
- Ô tìm trống thì hiện mọi người dùng khác.
- Kết quả luôn loại chính mình và mọi người đã chặn / bị chặn với mình. Kết quả gồm cả người chơi và HLV.
- Không tìm theo email, SĐT, CLB, tiêu đề bài hay tag.
- Hàng kết quả: avatar, tên, badge `HLV` + học viện (HLV) hoặc `Handicap n · CLB` (người chơi), nút Theo dõi.
- Thông báo: placeholder "Tìm người chơi, HLV"; không có kết quả "Không tìm thấy ai tên "<từ khoá>"."; không có ai khác "Chưa có người dùng nào khác.".
- Nguồn: `lib/selectors.ts:83-85`; `components/CommunityScreen.tsx:33,79-93`; `components/People.tsx:66-101`; `lib/selectors.test.ts:50-53`; `lib/reducer.test.ts:99-100,112`; handoff:115.

**BR-CONGDONG-25 — Mọi bài đều có nút Chia sẻ, mở sheet "Chia sẻ bài viết".** Danh sách người nhận gồm mọi người dùng khác trừ người chặn / bị chặn (cùng tập với Khám phá khi ô tìm trống).
- "Gửi" không gửi thật: lời nhắn (nếu có) và liên kết bài được chép vào clipboard, sheet đóng và hiện toast. Danh sách người đã chọn bị bỏ qua.
- "Sao chép liên kết" chép liên kết vào clipboard, nhãn nút đổi thành "Đã sao chép".
- Chia sẻ không sinh thông báo.
- Thông báo: toast "Đã sao chép bài viết để gửi".
- Nguồn: `components/PostItem.tsx:15-16,86-115,120-124`; F10:28,64-65.

#### Chặn và bỏ chặn

**BR-CONGDONG-26 — Nút Chặn nằm trên header hồ sơ công khai (người chơi `/users/[id]`, HLV `/coaches/[id]`).** Nút **ẩn** khi:
- (a) hồ sơ là của chính mình;
- (b) hai người đã chặn nhau, chiều nào cũng vậy. Hệ quả: người bị chặn không chặn ngược lại được qua UI;
- (c) hai người đang có kết nối HLV – học viên **active**, chiều nào cũng vậy. Phải huỷ kết nối trước, vì chặn không gỡ kết nối (BR-KETNOI-32).

Bấm Chặn mở hộp xác nhận; xác nhận xong thì app quay lại màn trước.
- Thông báo: Dialog "Chặn <tên>?" · "Hai bạn sẽ không thấy bài của nhau và bỏ theo dõi lẫn nhau." · "Chặn" / "Huỷ".
- Nguồn: `components/People.tsx:116-163`; báo cáo:36,99; F10:18.

**BR-CONGDONG-27 — Dữ liệu thay đổi khi A chặn B.** *(Gộp BR-KETNOI-33.)*
- Thêm bản ghi `Block(A, B)`.
- **Xoá follow cả hai chiều** giữa A và B.
- Mọi lời mời / yêu cầu kết nối **đang chờ** (`pending`) của cặp, chiều nào cũng vậy, chuyển `revoked` (không ghi `revokedAt`).
- Kết nối `active` không bị động tới.
- Lượt thích, bình luận và thông báo **không bị xoá**, chỉ bị ẩn khi hiển thị (BR-CONGDONG-28).
- Nguồn: `lib/reducer.ts:127-136`; `lib/reducer.test.ts:92-101,264-282`; `components/People.tsx:149-163`.

**BR-CONGDONG-28 — Hiệu lực của chặn tính hai chiều (`isBlocked`) và được tính lại mỗi lần hiển thị.** Giữa A và B:
- bài của nhau biến khỏi bảng tin (`lib/selectors.ts:75`);
- không thấy nhau ở Khám phá và trong danh sách người nhận chia sẻ (`lib/selectors.ts:85`; `components/PostItem.tsx:92`);
- chi tiết bài của người kia bị khoá (BR-CONGDONG-09);
- hồ sơ người kia hiện thông báo chặn, ẩn bài đăng, nút theo dõi và số theo dõi (`app/users/[id].tsx:50-67`; `app/coaches/[id].tsx:51-92`);
- bình luận và lượt thích của người kia bị ẩn và không được đếm (`lib/selectors.ts:78,81-82`; `app/posts/[id].tsx:62-65`);
- người kia không có trong danh sách Theo dõi và không được đếm (`lib/selectors.ts:72-73`; `app/people.tsx:21,41`);
- thông báo do người kia gây ra bị ẩn và không tính vào số chưa đọc (`lib/selectors.ts:87-90`);
- không theo dõi nhau được (`lib/reducer.ts:107`);
- kết nối: theo BR-KETNOI-34.
- Nguồn: như trên; tech review:192; F10:19,49-50.

**BR-CONGDONG-29 — Trên hồ sơ của người đã chặn người xem, hoặc bị người xem chặn, app thay phần nội dung (giới thiệu, theo dõi, bài đăng) bằng thông báo chặn.** Câu chữ khác nhau tuỳ người xem là người chặn hay người bị chặn. Phần đầu hồ sơ (tên, avatar, handicap / CLB, hoặc thẻ tóm tắt HLV) vẫn hiện. Nút Báo cáo vẫn dùng được.
- Thông báo: người xem là người chặn: "Bạn đã chặn người này" · "Hai bạn không thấy bài của nhau và không theo dõi được nhau."; người xem bị chặn: "Không xem được nội dung" · "Bạn không xem được bài đăng và không theo dõi được người này."
- Nguồn: `components/People.tsx:103-114,129-134`; `app/users/[id].tsx:40-52`; `app/coaches/[id].tsx:50-52`.

**BR-CONGDONG-30 — Bỏ chặn chỉ làm được ở Cài đặt › Quyền riêng tư › "Người đã chặn".** *(Gộp BR-CAIDAT-13.)* Danh sách chỉ gồm người **mình** đã chặn (`blockerId` là mình); người đã chặn mình không nằm trong đó. Bỏ chặn có hiệu lực ngay, không có hộp xác nhận, và chỉ gỡ đúng chiều mình đã chặn: người kia cũng chặn mình thì hai bên vẫn bị chặn.
- Bỏ chặn **không** khôi phục follow đã bị gỡ, và **không** mở lại lời mời / yêu cầu kết nối đã đóng. Sau đó gửi lời mời / yêu cầu mới thì được.
- Nội dung bị ẩn trước đó (bài, bình luận, lượt thích, thông báo cũ) hiện lại, vì việc ẩn được tính lúc hiển thị.
- Thông báo: tiêu đề khối "Người đã chặn", chú thích "Hai bên không thấy bài của nhau và không theo dõi được nhau."; rỗng "Bạn chưa chặn ai."; toast "Đã bỏ chặn <tên>"; nhãn trợ năng nút "Bỏ chặn <tên>".
- Nguồn: `app/settings/privacy.tsx:37-40,56-83,107`; `lib/reducer.ts:137-138`; `lib/reducer.test.ts:108-117,271`; `lib/selectors.ts:69`; F10:60,64-65; F12 bước 09–10.

#### Báo cáo

**BR-CONGDONG-31 — Báo cáo được 3 loại đối tượng, lý do là bắt buộc (chọn 1 trong 4).**
- **Bài của người khác:** cờ trên header chi tiết bài. Lưu `targetUserId` = tác giả và `postId`.
- **Bình luận của người khác:** nút ⋯ trên bình luận. Lưu `targetUserId` = tác giả bình luận và `postId` của bài, **không** lưu id bình luận.
- **Người dùng khác:** cờ trên header hồ sơ. Lưu `targetUserId`. Báo cáo được cả khi đã chặn nhau.

Không báo cáo được nội dung hay hồ sơ của chính mình.
- Thông báo: thiếu lý do "Chọn một lý do để gửi báo cáo."; tiêu đề sheet "Báo cáo bài viết" / "Báo cáo bình luận" / "Báo cáo người dùng"; phụ đề "Người bị báo cáo không biết ai đã báo cáo."; nút "Gửi báo cáo"; toast "Đã gửi báo cáo".
- Nguồn: `components/ReportSheet.tsx:9-62`; `app/posts/[id].tsx:67-70,93-97,141-142,176-186`; `components/People.tsx:129-148`; F10:20,51-52.

**BR-CONGDONG-32 — Gửi báo cáo chỉ thêm một bản ghi `Report`.** Báo cáo không ẩn nội dung, không báo cho ai, không chống trùng (một người báo cáo cùng đối tượng nhiều lần được), không có hàng duyệt hay trạng thái xử lý.
- Nguồn: `lib/reducer.ts:139`; `lib/domain.ts:79`; tech review:191.

#### Thông báo

**BR-CONGDONG-33 — 8 loại thông báo, sinh ngay trong reducer khi có sự kiện.** Bảng loại → sự kiện → người nhận → câu chữ → màn đích ở **§7**. Thông báo trong app luôn được tạo, không phụ thuộc tuỳ chọn ở Cài đặt (BR-CONGDONG-40).
- Nguồn: `lib/reducer.ts:56-66,67-75,78-83,86-97,105-112,115-126,159-177`; `components/NotificationsScreen.tsx:15-52`; `lib/reducer.test.ts:292-340`; F11:5-6,13-24.

**BR-CONGDONG-34 — Không tự báo cho mình.** Người nhận trùng người gây ra sự kiện (tự thích, tự bình luận bài mình) thì không sinh thông báo. Hàm `notify` dùng cho mọi loại trừ `swing_uploaded`; với loại này người nhận là HLV, người gây ra là người chơi, nên không thể trùng.
- Nguồn: `lib/reducer.ts:38-39,62-64`.

**BR-CONGDONG-35 — Chỉ 3 loại có chống lặp.**
- `like`: 1 thông báo cho mỗi cặp (người thích, bài), mãi mãi (BR-CONGDONG-13).
- `swing_uploaded`: chỉ báo khi upload **chuyển** sang `done`; gửi lại `done`, hoặc lỗi mạng rồi thử lại, vẫn chỉ 1 lần.
- `analysis_done`: chỉ báo khi job **chuyển** từ trạng thái chưa xong sang trạng thái cuối; hai màn cùng nhận trạng thái cuối thì không báo hai lần.

`follow`, `comment`, `coach_note`, `connect_request`, `invite_accepted` không chống lặp: mỗi sự kiện một thông báo.
- Nguồn: `lib/reducer.ts:60-61,71-73,119-121`; `lib/reducer.test.ts:125-129,297-304`.

**BR-CONGDONG-36 — Danh sách thông báo.** Người dùng chỉ thấy thông báo gửi cho mình.
- Thông báo có `actorId` là người đã chặn mình, hoặc bị mình chặn, bị **ẩn** (không bị xoá). Thông báo hệ thống (không có actor) luôn hiện.
- Danh sách xếp mới → cũ, chia nhóm "Mới" (chưa đọc) và "Trước đó" (đã đọc). Nhóm rỗng bị ẩn.
- Mục chưa đọc in đậm, có chấm màu, nhãn trợ năng bắt đầu bằng "Chưa đọc. ".
- Người gây ra không còn hồ sơ thì hiện tên "Người dùng".
- Mở lần đầu trong phiên có khung xương 400 ms.
- Thông báo: rỗng "Chưa có thông báo"; chú thích với HLV "Học viên nhận lời mời, yêu cầu kết nối, swing mới của học viên, người theo dõi mới, lượt thích và bình luận sẽ hiện ở đây.", với người chơi "Ghi chú của HLV, kết quả phân tích swing, lời mời kết nối, người theo dõi mới, lượt thích và bình luận sẽ hiện ở đây."
- Nguồn: `lib/selectors.ts:87-89`; `components/NotificationsScreen.tsx:54-106,108-155`; `lib/selectors.test.ts:134-143`.
- Lệch tài liệu: spec:93 chia nhóm "Hôm nay / Trước đó". Code chia theo đã đọc.

**BR-CONGDONG-37 — Chạm một thông báo đánh dấu riêng thông báo đó đã đọc (`readAt = NOW`), rồi mở màn đích theo §7.** Không xác định được màn đích (thiếu `refId` hoặc thiếu actor) thì chỉ đánh dấu đã đọc. Màn đích tự kiểm quyền: HLV đã bị huỷ kết nối mà chạm `swing_uploaded` hay `invite_accepted` cũ thì gặp màn NoAccess. Màn đích là một tab thì app quay về nhóm tab sẵn có thay vì chồng thêm một bản.
- Nguồn: `components/NotificationsScreen.tsx:33-52,62-70`; `lib/reducer.ts:140`; `app/swings/[id].tsx:145,153-162`; `app/students/[id].tsx:25-26,37-44`; F11:14-15.

**BR-CONGDONG-38 — Nút "Đánh dấu đã đọc tất cả" chỉ hiện khi còn ít nhất 1 thông báo chưa đọc mà người dùng nhìn thấy.** Bấm nút đặt `readAt` cho **mọi** thông báo chưa đọc của người dùng, **kể cả** thông báo đang bị ẩn vì chặn; vì vậy sau khi bỏ chặn, các thông báo đó hiện lại ở trạng thái đã đọc.
- Nguồn: `components/NotificationsScreen.tsx:123-127`; `lib/reducer.ts:140`; F11:20.

**BR-CONGDONG-39 — Header của các màn tab có chuông thông báo.** Badge đỏ hiện số thông báo chưa đọc **nhìn thấy được** (trừ thông báo ẩn vì chặn), và ẩn khi số này bằng 0. Chạm chuông mở `/notifications`. HLV có thêm tab "Thông báo" (cùng màn); trên chính tab này chuông bị tắt.
- Thông báo: nhãn trợ năng "Thông báo, n chưa đọc" / "Thông báo".
- Nguồn: `components/TabHeader.tsx:9-43`; `lib/selectors.ts:90`; `app/(coach)/inbox.tsx:3-6`; `app/notifications.tsx:2`; spec:54.

**BR-CONGDONG-40 — Tuỳ chọn thông báo đẩy (Cài đặt › Thông báo).** *(Gộp BR-CAIDAT-15, BR-CAIDAT-16.)*
- Có một công tắc cho mỗi loại thông báo mà vai đó nhận được: người chơi 7 loại, HLV 6 loại (bảng ở §7). Mọi loại mặc định bật.
- Có công tắc "Giờ yên lặng (22:00–07:00)": khung giờ cố định, không chỉnh được, mặc định tắt.
- Gạt công tắc là lưu ngay (ghi đè từng phần, BR-CAIDAT-19).
- Các tuỳ chọn này **chỉ dành cho push**, mà push chưa làm. Reducer không đọc `prefs.notify` khi tạo thông báo. Danh sách trong chuông vẫn hiện đủ mọi loại.
- Thông báo: khối "Nhận thông báo khi", chú thích "Thông báo đẩy về điện thoại. Mục trong chuông thông báo vẫn hiện đủ."; "Giờ yên lặng (22:00–07:00)" · "Không rung, không chuông trong khung giờ này".
- Nguồn: `app/settings/notifications.tsx:10-56`; `lib/mock.ts:6-9`; `lib/reducer.ts:38-39`; F11:38; F12:16 và bước 06; spec:13; báo cáo:39 (#10); tech review:188.

**BR-CONGDONG-41 — Xoá thông báo theo đối tượng.** Xoá bài thì xoá mọi thông báo có `refId` = id bài (`like`, `comment`). Xoá swing thì xoá mọi thông báo có `refId` = id swing (`coach_note`, `analysis_done`, `swing_uploaded`). Nhờ vậy, chạm thông báo không bao giờ dẫn tới màn "Không tìm thấy". Việc này dựa vào các tiền tố id `sw-` / `post-` / `cn-` không trùng nhau. Các thao tác sau **không** xoá thông báo: bỏ thích, bỏ theo dõi, huỷ / từ chối kết nối, chặn, xoá ghi chú. Thông báo trỏ tới kết nối đã huỷ vẫn còn trong danh sách (BR-CONGDONG-37).
- Nguồn: `lib/reducer.ts:76-77,114`; `lib/reducer.test.ts:130-140,170`.
- Lệch tài liệu: F11:39 ghi "Thông báo trỏ tới swing/bài đã xoá → mở màn 'Không tìm thấy …'". Code xoá luôn các thông báo đó.

### 5.7 Hồ sơ, cài đặt và trạng thái dùng chung (`BR-CAIDAT`)

**Mã đã gộp vào mảng khác:**

| Mã | Gộp vào | Nội dung |
|---|---|---|
| BR-CAIDAT-02 | BR-TAIKHOAN-25 | Chỉ sửa hồ sơ của mình; ô theo vai |
| BR-CAIDAT-03, -04 | BR-TAIKHOAN-26 | Họ tên, SĐT, giới thiệu khi sửa |
| BR-CAIDAT-05, -06 | BR-TAIKHOAN-27 | Trường riêng người chơi / HLV khi sửa |
| BR-CAIDAT-07, -08 | BR-TAIKHOAN-28 | Ảnh đại diện và lưu màn Tài khoản |
| BR-CAIDAT-13 | BR-CONGDONG-30 | Danh sách người đã chặn, bỏ chặn |
| BR-CAIDAT-14 | BR-TAIKHOAN-31 | Xoá tài khoản |
| BR-CAIDAT-15, -16 | BR-CONGDONG-40 | Công tắc thông báo đẩy, giờ yên lặng |
| BR-CAIDAT-17 | BR-SOLIEU-30 | Đơn vị đo |

#### Hồ sơ

**BR-CAIDAT-01 — Lối vào hồ sơ.** Người dùng đã đăng nhập chạm avatar ở header mọi màn tab để mở "Hồ sơ" (`/profile`). Màn này có: ảnh hoặc chữ tắt, họ tên, huy hiệu vai, một dòng chi tiết, số theo dõi, và 3 nút "Chỉnh sửa hồ sơ", "Cài đặt", "Đăng xuất". Dòng chi tiết của người chơi là `Handicap X · CLB`, của HLV là `Học viện · N năm kinh nghiệm`. Màn này không hiện giới thiệu của người chơi; giới thiệu chỉ hiện ở hồ sơ công khai. HLV có thêm tab "Hồ sơ" (`/me`) gồm tóm tắt HLV, giới thiệu, số theo dõi, 2 nút "Chỉnh sửa hồ sơ" và "Cài đặt", và danh sách bài đã đăng; tab này không có nút Đăng xuất. Người chưa đăng nhập mở các màn này thì bị chuyển về `/`.
- Thông báo: nhãn trợ năng avatar "Hồ sơ của tôi"; huy hiệu "Người chơi" / "Huấn luyện viên". Đăng xuất: BR-TAIKHOAN-30.
- Nguồn: `components/TabHeader.tsx:44-48`; `app/profile.tsx:14-38`; `app/(coach)/me.tsx:10-33`; spec:54,87,94; F12 bước 01, 12.

**BR-CAIDAT-09 — Hồ sơ công khai: mọi người đã đăng nhập đều xem được.**
- Hồ sơ người chơi (`/users/[id]`): tên, ảnh, `Handicap · CLB`, giới thiệu, số theo dõi, bài đăng.
- Hồ sơ HLV (`/coaches/[id]`): tóm tắt HLV (học viện, huy hiệu "Đã xác minh", Đánh giá, Kinh nghiệm, Học phí; mục nào chưa có giá trị thì bỏ), tag "HLV của bạn" (nếu là HLV active của người xem), giới thiệu, số theo dõi, nút Theo dõi, cụm nút kết nối (BR-KETNOI-15) và bài đăng.
- Không bao giờ hiện thông số, swing hay bộ gậy. Chỉ HLV có kết nối active với người chơi đó thấy nút "Xem dữ liệu học viên".
- Một trong hai bên đã chặn bên kia: phần đầu hồ sơ vẫn hiện (tên, ảnh, handicap / CLB, hoặc tóm tắt HLV); giới thiệu, theo dõi và bài đăng được thay bằng thông báo chặn (BR-CONGDONG-29).
- Mở `/users/[id]` bằng id của HLV thì chuyển sang `/coaches/[id]`.
- Nguồn: `app/users/[id].tsx:13-14,22,33-67`; `app/coaches/[id].tsx:47-56,92`; `components/CoachSummary.tsx:9-13,28-29`; `components/People.tsx:104-113`; tech review:201,236-239.

#### Cài đặt

**BR-CAIDAT-10 — Màn Cài đặt (`/settings`) có 5 mục theo thứ tự: Tài khoản, Mật khẩu, Quyền riêng tư, Thông báo, Đơn vị đo.** Bản dev có thêm mục thứ 6 là Dev. Dòng phụ của Quyền riêng tư đổi theo vai. Màn `/settings` không chặn người chưa đăng nhập; các màn con thì chặn (chuyển về `/`), trừ Dev.
- Thông báo: dòng phụ: Tài khoản "Tên, số điện thoại, giới thiệu"; Quyền riêng tư của người chơi "Ai xem được bộ gậy, swing; người đã chặn", của HLV "Người đã chặn, xoá tài khoản"; Đơn vị đo "Mét hoặc yard"; Dev "Đổi hồ sơ mẫu, đặt lại dữ liệu".
- Nguồn: `app/settings/index.tsx:7-35`; `app/settings/{account,password,privacy,notifications,units}.tsx` (`if (!me) return <Redirect href="/" />`); F12 bước 04.

**BR-CAIDAT-11 — Công tắc "Công khai bộ gậy" và "Công khai danh sách swing" chưa có tác dụng.** *(Gộp BR-KETNOI-31, BR-BOGAY-27.)* Chỉ người chơi thấy 2 công tắc này. Cả hai mặc định tắt. Gạt là lưu ngay, không toast, không qua ghi giả lập. Quyền xem dữ liệu riêng vẫn chỉ dựa vào `canViewPrivate` (chủ dữ liệu hoặc HLV active), và hàm này không đọc 2 cờ. Người theo dõi hay người lạ không xem được bộ gậy hay swing dù công tắc đang bật. Chưa có màn nào cho người khác xem bộ gậy / swing đã công khai.
- Thông báo: khối "Ai xem được dữ liệu của bạn", dòng phụ "Mặc định chỉ bạn và HLV đã kết nối xem được".
- Nguồn: `app/settings/privacy.tsx:36,47-54` (chú thích `ponytail:` ở dòng 50); `lib/selectors.ts:8-10`; `lib/mock.ts:6-7`; F12:15,54; báo cáo:39.
- Lệch tài liệu: ma trận RLS ở tech review:244-247 cho người khác đọc clubs "khi user công khai".

**BR-CAIDAT-12 — Người chơi không ẩn được dữ liệu khỏi HLV đã kết nối.** HLV có kết nối active luôn xem được thông số, swing, bộ gậy và thể lực của học viên; Cài đặt không có tuỳ chọn ẩn. Theo dõi không bao giờ mở dữ liệu riêng.
- Thông báo: onboarding người chơi "Nhập mã để kết nối — HLV sẽ xem được thông số, swing và bộ gậy của bạn."
- Nguồn: `lib/selectors.ts:8-10`; `app/(auth)/onboarding.tsx:84`; spec D6; handoff:178 (câu hỏi mở 5).

**BR-CAIDAT-18 — Không có cài đặt giao diện và ngôn ngữ.** Sáng / tối tự theo hệ điều hành và tự đổi khi hệ thống đổi. Toàn bộ UI là tiếng Việt.
- Nguồn: `app/_layout.tsx:34` (`ThemeProvider scheme="auto"`); `packages/ds/src/theme/ThemeProvider.tsx:8-14`; spec D12.
- Lệch tài liệu: spec:95 liệt kê settings có mục "giao diện". D12 khớp với code.

**BR-CAIDAT-19 — Tuỳ chọn lưu riêng từng người dùng và ghi đè từng phần.** Mỗi lần đổi chỉ ghi khoá vừa đổi, các khoá khác giữ nguyên. Riêng `notify` được ghi cả bộ: màn gộp bộ cũ với công tắc vừa đổi rồi mới gửi đi. Người chưa có bản ghi thì dùng mặc định.
- Nguồn: `lib/reducer.ts:49`; `lib/selectors.ts:6`; `app/settings/notifications.tsx:40`.

#### Trạng thái dùng chung

**BR-CAIDAT-20 — Mọi URL hay deep link không khớp màn nào đều mở màn 404 tiếng Việt, kể cả khi chưa đăng nhập.** Nút "Về trang chủ" thay màn bằng `/`, rồi chuyển tiếp: chưa đăng nhập về màn chào, người chơi về Tổng quan, HLV về Học viên.
- Thông báo: header "Không tìm thấy"; "Không tìm thấy trang" · "Đường dẫn này không tồn tại hoặc đã bị đổi. Về trang chủ để tiếp tục." · "Về trang chủ".
- Nguồn: `app/+not-found.tsx:6-21`; `app/index.tsx:4-8`; F13 bước 01; MVP:46.

**BR-CAIDAT-21 — Màn chi tiết mở bằng id không tồn tại (hoặc đã bị xoá) hiện thông báo riêng của màn đó, kèm nút "Quay lại".** Nút quay lại màn trước; không có lịch sử thì về `/`.
- Thông báo: "Không tìm thấy phiên" · "Phiên này không tồn tại hoặc đã bị xoá." · "Không tìm thấy gậy" · "Gậy này không tồn tại." · "Không tìm thấy swing" · "Swing này không tồn tại hoặc đã bị xoá." · "Không tìm thấy học viên" · "Học viên này không tồn tại." · "Không tìm thấy HLV" · "Hồ sơ này không tồn tại." · "Không tìm thấy người dùng" · "Hồ sơ này không tồn tại.".
- Nguồn: `app/metrics/[id].tsx:35`; `app/clubs/[id]/index.tsx:51`; `app/swings/[id].tsx:162`; `app/students/[id].tsx:46-52`; `app/coaches/[id].tsx:22-36`; `app/users/[id].tsx:22-31`.

**BR-CAIDAT-22 — 403 khi xem dữ liệu riêng mà không có quyền.** Dữ liệu riêng (phiên số liệu, bộ gậy, gậy, swing, chi tiết học viên) tồn tại, nhưng người xem không phải chủ dữ liệu và cũng không phải HLV active: màn chỉ hiện NoAccess. Ở chi tiết swing, cổng quyền đặt trước mọi state / effect, nên job phân tích của chủ swing không chạy trên máy người xem (các màn khác: BR-KETNOI-28). Ở chi tiết học viên, HLV từng có kết nối đã được chấp nhận rồi bị huỷ thì câu giải thích đổi theo trường hợp đó. Nút "Quay lại" về màn trước; không có lịch sử thì về `/`.
- Thông báo: "Không có quyền xem"; mặc định "Chỉ HLV đã kết nối mới xem được dữ liệu này."; kết nối đã huỷ "Kết nối với học viên này đã bị huỷ nên bạn không còn xem được dữ liệu của họ."; "Quay lại".
- Nguồn: `components/NoAccess.tsx:4-10`; `lib/selectors.ts:8-10`; `app/metrics/[id].tsx:27-33`; `app/clubs/index.tsx:52-60`; `app/clubs/[id]/index.tsx:43-49`; `app/swings/[id].tsx:145-160`; `app/students/[id].tsx:37-44`; F13 bước 13–14; spec D6.

**BR-CAIDAT-23 — Cổng đăng nhập và vai trò.** Gồm luật chuyển hướng của BR-TAIKHOAN-02, cộng 3 trường hợp khác cũng bị chuyển hướng im lặng:
- không phải người chơi mà mở `/clubs` không kèm `playerId` → `/`;
- sửa gậy không phải của mình, hoặc gậy đã lưu trữ → màn xem gậy;
- sửa phiên không phải của mình → màn xem phiên.
- Nguồn: `app/(player)/_layout.tsx:8`; `app/(coach)/_layout.tsx:8`; `app/clubs/index.tsx:50`; `app/clubs/[id]/edit.tsx:14`; `app/metrics/manual.tsx:42`; F13 story 13a–13e.

**BR-CAIDAT-24 — Khung xương ở lần mở đầu tiên.** Các màn sau hiện khung xương 0,4 s ở lần mở đầu tiên trong phiên: Tổng quan, Thông số, Swing, Bộ gậy, Học viên, Bảng tin, Thông báo, và chi tiết từng học viên (mỗi id một lần). Mở lại trong cùng phiên thì có dữ liệu ngay. Trình đọc màn hình đọc khung xương một lần là "Đang tải"; Tổng quan đọc "Đang tải tổng quan", Bảng tin đọc "Đang tải bảng tin".
- Nguồn: `components/ListSkeleton.tsx:6-38`; `lib/simulate.ts:134`; `app/(player)/home.tsx:36-42`; `app/(player)/metrics.tsx:24,38`; `app/(player)/swings.tsx:61,70`; `app/clubs/index.tsx:49,85`; `app/(coach)/roster.tsx:30,175`; `components/CommunityScreen.tsx:29,41-42`; `components/NotificationsScreen.tsx:113,121`; `app/students/[id].tsx:34,221`; F13 bước 02–03, F13:58.

**BR-CAIDAT-25 — Ghi giả lập: có đúng 4 form và 4 nút xoá có trạng thái đang lưu, lỗi và thử lại.**
- 4 form: nhập tay / sửa phiên; thêm / sửa gậy; Tài khoản; đăng bài.
- 4 nút xoá: xoá phiên, xoá gậy, xoá swing, xoá ghi chú.
- Bấm thì vào trạng thái bận 0,6 s: nút bị khoá, hiện "Đang lưu…", "Đang xoá…" hoặc "Đang đăng…". Hết 0,6 s thì thành công, mỗi thao tác kết thúc khác nhau:
  - lưu phiên, lưu Tài khoản, đăng bài: ghi, hiện toast thành công 1,2 s rồi quay lại;
  - lưu gậy: ghi rồi quay lại ngay, **không** có toast;
  - xoá phiên, xoá gậy, xoá swing: quay lại màn trước, dữ liệu chỉ bị xoá sau khi màn đã rời, **không** có toast;
  - xoá ghi chú: xoá ngay, dòng xác nhận "Đã xoá ghi chú" hiện dưới ô nhập ghi chú (không phải toast).
- Cờ dev "Giả lập lỗi" đang bật thì **không ghi gì**: form giữ nguyên, toast thất bại hiện 4 s với nút "Thử lại". Màn chỉ hiện một toast lỗi mỗi lúc; toast cũ bị gỡ trước khi thử lại.
- Rời màn khi đang bận thì thao tác bị huỷ, như một request bị huỷ. Bấm lại khi đang bận thì đồng hồ chạy lại từ đầu, và chỉ lần bấm cuối được thực hiện. Toast tự cụp bàn phím.

| Thao tác | Tiêu đề toast lỗi | Dòng phụ |
|---|---|---|
| Lưu phiên | "Lưu thất bại" | "Mất kết nối — số liệu chưa được lưu, form giữ nguyên." |
| Lưu gậy | "Lưu thất bại" | "Mất kết nối — gậy chưa được lưu, form giữ nguyên." |
| Lưu Tài khoản | "Lưu thất bại" | "Mất kết nối — thông tin tài khoản chưa được lưu." |
| Đăng bài | "Đăng bài thất bại" | "Mất kết nối — bài chưa được đăng, nội dung giữ nguyên." |
| Xoá phiên | "Xoá thất bại" | "Mất kết nối — phiên vẫn còn." |
| Xoá gậy | "Xoá thất bại" | "Mất kết nối — gậy vẫn còn." |
| Xoá swing | "Xoá thất bại" | "Mất kết nối — swing vẫn còn." |
| Xoá ghi chú | "Xoá thất bại" | "Mất kết nối — ghi chú vẫn còn." |

- Nguồn: `components/Feedback.tsx:17-66`; `lib/simulate.ts:134`; `app/metrics/manual.tsx:69,105,111-115`; `app/clubs/new.tsx:48,106,132-136`; `app/settings/account.tsx:46-52,98,103-112`; `app/community/compose.tsx:52,107,129-135`; `app/metrics/[id].tsx:45,97-98,117-121`; `app/clubs/[id]/index.tsx:35,160,201-205`; `app/swings/[id].tsx:244-264,389,566-572`; F13 bước 07–12, F13:59-60; MVP:41-42.

**BR-CAIDAT-26 — Các thao tác ghi còn lại ghi ngay, không có trạng thái đang lưu, lỗi hay thử lại, và không chịu cờ "Giả lập lỗi".** Gồm: đổi đơn vị, công tắc thông báo / giờ yên lặng / công khai, bỏ chặn, đổi mật khẩu, xoá tài khoản; cùng các thao tác ở mảng khác: mọi thao tác kết nối (tạo / thu hồi mã, chấp nhận, gửi, trả lời, huỷ, đổi HLV chính), lưu trữ / khôi phục gậy, lưu CSV và lưu ảnh, thêm / sửa ghi chú, thích, bình luận, theo dõi, chặn, báo cáo, xoá bài. Đổi mật khẩu thành công thì hiện toast rồi quay lại màn trước (không có lịch sử thì về Cài đặt).
- Thông báo: đổi mật khẩu: dòng tổng "Chưa đổi: ‹n› trường cần sửa.", toast "Đã đổi mật khẩu" (lỗi theo trường ở BR-TAIKHOAN-24).
- Nguồn: `app/settings/units.tsx:34`; `app/settings/notifications.tsx:40,51`; `app/settings/privacy.tsx:36,70,99-103`; `app/settings/password.tsx:11,57-68`; `components/Feedback.tsx`; F13:59.
- Lệch tài liệu: spec:58-59 yêu cầu "mọi tác vụ giả lập có lỗi + thử lại".

**BR-CAIDAT-27 — Cờ "Giả lập lỗi khi lưu/xoá" nằm ở Cài đặt › Dev (chỉ bản dev), mặc định tắt.** Cờ được đọc đúng lúc hết 0,6 s, nên bật / tắt giữa chừng cũng có hiệu lực với lần ghi đang chạy. "Đặt lại dữ liệu mẫu" giữ nguyên cờ. Bắt đầu một luồng ở "Kiểm tra theo luồng" thì cờ bị tắt.
- Thông báo: "Giả lập lỗi khi lưu/xoá", dòng phụ "Lưu số liệu, gậy, tài khoản, bài viết và các nút xoá sẽ thất bại sau 0,6 giây — để xem toast lỗi và Thử lại".
- Nguồn: `app/settings/dev.tsx:42-48,98-106`; `lib/reducer.ts:179-180`; `components/Feedback.tsx:41-42,48-51`; `lib/reducer.test.ts:391-398`.

**BR-CAIDAT-28 — Công cụ Dev chỉ có ở bản phát triển.** Bản phát hành ẩn mục Dev khỏi Cài đặt, và mở link `/settings/dev` thì bị chuyển về `/`. Màn Dev có 4 nhóm:
- **Kiểm tra theo luồng (F1–F13):** chạm một luồng thì đặt lại dữ liệu mẫu, xoá bộ nhớ "đã tải" của khung xương, tắt cờ lỗi, đăng nhập đúng tài khoản (hoặc đăng xuất) và mở bước 1.
- **Đổi tài khoản mẫu:** đăng nhập không cần mật khẩu, rồi về `/`.
- **Công tắc giả lập lỗi:** BR-CAIDAT-27.
- **Đặt lại dữ liệu mẫu:** hỏi xác nhận, rồi thay toàn bộ dữ liệu bằng bản mẫu, kể cả hồ sơ và tuỳ chọn. Phiên đăng nhập và cờ lỗi được giữ.

Bản dev còn có tham số `?as=<userId>` trên mọi URL để đăng nhập nhanh; id không có trong dữ liệu thì bị bỏ qua. Trường hợp biên: tài khoản đăng ký trong phiên không có trong dữ liệu mẫu, nên sau "Đặt lại" hồ sơ đó biến mất và người dùng thực chất bị đăng xuất; sửa đổi hồ sơ của tài khoản mẫu cũng bị mất.
- Thông báo: header "Dev", phụ đề "Chỉ có ở bản phát triển". Dialog "Đặt lại dữ liệu mẫu?" · "Mọi thay đổi trong phiên (thông số, swing, bài viết, kết nối…) sẽ mất. Hồ sơ đang đăng nhập được giữ." · "Đặt lại" / "Huỷ".
- Nguồn: `app/settings/dev.tsx:16-131`; `app/settings/index.tsx:13`; `lib/reducer.ts:180`; `lib/selectors.ts:5`; `lib/mock.ts:11-18,65-68`; `app/_layout.tsx:1-25`; `components/ListSkeleton.tsx:8`; spec D13.
- Lệch tài liệu: Dialog nói "Hồ sơ đang đăng nhập được giữ", nhưng thực tế chỉ phiên được giữ (`app/settings/dev.tsx:121`).

---

## 6. Vòng đời & trạng thái

### 6.1 Phiên đăng nhập và tài khoản

| Trạng thái | Sự kiện | Trạng thái kế | Kích hoạt |
|---|---|---|---|
| Chưa đăng nhập (`sessionUserId = null`) | Mở app | Màn chào | `app/index.tsx:6` |
| Màn chào | "Tạo tài khoản" | Đăng ký · bước 1 (Vai trò) | Người dùng |
| Đăng ký · bước 1 | Chọn vai + "Tiếp" | Đăng ký · bước 2 (Thông tin) | Người dùng |
| Đăng ký · bước 2 | "Tiếp", form hợp lệ | Chờ OTP | `register.tsx:33` |
| Đăng ký · bước 2 | "Quay lại" | Đăng ký · bước 1 (giữ dữ liệu) | Người dùng |
| Chờ OTP | Mã đúng | **Đã đăng nhập · Onboarding** (hồ sơ và tuỳ chọn được tạo) | `verify-otp.tsx:39-41`, `reducer.ts:47` |
| Chờ OTP | Mã sai | Chờ OTP (có lỗi) | |
| Chờ OTP | Bản nháp thiếu / hỏng | Lỗi "Thiếu thông tin đăng ký" → Đăng ký | `verify-otp.tsx:28-36` |
| Onboarding · bước k | "Tiếp" (bước Giới thiệu của HLV phải hợp lệ) | Onboarding · bước k+1 | |
| Onboarding · bước cuối | "Để sau" / "Nhập mã" / "Tạo mã mời" | Tab chính / `/connect/accept` / `/connect/invite` | |
| Onboarding · bước bất kỳ | Thoát app rồi mở lại | Tab chính (bỏ qua onboarding) | F01:42 |
| Chưa đăng nhập | Đăng nhập đúng | Đã đăng nhập → chuyển hướng theo vai | `login.tsx:25-26` |
| Đã đăng nhập | Đăng xuất (xác nhận) | Chưa đăng nhập · màn chào | `profile.tsx:47-51` |
| Đã đăng nhập | Xoá tài khoản (2 bước) | Mock: chưa đăng nhập · màn chào. Bản thật: tài khoản bị xoá | `privacy.tsx:98-104` |
| Đã đăng nhập (dev) | Đổi hồ sơ mẫu / `?as=` | Đăng nhập bằng hồ sơ khác | `dev.tsx:88-91`, `_layout.tsx:21` |
| Đăng nhập bằng tài khoản tạo trong phiên (dev) | "Đặt lại dữ liệu mẫu" | Hồ sơ biến mất → `me` rỗng → màn chào | `reducer.ts:180` |

**Đếm ngược gửi lại OTP:** `wait = 60` → mỗi giây trừ 1 → tới `0` thì nút "Gửi lại mã" bật → bấm thì `wait = 60`, xoá mã và lỗi (`verify-otp.tsx:21-26,58-64`).

**Link đặt lại mật khẩu:**

| Trạng thái | Sự kiện | Trạng thái kế |
|---|---|---|
| Quên mật khẩu · form | "Gửi link" với email hợp lệ | Đã gửi ("Kiểm tra hộp thư") |
| Mở link, token `ok` | Mật khẩu hợp lệ + "Đặt lại mật khẩu" | Đăng nhập (`?reset=1`, có thông báo) |
| Mở link, token `expired` | — | "Link đã hết hạn" → "Gửi lại link" → Quên mật khẩu |
| Mở link, token sai / thiếu | — | "Link không hợp lệ" → "Gửi lại link" → Quên mật khẩu |

Bản mock không vô hiệu token sau khi dùng (F03:47).

### 6.2 Kết nối (`CoachConnection.status`)

```
(chưa có) ──requestConnection──► pending ──chấp nhận / duyệt──► active ──huỷ kết nối──► revoked
    │                              ├──từ chối──► declined          ▲   └── đặt làm HLV chính (chính ↔ phụ)
    │                              └──bên gửi huỷ · dùng mã cùng HLV · chặn──► revoked
    └──acceptInvite (mã hợp lệ) ───────────────────────────────────┘
```

| Trạng thái hiện tại | Sự kiện | Trạng thái sau | Ai kích hoạt |
|---|---|---|---|
| chưa có | HLV gửi lời mời / người chơi gửi yêu cầu (`requestConnection`) | `pending` (`requestedBy` = bên gửi, `isPrimary = false`) | HLV ở `connect/invite`; người chơi ở `coaches/[id]` |
| chưa có | Người chơi dùng mã hợp lệ (`acceptInvite`) | `active`; vai chính / phụ theo BR-KETNOI-20 | Người chơi ở `connect/accept` |
| `pending` | Bên nhận Chấp nhận / Duyệt | `active` (vai xét lúc kích hoạt), + `acceptedAt` | Bên nhận |
| `pending` | Bên nhận Từ chối | `declined`, + `declinedAt` | Bên nhận |
| `pending` | Bên gửi huỷ (`revokeConnection`) | `revoked`, + `revokedAt` | Bên gửi |
| `pending` | Người chơi dùng mã của chính HLV đó | `revoked`, + `revokedAt`; kèm một kết nối `active` mới | Hệ thống, trong `acceptInvite` |
| `pending` | Một trong hai bên chặn | `revoked` (**không** có `revokedAt`) | Hệ thống, trong `block` |
| `active` (phụ) | "Đặt làm HLV chính" (`setPrimaryCoach`) | `active` (chính); HLV chính cũ thành phụ | Người chơi |
| `active` | Người chơi hoặc HLV huỷ kết nối | `revoked`, `isPrimary = false`, + `revokedAt` | Người chơi ở tab HLV; HLV ở `students/[id]` |
| `declined` / `revoked` | — | Trạng thái cuối. Kết nối lại = bản ghi mới | — |

Bất biến: mỗi cặp ≤ 1 kết nối mở; mỗi người chơi ≤ 1 kết nối active có `isPrimary`. Nguồn: `lib/reducer.ts:86-104,127-136,159-178`; `lib/domain.ts:13-19`.

### 6.3 Mã mời (`CoachInvite`)

Trạng thái được tính ra lúc kiểm, không lưu thành cột.

| Trạng thái hiện tại | Sự kiện | Trạng thái sau | Ai kích hoạt |
|---|---|---|---|
| chưa có | Tạo mã | Còn hiệu lực (`ok`) | HLV |
| Còn hiệu lực | Thu hồi | `revoked` (`revoked = true`) | HLV chủ mã, qua Dialog |
| Còn hiệu lực | Người chơi dùng mã | `used` (`usedBy` = người chơi) | Người chơi |
| Còn hiệu lực | Thời gian tới `expiresAt` (7 ngày sau `createdAt`) | `expired` (tính lúc kiểm, không lưu) | Đồng hồ |
| `revoked` / `used` / `expired` | — | Trạng thái cuối. Khi kiểm, thứ tự ưu tiên là `not_found` (gồm cả chặn) → `revoked` → `used` → `expired` → `already_connected` | — |

Nguồn: `lib/selectors.ts:12-22`; `lib/reducer.ts:84-85,95`; `lib/ids.ts:8-15`.

### 6.4 Tải lên video (`upload.status`)

| Trạng thái | Sự kiện | Trạng thái kế | Kích hoạt |
|---|---|---|---|
| (chưa có) | Bấm "Tải lên" khi đã chọn gậy | `uploading` 0 % | Người chơi (`new.tsx:46-57`) |
| `uploading` | Nhịp 150 ms, +5 % | `uploading` | Bộ đếm trên màn của chủ swing |
| `uploading` | Vượt mốc lỗi `failAt` (mô phỏng mất mạng) | `failed`, tiến độ = `failAt` | `simulate.ts:76` |
| `uploading` | Tiến độ tới 100 % | `done`. Lần đầu: báo `swing_uploaded` cho mọi HLV active | `reducer.ts:61-65` |
| `uploading` | "Tạm dừng" | `paused` (giữ tiến độ) | Chủ swing |
| `paused` | "Tiếp tục" | `uploading` (từ tiến độ cũ) | Chủ swing |
| `failed` | "Thử lại" | `uploading` (từ chỗ lỗi) | Chủ swing |
| `uploading` | Rời màn | `uploading` nhưng đứng yên; chủ swing mở lại chi tiết thì tải tiếp | Mock (`SwingUpload.tsx:25-26`) |
| `done` | — | Cuối. Mở khoá video, phân tích, ghi chú | — |

### 6.5 Job phân tích (`job.status`)

```
none ──(Phân tích ngay / Phân tích swing)──► queued ──500 ms──► processing ──┬─► succeeded  (+analysis, báo analysis_done lần đầu)
  ▲                                            ▲                              ├─► needs_review (+analysis, không tip, báo analysis_done lần đầu)
  └── "Để sau" giữ none                        └────── "Thử lại" ◄── failed ◄─┘   (giữ tiến độ lúc lỗi; không báo)
```

| Trạng thái | Sự kiện | Trạng thái kế | Kích hoạt |
|---|---|---|---|
| `none` | "Để sau" | `none` | Người chơi |
| `none` | "Phân tích ngay" / "Phân tích swing" | `queued` | Chủ swing |
| `queued` | Sau 500 ms | `processing` (giữ tiến độ) | Màn chi tiết đang mở của chủ swing hoặc HLV active |
| `processing` | Nhịp 250 ms, +10 % | `processing` | Như trên |
| `processing` | Vượt `analysisFailAt` (mô phỏng máy chủ bận) | `failed` (tiến độ = mốc lỗi) | `simulate.ts:88` |
| `processing` | Tới 100 %, video tốt | `succeeded` + `analysis` | Lần đầu báo `analysis_done` |
| `processing` | Tới 100 %, video kém | `needs_review` + `analysis` | Lần đầu báo `analysis_done` |
| `failed` | "Thử lại" | `queued` (giữ tiến độ lúc lỗi) | Chủ swing |
| `succeeded` / `needs_review` | — | Cuối. UI không có đường chạy lại | — |
| `queued` / `processing` | Rời màn | Đứng yên; mở lại thì chạy tiếp | Mock |

Nguồn: `app/swings/[id].tsx:210-229,266-267`; `app/swings/new.tsx:58-62`; `lib/simulate.ts:80-92`; `lib/reducer.ts:67-75`. Spec D8 mô tả `queued → processing → succeeded / failed / needs_review` nhưng không nhắc `none`.

### 6.6 Swing và ghi chú

| Đối tượng | Trạng thái | Sự kiện | Kế tiếp | Ai |
|---|---|---|---|---|
| Swing | tồn tại | Xoá (xác nhận → ghi xong → rời màn) | Bị xoá cùng ghi chú và thông báo trỏ tới; bài đính kèm giữ `swingId` treo | Chủ swing |
| Ghi chú | (chưa có) | Gửi | Tồn tại; báo `coach_note` | HLV active |
| Ghi chú | tồn tại | Sửa (nội dung khác) | Tồn tại + `editedAt` | Tác giả còn active |
| Ghi chú | tồn tại | Xoá (xác nhận) | Bị xoá; thông báo cũ vẫn giữ | Tác giả còn active |
| Ghi chú | tồn tại | HLV bị huỷ kết nối | Vẫn tồn tại và vẫn hiện cho người chơi; khoá sửa / xoá | — |

### 6.7 Phiên số liệu và luồng nhập

| Trạng thái | Sự kiện | Trạng thái kế | Ai |
|---|---|---|---|
| (chưa có) | Lưu nhập tay / Lưu ảnh / "Nhập N phiên" (CSV) | Đã lưu (`editedAt` trống) | Chủ phiên (`addSession` / `addSessions`) |
| Đã lưu | Lưu ở "Sửa phiên", form đã đổi | Đã sửa (`editedAt = NOW`) | Chủ phiên (`updateSession`) |
| Đã lưu / đã sửa | Lưu ở "Sửa phiên", form không đổi | Không đổi (màn không gửi lệnh) | Chủ phiên |
| Đã lưu / đã sửa | Xác nhận "Xoá" rồi rời màn | Không còn (xoá cứng) | Chủ phiên (`deleteSession`) |
| Bất kỳ | Bật giả lập lỗi rồi lưu / xoá | Không đổi + toast lỗi (chỉ nhập tay, sửa, xoá) | Cài đặt › Dev |

| Luồng | Trạng thái màn | Sự kiện | Trạng thái kế |
|---|---|---|---|
| CSV | Chọn file | Chọn file mẫu | Xem trước, hoặc "Không nhận diện được file" |
| CSV | Xem trước | "Tiếp tục" (khoá khi 0 dòng hợp lệ) / "Chọn file khác" | Xác nhận / Chọn file |
| CSV | Xác nhận | "Nhập N phiên" có gậy / "Quay lại" | Đã nhập (toast rồi quay về) / Xem trước |
| Ảnh | Chọn hãng | "Đọc số liệu" | Đang đọc (1,5 s) |
| Ảnh | Đang đọc | Hết giờ, ảnh rõ / ảnh mờ / "Huỷ" | Kiểm tra / Không đọc được / Chọn hãng |
| Ảnh | Không đọc được | "Chọn ảnh khác" | Chọn hãng |
| Ảnh | Kiểm tra | "Lưu" hợp lệ / "Chọn ảnh khác" | Đã lưu (toast) / Chọn hãng |
| QR | Chờ quét | Quét thành công / mã không đọc được | Đang liên kết (1 s) / Mã lỗi |
| QR | Đang liên kết | Hết giờ | Đã liên kết → "Nhập dữ liệu phiên" → CSV › Xem trước |
| QR | Mã lỗi | "Quét lại" | Chờ quét |

Nguồn: `lib/reducer.ts:50-52,141-145`; `app/metrics/import-csv.tsx:48,150,168`; `app/metrics/import-photo.tsx:53,105-158`; `app/metrics/scan-qr.tsx:18-23,62-73`.

### 6.8 Gậy

| Trạng thái | Sự kiện | Trạng thái kế | Ai / điều kiện |
|---|---|---|---|
| (chưa có) | Lưu form Thêm gậy (`upsertClub`, id mới) | Đang dùng | Người chơi, cho chính mình |
| Đang dùng | Lưu form Sửa (`upsertClub`, cùng id) | Đang dùng | Chủ gậy |
| Đang dùng | Lưu trữ (`archiveClub`, ghi `archivedAt`) | Lưu trữ | Chủ gậy, qua hộp thoại |
| Lưu trữ | Khôi phục (`unarchiveClub`, xoá `archivedAt`) | Đang dùng | Chủ gậy, không cần xác nhận |
| Lưu trữ | Sửa | Không đổi | Bị chặn: màn sửa chuyển về chi tiết |
| Đang dùng / Lưu trữ | Xoá (`deleteClub`) khi `clubLinkCount = 0` | Đã xoá hẳn | Chủ gậy, qua hộp thoại |
| Đang dùng / Lưu trữ | Xoá khi `clubLinkCount > 0` | Không đổi | Màn không có nút; reducer bỏ qua lệnh |

Nguồn: `lib/reducer.ts:13,31,53-54,146-147`; `app/clubs/[id]/index.tsx:141-198`; `app/clubs/[id]/edit.tsx:14`.

### 6.9 Cộng đồng: bài viết, theo dõi, lượt thích, chặn

| Đối tượng | Trạng thái | Sự kiện | Trạng thái kế | Ai |
|---|---|---|---|---|
| Bài | Nháp (form) | Đăng, form không hợp lệ | Nháp, hiện lỗi theo trường | Tác giả |
| Bài | Nháp | Đăng, form hợp lệ | Đang đăng (600 ms, nút khoá) | Tác giả |
| Bài | Đang đăng | Hết độ trễ, không bật lỗi | Đã đăng (lên đầu bảng tin) | Hệ thống (`addPost`) |
| Bài | Đang đăng | Hết độ trễ, bật giả lập lỗi | Nháp (giữ nội dung, toast "Thử lại") | Hệ thống |
| Bài | Đã đăng | Xác nhận "Xoá" | Xoá cứng, kèm lượt thích, bình luận, thông báo | Tác giả (sau khi rời màn) |
| Theo dõi A → B | Không theo dõi | "Theo dõi", chưa chặn nhau | Đang theo dõi; B nhận `follow` | A |
| Theo dõi A → B | Đang theo dõi | "Đang theo dõi" | Không theo dõi (không thông báo) | A |
| Theo dõi A → B | Đang theo dõi | A chặn B hoặc B chặn A | Không theo dõi, cả hai chiều | Người chặn |
| Lượt thích | Chưa thích | Thích | Đã thích; tác giả nhận `like` nếu là lần đầu của cặp | Người xem |
| Lượt thích | Đã thích | Thích lần nữa | Chưa thích (thông báo cũ giữ nguyên) | Người xem |
| Lượt thích | Bất kỳ | Bài bị xoá | Lượt thích bị xoá | Tác giả bài |
| Chặn A → B | Không chặn | A xác nhận Chặn trên hồ sơ B (chưa chặn nhau, không có kết nối active) | A chặn B; follow hai chiều bị gỡ; kết nối `pending` → `revoked` | A |
| Chặn A → B | A chặn B | A bấm "Bỏ chặn" ở Quyền riêng tư | Không chặn; follow và kết nối không được khôi phục | A |

Báo cáo không có vòng đời: gửi xong chỉ là một bản ghi, không có trạng thái xử lý.

### 6.10 Thông báo

| Trạng thái | Sự kiện | Trạng thái kế | Ai |
|---|---|---|---|
| — | Sự kiện ở §7 (người nhận ≠ người gây ra, qua chống lặp) | Chưa đọc | Reducer |
| Chưa đọc | Chạm thông báo / "Đánh dấu đã đọc tất cả" | Đã đọc (`readAt`) | Người nhận |
| Chưa đọc / Đã đọc | Người nhận và actor chặn nhau | Ẩn (dữ liệu và `readAt` giữ nguyên) | Một trong hai người |
| Ẩn | Gỡ hết chặn giữa hai người | Hiện lại với trạng thái đọc như trước | Người chặn |
| Bất kỳ | Xoá bài / swing mà `refId` trỏ tới | Đã xoá | Tác giả bài / chủ swing |

### 6.11 Ghi giả lập và tải lần đầu

| Trạng thái | Sự kiện | Trạng thái kế | Kích hoạt |
|---|---|---|---|
| Rảnh | Bấm Lưu / Xoá / Đăng (form hợp lệ, hoặc đã xác nhận Dialog xoá) | Đang bận (nút khoá, "Đang …") | Người dùng |
| Đang bận | Bấm lại | Đang bận (đồng hồ 0,6 s chạy lại) | Người dùng |
| Đang bận | Hết 0,6 s, cờ lỗi tắt | Thành công: phiên / Tài khoản / bài: ghi, toast 1,2 s rồi quay lại; gậy: ghi rồi quay lại (không toast); xoá phiên / gậy / swing: quay lại rồi mới xoá; xoá ghi chú: xoá, hiện "Đã xoá ghi chú" (BR-CAIDAT-25) | Hẹn giờ |
| Đang bận | Hết 0,6 s, cờ lỗi bật | Thất bại: không ghi, toast 4 s có "Thử lại" | Hẹn giờ + cờ Dev |
| Thất bại | "Thử lại" | Đang bận (form: kiểm lại form trước) | Người dùng |
| Thất bại | Hết 4 s | Rảnh (toast ẩn, form giữ nguyên) | Hẹn giờ |
| Đang bận | Rời màn | Huỷ, không ghi | Điều hướng |
| Màn chưa mở trong phiên | Mở màn | Khung xương 0,4 s → Đã tải (ghi nhớ khoá màn trong phiên JS) | Người dùng / hẹn giờ |
| Đã tải | Bắt đầu một luồng ở Dev | Chưa mở trong phiên | `resetFirstLoad()` |

Nguồn: `components/Feedback.tsx:36-54`; `components/ListSkeleton.tsx:6-22`.

---

## 7. Thông báo

Thông báo được sinh ngay trong reducer khi có sự kiện, và luôn có trong danh sách chuông, bất kể tuỳ chọn push. Có 8 loại (`lib/domain.ts:81`). Cột "Nội dung" ghi phần đi sau tên người gây ra.

| Loại | Sự kiện sinh | Người nhận | `actorId` / `refId` | Nội dung | Chạm → mở màn | Ẩn / chống lặp |
|---|---|---|---|---|---|---|
| `connect_request` | Gửi lời mời / yêu cầu kết nối trong app (`requestConnection`) | Bên kia của cặp | Bên gửi / kết nối | Người chơi nhận: "mời bạn kết nối"; HLV nhận: "muốn kết nối với bạn" | HLV → `/(coach)/roster`, mở sẵn mục Lời mời; người chơi → tab HLV `/(player)/coach` | Không chống lặp. Ẩn khi chặn nhau |
| `invite_accepted` | (a) Người chơi dùng mã mời hợp lệ; (b) bên nhận **chấp nhận** lời mời / yêu cầu (từ chối không báo) | (a) HLV chủ mã; (b) bên đã gửi | (a) người chơi, (b) bên chấp nhận / kết nối | HLV nhận: "đã chấp nhận lời mời"; người chơi nhận: "đã duyệt yêu cầu kết nối của bạn" | HLV → `/students/<actorId>`; người chơi → tab HLV | Không chống lặp. Ẩn khi chặn nhau. Kết nối đã huỷ: chạm vào ra 403 |
| `swing_uploaded` | Upload swing **lần đầu** chuyển sang `done` | **Mọi** HLV có kết nối active với người chơi (chính + phụ), mỗi HLV 1 bản ghi | Người chơi / swing | "vừa tải lên swing mới" | `/swings/<refId>` | Chỉ 1 lần mỗi swing (theo lần chuyển trạng thái). HLV `pending` / đã huỷ không nhận. Xoá swing thì xoá |
| `analysis_done` | Job **lần đầu** chuyển sang `succeeded` hoặc `needs_review` (`failed` không báo) | Chủ swing | Không có actor (hệ thống) / swing | Cả câu: "Phân tích swing đã xong" | `/swings/<refId>` | Chỉ 1 lần (theo lần chuyển trạng thái). Không bao giờ bị ẩn vì chặn. Xoá swing thì xoá |
| `coach_note` | HLV active thêm ghi chú vào swing | Chủ swing | HLV / swing | "đã ghi chú swing của bạn" | `/swings/<refId>` (chưa tự tua tới mốc) | Mỗi ghi chú 1 thông báo. Sửa không báo lại. Xoá ghi chú **không** thu hồi. Xoá swing thì xoá |
| `follow` | Bật theo dõi | Người được theo dõi | Người theo dõi / không có `refId` | "đã theo dõi bạn" | Hồ sơ người theo dõi (`/coaches/<id>` hoặc `/users/<id>`) | **Không** chống lặp: theo dõi lại thì báo lại. Bỏ theo dõi không xoá |
| `like` | Lần thích đầu tiên theo cặp (người, bài) | Tác giả bài | Người thích / bài | "đã thích bài viết của bạn" | `/posts/<refId>` | 1 thông báo mỗi cặp, mãi mãi. Bỏ thích không xoá. Xoá bài thì xoá |
| `comment` | Mỗi bình luận | Tác giả bài | Người bình luận / bài | "đã bình luận bài viết của bạn" | `/posts/<refId>` | Không gộp, không chống lặp. Người được `@` và người bình luận khác không nhận. Xoá bài thì xoá |

**Luật chung** (BR-CONGDONG-34…41, BR-SWING-38):
- **Không tự báo cho mình:** người nhận trùng người gây ra thì không sinh thông báo.
- **Ẩn theo chặn:** thông báo có `actorId` là người đã chặn người nhận, hoặc bị người nhận chặn, bị ẩn khi hiển thị và không tính vào badge. Thông báo không bị xoá; bỏ chặn thì hiện lại.
- **Đã đọc:** chạm một thông báo thì đánh dấu riêng nó và mở màn đích. "Đánh dấu đã đọc tất cả" đánh dấu mọi thông báo chưa đọc, kể cả thông báo đang ẩn. Không xác định được màn đích thì chỉ đánh dấu đã đọc.
- **Màn đích tự kiểm quyền:** thông báo cũ của HLV đã bị huỷ kết nối vẫn mở được, nhưng ra 403.
- **Xoá theo đối tượng:** xoá bài thì xoá `like` / `comment` của bài; xoá swing thì xoá `swing_uploaded` / `analysis_done` / `coach_note` của swing. Các thao tác khác không xoá thông báo.
- **Danh sách:** xếp mới → cũ, nhóm "Mới" (chưa đọc) / "Trước đó" (đã đọc). Actor không còn hồ sơ thì hiện "Người dùng".
- **Không sinh thông báo:** từ chối hay huỷ lời mời / yêu cầu, huỷ kết nối, đổi HLV chính, tạo hay thu hồi mã, mọi thao tác số liệu và bộ gậy, lỗi phân tích, sửa / xoá ghi chú, đăng bài, chia sẻ, báo cáo, chặn / bỏ chặn, bỏ thích, bỏ theo dõi.

**Công tắc push theo vai** (Cài đặt › Thông báo; chỉ áp cho push, push chưa làm; mặc định bật; BR-CONGDONG-40):

| Loại | Nhãn công tắc | Người chơi | HLV |
|---|---|---|---|
| `coach_note` | Ghi chú của HLV | có | — |
| `analysis_done` | Phân tích swing xong | có | — |
| `swing_uploaded` | Học viên đăng swing mới | — | có |
| `connect_request` | Lời mời và yêu cầu kết nối | có | có |
| `invite_accepted` | Kết nối được chấp nhận | có | có |
| `follow` | Người theo dõi mới | có | có |
| `like` | Lượt thích bài viết | có | có |
| `comment` | Bình luận bài viết | có | có |

Cộng thêm công tắc "Giờ yên lặng (22:00–07:00)", mặc định tắt.

Nguồn: `lib/reducer.ts:38-39,56-83,86-97,105-126,140,159-177`; `lib/selectors.ts:87-90`; `components/NotificationsScreen.tsx:15-70,108-155`; `app/settings/notifications.tsx:10-56`; `lib/reducer.test.ts:125-182,292-340`; F11.

---

## 8. Kiểm tra dữ liệu (validate)

Quy ước chung:
- **Ô số** đọc theo kiểu VN: dấu phẩy hay dấu chấm đều là dấu thập phân, không có ngăn nghìn (`lib/format.ts:75-79`). Ngoại lệ: ô đơn giá, nơi dấu chấm là ngăn nghìn.
- Ô có `digits = 0` mà gõ dạng ngăn nghìn (`^\d{1,3}([.,]\d{3})+$`) thì báo "Không dùng dấu chấm ngăn nghìn (vd …)". Dù vậy, các ô này vẫn nhận số lẻ.
- Khoảng hợp lệ gồm cả hai biên.
- Lỗi form chỉ hiện sau lần bấm nút gửi đầu tiên, trừ: bước Kiểm tra OCR (hiện ngay), ô mã mời (hiện khi bấm Kiểm tra), OTP (hiện khi đủ 6 số).

**Tài khoản**

| Trường | Quy tắc / khoảng | Thông báo lỗi | Luật |
|---|---|---|---|
| Vai (đăng ký) | Bắt buộc chọn 1 trong 2 | Nút "Tiếp" bị tắt | BR-TAIKHOAN-04 |
| Họ tên | Bỏ khoảng trắng hai đầu, gộp khoảng trắng; không rỗng; không giới hạn độ dài | "Bắt buộc" | BR-TAIKHOAN-06, -26 |
| Email (đăng ký) | Bỏ khoảng trắng hai đầu; khớp `^[^\s@]+@[^\s@]+\.[^\s@]+$`; duy nhất, so không phân biệt hoa thường | "Bắt buộc" / "Email không hợp lệ" / "Email đã có tài khoản" | BR-TAIKHOAN-07 |
| SĐT | Bỏ mọi khoảng trắng; khớp `^0\d{9}$`; duy nhất (khi sửa: trừ chính mình) | "Bắt buộc" / "Gồm 10 số, bắt đầu bằng 0" / "Số điện thoại đã có tài khoản" | BR-TAIKHOAN-08, -26 |
| Mật khẩu (đăng ký, đặt lại, đổi) | ≥ 8 ký tự, ≥ 1 chữ số | "Bắt buộc" / "Tối thiểu 8 ký tự, có ít nhất 1 chữ số" | BR-TAIKHOAN-09 |
| Mật khẩu nhập lại | Khớp mật khẩu mới | "Mật khẩu nhập lại không khớp" | BR-TAIKHOAN-23, -24 |
| Mật khẩu hiện tại (đổi) | Bắt buộc; mật khẩu mới phải khác nó | "Bắt buộc" / "Phải khác mật khẩu hiện tại" | BR-TAIKHOAN-24 |
| Handicap (người chơi) | Bắt buộc; số 0–54, cho phép thập phân | "Bắt buộc" / "Không phải số" / "Trong khoảng 0–54" | BR-TAIKHOAN-10, -27 |
| Học viện / CLB (HLV) | Bắt buộc, không rỗng sau khi bỏ khoảng trắng hai đầu | "Bắt buộc" | BR-TAIKHOAN-10, -27 |
| Số năm kinh nghiệm (HLV) | Bắt buộc; số nguyên 0–60 | "Bắt buộc" / "Không phải số" / "Số nguyên 0–60" | BR-TAIKHOAN-10, -27 |
| Giới thiệu | HLV bắt buộc 20–300 ký tự; người chơi tuỳ chọn, ≤ 300. Đếm `.length` sau khi bỏ khoảng trắng hai đầu (một emoji có thể tính là 2) | "Bắt buộc" / "Tối thiểu 20 ký tự" / "Tối đa 300 ký tự" | BR-TAIKHOAN-17, -26 |
| CLB / sân tập (người chơi) | Tuỳ chọn; bỏ khoảng trắng hai đầu; để trống thì xoá | — | BR-TAIKHOAN-27 |
| Đơn giá (HLV) | Tuỳ chọn; bỏ dấu chấm và khoảng trắng; chỉ chữ số; 0–10.000.000 | "Số tiền không hợp lệ" / "Tối đa 10.000.000 đ" | BR-TAIKHOAN-27 |
| Mã OTP | 6 chữ số (ô chỉ nhận số, tối đa 6); mock `123456` | "Mã không đúng, vui lòng thử lại" | BR-TAIKHOAN-12, -13 |
| Bản nháp đăng ký (URL) | Đúng khoá cho phép; có vai hợp lệ, họ tên, email, SĐT; JSON đúng | "Thiếu thông tin đăng ký" | BR-TAIKHOAN-11 |
| Đăng nhập: Email / SĐT, Mật khẩu | Cả hai bắt buộc; mock nhận mật khẩu ≥ 6 ký tự | "Bắt buộc" / "Email/SĐT hoặc mật khẩu không đúng" | BR-TAIKHOAN-20 |
| Email quên mật khẩu | Bắt buộc, đúng định dạng | "Bắt buộc" / "Email không hợp lệ" | BR-TAIKHOAN-21 |
| Token đặt lại | `ok` / `expired` / sai hoặc thiếu | "Link đã hết hạn" / "Link không hợp lệ" | BR-TAIKHOAN-22 |

**Kết nối**

| Trường | Quy tắc / khoảng | Thông báo lỗi | Luật |
|---|---|---|---|
| Mã mời (ô nhập) | Lấy mã từ link `…/i/<mã>`; in hoa; chỉ A–Z, 0–9; tối đa 6; phải đủ 6 | "Nhập mã mời" / "Mã mời gồm 6 ký tự" | BR-KETNOI-08, -09 |
| Mã mời (kiểm) | Theo thứ tự `not_found` → `revoked` → `used` → `expired` → `already_connected` → `ok` | "Mã không tồn tại" / "Mã đã bị thu hồi" / "Mã đã được sử dụng" / "Mã đã hết hạn — xin HLV mã mới" / "Bạn đã kết nối với HLV này" | BR-KETNOI-10 |
| Ô tìm học viên | Trống thì không có kết quả; SĐT chỉ so khi chuỗi có ≥ 3 chữ số | "Không có người chơi phù hợp — …" | BR-KETNOI-13 |

**Số liệu**

| Trường | Quy tắc / khoảng | Thông báo lỗi | Luật |
|---|---|---|---|
| Tốc độ đầu gậy | Bắt buộc; 40–150 mph | "Bắt buộc" / "Không phải số" / "Trong khoảng 40–150 mph" / "Không dùng dấu chấm ngăn nghìn (vd …)" | BR-SOLIEU-06, -07 |
| Tốc độ bóng | Bắt buộc; 50–220 mph | như trên, "Trong khoảng 50–220 mph" | BR-SOLIEU-06 |
| Smash factor | Bắt buộc; 1–1,56 | "Trong khoảng 1–1,56" | BR-SOLIEU-06 |
| Spin | Bắt buộc; 500–12000 rpm | "Trong khoảng 500–12000 rpm"; ngăn nghìn: "Không dùng dấu chấm ngăn nghìn (vd 2650)" | BR-SOLIEU-06, -07 |
| Góc bắn | Bắt buộc; −10–45° | "Trong khoảng -10–45°" | BR-SOLIEU-06 |
| Carry (mét) | Bắt buộc; 10–350 m | "Trong khoảng 10–350 m" | BR-SOLIEU-06 |
| Carry (yard) | Bắt buộc; 10,9–382,8 yd; lưu: đổi về mét, làm tròn 0,1 m, kẹp 10–350 | "Trong khoảng 10,9–382,8 yd" | BR-SOLIEU-08 |
| Cân nặng | Bắt buộc; 30–200 kg | "Trong khoảng 30–200 kg" | BR-SOLIEU-06 |
| Độ dẻo | Bắt buộc; 0–10 | "Trong khoảng 0–10/10" | BR-SOLIEU-06 |
| Lực nắm | Bắt buộc; 5–100 kg | "Trong khoảng 5–100 kg" | BR-SOLIEU-06 |
| Bật cao | Bắt buộc; 5–120 cm | "Trong khoảng 5–120 cm" | BR-SOLIEU-06 |
| Gậy của phiên swing | Bắt buộc ở nhập tay (trừ khi sửa phiên vốn không có gậy), CSV, ảnh; chỉ gậy đang dùng của mình | "Bắt buộc"; CSV: "Chưa nhập: chọn gậy cho {N} phiên." | BR-SOLIEU-09, -17, -20 |
| Ngày của phiên | Không sau hôm nay (khoá trên lịch); ảnh luôn = `NOW` | — | BR-SOLIEU-10, -20 |
| File CSV | Tiêu đề phải nhận ra TrackMan (`,`) hoặc Foresight (`;`) | "Không nhận diện được file" | BR-SOLIEU-15 |
| Dòng CSV | Kiểm như ô nhập tay; carry TrackMan đổi yard → mét làm tròn 1 m; dòng lỗi bị bỏ qua | "{Nhãn}: {lỗi}", "Dòng {n} · bỏ qua" | BR-SOLIEU-16 |
| Trường OCR | Như ô nhập tay; độ tin cậy < 0,8 bị đánh dấu | "Độ tin cậy thấp — kiểm tra lại" | BR-SOLIEU-19 |

**Bộ gậy**

| Trường | Quy tắc / khoảng | Thông báo lỗi | Luật |
|---|---|---|---|
| Loại gậy | Bắt buộc; 16 loại hoặc "Tuỳ chỉnh" | "Bắt buộc" | BR-BOGAY-01 |
| Tên gậy (Tuỳ chỉnh) | Bắt buộc khi loại = Tuỳ chỉnh | "Bắt buộc" | BR-BOGAY-07 |
| Hãng, Model, Hãng cán | Bắt buộc, không rỗng sau khi bỏ khoảng trắng hai đầu; không giới hạn độ dài | "Bắt buộc" | BR-BOGAY-03 |
| Flex | Luôn có 1 trong 5 giá trị; mặc định Regular | — | BR-BOGAY-06 |
| Trọng lượng cán | Tuỳ chọn; 30–150 g | "Trong khoảng 30–150 g" / "Không phải số" / "Không dùng dấu chấm ngăn nghìn (vd 1000)" | BR-BOGAY-04 |
| Loft | Bắt buộc; 0–64° | "Bắt buộc" / "Trong khoảng 0–64°" | BR-BOGAY-04 |
| Lie | Bắt buộc; 45–80° | "Bắt buộc" / "Trong khoảng 45–80°" | BR-BOGAY-04 |
| Bounce | Tuỳ chọn; 0–20° | "Trong khoảng 0–20°" | BR-BOGAY-04 |

**Swing**

| Trường | Quy tắc / khoảng | Thông báo lỗi | Luật |
|---|---|---|---|
| File video: loại | MIME bắt đầu bằng `video/` (kiểm trước) | "File không phải video" · "… là ảnh, không phân tích swing được. Chọn một video (.mp4, .mov)." | BR-SWING-03 |
| File video: dung lượng | ≤ 300 MB (số tạm); không kiểm thời lượng | "Video quá dung lượng" · "… — tối đa 300 MB. …" | BR-SWING-03 |
| Gậy của swing | Bắt buộc; gậy đang dùng của mình | "Bắt buộc"; "Chưa tải lên: chọn gậy cho video này." | BR-SWING-04 |
| Ngày quay | Không sau hôm nay theo ngày lịch VN | — (khoá trên lịch) | BR-SWING-05 |
| Nội dung ghi chú | Bỏ khoảng trắng hai đầu, không rỗng; ô nhập ≤ 500 ký tự (chỉ khi gõ) | "Nhập nội dung ghi chú" | BR-SWING-22 |
| Mốc ghi chú | `[x s]` đầu tiên, tối đa 2 chữ số thập phân; không có thì lấy vị trí phát; kẹp `0 … durationSec` | — | BR-SWING-23 |

**Cộng đồng**

| Trường | Quy tắc / khoảng | Thông báo lỗi | Luật |
|---|---|---|---|
| Tiêu đề bài | Bắt buộc; 1–120 ký tự sau khi bỏ khoảng trắng hai đầu | "Bắt buộc" / "Tối đa 120 ký tự" | BR-CONGDONG-02 |
| Nội dung bài | Bắt buộc; 1–2000 ký tự sau khi bỏ khoảng trắng hai đầu | "Bắt buộc" / "Tối đa 2000 ký tự" | BR-CONGDONG-03 |
| Tag | ≤ 5 (phần vượt bị bỏ); chữ thường, bỏ `#`, gộp khoảng trắng, không trùng; ô gõ ≤ 30 ký tự | — (không báo lỗi) | BR-CONGDONG-04 |
| Swing đính kèm | ≤ 1; của chính mình, đã tải xong | — | BR-CONGDONG-05 |
| Bình luận | Bỏ khoảng trắng hai đầu, rỗng thì không gửi; thân ≤ 1000 ký tự (ô cắt khi gõ) | — | BR-CONGDONG-15 |
| Lý do báo cáo | Bắt buộc; 1 trong 4 giá trị | "Chọn một lý do để gửi báo cáo." | BR-CONGDONG-31 |

**Không kiểm ở reducer** (chỉ UI chặn; backend phải kiểm lại): độ dài và nội dung rỗng của bình luận; mọi trường của bài viết và báo cáo; độ dài ghi chú (nút "Chèn mốc" vượt được 500); định dạng và trùng lặp của bản nháp đăng ký; chủ sở hữu khi xoá phiên, xoá bài, xoá swing, ghi gậy / swing, thu hồi mã mời; người gọi và trạng thái hiện tại khi huỷ kết nối (`revokeConnection`); bên nhận khi trả lời lời mời / yêu cầu.

---

## 9. Giả lập trong bản hiện tại & yêu cầu cho backend thật

### 9.1 Những gì đang giả lập

| Hạng mục | Bản mock làm gì | Nguồn |
|---|---|---|
| Lưu trữ | Mọi dữ liệu nằm trong bộ nhớ (React reducer + `seedState`), tải lại là mất, kể cả tài khoản vừa tạo và phiên đăng nhập | `lib/store.tsx:8-12`; F01:43 |
| Thời gian, id | `NOW = 2026-10-07T08:00:00Z` cố định cho mọi `createdAt`, mọi phép kiểm hạn và ô ngày mặc định. Id sinh theo bộ đếm phía máy | `lib/mock.ts:4`; `lib/ids.ts:4-5` |
| Dữ liệu mẫu | Tài khoản mẫu; `p-minh` có 10 phiên swing, 2 phiên thể lực, 8 gậy (Driver gắn 7 phiên / swing, PW không gắn gì). Mã mời `TUAN24` (còn hạn), `HAEXP1` (hết hạn), `USED01` (đã dùng); cộng đồng 6 bài, 6 lượt thích, 4 bình luận, 5 follow, 6 thông báo | `lib/mock.ts:11-133`; F04:7 |
| Mật khẩu | Không lưu ở đâu. Đăng nhập nhận mọi mật khẩu ≥ 6 ký tự. Đặt lại và đổi mật khẩu chỉ kiểm định dạng | `app/(auth)/login.tsx:21,24`; `app/settings/password.tsx:19` |
| OTP | Mã cố định `123456`. Không gửi SMS, không hạn, không giới hạn số lần thử | `app/(auth)/verify-otp.tsx:11-12` |
| Email đặt lại | Không gửi email. Token cố định `GG-RESET-OK` / `GG-RESET-EXPIRED`, dùng lại được | `lib/simulate.ts:136-139`; F03:47 |
| Ảnh đại diện | Xoay vòng 4 ảnh `i.pravatar.cc`. Không mở thư viện ảnh hay camera, không upload | `lib/simulate.ts:141-144` |
| Ghi giả lập | 600 ms; lỗi chỉ khi bật cờ Dev; chỉ áp cho 4 form và 4 nút xoá (BR-CAIDAT-25). Mọi thao tác khác ghi ngay (BR-CAIDAT-26) | `components/Feedback.tsx:36-54`; `lib/simulate.ts:134` |
| Tải lần đầu | Khung xương 400 ms ở lần mở đầu mỗi màn, ghi nhớ bằng một `Set` cấp module. Không có pha tải thật hay lỗi tải | `components/ListSkeleton.tsx:6-22` |
| Mã mời | Sinh trên máy bằng `Math.random`, chỉ tránh trùng với mã trong bộ nhớ. Link mời dùng tên miền giả, chưa có deep link / universal link | `lib/ids.ts:10-14`; `app/connect/invite.tsx:15-16` |
| Chia sẻ | Clipboard của RN core. "Gửi" trong ShareSheet chỉ chép chữ, chưa có hộp thư trong app. Link bài giả `https://gramgolf.app/p/<id>` | `app/connect/invite.tsx:47-48,168-169`; `components/PostItem.tsx:15-16,97-101` |
| Tìm người chơi để mời | Khớp chuỗi con trên tên / email / SĐT của dữ liệu mẫu | `lib/selectors.ts:105-118`; báo cáo:43 |
| CSV | Chưa mở file thật, chỉ có 3 file mẫu: TrackMan 4 dòng hợp lệ + 1 dòng lỗi; Foresight 3 dòng; 1 file không nhận diện được. Parser chỉ tách theo dấu phân cách, chưa hiểu ô có nháy kép. File nhiều gậy vẫn chỉ gắn một gậy | `lib/simulate.ts:5-31`; `lib/csv.ts:13`; `app/metrics/import-csv.tsx:45,84-86` |
| OCR | 2 ảnh mẫu (một đọc được, một mờ). Giá trị cố định theo hãng; spin cố ý có độ tin cậy 0,62 với chuỗi lỗi "2B10" / "6B40", các trường khác 0,97. Đọc mất 1,5 s | `lib/simulate.ts:94-108,134` |
| QR | Chưa dùng camera. Hai nút mô phỏng thành công / lỗi; liên kết 1 s; mã phiên cố định "#A1F3"; file đích là file TrackMan mẫu | `app/metrics/scan-qr.tsx:10-11,18-23,71-72` |
| "Dữ liệu gốc" | Hiện số đã chuẩn hoá dạng JSON, không phải bản ghi gốc của máy đo. Sửa phiên ghi đè số gốc | `app/metrics/[id].tsx:86-88`; F05:63 |
| Chọn video | 7 video mẫu: 5 hợp lệ, 1 file quá dung lượng (1,5 GB `.mov`), 1 ảnh `.jpg` | `lib/simulate.ts:33-44`; `app/swings/new.tsx:132-133` |
| Tải lên video | Bộ đếm trên màn: 150 ms mỗi nhịp, +5 %, khoảng 3 s. `wedge_mang_yeu.mp4` lỗi ở 60 %; thử lại thì đi tiếp. Chỉ chạy khi màn của chủ swing đang mở | `lib/simulate.ts:70-78`; `components/SwingUpload.tsx:25-26` |
| Phân tích | `queued` 500 ms, rồi `processing` 250 ms mỗi nhịp, +10 %. Kết quả cố định theo tên file: `driver_nguoc_sang.mp4` → `needs_review` (độ tin cậy 0,41, không tip); `pw_may_chu_ban.mp4` lỗi ở 50 %. FPS luôn 60, model `pose-mock-0.1`. Chỉ chạy khi màn chi tiết đang mở trên máy chủ swing hoặc HLV active | `lib/simulate.ts:46-92`; `app/swings/[id].tsx:210-213` |
| Phát video | Khung 9:16 có bóng người thay hình thật; vị trí phát chạy theo đồng hồ 100 ms; chưa kéo hay tua tự do. Thumbnail là khung tối có icon play | `app/swings/[id].tsx:29,195-208`; `components/SwingCard.tsx:35`; F07:54-55 |
| Thông báo | Chỉ có trong app. Chưa có push. Tuỳ chọn theo loại và giờ yên lặng chỉ được lưu, reducer không đọc | `lib/reducer.ts:38-39`; F11:38 |
| Công khai bộ gậy / swing | Chỉ lưu cờ; `canViewPrivate` không đọc | `app/settings/privacy.tsx:50` |
| Xoá tài khoản | Chỉ đăng xuất; dữ liệu vẫn trong bộ nhớ | `app/settings/privacy.tsx:100` |
| Quyền | Phần lớn chỉ do màn hình chặn. Reducer chỉ tự kiểm: vai khi dùng mã, kết nối active khi thêm / sửa / xoá ghi chú, chủ và loại khi sửa phiên, `clubLinkCount` khi xoá gậy, tự theo dõi và theo dõi khi đang chặn, kết nối mở và chặn khi gửi / trả lời lời mời | `lib/reducer.ts:78-98,107,141-158,159-178` |
| Công cụ Dev | Đổi tài khoản không mật khẩu, `?as=`, giả lập lỗi, đặt lại dữ liệu mẫu, "Kiểm tra theo luồng". Chỉ bản dev | BR-TAIKHOAN-32, BR-CAIDAT-28 |

### 9.2 Backend thật phải bảo đảm

Nguyên tắc: **không tin client.** Mọi luật trong đặc tả này đang chạy ở client; backend phải tự thi hành lại, nhất là các luật có ghi "chỉ UI chặn".

#### A. Xác thực và tài khoản

1. **Kiểm lại toàn bộ dữ liệu đăng ký ở server.** Màn OTP tạo hồ sơ từ bản nháp trong URL. `parseRegistrationDraft` chỉ lọc khoá, không kiểm định dạng hay trùng, nên link sửa tay tạo được hồ sơ có email trùng, SĐT sai dạng, HLV thiếu học viện, handicap ngoài 0–54. BR-TAIKHOAN-06…-10 phải chạy lại ở server (`lib/validation.ts:166-177`; `app/(auth)/verify-otp.tsx:18,40`).
2. **Vai do server quyết và bất biến.** Không tin `role` gửi từ client. Client không được ghi `role`, `email`, `rating`, `verified` (hoặc `coach_verification_status`): chặn bằng quyền theo cột hoặc DB function (tech review:125-129).
3. **OTP qua SMS tới SĐT đã khai:** mã 6 số, chỉ cho gửi lại sau 60 giây. Hạn của mã và giới hạn số lần thử chưa có quyết định (§11).
4. **Mật khẩu** lưu dạng băm (Supabase Auth). Server áp luật ≥ 8 ký tự + ≥ 1 chữ số. Đổi mật khẩu phải kiểm mật khẩu hiện tại ở server.
5. **Token đặt lại** dùng một lần, hết hạn sau 30 phút, kiểm ở server. API quên mật khẩu trả cùng một phản hồi, dù email có tồn tại hay không.
6. **Đăng nhập** bằng email hoặc SĐT; lỗi chung không lộ trường nào sai; có rate limit chống dò mật khẩu (tech review:358).
7. **Hồ sơ:** RLS chỉ cho chủ sửa hàng của mình. Kiểm trùng SĐT phải loại trừ chính mình. Trường tuỳ chọn gửi rỗng thì đặt `NULL`. Thống nhất cách đếm ký tự của `bio` giữa client và server.
8. **Xoá tài khoản:** gọi API xoá thật, thành công rồi mới đăng xuất. Phạm vi xoá phải khớp câu chữ trên Dialog (hồ sơ, thông số, swing, bộ gậy, bài đăng, kết nối), hoặc sửa câu chữ cho khớp. Xoá cả file trong storage.
9. **Ảnh đại diện:** upload thật (expo-image-picker + Storage, bảng `media_assets`), kiểm MIME và dung lượng (tech review:30,164).
10. **Phiên bền vững** qua các lần mở app. `profiles.id = auth.users.id` (tech review:201).

#### B. Quyền xem: RLS phản chiếu `canViewPrivate`

11. **Dữ liệu riêng** (`metric_sessions` + `swing_metrics` / `fitness_metrics`, `clubs`, `swings`, `coach_notes`, file video) chỉ đọc được bởi chủ dữ liệu, hoặc HLV có `coach_connections.status = 'active'` với chủ dữ liệu. Follow, `pending`, `declined`, `revoked` đều bị từ chối. Huỷ kết nối có hiệu lực ngay, cắt cả dữ liệu cũ (BR-KETNOI-26). `player_id` lấy từ `auth.uid()`.
12. **Quyền ghi:**

    | Bảng / thao tác | Ai được |
    |---|---|
    | Phiên số liệu, gậy, swing: tạo / sửa / xoá | Chỉ chủ (vai `player`). Không đổi `player_id` hay `kind` của phiên đã có. Server quyết có cấm sửa gậy đã lưu trữ hay không |
    | Tải lên, yêu cầu / thử lại phân tích | Chỉ chủ swing |
    | `coach_notes`: thêm | HLV có kết nối active với chủ swing |
    | `coach_notes`: sửa / xoá | Tác giả, khi kết nối còn active |
    | Đọc ghi chú | Chủ swing và HLV active |
    | Tạo / thu hồi mã mời | Chỉ HLV chủ mã |
    | Trả lời lời mời / yêu cầu | Chỉ bên **nhận** (khác `requested_by`) |
    | Huỷ lời mời / yêu cầu đang chờ | Chỉ bên **gửi** |
    | Huỷ kết nối active | Một trong hai bên của kết nối |
    | Đổi HLV chính | Chỉ người chơi |
    | Bài: tạo / xoá | Chỉ tác giả |
    | `markRead` | Chỉ trên thông báo của chính mình |
    | Preferences | Chỉ chủ đọc / ghi |

13. **Mỗi policy có test "được phép" và test "bị từ chối"**, nhất là các trường hợp `pending`, `revoked`, follow và bị chặn (tech review:231-265).
14. **403 hay 404:** với RLS, bản ghi không có quyền đọc trông giống bản ghi không tồn tại. App đang phân biệt "Không tìm thấy …" với "Không có quyền xem". Backend cần cách trả về giữ được phân biệt này (vd RPC kiểm tồn tại), hoặc chấp nhận gộp, vì gộp cũng tránh lộ id có tồn tại (BR-CAIDAT-21, -22).
15. **Công khai bộ gậy / swing:** nếu giữ 2 công tắc, RLS của `clubs` và `swings` phải mở quyền đọc khi cờ bật, kèm màn xem công khai. Nếu bỏ thì gỡ công tắc (§11).

#### C. Ràng buộc dữ liệu (DB)

16. **Duy nhất:**
    - `profiles`: email (unique trên `lower(email)` hoặc `citext`); SĐT đã chuẩn hoá (chỉ giữ chữ số), vì seed đang lưu có khoảng trắng.
    - `coach_connections`: partial unique `(coach_id, player_id) WHERE status IN ('pending','active')`; partial unique `(player_id) WHERE is_primary AND status = 'active'`.
    - `coach_invites.code` unique.
    - `likes (user_id, post_id)` unique; `follows` khoá chính `(follower_id, followed_id)` + check không tự theo dõi; `blocks (blocker_id, blocked_id)` unique + check không tự chặn.
17. **CHECK và enum** theo đúng §4 và §8:
    - 6 chỉ số swing và 4 chỉ số thể lực, mỗi phiên có đúng một khối; `captured_at` không sau thời điểm hiện tại; carry lưu bằng mét.
    - `clubs.type` là enum / lookup 16 loại + "Tuỳ chỉnh"; `shaft_flex` là enum 5 giá trị. NOT NULL: brand, model, shaft_brand, shaft_flex, loft_deg, lie_deg. CHECK: shaft_weight_g 30–150, loft 0–64, lie 45–80, bounce 0–20. `custom_name` không rỗng khi và chỉ khi `type = 'Tuỳ chỉnh'`.
    - Swing: `camera_view` là enum; `0 ≤ at_sec ≤ duration`; ghi chú không rỗng, ≤ 500 ký tự.
    - Bài: title 1–120, content 1–2000, ≤ 5 tag đã chuẩn hoá. Bình luận không rỗng, thân ≤ 1000 (cần chốt giới hạn cho cả chuỗi có `@tên`). `reports.reason` thuộc 4 giá trị.
    - Đặt giới hạn độ dài cho mọi cột chữ: code hiện chưa giới hạn họ tên, học viện, CLB, hãng, model.
18. **Khoá ngoại:** `metric_sessions.club_id` và `swings.club_id` đặt `ON DELETE RESTRICT` (hoặc kiểm ở RPC), vì gậy đã gắn dữ liệu chỉ được lưu trữ (tech review:210). Gậy gắn vào phiên / swing phải thuộc cùng chủ. `posts.swing_id` phải là swing của tác giả và đã tải xong; khi swing bị xoá thì cần chốt `SET NULL` hay chặn xoá (§11). `reports` thêm `comment_id`.
19. **Thời gian do server gắn:** `created_at`, `updated_at`, `edited_at`, `archived_at`, `expires_at`, `revoked_at`, `read_at`. Lưu UTC.

#### D. Kết nối và mã mời

20. **Mã mời sinh ở server:** ngẫu nhiên kiểu mật mã, bảng 32 ký tự, unique; `expires_at = created_at + 7 ngày`, so với giờ server; so mã không phân biệt hoa thường. Chốt định dạng mã hợp lệ, vì mã mẫu `HAEXP1`, `USED01` dùng 0 / 1 nằm ngoài bảng.
21. **Chấp nhận mã là một giao dịch nguyên tử:** khoá dòng mã; kiểm lần lượt not_found / chặn → revoked → used → expired → already_connected; kiểm người dùng có `role = player`; tạo kết nối active với `is_primary` tính trong giao dịch; ghi `used_by`; đóng các kết nối `pending` của cặp; tạo thông báo. Nhờ vậy, hai người không dùng được cùng một mã, và hai kết nối không cùng thành HLV chính.
22. **Kích hoạt lời mời / yêu cầu** cũng tính `is_primary` trong giao dịch, tại thời điểm kích hoạt.
23. **Chặn:** mã của người chặn / bị chặn trả về như "không tồn tại"; từ chối gửi hay trả lời lời mời / yêu cầu khi đang chặn nhau. Khi chặn, gỡ follow hai chiều và đóng kết nối `pending` của cặp **trong cùng giao dịch**, có ghi `revoked_at` (khác mock). Từ chối lệnh chặn khi cặp đang có kết nối active, **hoặc** chốt luật "chặn = tự huỷ kết nối" (§11). Không làm vậy thì HLV bị chặn vẫn xem và ghi chú được.
24. **Tìm người chơi để mời phải khớp chính xác email / SĐT** để không lộ danh bạ (F04:79; báo cáo:43). Tìm theo tên thì không dấu, khớp một phần.
25. **Giới hạn tần suất** nhập mã sai và gửi lời mời. *Đề xuất, chưa có trong tài liệu:* không gian mã 32⁶ ≈ 1,07 tỷ vẫn dò được nếu không giới hạn.
26. **Lịch sử:** không xoá bản ghi kết nối khi huỷ hay từ chối. Xoá tài khoản thì xoá các kết nối liên quan.

#### E. Số liệu

27. **Import CSV theo pipeline:** upload → `import_files` kèm checksum → nhận hãng và phiên bản từ tiêu đề → parse vào staging rows → preview → người dùng xác nhận → commit mọi dòng hợp lệ **trong một transaction**. Giữ file gốc, `parser_version`, `raw_payload` JSONB, và `raw_value` / `raw_unit` cho carry đã đổi từ yard. Parser CSV thật (nháy kép, BOM), test hợp đồng bằng file TrackMan / Foresight thật (tech review:143-148,206-207,266-273,379).
28. **Truy vết nguồn:** lưu `source_type`, `source_vendor`, `source_file_id`, `created_by`, `validation_status` (tech review:134-135).
29. **OCR:** crop guide, tiền xử lý ảnh, Cloud Vision, parser theo template, lưu độ tin cậy từng trường, chỉ lưu sau màn review. Bản OCR thô giữ có thời hạn. Không dùng LLM vision làm parser duy nhất (tech review:274-280).
30. **QR:** chỉ làm khi đã có QR mẫu và quyền truy cập luồng của đối tác. Không giả định QR chứa sẵn chỉ số; QR TrackMan là cơ chế đăng nhập nhanh (tech review:139,155-157).
31. **Xu hướng và carry theo gậy** là truy vấn (view / RPC), không lưu sẵn, và giữ đúng luật lọc của BR-SOLIEU-25…27.

#### F. Swing và lưu trữ file

32. **Kiểm file ở server:** MIME `video/*`, dung lượng ≤ giới hạn (tạm 300 MB), nên thêm giới hạn thời lượng. Upload thẳng vào bucket private bằng giao thức resumable (tạm dừng / tiếp tục / thử lại). Chỉ phát qua signed URL ngắn hạn. Worker tạo thumbnail và proxy (tech review:29-30,163-166,381).
33. **Job phân tích chạy nền,** không phụ thuộc màn đang mở. Máy trạng thái có `attempts`, `error_code`, `idempotency_key`; tối đa 1 job đang chạy mỗi swing. Kết quả lưu `model_version`, `confidence`, FPS thực đo, `quality flags` (tech review:93,212-213,283,287-288).
34. **Không ghi chú hay phân tích khi `upload ≠ done`.**
35. **Xoá swing theo dây chuyền:** xoá ghi chú, thông báo trỏ tới swing, file video và thumbnail trong storage (theo chính sách lưu giữ) (tech review:166,355).

#### G. Cộng đồng

36. **Chặn phải lọc ở truy vấn,** không chỉ ở UI: bảng tin, khám phá, danh sách theo dõi, mọi số đếm, danh sách người thích, bình luận, thông báo, badge chưa đọc, người nhận chia sẻ. Đọc, thích, bình luận bị từ chối khi hai bên chặn nhau (tech review:192,256-259).
37. **Xoá bài nên xoá mềm** (`deleted_at`) để báo cáo vẫn trỏ được tới nội dung. Thêm `moderation_status` và hàng duyệt báo cáo cho admin (tech review:183,191). Mock đang xoá cứng.
38. **Bảng tin phân trang bằng cursor** (`created_at`, `id`), không dùng offset (tech review:181).
39. **Tìm Khám phá phía server** không phân biệt dấu (unaccent, `đ` → `d`) và khớp một phần tên (tech review:190).
40. **Rate limit** cho đăng bài, bình luận, theo dõi, báo cáo (tech review:191,358).
41. **Liên kết chia sẻ** do server cấp, kèm universal link / deep link. Nếu làm "Gửi" thật cho người đã chọn thì cần hộp thư hoặc tin nhắn.

#### H. Thông báo

42. **Sinh ở server** (trigger hoặc trong giao dịch), đúng loại và người nhận như §7. Giữ đủ: không tự báo cho mình; chống lặp `like` theo cặp, `swing_uploaded` / `analysis_done` theo lần chuyển trạng thái; xoá theo dây chuyền khi xoá bài / swing.
43. **Thêm cột `ref_type`** thay cho việc dựa vào tiền tố id.
44. **Push:** cần `device_tokens`, chỉ gửi sau khi người dùng cấp quyền. Tôn trọng `notify` theo loại và giờ yên lặng 22:00–07:00 (cần chốt múi giờ). Gom nhóm / giới hạn tần suất, để 20 lượt thích không thành 20 push (tech review:185-188,218-219).

#### I. Chung

45. **Id dùng UUID;** thời gian lưu UTC.
46. **Đơn vị chuẩn trong DB:** mét / mph / rpm / độ / kg / cm. Đổi đơn vị chỉ ở tầng hiển thị (spec D9; tech review:225-226).
47. **Ghi phải idempotent theo id** do client giữ cố định (gậy, swing), để bấm lại hay "Thử lại" không tạo bản trùng.
48. **Trạng thái tải / lỗi thật:** khung xương lấy từ `isLoading` của truy vấn. Lỗi mạng / timeout dùng chung toast "… thất bại" + "Thử lại", áp cho **mọi** thao tác ghi, kể cả các thao tác mock đang ghi ngay (kết nối, lưu trữ gậy, CSV, ảnh, ghi chú, cộng đồng). Xoá gậy bị từ chối vì vừa có dữ liệu gắn vào thì phải trả lỗi để màn hiển thị.
49. **Công cụ Dev** (đổi tài khoản không mật khẩu, `?as=`, giả lập lỗi, đặt lại dữ liệu) không có mặt trong bản phát hành (spec D13).

---

## 10. Quyết định đã chốt & hạng mục không làm

### 10.1 Quyết định trong spec (D1–D13, spec:15-31)

Spec ghi lý do cho từng quyết định nhưng không ghi cách sửa nếu sai.

| # | Quyết định | Lý do |
|---|---|---|
| D1 | Tên sản phẩm **GramGolf**; app ở `apps/golf`, scheme `gramgolf` | Logo chủ dự án gửi 07/10 |
| D2 | Mobile-first, Expo SDK 57 + Expo Router, chạy Expo Go; web chỉ để chụp / kiểm tra | Chủ dự án yêu cầu mobile-first; DS sẵn có là RN (thay Next.js của tech review) |
| D3 | Brand teal `#14BE96`, navy `#0B2230`, đổi qua token DS | Logo + luật DS cấm literal |
| D4 | Logo vẽ lại bằng `react-native-svg`, thay bằng SVG gốc khi có | Chưa có file vector |
| D5 | Kết nối HLV – học viên **nhiều-nhiều + 1 HLV chính**; HLV tạo mã / link có hạn → học viên nhập → active; huỷ giữ lịch sử, HLV mất quyền xem ngay | Tech review §5.6; bỏ luồng "HLV nhập tên tạo học viên" |
| D6 | Quyền xem theo ma trận RLS, bằng hàm thuần `canViewPrivate()`; follow **không** mở dữ liệu riêng | Ràng buộc quan trọng nhất |
| D7 | Nhập số liệu: Nhập tay (P0) + CSV TrackMan / Foresight (P0) + Ảnh / OCR (P1, có review độ tin cậy) + QR ("Thử nghiệm", chỉ giả lập) | Tech review §5.3 |
| D8 | Phân tích swing là "ước lượng": `queued → processing → succeeded / failed / needs_review`, có confidence, góc quay, FPS, tip theo mốc; HLV ghi chú theo mốc | Tech review §5.5, §8 |
| D9 | Đơn vị lưu chuẩn mph, rpm, độ, **mét**, kg; người dùng chọn hiển thị mét / yard | Tech review §6.1 |
| D10 | State: React context + reducer thuần, logic có test vitest | Ít phụ thuộc, test được |
| D11 | Biểu đồ tự vẽ bằng `react-native-svg` | Recharts không chạy trên RN |
| D12 | UI tiếng Việt; sáng / tối theo hệ thống | Handoff §8 |
| D13 | Công tắc vai trò / đổi tài khoản chỉ ở bản dev | Demo nhanh, không vào luồng thường |

### 10.2 Quyết định của chủ dự án và ruling ảnh hưởng nghiệp vụ (báo cáo:18-24, Phụ lục A:63-99)

| Quyết định | Nếu sai |
|---|---|
| Giữ **HLV chính + HLV phụ**; không làm lỗi "đã có HLV active khác" (thay ruling "MVP thắng D5" trước đó) | Khôi phục mô hình 1 HLV active (code cũ ở commit `46a69da`) |
| Spec + plan 07/10 **thắng mọi mâu thuẫn** với MVP issue #1; Phase 2 chỉ làm hạng mục MVP bổ sung | Chủ dự án chỉ định mục nào cần làm thêm |
| Kết nối **hai chiều** trong app (HLV mời / học viên xin); mã mời = kết nối ngay (HLV đã duyệt trước) | Bỏ một chiều |
| Giữ các tính năng ngoài MVP đã làm (cộng đồng, CSV / OCR / QR) | Ẩn sau cờ |
| Bỏ popup chọn vai HLV chính / phụ (đề xuất trước đó) | Thêm popup 1 màn |
| `validateInvite` có thêm kết quả `already_connected` | Thêm 1 nhánh InlineMessage |
| Ẩn nút Chặn khi người xem là HLV có kết nối active với người chơi đó (`block` không gỡ kết nối) | Gỡ / đổi cục bộ |

### 10.3 Quyết định tự chốt trong lúc build (báo cáo:26-44)

| # | Quyết định | Lý do | Nếu sai |
|---|---|---|---|
| 1 | Chữ "GramGolf" trên nền teal dùng navy; nét logo ≈ size/12 | Tương phản ≥ 4,5:1 | Đổi 1 hằng số |
| 2 | Bottom nav 5 tab: nhãn co giãn (sửa DS, nợ Figma F55) | Nhãn bị cắt ở 390 px | Figma cập nhật variant |
| 3 | Ngày giờ hiển thị theo giờ VN (UTC+7) | Dữ liệu lưu UTC | Lệch 1 ngày ở mốc nửa đêm |
| 4 | Xoá swing / bài, "HLV khác", chặn / báo cáo = nút trên header + Dialog, không dùng menu ⋯ | Mở Dialog khi sheet đang đóng bị kẹt trên iOS | Thêm menu khi DS có callback đóng sheet |
| 5 | Nút "+" theo ngữ cảnh (Thể lực → nhập thể lực, Bộ gậy → thêm gậy) | Đúng "FAB thêm" của spec | Sửa bảng 2 dòng |
| 6 | Chấp nhận mã mời xong → về tab HLV | Luôn có đích rõ ràng | Đổi 1 dòng |
| 7 | HLV đang kèm học viên thì không chặn được học viên đó, và ngược lại | Chặn mà vẫn xem dữ liệu riêng là tự mâu thuẫn | Cho chặn = tự huỷ kết nối |
| 8 | Chặn nhau → mã mời báo "không tồn tại" | Không lộ việc bị chặn | Đổi câu thông báo |
| 9 | Bài cộng đồng chỉ có chữ, không dùng PostCard của DS | PostCard bắt buộc ảnh / video | Thêm media vào bài |
| 10 | Cài đặt thông báo chỉ hiện loại mà vai đó nhận; công tắc công khai chỉ cho người chơi; công tắc theo loại chỉ áp cho push | Tránh công tắc vô nghĩa | Hiện đủ mọi loại (báo cáo ghi "6 loại"; code hiện có 8) |
| 11 | Đơn vị: chỉ khoảng cách đổi m ↔ yd, tốc độ giữ mph | Spec D9, thông lệ golf | Thêm km/h ở cài đặt |
| 12 | Form nhập mở toàn màn hình, không bottom sheet | Plan Task 6/8/9 | Đổi presentation sang formSheet |
| 13 | Nút chính màu đen trong BottomSheet / ShareSheet, để dành đợt đổi style | Restyle làm ở token / DS | Sửa 1 token component |
| 14 | Tìm học viên theo email / SĐT khớp một phần, chỉ trên dữ liệu mẫu | Chưa có backend | Backend thật phải khớp chính xác |
| 15 | "5 buổi gần nhất" = 5 phiên (1 dòng CSV = 1 phiên) | Plan Task 7 | Gom theo ngày |

### 10.4 Hạng mục không làm

Mâu thuẫn plan 07/10, nên không làm (báo cáo:84,93-94; MVP). Nếu sai: chủ dự án chỉ định mục nào cần làm thêm.

| Mã | Không làm | Thay bằng |
|---|---|---|
| (a) | Web / desktop có sidebar, modal giữa màn trên web (MVP M1.2, M6.3) | Mobile-first (D2) |
| (b) | Lỗi xung đột "đã có HLV active khác" (MVP M6.6) | HLV chính + phụ (D5) |
| (c) | Avatar bắt buộc ở onboarding (MVP M2.5) | Avatar tuỳ chọn, có chữ tắt |
| (d) | Thứ tự upload "file → tiến độ → gậy & ngày" (MVP M5.1) | Chọn video, gậy, ngày, góc quay trước khi tải |
| (e) | Recharts (MVP M3.1) | Biểu đồ SVG tự vẽ (D11) |
| (f) | Lỗi mã mời dạng popup (MVP M6.6) | AlertMessage inline |
| (h) | Hệ Imperial đầy đủ (MVP M3.9) | Chỉ m ↔ yd (D9) |
| (i) | Bottom sheet cho form nhập | Màn toàn màn hình |
| — | Trường Direction (MVP M5.2) | Không khớp bộ 6 trường bắt buộc của CSV / OCR / form |

**Chưa làm, nằm ngoài phạm vi bản UI** (spec:13): Supabase, auth thật, upload thật, push thật, thanh toán. Ngoài ra còn: sửa bài, sửa / xoá bình luận, đính kèm ảnh vào bài, sửa swing sau khi đăng, nhắc tên `@` có thông báo, hàng duyệt báo cáo, xem công khai bộ gậy / swing, đổi email, chọn giao diện / ngôn ngữ.

---

## 11. Lệch tài liệu & câu hỏi mở

### 11.1 Lệch tài liệu (code là chuẩn; nên sửa tài liệu cho khớp)

Các mục MVP mâu thuẫn plan 07/10 và đã chủ ý không làm được liệt kê ở §10.4, không nhắc lại ở đây.

**Handoff (`docs/product/handoff-2026-08-15.md`)**

| # | Tài liệu nói | Code đang làm | Luật / nguồn |
|---|---|---|---|
| L1 | §4.1 (:88): "Submit → vào thẳng app với vai trò đã chọn" | Đi qua xác minh OTP rồi onboarding | BR-TAIKHOAN-12, -14 |
| L2 | (:34) Một người chơi chỉ có 1 HLV chính thức. Câu hỏi mở 1 (:174): nhiều HLV cùng lúc? | Nhiều HLV active + tối đa 1 HLV chính. Câu hỏi 1 đã được trả lời là **có** | BR-KETNOI-20; báo cáo:21 |
| L3 | §4.5 (:110-112): HLV nhập mã mời + tên học viên → tạo kết nối, tạo học viên mock | HLV tạo mã, **học viên** nhập mã; không tạo người dùng giả từ tên (spec D5) | BR-KETNOI-01…12 |
| L4 | §6 (:137-139): `User { id, name, email, role, avatarUrl? }`, `Coach { club, rating, students, rate: string }` | Thêm `phone`, `createdAt`, `bio`, `homeClub`; HLV dùng `academy`, `yearsExperience`, `ratePerHourVnd: number`, `verified` | §4.1 |
| L5 | (:54,92-95,158) Hãng Trackman / GC Quad | TrackMan / Foresight (spec D7) | BR-SOLIEU-15 |
| L6 | §4.2 (:92) QR "tự động điền dữ liệu" | QR chỉ liên kết phiên; dữ liệu đi qua CSV, `source='csv'` | BR-SOLIEU-21 |
| L7 | §6 (:140) `source: "manual"\|"qr"\|"photo"` | Có thêm `csv` | §4.5 |
| L8 | §4.4 (:55,106-108,143-145): "modal Thêm gậy"; "đủ 16 loại"; "mỗi gậy có thể xoá"; bounce cho mọi gậy; HLV xem toàn bộ bộ gậy | Màn riêng `/clubs/new` và `/clubs/[id]/edit`; thêm loại "Tuỳ chỉnh"; chỉ xoá gậy chưa gắn dữ liệu, còn lại lưu trữ; ô bounce chỉ hiện với wedge; HLV chỉ thấy gậy đang dùng trong danh sách | BR-BOGAY-01, -08, -15, -20 |
| L9 | (:98-100,146-147) Chọn file video / ảnh; "Chờ phân tích" ngay sau khi đăng; mock ngẫu nhiên; `status: pending\|analyzed` + 1 `coachNote` | Từ chối ảnh; có trạng thái `none` tới khi chủ swing yêu cầu; kết quả cố định theo tên file; 6 trạng thái job tách khỏi trạng thái tải lên; nhiều ghi chú từ nhiều HLV | BR-SWING-03, -13, §4.7 |
| L10 | (:149) `Post { authorName, authorRole, likes, likedByMe }` | Không lưu; tính bằng selector (khớp spec:100) | §4.9 |
| L11 | (:115) Khám phá thấy toàn bộ người chơi + HLV khác | Loại người chặn / bị chặn; có ô tìm theo tên | BR-CONGDONG-24 |

**Tech review (`docs/product/tech-stack-review-2026-08-15.md`)**

| # | Tài liệu nói | Code đang làm | Luật / nguồn |
|---|---|---|---|
| L12 | §5.1 (:123): email + password trước, OTP / social login sau | OTP qua SĐT bắt buộc ngay khi đăng ký (khớp handoff §7 và spec) | BR-TAIKHOAN-12 |
| L13 | §5.1 (:131): onboarding lưu từng bước, cho phép resume | Lưu từng bước nhưng không resume, không có cổng onboarding | BR-TAIKHOAN-19 |
| L14 | §5.3 (:149-151): nhập tay có autosave draft | Không có | BR-SOLIEU-11 |
| L15 | §7.1 (:272): xác nhận club / date / session theo từng import | Một gậy và một ngày cho cả file | BR-SOLIEU-17 |
| L16 | §5.6 (:175): cột `relationship_type`, `invited_by` | Không có `relationship_type`; `requestedBy` chỉ có ở lời mời / yêu cầu trong app | §4.3 |
| L17 | §5.6 (:178): RLS ngừng đọc **dữ liệu mới**; sản phẩm phải chốt về dữ liệu cũ | HLV mất **toàn bộ** quyền xem, kể cả dữ liệu cũ; ghi chú đã viết vẫn còn | BR-KETNOI-26; Q17 |
| L18 | §6.2 (:231-249): Clubs với người khác "Không, trừ khi user công khai" | Công tắc công khai chỉ được lưu, chưa mở quyền | BR-CAIDAT-11 |
| L19 | (:283) Job `uploaded → queued → preprocessing → inference → postprocessing → …` + `attempts`, `error_code`, `idempotency_key` | Gộp thành `processing`, không có các trường đó (khớp spec D8, nhưng có thêm `none`) | §6.5 |
| L20 | (:170,288) Tip gắn bằng chứng, HLV ghi đè tip, overlay trên video | Chưa làm | BR-SWING-17 |
| L21 | (:192,259) Chặn có hiệu lực với thích / bình luận ở tầng quyền | Reducer `toggleLike` / `addComment` không kiểm chặn; chỉ UI chặn (không mở được bài) | BR-CONGDONG-12, -15 |
| L22 | (:183,188) Bài có `visibility` / `moderation_status` / `deleted_at`; gom nhóm và rate limit thông báo | Xoá cứng, không kiểm duyệt; ngoài `like`, thông báo không chống lặp | BR-CONGDONG-11, -35 |
| L23 | (:225) Hiển thị theo múi giờ người dùng | Cố định UTC+7 (báo cáo #3) | §4 |

**Spec (`docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md`)**

| # | Tài liệu nói | Code đang làm | Luật / nguồn |
|---|---|---|---|
| L24 | (:67) Onboarding 3 bước (plan Task 4 cũng vậy) | HLV có 4 bước (thêm Giới thiệu bắt buộc, MVP M2.5) | BR-TAIKHOAN-14 |
| L25 | D5 (:23) chỉ mô tả luồng mã mời | Có thêm lời mời / yêu cầu hai chiều trong app (MVP M3.8, M4.2) | BR-KETNOI-13…18 |
| L26 | D8 (:26) `queued → processing → …` | Có thêm trạng thái đầu `none` ("Chưa phân tích") | §6.5 |
| L27 | (:72) "mock 2 file mẫu" | 3 file; file thứ 3 cho nhánh lỗi | §9.1 |
| L28 | (:75) Chi tiết phiên có "raw vendor" | JSON số đã chuẩn hoá; sửa phiên ghi đè số gốc | BR-SOLIEU-24 |
| L29 | (:76,78) Nhóm gậy Gỗ / Hybrid / Sắt / Wedge / Putter; chi tiết gậy "sửa, lưu trữ" | Thêm nhóm "Khác", mục Đang dùng / Lưu trữ, khôi phục, xoá, phiên gần đây (MVP M3.5, M5.5) | BR-BOGAY-16…20 |
| L30 | (:83) Roster lọc "Tất cả / Cần phản hồi / Chờ chấp nhận" | Mục thứ ba tên "Lời mời" (yêu cầu đến, lời mời đã gửi, mã đang chờ) | BR-KETNOI-16, -35 |
| L31 | (:88,92) PostCard; "menu Chặn / Báo cáo" | PostItem (bài chỉ có chữ); Chặn / Báo cáo / Xoá là nút trên header (báo cáo #4, #9) | BR-CONGDONG-26, -31 |
| L32 | (:89) Đính kèm swing / ảnh (mock) | Chỉ đính kèm swing | BR-CONGDONG-05 |
| L33 | (:91) `people` = tìm kiếm + danh sách người dùng | `/people` là Người theo dõi / Đang theo dõi; tìm ở Cộng đồng › Khám phá | BR-CONGDONG-23, -24 |
| L34 | (:93) Thông báo nhóm "Hôm nay / Trước đó"; loại: ghi chú HLV, follow, like, comment, lời mời, phân tích xong | Nhóm "Mới / Trước đó" theo đã đọc; 8 loại (thêm `connect_request`, `swing_uploaded`) | BR-CONGDONG-36, §7 |
| L35 | (:95) Settings có "giao diện"; Dev "đổi vai trò" | Không có mục giao diện (theme theo hệ thống, khớp D12); Dev đổi tài khoản mẫu | BR-CAIDAT-18, -28 |
| L36 | (:58-59) Mọi tác vụ giả lập có lỗi + thử lại | Chỉ 4 form và 4 nút xoá; các thao tác khác ghi ngay (F13:59 đã ghi nhận) | BR-CAIDAT-25, -26 |

**MVP, báo cáo, flows**

| # | Tài liệu nói | Code đang làm | Luật / nguồn |
|---|---|---|---|
| L37 | MVP M5.3 (:36) "Form thêm / sửa Gậy (Tên, Loại)" | Ô "Tên" chỉ có với loại Tuỳ chỉnh; gậy thường lấy tên theo loại | BR-BOGAY-07 |
| L38 | Báo cáo (:39,102) "hiện đủ 6 loại", "player 5, coach 4" | 8 loại; người chơi 7 công tắc, HLV 6 (khớp F12 bước 06) | BR-CONGDONG-40 |
| L39 | Báo cáo Phụ lục B (:145,147,202,204) ghi là lỗi còn mở: xoá swing để lại thông báo; `jobUpdate` báo lặp; `editNote` không kẹp mốc; sửa không đổi chữ vẫn gắn `editedAt`; "Huỷ sửa" không xoá lỗi; sửa ghi chú làm mất nháp | Đã sửa (`lib/reducer.ts:72-73,77,156-157`; `app/swings/[id].tsx:182,289-294`) | BR-SWING-19, -25, -33 |
| L40 | F08:47 "người chơi phải ở màn swing ~3 giây" để job chạy | Job chạy trên màn của bất kỳ ai có quyền xem, kể cả HLV active | BR-SWING-15 |
| L41 | F11:39 thông báo trỏ tới swing / bài đã xoá → mở "Không tìm thấy" | Code xoá luôn các thông báo đó | BR-CONGDONG-41 |

**Câu chữ UI không khớp hành vi code**

| # | UI nói | Code đang làm | Luật |
|---|---|---|---|
| L42 | Dialog xoá tài khoản: "xoá vĩnh viễn… Không thể hoàn tác" | Bản mock chỉ đăng xuất (F12:53) | BR-TAIKHOAN-31 |
| L43 | Dialog Dev: "Hồ sơ đang đăng nhập được giữ." | Chỉ phiên được giữ; sửa đổi hồ sơ bị mất, tài khoản tạo trong phiên bị mất | BR-CAIDAT-28 |
| L44 | Luật mật khẩu ≥ 8 ký tự + chữ số | Đăng nhập mock nhận mọi mật khẩu ≥ 6 ký tự (chủ ý, plan:965) | BR-TAIKHOAN-20 |
| L45 | Mọi màn con của Cài đặt chặn người chưa đăng nhập | Riêng `/settings` không chặn | BR-CAIDAT-10 |
| L46 | Test `lib/selectors.test.ts:9` tên "5 phiên swing gần nhất" | Code lọc thêm điều kiện gậy Driver | BR-SOLIEU-26 |

### 11.2 Câu hỏi mở (cần chủ dự án quyết)

**Câu hỏi mở của handoff (handoff:172-178): tình trạng**

| # | Câu hỏi | Tình trạng |
|---|---|---|
| H1 | Một học viên có nhiều HLV cùng lúc không? | **Đã trả lời:** có, nhiều HLV + 1 HLV chính (D5; chủ dự án 08/10) |
| H2 | Dữ liệu Trackman / GC Quad qua ảnh (OCR) hay API chính thức? | **Một phần:** CSV-first (P0) + OCR (P1); QR chờ định dạng đối tác (D7). API chính thức chưa bàn |
| H3 | Phân tích swing tự xây hay mua? | **Mở** → Q36 |
| H4 | Mô hình kinh doanh: thu phí HLV / học viên? | **Mở** → Q14 |
| H5 | Học viên có ẩn thông số khỏi HLV được không? | **Mở**; code hiện: không → Q15 |

**Tài khoản và hồ sơ**
- **Q1.** OTP hết hạn sau bao lâu? Tối đa bao nhiêu lần nhập sai hay gửi lại thì khoá? Code chưa có luật (`app/(auth)/verify-otp.tsx:13,39`).
- **Q2.** Đổi email: hiện không đổi được. Đổi SĐT: hiện không xác minh lại OTP. Có cần cả hai không? (F12:52).
- **Q3.** Quên mật khẩu chỉ qua email, trong khi đăng nhập nhận cả SĐT. Có cần đặt lại qua SMS không?
- **Q4.** Có hỗ trợ "plus handicap" (số âm) không? Hiện chỉ nhận 0–54 (`lib/validation.ts:127`).
- **Q5.** Có nhận SĐT quốc tế / `+84` không? Hiện chỉ nhận đúng 10 số bắt đầu bằng 0.
- **Q6.** Độ dài tối đa cho họ tên, học viện, CLB, hãng, model gậy là bao nhiêu? Code chưa giới hạn.
- **Q7.** Ai cấp `verified` và `rating` cho HLV, theo quy trình nào? Tech review gợi ý `coach_verification_status` (tech review:128-129).
- **Q8.** Phạm vi xoá tài khoản: Dialog chưa nhắc tới bình luận, lượt thích, ghi chú HLV đã viết trên swing của học viên, lời mời đang chờ. Có thời gian ân hạn hay khôi phục không?
- **Q9.** Đăng xuất / đổi mật khẩu có huỷ các phiên đăng nhập khác không?
- **Q10.** Có bắt làm lại onboarding không? Hiện HLV bỏ ngang sẽ có hồ sơ thiếu giới thiệu dù luật là bắt buộc (BR-TAIKHOAN-19).
- **Q11.** Đơn giá 0 có nghĩa "miễn phí" không? Hiện nhập được và hiện "0 đ/giờ".

**Kết nối và quyền xem**
- **Q12.** Chặn khi đang có kết nối active: giữ luật hiện tại "không cho chặn, phải huỷ kết nối trước", hay đổi thành "chặn = tự huỷ kết nối"? `canViewPrivate` không xét chặn và reducer `block` không gỡ kết nối, nên hiện chỉ UI giữ nhất quán (báo cáo #7; BR-KETNOI-32).
- **Q13.** Chặn đóng kết nối `pending` mà không ghi `revokedAt`; mã mời thu hồi cũng không có mốc thời gian. Có cần ghi không?
- **Q14.** Có giới hạn số mã đang chờ, số HLV của một người chơi, số học viên của một HLV không? Phụ thuộc mô hình kinh doanh (H4).
- **Q15.** Học viên có được ẩn từng loại dữ liệu khỏi HLV đã kết nối không? Code: không (BR-CAIDAT-12).
- **Q16.** Từ chối, huỷ lời mời / yêu cầu, huỷ kết nối hiện không báo cho bên kia (F04:76). Có cần báo không?
- **Q17.** Sau khi huỷ kết nối, HLV có được xem lại dữ liệu cũ (trước lúc huỷ) không? Code: không (L17).
- **Q18.** Ghi chú của HLV đã bị huỷ kết nối vẫn hiện cho người chơi, nhưng HLV không sửa / xoá được nữa. Giữ hay ẩn?
- **Q19.** Định dạng mã mời hợp lệ: chỉ bảng 32 ký tự, hay mọi A–Z0–9 (mã mẫu `HAEXP1`, `USED01` dùng 0 / 1)?
- **Q20.** Giữ hay bỏ 2 công tắc "Công khai bộ gậy / danh sách swing"? Nếu giữ thì cần RLS và màn xem công khai. Swing có riêng tư hoàn toàn không? (tech review:369; F12:54).
- **Q21.** Route `/clubs?playerId=` (HLV xem bộ gậy học viên) có trong code nhưng không màn nào dẫn tới; HLV xem qua tab Bộ gậy của `students/[id]`. Giữ hay bỏ?

**Số liệu**
- **Q22.** Phiên đi qua QR có ghi `source = 'qr'` không? Hiện ghi `csv`, và giá trị `qr` không bao giờ được dùng.
- **Q23.** Phiên nhập từ ảnh luôn mang ngày `NOW`, không có ô ngày; ảnh chụp hôm trước sẽ sai ngày. Có thêm ô ngày không?
- **Q24.** Làm tròn carry chưa thống nhất: CSV TrackMan đổi yard → mét làm tròn 1 m, nhập tay theo yard làm tròn 0,1 m. Ngoài ra, carry TrackMan ngoài khoảng bị báo bằng mét ("Carry: Trong khoảng 10–350 m"), trong khi file ghi yard.
- **Q25.** Ô "số nguyên" vẫn nhận số lẻ: độ dẻo "6,5" lưu 6,5 nhưng hiện "7/10"; tốc độ "104,8" hiện "105 mph"; Bounce "12,5" lưu 12,5. Có buộc số nguyên không? Cột DB là integer hay numeric?
- **Q26.** "5 buổi" trong xu hướng tốc độ là 5 phiên (có thể cùng một ngày) hay gom theo ngày? (báo cáo #15).
- **Q27.** Xu hướng Driver tính cả Driver đã lưu trữ và trộn nhiều cây Driver, còn Carry theo gậy loại gậy lưu trữ. Có cần thống nhất không?
- **Q28.** Xoá phiên số liệu là xoá cứng hay xoá mềm?
- **Q29.** Trường `note` của phiên có trong kiểu dữ liệu nhưng không màn nào dùng. Làm UI hay bỏ?
- **Q30.** HLV không được báo khi học viên nhập số liệu mới (chỉ có báo swing mới). Đây có phải chủ ý?

**Bộ gậy**
- **Q31.** Flex đang bắt buộc với mọi loại. Putter và gậy tuỳ chỉnh có được để trống không?
- **Q32.** Có giới hạn số gậy không (luật golf cho tối đa 14 gậy trong túi)? Có chặn hai gậy cùng loại hoặc trùng tên tuỳ chỉnh không?
- **Q33.** Lưu trữ / khôi phục gậy có cần pha đang lưu, lỗi và thử lại không? Báo cáo:152 ghi bấm đúp "Lưu trữ" trong hộp thoại gọi quay lại 2 lần; code chưa có chốt chặn (`app/clubs/[id]/index.tsx:178-182`).

**Swing**
- **Q34.** Giới hạn file video: 300 MB là số tạm. Giới hạn thời lượng là bao nhiêu? (F07:51; tech review:381).
- **Q35.** Ngưỡng độ tin cậy nào thì ra `needs_review`? Swing `needs_review` có cho phân tích lại cùng video, hoặc cho HLV xác nhận kết quả không?
- **Q36.** Bộ phân tích swing tự xây hay mua? (H3; tech review khuyên AI không nằm trong đường găng MVP).
- **Q37.** Ghi chú vượt 500 ký tự qua nút "Chèn mốc" (giới hạn chỉ chặn khi gõ). Server có cắt / từ chối không?
- **Q38.** Bài đính kèm swing đã bị xoá giữ `swingId` treo và thẻ swing tự biến mất. Gỡ đính kèm, báo người đọc, hay chặn xoá swing?
- **Q39.** Xoá ghi chú không thu hồi `coach_note`; HLV bị huỷ kết nối vẫn giữ thông báo `swing_uploaded` cũ, chạm vào ra 403. Có cần dọn không?
- **Q40.** Không sửa được gậy, ngày, góc quay sau khi đăng swing. Đây là quyết định sản phẩm hay việc còn thiếu?

**Cộng đồng và thông báo**
- **Q41.** Cộng đồng công khai toàn bộ hay chỉ trong network / CLB? Ai xử lý báo cáo, cần hàng duyệt nào? Hiện báo cáo chỉ được lưu, không ai xem (tech review:372).
- **Q42.** Người bị chặn không thấy nút Chặn trên hồ sơ người đã chặn mình, nên không tạo được chặn hai chiều qua UI (reducer có hỗ trợ). Có cần cho chặn ngược lại không?
- **Q43.** Có cho sửa bài, sửa / xoá bình luận của mình, xoá bình luận trên bài mình không?
- **Q44.** Luật gom nhóm / chống lặp cho `follow` và `comment` khi làm push là gì?
- **Q45.** "Đánh dấu đã đọc tất cả" cũng đánh dấu thông báo đang ẩn vì chặn. Cố ý, hay chỉ áp cho thông báo đang hiện?
- **Q46.** Trả lời bình luận lưu `@tên` dạng chữ, không có liên kết hồ sơ và không báo người được nhắc. Có cần thông báo "nhắc tên" không?
- **Q47.** Phần đầu hồ sơ của người chặn / bị chặn vẫn hiện tên, avatar, handicap, CLB (minor đã hoãn, báo cáo:198). Có cần ẩn thêm, kể cả ở server?
- **Q48.** Giờ yên lặng có cho chỉnh khung giờ không, và theo múi giờ nào (giờ VN hay giờ thiết bị)?
- **Q49.** Có cần cài đặt giao diện (sáng / tối / theo hệ thống) như spec §4, hay giữ theo hệ thống như D12?
- **Q50.** Tìm ở Khám phá có mở rộng sang CLB, tiêu đề bài, tag không?

---

## 12. Đặc tả màn hình (cho thiết kế lại UI)

### 12.0 Cách dùng phần này

- Mỗi màn là một khối tiêu đề cấp 4 "Tên màn — `route`" gồm 8 phần: **1. Mục đích**, ai vào được, vào từ / đi tiếp · **2.** bố cục trên → dưới · **3.** hành động (bảng) · **4.** trường nhập (bảng) · **5.** mọi trạng thái kèm chữ đúng trên màn · **6.** hộp thoại / sheet / toast · **7.** a11y & tương tác cần giữ · **8.** tham chiếu, cuối khối là "Lệch spec" (nếu có). Viết theo code `main` @ `3bc63dc` (28/10/2026).
- **Không ghi màu, cỡ chữ, khoảng cách** — UI đang được thiết kế lại; chỉ nêu kiểu khi nó mang nghĩa (nút chính / nút nguy hiểm, badge cảnh báo, khung báo lỗi). Luật nghiệp vụ đã có ở §5 thì khối màn chỉ ghi phần riêng của màn và trỏ "(xem BR-…)"; quy ước chung trỏ "(12.1)". Phần tử chỉ có ở bản dev đánh dấu **[dev]**.
- **Figma:** <https://www.figma.com/design/LdkxQ8Zm20tyggvGulzFAP> — mỗi nhóm một trang "Thiết kế · …" (node ghi ở đầu mỗi nhóm). Mỗi route thường chỉ có 1 khung mặc định: `L` = Light, `D` = Dark, `ref` = ảnh tham chiếu chụp từ code; trạng thái khác chỉ có ở storyboard. 3 màn pilot: Tổng quan, Chi tiết swing, Học viên.
- **Storyboard / Storybook:** "Story" ghi id story `fxx--<slug>`; ảnh tương ứng là `docs/flows/FXX/fxx--<slug>.light.png` (và `.dark.png`), bảng bước ở `docs/flows/FXX/steps.json`. Xem trực tiếp: `pnpm storybook:app` (cổng 6007). "Nguồn": đường dẫn tính từ `apps/golf/` như phần Cách đọc.
- "Lệch spec" so với `spec` (`docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md`); "spec §4" là mục của tài liệu đó, không phải §4 của đặc tả này. Các chỗ code còn thiếu gom ở 12.8.

### 12.1 Quy ước chung toàn app

**Điều hướng & vai trò**
- `/` chỉ chuyển hướng: chưa đăng nhập → Màn chào; người chơi → Tổng quan; HLV → Học viên (xem BR-TAIKHOAN-02). Mở màn tab của vai kia → `/` → trang chủ đúng vai. Chưa đăng nhập mở màn cần đăng nhập → `/` (→ Màn chào); ngoại lệ `settings/index`, `settings/dev` (12.7). Code **không** chặn người đã đăng nhập mở Màn chào / Đăng nhập / Đăng ký bằng URL. Cổng riêng (vai, chủ dữ liệu) ghi ở từng màn (xem BR-CAIDAT-23).
- **Thanh tab đáy** chỉ ở màn tab, nổi trên nội dung (cuối danh sách có thể nằm dưới thanh, phải cuộn): người chơi **Tổng quan · Thông số · Swing · Cộng đồng · HLV**; HLV **Học viên · Cộng đồng · Thông báo · Hồ sơ**. Mục đang chọn đổi icon sang bản đặc. Không có badge số trên tab (kể cả Thông báo của HLV). Màn stack không có thanh tab.
- **Rời luồng** (đăng ký + OTP xong, đặt lại mật khẩu xong, đổi tài khoản, đăng xuất, xoá tài khoản): `resetTo()` thay cả chồng màn — back / vuốt lui không quay lại form cũ. Đăng nhập xong dùng `router.replace('/')` (thay nhóm auth).
- **Sáng / tối** theo hệ thống; mọi màn có bản dark (Figma + storyboard).

**Header**
- *TabHeader* (màn tab): trái là logo GramGolf hoặc tiêu đề lớn (role header); phải là **chuông** (badge đỏ = số thông báo chưa đọc, ẩn khi 0, badge ẩn với trình đọc; nhãn "Thông báo, 2 chưa đọc" / "Thông báo"; → `notifications`) rồi **avatar của tôi** (nhỏ, nới vùng chạm, nhãn "Hồ sơ của tôi", → `profile`; với HLV khác tab Hồ sơ). Tab Thông báo của HLV không có chuông. (xem BR-CONGDONG-39)
- *StackHeader* (màn con): nút "‹" trái, nhãn "Quay lại" — lùi một màn; mở thẳng bằng URL / deep link (không có lịch sử) → `/`. Tiêu đề căn trái (+ phụ đề tuỳ màn) + 0–n nút icon bên phải. Màn nhiều bước (CSV, Ảnh): quay lại rời hẳn màn, không lùi từng bước. Quay lại khỏi form **không hỏi xác nhận**, bỏ dữ liệu đã nhập.

**Toast** (`SavedToast`, `components/Feedback.tsx`): thanh nổi ở đáy màn, đè nội dung / footer; hiện lên thì cụp bàn phím; role alert, live region polite; không có nút X; toast mới thay toast cũ và đếm giờ lại.
- Thành công: icon tích, tự đóng sau 1,2 s. Luồng "lưu → toast → quay lại" chờ toast đóng rồi mới rời màn.
- Thất bại: kiểu Negative (cảnh báo), nút hành động (thường "Thử lại" = gỡ toast, chạy lại thao tác), tự đóng sau 4 s.
- Chưa có toast toàn cục: toast chỉ sống trên màn vừa thao tác, nên thao tác "ghi rồi quay lại ngay" không để lại toast ở màn trước.

**Hộp thoại xác nhận** (`Dialog`): kiểu Warning; nút chính là **nút nguy hiểm**, nút phụ mức ba ("Huỷ"); chạm nền mờ / phím back → đóng, không làm gì.

**Bottom sheet**: tiêu đề + nút X (nhãn "Đóng"), có vạch kẻ dưới tiêu đề; chạm nền tối / vuốt xuống cũng đóng. Sheet chọn kiểu radio: chọn một mục → sheet đóng ngay.

**Ô chọn gậy** (`ClubPicker`, dùng ở Nhập tay, CSV, Ảnh, Đăng swing — xem BR-BOGAY-22): ô chọn nhãn "Gậy"; giá trị "Gỗ 3 · TaylorMade Qi10" (loại · hãng model); placeholder "Chọn gậy", chưa có gậy nào "Chưa có gậy — thêm gậy mới". Chạm → sheet "Chọn gậy": gậy đang dùng theo nhóm Gỗ / Hybrid / Sắt / Wedge / Putter / Khác (bỏ nhóm trống), mỗi gậy một dòng radio (tên loại hoặc tên tuỳ chỉnh + dòng phụ "TaylorMade Qi10"), cuối luôn có "+ Thêm gậy mới" (chưa có gậy thì chỉ có dòng này). Chọn → đóng sheet. "Thêm gậy mới" → đóng sheet, mở `clubs/new`; lưu gậy xong quay lại thì gậy mới **được chọn sẵn**. Lỗi "Bắt buộc" dưới ô.

**Khung xương tải lần đầu** (`useFirstLoad` + `ListSkeleton`, xem BR-CAIDAT-24): 4 hàng (ô tròn + 2 dòng chữ giả), 0,4 s, chỉ lần đầu mở màn đó trong phiên app; trình đọc đọc "Đang tải" một lần. Header (và điều khiển như segmented) vẫn hiện; khung xương thay vùng danh sách — luôn dạng hàng danh sách, kể cả ở màn lưới / thẻ.

**Lưu / xoá giả lập** (`useSimulatedWrite`, xem BR-CAIDAT-25…27): bận 0,6 s — nút khoá + dòng `SavingRow` (spinner + "Đang lưu…" / "Đang xoá…" / "Đang đăng…", role alert) ở footer hoặc cạnh nút. Chỉ thất bại khi bật Cài đặt › Dev › "Giả lập lỗi khi lưu/xoá": không ghi gì, form giữ nguyên, toast thất bại + "Thử lại". Mọi thao tác ghi khác **ghi ngay**, không có đang xử lý / lỗi / thử lại (BR-CAIDAT-26). Auth là mock, xử lý tức thì.

**Form**
- Lỗi theo ô chỉ hiện **sau lần bấm nút gửi / Lưu đầu tiên**; từ đó cập nhật ngay theo từng phím (gõ đúng → lỗi mất, sai lại → hiện lại). Lỗi nằm dưới ô, **thay chỗ** dòng trợ giúp (icon cảnh báo + chữ), viền ô đổi sang trạng thái lỗi. Không tự cuộn tới ô lỗi đầu tiên.
- Form có footer cố định (bọc `KeyboardAvoid`): vùng cuộn · đường kẻ · footer gồm lỗi tổng (`AlertMessage`, kiểu Negative, role alert, vd "Chưa lưu: N trường cần sửa." — N đếm mọi ô sai, kể cả ô ngoài vùng nhìn) · dòng đang lưu · nút chính rộng hết ngang. Bàn phím mở thì footer nằm ngay trên bàn phím; chạm ra ngoài ô vẫn bấm được nút mà không phải cụp bàn phím. Form nhóm auth không có footer cố định (trừ Onboarding): nút nằm dưới ô cuối, cuộn cùng nội dung.
- Ô số: bàn phím số thập phân; "," hay "." đều là dấu thập phân (xem BR-SOLIEU-07, BR-BOGAY-05); ô số không có placeholder, dòng trợ giúp "Khoảng hợp lệ …".

**403 / không tìm thấy / 404**
- **403** (`components/NoAccess.tsx`, xem BR-CAIDAT-22, BR-KETNOI-27/28): khi không qua `canViewPrivate` — chỉ chủ dữ liệu hoặc HLV có kết nối **active** (chính hay phụ) xem được thông số, swing, bộ gậy, thể lực; theo dõi, kết nối pending / declined / revoked không mở quyền; huỷ kết nối mất quyền ngay (ghi chú HLV đã viết vẫn giữ). Header (quay lại + tiêu đề màn) giữ nguyên, thân thay bằng: icon ổ khoá, "Không có quyền xem", "Chỉ HLV đã kết nối mới xem được dữ liệu này.", nút "Quay lại" (lùi một màn; không có lịch sử → `/`).
- **Không tìm thấy bản ghi**: khối trạng thái rỗng trong màn, chữ riêng từng màn + nút "Quay lại" (xem BR-CAIDAT-21). **Route không tồn tại** → màn 404 (12.2).
- **Trạng thái rỗng** (`EmptyState`): icon minh hoạ trong vòng tròn nền nhạt + tiêu đề + chú thích + 0–2 nút.

**Định dạng**
- Số kiểu VN, dấu phẩy thập phân ("10,5°", "1,46", "72,0 kg", "2,4 MB"); số đo không phân cách nghìn ("2650 rpm", "12000"); tiền có dấu chấm nghìn "450.000 đ". Độ dính liền số ("56°"); đơn vị khác cách một khoảng ("63 g", "104 mph", "229 m", "920 ms").
- Tốc độ luôn mph, làm tròn số nguyên. Carry theo Cài đặt › Đơn vị đo của **người đang xem**: "229 m" / "250 yd", làm tròn số nguyên; lưu chuẩn mét; tốc độ, spin, góc, kg không đổi (xem BR-SOLIEU-05, BR-SOLIEU-30).
- Ngày `dd/mm/yyyy` giờ VN (UTC+7); trục biểu đồ `dd/mm`.
- Thời gian tương đối (`relativeTime`, `lib/format.ts:53-60`): < 60 s "Vừa xong"; < 1 giờ "N phút trước"; < 24 giờ "N giờ trước"; < 7 ngày "N ngày trước" (làm tròn xuống); từ 7 ngày → `dd/mm/yyyy`. Trong caption hàng danh sách viết thường ("vừa xong", "21 giờ trước").
- Hạn mã mời: "Còn N ngày" / "Còn N giờ" / "Còn N phút" (làm tròn xuống) / "Hết hạn".
- Chữ tắt avatar: chữ đầu của 2 từ cuối họ tên, in hoa ("HLV Đỗ Minh Tuấn" → "MT", "Lê Đăng Khoa" → "ĐK"). Dữ liệu mẫu chưa có ảnh nên mọi avatar đang là chữ tắt.
- Caption nối các cụm bằng " · "; trong cụm dùng khoảng trắng không ngắt để chỉ xuống dòng ở " · " (không tách "1 | ngày trước", "HLV | chính").
- Nhãn nguồn phiên: "Nhập tay", "CSV", "Ảnh", "QR"; hãng máy đo "TrackMan", "Foresight".

**Thời gian giả lập** (`DELAYS`, `lib/simulate.ts:134`)

| Việc | Thời lượng |
|---|---|
| Khung xương lần đầu mở màn | 0,4 s |
| Lưu / xoá | 0,6 s |
| Toast thành công / thất bại tự đóng | 1,2 s / 4 s |
| Đọc ảnh (OCR) | 1,5 s |
| Liên kết phiên sau khi quét QR | 1 s |
| Tải video lên | +5 % mỗi 0,15 s (~3 s) |
| Phân tích swing | chờ 0,5 s rồi +10 % mỗi 0,25 s (~3 s) |

**Dữ liệu mẫu & "hôm nay"** — `NOW` = **07/10/2026 15:00 giờ VN** (`2026-10-07T08:00:00Z`, `lib/mock.ts:4`): mọi ngày mặc định, "hôm nay", mốc của bài / bình luận / thông báo mới ("Vừa xong") lấy theo mốc này.

| id | Tên | Vai | Chi tiết dùng làm ví dụ |
|---|---|---|---|
| `p-minh` | Nguyễn Minh Anh | người chơi | `minhanh@gramgolf.vn` · `0912 345 678`; Handicap 14 · Sân tập Mỹ Đình; bio "Tập driver mỗi tuần, mục tiêu xuống handicap 10."; chữ tắt "MA"; HLV chính Tuấn, phụ Hà; theo dõi Tuấn, Hà, Khoa; được Khoa theo dõi; 2 thông báo chưa đọc; 10 phiên swing (6 Driver, 2 Gỗ 3, 2 Sắt 7), 2 phiên thể lực, 8 gậy (chưa gậy nào lưu trữ), 3 swing |
| `p-lan` | Trần Thu Lan | người chơi | Handicap 22 · Sân tập Ciputra; không bio; HLV chính Tuấn, kết nối với Hà đã huỷ; 1 swing đã phân tích, chưa gắn gậy, chưa có ghi chú; không có gậy |
| `p-khoa` | Lê Đăng Khoa | người chơi | Handicap 8 · Sân Long Biên; bio "Thích chơi sân Long Biên cuối tuần."; HLV chính Hà; theo dõi Minh Anh → mẫu 403 (theo dõi không mở dữ liệu riêng); không có dữ liệu |
| `p-huy` | Phạm Quốc Huy | người chơi | Handicap 28 (không CLB); tài khoản trống → mẫu mọi trạng thái rỗng; chưa có HLV, đang chờ HLV Hà duyệt yêu cầu |
| `c-tuan` | HLV Đỗ Minh Tuấn | HLV, đã xác minh | `tuan.coach@gramgolf.vn` · `0904 888 999`; GramGolf Academy Hà Nội, 12 năm, ★ 4,9, 450.000 đ/giờ; giới thiệu "Chuyên swing cơ bản và tempo cho người mới."; HLV chính của Minh Anh và Lan; mã `TUAN24` còn hạn, `USED01` đã dùng; theo dõi HLV Hà; 1 người theo dõi |
| `c-ha` | HLV Vũ Thanh Hà | HLV, đã xác minh | Saigon Golf Lab, 8 năm, ★ 4,7, 400.000 đ/giờ; HLV chính của Khoa, phụ của Minh Anh; kết nối với Lan đã huỷ; yêu cầu chờ từ Huy; mã `HAEXP1` hết hạn |

Tài khoản tạo mới trong storyboard: người chơi `Lê Văn Hải` · `hai.le@vidu.vn` · `0911 222 333` · handicap `24,5` (F01); HLV `Ngô Bảo Châu` · `chau.coach@vidu.vn` · 6 năm (F02).

**Bản dev** (xem BR-CAIDAT-28): `?as=<userId>` ở mọi URL để đăng nhập nhanh (chụp ảnh / kiểm thử); Cài đặt › Dev có Kiểm tra theo luồng F1–F13, đổi tài khoản mẫu, cờ "Giả lập lỗi khi lưu/xoá", đặt lại dữ liệu mẫu (12.7). Phần tử **[dev]** không có ở bản phát hành nhưng nên giữ trong thiết kế (khung riêng) để kiểm thử.

**Thông báo**: chỉ các sự kiện ở §7 sinh thông báo; số liệu và bộ gậy không sinh thông báo (xem BR-SOLIEU-32, BR-BOGAY-26).

### 12.2 Bắt đầu & đăng nhập

Route: `+not-found` · `index` · `(auth)/welcome` · `(auth)/register` · `(auth)/verify-otp` · `(auth)/onboarding` · `(auth)/login` · `(auth)/forgot-password` · `(auth)/reset-password`. Figma: trang "Thiết kế · Bắt đầu & đăng nhập" `48:1023` — mỗi route 1 khung mặc định.

**Riêng nhóm này.** Mọi màn dành cho người **chưa đăng nhập**, trừ Onboarding (bắt buộc đã đăng nhập) và 404 (mọi người). Không màn nào có dữ liệu riêng → không có 403. Header chuẩn (StackHeader, không nút phải) ở mọi màn trừ Màn chào và Onboarding. Không thanh tab; không footer cố định trừ Onboarding. Auth là mock xử lý tức thì: **không** có trạng thái đang xử lý, lỗi mạng + "Thử lại", khung xương; mật khẩu không được lưu; OTP cố định `123456`; đăng nhập nhận email hoặc SĐT của tài khoản có sẵn với **mật khẩu bất kỳ ≥ 6 ký tự**. Backend thật cần thêm đang xử lý / lỗi mạng cho gửi OTP, đăng nhập, gửi link, đặt lại mật khẩu (12.8; không phải lệch spec — spec §4 chỉ bắt lỗi + thử lại cho "tác vụ giả lập"). Validate form theo 12.1 (Đăng ký, Đăng nhập, Quên / Đặt lại mật khẩu, bước Giới thiệu của Onboarding); không có tổng hợp lỗi đầu form.

**Luồng:** `/` → (chưa đăng nhập) Màn chào → "Tạo tài khoản" → Đăng ký B1 (vai trò) → B2 (thông tin) → Xác minh OTP → (đúng mã: tạo tài khoản + đăng nhập) Onboarding (3 bước người chơi / 4 bước HLV; bước cuối Nhập mã / Tạo mã mời) → `/` → Tổng quan | Học viên. Màn chào → "Đăng nhập" → (đúng) `/` → Tổng quan | Học viên. Đăng nhập → "Quên mật khẩu?" → Quên mật khẩu → "Kiểm tra hộp thư" → (link trong email) Đặt lại mật khẩu → (xong) Đăng nhập + "Đã đặt lại…". URL / deep link không có màn → 404 → "Về trang chủ" → `/`.

#### Không tìm thấy (404) — `+not-found`

**1. Mục đích** — Hiện cho mọi URL / deep link không khớp màn nào (thay màn "Unmatched Route" tiếng Anh của Expo Router), đưa về trang chủ (xem BR-CAIDAT-20). Mọi người, đăng nhập hay chưa, mọi vai. Vào từ: link hỏng / đã đổi, deep link cũ, gõ sai URL; Dev › Kiểm tra theo luồng › F13 (`/trang-khong-co`). Đi tiếp: `/` (Màn chào / Tổng quan / Học viên) hoặc màn trước.

**2. Bố cục** — Header chuẩn "Không tìm thấy". Thân: khối trạng thái rỗng **căn giữa dọc**: icon "tìm tài liệu" (kính lúp trên trang giấy) trong vòng tròn nền nhạt; tiêu đề "Không tìm thấy trang"; chú thích "Đường dẫn này không tồn tại hoặc đã bị đổi. Về trang chủ để tiếp tục."; nút chính "Về trang chủ".

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Quay lại (header) | luôn | màn trước; không lịch sử → `/` | (icon, "Quay lại") |
| Nút chính | luôn | thay màn bằng `/` → chia theo vai | "Về trang chủ" |

**4. Trường nhập:** không. **5. Trạng thái:** một trạng thái; chỉ đích của "Về trang chủ" khác theo vai. **6.** Không có.

**7. A11y** — Thứ tự đọc: quay lại → tiêu đề trang → tiêu đề khối → chú thích → nút. Tiêu đề khối chưa là heading (nên đánh dấu). Đây là đích chung cho mọi link lạ nên câu chữ không được giả định đã đăng nhập.

**8. Tham chiếu** Story `f13--b-01-404`. Figma L `48:1132` · D `48:2734` · ref `48:1025`. Nguồn `app/+not-found.tsx`, `components/StackHeader.tsx`, `packages/ds/src/ui/DockIcon/DockIcon.tsx`.

#### Điểm vào app — `index`

**Chỉ chuyển hướng, không có giao diện** (xem BR-TAIKHOAN-02): chưa đăng nhập → `(auth)/welcome`; người chơi → `(player)/home`; HLV → `(coach)/roster`. Trước đó layout gốc **giữ màn splash** tới khi tải xong font (không có màn "đang tải" riêng). Là đích của: "Về trang chủ" (404), đăng nhập xong, Onboarding "Để sau", Đăng xuất, Xoá tài khoản, đổi tài khoản ở Dev. Story `f03--vao-app-nguoi-choi`, `f03--vao-app-hlv`, `f03--da-dang-xuat` (vẽ "↪ Chuyển hướng tới …"). Không có Figma. Nguồn `app/index.tsx`, `app/_layout.tsx`.

#### Màn chào — `(auth)/welcome`

**1. Mục đích** — Màn đầu của người chưa đăng nhập: giới thiệu thương hiệu, chọn Tạo tài khoản hoặc Đăng nhập (xem BR-TAIKHOAN-03). Không kiểm tra — người đã đăng nhập mở URL vẫn thấy. Vào từ: `/` khi chưa đăng nhập; Đăng xuất (Hồ sơ › Đăng xuất › xác nhận); Xoá tài khoản; "Về trang chủ" ở 404; quay lại từ Đăng ký B1 / Đăng nhập; Dev › F1/F2/F3. Đi tiếp: Đăng ký, Đăng nhập; **[dev]** Cài đặt › Dev.

**2. Bố cục** — **Không header**, không nút quay lại.
- Khối thương hiệu chiếm phần lớn màn, căn giữa ngang + dọc: logo GramGolf đầy đủ (biểu tượng 3 chevron hướng lên, chevron dưới uốn thành chữ G + chữ "GramGolf" bên phải; hiện là bản vẽ lại từ ảnh — nợ brand, thay SVG gốc khi có); tagline căn giữa "Theo dõi phong độ. Kết nối HLV. Cùng tiến bộ."
- Cụm nút dính đáy, xếp dọc, rộng hết lề: nút chính "Tạo tài khoản" · nút phụ "Đăng nhập" · **[dev]** nút chữ nhỏ "Dùng tài khoản mẫu".

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Nút chính | luôn | Đăng ký (B1); quay lại được | "Tạo tài khoản" |
| Nút phụ | luôn | Đăng nhập; quay lại được | "Đăng nhập" |
| Nút chữ nhỏ | bản dev | Cài đặt › Dev (đổi tài khoản mẫu, chạy luồng kiểm tra) | "Dùng tài khoản mẫu" |

**4.** Không. **5. Trạng thái:** một trạng thái; bản phát hành không có "Dùng tài khoản mẫu". Cùng màn sau đăng xuất / xoá tài khoản (không có thông báo "đã đăng xuất"). **6.** Không có.

**7. A11y** — Logo là một ảnh, nhãn "GramGolf" (không đọc tách biểu tượng / chữ). Tagline là chữ thường (không heading). Vùng chạm ≥ 44 pt, kể cả nút dev cỡ nhỏ.

**8. Tham chiếu** Story `f01--b-01-chao` (cũng `f02--man-chao`, `f03--b-10-ve-chao`, `f12--b-14-sau-xoa` = sau xoá tài khoản). Figma L `48:1169` · D `48:2738` (component `Logo · Full · 64` `48:1517`). Nguồn `app/(auth)/welcome.tsx`, `components/Logo.tsx`.

#### Đăng ký — `(auth)/register`

**1. Mục đích** — Tạo tài khoản trong 2 bước trên cùng màn: **B1 chọn vai trò**, **B2 điền thông tin**, rồi sang Xác minh OTP (xem BR-TAIKHOAN-01, BR-TAIKHOAN-04). Người chưa đăng nhập (không kiểm tra). Vào từ: Màn chào › "Tạo tài khoản"; Đăng nhập › "Chưa có tài khoản? Tạo tài khoản" (thay màn Đăng nhập); OTP thiếu thông tin › "Đăng ký lại"; quay lại từ OTP (giữ B2 và dữ liệu). Đi tiếp: OTP (B2 hợp lệ); Màn chào (quay lại ở B1).

**2. Bố cục**
- Header chuẩn "Tạo tài khoản". Nút quay lại: ở **B1** rời màn; ở **B2** chỉ **lùi về B1**.
- Thanh tiến trình 2 bước ngang: "Vai trò" – phụ đề "Bạn là ai"; "Thông tin" – "Hồ sơ cơ bản". Bước hiện tại: chấm đậm có số; đã qua: chấm có tick; chưa tới: chấm nhạt có số; đường nối giữa hai chấm.
- **B1:** 2 thẻ xếp dọc, chọn 1 (nhóm radio "Vai trò"); mỗi thẻ: radio + tên vai + mô tả 1–2 dòng. "Người chơi" — "Lưu thông số, bộ gậy, video swing và nhận góp ý từ HLV." · "Huấn luyện viên" — "Mời học viên, theo dõi tiến bộ và ghi chú trên từng cú swing." Thẻ chọn: nền nhấn nhạt + viền nhấn (nghĩa "đã chọn"); chưa chọn: viền mảnh. **Mặc định chưa chọn thẻ nào.**
- **B2** (thứ tự cố định): Họ tên → Email → Số điện thoại → Mật khẩu → người chơi: **Handicap**; HLV: **Học viện / CLB**, **Số năm kinh nghiệm**.
- Hàng nút cuối nội dung (cuộn cùng form): B1 một nút chính rộng "Tiếp" + icon mũi tên phải; B2 hai nút chia đôi: trái "Quay lại" (tertiary), phải "Tiếp" + mũi tên.

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Chạm thẻ vai (cả thẻ) | B1 | chọn vai; xoá trạng thái "đã bấm gửi" (lỗi B2 ẩn tới lần bấm Tiếp kế) | "Người chơi" / "Huấn luyện viên" |
| Tiếp (B1) | **tắt** khi chưa chọn vai | sang B2 (giữ dữ liệu đã nhập trước đó) | "Tiếp →" |
| Tiếp (B2) | luôn bật | bật validate; lỗi → ở lại B2; hợp lệ → OTP mang bản nháp (vai, họ tên, email, SĐT, handicap / học viện + số năm; xem BR-TAIKHOAN-11). **Mật khẩu không được chuyển sang bước sau**; chưa tạo tài khoản | "Tiếp →" |
| Quay lại (B2, nút hoặc header) | B2 | về B1, giữ dữ liệu | "Quay lại" |
| Nút mắt ô Mật khẩu | B2 | hiện / ẩn mật khẩu | "Hiện mật khẩu" / "Ẩn mật khẩu" |

"Tiếp" ở B2 thực chất là "gửi mã OTP" — review cũ quyết giữ "Tiếp". Chưa có lối "Đã có tài khoản? Đăng nhập".

**4. Trường nhập (B2)** — xem BR-TAIKHOAN-05…10. Lỗi kể cả kiểm trùng email / SĐT cập nhật khi gõ; lỗi thay dòng trợ giúp (Handicap, Số năm).

| Nhãn | Placeholder | Bàn phím / tự điền | Quy tắc (đều bắt buộc) | Chữ lỗi (ưu tiên) |
|---|---|---|---|---|
| Họ tên | "Nguyễn Văn A" | thường · tên | bỏ khoảng trắng 2 đầu, gộp khoảng trắng thừa; không giới hạn độ dài | "Bắt buộc" |
| Email | "ban@email.com" | email, không tự viết hoa · email | dạng `x@y.z`; không trùng (không phân biệt hoa thường) | "Bắt buộc" → "Email không hợp lệ" → "Email đã có tài khoản" |
| Số điện thoại | "0912345678" | số ĐT · tel | bỏ mọi khoảng trắng; đúng 10 số, bắt đầu 0; không trùng | "Bắt buộc" → "Gồm 10 số, bắt đầu bằng 0" → "Số điện thoại đã có tài khoản" |
| Mật khẩu | "Tối thiểu 8 ký tự, có chữ số" | ẩn + nút mắt · mật khẩu mới | ≥ 8 ký tự, ≥ 1 chữ số | "Bắt buộc" → "Tối thiểu 8 ký tự, có ít nhất 1 chữ số" |
| Handicap *(người chơi)* | "VD: 18,5" | số thập phân | 0–54, cho số lẻ, phẩy hoặc chấm; trợ giúp "Từ 0 đến 54 — mới chơi, chưa có handicap thì nhập 54" | "Bắt buộc" → "Không phải số" → "Trong khoảng 0–54" |
| Học viện / CLB *(HLV)* | "VD: Học viện Golf Sông Bé" | thường | không trống sau trim | "Bắt buộc" |
| Số năm kinh nghiệm *(HLV)* | "VD: 8" | số | số nguyên 0–60; trợ giúp "Từ 0 đến 60" | "Bắt buộc" → "Không phải số" → "Số nguyên 0–60" (cả khi lẻ "8,5" hay ngoài khoảng) |

**5. Trạng thái**

| Trạng thái | Mô tả |
|---|---|
| B1 mặc định / đã chọn | chưa chọn, "Tiếp" tắt / thẻ nổi bật, "Tiếp" bật |
| B2 trống | 5 ô (người chơi) / 6 ô (HLV), không lỗi; Handicap / Số năm hiện trợ giúp |
| B2 bỏ trống | bấm Tiếp → mọi ô "Bắt buộc" |
| B2 sai định dạng / khoảng | vd Handicap "60" → "Trong khoảng 0–54"; mật khẩu 7 ký tự → luật mật khẩu |
| B2 trùng tài khoản | email `MinhAnh@gramgolf.vn` → "Email đã có tài khoản"; SĐT `0912345678` → "Số điện thoại đã có tài khoản" |
| B2 hợp lệ | bấm Tiếp → OTP |

**6.** Không có.

**7. A11y** — Thanh tiến trình đọc "Bước 1 / 2" / "Bước 2 / 2" (progressbar). B1 là radiogroup "Vai trò", radio đọc tên vai + trạng thái chọn; mô tả là chữ riêng; chạm đâu trên thẻ cũng chọn. Nhãn đọc ô = nhãn hiển thị. Lỗi dưới ô **chưa được đọc to** (nên bổ sung). Form bọc `KeyboardAvoid`; chạm nút khi bàn phím mở ăn ngay. Tự điền: tên, email, tel, mật khẩu mới.

**8. Tham chiếu** Story `f01--b-02-chon-vai-tro`, `f01--b-03-loi-form`, `f01--dang-ky-thong-tin`, `f01--dang-ky-trung-tai-khoan`, `f02--b-01-dang-ky-hlv`, `f02--dang-ky-chon-vai`, `f02--dang-ky-loi`. Figma L `48:1521` · D `48:2747` (khung = B2; B1 chỉ có ở storyboard). Nguồn `app/(auth)/register.tsx`, `lib/validation.ts`, `packages/ds/src/ui/Navigation/Pagination.tsx`, `packages/ds/src/ui/Radio/Radio.tsx`, `packages/ds/src/ui/TextField/TextField.tsx`, `components/KeyboardAvoid.tsx`.

#### Xác minh số điện thoại (OTP) — `(auth)/verify-otp`

**1. Mục đích** — Nhập mã 6 số gửi tới SĐT vừa khai; đúng mã → **tạo tài khoản + đăng nhập** → Onboarding (xem BR-TAIKHOAN-12, BR-TAIKHOAN-13). Người đang đăng ký (mang bản nháp từ B2); thiếu / hỏng bản nháp → "Thiếu thông tin đăng ký". Vào từ: Đăng ký B2 › "Tiếp". Đi tiếp: Onboarding (thay cả chồng màn); Đăng ký (quay lại, giữ B2); Đăng ký mới ("Đăng ký lại").

**2. Bố cục** — Header "Xác minh số điện thoại". Dòng "Nhập mã 6 số đã gửi tới {SĐT}." (SĐT đã bỏ khoảng trắng, không định dạng lại: "…tới 0911222333."). Ô OTP **6 ô vuông** một hàng, mỗi ô 1 số, ô trống hiện "•", ô đang nhập có focus, chạm hàng ô mở bàn phím số; dòng lỗi ngay dưới. **[dev]** chú thích nhỏ "Mã thử: 123456". Nút chính rộng "Xác nhận". Nút tertiary rộng đếm ngược "Gửi lại mã sau {n} s" (60 → 0) → "Gửi lại mã".

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Gõ / dán mã | luôn | chỉ nhận chữ số, tối đa 6; gõ lại xoá lỗi. **Đủ 6 số → tự xác nhận** | — |
| Xác nhận | **tắt** khi chưa đủ 6 số | đúng `123456` → tạo hồ sơ (tuỳ chọn mặc định: **mét**, mọi thông báo **bật**, công khai bộ gậy / swing **tắt**), đăng nhập, sang Onboarding. Sai → lỗi, giữ mã đã gõ | "Xác nhận" |
| Gửi lại | **tắt** 60 s đầu | đếm lại từ 60, xoá mã và lỗi; không có toast "đã gửi lại" | "Gửi lại mã sau {n} s" / "Gửi lại mã" |
| Quay lại (header) | luôn | về Đăng ký B2, dữ liệu còn; vào lại OTP → đếm lại từ 60 | — |
| Đăng ký lại | chỉ khi thiếu thông tin | thay màn bằng Đăng ký (B1, form trống) | "Đăng ký lại" |

**4. Trường nhập** — Một ô ẩn, không nhãn hiển thị (nhãn đọc "OTP"); "•" mỗi ô; bàn phím số, tự điền mã từ SMS (`one-time-code`); bắt buộc đúng 6 số, ký tự khác bị bỏ. Lỗi "Mã không đúng, vui lòng thử lại" khi đủ 6 số (tự động) hoặc bấm Xác nhận với mã sai; mất khi gõ tiếp hoặc gửi lại.

**5. Trạng thái**

| Trạng thái | Mô tả |
|---|---|
| Mặc định | 6 ô trống, Xác nhận tắt, "Gửi lại mã sau 60 s" tắt + đếm |
| Đang nhập | 1–5 số, Xác nhận tắt |
| Sai mã | 6 ô trạng thái lỗi + "Mã không đúng, vui lòng thử lại"; mã vẫn hiện |
| Hết giờ đếm | nút "Gửi lại mã", bật |
| Thiếu thông tin đăng ký | header "Xác minh"; khối căn giữa: icon tam giác cảnh báo, "Thiếu thông tin đăng ký", "Vui lòng điền lại biểu mẫu đăng ký.", nút chính "Đăng ký lại" |
| Thành công | không màn / toast riêng — sang thẳng Onboarding |
| Bản phát hành | không có "Mã thử: 123456" |

**6.** Không có.

**7. A11y** — 6 ô chỉ để hiển thị. Nhãn đọc "OTP" tiếng Anh — nên đổi "Mã xác minh 6 số". Lỗi sai mã chưa được đọc to. Nhãn nút gửi lại đổi mỗi giây — tránh để trình đọc đọc lặp. Chạm nút khi bàn phím mở ăn ngay. Không bọc vùng tránh bàn phím (nội dung ngắn).

**8. Tham chiếu** Story `f01--b-04-otp`, `f01--xac-minh-otp-sai`, `f01--xac-minh-otp-thieu-thong-tin`, `f02--xac-minh-otp`. Figma L `48:1636` · D `48:2760` (giữ dòng dev). Nguồn `app/(auth)/verify-otp.tsx`, `packages/ds/src/ui/OtpField/OtpField.tsx`, `lib/validation.ts`, `lib/reducer.ts`.

#### Onboarding — `(auth)/onboarding`

**1. Mục đích** — Thiết lập ngay sau khi tạo tài khoản, dạng trang lật từng bước: ảnh đại diện, đơn vị đo, (HLV) giới thiệu nghề nghiệp, gợi ý kết nối (xem BR-TAIKHOAN-14…19). **Đã đăng nhập** (cả hai vai); chưa đăng nhập → `/`. **Người chơi 3 bước, HLV 4.** Lối vào duy nhất: OTP đúng mã; không mở lại từ Cài đặt; thoát giữa chừng → lần sau vào thẳng Tổng quan / Học viên (không có cổng onboarding). Đi tiếp (không quay lại được): "Để sau" → `/`; **Nhập mã mời** (`connect/accept`, người chơi) / **Mời học viên** (`connect/invite`, HLV) — từ hai màn đó quay lại → `/`.

**2. Bố cục** — **Không header.** Trên cùng giữa: chỉ báo trang dạng chấm (3 / 4 chấm, chấm hiện tại màu nhấn). Giữa (cuộn, căn giữa dọc): tiêu đề bước (lớn, căn giữa) → chú thích → nội dung. **Hàng nút cố định đáy** chia đôi: trái "Quay lại" (tertiary, từ bước 2; bước 1 để trống chỗ); phải "Tiếp" (chính) — bước cuối thành "Để sau" (tertiary).

| # | Người chơi | HLV |
|---|---|---|
| 1 | Ảnh đại diện | Ảnh đại diện |
| 2 | Đơn vị đo | Đơn vị đo |
| 3 | Bạn có mã mời từ HLV? | Giới thiệu nghề nghiệp (bắt buộc) |
| 4 | — | Mời học viên đầu tiên |

- **Ảnh đại diện** (tuỳ chọn): "Ảnh đại diện"; chú thích người chơi "Giúp HLV và bạn bè nhận ra bạn.", HLV "Giúp học viên và bạn bè nhận ra bạn." Avatar tròn rất lớn: chưa có ảnh → chữ tắt trên nền nhấn ("Lê Văn Hải" → "VH"); có ảnh → ảnh. Dưới: nút phụ icon thêm ảnh "Chọn ảnh" / "Đổi ảnh"; nút tertiary "Dùng chữ tắt" khi đã có ảnh. Mock: lấy lần lượt 1 trong 4 ảnh mẫu (xoay vòng), không mở thư viện / camera, không trạng thái tải lên.
- **Đơn vị đo:** "Đơn vị đo"; "Đổi lại bất cứ lúc nào trong Cài đặt." 2 dòng radio: "Mét" — "Khoảng cách theo mét (m)"; "Yard" — "Khoảng cách theo yard (yd)". Mặc định Mét.
- **Giới thiệu nghề nghiệp** (HLV, bắt buộc): "Giới thiệu nghề nghiệp"; "Học viên đọc phần này ở hồ sơ HLV của bạn trước khi kết nối." Ô nhiều dòng nhãn "Giới thiệu", placeholder "VD: 8 năm dạy swing cơ bản và tempo cho người mới, chuyên short game." Bộ đếm "{n}/300 ký tự · tối thiểu 20" (n sau trim); có lỗi thì chữ lỗi thay bộ đếm.
- **Bước cuối người chơi "Bạn có mã mời từ HLV?"**: "Nhập mã để kết nối — HLV sẽ xem được thông số, swing và bộ gậy của bạn." + nút phụ rộng icon chìa khoá "Nhập mã".
- **Bước cuối HLV "Mời học viên đầu tiên"**: "Tạo mã mời có hạn 7 ngày và gửi cho học viên." + nút phụ rộng icon thêm người "Tạo mã mời".

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Chọn / Đổi ảnh | bước Ảnh | **lưu ngay** ảnh mẫu kế tiếp vào hồ sơ | "Chọn ảnh" / "Đổi ảnh" |
| Dùng chữ tắt | đã có ảnh | **lưu ngay**: bỏ ảnh | "Dùng chữ tắt" |
| Chạm dòng đơn vị | bước Đơn vị | **lưu ngay** vào tuỳ chọn | "Mét" / "Yard" |
| Ô Giới thiệu | HLV | tối đa 300 ký tự (chặn khi đủ) | — |
| Tiếp | trừ bước cuối; luôn bật | sang bước kế; ở bước Giới thiệu kiểm trước — lỗi thì ở lại, hợp lệ thì lưu (đã trim) rồi sang | "Tiếp" |
| Quay lại (đáy) | từ bước 2 | lùi một bước, giữ nội dung | "Quay lại" |
| Nhập mã / Tạo mã mời | bước cuối | rời onboarding → `connect/accept` / `connect/invite` | "Nhập mã" / "Tạo mã mời" |
| Để sau | bước cuối | → `/` | "Để sau" |

Không có "Bỏ qua tất cả"; không lùi về OTP / Đăng ký.

**4. Trường nhập** — Giới thiệu *(HLV)*: thường, nhiều dòng; 20–300 ký tự sau trim, ô chặn ở 300 (xem BR-TAIKHOAN-17). Lỗi "Bắt buộc" (trống) · "Tối thiểu 20 ký tự" · ("Tối đa 300 ký tự" — thực tế không xảy ra). Hiện sau lần bấm "Tiếp" đầu ở bước này.

**5. Trạng thái**

| Trạng thái | Mô tả |
|---|---|
| Ảnh — chưa có / đã có | chữ tắt + "Chọn ảnh" / ảnh + "Đổi ảnh" + "Dùng chữ tắt" |
| Đơn vị | Mét (mặc định) / Yard được chọn |
| Giới thiệu — trống / hợp lệ | "0/300 ký tự · tối thiểu 20" / vd "79/300 ký tự · tối thiểu 20" |
| Giới thiệu — lỗi | trống → "Bắt buộc"; "Dạy swing" → "Tối thiểu 20 ký tự" (thay bộ đếm); ở lại bước 3/4 |
| Bước cuối | nút phải "Để sau" |
| Chưa đăng nhập | không vẽ màn, → `/` |
| Biến thể vai | 3 / 4 chấm; chú thích bước Ảnh; bước 3–4 khác |

**6.** Không có (lưu ảnh / đơn vị / giới thiệu không có toast).

**7. A11y** — Chỉ báo chấm đọc "Trang {n} / {N}" (progressbar). Tiêu đề bước là heading. Avatar nhãn "Ảnh đại diện {Họ tên}". Đơn vị là radiogroup "Đơn vị đo" (chú thích ngoài nhãn). Toàn màn bọc `KeyboardAvoid`. Lỗi Giới thiệu chưa được đọc to.

**8. Tham chiếu** Story `f01--b-05-anh-dai-dien`, `f01--onboarding-don-vi`, `f01--b-06-ma-moi`, `f02--onboarding-anh`, `f02--b-02-bio-bat-buoc`, `f02--b-03-bio-ngan`, `f02--b-04-bio-hop-le`, `f02--onboarding-moi-hoc-vien`. Figma L `48:2543` · D `48:2768` (chỉ bước Ảnh, có ảnh). Nguồn `app/(auth)/onboarding.tsx`, `lib/validation.ts`, `lib/simulate.ts`, `packages/ds/src/ui/PageIndicator/PageIndicator.tsx`, `packages/ds/src/ui/TextField/TextArea.tsx`.

**Lệch spec §4:** spec ghi "3 bước: ảnh đại diện, đơn vị đo, (player) có mã mời HLV không". Code: HLV **4 bước** — thêm "Giới thiệu nghề nghiệp" bắt buộc (MVP §2 "với HLV cần thêm Bio nghề nghiệp") và "Mời học viên đầu tiên". Ảnh **tuỳ chọn** (MVP gốc "bắt buộc Avatar" — đã chọn không làm, F01 "Đã biết").

#### Đăng nhập — `(auth)/login`

**1. Mục đích** — Đăng nhập bằng email **hoặc** SĐT + mật khẩu; lối sang Quên mật khẩu, Tạo tài khoản (xem BR-TAIKHOAN-20). Không kiểm tra — người đã đăng nhập vẫn mở và đăng nhập sang tài khoản khác được. Vào từ: Màn chào; Quên mật khẩu › "Về đăng nhập"; Đặt lại mật khẩu xong (`?reset=1`). Đi tiếp: `/` (thay cả nhóm auth); Quên mật khẩu; Đăng ký (thay màn).

**2. Bố cục** — Header "Đăng nhập". (Tuỳ trạng thái) khung thông báo đầu form — thành công hoặc lỗi. Ô "Email hoặc số điện thoại" (icon người đầu ô). Ô "Mật khẩu" (icon ổ khoá, nút mắt cuối). Liên kết chữ căn phải "Quên mật khẩu?" (màu nhấn). Nút chính rộng "Đăng nhập". Nút phụ rộng "Chưa có tài khoản? Tạo tài khoản".

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Đăng nhập / Enter ở ô Mật khẩu | luôn bật | validate; ô trống → "Bắt buộc"; đủ 2 ô: tìm email trùng (không phân biệt hoa thường) **hoặc** SĐT trùng (bỏ khoảng trắng); không thấy **hoặc mật khẩu < 6** → khung lỗi; thấy → đăng nhập, `/`. Không có toast chào | "Đăng nhập" |
| Gõ vào một ô | — | ẩn khung lỗi | — |
| Nút mắt | luôn | hiện / ẩn | "Hiện mật khẩu" / "Ẩn mật khẩu" |
| Quên mật khẩu? | luôn | mở Quên mật khẩu | "Quên mật khẩu?" |
| Tạo tài khoản | luôn | **thay** màn bằng Đăng ký (quay lại → Màn chào) | "Chưa có tài khoản? Tạo tài khoản" |

**4. Trường nhập**

| Nhãn | Placeholder | Bàn phím / tự điền | Quy tắc (bắt buộc) | Chữ lỗi |
|---|---|---|---|---|
| Email hoặc số điện thoại | "ban@email.com" | email, không tự viết hoa · username | trim; không kiểm định dạng riêng | "Bắt buộc" |
| Mật khẩu | "Nhập mật khẩu" | ẩn + mắt · mật khẩu hiện tại | (mock) ≥ 6 ký tự mới qua | "Bắt buộc" |

Sai tài khoản / mật khẩu ngắn **không** báo dưới ô — chỉ khung lỗi chung (không lộ ô nào sai).

**5. Trạng thái**

| Trạng thái | Mô tả |
|---|---|
| Mặc định | 2 ô trống, không khung |
| Bỏ trống | "Bắt buộc" dưới ô trống |
| Sai thông tin | khung lỗi (icon ×) đầu form "Email/SĐT hoặc mật khẩu không đúng"; dữ liệu giữ |
| Vừa đặt lại (`?reset=1`) | khung thành công "Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới." — bị khung lỗi thay nếu đăng nhập sai, hiện lại khi gõ tiếp |
| Điền đúng | vd `minhanh@gramgolf.vn` + "golf2026" |
| Đăng nhập xong | không màn / toast — sang thẳng Tổng quan / Học viên |

**6.** Không có (khung thông báo nằm trong trang, không tự tắt, không nút đóng).

**7. A11y** — Enter ở ô Mật khẩu gửi form; ô Email/SĐT **chưa** chuyển con trỏ khi Enter. Ô dùng bàn phím email cả khi nhập SĐT — cân nhắc. Khung lỗi / thành công chưa được đọc to (nên là live region). Không bọc vùng tránh bàn phím; chạm nút khi bàn phím mở ăn ngay.

**8. Tham chiếu** Story `f03--dang-nhap`, `f03--dang-nhap-bo-trong`, `f03--b-01-dang-nhap-sai`, `f03--b-05-ve-dang-nhap`. Figma L `48:2582` · D `48:2784`. Nguồn `app/(auth)/login.tsx`, `packages/ds/src/ui/Feedback/InlineMessage.tsx`, `packages/ds/src/ui/TextField/TextField.tsx`.

#### Quên mật khẩu — `(auth)/forgot-password`

**1. Mục đích** — Nhập email để nhận link đặt lại. **Luôn báo đã gửi** dù email có tài khoản hay không (xem BR-TAIKHOAN-21). Người chưa đăng nhập. Vào từ: Đăng nhập › "Quên mật khẩu?"; Đặt lại mật khẩu (link lỗi) › "Gửi lại link" (thay màn). Đi tiếp: Đăng nhập; **[dev]** Đặt lại mật khẩu ("Mở link (thử)" — mô phỏng bấm link trong email).

**2. Bố cục** — Header "Quên mật khẩu" (cả hai trạng thái).
- **Form:** đoạn "Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu."; ô "Email" (icon phong bì); nút chính rộng "Gửi link".
- **Đã gửi** (thay toàn thân màn, căn giữa dọc): icon phong bì trong vòng tròn nền nhạt; "Kiểm tra hộp thư"; "Đã gửi link đặt lại mật khẩu tới {email}. Link có hiệu lực 30 phút."; hàng nút: **[dev]** tertiary "Mở link (thử)" trái, nút chính "Về đăng nhập" phải.

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Gửi link | form; luôn bật | validate; hợp lệ → trạng thái đã gửi (không gọi mạng, không toast) | "Gửi link" |
| Về đăng nhập | đã gửi | màn trước (thường Đăng nhập); không lịch sử → mở Đăng nhập | "Về đăng nhập" |
| Mở link (thử) | đã gửi, bản dev | Đặt lại mật khẩu với link hợp lệ; quay lại → "Kiểm tra hộp thư" | "Mở link (thử)" |
| Quay lại (header) | luôn | màn trước (ở trạng thái đã gửi cũng rời màn) | — |

Đã gửi **không có** "Gửi lại" / "Đổi email", không đếm ngược.

**4. Trường nhập** — Email: "ban@email.com"; email, không tự viết hoa · email; bắt buộc, trim, dạng `x@y.z`; "Bắt buộc" → "Email không hợp lệ".

**5. Trạng thái** — Form mặc định · "Bắt buộc" · sai định dạng ("minhanh@" → "Email không hợp lệ") · Đã gửi (bản phát hành chỉ có "Về đăng nhập").

**6.** Không có.

**7. A11y** — Ô nhãn "Email"; Enter **chưa** gửi form. Chuyển sang "Kiểm tra hộp thư" chưa được đọc to — nên chuyển tiêu điểm / thông báo. Không bọc vùng tránh bàn phím.

**8. Tham chiếu** Story `f03--quen-mat-khau`, `f03--b-02-quen-mk-loi`, `f03--b-03-da-gui-link`. Figma L `48:2647` · D `48:2793`. Nguồn `app/(auth)/forgot-password.tsx`, `lib/validation.ts`, `lib/simulate.ts`.

**Lệch spec:** spec §3/§4 chỉ liệt "quên mật khẩu" ở màn login, không có màn "đã gửi" — code dựng thêm (không mâu thuẫn).

#### Đặt lại mật khẩu — `(auth)/reset-password`

**1. Mục đích** — Mở từ link trong email (`gramgolf://reset-password?token=…`), đặt mật khẩu mới 2 lần rồi về Đăng nhập (xem BR-TAIKHOAN-22, BR-TAIKHOAN-23). Không cần đăng nhập; hiệu lực link quyết định trạng thái (mock: `GG-RESET-OK` hợp lệ, `GG-RESET-EXPIRED` hết hạn, còn lại không hợp lệ; link không bị vô hiệu sau khi dùng). Vào từ: deep link; **[dev]** "Mở link (thử)". Đi tiếp: Đăng nhập kèm "Đã đặt lại mật khẩu…" (thay cả chồng màn); Quên mật khẩu ("Gửi lại link", thay màn).

**2. Bố cục** — Header "Đặt lại mật khẩu" (mọi trạng thái).
- **Link hợp lệ:** "Đặt mật khẩu mới cho tài khoản của bạn."; ô "Mật khẩu mới" (icon ổ khoá, nút mắt), trợ giúp "Tối thiểu 8 ký tự, có ít nhất 1 chữ số"; ô "Nhập lại mật khẩu mới" (icon ổ khoá, **không** có nút mắt riêng); nút chính rộng "Đặt lại mật khẩu".
- **Link hết hạn / không hợp lệ:** khối căn giữa dọc: icon "link gãy" trong vòng tròn, tiêu đề, chú thích, nút chính "Gửi lại link" (mục 5).

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ |
|---|---|---|---|
| Đặt lại / Enter ở ô Nhập lại | link hợp lệ | validate; hợp lệ → Đăng nhập với khung "Đã đặt lại mật khẩu. Đăng nhập bằng mật khẩu mới." (mock: không lưu mật khẩu) | "Đặt lại mật khẩu" |
| Nút mắt (ô 1) | link hợp lệ | hiện / ẩn **cả hai ô** | "Hiện mật khẩu" / "Ẩn mật khẩu" |
| Gửi lại link | link lỗi | thay màn bằng Quên mật khẩu (form trống) | "Gửi lại link" |
| Quay lại (header) | luôn | màn trước; từ deep link → `/` | — |

**4. Trường nhập** (bắt buộc; ẩn ký tự, không tự viết hoa · mật khẩu mới)

| Nhãn | Placeholder | Quy tắc | Chữ lỗi |
|---|---|---|---|
| Mật khẩu mới | "Tối thiểu 8 ký tự, có chữ số" | ≥ 8 ký tự, ≥ 1 chữ số (xem BR-TAIKHOAN-09) | "Bắt buộc" → "Tối thiểu 8 ký tự, có ít nhất 1 chữ số" (thay trợ giúp cùng chữ) |
| Nhập lại mật khẩu mới | "Nhập lại mật khẩu mới" | trùng ô trên | "Bắt buộc" → "Mật khẩu nhập lại không khớp" |

**5. Trạng thái**

| Trạng thái | Mô tả |
|---|---|
| Form trống | trợ giúp dưới ô 1 |
| Bỏ trống | cả hai "Bắt buộc" |
| Sai luật / không khớp | "golfmoi" → ô 1 lỗi luật; ô 2 khác → "Mật khẩu nhập lại không khớp" |
| Thành công | không toast ở đây — khung thành công ở Đăng nhập |
| Link hết hạn | "Link đã hết hạn" · "Link đặt lại mật khẩu chỉ dùng được trong 30 phút. Gửi lại link mới để tiếp tục." · "Gửi lại link" |
| Link không hợp lệ | "Link không hợp lệ" · "Link bị thiếu hoặc sai. Mở link mới nhất trong email, hoặc gửi lại link." · "Gửi lại link" |

**6.** Không có.

**7. A11y** — Nút mắt điều khiển cả 2 ô (nên thể hiện rõ hoặc tách nút). Enter ở ô Nhập lại gửi form; Enter ở ô 1 chưa chuyển sang ô 2. Lỗi chưa được đọc to. Không bọc vùng tránh bàn phím. Tự điền "mật khẩu mới".

**8. Tham chiếu** Story `f03--dat-lai-mat-khau`, `f03--dat-lai-mat-khau-bo-trong`, `f03--b-04-dat-lai-loi`, `f03--b-11-link-het-han`, `f03--b-12-link-sai`. Figma L `48:2684` · D `48:2799` (chỉ form). Nguồn `app/(auth)/reset-password.tsx`, `lib/validation.ts`, `lib/simulate.ts`.

**Lệch spec:** route không có trong cây điều hướng spec §3 / danh mục §4 — màn bổ sung cho F03.

### 12.3 Tổng quan & thông số

Route: `(player)/home`, `(player)/metrics`, `metrics/add`, `metrics/manual`, `metrics/import-csv`, `metrics/import-photo`, `metrics/scan-qr`, `metrics/[id]`. Màn gậy (`clubs/*`) ở 12.4. Figma: Tổng quan là pilot (L `24:2` / D `26:373`); còn lại ở trang "Thiết kế · Thông số" `48:1040`.

**Riêng nhóm này.** Chỉ **người chơi** đã đăng nhập (chưa đăng nhập → Màn chào, HLV → Học viên), trừ Chi tiết phiên (HLV active xem được, xem BR-SOLIEU-01…03). Header: TabHeader ở Tổng quan / Thông số; StackHeader ở mọi `metrics/*` (không nút phải; không thanh tab). Cờ "Giả lập lỗi" chỉ tác động **Lưu ở Nhập tay / Sửa phiên** và **Xoá phiên**; lưu CSV và Ảnh ghi ngay (Lệch spec). Không thao tác nào sinh thông báo (BR-SOLIEU-32). Khối dùng chung riêng nhóm:
- **Ô "Ngày"** (`SessionDateField`, Nhập tay / Sửa phiên, bước Xác nhận CSV): ô chọn nhãn "Ngày", giá trị `dd/mm/yyyy`, mặc định "07/10/2026" (xem BR-SOLIEU-10). Chạm → sheet "Chọn ngày": lịch tháng "Tháng 10, 2026", nút "Tháng trước" / "Tháng sau", hàng thứ T2 … CN (tuần bắt đầu thứ Hai); **ngày sau hôm nay bị khoá**; chạm ngày → đóng sheet; giờ của phiên giữ nguyên (không có chọn giờ).
- **Bộ ô số** (`MetricFields`, Nhập tay và bước Kiểm tra của Ảnh): nhãn kèm đơn vị trong ngoặc (ô không đơn vị thì không ngoặc); dòng gợi ý "Khoảng hợp lệ …", lỗi thay chỗ; không placeholder. Bảng trường ở Nhập tay mục 4.
- **Dòng đang xử lý / lỗi tổng / toast / ô Gậy**: 12.1.

#### Tổng quan — `(player)/home`

**1. Mục đích** — Màn đầu của người chơi: thẻ hồ sơ + HLV chính, chỉ số swing mới nhất so với lần trước, xu hướng tốc độ Driver, carry theo gậy, ghi chú HLV mới nhất, lối tắt "Nhập số liệu" (xem BR-SOLIEU-25…28). Chỉ dữ liệu của mình → không 403/404. Vào từ: `/` khi đã đăng nhập; đăng nhập / onboarding xong; tab "Tổng quan"; "Quay lại" ở 403/404 khi không có lịch sử; Dev › F5, F11, F12. Đi tiếp: `notifications`, `profile`, `people` (2 số theo dõi), `coaches/[id]` (HLV chính), tab HLV hoặc `connect/accept` (chưa có HLV chính), `metrics/add`, `swings/[id]` (thẻ ghi chú), các tab.

**2. Bố cục** (dưới header cuộn được) — TabHeader có logo (không tiêu đề); mẫu chuông badge "2", avatar "MA".
- **A. Thẻ hồ sơ** (nền nhấn nhạt, luôn hiện): avatar lớn nhất (ảnh hoặc "MA"); tên tối đa 2 dòng; "Handicap 14" (kiểu VN "Handicap 12,5"; ẩn nếu chưa có handicap). Hàng số theo dõi: số to + nhãn nhỏ **"1" Người theo dõi · "3" Đang theo dõi** (đã bỏ người chặn nhau). Khối HLV (nền bề mặt, bo góc, một dòng có mũi tên phải), 3 biến thể: có HLV chính → avatar, "HLV Đỗ Minh Tuấn", phụ "HLV chính"; không có chính nhưng còn HLV khác → "Chưa có HLV chính" / "Chọn HLV chính ở tab HLV"; không có HLV nào → "Chưa có HLV chính" / "Nhập mã mời từ HLV để kết nối".
- **B. Có ≥ 1 phiên swing** (phiên thể lực không tính):
  - **B1 "Chỉ số swing gần nhất"** — phiên swing mới nhất mọi gậy theo ngày phiên. Dòng phụ "Gỗ 3 · 05/10/2026" + tag nguồn "Nhập tay" (không gắn gậy → chỉ ngày). Lưới **2×2**: nhãn nhỏ, giá trị to + đơn vị nhỏ, badge chênh lệch: Tốc độ đầu gậy **97** mph "+1 mph" · Tốc độ bóng **140** mph "+1 mph" · Smash **1,44** (2 số lẻ, không đơn vị) "-0,01" **đỏ** · Carry **198** m (hoặc yd) "+5 m". Chênh lệch so với **phiên swing liền trước cùng gậy**, làm tròn theo số chữ số của ô rồi mới xét dấu; ≥ 0 → xanh (0 hiện "0"), âm → đỏ (cả 4 "càng cao càng tốt"); không có phiên để so → không badge. Chú thích: "So với phiên Gỗ 3 ngày 19/09/2026" / "Chưa có phiên trước cùng gậy để so sánh" (kể cả phiên không gắn gậy).
  - **B2 "Xu hướng tốc độ đầu gậy (Driver, 5 buổi)"** (số buổi = số điểm thực có), trong thẻ có viền: đường tốc độ đầu gậy của **tối đa 5 phiên Driver gần nhất**, cũ → mới; trục x `dd/mm` ("02/09 · 09/09 · 16/09 · 23/09 · 30/09"); 3 đường lưới ngang, không số trục y; điểm chấm rỗng, điểm cuối chấm đặc lớn hơn + nhãn đậm "104 mph" (trên điểm, hoặc dưới nếu đoạn cuối đi xuống). 0 phiên Driver: tiêu đề "Xu hướng tốc độ đầu gậy (Driver)" + "Chưa có buổi Driver nào."; 1 phiên: "…(Driver, 1 buổi)" + "Cần ít nhất 2 buổi để thấy xu hướng." (không vẽ).
  - **B3 "Carry theo gậy"**, chú thích "Carry trung bình của 3 gậy xa nhất" (số = số gậy thực có), trong thẻ có viền: trái tối đa 3 vòng tròn đồng tâm (bán kính tỉ lệ carry, vòng ngoài xa nhất nhạt nhất); phải chú giải chấm màu + tên gậy + giá trị đậm: Driver **222 m** · Gỗ 3 **196 m** · Sắt 7 **143 m**. Trung bình mọi phiên gắn gậy đó, bỏ phiên không gắn gậy và gậy lưu trữ, giảm dần, tối đa 3. 1 gậy: chú thích "Carry trung bình", chỉ chú giải, **không vẽ vòng**; 0 gậy: **ẩn cả mục**.
- **C. Chưa có phiên swing**: B1–B3 thay bằng trạng thái rỗng: icon biểu đồ, "Chưa có số liệu", "Nhập buổi tập đầu tiên để xem chỉ số swing, xu hướng tốc độ và carry theo gậy.", nút chính "Nhập số liệu đầu tiên"; không có nút nổi.
- **D. "Ghi chú mới từ HLV"** (chỉ khi có ghi chú HLV trên swing của mình, hiện cả ở trạng thái C; xem BR-SWING-28): **1 ghi chú mới nhất**, kể cả của HLV đã huỷ kết nối. Thẻ có viền, chạm được: avatar nhỏ HLV; tên 1 dòng "HLV Đỗ Minh Tuấn" (thiếu hồ sơ → "HLV"); phụ "1 ngày trước · Driver · mốc 1,3 s" (thiếu gậy / mốc thì bỏ); nội dung tối đa 3 dòng ("Đỉnh backswing đẹp, nhưng đầu downswing vai mở sớm — giữ lưng quay về mục tiêu thêm một nhịp."); liên kết "Xem swing ›".
- **Nút nổi "+ Nhập số liệu"** (nút chính cỡ vừa, icon +): góc phải dưới, ngay trên thanh tab, đè nội dung; chỉ khi đã có phiên swing; vùng cuộn chừa đệm đáy.

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| "N Người theo dõi" / "N Đang theo dõi" | luôn | `people`, tab tương ứng của mình |
| Dòng HLV chính | có HLV chính | `coaches/[id]` |
| Dòng "Chưa có HLV chính" | còn HLV khác / không có HLV | tab HLV / `connect/accept` |
| "Nhập số liệu đầu tiên" / nút nổi "Nhập số liệu" | chưa có / đã có phiên swing | `metrics/add` |
| Thẻ ghi chú HLV | có ghi chú | `swings/[id]` của swing đó ("Xem swing") |

Ô chỉ số, biểu đồ, vòng carry không chạm được. Không có kéo để làm mới.

**4.** Không có trường nhập.

**5. Trạng thái**
- **Tải lần đầu**: header thật + khung xương riêng: thẻ hồ sơ (tròn + 2 dòng + một khối), tiêu đề + 2×2 ô, tiêu đề + 5 dòng; đọc "Đang tải tổng quan".
- **Có dữ liệu** (Minh Anh, `f05--b-01-tong-quan-truoc`). **Trống số liệu** (người mới): "Chưa có HLV chính / Nhập mã mời từ HLV để kết nối" + khối C (`f01--b-07-tong-quan-trong`).
- **Mới có 1 phiên Driver**: 4 ô không badge, "Chưa có phiên trước cùng gậy để so sánh"; xu hướng "Cần ít nhất 2 buổi để thấy xu hướng."; carry chỉ chú giải "Driver 195 m" (`f01--b-10-tong-quan-co-du-lieu`).
- **Biến thể HLV**: có chính / huỷ chính còn phụ → "Chọn HLV chính ở tab HLV" (`f04--tong-quan-con-hlv-phu`) / không có HLV.
- **Biến thể dữ liệu**: không handicap → ẩn dòng; có ảnh → avatar ảnh; chưa có ghi chú → ẩn D; phiên mới nhất không gắn gậy → chỉ ngày, không so sánh. **Yard**: ô Carry, chênh lệch và chú giải theo yd (`f12--b-08-tong-quan-yard`).
- **Sau khi nhập phiên mới**: tính lại ngay, vd phiên Driver hôm nay từ ảnh có tag "Ảnh", so với 30/09 (`f05--b-20-tong-quan-sau`). Chưa đăng nhập / HLV: chuyển hướng (`f13--chua-dang-nhap`). Không có lỗi tải / thử lại.

**6.** Không có.

**7. A11y** — Mỗi ô chỉ số đọc gộp một câu ("Tốc độ đầu gậy, 97 mph, chênh lệch +1 mph so với phiên trước") → màu badge không là tín hiệu duy nhất. Biểu đồ là ảnh có nhãn đọc toàn bộ dữ liệu ("Tốc độ đầu gậy Driver, 5 buổi gần nhất: 02/09 99 mph, 09/09 101 mph, 16/09 102 mph, 23/09 103 mph, 30/09 104 mph"). Vòng carry đọc "Carry trung bình theo gậy: Driver 222 m, Gỗ 3 196 m, Sắt 7 143 m". Avatar hồ sơ "Ảnh đại diện Nguyễn Minh Anh"; avatar HLV (khối HLV, thẻ ghi chú) là trang trí, ẩn. Avatar header < 44 px → giữ vùng chạm ≥ 44 px. Hai số theo dõi là nút "Người theo dõi: 1" / "Đang theo dõi: 3", nới vùng chạm. Tiêu đề mục role header. Nút nổi không che nội dung cuối.

**8. Tham chiếu** Story `f05--b-01-tong-quan-truoc`, `f01--b-07-tong-quan-trong`, `f13--dang-tai-tong-quan`, `f01--b-10-tong-quan-co-du-lieu`, `f04--tong-quan-con-hlv-phu`, `f03--b-06-vao-app`, `f05--b-20-tong-quan-sau`, `f11--b-06-chuong-het-so`, `f12--b-08-tong-quan-yard`, `f13--chua-dang-nhap`, `f13--b-14-quay-lai-tu-403`. Figma pilot L `24:2` · D `26:373`. Nguồn `app/(player)/home.tsx`; `components/TabHeader.tsx`, `StatTile.tsx`, `charts/TrendChart.tsx`, `charts/ConcentricRings.tsx`, `People.tsx`, `ListSkeleton.tsx`; `lib/selectors.ts`, `lib/format.ts`.

**Lệch spec:** spec §4 "mọi tác vụ giả lập có lỗi + thử lại" — tải lần đầu chỉ có nhánh thành công.

#### Thông số — `(player)/metrics`

**1. Mục đích** — Lịch sử số liệu của mình, 3 segment: phiên swing, phiên thể lực, bộ gậy; mở chi tiết, thêm mới đúng loại đang xem (xem BR-SOLIEU-23). Chỉ dữ liệu của mình, không 403. Vào từ: tab "Thông số"; quay lại sau lưu ở màn nhập (mở thẳng bằng URL thì lưu xong về đây); Dev › F6. Đi tiếp: `metrics/[id]`; `metrics/add` / `metrics/manual?kind=fitness` / `clubs/new` (theo segment); `clubs/[id]`, `clubs?view=archived`.

**2. Bố cục** — TabHeader tiêu đề "Thông số" (không logo). **Segmented Swing | Thể lực | Bộ gậy** (mặc định Swing), cố định dưới header. Danh sách cuộn theo segment:
- **Swing**: mọi phiên swing **mới → cũ**, không giới hạn / phân trang / nhóm tháng. Dòng chính "05/10/2026 · Gỗ 3" (không gắn gậy: "… · Chưa gắn gậy"); phụ "97 mph · 198 m" (tốc độ đầu gậy · carry theo đơn vị); phải: tag nguồn + mũi tên. Mẫu 10 dòng: "05/10/2026 · Gỗ 3" 97 mph · 198 m Nhập tay; "03/10/2026 · Sắt 7" 85 mph · 145 m Ảnh; "30/09/2026 · Driver" 104 mph · 229 m CSV; … "26/08/2026 · Driver" 98 mph · 214 m Nhập tay.
- **Thể lực**: mới → cũ; dòng chính ngày "04/10/2026"; phụ "Cân nặng 72,0 kg · Độ dẻo 7/10 · Lực nắm 45 kg · Bật cao 48 cm" (chỉ ngắt ở " · "); tag nguồn + mũi tên. Mẫu 2 dòng (04/10, 05/09/2026).
- **Bộ gậy**: (1) dòng "Gậy đã lưu trữ" khi có gậy lưu trữ: icon hộp lưu trữ, phụ "2 gậy — khôi phục hoặc xoá", mũi tên (xem BR-BOGAY-18); (2) lưới gậy đang dùng `ClubGrid` — như Bộ gậy 12.4 (nhóm, 2 cột, thẻ 3 dòng). Mẫu: Gỗ (Driver, Gỗ 3) · Hybrid (Hybrid 4) · Sắt (Sắt 5, Sắt 7) · Wedge (PW, SW) · Putter.
- **Nút nổi "+"** (chỉ icon) góc phải dưới trên thanh tab, chỉ khi segment đang xem **có dữ liệu**; danh sách chừa đệm đáy.

**3. Hành động**

| Phần tử | Điều kiện | Kết quả | Chữ / nhãn đọc |
|---|---|---|---|
| Segmented | luôn | đổi danh sách, nút +, trạng thái rỗng | Swing / Thể lực / Bộ gậy |
| Dòng phiên | có phiên | `metrics/[id]` | — |
| Thẻ gậy | Bộ gậy | `clubs/[id]` | — |
| Dòng "Gậy đã lưu trữ" | có gậy lưu trữ | `clubs?view=archived` | "Gậy đã lưu trữ" |
| Nút + | Swing / Thể lực / Bộ gậy có dữ liệu | `metrics/add` / `metrics/manual` (Thể lực chọn sẵn) / `clubs/new` | "Nhập số liệu" / "Nhập thể lực" / "Thêm gậy" |
| Nút trạng thái rỗng | segment rỗng | như nút + | cùng chữ |
| Nút phụ rỗng Bộ gậy | chưa có gậy, có gậy lưu trữ | `clubs?view=archived` | "Gậy đã lưu trữ" |

**4.** Không có.

**5. Trạng thái**
- **Tải lần đầu**: header + segmented thật, khung xương thay danh sách (segment đang chọn).
- **Rỗng Swing**: icon biểu đồ, "Chưa có phiên swing", "Nhập số liệu từ máy đo (file CSV, ảnh chụp màn hình) hoặc nhập tay để theo dõi tiến bộ.", nút "Nhập số liệu"; không nút +.
- **Rỗng Thể lực**: icon nhịp tim, "Chưa có phiên thể lực", "Ghi cân nặng, độ dẻo, lực nắm và bật cao để theo dõi thể lực.", nút "Nhập thể lực".
- **Rỗng Bộ gậy**: icon cờ, "Chưa có gậy nào", "Thêm gậy để gắn với từng phiên số liệu và video swing.", nút chính "Thêm gậy" (+ nút phụ "Gậy đã lưu trữ" nếu có gậy lưu trữ).
- **Có gậy lưu trữ**: thêm dòng "Gậy đã lưu trữ" (`f06--b-09-sau-luu-tru`). **Yard**: carry theo yd, vd "07/10 Sắt 7: 166 yd" (`f05--b-18-yard-lich-su`).
- **Sau lưu / xoá**: phiên mới ở đầu / phiên đã biến mất; **màn này không có toast** (toast ở màn nhập). Không có lỗi tải.

**6.** Không có.

**7. A11y** — Nút + chỉ icon → **nhãn đọc đổi theo segment**. Segmented là tab, đọc trạng thái chọn. Tiêu đề nhóm gậy role header. Khung xương ẩn hình khối.

**8. Tham chiếu** Story `f05--b-02-lich-su`, `f05--b-10-the-luc`, `f06--b-01-bo-gay`, `f05--danh-sach-rong`, `f13--b-03-skeleton-thong-so`, `f05--b-06-da-luu`, `f05--b-18-yard-lich-su`, `f05--b-19-sau-xoa`, `f06--b-04-them-xong`, `f06--b-09-sau-luu-tru`, `f13--b-05-trong-thong-so`, `f13--b-06-trong-bo-gay`, `f13--b-12-xoa-thanh-cong`. Figma L `48:3035` · D `48:8300` · ref `48:1042`. Nguồn `app/(player)/metrics.tsx`; `components/SessionRow.tsx`, `ListSkeleton.tsx`, `ClubGrid`; `lib/selectors.ts`.

**Lệch spec:** như Tổng quan — tải lần đầu không có lỗi + thử lại.

#### Nhập số liệu — chọn nguồn — `metrics/add`

**1. Mục đích** — Chọn cách đưa số liệu một buổi tập vào app (xem BR-SOLIEU-22). Chỉ người chơi. Vào từ: Tổng quan (nút nổi, "Nhập số liệu đầu tiên"); Thông số (nút + / nút rỗng segment Swing). Đi tiếp: 1 trong 4 màn nguồn, **thay chỗ** màn này trong lịch sử → lưu xong / quay lại ở màn nguồn về đúng màn đã mở (Tổng quan / Thông số).

**2. Bố cục** — Mở kiểu **modal** (iOS trượt lên, vuốt xuống để đóng; web là trang thường). Header "Nhập số liệu", phụ đề "Chọn nguồn dữ liệu", nút trái "Quay lại", không có ✕. **4 nguồn** thứ tự cố định, mỗi dòng: ô icon nền nhấn, tiêu đề, mô tả, mũi tên:
- **Nhập tay** — "Gõ chỉ số swing hoặc thể lực của một buổi tập" (bàn phím số) → `metrics/manual` (Swing)
- **Nhập file CSV** — "File xuất từ máy đo TrackMan hoặc Foresight" (file biểu đồ) → `metrics/import-csv`
- **Ảnh chụp màn hình** — "Đọc số từ ảnh màn hình máy đo, bạn kiểm tra lại trước khi lưu" (ảnh) → `metrics/import-photo`
- **Quét QR** — "Liên kết phiên ở sân tập có máy đo" (quét) + tag "Thử nghiệm" cạnh mũi tên → `metrics/scan-qr`

**3.** Chạm dòng = thay bằng màn nguồn; quay lại / vuốt xuống = đóng. **4.** Không. **5.** Một trạng thái (không tải, rỗng, lỗi). **6.** Không.

**7. A11y** — Mỗi dòng là nút đọc tiêu đề + mô tả; tag "Thử nghiệm" đọc kèm.

**8. Tham chiếu** Story `f05--b-03-chon-nguon`, `f01--chon-nguon-so-lieu` (story không thể hiện kiểu modal). Figma L `48:3356` · D `48:8318` · ref `48:1044`. Nguồn `app/metrics/add.tsx`, `app/_layout.tsx`.

**Lệch spec:** spec §4 "Bottom sheet chọn nguồn" — code là màn riêng mở kiểu modal, có header + quay lại; trên web là trang đầy đủ.

#### Nhập tay / Sửa phiên — `metrics/manual`

**1. Mục đích** — Gõ tay một phiên swing (gậy + 6 chỉ số) hoặc thể lực (4 chỉ số); `?id=` = **sửa** phiên đã lưu từ mọi nguồn (xem BR-SOLIEU-06, 09…13). Chỉ người chơi; sửa phiên không tồn tại / của người khác → chuyển `metrics/[id]` (hiện "Không tìm thấy phiên" / 403 ở đó). Vào từ: Chọn nguồn › Nhập tay (Swing); Thông số segment Thể lực (+ / "Nhập thể lực") → `?kind=fitness`; Chi tiết phiên › "Sửa phiên" → `?id=`. Đi tiếp: lưu xong → toast → **quay lại màn trước** (Tổng quan / Thông số / Chi tiết phiên; mở thẳng URL → tab Thông số); ô Gậy › "Thêm gậy mới" → `clubs/new`.

**2. Bố cục** — Header "Nhập tay" / "Sửa phiên" (không phụ đề). Vùng cuộn: (1) **Segmented "Swing | Thể lực"** — chỉ khi thêm mới (ẩn khi sửa: loại đã khoá); (2) **Ngày** (mặc định "07/10/2026"; khi sửa là ngày phiên); (3) Swing: **Gậy** (mặc định trống; sửa: gậy của phiên) + **6 ô**: Tốc độ đầu gậy, Tốc độ bóng, Smash factor, Spin, Góc bắn, Carry; Thể lực: **4 ô** Cân nặng, Độ dẻo, Lực nắm, Bật cao (không ô Gậy). Footer cố định: lỗi tổng · "Đang lưu…" · nút chính "Lưu". Khi sửa: ô điền sẵn theo đơn vị hiển thị (smash "1,36", carry "216,5" khi yard); lưu giữ nguồn + hãng gốc và gắn mốc "Đã sửa".

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| Quay lại (header) | luôn | rời màn, không hỏi, bỏ dữ liệu đang gõ |
| Segmented | thêm mới | đổi bộ ô; giá trị từng loại được giữ; lỗi ẩn tới lần bấm Lưu kế |
| Ô Ngày / Ô Gậy | luôn / Swing | sheet "Chọn ngày" / "Chọn gậy" (12.1) |
| **Lưu** | bật, trừ khi đang lưu / đã lưu xong (không khoá khi form sai) | (1) lỗi → hiện lỗi ô + lỗi tổng, không lưu; (2) sửa mà form **y như lúc mở** → toast thành công ngay, không ghi, không gắn "Đã sửa"; (3) còn lại: "Đang lưu…" 0,6 s → thành công: ghi, toast, 1,2 s sau quay lại; thất bại: toast lỗi, form giữ nguyên |
| "Thử lại" (toast lỗi) | toast lỗi | chạy lại Lưu |

**4. Trường nhập** (đều bắt buộc; xem BR-SOLIEU-06…08)

| Ô | Bàn phím | Dòng gợi ý |
|---|---|---|
| Ngày | sheet lịch | luôn có giá trị; không chọn ngày sau hôm nay |
| Gậy *(Swing)* | sheet | ngoại lệ: **sửa phiên vốn chưa gắn gậy** (vd CSV không khớp) được để trống |
| Tốc độ đầu gậy (mph) | số thập phân | "Khoảng hợp lệ 40–150 mph" |
| Tốc độ bóng (mph) | số thập phân | "Khoảng hợp lệ 50–220 mph" |
| Smash factor | số thập phân | "Khoảng hợp lệ 1–1,56" |
| Spin (rpm) | số thập phân | "Khoảng hợp lệ 500–12000 rpm" |
| Góc bắn (°) | **số + dấu trừ** | "Khoảng hợp lệ -10–45°" |
| Carry (m) / **Carry (yd)** | số thập phân | "Khoảng hợp lệ 10–350 m" / "Khoảng hợp lệ 10,9–382,8 yd" |
| Cân nặng (kg) *(Thể lực)* | số thập phân | "Khoảng hợp lệ 30–200 kg" |
| Độ dẻo (/10) | số thập phân | "Khoảng hợp lệ 0–10/10" |
| Lực nắm (kg) | số thập phân | "Khoảng hợp lệ 5–100 kg" |
| Bật cao (cm) | số thập phân | "Khoảng hợp lệ 5–120 cm" |

Số: "," hay "." thập phân, trim; cho "-" đầu, không nhận "+", khoảng trắng giữa, chữ; không bắt buộc nguyên ("2650,5" hợp lệ); carry yard đổi ra mét khi lưu (làm tròn 0,1 m, kẹp 10–350 m). Chữ lỗi (thay gợi ý): "Bắt buộc" (trống / chưa chọn gậy) · "Không phải số" ("abc", "2B10") · "Trong khoảng 40–150 mph" (phần sau là khoảng của ô, vd "Trong khoảng 10–350 m") · "Không dùng dấu chấm ngăn nghìn (vd 2650)" (chỉ ô số nguyên: tốc độ, spin, carry, độ dẻo, lực nắm, bật cao — gõ "2.650" / "2,650"; "vd" là chính số đó bỏ dấu). Lỗi tổng "Chưa lưu: N trường cần sửa." (N = ô số lỗi + 1 nếu thiếu gậy; form Swing trống → "Chưa lưu: 7 trường cần sửa."). Thời điểm hiện lỗi: 12.1; đổi segment ẩn lỗi lại.

**5. Trạng thái**
- **Mới — Swing** (mặc định): "07/10/2026", "Chọn gậy", 6 ô trống + gợi ý (`f05--nhap-tay`). **Mới — Thể lực** (`f05--nhap-tay-the-luc`). **Yard**: "Carry (yd)" 10,9–382,8 yd (`f05--nhap-tay-yard`).
- **Chưa có gậy**: "Chưa có gậy — thêm gậy mới", sheet chỉ có "Thêm gậy mới" (`f01--b-08-chua-co-gay`); thêm xong quay lại → chọn sẵn (`f01--b-09-gay-chon-san`).
- **Lỗi**: form trống → Gậy + 6 ô "Bắt buộc", "Chưa lưu: 7 trường cần sửa." (`f05--b-04-loi-truong`); Carry 400 → "Trong khoảng 10–350 m" (`f05--b-05-ngoai-khoang`); sửa phiên Spin "abc" → "Không phải số" (`f05--b-08-sua-loi`).
- **Sửa phiên**: swing điền sẵn theo yard (`f05--sua-phien-yard`); thể lực (`f05--sua-phien-the-luc`); phiên CSV chưa gắn gậy lưu được không cần gậy (`f05--sua-phien-csv-khong-gay`).
- **Đang lưu**: "Đang lưu…" + vòng xoay trên nút, "Lưu" khoá (`f13--b-08-dang-luu`).
- **Lưu thành công**: toast "Đã lưu" (thêm) / "Đã lưu thay đổi" (sửa) · "Phiên swing ngày 07/10/2026" / "Phiên thể lực ngày 07/10/2026" (ngày phiên); nút khoá; 1,2 s sau quay lại (`f05--nhap-tay-da-luu`, `f13--toast-da-luu`).
- **Lưu thất bại**: toast "Lưu thất bại" · "Mất kết nối — số liệu chưa được lưu, form giữ nguyên." · "Thử lại"; form giữ, bấm Lưu lại được (`f13--b-09-luu-that-bai`).
- `?id=` sai / của người khác: không vẽ form, chuyển Chi tiết phiên. Không có trạng thái tải.

**6.** Sheet "Chọn ngày", "Chọn gậy" (12.1); toast như mục 5.

**7. A11y** — `KeyboardAvoid` (nút Lưu ngay trên bàn phím). Góc bắn dùng **bàn phím có dấu trừ**. Ô Gậy đọc "Gậy, Gỗ 3 · TaylorMade Qi10" / "Gậy, chưa chọn"; ô Ngày "Ngày, 07/10/2026". Sheet gậy là radiogroup "Gậy", tiêu đề nhóm role header. Ô ngày trong lịch đọc đủ thứ, ngày, tháng, năm; ngày sau hôm nay mang trạng thái disabled. Lỗi tổng, "Đang lưu…", toast đọc to ngay.

**8. Tham chiếu** Story `f05--nhap-tay`, `f05--b-04-loi-truong`, `f13--b-09-luu-that-bai`, `f01--b-08-chua-co-gay`, `f01--b-09-gay-chon-san`, `f01--nhap-tay-loi`, `f01--nhap-tay-da-luu`, `f05--b-05-ngoai-khoang`, `f05--b-08-sua-loi`, `f05--nhap-tay-the-luc`, `f05--nhap-tay-yard`, `f05--nhap-tay-da-luu`, `f05--sua-phien-yard`, `f05--sua-phien-the-luc`, `f05--sua-phien-csv-khong-gay`, `f06--b-05-gay-moi-trong-picker`, `f06--b-06-chon-san-gay-moi`, `f13--toast-da-luu`, `f13--b-08-dang-luu`. Figma L `48:4704` · D `48:8325` · ref `48:1046` (phiên swing trống). Nguồn `app/metrics/manual.tsx`; `components/SwingMetricsForm.tsx`, `ClubPicker.tsx`, `SessionEntry.tsx`, `Feedback.tsx`, `KeyboardAvoid.tsx`; `lib/validation.ts`, reducer `addSession` / `updateSession`.

**Lệch spec:** không lệch spec §4. Ghi chú thiết kế: domain có trường `note` của phiên nhưng chưa màn nào nhập / hiện; rời màn khi gõ dở không hỏi "bỏ thay đổi?".

#### Nhập file CSV — `metrics/import-csv`

**1. Mục đích** — Nhập nhiều phiên swing từ file TrackMan / Foresight qua 3 bước: chọn file → xem trước (nhận diện hãng, dòng lỗi bỏ qua) → xác nhận gậy + ngày rồi lưu; **mỗi dòng hợp lệ thành 1 phiên** (xem BR-SOLIEU-15…17, BR-BOGAY-23). Chỉ người chơi. Vào từ: Chọn nguồn; Quét QR › "Nhập dữ liệu phiên" (vào thẳng bước 2 với file TrackMan mẫu). Đi tiếp: lưu xong → toast → về màn đã mở chọn nguồn; "Thêm gậy mới" → `clubs/new`.

**2. Bố cục** — Header "Nhập file CSV" (quay lại rời hẳn màn ở mọi bước). **Stepper** cố định dưới header: "Chọn file · Xem trước · Xác nhận"; bước hiện tại được tô; "Xem trước" chuyển **trạng thái lỗi** khi file không nhận diện được.
- **Bước 1 — Chọn file** (không footer): khung Info "Bản thử: chọn file mẫu"; danh sách file mẫu (icon file biểu đồ, tên, mũi tên): `TrackMan_Session_2026-10-05.csv` (4 dòng hợp lệ + 1 lỗi), `FSX_Export_7i.csv` (Foresight, 3 hợp lệ), `Ghi_chep_tu_nhap.csv` (không phải file máy đo).
- **Bước 2 — Xem trước**: "Hãng nhận diện" + tag có tích "TrackMan"; tên file 1 dòng; tóm tắt đậm "4 dòng hợp lệ · 1 dòng lỗi (bỏ qua)" (không có lỗi: "3 dòng hợp lệ"). Mọi dòng theo thứ tự file, số dòng tính cả tiêu đề (bắt đầu "Dòng 2"): **hợp lệ** — icon tích tròn (dương), "Dòng 2 · 104 mph · 229 m", mô tả "Tốc độ bóng 152 mph · Smash factor 1,46 · Spin 2650 rpm · Góc bắn 12,4°"; **lỗi** — icon cảnh báo tròn (âm), "Dòng 5 · bỏ qua" + khung lỗi Negative mỗi lỗi một dòng "Tốc độ đầu gậy: Bắt buộc" (dạng "<Tên trường>: <lỗi>", luật như Nhập tay). Carry TrackMan trong file là yard, đổi ra mét ("250" → 229 m). Không giới hạn số dòng. Footer: nút mức ba "Chọn file khác" | nút chính "Tiếp tục" (khoá khi 0 dòng hợp lệ).
- **Bước 3 — Xác nhận**: "4 phiên swing từ file TrackMan sẽ được gắn cùng gậy và ngày dưới đây."; **Gậy** tự chọn sẵn gậy khớp cột Club ("Driver" → Driver; "7 Iron" → Sắt 7), không khớp → trống; chú thích "Cột Club trong file: Driver"; **Ngày** mặc định "07/10/2026". Footer: lỗi tổng · nút mức ba "Quay lại" | nút chính "Nhập 4 phiên" (số dòng hợp lệ).
- **File không nhận diện** (thay bước 2, giữa màn): icon file gạch chéo, "Không nhận diện được file", "Ghi_chep_tu_nhap.csv không phải file xuất từ TrackMan hoặc Foresight.", nút "Chọn file khác".

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| Dòng file mẫu | bước 1 | đọc file → Xem trước / không nhận diện |
| "Chọn file khác" | bước 2 / file lạ | về bước 1; xoá gậy đã chọn và lỗi |
| "Tiếp tục" | bước 2, ≥ 1 dòng hợp lệ | bước 3 |
| Ô Gậy / Ngày | bước 3 | sheet chọn gậy / ngày |
| "Quay lại" (footer) | bước 3 | về bước 2 |
| "Nhập N phiên" | bước 3 | thiếu gậy → lỗi, không lưu; đủ → **ghi ngay N phiên** (cùng gậy, cùng ngày, nguồn "CSV", hãng theo file), toast; sau đó hai nút footer khoá |

**4. Trường nhập** — Gậy (bắt buộc, gậy đang dùng của mình): dưới ô "Bắt buộc", footer "Chưa nhập: chọn gậy cho 4 phiên." — hiện sau khi bấm "Nhập N phiên" mà chưa có gậy, mất ngay khi chọn. Ngày: luôn có giá trị, không chọn ngày sau hôm nay. Số liệu trong file không sửa được ở đây (nhập xong rồi "Sửa phiên").

**5. Trạng thái** — Bước 1 (`f05--csv-chon-file`) · File lạ: stepper lỗi ở "Xem trước" (`f05--csv-file-la`) · Xem trước có dòng lỗi (`f05--b-12-csv-xem-truoc`) · Toàn dòng lỗi: "0 dòng hợp lệ · N dòng lỗi (bỏ qua)", "Tiếp tục" khoá (không có file mẫu) · Xác nhận có gậy gợi ý (`f05--csv-xac-nhan`) · Thiếu gậy (`f05--csv-thieu-gay`) · **Đã nhập**: toast "Đã nhập 4 phiên" · "TrackMan · ngày 07/10/2026", hai nút khoá, 1,2 s sau quay lại (`f05--b-13-csv-da-nhap`) · Mở từ QR: thẳng bước 2. **Không có** tải, đang lưu, lưu thất bại.

**6.** Sheet "Chọn gậy" / "Chọn ngày"; toast "Đã nhập N phiên" · "<Hãng> · ngày dd/mm/yyyy".

**7. A11y** — Stepper đọc "Bước 2 / 3". Lỗi tổng đọc to. Mô tả dòng hợp lệ dùng khoảng trắng không ngắt trong từng chỉ số (không tách "152 | mph"). Lùi bước nằm ở footer ("Chọn file khác", "Quay lại"), không ở header.

**8. Tham chiếu** Story `f05--b-12-csv-xem-truoc`, `f05--csv-xac-nhan`, `f05--csv-file-la`, `f05--b-13-csv-da-nhap`, `f05--csv-chon-file`, `f05--csv-thieu-gay`. Figma L `48:4851` · D `48:8347` (bước Xem trước) · ref `48:1048`. Nguồn `app/metrics/import-csv.tsx`; `lib/csv.ts`, `lib/simulate.ts`, reducer `addSessions`.

**Lệch spec:** spec §4 "preview bảng" — code là danh sách từng dòng. Spec §4 "mọi tác vụ giả lập có lỗi + thử lại" (quy ước repo "lưu: đang tải + lỗi + thử lại") — "Nhập N phiên" ghi ngay, không "Đang lưu…", không toast lỗi / "Thử lại", cờ Dev không tác động. Chưa có trình chọn file thật (3 file mẫu, "Bản thử"). Cả file dùng **một gậy** (chưa tách file nhiều gậy).

#### Ảnh chụp màn hình — `metrics/import-photo`

**1. Mục đích** — Đọc số từ ảnh chụp màn hình máy đo (OCR giả lập) qua 3 bước: chọn hãng + ảnh → đọc → kiểm tra từng trường (trường độ tin cậy thấp bị đánh dấu, sửa được), rồi lưu **1 phiên swing** (xem BR-SOLIEU-18…20). Chỉ người chơi. Vào từ: Chọn nguồn. Đi tiếp: lưu xong → toast → về màn đã mở chọn nguồn; "Thêm gậy mới" → `clubs/new`.

**2. Bố cục** — Header "Ảnh chụp màn hình". **Stepper** "Chọn hãng · Đọc số liệu · Kiểm tra".
- **Bước 1** (cuộn + footer): nhãn "Hãng máy đo" + segmented **TrackMan | Foresight** (mặc định TrackMan); **khung hướng dẫn** 4:3 viền nét đứt màu nhấn: icon cắt ảnh, đậm "Đặt bảng số liệu vào khung", nhỏ "Chụp thẳng màn hình kết quả TrackMan, đủ sáng, không bị loá" (tên hãng theo segmented) — chỉ là hình minh hoạ tĩnh, không crop thật; nhãn "Ảnh" + khung Info "Bản thử: chọn một ảnh mẫu, chưa mở thư viện ảnh" + thẻ radio `ket_qua_may_do.jpg` (mặc định, đọc được) / `chup_nghieng_bi_loa.jpg` (không đọc được); footer nút chính icon quét "Đọc số liệu".
- **Bước 2 — Đang đọc** (giữa màn, không footer, 1,5 s): vòng xoay lớn, "Đang đọc…", "Nhận diện số liệu trên ảnh TrackMan", nút mức ba "Huỷ".
- **Bước 2 — Không đọc được**: icon ảnh gạch chéo, "Không đọc được số liệu", "Ảnh mờ hoặc bị loá. Chụp thẳng màn hình kết quả TrackMan, đủ sáng rồi thử lại với ảnh khác.", nút "Chọn ảnh khác".
- **Bước 3 — Kiểm tra** (cuộn + footer): dải Warning rộng hết màn "1 trường độ tin cậy thấp — kiểm tra trước khi lưu" (chỉ khi còn trường bị đánh dấu; số = số trường còn đánh dấu); **6 ô số** như Nhập tay, điền sẵn — TrackMan "104,8" · "153,2" · "1,46" · Spin "**2B10**" · "12,1" · Carry "231" (yard "252,6"); Foresight "84,9" · "115,6" · "1,36" · "**6B40**" · "17,5" · "149"; ô độ tin cậy thấp (mẫu: Spin) có khung Warning dưới "Độ tin cậy thấp — kiểm tra lại"; **ô Gậy nằm dưới** 6 ô (ngược Nhập tay), **không chọn sẵn**; footer: lỗi tổng · nút mức ba "Chọn ảnh khác" | nút chính "Lưu". **Không có ô Ngày** (luôn lưu ngày hôm nay).

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| Segmented hãng | bước 1 | đổi hãng, chữ hướng dẫn, bộ số OCR mẫu |
| Thẻ ảnh | bước 1 | chọn ảnh mẫu |
| "Đọc số liệu" | bước 1 | "Đang đọc…" → sau 1,5 s bước 3 (ảnh rõ) / "Không đọc được" (ảnh mờ) |
| "Huỷ" | đang đọc | huỷ, về bước 1, không điền gì; rời màn khi đang đọc cũng huỷ |
| "Chọn ảnh khác" | không đọc được / bước 3 chưa lưu | về bước 1 (bỏ kết quả đọc); ảnh lỗi **vẫn đang được chọn** |
| Gõ vào ô số | bước 3 | ô bị đánh dấu mà **bị sửa** thì mất cảnh báo, dải đếm lại |
| "Lưu" | bước 3, chưa lưu | sai / thiếu gậy → lỗi; đủ → **ghi ngay** 1 phiên (nguồn "Ảnh", hãng đã chọn, hôm nay), toast; nút footer khoá |

**4. Trường nhập** — 6 ô như Nhập tay, nhưng **lỗi ô số hiện ngay** khi vào bước 3 (Spin "2B10" → "Không phải số"). Ô Gậy "Bắt buộc" chỉ sau khi bấm Lưu. Lỗi tổng "Chưa lưu: N trường cần sửa." sau khi bấm Lưu (mẫu chưa sửa: "Chưa lưu: 2 trường cần sửa.").

**5. Trạng thái** — Chọn hãng & ảnh (`f05--anh-chon-hang`) · Đang đọc (`f05--b-14-ocr-dang-doc`) · Không đọc được: stepper vẫn bước 2, không chuyển kiểu lỗi (`f05--b-15-ocr-loi`) · Kiểm tra có trường độ tin cậy thấp + lỗi (`f05--b-16-ocr-kiem-tra`) · Đã sửa hết: dải cảnh báo mất, hết lỗi · **Lưu thành công**: toast "Đã lưu" · "Phiên swing ngày 07/10/2026 · ảnh TrackMan", 1,2 s sau quay lại. **Không có** "Đang lưu…" / lưu thất bại.

**6.** Sheet "Chọn gậy"; toast thành công; không dialog.

**7. A11y** — Vòng xoay nhãn "Đang đọc số liệu". "Không đọc được" là **alert**. Nhóm ảnh mẫu radiogroup "Ảnh". Stepper "Bước N / 3". Bước 3 bọc `KeyboardAvoid`. Cảnh báo độ tin cậy thấp là chữ, không chỉ màu.

**8. Tham chiếu** Story `f05--anh-chon-hang`, `f05--b-15-ocr-loi`, `f05--b-16-ocr-kiem-tra`, `f05--b-14-ocr-dang-doc`. Figma L `48:7901` · D `48:8372` (bước Kiểm tra) · ref `48:1050`. Nguồn `app/metrics/import-photo.tsx`; `lib/simulate.ts`.

**Lệch spec:** lưu ghi ngay (không "Đang lưu…", lỗi, "Thử lại"; cờ Dev không tác động) như CSV. Spec §4 có "khung crop hướng dẫn" — code chỉ có khung minh hoạ tĩnh, chưa mở thư viện ảnh / camera. Không có ô Ngày nên không ghi được phiên ngày trước (spec không đòi, nên quyết khi thiết kế lại).

#### Quét QR (Thử nghiệm) — `metrics/scan-qr`

**1. Mục đích** — Luồng thử nghiệm quét QR ở sân tập để liên kết phiên, rồi nhập dữ liệu qua màn CSV; camera và mã đều giả lập (xem BR-SOLIEU-21). Chỉ người chơi. Vào từ: Chọn nguồn. Đi tiếp: "Nhập dữ liệu phiên" → `metrics/import-csv?file=TrackMan_Session_2026-10-05.csv`, **thay chỗ** màn QR.

**2. Bố cục** — Header "Quét QR". Vùng cuộn: tag nhỏ "Thử nghiệm"; **khung camera giả lập** vuông bo góc, **nền tối ở cả chế độ sáng lẫn tối**, khung ngắm 60% giữa với 4 góc chữ L màu nhấn + vạch quét ngang, không có ảnh camera; mô tả "QR của sân tập dùng để liên kết phiên — đang chờ xác nhận định dạng với đối tác"; khung kết quả tuỳ trạng thái. Footer cố định (đường kẻ), nút đổi theo trạng thái.

**3. Hành động**

| Nút | Điều kiện | Kết quả |
|---|---|---|
| Chính icon quét "Mô phỏng quét thành công" | chưa quét | "đang liên kết" → 1 s → "đã liên kết" |
| Mức ba "Mô phỏng mã không đọc được" | chưa quét | "mã không đọc được" |
| Khoá "Đang liên kết phiên…" | đang liên kết | — |
| Chính icon file biểu đồ "Nhập dữ liệu phiên" | đã liên kết | thay bằng CSV, thẳng bước Xem trước file TrackMan mẫu |
| Chính icon làm mới "Quét lại" | mã không đọc được | về chưa quét |
| Quay lại (header) | luôn | rời màn; đang liên kết thì huỷ |

**4.** Không có.

**5. Trạng thái** — **Chưa quét**: không khung kết quả, 2 nút mô phỏng (`f05--quet-qr`) · **Đang liên kết** (1 s): Info "Đã đọc mã — đang liên kết phiên với sân tập…", nút khoá · **Đã liên kết**: Positive "Đã liên kết phiên TrackMan #A1F3" + "Nhập dữ liệu phiên" (`f05--b-17-qr`) · **Mã không đọc được**: Negative "Không đọc được mã — mã mờ hoặc không phải mã phiên của sân tập. Căn mã vào giữa khung rồi quét lại." + "Quét lại".

**6.** Không có (khung kết quả là thông báo nội tuyến).

**7. A11y** — Khung camera là ảnh nhãn "Khung camera giả lập". Khung kết quả đọc to (alert).

**8. Tham chiếu** Story `f05--quet-qr`, `f05--b-17-qr`. Figma L `48:8079` · D `48:8399` · ref `48:1052`. Nguồn `app/metrics/scan-qr.tsx`.

**Lệch spec / ghi chú:** không có camera thật; hai nút "Mô phỏng…" chỉ cho bản thử. Phiên qua QR lưu **nguồn "CSV"**, nên tag "QR" không bao giờ xuất hiện. Mã "#A1F3" cố định.

#### Chi tiết phiên — `metrics/[id]`

**1. Mục đích** — Xem đủ một phiên swing / thể lực (thông tin, mọi chỉ số, dữ liệu gốc); chủ phiên sửa / xoá (xem BR-SOLIEU-02, 03, 14, 24). Mọi người đã đăng nhập: **chủ phiên** đủ quyền; **HLV active** chỉ đọc, số theo **đơn vị của HLV**; người khác (theo dõi, HLV đã huỷ, người chơi khác) → 403. Vào từ: dòng phiên ở Thông số; Chi tiết học viên (tab Thông số, Thể lực); Chi tiết gậy › "Phiên số liệu gần đây"; chuyển từ `metrics/manual?id=`; link. Đi tiếp: "Sửa phiên" → `metrics/manual?id=`; xoá xong → màn trước.

**2. Bố cục** — Header "Phiên swing" / "Phiên thể lực", phụ đề "Driver · 30/09/2026" (thể lực / không gậy: chỉ ngày). Không thanh tab, không footer cố định. Vùng cuộn:
1. "Thông tin" (dòng nhãn trái, giá trị đậm phải): Ngày "30/09/2026"; Gậy "Driver · TaylorMade Qi10" / "Chưa gắn gậy" (chỉ swing); Nguồn "CSV · TrackMan" / "Ảnh · TrackMan" / "Nhập tay"; Đã sửa "07/10/2026" (chỉ khi đã sửa).
2. "Chỉ số": swing 6 dòng (Driver 30/09): Tốc độ đầu gậy **104 mph** · Tốc độ bóng **152 mph** · Smash factor **1,46** (2 số lẻ) · Spin **2650 rpm** · Góc bắn **12,4°** (1 số lẻ) · Carry **229 m** (yd khi yard); thể lực 4 dòng: Cân nặng **72,0 kg** (1 số lẻ) · Độ dẻo **7/10** · Lực nắm **45 kg** · Bật cao **48 cm**.
3. "Dữ liệu gốc" — khối thu gọn, **mặc định đóng**, chỉ phiên CSV / Ảnh: "Bản ghi nhận từ file CSV TrackMan (mô phỏng)" / "…từ ảnh chụp màn hình TrackMan (mô phỏng)" + khối chữ kiểu code (JSON: hãng, thời điểm ISO, chỉ số đã chuẩn hoá).
4. **Nút của chủ phiên** (xếp dọc, cỡ vừa): nút phụ icon bút "Sửa phiên"; **nút nguy hiểm dạng nhạt** icon thùng rác "Xoá phiên"; đang xoá: dòng "Đang xoá…" + vòng xoay.

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| "Dữ liệu gốc" | CSV / Ảnh | mở / đóng khối |
| "Sửa phiên" | chủ phiên | `metrics/manual?id=`; lưu xong quay lại đây với số mới + dòng "Đã sửa" |
| "Xoá phiên" | chủ phiên, không đang xoá | dialog xác nhận; đang xoá: nút "Đang xoá…" khoá |
| Dialog "Xoá" | — | đóng dialog, "Đang xoá…" 0,6 s → thành công: quay lại, phiên biến mất (**không toast**); thất bại: toast lỗi |
| Dialog "Huỷ" / nền mờ | — | đóng, không xoá |
| Toast "Thử lại" | toast lỗi | xoá lại, không hỏi lại |

**4.** Không có.

**5. Trạng thái** — Chủ phiên swing (`f05--b-07-chi-tiet`); thể lực: 4 chỉ số, không dòng Gậy · Đã sửa: thêm "Đã sửa dd/mm/yyyy" (`f05--b-09-sau-sua`, `f05--b-11-the-luc-sau-sua`) · **HLV xem**: không khối nút, vd HLV Tuấn mở phiên Driver 30/09 của Minh Anh (`f05--chi-tiet-hlv-xem`, `f09--b-05-phien-chi-doc`) · Dialog xoá (`f05--chi-tiet-xoa-dialog`) · Đang xoá (`f13--b-11-dang-xoa`) · Xoá thành công: về màn trước, không toast (`f13--b-12-xoa-thanh-cong`, chụp ở Thông số) · **Xoá thất bại**: toast "Xoá thất bại" · "Mất kết nối — phiên vẫn còn." · "Thử lại", phiên vẫn hiện (`f13--b-10-xoa-that-bai`) · **403** header "Chi tiết phiên", NoAccess (vd HLV Hà sau khi bị huỷ kết nối; `f05--chi-tiet-khong-quyen`) · **404** header "Chi tiết phiên", icon tìm file, "Không tìm thấy phiên", "Phiên này không tồn tại hoặc đã bị xoá.", "Quay lại" (`f05--chi-tiet-khong-thay`). Không có trạng thái tải.

**6.** Dialog cảnh báo "Xoá phiên này?" · "Số liệu của phiên sẽ bị xoá và không khôi phục được." · "Huỷ" / "Xoá" (nguy hiểm). Toast lỗi như trên.

**7. A11y** — "Thông tin", "Chỉ số" role header. Dialog modal, tiêu đề role header. "Đang xoá…", toast đọc to. Phiên chỉ bị xoá **sau khi màn đã rời** (để màn đang lùi không nháy "Không tìm thấy phiên") — chuyển cảnh phải giữ thứ tự rời màn trước, danh sách cập nhật sau.

**8. Tham chiếu** Story `f05--b-07-chi-tiet`, `f05--chi-tiet-xoa-dialog`, `f05--chi-tiet-khong-quyen`, `f05--b-09-sau-sua`, `f05--b-11-the-luc-sau-sua`, `f05--chi-tiet-hlv-xem`, `f05--chi-tiet-khong-thay`, `f09--b-05-phien-chi-doc`, `f13--b-10-xoa-that-bai`, `f13--b-11-dang-xoa`. Figma L `48:8125` · D `48:8415` (swing của chủ phiên) · ref `48:1054`. Nguồn `app/metrics/[id].tsx`; `components/NoAccess.tsx`, `useOnLeave.ts`, `Feedback.tsx`; `lib/selectors.ts`, reducer `deleteSession`.

**Lệch spec / ghi chú:** spec §4 "toàn bộ chỉ số, nguồn, raw vendor, xoá" — có đủ, thêm "Sửa phiên". "Dữ liệu gốc" hiện **số đã chuẩn hoá hiện tại**, không phải bản ghi gốc (sửa phiên thì khối này hiện số đã sửa). Xoá thành công không có toast (nên quyết). Khi đang xoá, "Đang xoá…" xuất hiện 2 lần (nút và dòng vòng xoay).

### 12.4 Bộ gậy & swing

Route: `clubs/index` · `clubs/new` · `clubs/[id]/index` · `clubs/[id]/edit` · `(player)/swings` · `swings/new` · `swings/[id]`. Figma: trang "Thiết kế · Bộ gậy & Swing" `48:603`. Chưa đăng nhập → `/` ở cả 7 route; cổng vai / chủ dữ liệu ghi ở từng màn. Bộ gậy, swing, ghi chú là dữ liệu riêng (403 theo 12.1).

#### Bộ gậy — `clubs/index`

**1. Mục đích** — Lưới gậy của một người chơi theo nhóm, hai mục "Đang dùng" / "Lưu trữ" để khôi phục hoặc xoá gậy lưu trữ (xem BR-BOGAY-14, 15, 18, 24). Người chơi xem của mình (toàn quyền); HLV xem học viên bằng `?playerId=` (chỉ đọc, cần kết nối active); HLV không `playerId` → `/`; không quyền → 403, header "Bộ gậy". Vào từ: Thông số › Bộ gậy › dòng "Gậy đã lưu trữ" ("N gậy — khôi phục hoặc xoá") hoặc nút phụ rỗng → `?view=archived`; link `/clubs`, `/clubs?view=archived`, `/clubs?playerId=…`. *Lưu ý:* lưới "Đang dùng" người chơi thấy hằng ngày nằm ở Thông số › Bộ gậy (cùng `ClubGrid`); HLV xem ở `students/[id]` › "Bộ gậy"; **không có nút nào** mở `/clubs?playerId=` (chỉ vào bằng link). Đi tiếp: thẻ → `clubs/[id]`; "+" / "Thêm gậy" → `clubs/new`.

**2. Bố cục** — Không thanh tab.
1. StackHeader "Bộ gậy", phụ đề chủ gậy "N gậy đang dùng" ("8 gậy đang dùng") / HLV "Tên học viên · N gậy" ("Nguyễn Minh Anh · 8 gậy"); không nút phải.
2. **Segmented** (chỉ chủ gậy): "Đang dùng" + badge số ("8"), "Lưu trữ" + badge số ("0"); mặc định Đang dùng, `?view=archived` → Lưu trữ. HLV không thấy, chỉ thấy gậy đang dùng.
3. **Lưới theo nhóm** (cuộn): nhóm cố định **Gỗ · Hybrid · Sắt · Wedge · Putter · Khác** (ẩn nhóm trống), tiêu đề nhóm role header; trong nhóm theo thứ tự loại (Driver → Gỗ 3 → Gỗ 5; Sắt 4 → 9; PW → GW → SW → LW), cùng loại theo thứ tự thêm (mục Lưu trữ: lưu trữ gần nhất trước). Lưới 2 cột chia đều, hàng lẻ thẻ cuối vẫn rộng nửa màn; không giới hạn. **Thẻ gậy** (cả thẻ là vùng chạm): dòng 1 tên gậy 1 dòng ("Driver", "Sắt 7"; Tuỳ chỉnh: tên riêng "Chipper 37°"); dòng 2 "Hãng Model" tối đa 2 dòng; dòng 3 "Loft · Flex" bám đáy thẻ để thẳng hàng. Mẫu Minh Anh: Gỗ — Driver TaylorMade Qi10 "10,5° · Stiff", Gỗ 3 TaylorMade Qi10 "15° · Stiff"; Hybrid — Hybrid 4 Titleist TSR2 "21° · Stiff"; Sắt — Sắt 5 / Sắt 7 Mizuno JPX923 Forged "25° · Stiff" / "31° · Stiff"; Wedge — PW Mizuno JPX923 Forged "45° · Stiff", SW Titleist Vokey SM10 "56° · Stiff"; Putter — Scotty Cameron Super Select Newport 2 "3,5° · Stiff".
4. **Nút nổi "+"** góc dưới phải (nhãn "Thêm gậy"): chủ gậy, mục Đang dùng, có ≥ 1 gậy; cuối lưới chừa đệm.

**3. Hành động** — Segmented: đổi lưới, không đổi URL. Thẻ: `clubs/[id]` (sửa / lưu trữ / xoá nằm ở chi tiết). "+" hoặc CTA rỗng "Thêm gậy" (chủ gậy, Đang dùng): `clubs/new`.

**4.** Không có.

**5. Trạng thái**

| Trạng thái | Hiển thị |
|---|---|
| Tải lần đầu | header (+ segmented nếu chủ gậy) hiện; khung xương dạng danh sách thay lưới; "+" ẩn |
| HLV xem | không segmented, không "+", chỉ gậy đang dùng, phụ đề có tên học viên |
| Rỗng — chủ gậy, Đang dùng (mẫu Huy) | icon cờ; "Chưa có gậy nào"; "Thêm gậy để gắn với từng phiên số liệu và video swing."; nút "Thêm gậy" |
| Rỗng — Lưu trữ | icon lưu trữ; "Chưa lưu trữ gậy nào"; "Gậy lưu trữ ẩn khỏi danh sách chọn gậy nhưng giữ nguyên lịch sử phiên và swing."; không nút (cũng là trạng thái sau khi xoá gậy lưu trữ cuối cùng) |
| Rỗng — HLV xem | icon cờ; "Chưa có gậy nào"; "Tên học viên chưa thêm gậy vào bộ gậy."; không nút |
| 403 | NoAccess, header "Bộ gậy" |

Không có lưu, lỗi, toast. **6.** Không có.

**7. A11y** — Tiêu đề nhóm role header. Mỗi thẻ là nút, đọc gộp 3 dòng. Segmented là tablist, badge số đọc cùng nhãn. "+" chỉ icon, giữ nhãn "Thêm gậy", vùng chạm ≥ 44 pt, không che thẻ cuối. Dòng loft thẳng hàng giữa hai thẻ cạnh nhau.

**8. Tham chiếu** Story `f06--danh-sach` (lưới 8 gậy), `f06--b-10-luu-tru`, `f06--hlv-xem-bo-gay`, `f06--danh-sach-rong`, `f06--khong-quyen-bo-gay`, `f06--b-13-sau-xoa`, `f13--dang-tai-bo-gay`. Figma L `48:6986` · D `48:9088` · ref `48:3866`. Nguồn `app/clubs/index.tsx` (cả `ClubGrid`), `lib/selectors.ts`, `lib/domain.ts`, `components/NoAccess.tsx`, `components/ListSkeleton.tsx`; lối vào `app/(player)/metrics.tsx`.

**Lệch spec:** spec §4 ghi 5 nhóm — code thêm "Khác" cho Tuỳ chỉnh. Khung xương dạng hàng danh sách, không giống lưới thẻ.

#### Thêm gậy — `clubs/new`

**1. Mục đích** — Form tạo gậy cho người chơi đang đăng nhập (xem BR-BOGAY-01…12). Chỉ người chơi (HLV → `/`). Vào từ: Thông số › Bộ gậy ("+" / CTA "Thêm gậy"); `clubs/index`; "Thêm gậy mới" cuối sheet "Chọn gậy" ở `swings/new`, `metrics/manual`, `metrics/import-csv`, `metrics/import-photo`. Đi tiếp: lưu xong → màn trước (mở thẳng link → `/clubs`); màn trước có ô "Gậy" thì gậy mới **được chọn sẵn**; quay lại header → bỏ form, không hỏi.

**2. Bố cục** — Header "Thêm gậy" (không phụ đề, không nút phải). Form cuộn: (1) **Loại gậy** — ô chọn, placeholder "Chọn loại gậy", chạm mở sheet, chọn xong hiện tên loại; (2) **Tên gậy** — chỉ khi "Tuỳ chỉnh"; (3) **Hãng**, **Model**, **Hãng cán**; (4) **Flex** — 5 chip chọn một "Ladies", "Senior", "Regular", "Stiff", "X-Stiff", mặc định **Regular**; (5) **Trọng lượng cán (g, tuỳ chọn)**; (6) **Loft (°)**; (7) **Lie (°)**; (8) **Bounce (°, tuỳ chọn)** — khi loại thuộc Wedge (PW/GW/SW/LW) hoặc ô đã có giá trị; đã hiện thì xoá trắng cũng không ẩn (giữ focus). Trợ giúp ô Loft khi loại có gợi ý: "Gợi ý cho `Loại`: `x°` · khoảng hợp lệ `a–b°`" ("Gợi ý cho Driver: 10,5° · khoảng hợp lệ 0–64°"); ô khác "Khoảng hợp lệ …". Footer cố định: lỗi tổng · "Đang lưu…" · nút chính rộng "Lưu". **Loft tự điền** theo loại khi ô trống hoặc vẫn đúng gợi ý loại cũ; đã tự gõ thì giữ (bảng gợi ý ở §4.6, xem BR-BOGAY-09); "Tuỳ chỉnh" không gợi ý (ô trống); Lie không có gợi ý.

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Ô "Loại gậy" | sheet "Chọn loại gậy" |
| Mục trong sheet | chọn loại, đóng sheet, điền gợi ý loft; "Tuỳ chỉnh" → hiện "Tên gậy"; wedge → hiện "Bounce" |
| Chip Flex | chọn một |
| "Lưu" (bật trừ khi đang lưu / đã lưu xong) | sai → lỗi dưới ô + "Chưa lưu: `N` trường cần sửa.", không lưu; hợp lệ → khoá nút, "Đang lưu…" 0,6 s, thêm gậy, quay lại; thất bại → toast lỗi, form giữ |
| "Thử lại" (toast) | gỡ toast, chạy lại Lưu |

**4. Trường nhập** (xem BR-BOGAY-03…08; số: "," hay "." thập phân, số âm hợp lệ về cú pháp, số lẻ ở ô nguyên "63,5" vẫn nhận; ô số không placeholder)

| Nhãn | Placeholder / trợ giúp | Bắt buộc | Khoảng | Chữ lỗi |
|---|---|---|---|---|
| Loại gậy | "Chọn loại gậy" (sheet) | Có | 16 loại + Tuỳ chỉnh | "Bắt buộc" |
| Tên gậy (Tuỳ chỉnh) | "VD: Chipper 37°" | Có | trim, không giới hạn | "Bắt buộc" |
| Hãng / Model / Hãng cán | "VD: TaylorMade" / "VD: Qi10" / "VD: Fujikura Ventus Blue 6" | Có | trim | "Bắt buộc" |
| Flex | chip, mặc định Regular | luôn có | 5 giá trị | — |
| Trọng lượng cán (g, tuỳ chọn) | "Khoảng hợp lệ 30–150 g" | Không | 30–150 | "Không phải số" · "Trong khoảng 30–150 g" · "Không dùng dấu chấm ngăn nghìn (vd …)" |
| Loft (°) | gợi ý như mục 2 | Có | 0–64 | "Bắt buộc" · "Không phải số" · "Trong khoảng 0–64°" |
| Lie (°) | "Khoảng hợp lệ 45–80°" | Có | 45–80 | "Bắt buộc" · "Không phải số" · "Trong khoảng 45–80°" |
| Bounce (°, tuỳ chọn) | "Khoảng hợp lệ 0–20°" | Không | 0–20 | "Không phải số" · "Trong khoảng 0–20°" · "Không dùng dấu chấm ngăn nghìn (vd …)" |

**5. Trạng thái** — Trống (mặc định: Flex Regular, chưa có Tên gậy / Bounce) · Đã chọn loại thường (Loft điền gợi ý, trợ giúp ghi gợi ý) · "Tuỳ chỉnh" (thêm "Tên gậy" ngay dưới Loại; Loft trống, trợ giúp chỉ ghi khoảng) · Wedge (thêm Bounce cuối form) · Lỗi validate (bỏ trống Loại, Model, Hãng cán, Loft, Lie → "Chưa lưu: 5 trường cần sửa."; role alert) · Đang lưu · Lưu xong: nút khoá hẳn, quay lại ngay, **không có toast thành công** · Lưu thất bại: toast "Lưu thất bại" · "Mất kết nối — gậy chưa được lưu, form giữ nguyên." · "Thử lại", nút mở lại. Không có tải, rỗng, 403.

**6. Sheet "Chọn loại gậy"** — radio chia nhóm (tiêu đề nhóm role header): Gỗ: Driver, Gỗ 3, Gỗ 5 · Hybrid: Hybrid 3, Hybrid 4 · Sắt: Sắt 4 … Sắt 9 · Wedge: PW, GW, SW, LW · Putter: Putter · Khác: Tuỳ chỉnh. Loại đang chọn có dấu radio; chọn → đóng. Toast thất bại như mục 5.

**7. A11y** — Ô Loại gậy là combobox, nhãn gồm giá trị "Loại gậy, Driver" / "Loại gậy, chưa chọn". Chip Flex radiogroup "Flex"; sheet radiogroup "Loại gậy". `KeyboardAvoid`. Bàn phím số thập phân. Lỗi tổng, "Đang lưu…", toast đọc ngay.

**8. Tham chiếu** Story `f06--them-gay` (trống), `f06--them-gay-loi`, `f06--b-03-form-tuy-chinh`, `f06--b-02-16-loai` (sheet), `f06--them-gay-wedge`, `f13--dang-luu-them-gay`, `f06--b-07-gay-moi-o-dang-swing`. Figma L `48:7077` · D `48:9119` · ref `48:3870`. Nguồn `app/clubs/new.tsx` (`ClubForm` dùng chung với Sửa), `lib/validation.ts`, `lib/domain.ts`, `components/Feedback.tsx`, `components/ClubPicker.tsx`.

**Lệch spec:** không lệch §4. MVP có nhắc toast "Lưu thành công" nhưng lưu gậy không có toast.

#### Chi tiết gậy — `clubs/[id]/index`

**1. Mục đích** — Thông số một gậy, swing và phiên gần đây dùng gậy đó; chủ gậy sửa, lưu trữ, khôi phục, xoá (xem BR-BOGAY-13…21). Chủ gậy đủ quyền; HLV active chỉ đọc (không nút); người khác → 403; không tồn tại → "Không tìm thấy gậy". Vào từ: thẻ gậy ở Thông số › Bộ gậy, `clubs/index`, `students/[id]` › Bộ gậy; mục "Gậy" ở `swings/[id]`; quay về từ Sửa. Đi tiếp: bút → `clubs/[id]/edit`; hàng swing → `swings/[id]`; hàng phiên → `metrics/[id]`; lưu trữ / xoá xong → màn trước (không lịch sử → `/clubs`).

**2. Bố cục**
1. Header: tiêu đề tên gậy; phụ đề chủ gậy "Hãng Model" ("TaylorMade Qi10") / HLV "Tên học viên · Hãng Model"; nút phải icon bút (nhãn "Sửa gậy") — chủ gậy, gậy **chưa** lưu trữ.
2. **Inline message lưu trữ** (gậy đã lưu trữ): "Đã lưu trữ ngày `dd/mm/yyyy` — gậy ẩn khỏi danh sách và chọn gậy, dữ liệu cũ giữ nguyên." + với chủ gậy " Khôi phục để dùng lại."
3. "Thông số": hàng nhãn trái / giá trị phải (căn phải, tối đa 2 dòng, cột giá trị có độ rộng tối đa): Loại · Hãng · Model · Hãng cán · Flex · Trọng lượng cán (nếu có) · Loft · Lie · Bounce (nếu có). Mẫu Driver: "Driver" · "TaylorMade" · "Qi10" · "Fujikura Ventus Blue 6" · "Stiff" · "63 g" · "10,5°" · "56°"; SW thêm Bounce "12°".
4. "Swing gần đây dùng gậy này": chú thích khi > 3 swing "3 gần nhất trong `N` swing"; tối đa **3** hàng mới → cũ: tiêu đề ngày quay ("05/10/2026"), chú thích nối " · ": góc quay, "Đã phân tích" (nếu có kết quả), "`N` ghi chú HLV" (nếu > 0) — "Face-on · Đã phân tích · 1 ghi chú HLV", mũi tên ›. Rỗng: "Chưa có swing nào dùng gậy này."
5. "Phiên số liệu gần đây" (phiên swing gắn gậy): chú thích khi > 3 "3 gần nhất trong `N` phiên"; tối đa 3 hàng: ngày; "tốc độ đầu gậy · carry"; tag nguồn + ›. Mẫu Driver ("3 gần nhất trong 6 phiên"): 30/09/2026 "104 mph · 229 m" CSV; 23/09/2026 "103 mph · 226 m" Nhập tay; 16/09/2026 "102 mph · 223 m" CSV. Rỗng: "Chưa có phiên số liệu nào với gậy này."
6. **Nút của chủ gậy**: đang dùng → "Lưu trữ gậy" (nguy hiểm nhẹ, icon lưu trữ); đã lưu trữ → "Khôi phục gậy" (phụ, icon mũi tên vòng); **chưa gắn** phiên / swing → "Xoá gậy" (nguy hiểm nhẹ, icon thùng rác; đang xoá có "Đang xoá…" dưới); **đã gắn** → thay nút Xoá bằng "Gậy đã gắn với `N` phiên/swing nên chỉ lưu trữ được — không xoá để giữ lịch sử." (Driver: 7).

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| Bút | chủ gậy, chưa lưu trữ | `clubs/[id]/edit` |
| "Lưu trữ gậy" → dialog "Lưu trữ" | chủ gậy, đang dùng | lưu trữ **tức thì** (ngày = hôm nay), quay lại; gậy biến khỏi lưới và mọi sheet chọn gậy; không toast |
| "Khôi phục gậy" | chủ gậy, đã lưu trữ | khôi phục **tức thì**, ở lại; toast; bút và "Lưu trữ gậy" hiện lại |
| "Xoá gậy" → dialog "Xoá" | chủ gậy, chưa gắn dữ liệu (cả đang dùng lẫn lưu trữ); khoá khi đang xoá | "Đang xoá…" 0,6 s, quay lại, xoá sau khi đã rời màn (không chớp "Không tìm thấy gậy"); thất bại → toast lỗi, gậy còn |
| "Thử lại" | toast lỗi | xoá lại |
| "Quay lại" (404 / 403) | — | lùi một màn; không lịch sử → `/clubs` (404) / `/` (403) |

**4.** Không có.

**5. Trạng thái** — Chủ gậy, đang dùng, đã gắn dữ liệu (Driver): đủ khối, "Lưu trữ gậy" + dòng "Gậy đã gắn với 7 phiên/swing…", không "Xoá gậy" · Chủ gậy, chưa gắn (gậy vừa thêm): 2 khối dưới hiện dòng rỗng, có "Lưu trữ gậy" và "Xoá gậy" · Đã lưu trữ: inline message (+ "Khôi phục để dùng lại."), không bút, "Khôi phục gậy" (+ "Xoá gậy" nếu chưa gắn) · HLV: phụ đề có tên học viên, không bút, không khối nút; gậy lưu trữ thì message không có câu khôi phục · Đang xoá · Khôi phục xong: toast "Đã khôi phục — gậy về danh sách Đang dùng" · Xoá thất bại · Không tìm thấy: header "Chi tiết gậy", icon kính lúp / tệp, "Không tìm thấy gậy", "Gậy này không tồn tại.", "Quay lại" · 403: header "Chi tiết gậy", NoAccess. Không có khung xương.

**6.** Dialog "Lưu trữ gậy này?" · đã gắn: "Gậy đã gắn với `N` phiên/swing sẽ được ẩn khỏi danh sách, dữ liệu cũ giữ nguyên." / chưa gắn: "Gậy sẽ được ẩn khỏi danh sách." · "Huỷ" / "Lưu trữ" (nguy hiểm). Dialog "Xoá gậy này?" · "Gậy chưa gắn với phiên hay swing nào. Xoá xong không khôi phục được." · "Huỷ" / "Xoá". Toast lỗi "Xoá thất bại" · "Mất kết nối — gậy vẫn còn." · "Thử lại".

**7. A11y** — Bút chỉ icon, giữ nhãn "Sửa gậy". Tiêu đề khối role header. Giá trị dài (tên cán) xuống tối đa 2 dòng, không đẩy nhãn. Hàng swing / phiên là nút có ›, tag nguồn nằm trong hàng. Mọi hành động mất dữ liệu qua dialog, nút xác nhận kiểu nguy hiểm.

**8. Tham chiếu** Story `f06--b-14-driver-khong-xoa`, `f06--b-11-gay-luu-tru`, `f06--hlv-xem-chi-tiet`, `f06--b-08-sua-xong`, `f06--b-12-xoa-gay`, `f06--luu-tru-dialog`, `f06--da-khoi-phuc`, `f06--khong-quyen-chi-tiet`, `f06--khong-tim-thay`, `f07--b-13-gay-cua-swing`, `f09--b-08-gay-chi-doc`, `f13--xoa-gay-that-bai`. Figma L `48:7388` · D `48:9140` · ref `48:3874`. Nguồn `app/clubs/[id]/index.tsx`, `lib/selectors.ts`, `lib/reducer.ts` (`archiveClub`, `unarchiveClub`, `deleteClub` — reducer cũng chặn xoá gậy đã gắn), `components/Section.tsx`, `Feedback.tsx`, `useOnLeave.ts`.

**Lệch spec:** spec §4 đủ; code thêm phiên số liệu, khôi phục, xoá. Mỗi danh sách chỉ 3 mục, **không có "Xem tất cả"** (`ponytail` trong code). Lưu trữ / Khôi phục tức thì, không đang lưu / lỗi / thử lại (spec §4 "mọi tác vụ giả lập có lỗi + thử lại"; F13 coi là lưu tức thì).

#### Sửa gậy — `clubs/[id]/edit`

**1. Mục đích** — Sửa gậy đang dùng, chung form với Thêm gậy (xem BR-BOGAY-13). Chỉ chủ gậy, gậy chưa lưu trữ; không tìm thấy / không phải của mình (kể cả HLV) / đã lưu trữ → **chuyển thẳng** `clubs/[id]` (hiện không tìm thấy / 403 / bản chỉ đọc). Vào từ: bút "Sửa gậy". Đi tiếp: lưu xong → chi tiết gậy (thấy dữ liệu mới); quay lại → bỏ thay đổi, không hỏi.

**2. Bố cục** — Header "Sửa gậy", phụ đề "`Tên gậy` · `Hãng Model`" ("Driver · TaylorMade Qi10"). Form + footer như Thêm gậy, khác: điền sẵn giá trị đã lưu kiểu VN (Loft "10,5", Lie "56", Trọng lượng cán "63"), Flex đã lưu; Bounce hiện sẵn nếu có bounce hoặc là wedge; Tên gậy hiện sẵn nếu Tuỳ chỉnh; đổi loại: Loft đổi theo gợi ý chỉ khi đang đúng gợi ý loại cũ (Driver 10,5 → Gỗ 3 thành 15). Placeholder chỉ thấy khi xoá trắng ô.

**3–4.** Như Thêm gậy; "Lưu" ghi đè gậy cũ (cùng id, giữ trạng thái và chủ). Không có xoá / lưu trữ ở đây.

**5. Trạng thái** — Mặc định (đã điền) · Lỗi validate · Đang lưu · Lưu xong: quay lại chi tiết, **không toast** · Lưu thất bại: toast như Thêm gậy · Gậy đã lưu trữ / không phải của mình / không tồn tại: không vẽ form, chuyển `clubs/[id]`.

**6–7.** Như Thêm gậy; nhãn ô loại gậy có giá trị ngay từ đầu ("Loại gậy, Driver").

**8. Tham chiếu** Story `f06--sua-gay`, `f06--sua-gay-da-luu-tru` (cổng), `f13--sua-gay-nguoi-khac` (cổng). Figma L `48:7203` · D `48:9167` · ref `48:3878` (cùng `ClubForm`, ô đã điền). Nguồn `app/clubs/[id]/edit.tsx`, `app/clubs/new.tsx`, `lib/validation.ts`. **Lệch spec:** không.

#### Swing (tab) — `(player)/swings`

**1. Mục đích** — Danh sách video swing của mình: hai kiểu xem, lọc khoảng ngày, sắp xếp theo ngày quay, lối "Đăng swing" (xem BR-SWING-34, 35). Chỉ người chơi; mỗi người chỉ thấy swing của mình (HLV xem ở `students/[id]` › Swing). Vào từ: tab "Swing" (icon máy quay); xoá swing khi không có lịch sử cũng thay màn bằng tab này. Đi tiếp: thẻ / ô → `swings/[id]`; "Đăng swing" → `swings/new`.

**2. Bố cục**
1. TabHeader "Swing".
2. **Thanh điều khiển** (khi có ≥ 1 swing): segmented nhỏ có icon "Danh sách" (icon menu, mặc định) / "Lưới" (icon lưới); chip lọc chọn một "Tất cả" (mặc định), "7 ngày", "30 ngày" (icon lịch; tính lùi từ hôm nay, mốc đúng 7 / 30 ngày vẫn tính); chip sắp xếp (icon mũi tên lên-xuống) đổi chữ "Mới nhất trước" (mặc định) ↔ "Cũ nhất trước", không có trạng thái "được chọn".
3. **Danh sách** (cuộn, không giới hạn). *Danh sách*: thẻ ngang — thumbnail dọc 9:16 nền tối + icon play (trang trí, ẩn với trình đọc); tên gậy 1 dòng / "Chưa gắn gậy"; "`dd/mm/yyyy` · `Góc quay`"; hàng badge: trạng thái + "`N` ghi chú HLV" (icon tin nhắn, khi N > 0). *Lưới*: 2 cột, thumbnail dọc 3:4 + play, tên gậy, ngày, badge trạng thái (**không** badge ghi chú, **không** góc quay). **Badge trạng thái** — tải chưa xong theo tải lên, xong rồi theo phân tích: "Đang tải `N`%" (xanh dương, đang chạy) · "Tạm dừng" (vàng) · "Lỗi tải lên" (đỏ) · "Chưa phân tích" (trung tính) · "Đang phân tích" (xanh dương) · "Đã phân tích" (xanh lá) · "Cần xem lại" (vàng) · "Lỗi phân tích" (đỏ). Mẫu Minh Anh (mới nhất trước): Gỗ 3 "06/10/2026 · Face-on" "Chưa phân tích"; Driver "05/10/2026 · Face-on" "Đã phân tích" + "1 ghi chú HLV"; Sắt 7 "28/09/2026 · Down-the-line" "Đã phân tích" + "2 ghi chú HLV". Lọc "7 ngày" còn Gỗ 3, Driver.
4. **Nút nổi "Đăng swing"** (nút chính cỡ vừa, icon máy quay) góc dưới phải trên thanh tab; cuối danh sách chừa đệm.

**3. Hành động** — Segmented: Danh sách ↔ Lưới. Chip ngày: lọc. Chip sắp xếp: đảo thứ tự, đổi chữ. Thẻ / ô: `swings/[id]`. Nút nổi (có ≥ 1 swing, đã tải xong) và CTA rỗng: `swings/new` ("Đăng swing").

**4.** Không có.

**5. Trạng thái** — Tải lần đầu: header hiện, khung xương, ẩn thanh điều khiển và nút nổi · **Rỗng** (Huy): không thanh điều khiển / nút nổi; icon máy quay, "Chưa có swing nào", "Quay video swing theo hướng dẫn rồi đăng lên để nhận phân tích ước lượng và ghi chú từ HLV.", nút "Đăng swing" · **Lọc không ra**: thanh điều khiển còn, thay danh sách bằng "Không có swing nào trong 7 ngày qua." / "Không có swing nào trong 30 ngày qua." · Swing tải dở / tạm dừng / lỗi: badge tương ứng, tiến độ đứng ở số cuối; mở chi tiết thì tải chạy tiếp · Sau xoá: swing biến mất. Không có lỗi tải, 403.

**6.** Không có.

**7. A11y** — Thẻ / ô là nút; thumbnail ẩn. Chip lọc báo trạng thái chọn. Segmented là tablist. Nút nổi có chữ, không che thẻ cuối.

**8. Tham chiếu** Story `f07--b-01-danh-sach`, `f07--b-02-luoi`, `f07--danh-sach-rong`, `f07--b-03-loc-sap-xep`, `f07--danh-sach` (đủ badge), `f07--loc-7-ngay-rong`, `f07--b-15-sau-xoa`, `f13--b-02-skeleton-swing`, `f13--b-04-trong-swing`. Figma L `48:7576` · D `48:9188` · ref `48:3882`. Nguồn `app/(player)/swings.tsx` (cả `SwingTile`), `components/SwingCard.tsx`, `components/TabHeader.tsx`, `components/AppTabBar.tsx`, `lib/selectors.ts`.

**Lệch spec:** spec §4 "badge có ghi chú HLV" — Lưới không có. Lọc chỉ 7 / 30 ngày cố định, chưa chọn khoảng tuỳ ý (F07).

#### Đăng swing — `swings/new`

**1. Mục đích** — Luồng 3 bước: hướng dẫn quay → chọn video, gậy, ngày, góc → tải lên (tiến độ, tạm dừng, lỗi + thử lại), xong chọn "Phân tích ngay" / "Để sau" (xem BR-SWING-01…13). Chỉ người chơi (khác → `/`). Vào từ: tab Swing (nút nổi / CTA); `swings/[id]` "Cần xem lại" › "Quay lại hướng dẫn" (luồng đăng mới). Đi tiếp: tải xong + "Phân tích ngay" / "Để sau" → **thay** màn bằng `swings/[id]` của swing mới (quay lại từ chi tiết về danh sách); "Thêm gậy mới" → `clubs/new` (về thì gậy mới chọn sẵn); quay lại header ở mọi bước → rời màn ngay, **không hỏi**, không lùi bước.

**2. Bố cục** — Header "Đăng swing". **Stepper** ngang "Hướng dẫn quay" · "Chọn video" · "Tải lên" (đã qua có tích, hiện tại nhấn mạnh). Footer các bước cố định ở đáy, nội dung cuộn.
- **Bước 1**: minh hoạ (trang trí) khung điện thoại dọc 9:16 với khung nét đứt chứa bóng người, chú thích "Cả người và đầu gậy nằm trọn trong khung"; 4 điều kiện (icon tích, tiêu đề, chú thích): "60 fps trở lên" — "Quay 60 fps hoặc quay chậm để thấy rõ tempo và lúc chạm bóng"; "Toàn thân và đầu gậy" — "Giữ cả người và đầu gậy trong khung suốt cú swing, không cắt chân tay"; "Face-on hoặc down-the-line" — "Đặt máy ngang hông, đối diện người đánh (face-on) hoặc phía sau theo hướng bóng (down-the-line)"; "Tránh ngược sáng" — "Quay xuôi sáng, đủ tương phản để tách người và gậy khỏi nền". Footer: nút chính "Tiếp tục".
- **Bước 2**: nhãn "Video"; inline Info "Bản thử: chọn một video mẫu, chưa mở thư viện video"; thẻ radio (radiogroup "Video"), tiêu đề tên file, chú thích video "dung lượng · thời lượng · góc quay" / ảnh "dung lượng · Ảnh"; mặc định video đầu. 7 mẫu: `driver_face_on_60fps.mp4` "38 MB · 4,2 s · Face-on" (tốt) · `sat7_dtl_sang_som.mp4` "31 MB · 3,8 s · Down-the-line" (tốt) · `wedge_mang_yeu.mp4` "24 MB · 3,1 s · Face-on" (mất mạng ở 60 %) · `driver_nguoc_sang.mp4` "35 MB · 4,0 s · Face-on" ("Cần xem lại") · `pw_may_chu_ban.mp4` "27 MB · 3,4 s · Down-the-line" (phân tích lỗi ở 50 %) · `swing_4k_120fps_dai.mov` "1,5 GB · 95,0 s · Face-on" (từ chối: quá dung lượng) · `anh_tu_the_chuan_bi.jpg` "2,4 MB · Ảnh" (từ chối: không phải video). Ô "Gậy" (12.1; đã chọn "SW · Titleist Vokey SM10"). Ô "Ngày" mặc định "07/10/2026", sheet lịch (ngày sau hôm nay khoá). "Góc quay" segmented "Face-on" / "Down-the-line", mặc định theo video đang chọn (đổi video là đổi theo, vẫn sửa tay được). Footer: lỗi · 2 nút chia đôi: mức ba "Hướng dẫn" (về bước 1) | chính "Tải lên" (icon đám mây) — cố ý không có "Quay lại" để khỏi trùng header.
- **Bước 3**: thẻ tóm tắt — tên file (1 dòng); "Tên gậy · Góc quay · dd/mm/yyyy · thời lượng" ("SW · Face-on · 05/10/2026 · 3,1 s"). Khối tải: thanh tiến độ có nhãn + thông báo lỗi (khi lỗi) + một nút phụ: đang tải "Đang tải lên `N`%" / "Tạm dừng" (pause) · tạm dừng "Đã tạm dừng ở `N`%" / "Tiếp tục" (play) · lỗi (thanh màu lỗi) "Lỗi tải lên ở `N`%" + "Mất kết nối khi đang tải lên. Kiểm tra mạng rồi thử lại — video tải tiếp từ chỗ dừng." / "Thử lại" (icon vòng) · xong (thanh màu thành công) "Đã tải lên", không nút. Footer khi tải xong: chú thích "Kết quả là ước lượng từ video, không phải đo đạc" + mức ba "Để sau" | chính "Phân tích ngay" (icon ngôi sao).

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| "Tiếp tục" | bước 1 | bước 2 |
| Thẻ video hợp lệ / file lỗi (> 300 MB, không phải video) | bước 2 | chọn, góc quay đổi theo / dialog lỗi, **giữ** video đang chọn |
| "Hướng dẫn" | bước 2 | bước 1, giữ lựa chọn |
| "Tải lên" (luôn bấm được) | bước 2 | chưa chọn gậy → lỗi ô + footer; có gậy → tạo swing ("Đang tải 0%", lập tức có trong tab Swing), sang bước 3; bấm lại không tạo swing thứ hai |
| "Tạm dừng" / "Tiếp tục" / "Thử lại" | bước 3 | dừng / chạy tiếp / thử lại từ đúng chỗ dừng |
| "Phân tích ngay" / "Để sau" | tải xong | đưa phân tích vào hàng đợi rồi thay bằng `swings/[id]` ("Đang phân tích…") / thay bằng `swings/[id]` ("Chưa phân tích") |
| Quay lại (header) | mọi bước | rời màn; đang tải thì dừng ở % hiện tại, swing vẫn trong danh sách, chạy tiếp khi mở chi tiết |

Thông báo: tải xong lần đầu → mọi HLV active (chính, phụ) nhận "`Tên` vừa tải lên swing mới"; phân tích xong (thành công / cần xem lại) → người chơi nhận "Phân tích swing đã xong" (xem BR-SWING-11, 19).

**4. Trường nhập** — Video: thẻ radio, luôn có giá trị; phải `video/*` và ≤ 300 MB; lỗi bằng dialog ngay khi chạm file lỗi. Gậy: bắt buộc, gậy đang dùng của mình; dưới ô "Bắt buộc" + footer "Chưa tải lên: chọn gậy cho video này." (role alert) — sau lần bấm "Tải lên" đầu, tự mất khi chọn gậy. Ngày ≤ hôm nay, luôn có. Góc quay luôn có.

**5. Trạng thái** — Bước 1 · Bước 2 mặc định (video đầu, chưa chọn gậy, hôm nay, Face-on) · Lỗi chưa chọn gậy (viền lỗi + "Bắt buộc" + thông báo footer) · Chưa có gậy nào ("Chưa có gậy — thêm gậy mới", sheet chỉ có "Thêm gậy mới") · File bị từ chối (dialog) · Bước 3 đang tải / tạm dừng / lỗi / xong (~3 s) · Tải xong: footer "Để sau" / "Phân tích ngay" · Không phải người chơi → `/`. Không khung xương, rỗng, 403, toast.

**6.** **Dialog lỗi file** (kiểu lỗi, 1 nút; bấm nút / chạm nền đóng và giữ video đang chọn): "Video quá dung lượng" · "`tên file` nặng `1,5 GB` — tối đa 300 MB. Cắt ngắn đoạn swing hoặc quay ở 1080p rồi chọn lại." · "Chọn video khác"; "File không phải video" · "`tên file` là ảnh, không phân tích swing được. Chọn một video (.mp4, .mov)." · "Chọn video khác". Sheet "Chọn gậy" (12.1), "Chọn ngày".

**7. A11y** — Stepper đọc "Bước 1 / 3" (progressbar). Minh hoạ, thumbnail ẩn. Danh sách video radiogroup "Video". Ô Gậy combobox "Gậy, SW · Titleist Vokey SM10" / "Gậy, chưa chọn"; ô Ngày "Ngày, 07/10/2026"; Góc quay là nhóm tên "Góc quay". Lỗi footer đọc ngay.

**8. Tham chiếu** Story `f07--b-04-huong-dan`, `f07--b-07-chon-video-gay-ngay`, `f07--b-09-loi-mang`, `f07--b-05-qua-dung-luong`, `f07--b-06-khong-phai-video`, `f07--chon-gay`, `f07--loi-chua-chon-gay`, `f07--dang-tai`, `f07--b-08-tam-dung`, `f07--thu-lai-tai-xong`, `f08--b-01-tai-xong`, `f06--b-07-gay-moi-o-dang-swing`, `f13--hlv-mo-man-nguoi-choi`. Figma L `48:7756` · D `48:9203` · ref `48:3886` (chỉ bước 1). Nguồn `app/swings/new.tsx`, `components/SwingUpload.tsx`, `ClubPicker.tsx`, `SessionEntry.tsx`, `lib/simulate.ts`, `lib/validation.ts`, `lib/reducer.ts` (`addSwing`, `uploadUpdate`, thông báo `swing_uploaded`).

**Lệch spec:** §4 đủ. MVP muốn "chọn file → tiến độ → form"; code giữ hướng dẫn → chọn → tải lên (F07). 300 MB là số tạm. Chưa mở thư viện video / camera thật.

#### Chi tiết swing — `swings/[id]`

**1. Mục đích** — Xem video swing (giả lập) với thanh thời gian 4 mốc; chạy / xem phân tích ước lượng; đọc ghi chú HLV theo mốc (xem BR-SWING-12…33, 36, 38). Chủ swing: phân tích, thử lại, tải tiếp, xoá swing. HLV active (chính / phụ): xem + viết, sửa, xoá ghi chú của mình. Người theo dõi, HLV đã huỷ, người khác → 403; không tồn tại / đã xoá → "Không tìm thấy swing". Cổng quyền đứng trước mọi xử lý (người không quyền không làm job chạy được). Vào từ: tab Swing; `students/[id]` › Swing; hàng swing ở `clubs/[id]`; thẻ "Ghi chú mới từ HLV" ở Tổng quan; thông báo ghi chú / phân tích xong / tải lên mới; swing đính kèm ở `posts/[id]`; thay vào từ `swings/new`. Đi tiếp: "Gậy" → `clubs/[id]`; "Quay lại hướng dẫn" → `swings/new`; xoá xong → màn trước (không lịch sử → tab Swing).

**2. Bố cục**
1. Header: tiêu đề tên gậy ("Driver"; chưa gắn gậy: "Swing"); phụ đề nối " · ": [tên học viên — khi người xem không phải chủ] · ngày quay · góc ("05/10/2026 · Face-on" / "Nguyễn Minh Anh · 05/10/2026 · Face-on"); nút phải thùng rác (nhãn "Xoá swing") — chỉ chủ swing.
2. Hàng "Đang xoá…" (spinner) dưới header khi đang xoá swing / ghi chú.
3. **Chưa tải xong**: chỉ khối tải lên + "Video cần tải lên xong trước khi phân tích và nhận ghi chú HLV." Chủ swing: khối như bước 3 Đăng swing (nút "Tạm dừng" / "Tiếp tục" / "Thử lại"), tự chạy tiếp khi mở màn; HLV: chỉ thanh tiến độ, không nút, không chạy tiếp.
4. **Đã tải xong**:
   1. **Khung video** dọc 9:16, rộng nửa màn, căn giữa, nền tối, bóng người (giả lập). Đang dừng → nút tròn play ("Phát"); đang phát → lớp điều khiển ẩn, chạm khung để tạm dừng ("Tạm dừng"); hết → "Xem lại" (icon vòng). Góc dưới trái "vị trí / thời lượng" ("0,0 s / 4,2 s"); phát theo thời gian thực.
   2. **Thanh thời gian**: hàng chấm vàng ở vị trí ghi chú có mốc (chỉ để nhìn); thanh tiến độ có 4 vạch mốc; nhãn mốc chạm được, so le 2 hàng (tên + thời điểm): "Chuẩn bị 0,4 s", "Đỉnh 1,3 s", "Chạm bóng 1,6 s", "Kết thúc 2,7 s". Chưa có kết quả → "Phân tích xong sẽ đánh dấu 4 mốc: Chuẩn bị · Đỉnh · Chạm bóng · Kết thúc". Chưa kéo tua tự do.
   3. "Gậy" (khi có gậy): hàng chạm được ›: "Driver · TaylorMade Qi10"; chú thích "Loft 10,5° · Lie 56° · Fujikura Ventus Blue 6 · Stiff".
   4. "Phân tích" theo trạng thái job (mục 5). **Thành công**: 2 tag "Độ tin cậy 78%", "60 fps · Face-on"; 3 ô ngang "Tempo" "3,1 : 1" · "Backswing" "920" ms · "Downswing" "300" ms; nhãn "Mặt phẳng swing" + "Hơi dốc ở đầu downswing (over the top nhẹ)"; chú thích "Kết quả là ước lượng từ video, không phải đo đạc"; nhãn "Gợi ý theo mốc" + dòng (icon play + thời điểm + nội dung, chạm để tua): "1,3 s" Giữ góc cổ tay lâu hơn ở đầu downswing · "1,4 s" Hông xoay sớm hơn vai khi bắt đầu downswing · "1,6 s" Trọng tâm dồn về chân trước tốt ở impact.
   5. "Ghi chú HLV" theo mốc tăng dần: avatar (ảnh / "MT"), tên 1 dòng, meta nối " · ": "Tại `x s`" (nếu có mốc) · thời gian tương đối · "đã sửa"; nội dung. Mẫu "HLV Đỗ Minh Tuấn" — "Tại 1,3 s · 1 ngày trước" — "Đỉnh backswing đẹp, nhưng đầu downswing vai mở sớm — giữ lưng quay về mục tiêu thêm một nhịp." Ghi chú có mốc: cả hàng chạm để tua. Dưới ghi chú: chip "Tua tới `x s`" cho mỗi "[x s]" trong nội dung; tác giả thấy nút nhỏ "Sửa" (bút), "Xoá" (thùng rác). HLV khác chỉ đọc (Hà thấy ghi chú của Tuấn, không Sửa / Xoá).
5. **Ô soạn ghi chú** (footer cố định, đường kẻ; chỉ HLV, video đã tải xong): inline khi đang sửa "Đang sửa ghi chú tại `x s`" (không mốc thì bỏ "tại …") + "Huỷ sửa"; chip "Chèn mốc `x s`" (icon đồng hồ, x = vị trí đang phát, "Chèn mốc 0,0 s"); ô 1 dòng + nút gửi mũi tên ("Gửi"), placeholder "Ghi chú tại `x s`" / "Sửa ghi chú", tối đa 500 ký tự, không bộ đếm; dòng trợ giúp: xác nhận vừa gửi / lưu / xoá, hoặc xem trước "Ghi chú tại `x s`" khi gõ ghi chú mới, hoặc lỗi.

**3. Hành động**

| Phần tử | Điều kiện | Kết quả |
|---|---|---|
| Thùng rác → dialog "Xoá" | chủ swing, không đang xoá | "Đang xoá…" 0,6 s, quay lại, rồi xoá swing + mọi ghi chú + thông báo trỏ tới swing; thất bại → toast |
| Play / chạm khung / "Xem lại" | đã tải xong | phát / tạm dừng / phát lại từ 0 |
| Nhãn mốc / dòng gợi ý / hàng ghi chú có mốc | — | tạm dừng, tua tới mốc |
| Chip "Tua tới x s" | nội dung có "[x s]" | tua (quá độ dài → cuối) |
| Hàng "Gậy" | có gậy | `clubs/[id]` |
| "Phân tích swing" | chủ swing, job chưa chạy | vào hàng đợi → "Đang phân tích…" |
| "Thử lại" (Phân tích) | chủ swing, job lỗi | chạy tiếp từ % lúc lỗi |
| "Quay lại hướng dẫn" | chủ swing, "Cần xem lại" | `swings/new` |
| Nút khối tải | chủ swing, chưa tải xong | như Đăng swing |
| Chip "Chèn mốc x s" | HLV | thêm "[x s] " cuối nội dung (cách chữ trước); xoá lỗi / xác nhận cũ |
| Gửi (mũi tên / Enter) | HLV; hiện khi ô focus hoặc có chữ; khoá khi trống | mới: lưu với mốc = "[x s]" đầu tiên, không có thì vị trí đang phát (quá → cuối); ô xoá trắng, "Đã gửi ghi chú tại `x s`". Đang sửa: lưu (mốc theo "[x s]" đầu nếu có; "đã sửa" nếu chữ khác), thoát sửa, "Đã lưu ghi chú" |
| "Sửa" | tác giả, không đang xoá | chế độ sửa, nội dung đổ vào ô; nháp mới đang gõ được cất lại |
| "Huỷ sửa" | đang sửa | thoát, trả nháp cũ |
| "Xoá" → dialog "Xoá" | tác giả, không đang xoá | "Đang xoá…" 0,6 s → xoá (đang sửa đúng ghi chú đó thì thoát sửa); "Đã xoá ghi chú"; thất bại → toast |
| "Thử lại" (toast) / "Quay lại" (404 / 403) | — | chạy lại thao tác xoá / lùi một màn, không lịch sử → `/` |

Thông báo (xem BR-SWING-24): gửi ghi chú mới → chủ swing nhận "`HLV …` đã ghi chú swing của bạn" (sửa không gửi lại, xoá không thu hồi); job xong → "Phân tích swing đã xong"; tải xong ở màn này → HLV nhận "vừa tải lên swing mới".

**4. Trường nhập (ô ghi chú, HLV)** — Nhãn đọc = placeholder; chữ 1 dòng, Enter = gửi; bắt buộc, tối đa 500, trim; mốc dạng "[1,3 s]" (nhận cả "[1,3s]"), nhiều mốc được (xem BR-SWING-22, 23). Lỗi "Nhập nội dung ghi chú" khi gửi nội dung toàn khoảng trắng (trống hẳn thì nút gửi đã khoá); mất khi gõ tiếp / chèn mốc.

**5. Trạng thái**

| Trạng thái | Hiển thị |
|---|---|
| Không tìm thấy | header "Chi tiết swing"; icon tìm tệp; "Không tìm thấy swing"; "Swing này không tồn tại hoặc đã bị xoá."; "Quay lại" |
| 403 | header "Chi tiết swing"; NoAccess (người theo dõi, HLV đã huỷ) |
| Tải dở / tạm dừng / lỗi tải | khối tải + câu "Video cần tải lên xong…" (HLV: chỉ thanh) |
| Chưa phân tích | "Kết quả là ước lượng từ video, không phải đo đạc"; chủ: nút chính "Phân tích swing" (icon ngôi sao); HLV: "Học viên chưa yêu cầu phân tích swing này."; thanh thời gian: "Phân tích xong sẽ đánh dấu 4 mốc…" |
| Đang chờ / chạy | thanh tiến độ "Đang phân tích… thường mất dưới 1 phút" (~3 s); job chỉ chạy khi màn mở (chủ hoặc HLV), rời thì dừng, mở lại chạy tiếp; danh sách vẫn "Đang phân tích" |
| Lỗi (mẫu `pw_may_chu_ban.mp4`, 50 %) | thông báo đỏ "Phân tích chưa thành công. Video vẫn được giữ — thử lại sau ít phút." + (chủ) "Thử lại" |
| Cần xem lại (mẫu `driver_nguoc_sang.mp4`) | dải vàng toàn ngang "Video chưa đủ rõ — thử quay lại theo hướng dẫn"; tag "Độ tin cậy 41%", "60 fps · Face-on"; (chủ) "Quay lại hướng dẫn"; **không** tempo / mặt phẳng / gợi ý; thanh vẫn có 4 mốc |
| Thành công | như mục 2 |
| Ghi chú rỗng | HLV: "Chưa có ghi chú. Tua tới mốc cần nhận xét, bấm Chèn mốc rồi viết ghi chú ở dưới." · người chơi: "Chưa có ghi chú từ HLV." |
| Có ghi chú | mẫu Sắt 7: "Tại 1,3 s · 28/09/2026", "Tại 1,6 s · 28/09/2026" |
| HLV đang soạn / vừa gửi, lưu, xoá / đang sửa | trợ giúp "Ghi chú tại `x s`" (theo mốc đầu trong chữ hoặc vị trí phát) / "Đã gửi ghi chú tại `x s`", "Đã lưu ghi chú", "Đã xoá ghi chú" / inline "Đang sửa…" + "Huỷ sửa", placeholder "Sửa ghi chú", không xem trước mốc |
| Lỗi ghi chú trống | viền lỗi + "Nhập nội dung ghi chú" |
| Đang xoá / xoá thất bại | hàng "Đang xoá…", Sửa / Xoá khoá / toast |
| Theo vai | chủ: thùng rác, phân tích / thử lại / quay lại hướng dẫn, nút tải, không ô soạn; HLV: phụ đề có tên học viên, ô soạn, Sửa / Xoá chỉ ghi chú của mình, không phân tích / xoá / tải |

Không có khung xương.

**6.** Dialog "Xoá swing này?" · có ghi chú: "Video, kết quả phân tích và `N` ghi chú HLV sẽ bị xoá, không khôi phục được." / chưa có: "Video và kết quả phân tích sẽ bị xoá, không khôi phục được." · "Huỷ" / "Xoá". Dialog "Xoá ghi chú này?" · "Học viên sẽ không còn thấy ghi chú này. Không khôi phục được." · "Huỷ" / "Xoá". Toast lỗi "Xoá thất bại" · "Mất kết nối — swing vẫn còn." / "Mất kết nối — ghi chú vẫn còn." · "Thử lại". Gửi / lưu / xoá ghi chú thành công **không dùng toast** (xác nhận ở dòng trợ giúp, được đọc to).

**7. A11y** — Nhãn mốc là nút "Đỉnh, 1,3 s", gợi ý "Tua video tới mốc này"; dòng gợi ý đọc "1,3 s: `nội dung`"; hàng ghi chú có mốc "`Tác giả`, `meta`: `nội dung`" (cùng gợi ý). Chấm ghi chú, vạch mốc ẩn với trình đọc — giữ đường tua bằng nhãn mốc, gợi ý, chip "Tua tới". Nút Sửa / Xoá có nhãn riêng "Sửa ghi chú `meta`: `30 ký tự đầu`" / "Xoá ghi chú …". Thùng rác "Xoá swing"; play "Phát"; vùng tạm dừng "Tạm dừng". Ô chỉ số đọc gộp "Tempo, 3,1 : 1", "Backswing, 920 ms". Xác nhận / lỗi ô ghi chú được announce (dòng trợ giúp không là live region). `KeyboardAvoid` cho ô soạn. Không lồng nút trong nút: hàng Sửa / Xoá / Tua tới nằm **ngoài** vùng chạm ghi chú.

**8. Tham chiếu** Story `f07--b-11-phan-tich-xong`, `f08--b-08-da-gui`, `f07--chi-tiet-chua-phan-tich`; phân tích `f07--b-10-dang-phan-tich`, `f07--b-12-tua-theo-tip`, `f07--b-16-can-xem-lai`, `f07--b-17-phan-tich-loi`, `f08--b-02-phan-tich-xong`; tải / xoá `f07--chi-tiet-tai-do`, `f07--b-14-xoa-swing`, `f07--da-xoa`; ghi chú `f08--b-06-workspace`, `f08--b-07-chen-moc`, `f08--b-09-dang-sua`, `f08--b-10-xoa-ghi-chu`, `f08--b-11-sau-xoa`, `f08--b-13-ha-xem-ghi-chu`, `f08--b-15-tua-theo-moc`, `f08--chua-co-ghi-chu`, `f08--dang-viet`, `f08--loi-trong`; 403 `f08--khong-co-quyen`, `f09--b-12-403-swing`; khác `f11--b-02-ghi-chu-den-swing`, `f13--xoa-swing-that-bai`, `f13--xoa-ghi-chu-that-bai`. Figma pilot L `26:127` · D `26:424`. Nguồn `app/swings/[id].tsx`, `components/SwingUpload.tsx`, `StatTile.tsx`, `Feedback.tsx`, `NoAccess.tsx`, `useOnLeave.ts`, `lib/simulate.ts`, `lib/format.ts`, `lib/reducer.ts`, `packages/ds/src/ui/PostCard/PostCard.tsx`, `packages/ds/src/ui/TextField/MessageInput.tsx`.

**Lệch spec:** §4 đủ. Video là khung giả lập; thanh thời gian chưa kéo tua tự do, chỉ tua tới mốc / gợi ý / ghi chú (gap S3 §3, F07). "Cần xem lại" không hiện chỉ số dù đã có kết quả.

### 12.5 HLV & kết nối

Route: `(coach)/roster`, `students/[id]`, `(coach)/me`, `(player)/coach`, `connect/invite`, `connect/accept`, `coaches/[id]`. Figma: trang "Thiết kế · HLV & học viên" `48:1107`; Học viên là pilot (`26:229` / `26:466`). Mô hình kết nối (pending / active / revoked / declined; mã mời → active ngay; lời mời / yêu cầu trong app → pending; tối đa 1 kết nối mở mỗi cặp; HLV chính / phụ, không tự đôn; chặn đóng lời mời chờ, mã của người chặn báo "Mã không tồn tại") ở §5.2 và §6.2–6.3. **Mọi thao tác kết nối ghi ngay** (duyệt, từ chối, huỷ, tạo / thu hồi mã, chấp nhận, đặt HLV chính, gửi lời mời): không đang xử lý / lỗi / thử lại, cờ Dev không ảnh hưởng (BR-CAIDAT-26). Toast trong nhóm đều là thành công.

#### Học viên (tab của HLV) — `(coach)/roster`

**1. Mục đích** — Trang nhà của HLV kiêm danh sách học viên: thấy ai cần phản hồi swing, xử lý lời mời / yêu cầu, đi mời học viên (xem BR-KETNOI-16…18, 35, 36). Chỉ HLV (người chơi → Tổng quan). Danh sách gồm học viên **active**; người trong mục Lời mời chưa kết nối chỉ mở được hồ sơ công khai. Vào từ: `/` khi là HLV; tab "Học viên"; thông báo "<Người chơi> muốn kết nối với bạn" → mở sẵn mục **Lời mời** (`?seg=loi-moi`, kể cả khi tab đang mở); quay lại từ `students/[id]`, `connect/invite`; Dev › F4 / F9. Đi tiếp: `students/[id]`; `users/[id]` (người trong Yêu cầu / Lời mời đã gửi); `connect/invite` ("Mời học viên" hoặc chạm mã → `?code=`); `people` (số theo dõi).

**2. Bố cục** (một vùng cuộn)
1. TabHeader logo (không tiêu đề chữ).
2. **Thẻ hero HLV** (nền nhấn): avatar lớn (ảnh / "MT"); tên tối đa 2 dòng; học viện ("GramGolf Academy Hà Nội", nếu có); ★ "4,9" (nếu có); hàng số: "Học viên" "2" (không bấm được), "Người theo dõi" "1", "Đang theo dõi" "1" (bấm được). Hero **không** có huy hiệu xác minh, số năm, học phí (ở tab Hồ sơ).
3. **Bộ lọc** segmented: "Tất cả" · "Cần phản hồi" (badge số **học viên** có swing chờ phản hồi, khi > 0) · "Lời mời" (badge = mã đang chờ + yêu cầu đến + lời mời đã gửi, khi > 0). Mẫu Tuấn: 1 / 1. Bộ lọc cố ý đặt **trên** ô tìm (ô tìm ẩn ở Lời mời, đặt trên thì bộ lọc không nhảy dưới ngón tay).
4. **Ô tìm** "Tìm học viên": chỉ ở Tất cả / Cần phản hồi và khi có ≥ 1 học viên; chữ giữ khi đổi mục.
5. **Tất cả / Cần phản hồi** — Cần phản hồi = có ≥ 1 swing **đã phân tích** mà chính HLV này **chưa ghi chú** (ghi chú HLV khác không tính). Lọc tên khớp một phần, bỏ dấu, không phân biệt hoa thường ("lan" → "Trần Thu Lan", "dang" → "Đăng"). Thứ tự theo lúc tạo kết nối (không sắp theo tên / hoạt động), không giới hạn. Hàng: avatar; tên; caption `Handicap <n>` · `Swing mới <thời gian tương đối>` ("Chưa có swing" nếu chưa có; không handicap thì bỏ cụm đầu); phải: **badge cảnh báo "Cần phản hồi"** (cả ở mục Tất cả) + ›. Mẫu: "Nguyễn Minh Anh — Handicap 14 · Swing mới 21 giờ trước"; "Trần Thu Lan — Handicap 22 · Swing mới 1 ngày trước" + badge.
6. **Lời mời** — 3 khối, hai danh sách đầu mới → cũ:
   - "Yêu cầu từ học viên" (khi có), chú thích "Duyệt thì bạn xem được dữ liệu và ghi chú swing cho học viên"; hàng: avatar, tên, `Muốn kết nối · <thời gian> · bạn sẽ là HLV chính | bạn sẽ là HLV phụ` (theo việc người chơi **hiện** có HLV chính chưa), ›; dưới hàng nút nhỏ "Duyệt" (chính, icon người-tích) và "Từ chối" (mức ba). Mẫu Hà: "Phạm Quốc Huy — Muốn kết nối · 5 giờ trước · bạn sẽ là HLV chính".
   - "Lời mời đã gửi" (khi có), chú thích "Chờ học viên chấp nhận ở tab HLV"; hàng `Bạn mời · <thời gian> · chờ học viên trả lời`, ›; nút nhỏ "Huỷ lời mời" (mức ba).
   - "Mã mời đang chờ" (luôn hiện; có mã thì chú thích "Mã còn hạn, chưa có học viên dùng — chạm để sao chép hoặc chia sẻ lại"): mỗi mã còn hạn, chưa dùng, chưa thu hồi: icon vé, mã "TUAN24", `Còn 6 ngày · tạo 07/10/2026`, ›. Không có: "Chưa có mã mời nào đang chờ."
   - Cuối mục nút chính "Mời học viên" (icon người-cộng).

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Số theo dõi | `people`, tab tương ứng của HLV này |
| Bộ lọc | đổi mục; không reset ô tìm |
| Ô tìm, nút × | lọc theo từng phím; × xoá chữ |
| Hàng học viên | `students/<id>`, tab Tổng quan |
| Hàng Yêu cầu / Lời mời đã gửi | `users/<id>` |
| "Duyệt" | active (chính / phụ theo luật), học viên vào Tất cả; toast "Đã duyệt <tên>"; người chơi nhận "<HLV> đã duyệt yêu cầu kết nối của bạn" (→ tab HLV) |
| "Từ chối" | declined, hàng biến mất; toast "Đã từ chối yêu cầu của <tên>"; người gửi **không** nhận thông báo |
| "Huỷ lời mời" | revoked, hàng biến mất; toast "Đã huỷ lời mời gửi <tên>"; không thông báo; thông báo "mời bạn kết nối" người chơi đã nhận vẫn còn |
| Hàng mã | `connect/invite?code=<mã>` (thẻ mã hiện sẵn để sao chép / chia sẻ lại) |
| "Mời học viên" (cuối Lời mời / CTA rỗng) | `connect/invite` |

Mọi thao tác **không xác nhận**, kể cả "Từ chối", "Huỷ lời mời".

**4. Trường nhập** — Ô tìm: không nhãn hiện (nhãn đọc = placeholder "Tìm học viên"), Enter là "Tìm", không bắt buộc, trim; không có lỗi (không khớp → trạng thái tìm không thấy).

**5. Trạng thái**
- Có dữ liệu (`f04--b-01-roster`). **Tải lần đầu**: hero, bộ lọc, ô tìm hiện; khung xương ở **mọi mục**.
- **Chưa có học viên** (Tất cả và Cần phản hồi): EmptyState icon nhóm người, "Chưa có học viên", "Tạo mã mời rồi gửi cho học viên — kết nối xong bạn xem được thông số, swing, bộ gậy và thể lực của họ.", nút "Mời học viên"; ô tìm ẩn.
- **Cần phản hồi rỗng** (có học viên): dòng phụ "Không có học viên nào cần phản hồi. Swing phân tích xong mà bạn chưa ghi chú sẽ hiện ở đây."
- **Tìm không thấy**: "Không tìm thấy học viên nào tên “<chữ đã gõ>”."
- **Lời mời rỗng**: chỉ khối mã với "Chưa có mã mời nào đang chờ." + nút "Mời học viên"; badge "Lời mời" ẩn. Có dữ liệu: `f04--b-13-hlv-duyet` (Tuấn có yêu cầu của Khoa "bạn sẽ là HLV phụ" + một mã), `f04--loi-moi-da-gui`.
- Không lỗi / thử lại / 403 / 404 (sai vai thì chuyển hướng). Biến thể: thiếu học viện / đánh giá thì bỏ dòng; HLV Hà: ★ 4,7, 2 học viên (Khoa, Minh Anh), Minh Anh có "Cần phản hồi" (2 swing đã phân tích Hà chưa ghi chú), Lời mời badge 1 (yêu cầu của Huy).

**6.** Không dialog / sheet; toast như mục 3.

**7. A11y** — Nút có tên người: "Duyệt yêu cầu của <tên>", "Từ chối yêu cầu của <tên>", "Huỷ lời mời gửi <tên>" (nhiều nút cùng chữ). Hàng mã đọc **đánh vần**: "Mã mời T U A N 2 4, còn 6 ngày, tạo 07/10/2026". Hero: avatar "Ảnh đại diện <tên>", "Đánh giá 4,9 trên 5", "2 Học viên", "Người theo dõi: 1" (nút, nới vùng chạm). Avatar trong hàng ẩn. Bộ lọc tablist / tab. Ô tìm nhãn "Tìm học viên", nút xoá "Xoá nội dung". Hàng có badge: caption chỉ xuống dòng ở " · ".

**8. Tham chiếu** Story `f04--b-01-roster`, `f04--b-13-hlv-duyet`, `f09--chua-co-hoc-vien`, `f09--b-01-tim`, `f09--tim-khong-thay`, `f09--b-02-can-phan-hoi`, `f09--can-phan-hoi-rong`, `f04--loi-moi-trong`, `f04--loi-moi-da-gui`, `f13--dang-tai-hoc-vien`, `f04--b-02-loi-moi`, `f04--b-21-ha-yeu-cau-mau`, `f02--b-05-hoc-vien-trong`, `f02--hoc-vien-loi-moi-dang-cho`, `f09--danh-sach`, `f09--loi-moi`, `f09--loi-moi-rong`, `f08--b-04-can-phan-hoi`, `f11--b-12-yeu-cau-den-loi-moi`. Figma pilot L `26:229` · D `26:466`. Nguồn `app/(coach)/roster.tsx`; `components/TabHeader.tsx`, `People.tsx`, `Section.tsx`, `ListSkeleton.tsx`, `Feedback.tsx`; `lib/selectors.ts`, `lib/reducer.ts`.

**Lệch spec:** spec §4 gọi bộ lọc thứ ba "Chờ chấp nhận" — code đặt "Lời mời" và gộp 3 loại. Spec "CTA mời" — chỉ có ở trạng thái rỗng và cuối Lời mời; đã có học viên thì mục Tất cả **không** có lối mời. CLAUDE.md đòi đang tải / lỗi / thử lại cho lưu / xoá — Duyệt / Từ chối / Huỷ lời mời ghi ngay.

#### Chi tiết học viên — `students/[id]`

**1. Mục đích** — HLV xem toàn bộ dữ liệu riêng của một học viên, chỉ đọc (chỉ số, xu hướng, phiên, swing, bộ gậy, thể lực), vào swing để ghi chú, và huỷ kết nối (xem BR-KETNOI-25…29, 37). Nội dung chỉ khi `canViewPrivate` (HLV active hoặc chính người chơi); người theo dõi, HLV khác, HLV đã bị huỷ, HLV mới có lời mời chờ → 403; id không có hoặc là id HLV → 404. Số theo **đơn vị của người xem**. Vào từ: hàng học viên ở Học viên; thông báo "<Người chơi> đã chấp nhận lời mời"; "Xem dữ liệu học viên" ở `users/[id]`; link. Đi tiếp: `metrics/[id]` (chỉ đọc), `swings/[id]` (ghi chú, chèn mốc), `clubs/[id]` (chỉ đọc); huỷ kết nối → màn thành 403 tại chỗ.

**2. Bố cục**
1. StackHeader tiêu đề "Học viên" (không phải tên); phải: icon người-trừ (Huỷ kết nối) — chỉ khi người xem là HLV.
2. **Khối danh tính**: avatar lớn; tên tối đa 2 dòng; `Handicap <n> · <CLB / sân tập>` (bỏ phần trống) — "Handicap 14 · Sân tập Mỹ Đình".
3. **Thanh tab 5 mục** cuộn ngang: **Tổng quan · Thông số · Swing · Bộ gậy · Thể lực**. "Swing" có badge = số swing chờ **HLV này** phản hồi (khi > 0; Hà xem Minh Anh "2", Tuấn xem Minh Anh không, Tuấn xem Lan "1"). Chiều cao cố định; mở màn luôn vào Tổng quan; đổi tab thì cuộn về đầu.
4. **Nội dung tab** (cuộn):
   - **Tổng quan**: "Chỉ số swing gần nhất" (2×2, chênh lệch, chú thích so sánh) và "Xu hướng tốc độ đầu gậy (Driver, 5 buổi)" như B1–B2 Tổng quan người chơi (12.3); caption thêm nguồn: "Gỗ 3 · 05/10/2026 · Nhập tay". Mẫu Minh Anh: 97 mph (+1 mph), 140 mph (+1 mph), 1,44 (-0,01), 198 m (+5 m).
   - **Thông số**: phiên swing mới → cũ (thể lực ở tab Thể lực), không giới hạn; hàng `<ngày> · <gậy>` (không gậy: "Chưa gắn gậy"), caption `<tốc độ đầu gậy> · <carry>`, tag nguồn + ›. Mẫu "05/10/2026 · Gỗ 3 — 97 mph · 198 m — [Nhập tay]"; "03/10/2026 · Sắt 7 — 85 mph · 145 m — [Ảnh]"; "30/09/2026 · Driver — 104 mph · 229 m — [CSV]".
   - **Swing** (HLV xem): bộ lọc "Chưa review" (HLV này chưa ghi chú, kể cả chưa phân tích / đang tải) / "Đã review", hai badge luôn hiện kể cả "0" (Tuấn xem Minh Anh: 1 / 2); dòng "Chạm một swing để xem phân tích, chèn mốc và ghi chú."; thẻ swing mới → cũ như tab Swing (12.4, kiểu Danh sách): thumbnail 9:16 + play (chưa có ảnh trích từ video), tên gậy / "Chưa gắn gậy", `<ngày> · <góc quay>`, badge trạng thái, "<n> ghi chú HLV" (ghi chú của **mọi** HLV), **badge cảnh báo "Cần phản hồi"** (đã phân tích, HLV này chưa ghi chú). Bộ lọc giữ khi đổi tab rồi quay lại; rời màn thì về "Chưa review".
   - **Bộ gậy**: `ClubGrid` gậy **đang dùng** như 12.4 (Minh Anh 8 gậy).
   - **Thể lực**: "Thể lực gần nhất", caption "04/10/2026 · Nhập tay", 4 ô 2×2 **không** chênh lệch: "Cân nặng" 72,0 kg · "Độ dẻo" 7 /10 · "Lực nắm" 45 kg · "Bật cao" 48 cm; "Lịch sử" caption "2 phiên": hàng ngày + "Cân nặng 72,0 kg · Độ dẻo 7/10 · Lực nắm 45 kg · Bật cao 48 cm" + tag nguồn + ›.

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Người-trừ (HLV active) → Dialog "Huỷ kết nối" | revoked; học viên mất HLV chính nếu đây là chính; màn **vẽ lại ngay** thành 403 "Kết nối … đã bị huỷ"; không toast; học viên **không** nhận thông báo |
| "Giữ kết nối" / chạm nền | đóng dialog |
| Tab / bộ lọc review | đổi nội dung (tab cuộn về đầu) |
| Hàng phiên / thẻ swing / thẻ gậy | `metrics/<id>` chỉ đọc / `swings/<id>` / `clubs/<id>` chỉ đọc |
| "Quay lại" (403 / 404) | màn trước hoặc `/` |

**4.** Không có.

**5. Trạng thái**
- Mặc định Tổng quan (`f09--b-03-tong-quan`). **Tải lần đầu** (mỗi học viên một lần trong phiên): header, danh tính, thanh tab hiện; khung xương thay nội dung.
- **Rỗng theo tab** — dòng chữ phụ, không icon / nút: Tổng quan / Thông số "Học viên chưa có phiên số liệu swing nào (nhập tay, CSV, ảnh). Video swing ở tab Swing." · Swing (không có swing, bộ lọc ẩn) "Học viên chưa đăng swing nào." · Chưa review rỗng "Không còn swing nào chờ bạn review." · Đã review rỗng "Bạn chưa ghi chú swing nào của học viên này." · Bộ gậy "Học viên chưa thêm gậy nào." · Thể lực "Học viên chưa có phiên thể lực nào."
- **403**: header "Học viên" chỉ có quay lại; NoAccess, mô tả đổi thành "Kết nối với học viên này đã bị huỷ nên bạn không còn xem được dữ liệu của họ." nếu HLV **từng** active với học viên này (xem BR-CAIDAT-22).
- **404**: header "Học viên"; icon tìm tài liệu; "Không tìm thấy học viên"; "Học viên này không tồn tại."; "Quay lại".
- **Người chơi tự mở `students/<chính mình>`** (chỉ qua link): đủ 5 tab, **không** nút huỷ; tab Swing không bộ lọc review, không badge "Cần phản hồi".
- Biến thể dữ liệu: thiếu handicap / CLB → dòng phụ ngắn lại hoặc rỗng; Lan qua Tuấn: Tổng quan, Thông số rỗng; Swing badge 1, thẻ "Chưa gắn gậy · 06/10/2026 · Face-on · Đã phân tích · Cần phản hồi". Không đang xử lý / lỗi.

**6.** Dialog cảnh báo "Huỷ kết nối với <tên học viên>?" · "Bạn sẽ mất quyền xem thông số, swing, bộ gậy và thể lực của học viên ngay lập tức. Ghi chú đã gửi vẫn được giữ." · "Huỷ kết nối" (nguy hiểm) / "Giữ kết nối". Không toast.

**7. A11y** — Người-trừ đọc "Huỷ kết nối với <tên>" — thao tác nguy hiểm duy nhất, nên có nhãn rõ chứ không chỉ icon. Ô chỉ số và biểu đồ đọc như Tổng quan (12.3); màu tốt / kém kèm dấu +/-. Tiêu đề mục, tên nhóm gậy role header. Thanh tab, bộ lọc tablist / tab. Avatar ẩn. Thanh 5 tab + badge phải cuộn ngang ở 390 px, hoặc thiết kế lại cho vừa.

**8. Tham chiếu** Story `f09--b-03-tong-quan`, `f09--b-06-swing`, `f09--b-11-403-da-huy`, `f09--b-04-thong-so`, `f09--b-07-bo-gay`, `f09--b-09-the-luc`, `f09--tong-quan-rong`, `f09--swing-can-phan-hoi`, `f09--b-10-403-nguoi-theo-doi`, `f09--b-13-404-hoc-vien`, `f04--b-29-hlv-huy-ket-noi`, `f13--dang-tai-chi-tiet-hoc-vien`, `f04--b-10-chi-tiet-hoc-vien`, `f04--b-28-ha-mat-quyen-403`, `f04--b-30-mat-quyen-403`, `f08--b-05-swing-chua-review`, `f08--b-12-ha-chua-review`, `f08--b-16-da-review`, `f08--b-17-chua-review`, `f08--da-review-rong`, `f11--b-11-chap-nhan-den-hoc-vien`, `f13--b-13-403`. Figma L `48:4336` · D `48:5103` (Tổng quan). Nguồn `app/students/[id].tsx`; `components/StatTile.tsx`, `charts/TrendChart.tsx`, `SessionRow.tsx`, `SwingCard.tsx`, `NoAccess.tsx`, `ListSkeleton.tsx`, `app/clubs/index.tsx`; `lib/format.ts`, `lib/selectors.ts`, `lib/validation.ts`.

**Lệch spec:** spec §4 đòi EmptyState của DS cho màn danh sách — rỗng theo tab ở đây là dòng chữ phụ, không CTA. Huỷ kết nối không có đang xử lý / lỗi / thử lại.

#### Hồ sơ (tab của HLV) — `(coach)/me`

**1. Mục đích** — HLV xem hồ sơ công khai của chính mình (như người khác thấy ở `coaches/[id]`), đi sửa hồ sơ, cài đặt, quản lý bài đã đăng. Chỉ HLV. Vào từ: tab "Hồ sơ". Đi tiếp: `settings/account`, `settings`, `people`, `posts/[id]`, `coaches/<chính mình>` (tên tác giả trên bài).

**2. Bố cục** — TabHeader tiêu đề "Hồ sơ" (không logo); avatar header mở `profile` — **màn khác** với tab này.
1. **Tóm tắt HLV** (`CoachSummary`): avatar lớn, tên tối đa 2 dòng, badge "Đã xác minh" (icon tích, nếu có), học viện; hàng số (thiếu thì bỏ): ★ "4,9" "Đánh giá" · "12 năm" "Kinh nghiệm" · "450.000 đ/giờ" "Học phí".
2. **Giới thiệu** (nếu có): "Chuyên swing cơ bản và tempo cho người mới."
3. Số theo dõi "Người theo dõi" / "Đang theo dõi" (bấm được).
4. Hai nút cạnh nhau: "Chỉnh sửa hồ sơ" (phụ, icon bút) · "Cài đặt" (mức ba, icon bánh răng).
5. "Bài đăng", caption "<n> bài" ("2 bài"), mới → cũ, không giới hạn; thẻ bài rút gọn (12.6). Mẫu: "3 bài tập giữ tempo 3:1 cho driver — 20 giờ trước — #driver #tempo — ♥ 2 · 💬 1"; "Khởi động 10 phút trước buổi tập — 6 ngày trước — #thể lực".

**3. Hành động** — "Chỉnh sửa hồ sơ" → `settings/account`; "Cài đặt" → `settings`; số theo dõi → `people` tab tương ứng; thẻ bài theo 12.6 (tên tác giả → `coaches/<chính mình>`; tự thích bài mình không sinh thông báo; Chia sẻ → sheet "Chia sẻ bài viết").

**4.** Không có (ô trong sheet chia sẻ: 12.6).

**5. Trạng thái** — Mặc định · **Chưa có bài**: mục không caption, dòng phụ "Chưa có bài đăng.", không có nút đăng bài · HLV mới (F02 "Ngô Bảo Châu", 6 năm) không đánh giá / học phí → hàng số chỉ còn mục có dữ liệu; không giới thiệu → bỏ khối · Toast "Đã sao chép bài viết để gửi" sau "Gửi" trong sheet chia sẻ. Không khung xương, lỗi, 403, 404.

**6.** Sheet "Chia sẻ bài viết" (12.6).

**7. A11y** — Số tóm tắt đọc gộp: "Đánh giá 4,9 trên 5", "12 năm kinh nghiệm", "Học phí 450.000 đ mỗi giờ". Thẻ bài như 12.6.

**8. Tham chiếu** Story `f12--b-12-ho-so-hlv-moi`, `f02--b-07-ho-so-hlv` (HLV mới). Figma L `48:4500` · D `48:5147` (bio trong frame theo ảnh F12, khác mock). Nguồn `app/(coach)/me.tsx`, `components/CoachSummary.tsx`, `People.tsx`, `PostItem.tsx`.

**Ghi chú thiết kế lại:** HLV có **hai** màn hồ sơ trùng chức năng: tab này và `profile` (từ avatar header, có badge "Huấn luyện viên" và Đăng xuất). Spec §4 (me: CLB, kinh nghiệm, đơn giá, rating, bài đã đăng, sửa hồ sơ) khớp code; CLB ở đây là "học viện".

#### HLV (tab của người chơi) — `(player)/coach`

**1. Mục đích** — Người chơi quản lý HLV: xem HLV chính / khác, trả lời lời mời, theo dõi / huỷ yêu cầu đã gửi, đổi HLV chính, huỷ kết nối, nhập mã, hiểu HLV xem được gì (xem BR-KETNOI-17…24). Chỉ người chơi. Vào từ: tab "HLV"; thông báo "<HLV> mời bạn kết nối", "<HLV> đã duyệt yêu cầu kết nối của bạn"; Tổng quan › "Chưa có HLV chính · Chọn HLV chính ở tab HLV"; cuối `connect/accept`. Đi tiếp: `coaches/[id]`; `connect/accept`; `(player)/community` tab Khám phá ("Tìm HLV").

**2. Bố cục** — TabHeader tiêu đề "HLV".
1. "Lời mời từ HLV" (khi có), chú thích "Nhận lời thì HLV xem được thông số, swing, bộ gậy và thể lực của bạn"; hàng: avatar, tên HLV, `Mời bạn kết nối · <thời gian> · nhận lời → HLV chính | HLV phụ`, ›; dưới: "Chấp nhận" (chính nhỏ, icon người-tích), "Từ chối" (mức ba).
2. "Yêu cầu đã gửi" (khi có), chú thích "Chờ HLV duyệt"; hàng `Bạn gửi yêu cầu · <thời gian> · chờ HLV duyệt`; dưới: "Huỷ yêu cầu" (mức ba). Mẫu Huy: "HLV Vũ Thanh Hà — Bạn gửi yêu cầu · 5 giờ trước · chờ HLV duyệt". Hai danh sách mới → cũ.
3. Chưa có HLV active → EmptyState (mục 5). Có thì:
   - **a) "HLV chính"**: thẻ viền — tóm tắt HLV (avatar, tên, "Đã xác minh", học viện, ★ đánh giá · kinh nghiệm · học phí), "Kết nối từ 05/06/2026", hai nút "Xem hồ sơ" (phụ) · "Huỷ kết nối" (mức ba). Chưa có chính (đã huỷ, còn phụ): InlineMessage Info "Chưa có HLV chính. Chọn “Đặt làm HLV chính” ở một HLV bên dưới."
   - **b) "HLV khác"** (khi có), chú thích "Cũng xem được dữ liệu và ghi chú swing cho bạn"; hàng: avatar, tên, `<học viện> · Kết nối từ <ngày>`, ›; dưới: "Đặt làm HLV chính" (phụ nhỏ, icon sao) · "Huỷ kết nối" (mức ba). Mẫu Minh Anh: "HLV Vũ Thanh Hà — Saigon Golf Lab · Kết nối từ 21/08/2026". "Kết nối từ" = ngày chấp nhận (không có thì ngày mời).
   - **c)** Nút phụ rộng "Nhập mã mời" (icon chìa khoá). **d)** Dòng phụ "Hoặc tìm HLV ở Cộng đồng › Khám phá rồi gửi yêu cầu kết nối từ hồ sơ HLV."
4. **Accordion "HLV xem được gì?"** (luôn hiện, mặc định thu gọn; nằm dưới thanh tab, phải cuộn): "HLV đã kết nối (chính và khác) xem được:" + 4 dòng có icon "Thông số swing của mọi buổi tập" · "Video swing, kết quả phân tích — và ghi chú cho bạn theo mốc thời gian" · "Bộ gậy và thông số từng gậy" · "Chỉ số thể lực"; dòng icon mắt gạch "Người theo dõi bạn **không** xem được những dữ liệu này — họ chỉ thấy hồ sơ công khai và bài đăng." ("không" đậm); dòng phụ "Huỷ kết nối bất cứ lúc nào: HLV mất quyền xem ngay, ghi chú cũ vẫn được giữ."

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Hàng lời mời / yêu cầu / HLV khác, "Xem hồ sơ" | `coaches/<id>` |
| "Chấp nhận" | active (chính nếu chưa có chính, ngược lại phụ); toast "Đã kết nối với <tên> — HLV chính" / "… — HLV phụ"; HLV nhận "<người chơi> đã chấp nhận lời mời" |
| "Từ chối" | declined, hàng biến mất; toast "Đã từ chối lời mời của <tên>"; HLV không nhận thông báo |
| "Huỷ yêu cầu" | revoked, không xác nhận; toast "Đã huỷ yêu cầu gửi <tên>" |
| "Đặt làm HLV chính" | HLV này thành chính, chính cũ xuống "HLV khác"; toast "Đã đặt <tên> làm HLV chính"; không thông báo |
| "Huỷ kết nối" → Dialog "Huỷ kết nối" | revoked, HLV biến khỏi danh sách, mất quyền ngay; huỷ chính → InlineMessage; huỷ HLV cuối → EmptyState; toast "Đã huỷ kết nối với <tên>"; HLV không nhận thông báo |
| "Giữ kết nối" | đóng dialog |
| "Nhập mã mời" (nút / EmptyState) / "Tìm HLV" (EmptyState) | `connect/accept` / `(player)/community?tab=kham-pha` |
| Accordion | mở / thu |

**4.** Không có.

**5. Trạng thái** — Có HLV chính + khác (`f04--tab-hlv`) · **Chưa kết nối HLV nào**: EmptyState icon người-tích, "Chưa kết nối HLV", "Nhập mã mời HLV gửi cho bạn để HLV xem thông số, swing, bộ gậy và góp ý cho bạn.", chính "Nhập mã mời", phụ "Tìm HLV"; khối Lời mời / Yêu cầu (nếu có) vẫn ở **trên**, accordion vẫn ở dưới (`f04--tab-hlv-chua-ket-noi`) · Có lời mời đến (`f04--b-07-tab-hlv-loi-moi`) · Đã huỷ HLV chính, còn phụ (`f04--da-huy-hlv-chinh`). Không khung xương, lỗi, 403, 404.

**6.** Dialog cảnh báo "Huỷ kết nối với <tên HLV>?" · "HLV sẽ mất quyền xem dữ liệu của bạn ngay lập tức. Lịch sử ghi chú vẫn được giữ." · "Huỷ kết nối" (nguy hiểm) / "Giữ kết nối"; tiêu đề giữ tên HLV trong lúc dialog mờ dần khi đóng. Toast như mục 3.

**7. A11y** — Nhãn nút có tên HLV: "Chấp nhận lời mời của <tên>", "Từ chối lời mời của <tên>", "Huỷ yêu cầu kết nối với <tên>", "Xem hồ sơ <tên>", "Huỷ kết nối với <tên>", "Đặt <tên> làm HLV chính". Accordion đọc mở / thu. "Đặt làm HLV chính" và "Huỷ kết nối" là **nút hiện thẳng**, không gom vào menu ⋯ vì trên iOS không mở được Dialog ngay khi sheet / Modal khác đang đóng — làm menu phải tính giới hạn này. Chừa đáy đủ để cuộn qua thanh tab nổi.

**8. Tham chiếu** Story `f04--tab-hlv`, `f04--b-07-tab-hlv-loi-moi`, `f04--tab-hlv-chua-ket-noi`, `f04--huy-ket-noi-dialog`, `f04--da-huy-hlv-chinh`, `f04--b-08-da-ket-noi` (toast), `f04--b-15-doi-hlv-chinh`, `f04--b-23-hai-hlv`, `f04--b-26-hoc-vien-huy`, `f04--tu-choi-loi-moi`. Figma L `48:2283` · D `48:5019` (accordion là component local `48:1127`, thu gọn). Nguồn `app/(player)/coach.tsx`; `components/CoachSummary.tsx`, `Section.tsx`, `Feedback.tsx`; `lib/selectors.ts`, `lib/reducer.ts`.

**Lệch spec:** thao tác ghi không có đang xử lý / lỗi / thử lại.

#### Mời học viên — `connect/invite`

**1. Mục đích** — HLV tạo **mã mời 6 ký tự** + link, hạn **7 ngày**, chia sẻ / sao chép; gửi lời mời trong app tới một người chơi; xem và thu hồi mã đang chờ (xem BR-KETNOI-01…06, 13, 14). Chỉ HLV. Vào từ: Học viên ("Mời học viên"; hàng mã → `?code=<mã>`); Onboarding HLV › "Tạo mã mời". Đi tiếp: quay lại Học viên; sheet chia sẻ.

**2. Bố cục** — Header "Mời học viên".
1. **Khối mã** — có mã đang hiện (`?code=` hoặc vừa tạo, **và** mã còn đang chờ): thẻ căn giữa: nhãn nhỏ "Mã mời"; **mã rất lớn** "TUAN24" (chọn được); link nhấn màu "https://gramgolf.app/i/TUAN24" (chọn được); "Hết hạn 14/10/2026 · còn 6 ngày"; "Chia sẻ" (chính, icon chia sẻ) · "Sao chép" (phụ, icon copy). Không có mã đang hiện: đoạn "Tạo mã mời có hạn 7 ngày rồi gửi cho học viên. Học viên nhập mã ở tab HLV — kết nối xong bạn xem được thông số, swing, bộ gậy và thể lực của họ." Nút tạo icon cộng: "Tạo mã mời" (chính) khi chưa có mã đang hiện / "Tạo mã khác" (mức ba) khi đang hiện.
2. "Mời học viên cụ thể": chú thích "Tìm theo tên, email hoặc số điện thoại — học viên nhận lời mời ở tab HLV và chọn Chấp nhận / Từ chối"; ô tìm "Tên, email hoặc số điện thoại"; trống thì không hiện gì; có chữ: hàng người chơi khớp (không bấm được): avatar, tên, `Handicap <n> · <CLB>` (không có cả hai thì hiện **email**), nút phụ nhỏ "Gửi lời mời". Mẫu Tuấn gõ "huy": "Phạm Quốc Huy — Handicap 28 — [Gửi lời mời]".
3. "Lời mời đang chờ": chú thích "Mã còn hạn, chưa có học viên dùng" (khi có); mỗi mã còn hạn, chưa dùng, chưa thu hồi, **mới tạo trước**: mã, `Còn 6 ngày · tạo 07/10/2026`, nút mức ba nhỏ "Thu hồi". Không có: "Chưa có lời mời nào đang chờ." **Chỉ liệt kê mã** (lời mời trong app ở Học viên › Lời mời).

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| "Tạo mã mời" / "Tạo mã khác" | sinh mã ngay (6 ký tự A–Z bỏ O, I + số 2–9; không trùng; hạn = bây giờ + 7 ngày), thêm vào đầu "Lời mời đang chờ", hiện ở thẻ; **không toast** |
| "Chia sẻ" | sheet "Chia sẻ mã mời" |
| "Sao chép" | chép **link** (không phải mã trần); toast "Đã sao chép link mời" |
| Ô tìm | lọc tức thì |
| "Gửi lời mời" | lời mời pending; người chơi nhận "<HLV> mời bạn kết nối" (→ tab HLV); toast "Đã gửi lời mời tới <tên>"; người đó **biến khỏi kết quả** |
| Hàng mã đang chờ | thẻ mã đổi sang mã này; **không** tự cuộn lên |
| "Thu hồi" → Dialog "Thu hồi" | mã thu hồi, rời danh sách; thẻ đang hiện mã này thì quay về đoạn giới thiệu + "Tạo mã mời"; toast "Đã thu hồi mã <mã>" |
| "Giữ mã" | đóng |

**4. Trường nhập** — Ô tìm (nhãn đọc = placeholder, Enter "Tìm", không bắt buộc, không lỗi): chỉ **người chơi**, bỏ người đã có kết nối mở với HLV này và người chặn nhau; khớp khi tên chứa chữ gõ (bỏ dấu) **hoặc** email chứa **hoặc** SĐT chứa dãy số gõ (từ **3 chữ số**). Sheet: "Tìm bạn bè" (theo tên, không phân biệt hoa thường, **có phân biệt dấu**); "Viết lời nhắn…" (tự do, khi đã chọn ≥ 1 người).

**5. Trạng thái** — Mới vào, chưa có mã đang hiện: đoạn giới thiệu + "Tạo mã mời"; danh sách mã có thể có (Tuấn có TUAN24) hoặc rỗng (`f04--hlv-chua-co-loi-moi`, `f02--moi-chua-co-ma`) · Vừa tạo / mở từ roster: thẻ + "Tạo mã khác" (`f04--b-03-tao-ma`) · `?code=` với mã hết hạn / đã dùng / đã thu hồi: không thẻ, như mới vào · Tìm rỗng: "Không có người chơi phù hợp — hoặc người đó đã kết nối hoặc đang có lời mời / yêu cầu kết nối chờ trả lời (xem Học viên › Lời mời)." · Không có mã: "Chưa có lời mời nào đang chờ." Không khung xương, đang xử lý, lỗi, 403, 404.

**6.** **Sheet "Chia sẻ mã mời"** (chỉ khi có thẻ mã) — như sheet chia sẻ bài (12.6) nhưng: lưới **người chơi chưa là học viên** của HLV này (bỏ người chặn nhau; gồm cả người có lời mời chờ — Tuấn: Khoa, Huy); chưa chọn: nút "Sao chép" → chép link, đổi "Đã sao chép" (icon tích), không toast; đã chọn: "Viết lời nhắn…" + "Gửi (n)" → chép "lời nhắn + xuống dòng + link", toast "Đã sao chép lời mời để gửi", đóng sheet, xoá lựa chọn và lời nhắn; "Gửi" **không** gửi thật và **không** tạo lời mời; đóng sheet cũng xoá lựa chọn. **Dialog** cảnh báo "Thu hồi mã <mã>?" · "Học viên sẽ không dùng được mã này để kết nối nữa. Các kết nối đã có không bị ảnh hưởng." · "Thu hồi" (nguy hiểm) / "Giữ mã".

**7. A11y** — Mã lớn đọc **đánh vần** "Mã mời T U A N 2 4"; mã và link chọn / sao chép được bằng tay. Nhãn: "Chia sẻ mã mời", "Sao chép link mời", "Gửi lời mời kết nối tới <tên>", "Thu hồi mã <mã>". Hàng mã: web đọc đánh vần; native hàng chứa nút "Thu hồi" nên không đọc nhãn hàng (nghe mã ở thẻ). Hàng kết quả tìm không bấm được, chỉ nút (không lồng nút). **Lỗi bàn phím:** vùng cuộn không giữ chạm khi bàn phím mở — lần chạm đầu vào "Gửi lời mời" chỉ cụp bàn phím (nên sửa).

**8. Tham chiếu** Story `f04--b-03-tao-ma`, `f04--hlv-chia-se-ma`, `f04--hlv-thu-hoi-dialog`, `f04--b-04-tim-hoc-vien`, `f04--b-05-da-gui-loi-moi`, `f04--tim-khong-co`, `f04--hlv-chua-co-loi-moi`, `f02--moi-chua-co-ma`, `f02--b-06-ma-moi-dau-tien`, `f13--nguoi-choi-mo-man-hlv` (guard vai). Figma L `48:2441` · D `48:5047`. Nguồn `app/connect/invite.tsx`; `lib/ids.ts`, `lib/selectors.ts`, `lib/format.ts`; `packages/ds/src/ui/Social/Social.tsx`.

**Lệch spec:** spec §4 (mã 6 ký tự + link, hạn 7 ngày, ShareSheet, danh sách chờ, thu hồi) đủ. Tạo mã, thu hồi, gửi lời mời không có đang xử lý / lỗi / thử lại. "Gửi" trong ShareSheet chỉ sao chép; link `gramgolf.app/i/<mã>` là link giả, chưa có deep link.

#### Nhập mã mời — `connect/accept`

**1. Mục đích** — Người chơi nhập mã (hoặc dán link), xem trước HLV và sẽ là chính hay phụ, chấp nhận để **kết nối ngay** (xem BR-KETNOI-07…12). Chỉ người chơi. Vào từ: tab HLV ("Nhập mã mời" / EmptyState); Tổng quan › "Chưa có HLV chính · Nhập mã mời từ HLV để kết nối"; Onboarding › "Nhập mã". Đi tiếp: kết nối xong, toast 1,2 s rồi tự về **tab HLV** (từ onboarding thì màn được thay bằng tab HLV); nút quay lại.

**2. Bố cục** — Header "Nhập mã mời". Đoạn "Nhập mã 6 ký tự HLV gửi cho bạn. Sau khi kết nối, HLV xem được thông số, swing, bộ gậy và thể lực của bạn." Ô "Mã mời", trợ giúp "Dán cả link mời cũng được" (ẩn khi có thông báo). Thông báo lỗi / thông tin ngay dưới ô (InlineMessage, không popup). Dưới: chưa có kết quả hợp lệ → nút chính "Kiểm tra"; mã hợp lệ → thẻ xem trước thay nút: nhãn nhỏ "HLV mời bạn kết nối", tóm tắt HLV (avatar, tên, "Đã xác minh", học viện, ★ · kinh nghiệm · học phí), câu: chính "Đây sẽ là HLV chính của bạn. Bạn huỷ kết nối được bất cứ lúc nào trong tab HLV." / phụ "Bạn đã có HLV chính — HLV này là HLV phụ, đổi HLV chính trong tab HLV. Huỷ kết nối được bất cứ lúc nào.", nút chính "Chấp nhận kết nối" (icon người-tích).

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Ô mã (chỉ đọc sau khi chấp nhận) | chuẩn hoá ngay khi gõ / dán; mỗi lần đổi chữ: xoá lỗi, kết quả, thẻ xem trước; "Kiểm tra" hiện lại |
| "Kiểm tra" / Enter ("Go") | kiểm **ngay** (không có đang kiểm) → lỗi hoặc thẻ xem trước |
| "Chấp nhận kết nối" (tắt sau khi chấp nhận) | kiểm lại ngay; hết hợp lệ → lỗi tương ứng, thẻ biến mất; hợp lệ → **active ngay** (chính nếu chưa có), mã thành đã dùng, lời mời / yêu cầu chờ giữa hai người tự đóng, HLV nhận "<người chơi> đã chấp nhận lời mời" (→ chi tiết học viên), ô chỉ đọc, toast, 1,2 s sau về tab HLV; Enter sau đó không làm gì |

**4. Trường nhập** — "Mã mời", placeholder "Ví dụ: AB23CD"; chữ, tự viết HOA, tắt tự sửa / tự điền, Enter "Go" = Kiểm tra; bắt buộc; dán link ".../i/tuan24" lấy phần mã; chỉ giữ A–Z, 0–9, **tối đa 6** (gõ thêm bị cắt). Lỗi khi bấm Kiểm tra / Enter, mất khi gõ tiếp: trống "Nhập mã mời"; < 6 "Mã mời gồm 6 ký tự". Đủ 6 thì xét theo thứ tự: "Mã không tồn tại" (không có, hoặc hai bên chặn nhau) · "Mã đã bị thu hồi" · "Mã đã được sử dụng" · "Mã đã hết hạn — xin HLV mã mới" — đều là lỗi, ô viền đỏ · "Bạn đã kết nối với HLV này" — **thông tin**, ô **không** đỏ · hợp lệ → thẻ xem trước.

**5. Trạng thái** — Mặc định (ô trống + trợ giúp + "Kiểm tra") · Lỗi nhập (`f04--nhap-ma-de-trong`) · Lỗi mã: "ABCDEF" (`f04--b-16-ma-sai`), HAEXP1 (`f04--b-17-ma-het-han`), USED01 (`f04--b-18-ma-da-dung`), thu hồi (`f04--b-19-ma-thu-hoi`) · Đã kết nối (`f04--b-20-da-ket-noi-ma`) · Xem trước HLV chính, vd Huy nhập TUAN24 (`f04--xem-truoc-hlv-chinh`) / phụ (`f04--b-22-xem-truoc-hlv-phu`) · **Đã chấp nhận**: ô chỉ đọc, nút tắt, toast "Đã kết nối với <tên HLV>" + dòng phụ "HLV chính của bạn" / "HLV phụ — đổi HLV chính trong tab HLV" (toast duy nhất có dòng phụ trong nhóm), 1,2 s sau chuyển màn (`f04--chap-nhan-ket-noi`). Không đang xử lý, lỗi mạng, 403, 404.

**6.** Không dialog; toast như trên.

**7. A11y** — **Một vùng thông báo duy nhất** (role alert, đọc ngay) cho lỗi nhập và kết quả kiểm mã — chữ lỗi mặc định dưới TextField của DS không được đọc, nên phải giữ vùng alert riêng. "Đã kết nối" là thông tin: phân biệt bằng icon / chữ, không chỉ màu. Enter gửi kiểm tra; chạm "Kiểm tra" khi bàn phím mở ăn ngay. Toast được đọc trước khi tự chuyển màn.

**8. Tham chiếu** Story `f04--xem-truoc-hlv-chinh`, `f04--b-16-ma-sai`, `f04--chap-nhan-ket-noi`, `f04--b-17-ma-het-han`, `f04--b-18-ma-da-dung`, `f04--b-19-ma-thu-hoi`, `f04--b-20-da-ket-noi-ma`, `f04--b-22-xem-truoc-hlv-phu`, `f04--nhap-ma-de-trong`. Figma L `48:3448` · D `48:5072`. Nguồn `app/connect/accept.tsx`; `components/CoachSummary.tsx`, `Feedback.tsx`; `lib/format.ts`, `lib/selectors.ts`, `lib/reducer.ts`.

**Lệch spec / ghi chú:** kiểm tra và chấp nhận tức thì, không đang xử lý / lỗi + thử lại. Theo F04 mã mời kết nối ngay, không qua HLV duyệt. Không có lỗi "xung đột HLV active khác" — đã có chính thì thành phụ.

#### Hồ sơ HLV (công khai) — `coaches/[id]`

**1. Mục đích** — Hồ sơ công khai của HLV, ai đăng nhập cũng xem; người chơi theo dõi, **gửi / huỷ yêu cầu kết nối**, **trả lời lời mời**, báo cáo, chặn (xem BR-KETNOI-15, 30, 32; BR-CONGDONG-26…31). Chỉ dữ liệu công khai (tóm tắt, giới thiệu, số theo dõi, bài đăng); **theo dõi không mở dữ liệu riêng**. id không phải HLV → 404; `users/<id HLV>` tự chuyển sang đây. Vào từ: tab HLV; Tổng quan › "HLV chính"; Khám phá; tên tác giả trên bài; `people`; thông báo "đã theo dõi bạn" (người theo dõi là HLV). Đi tiếp: `people`, `posts/[id]`, sheet báo cáo; chặn xong → màn trước.

**2. Bố cục**
1. StackHeader "Hồ sơ HLV"; phải (khi không phải chính HLV đó): cờ "Báo cáo người dùng" (luôn) và vòng tròn gạch "Chặn <tên>" (chỉ khi chưa chặn nhau **và** không có kết nối HLV active theo chiều nào — muốn chặn HLV của mình phải huỷ kết nối trước).
2. **Tóm tắt HLV**: avatar lớn, tên, "Đã xác minh", học viện, ★ "4,9" Đánh giá · "12 năm" Kinh nghiệm · "450.000 đ/giờ" Học phí.
3. Đã chặn (một trong hai chiều): thay toàn bộ phần dưới bằng EmptyState (mục 5), không bài đăng.
4. Không chặn: tag "HLV của bạn" (icon người-tích; người chơi có kết nối active) · giới thiệu · hàng theo dõi: trái số "Người theo dõi" / "Đang theo dõi" (bấm được), phải nút "Theo dõi" (chính, icon người-cộng) / "Đang theo dõi" (mức ba, icon tích), ẩn khi xem chính mình · **Khối kết nối** (người xem là người chơi, HLV chưa là HLV của mình, không chặn nhau): *chưa có gì chờ* — nút chính "Gửi yêu cầu kết nối" (icon người-cộng) + dòng phụ "HLV duyệt thì đây là HLV chính của bạn." / "Bạn đã có HLV chính — HLV này duyệt thì thành HLV phụ."; *mình đã gửi* — InlineMessage Info "Đã gửi yêu cầu kết nối — chờ HLV duyệt." + "Huỷ yêu cầu" (mức ba); *HLV đang mời* — Info "<tên HLV> mời bạn kết nối — nhận lời thì là HLV chính|HLV phụ của bạn." + "Chấp nhận" (chính, icon người-tích) · "Từ chối" (mức ba).
5. "Bài đăng" như `(coach)/me`; rỗng "Chưa có bài đăng."

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Cờ | sheet "Báo cáo người dùng" (12.6) → "Gửi báo cáo": ghi, đóng, toast "Đã gửi báo cáo" |
| Chặn → Dialog "Chặn" | chặn; bỏ theo dõi hai chiều; lời mời / yêu cầu chờ của cặp tự đóng; **quay lại màn trước** |
| "Theo dõi" / "Đang theo dõi" | bật / tắt, số đổi ngay; bật thì HLV nhận "<tên> đã theo dõi bạn"; **không** mở dữ liệu riêng |
| "Gửi yêu cầu kết nối" | pending; HLV nhận "<người chơi> muốn kết nối với bạn" (→ Học viên › Lời mời); khối đổi sang "Đã gửi yêu cầu…"; **không toast** |
| "Huỷ yêu cầu" | revoked, khối về "Gửi yêu cầu kết nối"; không xác nhận, không toast |
| "Chấp nhận" | active (chính / phụ theo luật); tag "HLV của bạn" hiện, khối kết nối mất, nút Chặn ẩn; HLV nhận "đã chấp nhận lời mời"; không toast |
| "Từ chối" | declined, khối về "Gửi yêu cầu kết nối"; không toast, không thông báo |
| "Quay lại" (404) | màn trước hoặc `/` |

**4.** Không có ô gõ; sheet báo cáo là radio bắt buộc.

**5. Trạng thái** — Người chơi, HLV của mình: tag, không khối kết nối, header chỉ có Báo cáo (`f04--ho-so-hlv`) · Chưa kết nối, vd Khoa xem Tuấn: "Gửi yêu cầu kết nối" + chú thích HLV phụ (`f04--b-11-ho-so-hlv`) · Đã gửi yêu cầu (`f04--b-12-da-gui-yeu-cau`) · HLV đang mời (`f04--ho-so-hlv-dang-moi`) · HLV xem HLV khác: tóm tắt, bio, theo dõi, bài, không khối kết nối · HLV xem chính mình: không nút header, không nút theo dõi · **Đã chặn** (EmptyState icon vòng tròn gạch; tóm tắt vẫn ở trên; header còn Báo cáo, ẩn Chặn): mình chặn "Bạn đã chặn người này" — "Hai bạn không thấy bài của nhau và không theo dõi được nhau." / họ chặn "Không xem được nội dung" — "Bạn không xem được bài đăng và không theo dõi được người này." · **404**: header "Hồ sơ HLV", icon tìm tài liệu, "Không tìm thấy HLV", "Hồ sơ này không tồn tại.", "Quay lại". Không khung xương, đang xử lý, lỗi.

**6.** Sheet "Báo cáo người dùng" (12.6). Dialog cảnh báo "Chặn <tên>?" · "Hai bạn sẽ không thấy bài của nhau và bỏ theo dõi lẫn nhau." · "Chặn" (nguy hiểm) / "Huỷ". Toast "Đã gửi báo cáo", "Đã sao chép bài viết để gửi" (chia sẻ bài).

**7. A11y** — Nút header chỉ icon: "Báo cáo người dùng", "Chặn <tên>". Nhãn kèm tên: "Theo dõi <tên>" / "Đang theo dõi <tên>", "Huỷ yêu cầu kết nối với <tên>", "Chấp nhận lời mời của <tên>", "Từ chối lời mời của <tên>". Báo cáo / Chặn là **2 nút thẳng trên header**, không gom menu ⋯ (iOS kẹt khi mở Dialog / sheet ngay sau sheet). InlineMessage trạng thái kết nối không có role alert — gửi / huỷ yêu cầu không có toast nên trình đọc **không** báo gì (nên có phản hồi được đọc).

**8. Tham chiếu** Story `f04--b-11-ho-so-hlv`, `f04--b-12-da-gui-yeu-cau`, `f04--ho-so-hlv-dang-moi`, `f04--ho-so-hlv`, `f04--ho-so-hlv-khong-co` (404), `f04--ho-so-hlv-chan` (dialog), `f10--ho-so-hlv-bi-chan`. Figma L `48:3515` · D `48:5082` (header 2 action). Nguồn `app/coaches/[id].tsx`; `components/People.tsx`, `ReportSheet.tsx`, `CoachSummary.tsx`, `PostItem.tsx`; `lib/selectors.ts`, `lib/reducer.ts`.

**Ghi chú:** spec §3 chỉ ghi "hồ sơ HLV (công khai)" — code thêm khối kết nối. Chấp nhận / từ chối / huỷ yêu cầu có toast ở tab HLV nhưng **không** ở đây (nên thống nhất).

**Điểm cần chủ dự án quyết (nhóm HLV):** (1) gộp hay giữ hai màn hồ sơ của HLV; (2) thứ tự học viên (đang theo lúc tạo kết nối; sắp theo tên / cần phản hồi trước?); (3) vị trí "CTA mời" khi đã có học viên; (4) phản hồi sau thao tác kết nối không thống nhất (toast ở tab HLV / roster, không có ở `coaches/[id]`), không thao tác nào có đang xử lý / lỗi; (5) "Gửi" trong sheet chia sẻ mã chỉ sao chép — gộp với "Mời học viên cụ thể"?; (6) thông báo "mời bạn kết nối" còn lại sau khi HLV huỷ lời mời, chạm vào mở tab HLV trống; (7) người chơi tự mở `students/<chính mình>` xem được nhưng không có lối vào UI.

### 12.6 Cộng đồng & thông báo

Route: `(player)/community` và `(coach)/community` (cùng `components/CommunityScreen.tsx`, khác dữ liệu), `community/compose`, `posts/[id]`, `users/[id]` (+ `ProfileScreen` trong `components/People.tsx`), `people`, `notifications` và `(coach)/inbox` (cùng `components/NotificationsScreen.tsx`, khác header). Figma: trang "Thiết kế · Cộng đồng & thông báo" `48:1060`. Cờ "Giả lập lỗi" trong nhóm **chỉ** ảnh hưởng nút Đăng ở `community/compose`; thích, bình luận, theo dõi, báo cáo, chặn, xoá bài ghi ngay. Chặn (một trong hai chiều) = hai người "biến mất" với nhau ở bảng tin, chi tiết bài, bình luận, lượt thích và số đếm, Khám phá, danh sách theo dõi, sheet Chia sẻ, "Ai đã thích", thông báo; chặn gỡ theo dõi hai chiều và đóng lời mời / yêu cầu chờ; bỏ chặn chỉ ở Cài đặt › Quyền riêng tư, không khôi phục theo dõi (xem BR-CONGDONG-26…30). Dữ liệu riêng trong nhóm chỉ quyết định swing đính kèm trong bài và nút "Xem dữ liệu học viên" ở hồ sơ người chơi.

**Bài mẫu** (mới → cũ): `post-1` HLV Tuấn "3 bài tập giữ tempo 3:1 cho driver" (#driver #tempo, 2 thích, 1 bình luận, "20 giờ trước"); `post-4` Minh Anh "Lần đầu chạm 104 mph tốc độ đầu gậy!" (#driver, 2 thích, 2 bình luận, "1 ngày trước"); `post-2` HLV Hà "Wedge 50 mét: kiểm soát bằng độ dài backswing" (#wedge #short game, 1 thích, "3 ngày trước"); `post-5` Khoa "Vòng 76 ở sân Long Biên" (#vòng đấu #sắt, 1 thích, 1 bình luận, "3 ngày trước"); `post-6` Lan "Buổi đầu tập sắt 7" (#sắt #tempo, "5 ngày trước"); `post-3` HLV Tuấn "Khởi động 10 phút trước buổi tập" (#thể lực, "6 ngày trước"). Bài mẫu không có swing đính kèm.

**Thẻ bài** (`PostItem`, `components/PostItem.tsx`) — dùng ở Bảng tin, mục "Bài đăng" của hồ sơ (người chơi, HLV, tab Hồ sơ HLV), đầu Chi tiết bài. *Rút gọn* (bảng tin, hồ sơ): nội dung cắt **4 dòng**; chạm tiêu đề / nội dung / Bình luận → `posts/[id]`. *Đầy đủ* (chi tiết): không cắt, chọn / sao chép được chữ, tiêu đề là header, **không** có nút Bình luận. Khối: (1) hàng tác giả: avatar nhỏ + tên + tích xác minh (HLV `verified`) + thời gian tương đối ("HLV Đỗ Minh Tuấn ✓ • 20 giờ trước"), cả cụm là nút → hồ sơ (HLV → `coaches/[id]`, người chơi → `users/[id]`); tác giả đã bị xoá → "Người dùng", không chạm được; phải: **badge "HLV"** nếu là HLV; (2) tiêu đề (1 dòng chữ lớn, xuống dòng tự do) + nội dung; (3) tag nhãn nhỏ `#driver`, xuống hàng khi chật, chỉ hiển thị (không lọc), ẩn khi không có; (4) hàng hành động: **Thích** (tim, đặc khi đã thích; số ẩn khi 0; bỏ người chặn nhau; bật / tắt ngay; lần **đầu** một người thích → thông báo `like` cho tác giả, không báo khi tự thích, bỏ rồi thích lại không báo lần 2 — xem BR-CONGDONG-12…14) · **Bình luận** (chỉ rút gọn; số ẩn khi 0) · **Chia sẻ** (máy bay giấy → sheet Chia sẻ). Thẻ **không** báo bài có swing đính kèm (chỉ thấy ở chi tiết); không có ảnh / video. A11y: tác giả đọc "HLV Đỗ Minh Tuấn, HLV, 20 giờ trước"; nội dung đọc tiêu đề + gợi ý "Mở bài viết"; "Thích, 2 lượt thích" (+ trạng thái chọn); "Bình luận, 1 bình luận"; "Chia sẻ"; nút nới vùng chạm; không lồng nút trong nút.

**Hàng người + nút Theo dõi** (`PersonRow`, `FollowButton`, `components/People.tsx`) — avatar vừa, **tên** 1 dòng cắt "…", dòng phụ: **badge "HLV"** (nếu HLV) + chú thích 1 dòng: HLV tên học viện ("GramGolf Academy Hà Nội"); người chơi "Handicap 22 · Sân tập Ciputra" (thiếu phần nào bỏ phần đó, "Handicap 28"). Chạm hàng → hồ sơ. **Nút Theo dõi** tách riêng bên phải: "Theo dõi" (chính) / "Đang theo dõi" (phụ); bản nhỏ trong hàng không icon, bản vừa ở hồ sơ có icon (người + / tích); **ẩn** khi là chính tôi. Bấm: bật / tắt **ngay**, không hỏi khi bỏ theo dõi, không chờ / lỗi; bật → thông báo `follow` cho người kia (mỗi lần bật lại đều báo; xem BR-CONGDONG-20, 21); chặn nhau thì không có tác dụng (nút không hiện ở các chỗ đó). A11y: hàng đọc "Trần Thu Lan, Handicap 22 · Sân tập Ciputra" / "HLV Đỗ Minh Tuấn, HLV, GramGolf Academy Hà Nội"; nút "Theo dõi Trần Thu Lan" / "Đang theo dõi Trần Thu Lan".

**Sheet "Chia sẻ bài viết"** (`ShareSheet` của DS; xem BR-CONGDONG-25) — tiêu đề "Chia sẻ bài viết", X "Đóng", vạch chia. (1) Ô "Tìm bạn bè": lọc tên, không phân biệt hoa thường **nhưng phân biệt dấu** (khác Khám phá); chữ giữ cho lần mở sau. (2) Lưới người: avatar lớn + tên 1 dòng; **mọi người dùng khác** chưa chặn nhau (không chỉ người tôi theo dõi), thứ tự theo dữ liệu; chạm chọn / bỏ nhiều người (dấu tích góc avatar). (3) Chân: chưa chọn ai → nút tròn "Sao chép liên kết" (icon copy) chép `https://gramgolf.app/p/<id bài>`, nhãn đổi "Đã sao chép" (icon tích, trạng thái chọn), không toast; đã chọn ≥ 1 → ô "Viết lời nhắn…" + "Gửi (n)" chép "lời nhắn (nếu có) xuống dòng link bài", đóng sheet, màn chứa hiện toast "Đã sao chép bài viết để gửi" (gửi tiếp khi toast còn hiện → toast chạy lại). Đóng (X, vuốt, chạm nền) → bỏ chọn, xoá lời nhắn, nhãn về "Sao chép liên kết". Chưa có tin nhắn trong app — "Gửi" chỉ chép để dán sang ứng dụng khác. A11y: mỗi ô người là checkbox có trạng thái chọn; nút hành động có trạng thái chọn.

**Sheet Báo cáo** (`components/ReportSheet.tsx`; xem BR-CONGDONG-31, 32) — tiêu đề "Báo cáo bài viết" / "Báo cáo bình luận" / "Báo cáo người dùng"; phụ đề "Người bị báo cáo không biết ai đã báo cáo."; X. Radio (nhãn đọc "Lý do báo cáo"), chọn đúng 1: "Spam" · "Nội dung không phù hợp" · "Quấy rối" · "Khác" ("Khác" không mở ô nhập). Nút chính "Gửi báo cáo". Chưa chọn mà bấm → lỗi dưới danh sách "Chọn một lý do để gửi báo cáo." (đọc to ngay), chọn thì mất. Hợp lệ → lưu **ngay**, đóng sheet, toast "Đã gửi báo cáo"; không có đang gửi / lỗi; không ẩn nội dung, không chặn báo cáo trùng. Đóng → bỏ lựa chọn và lỗi.

#### Cộng đồng — Bảng tin / Khám phá (người chơi) — `(player)/community`

**1. Mục đích** — Đọc bài của mình và người đang theo dõi (Bảng tin), tìm và theo dõi người chơi / HLV (Khám phá), mở Đăng bài (xem BR-CONGDONG-07, 24). Người chơi (tab thứ 4); HLV dùng `(coach)/community`. Vào từ: tab "Cộng đồng"; tab HLV khi chưa có HLV → "Tìm HLV" mở thẳng **Khám phá** (`tab=kham-pha`, cả khi tab đang mở); quay lại từ Đăng bài / Chi tiết bài. Đi tiếp: `posts/[id]`, `community/compose`, `users/[id]` / `coaches/[id]`.

**2. Bố cục**
1. TabHeader "Cộng đồng" (Minh Anh: chuông "2", avatar "MA").
2. Tab 2 mục **"Bảng tin" | "Khám phá"**, mặc định Bảng tin (trừ `tab=kham-pha`); đổi tab giữ chữ đang tìm khi màn còn mở.
3. **Bảng tin**: thẻ bài rút gọn **mới → cũ** theo lúc đăng; bài của tôi + người tôi theo dõi, trừ người chặn nhau; **không giới hạn, không phân trang, không kéo làm mới, không lọc**. Minh Anh (5 bài): HLV Tuấn "3 bài tập giữ tempo 3:1 cho driver" (20 giờ trước, ♥ 2, 💬 1) → Minh Anh "Lần đầu chạm 104 mph tốc độ đầu gậy!" (1 ngày trước, ♥ 2, 💬 2) → HLV Hà "Wedge 50 mét…" (3 ngày trước, ♥ 1) → Khoa "Vòng 76 ở sân Long Biên" (3 ngày trước, ♥ 1, 💬 1) → HLV Tuấn "Khởi động 10 phút trước buổi tập" (6 ngày trước). **Nút nổi "Đăng bài"** (icon +, có chữ) góc dưới phải trên thanh tab, chỉ ở Bảng tin (cả khi đang tải, rỗng); chừa đệm cuối.
4. **Khám phá**: ô tìm "Tìm người chơi, HLV" (nút xoá "Xoá nội dung" khi có chữ); hàng người: mọi người dùng **trừ tôi và người chặn nhau**; trống → tất cả; có chữ → **tên** chứa chuỗi gõ, **không phân biệt dấu, hoa thường** ("lan" → "Trần Thu Lan"; "đ" khớp "d"), không tìm email / SĐT; thứ tự theo dữ liệu, không giới hạn. Minh Anh, ô trống: Trần Thu Lan ("Handicap 22 · Sân tập Ciputra", "Theo dõi") → Lê Đăng Khoa ("Handicap 8 · Sân Long Biên", "Đang theo dõi") → Phạm Quốc Huy ("Handicap 28", "Theo dõi") → HLV Đỗ Minh Tuấn (badge HLV, "GramGolf Academy Hà Nội", "Đang theo dõi") → HLV Vũ Thanh Hà (badge HLV, "Saigon Golf Lab", "Đang theo dõi"). Không có nút nổi.

**3. Hành động** — Tab: đổi nội dung. Thẻ bài: như trên. Nút nổi "Đăng bài" → `community/compose`. CTA rỗng "Khám phá người chơi" → tab Khám phá. Ô tìm: lọc theo từng ký tự; X xoá chữ. Hàng người → hồ sơ. Theo dõi: như trên, bài người vừa theo dõi lên Bảng tin ngay. Sheet Chia sẻ → Gửi → toast.

**4. Trường nhập** — Ô tìm (nhãn đọc = placeholder "Tìm người chơi, HLV"; Enter = "Tìm"; trim; không lỗi, chỉ trạng thái không tìm thấy).

**5. Trạng thái**

| Trạng thái | Hiển thị |
|---|---|
| Tải lần đầu (Bảng tin, chung hai vai) | 3 khung xương **thẻ bài** (tròn avatar + 1 dòng, 1 dòng tiêu đề, 3 dòng nội dung); đọc một lần "Đang tải bảng tin"; nút nổi vẫn hiện |
| Rỗng Bảng tin (vd Huy) | icon bong bóng chat, "Chưa có bài viết", "Theo dõi người chơi và HLV để thấy bài của họ ở đây, hoặc đăng bài đầu tiên của bạn.", nút "Khám phá người chơi" |
| Khám phá không tìm thấy | dòng nhạt "Không tìm thấy ai tên “<chữ đã gõ, đã trim>”." (ngoặc kép cong) |
| Khám phá không có ai | ô trống, không còn ai khác (vd chặn hết): "Chưa có người dùng nào khác." |
| Sau khi chặn | bài, hàng Khám phá của người đó biến mất |
| Bài mới của tôi | ở đầu Bảng tin, "Vừa xong" |

Không có lỗi tải bảng tin, khung xương ở Khám phá, 403. **6.** Sheet Chia sẻ; toast "Đã sao chép bài viết để gửi"; không dialog.

**7. A11y** — Tiêu đề header role header; tab là tablist có trạng thái chọn. Hàng người và nút Theo dõi là hai đích chạm riêng. Khám phá giữ chạm khi bàn phím mở. Nút nổi không che bài cuối.

**8. Tham chiếu** Story `f10--b-01-bang-tin`, `f10--b-06-kham-pha` (đã theo dõi Lan), `f10--bang-tin-rong`, `f10--b-09-sau-chan`, `f10--chia-se-gui`, `f10--kham-pha`, `f10--kham-pha-khong-thay`; khung xương `docs/screens/task14/community-skeleton-dark.png` (chỉ bản tối). Figma L `48:1849` · D `48:6226` · ref `48:1062`; component local `PersonRow` `48:1086`. Nguồn `app/(player)/community.tsx` → `components/CommunityScreen.tsx`, `PostItem.tsx`, `People.tsx`, `TabHeader.tsx`, `ListSkeleton.tsx`; `lib/selectors.ts`.

**Lệch spec:** spec §4 ghi thẻ bài "PostCard" — code dùng thẻ chữ riêng (PostCard của DS bắt buộc khung ảnh); bài không có ảnh / video. Tải bảng tin không có lỗi + thử lại.

#### Cộng đồng (HLV) — `(coach)/community`

**Giống hệt** bản người chơi (cùng component), chỉ khác: HLV (tab thứ 2; người chơi mở → trang chủ người chơi); vào từ tab "Cộng đồng" của HLV ("Tìm HLV" chỉ trỏ tab người chơi); chuông → `notifications` (màn stack, cùng nội dung tab Thông báo); thanh tab HLV. Mẫu Tuấn — Bảng tin 3 bài: "3 bài tập giữ tempo 3:1 cho driver" (của mình, 20 giờ trước) → HLV Hà "Wedge 50 mét…" (3 ngày trước) → "Khởi động 10 phút trước buổi tập" (của mình, 6 ngày trước); Tuấn không theo dõi học viên nào nên bài học viên **không** lên bảng tin (kết nối HLV ≠ theo dõi). Khám phá (ô trống): Nguyễn Minh Anh, Trần Thu Lan, Lê Đăng Khoa, Phạm Quốc Huy ("Theo dõi"), HLV Vũ Thanh Hà ("Đang theo dõi"). Badge chuông (seed): Tuấn "1", Hà "1". Đăng bài từ đây không có ô đính kèm swing. Story `f10--bang-tin-hlv`. Figma L `48:2070` · D `48:6235` · ref `48:1064`. Nguồn `app/(coach)/community.tsx` → `components/CommunityScreen.tsx`; `app/(coach)/_layout.tsx`.

#### Đăng bài — `community/compose`

**1. Mục đích** — Soạn và đăng bài chữ: tiêu đề, nội dung, tối đa 5 tag, tuỳ chọn đính kèm 1 swing của mình (xem BR-CONGDONG-01…06). Mọi người đã đăng nhập; ô đính kèm chỉ liệt kê swing **của tôi** đã tải lên xong. Vào từ: nút nổi "Đăng bài" (cả 2 vai). Đi tiếp: đăng xong → toast 1,2 s → màn trước (Bảng tin); mở thẳng link → thay bằng tab Cộng đồng theo vai; lùi → màn trước, **bỏ nháp không hỏi** (đang đăng mà rời → huỷ, bài không được tạo).

**2. Bố cục** — Header "Đăng bài" (không nút phải), không thanh tab. Form cuộn: **Tiêu đề** (1 dòng) · **Nội dung** (nhiều dòng) + đếm "68/2000 ký tự" (đếm cả khoảng trắng, theo từng ký tự) · **Tag (n/5)** (nhãn có bộ đếm "Tag (2/5)", icon `#` đầu ô, dòng phụ cố định "Enter hoặc dấu phẩy để thêm · chạm tag để bỏ") · hàng chip tag (khi ≥ 1): "#driver" + icon X, xuống hàng, theo thứ tự thêm · **Đính kèm swing (tuỳ chọn)** — ô chọn (chỉ khi có ≥ 1 swing tải xong): "Không đính kèm" / "Driver · 05/10/2026" (gậy · ngày quay; không gậy "Chưa gắn gậy · 06/10/2026") · dòng "Đang đăng…" (vòng quay) khi đang xử lý · nút "Đăng" (icon máy bay giấy) rộng hết, cuối form (không phải footer cố định). Mẫu Minh Anh, swing mới → cũ: "Gỗ 3 · 06/10/2026" (Face-on), "Driver · 05/10/2026" (Face-on), "Sắt 7 · 28/09/2026" (Down-the-line).

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Enter trong ô Tag | thêm tag, xoá ô, **giữ bàn phím** |
| Dấu phẩy trong ô Tag | phần trước thành tag, phần sau ở lại ô |
| Chạm chip | bỏ tag |
| Ô đính kèm / mục trong sheet | sheet "Đính kèm swing" / chọn (hoặc bỏ đính kèm), đóng ngay |
| "Đăng" (bật trừ khi đang đăng / đã đăng xong) | lần bấm đầu bật hiển thị lỗi; sai → lỗi theo trường; hợp lệ → "Đang đăng…" 0,6 s → tạo bài (tag còn trong ô cũng tính), toast "Đã đăng bài", nút khoá, 1,2 s sau về Bảng tin (bài mới đầu); lỗi giả lập → toast lỗi, form giữ |
| "Thử lại" (toast) | gửi lại như bấm Đăng |

Đăng bài không sinh thông báo.

**4. Trường nhập**

| Nhãn | Placeholder | Quy tắc | Chữ lỗi |
|---|---|---|---|
| Tiêu đề | "VD: 3 bài tập giữ tempo cho driver" | bắt buộc; trim khi lưu; ô chặn 120 | "Bắt buộc"; "Tối đa 120 ký tự" (thực tế không gặp) |
| Nội dung (nhiều dòng) | "Chia sẻ kinh nghiệm, câu hỏi hoặc kết quả buổi tập…" | bắt buộc; trim; ô chặn 2000 | "Bắt buộc"; "Tối đa 2000 ký tự" (không gặp); lỗi **thay** dòng đếm |
| Tag (n/5) | "VD: driver, tempo"; đủ 5 → "Đã đủ 5 tag" | không bắt buộc, **không tự viết hoa**; tách dấu phẩy; bỏ `#` đầu, khoảng trắng thừa (gộp thành 1), chữ thường; bỏ trùng; tối đa 5 (dư bỏ im lặng); mỗi lần gõ ≤ 30 ký tự; đủ 5 → ô **khoá** | không có |
| Đính kèm swing (tuỳ chọn) | "Không đính kèm" | một swing của tôi đã tải xong (phân tích hay chưa đều được) | — |

**5. Trạng thái** — Form trống ("0/2000 ký tự", "Tag (0/5)", "Không đính kèm") · Không có swing (mọi HLV, người chơi mới): ẩn ô đính kèm · Lỗi: viền lỗi + "Bắt buộc" · Đủ tag: ô khoá, "Đã đủ 5 tag", "Tag (5/5)" · Đang đăng: "Đang đăng…" (đọc to), nút khoá · Thành công: toast "Đã đăng bài" rồi về Bảng tin (nút khoá trong lúc toast) · **Lỗi + thử lại** (cờ Dev): toast "Đăng bài thất bại" · "Mất kết nối — bài chưa được đăng, nội dung giữ nguyên." · "Thử lại", 4 s, nút Đăng bật lại, chữ giữ nguyên. Không khung xương, 403, 404.

**6.** **Sheet "Đính kèm swing"** (X, vạch chia): radio (nhãn đọc "Swing đính kèm"), mục đầu "Không đính kèm", rồi swing mới → cũ: `<gậy> · <dd/mm/yyyy>` + dòng phụ góc quay; mục chọn có radio đặc; chọn → đóng; cuộn được.

**7. A11y** — Ô có nhãn hiển thị; ô đính kèm đọc "Đính kèm swing, Driver · 05/10/2026" / "Đính kèm swing, không đính kèm". Chip đọc "Bỏ tag #driver". `KeyboardAvoid`; Enter ở ô Tag không cụp bàn phím. "Đang đăng…" và toast đọc to; vòng quay ẩn (tránh đọc 2 lần).

**8. Tham chiếu** Story `f10--b-04-soan-bai` (đã điền, 2 tag, đính kèm Driver), `f10--dang-bai-loi`, `f13--dang-dang-bai`, `f10--b-05-bai-moi` (toast), `f10--dang-bai`, `f10--dang-bai-chon-swing`. Figma L `48:3686` · D `48:6244` · ref `48:1066`. Nguồn `app/community/compose.tsx`, `lib/validation.ts:231-250` (`validatePost`, `addTags`, giới hạn 120 / 2000 / 5), `components/Feedback.tsx`.

**Lệch spec:** spec §4 "đính kèm swing/ảnh (mock)" — chỉ đính kèm swing, chưa có ảnh. Rời màn khi đã nhập không hỏi (cần quyết).

#### Chi tiết bài viết — `posts/[id]`

**1. Mục đích** — Đọc bài đầy đủ, xem swing đính kèm, ai đã thích, đọc / viết / trả lời bình luận; tác giả xoá bài, người khác báo cáo bài / bình luận (xem BR-CONGDONG-09…19). Mọi người đã đăng nhập; tôi và tác giả chặn nhau → "Không xem được bài viết"; swing đính kèm chỉ chủ swing + HLV active thấy (người khác, kể cả người theo dõi, thấy thẻ khoá). Vào từ: thẻ bài / Bình luận ở Bảng tin và mục "Bài đăng" của hồ sơ; thông báo `like` / `comment`; link. Đi tiếp: hồ sơ tác giả, hồ sơ người trong "Ai đã thích" (tên / avatar người bình luận **không** chạm được); `swings/[id]`; xoá xong → màn trước.

**2. Bố cục**
1. Header "Bài viết"; phải: bài **của tôi** → thùng rác ("Xoá bài viết"); bài **người khác** → cờ ("Báo cáo bài viết").
2. **Bài đầy đủ** (thẻ bài chế độ đầy đủ): tác giả + badge HLV, tiêu đề, nội dung, tag, Thích + Chia sẻ.
3. **Swing đính kèm** (khi có và còn tồn tại): có quyền → thẻ swing: thumbnail 9:16 + play, "Driver", "05/10/2026 · Face-on", badge trạng thái (như tab Swing 12.4), "1 ghi chú HLV" nếu có; chạm → `swings/[id]`. Không quyền → thẻ khoá: ổ khoá, "Swing riêng tư", "Chỉ người chơi và HLV đã kết nối xem được swing này.", không chạm. Swing đã xoá → không hiện.
4. Nút chữ "Ai đã thích" (icon tim) — khi ≥ 1 lượt thích (bỏ người chặn).
5. "Bình luận", phụ đề "1 bình luận" (ẩn khi 0); **cũ → mới**, ẩn người chặn nhau, không giới hạn. Mỗi bình luận: avatar nhỏ, tên (+ tích nếu HLV; **không** badge HLV), thời gian, nội dung; hàng: tim "Thích" (**hiện nhưng chưa làm gì**), "Trả lời", "⋯" (chỉ bình luận **người khác** → báo cáo). Trả lời **không lồng cấp**: là bình luận thường ở cuối, bắt đầu "@<Tên> ". Mẫu `post-4`: HLV Đỗ Minh Tuấn ✓ · 1 ngày trước "Rất tốt! Tuần sau mình tập thêm phần giữ góc cổ tay." → Lê Đăng Khoa · 1 ngày trước "Chúc mừng Minh Anh, cuối tuần ra sân Long Biên thử nhé!".
6. **Ô viết bình luận cố định đáy** (vạch chia trên), luôn hiện: thu gọn — avatar của tôi, ô "Viết bình luận…", nút gửi mũi tên lên; mở rộng (đã gõ / đang trả lời) — dòng "Trả lời <Tên>" + X bỏ trả lời, ô nhiều dòng, nút gửi xuống hàng dưới phải, avatar ẩn. Tối đa 1000 ký tự (cắt im lặng, không bộ đếm).

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| Thùng rác → dialog "Xoá" | đóng dialog, quay lại ngay, bài bị xoá **sau khi** rời màn (kèm lượt thích, bình luận, thông báo trỏ tới bài); không toast, không đang xoá / lỗi |
| Cờ | sheet "Báo cáo bài viết" (đích = tác giả, kèm bài) |
| Thích / Chia sẻ | như thẻ bài; số "Ai đã thích" / tiêu đề sheet cập nhật ngay |
| "Ai đã thích" / người trong sheet | sheet lượt thích / đóng sheet → hồ sơ |
| "Trả lời" | chế độ trả lời (ô mở rộng, "Trả lời <Tên>"); **không** tự đưa con trỏ vào ô |
| Tim ở bình luận | không làm gì (chưa nối) |
| "⋯" (nhãn "Thêm") | sheet "Báo cáo bình luận" (đích = người viết, kèm bài) |
| X "Bỏ trả lời" | bỏ chế độ trả lời, giữ chữ |
| Gửi | bật khi ô khác rỗng (toàn khoảng trắng: bấm không làm gì); lưu **ngay**: trim, thêm "@<Tên> " nếu trả lời; xoá ô, bỏ trả lời, cuộn xuống cuối ("Vừa xong"); thông báo `comment` cho **tác giả bài** (không khi tự bình luận; người được trả lời **không** nhận) |

**4. Trường nhập** — Ô bình luận: nhãn đọc "Bình luận", placeholder "Viết bình luận…", nhiều dòng; tối đa 1000 (cắt khi gõ / dán); trim khi gửi; không chữ lỗi (nút gửi tắt khi rỗng).

**5. Trạng thái** — Bài của tôi: thùng rác; bình luận người khác có "⋯", của tôi không · Bài người khác: cờ · Chưa có bình luận: dưới "Bình luận" (không phụ đề) "Chưa có bình luận. Hãy là người đầu tiên!" · 0 lượt thích: ẩn "Ai đã thích", tim không số · Swing có quyền / không quyền (thẻ khoá) · Đang trả lời · **Không tìm thấy** (id sai / đã xoá): header "Bài viết" chỉ có lùi; icon tìm tài liệu, "Không tìm thấy bài viết", "Bài viết đã bị xoá hoặc không tồn tại.", "Quay lại" · **Bị chặn**: header "Bài viết"; icon cấm, "Không xem được bài viết", "Bài viết bị ẩn vì một trong hai người đã chặn người kia.", "Quay lại" · Toast "Đã gửi báo cáo", "Đã sao chép bài viết để gửi". Không có khung xương, đang gửi / lỗi bình luận, đang xoá / lỗi xoá bài.

**6.** Dialog cảnh báo "Xoá bài viết?" · "Bài viết cùng lượt thích và bình luận sẽ bị xoá, không khôi phục được." · "Huỷ" / "Xoá" (nguy hiểm); chạm nền = Huỷ. **Sheet "N lượt thích"**: tiêu đề "2 lượt thích" (số hiển thị), X, không ô tìm; người thích theo thứ tự lúc thích: avatar nhỏ, tên (+ tích), dòng phụ "HLV" nếu HLV; không nút Theo dõi; chạm → đóng, mở hồ sơ (mẫu `post-1`: Nguyễn Minh Anh, Trần Thu Lan). Sheet Báo cáo, sheet Chia sẻ (đầu nhóm).

**7. A11y** — `KeyboardAvoid` cho ô bình luận. Tiêu đề bài và "Bình luận" là header. Nhãn: "Xoá bài viết" / "Báo cáo bài viết", "Gửi", X "Bỏ trả lời" (nới vùng chạm), ô "Bình luận". Thẻ khoá swing đọc liền "Swing riêng tư…". **Cần sửa:** hàng người trong sheet lượt thích **không** là nút với trình đọc; tim ở bình luận hiện mà không hoạt động (bỏ hoặc nối).

**8. Tham chiếu** Story `f10--chi-tiet-bai` (bài người khác + 1 bình luận), `f10--tra-loi-binh-luan`, `f10--swing-dinh-kem-rieng-tu`, `f10--xoa-bai-dialog`, `f10--bai-nguoi-da-chan`, `f10--bao-cao-loi`, `f10--b-02-binh-luan`, `f10--b-03-ai-da-thich`, `f10--b-10-bao-cao`, `f10--chi-tiet-bai-cua-minh`, `f10--swing-dinh-kem-co-quyen`, `f10--bai-khong-tim-thay`, `f11--b-05-thich-den-bai`, `f11--b-09-binh-luan-den-bai`. Figma L `48:3749` · D `48:6252` · ref `48:1068`. Nguồn `app/posts/[id].tsx`, `components/PostItem.tsx`, `SwingCard.tsx`, `ReportSheet.tsx`, `useOnLeave.ts`, `packages/ds/src/ui/Comment/Comment.tsx`, `packages/ds/src/ui/Social/Social.tsx`, `lib/reducer.ts`.

**Lệch spec / luật app:** CLAUDE.md ("lưu / xoá → đang tải + lỗi + thử lại") và spec §4 — **xoá bài**, **gửi bình luận**, **gửi báo cáo** ghi ngay, cờ Dev không tác động. Spec "CommentThread" — code một cấp (trả lời phẳng có `@Tên`). Chưa có: xoá / sửa bình luận của mình, sửa bài, thích bình luận.

#### Hồ sơ người chơi (công khai) — `users/[id]`

**1. Mục đích** — Hồ sơ công khai của một **người chơi**: tên, handicap, CLB, giới thiệu, số theo dõi, nút theo dõi, bài đăng; báo cáo / chặn; HLV có kết nối có lối sang dữ liệu học viên (xem BR-CAIDAT-09, BR-KETNOI-30). Mọi người đã đăng nhập; id là HLV → tự chuyển `coaches/[id]`. **Dữ liệu riêng không bao giờ hiện ở đây**, kể cả với người theo dõi và cả khi bật "Công khai bộ gậy / swing" (chỉ được lưu, xem BR-CAIDAT-11). Chặn nhau → chỉ phần đầu + thông báo chặn. Vào từ: tác giả bài, hàng người (Khám phá, danh sách theo dõi), "Ai đã thích", thông báo `follow`, Học viên của HLV (hàng lời mời / yêu cầu), link. Đi tiếp: `people`, `posts/[id]`, `students/[id]` (HLV có kết nối), màn trước (sau khi chặn).

**2. Bố cục**
1. Header "Hồ sơ"; phải (khi không phải tôi): cờ "Báo cáo người dùng"; nút cấm "Chặn <Tên>" — chỉ khi **chưa chặn nhau** và **không** có kết nối HLV active (phải huỷ kết nối trước).
2. **Khối đầu**: avatar rất lớn (trang trí, ẩn) + **tên** (tối đa 2 dòng, header) + "Handicap 22 · Sân tập Ciputra" (thiếu phần nào bỏ; thiếu cả hai ẩn dòng).
3. **Không chặn nhau**: giới thiệu (ẩn nếu không có; Minh Anh "Tập driver mỗi tuần, mục tiêu xuống handicap 10.") · hàng số chạm được "1" / "Người theo dõi", "0" / "Đang theo dõi" (bỏ người chặn với người xem) + nút "Theo dõi" (icon người +) / "Đang theo dõi" (icon tích) cỡ vừa, ẩn với chính mình · nút phụ rộng "Xem dữ liệu học viên" (icon biểu đồ) — chỉ HLV có kết nối active · "Bài đăng", phụ đề "1 bài" (ẩn khi 0), thẻ rút gọn mới → cũ, không giới hạn; rỗng "Chưa có bài đăng."
4. **Chặn nhau**: thay mục 3 bằng EmptyState icon cấm, không nút: tôi chặn "Bạn đã chặn người này" — "Hai bạn không thấy bài của nhau và không theo dõi được nhau."; họ chặn "Không xem được nội dung" — "Bạn không xem được bài đăng và không theo dõi được người này." Không có "Bỏ chặn" ở đây.

Mẫu: Minh Anh xem Lan (sau khi theo dõi): "Handicap 22 · Sân tập Ciputra", không bio, "1 Người theo dõi", "0 Đang theo dõi", "Đang theo dõi", "1 bài" — "Buổi đầu tập sắt 7" (5 ngày trước); header có Báo cáo và Chặn. HLV Tuấn xem Minh Anh: bio, "1" / "3", "Theo dõi", "Xem dữ liệu học viên", bài "Lần đầu chạm 104 mph…"; header chỉ Báo cáo.

**3. Hành động** — Cờ → sheet "Báo cáo người dùng" → toast "Đã gửi báo cáo". Nút cấm → dialog chặn. Số theo dõi (không chặn nhau) → `people` của người này, tab tương ứng. Theo dõi: số cập nhật ngay. "Xem dữ liệu học viên" → `students/[id]`. Thẻ bài: như đầu nhóm.

**4.** Không có (radio trong sheet Báo cáo).

**5. Trạng thái** — Có dữ liệu · Hồ sơ của tôi (chạm tên mình trên bài): không nút header, không nút Theo dõi · HLV có kết nối: thêm "Xem dữ liệu học viên", ẩn Chặn · Chưa có bài: "Chưa có bài đăng." · Tôi đã chặn / bị chặn: EmptyState tương ứng, header chỉ còn Báo cáo · **Không tìm thấy**: header "Hồ sơ" chỉ có lùi; icon tìm tài liệu, "Không tìm thấy người dùng", "Hồ sơ này không tồn tại.", "Quay lại" · id là HLV: chuyển ngay `coaches/[id]` · Toast "Đã gửi báo cáo" / "Đã sao chép bài viết để gửi". Không khung xương, đang xử lý / lỗi cho theo dõi, chặn, báo cáo.

**6.** Dialog cảnh báo "Chặn <Tên>?" ("Chặn Lê Đăng Khoa?") · "Hai bạn sẽ không thấy bài của nhau và bỏ theo dõi lẫn nhau." · "Huỷ" / "Chặn" (nguy hiểm) → chặn ngay (gỡ theo dõi hai chiều, đóng lời mời / yêu cầu chờ), đóng dialog, quay lại; không toast. Sheet Báo cáo, sheet Chia sẻ.

**7. A11y** — Tên là header; avatar ẩn. Số theo dõi đọc "Người theo dõi: 1" / "Đang theo dõi: 0", nới vùng chạm. Nút header nhãn rõ đích ("Chặn Lê Đăng Khoa"); nút Theo dõi đọc kèm tên.

**8. Tham chiếu** Story `f10--b-07-ho-so-nguoi-choi` (Minh Anh xem Lan), `f10--ho-so-hlv-xem-hoc-vien`, `f10--da-chan`, `f10--b-08-chan` (dialog), `f10--bi-chan`, `f10--bao-cao-nguoi-dung`, `f10--ho-so-khong-tim-thay`, `f11--b-04-theo-doi-den-ho-so`, `f13--ho-so-id-hlv`. Figma L `48:4136` · D `48:6266` · ref `48:1070`. Nguồn `app/users/[id].tsx`, `components/People.tsx`, `PostItem.tsx`, `lib/selectors.ts`.

**Lệch spec:** spec §4 "menu Chặn / Báo cáo" — code đặt 2 nút icon thẳng trên header (cố ý: mở dialog từ menu sheet kẹt trên iOS, `docs/flows/F10.md` "Đã biết"). Chưa có bỏ chặn tại hồ sơ.

#### Theo dõi — Người theo dõi / Đang theo dõi — `people`

**1. Mục đích** — Danh sách người theo dõi / đang theo dõi của một người (mặc định tôi), theo dõi / bỏ theo dõi ngay trong danh sách (xem BR-CONGDONG-23). Tham số `userId` (trống = tôi), `tab=followers|following` (chỉ đọc lúc mở). Mọi người đã đăng nhập; người xem và chủ danh sách chặn nhau → không xem được; người chặn **với người xem** bị lọc khỏi danh sách và số đếm. Vào từ: số "Người theo dõi" / "Đang theo dõi" ở Tổng quan, `profile`, `users/[id]`, `coaches/[id]`, Học viên, Hồ sơ HLV. Đi tiếp: hồ sơ người trong hàng.

**2. Bố cục** — Header tiêu đề = **tên chủ danh sách** ("Nguyễn Minh Anh") + phụ đề "Theo dõi". Tab 2 mục có badge: "Người theo dõi" "1" | "Đang theo dõi" "3". Hàng người của tab: thứ tự lúc bắt đầu theo dõi (cũ → mới), không sắp, không ô tìm, không giới hạn; hàng của tôi không nút. Mẫu Minh Anh — Người theo dõi: Lê Đăng Khoa ("Handicap 8 · Sân Long Biên", "Đang theo dõi"); Đang theo dõi: HLV Đỗ Minh Tuấn, HLV Vũ Thanh Hà, Lê Đăng Khoa (đều "Đang theo dõi").

**3. Hành động** — Tab: đổi danh sách. Hàng → hồ sơ. Theo dõi: bỏ theo dõi ở tab "Đang theo dõi" **của chính tôi** → hàng biến mất ngay, badge giảm. "Quay lại" (không tìm thấy) → màn trước / `/`.

**4.** Không có.

**5. Trạng thái** — Rỗng Người theo dõi: EmptyState icon nhóm người, "Chưa có người theo dõi", "Bạn chưa có người theo dõi nào." / "<Tên> chưa có người theo dõi nào.", không nút · Rỗng Đang theo dõi: "Chưa theo dõi ai", "Bạn chưa theo dõi người chơi hay HLV nào." / "<Tên> chưa theo dõi người chơi hay HLV nào." · Đã chặn nhau: header "Theo dõi" (không tên); EmptyState chặn như `users/[id]`, **không có nút Quay lại** trong nội dung · Không tìm thấy: header "Theo dõi"; "Không tìm thấy người dùng", "Hồ sơ này không tồn tại.", "Quay lại". Không khung xương, lỗi.

**6.** Không có. **7. A11y** — Tab là tablist có trạng thái chọn, badge đi kèm nhãn. Hàng và nút Theo dõi là hai đích riêng.

**8. Tham chiếu** Story `f10--nguoi-theo-doi`, `f10--dang-theo-doi`, `f10--theo-doi-rong`, `f10--theo-doi-nguoi-da-chan`. Figma L `48:4228` · D `48:6286` · ref `48:1072` ("Đang theo dõi"); `PersonRow` `48:1086`. Nguồn `app/people.tsx`, `components/People.tsx`.

**Lệch spec:** spec §3–§4 coi `people` là "khám phá: Tìm kiếm + danh sách người dùng, nút Theo dõi" — tìm người chuyển sang Cộng đồng › Khám phá; `people` chỉ còn 2 danh sách, không ô tìm. Trạng thái chặn không có nút Quay lại trong nội dung.

#### Thông báo — `notifications`

**1. Mục đích** — Trung tâm thông báo: xem mới / cũ, chạm tới đúng nội dung, đánh dấu đã đọc (xem BR-CONGDONG-33…41, §7). Mọi người đã đăng nhập, chỉ thông báo **của mình**; thông báo do người chặn nhau gây ra bị ẩn (không tính badge); đích vẫn tự gác quyền. Vào từ: chuông ở header tab (Tổng quan, Thông số, Swing, Cộng đồng, HLV; Học viên, Cộng đồng, Hồ sơ của HLV); HLV còn có tab `(coach)/inbox`. Chạm một thông báo:

| Loại | Câu (người nhận) | Chạm → |
|---|---|---|
| `coach_note` | "<HLV> đã ghi chú swing của bạn" | `swings/[id]` |
| `analysis_done` | "Phân tích swing đã xong" (hệ thống) | `swings/[id]` |
| `swing_uploaded` | "<Học viên> vừa tải lên swing mới" (HLV) | `swings/[id]` |
| `like` / `comment` | "<Tên> đã thích bài viết của bạn" / "<Tên> đã bình luận bài viết của bạn" | `posts/[id]` |
| `follow` | "<Tên> đã theo dõi bạn" | `users/[id]` / `coaches/[id]` |
| `connect_request` | người chơi: "<HLV> mời bạn kết nối"; HLV: "<Người chơi> muốn kết nối với bạn" | tab HLV / tab Học viên mục **Lời mời** |
| `invite_accepted` | HLV: "<Người chơi> đã chấp nhận lời mời"; người chơi: "<HLV> đã duyệt yêu cầu kết nối của bạn" | `students/[id]` / tab HLV |

Người gửi không còn → "Người dùng". Thiếu id đích → chạm chỉ đánh dấu đã đọc. Tới một **tab** thì màn Thông báo đóng và chuyển tab (không chồng thêm nhóm tab).

**2. Bố cục** — Header "Thông báo" (không nút phải). Nút mức ba nhỏ "Đánh dấu đã đọc tất cả" (icon hai dấu tích, căn phải) khi có ≥ 1 chưa đọc. Nhóm "Mới" (chưa đọc) rồi "Trước đó" (đã đọc), có tiêu đề, nhóm rỗng ẩn cả tiêu đề; trong nhóm mới → cũ; không giới hạn, không xoá / vuốt / menu từng mục. Hàng (cả hàng là nút, có trạng thái nhấn): trái avatar người gửi hoặc ô icon ngôi sao (hệ thống); giữa câu (đậm nếu chưa đọc, xuống dòng tự do) + thời gian tương đối; phải **chấm màu nhấn** nếu chưa đọc. Mẫu Minh Anh: **Mới** — "HLV Đỗ Minh Tuấn đã ghi chú swing của bạn" · 1 ngày trước; "Lê Đăng Khoa đã theo dõi bạn" · 2 ngày trước; **Trước đó** — "HLV Đỗ Minh Tuấn đã thích bài viết của bạn" · 1 ngày trước; "Phân tích swing đã xong" · 1 ngày trước; badge chuông "2". Huy sau khi Tuấn mời: **Mới** — "HLV Đỗ Minh Tuấn mời bạn kết nối".

**3. Hành động** — "Đánh dấu đã đọc tất cả": mọi thông báo thành đã đọc ngay, nhóm "Mới" mất, nút ẩn, badge về 0. Hàng: đánh dấu **riêng mục đó** đã đọc rồi điều hướng; quay lại → mục đó đã ở "Trước đó".

**4.** Không có.

**5. Trạng thái** — Tải lần đầu (lần đầu mở màn này **hoặc** tab Thông báo HLV trong phiên — dùng chung) · Có chưa đọc · Đã đọc hết: không nút, chỉ "Trước đó" · **Rỗng — người chơi**: icon chuông, "Chưa có thông báo", "Ghi chú của HLV, kết quả phân tích swing, lời mời kết nối, người theo dõi mới, lượt thích và bình luận sẽ hiện ở đây." · **Rỗng — HLV**: "Chưa có thông báo", "Học viên nhận lời mời, yêu cầu kết nối, swing mới của học viên, người theo dõi mới, lượt thích và bình luận sẽ hiện ở đây." · Đích đã bị xoá: thông báo bị xoá theo. Không lỗi tải, không đang xử lý khi đánh dấu. Tắt một loại ở Cài đặt › Thông báo **không** ẩn mục ở đây (chỉ cho push, chưa có push thật). Không bao giờ báo cho chính người gây ra.

**6.** Không có.

**7. A11y** — Hàng đọc một câu: "Chưa đọc. HLV Đỗ Minh Tuấn đã ghi chú swing của bạn, 1 ngày trước" (đã đọc bỏ "Chưa đọc."); chưa đọc **không chỉ dựa vào màu / chấm** — giữ chữ đậm (hoặc tương đương) và tiền tố đọc. "Mới" / "Trước đó" là header.

**8. Tham chiếu** Story `f11--b-01-trung-tam`, `f11--rong`, `f13--dang-tai-thong-bao`, `f04--b-06-thong-bao-loi-moi` (người chơi nhận lời mời), `f08--b-14-hoc-vien-nhan-thong-bao`, `f11--b-03-da-doc`, `f11--b-07-binh-luan-moi`, `f11--b-08-doc-tat-ca`. Figma L `48:6089` · D `48:6293` · ref `48:1074`. Nguồn `app/notifications.tsx` → `components/NotificationsScreen.tsx`, `ListSkeleton.tsx`, `lib/selectors.ts`, `lib/reducer.ts`.

**Lệch spec:** spec §4 "Nhóm Hôm nay / Trước đó" — code nhóm theo **trạng thái đọc**. Tải thông báo không có lỗi + thử lại.

#### Thông báo (tab HLV) — `(coach)/inbox`

**Giống hệt** `notifications` (cùng component), chỉ khác: HLV (tab thứ 3; người chơi mở → trang chủ người chơi); vào từ tab "Thông báo" (thanh tab không badge số); luôn **mở chồng** màn đích (kể cả tab Học viên mục Lời mời). Header là **TabHeader** tiêu đề lớn "Thông báo", **không chuông**, avatar → `profile`, không nút lùi; thanh tab HLV mục "Thông báo" đang chọn; rỗng dùng câu của HLV; khung xương dùng chung lượt "đã tải" với `/notifications`; tiêu đề header role header. Mẫu: Tuấn **Mới** — "Trần Thu Lan đã chấp nhận lời mời" · 1 ngày trước → `students/p-lan`; Hà **Mới** — "Phạm Quốc Huy muốn kết nối với bạn" · 5 giờ trước → tab Học viên, Lời mời; sau khi học viên tải swing: "Nguyễn Minh Anh vừa tải lên swing mới". Story `f11--b-10-hop-thu-hlv`, `f11--tab-hlv-rong` (HLV mới, rỗng), `f08--b-03-thong-bao-swing-moi`, `f04--b-09-hlv-nhan-thong-bao`, `f04--b-24-ha-nhan-thong-bao`. Figma L `48:6147` · D `48:6308` · ref `48:1076`. Nguồn `app/(coach)/inbox.tsx` → `components/NotificationsScreen.tsx` (`tab`), `TabHeader.tsx` (`bell={false}`), `AppTabBar.tsx`. **Lệch spec:** như `notifications`; spec §3 "Top bar màn tab: chuông (badge số chưa đọc)" — tab này bỏ chuông (hợp lý), nhưng thanh tab không báo số chưa đọc nên ở tab này không thấy tổng số ngoài nhóm "Mới".

### 12.7 Hồ sơ & cài đặt

Route: `profile`, `settings/index`, `settings/account`, `settings/password`, `settings/privacy`, `settings/notifications`, `settings/units`, `settings/dev`. Tab "Hồ sơ" của HLV (`(coach)/me`) ở 12.5. Figma: trang "Thiết kế · Hồ sơ & cài đặt" `48:1202` (không có màn pilot). Mọi màn là màn stack (StackHeader không nút phải, không thanh tab). Chưa đăng nhập → `/`, trừ `settings/index` (không chặn) và `settings/dev` (chặn theo bản dev / phát hành). Cả nhóm chỉ hiện dữ liệu của chính người đăng nhập: không 403 / không tìm thấy. Mẫu thêm: Minh Anh có 1 người theo dõi (Khoa), đang theo dõi 3 (Tuấn, Hà, Khoa); HLV Tuấn 1 / 1.

#### Hồ sơ của tôi — `profile`

**1. Mục đích** — Xem nhanh hồ sơ của mình, đi sửa hồ sơ, Cài đặt, đăng xuất (xem BR-CAIDAT-01, BR-TAIKHOAN-30). Người chơi và HLV. Vào từ: avatar header của mọi màn tab (nhãn "Hồ sơ của tôi") — người chơi: Tổng quan, Thông số, Swing, HLV, Cộng đồng, Thông báo; HLV: Học viên, Cộng đồng, Thông báo, Hồ sơ; bước F12-01, F03-09. Đi tiếp: `settings/account`, `settings`, `people`, đăng xuất (→ Màn chào). HLV còn có tab "Hồ sơ" khác nội dung; avatar ở mọi tab HLV (kể cả tab Hồ sơ) vẫn mở màn này — trùng chức năng.

**2. Bố cục** (căn giữa, cuộn) — Header "Hồ sơ". **Khối danh tính**: ảnh đại diện lớn nhất (ảnh hoặc chữ tắt "MA" / "MT"); **họ tên** (tiêu đề lớn); **badge vai** "Người chơi" / "Huấn luyện viên"; dòng chi tiết nối " · ", bỏ phần trống — người chơi `Handicap <số>` · `<CLB / sân tập>` ("Handicap 14 · Sân tập Mỹ Đình"; số kiểu VN "13,5"), HLV `<Học viện>` · `<n> năm kinh nghiệm` ("GramGolf Academy Hà Nội · 12 năm kinh nghiệm"); không có phần nào → rỗng. **Đếm theo dõi** 2 cột (số lớn + nhãn) "Người theo dõi" / "Đang theo dõi" (Minh Anh 1 / 3; bỏ người chặn nhau — chặn xoá theo dõi hai chiều nên số giảm thật). **Ba nút dọc** rộng hết: "Chỉnh sửa hồ sơ" (phụ, icon bút) · "Cài đặt" (mức ba, icon bánh răng) · "Đăng xuất" (**nguy hiểm nhẹ**, icon log-out). **Không** hiện bio, email, SĐT, rating, đơn giá.

**3. Hành động** — Số theo dõi → `people` tab tương ứng của mình. "Chỉnh sửa hồ sơ" → `settings/account`. "Cài đặt" → `settings`. "Đăng xuất" → dialog; "Đăng xuất" trong dialog: xoá phiên, đóng mọi màn trong stack, thay bằng `/` (→ Màn chào), vuốt lui không quay lại được; "Huỷ" / chạm nền / back Android → đóng.

**4.** Không có.

**5. Trạng thái** — Mặc định (không khung xương, không tải, không lỗi) · Theo vai: badge + dòng chi tiết (`f12--ho-so-hlv`) · Theo dữ liệu: ảnh / chữ tắt; thiếu handicap hoặc CLB → chỉ phần có (Huy "Handicap 28"); số theo dõi có thể 0 · Sau khi sửa ở Tài khoản: dữ liệu mới (F12-03: ảnh mẫu, "Nguyễn Thị Minh Anh", "Handicap 13,5 · Sân tập Hồ Tây") · Chưa đăng nhập → `/`.

**6.** Dialog thường (không icon trạng thái) "Đăng xuất?" · "Bạn sẽ cần đăng nhập lại để tiếp tục." · "Huỷ" (mức ba) / "Đăng xuất" (nguy hiểm).

**7. A11y** — Ảnh "Ảnh đại diện <tên>". Mỗi cột đếm là nút "Người theo dõi: 1" / "Đang theo dõi: 3", nới vùng chạm. Dialog modal (`accessibilityViewIsModal`), tiêu đề role header. Đăng xuất phải xoá stack.

**8. Tham chiếu** Story `f12--b-01-ho-so`, `f12--ho-so-hlv`, `f03--b-09-dang-xuat` (dialog), `f12--b-03-ho-so-sau-sua`, `f03--ho-so`. Figma L `48:1217` · D `48:5716` · ref `48:1203`. Nguồn `app/profile.tsx`, `components/People.tsx`, `StackHeader.tsx`, `TabHeader.tsx`, `lib/selectors.ts`, `lib/format.ts`.

#### Cài đặt — `settings/index`

**1. Mục đích** — Danh mục vào các trang cài đặt con (xem BR-CAIDAT-10). Người chơi và HLV; code **không** chặn người chưa đăng nhập (mở link vẫn thấy danh sách, chú thích Quyền riêng tư bản người chơi; chạm trang con nào cũng về `/`, trừ Dev). Vào từ: "Cài đặt" ở `profile` và tab Hồ sơ HLV. Đi tiếp: 5 trang con + `settings/dev` (bản dev).

**2. Bố cục** — Header "Cài đặt". Một danh sách hàng, không chia nhóm, mỗi hàng có chevron:

| # | Tiêu đề | Chú thích | Icon |
|---|---|---|---|
| 1 | Tài khoản | "Tên, số điện thoại, giới thiệu" | người (user-circle) |
| 2 | Mật khẩu | — | ổ khoá |
| 3 | Quyền riêng tư | người chơi "Ai xem được bộ gậy, swing; người đã chặn" · HLV "Người đã chặn, xoá tài khoản" | khiên |
| 4 | Thông báo | — | chuông |
| 5 | Đơn vị đo | "Mét hoặc yard" | thanh trượt |
| 6 | Dev *(bản dev)* | "Đổi hồ sơ mẫu, đặt lại dữ liệu" | code |

Không có: đăng xuất (ở `profile`), phiên bản app, Giao diện, trợ giúp, điều khoản.

**3–6.** Chạm cả hàng → trang con; quay lại → `profile` / `(coach)/me`. 6 hàng ở bản dev (Storybook, ảnh chụp), 5 ở bản phát hành; chỉ chú thích "Quyền riêng tư" khác theo vai (`f12--cai-dat-hlv`). Không rỗng, tải, lỗi.

**7. A11y** — Mỗi hàng là nút, đọc tiêu đề kèm chú thích; cả hàng là vùng chạm.

**8. Tham chiếu** Story `f12--b-04-cai-dat`, `f12--cai-dat-hlv`, `f03--cai-dat`. Figma L `48:1278` · D `48:5731` · ref `48:1205`; hàng dùng component local `ListItem · Icon (local)` `48:3898`. Nguồn `app/settings/index.tsx`.

**Lệch spec:** spec §4 có mục "giao diện" — code không có, theme theo hệ thống (D12). Không chuyển hướng khi chưa đăng nhập.

#### Tài khoản (sửa hồ sơ) — `settings/account`

**1. Mục đích** — Sửa hồ sơ của mình: chung (ảnh, họ tên, SĐT, giới thiệu); người chơi (handicap, CLB); HLV (học viện, số năm, đơn giá) (xem BR-TAIKHOAN-25…28). Vào từ: "Chỉnh sửa hồ sơ" ở `profile` / tab Hồ sơ HLV; hàng "Tài khoản". Đi tiếp: lưu xong toast 1,2 s rồi quay lại (không lịch sử → `/profile`).

**2. Bố cục** — Header "Tài khoản". Vùng cuộn: (1) ảnh đại diện lớn nhất căn giữa — ảnh hoặc chữ tắt **cập nhật trực tiếp theo ô Họ tên** (ô trống dùng tên đã lưu); dưới 1–2 nút cùng hàng: "Chọn ảnh" / "Đổi ảnh" (icon ảnh +) và "Dùng chữ tắt" (khi có ảnh); (2) **Họ tên** ("Nguyễn Minh Anh"); (3) **Số điện thoại** (điền đúng như đã lưu "0912 345 678"); (4) **Giới thiệu** (nhiều dòng) — HLV bộ đếm `<n>/300 ký tự · tối thiểu 20`, người chơi "Tuỳ chọn, tối đa 300 ký tự"; (5) người chơi: Handicap ("14"), "CLB / sân tập (tuỳ chọn)" ("Sân tập Mỹ Đình"); HLV: "Học viện / CLB" ("GramGolf Academy Hà Nội"), "Số năm kinh nghiệm" ("12"), "Đơn giá (đ/giờ, tuỳ chọn)" ("450.000"). Footer cố định: lỗi tổng · "Đang lưu…" · nút chính "Lưu". Không có ô email; không xác thực lại SĐT bằng OTP (F12 ghi "chưa có").

**3. Hành động**

| Phần tử | Kết quả |
|---|---|
| "Chọn ảnh" / "Đổi ảnh" | ảnh mẫu kế tiếp (xoay vòng 4, chưa có thì ảnh 1); **chỉ xem trước, lưu khi bấm Lưu**; mock, chưa mở thư viện / camera |
| "Dùng chữ tắt" | bỏ ảnh (xem trước) |
| "Lưu" (bật trừ khi đang lưu / đã lưu xong; bật cả khi chưa sửa gì) | lỗi → lỗi theo trường + lỗi tổng; hợp lệ → "Đang lưu…" 0,6 s → thành công / thất bại. Khi lưu: họ tên trim + gộp khoảng trắng; SĐT lưu **không khoảng trắng** ("0912345678"); ô tuỳ chọn để trống (giới thiệu người chơi, CLB, đơn giá) **xoá giá trị cũ**; ảnh lưu cùng; `profile`, header các tab, `(coach)/me` cập nhật ngay |
| "Thử lại" (toast) | gỡ toast, chạy lại Lưu |
| Quay lại | rời **không hỏi**, mất thay đổi; đang lưu thì huỷ lần lưu |

**4. Trường nhập** (lỗi thay trợ giúp; thời điểm theo 12.1)

| Nhãn | Placeholder / trợ giúp | Bàn phím | Quy tắc | Chữ lỗi |
|---|---|---|---|---|
| Họ tên | "Nguyễn Văn A" | thường (name) | bắt buộc, không trống sau trim | "Bắt buộc" |
| Số điện thoại | "0912345678" | tel | bắt buộc; bỏ khoảng trắng; 10 số, bắt đầu 0; không trùng hồ sơ khác | "Bắt buộc" · "Gồm 10 số, bắt đầu bằng 0" · "Số điện thoại đã có tài khoản" |
| Giới thiệu (HLV) | "VD: 8 năm dạy swing cơ bản và tempo cho người mới, chuyên short game." | nhiều dòng, **chặn 300** | bắt buộc, 20–300 sau trim | "Bắt buộc" · "Tối thiểu 20 ký tự" · "Tối đa 300 ký tự" |
| Giới thiệu (người chơi) | "Vài dòng về lối chơi, mục tiêu của bạn" | nhiều dòng, chặn 300 | ≤ 300 | "Tối đa 300 ký tự" (không gặp) |
| Handicap *(người chơi)* | "VD: 18,5" · "Từ 0 đến 54" | số thập phân | **bắt buộc** (nhãn không ghi); 0–54; "," hoặc "." | "Bắt buộc" · "Không phải số" · "Trong khoảng 0–54" |
| CLB / sân tập (tuỳ chọn) | "VD: Sân tập Mỹ Đình" | thường | — | — |
| Học viện / CLB *(HLV)* | "VD: Học viện Golf Sông Bé" | thường | bắt buộc | "Bắt buộc" |
| Số năm kinh nghiệm *(HLV)* | "VD: 8" · "Từ 0 đến 60" | số nguyên | bắt buộc, 0–60 | "Bắt buộc" · "Không phải số" · "Số nguyên 0–60" |
| Đơn giá (đ/giờ, tuỳ chọn) *(HLV)* | "VD: 450.000" · "Tối đa 10.000.000 đ" | số | bỏ dấu chấm, khoảng trắng; chỉ chữ số; ≤ 10.000.000 | "Số tiền không hợp lệ" · "Tối đa 10.000.000 đ" |

**5. Trạng thái** — Mặc định (điền sẵn) · **Lỗi**: footer Negative "Chưa lưu: <N> trường cần sửa." (`f12--tai-khoan-loi`: họ tên trống, SĐT trùng của Trần Thu Lan, handicap 60 → "Chưa lưu: 3 trường cần sửa."); HLV giới thiệu ngắn → "Tối thiểu 20 ký tự" (`f12--b-11-bio-hlv-loi`) · Đang lưu · **Thành công**: toast "Đã lưu hồ sơ", nút khoá, 1,2 s sau quay lại · **Thất bại** (cờ Dev): toast "Lưu thất bại" · "Mất kết nối — thông tin tài khoản chưa được lưu." · "Thử lại", 4 s, không ghi gì, ở lại form · Theo vai: người chơi Handicap + CLB; HLV Học viện + Số năm + Đơn giá, giới thiệu bắt buộc có bộ đếm · Ảnh: chữ tắt + "Chọn ảnh" / ảnh + "Đổi ảnh" + "Dùng chữ tắt". Không khung xương, rỗng, 403, 404.

**6.** Toast như mục 5.

**7. A11y** — Nhãn đọc = nhãn ô; ảnh "Ảnh đại diện <tên>". Lỗi tổng và "Đang lưu…" role alert, vòng xoay ẩn (không đọc hai lần). `KeyboardAvoid`. Bàn phím đúng loại: tel, số thập phân, số nguyên.

**8. Tham chiếu** Story `f12--b-02-sua-tai-khoan`, `f12--tai-khoan-loi`, `f12--tai-khoan-hlv`, `f12--tai-khoan-da-luu` (toast), `f13--dang-luu-tai-khoan`, `f12--b-11-bio-hlv-loi`, `f02--tai-khoan-bio-ngan`. Figma L `48:1686` · D `48:5740` · ref `48:1207`. Nguồn `app/settings/account.tsx`, `lib/validation.ts`, `lib/simulate.ts`, `components/Feedback.tsx`, `KeyboardAvoid.tsx`.

**Lệch spec / lưu ý:** handicap bắt buộc nhưng nhãn không ghi, trong khi ô CLB ghi "(tuỳ chọn)".

#### Đổi mật khẩu — `settings/password`

**1. Mục đích** — Đổi mật khẩu; mock: không gọi server, không kiểm mật khẩu hiện tại, không lưu (xem BR-TAIKHOAN-24, BR-CAIDAT-26). Vào từ: hàng "Mật khẩu". Đi tiếp: đổi xong toast 1,2 s rồi quay lại (không lịch sử → `/settings`).

**2. Bố cục** — Header "Mật khẩu". 3 ô mật khẩu (ẩn ký tự, trống lúc mở): "Mật khẩu hiện tại"; "Mật khẩu mới" (trợ giúp "Tối thiểu 8 ký tự, có ít nhất 1 chữ số"); "Nhập lại mật khẩu mới". Mỗi ô có nút mắt — **một công tắc chung cho cả 3 ô** (để so mật khẩu mới với ô nhập lại). Footer cố định: lỗi tổng · nút chính "Đổi mật khẩu". Không có "Quên mật khẩu" (chỉ ở Đăng nhập).

**3. Hành động** — Nút mắt: hiện / ẩn cả 3 ô ("Hiện mật khẩu" / "Ẩn mật khẩu"). "Đổi mật khẩu" (bật trừ khi đã đổi xong): lỗi → hiện; hợp lệ → thành công **ngay** (không đang xử lý, không giả lập lỗi). Quay lại: không hỏi.

**4. Trường nhập** (bắt buộc; không tự viết hoa)

| Nhãn | Placeholder / trợ giúp | autoComplete | Quy tắc | Chữ lỗi |
|---|---|---|---|---|
| Mật khẩu hiện tại | "Nhập mật khẩu đang dùng" | current-password | không trống (không kiểm đúng / sai) | "Bắt buộc" |
| Mật khẩu mới | "Tối thiểu 8 ký tự, có chữ số" · trợ giúp như trên | new-password | ≥ 8, ≥ 1 chữ số; khác mật khẩu hiện tại | "Bắt buộc" · "Tối thiểu 8 ký tự, có ít nhất 1 chữ số" · "Phải khác mật khẩu hiện tại" |
| Nhập lại mật khẩu mới | "Nhập lại mật khẩu mới" | new-password | trùng mật khẩu mới | "Bắt buộc" · "Mật khẩu nhập lại không khớp" |

**5. Trạng thái** — Mặc định (3 ô trống, ẩn) · Lỗi: lỗi theo ô + footer Negative "Chưa đổi: <N> trường cần sửa." (F03-07: nhập lại khác → "Mật khẩu nhập lại không khớp", "Chưa đổi: 1 trường cần sửa.") · Thành công: toast "Đã đổi mật khẩu", nút khoá, 1,2 s sau quay lại. Không đang xử lý, lỗi mạng.

**6.** Toast "Đã đổi mật khẩu".

**7. A11y** — Nút mắt là nút riêng, nhãn đổi theo trạng thái, nới vùng chạm. autoComplete đúng loại. `KeyboardAvoid`; lỗi tổng role alert.

**8. Tham chiếu** Story `f03--b-07-doi-mk-loi`, `f03--b-08-doi-mk-xong`, `f12--mat-khau`, `f03--doi-mat-khau`. Figma L `48:1786` · D `48:5756` · ref `48:1209`. Nguồn `app/settings/password.tsx`, `lib/validation.ts`.

**Lệch spec:** quy ước dự án đòi đang tải + lỗi + thử lại cho thao tác lưu — màn này không có, cờ Dev không tác động.

#### Quyền riêng tư — `settings/privacy`

**1. Mục đích** — Người chơi chọn công khai bộ gậy / danh sách swing; xem và bỏ chặn người đã chặn; xoá tài khoản (xem BR-CAIDAT-11, 12, BR-CONGDONG-30, BR-TAIKHOAN-31). Khác theo vai. Vào từ: hàng "Quyền riêng tư" (việc **chặn** nằm ở `users/[id]`, `coaches/[id]`; F12-09 chặn Khoa từ Cộng đồng). Đi tiếp: xoá tài khoản xong → đăng xuất về `/`.

**2. Bố cục** — Header "Quyền riêng tư". 3 khối (tiêu đề + chú thích):
1. "Ai xem được dữ liệu của bạn" (*chỉ người chơi*): "Mặc định chỉ bạn và HLV đã kết nối xem được"; 2 hàng công tắc mặc định **tắt**: "Công khai bộ gậy", "Công khai danh sách swing".
2. "Người đã chặn": "Hai bên không thấy bài của nhau và không theo dõi được nhau."; người đã chặn **theo thứ tự chặn** (cũ trước), không giới hạn; hàng: avatar vừa, họ tên, nút nhỏ "Bỏ chặn" cuối hàng ("ĐK · Lê Đăng Khoa · [Bỏ chặn]"); rỗng: dòng phụ "Bạn chưa chặn ai." (dữ liệu mẫu mặc định rỗng, không CTA).
3. "Tài khoản": "Xoá vĩnh viễn hồ sơ và toàn bộ dữ liệu của bạn trên GramGolf." + nút **nguy hiểm nhẹ** rộng "Xoá tài khoản" (icon thùng rác).

**3. Hành động** — Công tắc (chạm cả hàng hoặc công tắc): lưu **ngay**, không nút lưu, không toast, không giả lập lỗi. "Bỏ chặn": gỡ ngay, không hỏi; hàng biến mất (còn 0 → "Bạn chưa chặn ai."); toast "Đã bỏ chặn <tên>" (bỏ liên tiếp thì toast chạy lại cho người mới); **theo dõi cũ không được khôi phục**. "Xoá tài khoản" → dialog bước 1 → "Tiếp tục" đổi nội dung **cùng dialog** sang bước 2 (không chồng dialog) → "Xoá vĩnh viễn": đóng dialog, đăng xuất, đóng stack, về `/` (**mock: chỉ đăng xuất, dữ liệu còn trong phiên**). "Huỷ" / chạm nền / back Android → đóng; mở lại bắt đầu từ bước 1.

**4.** Không có.

**5. Trạng thái** — Mặc định người chơi: 3 khối, 2 công tắc tắt, "Bạn chưa chặn ai." · Có người đã chặn (`f12--b-09-nguoi-da-chan`) · Rỗng sau bỏ chặn (`f12--b-10-bo-chan`) · HLV: **không** có khối "Ai xem được…", dialog bước 1 nội dung riêng (`f12--quyen-rieng-tu-hlv`, `f12--xoa-tai-khoan-hlv`). Không khung xương, đang xử lý, lỗi mạng.

**6.** Dialog xoá tài khoản 2 bước, kiểu **Negative** (icon cảnh báo đỏ), nút chính nguy hiểm, phụ "Huỷ": bước 1 "Xoá tài khoản?" — người chơi "Hồ sơ, thông số, swing, bộ gậy, bài đăng và kết nối với HLV sẽ bị xoá vĩnh viễn." / HLV "Hồ sơ, bài đăng và kết nối với học viên sẽ bị xoá vĩnh viễn." · "Tiếp tục"; bước 2 "Xác nhận lần cuối" — "Không thể hoàn tác. Bạn sẽ được đăng xuất ngay sau khi xoá." · "Xoá vĩnh viễn". Toast "Đã bỏ chặn <tên>".

**7. A11y** — Tiêu đề khối role header. "Bỏ chặn" đọc "Bỏ chặn <tên>"; hàng **không** bấm được, chỉ nút. Hàng công tắc: chạm cả hàng, công tắc mang nhãn chữ của hàng. Dialog modal; khi đóng, nội dung giữ ở bước đang hiện tới khi mờ hẳn.

**8. Tham chiếu** Story `f12--b-05-quyen-rieng-tu`, `f12--b-09-nguoi-da-chan`, `f12--b-13-xoa-tai-khoan`, `f12--xoa-tai-khoan-lan-cuoi`, `f12--quyen-rieng-tu-hlv`, `f12--b-10-bo-chan`, `f12--xoa-tai-khoan-hlv`. Figma L `48:3967` · D `48:5765` · ref `48:1211`. Nguồn `app/settings/privacy.tsx`, `components/Section.tsx`, `lib/reducer.ts`.

**Lệch spec / lưu ý:** hai công tắc công khai **chỉ lưu** — chưa màn nào cho người khác xem bộ gậy / swing công khai. Xoá tài khoản là mock (chỉ đăng xuất). Bỏ chặn, xoá tài khoản không có đang xử lý / lỗi + thử lại.

#### Cài đặt thông báo — `settings/notifications`

**1. Mục đích** — Bật / tắt **thông báo đẩy** theo loại và giờ yên lặng; danh sách trong app (`notifications`) vẫn hiện đủ mọi loại (xem BR-CONGDONG-40). Vào từ: hàng "Thông báo" (danh sách thông báo **không** có lối tắt sang đây). Đi tiếp: chỉ quay lại.

**2. Bố cục** — Header "Thông báo". Khối "Nhận thông báo khi", chú thích "Thông báo đẩy về điện thoại. Mục trong chuông thông báo vẫn hiện đủ."; hàng công tắc theo vai, thứ tự cố định, **mặc định bật**: "Ghi chú của HLV" (người chơi) · "Phân tích swing xong" (người chơi) · "Học viên đăng swing mới" (HLV) · "Lời mời và yêu cầu kết nối" · "Kết nối được chấp nhận" · "Người theo dõi mới" · "Lượt thích bài viết" · "Bình luận bài viết" — người chơi 7 hàng, HLV 6. Khối "Giờ yên lặng": công tắc "Giờ yên lặng (22:00–07:00)", chú thích "Không rung, không chuông trong khung giờ này", mặc định **tắt**, khung giờ cố định.

**3–6.** Chạm cả hàng hoặc công tắc: đổi và lưu **ngay** (không nút lưu, toast, giả lập lỗi). Mặc định mọi loại bật, giờ yên lặng tắt; theo vai (`f12--cai-dat-thong-bao-hlv`). Không rỗng, tải, lỗi, dialog.

**7. A11y** — Tiêu đề khối role header; công tắc mang nhãn chữ của hàng, đọc trạng thái bật / tắt; cả hàng là vùng chạm.

**8. Tham chiếu** Story `f12--b-06-cai-dat-thong-bao`, `f12--cai-dat-thong-bao-hlv`. Figma L `48:4021` · D `48:5787` · ref `48:1213`. Nguồn `app/settings/notifications.tsx`, `lib/mock.ts`. **Lưu ý:** push thật ngoài phạm vi — tuỳ chọn chỉ được lưu, không chỗ nào đọc tới.

#### Đơn vị đo — `settings/units`

**1. Mục đích** — Chọn **hiển thị** khoảng cách mét hay yard; dữ liệu luôn lưu mét (xem BR-SOLIEU-30, BR-TAIKHOAN-16). Vào từ: hàng "Đơn vị đo". Đi tiếp: quay lại (F12-08: chọn Yard rồi về Tổng quan thì carry theo yard).

**2. Bố cục** — Header "Đơn vị đo". Khối "Khoảng cách", chú thích "Áp dụng cho carry ở Tổng quan, Thông số, Bộ gậy và form nhập. Dữ liệu đã lưu không đổi."; radio 2 hàng: "Mét" — "Ví dụ: Carry 228 m"; "Yard" — "Ví dụ: Carry 249 yd" (tính từ 228 m, làm tròn); mặc định Mét.

**3–6.** Chạm hàng: chọn và lưu **ngay**, không nút lưu, không toast. Mét (`f12--don-vi-met`) / Yard (`f12--b-07-don-vi`). Không tải, lỗi, khác biệt theo vai, dialog.

**7. A11y** — Radiogroup nhãn "Đơn vị khoảng cách", mỗi hàng là radio có nhãn; cả hàng là vùng chạm.

**8. Tham chiếu** Story `f12--b-07-don-vi`, `f12--don-vi-met`, `f12--b-08-tong-quan-yard` (tác dụng ở Tổng quan). Figma L `48:4102` · D `48:5807` · ref `48:1215`. Nguồn `app/settings/units.tsx`, `lib/format.ts`. **Lưu ý:** chỉ đổi khoảng cách; mph, rpm, °, kg không đổi; không làm hệ Imperial đầy đủ.

#### Dev (công cụ phát triển) — `settings/dev`

**Không có ở bản phát hành** (hàng "Dev" ẩn, mở link → `/`); chỉ để demo / kiểm thử, **không cần thiết kế lại theo chuẩn sản phẩm** (xem BR-CAIDAT-27, 28). Không cần đăng nhập. Vào từ: hàng "Dev" ở Cài đặt; "Dùng tài khoản mẫu" ở Màn chào (bản dev). Nội dung trên → dưới: (1) header "Dev", phụ đề "Chỉ có ở bản phát triển"; (2) **Kiểm tra theo luồng**: đoạn mô tả + 13 hàng `F1 · Người chơi mới` … `F13 · Trạng thái xuyên suốt`, mỗi hàng có dòng gợi ý tài khoản và bước đầu; chạm → đặt lại dữ liệu mẫu, tắt giả lập lỗi, đăng nhập đúng tài khoản (hoặc đăng xuất), mở bước 1; (3) **Người chơi / HLV**: hồ sơ mẫu, dòng phụ `p-minh · Handicap 14` / `c-tuan · GramGolf Academy Hà Nội`, tài khoản đang đăng nhập được đánh dấu chọn; chạm → đăng nhập rồi về `/`; (4) **Giả lập**: công tắc "Giả lập lỗi khi lưu/xoá", dòng phụ "Lưu số liệu, gậy, tài khoản, bài viết và các nút xoá sẽ thất bại sau 0,6 giây — để xem toast lỗi và Thử lại"; (5) **Dữ liệu**: nút nguy hiểm nhẹ "Đặt lại dữ liệu mẫu" → dialog Warning "Đặt lại dữ liệu mẫu?" · "Mọi thay đổi trong phiên (thông số, swing, bài viết, kết nối…) sẽ mất. Hồ sơ đang đăng nhập được giữ." · "Huỷ" / "Đặt lại" (nguy hiểm); nút "Gallery DS" → `(dev)/ds`. Story `f12--dev`, `f12--dev-dat-lai`, `f12--dev-kiem-tra-theo-luong`, `f13--b-07-bat-gia-lap-loi`. Không có Figma. Nguồn `app/settings/dev.tsx`.

### 12.8 Khoảng trống cho thiết kế lại

Trạng thái / hành vi code hiện **chưa có** mà bản thiết kế mới nên chừa chỗ (mỗi dòng: khoảng trống — màn).

**Tải, lưu, lỗi**
- Đang xử lý + lỗi mạng + "Thử lại" cho gửi OTP, đăng nhập, gửi link, đặt lại mật khẩu (auth đang mock tức thì) — Đăng ký, OTP, Đăng nhập, Quên / Đặt lại mật khẩu.
- Lỗi tải lần đầu + "Thử lại" (khung xương chỉ có nhánh thành công) — Tổng quan, Thông số, Swing, Bộ gậy, Học viên, Chi tiết học viên, Bảng tin, Thông báo.
- Đang lưu + lưu thất bại + "Thử lại" khi lưu CSV / ảnh (ghi ngay, cờ Dev không tác động) — Nhập file CSV, Ảnh chụp màn hình.
- Đang xử lý / lỗi / "Thử lại" cho mọi thao tác kết nối (tạo / thu hồi mã, gửi, duyệt, từ chối, chấp nhận mã, đặt HLV chính, huỷ) — Học viên, Chi tiết học viên, HLV (tab), Mời học viên, Nhập mã mời, Hồ sơ HLV.
- Đang xử lý / lỗi cho lưu trữ / khôi phục gậy, xoá bài, gửi bình luận, báo cáo, thích, theo dõi, chặn, bỏ chặn, đổi mật khẩu, xoá tài khoản — Chi tiết gậy, Chi tiết bài viết, Cộng đồng, Hồ sơ người chơi / HLV, Quyền riêng tư, Đổi mật khẩu.
- Phản hồi sau khi lưu / xoá thành công (đang chỉ quay lại, không toast) — Thêm / Sửa gậy, Chi tiết phiên, Chi tiết gậy, Chi tiết swing.

**Xác nhận & điều hướng**
- Hỏi "Bỏ thay đổi?" khi rời form đang gõ dở (quay lại / vuốt) — Nhập tay / Sửa phiên, Thêm / Sửa gậy, Đăng swing, Đăng bài, Tài khoản, Đổi mật khẩu.
- Cổng cho người đã đăng nhập mở Màn chào / Đăng nhập / Đăng ký bằng URL; cổng đăng nhập cho `settings/index` — Màn chào, Đăng ký, Đăng nhập, Cài đặt.
- Lối "Đã có tài khoản? Đăng nhập"; "Gửi lại" / "Đổi email" ở "Kiểm tra hộp thư"; thông báo "đã gửi lại mã", "đã đăng xuất" — Đăng ký, Quên mật khẩu, OTP, Màn chào.
- Lối "Mời học viên" khi đã có học viên; thứ tự học viên (theo tên / cần phản hồi trước?) — Học viên.
- Gộp hai màn hồ sơ của HLV — Hồ sơ (tab HLV), Hồ sơ của tôi.
- Phản hồi thống nhất (toast, được đọc to) sau gửi / huỷ / chấp nhận / từ chối kết nối — Hồ sơ HLV (đang không toast) so với HLV (tab), Học viên.
- "Xem tất cả" cho swing / phiên gần đây (chỉ 3 mục) — Chi tiết gậy.
- Nút Quay lại trong trạng thái chặn; bỏ chặn tại hồ sơ — Theo dõi, Hồ sơ người chơi / HLV.

**Tính năng còn giả lập / chưa làm**
- Chọn ảnh / video / file thật (thư viện, camera, trình chọn file), khung crop thật, trạng thái tải ảnh lên — Onboarding, Tài khoản, Ảnh chụp màn hình, Đăng swing, Nhập file CSV.
- Camera / QR thật; phiên QR đang lưu nguồn "CSV" nên tag "QR" không xuất hiện — Quét QR.
- Ô Ngày cho phiên từ ảnh; tách file CSV nhiều gậy; trường ghi chú phiên (`note`) — Ảnh chụp màn hình, Nhập file CSV, Nhập tay, Chi tiết phiên.
- Kéo tua tự do trên thanh thời gian video; chỉ số ở trạng thái "Cần xem lại" — Chi tiết swing.
- Badge ghi chú HLV ở kiểu Lưới; lọc khoảng ngày tuỳ ý; khung xương dạng lưới — Swing (tab), Bộ gậy.
- Sửa bài, xoá / sửa bình luận, thích bình luận (tim đang hiện mà không làm gì), trả lời lồng cấp, đính kèm ảnh, lọc theo tag, kéo làm mới / phân trang — Chi tiết bài viết, Đăng bài, Cộng đồng.
- Tin nhắn thật khi "Gửi" ở sheet chia sẻ (đang chỉ sao chép); deep link `gramgolf.app/i/<mã>` — sheet Chia sẻ bài / mã, Mời học viên.
- Ô tìm trong `people`; nhóm thông báo theo ngày như spec; số chưa đọc trên thanh tab HLV; xoá / vuốt từng thông báo — Theo dõi, Thông báo, Thông báo (tab HLV).
- Công khai bộ gậy / swing có tác dụng; push thật + giờ yên lặng; xoá tài khoản thật; ô email, xác thực lại SĐT; mục Giao diện, phiên bản app, trợ giúp, điều khoản — Quyền riêng tư, Cài đặt thông báo, Tài khoản, Cài đặt.

**A11y & tương tác**
- Lỗi form, khung thông báo, chuyển trạng thái chưa được đọc to (cần live region) — Đăng ký, OTP, Onboarding, Đăng nhập, Quên / Đặt lại mật khẩu, Hồ sơ HLV.
- Nhãn ô OTP là "OTP" tiếng Anh; nhãn "Gửi lại mã sau {n} s" đổi mỗi giây — OTP.
- Enter chưa chuyển ô kế / chưa gửi; ô Email/SĐT luôn bàn phím email; một nút mắt điều khiển 2 ô — Đăng nhập, Quên / Đặt lại mật khẩu.
- Chạm "Gửi lời mời" khi bàn phím mở phải chạm 2 lần — Mời học viên.
- Hàng trong sheet "lượt thích" chưa là nút với trình đọc — Chi tiết bài viết.
- Trạng thái chưa đọc cần tín hiệu ngoài màu / chấm — Thông báo.
- Nút Huỷ kết nối chỉ có icon; thanh 5 tab + badge chưa vừa 390 px; rỗng theo tab chưa dùng EmptyState + CTA — Chi tiết học viên.
- Báo cáo / Chặn / Đặt HLV chính là nút thẳng vì iOS kẹt khi mở Dialog ngay sau sheet — nếu gom vào menu ⋯ phải xử lý giới hạn này — Hồ sơ HLV, Hồ sơ người chơi, HLV (tab).
- Nhãn "bắt buộc" cho Handicap (ô CLB ghi "tuỳ chọn" còn Handicap không ghi) — Tài khoản.

---

## Phụ lục: tài liệu nguồn

| Tài liệu | Nội dung chính |
|---|---|
| [handoff-2026-08-15.md](handoff-2026-08-15.md) | Handoff Swingboard ban đầu: tổng quan, vai trò, sitemap, 7 user flow, mô hình dữ liệu prototype, yêu cầu production, câu hỏi mở |
| [tech-stack-review-2026-08-15.md](tech-stack-review-2026-08-15.md) | Đánh giá tech stack: mô hình dữ liệu backend, ma trận RLS, pipeline import CSV / OCR, job phân tích |
| [mvp-checklist.md](mvp-checklist.md) | Đối chiếu 38 mục MVP issue #1 với app đã làm, kèm lý do các mục không làm |
| [../superpowers/specs/2026-10-07-gramgolf-ui-design.md](../superpowers/specs/2026-10-07-gramgolf-ui-design.md) | Spec UI đang áp dụng: quyết định D1–D13, điều hướng, danh mục màn, tiêu chí nghiệm thu |
| [../superpowers/plans/2026-10-07-gramgolf-ui.md](../superpowers/plans/2026-10-07-gramgolf-ui.md) | Plan thực thi Phase 1 (Task 1–14) và Phase 2 (Task 15–30) |
| [../superpowers/reports/2026-10-08-gramgolf-ui-bao-cao.md](../superpowers/reports/2026-10-08-gramgolf-ui-bao-cao.md) | Báo cáo build: quyết định của chủ dự án, quyết định tự chốt kèm "nếu sai", toàn bộ ruling |
| [../flows/README.md](../flows/README.md) | 13 luồng F01–F13: cách kiểm (Expo Go, Storybook app, lượt tự động), tài khoản mẫu, mã thử |
| [../flows/F01.md](../flows/F01.md) … [../flows/F13.md](../flows/F13.md) | Từng bước của mỗi luồng theo app hiện tại: tài khoản, thao tác, kết quả mong đợi, ảnh |
| [../../apps/golf/lib/](../../apps/golf/lib/) | Nguồn sự thật: `domain.ts` (kiểu dữ liệu), `reducer.ts` (luật ghi, thông báo), `selectors.ts` (quyền, lọc, đếm), `validation.ts` (luật nhập), `csv.ts`, `simulate.ts`, `format.ts`, `mock.ts`, `ids.ts`, `store.tsx` và các `*.test.ts` |
