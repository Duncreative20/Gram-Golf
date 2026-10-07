
SWINGBOARD
Đánh giá Tech Stack & Giải pháp chức năng
Từ prototype React đến MVP production có thể mở rộng
KẾT LUẬN NGẮN  Giữ React, Tailwind, Recharts và lucide-react. Chuyển sang Next.js + TypeScript cho web app; dùng Supabase cho Postgres, Auth, Storage, Realtime và RLS; tách OCR/video analysis sang worker Python chạy bất đồng bộ. Không nên đưa AI swing vào đường găng của MVP.
Dành cho
Product Owner  •  Designer  •  Frontend  •  Backend  •  Data/AI
Ngày đánh giá
15/08/2026

1. Mục đích và phạm vi đánh giá
Tài liệu này đọc lại bản handoff của Swingboard dưới góc độ triển khai production. Mục tiêu là trả lời ba câu hỏi: stack hiện tại giữ lại được gì, hệ thống thật nên xây theo kiến trúc nào, và từng chức năng cần giải pháp kỹ thuật cụ thể ra sao.
PHẠM VI  Đây là khuyến nghị kiến trúc cho MVP web responsive. Chưa phải specification cuối cùng, chưa thay thế discovery với sân tập/HLV và chưa phải cam kết chi phí của nhà cung cấp.
2. Executive summary
2.1 Quyết định kiến trúc đề xuất
Lớp
Lựa chọn đề xuất
Vai trò
Web app
Next.js (App Router) + React + TypeScript
UI, routing, SSR/server actions khi cần, PWA responsive
Design/UI
Tailwind CSS + component nội bộ; Radix/shadcn chỉ dùng làm primitive
Giữ đúng visual system Swingboard nhưng có accessibility tốt
Data & Auth
Supabase Postgres + Auth + RLS
Dữ liệu quan hệ, đăng nhập, phân quyền theo từng bản ghi
Media
Supabase Storage + resumable upload
Avatar, ảnh thông số, video swing; signed URL cho nội dung riêng tư
Realtime
Supabase Realtime
Cập nhật trạng thái job, ghi chú HLV và thông báo trong app
Background jobs
Supabase Queues + worker Python trên Cloud Run
OCR, FFmpeg, pose estimation, job retry và trạng thái xử lý
Monitoring
Sentry + structured logs; PostHog chỉ khi cần product analytics
Lỗi frontend/backend, performance và funnel sản phẩm
Testing
Vitest + Testing Library + Playwright + pgTAP/RLS tests
Unit, component, E2E và kiểm thử phân quyền dữ liệu

2.2 Tư duy triển khai
	•	Bắt đầu bằng modular monolith, không tách microservice theo từng tính năng. Chỉ tách worker xử lý media/AI vì khác runtime, tài nguyên và thời gian chạy.
	•	Giữ Postgres là nguồn sự thật duy nhất. Realtime, notification và queue đều phát sinh từ transaction/event rõ ràng, tránh state chỉ tồn tại trên client.
	•	AI swing là một subsystem thử nghiệm. MVP vẫn phải hữu ích khi chưa có AI: upload video, HLV xem, vẽ/ghi chú, và theo dõi tiến bộ.
	•	Mọi thay đổi schema phải đi qua migration trong Git; không tạo/chỉnh bảng trực tiếp trên production dashboard rồi hy vọng mọi thứ tự nhớ.
