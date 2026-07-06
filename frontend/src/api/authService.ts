import axiosClient from './axiosClient';

/* ═══════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════ */

export interface RegisterRequest {
  nombre_completo: string;
  correo: string;
  contrasena: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombre_completo: string;
    correo: string;
    foto_url: string | null;
    es_admin: boolean;
  };
}

export interface ForgotPasswordRequest {
  correo: string;
}

export interface ResetPasswordRequest {
  token: string;
  nueva_contrasena: string;
}

export interface VerifyAccountRequest {
  correo: string;
  codigo: string;
}

export interface ResendCodeRequest {
  correo: string;
}

export interface MessageResponse {
  mensaje: string;
}

/* ═══════════════════════════════════════════════════
   SERVICIOS DE AUTENTICACIÓN
   ═══════════════════════════════════════════════════ */

/**
 * Registra un nuevo usuario.
 * POST /api/auth/register
 */
export async function registerUser(data: RegisterRequest): Promise<MessageResponse> {
  const response = await axiosClient.post<MessageResponse>('auth/register', data);
  return response.data;
}

/**
 * Verifica una cuenta con el código de 6 dígitos.
 * POST /api/auth/verify
 */
export async function verifyAccount(data: VerifyAccountRequest): Promise<AuthResponse> {
  const response = await axiosClient.post<AuthResponse>('auth/verify', data);
  return response.data;
}

/**
 * Reenvía el código de verificación.
 * POST /api/auth/resend-code
 */
export async function resendCode(data: ResendCodeRequest): Promise<MessageResponse> {
  const response = await axiosClient.post<MessageResponse>('auth/resend-code', data);
  return response.data;
}

/**
 * Inicia sesión con credenciales.
 * POST /api/auth/login
 */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await axiosClient.post<AuthResponse>('auth/login', data);
  return response.data;
}

/**
 * Solicita enlace de recuperación de contraseña.
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
  const response = await axiosClient.post<MessageResponse>('auth/forgot-password', data);
  return response.data;
}

/**
 * Restablece la contraseña mediante token.
 * POST /api/auth/reset-password
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
  const response = await axiosClient.post<MessageResponse>('auth/reset-password', data);
  return response.data;
}

/**
 * Obtiene el perfil del usuario autenticado.
 * GET /api/users/me
 */
export async function getProfile(): Promise<AuthResponse['usuario']> {
  const response = await axiosClient.get<AuthResponse['usuario']>('users/me');
  return response.data;
}

/**
 * Actualiza el perfil del usuario.
 * PUT /api/users/me
 */
export async function updateProfile(data: { nombre_completo: string; foto_url?: string }): Promise<AuthResponse['usuario']> {
  const response = await axiosClient.put<AuthResponse['usuario']>('users/me', data);
  return response.data;
}

/**
 * Cambia la contraseña del usuario.
 * PUT /api/users/me/password
 */
export async function changePassword(data: { contrasena_actual: string; nueva_contrasena: string }): Promise<MessageResponse> {
  const response = await axiosClient.put<MessageResponse>('users/me/password', data);
  return response.data;
}

/**
 * Sube una nueva foto de perfil a Cloudinary.
 * POST /api/users/me/avatar
 */
export async function uploadAvatar(file: File): Promise<AuthResponse['usuario']> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post<AuthResponse['usuario']>('users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
