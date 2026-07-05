import { useState, useEffect } from 'react';
import { Shield, Filter, Trash2, Edit, Search, FileText, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getAdminReports, cambiarEstadoReporte, eliminarReporte, getAuditLogs, type LogAuditoriaResponse } from '../api/adminService';
import { getCategorias, type Categoria, type Reporte } from '../api/reportService';
import { toast } from 'react-toastify';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'logs'>('reports');
  const [reports, setReports] = useState<Reporte[]>([]);
  const [logs, setLogs] = useState<LogAuditoriaResponse[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedType, setSelectedType] = useState<'PERDIDO' | 'ENCONTRADO' | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // Estados de Modales
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Reporte | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchReports();
  }, [search, selectedCategory, selectedType, selectedStatus, startDate, endDate, currentPage]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const cats = await getCategorias();
      setCategories(cats);
    } catch (error) {
      console.error('Error al obtener categorías', error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getAdminReports({
        q: search || undefined,
        categorias: selectedCategory ? [Number(selectedCategory)] : undefined,
        tipo: selectedType || undefined,
        lugar: undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        estado: selectedStatus,
        page: currentPage,
        size: 8,
      });
      setReports(data.content);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error('Error al cargar reportes de administración.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      toast.error('Error al cargar la bitácora de auditoría.');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleOpenStatusModal = (report: Reporte) => {
    setSelectedReport(report);
    setNewStatus(report.estado);
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      await cambiarEstadoReporte(selectedReport.id, newStatus);
      toast.success('¡Estado del reporte actualizado exitosamente!');
      setStatusModalOpen(false);
      fetchReports();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudo actualizar el estado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (report: Reporte) => {
    setSelectedReport(report);
    setDeleteReason('');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      await eliminarReporte(selectedReport.id, deleteReason || 'Incumplimiento de normas');
      toast.success('¡Reporte eliminado del sistema!');
      setDeleteModalOpen(false);
      fetchReports();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedStatus('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-brand-bg-dark text-brand-text py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-brand-border-dark/30 pb-6">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl shadow-inner text-brand-accent">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Consola de Administración</h1>
            <p className="text-xs text-brand-muted mt-0.5">Control de moderación de contenido y bitácora de auditoría.</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-brand-border-dark/20 p-1.5 rounded-2xl border border-brand-border-dark/30 mt-4 md:mt-0 self-start">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-brand-accent text-brand-text shadow-md'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Publicaciones
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-brand-accent text-brand-text shadow-md'
                : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            Bitácora de Auditoría
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {activeTab === 'reports' ? (
          <>
            {/* Filters Bar */}
            <div className="bg-brand-border-dark/15 border border-brand-border-dark/30 rounded-3xl p-6 mb-8 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 border-b border-brand-border-dark/25 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-muted">
                  <Filter className="w-4 h-4 text-brand-accent" />
                  <span>Filtros de búsqueda</span>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xxs text-brand-accent hover:underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Palabra clave */}
                <div>
                  <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Búsqueda rápida</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-muted" />
                    <input
                      type="text"
                      placeholder="Objeto, descripción, etc."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none placeholder-brand-muted"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value === '' ? '' : Number(e.target.value)); setCurrentPage(0); }}
                    className="w-full px-3 py-2.5 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none cursor-pointer"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Tipo</label>
                  <select
                    value={selectedType}
                    onChange={(e) => { setSelectedType(e.target.value as any); setCurrentPage(0); }}
                    className="w-full px-3 py-2.5 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none cursor-pointer"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="PERDIDO">Perdidos</option>
                    <option value="ENCONTRADO">Encontrados</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Estado</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(0); }}
                    className="w-full px-3 py-2.5 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Todos los estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="RECUPERADO">Recuperado</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                </div>

                {/* Fecha inicio */}
                <div>
                  <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
                    className="w-full px-3 py-2 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Fecha fin */}
                <div>
                  <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
                    className="w-full px-3 py-2 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Reports Grid/Table */}
            <div className="bg-brand-border-dark/15 border border-brand-border-dark/30 rounded-3xl overflow-hidden backdrop-blur-md">
              {loading ? (
                <div className="py-20 text-center text-brand-muted text-xs">Cargando publicaciones...</div>
              ) : reports.length === 0 ? (
                <div className="py-20 text-center">
                  <AlertTriangle className="w-8 h-8 text-orange-500/80 mx-auto mb-2" />
                  <p className="text-xs text-brand-muted">No se encontraron reportes con los filtros aplicados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-brand-border-dark/25 bg-brand-border-dark/10 text-brand-muted font-bold text-xxs uppercase tracking-wider">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Imagen</th>
                        <th className="py-4 px-6">Objeto</th>
                        <th className="py-4 px-6">Tipo</th>
                        <th className="py-4 px-6">Autor</th>
                        <th className="py-4 px-6">Estado</th>
                        <th className="py-4 px-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border-dark/20">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-brand-border-dark/5 transition-colors duration-150">
                          <td className="py-4 px-6 font-mono text-xxs text-brand-muted">#{r.id}</td>
                          <td className="py-4 px-6">
                            {r.imagenes_urls && r.imagenes_urls.length > 0 ? (
                              <img
                                src={r.imagenes_urls[0]}
                                alt={r.nombre_objeto}
                                className="w-9 h-9 object-cover rounded-lg border border-brand-border-dark/30 shadow-sm"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-brand-border-dark/30 rounded-lg flex items-center justify-center text-xxs text-brand-muted">
                                N/A
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-brand-text block truncate max-w-xs">{r.nombre_objeto}</span>
                            <span className="text-xxs text-brand-muted block mt-0.5 truncate max-w-xs">{r.categoria_nombre}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                              r.tipo === 'PERDIDO'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                                : 'bg-green-500/10 text-green-400 border border-green-500/15'
                            }`}>
                              {r.tipo}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-brand-text block">{r.autor_nombre}</span>
                            <span className="text-xxs text-brand-muted block mt-0.5">{r.created_at.split('T')[0]}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                              r.estado === 'ACTIVO'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                                : r.estado === 'EN_PROCESO'
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15'
                                : r.estado === 'RECUPERADO'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/15'
                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/15'
                            }`}>
                              {r.estado}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenStatusModal(r)}
                                className="p-1.5 hover:bg-brand-accent/15 text-brand-muted hover:text-brand-accent border border-transparent hover:border-brand-accent/20 rounded-lg transition-all duration-150 cursor-pointer"
                                title="Moderar estado"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(r)}
                                className="p-1.5 hover:bg-red-500/15 text-brand-muted hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition-all duration-150 cursor-pointer"
                                title="Eliminar publicación"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border-dark/25 bg-brand-border-dark/10">
                  <span className="text-xxs text-brand-muted">
                    Página {currentPage + 1} de {totalPages}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                      disabled={currentPage === 0}
                      className="p-1.5 rounded-lg border border-brand-border-dark/40 bg-brand-bg-dark text-brand-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-border-dark/10 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-1.5 rounded-lg border border-brand-border-dark/40 bg-brand-bg-dark text-brand-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-border-dark/10 cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Logs Tab */
          <div className="bg-brand-border-dark/15 border border-brand-border-dark/30 rounded-3xl overflow-hidden backdrop-blur-md p-6">
            <div className="flex items-center space-x-2 mb-6 border-b border-brand-border-dark/25 pb-3">
              <FileText className="w-4.5 h-4.5 text-brand-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted">Registro de Actividad Administrativa</h2>
            </div>

            {logsLoading ? (
              <div className="py-20 text-center text-brand-muted text-xs">Cargando bitácora...</div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center text-brand-muted text-xs">
                No hay actividades de auditoría registradas.
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-brand-bg-dark border border-brand-border-dark/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-brand-accent/20 transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-md text-xxs font-bold uppercase ${
                          log.accion === 'ELIMINAR_REPORTE'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                        }`}>
                          {log.accion}
                        </span>
                        <span className="text-xxs text-brand-muted">
                          Reporte #{log.reporteId || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-brand-text mt-2 font-medium">{log.detalles}</p>
                    </div>

                    <div className="mt-3 sm:mt-0 text-left sm:text-right border-t sm:border-t-0 border-brand-border-dark/10 pt-2.5 sm:pt-0 shrink-0">
                      <span className="text-xxs text-brand-text block font-bold">Por: {log.adminNombre}</span>
                      <span className="text-xxs text-brand-muted block mt-0.5">
                        {new Date(log.fechaAccion).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Moderation Status Modal */}
      {statusModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-bg-dark border border-brand-border-dark/50 rounded-3xl p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
              <Shield className="w-5 h-5 text-brand-accent" />
              <span>Moderar Estado de Publicación</span>
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Estás moderando el estado del reporte <strong className="text-brand-text">"{selectedReport.nombre_objeto}"</strong>.
            </p>

            <div className="mt-4">
              <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Nuevo Estado</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none cursor-pointer"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="EN_PROCESO">EN PROCESO</option>
                <option value="RECUPERADO">RECUPERADO</option>
                <option value="CERRADO">CERRADO</option>
              </select>
            </div>

            <div className="flex space-x-3.5 mt-6">
              <button
                onClick={() => setStatusModalOpen(false)}
                disabled={submitting}
                className="flex-1 py-2.5 border border-brand-border-dark/40 text-brand-muted hover:text-brand-text rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={submitting || newStatus === selectedReport.estado}
                className="flex-1 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-brand-text rounded-xl text-xs font-bold cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Actualizando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Delete Modal */}
      {deleteModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-brand-bg-dark border border-brand-border-dark/50 rounded-3xl p-6 shadow-2xl animate-fade-in relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-text cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-brand-text flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Eliminar Publicación</span>
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              ¿Estás seguro de que deseas eliminar permanentemente <strong className="text-brand-text">"{selectedReport.nombre_objeto}"</strong>? Esta acción borrará el reporte, sus imágenes de Cloudinary, reclamos y conversaciones de chat asociadas.
            </p>

            <div className="mt-4">
              <label className="block text-xxs font-bold text-brand-muted uppercase mb-1.5">Motivo de eliminación</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Ej. Contiene imágenes inapropiadas o lenguaje ofensivo..."
                className="w-full px-3 py-2 text-xs bg-brand-bg-dark border border-brand-border-dark/40 rounded-xl focus:border-brand-accent/50 focus:outline-none resize-none h-24 placeholder-brand-muted"
                required
              />
            </div>

            <div className="flex space-x-3.5 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={submitting}
                className="flex-1 py-2.5 border border-brand-border-dark/40 text-brand-muted hover:text-brand-text rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={submitting || !deleteReason.trim()}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-brand-text rounded-xl text-xs font-bold cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Eliminando...' : 'Confirmar Eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
