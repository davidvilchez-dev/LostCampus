import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { Bell, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Redirigir al login si el usuario no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Evitar parpadeos mientras redirige
  }

  // Obtener iniciales para el avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg text-brand-text">
      
      {/* SIDEBAR ESCRITORIO */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* SIDEBAR MÓVIL DESPLEGABLE */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop/Fondo oscuro traslúcido */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          {/* Contenedor del Sidebar deslizante */}
          <div className="relative flex w-full max-w-xs flex-col bg-[#0d1729] animate-slide-in-left">
            {/* Botón de cierre superior */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-16 border-b border-brand-border-dark flex items-center justify-between px-6 bg-[#0b1326]/60 backdrop-blur-md z-10 shrink-0">
          {/* Botón hamburguesa móvil */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden text-brand-muted hover:text-brand-text cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Espacio en desktop, botón en móvil */}
          <div className="hidden lg:block"></div>

          {/* Notificaciones y Perfil */}
          <div className="flex items-center space-x-5">
            {/* Botón de Campana */}
            <button className="relative p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-card-hover/40 transition-colors cursor-pointer">
              <Bell className="w-5.5 h-5.5" />
              {/* Indicador de notificación roja */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar del usuario */}
            <div className="flex items-center space-x-3">
              {user?.foto_url ? (
                <img
                  src={user.foto_url}
                  alt={user.nombre_completo}
                  className="w-9 h-9 rounded-full object-cover border border-brand-border-light"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent font-semibold text-xs select-none">
                  {user ? getInitials(user.nombre_completo) : 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
