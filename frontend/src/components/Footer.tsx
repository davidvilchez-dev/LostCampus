import { Mail, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="w-full relative mt-auto scroll-mt-20">
      {/* Línea superior con efecto de degradado azul */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-brand-accent/50 to-transparent"></div>

      <div className="bg-linear-to-b from-brand-bg-dark to-brand-bg py-14 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Grid principal del footer */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">

            {/* COLUMNA 1: Logo, descripción e info de contacto */}
            <div className="md:col-span-5 flex flex-col space-y-5">
              <div className="flex items-center space-x-2.5">
                <Logo className="w-8 h-8" />
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-brand-text">Lost</span>
                  <span className="text-brand-accent">Campus</span>
                </span>
              </div>
              <p className="text-brand-muted text-sm leading-relaxed max-w-sm">
                La plataforma oficial de gestión de objetos perdidos y encontrados para la comunidad universitaria de la UNSCH.
              </p>

              {/* Info de contacto */}
              <div className="flex flex-col space-y-2.5 pt-1">
                <a
                  href="mailto:soporte@lostcampus.edu.pe"
                  className="flex items-center space-x-2.5 text-brand-muted hover:text-brand-accent transition-colors duration-200 text-sm group"
                >
                  <Mail className="w-4 h-4 text-brand-accent/70 group-hover:text-brand-accent transition-colors" />
                  <span>soporte@lostcampus.edu.pe</span>
                </a>
                <div className="flex items-center space-x-2.5 text-brand-muted text-sm">
                  <MapPin className="w-4 h-4 text-brand-accent/70 shrink-0" />
                  <span>UNSCH — Ayacucho, Perú</span>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: Enlaces rápidos */}
            <div className="md:col-span-3 flex flex-col space-y-4">
              <h4 className="text-brand-text font-semibold text-sm tracking-wide uppercase">
                Navegación
              </h4>
              <div className="flex flex-col space-y-2.5">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-brand-muted hover:text-brand-text text-sm transition-colors duration-200 text-left cursor-pointer"
                >
                  Inicio
                </button>
                <button
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-brand-muted hover:text-brand-text text-sm transition-colors duration-200 text-left cursor-pointer"
                >
                  ¿Cómo funciona?
                </button>
                <Link to="/login" className="text-brand-muted hover:text-brand-text text-sm transition-colors duration-200">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="text-brand-muted hover:text-brand-text text-sm transition-colors duration-200">
                  Registrarme
                </Link>
              </div>
            </div>

            {/* COLUMNA 3: Redes sociales */}
            <div className="md:col-span-4 flex flex-col space-y-4">
              <h4 className="text-brand-text font-semibold text-sm tracking-wide uppercase">
                Síguenos
              </h4>
              <div className="flex flex-col space-y-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 text-brand-muted hover:text-brand-text transition-colors duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-card border border-brand-border-dark flex items-center justify-center group-hover:border-brand-accent/40 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all duration-300">
                    <svg className="w-4 h-4 fill-current text-brand-muted group-hover:text-brand-accent transition-colors" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Facebook</span>
                    <span className="text-xs text-brand-muted/60">@LostCampusUNSCH</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 text-brand-muted hover:text-brand-text transition-colors duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-card border border-brand-border-dark flex items-center justify-center group-hover:border-brand-accent/40 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all duration-300">
                    <svg className="w-4 h-4 stroke-current fill-none text-brand-muted group-hover:text-brand-accent transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Instagram</span>
                    <span className="text-xs text-brand-muted/60">@lostcampus_unsch</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 text-brand-muted hover:text-brand-text transition-colors duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-card border border-brand-border-dark flex items-center justify-center group-hover:border-brand-accent/40 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all duration-300">
                    <svg className="w-4 h-4 fill-current text-brand-muted group-hover:text-brand-accent transition-colors" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.53V6.83a4.84 4.84 0 0 1-1-.14z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">TikTok</span>
                    <span className="text-xs text-brand-muted/60">@lostcampus</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>
              </div>
            </div>
          </div>

          {/* Línea divisoria con degradado */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-brand-border-dark to-transparent mt-10 mb-6"></div>

          {/* BARRA INFERIOR: Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-brand-muted/60 text-xs text-center sm:text-left">
              &copy; {currentYear} LostCampus. Todos los derechos reservados.
            </p>
            <p className="text-brand-muted/40 text-xs text-center sm:text-right">
              Hecho con <span className="text-brand-accent">♥</span> para la comunidad UNSCH
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
