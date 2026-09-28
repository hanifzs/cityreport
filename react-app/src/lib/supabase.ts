import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn('Supabase env belum diisi — isi .env (lihat .env.example).');
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');

export type Report = {
  id: string; ticket: string; user_id: string;
  title: string; category: string; description: string;
  photo: string; after_photo: string;
  lat: number; lng: number; address: string;
  status: 'Menunggu' | 'Terverifikasi' | 'Dikerjakan' | 'Selesai' | 'Ditolak';
  official_reply: string; demo: boolean;
  created_at: string; updated_at: string;
};

export const CATS = [
  { id: 'jalan', id_label: 'Jalan Rusak', en_label: 'Road Damage', icon: '🛣️' },
  { id: 'lampu', id_label: 'Lampu Jalan', en_label: 'Street Lights', icon: '💡' },
  { id: 'drainase', id_label: 'Drainase', en_label: 'Drainage', icon: '🌊' },
  { id: 'sampah', id_label: 'Sampah', en_label: 'Waste', icon: '🗑️' },
  { id: 'taman', id_label: 'Fasilitas Taman', en_label: 'Park Facilities', icon: '🌳' },
  { id: 'trotoar', id_label: 'Trotoar', en_label: 'Sidewalk', icon: '🚶' },
  { id: 'lainnya', id_label: 'Lainnya', en_label: 'Others', icon: '📦' },
];

export const STCOLOR: Record<string, string> = {
  Menunggu: '#6B7280', Terverifikasi: '#2563EB', Dikerjakan: '#EA580C', Selesai: '#059669', Ditolak: '#DC2626',
};
