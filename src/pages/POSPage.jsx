import React, { useState } from 'react';
import { Search, ShoppingCart, Check } from 'lucide-react';
import { Card } from '../components/common/UI';

const MOCK_INVENTARIO = [
  { id: 1, nombre: "Cuaderno Universitario", precio: 4500, costo: 2800, stock: 24, categoria: "Escolar", sku: "CUA-001" },
  { id: 2, nombre: "Set de Geometría", precio: 1200, costo: 600, stock: 5, categoria: "Escolar", sku: "GEO-002" },
  { id: 3, nombre: "Resma A4 500h", precio: 6500, costo: 4500, stock: 50, categoria: "Oficina", sku: "PAP-003" },
  { id: 4, nombre: "Bolígrafo Azul", precio: 400, costo: 150, stock: 120, categoria: "Escolar", sku: "BOL-004" },
  { id: 5, nombre: "Mochila Básica", precio: 25000, costo: 12000, stock: 0, categoria: "Escolar", sku: "MOC-005" },
];

const POSPage = () => {
  const [ticket, setTicket] = useState([]);
  const [total, setTotal] = useState(0);

  const addToTicket = (prod) => {
    const existing = ticket.find(i => i.id === prod.id);
    if(existing) {
      setTicket(ticket.map(i => i.id === prod.id ? {...i, cant: i.cant + 1} : i));
    } else {
      setTicket([...ticket, {...prod, cant: 1}]);
    }
    setTotal(prev => prev + prod.precio);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Panel Izquierdo: Selección de Productos */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex gap-2">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
             <input 
                type="text" 
                placeholder="Buscar o escanear..." 
                autoFocus
                className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-xl font-medium focus:ring-4 focus:ring-yellow-200 focus:outline-none shadow-sm"
              />
           </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20 lg:pb-2">
          {MOCK_INVENTARIO.map(prod => (
             <button 
                key={prod.id} 
                onClick={() => addToTicket(prod)}
                disabled={prod.stock === 0}
                className={`flex flex-col p-4 border-2 border-black rounded-xl text-left transition-all active:scale-95 ${
                  prod.stock === 0 ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-blue-50 hover:shadow-md'
                }`}
             >
               <div className="flex-1">
                 <span className="text-xs font-bold text-gray-400 uppercase">{prod.categoria}</span>
                 <h4 className="font-bold text-sm leading-tight mt-1 mb-2 line-clamp-2">{prod.nombre}</h4>
               </div>
               <div className="flex justify-between items-end mt-2">
                 <span className="font-black text-lg">${prod.precio}</span>
                 {prod.stock < 10 && prod.stock > 0 && <span className="text-xs font-bold text-red-500">Stock: {prod.stock}</span>}
               </div>
             </button>
          ))}
        </div>
      </div>

      {/* Panel Derecho: Ticket (Móvil: Bottom Sheet o debajo) */}
      <Card className="w-full lg:w-96 flex flex-col p-0! overflow-hidden h-full border-4 shadow-xl shrink-0">
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <h3 className="font-black text-xl">TICKET</h3>
          <span className="bg-white/20 px-2 py-1 rounded text-xs">#{Math.floor(Math.random() * 1000)}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white min-h-[200px]">
          {ticket.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p className="font-medium text-sm">Escanea un producto</p>
            </div>
          ) : (
            ticket.map((item) => (
              <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 animate-in slide-in-from-right-2">
                <div>
                  <p className="font-bold text-sm">{item.nombre}</p>
                  <p className="text-xs text-gray-500">{item.cant} x ${item.precio}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.cant * item.precio}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t-2 border-black space-y-4">
          <div className="flex justify-between text-2xl font-black text-black">
            <span>TOTAL</span>
            <span>${total.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white border-2 border-black py-2 rounded font-bold hover:bg-gray-100 transition-colors">Efectivo</button>
            <button className="bg-white border-2 border-black py-2 rounded font-bold hover:bg-gray-100 transition-colors">Transferencia</button>
          </div>
          
          <button 
            disabled={ticket.length === 0}
            className="w-full bg-green-500 text-black border-2 border-black py-4 rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6" /> COBRAR
          </button>
        </div>
      </Card>
    </div>
  );
};

export default POSPage;
