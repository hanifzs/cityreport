import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLang, setLang, t } from '../lib/i18n';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [, force] = useState(0);
  const link = 'px-3 py-2 rounded-lg font-medium text-slate-600 text-sm hover:bg-slate-100';
  return (
    <div className="min-h-screen bg-mist text-slate-900 font-sans">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-poppins font-extrabold text-lg text-navy">
            <span className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-extrabold" style={{ background: 'linear-gradient(135deg,#123B65,#10B981)' }}>C</span>
            CityReport
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <NavLink to="/" className={link}>{t('home')}</NavLink>
            <NavLink to="/map" className={link}>{t('map')}</NavLink>
            <NavLink to="/reports" className={link}>{t('reports')}</NavLink>
            <NavLink to="/about" className={link}>{t('about')}</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin" className={link}>{t('admin')}</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="text-sm border rounded-lg px-2 py-1" onClick={() => { setLang(getLang() === 'id' ? 'en' : 'id'); force(x => x + 1); }}>
              🌐 {getLang() === 'id' ? 'ID' : 'EN'}
            </button>
            {user ? (<>
              <Link to="/dashboard" className="text-sm border rounded-lg px-2 py-1 hidden sm:block">{user.name.split(' ')[0]}</Link>
              <button className="text-sm bg-navy text-white rounded-lg px-3 py-1.5" onClick={async () => { await signOut(); nav('/'); }}>{t('logout')}</button>
            </>) : (<>
              <Link to="/login" className="text-sm border rounded-lg px-3 py-1.5">{t('login')}</Link>
              <Link to="/register" className="text-sm bg-navy text-white rounded-lg px-3 py-1.5">{t('register')}</Link>
            </>)}
          </div>
        </div>
      </header>
      <main className="pb-20 lg:pb-0">{children}</main>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 text-[11px] font-semibold text-slate-500 z-50">
        <Link to="/" className="flex flex-col items-center">🏠{t('home')}</Link>
        <Link to="/map" className="flex flex-col items-center">🗺️{t('map')}</Link>
        <Link to="/create" className="flex flex-col items-center">➕{t('createReport')}</Link>
        <Link to="/reports" className="flex flex-col items-center">📋{t('reports')}</Link>
        <Link to="/dashboard" className="flex flex-col items-center">👤{user ? t('dashboard') : t('login')}</Link>
      </nav>
      <footer className="mt-12 text-slate-300 hidden lg:block" style={{ background: '#0d2c4d' }}>
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm flex justify-between">
          <span className="font-poppins font-bold text-white">CityReport © 2026</span>
          <span>halo@cityreport.id • GovTech transparan</span>
        </div>
      </footer>
    </div>
  );
}
