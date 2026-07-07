import axiosClient from './axiosClient';

export interface ChatRoom {
  id: number;
  reporte_id: number;
  reporte_nombre_objeto: string;
  reporte_tipo: 'PERDIDO' | 'ENCONTRADO';
  reporte_estado: string;
  reporte_imagen_url: string | null;
  interlocutor_id: number;
  interlocutor_nombre: string;
  interlocutor_foto_url: string | null;
  creador_reporte_id: number;
  activo: boolean;
  fecha_confirmacion_entrega: string | null;
  ultimo_mensaje: string | null;
  ultimo_mensaje_hora: string | null;
}

export interface ChatMessage {
  id: number;
  chat_room_id: number;
  remitente_id: number;
  remitente_nombre: string;
  remitente_foto_url: string | null;
  contenido: string;
  imagen_url?: string | null;
  created_at: string;
}

/**
 * Obtiene la lista de chats en los que participa el usuario logueado.
 * GET /api/chats
 */
export async function getChats(): Promise<ChatRoom[]> {
  const response = await axiosClient.get<ChatRoom[]>('chats');
  return response.data;
}

/**
 * Obtiene el historial de mensajes de un chat.
 * GET /api/chats/{chatId}/mensajes
 */
export async function getChatMessages(chatId: number): Promise<ChatMessage[]> {
  const response = await axiosClient.get<ChatMessage[]>(`chats/${chatId}/mensajes`);
  return response.data;
}

/**
 * Confirma la entrega del objeto y cierra la conversación.
 * POST /api/chats/{chatId}/confirmar
 */
export async function confirmDelivery(chatId: number): Promise<ChatRoom> {
  const response = await axiosClient.post<ChatRoom>(`chats/${chatId}/confirmar`);
  return response.data;
}

/**
 * Sube una imagen para el chat.
 * POST /api/chats/upload
 */
export async function uploadChatImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post<{ url: string }>('chats/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.url;
}
