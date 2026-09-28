/* CityReport App — SPA hash router */
const $=s=>document.querySelector(s);
let MAPS={};
function toast(msg,type){const w=$("#toasts");const d=document.createElement("div");d.className="toast "+(type||"info");d.innerHTML="<span>"+(type==="ok"?"✅":type==="err"?"⚠️":"ℹ️")+"</span><span>"+esc(msg)+"</span>";w.appendChild(d);setTimeout(()=>{d.style.opacity="0";setTimeout(()=>d.remove(),300)},3200);}
function confirmBox(msg,onYes){$("#modal").innerHTML=`<div class="modal-bg"><div class="card p-6 max-w-sm w-full"><h3 class="font-bold mb-2 font-poppins">${esc(msg)}</h3><div class="flex gap-2 justify-end mt-4"><button class="btn btn-outline btn-sm" onclick="document.querySelector('#modal').innerHTML=''">${t("cancel")}</button><button class="btn btn-danger btn-sm" id="cfYes">${t("yesDel")}</button></div></div></div>`;$("#cfYes").onclick=()=>{$("#modal").innerHTML="";onYes();};}
function go(h){location.hash=h;}
function userAvatar(u,sz){sz=sz||40;if(u&&u.avatar)return `<img src="${u.avatar}" class="rounded-full object-cover" style="width:${sz}px;height:${sz}px">`;const n=(u?u.name:"?").trim()[0]||"?";return `<div class="rounded-full flex items-center justify-center font-bold text-white" style="width:${sz}px;height:${sz}px;background:#123B65">${esc(n.toUpperCase())}</div>`;}
function statusBadge(s){return `<span class="badge st-${s}">${stLabel(s)}</span>`;}
function supportCount(r){return Store.supports(r.id).length;}
function reportCard(r){const u=Store.db().users.find(x=>x.id===r.user_id);return `<div class="card overflow-hidden cursor-pointer hover:shadow-lg transition" onclick="go('#/report/${r.ticket}')">
<img src="${esc(r.photo)}" class="w-full h-44 object-cover" loading="lazy" onerror="this.src='${SEED_PHOTOS.lainnya}'">
<div class="p-4"><div class="flex items-center gap-2 mb-2 flex-wrap">${statusBadge(r.status)}<span class="badge" style="background:#E8EEF6;color:#123B65">${catIcon(r.category)} ${catLabel(r.category)}</span>${r.demo?'<span class="badge" style="background:#FEF3C7;color:#92400E">DEMO</span>':""}</div>
<h3 class="font-bold font-poppins line-clamp-2 mb-1">${esc(r.title)}</h3>
<p class="text-xs text-slate-500 mb-2">🎫 ${esc(r.ticket)} • 📍 ${esc(r.address||"")} • ${fmtDate(r.created_at)}</p>
<div class="flex items-center justify-between text-sm"><span class="text-slate-600">👤 ${esc(maskName(u?u.name:""))}</span><span class="font-bold" style="color:#123B65">❤️ ${supportCount(r)} ${t("likes")}</span></div></div></div>`;}
/* ---------- chrome ---------- */
function renderChrome(){
  const m=Store.me(),l=Store.lang(),h=location.hash||"#/";
  const link=(href,label)=>`<a href="${href}" class="navlink ${h.startsWith(href.slice(1))&&href!=="#/"?"active":""} ${href==="#/"&&h==="#/"?"active":""}">${label}</a>`;
  $("#navbar").innerHTML=`<header class="bg-white border-b sticky top-0 z-40"><div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
  <a href="#/" class="flex items-center gap-2 font-poppins font-extrabold text-lg" style="color:#123B65"><span class="inline-flex items-center justify-center rounded-xl text-white font-extrabold" style="width:34px;height:34px;background:linear-gradient(135deg,#123B65,#10B981)">C</span>CityReport</a>
  <nav class="hidden lg:flex items-center gap-1 ml-4">${link("#/",t("home"))}${link("#/map",t("map"))}${link("#/reports",t("reports"))}${link("#/about",t("about"))}${m&&m.role==="admin"?link("#/admin",t("admin")):""}</nav>
  <div class="ml-auto flex items-center gap-2">
  <button class="btn btn-outline btn-sm" onclick="toggleLang()" title="${t("setLang")}">🌐 ${l==="id"?"ID":"EN"}</button>
  ${m?`<a href="#/notifications" class="btn btn-outline btn-sm relative">🔔${Store.unread()?`<span class="absolute -top-2 -right-2 text-white text-[10px] rounded-full px-1.5 py-0.5" style="background:#EF4444">${Store.unread()}</span>`:""}</a>
  <a href="#/dashboard" class="btn btn-outline btn-sm hidden sm:inline-flex">${esc(m.name.split(" ")[0])}</a>
  <button class="btn btn-primary btn-sm" onclick="Store.logout();Store.save();renderAll();go('#/');toast('${l==="id"?"Keluar berhasil":"Signed out"}','ok')">${t("logout")}</button>`
  :`<a href="#/login" class="btn btn-outline btn-sm">${t("login")}</a><a href="#/register" class="btn btn-primary btn-sm">${t("register")}</a>`}
  </div></div></header>`;
  $("#footer").innerHTML=`<footer class="mt-12 text-slate-300" style="background:#0d2c4d"><div class="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
  <div><div class="font-poppins font-extrabold text-white text-lg mb-2">CityReport</div><p class="text-sm">${esc(t("aboutText"))}</p><p class="text-xs mt-3 opacity-70">${esc(t("supabase"))}</p></div>
  <div><div class="font-bold text-white mb-2">CityReport</div><div class="flex flex-col gap-1 text-sm"><a href="#/about">${t("about")}</a><a href="#/reports">${t("reports")}</a><a href="#/map">${t("map")}</a></div></div>
  <div><div class="font-bold text-white mb-2">${t("guide")}</div><div class="flex flex-col gap-1 text-sm"><a href="#/about">${t("guide")}</a><a href="#/about">${t("contact")}: halo@cityreport.id</a><a href="#/about">${t("privacy")}</a><a href="#/about">${t("terms")}</a></div></div>
  <div><div class="font-bold text-white mb-2">© 2026 CityReport</div><p class="text-xs">GovTech • transparan • partisipatif</p><div class="flex gap-2 mt-3"><button class="btn btn-outline btn-sm" onclick="seedDemo()">Demo data</button><button class="btn btn-outline btn-sm" onclick="Store.reset();renderAll();toast('Reset OK','ok')">Reset</button></div></div>
  </div></footer>`;
  const bn=[["#/","🏠",t("home")],["#/map","🗺️",t("map")],["#/create-report","➕",t("createReport")],["#/reports","📋",t("reports")],["#/dashboard","👤",m?t("dashboard"):t("login")]];
  $("#bottomnav").innerHTML=bn.map(([href,ic,lb])=>`<a href="${href}" class="${(h===href||(href==="#/"&&h==="#/"))?"active":""}"><span class="text-lg">${ic}</span>${lb}</a>`).join("");
}
window.toggleLang=()=>{Store.setLang(Store.lang()==="id"?"en":"id");renderAll();};
window.seedDemo=()=>{Store.reset();renderAll();toast("Data contoh dimuat / sample loaded","ok");};
/* ---------- pages ---------- */
function skeleton(n){return Array(n).fill(`<div class="card p-4"><div class="skeleton h-40 mb-3"></div><div class="skeleton h-4 w-3/4 mb-2"></div><div class="skeleton h-4 w-1/2"></div></div>`).join("");}
function emptyBox(msg){return `<div class="card p-10 text-center text-slate-500"><div class="text-5xl mb-3">📭</div><p class="font-semibold">${esc(msg||t("empty"))}</p></div>`;}

