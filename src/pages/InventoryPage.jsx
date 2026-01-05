import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { AdminButton, Card, Badge } from '../components/common/UI';
import { supabase } from '../supabase';

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    async function loadInventory() {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (data) setProductos(data);
    }
    
    loadInventory();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black">INVENTARIO</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-lg font-medium focus:ring-4 focus:ring-yellow-200 focus:outline-none"
            />
          </div>
          <AdminButton variant="success" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Nuevo
          </AdminButton>
        </div>
      </div>

      <Card className="overflow-hidden p-0!">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4 font-bold">Producto</th>
                <th className="p-4 font-bold">Categoría</th>
                <th className="p-4 font-bold">SKU</th>
                <th className="p-4 font-bold text-right">Costo</th>
                <th className="p-4 font-bold text-right">Precio</th>
                <th className="p-4 font-bold text-center">Stock</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-yellow-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-300 shrink-0"></div>
                      <div>
                        <p className="font-bold text-black">{prod.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-300">{prod.categoria}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {prod.sku}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-500">${prod.precio_costo}</td>
                  <td className="p-4 text-right font-bold text-black">${prod.precio_venta}</td>
                  <td className="p-4 text-center">
                    {prod.stock_actual === 0 ? (
                      <Badge type="danger">Agotado</Badge>
                    ) : prod.stock_actual < 10 ? (
                      <Badge type="warning">{prod.stock_actual} (Bajo)</Badge>
                    ) : (
                      <Badge type="success">{prod.stock_actual}</Badge>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-100 rounded text-blue-600 border border-transparent hover:border-blue-200"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-red-100 rounded text-red-600 border border-transparent hover:border-red-200"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Agregar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b-2 border-black bg-yellow-300 rounded-t-xl shrink-0">
              <h3 className="text-xl font-black">NUEVO PRODUCTO</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/50 p-1 rounded transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Nombre del Producto</label>
                  <input type="text" className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all" placeholder="Ej: Cuaderno A4..." />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Precio Venta</label>
                   <input type="number" className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="0.00" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Precio Costo</label>
                   <input type="number" className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="0.00" />
                </div>
                 <div>
                   <label className="block text-sm font-bold mb-1">Stock Inicial</label>
                   <input type="number" className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="0" />
                </div>
                 <div>
                   <label className="block text-sm font-bold mb-1">Categoría</label>
                   <select className="w-full border-2 border-black rounded-lg p-2 bg-white focus:ring-2 focus:ring-yellow-400 outline-none">
                     <option>Escolar</option>
                     <option>Oficina</option>
                     <option>Servicios</option>
                   </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Imagen</label>
                  <div className="border-2 border-dashed border-black rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-500 transition-colors">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold">Click para subir imagen</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t-2 border-black flex justify-end gap-3 bg-gray-50 rounded-b-xl shrink-0">
              <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</AdminButton>
              <AdminButton variant="success" icon={Save}>Guardar</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
