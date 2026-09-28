-- =============================================================
-- CityReport — Supabase/PostgreSQL schema (spec §8)
-- Jalankan di Supabase Dashboard > SQL Editor (berurutan 1x).
-- =============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- 1. PROFILES (1 user Supabase Auth = 1 profil, id = auth.uid)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role text not null default 'user' check (role in ('user','admin')),
  avatar text default '',
  badge text default '',
  created_at timestamptz not null default now()
);

-- 2. REPORT CATEGORIES (master)
create table if not exists public.report_categories (
  id text primary key,
  label_id text not null,
  label_en text not null,
  icon text not null default '📦'
);
insert into public.report_categories (id,label_id,label_en,icon) values
  ('jalan','Jalan Rusak','Road Damage','🛣️'),
  ('lampu','Lampu Jalan','Street Lights','💡'),
  ('drainase','Drainase','Drainage','🌊'),
  ('sampah','Sampah','Waste','🗑️'),
  ('taman','Fasilitas Taman','Park Facilities','🌳'),
  ('trotoar','Trotoar','Sidewalk','🚶'),
  ('lainnya','Lainnya','Others','📦')
on conflict (id) do nothing;

-- 3. REPORTS
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  ticket text unique not null,                 -- CR-YYYY-XXXX (diisi trigger)
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  category text not null references public.report_categories(id),
  description text not null check (char_length(description) >= 10),
  photo text not null default '',
  after_photo text not null default '',
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  address text not null default '',
  status text not null default 'Menunggu'
    check (status in ('Menunggu','Terverifikasi','Dikerjakan','Selesai','Ditolak')),
  official_reply text not null default '',
  demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_category on public.reports(category);
create index if not exists idx_reports_user on public.reports(user_id);
create index if not exists idx_reports_geo on public.reports(lat,lng);
create index if not exists idx_reports_title_trgm on public.reports using gin (title gin_trgm_ops);

-- 4. REPORT SUPPORTS (1 user = 1 dukungan per laporan)
create table if not exists public.report_supports (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);
create index if not exists idx_supports_report on public.report_supports(report_id);

-- 5. COMMENTS
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_comments_report on public.comments(report_id);

-- 6. STATUS HISTORY (otomatis via trigger)
create table if not exists public.report_status_history (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  from_status text not null,
  to_status text not null,
  note text not null default '',
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 7. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  report_id uuid references public.reports(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id, created_at desc);

-- 8. REPORT IMAGES (metadata; file di Storage bucket report-photos)
create table if not exists public.report_images (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  kind text not null default 'before' check (kind in ('before','after')),
  url text not null,
  created_at timestamptz not null default now()
);

-- 9. ADMIN AUDIT LOGS
create table if not exists public.admin_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null default 'system',
  action text not null,
  target text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now()
);

-- 10. TICKET SEQUENCE per tahun
create table if not exists public.ticket_counters (
  year int primary key,
  seq int not null default 0
);

-- ---------- FUNCTIONS & TRIGGERS ----------
-- Auto profil saat user Auth baru mendaftar
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name','Warga'), new.email, 'user')
  on conflict (id) do nothing;
  insert into public.notifications (user_id, title, body)
  values (new.id, 'Selamat datang di CityReport', 'Laporkan kerusakan kota dan pantau progresnya di sini.');
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Nomor tiket otomatis CR-YYYY-XXXX
create or replace function public.assign_ticket()
returns trigger language plpgsql as $$
declare y int := extract(year from now())::int; n int;
begin
  insert into public.ticket_counters(year, seq) values (y, 1)
    on conflict (year) do update set seq = ticket_counters.seq + 1
    returning seq into n;
  -- ambil nilai terbaru secara aman
  select seq into n from public.ticket_counters where year = y;
  new.ticket := 'CR-' || y || '-' || lpad(n::text, 4, '0');
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists trg_assign_ticket on public.reports;
create trigger trg_assign_ticket
  before insert on public.reports for each row
  when (new.ticket is null or new.ticket = '')
  execute function public.assign_ticket();

-- Catat history otomatis saat status berubah + notifikasi pemilik
create or replace function public.track_status_change()
returns trigger language plpgsql security definer as $$
begin
  if (old.status is distinct from new.status) then
    new.updated_at := now();
    insert into public.report_status_history (report_id, from_status, to_status, note, actor_id)
    values (new.id, old.status, new.status, coalesce(new.official_reply,''), auth.uid());
    insert into public.notifications (user_id, title, body, report_id)
    values (new.user_id, new.ticket || ' — status: ' || new.status,
            coalesce(new.official_reply, ''), new.id);
  end if;
  return new;
