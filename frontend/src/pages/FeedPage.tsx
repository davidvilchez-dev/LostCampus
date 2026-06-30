import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Filter, ChevronDown } from 'lucide-react';
import ReportCard, { type Report } from '../components/ReportCard';
import { getReports, getCategorias, type Categoria } from '../api/reportService';
import { toast } from 'react-toastify';

export default function FeedPage() {
  const navigate = useNavigate();

  // Estados de Filtros y Búsqueda
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [tipo, setTipo] = useState('Todos');
  const [reports, setReports] = useState<Report[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Cargar reportes cuando cambie el buscador o al montar
  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        // En backend q es opcional. Obtenemos una página con tamaño grande (ej. 100) para aplicar filtros locales y simular feed dinámico rápido
        const data = await getReports(search, 0, 100);
        setReports(data.content);
      } catch (err: any) {
        toast.error('Error al cargar los reportes del servidor.');
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce de búsqueda simple (300ms)
    const delayDebounceFn = setTimeout(() => {
      loadReports();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Filtrado local adicional para categoría y tipo
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Filtro de categoría
      const matchesCategory =
        categoria === 'Todas' ||
        (report.categoria_nombre && report.categoria_nombre.toLowerCase() === categoria.toLowerCase());

      // Filtro de tipo
      const matchesType =
        tipo === 'Todos' ||
        report.tipo.toUpperCase() === tipo.toUpperCase();

      return matchesCategory && matchesType;
    });
  }, [reports, categoria, tipo]);

  return (
    <div className="flex flex-col space-y-8">
      
      {/* Encabezado y Acción */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">
            Feed de Reportes
          </h1>
          <p className="text-brand-muted text-sm mt-1.5 font-normal">
            Explora objetos perdidos y encontrados en el campus.
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

      {/* Barra de Filtros + Buscador Reubicado */}
      <div className="flex flex-col space-y-4">
        {/* Fila de controles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Lado izquierdo: Buscador integrado local */}
          <div className="relative max-w-md w-full shrink-0">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted/50 pointer-events-none">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar objetos, categorías, ubicaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131c31] border border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all"
            />
          </div>

          {/* Fila de selectores dropdown y resultados */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Dropdown Categoría */}
            <div className="relative">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="appearance-none bg-[#131c31] border border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent rounded-xl py-2.5 pl-4 pr-10 text-sm text-brand-text font-medium outline-none cursor-pointer transition-all min-w-[130px]"
              >
                <option value="Todas">Categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted/60 pointer-events-none" />
            </div>

            {/* Dropdown Tipo */}
            <div className="relative">
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="appearance-none bg-[#131c31] border border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent rounded-xl py-2.5 pl-4 pr-10 text-sm text-brand-text font-medium outline-none cursor-pointer transition-all min-w-[110px]"
              >
                <option value="Todos">Tipos</option>
                <option value="PERDIDO">Perdido</option>
                <option value="ENCONTRADO">Encontrado</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted/60 pointer-events-none" />
            </div>

            {/* Resultados contados */}
            <span className="text-xs font-semibold text-brand-muted/70 ml-auto lg:ml-4 select-none">
              Mostrando {filteredReports.length} resultados
            </span>
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
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
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
            No encontramos reportes que coincidan con tus criterios de búsqueda. Intenta cambiar los filtros.
          </p>
        </div>
      )}

    </div>
  );
}
