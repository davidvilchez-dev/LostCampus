import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Filter, ChevronDown, Calendar, MapPin, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import ReportCard, { type Report } from '../components/ReportCard';
import { getReports, getCategorias, type Categoria } from '../api/reportService';
import { toast } from 'react-toastify';

export default function FeedPage() {
  const navigate = useNavigate();

  // Estados de Filtros Avanzados
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<'PERDIDO' | 'ENCONTRADO' | ''>('');
  const [selectedLugar, setSelectedLugar] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  
  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  // Campus Zones
  const campusZones = [
    'Pabellón A',
    'Pabellón B',
    'Pabellón C',
    'Biblioteca Central',
    'Comedor Universitario',
    'Laboratorio de Cómputo',
    'Áreas Verdes',
    'Gimnasio',
    'Oficinas Administrativas'
  ];

  // Cargar categorías al montar
  useEffect(() => {
    async function loadCategorias() {
      try {
        const cats = await getCategorias();
        setCategorias(cats);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    }
    loadCategorias();
  }, []);

  // Cargar reportes con filtros aplicados (Server-side)
  useEffect(() => {
    // Validar rango de fechas antes de consultar
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setDateError('La fecha de inicio debe ser anterior o igual a la de fin.');
      return;
    }
    setDateError('');

    async function loadReports() {
      setIsLoading(true);
      try {
        const data = await getReports({
          q: search,
          categorias: selectedCategories,
          tipo: selectedTipo,
          lugar: selectedLugar,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          sort: sort,
          page: 0,
          size: 100, // Traer lote grande
        });
        setReports(data.content);
      } catch (err: any) {
        toast.error('Error al cargar los reportes del servidor.');
      } finally {
        setIsLoading(false);
      }
    }

    const delayDebounceFn = setTimeout(() => {
      loadReports();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategories, selectedTipo, selectedLugar, startDate, endDate, sort]);

  // Alternar selección de múltiples categorías
  const handleToggleCategory = (catId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Resetear filtros
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedTipo('');
    setSelectedLugar('');
    setStartDate('');
    setEndDate('');
    setSort('desc');
    setDateError('');
  };

  // Verificar si hay filtros activos para mostrar badge
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTipo !== '' ||
    selectedLugar !== '' ||
    startDate !== '' ||
    endDate !== '' ||
    sort !== 'desc';

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Encabezado y Acción */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">
            Feed de Reportes
          </h1>
          <p className="text-brand-muted text-sm mt-1.5 font-normal">
            Filtra, busca y ordena objetos perdidos y encontrados en tiempo real.
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

      {/* Controles de Búsqueda y Ordenamiento */}
      <div className="flex flex-col space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Buscador local */}
          <div className="relative flex-1 max-w-lg w-full shrink-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted/50 pointer-events-none">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar por objeto, descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131c31] border border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all"
            />
          </div>

          {/* Botones de acción de Filtros / Ordenamiento */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Quick Filter: Tipo */}
            <div className="flex bg-[#131c31] border border-brand-border-dark rounded-xl p-1">
              <button
                onClick={() => setSelectedTipo('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTipo === '' ? 'bg-brand-card text-brand-text' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedTipo('PERDIDO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTipo === 'PERDIDO' ? 'bg-[#ef4444]/20 text-[#f87171]' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                Perdidos
              </button>
              <button
                onClick={() => setSelectedTipo('ENCONTRADO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedTipo === 'ENCONTRADO' ? 'bg-[#10b981]/20 text-[#34d399]' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                Encontrados
              </button>
            </div>

            {/* Ordenamiento */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
                className="appearance-none bg-[#131c31] border border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent rounded-xl py-2.5 pl-4 pr-10 text-sm text-brand-text font-medium outline-none cursor-pointer transition-all min-w-[140px]"
              >
                <option value="desc">Más reciente</option>
                <option value="asc">Más antiguo</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted/60 pointer-events-none" />
            </div>

            {/* Botón Filtros Avanzados (Far Right) */}
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                hasActiveFilters
                  ? 'bg-brand-accent/15 border-brand-accent text-brand-accent shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                  : 'bg-[#131c31] border-brand-border-dark hover:border-[#24355a] text-brand-text'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-accent" />
              )}
            </button>

          </div>

        </div>

      </div>

      {/* Drawer de Filtros (Desplazamiento desde la derecha) */}
      <div 
        className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
          showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop con desenfoque suave */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setShowFilters(false)}
        ></div>

        {/* Panel Desplazable (Drawer) */}
        <div 
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-[#0b0f19] border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 transform ${
            showFilters ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4.5 h-4.5 text-brand-accent" />
              <h3 className="text-base font-bold text-slate-100">Filtros avanzados</h3>
            </div>
            <button 
              onClick={() => setShowFilters(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body (Campos del Filtro) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Resetear Filtros */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-brand-accent/30 bg-brand-accent/5 hover:bg-brand-accent/10 text-xs text-brand-accent font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer todos los filtros</span>
              </button>
            )}

            {/* Categorías */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-brand-muted/80 uppercase tracking-wider block">
                Categorías (Permite múltiples)
              </label>
              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-accent/20 border-brand-accent text-brand-text shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                          : 'bg-[#101726]/40 border-brand-border-dark/60 text-brand-muted hover:border-brand-muted/40 hover:text-brand-text'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rango de Fechas */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-muted/80 uppercase tracking-wider block border-b border-slate-800 pb-1">
                Rango de Fechas
              </span>

              {/* Fecha Inicio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-muted" />
                  <span>Desde</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#101726]/40 border border-brand-border-dark/60 rounded-xl py-2 px-3 text-xs text-brand-text placeholder-brand-muted/30 outline-none focus:border-brand-accent transition-all"
                />
              </div>

              {/* Fecha Fin */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-muted" />
                  <span>Hasta</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#101726]/40 border border-brand-border-dark/60 rounded-xl py-2 px-3 text-xs text-brand-text placeholder-brand-muted/30 outline-none focus:border-brand-accent transition-all"
                />
              </div>

              {dateError && (
                <p className="text-xs font-semibold text-red-400">
                  {dateError}
                </p>
              )}
            </div>

            {/* Ubicación / Campus Zone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-muted/80 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-1">
                <MapPin className="w-3.5 h-3.5 text-brand-muted" />
                <span>Zona del Campus</span>
              </label>
              <div className="relative mt-2">
                <select
                  value={selectedLugar}
                  onChange={(e) => setSelectedLugar(e.target.value)}
                  className="appearance-none w-full bg-[#101726]/40 border border-brand-border-dark/60 rounded-xl py-2.5 pl-3 pr-8 text-xs text-brand-text outline-none focus:border-brand-accent cursor-pointer transition-all"
                >
                  <option value="">Todas las zonas</option>
                  {campusZones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/60 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Footer del Drawer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-[#080c14] flex gap-3">
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 py-2.5 text-xs font-bold text-brand-text bg-brand-accent hover:brightness-110 rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] cursor-pointer text-center"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Reportes */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-brand-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : reports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        /* Estado vacío si no hay coincidencias */
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-brand-card/45 border border-brand-border-dark/60">
          <div className="w-14 h-14 rounded-full bg-brand-border-dark flex items-center justify-center mb-4 text-brand-muted/40">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-brand-text">Sin resultados</h3>
          <p className="text-brand-muted text-sm mt-1 max-w-sm">
            No encontramos reportes que coincidan con tus criterios de búsqueda. Intenta cambiar los filtros o los términos de búsqueda.
          </p>
        </div>
      )}

    </div>
  );
}