end $$;
drop trigger if exists trg_track_status on public.reports;
create trigger trg_track_status
  before update of status on public.reports for each row
  execute function public.track_status_change();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_supports enable row level security;
alter table public.comments enable row level security;
alter table public.report_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.report_images enable row level security;
alter table public.admin_audit_logs enable row level security;

-- helper: apakah saya admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: baca publik (nama samaran), ubah milik sendiri; role hanya via admin (service_role / fungsi)
drop policy if exists p_profiles_read on public.profiles;
create policy p_profiles_read on public.profiles for select using (true);
drop policy if exists p_profiles_update on public.profiles;
create policy p_profiles_update on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- reports: baca publik; insert warga login; update milik sendiri selama Menunggu; status hanya admin
drop policy if exists p_reports_read on public.reports;
create policy p_reports_read on public.reports for select using (true);
drop policy if exists p_reports_insert on public.reports;
create policy p_reports_insert on public.reports for insert
  with check (auth.uid() = user_id);
drop policy if exists p_reports_owner_update on public.reports;
create policy p_reports_owner_update on public.reports for update
  using (auth.uid() = user_id and status = 'Menunggu' and public.is_admin() = false)
  with check (auth.uid() = user_id);
drop policy if exists p_reports_admin on public.reports;
create policy p_reports_admin on public.reports for all
  using (public.is_admin()) with check (public.is_admin());

-- supports: baca publik; kelola milik sendiri
drop policy if exists p_sup_read on public.report_supports;
create policy p_sup_read on public.report_supports for select using (true);
drop policy if exists p_sup_ins on public.report_supports;
create policy p_sup_ins on public.report_supports for insert with check (auth.uid() = user_id);
drop policy if exists p_sup_del on public.report_supports;
create policy p_sup_del on public.report_supports for delete using (auth.uid() = user_id);

-- comments: baca publik; tulis login; hapus milik sendiri/admin
drop policy if exists p_com_read on public.comments;
create policy p_com_read on public.comments for select using (true);
drop policy if exists p_com_ins on public.comments;
create policy p_com_ins on public.comments for insert with check (auth.uid() = user_id);
drop policy if exists p_com_del on public.comments;
create policy p_com_del on public.comments for delete
  using (auth.uid() = user_id or public.is_admin());

-- history/images/notif: baca sesuai kepemilikan atau publik untuk transparansi
drop policy if exists p_hist_read on public.report_status_history;
create policy p_hist_read on public.report_status_history for select using (true);
drop policy if exists p_img_read on public.report_images;
create policy p_img_read on public.report_images for select using (true);
drop policy if exists p_img_admin on public.report_images;
create policy p_img_admin on public.report_images for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists p_notif_own on public.notifications;
create policy p_notif_own on public.notifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- audit: hanya admin
drop policy if exists p_audit_admin on public.admin_audit_logs;
create policy p_audit_admin on public.admin_audit_logs for all
  using (public.is_admin()) with check (public.is_admin());

-- Fungsi aman ganti role (hanya admin, cegah cabut diri sendiri terakhir — cek di app juga)
create or replace function public.set_user_role(target_id uuid, new_role text)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then raise exception 'Hanya admin'; end if;
  if target_id = auth.uid() then raise exception 'Tidak bisa mengubah role sendiri'; end if;
  if new_role not in ('user','admin') then raise exception 'Role tidak valid'; end if;
  update public.profiles set role = new_role where id = target_id;
end $$;

-- ---------- STORAGE (jalankan di SQL editor juga) ----------
insert into storage.buckets (id, name, public)
values ('report-photos','report-photos', true)
on conflict (id) do nothing;

drop policy if exists sp_photos_read on storage.objects;
create policy sp_photos_read on storage.objects for select
  using (bucket_id = 'report-photos');
drop policy if exists sp_photos_upload on storage.objects;
create policy sp_photos_upload on storage.objects for insert
  with check (bucket_id = 'report-photos' and auth.role() = 'authenticated');
drop policy if exists sp_photos_delete on storage.objects;
create policy sp_photos_delete on storage.objects for delete
  using (bucket_id = 'report-photos' and (auth.uid()::text = owner::text or public.is_admin()));
