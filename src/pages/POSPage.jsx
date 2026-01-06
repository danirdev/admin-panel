import React, { useState, useEffect } from 'react';
import { toast } from 'sonner'; 
import { supabase } from '../supabase';
import ProductGrid from '../components/pos/ProductGrid';
import TicketSummary from '../components/pos/TicketSummary';

import PrintTicket from '../components/pos/PrintTicket';

const POSPage = () => {
  const [ticket, setTicket] = useState([]);
  const [total, setTotal] = useState(0);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [lastSale, setLastSale] = useState(null); // Estado para la última venta (impresión)

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
      if(existe.cantidad >= prod.stock_actual) return toast.warning("No hay más stock");
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
      if (!user) return toast.error("Debes iniciar sesión para cobrar");

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

      // E. (Opcional) Descontar Stock
      for (const item of ticket) {
        await supabase.rpc('descontar_stock', { p_id: item.id, p_cantidad: item.cantidad });
      }

      // F. Éxito
      toast.success("¡Venta registrada!");
      
      // Guardar datos para impresión y limpiar
      const saleData = {
        id: venta.id,
        items: [...ticket],
        total: total,
        created_at: new Date().toISOString()
      };
      setLastSale(saleData);
      setTicket([]);
      
      // Recargar productos
      const { data: nuevosProds } = await supabase.from('productos').select('*');
      if (nuevosProds) setProductos(nuevosProds);
      
      // Opcional: Imprimir automáticamente
      // setTimeout(() => window.print(), 500);

    } catch (error) {
      console.error(error);
      toast.error("Error al cobrar: " + error.message);
    }
  };

  // Filtro de búsqueda
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (p.sku && p.sku.includes(busqueda))
  );

  return (
    <>
      <div className="no-print flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-300">
        {/* Panel Izquierdo */}
        <ProductGrid 
          productos={productosFiltrados} 
          addToTicket={addToTicket} 
          busqueda={busqueda} 
          setBusqueda={setBusqueda} 
        />

        {/* Panel Derecho: Ticket */}
        <TicketSummary 
          ticket={ticket} 
          total={total} 
          handleCobrar={handleCobrar} 
          lastSale={lastSale}
        />
      </div>

      {/* Ticket Invisible (Solo visible al imprimir) */}
      <PrintTicket venta={lastSale} />
    </>
  );
};

export default POSPage;