KHUYẾN NGHỊ MẠNH  Thiết kế dữ liệu coach–student theo quan hệ nhiều-nhiều ngay từ đầu, nhưng áp quy tắc “mỗi học viên chỉ có một HLV chính” bằng cột role/type và unique index. Khi nghiệp vụ mở rộng, không phải đập schema đi xây lại.
3. Đánh giá stack prototype hiện tại
Thành phần hiện tại
Đánh giá
Quyết định
React
Phù hợp
Giữ. Nâng lên codebase Next.js/TypeScript để có cấu trúc route, server boundary và deployment chuẩn.
Tailwind core utilities
Phù hợp
Giữ. Chuyển color/spacing/radius thành CSS variables hoặc Tailwind theme tokens.
Recharts
Phù hợp MVP
Giữ cho dashboard. Chỉ đổi nếu sau này cần chart tương tác rất lớn hoặc WebGL.
lucide-react
Phù hợp
Giữ. Thiết lập kích thước/stroke theo design token.
Inline style object
Nợ kỹ thuật
Loại dần; gom vào token, variant và component styles.
Một file JSX duy nhất
Không phù hợp production
Tách theo feature/domain; tránh chia component quá vụn chỉ để “sạch”.
Mock state trong memory
Chỉ dùng demo
Thay bằng Supabase; dùng optimistic UI có rollback cho like/follow.
Phân tích ngẫu nhiên
Chỉ dùng demo
Đổi thành job state machine; kết quả phải có model version, confidence và provenance.

3.1 Cấu trúc code đề xuất
Giữ cấu trúc theo domain thay vì gom mọi thứ vào một thư mục components khổng lồ:
	•	app/(auth), app/(player), app/(coach), app/community — route và layout theo trải nghiệm.
	•	features/metrics, features/swings, features/coaching, features/community — logic nghiệp vụ và UI theo tính năng.
	•	components/ui — primitive dùng chung: Button, Modal, Field, Card, Tabs, Toast.
	•	lib/supabase, lib/validation, lib/permissions — client/server adapter, Zod schema và helpers.
	•	supabase/migrations, supabase/seed.sql, supabase/tests — schema có version, dữ liệu mẫu và test RLS.
	•	workers/media-analysis — service Python riêng cho FFmpeg, OCR và pose estimation.

4. Kiến trúc production đề xuất
4.1 Luồng tổng thể
	•	Người dùng mở web/PWA → Next.js render UI và gọi Supabase bằng session của người dùng.
	•	Postgres + RLS quyết định bản ghi nào được đọc/ghi; frontend không phải nơi thi hành quyền hạn cuối cùng.
	•	Ảnh/video upload trực tiếp lên Storage bằng signed upload/resumable protocol, không đi xuyên qua Next.js server để tránh nghẽn và timeout.
	•	Sau upload, app tạo analysis_job. Queue giao job cho worker Python; worker tải media qua signed URL, xử lý, lưu kết quả và cập nhật trạng thái.
	•	Realtime đẩy trạng thái pending/processing/succeeded/failed về UI. Notification được tạo thành bản ghi riêng để audit và hiển thị lại.
4.2 Ranh giới trách nhiệm
Khối
Nên xử lý
Không nên xử lý
Next.js
UI, form validation, SSR khi hữu ích, route protection, API nhẹ
OCR dài, transcoding video, pose inference
Supabase Edge Functions
Webhook, signed request, notification dispatch, orchestration nhẹ
Job video kéo dài hoặc cần binary/model nặng
Postgres/RLS
Data integrity, permission, transaction, index, feed query
Xử lý frame video hoặc OCR
Worker Python
FFmpeg, OCR parser, MediaPipe/OpenCV, retry/idempotency
Giữ session UI hoặc quyết định quyền truy cập người dùng

4.3 Môi trường và workflow database
	•	Tối thiểu: local → dev/preview → production. Dev không dùng chung database với production.
	•	Mọi schema change bắt đầu bằng migration file. Chạy migration local, test RLS, mở PR, sau đó mới áp dụng lên dev/prod.
	•	Sinh TypeScript types từ schema sau migration; CI fail nếu code và database types lệch nhau.
	•	Seed data tách riêng; tuyệt đối không copy video hoặc dữ liệu cá nhân thật vào môi trường dev.
