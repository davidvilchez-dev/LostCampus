import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Check, BellOff } from 'lucide-react';
import type { Notificacion } from '../api/notificationService';

interface NotificationBellProps {
  notifications: Notificacion[];
  unreadCount: number;
  onMarkAsRead: (id: number, enlace: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formatear tiempo relativo simple
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Ayer';
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  const handleNotificationClick = (notif: Notificacion) => {
    setIsOpen(false);
    onMarkAsRead(notif.id, notif.enlace);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-brand-bg-dark/60 hover:bg-brand-border-dark/60 rounded-xl border border-brand-border-dark/30 hover:border-brand-border-dark/60 text-brand-text-muted hover:text-brand-text transition-all duration-300 cursor-pointer"
        aria-label="Notificaciones"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-swing' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 px-1 py-0.5 text-[9px] font-black bg-red-500 text-white rounded-full flex items-center justify-center min-w-4 h-4 border border-[#0d0e12] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-brand-bg-dark/95 backdrop-blur-xl border border-brand-border-dark/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
          {/* Cabecera */}
          <div className="p-4 border-b border-brand-border-dark/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-brand-text">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xxs font-black bg-brand-accent/20 text-brand-accent rounded-full border border-brand-accent/30">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onMarkAllAsRead();
                  setIsOpen(false);
                }}
                className="text-xxs font-black text-brand-accent hover:text-brand-accent-hover transition-all cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Listado */}
          <div className="max-h-96 overflow-y-auto divide-y divide-brand-border-dark/20 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 hover:bg-brand-border-dark/20 transition-all cursor-pointer flex gap-3 ${
                    !notif.leido ? 'bg-brand-accent/5 hover:bg-brand-accent/10' : ''
                  }`}
                >
                  {/* Indicador de no leído */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        !notif.leido ? 'bg-brand-accent animate-pulse' : 'bg-transparent'
                      }`}
                    />
                  </div>

                  {/* Cuerpo */}
                  <div className="flex-grow min-w-0">
                    <p className={`text-xs text-brand-text truncate ${!notif.leido ? 'font-bold' : ''}`}>
                      {notif.titulo}
                    </p>
                    <p className="text-xxs text-brand-text-muted mt-1 leading-relaxed">
                      {notif.mensaje}
                    </p>
                    <p className="text-[10px] text-brand-accent-hover/80 mt-2 font-medium">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-4 bg-brand-bg-dark/40 border border-brand-border-dark/30 rounded-full text-brand-text-muted">
                  <BellOff className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-text-muted">No hay notificaciones</p>
                  <p className="text-xxs text-brand-text-muted/60 mt-1">
                    Te avisaremos cuando ocurra algo importante.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer (Ver todo) */}
          <div className="p-3 bg-brand-bg-dark/30 border-t border-brand-border-dark/30 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/solicitudes'); // Redirección por defecto
              }}
              className="text-xxs font-black text-brand-text-muted hover:text-brand-text transition-all cursor-pointer"
            >
              Ver todas mis solicitudes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
