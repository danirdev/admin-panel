import React from 'react';

const PrintTicket = ({ venta }) => {
  if (!venta) return null;

  return (
    <div className="print-only font-mono text-black p-2 max-w-[80mm] mx-auto text-xs leading-tight">
      {/* HEADER */}
      <div className="text-center mb-4 border-b border-black pb-2">
        <h1 className="font-black text-xl uppercase mb-1">Fotocopias Ramos</h1>
        <p>Dirección del Local, 123</p>
        <p>Tel: (123) 456-7890</p>
        <p className="mt-2 text-[10px]">{new Date(venta.created_at).toLocaleString()}</p>
        <p className="font-bold">Ticket #{venta.id ? venta.id.toString().padStart(6, '0') : '----'}</p>
      </div>

      {/* ITEMS */}
      <div className="mb-4">
        {venta.items.map((item, index) => (
          <div key={index} className="flex justify-between mb-1">
            <span className="truncate w-[60%]">{item.cantidad} x {item.nombre}</span>
            <span className="text-right w-[40%]">${(item.cantidad * item.precio_venta).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="border-t border-black pt-2 mb-8">
        <div className="flex justify-between font-black text-lg">
          <span>TOTAL</span>
          <span>${venta.total.toLocaleString()}</span>
        </div>
        <p className="text-center mt-4 text-[10px]">¡Gracias por su compra!</p>
      </div>
    </div>
  );
};

export default PrintTicket;