LÝ DO  Supabase khuyến nghị theo dõi schema bằng migration và phát triển cục bộ. Cách này đặc biệt quan trọng khi code được tạo/đổi bằng AI agent: agent chỉ được thay schema bằng migration có thể review và rollback.
5. Giải pháp theo từng chức năng
5.1 Auth, onboarding và vai trò
Nhu cầu
Giải pháp
Đăng ký/đăng nhập
Supabase Auth: email + password trước; OTP/social login thêm sau khi có nhu cầu.
Hồ sơ chung
auth.users chỉ lưu identity; bảng profiles lưu name, role, avatar, privacy flags.
Role player/coach
Role trong profiles; không tin role gửi từ client. Các thao tác nhạy cảm kiểm tra bằng RLS/DB function.
Xác minh HLV
Thêm coach_verification_status; badge HLV chỉ hiện khi verified nếu sản phẩm có marketplace.
Onboarding
Wizard lưu từng bước; cho phép resume. Handicap/CLB/kinh nghiệm nằm ở profile mở rộng.

5.2 Metrics và bộ gậy
	•	Swing metrics nên lưu thành cột số có đơn vị chuẩn, không chỉ nhét toàn bộ vào JSON. JSONB dùng để giữ raw payload từ TrackMan/Foresight và dữ liệu chưa chuẩn hóa.
	•	Mỗi bản ghi có source_type, source_vendor, source_file_id, captured_at, created_by và validation_status để truy vết.
	•	Club specs dùng bảng clubs; type/flex là enum hoặc lookup table. Cho phép custom club name vì danh sách thực tế luôn dài hơn 16 loại cố định.
	•	HLV đọc bộ gậy qua RLS dựa trên coach_connection đang active; không cấp quyền edit mặc định.
5.3 Import dữ liệu TrackMan / GCQuad
THAY ĐỔI QUAN TRỌNG  Ưu tiên CSV import. QR TrackMan được mô tả là cơ chế đăng nhập nhanh/gắn dữ liệu vào hồ sơ TrackMan, không phải QR chứa trực tiếp toàn bộ chỉ số. OCR ảnh chỉ nên là fallback.
Kênh nhập
Ưu tiên
Giải pháp kỹ thuật
CSV TrackMan
P0
Parser versioned theo header; preview mapping; validate đơn vị; cho người dùng xác nhận trước khi lưu.
CSV Foresight/FSX
P0
Parser riêng; giữ raw file; normalize field name/units vào canonical schema.
Manual
P0
Form có range validation, unit rõ ràng và autosave draft.
Ảnh/OCR
P1
Crop guide → Cloud Vision OCR → parser theo template → confidence per field → màn hình sửa trước khi lưu.
QR
Discovery
Chỉ code sau khi có QR mẫu và quyền truy cập luồng đối tác; không giả định QR encode dữ liệu.
API vendor
Tối ưu dài hạn
Làm việc chính thức với vendor/sân tập; dùng OAuth/partner token và adapter riêng nếu được cấp.

5.4 Upload video và quản lý media
	•	Client upload thẳng lên Supabase Storage bằng resumable upload; bắt buộc có progress, pause/retry và giới hạn định dạng/kích thước.
	•	Lưu media_assets riêng: owner_id, bucket/path, mime, bytes, duration, width/height, checksum, visibility, processing_status.
	•	Video private chỉ phát qua signed URL ngắn hạn. Không lưu public URL cho swing của học viên.
	•	Worker tạo thumbnail và proxy MP4 H.264; giữ bản gốc theo retention policy. FFmpeg chạy ở worker, không chạy trong Edge Function.
	•	Có cơ chế xóa thật: xóa DB → enqueue xóa object/derived files → audit event; tránh “xóa UI nhưng file còn sống mãi”.
