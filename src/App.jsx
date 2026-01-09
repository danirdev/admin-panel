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
import CalculatorPage from './pages/CalculatorPage';
import ClientsPage from './pages/ClientsPage';

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
      <Toaster 
        position="top-center" 
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'bg-[#FFFDF5] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 p-4 rounded-lg w-full font-sans',
            title: 'text-black font-black text-sm uppercase tracking-wide',
            description: 'text-gray-600 text-sm font-medium',
            actionButton: 'bg-black text-white hover:bg-gray-800',
            cancelButton: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            icon: 'text-black w-5 h-5',
            error: 'border-red-500 bg-red-50',
            success: 'border-green-500 bg-green-50',
            warning: 'border-yellow-500 bg-yellow-50',
            info: 'border-blue-500 bg-blue-50',
          }
        }}
      />
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
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/clients" element={<ClientsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
