# Nhóm B — F04 Kết nối HLV–học viên · F09 HLV xem học viên (2026-10-08)

Ảnh: `storybook-app/__shots__/B/<story-id>.<light|dark>.png` — 40 story × sáng/tối, đã xem từng ảnh, đều đúng màn / tài khoản / dữ liệu, thanh tab có ở màn tab.

## Lỗi / xấu ở màn app (không sửa màn — chỉ ghi)

| Story id | File:dòng | Hiện tượng | Task | Trạng thái |
| --- | --- | --- | --- | --- |
| `f04--ho-so-hlv`, `f04--hlv-chia-se-ma` | `packages/ds/src/ui/PostCard/PostCard.tsx:56` (Identity), `packages/ds/src/ui/Social/Social.tsx:91` (ShareSheet), `packages/ds/src/ui/Comment/Comment.tsx:57` | Avatar không ảnh lấy `name.slice(0, 1)` → mọi HLV hiện chữ **“H”** (từ “HLV …”), còn ở màn app (`initials()` của `apps/golf/lib/format.ts:81`) cùng người hiện “MT”. Người chơi cũng lệch: “L” (ShareSheet) vs “ĐK”. Nhẹ, không vỡ màn. | 15 | đã sửa (Task 15) |

Không thấy lỗi màn nào khác ở F04 / F09.

## Hạ tầng Storybook (cho người giữ `README.md` / `.storybook/`) — không phải lỗi màn

| Vấn đề | Ảnh hưởng | Đề xuất | Trạng thái |
| --- | --- | --- | --- |
| **`userEvent.type` không tới state React** của TextInput react-native-web: chỉ đổi giá trị DOM, `onChangeText` không chạy (đo: DOM `TUAN24`, prop `value` của React `""`). Ảnh trông đúng nhưng bấm tiếp (Kiểm tra / Tìm) thì màn coi như ô trống. Story mẫu `f04--hoc-vien-nhap-ma` trong README mắc đúng lỗi này. | Mọi story gõ chữ rồi bấm tiếp (form, tìm kiếm) ra sai trạng thái. | Dùng `fireEvent.change(el, { target: { value } })` (từ `storybook/test`) — đã đổi trong F04 / F09; nên sửa mẫu ở `README.md` (đoạn “Viết một story luồng” và story 02). | đã xử lý (Task 15): `typeIn` trong `lib/appStory.tsx` (`fireEvent.input`) |
| **Modal (Dialog / BottomSheet / ShareSheet) nằm ngoài ảnh** khi chụp bằng `scripts/shot-storybook.mjs`: viewport chụp cao 3000 px nên Modal `position: fixed` canh giữa ở ~1500 px / đáy 3000 px, ảnh (cắt theo nội dung ~876 px) chỉ còn lớp phủ mờ. | Ảnh của `f04--hlv-chia-se-ma`, `f04--hlv-thu-hoi-dialog`, `f04--huy-ket-noi-dialog` (và mọi story mở dialog / sheet ở luồng khác). Trong Storybook 390×844 vẫn đúng. | Ba ảnh này mình chụp lại ở khung cố định 390×844 (script nháp ngoài repo) và thay vào `__shots__/B/`. Sửa lâu dài: `.storybook/shot.css` giới hạn cao của portal Modal theo `#storybook-root`, hoặc script chụp story có modal ở 844. | đã xử lý (Task 15): chụp khung cố định `shot-storybook.mjs … 390 844` — Modal trong khung, hết dải 32 px |
| Ảnh `f09--tim-khong-thay.dark` lần chụp đầu báo `useStore: bọc app trong <StoreProvider>` (một lần, lúc agent khác đang sửa file → HMR). Chụp lại thì đúng. | Ngẫu nhiên khi HMR giữa lúc chụp. | Chụp lại khi gặp. | đã xử lý (Task 15): script chụp in exception / `console.error` của trang sau `|` → thấy ngay, chụp lại |

## Bước “Chưa có” (route không tồn tại — không dựng UI giả)

| Luồng | Bước | Ghi chú |
| --- | --- | --- |
| F04 | Lời mời 2 chiều (HLV gửi lời mời trong app, học viên nhận / từ chối) | Phase 2; `ShareSheet` ở `connect/invite` chỉ giả lập gửi (`f04--hlv-chia-se-ma`). |
| F09 | — | Mọi bước có route. |

## Phủ route

| Route | Story id |
| --- | --- |
| `connect/invite` | `f04--hlv-tao-ma`, `f04--hlv-chua-co-loi-moi`, `f04--hlv-chia-se-ma`, `f04--hlv-thu-hoi-dialog`, `f04--hlv-da-thu-hoi` |
| `connect/accept` | `f04--hoc-vien-nhap-ma`, `f04--nhap-ma-de-trong`, `f04--nhap-ma-sai`, `f04--nhap-ma-het-han`, `f04--nhap-ma-da-dung`, `f04--nhap-ma-da-thu-hoi`, `f04--nhap-ma-da-ket-noi`, `f04--xem-truoc-hlv-chinh`, `f04--xem-truoc-hlv-phu`, `f04--chap-nhan-ket-noi` |
| `(player)/coach` | `f04--tab-hlv`, `f04--tab-hlv-chua-ket-noi`, `f04--dat-lam-hlv-chinh`, `f04--huy-ket-noi-dialog`, `f04--da-huy-hlv-chinh` |
| `coaches/[id]` | `f04--ho-so-hlv`, `f04--ho-so-hlv-khong-co` |
| `(coach)/roster` | `f09--danh-sach`, `f09--tim-hoc-vien`, `f09--tim-khong-thay`, `f09--can-phan-hoi`, `f09--can-phan-hoi-rong`, `f09--loi-moi`, `f09--loi-moi-rong`, `f09--chua-co-hoc-vien` |
| `students/[id]` | `f09--tong-quan`, `f09--tong-quan-rong`, `f09--thong-so`, `f09--swing`, `f09--swing-can-phan-hoi`, `f09--bo-gay`, `f09--the-luc`, `f09--khong-quyen-da-huy`, `f09--khong-quyen-nguoi-theo-doi`, `f09--khong-tim-thay` |
