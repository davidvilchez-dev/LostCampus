import { FileSpreadsheet, MapPin, Sparkles, MessageSquare } from 'lucide-react';

export default function Features() {
  const items = [
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-brand-accent" />,
      title: 'Publica reportes rápidamente',
      desc: 'Crea tu reporte en segundos.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-brand-accent" />,
      title: 'Encuentra objetos perdidos',
      desc: 'Busca entre reportes recientes.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-brand-accent" />,
      title: 'Coincidencias automáticas',
      desc: 'Recibe sugerencias de posibles coincidencias.',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-brand-accent" />,
      title: 'Todo en un solo lugar',
      desc: 'Gestiona tus reportes y comunicaciones.',
    },
  ];

  return (
    <section id="como-funciona" className="w-full py-16 px-6 relative z-10 scroll-mt-20">
      <div className="max-w-7xl mx-auto flex flex-col space-y-12">
        
        {/* Título de la sección */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            ¿Por qué usar LostCampus?
          </h2>
          <div className="w-16 h-1 bg-brand-accent mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Rejilla de Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="glass-card-interactive p-6 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 cursor-default border border-brand-border-dark"
            >
              {/* Icono encapsulado en círculo azul de acento traslúcido */}
              <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                {item.icon}
              </div>
              
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-bold text-brand-text tracking-wide">
                  {item.title}
                </h3>
                <p className="text-brand-muted text-sm font-normal leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
