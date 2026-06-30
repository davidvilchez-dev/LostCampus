import { Link } from 'react-router';
import heroIllustration from '../assets/hero-illustration.png';

export default function Hero() {
  return (
    <section className="relative w-full py-12 md:py-20 px-6 overflow-hidden">
      
      {/* Resplandor radial de fondo decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-glow-radial pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* COLUMNA IZQUIERDA: Textos y Acciones */}
        <div className="flex flex-col space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-text leading-tight">
            ¿Perdiste algo en la <span className="text-brand-accent">universidad</span>?
          </h1>
          
          <p className="text-brand-muted text-lg sm:text-xl font-normal max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Publica reportes de objetos perdidos o encontrados y ayuda a que vuelvan a sus dueños.
          </p>
          
          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/register"
              className="glow-btn-primary w-full sm:w-auto px-8 py-3.5 text-center text-brand-text font-semibold rounded-xl text-base shadow-lg cursor-pointer"
            >
              Registrarme
            </Link>
            <Link
              to="/login"
              className="glow-btn-secondary w-full sm:w-auto px-8 py-3.5 text-center text-brand-text font-semibold rounded-xl text-base cursor-pointer"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* COLUMNA DERECHA: Ilustración Premium Animada */}
        <div className="flex justify-center items-center lg:justify-end">
          <div className="relative w-full max-w-[550px] sm:max-w-[620px] float-anim">
            {/* Efecto de sombra difuminada detrás de la ilustración basado en color de acento */}
            <div className="absolute inset-0 bg-brand-accent/10 rounded-full filter blur-3xl opacity-60 pointer-events-none"></div>
            
            <img
              src={heroIllustration}
              alt="Mochila, llaves y objetos perdidos en la universidad"
              className="w-full h-auto object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(59,130,246,0.25)]"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
