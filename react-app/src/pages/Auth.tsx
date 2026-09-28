import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const go = async () => {
    try { setErr(''); mode === 'login' ? await signIn(email, pass) : await signUp(name, email, pass); nav('/dashboard'); }
    catch (e: any) { setErr(e.message); }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="card p-6">
        <h1 className="font-poppins font-extrabold text-2xl text-navy mb-4">{mode === 'login' ? 'Selamat datang kembali' : 'Buat akun CityReport'}</h1>
        {err && <div className="bg-red-50 text-red-700 text-sm rounded-xl p-2 mb-3">{err}</div>}
        {mode === 'register' && <><label className="text-xs font-bold">Nama lengkap</label><input className="input mb-3" value={name} onChange={e => setName(e.target.value)} /></>}
        <label className="text-xs font-bold">Email</label><input className="input mb-3" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="text-xs font-bold">Password</label><input className="input mb-4" type="password" value={pass} onChange={e => setPass(e.target.value)} />
        <button className="btn btn-primary w-full" onClick={go}>{mode === 'login' ? 'Masuk' : 'Daftar'}</button>
        <p className="text-sm text-center mt-3">{mode === 'login' ? <>Belum punya akun? <Link to="/register" className="font-bold text-navy">Daftar</Link></> : <>Sudah punya akun? <Link to="/login" className="font-bold text-navy">Masuk</Link></>}</p>
      </div>
    </div>
  );
}
