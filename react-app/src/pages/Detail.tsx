import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import { supabase, Report } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './Home';

export default function Detail() {
  const { ticket } = useParams();
  const { user } = useAuth();
  const [r, setR] = useState<Report | null>(null);
  const [sup, setSup] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [hist, setHist] = useState<any[]>([]);
  const [text, setText] = useState('');

  const load = async () => {
    const { data } = await supabase.from('reports').select('*').eq('ticket', ticket).single();
    if (!data) return;
    setR(data);
    const { data: s } = await supabase.from('report_supports').select('*').eq('report_id', data.id);
    setSup(s?.length ?? 0);
    setLiked(!!s?.some(x => x.user_id === user?.id));
    const { data: c } = await supabase.from('comments').select('*,profiles(name)').eq('report_id', data.id).order('created_at');
    setComments(c ?? []);
    const { data: h } = await supabase.from('report_status_history').select('*').eq('report_id', data.id).order('created_at');
    setHist(h ?? []);
  };
  useEffect(() => { load(); }, [ticket, user]);

  useEffect(() => {
    if (!r || !document.getElementById('dmap')) return;
    const map = L.map('dmap').setView([r.lat, r.lng], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    L.marker([r.lat, r.lng]).addTo(map);
    return () => { map.remove(); };
  }, [r?.id]);

  const toggle = async () => {
    if (!user || !r) return;
    if (liked) await supabase.from('report_supports').delete().eq('report_id', r.id).eq('user_id', user.id);
    else await supabase.from('report_supports').insert({ report_id: r.id, user_id: user.id });
    load();
  };
  const send = async () => {
    if (!user || !r || !text.trim()) return;
    await supabase.from('comments').insert({ report_id: r.id, user_id: user.id, text: text.trim() });
    setText(''); load();
  };

  if (!r) return <div className="p-10 text-center">Memuat…</div>;
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="card overflow-hidden">
          <img src={r.photo} className="w-full max-h-96 object-cover" />
          {r.after_photo && <div className="grid grid-cols-2 gap-2 p-3">
            <div><span className="badge bg-slate-100">Sebelum</span><img src={r.photo} className="rounded-xl h-40 w-full object-cover" /></div>
            <div><span className="badge bg-emerald-100 text-emerald-700">Sesudah</span><img src={r.after_photo} className="rounded-xl h-40 w-full object-cover" /></div>
          </div>}
          <div className="p-5">
            <div className="flex gap-2 mb-2"><StatusBadge s={r.status} /><span className="badge bg-slate-100 text-navy">{r.category}</span></div>
            <h1 className="font-poppins font-extrabold text-2xl text-navy">{r.title}</h1>
            <p className="text-xs text-slate-500 mb-3">🎫 {r.ticket} • 📍 {r.address}</p>
            <p className="whitespace-pre-line mb-4">{r.description}</p>
            <button disabled={!user} onClick={toggle} className={`btn ${liked ? 'btn-emerald' : 'btn-outline'} !py-1.5`}>❤️ {liked ? 'Didukung' : 'Dukung'} ({sup})</button>
          </div>
        </div>
        {r.official_reply && <div className="card p-5 border-l-4 border-emerald-500"><h3 className="font-bold">🏛️ Tanggapan Resmi</h3><p className="text-sm">{r.official_reply}</p></div>}
        <div className="card p-5"><h3 className="font-bold mb-2">🕓 Timeline</h3>
          {hist.map(h => <div key={h.id} className="text-sm border-l-2 border-emerald-500 pl-3 mb-2"><b>{h.from_status} → {h.to_status}</b><div className="text-xs text-slate-500">{h.note}</div></div>)}
        </div>
        <div className="card p-5"><h3 className="font-bold mb-3">💬 Komentar ({comments.length})</h3>
          {user && <div className="flex gap-2 mb-3"><input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="Tulis komentar…" maxLength={500} /><button className="btn btn-primary !py-1.5" onClick={send}>Kirim</button></div>}
          {comments.map(c => <div key={c.id} className="border rounded-xl p-3 text-sm mb-2"><b>{c.profiles?.name ?? 'Warga'}</b><p>{c.text}</p></div>)}
        </div>
      </div>
      <div><div className="card p-2"><div id="dmap" style={{ height: 240 }} className="rounded-xl" /><p className="text-xs p-2 text-slate-500">🧭 {r.lat}, {r.lng}</p></div></div>
    </div>
  );
}
