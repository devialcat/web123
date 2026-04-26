# Hướng dẫn Deploy lên Railway

Dự án đã được cấu hình sẵn để chạy trên Railway dưới dạng **một service duy nhất** (Express phục vụ cả API và frontend tĩnh) + **một PostgreSQL** do Railway quản lý.

## Bước 1: Đẩy code lên GitHub

1. Tạo repository mới trên GitHub (private hoặc public đều được).
2. Trong terminal cục bộ:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

## Bước 2: Tạo project trên Railway

1. Vào https://railway.com → đăng nhập bằng GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → chọn repo vừa tạo.
3. Railway tự dùng `nixpacks.toml` để build (đã có sẵn trong dự án).

## Bước 3: Thêm PostgreSQL

1. Trong project Railway, click **+ New** → **Database** → **Add PostgreSQL**.
2. Railway tự tạo biến môi trường `DATABASE_URL` chia sẻ với service web.
3. Vào tab **Variables** của service web, kiểm tra `DATABASE_URL` đã được tự gán (`${{Postgres.DATABASE_URL}}`). Nếu chưa, thêm thủ công.

## Bước 4: Đặt biến môi trường

Trong tab **Variables** của service web, thêm:

| Biến | Giá trị |
|---|---|
| `NODE_ENV` | `production` |
| `SERVE_STATIC` | `true` |
| `BASE_PATH` | `/` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (tự động) |

`PORT` sẽ do Railway tự gán, không cần đặt.

## Bước 5: Deploy

1. Mỗi lần push code lên GitHub, Railway tự build và deploy lại.
2. Build sẽ:
   - Cài dependency
   - Đẩy schema lên PostgreSQL (`pnpm db:push`)
   - Build frontend (Vite) + API server (esbuild)
3. Sau đó chạy `pnpm start:railway` → Express phục vụ cả API và frontend.

## Bước 6: Seed dữ liệu mẫu (chỉ làm 1 lần)

Sau lần deploy đầu tiên, vào tab **Settings** → **Service** của service web → mở terminal/shell → chạy:

```bash
pnpm db:seed
```

Hoặc dùng Railway CLI:
```bash
railway run pnpm db:seed
```

## Bước 7: Gắn tên miền

1. Tab **Settings** → **Networking** → **Generate Domain** để có link `*.up.railway.app`.
2. Hoặc **Custom Domain** để gắn tên miền riêng (ví dụ `quocsachdriver.com`) — chỉ cần trỏ CNAME theo hướng dẫn.

## Cấu trúc deploy

- **Frontend** (`artifacts/quoc-sach-driver`) → build thành file tĩnh trong `dist/public`
- **API server** (`artifacts/api-server`) → bundle thành 1 file `dist/index.mjs`
- Khi `SERVE_STATIC=true`, Express:
  - Phục vụ `/api/*` từ router
  - Phục vụ tất cả route khác từ `dist/public/index.html` (SPA fallback)

## Khắc phục sự cố

- **Build fail**: Kiểm tra log Railway. Thường do thiếu biến môi trường hoặc DATABASE_URL chưa nối.
- **Trang trắng**: Mở `/api/healthz` để xem API có chạy không. Nếu OK nhưng frontend trắng, kiểm tra `SERVE_STATIC=true` đã đặt chưa.
- **404 trên route SPA**: Đảm bảo `SERVE_STATIC=true`.

## Chi phí ước tính

- Hobby plan: 5$/tháng credit miễn phí (đủ cho dự án nhỏ).
- Vượt mức: ~5–10$/tháng cho web service + PostgreSQL.
