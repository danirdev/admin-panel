import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import POSPage from './pages/POSPage';
import { ShoppingBag, Users } from 'lucide-react';

// Placeholder Pages
const OrdersPage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
    <ShoppingBag className="w-16 h-16" />
    <h2 className="text-2xl font-bold">Módulo de Pedidos</h2>
    <p>Próximamente verás aquí los pedidos de la web.</p>
  </div>
);

const ClientsPage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
    <Users className="w-16 h-16" />
    <h2 className="text-2xl font-bold">Módulo de Clientes</h2>
    <p>Gestión de cuentas corrientes y fiados.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="clients" element={<ClientsPage />} />
          
          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
