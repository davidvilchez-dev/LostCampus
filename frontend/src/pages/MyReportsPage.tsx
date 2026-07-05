import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import MyReportCard, { type MyReport } from '../components/MyReportCard';
import ConfirmModal from '../components/ConfirmModal';
import { getMyReports, deleteReport, resolveReport } from '../api/reportService';

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadMyReports() {
      setIsLoading(true);
      try {
        const myReports = await getMyReports();
        setReports(myReports);
      } catch (err: any) {
        toast.error('Error al cargar tus reportes desde el servidor.');
      } finally {
        setIsLoading(false);
      }
    }
    loadMyReports();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/reporte/${id}/editar`);
  };

  // Estados para modal de confirmación
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    type: 'info' | 'danger' | 'warning';
    onConfirm: () => void;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    type: 'info',
    onConfirm: () => {},
    isSubmitting: false,
  });

  const handleResolve = (id: number) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;

    setModalConfig({
      isOpen: true,
      title: '¿Resolver reporte?',
      message: '¿Estás seguro de que deseas marcar este reporte como resuelto? Esta acción no se puede deshacer y cerrará la publicación permanentemente.',
      confirmText: 'Resolver',
      cancelText: 'Cancelar',
      type: 'info',
      isSubmitting: false,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isSubmitting: true }));
        try {
          await resolveReport(id);
          toast.success('Reporte completado');
          setReports((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    estado: 'CERRADO',
                    motivo_cierre: 'Marcar como resuelto. Objeto recuperado por el dueño.',
                  }
                : r
            )
          );
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          const message = err.response?.data?.error || 'No se pudo resolver el reporte.';
          toast.error(message);
        } finally {
          setModalConfig((prev) => ({ ...prev, isSubmitting: false }));
        }
      },
    });
  };

  const handleDelete = (id: number) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;

    setModalConfig({
      isOpen: true,
      title: '¿Eliminar reporte?',
      message: '¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer y borrará permanentemente todo su contenido.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      isSubmitting: false,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isSubmitting: true }));
        try {
          await deleteReport(id);
          setReports((prev) => prev.filter((r) => r.id !== id));
          toast.success('Reporte eliminado');
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          toast.error('No se pudo eliminar el reporte.');
        } finally {
          setModalConfig((prev) => ({ ...prev, isSubmitting: false }));
        }
      },
    });
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Encabezado y Acción */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Mis reportes y estados</h1>
          <p className="text-brand-muted text-sm mt-1.5 font-normal">
            Gestiona los objetos que has reportado como perdidos o encontrados en el campus. Revisa el estado de cada reporte y las interacciones.
          </p>
        </div>

        {/* Botón Nuevo Reporte */}
        <button
          onClick={() => navigate('/reportar')}
          className="glow-btn-primary flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl text-brand-text font-semibold text-sm transition-all cursor-pointer self-start md:self-auto shadow-lg"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span>Nuevo reporte</span>
        </button>
      </div>

      {/* Grid de Publicaciones Personales */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-brand-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <MyReportCard
              key={report.id}
              report={report}
              onEdit={handleEdit}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Estado vacío */
        <div className="rounded-2xl border border-dashed border-brand-border-dark bg-brand-card/20 p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto mt-6">
          <div className="p-4 bg-brand-border-dark/50 text-brand-muted rounded-full">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-text">Sin reportes registrados</h3>
            <p className="text-sm text-brand-muted mt-1">
              Actualmente no tienes ningún reporte de objetos perdidos o encontrados registrado en tu cuenta.
            </p>
          </div>
          <button
            onClick={() => navigate('/reportar')}
            className="glow-btn-secondary px-5 py-2.5 rounded-xl text-brand-text font-semibold text-xs transition-all cursor-pointer shadow-md"
          >
            Crear mi primer reporte
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        isSubmitting={modalConfig.isSubmitting}
      />
    </div>
  );
}
