import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { AdminButton, Card, Badge } from '../components/common/UI';
import { supabase } from '../supabase'; // IMPORTANTE: Tu archivo de conexión

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el formulario nuevo
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio_venta: '',
    precio_costo: '',
    stock_actual: '',
    categoria: 'Escolar',
    sku: '',
    imagen_url: ''
  });

  // 1. CARGAR PRODUCTOS
  // 1. CARGAR PRODUCTOS
  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: false }); // Los más nuevos primero

    if (error) console.error('Error cargando:', error);
    else setProductos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProductos();
  }, []);

  // 2. GUARDAR PRODUCTO
  async function handleGuardar() {
    // Validar campos básicos
    if (!nuevoProducto.nombre || !nuevoProducto.precio_venta) return alert("Faltan datos");

    const { error } = await supabase.from('productos').insert([
      {
        nombre: nuevoProducto.nombre,
        precio_venta: parseFloat(nuevoProducto.precio_venta),
        precio_costo: parseFloat(nuevoProducto.precio_costo) || 0,
        stock_actual: parseInt(nuevoProducto.stock_actual) || 0,
        categoria: nuevoProducto.categoria,
        sku: nuevoProducto.sku || null, // Opcional
        imagen_url: nuevoProducto.imagen_url || null
      }
    ]);

    if (error) {
      alert('Error guardando: ' + error.message);
    } else {
      setIsModalOpen(false);
      fetchProductos(); // Recargar tabla
      // Resetear form
      setNuevoProducto({ nombre: '', precio_venta: '', precio_costo: '', stock_actual: '', categoria: 'Escolar', sku: '', imagen_url: '' });
    }
  }

  // 3. ELIMINAR PRODUCTO
  async function handleEliminar(id) {
    if(!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    const { error } = await supabase.from('productos').delete().eq('id', id);
    
    if (error) alert('Error: ' + error.message);
    else fetchProductos();
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black">INVENTARIO</h2>
        <div className="flex gap-2 w-full md:w-auto">
          {/* ... (Tu buscador sigue igual) ... */}
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

      {/* TABLA */}
      <Card className="overflow-hidden p-0!">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4 font-bold">Producto</th>
                <th className="p-4 font-bold">Categoría</th>
                <th className="p-4 font-bold text-right">Costo</th>
                <th className="p-4 font-bold text-right">Precio</th>
                <th className="p-4 font-bold text-center">Stock</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-4 text-center">Cargando inventario...</td></tr>
              ) : productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-yellow-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-300 shrink-0 overflow-hidden">
                        {/* Si hay imagen la mostramos, sino un cuadro gris */}
                        {prod.imagen_url && <img src={prod.imagen_url} alt="" className="w-full h-full object-cover"/>}
                      </div>
                      <div>
                        <p className="font-bold text-black">{prod.nombre}</p>
                        <p className="text-xs text-gray-500">{prod.sku || 'S/N'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-300">{prod.categoria}</span>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-500">${prod.precio_costo}</td>
                  <td className="p-4 text-right font-bold text-black">${prod.precio_venta}</td>
                  <td className="p-4 text-center">
                    {prod.stock_actual === 0 ? (
                      <Badge type="danger">Agotado</Badge>
                    ) : prod.stock_actual < 5 ? (
                      <Badge type="warning">{prod.stock_actual} (Bajo)</Badge>
                    ) : (
                      <Badge type="success">{prod.stock_actual}</Badge>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-blue-100 rounded text-blue-600 border border-transparent hover:border-blue-200"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleEliminar(prod.id)} className="p-2 hover:bg-red-100 rounded text-red-600 border border-transparent hover:border-red-200"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL (Con inputs conectados al estado) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b-2 border-black bg-yellow-300 rounded-t-xl shrink-0">
              <h3 className="text-xl font-black">NUEVO PRODUCTO</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/50 p-1 rounded transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Nombre</label>
                  <input 
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                    type="text" 
                    className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none" 
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Precio Venta</label>
                   <input 
                    value={nuevoProducto.precio_venta}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precio_venta: e.target.value})}
                    type="number" className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none" 
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Costo</label>
                   <input 
                    value={nuevoProducto.precio_costo}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precio_costo: e.target.value})}
                    type="number" className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none" 
                   />
                </div>
                 <div>
                   <label className="block text-sm font-bold mb-1">Stock</label>
                   <input 
                    value={nuevoProducto.stock_actual}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stock_actual: e.target.value})}
                    type="number" className="w-full border-2 border-black rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 outline-none" 
                   />
                </div>
                 <div>
                   <label className="block text-sm font-bold mb-1">Categoría</label>
                   <select 
                    value={nuevoProducto.categoria}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                    className="w-full border-2 border-black rounded-lg p-2 bg-white focus:ring-2 focus:ring-yellow-400 outline-none">
                     <option value="Escolar">Escolar</option>
                     <option value="Oficina">Oficina</option>
                     <option value="Servicios">Servicios</option>
                     <option value="Arte">Arte</option>
                   </select>
                </div>
                <div className="col-span-2">
                   <label className="block text-sm font-bold mb-1">Imagen del Producto</label>
                   
                   {/* Área de carga */}
                   <div className="border-2 border-dashed border-black rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center text-center hover:bg-yellow-50 transition-colors relative mb-4">
                     
                     {nuevoProducto.imagen_url ? (
                        <div className="relative w-full h-48">
                          <img 
                            src={nuevoProducto.imagen_url} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                          />
                          <button 
                            onClick={() => setNuevoProducto({...nuevoProducto, imagen_url: ''})}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 border-2 border-black"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                     ) : (
                       <>
                         <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                         <label className="cursor-pointer">
                           <span className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors">
                             Seleccionar Imagen
                           </span>
                           <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                try {
                                  // 1. Subir al Bucket 'productos_img'
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `${Date.now()}.${fileExt}`;
                                  const filePath = `${fileName}`;

                                  const { error: uploadError } = await supabase.storage
                                    .from('productos_img') // Tu bucket
                                    .upload(filePath, file);

                                  if (uploadError) throw uploadError;

                                  // 2. Obtener URL Pública
                                  const { data } = supabase.storage
                                    .from('productos_img')
                                    .getPublicUrl(filePath);

                                  // 3. Guardar en estado
                                  setNuevoProducto(prev => ({ ...prev, imagen_url: data.publicUrl }));

                                } catch (error) {
                                  alert('Error subiendo imagen: ' + error.message);
                                }
                              }}
                           />
                         </label>
                         <p className="text-xs text-gray-500 mt-2 font-medium">PNG, JPG hasta 5MB</p>
                       </>
                     )}
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t-2 border-black flex justify-end gap-3 bg-gray-50 rounded-b-xl shrink-0">
              <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</AdminButton>
              <AdminButton variant="success" icon={Save} onClick={handleGuardar}>Guardar</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
