import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="glass-panel sticky top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO: Ícono LC + texto LostCampus */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <Logo className="w-9 h-9 transition-transform duration-300 group-hover:scale-105" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-brand-text">Lost</span>
            <span className="text-brand-accent">Campus</span>
          </span>
        </Link>

        {/* MENÚ ESCRITORIO */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-brand-muted hover:text-brand-text font-medium transition-colors duration-200 cursor-pointer"
          >
            Inicio
          </button>
          <button
            onClick={() => handleScroll('como-funciona')}
            className="text-brand-muted hover:text-brand-text font-medium transition-colors duration-200 cursor-pointer"
          >
            ¿Cómo funciona?
          </button>
          <button
            onClick={() => handleScroll('contacto')}
            className="text-brand-muted hover:text-brand-text font-medium transition-colors duration-200 cursor-pointer"
          >
            Contacto
          </button>
        </div>

        {/* BOTÓN INICIAR SESIÓN ESCRITORIO */}
        <div className="hidden md:block">
          <Link
            to="/login"
            className="glow-btn-primary px-6 py-2.5 text-brand-text font-medium rounded-lg text-sm"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* BOTÓN MENÚ MÓVIL */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-brand-muted hover:text-brand-text focus:outline-none cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-brand-border-dark/60 flex flex-col space-y-4">
          <button
            onClick={() => {
              setIsOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-brand-muted hover:text-brand-text font-medium text-left px-2 py-1.5 transition-colors duration-200"
          >
            Inicio
          </button>
          <button
            onClick={() => handleScroll('como-funciona')}
            className="text-brand-muted hover:text-brand-text font-medium text-left px-2 py-1.5 transition-colors duration-200"
          >
            ¿Cómo funciona?
          </button>
          <button
            onClick={() => handleScroll('contacto')}
            className="text-brand-muted hover:text-brand-text font-medium text-left px-2 py-1.5 transition-colors duration-200"
          >
            Contacto
          </button>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="glow-btn-primary w-full py-3 text-center text-brand-text font-medium rounded-lg block text-sm"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}
