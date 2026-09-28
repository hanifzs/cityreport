import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { supabase, Report, STCOLOR } from '../lib/supabase';
import { Link } from 'react-router-dom';

export function useLeafletMap(elId: string, center: [number, number] = [-6.205, 106.826], zoom = 12) {
  const ref = useRef<L.Map | null>(null);
  useEffect(() => {
    const el = document.getElementById(elId);
    if (!el || ref.current) return;
    const map = L.map(el).setView(center, zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    ref.current = map;
    setTimeout(() => map.invalidateSize(), 300);
    return () => { map.remove(); ref.current = null; };
  }, [elId]);
  return ref;
}

export default function MapView() {
  const [list, setList] = useState<Report[]>([]);
  const mapRef = useLeafletMap('rmap');
  useEffect(() => { supabase.from('reports').select('*').limit(300).then(({ data }) => setList(data ?? [])); }, []);
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const layer = L.layerGroup().addTo(map);
    list.forEach(r => {
      L.circleMarker([r.lat, r.lng], { radius: 9, color: '#fff', weight: 2, fillColor: STCOLOR[r.status], fillOpacity: 0.95 })
        .bindPopup(`<b>${r.title}</b><br>${r.ticket}<br><a href="/report/${r.ticket}">Detail →</a>`).addTo(layer);
    });
    return () => { layer.remove(); };
  }, [list, mapRef]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-4">
      <div className="card p-2 lg:col-span-2"><div id="rmap" style={{ height: 480 }} className="rounded-xl" /></div>
      <div className="card p-4 max-h-[520px] overflow-auto">
        <h3 className="font-bold mb-2">📋 Laporan ({list.length})</h3>
        {list.map(r => <Link key={r.id} to={`/report/${r.ticket}`} className="block border rounded-xl p-2 mb-2 text-sm hover:bg-slate-50"><b>{r.title}</b><div className="text-xs text-slate-500">{r.ticket} • {r.status}</div></Link>)}
      </div>
    </div>
  );
}
