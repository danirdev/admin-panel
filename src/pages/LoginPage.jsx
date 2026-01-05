import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Error de acceso: ' + error.message);
    } else {
      // Login exitoso, vamos al Dashboard
      navigate('/'); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
        <h1 className="text-3xl font-black mb-6 text-center">FOTOCOPIAS RAMOS</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-bold text-sm mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black p-2 rounded-lg outline-none focus:ring-4 focus:ring-yellow-200"
              placeholder="admin@ramos.com"
              required
            />
          </div>
          
          <div>
            <label className="block font-bold text-sm mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black p-2 rounded-lg outline-none focus:ring-4 focus:ring-yellow-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors border-2 border-transparent disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
