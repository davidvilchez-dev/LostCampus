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

/**
 * Obtiene el feed paginado de reportes con búsqueda opcional.
 * GET /api/reports?q=&page=&size=
 */
export async function getReports(query = '', page = 0, size = 10): Promise<PageResponse<Reporte>> {
  const response = await axiosClient.get<PageResponse<Reporte>>('reports', {
    params: { q: query, page, size },
  });
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
