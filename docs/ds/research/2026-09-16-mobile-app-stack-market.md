# Thị trường đang dùng stack gì cho mobile app (2025–2026)?

- **Ngày:** 2026-09-16
- **Bối cảnh:** app golf social + đặt sân + thanh toán + rewards + chat; thiết kế iOS-first 390/393pt, DS trong Figma (numeric font weight, semantic token); code bằng Claude Code.
- **Phạm vi:** thị trường quốc tế (đã bỏ phần Việt Nam theo yêu cầu đổi scope).
- **Phương pháp:** WebSearch → WebFetch trực tiếp trang gốc (survey, docs chính thức, GitHub API, npm API, changelog, job board). Mỗi dòng số liệu ghi URL + ngày của nguồn. Không fetch được → ghi **chưa xác minh**. Blog/aggregator → ghi **nguồn thứ cấp**.

---

## 1. Số liệu thị trường

### 1.1 Khảo sát developer

| Nguồn | Ngày nguồn | Flutter | React Native | Native | Ghi chú | URL |
|---|---|---|---|---|---|---|
| Stack Overflow Survey 2024, "Other frameworks" | 2024 | 9.4% (all) / 9.4% (pro) | 8.4% (all) / 9.0% (pro) | SwiftUI 4.3% | Lần cuối SO còn mục này | https://survey.stackoverflow.co/2024/technology |
| Stack Overflow Survey 2025 | 2025, 49,031 resp. | — | — | — | Đã fetch: **không còn mục "Other frameworks"** → không so được Flutter/RN. Admired/desired 2024: **chưa xác minh** (trang quá dài, tool không trích được) | https://survey.stackoverflow.co/2025/technology |
| Stack Overflow Survey 2026 | — | — | — | — | URL trả 404 → **chưa xuất bản** | https://survey.stackoverflow.co/2026/technology |
| JetBrains DevEco 2025 | 10/2025, 24,534 resp., 194 nước | — | — | — | Trang tổng quan không ghi % Flutter/RN. KMP: **7% (2024) → 18% (2025)** (JetBrains tự trích) | https://blog.jetbrains.com/research/2025/10/state-of-developer-ecosystem-2025/ · https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-react-native.html |
| Statista "Cross-platform frameworks used" | 13/06/2023 (dữ liệu **cũ**) | 46% | 35% | — | Trong nhóm dev cross-platform; KMP 4%, Ionic 9%, Cordova 10% | https://www.statista.com/statistics/869224/worldwide-software-developer-working-hours/ |
| GitHub Octoverse 2025 | 28/10/2025 | Dart: ngoài top 10 | TypeScript **#1** (+1M contributor, +66% YoY) | Swift/Kotlin: ngoài top 10 | GitHub gắn TS #1 với "AI-assisted development benefits from stricter type systems" | https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/ |

### 1.2 App store teardown (Appfigures — nguồn gốc, đo bundle)

| Chỉ số | RN | Flutter | KMP | Ngày | URL |
|---|---|---|---|---|---|
| Số app trong **top 10,000 non-game** (theo download/tháng) | **1,350** | 1,184 | 218 | 19/12/2025 | https://appfigures.com/resources/insights/20251219?f=4 |
| Share download trong 3 framework (375M) | 47% | 38% | 14% | 19/12/2025 | (như trên) |
| Share revenue trong 3 framework ($462M net) | 41% | 32% | 27% | 19/12/2025 | (như trên) |
| % app **mới phát hành** dùng RN hoặc Flutter | 7% (2020) → 12% (2021) → **15% (2024)** | | | 07/03/2025 | https://appfigures.com/resources/insights/20250307?f=1 |
| RN+Flutter share toàn thị trường 2024 | ~9% net revenue, ~6% download | | | 07/03/2025 | (như trên) |

Lưu ý Appfigures: "dùng framework" = có trong bundle, không nhất thiết toàn app. Phần lớn top app vẫn native (~93% non-game iOS không có RN/Flutter).

### 1.3 GitHub / npm (đo ngày 2026-09-16, GitHub API + npm API)

