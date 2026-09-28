/* CityReport Store — persistent localStorage backend, Supabase-ready.
   To go online: set SUPABASE_URL + SUPABASE_KEY below and call Store.useSupabase().
   Tables mirror spec: profiles, reports, report_categories, report_supports, comments,
   report_status_history, notifications, report_images, admin_audit_logs */
const SUPABASE_URL = ""; const SUPABASE_KEY = "";
const DB_KEY = "cityreport_db_v1";
const CATS = [
  {id:"jalan", id_label:"Jalan Rusak", en_label:"Road Damage", icon:"🛣️"},
  {id:"lampu", id_label:"Lampu Jalan", en_label:"Street Lights", icon:"💡"},
  {id:"drainase", id_label:"Drainase", en_label:"Drainage", icon:"🌊"},
  {id:"sampah", id_label:"Sampah", en_label:"Waste", icon:"🗑️"},
  {id:"taman", id_label:"Fasilitas Taman", en_label:"Park Facilities", icon:"🌳"},
  {id:"trotoar", id_label:"Trotoar", en_label:"Sidewalk", icon:"🚶"},
  {id:"lainnya", id_label:"Lainnya", en_label:"Others", icon:"📦"},
];
function catLabel(id){const c=CATS.find(x=>x.id===id);if(!c)return id;return Store.lang()==="en"?c.en_label:c.id_label;}
function catIcon(id){const c=CATS.find(x=>x.id===id);return c?c.icon:"📦";}
function uid(p){return (p||"id")+"_"+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fmtDate(ts){try{return new Date(ts).toLocaleDateString(Store.lang()==="en"?"en-US":"id-ID",{day:"numeric",month:"short",year:"numeric"})}catch(e){return ""}}
function fmtDT(ts){try{return new Date(ts).toLocaleString(Store.lang()==="en"?"en-US":"id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch(e){return ""}}
function maskName(n){if(!n)return "Warga";const p=n.trim().split(" ");if(p.length===1)return p[0][0]+"***";return p[0]+" "+p.slice(1).map(x=>x[0]+".").join(" ");}
function timeAgo(ts){const s=(Date.now()-ts)/1000;if(s<60)return"baru saja/just now";if(s<3600)return Math.floor(s/60)+" mnt/min";if(s<86400)return Math.floor(s/3600)+" jam/h";return Math.floor(s/86400)+" hari/d";}
const SEED_PHOTOS={
 jalan:"https://images.unsplash.com/photo-1515162816999-a463645f498a?w=800&q=60",
 lampu:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=60",
 drainase:"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=60",
 sampah:"https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=60",
 taman:"https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=60",
 trotoar:"https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=60",
 lainnya:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=60"};
function seed(){
  const now=Date.now(),D=86400000;
  const users=[
    {id:"u_admin",name:"Admin Kota",email:"admin@cityreport.id",pass:"admin123",role:"admin",avatar:"",created_at:now-300*D,badge:""},
    {id:"u_warga",name:"Warga Demo",email:"warga@example.com",pass:"warga123",role:"user",avatar:"",created_at:now-120*D,badge:""},
    {id:"u_siti",name:"Siti Rahma",email:"siti@example.com",pass:"warga123",role:"user",avatar:"",created_at:now-90*D,badge:""}];
  const R=(o)=>Object.assign({id:uid("r"),ticket:"",user_id:"u_warga",official_reply:"",after_photo:"",demo:true,created_at:now-5*D,updated_at:now-5*D},o);
  const reports=[
    R({ticket:"CR-2026-0001",title:"Jalan berlubang di Jl. Merdeka Raya",category:"jalan",description:"Lubang cukup besar sedalam ±15cm membahayakan pengendara motor, terutama saat hujan.",photo:SEED_PHOTOS.jalan,lat:-6.2005,lng:106.8165,address:"Jl. Merdeka Raya No. 12, Jakarta Pusat",status:"Dikerjakan",user_id:"u_warga",created_at:now-12*D,updated_at:now-1*D,official_reply:"Tim Bina Marga sudah di lokasi, pengerasan sementara selesai, pengaspalan dijadwalkan minggu ini."}),
    R({ticket:"CR-2026-0002",title:"Lampu jalan mati total Gang Melati",category:"lampu",description:"3 titik lampu mati sejak seminggu, area gelap dan rawan.",photo:SEED_PHOTOS.lampu,lat:-6.2145,lng:106.8265,address:"Gang Melati RT 04, Jakarta Selatan",status:"Terverifikasi",user_id:"u_siti",created_at:now-6*D,updated_at:now-4*D,official_reply:"Sudah dicek Dinas Pertamanan, penggantian ballast dijadwalkan."}),
    R({ticket:"CR-2026-0003",title:"Tumpukan sampah di TPS liar",category:"sampah",description:"Sampah menumpuk 3 hari, bau menyengat, lalat banyak.",photo:SEED_PHOTOS.sampah,lat:-6.1955,lng:106.8065,address:"Jl. Kebun Jeruk II, Jakarta Barat",status:"Selesai",user_id:"u_warga",created_at:now-30*D,updated_at:now-2*D,after_photo:"https://images.unsplash.com/photo-1558640476-437a2b9438a2?w=800&q=60",official_reply:"Sudah diangkut 2 armada + area disemprot disinfektan. Terima kasih laporannya!"}),
    R({ticket:"CR-2026-0004",title:"Drainase tersumbat banjir saat hujan",category:"drainase",description:"Saluran penuh lumpur dan plastik, air meluap ke jalan.",photo:SEED_PHOTOS.drainase,lat:-6.2255,lng:106.8365,address:"Jl. Pahlawan No. 8",status:"Menunggu",user_id:"u_siti",created_at:now-2*D,updated_at:now-2*D}),
    R({ticket:"CR-2026-0005",title:"Ayunan taman patah",category:"taman",description:"Rantai ayunan putus, berbahaya untuk anak-anak.",photo:SEED_PHOTOS.taman,lat:-6.2055,lng:106.8465,address:"Taman Kota Ceria Blok B",status:"Terverifikasi",user_id:"u_warga",created_at:now-4*D,updated_at:now-3*D}),
    R({ticket:"CR-2026-0006",title:"Trotoar retak dan bergelombang",category:"trotoar",description:"Paving terangkat akar pohon, sulit untuk kursi roda.",photo:SEED_PHOTOS.trotoar,lat:-6.1905,lng:106.8265,address:"Jl. Sudirman Kav. 5",status:"Menunggu",user_id:"u_siti",created_at:now-1*D,updated_at:now-1*D})];
  const supports=[{id:uid("s"),report_id:reports[0].id,user_id:"u_siti",created_at:now-3*D},{id:uid("s"),report_id:reports[0].id,user_id:"u_admin",created_at:now-2*D},{id:uid("s"),report_id:reports[2].id,user_id:"u_siti",created_at:now-9*D}];
  const comments=[{id:uid("c"),report_id:reports[0].id,user_id:"u_siti",text:"Saya juga hampir jatuh di sini kemarin malam, semoga cepat diperbaiki.",created_at:now-2*D,flagged:false},{id:uid("c"),report_id:reports[2].id,user_id:"u_admin",text:"Sudah ditindaklanjuti, terima kasih atas partisipasi warga.",created_at:now-2*D,flagged:false}];
  let hist=[];reports.forEach(r=>{hist.push({id:uid("h"),report_id:r.id,from_status:"-",to_status:"Menunggu",note:"Laporan dibuat warga.",actor_id:r.user_id,created_at:r.created_at});if(r.status!=="Menunggu")hist.push({id:uid("h"),report_id:r.id,from_status:"Menunggu",to_status:"Terverifikasi",note:"Laporan valid, diteruskan ke dinas terkait.",actor_id:"u_admin",created_at:r.created_at+D});if(["Dikerjakan","Selesai"].includes(r.status))hist.push({id:uid("h"),report_id:r.id,from_status:"Terverifikasi",to_status:"Dikerjakan",note:"Tim lapangan mulai bekerja.",actor_id:"u_admin",created_at:r.created_at+2*D});if(r.status==="Selesai")hist.push({id:uid("h"),report_id:r.id,from_status:"Dikerjakan",to_status:"Selesai",note:"Perbaikan selesai + dokumentasi.",actor_id:"u_admin",created_at:r.updated_at});});
  return {users,reports,supports,comments,status_history:hist,notifications:[{id:uid("n"),user_id:"u_warga",title:"Selamat datang di CityReport",body:"Laporkan kerusakan kota dan pantau progresnya di sini.",read:false,created_at:now-2*D,report_id:null}],audit_logs:[],ticketSeq:7,session:null,lang:"id",seeded:true};
}
const Store={
  _db:null,
  load(){try{const raw=localStorage.getItem(DB_KEY);if(raw){this._db=JSON.parse(raw);return this._db;}}catch(e){}this._db=seed();this.save();return this._db;},
  save(){localStorage.setItem(DB_KEY,JSON.stringify(this._db));},
  db(){if(!this._db)this.load();return this._db;},
  reset(){this._db=seed();this.save();},
  lang(){return this.db().lang||"id";},setLang(l){this.db().lang=l;this.save();},
  // auth
  me(){const s=this.db().session;if(!s)return null;return this.db().users.find(u=>u.id===s)||null;},
  isAdmin(){const m=this.me();return m&&m.role==="admin";},
  register(name,email,pass){email=email.trim().toLowerCase();if(!name||!email||!pass)throw new Error("Lengkapi semua kolom.");if(this.db().users.some(u=>u.email===email))throw new Error("Email sudah terdaftar.");const u={id:uid("u"),name,email,pass,role:"user",avatar:"",created_at:Date.now(),badge:"Kontributor Baru"};this.db().users.push(u);this.db().session=u.id;this.notify(u.id,"Akun dibuat","Selamat datang di CityReport, "+name+"!",null);this.save();return u;},
  login(email,pass){email=email.trim().toLowerCase();const u=this.db().users.find(x=>x.email===email&&x.pass===pass);if(!u)throw new Error("Email atau password salah.");this.db().session=u.id;this.save();return u;},
  google(){let u=this.db().users.find(x=>x.email==="google.user@gmail.com");if(!u){u={id:uid("u"),name:"Google User",email:"google.user@gmail.com",pass:"-",role:"user",avatar:"",created_at:Date.now(),badge:"Kontributor Baru"};this.db().users.push(u);}this.db().session=u.id;this.save();return u;},
  logout(){this.db().session=null;this.save();},
  forgot(email){email=email.trim().toLowerCase();const u=this.db().users.find(x=>x.email===email);if(!u)throw new Error("Email tidak ditemukan.");u.pass="baru123";this.save();return u;},
  updateProfile(name,avatar){const m=this.me();if(!m)return;m.name=name||m.name;if(avatar!==undefined)m.avatar=avatar;this.badge(m);this.save();},
  badge(u){const n=this.db().reports.filter(r=>r.user_id===u.id).length;u.badge=n>=10?"Pelapor Peduli Kota":n>=4?"Kontributor Aktif":n>=1?"Kontributor Baru":"";},
  // reports
  nextTicket(){const d=this.db();const y=new Date().getFullYear();const n=String(d.ticketSeq++).padStart(4,"0");this.save();return `CR-${y}-${n}`;},
  createReport(d){const m=this.me();if(!m)throw new Error(t("needLogin"));if(!d.title||!d.category||!d.description||!d.address)throw new Error("Lengkapi semua kolom wajib.");if(d.lat==null||d.lng==null)throw new Error("Lokasi wajib dipilih di peta.");const r={id:uid("r"),ticket:this.nextTicket(),user_id:m.id,title:d.title.trim(),category:d.category,description:d.description.trim(),photo:d.photo||SEED_PHOTOS[d.category]||SEED_PHOTOS.lainnya,lat:d.lat,lng:d.lng,address:d.address,status:"Menunggu",official_reply:"",after_photo:"",demo:false,created_at:Date.now(),updated_at:Date.now()};this.db().reports.unshift(r);this.hist(r.id,"-","Menunggu","Laporan dibuat warga.",m.id);this.notify(m.id,"Laporan terkirim ("+r.ticket+")","Laporan '"+r.title+"' berstatus Menunggu.",r.id);this.badge(m);this.save();return r;},
  updateReport(id,patch){const r=this.get(id);if(!r)return;const m=this.me();if(!m||(r.user_id!==m.id&&m.role!=="admin"))throw new Error("Akses ditolak.");if(r.status!=="Menunggu"&&m.role!=="admin")throw new Error("Hanya bisa diubah sebelum diverifikasi.");Object.assign(r,patch,{updated_at:Date.now()});this.save();},
  deleteReport(id){const d=this.db();const r=this.get(id);const m=this.me();if(!m)throw new Error("Login dulu.");if(r.user_id!==m.id&&m.role!=="admin")throw new Error("Akses ditolak.");if(m.role!=="admin"&&r.status!=="Menunggu")throw new Error("Hanya laporan Menunggu yang bisa dihapus.");d.reports=d.reports.filter(x=>x.id!==id);d.supports=d.supports.filter(x=>x.report_id!==id);d.comments=d.comments.filter(x=>x.report_id!==id);d.status_history=d.status_history.filter(x=>x.report_id!==id);this.audit("delete_report",id,"status:"+r.status+" → deleted");this.save();},
  get(id){return this.db().reports.find(r=>r.id===id||r.ticket===id);},
  list(){return [...this.db().reports].sort((a,b)=>b.created_at-a.created_at);},
  setStatus(id,to,note,extra){const r=this.get(id);if(!r)throw new Error("Laporan tidak ditemukan.");if(!this.isAdmin())throw new Error("Hanya admin.");const from=r.status;r.status=to;r.updated_at=Date.now();if(extra&&extra.official_reply!==undefined)r.official_reply=extra.official_reply;if(extra&&extra.after_photo!==undefined)r.after_photo=extra.after_photo;this.hist(id,from,to,note||"",this.me().id);this.audit("status_change",id,from+" → "+to+" | "+(note||""));const owner=this.db().users.find(u=>u.id===r.user_id);const msg={Terverifikasi:"Laporan diverifikasi.",Dikerjakan:"Laporan mulai dikerjakan.",Selesai:"Laporan selesai. Terima kasih!",Ditolak:"Laporan ditolak."}[to]||("Status: "+to);if(owner)this.notify(owner.id,r.ticket+" — "+msg,(note||r.official_reply||"")+ " ",id);this.save();return r;},
  hist(rid,from,to,note,actor){this.db().status_history.push({id:uid("h"),report_id:rid,from_status:from,to_status:to,note,actor_id:actor,created_at:Date.now()});},
  history(rid){return this.db().status_history.filter(h=>h.report_id===rid).sort((a,b)=>a.created_at-b.created_at);},
  // supports
  supports(rid){return this.db().supports.filter(s=>s.report_id===rid);},
  supported(rid,uidv){return this.db().supports.some(s=>s.report_id===rid&&s.user_id===uidv);},
  toggleSupport(rid){const m=this.me();if(!m)throw new Error(t("needLogin"));const d=this.db();const i=d.supports.findIndex(s=>s.report_id===rid&&s.user_id===m.id);if(i>=0){d.supports.splice(i,1);}else{d.supports.push({id:uid("s"),report_id:rid,user_id:m.id,created_at:Date.now()});}this.save();return this.supports(rid).length;},
  // comments
  commentsOf(rid){return this.db().comments.filter(c=>c.report_id===rid).sort((a,b)=>a.created_at-b.created_at);},
  addComment(rid,text){const m=this.me();if(!m)throw new Error(t("needLogin"));if(!text.trim())throw new Error("Komentar kosong.");if(text.length>500)throw new Error("Maks 500 karakter.");const c={id:uid("c"),report_id:rid,user_id:m.id,text:text.trim(),created_at:Date.now(),flagged:false};this.db().comments.push(c);this.save();return c;},
  delComment(cid){const d=this.db();const c=d.comments.find(x=>x.id===cid);const m=this.me();if(!c||!m)return;if(c.user_id!==m.id&&m.role!=="admin")throw new Error("Akses ditolak.");d.comments=d.comments.filter(x=>x.id!==cid);this.save();},
  flagComment(cid){const c=this.db().comments.find(x=>x.id===cid);if(c){c.flagged=true;this.save();}},
  // notifications
  notify(uidv,title,body,rid){this.db().notifications.unshift({id:uid("n"),user_id:uidv,title,body,read:false,created_at:Date.now(),report_id:rid});},
  myNotif(){const m=this.me();if(!m)return[];return this.db().notifications.filter(n=>n.user_id===m.id).sort((a,b)=>b.created_at-a.created_at);},
  unread(){return this.myNotif().filter(n=>!n.read).length;},
  readNotif(id){const n=this.db().notifications.find(x=>x.id===id);if(n)n.read=true;this.save();},
  readAll(){this.myNotif().forEach(n=>n.read=true);this.save();},
  // admin
  audit(action,target,detail){const m=this.me();this.db().audit_logs.unshift({id:uid("a"),actor_id:m?m.id:"-",actor_name:m?m.name:"system",action,target,detail,created_at:Date.now()});},
  stats(){const R=this.db().reports;const c=s=>R.filter(r=>r.status===s).length;const totalSup=this.db().supports.length;const done=c("Selesai");const res=[];R.forEach(r=>{if(r.status==="Selesai"){const h=this.history(r.id);if(h.length>=2)res.push(r.updated_at-r.created_at);}});const avg=res.length?res.reduce((a,b)=>a+b,0)/res.length:0;const byCat={};CATS.forEach(k=>byCat[k.id]=R.filter(r=>r.category===k.id).length);const months=[];for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);const key=d.toLocaleDateString("id-ID",{month:"short"});const cnt=R.filter(r=>{const x=new Date(r.created_at);return x.getMonth()===d.getMonth()&&x.getFullYear()===d.getFullYear();}).length;months.push({m:key,c:cnt});}return{total:R.length,Menunggu:c("Menunggu"),Terverifikasi:c("Terverifikasi"),Dikerjakan:c("Dikerjakan"),Selesai:done,Ditolak:c("Ditolak"),supports:totalSup,avg,byCat,months,pct:R.length?Math.round(done/R.length*100):0,avgSup:R.length?(totalSup/R.length).toFixed(1):0};},
  findDuplicates(cat,lat,lng,title){return this.db().reports.filter(r=>{if(r.category!==cat)return false;const d=Math.hypot(r.lat-lat,r.lng-lng);const sameTitle=title&&r.title.toLowerCase().split(" ").some(w=>w.length>4&&title.toLowerCase().includes(w));return (d<0.02||sameTitle)&&r.status!=="Ditolak";}).slice(0,3);},
  exportCSV(rows){const h=["ticket","title","category","address","status","supports","created","resolved"];const L=[h.join(",")];rows.forEach(r=>{L.push([r.ticket,'"'+r.title.replace(/"/g,'""')+'"',r.category,'"'+(r.address||"").replace(/"/g,'""')+'"',r.status,this.supports(r.id).length,new Date(r.created_at).toISOString(),r.status==="Selesai"?new Date(r.updated_at).toISOString():""].join(","));});return L.join("\n");},
};
Store.load();