5.5 Phân tích swing từ video
Nên chia thành ba mức để giảm rủi ro:
	•	MVP: upload + playback + ghi chú HLV. Cho phép time-coded note và overlay đường/vùng đơn giản.
	•	Pilot AI: MediaPipe Pose Landmarker lấy 33 landmark 3D ước lượng; FFmpeg chuẩn hóa video; thuật toán phát hiện address/top/impact/finish và tính tempo cơ bản.
	•	Production AI: dataset golf được gắn nhãn, benchmark theo góc quay/ánh sáng/điện thoại, model versioning, confidence và review bởi chuyên gia.
CẢNH BÁO KỸ THUẬT  Landmark 3D từ một camera không biến hệ thống thành máy đo biomechanic chính xác. Swing plane, weight transfer và hip rotation phụ thuộc góc quay, calibration, frame rate và occlusion. Kết quả nên gọi là “ước lượng/hỗ trợ”, không phải chẩn đoán tuyệt đối.
5.6 Coach–student connection
	•	Bảng coach_connections gồm coach_id, player_id, status, relationship_type, is_primary, invited_by, invited_at, accepted_at, revoked_at.
	•	Luồng thật: HLV tạo invite code/link có hạn → học viên đăng nhập và accept → connection active. Không tạo user giả chỉ từ tên.
	•	Nếu hiện tại chỉ cho 1 HLV chính: dùng unique partial index trên player_id WHERE is_primary = true AND status = active.
	•	Hủy kết nối không xóa lịch sử. RLS ngừng quyền đọc dữ liệu mới; sản phẩm phải chốt HLV có tiếp tục xem dữ liệu cũ hay không.
5.7 Social feed, follow, like và comment
	•	follows có primary key (follower_id, followed_id), chặn tự follow bằng check constraint.
	•	Feed MVP: bài của người đang follow + bài của bản thân, sắp theo created_at/id bằng cursor pagination; không dùng offset khi feed lớn.
	•	likes là bảng riêng với unique(user_id, post_id). Số like có thể đếm trực tiếp lúc nhỏ; sau đó dùng counter cache/trigger nếu cần.
	•	posts có visibility, moderation_status, deleted_at. Media bài viết đi qua media_assets, không nhét URL tự do.
	•	Comment nên nằm trong MVP social nếu đã có trang chi tiết bài; cần report/block/mute tối thiểu trước khi mở cộng đồng công khai.
5.8 Notification
	•	Tạo notifications trong Postgres cho mọi sự kiện quan trọng; đây là nguồn cho notification center và trạng thái đã đọc.
	•	Realtime cập nhật khi app đang mở. Web push dùng FCM sau khi người dùng chủ động cấp quyền; email là fallback cho nhận xét HLV quan trọng.
	•	Gom nhóm và rate limit: 20 lượt like không được tạo 20 push. Dùng preference theo loại sự kiện và quiet hours.
5.9 Search, moderation và admin
	•	MVP search dùng Postgres full-text + trigram cho tên người dùng, CLB, tiêu đề và tag. Chưa cần Elasticsearch/Algolia.
	•	Admin tối thiểu: user/coach verification, report queue, content takedown, job retry, audit log và xem storage usage.
	•	Có block user trước khi public social. Block phải ảnh hưởng feed, discover, follow, comment và notification, không chỉ ẩn một nút.

6. Data model production đề xuất
Mô hình prototype đang nhúng metrics/clubs/swings vào Player. Với Postgres nên tách bảng quan hệ để query, index, audit và RLS rõ ràng.
Nhóm
Bảng chính
Ghi chú
Identity
profiles, player_profiles, coach_profiles
profiles.id = auth.users.id; role và public fields tách khỏi dữ liệu riêng tư.
Coaching
coach_connections, coach_invites, coach_notes
Hỗ trợ nhiều HLV nhưng có primary coach; note có timestamp/video position.
Performance
metric_sessions, swing_metrics, fitness_metrics
Chuẩn hóa cột số; raw_payload JSONB; source và quality/confidence.
Equipment
clubs
Cho phép custom types; archived_at thay vì hard delete nếu đã liên kết với swing.
Media/AI
media_assets, swings, analysis_jobs, swing_analyses
Tách job khỏi kết quả; model_version, confidence, input checksum.
Social
follows, posts, post_media, likes, comments, blocks, reports
Unique constraints; soft delete; moderation status.
Communication
notifications, notification_preferences, device_tokens
In-app là nguồn sự thật; push/email là kênh delivery.
Operations
audit_events, import_files, import_rows
Theo dõi import, lỗi parser, hành động nhạy cảm và retry.

