import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, Loader, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AdminButton, Card, Badge } from '../components/common/UI';
import { supabase } from '../supabase';
import ProductModal from '../components/inventory/ProductModal';
import ImportModal from '../components/inventory/ImportModal';

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const [busqueda, setBusqueda] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
    }, 500);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const { data: productos = [], isLoading: loading } = useQuery({
    queryKey: ['productos', debouncedBusqueda],
    queryFn: async () => {
      let queryBuilder = supabase.from('productos').select('*').order('id', { ascending: false });
      if (debouncedBusqueda) queryBuilder = queryBuilder.ilike('nombre', `%${debouncedBusqueda}%`);
      
      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    }
  });

  // MANEJAR EDICIÓN
  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setIsModalOpen(true);
  };
  
  // ABRIR MODAL NUEVO
  const handleNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  async function handleEliminar(id) {
    toast("¿Eliminar producto?", {
      action: {
        label: "Eliminar",
        onClick: async () => {
          const { error } = await supabase.from('productos').delete().eq('id', id);
          if (!error) {
            toast.success("Producto eliminado");
            queryClient.invalidateQueries(['productos']);
          } else {
            toast.error("Error al eliminar");
          }
        }
      },
      cancel: { label: "Cancelar" }
    });
  }

  const handleExport = () => {
    if (!productos || productos.length === 0) {
      toast.error('No hay productos para exportar');
      return;
    }

    // Definir encabezados
    const headers = ['ID', 'Nombre', 'SKU', 'Categoría', 'Precio Venta', 'Costo', 'Stock Actual', 'Stock Mínimo', 'Creado'];
    
    // Mapear datos
    const cssString = [
      headers.join(','),
      ...productos.map(p => [
        p.id,
        `"${p.nombre.replace(/"/g, '""')}"`, // Escapar comillas
        p.sku || '',
        p.categoria,
        p.precio_venta,
        p.precio_costo,
        p.stock_actual,
        p.stock_minimo,
        p.created_at
      ].join(','))
    ].join('\n');

    // Descargar
    const blob = new Blob([cssString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventario exportado correctamente');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black dark:text-white">INVENTARIO</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-10 pr-4 py-2.5 border-2 border-black dark:border-white rounded-lg font-medium focus:ring-4 focus:ring-yellow-200 outline-none dark:bg-zinc-900 dark:text-white dark:focus:ring-yellow-900"
            />
          </div>
          <AdminButton variant="outline" icon={Download} onClick={handleExport}>
            Exportar
          </AdminButton>
          <AdminButton variant="outline" icon={Download} onClick={() => setIsImportModalOpen(true)}>
            Importar
          </AdminButton>
          <AdminButton variant="success" icon={Plus} onClick={handleNew}>
            Nuevo
          </AdminButton>
        </div>
      </div>

      {/* TABLA */}
      <Card className="overflow-hidden p-0!">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-white dark:bg-zinc-900 dark:text-white dark:border-b-2 dark:border-white">
              <tr>
                <th className="p-4 font-bold">Imagen</th>
                <th className="p-4 font-bold">Producto</th>
                <th className="p-4 font-bold">Categoría</th>
                <th className="p-4 font-bold text-right">Precio</th>
                <th className="p-4 font-bold text-center">Stock</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100 dark:divide-gray-800">
              {productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-yellow-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded border border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center">
                      {prod.imagen_url ? (
                        <img src={prod.imagen_url} alt="Prod" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400 w-6 h-6" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-black dark:text-white">{prod.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{prod.sku || 'S/N'}</p>
                  </td>
                  <td className="p-4"><span className="bg-gray-100 dark:bg-zinc-800 dark:text-gray-300 dark:border-gray-600 px-2 py-1 rounded text-xs font-bold border">{prod.categoria}</span></td>
                  <td className="p-4 text-right font-bold dark:text-white">${prod.precio_venta}</td>
                  <td className="p-4 text-center">
                    <Badge type={prod.stock_actual === 0 ? 'danger' : 'success'}>{prod.stock_actual}</Badge>
                  </td>
                  <td className="p-4 text-center">
                     <button onClick={() => handleEdit(prod)} className="p-2 hover:bg-yellow-200 dark:hover:bg-yellow-900 rounded text-black dark:text-white mr-2"><Edit2 className="w-4 h-4" /></button>
                     <button onClick={() => handleEliminar(prod.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-red-600 dark:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productToEdit={editingProduct} 
      />

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={() => queryClient.invalidateQueries(['productos'])}
      />
    </div>
  );
};

export default InventoryPage;
