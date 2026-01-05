// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, Badge } from '../components/common/UI';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ventasHoy: 0,
    dineroHoy: 0,
    itemsBajoStock: 0,
    ultimaVenta: null
  });
  const [ventasRecientes, setVentasRecientes] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      const today = new Date().toISOString().split('T')[0]; // Fecha YYYY-MM-DD

      // 1. Obtener Ventas de HOY
      const { data: ventasHoy } = await supabase
        .from('ventas')
        .select('total')
        .gte('created_at', `${today}T00:00:00`);

      const totalDinero = ventasHoy?.reduce((sum, v) => sum + v.total, 0) || 0;
      const cantidadVentas = ventasHoy?.length || 0;

      // 2. Obtener Productos con BAJO STOCK (< 5)
      const { count: bajoStockCount } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .lt('stock_actual', 5);

      // 3. Obtener Últimas 5 Ventas (Con detalle de items si quisieras)
      const { data: ultimasVentas } = await supabase
        .from('ventas')
        .select(`
          id, 
          created_at, 
          total, 
          metodo_pago
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        ventasHoy: cantidadVentas,
        dineroHoy: totalDinero,
        itemsBajoStock: bajoStockCount || 0,
      });

      setVentasRecientes(ultimasVentas || []);
      setLoading(false);
    }

    loadDashboardData();
  }, []);

  // Formatear hora
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card color="bg-blue-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white border-2 border-black rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <Badge type="success">Hoy</Badge>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600">Caja Diaria</p>
            <h3 className="text-3xl font-black text-black">
              {loading ? "..." : `$${stats.dineroHoy.toLocaleString()}`}
            </h3>
          </div>
        </Card>

        <Card color="bg-pink-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white border-2 border-black rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600">Ventas Hoy</p>
            <h3 className="text-3xl font-black text-black">
              {loading ? "..." : stats.ventasHoy}
            </h3>
          </div>
        </Card>

        <Card color="bg-yellow-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white border-2 border-black rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            {stats.itemsBajoStock > 0 && <Badge type="danger">Atención</Badge>}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600">Bajo Stock</p>
            <h3 className="text-3xl font-black text-black">
              {loading ? "..." : stats.itemsBajoStock} Items
            </h3>
          </div>
        </Card>

        <Card color="bg-green-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white border-2 border-black rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600">Ticket Promedio</p>
            <h3 className="text-3xl font-black text-black">
              {loading || stats.ventasHoy === 0 ? "$0" : `$${Math.round(stats.dineroHoy / stats.ventasHoy).toLocaleString()}`}
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Ventas Real */}
        <Card className="lg:col-span-3">
          <h3 className="font-black text-xl mb-4">ÚLTIMAS VENTAS</h3>
          <div className="space-y-3">
            {ventasRecientes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay ventas registradas hoy.</p>
            ) : (
              ventasRecientes.map((venta) => (
                <div key={venta.id} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="bg-black text-white w-10 h-10 flex items-center justify-center rounded font-bold text-xs">
                       {formatTime(venta.created_at)}
                    </div>
                    <div>
                      <p className="font-bold text-black text-lg">${venta.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">ID Venta: #{venta.id}</p>
                    </div>
                  </div>
                  <Badge>{venta.metodo_pago}</Badge>
                </div>
              ))
            )}
          </div>
          
          {/* Botón hacia el historial */}
          <Link to="/historial" className="w-full mt-4 text-center text-sm font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
            Ver Historial Completo <ChevronRight className="w-4 h-4"/>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
