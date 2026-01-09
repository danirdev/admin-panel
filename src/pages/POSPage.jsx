import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; 
import { supabase } from '../supabase';
import ProductGrid from '../components/pos/ProductGrid';
import TicketSummary from '../components/pos/TicketSummary';
import PrintTicket from '../components/pos/PrintTicket';
import PrintCalculator from '../components/pos/PrintCalculator';

const POSPage = () => {
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [ticket, setTicket] = useState([]);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [lastSale, setLastSale] = useState(null); // Estado para la última venta (impresión)
  const [selectedClient, setSelectedClient] = useState(null); // Nuevo estado para cliente
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false); // Estado para modal calculadora
  const queryClient = useQueryClient();

  // 1. CARGAR INVENTARIO (React Query)
  const { data: productos = [] } = useQuery({
    queryKey: ['productos', ''], 
    queryFn: async () => {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) throw error;
      return data;
    }
  });

  // 1b. CARGAR CLIENTES (Para el selector)
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clientes').select('id, nombre, saldo').order('nombre');
      if (error) throw error;
      return data;
    }
  });

  // 2. CALCULAR TOTAL AUTOMÁTICAMENTE
  useEffect(() => {
    const nuevoTotal = ticket.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0);
    setTotal(nuevoTotal);
  }, [ticket]);

  // 3. AGREGAR AL TICKET
  const addToTicket = (prod, cantidad = 1) => {
    const existe = ticket.find(i => i.id === prod.id);
    
    if(existe) {
      if(existe.cantidad + cantidad > prod.stock_actual) return toast.warning("Stock insuficiente para agregar " + cantidad + " unidades");
      setTicket(ticket.map(i => i.id === prod.id ? {...i, cantidad: i.cantidad + cantidad} : i));
    } else {
      if(cantidad > prod.stock_actual) return toast.warning("Stock insuficiente para agregar " + cantidad + " unidades");
      setTicket([...ticket, {...prod, cantidad: cantidad}]);
    }
    toast.success(`Agregado: ${cantidad} x ${prod.nombre}`, { duration: 1000, position: 'bottom-center' });
  };

  const removeFromTicket = (id) => {
    setTicket(ticket.filter(item => item.id !== id));
  };

  // 4. PROCESAR VENTA (EL CEREBRO DE LA CAJA)
  const handleCobrar = async () => {
    if (ticket.length === 0) return;

    // Validación de Cliente para Fiado
    if (metodoPago === 'Cuenta Corriente' && !selectedClient) {
      return toast.error("Debes seleccionar un cliente para cobrar con Cuenta Corriente");
    }

    // OPTIMISTIC UI: Backup and Clear Immediately
    const backupTicket = [...ticket];
    setTicket([]);
    
    // Guardar referencia de lo que se iba a cobrar para impresión (optimista)
    setLastSale({
       id: 'pending', // ID temporal
       items: [...backupTicket],
       total: total,
       created_at: new Date().toISOString(),
       cliente: selectedClient ? selectedClient.nombre : 'Consumidor Final'
    });

    try {
      // A. Obtener usuario actual (necesario para el campo usuario_id de la tabla ventas)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para cobrar");

      // B. Si es Cuenta Corriente, actualizar saldo del cliente
      if (metodoPago === 'Cuenta Corriente' && selectedClient) {
        const nuevoSaldo = (Number(selectedClient.saldo) || 0) + total;
        
        const { error: clienteError } = await supabase
          .from('clientes')
          .update({ saldo: nuevoSaldo })
          .eq('id', selectedClient.id);
          
        if (clienteError) throw clienteError;
      }

      // C. Crear cabecera de Venta
      const { data: venta, error: errorVenta } = await supabase
        .from('ventas')
        .insert([{ 
          total: total, 
          metodo_pago: metodoPago,
          usuario_id: user.id,
          cliente_id: selectedClient?.id || null 
        }])
        .select()
        .single();

      if (errorVenta) throw errorVenta;

      // D. Preparar detalles
      const detalles = backupTicket.map(item => ({
        venta_id: venta.id,
        producto_id: item.isManual ? null : item.id, // Null para manuales
        descripcion: item.isManual ? item.nombre : null, // Guardar nombre como descripción
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta,
        subtotal: item.cantidad * item.precio_venta
      }));

      // E. Insertar detalles
      const { error: errorDetalle } = await supabase.from('detalle_ventas').insert(detalles);
      if (errorDetalle) throw errorDetalle;

      // F. Descontar Stock (SOLO SI NO ES MANUAL)
      for (const item of backupTicket) {
        if (!item.isManual) {
           await supabase.rpc('descontar_stock', { p_id: item.id, p_cantidad: item.cantidad });
        }
      }

      // G. Éxito Real
      toast.success("¡Venta registrada!");
      
      // Actualizar ID real para impresión
      setLastSale(prev => ({ ...prev, id: venta.id }));
      
      // Resetear estado
      setSelectedClient(null);
      setMetodoPago('Efectivo');
      
      // Recargar productos (Invalidar cache)
      queryClient.invalidateQueries(['productos']); // Actualiza inventario
      queryClient.invalidateQueries(['clientes']); // Actualiza saldos

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
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />

        {/* Panel Derecho: Ticket */}
        <TicketSummary 
          ticket={ticket} 
          total={total} 
          handleCobrar={handleCobrar} 
          lastSale={lastSale}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          removeFromTicket={removeFromTicket}
          // Props para clientes
          clientes={clientes}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
        />
      </div>

      {/* Ticket Invisible (Solo visible al imprimir) */}
      <PrintTicket venta={lastSale} />

      {/* MODAL CALCULADORA */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[90vh] rounded-2xl border-4 border-black dark:border-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-yellow-400 p-4 border-b-2 border-black flex justify-between items-center">
                    <h3 className="font-black text-xl text-black flex items-center gap-2">
                        CALCULADORA DE IMPRESIONES
                    </h3>
                    <button 
                        onClick={() => setIsCalculatorOpen(false)}
                        className="bg-black text-white w-8 h-8 rounded-full font-bold hover:bg-gray-800 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 p-6 overflow-hidden">
                    <PrintCalculator 
                        onCancel={() => setIsCalculatorOpen(false)}
                        onAddToTicket={(item) => {
                            // Crear ID unico temp
                            const calcItem = {
                                ...item,
                                id: `calc-${Date.now()}`,
                                categoria: 'Servicios',
                                stock_actual: 9999
                            };
                            addToTicket(calcItem, item.cantidad);
                            setIsCalculatorOpen(false);
                            // Toast ya manejado en addToTicket
                        }}
                    />
                </div>
             </div>
        </div>
      )}
    </>
  );
};

export default POSPage;
