import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import MyReportCard, { type MyReport } from '../components/MyReportCard';
import { getMyReports, deleteReport } from '../api/reportService';

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
    const report = reports.find((r) => r.id === id);
    if (report) {
      toast.info(`Editar reporte: "${report.nombre_objeto}" (Función disponible en el feed)`);
    }
  };

  const handleResolve = (id: number) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          toast.success(`¡Reporte "${r.nombre_objeto}" marcado como resuelto!`);
          return {
            ...r,
            estado: 'CERRADO',
            motivo_cierre: 'Marcar como resuelto. Objeto recuperado por el dueño.',
          };
        }
        return r;
      })
    );
  };

  const handleDelete = async (id: number) => {
    const report = reports.find((r) => r.id === id);
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Reporte "${report?.nombre_objeto || ''}" eliminado con éxito.`);
    } catch (err: any) {
      toast.error('No se pudo eliminar el reporte.');
    }
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
    </div>
  );
}
