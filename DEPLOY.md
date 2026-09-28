# Hosting CityReport — Panduan Lengkap

## A. Database + Auth + Storage: Supabase (gratis)

1. Buat project di https://supabase.com → dapat **Project URL** & **anon key**.
2. Buka **SQL Editor** → jalankan `supabase/schema.sql` (sekali saja).
3. **Authentication**:
   - Aktifkan provider **Email** (default on) dan **Google** (Auth > Providers > Google, isi Client ID/Secret dari Google Cloud Console).
   - Buat 1 user admin: Auth > Users > Add user (`admin@cityreport.id`), lalu SQL:
     `update public.profiles set role='admin', name='Admin Kota' where email='admin@cityreport.id';`
4. **Storage**: bucket `report-photos` dibuat otomatis oleh schema (public read, upload login, max kelola di Dashboard > Storage > Policies bila perlu batas 2MB).
5. Salin URL + anon key ke:
   - App statis: `cityreport/js/config.js` (lihat `config.example.js`) → deploy ulang / refresh. App otomatis pull data online + garis hijau di navbar.
   - React: `cityreport/react-app/.env` (lihat `.env.example`).

## B. Hosting frontend React (pilih satu)

### Opsi 1 — Vercel (rekomendasi)
1. `cd cityreport` → `git init` (sudah disiapkan, tinggal push ke GitHub).
2. https://vercel.com → Add New Project → import repo → root directory `cityreport/react-app`.
3. Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Deploy. `vercel.json` sudah included.

### Opsi 2 — Netlify
1. https://app.netlify.com → Add site → Import from Git → base directory `cityreport/react-app`, build `npm run build`, publish `dist`.
2. Env vars sama. `netlify.toml` sudah included (SPA redirect).

### Opsi 3 — App statis (tanpa build)
Upload isi folder `cityreport/` (index.html, styles.css, js/) ke Netlify Drop / Vercel / GitHub Pages / cPanel `public_html`. Isi `js/config.js` agar online.

## C. Ceklis pasca-deploy
- [ ] Landing + statistik tampil, peta OSM muncul
- [ ] Register → profil otomatis terbentuk (trigger `handle_new_user`)
- [ ] Buat laporan → tiket `CR-YYYY-XXXX` otomatis
- [ ] Admin login → ubah status → history + notifikasi tercatat otomatis
- [ ] Upload foto masuk bucket `report-photos`
