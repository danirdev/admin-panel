import React, { useState, useEffect } from 'react'; // Keep useEffect for other things if needed, or remove if unused. It is used for total calculation.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; 
import { supabase } from '../supabase';
import ProductGrid from '../components/pos/ProductGrid';
import TicketSummary from '../components/pos/TicketSummary';

import PrintTicket from '../components/pos/PrintTicket';

const POSPage = () => {
  const [ticket, setTicket] = useState([]);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [lastSale, setLastSale] = useState(null); // Estado para la última venta (impresión)
  const queryClient = useQueryClient();

  // 1. CARGAR INVENTARIO (React Query)
  const { data: productos = [] } = useQuery({
    queryKey: ['productos', ''], // Match InventoryPage empty search cache
    queryFn: async () => {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) throw error;
      return data;
    }
  });

  // REMOVED MANUAL EFFECT
  // useEffect(() => { ... }, []);

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

    // OPTIMISTIC UI: Backup and Clear Immediately
    const backupTicket = [...ticket];
    setTicket([]);
    
    // Guardar referencia de lo que se iba a cobrar para impresión (optimista)
    setLastSale({
       id: 'pending', // ID temporal
       items: [...backupTicket],
       total: total,
       created_at: new Date().toISOString()
    });

    try {
      // A. Obtener usuario actual (necesario para el campo usuario_id de la tabla ventas)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para cobrar");

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
      const detalles = backupTicket.map(item => ({
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
      for (const item of backupTicket) {
        await supabase.rpc('descontar_stock', { p_id: item.id, p_cantidad: item.cantidad });
      }

      // F. Éxito Real
      toast.success("¡Venta registrada!");
      
      // Actualizar ID real para impresión
      setLastSale(prev => ({ ...prev, id: venta.id }));
      
      // Recargar productos (Invalidar cache)
      queryClient.invalidateQueries(['productos']); // Actualiza inventario en todos lados

    } catch (error) {
      console.error(error);
      toast.error("Error al cobrar: " + error.message);
      
      // ROLLBACK: Restaurar carrito
      setTicket(backupTicket);
      setLastSale(null); // Eliminar venta pendiente
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
