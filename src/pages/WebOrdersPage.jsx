// src/pages/WebOrdersPage.jsx
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Check, X, Clock, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../supabase';
import { Card, Badge } from '../components/common/UI';

const WebOrdersPage = () => {
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading: loading } = useQuery({
    queryKey: ['pedidos-web'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          detalle_ventas (
            cantidad,
            precio_unitario,
            producto:productos(nombre, sku)
          )
        `)
        .eq('metodo_pago', 'Web')
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Optional: auto-refresh every 30s
  });

  const finalizarPedido = async (id) => {
    toast("¿Pedido entregado y cobrado?", {
        action: {
            label: "Confirmar Entrega",
            onClick: async () => {
                 // 1. Marcar como completado
                const { error } = await supabase
                .from('ventas')
                .update({ estado: 'completado', metodo_pago: 'Efectivo (Web)' }) // Opcional: Cambiar método si pagan al retirar
                .eq('id', id);
        
                if (!error) {
                    // 2. (Opcional) Descontar stock aquí si no lo hiciste al crear el pedido
                    // Normalmente en web se descuenta al confirmar, pero si prefieres al entregar:
                    // ... lógica de descuento ...
                    
                    // ... lógica de descuento ...
                    
                    queryClient.invalidateQueries(['pedidos-web']);
                    toast.success("¡Pedido archivado en Historial!");
                }
            }
        },
        cancel: {
            label: "Cancelar"
        }
    });
  };

  const cancelarPedido = async (id) => {
      toast("¿Cancelar este pedido?", {
        description: "Esta acción no se puede deshacer",
        action: {
            label: "Sí, cancelar",
            onClick: async () => {
                await supabase.from('ventas').delete().eq('id', id);
                queryClient.invalidateQueries(['pedidos-web']);
                toast.success("Pedido cancelado");
            }
        },
        cancel: {
            label: "No"
        }
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <h2 className="text-3xl font-black flex items-center gap-3">
        <ShoppingBag className="w-8 h-8"/> PEDIDOS WEB PENDIENTES
      </h2>

      {loading ? <p>Cargando...</p> : pedidos.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border-4 border-dashed border-gray-300 rounded-xl">
            <p className="text-xl font-bold text-gray-400">No hay pedidos pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
               {/* Header del Ticket */}
               <div className="bg-yellow-300 -mx-6 -mt-6 p-4 border-b-2 border-black flex justify-between items-center mb-4">
                  <div className="flex gap-2 items-center">
                      <Clock className="w-5 h-5"/>
                      <span className="font-bold">{new Date(pedido.created_at).toLocaleDateString()} {new Date(pedido.created_at).toLocaleTimeString().slice(0,5)}</span>
                  </div>
                  <span className="bg-black text-white px-2 py-1 rounded font-bold text-xs">#{pedido.id}</span>
               </div>

               {/* Datos Cliente */}
               <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 font-bold text-lg">
                      <User className="w-5 h-5"/> {pedido.cliente_nombre || 'Cliente Anónimo'}
                  </div>
                  {pedido.cliente_telefono && (
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Phone className="w-4 h-4"/> {pedido.cliente_telefono}
                      </div>
                  )}
               </div>

               {/* Lista de Items */}
               <ul className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                   {pedido.detalle_ventas.map((item, i) => (
                       <li key={i} className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                           <span>
                               <span className="font-black mr-2">{item.cantidad}x</span> 
                               {item.producto?.nombre}
                           </span>
                           <span className="font-medium">${item.cantidad * item.precio_unitario}</span>
                       </li>
                   ))}
               </ul>

               {/* Footer Acciones */}
               <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                   <div className="text-2xl font-black">
                       ${pedido.total}
                   </div>
                   <div className="flex gap-2">
                       <button 
                         onClick={() => cancelarPedido(pedido.id)}
                         className="p-2 border-2 border-black rounded hover:bg-red-100 text-red-600 font-bold" title="Cancelar">
                           <X className="w-6 h-6"/>
                       </button>
                       <button 
                         onClick={() => finalizarPedido(pedido.id)}
                         className="flex items-center gap-2 px-4 py-2 bg-green-500 border-2 border-black rounded font-black hover:bg-green-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all">
                           <Check className="w-5 h-5"/> ENTREGAR
                       </button>
                   </div>
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebOrdersPage;