6.1 Nguyên tắc schema
	•	Dùng UUID cho identity công khai; timestamp lưu UTC; hiển thị theo timezone của người dùng.
	•	Các chỉ số có unit canonical: mph, rpm, degree, meter, kg. UI có thể đổi đơn vị nhưng DB không trộn lẫn.
	•	Giá trị import có raw_value/raw_unit khi cần để kiểm toán chuyển đổi.
	•	Enum dùng cho trạng thái ổn định; lookup table dùng cho danh mục có thể mở rộng bởi admin.
	•	Mọi bảng dữ liệu người dùng có created_at, updated_at và ownership/subject key rõ ràng.
	•	Không lưu likedByMe trong posts; đó là kết quả query theo current user.
6.2 RLS policy matrix tối thiểu
Dữ liệu
Player
Coach connected
Follower/người khác
Profile public
Đọc/sửa của mình
Đọc public fields
Đọc public fields
Metrics/fitness
CRUD của mình
Read khi connection active
Không truy cập
Clubs
CRUD của mình
Read khi connection active
Không, trừ khi user công khai
Swing video
CRUD của mình
Read/note khi connection active
Không truy cập mặc định
Coach note
Read note về mình
CRUD note do mình tạo
Không truy cập
Post public
CRUD bài của mình
CRUD bài của mình
Read/like/comment nếu không bị block
Connection
Read/accept/revoke liên quan
Read/invite/revoke liên quan
Không truy cập

TEST BẮT BUỘC  Mỗi policy phải có test “được phép” và “bị từ chối”. Đặc biệt test các tình huống: connection pending/revoked, user bị block, signed URL hết hạn, và service role không bị lộ ra client.
7. Giải pháp OCR và import chi tiết
7.1 Pipeline CSV đề xuất
	•	Upload file → tạo import_file và checksum.
	•	Detect vendor/version từ header hoặc signature.
	•	Parse vào staging rows; không ghi thẳng vào bảng metrics.
	•	Normalize tên cột, đơn vị và null/error.
	•	Hiển thị preview + cảnh báo; người dùng xác nhận club/date/session.
	•	Commit transaction vào metric_session + swing_metrics; giữ raw file và parser_version.
7.2 Pipeline OCR fallback
	•	Yêu cầu người dùng chọn TrackMan hay Foresight và crop theo khung hướng dẫn.
	•	Tiền xử lý ảnh: rotate, perspective correction, contrast, resize.
	•	Cloud Vision OCR trả text + bounding boxes; parser ghép label và value theo vị trí.
	•	Mỗi field có confidence; field thấp được highlight để sửa.
	•	Chỉ lưu sau màn hình review. Raw OCR response giữ có thời hạn để debug parser.
KHÔNG NÊN  Không dùng LLM vision như parser duy nhất rồi ghi thẳng vào database. LLM có thể hỗ trợ fallback/label mapping, nhưng dữ liệu số phải qua validation, unit rules và user confirmation.
8. Phân tích swing: kiến trúc và tiêu chí khả thi
8.1 Job state machine
Trạng thái nên rõ ràng: uploaded → queued → preprocessing → inference → postprocessing → succeeded / failed / needs_review. Job có attempts, error_code, progress, started_at, finished_at và idempotency_key.
8.2 Output nên lưu
	•	Tempo cùng cách tính và mốc frame: address, top, impact, finish.
	•	Landmarks/angles theo frame hoặc bản tóm tắt; tránh lưu dữ liệu khổng lồ nếu không cần phát lại overlay.
	•	Model name/version, preprocessing version, confidence, camera view (face-on/down-the-line), FPS và quality flags.
	•	Tips không nên sinh chỉ từ rule kỹ thuật mơ hồ. Mỗi tip liên kết với evidence/time range và cho HLV override.