function vHome(){
  const s=Store.stats(),latest=Store.list().slice(0,6);
  const cats=CATS.map(c=>{const n=Store.db().reports.filter(r=>r.category===c.id).length;return `<a href="#/reports?cat=${c.id}" class="card cat-card p-4 text-center"><div class="text-3xl mb-1">${c.icon}</div><div class="font-bold text-sm">${Store.lang()==="en"?c.en_label:c.id_label}</div><div class="text-xs text-slate-500">${n} laporan/reports</div></a>`;}).join("");
  return `<section class="text-white" style="background:linear-gradient(135deg,#123B65 40%,#155e75 75%,#10B981)">
  <div class="max-w-6xl mx-auto px-4 py-12 lg:py-16 grid lg:grid-cols-2 gap-8 items-center">
  <div><h1 class="font-poppins font-extrabold text-3xl lg:text-5xl leading-tight mb-3">${t("heroTitle")}</h1>
  <p class="opacity-90 mb-6">${t("heroSub")}</p>
  <div class="flex flex-wrap gap-3"><a href="#/create-report" class="btn btn-emerald">➕ ${t("createReport")}</a><a href="#/map" class="btn" style="background:#fff;color:#123B65">🗺️ ${t("viewMap")}</a></div>
  <p class="text-xs mt-4 opacity-70">🎫 CR-YYYY-XXXX • 📸 before/after • 🌐 ID/EN • 🗺️ OpenStreetMap</p></div>
  <div class="card p-3"><div id="heroMap" style="height:300px;border-radius:.7rem"></div><p class="text-xs text-slate-500 p-2">📍 ${t("mapPreview")} — ${s.total} laporan</p></div></div></section>
  <div class="max-w-6xl mx-auto px-4">
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 -mt-6 relative z-10">
  ${[[s.total,t("totalReports"),"📊"],[s.Selesai,t("done"),"✅"],[s.Dikerjakan+s.Terverifikasi+s.Menunggu,t("inProgress"),"🔧"],[s.supports,t("support"),"❤️"]].map(([v,l,ic])=>`<div class="card p-4 text-center"><div class="text-2xl">${ic}</div><div class="font-poppins font-extrabold text-2xl" style="color:#123B65">${v}</div><div class="text-xs text-slate-500 font-semibold">${l}</div></div>`).join("")}
  </div>
  <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">ℹ️ ${t("demoNote")}</p>
  <h2 class="font-poppins font-extrabold text-xl mt-8 mb-3" style="color:#123B65">${t("categories")}</h2>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">${cats}</div>
  <div class="flex items-center justify-between mt-8 mb-3"><h2 class="font-poppins font-extrabold text-xl" style="color:#123B65">${t("latest")}</h2><a href="#/reports" class="btn btn-outline btn-sm">${t("seeAll")} →</a></div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${latest.map(reportCard).join("")||emptyBox()}</div>
  <h2 class="font-poppins font-extrabold text-xl mt-10 mb-3" style="color:#123B65">${t("how")}</h2>
  <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${[[1,t("s1t"),t("s1d"),"📝"],[2,t("s2t"),t("s2d"),"🔍"],[3,t("s3t"),t("s3d"),"👷"],[4,t("s4t"),t("s4d"),"✅"]].map(([n,a,b,ic])=>`<div class="card p-5"><div class="text-3xl mb-2">${ic}</div><div class="text-xs font-bold text-slate-400">STEP ${n}</div><div class="font-bold font-poppins mb-1">${a}</div><p class="text-sm text-slate-500">${b}</p></div>`).join("")}</div>
  <h2 class="font-poppins font-extrabold text-xl mt-10 mb-3" style="color:#123B65">${t("statsPublic")}</h2>
  <div class="grid lg:grid-cols-3 gap-4"><div class="card p-5"><div class="text-sm text-slate-500">${t("completion")}</div><div class="font-poppins font-extrabold text-4xl" style="color:#10B981">${s.pct}%</div><div class="text-xs text-slate-500 mt-1">${t("avgTime")}: ${s.avg?Math.round(s.avg/86400000)+" hari/days":"—"} • ${t("topCat")}: ${catLabel(Object.entries(s.byCat).sort((a,b)=>b[1]-a[1])[0]?.[0])}</div></div>
  <div class="card p-5 lg:col-span-2"><div class="font-bold mb-2 text-sm">${t("trend")} (6 bln/mo)</div><canvas id="chTrend" height="120"></canvas></div></div>
  </div>`;
}
function vReports(q){
  const p=new URLSearchParams(q||"");let list=Store.list();
  const fS=p.get("status")||"All",fC=p.get("cat")||"",fQ=(p.get("q")||"").toLowerCase();
  if(fC)list=list.filter(r=>r.category===fC);if(fS!=="All")list=list.filter(r=>r.status===fS);
  if(fQ)list=list.filter(r=>(r.title+r.address+r.ticket).toLowerCase().includes(fQ));
  const sts=["All","Menunggu","Terverifikasi","Dikerjakan","Selesai","Ditolak"];
  return `<div class="max-w-6xl mx-auto px-4 py-6 pad-mobile"><h1 class="font-poppins font-extrabold text-2xl mb-4" style="color:#123B65">📋 ${t("reports")} (${list.length})</h1>
  <div class="card p-4 mb-4 flex flex-col lg:flex-row gap-2"><input id="fq" class="input" placeholder="${t("searchPh")}" value="${esc(p.get("q")||"")}">
  <select id="fc" class="input lg:w-52"><option value="">${t("allCat")}</option>${CATS.map(c=>`<option value="${c.id}" ${fC===c.id?"selected":""}>${c.icon} ${Store.lang()==="en"?c.en_label:c.id_label}</option>`).join("")}</select>
  <select id="fs" class="input lg:w-52">${sts.map(s=>`<option ${fS===s?"selected":""}>${s==="All"?t("allStatus"):stLabel(s)}</option>`).join("")}</select>
  <button class="btn btn-primary" onclick="applyFilter()">🔍</button></div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" id="repGrid">${list.map(reportCard).join("")||emptyBox()}</div></div>`;
}
window.applyFilter=()=>{const q=$("#fq").value,fc=$("#fc").value;let fs=$("#fs").value;const map={"Menunggu":"Menunggu","Pending":"Menunggu","Terverifikasi":"Terverifikasi","Verified":"Terverifikasi","Dikerjakan":"Dikerjakan","In Progress":"Dikerjakan","Selesai":"Selesai","Resolved":"Selesai","Ditolak":"Ditolak","Rejected":"Ditolak"};if(fs!==t("allStatus")&&fs!=="All")fs=map[fs]||fs;else fs="All";go(`#/reports?cat=${fc}&status=${fs}&q=${encodeURIComponent(q)}`);};

