import React from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Card } from '../common/UI';

const TicketSummary = ({ ticket, total, handleCobrar, lastSale }) => {
  return (
    <Card className="w-full lg:w-96 flex flex-col p-0! overflow-hidden h-full border-4 shadow-xl shrink-0 dark:border-white">
      <div className="bg-black text-white dark:bg-zinc-950 p-4 flex justify-between items-center border-b border-gray-800 dark:border-white/20">
        <h3 className="font-black text-xl">TICKET</h3>
        <span className="bg-white/20 px-2 py-1 rounded text-xs">{ticket.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-zinc-900 min-h-[200px]">
        {ticket.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-2">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <p className="font-medium text-sm">Escanea un producto</p>
          </div>
        ) : (
          ticket.map((item) => (
            <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800 text-black dark:text-white">
              <div>
                <p className="font-bold text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-500">{item.cantidad} x ${item.precio_venta}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${item.cantidad * item.precio_venta}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-50 dark:bg-zinc-950 p-4 border-t-2 border-black dark:border-white space-y-3">
        <div className="flex justify-between text-2xl font-black text-black dark:text-white">
          <span>TOTAL</span>
          <span>${total.toLocaleString()}</span>
        </div>
        
        <button 
          onClick={handleCobrar}
          disabled={ticket.length === 0}
          className="w-full bg-green-500 text-black border-2 border-black dark:border-white py-4 rounded-xl font-black text-xl hover:translate-y-[2px] active:translate-y-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-6 h-6" /> COBRAR
        </button>

        {lastSale && (
          <button 
            onClick={() => window.print()} 
            className="w-full bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white py-2 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors text-sm dashed-border"
          >
            🖨️ IMPRIMIR ÚLTIMO TICKET
          </button>
        )}
      </div>
    </Card>
  );
};

export default TicketSummary;
