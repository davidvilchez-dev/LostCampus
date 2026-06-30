import { create } from 'zustand';
import {
  loginUser,
  registerUser,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
} from '../api/authService';

/* ═══════════════════════════════════════════════════
   TIPOS DEL STORE
   ═══════════════════════════════════════════════════ */

interface User {
  id: number;
  nombre_completo: string;
  correo: string;
  foto_url: string | null;
  es_admin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  /** Registra un nuevo usuario y redirige al login */
  register: (data: RegisterRequest) => Promise<boolean>;
  /** Inicia sesión y almacena el token + usuario */
  login: (data: LoginRequest) => Promise<boolean>;
  /** Cierra sesión y limpia el estado */
  logout: () => void;
  /** Limpia errores del store */
  clearError: () => void;
  /** Actualiza los datos del perfil del usuario localmente */
  updateProfile: (nombre_completo: string, foto_url: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

/* ═══════════════════════════════════════════════════
   STORE CON PERSISTENCIA LOCAL
   ═══════════════════════════════════════════════════ */

const getStoredToken = () => localStorage.getItem('lostcampus_token');
const getStoredUser = () => {
  const userJson = localStorage.getItem('lostcampus_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    localStorage.removeItem('lostcampus_user');
    return null;
  }
};

const initialToken = getStoredToken();
const initialUser = getStoredUser();

const useAuthStore = create<AuthStore>((set) => ({
  // Estado inicial
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken && !!initialUser,
  isLoading: false,
  error: null,

  // Acciones
  register: async (data: RegisterRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await registerUser(data);
      set({ isLoading: false });
      return true; // Registro exitoso → el componente redirige a /login
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || 'Error al registrar. Intenta de nuevo.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  login: async (data: LoginRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await loginUser(data);
      
      // Guardar en localStorage
      localStorage.setItem('lostcampus_token', response.token);
      localStorage.setItem('lostcampus_user', JSON.stringify(response.usuario));

      set({
        user: response.usuario,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true; // Login exitoso → el componente redirige al feed
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || 'Correo o contraseña incorrectos.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: () => {
    // Limpiar localStorage
    localStorage.removeItem('lostcampus_token');
    localStorage.removeItem('lostcampus_user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  updateProfile: (nombre_completo: string, foto_url: string | null) => {
    set((state) => {
      if (state.user) {
        const updatedUser = {
          ...state.user,
          nombre_completo,
          foto_url,
        };
        localStorage.setItem('lostcampus_user', JSON.stringify(updatedUser));
        return {
          user: updatedUser,
        };
      }
      return {};
    });
  },
}));

export default useAuthStore;
