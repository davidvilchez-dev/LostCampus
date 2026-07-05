import { NavLink, useNavigate } from 'react-router';
import {
  Home,
  PlusCircle,
  Folder,
  GitMerge,
  FileText,
  MessageSquare,
  Shield,
  User,
  LogOut,
} from 'lucide-react';
import Logo from './Logo';
import useAuthStore from '../store/authStore';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/feed', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { to: '/reportar', label: 'Crear reporte', icon: <PlusCircle className="w-5 h-5" /> },
    { to: '/mis-reportes', label: 'Mis reportes', icon: <Folder className="w-5 h-5" /> },
    { to: '/coincidencias', label: 'Coincidencias', icon: <GitMerge className="w-5 h-5" /> },
    { to: '/solicitudes', label: 'Solicitudes', icon: <FileText className="w-5 h-5" /> },
    { to: '/mensajes', label: 'Mensajes', icon: <MessageSquare className="w-5 h-5" /> },
    ...(user?.es_admin ? [{ to: '/admin', label: 'Panel de Administración', icon: <Shield className="w-5 h-5" /> }] : []),
  ];

  return (
    <aside className="w-68 h-screen bg-[#0d1729] border-r border-brand-border-dark flex flex-col py-6 select-none">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center space-x-2.5">
        <Logo className="w-8 h-8" />
        <span className="text-lg font-bold tracking-tight">
          <span className="text-brand-text">Lost</span>
          <span className="text-brand-accent">Campus</span>
        </span>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-accent/10 text-brand-text border-l-3 border-brand-accent pl-3'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-card-hover/40'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Divisor */}
      <div className="h-px bg-brand-border-dark mx-4 my-4"></div>

      {/* Opciones del Pie */}
      <div className="px-4 space-y-1">
        <NavLink
          to="/perfil"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-brand-accent/10 text-brand-text border-l-3 border-brand-accent pl-3'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-card-hover/40'
            }`
          }
        >
          <User className="w-5 h-5 shrink-0" />
          <span>Perfil</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
