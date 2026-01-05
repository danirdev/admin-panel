import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Check, Trash2 } from 'lucide-react'; // Agregué Trash2 para borrar items del ticket
import { Card } from '../components/common/UI';
import { supabase } from '../supabase';

const POSPage = () => {
  const [ticket, setTicket] = useState([]);
  const [total, setTotal] = useState(0);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // 1. CARGAR INVENTARIO AL INICIAR
  useEffect(() => {
    async function loadProd() {
      const { data } = await supabase.from('productos').select('*');
      if (data) setProductos(data);
    }
    loadProd();
  }, []);

  // 2. CALCULAR TOTAL AUTOMÁTICAMENTE
  useEffect(() => {
    const nuevoTotal = ticket.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0);
    setTotal(nuevoTotal);
  }, [ticket]);

  // 3. AGREGAR AL TICKET
  const addToTicket = (prod) => {
    const existe = ticket.find(i => i.id === prod.id);
    
    if(existe) {
      if(existe.cantidad >= prod.stock_actual) return alert("No hay más stock");
      setTicket(ticket.map(i => i.id === prod.id ? {...i, cantidad: i.cantidad + 1} : i));
    } else {
      setTicket([...ticket, {...prod, cantidad: 1}]);
    }
  };

  // 4. PROCESAR VENTA (EL CEREBRO DE LA CAJA)
  const handleCobrar = async () => {
    if (ticket.length === 0) return;

    try {
      // A. Obtener usuario actual (necesario para el campo usuario_id de la tabla ventas)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Debes iniciar sesión para cobrar");

      // B. Crear cabecera de Venta
      const { data: venta, error: errorVenta } = await supabase
        .from('ventas')
        .insert([{ 
          total: total, 
          metodo_pago: 'Efectivo',
          usuario_id: user.id 
        }])
        .select()
        .single();

      if (errorVenta) throw errorVenta;

      // C. Preparar detalles
      const detalles = ticket.map(item => ({
        venta_id: venta.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta,
        subtotal: item.cantidad * item.precio_venta
      }));

      // D. Insertar detalles
      const { error: errorDetalle } = await supabase.from('detalle_ventas').insert(detalles);
      if (errorDetalle) throw errorDetalle;

      // E. (Opcional) Descontar Stock - Idealmente se hace con un RPC (Función SQL)
      // Por simplicidad ahora lo hacemos en bucle (no recomendado para alta escala, pero funcional para empezar)
      for (const item of ticket) {
        await supabase.rpc('descontar_stock', { p_id: item.id, p_cantidad: item.cantidad });
        // NOTA: Necesitas crear esta funcion SQL o hacerlo update manual:
        // await supabase.from('productos').update({ stock_actual: item.stock_actual - item.cantidad }).eq('id', item.id);
      }

      // F. Éxito
      alert("¡Venta registrada!");
      setTicket([]);
      
      // Recargar productos para ver stock actualizado
      const { data: nuevosProds } = await supabase.from('productos').select('*');
      if (nuevosProds) setProductos(nuevosProds);

    } catch (error) {
      console.error(error);
      alert("Error al cobrar: " + error.message);
    }
  };

  // Filtro de búsqueda
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.sku && p.sku.includes(busqueda))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Panel Izquierdo */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                type="text" 
                placeholder="Buscar o escanear..." 
                className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-xl font-medium focus:ring-4 focus:ring-yellow-200 outline-none"
              />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20 lg:pb-2">
          {productosFiltrados.map(prod => (
             <button 
                key={prod.id} 
                onClick={() => addToTicket(prod)}
                disabled={prod.stock_actual === 0}
                className={`flex flex-col p-4 border-2 border-black rounded-xl text-left transition-all active:scale-95 ${
                  prod.stock_actual === 0 ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-blue-50'
                }`}
             >
               <div className="flex-1">
                 <span className="text-xs font-bold text-gray-400 uppercase">{prod.categoria}</span>
                 <h4 className="font-bold text-sm leading-tight mt-1 mb-2 line-clamp-2">{prod.nombre}</h4>
               </div>
               <div className="flex justify-between items-end mt-2">
                 <span className="font-black text-lg">${prod.precio_venta}</span>
                 <span className={`text-xs font-bold ${prod.stock_actual < 5 ? 'text-red-500' : 'text-gray-400'}`}>
                    Stock: {prod.stock_actual}
                 </span>
               </div>
             </button>
          ))}
        </div>
      </div>

      {/* Panel Derecho: Ticket */}
      <Card className="w-full lg:w-96 flex flex-col p-0! overflow-hidden h-full border-4 shadow-xl shrink-0">
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <h3 className="font-black text-xl">TICKET</h3>
          <span className="bg-white/20 px-2 py-1 rounded text-xs">{ticket.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white min-h-[200px]">
          {ticket.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p className="font-medium text-sm">Escanea un producto</p>
            </div>
          ) : (
            ticket.map((item) => (
              <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-bold text-sm">{item.nombre}</p>
                  <p className="text-xs text-gray-500">{item.cantidad} x ${item.precio_venta}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.cantidad * item.precio_venta}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t-2 border-black space-y-4">
          <div className="flex justify-between text-2xl font-black text-black">
            <span>TOTAL</span>
            <span>${total.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={handleCobrar}
            disabled={ticket.length === 0}
            className="w-full bg-green-500 text-black border-2 border-black py-4 rounded-xl font-black text-xl hover:translate-y-[2px] active:translate-y-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-6 h-6" /> COBRAR
          </button>
        </div>
      </Card>
    </div>
  );
};

export default POSPage;