| Repo / package | Stars | Forks | Open issues | Commits | npm downloads 30 ngày (13/08→11/09/2026) | URL |
|---|---|---|---|---|---|---|
| flutter/flutter | 178,963 | 31,285 | 13,189 | 91,550 | — (pub.dev không có API tổng: **chưa xác minh**) | https://api.github.com/repos/flutter/flutter |
| facebook/react-native | 126,627 | 25,248 | 1,147 | 41,728 | `react-native` **49,326,061** | https://api.github.com/repos/facebook/react-native · https://api.npmjs.org/downloads/point/last-month/react-native |
| expo/expo | 52,281 | 13,997 | 860 | 34,563 | `expo` **32,019,492** | https://api.github.com/repos/expo/expo · https://api.npmjs.org/downloads/point/last-month/expo |
| JetBrains/compose-multiplatform | 19,363 | 1,425 | 25 | — | — | https://api.github.com/repos/JetBrains/compose-multiplatform |
| ionic-team/capacitor | — | — | — | — | `@capacitor/core` 15,868,076 | https://api.npmjs.org/downloads/point/last-month/@capacitor/core |

Cả 3 repo chính đều có push trong ngày 2026-09-16 (`pushed_at`).

### 1.4 Tín hiệu tuyển dụng quốc tế (LinkedIn US, đo 2026-09-16 — keyword match lỏng, chỉ so tương đối)

| Keyword | Kết quả | URL |
|---|---|---|
| react native | **6,000+** | https://www.linkedin.com/jobs/search?keywords=react%20native |
| flutter | 4,000+ | https://www.linkedin.com/jobs/search?keywords=flutter |
| swiftui | 8,000+ | https://www.linkedin.com/jobs/search?keywords=swiftui |
| "ios developer" | 2,000+ | https://www.linkedin.com/jobs/search?keywords=%22ios%20developer%22 |
| "kotlin multiplatform" | 8,000+ (⚠ nghi LinkedIn match rời "kotlin" — **không tin cậy**) | https://www.linkedin.com/jobs/search?keywords=%22kotlin%20multiplatform%22 |
| Indeed | 403 → **chưa xác minh** | https://www.indeed.com/jobs?q=%22react+native%22 |

---

## 2. So sánh stack

### 2.1 Phiên bản & độ chín (tất cả fetch từ nguồn chính thức)

| Stack | Phiên bản hiện tại | Tín hiệu độ chín | URL |
|---|---|---|---|
| **React Native + Expo** | RN **0.87** (11/08/2026); Expo **SDK 57** (30/06/2026, RN 0.86); SDK 58 beta (15/09/2026, RN 0.88 RC, iOS 27) | New Architecture **mặc định & duy nhất từ 0.82** (08/10/2025); legacy frozen từ 0.80; 0.87: Strict TypeScript API mặc định, SPM experimental; Expo Router mặc định trong `create-expo-app`; Expo Go "not recommended for production", bắt login từ 03/09/2026 | https://reactnative.dev/blog · https://reactnative.dev/blog/2026/08/11/react-native-0.87 · https://expo.dev/changelog/sdk-57 · https://expo.dev/changelog/sdk-58-beta · https://docs.expo.dev/router/introduction/ |
| **Flutter** | **3.47** (12/08/2026); Dart bundled: **chưa xác minh** (release notes chỉ thấy constraint ≥3.11) | Impeller: **duy nhất trên iOS**, mặc định Android API 29+ từ 3.27, desktop từ 3.47; Material/Cupertino tách package `material_ui`/`cupertino_ui` 1.0; Widget Previews stable | https://flutter.dev/blog/whats-new-in-flutter-3-47 · https://docs.flutter.dev/perf/impeller · https://docs.flutter.dev/release/release-notes |
| **Native SwiftUI / Kotlin Compose** | Xcode **26.3** (RC 03/02/2026); iOS 27 sắp ra (Expo SDK 58 đã build cho iOS 27) | Xcode 26.3: agentic coding tích hợp Claude Agent + Codex, expose qua MCP | https://www.apple.com/newsroom/2026/02/xcode-26-point-3-unlocks-the-power-of-agentic-coding/ |
| **KMP + Compose Multiplatform** | CMP **1.12.0** stable, 1.13.0-alpha01 (ngày cụ thể trên trang releases tool trích không nhất quán → **chưa xác minh ngày**) | CMP iOS **Stable từ 1.8.0 (05/2025)**; KMP core iOS/Android Stable; CMP web Beta; caveat JetBrains: +~9MB app size iOS | https://kotlinlang.org/docs/multiplatform/supported-platforms.html · https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/ · https://github.com/JetBrains/compose-multiplatform/releases |
| **.NET MAUI** (ngắn) | MAUI trên .NET 10 (docs cập nhật 08/2026) | Trọng tâm "improve product quality"; XAML source-gen; CoreCLR Android experimental | https://learn.microsoft.com/en-us/dotnet/maui/whats-new/dotnet-10 |
| **Capacitor/Ionic** (ngắn) | Capacitor **8** (08/12/2025), 8.5 (31/07/2026), 9 đang làm | Webview-based; 15.9M npm/tháng | https://ionic.io/blog/tag/capacitor |

