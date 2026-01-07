import React from 'react';
import { Search } from 'lucide-react';

const ProductGrid = ({ productos, addToTicket, busqueda, setBusqueda }) => {
  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          type="text" 
          placeholder="Buscar o escanear..." 
          className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-white rounded-xl font-medium focus:ring-4 focus:ring-yellow-200 outline-none dark:bg-zinc-900 dark:text-white dark:focus:ring-yellow-900"
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20 lg:pb-2">
        {productos.map(prod => (
          <button 
            key={prod.id} 
            onClick={() => addToTicket(prod)}
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
