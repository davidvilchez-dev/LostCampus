import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, type Notificacion } from '../api/notificationService';
import { Client } from '@stomp/stompjs';
import { toast } from 'react-toastify';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Redirigir al login si el usuario no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Cargar notificaciones iniciales y configurar WebSocket
  useEffect(() => {
    if (!isAuthenticated || !user || !token) return;

    const fetchInitialNotifications = async () => {
      try {
        const list = await getNotifications();
        setNotifications(list);
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (e) {
        console.error('Error al cargar notificaciones iniciales:', e);
      }
    };

    fetchInitialNotifications();

    const wsUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
      .replace('/api', '/ws-chat')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    const stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('WebSocket Connected to Notifications channel');
      stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
        try {
          const newNotif: Notificacion = JSON.parse(message.body);
          setNotifications((prev) => [newNotif, ...prev.slice(0, 14)]);
          setUnreadCount((c) => c + 1);

          // Mostrar alerta Toast en pantalla
          toast.info(
            <div className="cursor-pointer">
              <p className="font-bold text-xs">{newNotif.titulo}</p>
              <p className="text-xxs mt-0.5">{newNotif.mensaje}</p>
            </div>,
            {
              onClick: () => {
                handleMarkAsRead(newNotif.id, newNotif.enlace);
              }
            }
          );
        } catch (err) {
          console.error('Error parsing notification message', err);
        }
      });
    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [isAuthenticated, user, token]);

  const handleMarkAsRead = async (id: number, enlace: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      navigate(enlace);
    } catch (e) {
      console.error('Error marking notification as read', e);
      navigate(enlace);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marking all notifications as read', e);
    }
  };

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
            {/* Notificaciones Bell */}
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />

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
