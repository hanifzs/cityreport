-- CityReport seed (opsional): 6 laporan demo Jakarta.
-- Ganti USER_ID_ADMIN / USER_ID_WARGA dengan uuid dari auth.users
-- setelah membuat user di Supabase Dashboard > Authentication > Users.

-- 1) Daftarkan user via Dashboard, lalu:
-- update public.profiles set role='admin', name='Admin Kota' where email='admin@cityreport.id';

-- 2) Contoh insert laporan (ticket otomatis via trigger):
-- insert into public.reports (user_id, title, category, description, photo, lat, lng, address, status)
-- values (
--   (select id from public.profiles where email='warga@example.com'),
--   'Jalan berlubang di Jl. Merdeka Raya', 'jalan',
--   'Lubang ±15cm membahayakan pengendara motor.',
--   'https://images.unsplash.com/photo-1515162816999-a463645f498a?w=800&q=60',
--   -6.2005, 106.8165, 'Jl. Merdeka Raya No. 12, Jakarta Pusat', 'Dikerjakan'
-- );
