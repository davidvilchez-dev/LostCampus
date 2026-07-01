import { MapPin, Clock, Laptop, BookOpen, Key, Shirt, HelpCircle } from 'lucide-react';
import { Link } from 'react-router';

export interface Report {
  id: number;
  nombre_objeto: string;
  descripcion: string;
  categoria_nombre: string;
  categoria_icono: string | null;
  tipo: 'PERDIDO' | 'ENCONTRADO';
  lugar: string;
  fecha_incidente: string;
  imagenes_urls: string[];
}

interface ReportCardProps {
  report: Report;
}

// Retorna el ícono correspondiente según el nombre de la categoría
const getCategoryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('electrónica') || cat.includes('electronica')) {
    return <Laptop className="w-4 h-4 shrink-0" />;
  }
  if (cat.includes('estudio') || cat.includes('libro') || cat.includes('cuaderno') || cat.includes('documento')) {
    return <BookOpen className="w-4 h-4 shrink-0" />;
  }
  if (cat.includes('personal') || cat.includes('llave') || cat.includes('accesorio') || cat.includes('billetera')) {
    return <Key className="w-4 h-4 shrink-0" />;
  }
  if (cat.includes('ropa') || cat.includes('vestimenta') || cat.includes('mochila')) {
    return <Shirt className="w-4 h-4 shrink-0" />;
  }
  return <HelpCircle className="w-4 h-4 shrink-0" />;
};

export default function ReportCard({ report }: ReportCardProps) {
  const isPerdido = report.tipo === 'PERDIDO';
  const firstImageUrl = report.imagenes_urls && report.imagenes_urls.length > 0 ? report.imagenes_urls[0] : undefined;

  return (
    <Link
      to={`/reporte/${report.id}`}
      className="group rounded-2xl bg-brand-card border border-brand-border-dark overflow-hidden flex flex-col hover:border-brand-accent/40 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all duration-300 transform hover:-translate-y-1"
    >
      
      {/* Contenedor de Imagen o Placeholder */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-bg select-none">
        
        {/* Etiqueta flotante */}
        <span
          className={`absolute top-4 left-4 z-10 px-3 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase ${
            isPerdido
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-green-500/10 text-green-400 border-green-500/20'
          }`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isPerdido ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></span>
          {isPerdido ? 'Perdido' : 'Encontrado'}
        </span>

        {firstImageUrl ? (
          <img
            src={firstImageUrl}
            alt={report.nombre_objeto}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          /* Placeholder elegante con degradado si no tiene foto */
          <div className="w-full h-full bg-linear-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)]"></div>
            <div className="text-brand-muted/20 group-hover:scale-110 transition-transform duration-500">
              {getCategoryIcon(report.categoria_nombre)}
            </div>
          </div>
        )}
      </div>

      {/* Detalles del Objeto */}
      <div className="p-5 flex flex-col flex-1">
        {/* Nombre del objeto */}
        <h3 className="text-base font-bold text-brand-text line-clamp-1 group-hover:text-brand-accent transition-colors duration-200">
          {report.nombre_objeto}
        </h3>

        {/* Categoría */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-brand-muted mt-1.5">
          {getCategoryIcon(report.categoria_nombre)}
          <span className="capitalize">{report.categoria_nombre}</span>
        </div>

        {/* Separador */}
        <div className="h-px bg-brand-border-dark/50 my-4"></div>

        {/* Ubicación y fecha */}
        <div className="space-y-2 mt-auto">
          {/* Ubicación */}
          <div className="flex items-center space-x-2 text-xs text-brand-muted">
            <MapPin className="w-4 h-4 text-brand-accent/70 shrink-0" />
            <span className="line-clamp-1">{report.lugar}</span>
          </div>

          {/* Fecha */}
          <div className="flex items-center space-x-2 text-xs text-brand-muted">
            <Clock className="w-4 h-4 text-brand-muted/70 shrink-0" />
            <span>{report.fecha_incidente}</span>
          </div>
        </div>
      </div>

    </Link>
  );
}
