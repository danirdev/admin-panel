import React from 'react';
import { Search, Calculator } from 'lucide-react';

const ProductGrid = ({ productos, addToTicket, busqueda, setBusqueda, onOpenCalculator }) => {
  const [cantidad, setCantidad] = React.useState(1);
  const [manualItem, setManualItem] = React.useState({ nombre: '', precio: '' });

  const handleAddManual = (e) => {
    e.preventDefault();
    if (!manualItem.nombre || !manualItem.precio) return;

    const newItem = {
      id: `manual-${Date.now()}`, // ID temporal único
      nombre: manualItem.nombre,
      precio_venta: parseFloat(manualItem.precio),
      categoria: 'Manual',
      stock_actual: 9999, // Stock infinito para manuales
      isManual: true
    };

    addToTicket(newItem, cantidad);
    setManualItem({ nombre: '', precio: '' }); // Reset
  };

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="text" 
            placeholder="Buscar o escanear..." 
            className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-white rounded-xl font-medium focus:ring-4 focus:ring-yellow-200 outline-none dark:bg-zinc-900 dark:text-white dark:focus:ring-yellow-900"
          />
        </div>
        <div className="w-full md:w-auto shrink-0 flex gap-2">
          <input 
            type="number" 
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value) > 0 ? Number(e.target.value) : 1)}
            className="w-24 px-4 py-3 border-2 border-black dark:border-white rounded-xl font-bold text-center focus:ring-4 focus:ring-yellow-200 outline-none dark:bg-zinc-900 dark:text-white dark:focus:ring-yellow-900"
            title="Cantidad a agregar"
          />
           <button
             onClick={onOpenCalculator}
             className="md:hidden bg-yellow-400 p-3 rounded-xl border-2 border-black active:translate-y-1 transition-all"
             title="Abrir Calculadora"
          >
             <Calculator className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
           <button
             onClick={onOpenCalculator}
             className="hidden md:flex items-center gap-2 bg-yellow-400 px-4 py-2 rounded-xl border-2 border-black font-bold hover:bg-yellow-500 active:translate-y-1 transition-all whitespace-nowrap"
             title="Abrir Calculadora de Impresiones"
          >
             <Calculator className="w-5 h-5" />
             <span className="text-sm">Calculadora</span>
          </button>
          
          {/* MANUAL ITEM ADDITION */}
          <form onSubmit={handleAddManual} className="flex-1 flex flex-col md:flex-row gap-2 bg-yellow-50 dark:bg-zinc-800 p-2 rounded-xl border-2 border-yellow-200 dark:border-zinc-700">
            <input 
              value={manualItem.nombre}
              onChange={e => setManualItem({...manualItem, nombre: e.target.value})}
              placeholder="Descripción (ej: Fotocopias)"
              className="flex-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white outline-none focus:border-yellow-500"
            />
            <input 
              type="number"
              value={manualItem.precio}
              onChange={e => setManualItem({...manualItem, precio: e.target.value})}
              placeholder="Precio Unit."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white outline-none focus:border-yellow-500"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 active:translate-y-1 transition-all"
            >
              AGREGAR
            </button>  
          </form>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20 lg:pb-2">
        {productos.map(prod => (
          <button 
            key={prod.id} 
            onClick={() => addToTicket(prod, cantidad)}
            disabled={prod.stock_actual === 0}
            className={`flex flex-col p-4 border-2 border-black dark:border-white rounded-xl text-left transition-all active:scale-95 ${
              prod.stock_actual === 0 ? 'opacity-50 bg-gray-100 dark:bg-zinc-800 cursor-not-allowed' : 'bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <div className="flex-1">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{prod.categoria}</span>
              <h4 className="font-bold text-sm leading-tight mt-1 mb-2 line-clamp-2 text-black dark:text-white">{prod.nombre}</h4>
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="font-black text-lg text-black dark:text-white">${prod.precio_venta}</span>
              <span className={`text-xs font-bold ${prod.stock_actual < 5 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                Stock: {prod.stock_actual}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
