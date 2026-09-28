import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { supabase, CATS } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Create() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ title: '', category: 'jalan', description: '', address: '' });
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState('');
  const mapEl = useRef<L.Map | null>(null);

  useEffect(() => {
    const map = L.map('cmap').setView([-6.205, 106.826], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    let mk: L.Marker | null = null;
    map.on('click', e => {
      if (mk) map.removeLayer(mk);
      mk = L.marker(e.latlng, { draggable: true }).addTo(map);
      setPos([e.latlng.lat, e.latlng.lng]);
      mk.on('dragend', () => { const p = mk!.getLatLng(); setPos([p.lat, p.lng]); });
    });
    mapEl.current = map;
    return () => { map.remove(); };
  }, []);

  const submit = async () => {
    try {
      setErr('');
      if (!user) throw new Error('Login dulu.');
      if (!form.title || !form.description || !form.address) throw new Error('Lengkapi semua kolom.');
      if (!pos) throw new Error('Pilih lokasi di peta.');
      let photo = '';
      if (file) {
        if (file.size > 2 * 1024 * 1024) throw new Error('Foto maks 2MB.');
        const path = `${user.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('report-photos').upload(path, file);
        if (error) throw error;
        photo = supabase.storage.from('report-photos').getPublicUrl(path).data.publicUrl;
      }
      const { data, error } = await supabase.from('reports').insert({
        user_id: user.id, ticket: '', title: form.title, category: form.category,
        description: form.description, photo, lat: pos[0], lng: pos[1], address: form.address,
      }).select().single();
      if (error) throw error;
      nav(`/report/${data.ticket}`);
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-poppins font-extrabold text-2xl text-navy mb-4">➕ Buat Laporan Baru</h1>
      <div className="card p-5 flex flex-col gap-3">
        {err && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-2">{err}</div>}
        <div><label className="text-xs font-bold">Judul *</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={120} /></div>
        <div><label className="text-xs font-bold">Kategori *</label><select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id_label}</option>)}</select></div>
        <div><label className="text-xs font-bold">Deskripsi *</label><textarea className="input" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div><label className="text-xs font-bold">Foto (maks 2MB)</label><input type="file" accept="image/*" className="input" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
        <div><label className="text-xs font-bold">Alamat *</label><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div><label className="text-xs font-bold">Lokasi (klik peta) *</label><div id="cmap" style={{ height: 300 }} className="rounded-xl" /><p className="text-xs text-slate-500">🧭 {pos ? pos.map(n => n.toFixed(5)).join(', ') : 'klik peta'}</p></div>
        <button className="btn btn-emerald w-full" onClick={submit}>Kirim Laporan 🚀</button>
      </div>
    </div>
  );
}
