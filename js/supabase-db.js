/* CityReport — Supabase bridge (opsional).
   Aktif hanya jika js/config.js diisi (window.SUPABASE_URL + KEY).
   Mode: pull-sync (data publik Supabase digabung ke DB lokal tiap boot)
   + auth bridge (login Supabase → mirror user lokal). Tulis tetap lokal
   kecuali lewat React app. Tanpa config → murni localStorage. */
(function () {
  async function boot() {
    const URL = window.SUPABASE_URL || "", KEY = window.SUPABASE_ANON_KEY || "";
    if (!URL || !KEY || !window.supabase) return; // offline mode
    try {
      const sb = window.supabase.createClient(URL, KEY);
      window.Supa = sb;
      // 1) pull laporan publik (max 200 terbaru)
      const { data } = await sb.from("reports")
        .select("*").order("created_at", { ascending: false }).limit(200);
      if (data && data.length) {
        const db = Store.db();
        const have = new Set(db.reports.map((r) => r.ticket));
        data.forEach((r) => {
          if (have.has(r.ticket)) return;
          db.reports.push({
            id: r.id, ticket: r.ticket, user_id: r.user_id,
            title: r.title, category: r.category, description: r.description,
            photo: r.photo, after_photo: r.after_photo || "",
            lat: r.lat, lng: r.lng, address: r.address, status: r.status,
            official_reply: r.official_reply || "", demo: false,
            created_at: new Date(r.created_at).getTime(),
            updated_at: new Date(r.updated_at).getTime(),
            _remote: true,
          });
        });
        Store.save();
        if (typeof renderAll === "function") renderAll();
        if (typeof toast === "function") toast("🌐 Tersambung database online (" + data.length + " laporan)", "ok");
      }
      document.body.setAttribute("data-db", "online");
    } catch (e) { console.warn("Supabase sync gagal, mode lokal.", e); }
  }
  // Auth bridge: login Supabase → mirror ke user lokal agar seluruh fitur jalan
  window.supaLogin = async function (email, pass) {
    const sb = window.Supa; if (!sb) throw new Error("Backend online belum dikonfigurasi.");
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    const meta = data.user;
    const db = Store.db();
    let u = db.users.find((x) => x.email === meta.email);
    if (!u) {
      u = { id: meta.id, name: meta.user_metadata?.name || meta.email.split("@")[0], email: meta.email, pass: "-", role: "user", avatar: "", created_at: Date.now(), badge: "Kontributor Baru" };
      db.users.push(u);
    }
    db.session = u.id; Store.save(); return u;
  };
  window.addEventListener("DOMContentLoaded", boot);
})();
