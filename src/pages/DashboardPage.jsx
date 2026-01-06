import React, { useMemo } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import { Card, Badge } from '../components/common/UI';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#000000', '#FBBF24', '#9CA3AF', '#EF4444', '#10B981'];

const DashboardPage = () => {
  
  // 1. DASHBOARD STATS QUERY
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // A. Stats Hoy
      const { data: ventasHoy } = await supabase.from('ventas').select('total').gte('created_at', `${today}T00:00:00`);
      const totalDinero = ventasHoy?.reduce((sum, v) => sum + v.total, 0) || 0;
      const cantidadVentas = ventasHoy?.length || 0;

      // B. Bajo Stock
      const { count: bajoStockCount } = await supabase.from('productos').select('*', { count: 'exact', head: true }).lt('stock_actual', 5);

      // C. Ventas Recientes
      const { data: ultimasVentas } = await supabase.from('ventas').select('id, created_at, total, metodo_pago').order('created_at', { ascending: false }).limit(5);

      // D. Ventas ultimos 7 dias (Para Grafico Barras)
      const { data: ventasSemana } = await supabase.from('ventas').select('created_at, total').gte('created_at', sevenDaysAgo);

      // E. Top Productos (Para Grafico Torta) - Calculamos en cliente por ahora para no complicar con RPC
      const { data: detalleVentas } = await supabase.from('detalle_ventas').select('cantidad, producto:productos(nombre)').limit(200);

      return {
        ventasHoy: cantidadVentas,
        dineroHoy: totalDinero,
        itemsBajoStock: bajoStockCount || 0,
        ultimasVentas: ultimasVentas || [],
        ventasSemana: ventasSemana || [],
        detalleVentas: detalleVentas || []
      };
    }
  });

  // PROCESAMIENTO DE DATOS PARA GRAFICOS
  const chartData = useMemo(() => {
    if (!stats) return { barData: [], pieData: [] };

    // 1. Bar Chart: Ventas por Dia
    const salesByDay = {};
    // Inicializar ultimos 7 dias en 0
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        salesByDay[d.toLocaleDateString('es-AR', { weekday: 'short' })] = 0;
    }
    
    stats.ventasSemana.forEach(v => {
        const day = new Date(v.created_at).toLocaleDateString('es-AR', { weekday: 'short' });
        if (salesByDay[day] !== undefined) {
            salesByDay[day] += v.total;
        }
    });

    const barData = Object.entries(salesByDay).map(([name, total]) => ({ name, total }));

    // 2. Pie Chart: Top Productos
    const productSales = {};
    stats.detalleVentas.forEach(d => {
        const name = d.producto?.nombre || 'Desconocido';
        productSales[name] = (productSales[name] || 0) + d.cantidad;
    });

    const pieData = Object.entries(productSales)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

    return { barData, pieData };

  }, [stats]);
  
  if (loading) {
     return <div className="p-10 font-bold text-xl">Cargando tablero...</div>;
  }


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

      {/* GRAFICOS ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO DE BARRAS */}
        <Card className="h-80 flex flex-col">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5"/> VENTAS ÚLTIMA SEMANA
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(value) => `$${value}`} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: '#f3f4f6'}}
                            contentStyle={{borderRadius: '8px', border: '2px solid black', boxShadow: '4px 4px 0px 0px black'}}
                        />
                        <Bar dataKey="total" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

        {/* GRÁFICO DE TORTA */}
        <Card className="h-80 flex flex-col">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5"/> TOP PRODUCTOS
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={chartData.pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="black" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip 
                             contentStyle={{borderRadius: '8px', border: '2px solid black', boxShadow: '4px 4px 0px 0px black'}}
                        />
                    </RePieChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Ventas Real */}
        <Card className="lg:col-span-3">
          <h3 className="font-black text-xl mb-4">ÚLTIMAS VENTAS</h3>
          <div className="space-y-3">
            {stats.ultimasVentas.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay ventas registradas hoy.</p>
            ) : (
              stats.ultimasVentas.map((venta) => (
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
