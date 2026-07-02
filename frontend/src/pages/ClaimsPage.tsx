import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  FileText, Loader2, ImageOff, MapPin, Calendar, 
  Check, X as XIcon, Info, Mail, Copy, AlertCircle, FileCheck 
} from 'lucide-react';
import { 
  getSentClaims, getReceivedClaims, acceptClaim, rejectClaim, type Reclamacion 
} from '../api/claimService';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';

export default function ClaimsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recibidas' | 'enviadas'>('recibidas');
  const [sentClaims, setSentClaims] = useState<Reclamacion[]>([]);
  const [receivedClaims, setReceivedClaims] = useState<Reclamacion[]>([]);

  // Modales de confirmación
  const [confirmAcceptId, setConfirmAcceptId] = useState<number | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadClaims() {
    setLoading(true);
    try {
      const [sent, received] = await Promise.all([
        getSentClaims(),
        getReceivedClaims()
      ]);
      setSentClaims(sent);
      setReceivedClaims(received);
    } catch (err: any) {
      toast.error('Error al cargar las solicitudes de reclamación.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  const handleAccept = async () => {
    if (!confirmAcceptId) return;
    setSubmitting(true);
    try {
      await acceptClaim(confirmAcceptId);
      toast.success('Solicitud aceptada. Se han intercambiado los datos de contacto.');
      setConfirmAcceptId(null);
      await loadClaims();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al aceptar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!confirmRejectId) return;
    setSubmitting(true);
    try {
      await rejectClaim(confirmRejectId);
      toast.info('Solicitud rechazada.');
      setConfirmRejectId(null);
      await loadClaims();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al rechazar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
      </div>
    );
  }

  const currentClaims = activeTab === 'recibidas' ? receivedClaims : sentClaims;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Cabecera */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-accent/10 text-brand-accent rounded-xl border border-brand-accent/20">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-text">Solicitudes de Reclamación</h1>
        </div>
        <p className="text-sm text-brand-muted max-w-2xl leading-relaxed">
          Administra las solicitudes recibidas sobre tus objetos encontrados o realiza el seguimiento de tus reclamaciones enviadas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border-dark/60">
        <button
          onClick={() => setActiveTab('recibidas')}
          className={`px-5 py-3.5 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
            activeTab === 'recibidas'
              ? 'border-brand-accent text-brand-text bg-brand-accent/5'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Solicitudes Recibidas ({receivedClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('enviadas')}
          className={`px-5 py-3.5 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
            activeTab === 'enviadas'
              ? 'border-brand-accent text-brand-text bg-brand-accent/5'
              : 'border-transparent text-brand-muted hover:text-brand-text'
          }`}
        >
          Solicitudes Enviadas ({sentClaims.length})
        </button>
      </div>

      {currentClaims.length === 0 ? (
        <div className="bg-brand-bg-dark border border-brand-border-dark/65 rounded-3xl p-10 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-brand-border-dark/30 rounded-full flex items-center justify-center mx-auto text-brand-muted/70">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-brand-text">No hay solicitudes</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              {activeTab === 'recibidas'
                ? 'Nadie ha enviado solicitudes de reclamación sobre tus reportes de objetos encontrados aún.'
                : 'Aún no has enviado ninguna solicitud de reclamación para objetos encontrados por otros usuarios.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {currentClaims.map((claim) => {
            const isReceived = activeTab === 'recibidas';
            const statusLabel = claim.estado;

            return (
              <div
                key={claim.id}
                className="bg-brand-bg-dark border border-brand-border-dark/65 rounded-3xl p-5 md:p-6 space-y-5 shadow-xl hover:border-brand-accent/20 transition-all duration-300"
              >
                {/* Header de la tarjeta */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border-dark/60 pb-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                      {isReceived ? `Reclamante: ${claim.reclamante_nombre}` : `Reportado por: ${claim.reporte_autor_nombre}`}
                    </span>
                    <h3 
                      onClick={() => navigate(`/reporte/${claim.reporte_id}`)}
                      className="text-sm font-black text-brand-text hover:text-brand-accent transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {claim.reporte_nombre_objeto}
                      <span className="text-xxs font-semibold bg-brand-border-dark/50 px-2 py-0.5 rounded text-brand-muted">
                        Ver publicación
                      </span>
                    </h3>
                  </div>

                  {/* Estado Badge */}
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 border ${
                    statusLabel === 'ACEPTADA'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : statusLabel === 'RECHAZADA'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Contenido Side-by-Side */}
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Foto de portada del reporte */}
                  <div className="w-full md:w-36 aspect-[16/10] md:h-24 rounded-2xl overflow-hidden bg-brand-border-dark/40 shrink-0 border border-brand-border-dark/50">
                    {claim.reporte_imagenes_urls && claim.reporte_imagenes_urls.length > 0 ? (
                      <img
                        src={claim.reporte_imagenes_urls[0]}
                        alt={claim.reporte_nombre_objeto}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted/40 bg-brand-border-dark/10">
                        <ImageOff className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Detalles del reporte y la evidencia */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xxs text-brand-muted">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-brand-muted/70 shrink-0" />
                        {claim.reporte_lugar}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-brand-muted/70 shrink-0" />
                        {claim.reporte_fecha_incidente}
                      </span>
                    </div>

                    {/* Mensaje de prueba de propiedad */}
                    <div className="bg-[#101726]/40 border border-brand-border-dark/60 rounded-2xl p-4 space-y-1.5">
                      <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-brand-accent/80" />
                        Mensaje de prueba de propiedad:
                      </span>
                      <p className="text-xs text-brand-text italic font-medium leading-relaxed">
                        "{claim.mensaje_prueba}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones de gestión para solicitudes Recibidas */}
                {isReceived && statusLabel === 'PENDIENTE' && (
                  <div className="flex justify-end items-center gap-3 border-t border-brand-border-dark/60 pt-4">
                    <button
                      onClick={() => setConfirmRejectId(claim.id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl border border-red-500/15 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <XIcon className="w-4 h-4" />
                      Rechazar Solicitud
                    </button>
                    <button
                      onClick={() => setConfirmAcceptId(claim.id)}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/15 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Aceptar y Entregar
                    </button>
                  </div>
                )}

                {/* Datos de contacto al Aceptar */}
                {statusLabel === 'ACEPTADA' && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 mt-1 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                          ¡Reclamación Concretada! Información de contacto:
                        </span>
                      </div>
                      <p className="text-xs text-brand-text font-bold flex items-center">
                        <span className="text-brand-muted font-normal w-16">Nombre:</span>
                        {isReceived ? claim.reclamante_nombre : claim.reporte_autor_nombre}
                      </p>
                      <p className="text-xs text-brand-text font-bold flex items-center">
                        <span className="text-brand-muted font-normal w-16">Correo:</span>
                        {isReceived ? claim.reclamante_email : claim.reporte_autor_email}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const emailToCopy = isReceived ? claim.reclamante_email : claim.reporte_autor_email;
                          navigator.clipboard.writeText(emailToCopy);
                          toast.success('Correo de contacto copiado.');
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-text rounded-xl border border-slate-700/80 transition-all cursor-pointer text-xxs font-black flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Correo
                      </button>
                      <a
                        href={`mailto:${isReceived ? claim.reclamante_email : claim.reporte_autor_email}?subject=LostCampus - Recuperación de objeto: ${claim.reporte_nombre_objeto}`}
                        className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer text-xxs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Enviar Correo
                      </a>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Accept Modal */}
      <ConfirmModal
        isOpen={confirmAcceptId !== null}
        onClose={() => setConfirmAcceptId(null)}
        onConfirm={handleAccept}
        title="Aceptar Reclamación"
        message="¿Estás seguro de aceptar esta reclamación de propiedad? Al hacerlo, se marcará tu reporte de objeto encontrado como CERRADO, se rechazarán automáticamente otros reclamos pendientes y se compartirá tu correo de contacto con el reclamante."
        confirmText="Sí, aceptar reclamo"
        cancelText="Cancelar"
        type="info"
        isSubmitting={submitting}
      />

      {/* Confirm Reject Modal */}
      <ConfirmModal
        isOpen={confirmRejectId !== null}
        onClose={() => setConfirmRejectId(null)}
        onConfirm={handleReject}
        title="Rechazar Reclamación"
        message="¿Estás seguro de rechazar esta reclamación de propiedad? La persona será notificada y tu publicación de objeto encontrado seguirá activa para recibir otras solicitudes."
        confirmText="Sí, rechazar"
        cancelText="Cancelar"
        type="danger"
        isSubmitting={submitting}
      />

    </div>
  );
}
