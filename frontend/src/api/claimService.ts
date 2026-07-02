import axiosClient from './axiosClient';

export interface Reclamacion {
  id: number;
  reporte_id: number;
  reporte_nombre_objeto: string;
  reporte_tipo: 'PERDIDO' | 'ENCONTRADO';
  reporte_estado: string;
  reporte_lugar: string;
  reporte_fecha_incidente: string;
  reporte_imagenes_urls: string[];
  reporte_autor_id: number;
  reporte_autor_nombre: string;
  reporte_autor_email: string;
  reclamante_id: number;
  reclamante_nombre: string;
  reclamante_email: string;
  mensaje_prueba: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  created_at: string;
}

/**
 * Envía una solicitud de reclamación de propiedad.
 * POST /api/reclamaciones
 */
export async function createClaim(reporteId: number, mensajePrueba: string): Promise<Reclamacion> {
  const response = await axiosClient.post<Reclamacion>('reclamaciones', {
    reporte_id: reporteId,
    mensaje_prueba: mensajePrueba
  });
  return response.data;
}

/**
 * Obtiene la lista de solicitudes de reclamación enviadas por el usuario logueado.
 * GET /api/reclamaciones/enviadas
 */
export async function getSentClaims(): Promise<Reclamacion[]> {
  const response = await axiosClient.get<Reclamacion[]>('reclamaciones/enviadas');
  return response.data;
}

/**
 * Obtiene la lista de solicitudes de reclamación recibidas sobre los objetos encontrados del usuario logueado.
 * GET /api/reclamaciones/recibidas
 */
export async function getReceivedClaims(): Promise<Reclamacion[]> {
  const response = await axiosClient.get<Reclamacion[]>('reclamaciones/recibidas');
  return response.data;
}

/**
 * Acepta una solicitud de reclamación.
 * POST /api/reclamaciones/{id}/aceptar
 */
export async function acceptClaim(id: number): Promise<Reclamacion> {
  const response = await axiosClient.post<Reclamacion>(`reclamaciones/${id}/aceptar`);
  return response.data;
}

/**
 * Rechaza una solicitud de reclamación.
 * POST /api/reclamaciones/{id}/rechazar
 */
export async function rejectClaim(id: number): Promise<Reclamacion> {
  const response = await axiosClient.post<Reclamacion>(`reclamaciones/${id}/rechazar`);
  return response.data;
}
