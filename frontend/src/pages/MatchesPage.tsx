import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Loader2, Folder, ImageOff, MapPin, Calendar, ArrowRight, Info } from 'lucide-react';
import { getMyReports, getSuggestedMatches } from '../api/reportService';
import { toast } from 'react-toastify';

interface MatchingPair {
  id: string; // unique key: `${reportId}-${matchId}`
  reportId: number;
  reportName: string;
  reportType: string;
  reportPlace: string;
  reportDate: string;
  reportImages: string[];
  
  matchId: number;
  matchName: string;
  matchType: string;
  matchPlace: string;
  matchDate: string;
  matchImages: string[];
  matchScore: number;
}

export default function MatchesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([]);
  const [hasActiveReports, setHasActiveReports] = useState(false);

  useEffect(() => {
    async function loadAllMatches() {
      setLoading(true);
      try {
        // 1. Obtener mis reportes
        const myReports = await getMyReports();
        
        // Filtrar solo los reportes que estén ACTIVOS
        const activeReports = myReports.filter((r) => r.estado === 'ACTIVO');
        setHasActiveReports(activeReports.length > 0);

        // 2. Para cada reporte activo, cargar sus coincidencias sugeridas en paralelo
        const pairsList: MatchingPair[] = [];
        await Promise.all(
          activeReports.map(async (report) => {
            try {
              const matchedList = await getSuggestedMatches(report.id);
              matchedList.forEach((match) => {
                pairsList.push({
                  id: `${report.id}-${match.id}`,
                  reportId: report.id,
                  reportName: report.nombre_objeto,
                  reportType: report.tipo,
                  reportPlace: report.lugar,
                  reportDate: report.fecha_incidente,
                  reportImages: report.imagenes_urls || [],
                  
                  matchId: match.id,
                  matchName: match.nombre_objeto,
                  matchType: match.tipo,
                  matchPlace: match.lugar,
                  matchDate: match.fecha_incidente,
                  matchImages: match.imagenes_urls || [],
                  matchScore: match.score,
                });
              });
            } catch (err) {
              console.error(`Error cargando coincidencias para reporte ${report.id}:`, err);
            }
          })
        );

        // Ordenar las parejas descendente por similitud (score)
        pairsList.sort((a, b) => b.matchScore - a.matchScore);
        setMatchingPairs(pairsList);
      } catch (err: any) {
        toast.error('Error al cargar la información de coincidencias.');
      } finally {
        setLoading(false);
      }
    }
    loadAllMatches();
  }, []);

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
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-text">Coincidencias Sugeridas</h1>
        </div>
        <p className="text-sm text-brand-muted max-w-2xl leading-relaxed">
          El sistema analiza constantemente tus reportes activos mediante un modelo híbrido en búsqueda de posibles cruces con reportes de otros usuarios dentro del campus.
        </p>
      </div>

      {!hasActiveReports ? (
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
      ) : matchingPairs.length === 0 ? (
        /* Caso: Con reportes activos pero sin coincidencias encontradas */
        <div className="bg-brand-bg-dark border border-brand-border-dark/65 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/5 text-amber-400/80 rounded-full flex items-center justify-center mx-auto border border-amber-500/10">
            <Info className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-brand-text">Buscando coincidencias...</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Actualmente tienes reportes activos, pero aún no se han detectado coincidencias cruzadas con suficiente porcentaje de similitud (umbral del 25%). Te notificaremos en cuanto encontremos algo.
            </p>
          </div>
        </div>
      ) : (
        /* Caso: Listado de parejas de coincidencia */
        <div className="space-y-8">
          {matchingPairs.map((pair) => {
            const isHighSim = pair.matchScore >= 80;
            const isMedSim = pair.matchScore >= 50 && pair.matchScore < 80;

            return (
              <div 
                key={pair.id} 
                className="bg-brand-bg-dark border border-brand-border-dark/65 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden"
              >
                
                {/* Cabecera Comparativa */}
                <div className="flex items-center justify-between border-b border-brand-border-dark/60 pb-4">
                  <div className="flex items-center space-x-2.5">
                    {/* Indicador de Similitud */}
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isHighSim ? 'bg-blue-500 animate-pulse' : isMedSim ? 'bg-orange-500' : 'bg-slate-400'
                    }`}></span>
                    <span className="text-xs font-bold text-brand-text">
                      {isHighSim ? 'Alta Similitud' : isMedSim ? 'Similitud Media' : 'Similitud Baja'}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/reporte/${pair.matchId}`)}
                    className="px-4 py-1.5 bg-[#17253d]/50 hover:bg-[#17253d] border border-brand-border-dark text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-brand-text group"
                  >
                    Ver coincidencia
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Grid Side-by-Side Comparativo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14 relative">
                  
                  {/* Circular Match Progress Ring (Absolute Center en Desktop) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#0b101c] border border-brand-border-dark/80 flex items-center justify-center shadow-2xl ring-4 ring-brand-bg-dark relative">
                      <svg className="w-16 h-16 transform -rotate-90 absolute">
                        <circle
                          cx="32"
                          cy="32"
                          r="27"
                          stroke="#162035"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="27"
                          stroke={isHighSim ? '#3b82f6' : isMedSim ? '#f97316' : '#94a3b8'}
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={169.6}
                          strokeDashoffset={169.6 - (169.6 * pair.matchScore) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xs font-black text-brand-text z-10">{Math.round(pair.matchScore)}%</span>
                    </div>
                  </div>

                  {/* Columna Izquierda: Tu Reporte */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xxs font-bold text-brand-muted/70 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                      <span>Tú reportaste ({pair.reportType === 'PERDIDO' ? 'Perdido' : 'Encontrado'})</span>
                    </div>
                    
                    <div className="bg-[#101726]/20 border border-brand-border-dark/50 rounded-2xl p-4 space-y-4">
                      <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-brand-border-dark/30 border border-brand-border-dark/50 relative">
                        {pair.reportImages.length > 0 ? (
                          <img
                            src={pair.reportImages[0]}
                            alt={pair.reportName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-muted/40 bg-brand-border-dark/10">
                            <ImageOff className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-brand-text truncate">{pair.reportName}</h3>
                        <div className="flex items-center text-xxs text-brand-muted">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-brand-muted/70 shrink-0" />
                          <span className="truncate">{pair.reportPlace}</span>
                        </div>
                        <div className="flex items-center text-xxs text-brand-muted">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-brand-muted/70 shrink-0" />
                          <span>{pair.reportDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Percentage Divider */}
                  <div className="md:hidden flex justify-center py-2 relative my-1">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-brand-border-dark/65"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className={`px-3.5 py-1 border border-brand-border-dark text-[11px] font-extrabold rounded-full shadow-md ${
                        isHighSim ? 'text-blue-400 bg-[#1e3a8a]/40' : isMedSim ? 'text-orange-400 bg-[#7c2d12]/40' : 'text-slate-400 bg-slate-800/40'
                      }`}>
                        {Math.round(pair.matchScore)}% match
                      </span>
                    </div>
                  </div>

                  {/* Columna Derecha: Objeto Encontrado/Perdido (Coincidencia) */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xxs font-bold text-brand-muted/70 uppercase tracking-wider">
                      <span className={`w-1.5 h-1.5 rounded-full ${pair.matchType === 'PERDIDO' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      <span>Objeto {pair.matchType === 'PERDIDO' ? 'Perdido' : 'Encontrado'}</span>
                    </div>
                    
                    <div className="bg-[#101726]/20 border border-brand-border-dark/50 rounded-2xl p-4 space-y-4">
                      <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-brand-border-dark/30 border border-brand-border-dark/50 relative">
                        {pair.matchImages.length > 0 ? (
                          <img
                            src={pair.matchImages[0]}
                            alt={pair.matchName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-muted/40 bg-brand-border-dark/10">
                            <ImageOff className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-brand-text truncate">{pair.matchName}</h3>
                        <div className="flex items-center text-xxs text-brand-muted">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-brand-muted/70 shrink-0" />
                          <span className="truncate">{pair.matchPlace}</span>
                        </div>
                        <div className="flex items-center text-xxs text-brand-muted">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-brand-muted/70 shrink-0" />
                          <span>{pair.matchDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
