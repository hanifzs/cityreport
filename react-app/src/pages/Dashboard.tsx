import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Report } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ReportCard } from './Home';

export default function Dashboard() {
  const { user } = useAuth();
  const [mine, setMine] = useState<Report[]>([]);
  const [notif, setNotif] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setMine(data ?? []));
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10).then(({ data }) => setNotif(data ?? []));
  }, [user]);
  const c = (s: string) => mine.filter(r => r.status === s).length;
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-poppins font-extrabold text-2xl text-navy">Halo, {user?.name.split(' ')[0]}! 👋</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {[[mine.length, 'Total'], [c('Menunggu'), 'Menunggu'], [c('Dikerjakan') + c('Terverifikasi'), 'Diproses'], [c('Selesai'), 'Selesai']].map(([v, l]) => (
          <div key={l} className="card p-4 text-center"><div className="font-extrabold text-2xl text-navy font-poppins">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
        ))}
      </div>
      <Link to="/create" className="btn btn-emerald !py-2 mb-4">➕ Buat Laporan</Link>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">{mine.slice(0, 4).map(r => <ReportCard key={r.id} r={r} />)}</div>
        <div className="card p-4 h-fit"><h3 className="font-bold mb-2">🔔 Notifikasi</h3>
          {notif.map(n => <div key={n.id} className="text-sm border-b py-2"><b>{n.title}</b><div className="text-slate-500">{n.body}</div></div>)}
          {!notif.length && <p className="text-sm text-slate-400">Belum ada notifikasi.</p>}
        </div>
      </div>
    </div>
  );
}
