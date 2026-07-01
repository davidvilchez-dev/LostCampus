import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Loader2, Folder, ImageOff, MapPin, Calendar, ArrowRight, Info } from 'lucide-react';
import { getMyReports, getSuggestedMatches, type MatchResponse } from '../api/reportService';
import { toast } from 'react-toastify';

interface ReportWithMatches {
  id: number;
  nombreObjeto: string;
  tipo: string;
  estado: string;
  categoriaNombre: string;
  lugar: string;
  fechaIncidente: string;
  matches: MatchResponse[];
}

export default function MatchesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportsWithMatches, setReportsWithMatches] = useState<ReportWithMatches[]>([]);

  useEffect(() => {
    async function loadAllMatches() {
      setLoading(true);
      try {
        // 1. Obtener mis reportes
        const myReports = await getMyReports();
        
        // Filtrar solo los reportes que estén ACTIVOS
        const activeReports = myReports.filter((r) => r.estado === 'ACTIVO');

        // 2. Para cada reporte activo, cargar sus coincidencias sugeridas en paralelo
        const results = await Promise.all(
          activeReports.map(async (report) => {
            try {
              const matchedList = await getSuggestedMatches(report.id);
              return {
                id: report.id,
                nombreObjeto: report.nombre_objeto,
                tipo: report.tipo,
                estado: report.estado,
                categoriaNombre: report.categoria_nombre,
                lugar: report.lugar,
                fechaIncidente: report.fecha_incidente,
                matches: matchedList,
              };
            } catch (err) {
              console.error(`Error cargando coincidencias para reporte ${report.id}:`, err);
              return {
                id: report.id,
                nombreObjeto: report.nombre_objeto,
                tipo: report.tipo,
                estado: report.estado,
                categoriaNombre: report.categoria_nombre,
                lugar: report.lugar,
                fechaIncidente: report.fecha_incidente,
                matches: [],
              };
            }
          })
        );

        setReportsWithMatches(results);
      } catch (err: any) {
        toast.error('Error al cargar la información de coincidencias.');
      } finally {
        setLoading(false);
      }
    }
    loadAllMatches();
  }, []);

  // Verificar si hay alguna coincidencia en total
  const totalMatchesCount = reportsWithMatches.reduce((acc, r) => acc + r.matches.length, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Cabecera */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-text">Coincidencias Sugeridas</h1>
        </div>
        <p className="text-sm text-brand-muted max-w-2xl leading-relaxed">
          El sistema analiza constantemente tus reportes activos mediante un modelo híbrido en búsqueda de posibles cruces con reportes de otros usuarios dentro del campus.
        </p>
      </div>

      {reportsWithMatches.length === 0 ? (
        /* Caso: Sin reportes activos */
        <div className="bg-brand-bg-dark border border-brand-border-dark/65 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-brand-border-dark/30 rounded-full flex items-center justify-center mx-auto text-brand-muted/70">
            <Folder className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-brand-text">No tienes reportes activos</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Las coincidencias automáticas se calculan a partir de tus reportes activos. Si perdiste o encontraste algo, publícalo para comenzar a recibir sugerencias.
            </p>
          </div>
          <button
            onClick={() => navigate('/reportar')}
            className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-brand-text text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md hover:scale-105"
          >
            Reportar un objeto
          </button>
        </div>
      ) : totalMatchesCount === 0 ? (
        /* Caso: Con reportes activos pero sin coincidencias encontradas */
        <div className="bg-brand-bg-dark border border-brand-border-dark/65 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/5 text-amber-400/80 rounded-full flex items-center justify-center mx-auto border border-amber-500/10">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-brand-text">Buscando coincidencias...</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Actualmente tienes <strong>{reportsWithMatches.length}</strong> reporte(s) activo(s), pero aún no se han detectado coincidencias cruzadas con suficiente porcentaje de similitud (umbral del 30%). Te notificaremos cuando encontremos algo.
            </p>
          </div>
        </div>
      ) : (
        /* Caso: Con reportes activos y con coincidencias sugeridas */
        <div className="space-y-8">
          {reportsWithMatches
            .filter((report) => report.matches.length > 0)
            .map((report) => (
              <div 
                key={report.id} 
                className="bg-brand-bg-dark border border-brand-border-dark/65 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl"
              >
                {/* Cabecera del Reporte del Usuario */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border-dark/60 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent uppercase tracking-wider">
                      Tu reporte
                    </span>
                    <h2 className="text-lg font-bold text-brand-text hover:text-brand-accent cursor-pointer transition-colors" onClick={() => navigate(`/reporte/${report.id}`)}>
                      {report.nombreObjeto}
                    </h2>
                    <div className="flex items-center text-xxs text-brand-muted space-x-3">
                      <span className="bg-brand-border-dark/40 px-2 py-0.5 rounded text-xxs">{report.categoriaNombre}</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 shrink-0" />
                        {report.lugar}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/reporte/${report.id}`)}
                    className="flex items-center text-xs font-bold text-brand-accent hover:text-brand-accent-hover transition-all cursor-pointer group"
                  >
                    Ver detalles de tu reporte
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Listado de sugerencias de coincidencia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.matches.map((match) => (
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
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
