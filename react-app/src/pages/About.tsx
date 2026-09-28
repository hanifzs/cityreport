export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-poppins font-extrabold text-3xl text-navy mb-2">Tentang CityReport</h1>
      <p className="text-slate-600 mb-4">Platform pelaporan infrastruktur kota yang transparan: setiap laporan punya nomor tiket, timeline, dan bukti foto sebelum–sesudah.</p>
      <div className="card p-6 mb-4"><h3 className="font-bold mb-2">📖 Panduan</h3>
        <ol className="list-decimal ml-5 text-sm text-slate-600 flex flex-col gap-1">
          <li>Daftar / masuk akun.</li>
          <li>Buat Laporan → isi foto, klik lokasi di peta → kirim, dapat nomor tiket 🎫.</li>
          <li>Pantau timeline Menunggu → Terverifikasi → Dikerjakan → Selesai.</li>
        </ol></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-5"><h3 className="font-bold">🔒 Privasi</h3><p className="text-sm text-slate-500">Nama disamarkan, RLS + RBAC aktif di Supabase.</p></div>
        <div className="card p-5"><h3 className="font-bold">📜 Ketentuan</h3><p className="text-sm text-slate-500">Dilarang spam. Kontak: halo@cityreport.id</p></div>
      </div>
    </div>
  );
}
