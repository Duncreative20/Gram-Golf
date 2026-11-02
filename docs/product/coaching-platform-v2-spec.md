# GramGolf — Coaching Platform V2

**Ngày:** 02/11/2026  
**Trạng thái:** Product spec mở rộng, phục vụ UI/UX, planning; **chưa triển khai code**.  
**Nguồn đối chiếu:** `docs/product/dac-ta-nghiep-vu.md`, `docs/superpowers/specs/2026-10-07-gramgolf-ui-design.md`, `docs/product/mvp-checklist.md`, `apps/golf/lib/domain.ts`.  
**Tham khảo:** [Skillest Scheduling](https://skillest.com/features/scheduling), [Student CRM](https://skillest.com/features/student-crm), [Online Lessons](https://skillest.com/features/online-lessons).

## 1. Định hướng

Nâng GramGolf từ app ghi nhận hiệu suất swing + HLV ghi chú thành nền tảng huấn luyện xuyên suốt: **Kết nối HLV → Chọn dịch vụ → Xem lịch trống → Đặt buổi học → HLV xác nhận → Buổi học → Video/nhận xét → Bài tập → Theo dõi tiến bộ → Đặt buổi tiếp theo.**

3 module trụ cột:
- **Student Management:** roster, hồ sơ học viên, kết nối, phân quyền, lịch sử.
- **Coaching Operations:** dịch vụ, lịch trống, calendar, booking, lesson session, review.
- **Performance Tracking:** dữ liệu swing, gậy, thể lực, nhận xét, lộ trình luyện tập.

## 2. Hiện trạng và nguyên tắc

Theo code/spec hiện hành đã có: roster HLV, mời/kết nối, nhiều HLV cho một golfer và tối đa một HLV chính; xem dữ liệu Golfer khi active, note theo mốc video, phân tích video mock, thông báo. Chưa có domain cho Booking, Availability, LessonSession, CoachService, TrainingPlan hay payment; đừng trình bày chúng như đã code.

Giữ Expo mobile-first, tiếng Việt, DS `@gr/ds`, UI mock có trạng thái; không làm lộ dữ liệu riêng cho người follow. Hủy kết nối thu hồi quyền xem. Trạng thái AI analysis tách khỏi review của HLV. Chuyển vai trực tiếp trên Home là đề xuất UI mới (spec 07/10 chỉ cho Dev switch). Cộng đồng chưa bị loại khỏi phạm vi sản phẩm.

## 3. Danh mục mở rộng

| ID | Module | HLV | Golfer | Ưu tiên |
|---|---|---|---|---|
| C01 | Coach Home | Overview, việc cần làm, lịch sắp tới | — | P0 |
| C02 | Student CRM | Roster, lọc, hồ sơ, kết nối | Kết nối nhiều HLV | P0, mở rộng cái đã có |
| C03 | Coach Services | Tạo dịch vụ, thời lượng, hình thức, địa điểm | Chọn loại buổi học | P0 |
| C04 | Availability | Giờ nhận học, nghỉ, block giờ | Xem giờ trống | P0 |
| C05 | Booking | Tạo, xác nhận, từ chối, đổi/hủy | Đặt, đổi/hủy, theo dõi yêu cầu | P0 |
| C06 | Teaching Calendar | Xem lịch ngày/tuần, giờ bận, buổi dạy | Lịch học của tôi | P0 |
| C07 | Lesson Session | Bắt đầu/kết thúc, mục tiêu, ghi chú | Xem lịch sử buổi học | P0 |
| C08 | Lesson Record | Gắn video/metrics, tổng kết | Xem kết quả buổi học | P0 |
| C09 | Swing Review | Queue, feedback timestamp, lịch sử | Upload video, xem góp ý | P0, mở rộng cái đã có |
| C10 | Notifications | Booking, swing, kết nối | Lời nhắc, thay đổi lịch | P0 |
| C11 | Training Plan & Drills | Giao bài tập, deadline, theo dõi tiến độ | Làm, nộp bài, xem kết quả | P1 |
| C12 | Messaging | Nhắn tin 1:1 với học viên | Trao đổi với HLV | P1 |
| C13 | Packages & Subscription | Bán/quản lý gói và buổi còn lại | Đăng ký gói học | P1 |
| C14 | Payments | Giao dịch/hoàn phí | Thanh toán/hóa đơn | P1 |
| C15 | Calendar / Video Integrations | Đồng bộ lịch, online meeting | Link học online | P2 |
| C16 | Group Clinics | Lịch nhóm, giới hạn chỗ | Tham gia lớp nhóm | P2 |
| C17 | Coach Analytics | Buổi học, thời gian phản hồi, hoạt động | — | P2 |

P0 là *core của bản coaching nâng cấp*, không có nghĩa đã thuộc MVP 07/10 hay đã hoàn thành.

## 4. Phân biệt thực thể

- **CoachService:** loại học (ví dụ Driver 60 phút, trực tiếp).
- **AvailabilityRule / TimeBlock:** giờ nhận học và thời gian nghỉ/bận.
- **Booking:** yêu cầu đặt ngày giờ với trạng thái xác nhận.
- **LessonSession:** buổi học có thời điểm, người tham gia, hình thức và trạng thái vận hành.
- **LessonRecord:** tổng kết, nhận xét, video và chỉ số gắn với lesson.
- **Swing / CoachNote:** video có thể nằm ngoài lesson; ghi chú của HLV trên video riêng biệt với phân tích AI.
- **TrainingPlan / DrillAssignment:** lộ trình và bài tập thực hành, có vòng đời riêng.
- **MetricSession:** bản ghi dữ liệu hiệu suất, không đồng nhất với LessonSession.

## 5. Booking và lịch dạy — luồng P0

### HLV cấu hình
1. Tạo dịch vụ: tên, thời lượng, học online/trực tiếp, địa điểm.
2. Cài khung giờ lặp theo ngày trong tuần; hỗ trợ ca sáng/chiều, ngày nghỉ, khoảng bận, buffer.
3. Chỉ công khai slot khả dụng, không lộ người đã đặt hoặc lý do bận.
4. Mặc định yêu cầu **HLV xác nhận**; auto-confirm cần quyết định sau.

### Golfer đặt buổi
Hồ sơ HLV → Đặt buổi học → Chọn loại dịch vụ → Ngày/giờ trống → Mục tiêu/lời nhắn → Gửi yêu cầu → Trạng thái **Chờ xác nhận** → HLV chấp nhận/từ chối → Thông báo → Lịch xuất hiện cho hai bên khi xác nhận.

### HLV tạo buổi học
Quick Action **Tạo buổi học** → chọn học viên active → dịch vụ → ngày giờ → gửi lời mời/xác nhận theo chính sách. **Lịch dạy** là nơi xem/quản lý; **Tạo buổi học** là action tạo mới.

### Xử lý ngoại lệ
Không được xác nhận 2 booking xung đột của cùng HLV. Kiểm tra lại ở transaction xác nhận, xét thời lượng và buffer. Đổi giờ/hủy lưu lịch sử và thông báo; không xóa lesson notes. Slot giữ tạm, hạn hủy, hoàn tiền, quy tắc công khai booking đều cần chốt trước production.

**BookingStatus:** `requested | confirmed | declined | expired | cancelled_by_coach | cancelled_by_player`.  
**LessonStatus:** `scheduled | in_progress | completed | no_show`.  
Reschedule là action và audit event, không được xóa bản ghi lịch sử.

## 6. Cấu trúc Home HLV V2

1. **Header & chuyển vai** (đề xuất; chưa triển khai như role switch production).
2. **Coach Profile** + CTA **Mời học viên**.
3. **Quick Actions:** Góp ý swing · Lịch dạy · Tạo buổi học · Học viên.
4. **Dashboard Overview:** 3 active, 2 học viên cần góp ý, 1 yêu cầu kết nối (demo); có thể thêm booking chờ xử lý khi có dữ liệu.
5. **Lịch dạy sắp tới:** tối đa 2–3 buổi, tên học viên, giờ, hình thức, trạng thái, CTA Xem lịch.
6. **Swing cần góp ý:** thumbnail, học viên, gậy, ngày, trạng thái; toàn card mở Swing Detail.
7. **Học viên của tôi:** tìm/lọc và mở Student Detail.
8. **Yêu cầu kết nối:** số đang chờ, CTA quản lý.
9. **Bottom nav đề xuất:** Tổng quan · Lịch dạy · Học viên · Video · Cá nhân. Chưa chốt, giữ không gian giải quyết tab Cộng đồng.

**Số demo** dùng cho thiết kế (HLV Nguyễn Nam Giang, Nguyễn Minh Khoa, Trần Thu Lan, Phạm Quốc Huy, người chờ Nguyễn Minh Anh) không phải tài khoản seed thực tế của repo.

## 7. Màn HLV cần thêm

- `CoachCalendar`: lịch ngày/tuần, buổi học, giờ bận, xem chi tiết.
- `AvailabilitySettings`: ca dạy lặp, ngày nghỉ và buffer.
- `CoachServices`: tạo/sửa loại buổi học.
- `CreateLesson`: HLV chủ động tạo buổi.
- `BookingRequests`: chờ, xác nhận, từ chối, đổi lịch.
- `LessonDetail`: thời gian, mục tiêu, trạng thái, media và ghi chú.
- `LessonHistory` / `LessonRecord`: lịch sử đã dạy, liên kết metrics/video.
- `StudentList` / `StudentDetail`: thêm tab lịch học và tiến độ.
- `ReviewQueue` / `SwingReview`: tái sử dụng luồng ghi chú video đã có.
- P1: `TrainingPlan`, `DrillAssignment`, `Conversation`, `Packages`, `PaymentHistory`.

## 8. Màn Golfer cần thêm

- Hồ sơ HLV: dịch vụ, giờ trống, CTA Đặt buổi học.
- Booking Wizard: chọn dịch vụ → ngày giờ → tóm tắt → gửi.
- Lịch học của tôi: chờ xác nhận, sắp tới, đã học, hủy/đổi.
- Lesson Detail: mục tiêu, video liên kết, nhận xét.
- P1: bài tập, lịch nộp, chat HLV, gói đã mua.

## 9. Data model gợi ý (chưa sửa `domain.ts`)

```ts
type LessonMode = 'in_person' | 'online';
type BookingStatus = 'requested' | 'confirmed' | 'declined' | 'expired'
  | 'cancelled_by_coach' | 'cancelled_by_player';
type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'no_show';

interface CoachService {
  id: ID; coachId: ID; name: string; mode: LessonMode;
  durationMin: number; locationText?: string; isActive: boolean;
}
interface AvailabilityRule {
  id: ID; coachId: ID; weekday: number; timezone: string;
  startLocal: string; endLocal: string; isEnabled: boolean;
}
interface TimeBlock {
  id: ID; coachId: ID; startsAt: ISO; endsAt: ISO;
  reason?: string; kind: 'unavailable' | 'vacation';
}
interface Booking {
  id: ID; coachId: ID; playerId: ID; serviceId: ID;
  startsAt: ISO; endsAt: ISO; status: BookingStatus;
  requestedBy: Role; goal?: string; createdAt: ISO; updatedAt: ISO;
}
interface LessonSession {
  id: ID; bookingId?: ID; coachId: ID; playerId: ID;
  startsAt: ISO; endsAt: ISO; status: LessonStatus;
  mode: LessonMode; locationText?: string; goal?: string;
}
interface LessonRecord {
  id: ID; lessonId: ID; summary?: string;
  swingIds: ID[]; metricSessionIds: ID[];
}
interface DrillAssignment {
  id: ID; coachId: ID; playerId: ID; lessonId?: ID;
  title: string; instruction: string; dueAt?: ISO;
  status: 'assigned' | 'submitted' | 'completed';
}
```

## 10. Quyền, dữ liệu và nghiệm thu

**Quyền:** Nhiều HLV kết nối một Golfer, tối đa một HLV chính. HLV chỉ xem dữ liệu riêng tư có quyền; theo dõi mạng xã hội không cấp quyền. Khi hủy kết nối, thu hồi quyền xem ngay. Booking/calendar công khai chỉ được lộ slot còn trống; không lộ tên học viên khác. Quyền xem lịch sử lesson sau hủy cần chính sách riêng.

**Nghiệm thu:**
1. Giờ trống sinh đúng từ dịch vụ + availability + block + booking.
2. Golfer gửi yêu cầu → HLV chấp nhận → cả hai thấy cùng lịch và thông báo.
3. HLV tạo buổi học cho học viên đang kết nối.
4. Không xác nhận trùng lịch; hủy/đổi không mất audit.
5. Video/metrics gắn vào lesson được, video riêng lẻ vẫn giữ.
6. Review HLV tách khỏi AI, notes được phân quyền từng coach.
7. UI có empty, loading, error, retry cho booking/calendar/lesson.

## 11. Các pha thực hiện

- **Phase A:** Chốt nghiệp vụ booking và quyền; thiết kế Coach Home, Golfer booking, service/availability.
- **Phase B:** Mock end-to-end Booking → Calendar → Lesson → linked swing/video.
- **Phase C:** Training plan, drill, messaging, package/subscription.
- **Phase D:** Payment production, đồng bộ lịch, online call, group lessons, analytics.

**Open decisions:** tự xác nhận hay HLV duyệt; giữ slot bao lâu; dịch vụ cho mọi Golfer hay chỉ học viên đang kết nối; chính sách đổi/hủy/hoàn; trạng thái lesson sau mất kết nối; navigation và phạm vi chat/payment.
