import { MapPin, Clock, Laptop, BookOpen, Key, Shirt, HelpCircle, Edit2, Check, Trash2 } from 'lucide-react';

export interface MyReport {
  id: number;
  nombre_objeto: string;
  descripcion: string;
  categoria_nombre: string;
  categoria_icono: string | null;
  tipo: 'PERDIDO' | 'ENCONTRADO';
  lugar: string;
  fecha_incidente: string;
  imagenes_urls: string[];
  estado: 'ACTIVO' | 'COINCIDENCIA' | 'CERRADO';
  motivo_cierre?: string;
}

interface MyReportCardProps {
  report: MyReport;
  onEdit: (id: number) => void;
  onResolve: (id: number) => void;
  onDelete: (id: number) => void;
}

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

export default function MyReportCard({ report, onEdit, onResolve, onDelete }: MyReportCardProps) {
  const isPerdido = report.tipo === 'PERDIDO';
  const isCerrado = report.estado === 'CERRADO';
  const isCoincidencia = report.estado === 'COINCIDENCIA';
  const firstImageUrl = report.imagenes_urls && report.imagenes_urls.length > 0 ? report.imagenes_urls[0] : undefined;

  return (
    <div
      className={`group rounded-2xl bg-brand-card border border-brand-border-dark overflow-hidden flex flex-col transition-all duration-300 ${
        isCerrado
          ? 'opacity-65 border-brand-border-dark/40 shadow-none'
          : 'hover:border-brand-accent/40 hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] hover:-translate-y-1 transform'
      }`}
    >
      {/* Contenedor de Imagen */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-bg select-none">
        {/* Etiqueta de Tipo (Perdido/Encontrado) */}
        <span
          className={`absolute top-4 left-4 z-10 px-3 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase ${
            isPerdido
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-green-500/10 text-green-400 border-green-500/20'
          }`}
        >
          {isPerdido ? 'Perdido' : 'Encontrado'}
        </span>

        {/* Etiqueta de Estado */}
        <span
          className={`absolute top-4 right-4 z-10 px-2.5 py-0.5 text-xs font-bold rounded-md tracking-wide uppercase shadow-md ${
            isCerrado
              ? 'bg-brand-border-light text-brand-muted'
              : isCoincidencia
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-blue-500/25 text-blue-400 border border-blue-500/30'
          }`}
        >
          {isCerrado ? 'Cerrado' : isCoincidencia ? 'Coincidencia Detectada' : 'Activo'}
        </span>

        {firstImageUrl ? (
          <img
            src={firstImageUrl}
            alt={report.nombre_objeto}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-brand-bg-dark to-brand-bg flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)]"></div>
            <div className="text-brand-muted/20 group-hover:scale-110 transition-transform duration-500">
              {getCategoryIcon(report.categoria_nombre)}
            </div>
          </div>
        )}
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-brand-text line-clamp-1">{report.nombre_objeto}</h3>

        <div className="flex items-center space-x-2 text-xs font-semibold text-brand-muted mt-1">
          {getCategoryIcon(report.categoria_nombre)}
          <span className="capitalize">{report.categoria_nombre}</span>
        </div>

        <p className="text-xs text-brand-muted/80 mt-3 line-clamp-2">
          {isCerrado && report.motivo_cierre ? (
            <span className="italic text-brand-muted/60">{report.motivo_cierre}</span>
          ) : (
            report.descripcion
          )}
        </p>

        <div className="h-px bg-brand-border-dark/50 my-4"></div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-xs text-brand-muted">
            <MapPin className="w-4 h-4 text-brand-accent/70 shrink-0" />
            <span className="line-clamp-1">{report.lugar}</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-brand-muted">
            <Clock className="w-4 h-4 text-brand-muted/70 shrink-0" />
            <span>{report.fecha_incidente}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-auto pt-2 flex items-center justify-end gap-2">
          {isCerrado ? (
            <button
              onClick={() => onDelete(report.id)}
              className="w-full text-xs font-semibold text-brand-muted hover:text-red-400 bg-brand-border-dark/30 hover:bg-red-500/10 py-2 px-3 rounded-lg border border-brand-border-dark/60 hover:border-red-500/20 transition-all duration-200"
            >
              Eliminar historial
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(report.id)}
                title="Editar reporte"
                className="p-2 bg-brand-border-dark/50 hover:bg-brand-border-light text-brand-muted hover:text-brand-text rounded-lg border border-brand-border-dark/60 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onResolve(report.id)}
                title="Marcar como resuelto / Encontrado"
                className="p-2 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent rounded-lg border border-brand-accent/20 hover:border-brand-accent/30 transition-colors"
              >
                <Check className="w-4 h-4 font-bold" />
              </button>
              {!isCoincidencia && (
                <button
                  onClick={() => onDelete(report.id)}
                  title="Eliminar reporte"
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:border-red-500/30 transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
