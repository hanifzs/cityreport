import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase, Report } from '../lib/supabase';
import { StatusBadge } from './Home';

export default function Admin() {
  const [list, setList] = useState<Report[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'stat' | 'rep' | 'usr'>('stat');
  const [sel, setSel] = useState<Report | null>(null);
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');

  const load = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(200);
    setList(data ?? []);
    const { data: u } = await supabase.from('profiles').select('*').limit(100);
    setUsers(u ?? []);
  };
  useEffect(() => { load(); }, []);

  const c = (s: string) => list.filter(r => r.status === s).length;
  const byCat = [...new Set(list.map(r => r.category))].map(k => ({ name: k, n: list.filter(r => r.category === k).length }));
  const bySt = ['Menunggu', 'Terverifikasi', 'Dikerjakan', 'Selesai', 'Ditolak'].map(s => ({ name: s, n: c(s) }));

  const save = async (to: string) => {
    if (!sel) return;
    await supabase.from('reports').update({ status: to, official_reply: reply }).eq('id', sel.id);
    await supabase.from('report_status_history').insert({ report_id: sel.id, from_status: sel.status, to_status: to, note });
    await supabase.from('admin_audit_logs').insert({ action: 'status_change', target: sel.ticket, detail: `${sel.status} → ${to} | ${note}` });
    setSel(null); setNote(''); setReply(''); load();
  };
  const csv = () => {
    const rows = [['ticket', 'title', 'category', 'address', 'status', 'created'], ...list.map(r => [r.ticket, `"${r.title}"`, r.category, `"${r.address}"`, r.status, r.created_at])];
    const blob = new Blob([rows.map(x => x.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'cityreport.csv'; a.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-poppins font-extrabold text-2xl text-navy mb-3">🛠️ Admin</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['stat', 'rep', 'usr'] as const).map(x => <button key={x} onClick={() => setTab(x)} className={`btn !py-1.5 ${tab === x ? 'btn-primary' : 'btn-outline'}`}>{x === 'stat' ? '📊 Stat' : x === 'rep' ? '📋 Laporan' : '👥 Users'}</button>)}
        <button onClick={csv} className="btn btn-outline !py-1.5 ml-auto">⬇️ CSV</button>
      </div>
      {tab === 'stat' && <>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
          {[['Total', list.length], ['Menunggu', c('Menunggu')], ['Terverifikasi', c('Terverifikasi')], ['Dikerjakan', c('Dikerjakan')], ['Selesai', c('Selesai')], ['Ditolak', c('Ditolak')]].map(([l, v]) => (
            <div key={l} className="card p-4 text-center"><div className="font-extrabold text-2xl text-navy font-poppins">{v}</div><div className="text-xs text-slate-500">{l}</div></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card p-4"><h4 className="font-bold text-sm mb-2">Per kategori</h4><ResponsiveContainer width="100%" height={200}><BarChart data={byCat}><XAxis dataKey="name" fontSize={10} /><YAxis /><Tooltip /><Bar dataKey="n" fill="#10B981" /></BarChart></ResponsiveContainer></div>
          <div className="card p-4"><h4 className="font-bold text-sm mb-2">Per status</h4><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={bySt} dataKey="n" nameKey="name" outerRadius={70} label>{bySt.map((_, i) => <Cell key={i} fill={['#94A3B8', '#3B82F6', '#F97316', '#10B981', '#EF4444'][i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="card p-4"><h4 className="font-bold text-sm mb-2">Tren</h4><ResponsiveContainer width="100%" height={200}><LineChart data={byCat}><XAxis dataKey="name" fontSize={10} /><YAxis /><Tooltip /><Line dataKey="n" stroke="#123B65" /></LineChart></ResponsiveContainer></div>
        </div>
      </>}
      {tab === 'rep' && <div className="card overflow-auto"><table className="w-full text-sm">
        <thead><tr className="bg-slate-100 text-left text-xs"><th className="p-2">Tiket</th><th className="p-2">Judul</th><th className="p-2">Status</th><th className="p-2">Aksi</th></tr></thead>
        <tbody>{list.map(r => <tr key={r.id} className="border-t"><td className="p-2 font-mono text-xs">{r.ticket}</td><td className="p-2"><Link to={`/report/${r.ticket}`} className="font-bold text-navy">{r.title}</Link></td><td className="p-2"><StatusBadge s={r.status} /></td><td className="p-2"><button className="btn btn-primary !py-1 !px-2 text-xs" onClick={() => { setSel(r); setReply(r.official_reply); }}>Kelola</button></td></tr>)}</tbody>
      </table></div>}
      {tab === 'usr' && <div className="card overflow-auto"><table className="w-full text-sm">
        <thead><tr className="bg-slate-100 text-left text-xs"><th className="p-2">Nama</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Aksi</th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id} className="border-t"><td className="p-2 font-bold">{u.name}</td><td className="p-2">{u.email}</td><td className="p-2">{u.role}</td><td className="p-2"><button className="btn btn-outline !py-1 !px-2 text-xs" onClick={async () => { await supabase.rpc('set_user_role', { target_id: u.id, new_role: u.role === 'admin' ? 'user' : 'admin' }); load(); }}>{u.role === 'admin' ? 'Cabut admin' : 'Jadikan admin'}</button></td></tr>)}</tbody>
      </table></div>}
      {sel && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="card p-5 max-w-md w-full">
          <h3 className="font-bold mb-2">Kelola {sel.ticket}</h3>
          <label className="text-xs font-bold">Balasan resmi</label><textarea className="input mb-2" rows={2} value={reply} onChange={e => setReply(e.target.value)} />
          <label className="text-xs font-bold">Catatan</label><textarea className="input mb-3" rows={2} value={note} onChange={e => setNote(e.target.value)} />
          <div className="flex gap-2 flex-wrap">{['Terverifikasi', 'Dikerjakan', 'Selesai', 'Ditolak'].map(s => <button key={s} onClick={() => save(s)} className="btn btn-emerald !py-1.5 text-xs">→ {s}</button>)}
            <button onClick={() => setSel(null)} className="btn btn-outline !py-1.5 text-xs">Batal</button></div>
        </div>
      </div>}
    </div>
  );
}
