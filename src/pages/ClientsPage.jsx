import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, DollarSign, Wallet, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../supabase';
import { AdminButton, Card, Badge } from '../components/common/UI';

const ClientsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  const queryClient = useQueryClient();

  // OBTENER CLIENTES
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('saldo', { ascending: false }); // Primero los que más deben
      if (error) throw error;
      return data;
    }
  });

  // GESTIONAR NUEVO/EDITAR
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nombre: formData.get('nombre'),
      telefono: formData.get('telefono'),
      notas: formData.get('notas')
    };

    if (editingClient) {
      // Update
      const { error } = await supabase.from('clientes').update(data).eq('id', editingClient.id);
      if (error) return toast.error(error.message);
      toast.success('Cliente actualizado');
    } else {
      // Insert
      const { error } = await supabase.from('clientes').insert([data]);
      if (error) return toast.error(error.message);
      toast.success('Cliente creado');
    }
    
    setIsModalOpen(false);
    setEditingClient(null);
    queryClient.invalidateQueries(['clientes']);
  };

  // GESTIONAR SALDO (PAGOS O FIADOS)
  const handleSaldo = async (cliente, tipo) => {
    // tipo: 'pago' (Resta deuda) o 'fiado' (Suma deuda)
    let monto = prompt(tipo === 'pago' ? `¿Cuánto pagó ${cliente.nombre}?` : `¿Cuánto debe ${cliente.nombre}?`);
    if (!monto) return;
    
    monto = parseFloat(monto);
    if (isNaN(monto) || monto <= 0) return toast.error('Monto inválido');

    const nuevoSaldo = tipo === 'pago' ? cliente.saldo - monto : cliente.saldo + monto;

    const { error } = await supabase
      .from('clientes')
      .update({ saldo: nuevoSaldo })
      .eq('id', cliente.id);

    if (error) {
      toast.error('Error actualizando saldo');
    } else {
      toast.success(tipo === 'pago' ? `Pago registrado. Nuevo saldo: $${nuevoSaldo}` : `Deuda anotada. Nuevo saldo: $${nuevoSaldo}`);
      queryClient.invalidateQueries(['clientes']);
    }
  };

  const filteredClients = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black flex items-center gap-2 dark:text-white">
            <Users className="w-8 h-8"/> CLIENTES & CUENTAS
        </h2>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative grow md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar cliente..." 
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-lg outline-none focus:ring-4 focus:ring-yellow-200 dark:text-white"
                />
            </div>
            <AdminButton variant="success" icon={Plus} onClick={() => { setEditingClient(null); setIsModalOpen(true); }}>
                Nuevo Cliente
            </AdminButton>
        </div>
      </div>

      {/* LISTA TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? <p>Cargando...</p> : filteredClients.map(client => (
            <Card key={client.id} className={`flex flex-col justify-between ${client.saldo > 0 ? 'border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' : 'border-black'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-black text-black dark:text-white">{client.nombre}</h3>
                        {client.telefono && (
                            <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                <Phone className="w-3 h-3"/> {client.telefono}
                            </p>
                        )}
                    </div>
                    <div className={`px-3 py-1 rounded-full font-black text-sm ${client.saldo > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        ${client.saldo.toLocaleString()}
                    </div>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-dashed border-gray-200">
                    <button 
                        onClick={() => handleSaldo(client, 'fiado')}
                        className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                        <Wallet className="w-4 h-4"/> Anotar Deuda
                    </button>
                    <button 
                        onClick={() => handleSaldo(client, 'pago')}
                        className="flex-1 py-2 px-3 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded text-sm flex items-center justify-center gap-1 transition-colors"
                    >
                        <DollarSign className="w-4 h-4"/> Reg. Pago
                    </button>
                </div>
                <button 
                    onClick={() => { setEditingClient(client); setIsModalOpen(true); }}
                    className="text-xs text-gray-400 font-bold text-center mt-2 hover:underline"
                >
                    Editar Datos
                </button>
            </Card>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-xl w-full max-w-md shadow-2xl p-6">
                <h3 className="text-xl font-black mb-4 dark:text-white">{editingClient ? 'EDITAR CLIENTE' : 'NUEVO CLIENTE'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-white">Nombre Completo</label>
                        <input name="nombre" defaultValue={editingClient?.nombre} required className="w-full border-2 border-black dark:border-white rounded p-2 outline-none focus:bg-yellow-50 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 dark:text-white">Teléfono (Opcional)</label>
                        <input name="telefono" defaultValue={editingClient?.telefono} className="w-full border-2 border-black dark:border-white rounded p-2 outline-none focus:bg-yellow-50 dark:bg-zinc-800 dark:text-white" />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <AdminButton type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</AdminButton>
                        <AdminButton variant="success">{editingClient ? 'Guardar' : 'Crear'}</AdminButton>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default ClientsPage;
