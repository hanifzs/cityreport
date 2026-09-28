export type Lang = 'id' | 'en';
const STR: Record<string, { id: string; en: string }> = {
  home: { id: 'Beranda', en: 'Home' },
  map: { id: 'Peta Laporan', en: 'Report Map' },
  reports: { id: 'Semua Laporan', en: 'All Reports' },
  about: { id: 'Tentang', en: 'About' },
  login: { id: 'Masuk', en: 'Sign in' },
  register: { id: 'Daftar', en: 'Sign up' },
  heroTitle: { id: 'Laporanmu, Perubahan untuk Kota Kita.', en: 'Your Report, Change for Our City.' },
  heroSub: { id: 'Laporkan kerusakan fasilitas umum dengan mudah. Pantau proses penanganannya.', en: 'Report damaged public facilities easily. Track the handling progress.' },
  createReport: { id: 'Buat Laporan', en: 'Create Report' },
  viewMap: { id: 'Lihat Peta', en: 'View Map' },
  dashboard: { id: 'Dashboard', en: 'Dashboard' },
  admin: { id: 'Admin', en: 'Admin' },
  logout: { id: 'Keluar', en: 'Sign out' },
};
let lang: Lang = (localStorage.getItem('cr_lang') as Lang) || 'id';
export const getLang = () => lang;
export const setLang = (l: Lang) => { lang = l; localStorage.setItem('cr_lang', l); };
export const t = (k: string) => STR[k]?.[lang] ?? k;
export const catLabel = (c: { id_label: string; en_label: string }) => (lang === 'en' ? c.en_label : c.id_label);
const ST: Record<string, { id: string; en: string }> = {
  Menunggu: { id: 'Menunggu', en: 'Pending' },
  Terverifikasi: { id: 'Terverifikasi', en: 'Verified' },
  Dikerjakan: { id: 'Dikerjakan', en: 'In Progress' },
  Selesai: { id: 'Selesai', en: 'Resolved' },
  Ditolak: { id: 'Ditolak', en: 'Rejected' },
};
export const stLabel = (s: string) => ST[s]?.[lang] ?? s;