### 2.2 Bảng tổng hợp

| Tiêu chí | RN + Expo | Flutter | SwiftUI (+ Compose) | KMP + CMP | MAUI | Capacitor |
|---|---|---|---|---|---|---|
| **Hiring quốc tế** (LinkedIn US) | 6,000+ | 4,000+ | SwiftUI 8,000+ | không đo được | — | — |
| **Ngôn ngữ vs Octoverse 2025** | TypeScript **#1** | Dart ngoài top 10 | Swift/Kotlin ngoài top 10 | Kotlin ngoài top 10 | C# #5 | TS #1 |
| **Stripe** | **SDK chính thức** `@stripe/stripe-react-native`, PaymentSheet có **Apple Pay + Google Pay**, hỗ trợ Expo (`expo install`) | `flutter_stripe` 14.0.0 — **community** (Stripe liệt kê ở trang Community SDKs: "doesn't support or review them"); có Apple/Google Pay; Google publish `pay` 3.3.0 riêng cho Apple/Google Pay | SDK chính thức iOS + Android | dùng SDK native qua expect/actual (không có SDK KMP riêng — **chưa xác minh**) | không thấy trong danh sách Stripe | `@capacitor-community/stripe` community |
| **RevenueCat (subscription)** | ✔ RN + **Expo** | ✔ | ✔ iOS/Android | ✔ **KMP** | ✘ không có trong danh sách | ✔ Capacitor |
| **Chat: Stream** | ✔ `stream-chat-expo` riêng cho Expo | ✔ | ✔ SwiftUI/UIKit + Compose | ✘ không liệt kê | ✘ | ✘ |
| **Chat: Sendbird** | ✔ (UIKit RN) | ✔ | ✔ | ✘ | ✔ .NET | ✘ |
| **Firebase** | React Native Firebase (Invertase, "officially recommended"), cần dev build, **không chạy Expo Go** | **FlutterFire chính thức của Google** | ✔ | — | — | — |
| **Figma → code** | Code Connect hỗ trợ **React/React Native**; không có skill riêng | **Không** trong Code Connect, **không** skill Figma | Code Connect **SwiftUI + Compose**; skill **`figma-swiftui`** 2 chiều (skill duy nhất gắn framework) | Compose có Code Connect | ✘ | React web |
| **AI-agent fit** (chi tiết §3) | ★★★★★ plugin Expo cho Claude Code + MCP 31 tool (screenshot simulator, build log, docs) + 25 skill; `create-expo-app` tự sinh CLAUDE.md | ★★★★ Dart/Flutter MCP server (experimental) hot reload + analyzer + test + DTD; flutter/agent-plugins skills; FlutterBench | ★★★★ (iOS) Xcode 26.3 chạy Claude Agent SDK native, MCP capture Previews; Android Compose: CMP Hot Reload MCP | ★★★ Compose Hot Reload MCP server (CMP 1.12) | ★★ không tìm thấy tài liệu agent chính thức (**chưa xác minh**) | ★★ |
| **Hot-reload loop cho agent** | Fast Refresh + dev build; MCP `automation_take_screenshot`/`automation_tap`/`collect_app_logs` | Stateful hot reload <1s, trigger được qua MCP; cần restart khi đổi native/enum/global | Xcode Previews, agent capture được ảnh preview (Apple + Anthropic xác nhận) | Compose Hot Reload + MCP | Hot Reload XAML | web reload |
| **Rủi ro chính** | Shopify (09/2026) rời RN → native, lý do "agents làm được phần translation/testing" — tín hiệu xu hướng đảo; Expo Go bị siết; phụ thuộc Expo/EAS (dịch vụ thương mại) | Figma/DS pipeline thiếu; Stripe không chính thức; Dart ít phổ biến ngoài Flutter | 2 codebase; Android phải làm lại; hiring 2 kỹ năng | Ecosystem SDK bên thứ 3 mỏng (Stream/Sendbird không có KMP) | Ecosystem mobile mỏng | Perf/cảm giác native yếu; không hợp app social iOS-first |

