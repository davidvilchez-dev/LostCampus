import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, MapPin, Tag, ChevronLeft, ChevronRight, ImageOff, User, Edit2, Trash2, Loader2 } from 'lucide-react';
import { getReportById, deleteReport, type Reporte } from '../api/reportService';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [report, setReport] = useState<Reporte | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getReportById(Number(id));
        setReport(data);
      } catch (err: any) {
        toast.error('No se pudo cargar el detalle del reporte o no existe.');
        navigate('/feed');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <svg className="animate-spin h-10 w-10 text-brand-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!report) return null;

  const isPerdido = report.tipo === 'PERDIDO';
  const isRecuperado = report.estado === 'CERRADO';
  const hasImages = report.imagenes_urls && report.imagenes_urls.length > 0;

  const nextSlide = () => {
    if (!hasImages) return;
    setActiveSlide((prev) => (prev + 1) % report.imagenes_urls.length);
  };

  const prevSlide = () => {
    if (!hasImages) return;
    setActiveSlide((prev) => (prev - 1 + report.imagenes_urls.length) % report.imagenes_urls.length);
  };

  const isOwner = user && report && user.id === report.autor_id;

  const handleEdit = () => {
    navigate(`/reporte/${id}/editar`);
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el reporte "${report.nombre_objeto}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteReport(report.id);
      toast.success('Reporte eliminado con éxito.');
      navigate('/mis-reportes');
    } catch (err: any) {
      toast.error('No se pudo eliminar el reporte.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Botón de Regreso */}
      <button
        onClick={() => navigate('/feed')}
        className="flex items-center space-x-2 text-brand-muted hover:text-brand-text text-sm font-semibold transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al feed</span>
      </button>

      {/* Tarjeta de Detalle */}
      <div className="bg-brand-card/95 border border-brand-border-dark rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        
        {/* Columna Izquierda: Galería/Carrusel de Fotos */}
        <div className="flex flex-col space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-brand-bg border border-brand-border-dark/65 flex items-center justify-center select-none group">
            
            {hasImages ? (
              <>
                <img
                  src={report.imagenes_urls[activeSlide]}
                  alt={`${report.nombre_objeto} - ${activeSlide + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300"
                />

                {/* Controles de navegación */}
                {report.imagenes_urls.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand-bg/80 border border-brand-border-dark hover:border-brand-accent/50 text-brand-text flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand-bg/80 border border-brand-border-dark hover:border-brand-accent/50 text-brand-text flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Indicadores numéricos */}
                    <span className="absolute bottom-4 right-4 bg-brand-bg/85 border border-brand-border-dark px-2.5 py-1 rounded-lg text-xxs font-bold text-brand-text tracking-wide shadow-md">
                      {activeSlide + 1} / {report.imagenes_urls.length}
                    </span>
                  </>
                )}
              </>
            ) : (
              /* Placeholder elegante de sin imágenes */
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-brand-border-dark/50 flex items-center justify-center text-brand-muted/40">
                  <ImageOff className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold text-brand-muted/65">
                  Sin imágenes registradas
                </span>
              </div>
            )}

          </div>

          {/* Miniaturas de la Galería */}
          {hasImages && report.imagenes_urls.length > 1 && (
            <div className="flex items-center gap-2 justify-center">
              {report.imagenes_urls.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeSlide === index
                      ? 'border-brand-accent scale-105 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                      : 'border-brand-border-dark/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles del Reporte */}
        <div className="flex flex-col justify-between space-y-6">
          
          {/* Bloque Superior: Categoría y Estados */}
          <div className="space-y-4">
            
            <div className="flex justify-between items-start gap-4 w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Tipo de Reporte */}
                <span
                  className={`px-3.5 py-1 text-xs font-bold rounded-full border tracking-wide uppercase ${
                    isPerdido
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${isPerdido ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></span>
                  {isPerdido ? 'Objeto Perdido' : 'Objeto Encontrado'}
                </span>

                {/* Estado de Recuperado */}
                {isRecuperado && (
                  <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wide uppercase animate-pulse">
                    Recuperado
                  </span>
                )}
              </div>

              {/* Acciones de Propietario */}
              {isOwner && !isRecuperado && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleEdit}
                    title="Editar reporte"
                    className="p-2 bg-brand-border-dark/50 hover:bg-brand-border-light text-brand-muted hover:text-brand-text rounded-xl border border-brand-border-dark/60 transition-all cursor-pointer shadow-md hover:scale-105"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    title="Eliminar reporte"
                    disabled={isDeleting}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer shadow-md hover:scale-105 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-brand-text leading-tight">
              {report.nombre_objeto}
            </h1>

            {/* Categoría */}
            <div className="flex items-center space-x-2 text-sm font-semibold text-brand-muted">
              <Tag className="w-4 h-4 text-brand-accent/70 shrink-0" />
              <span className="capitalize">{report.categoria_nombre}</span>
            </div>

            {/* Separador */}
            <div className="h-px bg-brand-border-dark/60"></div>

            {/* Ubicación y Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4.5 h-4.5 text-brand-accent/70 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xxs font-bold text-brand-muted/50 uppercase tracking-wider">Lugar del Incidente</p>
                  <p className="text-xs font-semibold text-brand-text mt-0.5">{report.lugar}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Calendar className="w-4.5 h-4.5 text-brand-muted shrink-0 mt-0.5" />
                <div>
                  <p className="text-xxs font-bold text-brand-muted/50 uppercase tracking-wider">Fecha del Incidente</p>
                  <p className="text-xs font-semibold text-brand-text mt-0.5">{report.fecha_incidente}</p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <p className="text-xxs font-bold text-brand-muted/50 uppercase tracking-wider">Descripción del Objeto</p>
              <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-wrap bg-[#101726]/40 border border-brand-border-dark/45 p-4 rounded-xl">
                {report.descripcion || 'Sin descripción detallada proporcionada.'}
              </p>
            </div>

          </div>

          {/* Bloque Inferior: Autor de la Publicación */}
          <div className="border-t border-brand-border-dark/60 pt-5 space-y-3 mt-auto">
            <p className="text-xxs font-bold text-brand-muted/50 uppercase tracking-wider">Publicado por</p>
            <div className="flex items-center space-x-3.5 bg-[#101726]/30 border border-brand-border-dark/40 p-3 rounded-2xl">
              
              {/* Foto de Perfil */}
              {report.autor_foto_url ? (
                <img
                  src={report.autor_foto_url}
                  alt={report.autor_nombre}
                  className="w-10 h-10 rounded-full object-cover border border-brand-border-dark"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-border-dark flex items-center justify-center text-brand-muted/65">
                  <User className="w-5 h-5" />
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-brand-text">{report.autor_nombre}</p>
                <p className="text-xxs font-medium text-brand-muted">Comunidad UNSCH</p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
