import axiosClient from './axiosClient';

/* ═══════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════ */

export interface Categoria {
  id: number;
  nombre: string;
  icono: string | null;
}

export interface Reporte {
  id: number;
  tipo: 'PERDIDO' | 'ENCONTRADO';
  estado: 'ACTIVO' | 'COINCIDENCIA' | 'CERRADO';
  nombre_objeto: string;
  descripcion: string;
  lugar: string;
  fecha_incidente: string;
  categoria_nombre: string;
  categoria_icono: string | null;
  autor_id: number;
  autor_nombre: string;
  autor_foto_url: string | null;
  imagenes_urls: string[];
  created_at: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    page_number: number;
    page_size: number;
  };
  total_pages: number;
  total_elements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export interface CreateReportRequest {
  categoria_id: number;
  tipo: 'PERDIDO' | 'ENCONTRADO';
  nombre_objeto: string;
  descripcion: string;
  lugar: string;
  fecha_incidente: string;
}

/* ═══════════════════════════════════════════════════
   SERVICIOS DE REPORTES
   ═══════════════════════════════════════════════════ */

/**
 * Obtiene el listado de categorías disponibles.
 * GET /api/categorias
 */
export async function getCategorias(): Promise<Categoria[]> {
  const response = await axiosClient.get<Categoria[]>('categorias');
  return response.data;
}

export interface ReportFilters {
  q?: string;
  categorias?: number[];
  tipo?: 'PERDIDO' | 'ENCONTRADO' | '';
  lugar?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
  sort?: 'asc' | 'desc';
}

/**
 * Obtiene el feed paginado de reportes con búsqueda y filtros opcionales.
 * GET /api/reports?q=&categorias=&tipo=&lugar=&start_date=&end_date=&page=&size=&sort=
 */
export async function getReports(filters: ReportFilters = {}): Promise<PageResponse<Reporte>> {
  const params: any = {
    q: filters.q || undefined,
    categorias: filters.categorias && filters.categorias.length > 0 ? filters.categorias.join(',') : undefined,
    tipo: filters.tipo || undefined,
    lugar: filters.lugar || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    page: filters.page ?? 0,
    size: filters.size ?? 100, // Por defecto obtenemos un lote grande para feed continuo
    sort: filters.sort ?? 'desc',
  };

  const response = await axiosClient.get<PageResponse<Reporte>>('reports', { params });
  return response.data;
}

/**
 * Obtiene las publicaciones del usuario autenticado.
 * GET /api/reports/mine
 */
export async function getMyReports(): Promise<Reporte[]> {
  const response = await axiosClient.get<Reporte[]>('reports/mine');
  return response.data;
}

/**
 * HU-12: Obtiene el detalle de un reporte por su ID.
 * GET /api/reports/{id}
 */
export async function getReportById(id: number): Promise<Reporte> {
  const response = await axiosClient.get<Reporte>(`reports/${id}`);
  return response.data;
}

/**
 * Registra un nuevo reporte (PERDIDO o ENCONTRADO).
 * POST /api/reports
 */
export async function createReport(data: CreateReportRequest): Promise<Reporte> {
  const response = await axiosClient.post<Reporte>('reports', data);
  return response.data;
}

/**
 * Sube hasta 3 imágenes asociadas a un reporte.
 * POST /api/reports/{id}/images
 */
export async function uploadReportImages(id: number, files: File[]): Promise<Reporte> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await axiosClient.post<Reporte>(`reports/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Elimina un reporte del usuario.
 * DELETE /api/reports/{id}
 */
export async function deleteReport(id: number): Promise<{ mensaje: string }> {
  const response = await axiosClient.delete<{ mensaje: string }>(`reports/${id}`);
  return response.data;
}

/**
 * HU-13: Actualiza un reporte del usuario.
 * PUT /api/reports/{id}
 */
export async function updateReport(id: number, data: CreateReportRequest): Promise<Reporte> {
  const response = await axiosClient.put<Reporte>(`reports/${id}`, data);
  return response.data;
}

/**
 * HU-16: Marca un reporte como recuperado (resuelto).
 * PATCH /api/reports/{id}/resolve
 */
export async function resolveReport(id: number): Promise<Reporte> {
  const response = await axiosClient.patch<Reporte>(`reports/${id}/resolve`);
  return response.data;
}

export interface MatchResponse extends Reporte {
  score: number;
}

/**
 * HU-18: Obtener coincidencias sugeridas.
 * GET /api/reports/{id}/matches
 */
export async function getSuggestedMatches(id: number): Promise<MatchResponse[]> {
  const response = await axiosClient.get<MatchResponse[]>(`reports/${id}/matches`);
  return response.data;
}



