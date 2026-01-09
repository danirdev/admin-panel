import { useState } from 'react';
import { Printer, Layers, FileText, Check, Copy } from 'lucide-react';
import { Card, AdminButton } from '../common/UI';
import { toast } from 'sonner';

const PrintCalculator = ({ onAddToTicket, onCancel }) => {
  // Precios Base (Podrían venir de props o config global en futuro)
  const PRICE_BW_A4 = 50;
  const PRICE_COLOR_A4 = 250;
  const PRICE_BW_A3 = 100;
  const PRICE_COLOR_A3 = 500;
  
  const PRICE_ANILLADO = 1500;
  const PRICE_PLASTIFICADO_A4 = 1000;

  // Estado
  const [cantidad, setCantidad] = useState(1);
  const [paginas, setPaginas] = useState(1);
  const [tipo, setTipo] = useState('BN');       // BN, COLOR
  const [tamano, setTamano] = useState('A4');   // A4, A3
  const [faz, setFaz] = useState('SIMPLE');     // SIMPLE, DOBLE
  const [anillado, setAnillado] = useState(false);
  const [plastificado, setPlastificado] = useState(false);
  
  // Calculo automatico
  let precioHoja = 0;
  if (tamano === 'A4') {
    precioHoja = tipo === 'BN' ? PRICE_BW_A4 : PRICE_COLOR_A4;
  } else {
    precioHoja = tipo === 'BN' ? PRICE_BW_A3 : PRICE_COLOR_A3;
  }

  let subtotalImpresion = precioHoja * paginas * cantidad;

  let extras = 0;
  if (anillado) extras += PRICE_ANILLADO * cantidad; 
  if (plastificado) extras += PRICE_PLASTIFICADO_A4 * cantidad;

  const total = subtotalImpresion + extras; 
  const precioUnitario = total / cantidad;

  const handleAction = () => {
    const descripcion = `Fotocopias ${tipo} ${tamano} (${paginas} págs)${anillado ? ' + Anillado' : ''}${plastificado ? ' + Plastificado' : ''}`;
    
    if (onAddToTicket) {
      // Modo POS: Devolver objeto item
      onAddToTicket({
        nombre: descripcion,
        precio_venta: precioUnitario, // Corrected from 'precio' to 'precio_venta'
        cantidad: cantidad,
        isManual: true // Marcar como manual
      });
    } else {
      // Modo Standalone: Copiar al portapapeles
      navigator.clipboard.writeText(`${descripcion} x${cantidad} = $${total}`);
      toast.success("Copiado al portapapeles");
    }
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row h-full">
        {/* PANEL DE CONFIGURACION */}
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            
            {/* Cantidad y Paginas */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1 dark:text-white">Juegos / Copias</label>
                    <input 
                        type="number" min="1" 
                        value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        className="w-full text-center text-2xl font-black p-3 rounded-lg border-2 border-black dark:border-white focus:bg-yellow-100 dark:bg-zinc-800 dark:text-white outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1 dark:text-white">Págs por Juego</label>
                    <input 
                        type="number" min="1" 
                        value={paginas} onChange={(e) => setPaginas(parseInt(e.target.value) || 1)}
                        className="w-full text-center text-2xl font-black p-3 rounded-lg border-2 border-black dark:border-white focus:bg-yellow-100 dark:bg-zinc-800 dark:text-white outline-none"
                    />
                </div>
            </div>

            {/* Tipo y Tamaño */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1 dark:text-white">Color</label>
                    <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-300 dark:border-zinc-700">
                        <button 
                            onClick={() => setTipo('BN')}
                            className={`flex-1 py-2 font-bold rounded ${tipo === 'BN' ? 'bg-black text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >B/N</button>
                        <button 
                            onClick={() => setTipo('COLOR')}
                            className={`flex-1 py-2 font-bold rounded ${tipo === 'COLOR' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >Color</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1 dark:text-white">Tamaño</label>
                    <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-300 dark:border-zinc-700">
                        <button 
                            onClick={() => setTamano('A4')}
                            className={`flex-1 py-2 font-bold rounded ${tamano === 'A4' ? 'bg-white dark:bg-zinc-700 border md:border-transparent text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >A4</button>
                        <button 
                            onClick={() => setTamano('A3')}
                            className={`flex-1 py-2 font-bold rounded ${tamano === 'A3' ? 'bg-white dark:bg-zinc-700 border md:border-transparent text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                        >A3</button>
                    </div>
                </div>
            </div>

            {/* Faz */}
            <div>
                 <label className="block text-sm font-bold mb-1 dark:text-white">Carillas</label>
                 <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 border border-gray-300 dark:border-zinc-700">
                    <button 
                        onClick={() => setFaz('SIMPLE')}
                        className={`flex-1 py-2 font-bold rounded flex items-center justify-center gap-2 ${faz === 'SIMPLE' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <FileText className="w-4 h-4" /> Simple Faz
                    </button>
                    <button 
                        onClick={() => setFaz('DOBLE')}
                        className={`flex-1 py-2 font-bold rounded flex items-center justify-center gap-2 ${faz === 'DOBLE' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Layers className="w-4 h-4" /> Doble Faz
                    </button>
                 </div>
            </div>

            {/* Extras */}
            <div className="space-y-2 pt-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${anillado ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${anillado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-zinc-600'}`}>
                        {anillado && <Check className="w-4 h-4" />}
                    </div>
                    <input type="checkbox" checked={anillado} onChange={(e) => setAnillado(e.target.checked)} className="hidden" />
                    <span className="font-bold flex-1 dark:text-white">Anillado (+$1500 c/u)</span>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${plastificado ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${plastificado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-zinc-600'}`}>
                        {plastificado && <Check className="w-4 h-4" />}
                    </div>
                    <input type="checkbox" checked={plastificado} onChange={(e) => setPlastificado(e.target.checked)} className="hidden" />
                    <span className="font-bold flex-1 dark:text-white">Plastificado (+$1000 c/u)</span>
                </label>
            </div>

        </div>

        {/* PANEL DE RESULTADO */}
        <div className="flex-1 flex flex-col space-y-6">
            <Card className="bg-black text-white p-6 flex flex-col items-center justify-center flex-1 shadow-[8px_8px_0px_0px_#fbbf24] border-none relative overflow-hidden min-h-[200px]">
                <div className="absolute inset-0 bg-zinc-900 opacity-50 z-0"></div>
                <div className="relative z-10 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Presupuesto Estimado</p>
                    <div className="text-5xl lg:text-6xl font-black tracking-tighter text-yellow-400">
                        ${total.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-400 mt-4">
                        {cantidad} juegos de {paginas} págs ({tipo})
                    </p>
                </div>
            </Card>

            <div className="bg-blue-50 dark:bg-zinc-800 p-4 rounded-xl border-2 border-blue-200 dark:border-zinc-700 text-blue-800 dark:text-blue-200 text-sm">
                <h4 className="font-bold mb-2 flex items-center gap-2"><Printer className="w-4 h-4"/> Resumen del Cálculo:</h4>
                <ul className="space-y-1 list-disc list-inside">
                    <li>Copias: <strong>${((tipo === 'BN'?PRICE_BW_A4:PRICE_COLOR_A4)*paginas*cantidad).toLocaleString()}</strong></li>
                    {anillado && <li>Anillado: <strong>${(PRICE_ANILLADO * cantidad).toLocaleString()}</strong></li>}
                    {plastificado && <li>Plastificado: <strong>${(PRICE_PLASTIFICADO_A4 * cantidad).toLocaleString()}</strong></li>}
                </ul>
            </div>
            
            <div className="flex gap-4">
                 {onCancel && (
                    <AdminButton 
                        variant="outline" 
                        onClick={onCancel}
                        className="py-3"
                    >
                        Cancelar
                    </AdminButton>
                 )}
                 
                 <button 
                    onClick={() => {
                        setCantidad(1);
                        setPaginas(1);
                        setTipo('BN');
                        setTamano('A4');
                        setFaz('SIMPLE');
                        setAnillado(false);
                        setPlastificado(false);
                    }}
                    className="flex-1 py-3 px-4 font-bold border-2 border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-white transition-colors"
                 >
                    Limpiar
                 </button>

                 <AdminButton 
                    variant="success" 
                    className="flex-2 py-3 text-lg"
                    onClick={handleAction}
                    icon={onAddToTicket ? Check : Copy}
                 >
                    {onAddToTicket ? 'Agregar al Ticket' : 'Copiar Total'}
                 </AdminButton>
            </div>
        </div>

    </div>
  );
};

export default PrintCalculator;