---

## 3. AI-agent fit — bằng chứng chính thức

| Stack | Bằng chứng (đã fetch) | URL |
|---|---|---|
| **Expo** | `claude plugin install expo@claude-plugins-official` = cài Expo Skills + đăng ký Expo MCP. MCP remote `https://mcp.expo.dev/mcp` (OAuth), tool: `add_library, read/search_documentation, build_*, workflow_*, testflight_*, appstore_*, playstore_*, expo_router_sitemap, open_devtools, collect_app_logs, automation_tap, automation_take_screenshot, automation_find_view`. MCP có ở **Free plan** (26/05/2026). `create-expo-app` sinh `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`. Repo expo/skills 2.5k★, 25 skill (expo-router, expo-native-ui, expo-design-system, eas-*). SDK 58: `@expo/agent-cli` experimental. Expo Agent (sản phẩm riêng) bị **wound down** 20/07/2026. | https://docs.expo.dev/agents/ · https://docs.expo.dev/mcp/ · https://github.com/expo/skills · https://expo.dev/changelog |
| **Flutter/Dart** | Dart & Flutter MCP server (**experimental**): hot reload, analyzer, symbol, test runner, DTD runtime/widget tree, pub. Client: Claude Code, Gemini CLI/Antigravity, Cursor, Copilot, Codex. Skills/rules ở `flutter/agent-plugins` + `dart-lang/skills` (`npx skills add flutter/agent-plugins`). FlutterBench = bộ eval agent của Flutter team. | https://docs.flutter.dev/ai/mcp-server · https://docs.flutter.dev/ai/ai-rules · https://docs.flutter.dev/ai |
| **Apple / SwiftUI** | Xcode 26.3 (RC 03/02/2026): "native integration with the Claude Agent SDK, the same underlying harness that powers Claude Code" (subagents, background tasks, plugins). "Claude can capture Xcode Previews to see what the interface it's building looks like". Xcode expose qua **MCP** → Claude Code CLI dùng được Xcode. | https://www.anthropic.com/news/apple-xcode-claude-agent-sdk · https://www.apple.com/newsroom/2026/02/xcode-26-point-3-unlocks-the-power-of-agentic-coding/ |
| **React Native core** | RN 0.87 kèm skill `/migrate-to-strict-api` cho agent-driven upgrade | https://reactnative.dev/blog/2026/08/11/react-native-0.87 |
| **KMP/CMP** | CMP 1.12.0: "an MCP server for Compose Hot Reload that enables AI agents to interact with a running Compose application in real time" | https://github.com/JetBrains/compose-multiplatform/releases |
| **Figma (DS của dự án)** | Skill chính thức: figma-use, figma-use-figjam, figma-use-slides, **figma-swiftui**, figma-code-connect, figma-create-new-file, figma-generate-diagram, figma-generate-library, figma-generate-design. **Không có skill Flutter hay RN.** Code Connect: React (+RN), HTML, SwiftUI, Jetpack Compose; **Flutter không có**. | https://help.figma.com/hc/en-us/articles/39166810751895-Figma-skills-for-MCP · https://developers.figma.com/docs/code-connect/ |
| **Stripe** | `stripe agent setup` tự detect agent, cài skill + MCP; skill index tại `docs.stripe.com/.well-known/skills` | https://docs.stripe.com/skills |
| **Shopify case (native + agents)** | 10/09/2026: dời **toàn bộ** app (Shop đã xong, Shopify app 300+ màn đang làm, POS, Inbox) từ RN sang Swift/Kotlin. Lý do: "Agents can now do enough of the implementation, translation, testing, and review work that it's no longer the deciding factor it was in 2020." Shop app: 12 tuần từ PoC → store. Vẫn khẳng định "React Native apps can be fast. Ours are." FlashList tiếp tục maintain (~2M dl/tuần), Restyle archive, RN Skia fork. | https://shopify.engineering/back-to-native · https://shopify.engineering/five-years-of-react-native-at-shopify (01/2025: >99.9% crash-free, <500ms P75) |

---

## 4. Tuyển dụng & hệ sinh thái quốc tế

### 4.1 App nổi bật theo stack (trang showcase chính thức, fetch 2026-09-16)

