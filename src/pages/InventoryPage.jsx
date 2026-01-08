import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, Loader, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { AdminButton, Card, Badge } from '../components/common/UI';
import { supabase } from '../supabase';
import ProductModal from '../components/inventory/ProductModal';
import ImportModal from '../components/inventory/ImportModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, ChevronDown } from 'lucide-react';

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const [busqueda, setBusqueda] = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [sortConfig, setSortConfig] = useState({ column: 'created_at', ascending: false });
  const [showReportMenu, setShowReportMenu] = useState(false);

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
    }, 500);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const { data: productos = [], isLoading: loading } = useQuery({
    queryKey: ['productos', debouncedBusqueda, sortConfig],
    queryFn: async () => {
      let queryBuilder = supabase.from('productos').select('*');
      
      // Aplicar busqueda
      if (debouncedBusqueda) {
        queryBuilder = queryBuilder.ilike('nombre', `%${debouncedBusqueda}%`);
      }
      
      // Aplicar ordenamiento
      queryBuilder = queryBuilder.order(sortConfig.column, { ascending: sortConfig.ascending });
      
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
    setIsModalOpen(true);
  };

  // MANEJAR DUPLICADO
  const handleDuplicate = (producto) => {
    // Creamos una copia sin ID y con "(Copia)" en el nombre
    const copia = { 
      ...producto, 
      id: null, 
      nombre: `${producto.nombre} (Copia)`,
      sku: '' // Limpiamos SKU para evitar conflicto
    };
    setEditingProduct(copia);
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

  const generatePDF = (type) => {
    try {
      const doc = new jsPDF();
      // Ya no verificamos doc.autoTable porque usamos la funcion importada
      const date = new Date().toLocaleDateString();
    
    let title = '';
    let dataToPrint = [];
    
    if (type === 'low_stock') {
      title = `REPORTE DE COMPRAS (Stock Bajo) - ${date}`;
      // Filtrar productos con stock menor o igual al minimo
      dataToPrint = productos.filter(p => p.stock_actual <= p.stock_minimo);
      if (dataToPrint.length === 0) {
        toast.info("No hay productos con stock bajo.");
        return;
      }
    } else {
      title = `INVENTARIO COMPLETO - ${date}`;
      dataToPrint = productos;
    }

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    const tableColumn = ["Producto", "Categoría", "Stock Actual", "Mínimo", "Precio Venta", "SKU"];
    const tableRows = [];

    dataToPrint.forEach(product => {
      const productData = [
        product.nombre,
        product.categoria,
        product.stock_actual,
        product.stock_minimo,
        `$${product.precio_venta}`,
        product.sku || '-'
      ];
      tableRows.push(productData);
    });

    // Usar la función importada directamente si doc.autoTable no existe (o siempre)
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });

    doc.save(`reporte_${type}_${Date.now()}.pdf`);
    toast.success('Reporte generado exitosamente');
    setShowReportMenu(false);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Error generando PDF: " + error.message);
    }
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
          
          <select 
            value={`${sortConfig.column}-${sortConfig.ascending}`}
            onChange={(e) => {
              const [column, ascending] = e.target.value.split('-');
              setSortConfig({ column, ascending: ascending === 'true' });
            }}
            className="border-2 border-black dark:border-white rounded-lg px-4 py-2.5 font-bold bg-white dark:bg-zinc-900 text-black dark:text-white outline-none focus:ring-4 focus:ring-yellow-200 dark:focus:ring-yellow-900 cursor-pointer"
          >
            <option value="created_at-false">Más Recientes</option>
            <option value="nombre-true">Nombre (A-Z)</option>
            <option value="nombre-false">Nombre (Z-A)</option>
            <option value="precio_venta-true">Precio (Menor)</option>
            <option value="precio_venta-false">Precio (Mayor)</option>
            <option value="stock_actual-true">Stock (Menor)</option>
            <option value="stock_actual-false">Stock (Mayor)</option>
            <option value="stock_actual-false">Stock (Mayor)</option>
          </select>

          {/* Report Dropdown */}
          <div className="relative">
             <AdminButton variant="outline" icon={FileText} onClick={() => setShowReportMenu(!showReportMenu)}>
                Reportes <ChevronDown className="w-4 h-4 ml-1" />
             </AdminButton>
             
             {showReportMenu && (
               <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white rounded-lg shadow-xl z-50 overflow-hidden">
                 <button 
                  onClick={() => generatePDF('low_stock')}
                  className="w-full text-left px-4 py-3 hover:bg-yellow-50 dark:hover:bg-zinc-700 font-bold text-sm text-black dark:text-white border-b border-gray-100 dark:border-gray-700"
                 >
                   📉 Stock Bajo (Compras)
                 </button>
                 <button 
                  onClick={() => generatePDF('full')}
                  className="w-full text-left px-4 py-3 hover:bg-yellow-50 dark:hover:bg-zinc-700 font-bold text-sm text-black dark:text-white"
                 >
                   📋 Inventario Completo
                 </button>
               </div>
             )}
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
                     <button title="Editar" onClick={() => handleEdit(prod)} className="p-2 hover:bg-yellow-200 dark:hover:bg-yellow-900 rounded text-black dark:text-white mr-2"><Edit2 className="w-4 h-4" /></button>
                     <button title="Duplicar" onClick={() => handleDuplicate(prod)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-blue-600 dark:text-blue-400 mr-2"><Copy className="w-4 h-4" /></button>
                     <button title="Eliminar" onClick={() => handleEliminar(prod.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-red-600 dark:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
