import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Loader } from 'lucide-react';
import { AdminButton, Card, Badge } from '../components/common/UI';
import { supabase } from '../supabase';

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Estado para la subida de imagen
  const fileInputRef = useRef(null); // Referencia al input invisible

  // Estado formulario
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio_venta: '',
    precio_costo: '',
    stock_actual: '',
    stock_minimo: 5, // Valor por defecto
    categoria: 'Escolar',
    sku: '',
    imagen_url: null // Aquí guardaremos la URL
  });

  // 1. CARGAR PRODUCTOS
  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error('Error cargando:', error);
    else setProductos(data || []);
    setLoading(false);
  }

  // 2. MANEJAR SUBIDA DE IMAGEN
  async function handleImageUpload(event) {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      // Generar nombre único: timestamp_nombrearchivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // A. Subir a Supabase Storage (Bucket 'productos_img')
      const { error: uploadError } = await supabase.storage
        .from('productos_img')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // B. Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos_img')
        .getPublicUrl(filePath);

      // C. Guardar URL en el estado local
      setNuevoProducto(prev => ({ ...prev, imagen_url: publicUrl }));

    } catch (error) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // 3. GUARDAR PRODUCTO (FINAL)
  async function handleGuardar() {
    if (!nuevoProducto.nombre || !nuevoProducto.precio_venta) return alert("Faltan datos obligatorios");

    const { error } = await supabase.from('productos').insert([
      {
        nombre: nuevoProducto.nombre,
        precio_venta: parseFloat(nuevoProducto.precio_venta),
        precio_costo: parseFloat(nuevoProducto.precio_costo) || 0,
        stock_actual: parseInt(nuevoProducto.stock_actual) || 0,
        stock_minimo: parseInt(nuevoProducto.stock_minimo) || 5,
        categoria: nuevoProducto.categoria,
        sku: nuevoProducto.sku || null,
        imagen_url: nuevoProducto.imagen_url // Guardamos la URL
      }
    ]);

    if (error) {
      alert('Error guardando en BD: ' + error.message);
    } else {
      setIsModalOpen(false);
      fetchProductos();
      setNuevoProducto({ nombre: '', precio_venta: '', precio_costo: '', stock_actual: '', stock_minimo: 5, categoria: 'Escolar', sku: '', imagen_url: null });
    }
  }

  // 4. ELIMINAR
  async function handleEliminar(id) {
    if(!window.confirm("¿Eliminar producto?")) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) fetchProductos();
  }

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
        <h2 className="text-3xl font-black">INVENTARIO</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-lg font-medium focus:ring-4 focus:ring-yellow-200 outline-none"
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
                <th className="p-4 font-bold">Imagen</th>
                <th className="p-4 font-bold">Producto</th>
                <th className="p-4 font-bold">Categoría</th>
                <th className="p-4 font-bold text-right">Precio</th>
                <th className="p-4 font-bold text-center">Stock</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-yellow-50 transition-colors group">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded border border-gray-300 overflow-hidden flex items-center justify-center">
                      {prod.imagen_url ? (
                        <img src={prod.imagen_url} alt="Prod" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400 w-6 h-6" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-black">{prod.nombre}</p>
                    <p className="text-xs text-gray-500">{prod.sku || 'S/N'}</p>
                  </td>
                  <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold border">{prod.categoria}</span></td>
                  <td className="p-4 text-right font-bold">${prod.precio_venta}</td>
                  <td className="p-4 text-center">
                    <Badge type={prod.stock_actual === 0 ? 'danger' : 'success'}>{prod.stock_actual}</Badge>
                  </td>
                  <td className="p-4 text-center">
                     <button onClick={() => handleEliminar(prod.id)} className="p-2 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL NUEVO PRODUCTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b-2 border-black bg-yellow-300 rounded-t-xl shrink-0">
              <h3 className="text-xl font-black">NUEVO PRODUCTO</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/50 p-1 rounded"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Sección de Imagen */}
              <div className="flex justify-center">
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-32 border-2 border-dashed border-black rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-yellow-50 cursor-pointer transition-colors relative overflow-hidden"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center text-yellow-600">
                      <Loader className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-xs font-bold">Subiendo...</span>
                    </div>
                  ) : nuevoProducto.imagen_url ? (
                    <img src={nuevoProducto.imagen_url} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500">Click para subir foto</span>
                    </>
                  )}
                  {/* Input invisible */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Campos de Texto */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Nombre</label>
                  <input type="text" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full border-2 border-black rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Precio Venta</label>
                   <input type="number" value={nuevoProducto.precio_venta} onChange={e => setNuevoProducto({...nuevoProducto, precio_venta: e.target.value})} className="w-full border-2 border-black rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Stock Actual</label>
                   <input type="number" value={nuevoProducto.stock_actual} onChange={e => setNuevoProducto({...nuevoProducto, stock_actual: e.target.value})} className="w-full border-2 border-black rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Costo (Privado)</label>
                   <input type="number" value={nuevoProducto.precio_costo} onChange={e => setNuevoProducto({...nuevoProducto, precio_costo: e.target.value})} className="w-full border-2 border-black rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-1">Stock Mínimo</label>
                   <input type="number" value={nuevoProducto.stock_minimo} onChange={e => setNuevoProducto({...nuevoProducto, stock_minimo: e.target.value})} className="w-full border-2 border-black rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                 <div className="col-span-2">
                   <label className="block text-sm font-bold mb-1">Categoría</label>
                   <select value={nuevoProducto.categoria} onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} className="w-full border-2 border-black rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-yellow-400">
                     <option>Escolar</option>
                     <option>Oficina</option>
                     <option>Servicios</option>
                     <option>Arte</option>
                   </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t-2 border-black flex justify-end gap-3 bg-gray-50 rounded-b-xl shrink-0">
              <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</AdminButton>
              <AdminButton variant="success" icon={Save} onClick={handleGuardar} disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Guardar'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