8.3 Điều kiện quay video
Yếu tố
Yêu cầu MVP AI pilot
Góc quay
Chọn face-on hoặc down-the-line; hiển thị silhouette hướng dẫn đặt máy.
Khung hình
Toàn thân + đầu gậy trong phần lớn chuyển động; không crop chân/tay.
Frame rate
Khuyến nghị 60 fps trở lên cho tempo/impact; ghi nhận FPS thực tế.
Ánh sáng
Tránh ngược sáng; contrast đủ để tách cơ thể và gậy.
Calibration
Có mốc chiều cao/khoảng cách hoặc calibration flow nếu muốn ước lượng góc/khoảng cách đáng tin hơn.
Thiết bị
Lưu device/browser metadata để phân tích lỗi nhưng không dùng làm định danh quảng cáo.

8.4 Go/no-go cho AI
Chỉ cam kết AI production sau một spike 2–4 tuần với tập video thật đại diện cho người dùng mục tiêu. Bộ benchmark tối thiểu cần có: tỉ lệ detect pose, sai số mốc top/impact, độ ổn định tempo, sai số giữa góc quay, và đánh giá hữu ích của HLV.

9. Roadmap triển khai đề xuất
Giai đoạn
Phạm vi
Kết quả để chốt bước tiếp
0 — Discovery
Chốt 1 hay nhiều HLV; lấy CSV/ảnh/QR mẫu; chốt privacy; xác định AI KPI.
Bộ dữ liệu mẫu + decision log + schema draft.
1 — Core MVP
Auth, profile, metrics manual/CSV, clubs, coach connection, video upload, coach note.
Người chơi–HLV dùng được end-to-end không cần AI.
2 — Community
Follow, feed, post, like, comment, block/report, notification center.
Có social loop an toàn và đo được retention.
3 — Smart import
OCR TrackMan/Foresight, validation UI, parser monitoring.
Tỉ lệ import đúng đạt ngưỡng đã định; giảm nhập tay.
4 — AI pilot
Pose pipeline, tempo, phase detection, evidence overlay, coach review.
Benchmark đạt KPI và HLV xác nhận output có ích.
5 — Scale/monetize
Subscription/payment, advanced analytics, mobile app nếu dữ liệu chứng minh cần.
Unit economics và retention đủ tốt để mở rộng.

9.1 Thứ tự MVP nên ưu tiên
	•	Auth + RLS + profile/roles.
	•	Coach invite/accept và quyền xem dữ liệu.
	•	Manual/CSV metrics + dashboard trend.
	•	Video upload ổn định + playback + coach note.
	•	Notification center cơ bản.
	•	Community sau khi moderation/block đã có.
	•	OCR sau khi có đủ file mẫu.
	•	AI swing sau cùng, chạy pilot song song chứ không khóa ngày launch MVP.
10. Rủi ro và cách giảm thiểu
Rủi ro
Mức
Giảm thiểu
AI swing không đủ chính xác
Rất cao
Spike với video thật; output có confidence/evidence; coach review; MVP không phụ thuộc AI.
Nhập dữ liệu vendor không ổn định
Cao
CSV-first; parser versioned; giữ raw file; preview và user confirmation.
Rò rỉ video/thông số học viên
Rất cao
RLS, private bucket, signed URL, policy tests, audit log, không để service key ở client.
Chi phí video/storage tăng
Trung bình
Limit, compression proxy, retention, quota theo plan, lifecycle cleanup.
Social moderation bị bỏ quên
Cao
Block/report/admin queue trước public launch; rate limit và anti-spam.
Codebase AI-generated khó maintain
Cao
Migration-only DB workflow, lint/typecheck/test CI, review PR nhỏ, architecture boundaries.
Over-engineering quá sớm
Trung bình
Modular monolith; Postgres-first; chỉ tách worker khi workload buộc phải tách.

