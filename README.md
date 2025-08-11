# THPTQG Countdown ⏳

Đếm ngược đến kỳ thi THPT Quốc gia: **bao nhiêu ngày/giờ/phút/giây còn lại**, kèm **một câu quote truyền cảm hứng mỗi ngày** (ZenQuotes) để tiếp thêm động lực cho hành trình 12 năm đèn sách của các bạn trẻ!

- **Live:** https://rroyal1504.github.io/thptqg-countdown/
- **API quotes:** https://zenquotes.io/

## Features
- ✅ Tự động chuyển sang **năm kế tiếp** sau khi qua ngày thi
- ✅ Cho phép **đổi ngày thi** và **ghi nhớ** (localStorage)
- ✅ **Quote mỗi ngày** với cơ chế cache (chỉ 1 request/ngày)
- ✅ Gọn nhẹ, **load nhanh**, tối ưu cho **mobile**
- ✅ Thân thiện SEO (**OG tags + JSON-LD**)

## Run locally
Chỉ cần mở file `index.html` bằng trình duyệt là chạy.

## Deploy (GitHub Pages)
1. Tạo repo `thptqg-countdown`.
2. Push code:
   ```bash
   git init
   git add .
   git commit -m "feat: initial countdown app"
   git branch -M main
   git remote add origin https://github.com/your-username/thptqg-countdown.git
   git push -u origin main
