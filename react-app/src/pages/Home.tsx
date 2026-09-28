import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, CATS, Report } from '../lib/supabase';
import { t, catLabel, stLabel } from '../lib/i18n';

export function StatusBadge({ s }: { s: string }) {
  const cls: Record<string, string> = { Menunggu: 'bg-slate-100 text-slate-600', Terverifikasi: 'bg-blue-100 text-blue-700', Dikerjakan: 'bg-orange-100 text-orange-700', Selesai: 'bg-emerald-100 text-emerald-700', Ditolak: 'bg-red-100 text-red-700' };
  return <span className={`badge ${cls[s]}`}>{stLabel(s)}</span>;
}

export function ReportCard({ r }: { r: Report }) {
  return (
    <Link to={`/report/${r.ticket}`} className="card overflow-hidden hover:shadow-md transition">
      <img src={r.photo} className="w-full h-44 object-cover" loading="lazy" />
      <div className="p-4">
        <div className="flex gap-2 flex-wrap mb-2"><StatusBadge s={r.status} />
          <span className="badge bg-slate-100 text-navy">{CATS.find(c => c.id === r.category)?.icon} {r.category}</span></div>
        <h3 className="font-bold font-poppins line-clamp-2 mb-1">{r.title}</h3>
        <p className="text-xs text-slate-500">🎫 {r.ticket} • 📍 {r.address}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ total: 0, done: 0, prog: 0 });
  const [latest, setLatest] = useState<Report[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(6);
      setLatest(data ?? []);
      const { count: total } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      const { count: done } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Selesai');
      setStats({ total: total ?? 0, done: done ?? 0, prog: (total ?? 0) - (done ?? 0) });
    })();
  }, []);
  return (
    <div>
      <section className="text-white" style={{ background: 'linear-gradient(135deg,#123B65 40%,#155e75 75%,#10B981)' }}>
        <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-poppins font-extrabold text-3xl lg:text-5xl mb-3">{t('heroTitle')}</h1>
            <p className="opacity-90 mb-6">{t('heroSub')}</p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/create" className="btn btn-emerald">➕ {t('createReport')}</Link>
              <Link to="/map" className="btn bg-white text-navy">🗺️ {t('viewMap')}</Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[[stats.total, 'Total'], [stats.done, 'Selesai'], [stats.prog, 'Proses']].map(([v, l]) => (
              <div key={l} className="card p-4 text-center text-slate-900"><div className="font-poppins font-extrabold text-2xl text-navy">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-poppins font-extrabold text-xl mt-8 mb-3 text-navy">Kategori</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATS.map(c => <Link key={c.id} to={`/reports?cat=${c.id}`} className="card p-4 text-center hover:-translate-y-1 transition"><div className="text-3xl">{c.icon}</div><div className="font-bold text-sm">{catLabel(c)}</div></Link>)}
        </div>
        <div className="flex items-center justify-between mt-8 mb-3">
          <h2 className="font-poppins font-extrabold text-xl text-navy">Laporan Terbaru</h2>
          <Link to="/reports" className="btn btn-outline !py-1.5">Lihat Semua →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{latest.map(r => <ReportCard key={r.id} r={r} />)}</div>
      </div>
    </div>
  );
}
