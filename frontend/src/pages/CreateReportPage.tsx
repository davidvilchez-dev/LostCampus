import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Calendar, XCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import ImageUploadDropzone from '../components/ImageUploadDropzone';
import CampusMapModal from '../components/CampusMapModal';
import { getCategorias, createReport, uploadReportImages, type Categoria } from '../api/reportService';

interface FormErrors {
  nombre_objeto?: string;
  categoria?: string;
  lugar?: string;
  fecha_incidente?: string;
}

export default function CreateReportPage() {
  const navigate = useNavigate();

  // Form states
  const [tipo, setTipo] = useState<'PERDIDO' | 'ENCONTRADO'>('PERDIDO');
  const [nombreObjeto, setNombreObjeto] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState('');
  const [lugar, setLugar] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Cargar categorías del backend
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

  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!nombreObjeto.trim()) {
      tempErrors.nombre_objeto = 'El nombre del objeto es obligatorio.';
      isValid = false;
    } else if (nombreObjeto.trim().length < 3) {
      tempErrors.nombre_objeto = 'El nombre debe tener al menos 3 caracteres.';
      isValid = false;
    }

    if (!categoriaId) {
      tempErrors.categoria = 'Debes seleccionar una categoría.';
      isValid = false;
    }

    if (!lugar.trim()) {
      tempErrors.lugar = 'La ubicación es obligatoria.';
      isValid = false;
    }

    if (!fechaIncidente) {
      tempErrors.fecha_incidente = 'La fecha es obligatoria.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear el reporte en base de datos
      const reporte = await createReport({
        categoria_id: Number(categoriaId),
        tipo,
        nombre_objeto: nombreObjeto,
        descripcion,
        lugar,
        fecha_incidente: fechaIncidente,
      });

      // 2. Subir imágenes si existen
      if (images.length > 0) {
        await uploadReportImages(reporte.id, images);
      }

      toast.success('¡Reporte publicado exitosamente!');
      navigate('/feed');
    } catch (err: any) {
      const message = err.response?.data?.error || 'No se pudo publicar el reporte.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Botón de Retorno */}
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors duration-200 bg-brand-border-dark/30 hover:bg-brand-border-dark/60 py-2 px-3 rounded-lg border border-brand-border-dark/60"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al muro</span>
        </button>
      </div>

      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Crear reporte</h1>
        <p className="text-brand-muted text-sm mt-1.5 font-normal">
          Proporciona los detalles del objeto perdido o encontrado para ayudar a la comunidad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (Campos de entrada) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Información Principal */}
          <div className="rounded-2xl border border-brand-border-dark bg-brand-card p-6 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-brand-text">Información Principal</h2>
              <div className="h-px bg-brand-border-dark/50 my-3"></div>
            </div>

            {/* Tipo de reporte */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Tipo de reporte</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTipo('PERDIDO')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                    tipo === 'PERDIDO'
                      ? 'bg-blue-500/10 border-brand-accent text-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#131c31]/30 border-brand-border-dark text-brand-muted hover:border-brand-border-light hover:text-brand-text'
                  }`}
                >
                  Perdí un objeto
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('ENCONTRADO')}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                    tipo === 'ENCONTRADO'
                      ? 'bg-blue-500/10 border-brand-accent text-brand-accent shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#131c31]/30 border-brand-border-dark text-brand-muted hover:border-brand-border-light hover:text-brand-text'
                  }`}
                >
                  Encontré un objeto
                </button>
              </div>
            </div>

            {/* Fila: Nombre del Objeto + Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Nombre del objeto</label>
                <input
                  type="text"
                  placeholder="Ej. MacBook Pro, Llaves de casa"
                  value={nombreObjeto}
                  onChange={(e) => setNombreObjeto(e.target.value)}
                  className={`w-full bg-[#131c31] border rounded-xl py-2.5 px-3.5 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all ${
                    errors.nombre_objeto
                      ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                      : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                  }`}
                />
                {errors.nombre_objeto && (
                  <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.nombre_objeto}
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Categoría</label>
                <div className="relative">
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className={`w-full bg-[#131c31] border rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-brand-text outline-none transition-all appearance-none cursor-pointer ${
                      errors.categoria
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent'
                    }`}
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id} className="bg-brand-card">
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted/60 pointer-events-none" />
                </div>
                {errors.categoria && (
                  <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.categoria}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Descripción detallada</label>
              <textarea
                rows={4}
                placeholder="Describe color, marcas particulares, modelo, etc..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-[#131c31] border border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent focus:shadow-[0_0_12px_rgba(59,130,246,0.15)] rounded-xl py-2.5 px-3.5 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Card: Contexto */}
          <div className="rounded-2xl border border-brand-border-dark bg-brand-card p-6 space-y-6 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-brand-text">Contexto</h2>
              <div className="h-px bg-brand-border-dark/50 my-3"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Fecha (Aproximada)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={fechaIncidente}
                    onChange={(e) => setFechaIncidente(e.target.value)}
                    className={`w-full bg-[#131c31] border rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-brand-text outline-none transition-all ${
                      errors.fecha_incidente
                        ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                        : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    }`}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted/40 pointer-events-none" />
                </div>
                {errors.fecha_incidente && (
                  <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.fecha_incidente}
                  </p>
                )}
              </div>

              {/* Ubicación */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Ubicación</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Edificio, salón o zona"
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    className={`w-full bg-[#131c31] border rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all ${
                      errors.lugar
                        ? 'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                        : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    }`}
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted/40 pointer-events-none" />
                </div>
                {errors.lugar && (
                  <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.lugar}
                  </p>
                )}

                {/* Botón Seleccionar en Mapa */}
                <div
                  onClick={() => setIsMapModalOpen(true)}
                  className="w-full h-24 rounded-xl border border-brand-border-dark bg-brand-bg-dark hover:border-brand-accent/60 transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center cursor-pointer select-none group"
                >
                  {/* Grid Lines Pattern representing a map blueprint */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-size-[16px_16px]"></div>
                  {/* Glowing center area */}
                  <div className="absolute w-20 h-20 bg-brand-accent/5 rounded-full blur-xl group-hover:bg-brand-accent/10 transition-colors"></div>

                  <MapPin className="w-6 h-6 text-brand-muted/50 group-hover:text-brand-accent group-hover:scale-110 transition-all duration-300 z-10" />
                  <span className="text-xs font-bold text-brand-muted/70 group-hover:text-brand-text transition-colors mt-2 z-10">
                    Seleccionar en mapa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Mapa */}
        <CampusMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          onSelectLocation={(loc) => setLugar(loc)}
          currentLocation={lugar}
        />

        {/* Columna Derecha (Evidencia + Envío) */}
        <div className="space-y-6">
          {/* Card: Evidencia */}
          <div className="rounded-2xl border border-brand-border-dark bg-brand-card p-6 space-y-6 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-brand-text">Evidencia Visual</h2>
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 bg-brand-border-dark border border-brand-border-light text-brand-muted rounded-md">
                Max 3
              </span>
            </div>
            <div className="h-px bg-brand-border-dark/50 -mt-3"></div>

            <ImageUploadDropzone images={images} onChange={setImages} />
          </div>

          {/* Acciones del formulario */}
          <div className="flex flex-col space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="glow-btn-primary w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-brand-text shadow-lg cursor-pointer flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Publicando...</span>
                </>
              ) : (
                <span>Publicar reporte</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-bold text-brand-muted hover:text-brand-text py-2 transition-colors cursor-pointer self-center hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