11. Những quyết định sản phẩm cần chốt
	•	Một học viên có thể có bao nhiêu HLV active? Có một primary coach hay không?
	•	Sau khi revoke connection, HLV còn xem được dữ liệu lịch sử hay mất quyền ngay?
	•	Swing/video mặc định private hoàn toàn hay học viên có thể public từng mục?
	•	Nguồn nhập ưu tiên là CSV, tài khoản vendor, hay ảnh? Có thể yêu cầu sân tập xuất file không?
	•	Bộ output AI nào được xem là đủ giá trị để thu phí? Ai chịu trách nhiệm xác thực chuyên môn?
	•	Community là công khai toàn bộ hay chỉ trong network/CLB? Ai xử lý report và xác minh HLV?
	•	Mô hình doanh thu: subscription player, subscription coach, commission booking, hay B2B cho học viện?
QUYẾT ĐỊNH NÊN CHỐT ĐẦU TIÊN  Quan hệ coach–student, quyền riêng tư sau khi ngắt kết nối, và nguồn dữ liệu TrackMan/Foresight. Ba lựa chọn này ảnh hưởng trực tiếp đến schema, RLS và UX; AI có thể nghiên cứu song song.
12. Checklist kỹ thuật trước khi bắt đầu code production
	•	Có repository mới, TypeScript strict, lint/format, CI và preview deployment.
	•	Có Supabase local/dev/prod; schema khởi tạo bằng migration; seed không chứa dữ liệu thật.
	•	Có data dictionary cho từng metric và đơn vị canonical.
	•	Có file CSV/ảnh thật từ TrackMan và Foresight để viết contract tests cho parser.
	•	Có RLS policy matrix và test cho tất cả bảng private.
	•	Có file size/type/duration policy và retention policy cho video/ảnh.
	•	Có job state machine, retry/idempotency và observability trước khi thêm OCR/AI.
	•	Có success metrics cho MVP: activation, first metric import, coach connection, first note, weekly retention.

13. Nguồn tham khảo kỹ thuật chính thức
	•	S1 — Next.js App Router
	•	S2 — Supabase Auth
	•	S3 — Supabase Row Level Security
	•	S4 — Supabase resumable uploads
	•	S5 — Supabase Queues
	•	S6 — Supabase Realtime
	•	S7 — Supabase Edge Functions
	•	S8 — Supabase database migrations
	•	S9 — MediaPipe Pose Landmarker
	•	S10 — Google Cloud Vision OCR
	•	S11 — Cloud Run Jobs
	•	S12 — Firebase Cloud Messaging for web
	•	S13 — Playwright
	•	S14 — TrackMan: export CSV từ TPS
	•	S15 — TrackMan: QR dùng để quick login
	•	S16 — Foresight FSX: export CSV/PDF
14. Kết luận
Swingboard có nền tảng sản phẩm rõ: dữ liệu hiệu suất tạo utility, quan hệ HLV tạo trust, và social tạo retention. Stack prototype hiện tại không cần bỏ đi; cần được đóng khung bằng TypeScript, feature boundaries, Postgres/RLS và workflow migration. Kiến trúc phù hợp nhất cho giai đoạn đầu là modular monolith trên Next.js + Supabase, kèm worker Python tách biệt cho media/AI.
Điểm quan trọng nhất không phải chọn thêm công nghệ, mà là giảm bất định: lấy dữ liệu vendor thật, chốt quyền coach–student, và chứng minh người dùng nhận giá trị từ upload + coach feedback trước khi đầu tư lớn vào AI swing.
