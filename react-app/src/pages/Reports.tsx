import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, CATS, Report } from '../lib/supabase';
import { ReportCard } from './Home';

export default function Reports() {
  const [sp, setSp] = useSearchParams();
  const [list, setList] = useState<Report[]>([]);
  const q = sp.get('q') ?? '', cat = sp.get('cat') ?? '', status = sp.get('status') ?? '';
  useEffect(() => {
    (async () => {
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100);
      if (cat) query = query.eq('category', cat);
      if (status) query = query.eq('status', status);
      if (q) query = query.ilike('title', `%${q}%`);
      const { data } = await query;
      setList(data ?? []);
    })();
  }, [q, cat, status]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-poppins font-extrabold text-2xl text-navy mb-4">📋 Semua Laporan ({list.length})</h1>
      <div className="card p-4 mb-4 flex flex-col lg:flex-row gap-2">
        <input className="input" placeholder="Cari judul / tiket…" defaultValue={q} id="rq" />
        <select className="input lg:w-52" defaultValue={cat} id="rc">
          <option value="">Semua kategori</option>{CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id_label}</option>)}
        </select>
        <select className="input lg:w-52" defaultValue={status} id="rs">
          <option value="">Semua status</option>{['Menunggu', 'Terverifikasi', 'Dikerjakan', 'Selesai', 'Ditolak'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => {
          const p = new URLSearchParams();
          const v = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
          if (v('rq')) p.set('q', v('rq')); if (v('rc')) p.set('cat', v('rc')); if (v('rs')) p.set('status', v('rs'));
          setSp(p);
        }}>🔍</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{list.map(r => <ReportCard key={r.id} r={r} />)}</div>
    </div>
  );
}