| Stack | App | URL |
|---|---|---|
| Flutter | NotebookLM, Google Pay, Google Earth, Google Ads, Google Classroom, YouTube Create, Google One, SoFi, Toyota, talabat, Knowunity, KQED | https://flutter.dev/showcase |
| React Native | Facebook, Instagram (Quest), FB Ads Manager, Meta Horizon, MS Office/Outlook/Teams, Xbox Game Pass, Amazon Shopping/Alexa/Photos/Kindle, Shopify (⚠ đang dời sang native 09/2026), Wix | https://reactnative.dev/showcase |
| Expo | Hipcamp, Partiful, Phantom, Incident.io, Mollie, Cameo, Bounce, Goody, Better, Blackline, MyWheels | https://expo.dev/customers |

### 4.2 App golf / booking / social — stack thực tế

| App | Stack | Mức xác minh | URL |
|---|---|---|---|
| **GolfNow / GolfPass** (NBC Sports Next) | **React Native** — job "Mobile Engineer II - React Native" tại 7580 Golf Channel Drive, Orlando (đã hết hạn); mô tả team GolfPass Mobile & OTT yêu cầu RN, TypeScript, Kotlin, Swift | Job posting chính thức trên SmartRecruiters (đã fetch, expired); chi tiết team từ aggregator (**nguồn thứ cấp**) | https://jobs.smartrecruiters.com/NBCUniversal3/744000081053702-mobile-engineer-react-native |
| **Strava** (social sport) | **Native**: job Android yêu cầu Kotlin + Jetpack Compose; iOS **chưa xác minh** | Aggregator androiddev.careers (**nguồn thứ cấp**); Greenhouse board 404 | https://androiddev.careers/senior-android-engineer-frameworks--tools-at-strava-800 |
| **18Birdies** | Trang hiring không nêu công nghệ | **chưa xác minh** | https://help.18birdies.com/article/205-is-18birdies-hiring |
| **Hole19** | Chỉ có case study Android Wear 2016 (native Android) | **chưa xác minh** (hiện tại) | https://android-developers.googleblog.com/2016/08/android-developer-story-hole19-improves.html |
| **TheGrint** | Job page 404 | **chưa xác minh** | — |
| **Airbnb** | Bỏ RN về native 19/06/2018. Hiện tại (job posting iOS Platform, gỡ 02/2026): "nearly 100% written in Swift… SwiftUI, Swift Macros, Swift Testing, structured concurrency, Combine"; Android (job posting, gỡ 05/2025): "Kotlin and Jetpack Compose", framework Trio cho Compose. UIKit vẫn còn qua Epoxy (repo push 2026-07). **KHÔNG dùng Kotlin Multiplatform** — không có trong 71 case study KMP của JetBrains; tin "Airbnb KMP 95% shared" chỉ ở blog thứ cấp, không nguồn gốc. | Job posting Airbnb (builtin.com mirror), GitHub airbnb/epoxy-ios, kotlinlang case studies; Medium gốc không fetch được | https://builtin.com/job/staff-software-engineer-ios-platform/7976263 · https://builtin.com/job/android-software-engineer-user-clients/3252267 · https://github.com/airbnb/epoxy-ios · https://kotlinlang.org/case-studies/?type=multiplatform · https://medium.com/airbnb-engineering/sunsetting-react-native-1868ba28e30a |
| **Shopify** | RN 2020→2026, rồi native 09/2026 (xem §3) | Chính thức | https://shopify.engineering/back-to-native |

### 4.3 Đọc tín hiệu

- Cross-platform vẫn tăng ở app **mới** (15% năm 2024) nhưng top app phần lớn native; RN nhỉnh hơn Flutter ở top 10k + download + revenue (Appfigures 12/2025).
- KMP tăng nhanh về **người dùng** (7→18%) nhưng SDK bên thứ 3 (Stream/Sendbird) chưa theo.
- Xu hướng 2026: agent làm "2 codebase native" rẻ hơn (Shopify) — nhưng Shopify có đội mobile native sẵn; freelancer 1 người không có.
- TypeScript #1 GitHub + lý do "typed language tốt cho agent" → RN/Expo hưởng lợi trực tiếp.

---

## 5. Khuyến nghị cho dự án golf app

### Lựa chọn chính: **React Native + Expo (SDK 57 → 58), Expo Router, EAS, TypeScript strict**

