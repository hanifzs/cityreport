import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Reports from './pages/Reports';
import MapView from './pages/MapView';
import Detail from './pages/Detail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Create from './pages/Create';
import Admin from './pages/Admin';
import About from './pages/About';

function Guard({ children, admin }: { children: JSX.Element; admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Memuat…</div>;
  if (!user) return <Navigate to="/login" />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/report/:ticket" element={<Detail />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
            <Route path="/create" element={<Guard><Create /></Guard>} />
            <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
