import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import POSPage from './pages/POSPage';
import LoginPage from './pages/LoginPage';
import SalesHistoryPage from './pages/SalesHistoryPage';
import WebOrdersPage from './pages/WebOrdersPage';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificamos sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchamos cambios (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Cargando sistema...</div>;

  return (
    <Router>
      <Toaster richColors position="bottom-right" />
      <Routes>
        {/* Ruta Login Pública */}
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" />} />

        {/* Rutas Privadas (Protegidas) */}
        <Route element={session ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/historial" element={<SalesHistoryPage />} />
          <Route path="/pedidos-web" element={<WebOrdersPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