| Lý do | Bằng chứng |
|---|---|
| Tooling agent hoàn chỉnh nhất cho Claude Code | Expo plugin chính thức: skills + MCP (screenshot simulator, tap, logs, build, store review) — §3 |
| DS Figma → code có đường chính thức | Code Connect hỗ trợ React Native; Expo skill `expo-design-system`, `expo-native-ui` |
| iOS-first nhưng vẫn 1 codebase | `@expo/ui` render **SwiftUI thật** (NavigationStack, Toolbar… SDK 58) → cảm giác iOS native cho màn hình quan trọng |
| Payment/chat/subscription đủ SDK **chính thức** | Stripe RN (Apple Pay + Google Pay), RevenueCat Expo, Stream `stream-chat-expo`, Sendbird RN, RN Firebase |
| Thị trường | RN dẫn top 10k app (1,350), npm 49M/tháng, LinkedIn 6,000+ job, TypeScript #1 |
| Golf domain có tiền lệ | GolfNow/GolfPass tuyển RN |

Điều kiện kèm: dùng **development build** (không Expo Go) ngay từ đầu vì Stripe/Firebase/Stream cần native module; bật Strict TypeScript API (RN 0.87).

### Dự phòng: **Native SwiftUI (iOS trước), Xcode 26.3 + Claude Agent SDK**

| Lý do | Bằng chứng |
|---|---|
| Agent loop mạnh nhất trên iOS | Xcode 26.3 chạy Claude Agent SDK native, capture Previews; MCP cho Claude Code CLI |
| Khớp DS Figma nhất | `figma-swiftui` là skill 2 chiều duy nhất gắn framework; Code Connect SwiftUI |
| Hiring | SwiftUI 8,000+ job LinkedIn |
| Nhược | Android = codebase thứ 2 (Kotlin/Compose) — Shopify chứng minh khả thi với agent nhưng cần thời gian gấp đôi cho 1 người |

### Điều kiện đổi quyết định

| Nếu… | Thì… |
|---|---|
| Android **không cần trong ≥12 tháng** và khách chấp nhận iOS-only | Chuyển sang SwiftUI native (dự phòng) — tận dụng figma-swiftui + Xcode agent |
| Cần vẽ bản đồ sân/GPS custom nặng (canvas, overlay real-time) và RN Skia fork gây bất ổn sau 2026 | Cân nhắc Flutter (Impeller) hoặc native; kiểm chứng bằng prototype trước |
| Expo siết thêm (Expo Go login, EAS pricing) làm vỡ ngân sách | RN bare + CocoaPods/SPM vẫn dùng được, mất MCP tiện ích của Expo |
| Team sau này là Dart/Flutter sẵn | Flutter chấp nhận được về thị trường (1,184 top-10k app), nhưng phải tự giải Figma pipeline và Stripe community |
| Stack Overflow 2026 hoặc Appfigures 2026 cho thấy Flutter vượt RN rõ ở top app | Xem lại — hiện chênh nhỏ (1,350 vs 1,184) |

**Không chọn:** KMP/CMP (thiếu Stream/Sendbird, hiring không đo được), MAUI (không có RevenueCat/Stripe chính thức, không tài liệu agent), Capacitor (không hợp app social iOS-first).

---

## 6. Nguồn (tất cả URL đã fetch)

**Khảo sát / số liệu**
- https://survey.stackoverflow.co/2024/technology
- https://survey.stackoverflow.co/2025/technology
- https://survey.stackoverflow.co/2026/technology (404)
- https://blog.jetbrains.com/research/2025/10/state-of-developer-ecosystem-2025/
- https://devecosystem-2025.jetbrains.com/
- https://kotlinlang.org/docs/multiplatform/kotlin-multiplatform-react-native.html
- https://www.statista.com/statistics/869224/worldwide-software-developer-working-hours/
- https://appfigures.com/resources/insights/20251219?f=4
- https://appfigures.com/resources/insights/20250307?f=1
- https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/
- https://api.github.com/repos/flutter/flutter · https://api.github.com/repos/facebook/react-native · https://api.github.com/repos/expo/expo · https://api.github.com/repos/JetBrains/compose-multiplatform
- https://github.com/flutter/flutter · https://github.com/facebook/react-native · https://github.com/expo/expo
- https://api.npmjs.org/downloads/point/last-month/react-native · https://api.npmjs.org/downloads/point/last-month/expo · https://api.npmjs.org/downloads/point/last-month/@capacitor/core
- https://www.linkedin.com/jobs/search?keywords=react%20native · https://www.linkedin.com/jobs/search?keywords=flutter · https://www.linkedin.com/jobs/search?keywords=swiftui · https://www.linkedin.com/jobs/search?keywords=%22ios%20developer%22 · https://www.linkedin.com/jobs/search?keywords=%22kotlin%20multiplatform%22
- https://www.indeed.com/jobs?q=%22react+native%22 (403)

