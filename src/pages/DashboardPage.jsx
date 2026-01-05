import React, { useState } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, Badge } from '../components/common/UI';

const MOCK_VENTAS_RECIENTES = [
  { id: 101, hora: "10:30", total: 5700, items: 3, metodo: "Efectivo" },
  { id: 102, hora: "11:15", total: 1200, items: 1, metodo: "QR" },
  { id: 103, hora: "11:45", total: 25000, items: 1, metodo: "Tarjeta" },
  { id: 104, hora: "12:20", total: 450, items: 2, metodo: "Efectivo" },
];

const DashboardPage = () => (
  <div className="space-y-6 animate-in fade-in duration-300 pb-20">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card color="bg-blue-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-white border-2 border-black rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <Badge type="success">+12%</Badge>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-600">Ventas Hoy</p>
          <h3 className="text-3xl font-black text-black">$125,400</h3>
        </div>
      </Card>

      <Card color="bg-pink-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-white border-2 border-black rounded-lg">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-600">Pedidos Web</p>
          <h3 className="text-3xl font-black text-black">8 Pendientes</h3>
        </div>
      </Card>

      <Card color="bg-yellow-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-white border-2 border-black rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <Badge type="danger">2 Alertas</Badge>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-600">Bajo Stock</p>
          <h3 className="text-3xl font-black text-black">5 Items</h3>
        </div>
      </Card>

      <Card color="bg-green-200" className="flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-white border-2 border-black rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-600">Ganancia Neta</p>
          <h3 className="text-3xl font-black text-black">$42,300</h3>
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico Simulado */}
      <Card className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl">RENDIMIENTO SEMANAL</h3>
          <select className="border-2 border-black rounded-lg px-2 py-1 font-bold bg-gray-50 cursor-pointer">
            <option>Esta semana</option>
            <option>Mes pasado</option>
          </select>
        </div>
        <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b-2 border-black border-dashed">
          {[40, 65, 35, 85, 55, 70, 90].map((h, i) => (
            <div key={i} className="w-full bg-black hover:bg-blue-500 transition-colors rounded-t-lg relative group cursor-pointer border-2 border-black" style={{ height: `${h}%` }}>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white z-10 font-bold">
                ${h * 1000}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 font-bold text-gray-500 text-sm">
          <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
        </div>
      </Card>

      {/* Últimas Ventas */}
      <Card>
        <h3 className="font-black text-xl mb-4">ÚLTIMAS VENTAS</h3>
        <div className="space-y-3">
          {MOCK_VENTAS_RECIENTES.map((venta) => (
            <div key={venta.id} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-bold text-black">${venta.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{venta.hora} • {venta.items} items</p>
              </div>
              <Badge>{venta.metodo}</Badge>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-center text-sm font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
          Ver Historial <ChevronRight className="w-4 h-4"/>
        </button>
      </Card>
    </div>
  </div>
);

export default DashboardPage;
