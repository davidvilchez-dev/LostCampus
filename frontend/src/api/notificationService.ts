import axiosClient from './axiosClient';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'RECLAMO_RECIBIDO' | 'RECLAMO_ACEPTADO' | 'RECLAMO_RECHAZADO' | 'CHAT_MENSAJE' | string;
  leido: boolean;
  enlace: string;
  created_at: string;
}

/**
 * Obtener últimas 15 notificaciones del usuario logueado.
 * GET /api/notificaciones
 */
export async function getNotifications(): Promise<Notificacion[]> {
  const response = await axiosClient.get<Notificacion[]>('notificaciones');
  return response.data;
}

/**
 * Obtener cantidad de notificaciones no leídas.
 * GET /api/notificaciones/unread-count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await axiosClient.get<number>('notificaciones/unread-count');
  return response.data;
}

/**
 * Marcar una notificación individual como leída.
 * PATCH /api/notificaciones/{id}/read
 */
export async function markAsRead(id: number): Promise<Notificacion> {
  const response = await axiosClient.patch<Notificacion>(`notificaciones/${id}/read`);
  return response.data;
}

/**
 * Marcar todas las notificaciones como leídas de forma masiva.
 * PATCH /api/notificaciones/read-all
 */
export async function markAllAsRead(): Promise<void> {
  await axiosClient.patch('notificaciones/read-all');
}