**Phiên bản / docs**
- https://reactnative.dev/blog · https://reactnative.dev/blog/2026/08/11/react-native-0.87
- https://expo.dev/changelog · https://expo.dev/changelog/sdk-57 · https://expo.dev/changelog/sdk-58-beta
- https://docs.expo.dev/router/introduction/ · https://docs.expo.dev/develop/development-builds/introduction/ · https://docs.expo.dev/versions/latest/sdk/ui/
- https://flutter.dev/blog/whats-new-in-flutter-3-47 · https://docs.flutter.dev/release/release-notes · https://docs.flutter.dev/release/release-notes/release-notes-3.47.0 · https://docs.flutter.dev/perf/impeller · https://docs.flutter.dev/tools/hot-reload
- https://kotlinlang.org/docs/multiplatform/supported-platforms.html
- https://blog.jetbrains.com/kotlin/2025/05/compose-multiplatform-1-8-0-released-compose-multiplatform-for-ios-is-stable-and-production-ready/
- https://github.com/JetBrains/compose-multiplatform/releases
- https://learn.microsoft.com/en-us/dotnet/maui/whats-new/dotnet-10
- https://ionic.io/blog/tag/capacitor
- https://www.apple.com/newsroom/2026/02/xcode-26-point-3-unlocks-the-power-of-agentic-coding/
- https://developer.apple.com/documentation/xcode/previewing-your-apps-interface-in-xcode (chỉ lấy được title)
- https://developer.apple.com/documentation/xcode-release-notes/xcode-26_3-release-notes (chỉ lấy được title)

**AI-agent**
- https://docs.expo.dev/agents/ · https://docs.expo.dev/mcp/ · https://github.com/expo/skills
- https://docs.flutter.dev/ai · https://docs.flutter.dev/ai/mcp-server · https://docs.flutter.dev/ai/ai-rules
- https://www.anthropic.com/news/apple-xcode-claude-agent-sdk
- https://help.figma.com/hc/en-us/articles/39166810751895-Figma-skills-for-MCP · https://developers.figma.com/docs/code-connect/
- https://docs.stripe.com/skills

**Payment / chat**
- https://docs.stripe.com/sdks · https://docs.stripe.com/sdks/community.md · https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=mobile&platform=react-native
- https://github.com/stripe/stripe-react-native · https://github.com/flutter-stripe/flutter_stripe · https://pub.dev/packages/flutter_stripe · https://pub.dev/packages/pay
- https://www.revenuecat.com/docs/getting-started/installation
- https://getstream.io/chat/sdk/ · https://getstream.io/chat/docs/sdk/reactnative/basics/installation/
- https://sendbird.com/docs/chat/sdk/v4/ios/overview
- https://firebase.google.com/docs/flutter/setup · https://rnfirebase.io/

**Case study / app**
- https://shopify.engineering/back-to-native · https://shopify.engineering/five-years-of-react-native-at-shopify
- https://simonwillison.net/2018/Jun/19/sunsetting-react-native-airbnb/ (thứ cấp; Medium gốc không fetch được)
- https://flutter.dev/showcase · https://reactnative.dev/showcase · https://expo.dev/customers
- https://jobs.smartrecruiters.com/NBCUniversal3/744000081053702-mobile-engineer-react-native
- https://androiddev.careers/senior-android-engineer-frameworks--tools-at-strava-800 (thứ cấp)
- https://help.18birdies.com/article/205-is-18birdies-hiring
- https://android-developers.googleblog.com/2016/08/android-developer-story-hole19-improves.html
- https://builtin.com/job/staff-software-engineer-ios-platform/7976263 (Airbnb iOS stack)
- https://builtin.com/job/android-software-engineer-user-clients/3252267 (Airbnb Android stack)
- https://github.com/airbnb/epoxy-ios
- https://kotlinlang.org/case-studies/?type=multiplatform (Airbnb không có)
