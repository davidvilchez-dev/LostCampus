import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, MapPin, Tag, ChevronLeft, ChevronRight, ImageOff, User, Edit2, Trash2, Loader2, Sparkles, FileText } from 'lucide-react';
import { getReportById, deleteReport, getSuggestedMatches, type Reporte, type MatchResponse } from '../api/reportService';
import { createClaim, getSentClaims } from '../api/claimService';
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
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Estados de reclamación (HU-19, HU-21)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');

  useEffect(() => {
    async function loadReport() {
      if (!id) return;
      setIsLoading(true);
      setMatches([]);
      try {
        const data = await getReportById(Number(id));
        setReport(data);

        // Cargar coincidencias si el usuario es el dueño
        if (user && data.autor_id === user.id) {
          setIsLoadingMatches(true);
          try {
            const matchesData = await getSuggestedMatches(data.id);
            setMatches(matchesData);
          } catch (mErr) {
            console.error('Error al cargar coincidencias sugeridas:', mErr);
          } finally {
            setIsLoadingMatches(false);
          }
        }

        // Chequear si el usuario ya reclamó este reporte (HU-19)
        if (user && data.autor_id !== user.id && data.tipo === 'ENCONTRADO' && data.estado === 'ACTIVO') {
          try {
            const sentClaims = await getSentClaims();
            const existingClaim = sentClaims.find(c => c.reporte_id === data.id);
            if (existingClaim) {
              setHasClaimed(true);
              setClaimStatus(existingClaim.estado);
            }
          } catch (cErr) {
            console.error('Error al verificar solicitudes de reclamación:', cErr);
          }
        }
      } catch (err: any) {
        toast.error('No se pudo cargar el detalle del reporte o no existe.');
        navigate('/feed');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [id, navigate, user]);

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

  const handleSubmitClaim = async () => {
    if (!report || claimMessage.trim().length < 10) return;
    setIsSubmittingClaim(true);
    try {
      await createClaim(report.id, claimMessage);
      toast.success('Solicitud de reclamación enviada con éxito.');
      setHasClaimed(true);
      setClaimStatus('PENDIENTE');
      setIsClaimModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'No se pudo enviar la solicitud de reclamación.');
    } finally {
      setIsSubmittingClaim(false);
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
                  className={`px-3.5 py-1 text-xs font-bold rounded-full border tracking-wide uppercase shadow-md ${
                    isPerdido
                      ? 'bg-red-500 text-white border-red-600/20'
                      : 'bg-emerald-600 text-white border-emerald-700/20'
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${isPerdido ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
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

          {/* Botón de Reclamación para otros usuarios (HU-19, HU-21) */}
          {user && !isOwner && report.tipo === 'ENCONTRADO' && report.estado === 'ACTIVO' && (
            <div className="border-t border-brand-border-dark/60 pt-5 mt-4">
              {hasClaimed ? (
                <div className="w-full bg-[#101726]/50 border border-brand-border-dark text-amber-400 font-bold py-3 px-4 rounded-xl text-xs text-center flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                  Reclamado ({claimStatus === 'PENDIENTE' ? 'Pendiente de revisión' : claimStatus})
                </div>
              ) : (
                <button
                  onClick={() => setIsClaimModalOpen(true)}
                  className="w-full bg-brand-accent hover:bg-brand-accent-hover text-brand-text font-bold py-3 px-4 rounded-xl text-xs transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-brand-accent/10 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4.5 h-4.5" />
                  Reclamar Propiedad
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Sección de Coincidencias Sugeridas (Solo visible para el propietario) */}
      {isOwner && (
        <div className="bg-brand-bg-dark/80 border border-brand-border-dark/65 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3 border-b border-brand-border-dark/60 pb-4">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-lg md:text-xl font-bold text-brand-text">Coincidencias Sugeridas por IA</h2>
            <span className="text-xxs font-medium px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              Beta Híbrido
            </span>
          </div>

          {isLoadingMatches ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-brand-muted bg-[#101726]/20 border border-dashed border-brand-border-dark/50 rounded-2xl p-6">
              <p className="text-sm font-medium">No se han detectado coincidencias automáticas en este momento.</p>
              <p className="text-xs text-brand-muted/70 mt-1">El sistema sigue buscando reportes cruzados que coincidan con tu publicación.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => navigate(`/reporte/${match.id}`)}
                  className="flex items-center space-x-4 bg-[#101726]/40 hover:bg-[#101726]/75 border border-brand-border-dark/60 hover:border-brand-accent/50 p-4 rounded-2xl transition-all cursor-pointer group shadow-sm"
                >
                  {/* Foto de portada */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-border-dark/40 shrink-0 border border-brand-border-dark/50">
                    {match.imagenes_urls && match.imagenes_urls.length > 0 ? (
                      <img
                        src={match.imagenes_urls[0]}
                        alt={match.nombre_objeto}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted/50 bg-brand-border-dark/20">
                        <ImageOff className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        match.tipo === 'PERDIDO' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {match.tipo === 'PERDIDO' ? 'Objeto Perdido' : 'Objeto Encontrado'}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0">
                        {match.score}% match
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-brand-text truncate group-hover:text-brand-accent transition-colors">
                      {match.nombre_objeto}
                    </h3>

                    <div className="flex items-center text-xxs text-brand-muted space-x-3">
                      <span className="flex items-center truncate">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        {match.lugar}
                      </span>
                      <span className="flex items-center shrink-0">
                        <Calendar className="w-3 h-3 mr-1" />
                        {match.fecha_incidente}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal para enviar reclamación (HU-19, HU-21) */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !isSubmittingClaim && setIsClaimModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-[#0d1322] border border-brand-border-dark/85 rounded-3xl shadow-2xl p-6 md:p-8 z-10 animate-slide-in-left space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-brand-text flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-accent" />
                Reclamar propiedad del objeto
              </h3>
              <p className="text-xxs text-brand-muted text-left">
                Por favor, describe detalladamente características específicas del objeto (ej. marcas particulares, pegatinas, llaveros, contenido interno, número de serie) para demostrar al hallador que te pertenece.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xxs font-black text-brand-muted uppercase tracking-wider">
                  Mensaje de evidencia (mínimo 10 caracteres)
                </label>
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  rows={4}
                  placeholder="Ej: La mochila tiene una mancha de pintura azul en la base y adentro lleva mi cuaderno de cálculo con mi nombre escrito..."
                  className="w-full bg-[#101726]/40 border border-brand-border-dark hover:border-brand-accent/35 focus:border-brand-accent focus:outline-none p-3.5 rounded-xl text-xs text-brand-text placeholder-brand-muted/50 leading-relaxed resize-none transition-colors"
                />
                <div className="flex justify-between items-center text-xxs text-brand-muted">
                  <span>Mínimo 10 caracteres</span>
                  <span className={claimMessage.trim().length >= 10 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {claimMessage.trim().length} caracteres
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsClaimModalOpen(false)}
                disabled={isSubmittingClaim}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-brand-text text-xs font-bold rounded-xl border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={isSubmittingClaim || claimMessage.trim().length < 10}
                className="px-5 py-2 bg-brand-accent hover:bg-brand-accent-hover text-brand-text text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1.5"
              >
                {isSubmittingClaim ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <span>Enviar Solicitud</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
