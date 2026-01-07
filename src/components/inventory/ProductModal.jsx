import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, Image as ImageIcon, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query'; // Import queryClient

import { supabase } from '../../supabase';
import { productSchema } from '../../schemas/productSchema';
import { AdminButton } from '../common/UI';

const ProductModal = ({ isOpen, onClose, productToEdit }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: '',
      precio_venta: '',
      precio_costo: '',
      stock_actual: '',
      stock_minimo: 5,
      categoria: 'Escolar',
      sku: '',
      imagen_url: null
    }
  });

  const imagenUrl = watch('imagen_url');

  // Reset form when productToEdit changes or modal opens
  useEffect(() => {
    if (isOpen) {
        if (productToEdit) {
            reset({
              nombre: productToEdit.nombre,
              precio_venta: productToEdit.precio_venta,
              precio_costo: productToEdit.precio_costo,
              stock_actual: productToEdit.stock_actual,
              stock_minimo: productToEdit.stock_minimo,
              categoria: productToEdit.categoria,
              sku: productToEdit.sku || '',
              imagen_url: productToEdit.imagen_url
            });
        } else {
            reset({
              nombre: '',
              precio_venta: '',
              precio_costo: '',
              stock_actual: '',
              stock_minimo: 5,
              categoria: 'Escolar',
              sku: '',
              imagen_url: null
            });
        }
    }
  }, [isOpen, productToEdit, reset]);

  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('productos_img').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('productos_img').getPublicUrl(filePath);

      setValue('imagen_url', publicUrl);

    } catch (error) {
      toast.error('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      sku: data.sku && data.sku.trim() !== '' ? data.sku : null,
      imagen_url: data.imagen_url || null
    };

    let error;

    if (productToEdit) {
      const { error: updateError } = await supabase
        .from('productos')
        .update(formattedData)
        .eq('id', productToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('productos')
        .insert([formattedData]);
      error = insertError;
    }

    if (error) {
      toast.error('Error guardando en BD: ' + error.message);
    } else {
      queryClient.invalidateQueries(['productos']);
      toast.success(productToEdit ? "Producto actualizado" : "Producto creado exitosamente");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 rounded-t-xl shrink-0">
          <h3 className="text-xl font-black text-black">{productToEdit ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}</h3>
          <button onClick={onClose} className="hover:bg-white/50 p-1 rounded text-black"><X className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="contents">
          <div className="p-6 space-y-4 overflow-y-auto">
            {/* Sección de Imagen */}
            <div className="flex justify-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-black dark:border-white rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-800 hover:bg-yellow-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors relative overflow-hidden"
              >
                {uploading ? (
                  <div className="flex flex-col items-center text-yellow-600">
                    <Loader className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs font-bold">Subiendo...</span>
                  </div>
                ) : imagenUrl ? (
                  <img src={imagenUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Click para subir foto</span>
                  </>
                )}
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
            <div className="grid grid-cols-2 gap-4 text-black dark:text-white">
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">Nombre</label>
                <input 
                  type="text" 
                  {...register('nombre')}
                  className={`w-full border-2 border-black dark:border-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-zinc-800 dark:text-white ${errors.nombre ? 'border-red-500 bg-red-50' : ''}`} 
                />
                {errors.nombre && <p className="text-red-500 text-xs font-bold mt-1">{errors.nombre.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Precio Venta</label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('precio_venta')}
                  className={`w-full border-2 border-black dark:border-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-zinc-800 dark:text-white ${errors.precio_venta ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.precio_venta && <p className="text-red-500 text-xs font-bold mt-1">{errors.precio_venta.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Stock Actual</label>
                <input 
                  type="number" 
                  {...register('stock_actual')}
                  className={`w-full border-2 border-black dark:border-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-zinc-800 dark:text-white ${errors.stock_actual ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.stock_actual && <p className="text-red-500 text-xs font-bold mt-1">{errors.stock_actual.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Costo (Privado)</label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('precio_costo')}
                  className={`w-full border-2 border-black dark:border-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-zinc-800 dark:text-white ${errors.precio_costo ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.precio_costo && <p className="text-red-500 text-xs font-bold mt-1">{errors.precio_costo.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Stock Mínimo</label>
                <input 
                  type="number" 
                  {...register('stock_minimo')}
                  className={`w-full border-2 border-black dark:border-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-zinc-800 dark:text-white ${errors.stock_minimo ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.stock_minimo && <p className="text-red-500 text-xs font-bold mt-1">{errors.stock_minimo.message}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">Categoría</label>
                <select 
                  {...register('categoria')}
                  className="w-full border-2 border-black dark:border-white rounded-lg p-2 bg-white dark:bg-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Escolar">Escolar</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Arte">Arte</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">SKU (Opcional)</label>
                <input 
                  type="text" 
                  {...register('sku')}
                  className="w-full border-2 border-black dark:border-white rounded-lg p-2 outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-zinc-800 dark:text-white" 
                  placeholder="Código de barras..."
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t-2 border-black dark:border-white flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900 rounded-b-xl shrink-0">
            <AdminButton type="button" variant="outline" onClick={onClose}>Cancelar</AdminButton>
            <AdminButton type="submit" variant="success" icon={Save} disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Guardar'}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
