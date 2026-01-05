import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, LogOut, 
  Menu, Bell, ShoppingCart
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Default open on desktop
      } else {
        setSidebarOpen(false); // Default closed on mobile
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
    if (!isDesktop) setSidebarOpen(false);
  };

  const MENU_ITEMS = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { path: '/inventory', label: 'Inventario', icon: Package },
    { path: '/orders', label: 'Pedidos Web', icon: ShoppingBag },
    { path: '/clients', label: 'Clientes', icon: Users },
  ];

  const currentItem = MENU_ITEMS.find(item => item.path === location.pathname) || MENU_ITEMS[0];

  return (
    <div className="h-screen bg-[#FFFDF5] font-sans flex overflow-hidden">
      
      {/* 1. MOBILE BACKDROP */}
      {!isDesktop && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR */}
      <aside 
        className={`
          fixed md:relative z-40 h-full bg-black text-white flex flex-col transition-all duration-300 ease-out border-r-4 border-black
          ${!isDesktop 
              ? (isSidebarOpen ? 'translate-x-0 w-[80%] max-w-sm shadow-2xl' : '-translate-x-full w-[80%] max-w-sm') 
              : (isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-0') 
          }
        `}
      >
        <div className="h-20 flex items-center justify-center border-b border-gray-800 shrink-0">
          {(!isDesktop || isSidebarOpen) ? (
            <h1 className="text-2xl font-black tracking-tighter text-yellow-400 animate-in fade-in">RAMOS<span className="text-white text-base font-normal">.ADMIN</span></h1>
          ) : (
            <span className="text-2xl font-black text-yellow-400">R</span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                location.pathname === item.path 
                  ? 'bg-yellow-400 text-black font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]' 
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${location.pathname === item.path ? 'text-black' : ''}`} />
              
              {(!isDesktop || isSidebarOpen) && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}

              {isDesktop && !isSidebarOpen && (
                <div className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-gray-700">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 shrink-0">
           <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-900 transition-all justify-start">
              <LogOut className="w-5 h-5 shrink-0" />
              {(!isDesktop || isSidebarOpen) && <span className="font-bold whitespace-nowrap">Cerrar Sesión</span>}
           </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen w-full relative">
        {/* Topbar */}
        <header className="h-20 bg-white border-b-4 border-black px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setSidebarOpen(!isSidebarOpen)} 
               className="p-2 hover:bg-gray-100 rounded-lg border-2 border-transparent hover:border-black transition-all active:scale-95"
             >
                <Menu className="w-6 h-6" />
             </button>
             
             <h2 className="text-xl font-bold uppercase tracking-widest hidden sm:block">
               {currentItem.label}
             </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 relative hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-200">
              <div className="text-right hidden md:block leading-tight">
                <p className="font-bold text-sm">Daniel R.</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Admin</p>
              </div>
              <div className="w-9 h-9 bg-blue-500 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-y-1 hover:shadow-none transition-all"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 relative scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
