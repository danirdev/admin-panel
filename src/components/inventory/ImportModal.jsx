import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, X, AlertTriangle, CheckCircle, FileSpreadsheet, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { AdminButton } from '../common/UI';

const ImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor sube un archivo CSV válido');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("CSV Errors:", results.errors);
          setError('Error leyendo el archivo CSV. Revisa el formato.');
          return;
        }
        
        // Validación básica de columnas
        const firstRow = results.data[0];
        if (!firstRow || !firstRow.hasOwnProperty('nombre') || !firstRow.hasOwnProperty('precio_venta')) {
          setError('El CSV debe tener al menos las columnas "nombre" y "precio_venta".');
          setFile(null);
          return;
        }

        setError(null);
        setData(results.data);
        setPreview(results.data.slice(0, 5)); // Previsualizar 5 filas
      },
      error: (err) => {
        setError('Error al analizar el CSV: ' + err.message);
      }
    });
  };

  const handleImport = async () => {
    if (!data || data.length === 0) return;

    setLoading(true);
    try {
      // Formatear datos para coincidir con la base de datos
      const productsToInsert = data.map(row => ({
        nombre: row.nombre?.trim(),
        categoria: row.categoria?.trim() || 'Escolar',
        precio_venta: parseFloat(row.precio_venta) || 0,
        precio_costo: parseFloat(row.precio_costo) || 0,
        stock_actual: parseInt(row.stock_actual) || 0,
        stock_minimo: parseInt(row.stock_minimo) || 5,
        sku: row.sku?.trim() || null,
        // Ignoramos imagen_url en carga masiva por ahora o lo dejamos opcional si viene
        imagen_url: row.imagen_url?.trim() || null
      })).filter(p => p.nombre && p.precio_venta > 0); // Filtrar filas invalidas

      if (productsToInsert.length === 0) {
        throw new Error("No se encontraron productos válidos para importar.");
      }

      const { error: insertError } = await supabase
        .from('productos')
        .insert(productsToInsert);

      if (insertError) throw insertError;

      toast.success(`${productsToInsert.length} productos importados correctamente`);
      onSuccess();
      handleClose();

    } catch (err) {
      console.error(err);
      toast.error('Error importando productos: ' + err.message);
      // Si falla por SKU duplicado, es comun
      if (err.message.includes('sku')) {
        toast.error('Error: Algunos SKU ya existen en la base de datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setData([]);
    setPreview([]);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-2xl w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-black dark:border-white bg-blue-300 dark:bg-blue-600 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-black dark:text-white" />
            <h3 className="text-xl font-black text-black dark:text-white">IMPORTAR PRODUCTOS (CSV)</h3>
          </div>
          <button onClick={handleClose} className="hover:bg-white/50 p-1 rounded text-black dark:text-white"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Instrucciones del CSV
            </h4>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>Formato: <strong>.csv</strong></li>
              <li>Columnas requeridas: <strong>nombre, precio_venta</strong></li>
              <li>Columnas opcionales: <strong>categoria, precio_costo, stock_actual, stock_minimo, sku, imagen_url</strong></li>
            </ul>
          </div>

          {/* Area de Subida */}
          {!file ? (
            <div className="relative">
               <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="font-bold text-gray-600 dark:text-gray-300">Click o arrastra tu archivo CSV aquí</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="font-mono text-sm dark:text-gray-300">{file.name}</span>
                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 text-sm font-bold">Cambiar archivo</button>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center gap-2 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              {/* Previsualizacion */}
              {preview.length > 0 && !error && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800 font-bold dark:text-gray-300">
                      <tr>
                        <th className="p-2">Nombre</th>
                        <th className="p-2">Categoría</th>
                        <th className="p-2">Precio</th>
                        <th className="p-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 dark:text-gray-400">
                      {preview.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2">{row.nombre}</td>
                          <td className="p-2">{row.categoria}</td>
                          <td className="p-2">${row.precio_venta}</td>
                          <td className="p-2">{row.stock_actual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Mostrando primeros {preview.length} de {data.length} productos
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-black dark:border-white flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900 rounded-b-xl shrink-0">
          <AdminButton variant="outline" onClick={handleClose}>Cancelar</AdminButton>
          <AdminButton 
            variant="success" 
            icon={loading ? Loader : Upload} 
            onClick={handleImport}
            disabled={!file || !!error || loading}
          >
            {loading ? 'Importando...' : 'Importar Productos'}
          </AdminButton>
        </div>

      </div>
    </div>
  );
};

export default ImportModal;
