// src/pages/SalesHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Card, Badge } from '../components/common/UI';
import { Calendar } from 'lucide-react';

const SalesHistoryPage = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVentas();
  }, []);

  async function fetchVentas() {
    // Traemos ventas y sus items (detalle_ventas)
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        detalle_ventas (
          cantidad,
          precio_unitario,
          producto:productos(nombre)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50); // Traemos las últimas 50

    if (data) setVentas(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      <h2 className="text-3xl font-black flex items-center gap-2">
        <Calendar className="w-8 h-8"/> HISTORIAL DE VENTAS
      </h2>

      <div className="grid gap-4">
        {loading ? <p>Cargando...</p> : ventas.map((venta) => (
          <Card key={venta.id} className="p-4">
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-2 mb-2">
              <div>
                <p className="font-bold text-lg text-green-600">${venta.total.toLocaleString()}</p>
                <p className="text-xs text-gray-400">
                  {new Date(venta.created_at).toLocaleString('es-AR')}
                </p>
              </div>
              <Badge>{venta.metodo_pago}</Badge>
            </div>
            
            {/* Detalles de productos vendidos en esa venta */}
            <div className="text-sm space-y-1">
              {venta.detalle_ventas.map((det, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-600">
                    {det.cantidad}x {det.producto?.nombre || 'Producto eliminado'}
                  </span>
                  <span className="font-bold">
                    ${(det.cantidad * det.precio_unitario).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SalesHistoryPage;