const STCOLOR={Menunggu:"gray",Terverifikasi:"blue",Dikerjakan:"orange",Selesai:"green",Ditolak:"red"};
function vMap(){
  return `<div class="max-w-6xl mx-auto px-4 py-6 pad-mobile"><h1 class="font-poppins font-extrabold text-2xl mb-1" style="color:#123B65">🗺️ ${t("map")}</h1>
  <div class="flex flex-wrap gap-2 text-xs font-bold mb-3">${Object.entries({Menunggu:"#6B7280",Terverifikasi:"#2563EB",Dikerjakan:"#EA580C",Selesai:"#059669",Ditolak:"#DC2626"}).map(([k,c])=>`<span class="badge" style="background:${c}22;color:${c};border:1px solid ${c}">● ${stLabel(k)}</span>`).join("")}</div>
  <div class="card p-3 mb-3 flex flex-col lg:flex-row gap-2"><input id="mq" class="input" placeholder="${t("searchPh")}"><select id="mc" class="input lg:w-52"><option value="">${t("allCat")}</option>${CATS.map(c=>`<option value="${c.id}">${c.icon} ${Store.lang()==="en"?c.en_label:c.id_label}</option>`).join("")}</select>
  <select id="ms" class="input lg:w-52"><option value="">${t("allStatus")}</option>${["Menunggu","Terverifikasi","Dikerjakan","Selesai","Ditolak"].map(s=>`<option value="${s}">${stLabel(s)}</option>`).join("")}</select>
  <button class="btn btn-primary btn-sm" onclick="drawMapMarkers()">🔍</button></div>
  <div class="grid lg:grid-cols-3 gap-4"><div class="card p-2 lg:col-span-2"><div id="mainMap" style="height:480px"></div></div>
  <div class="card p-4 max-h-[520px] overflow-auto"><h3 class="font-bold mb-2">📋 Laporan (<span id="mapCount"></span>)</h3><div id="mapList" class="flex flex-col gap-2"></div></div></div></div>`;
}
window.drawMapMarkers=()=>{
  const q=($("#mq")?.value||"").toLowerCase(),fc=$("#mc")?.value||"",fs=$("#ms")?.value||"";
  let list=Store.list();if(fc)list=list.filter(r=>r.category===fc);if(fs)list=list.filter(r=>r.status===fs);if(q)list=list.filter(r=>(r.title+r.address+r.ticket).toLowerCase().includes(q));
  const layer=MAPS.markers;if(!layer)return;layer.clearLayers();
  list.forEach(r=>{const m=L.circleMarker([r.lat,r.lng],{radius:9,color:"#fff",weight:2,fillColor:{Menunggu:"#6B7280",Terverifikasi:"#2563EB",Dikerjakan:"#EA580C",Selesai:"#059669",Ditolak:"#DC2626"}[r.status],fillOpacity:.95});m.bindPopup(`<b>${esc(r.title)}</b><br>${r.ticket} • ${stLabel(r.status)}<br><a href="#/report/${r.ticket}">Lihat detail →</a>`);m.addTo(layer);});
  $("#mapCount").textContent=list.length;
  $("#mapList").innerHTML=list.map(r=>`<div class="border rounded-xl p-2 text-sm cursor-pointer hover:bg-slate-50" onclick="go('#/report/${r.ticket}')"><div class="font-bold line-clamp-2">${esc(r.title)}</div><div class="text-xs text-slate-500">${r.ticket} • ${statusBadge(r.status)}</div></div>`).join("")||emptyBox();
};
function initMap(el,list,clickCb){
  if(!window.L)return;const map=L.map(el).setView([-6.205,106.826],12);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
  const layer=L.layerGroup().addTo(map);MAPS.markers=layer;
  (list||[]).forEach(r=>{const m=L.circleMarker([r.lat,r.lng],{radius:8,color:"#fff",weight:2,fillColor:{Menunggu:"#6B7280",Terverifikasi:"#2563EB",Dikerjakan:"#EA580C",Selesai:"#059669",Ditolak:"#DC2626"}[r.status]||"#666",fillOpacity:.95});m.bindPopup(`<b>${esc(r.title)}</b><br>${r.ticket}<br><a href="#/report/${r.ticket}">Detail →</a>`);m.addTo(layer);});
  if(clickCb){let mk=null;map.on("click",e=>{if(mk)map.removeLayer(mk);mk=L.marker(e.latlng,{draggable:true}).addTo(map);mk.on("dragend",()=>clickCb(mk.getLatLng(),mk));clickCb(e.latlng,mk);});}
  setTimeout(()=>map.invalidateSize(),300);return map;
}
function vDetail(id){
  const r=Store.get(id);if(!r)return `<div class="max-w-3xl mx-auto p-8">${emptyBox(t("notFound"))}</div>`;
  const m=Store.me(),u=Store.db().users.find(x=>x.id===r.user_id);
  const sup=Store.supports(r.id),liked=m&&Store.supported(r.id,m.id);
  const coms=Store.commentsOf(r.id),hist=Store.history(r.id);
  const steps=["Menunggu","Terverifikasi","Dikerjakan","Selesai"];const idx=r.status==="Ditolak"?-1:steps.indexOf(r.status);
  return `<div class="max-w-5xl mx-auto px-4 py-6 pad-mobile grid lg:grid-cols-3 gap-4">
  <div class="lg:col-span-2 flex flex-col gap-4">
  <div class="card overflow-hidden"><img src="${esc(r.photo)}" class="w-full max-h-96 object-cover" onerror="this.src='${SEED_PHOTOS.lainnya}'">
  ${r.after_photo?`<div class="grid grid-cols-2 gap-2 p-3"><div><div class="badge st-Menunggu mb-1">${t("before")}</div><img src="${esc(r.photo)}" class="rounded-xl h-40 w-full object-cover"></div><div><div class="badge st-Selesai mb-1">${t("after")}</div><img src="${esc(r.after_photo)}" class="rounded-xl h-40 w-full object-cover"></div></div>`:""}
  <div class="p-5"><div class="flex gap-2 flex-wrap mb-2">${statusBadge(r.status)}<span class="badge" style="background:#E8EEF6;color:#123B65">${catIcon(r.category)} ${catLabel(r.category)}</span>${r.demo?'<span class="badge" style="background:#FEF3C7;color:#92400E">DEMO</span>':""}</div>
  <h1 class="font-poppins font-extrabold text-2xl mb-1" style="color:#123B65">${esc(r.title)}</h1>
  <p class="text-xs text-slate-500 mb-3">🎫 ${esc(r.ticket)} • 👤 ${esc(maskName(u?u.name:""))} • 📅 ${fmtDate(r.created_at)} • 📍 ${esc(r.address||"")}</p>
  <p class="text-slate-700 whitespace-pre-line mb-4">${esc(r.description)}</p>
  <div class="flex flex-wrap gap-2">
  <button class="btn ${liked?"btn-emerald":"btn-outline"} btn-sm" onclick="doSupport('${r.id}')">❤️ ${liked?t("supported"):t("supportBtn")} (${sup.length})</button>
  ${m&&(m.id===r.user_id||m.role==="admin")?`<button class="btn btn-outline btn-sm" onclick="go('#/edit/${r.ticket}')">✏️ ${t("edit")}</button>`:""}
  ${m&&(m.id===r.user_id||m.role==="admin")?`<button class="btn btn-danger btn-sm" onclick="delReport('${r.id}')">🗑️ ${t("delete")}</button>`:""}
  ${m&&m.role==="admin"?`<button class="btn btn-primary btn-sm" onclick="go('#/admin/reports/${r.ticket}')">🛠️ ${t("admin")}</button>`:""}
  </div></div></div>
  ${r.official_reply?`<div class="card p-5 border-l-4" style="border-color:#10B981"><h3 class="font-bold mb-1">🏛️ ${t("official")}</h3><p class="text-sm text-slate-700">${esc(r.official_reply)}</p></div>`:""}
  <div class="card p-5"><h3 class="font-bold font-poppins mb-3">🕓 ${t("timeline")}</h3><div class="flex flex-col gap-0">
  ${hist.map(hx=>{const au=Store.db().users.find(x=>x.id===hx.actor_id);return `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="timeline-dot" style="background:${hx.to_status==="Selesai"?"#10B981":hx.to_status==="Ditolak"?"#EF4444":"#123B65"}"></div><div class="w-0.5 flex-1 bg-slate-200"></div></div><div class="pb-4"><div class="text-sm font-bold">${hx.from_status} → ${stLabel(hx.to_status)}</div><div class="text-xs text-slate-500">${fmtDT(hx.created_at)} • ${esc(au?au.name:"system")}</div>${hx.note?`<div class="text-sm text-slate-600 mt-1">“${esc(hx.note)}”</div>`:""}</div></div>`;}).join("")}
  </div></div>
  <div class="card p-5"><h3 class="font-bold font-poppins mb-3">💬 ${t("comments")} (${coms.length})</h3>
  ${m?`<div class="flex gap-2 mb-4"><input id="cIn" class="input" maxlength="500" placeholder="${t("writeComment")}"><button class="btn btn-primary btn-sm" onclick="sendComment('${r.id}')">${t("submit")}</button></div>`:`<p class="text-sm text-slate-500 mb-3"><a class="font-bold" style="color:#123B65" href="#/login">${t("login")}</a> untuk berkomentar.</p>`}
  <div class="flex flex-col gap-2">${coms.map(c=>{const cu=Store.db().users.find(x=>x.id===c.user_id);return `<div class="border rounded-xl p-3 text-sm"><div class="flex items-center gap-2 mb-1">${userAvatar(cu,26)}<b>${esc(cu?maskName(cu.name):"?")}</b><span class="text-xs text-slate-400">${timeAgo(c.created_at)}</span><span class="ml-auto flex gap-1">${m&&(m.id===c.user_id||m.role==="admin")?`<button class="text-red-500 text-xs" onclick="Store.delComment('${c.id}');renderAll()">Hapus</button>`:""}${m?`<button class="text-xs text-slate-400" onclick="Store.flagComment('${c.id}');toast('Dilaporkan/reported','info')">⚑</button>`:""}</span></div><p>${esc(c.text)}</p>${c.flagged?'<p class="text-[11px] text-amber-600">⚠️ dilaporkan / flagged</p>':""}</div>`;}).join("")||`<p class="text-sm text-slate-400">Belum ada komentar.</p>`}</div></div>
  </div>
  <div class="flex flex-col gap-4"><div class="card p-3"><div id="detMap" style="height:240px"></div><p class="text-xs text-slate-500 p-2">📍 ${esc(r.address||"")}<br>🧭 ${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}</p></div>
  <div class="card p-5"><h3 class="font-bold mb-2">🎫 ${t("ticket")}</h3><p class="font-mono font-bold" style="color:#123B65">${esc(r.ticket)}</p><div class="text-xs text-slate-500 mt-2">${t("date")}: ${fmtDate(r.created_at)}<br>${t("reporter")}: ${esc(maskName(u?u.name:""))}<br>${t("status")}: ${stLabel(r.status)}<br>❤️ ${sup.length} ${t("likes")}</div></div></div></div>`;
}
window.doSupport=id=>{try{const n=Store.toggleSupport(id);renderAll();toast("❤️ "+n+" dukungan/supports","ok");}catch(e){toast(e.message,"err");go("#/login");}};
window.sendComment=id=>{try{Store.addComment(id,$("#cIn").value);renderAll();toast("Komentar terkirim/sent","ok");}catch(e){toast(e.message,"err");}};
window.delReport=id=>{confirmBox(t("confirmDel"),()=>{try{Store.deleteReport(id);go("#/my-reports");renderAll();toast("Dihapus/deleted","ok");}catch(e){toast(e.message,"err");}});};

function vAuth(mode){
  if(mode==="login")return `<div class="max-w-md mx-auto px-4 py-10 pad-mobile"><div class="card p-6"><h1 class="font-poppins font-extrabold text-2xl mb-1" style="color:#123B65">${t("loginTitle")}</h1><p class="text-sm text-slate-500 mb-4">admin@cityreport.id / admin123 • warga@example.com / warga123</p>
  <label class="lbl">${t("email")}</label><input id="lE" class="input mb-3" type="email" placeholder="nama@email.com">
  <label class="lbl">${t("pass")}</label><input id="lP" class="input mb-4" type="password" placeholder="••••••">
  <button class="btn btn-primary w-full mb-2" onclick="doLogin()">${t("login")}</button>
  <button class="btn btn-outline w-full mb-3" onclick="Store.google();renderAll();go('#/dashboard')">🔵 ${t("loginGoogle")}</button>
  <div class="flex justify-between text-sm"><a href="#/forgot-password" style="color:#123B65" class="font-semibold">${t("forgot")}</a><a href="#/register" style="color:#123B65" class="font-semibold">${t("register")}</a></div></div></div>`;
  if(mode==="register")return `<div class="max-w-md mx-auto px-4 py-10 pad-mobile"><div class="card p-6"><h1 class="font-poppins font-extrabold text-2xl mb-4" style="color:#123B65">${t("regTitle")}</h1>
  <label class="lbl">${t("name")}</label><input id="rN" class="input mb-3" placeholder="Nama kamu">
  <label class="lbl">${t("email")}</label><input id="rE" class="input mb-3" type="email">
  <label class="lbl">${t("pass")}</label><input id="rP" class="input mb-4" type="password">
  <button class="btn btn-emerald w-full mb-2" onclick="doReg()">${t("register")}</button>
  <p class="text-sm text-center">${t("hasAccount")}<a href="#/login" class="font-bold" style="color:#123B65">${t("login")}</a></p></div></div>`;
  return `<div class="max-w-md mx-auto px-4 py-10 pad-mobile"><div class="card p-6"><h1 class="font-poppins font-extrabold text-2xl mb-2" style="color:#123B65">${t("forgotTitle")}</h1><p class="text-sm text-slate-500 mb-4">${t("forgotInfo")}</p>
  <label class="lbl">${t("email")}</label><input id="fE" class="input mb-4" type="email">
  <button class="btn btn-primary w-full" onclick="try{Store.forgot(document.querySelector('#fE').value);toast('Password baru: baru123','ok');go('#/login');renderAll();}catch(e){toast(e.message,'err')}">Reset</button></div></div>`;
}
window.doLogin=()=>{try{Store.login($("#lE").value,$("#lP").value);renderAll();const m=Store.me();go(m.role==="admin"?"#/admin":"#/dashboard");toast("Halo/Hello, "+Store.me().name+"!","ok");}catch(e){toast(e.message,"err");}};
window.doReg=()=>{try{Store.register($("#rN").value,$("#rE").value,$("#rP").value);renderAll();go("#/dashboard");toast("Akun dibuat/account created","ok");}catch(e){toast(e.message,"err");}};

function vDash(){
  const m=Store.me();if(!m){go("#/login");return "";}
  const mine=Store.list().filter(r=>r.user_id===m.id);
  const c=s=>mine.filter(r=>r.status===s).length;
  return `<div class="max-w-6xl mx-auto px-4 py-6 pad-mobile"><div class="grid lg:grid-cols-4 gap-4">
  <aside class="hidden lg:flex flex-col gap-1 rounded-2xl p-4 text-white sticky top-20 h-fit" style="background:#123B65">
  <div class="flex items-center gap-3 mb-3">${userAvatar(m,44)}<div><div class="font-bold">${esc(m.name)}</div><div class="text-xs opacity-70">${m.role==="admin"?t("adminRole"):t("userRole")}${m.badge?" • 🏅 "+esc(m.badge):""}</div></div></div>
  ${[["#/dashboard","📊",t("dashboard")],["#/create-report","➕",t("createReport")],["#/my-reports","📋",t("myReports")],["#/notifications","🔔",t("notif")+" ("+Store.unread()+")"],["#/profile","👤",t("profile")],["#/settings","⚙️",t("settings")],...(m.role==="admin"?[["#/admin","🛠️",t("admin")]]:[])].map(([h,ic,lb])=>`<a href="${h}" class="sidebar-link ${(location.hash||"#/")===h?"active":""}">${ic} ${lb}</a>`).join("")}
  </aside><div class="lg:col-span-3">
  <h1 class="font-poppins font-extrabold text-2xl" style="color:#123B65">${t("hello")}, ${esc(m.name.split(" ")[0])}! 👋</h1><p class="text-sm text-slate-500 mb-4">${t("greet")}</p>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">${[[mine.length,t("totalReports"),"📊"],[c("Menunggu"),t("waiting"),"⏳"],[c("Dikerjakan")+c("Terverifikasi"),t("inProgress"),"🔧"],[c("Selesai"),t("done"),"✅"]].map(([v,l,ic])=>`<div class="card p-4 text-center"><div class="text-2xl">${ic}</div><div class="font-extrabold text-2xl font-poppins" style="color:#123B65">${v}</div><div class="text-xs text-slate-500 font-semibold">${l}</div></div>`).join("")}</div>
  <div class="flex gap-2 mb-4"><a href="#/create-report" class="btn btn-emerald btn-sm">➕ ${t("createReport")}</a><a href="#/my-reports" class="btn btn-outline btn-sm">📋 ${t("myReports")}</a></div>
  <h3 class="font-bold mb-2">🕓 ${t("myAct")}</h3><div class="grid sm:grid-cols-2 gap-3">${mine.slice(0,4).map(reportCard).join("")||emptyBox()}</div>
  </div></div></div>`;
}
function vCreate(editId){
  const m=Store.me();if(!m)return `<div class="max-w-xl mx-auto p-8">${emptyBox(t("needLogin"))}<div class="text-center mt-3"><a href="#/login" class="btn btn-primary">${t("login")}</a></div></div>`;
  const r=editId?Store.get(editId):null;
  return `<div class="max-w-3xl mx-auto px-4 py-6 pad-mobile"><h1 class="font-poppins font-extrabold text-2xl mb-4" style="color:#123B65">${r?"✏️ "+t("edit")+" "+r.ticket:"➕ "+t("createTitle")}</h1>
  <div class="card p-5 flex flex-col gap-3">
  <div><label class="lbl">${t("title")} *</label><input id="nT" class="input" maxlength="120" value="${esc(r?r.title:"")}" placeholder="cth: Jalan berlubang di…"></div>
  <div><label class="lbl">${t("category")} *</label><select id="nC" class="input">${CATS.map(c=>`<option value="${c.id}" ${r&&r.category===c.id?"selected":""}>${c.icon} ${Store.lang()==="en"?c.en_label:c.id_label}</option>`).join("")}</select></div>
  <div><label class="lbl">${t("description")} *</label><textarea id="nD" class="input" rows="4" placeholder="Ceritakan kondisi, bahaya, sejak kapan…">${esc(r?r.description:"")}</textarea></div>
  <div><label class="lbl">${t("photo")} (maks 2MB, jpg/png)</label><input id="nP" type="file" accept="image/*" class="input"><img id="nPv" class="rounded-xl mt-2 max-h-52 ${r?"":"hidden"} " src="${r?esc(r.photo):""}"><p class="text-xs text-slate-400">Foto tersimpan sebagai data lokal (base64) bila diunggah.</p></div>
  <div><label class="lbl">${t("address")} *</label><input id="nA" class="input" value="${esc(r?r.address:"")}" placeholder="Jl. … No. …"></div>
  <div><label class="lbl">${t("location")} *</label><div id="pickMap" style="height:300px"></div><p class="text-xs text-slate-500 mt-1">🧭 <span id="nLL">${r?r.lat.toFixed(5)+", "+r.lng.toFixed(5):"klik peta / click map"}</span></p></div>
  <div id="dupBox"></div>
  <button class="btn btn-emerald w-full" onclick="submitReport('${r?r.id:""}')">${r?t("save"):t("send")} 🚀</button>
  </div></div>`;
}
let PICK={lat:null,lng:null,photo:""};
window.submitReport=id=>{
  try{
    const d={title:$("#nT").value,category:$("#nC").value,description:$("#nD").value,address:$("#nA").value,lat:PICK.lat,lng:PICK.lng,photo:PICK.photo||undefined};
    if(id){Store.updateReport(id,{title:d.title,category:d.category,description:d.description,address:d.address,lat:d.lat??Store.get(id).lat,lng:d.lng??Store.get(id).lng,...(d.photo?{photo:d.photo}:{})});toast("Tersimpan/saved","ok");go("#/report/"+Store.get(id).ticket);}
    else{const r=Store.createReport(d);toast("Terkirim! 🎫 "+r.ticket,"ok");go("#/report/"+r.ticket);}
    PICK={lat:null,lng:null,photo:""};renderAll();
  }catch(e){toast(e.message,"err");}
};
function vMy(){
  const m=Store.me();if(!m){go("#/login");return "";}const p=new URLSearchParams((location.hash.split("?")[1]||""));
  let list=Store.list().filter(r=>r.user_id===m.id);const fs=p.get("status")||"All",fq=(p.get("q")||"").toLowerCase();
  if(fs!=="All")list=list.filter(r=>r.status===fs);if(fq)list=list.filter(r=>(r.title+r.ticket).toLowerCase().includes(fq));
  return `<div class="max-w-6xl mx-auto px-4 py-6 pad-mobile"><h1 class="font-poppins font-extrabold text-2xl mb-3" style="color:#123B65">📋 ${t("myReports")} (${list.length})</h1>
  <div class="card p-3 mb-4 flex gap-2 flex-col sm:flex-row"><input id="mq2" class="input" placeholder="${t("searchPh")}" value="${esc(p.get("q")||"")}"><select id="ms2" class="input sm:w-56"><option value="All">${t("filterStatus")}: ${t("all")}</option>${["Menunggu","Terverifikasi","Dikerjakan","Selesai","Ditolak"].map(s=>`<option value="${s}" ${fs===s?"selected":""}>${stLabel(s)}</option>`).join("")}</select><button class="btn btn-primary btn-sm" onclick="go('#/my-reports?status='+document.querySelector('#ms2').value+'&q='+encodeURIComponent(document.querySelector('#mq2').value))">🔍</button></div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${list.map(reportCard).join("")||emptyBox()}</div></div>`;
}
function vNotif(){
  const m=Store.me();if(!m){go("#/login");return "";}const ns=Store.myNotif();
  return `<div class="max-w-2xl mx-auto px-4 py-6 pad-mobile"><div class="flex items-center justify-between mb-3"><h1 class="font-poppins font-extrabold text-2xl" style="color:#123B65">🔔 ${t("notif")} (${Store.unread()})</h1><button class="btn btn-outline btn-sm" onclick="Store.readAll();renderAll()">${t("markRead")}</button></div>
  <div class="flex flex-col gap-2">${ns.map(n=>`<div class="card p-4 ${n.read?"opacity-70":"border-l-4"}" style="${n.read?"":"border-color:#10B981"}" onclick="Store.readNotif('${n.id}');renderAll();${n.report_id?`go('#/report/${Store.get(n.report_id)?.ticket||""}')`:""}"><div class="font-bold text-sm">${esc(n.title)}</div><div class="text-sm text-slate-600">${esc(n.body)}</div><div class="text-xs text-slate-400 mt-1">${timeAgo(n.created_at)}</div></div>`).join("")||emptyBox(t("noNotif"))}</div></div>`;
}
function vProfile(){
  const m=Store.me();if(!m){go("#/login");return "";}
  const mine=Store.list().filter(r=>r.user_id===m.id);const supN=Store.db().supports.filter(s=>s.user_id===m.id).length;
  const comN=Store.db().comments.filter(c=>c.user_id===m.id).length;
  return `<div class="max-w-3xl mx-auto px-4 py-6 pad-mobile"><div class="card p-6 text-center mb-4"><div class="flex justify-center mb-2">${userAvatar(m,72)}</div>
  <h1 class="font-poppins font-extrabold text-2xl" style="color:#123B65">${esc(m.name)}</h1><p class="text-sm text-slate-500">${esc(m.email)} • ${m.role==="admin"?t("adminRole"):t("userRole")}</p>
  ${m.badge?`<span class="badge mt-2" style="background:#FEF3C7;color:#92400E">🏅 ${esc(m.badge)}</span>`:""}
  <div class="grid grid-cols-3 gap-2 mt-4">${[[mine.length,t("nReports")],[supN,t("nSupports")],[comN,"komentar/comments"]].map(([v,l])=>`<div class="bg-slate-50 rounded-xl p-3"><div class="font-extrabold text-xl font-poppins" style="color:#123B65">${v}</div><div class="text-xs text-slate-500">${l}</div></div>`).join("")}</div>
  <div class="flex gap-2 justify-center mt-4"><input id="pfN" class="input max-w-xs" value="${esc(m.name)}"><button class="btn btn-primary btn-sm" onclick="Store.updateProfile(document.querySelector('#pfN').value);renderAll();toast('OK','ok')">${t("save")}</button></div></div>
  <h3 class="font-bold mb-2">📜 ${t("profileAct")}</h3><div class="grid sm:grid-cols-2 gap-3">${mine.slice(0,4).map(reportCard).join("")||emptyBox()}</div></div>`;
}
function vSettings(){
  return `<div class="max-w-xl mx-auto px-4 py-6 pad-mobile"><h1 class="font-poppins font-extrabold text-2xl mb-4">⚙️ ${t("settings")}</h1>
  <div class="card p-5 flex flex-col gap-3"><div class="flex items-center justify-between"><span class="font-bold">🌐 ${t("setLang")} (ID/EN)</span><button class="btn btn-outline btn-sm" onclick="toggleLang()">${Store.lang()==="id"?"Switch to English":"Ganti ke Indonesia"}</button></div>
  <div class="flex items-center justify-between"><span class="font-bold">📦 Demo data</span><div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick="seedDemo()">Reload</button><button class="btn btn-danger btn-sm" onclick="confirmBox('${t("confirmDel")}',()=>{localStorage.removeItem('${DB_KEY}');location.reload();})">${t("delete")}</button></div></div>
  <p class="text-xs text-slate-500">${t("supabase")}</p>
  <a href="#/about" class="btn btn-outline btn-sm">📄 ${t("privacy")} / ${t("terms")}</a></div></div>`;
}
function vAbout(){
  const s=Store.stats();
  return `<div class="max-w-4xl mx-auto px-4 py-8 pad-mobile"><h1 class="font-poppins font-extrabold text-3xl mb-2" style="color:#123B65">Tentang / About CityReport</h1>
  <p class="text-slate-600 mb-4">${t("aboutText")}</p>
  <div class="grid sm:grid-cols-3 gap-3 mb-6">${[[s.total,t("totalReports")],[s.pct+"%",t("completion")],[s.avg?Math.round(s.avg/86400000)+" hari/days":"—",t("avgTime")]].map(([v,l])=>`<div class="card p-4 text-center"><div class="font-extrabold text-2xl font-poppins" style="color:#123B65">${v}</div><div class="text-xs text-slate-500">${l}</div></div>`).join("")}</div>
  <div class="card p-6 mb-4"><h3 class="font-bold font-poppins mb-2">📖 ${t("guide")}</h3><ol class="list-decimal ml-5 text-sm text-slate-600 flex flex-col gap-1"><li>Daftar / masuk akun (demo: warga@example.com / warga123).</li><li>Klik Buat Laporan → isi foto, klik lokasi di peta → kirim, dapat nomor tiket 🎫.</li><li>Pantau timeline Menunggu → Terverifikasi → Dikerjakan → Selesai.</li><li>Dukung laporan tetangga ❤️ dan diskusi 💬. Admin: login admin@cityreport.id / admin123.</li></ol></div>
  <div class="grid sm:grid-cols-2 gap-3"><div class="card p-5"><h3 class="font-bold mb-1">🔒 ${t("privacy")}</h3><p class="text-sm text-slate-500">Nama pelapor disamarkan, password tidak ditampilkan, foto privat terkontrol, RLS+RBAC di Supabase saat online.</p></div>
  <div class="card p-5"><h3 class="font-bold mb-1">📜 ${t("terms")}</h3><p class="text-sm text-slate-500">Dilarang spam/laporan palsu. Admin dapat menghapus spam & menolak laporan tak valid. ${t("contact")}: halo@cityreport.id</p></div></div></div>`;
}
/* ---------- admin ---------- */
function needAdmin(){if(!Store.isAdmin()){go("#/dashboard");toast("Admin only","err");return false;}return true;}
function vAdmin(page,param){
  if(!needAdmin())return "";
  const s=Store.stats(),m=Store.me();
  const tabs=[["#/admin","📊 Stat"],["#/admin/reports","📋 Laporan"],["#/admin/map","🗺️ Peta"],["#/admin/users","👥 "+t("users")],["#/admin/audit-logs","📜 Audit"]];
  let body="";
  if(page==="reports"){
    const p=new URLSearchParams((location.hash.split("?")[1]||""));let list=Store.list();
    const fs=p.get("status")||"",fc=p.get("cat")||"",fq=(p.get("q")||"").toLowerCase();
    if(fs)list=list.filter(r=>r.status===fs);if(fc)list=list.filter(r=>r.category===fc);if(fq)list=list.filter(r=>(r.title+r.ticket+r.address).toLowerCase().includes(fq));
    body=`<div class="card p-3 mb-3 flex flex-col md:flex-row gap-2"><input id="aq" class="input" placeholder="${t("searchPh")}" value="${esc(p.get("q")||"")}"><select id="ac" class="input md:w-48"><option value="">${t("allCat")}</option>${CATS.map(c=>`<option value="${c.id}" ${fc===c.id?"selected":""}>${c.icon} ${catLabel(c.id)}</option>`).join("")}</select><select id="as" class="input md:w-48"><option value="">${t("allStatus")}</option>${["Menunggu","Terverifikasi","Dikerjakan","Selesai","Ditolak"].map(x=>`<option ${fs===x?"selected":""}>${x}</option>`).join("")}</select><button class="btn btn-primary btn-sm" onclick="go('#/admin/reports?cat='+document.querySelector('#ac').value+'&status='+document.querySelector('#as').value+'&q='+encodeURIComponent(document.querySelector('#aq').value))">🔍</button><button class="btn btn-outline btn-sm" onclick="dlCSV()">⬇️ ${t("export")}</button></div>
    <div class="card overflow-auto"><table class="tbl"><tr><th>Tiket</th><th>Judul</th><th>Kat</th><th>Status</th><th>❤️</th><th>Aksi</th></tr>${list.map(r=>`<tr><td class="font-mono text-xs">${r.ticket}</td><td><b>${esc(r.title)}</b><br><span class="text-xs text-slate-400">${fmtDate(r.created_at)}</span></td><td>${catIcon(r.category)}</td><td>${statusBadge(r.status)}</td><td>${supportCount(r)}</td><td class="whitespace-nowrap"><button class="btn btn-primary btn-sm" onclick="go('#/admin/reports/${r.ticket}')">Kelola</button> <button class="btn btn-outline btn-sm" onclick="go('#/report/${r.ticket}')">👁</button></td></tr>`).join("")}</table></div>`;
  } else if(page==="detail"){
    const r=Store.get(param);if(!r)return emptyBox();
    body=`<button class="btn btn-outline btn-sm mb-3" onclick="go('#/admin/reports')">← Kembali</button><div class="grid lg:grid-cols-2 gap-4">
    <div class="card overflow-hidden"><img src="${esc(r.photo)}" class="w-full h-64 object-cover"><div class="p-4"><h2 class="font-poppins font-extrabold text-xl" style="color:#123B65">${esc(r.title)}</h2><p class="text-xs text-slate-500">${r.ticket} • ${esc(r.address)} • ${r.lat.toFixed(4)},${r.lng.toFixed(4)}</p><p class="text-sm mt-2">${esc(r.description)}</p><div class="mt-2">${statusBadge(r.status)} ❤️ ${supportCount(r)}</div></div></div>
    <div class="card p-5"><h3 class="font-bold mb-2">🛠️ ${t("updateStatus")} — ${r.ticket}</h3>
    <label class="lbl">Status</label><select id="ns" class="input mb-2">${["Menunggu","Terverifikasi","Dikerjakan","Selesai","Ditolak"].map(x=>`<option ${r.status===x?"selected":""}>${x}</option>`).join("")}</select>
    <label class="lbl">${t("note")} / ${t("reason")}</label><textarea id="nn" class="input mb-2" rows="2"></textarea>
    <label class="lbl">${t("officialReply")}</label><textarea id="nr" class="input mb-2" rows="2">${esc(r.official_reply||"")}</textarea>
    <label class="lbl">${t("afterPhoto")} (URL / upload)</label><input id="na" type="file" accept="image/*" class="input mb-1"><input id="naU" class="input mb-2" placeholder="https://…" value="${esc(r.after_photo||"")}">
    <button class="btn btn-emerald w-full" onclick="adminSave('${r.id}')">${t("save")} ✅</button>
    <div class="flex gap-2 mt-2"><button class="btn btn-outline btn-sm" onclick="adminQuick('${r.id}','Terverifikasi')">✔️ ${t("verify")}</button><button class="btn btn-outline btn-sm" onclick="adminQuick('${r.id}','Dikerjakan')">🔧</button><button class="btn btn-outline btn-sm" onclick="adminQuick('${r.id}','Selesai')">✅</button><button class="btn btn-danger btn-sm" onclick="delReport('${r.id}')">🗑️</button></div>
    <h4 class="font-bold mt-4 mb-1 text-sm">🕓 History</h4>${Store.history(r.id).map(hx=>`<div class="text-xs border-l-2 pl-2 mb-1" style="border-color:#10B981">${hx.from_status} → <b>${hx.to_status}</b> • ${fmtDT(hx.created_at)}<br><span class="text-slate-500">${esc(hx.note||"")}</span></div>`).join("")}
    </div></div>`;
  } else if(page==="map"){
    body=`<div class="card p-2"><div id="admMap" style="height:520px"></div></div><div class="card p-3 mt-3 flex flex-col md:flex-row gap-2"><input id="mq" class="input" placeholder="${t("searchPh")}"><select id="mc" class="input md:w-48"><option value="">${t("allCat")}</option>${CATS.map(c=>`<option value="${c.id}">${c.icon}</option>`).join("")}</select><select id="ms" class="input md:w-48"><option value="">${t("allStatus")}</option>${["Menunggu","Terverifikasi","Dikerjakan","Selesai","Ditolak"].map(x=>`<option value="${x}">${x}</option>`).join("")}</select><button class="btn btn-primary btn-sm" onclick="drawMapMarkers()">🔍</button></div><div class="card p-3 mt-3"><div id="mapList" class="flex flex-col gap-2"></div></div><span id="mapCount" class="hidden"></span>`;
  } else if(page==="users"){
    body=`<div class="card overflow-auto"><table class="tbl"><tr><th>Nama</th><th>Email</th><th>Role</th><th>Laporan</th><th>Aksi</th></tr>${Store.db().users.map(u=>{const n=Store.db().reports.filter(r=>r.user_id===u.id).length;return `<tr><td class="flex items-center gap-2">${userAvatar(u,30)}<b>${esc(u.name)}</b></td><td>${esc(u.email)}</td><td>${u.role==="admin"?'<span class="badge st-Terverifikasi">admin</span>':'<span class="badge st-Menunggu">user</span>'}</td><td>${n}</td><td class="whitespace-nowrap">${u.id!==m.id?`${u.role==="admin"?`<button class="btn btn-outline btn-sm" onclick="setRole('${u.id}','user')">Cabut admin</button>`:`<button class="btn btn-primary btn-sm" onclick="setRole('${u.id}','admin')">Jadikan admin</button>`}`:"(kamu)"}</td></tr>`;}).join("")}</table></div><p class="text-xs text-slate-500 mt-2">🔒 Role hanya bisa diubah admin; diri sendiri tidak bisa dicabut.</p>`;
  } else if(page==="audit"){
    body=`<div class="card overflow-auto"><table class="tbl"><tr><th>Waktu</th><th>Admin</th><th>Aksi</th><th>Target</th><th>Detail</th></tr>${Store.db().audit_logs.map(a=>`<tr><td class="text-xs">${fmtDT(a.created_at)}</td><td>${esc(a.actor_name)}</td><td><span class="badge st-Terverifikasi">${esc(a.action)}</span></td><td class="font-mono text-xs">${esc(a.target)}</td><td class="text-xs">${esc(a.detail)}</td></tr>`).join("")||"<tr><td>Belum ada aktivitas.</td></tr>"}</table></div>`;
  } else {
    body=`<div class="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-4">${[["Total",s.total,"📊"],["Menunggu",s.Menunggu,"⏳"],["Terverifikasi",s.Terverifikasi,"🔵"],["Dikerjakan",s.Dikerjakan,"🔧"],["Selesai",s.Selesai,"✅"],["Ditolak",s.Ditolak,"❌"]].map(([l,v,ic])=>`<div class="card p-4 text-center"><div class="text-xl">${ic}</div><div class="font-extrabold text-2xl font-poppins" style="color:#123B65">${v}</div><div class="text-xs text-slate-500 font-bold">${l} • ${s.total?Math.round(v/s.total*100):0}%</div></div>`).join("")}</div>
    <div class="grid lg:grid-cols-3 gap-4"><div class="card p-4"><h4 class="font-bold text-sm mb-2">Kategori</h4><canvas id="chCat" height="200"></canvas></div><div class="card p-4"><h4 class="font-bold text-sm mb-2">${t("trend")}</h4><canvas id="chTrend" height="200"></canvas></div><div class="card p-4"><h4 class="font-bold text-sm mb-2">Status</h4><canvas id="chDon" height="200"></canvas><div class="text-xs text-slate-500 mt-2">Completion: <b>${s.pct}%</b> • Avg ❤️/lap: <b>${s.avgSup}</b> • Avg waktu: <b>${s.avg?Math.round(s.avg/86400000)+" hari":"—"}</b></div><button class="btn btn-outline btn-sm mt-2" onclick="dlCSV()">⬇️ ${t("export")} CSV</button></div></div>`;
  }
  return `<div class="max-w-6xl mx-auto px-4 py-6 pad-mobile"><h1 class="font-poppins font-extrabold text-2xl mb-3" style="color:#123B65">🛠️ Admin — ${esc(m.name)}</h1>
  <div class="flex gap-2 flex-wrap mb-4">${tabs.map(([h,lb])=>`<a href="${h}" class="btn ${(location.hash||"#/admin")===h?"btn-primary":"btn-outline"} btn-sm">${lb}</a>`).join("")}<button class="btn btn-outline btn-sm ml-auto" onclick="dlCSV()">⬇️ CSV</button></div>${body}</div>`;
}
window.setRole=(id,role)=>{const u=Store.db().users.find(x=>x.id===id);if(!u)return;const me=Store.me();if(u.id===me.id){toast("Tidak bisa ubah role sendiri","err");return;}Store.audit("role_change",u.email,me.name+": "+u.role+" → "+role);u.role=role;Store.save();renderAll();toast("Role → "+role,"ok");};
window.adminQuick=(id,to)=>{try{Store.setStatus(id,to,"Quick update dari admin.");renderAll();toast("Status → "+to,"ok");}catch(e){toast(e.message,"err");}};
window.adminSave=id=>{const after=($("#naU")||{}).value||Store.get(id).after_photo||"";try{Store.setStatus(id,$("#ns").value,$("#nn").value,{official_reply:$("#nr").value,after_photo:after});renderAll();toast("Tersimpan/saved","ok");}catch(e){toast(e.message,"err");}};
window.dlCSV=()=>{if(!Store.isAdmin()){toast("Admin only","err");return;}const csv=Store.exportCSV(Store.list());const b=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="cityreport.csv";a.click();toast("CSV diunduh/downloaded","ok");};
/* ---------- router ---------- */
function renderAll(){renderChrome();const app=$("#app");const raw=(location.hash||"#/").slice(1);const [pathQ]=[raw];const [path,q]=pathQ.split("?");const seg=path.split("/").filter(Boolean);
  let html="";
  if(seg.length===0)html=vHome();
  else if(seg[0]==="reports")html=vReports(q);
  else if(seg[0]==="map")html=vMap();
  else if(seg[0]==="report")html=vDetail(decodeURIComponent(seg[1]||""));
  else if(seg[0]==="about")html=vAbout();
  else if(seg[0]==="login")html=vAuth("login");
  else if(seg[0]==="register")html=vAuth("register");
  else if(seg[0]==="forgot-password")html=vAuth("forgot");
  else if(seg[0]==="dashboard")html=vDash();
  else if(seg[0]==="create-report")html=vCreate();
  else if(seg[0]==="edit")html=vCreate(decodeURIComponent(seg[1]||""));
  else if(seg[0]==="my-reports")html=vMy();
  else if(seg[0]==="notifications")html=vNotif();
  else if(seg[0]==="profile")html=vProfile();
  else if(seg[0]==="settings")html=vSettings();
  else if(seg[0]==="admin"){if(seg[1]==="reports"&&seg[2])html=vAdmin("detail",decodeURIComponent(seg[2]));else html=vAdmin(seg[1]||"dash");}
  else html=emptyBox(t("notFound"));
  app.innerHTML=html;renderChrome();afterRender(path,seg,q);
}
function afterRender(path,seg,q){
  window.scrollTo(0,0);
  if(seg.length===0){initMap("heroMap",Store.list().slice(0,20));drawCharts();}
  if(seg[0]==="map"){initMap("mainMap",[]);MAPS.markers=MAPS.markers;drawMapMarkers();}
  if(seg[0]==="report"&&seg[1]){const r=Store.get(decodeURIComponent(seg[1]));if(r&&window.L){const m=initMap("detMap",[r]);if(m)m.setView([r.lat,r.lng],15);}}
  if(seg[0]==="create-report"||seg[0]==="edit"){
    const r=seg[0]==="edit"?Store.get(decodeURIComponent(seg[1]||"")):null;
    PICK={lat:r?r.lat:null,lng:r?r.lng:null,photo:r?r.photo:""};
    const map=initMap("pickMap",r?[r]:Store.list().slice(0,10),(ll,mk)=>{PICK.lat=ll.lat;PICK.lng=ll.lng;$("#nLL").textContent=ll.lat.toFixed(5)+", "+ll.lng.toFixed(5);checkDup();});
    if(r&&window.L){L.marker([r.lat,r.lng]).addTo(map);map.setView([r.lat,r.lng],14);}
    const fp=$("#nP");if(fp)fp.onchange=e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith("image/")){toast("Hanya gambar/only images","err");return;}if(f.size>2*1024*1024){toast("Maks 2MB","err");return;}const rd=new FileReader();rd.onload=()=>{PICK.photo=rd.result;$("#nPv").src=rd.result;$("#nPv").classList.remove("hidden");};rd.readAsDataURL(f);};
    const na=$("#na");if(na)na.onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{$("#naU").value=rd.result;toast("Foto sesudah siap","ok");};rd.readAsDataURL(f);};
  }
  if(seg[0]==="admin"){const p=(location.hash.split("/")[2]||"").split("?")[0];
    if(!p||p==="dash")drawCharts();
    if(p==="map"){initMap("admMap",[]);drawMapMarkers();}
    if(p==="reports"&&seg[2]){}}
}
window.checkDup=()=>{const box=$("#dupBox");if(!box||PICK.lat==null)return;const dups=Store.findDuplicates($("#nC").value,PICK.lat,PICK.lng,$("#nT").value);box.innerHTML=dups.length?`<div class="bg-amber-50 border border-amber-300 rounded-xl p-3 text-sm"><b>⚠️ ${t("dupTitle")}</b><p class="text-xs mb-1">${t("dupWarn")}</p>${dups.map(r=>`<a href="#/report/${r.ticket}" class="block underline" style="color:#123B65">🎫 ${r.ticket} — ${esc(r.title)}</a>`).join("")}<p class="text-xs mt-1">${t("continueAnyway")}</p></div>`:"";};
function drawCharts(){
  if(!window.Chart)return;const s=Store.stats();
  const tc=$("#chTrend");if(tc)new Chart(tc,{type:"line",data:{labels:s.months.map(x=>x.m),datasets:[{label:"Laporan",data:s.months.map(x=>x.c),borderColor:"#123B65",backgroundColor:"#123B6533",fill:true,tension:.4}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  const cc=$("#chCat");if(cc)new Chart(cc,{type:"bar",data:{labels:Object.keys(s.byCat).map(catLabel),datasets:[{data:Object.values(s.byCat),backgroundColor:"#10B981"}]},options:{plugins:{legend:{display:false}}}});
  const dn=$("#chDon");if(dn)new Chart(dn,{type:"doughnut",data:{labels:["Menunggu","Terverifikasi","Dikerjakan","Selesai","Ditolak"],datasets:[{data:[s.Menunggu,s.Terverifikasi,s.Dikerjakan,s.Selesai,s.Ditolak],backgroundColor:["#94A3B8","#3B82F6","#F97316","#10B981","#EF4444"]}]}});
}
window.addEventListener("hashchange",renderAll);
document.addEventListener("input",e=>{if(e.target&&e.target.id==="nT"&&PICK.lat!=null)checkDup();if(e.target&&e.target.id==="nC"&&PICK.lat!=null)checkDup();});
renderAll();
