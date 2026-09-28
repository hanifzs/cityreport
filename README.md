# CityReport — Aplikasi Pelaporan & Monitoring Infrastruktur Kota

Web responsif mobile-first, SPA hash-router, tanpa install. Backend persisten memakai `localStorage` (siap migrasi Supabase).

## Jalankan
Double-click `cityreport/index.html` ATAU serve folder:
`npx serve cityreport` lalu buka http://localhost:3000

> Catatan: Leaflet/Chart/Tailwind via CDN butuh internet untuk peta & grafik. Fitur lain tetap jalan offline.

## Akun demo
- Admin: `admin@cityreport.id` / `admin123`
- Warga: `warga@example.com` / `warga123`
- Google login: tombol "Masuk dengan Google" (simulasi)
- Lupa password: reset ke `baru123`

## Rute
Publik: `#/`, `#/reports`, `#/map`, `#/report/:tiket`, `#/about`, `#/login`, `#/register`, `#/forgot-password`
Warga: `#/dashboard`, `#/create-report`, `#/edit/:tiket`, `#/my-reports`, `#/notifications`, `#/profile`, `#/settings`
Admin: `#/admin`, `#/admin/reports`, `#/admin/reports/:tiket`, `#/admin/map`, `#/admin/users`, `#/admin/audit-logs`

## Fitur sesuai master prompt
- Tiket `CR-YYYY-XXXX`, deteksi duplikat (kategori+radius+judul mirip), foto preview + validasi 2MB, lokasi klik-peta + draggable marker
- Like 1x/user realtime, komentar + hapus milik sendiri + report/flag + moderasi admin
- Timeline + status history + tanggapan resmi + foto before/after, notifikasi + unread badge
- Admin: statistik 6 kartu, bar/line/doughnut (Chart.js, data real), kelola status + catatan + audit log, kelola user/role (proteksi diri sendiri), ekspor CSV
- i18n ID/EN penuh (toggle navbar & settings), badge partisipasi, statistik publik real
- Data contoh bertanda DEMO, bisa dihapus; tombol Reset/Reload di footer & settings

## Struktur DB (localStorage `cityreport_db_v1`)
users(profiles), reports, supports, comments, status_history, notifications, audit_logs, ticketSeq, session, lang. Mirror tabel spec: profiles, reports, report_categories(CATS), report_supports, comments, report_status_history, notifications, report_images(field photo/after_photo), admin_audit_logs.

## Go online (Supabase)
Isi `SUPABASE_URL` & `SUPABASE_KEY` di `js/store.js`, buat tabel sesuai nama di atas + RLS:
- reports: select public; insert/update own; update status admin only (via policy role=admin)
- supports: unique(report_id,user_id); - comments: delete own/admin; - storage bucket `report-photos` max 2MB jpg/png.
Auth: Supabase Auth (email+Google), profiles.id = auth.uid.
