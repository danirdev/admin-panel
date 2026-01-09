import React, { useState } from 'react';
import { Calculator, Printer, Layers, FileText, Check } from 'lucide-react';
import { Card, AdminButton } from '../components/common/UI';

const CalculatorPage = () => {
  // Precios Base (Configurable en futuro)
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
  
  // Calculo automatico (Derivado del estado, sin useEffect para evitar re-renders innecesarios)
  let precioHoja = 0;
  if (tamano === 'A4') {
    precioHoja = tipo === 'BN' ? PRICE_BW_A4 : PRICE_COLOR_A4;
  } else {
    precioHoja = tipo === 'BN' ? PRICE_BW_A3 : PRICE_COLOR_A3;
  }

  // let hojasFisicas = faz === 'SIMPLE' ? paginas : Math.ceil(paginas / 2); // Unused for now, but good to have logic
  
  let subtotalImpresion = precioHoja * paginas * cantidad;

  let extras = 0;
  if (anillado) extras += PRICE_ANILLADO * cantidad; 
  if (plastificado) extras += PRICE_PLASTIFICADO_A4 * cantidad;

  const total = subtotalImpresion + extras; 
  // Eliminamos state 'total' y setTotal, usamos variable derivada

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-400 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Calculator className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-4xl font-black text-black dark:text-white tracking-tight">CALCULADORA</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PANEL DE CONFIGURACION */}
        <Card className="space-y-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-bold text-xl border-b-2 border-dashed border-gray-300 pb-2 mb-4">Configurar Trabajo</h3>

            {/* Cantidad y Paginas */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Juegos / Copias</label>
                    <input 
                        type="number" min="1" 
                        value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        className="w-full text-center text-2xl font-black p-3 rounded-lg border-2 border-black focus:bg-yellow-100 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Págs por Juego</label>
                    <input 
                        type="number" min="1" 
                        value={paginas} onChange={(e) => setPaginas(parseInt(e.target.value) || 1)}
                        className="w-full text-center text-2xl font-black p-3 rounded-lg border-2 border-black focus:bg-yellow-100 outline-none"
                    />
                </div>
            </div>

            {/* Tipo y Tamaño */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Color</label>
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
                        <button 
                            onClick={() => setTipo('BN')}
                            className={`flex-1 py-2 font-bold rounded ${tipo === 'BN' ? 'bg-black text-white shadow-sm' : 'text-gray-500'}`}
                        >B/N</button>
                        <button 
                            onClick={() => setTipo('COLOR')}
                            className={`flex-1 py-2 font-bold rounded ${tipo === 'COLOR' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500'}`}
                        >Color</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Tamaño</label>
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
                        <button 
                            onClick={() => setTamano('A4')}
                            className={`flex-1 py-2 font-bold rounded ${tamano === 'A4' ? 'bg-white border md:border-transparent text-black shadow-sm' : 'text-gray-500'}`}
                        >A4</button>
                        <button 
                            onClick={() => setTamano('A3')}
                            className={`flex-1 py-2 font-bold rounded ${tamano === 'A3' ? 'bg-white border md:border-transparent text-black shadow-sm' : 'text-gray-500'}`}
                        >A3</button>
                    </div>
                </div>
            </div>

            {/* Faz */}
            <div>
                 <label className="block text-sm font-bold mb-1">Carillas</label>
                 <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
                    <button 
                        onClick={() => setFaz('SIMPLE')}
                        className={`flex-1 py-2 font-bold rounded flex items-center justify-center gap-2 ${faz === 'SIMPLE' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500'}`}
                    >
                        <FileText className="w-4 h-4" /> Simple Faz
                    </button>
                    <button 
                        onClick={() => setFaz('DOBLE')}
                        className={`flex-1 py-2 font-bold rounded flex items-center justify-center gap-2 ${faz === 'DOBLE' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500'}`}
                    >
                        <Layers className="w-4 h-4" /> Doble Faz
                    </button>
                 </div>
            </div>

            {/* Extras */}
            <div className="space-y-2 pt-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${anillado ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${anillado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                        {anillado && <Check className="w-4 h-4" />}
                    </div>
                    <input type="checkbox" checked={anillado} onChange={(e) => setAnillado(e.target.checked)} className="hidden" />
                    <span className="font-bold flex-1">Anillado (+$1500 c/u)</span>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${plastificado ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${plastificado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                        {plastificado && <Check className="w-4 h-4" />}
                    </div>
                    <input type="checkbox" checked={plastificado} onChange={(e) => setPlastificado(e.target.checked)} className="hidden" />
                    <span className="font-bold flex-1">Plastificado (+$1000 c/u)</span>
                </label>
            </div>

        </Card>

        {/* PANEL DE RESULTADO */}
        <div className="space-y-6">
            <Card className="bg-black text-white p-8 flex flex-col items-center justify-center h-64 shadow-[8px_8px_0px_0px_#fbbf24] border-none relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900 opacity-50 z-0"></div>
                <div className="relative z-10 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Presupuesto Estimado</p>
                    <div className="text-6xl font-black tracking-tighter text-yellow-400">
                        ${total.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-400 mt-4">
                        {cantidad} juegos de {paginas} págs ({tipo})
                    </p>
                </div>
            </Card>

            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 text-blue-800 text-sm">
                <h4 className="font-bold mb-2 flex items-center gap-2"><Printer className="w-4 h-4"/> Resumen del Cálculo:</h4>
                <ul className="space-y-1 list-disc list-inside">
                    <li>Copias: <strong>${((tipo === 'BN'?PRICE_BW_A4:PRICE_COLOR_A4)*paginas*cantidad).toLocaleString()}</strong></li>
                    {anillado && <li>Anillado: <strong>${(PRICE_ANILLADO * cantidad).toLocaleString()}</strong></li>}
                    {plastificado && <li>Plastificado: <strong>${(PRICE_PLASTIFICADO_A4 * cantidad).toLocaleString()}</strong></li>}
                </ul>
            </div>
            
            <div className="flex gap-4">
                 <AdminButton 
                    variant="outline" 
                    className="flex-1 py-4 text-lg"
                    onClick={() => {
                        setCantidad(1);
                        setPaginas(1);
                        setTipo('BN');
                        setTamano('A4');
                        setFaz('SIMPLE');
                        setAnillado(false);
                        setPlastificado(false);
                    }}
                 >
                    Limpiar
                 </AdminButton>
                 <AdminButton 
                    variant="success" 
                    className="flex-1 py-4 text-lg"
                    onClick={() => {
                         // Navegar al POS y pasar el item (Requiere actualizar POSPage para leerlo)
                         // Por ahora, solo copiamos al portapapeles o mostramos toast
                         const descripcion = `Fotocopias ${tipo} ${tamano} x${cantidad} (${paginas} págs)`;
                         navigator.clipboard.writeText(`${descripcion} - $${total}`);
                         // alert("Copiado al portapapeles: " + descripcion); // O usar toast si está disponible
                         import('sonner').then(({ toast }) => toast.success("Copiado al portapapeles. Ve a la Caja y pégalo."));
                    }}
                 >
                    Copiar Total
                 </AdminButton>
            </div>
            <p className="text-center text-xs text-gray-400 font-bold">
                * Precios sugeridos. Ajustar en configuración.
            </p>
        </div>

      </div>
    </div>
  );
};

export default CalculatorPage;
