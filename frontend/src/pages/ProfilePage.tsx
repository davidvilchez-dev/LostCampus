import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Camera, Mail, Lock, Eye, EyeOff, Check, AlertTriangle, ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { uploadAvatar, updateProfile as updateProfileApi, changePassword } from '../api/authService';

interface ProfileErrors {
  nombre_completo?: string;
}

interface PasswordErrors {
  clave_actual?: string;
  clave_nueva?: string;
  confirmar_clave?: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de datos personales
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombre_completo || '');
  const [carrera, setCarrera] = useState('Ingeniería de Sistemas');
  const [fotoUrl, setFotoUrl] = useState<string | null>(user?.foto_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

  // Estados de cambio de contraseña
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [showClaveActual, setShowClaveActual] = useState(false);
  const [showClaveNueva, setShowClaveNueva] = useState(false);
  const [showConfirmarClave, setShowConfirmarClave] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  const carreras = [
    'Ingeniería de Sistemas',
    'Ingeniería Civil',
    'Ciencias de la Comunicación',
    'Derecho y Gobernabilidad',
    'Medicina Humana',
    'Administración de Empresas',
    'Educación Secundaria',
  ];

  // Obtener iniciales para el avatar
  const getInitials = (name: string) => {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Manejo de carga de avatar por archivo
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeBytes = 3 * 1024 * 1024; // 3MB
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato no compatible. Solo se admiten PNG o JPG.');
        return;
      }
      if (file.size > maxSizeBytes) {
        toast.error('La imagen excede el límite de 3MB.');
        return;
      }

      setAvatarFile(file);
      const localUrl = URL.createObjectURL(file);
      setFotoUrl(localUrl);
    }
  };

  // Guardar datos personales
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const errors: ProfileErrors = {};
    let isValid = true;

    if (!nombreCompleto.trim()) {
      errors.nombre_completo = 'El nombre completo es obligatorio.';
      isValid = false;
    } else if (nombreCompleto.trim().length < 3) {
      errors.nombre_completo = 'El nombre debe tener al menos 3 caracteres.';
      isValid = false;
    }

    setProfileErrors(errors);

    if (!isValid) {
      toast.error('Corrige los errores del formulario.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      let finalFotoUrl = fotoUrl;

      // Si el usuario seleccionó un archivo local, lo subimos a Cloudinary primero
      if (avatarFile) {
        const updatedUser = await uploadAvatar(avatarFile);
        finalFotoUrl = updatedUser.foto_url;
      }

      // Actualizar datos de texto (nombre)
      await updateProfileApi({
        nombre_completo: nombreCompleto,
        foto_url: finalFotoUrl || undefined,
      });

      // Sincronizar estado de Zustand
      updateProfile(nombreCompleto, finalFotoUrl);
      setAvatarFile(null);
      toast.success('Perfil guardado');
    } catch (err: any) {
      const message = err.response?.data?.error || 'No se pudo actualizar el perfil.';
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Actualizar contraseña
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    const errors: PasswordErrors = {};
    let isValid = true;

    if (!claveActual) {
      errors.clave_actual = 'La contraseña actual es obligatoria.';
      isValid = false;
    }

    if (!claveNueva) {
      errors.clave_nueva = 'La nueva contraseña es obligatoria.';
      isValid = false;
    } else if (claveNueva.length < 6) {
      errors.clave_nueva = 'La contraseña debe tener al menos 6 caracteres.';
      isValid = false;
    }

    if (!confirmarClave) {
      errors.confirmar_clave = 'Debes confirmar la contraseña.';
      isValid = false;
    } else if (claveNueva !== confirmarClave) {
      errors.confirmar_clave = 'Las contraseñas no coinciden.';
      isValid = false;
    }

    setPasswordErrors(errors);

    if (!isValid) {
      toast.error('Corrige los errores de seguridad.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword({
        contrasena_actual: claveActual,
        nueva_contrasena: claveNueva,
      });
      setClaveActual('');
      setClaveNueva('');
      setConfirmarClave('');
      toast.success('Contraseña actualizada');
    } catch (err: any) {
      const message = err.response?.data?.error || 'No se pudo actualizar la contraseña.';
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2.5">
          <UserCog className="w-7 h-7 text-brand-accent shrink-0" />
          <span>Perfil de Usuario</span>
        </h1>
        <p className="text-brand-muted text-xs mt-0.5 font-normal">
          Gestiona tu información personal y la seguridad de tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Columna Izquierda: Datos Personales */}
        <form onSubmit={handleSaveProfile} className="rounded-2xl border border-brand-border-dark bg-brand-card p-4 lg:p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-brand-text">Datos Personales</h2>
              <div className="h-px bg-brand-border-dark/50 my-3"></div>
            </div>

            {/* Gestión del Avatar */}
            <div className="flex flex-row items-center justify-center gap-6 py-2">
              <div className="relative group shrink-0">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={nombreCompleto}
                    className="w-20 h-20 rounded-full object-cover border-2 border-brand-accent/50 group-hover:brightness-90 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-accent/15 border-2 border-brand-accent/40 flex items-center justify-center text-brand-accent font-extrabold text-xl group-hover:bg-brand-accent/20 transition-all duration-300 shadow-lg">
                    {getInitials(nombreCompleto)}
                  </div>
                )}

                {/* Botón flotante para subir foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-brand-accent hover:brightness-110 text-brand-text rounded-full shadow-lg border border-brand-border-light cursor-pointer transition-transform hover:scale-105"
                  title="Cambiar avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Selector Rápido de Galería de Avatares */}
              <div className="flex flex-col space-y-1.5">
                <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">O elige un avatar rápido</span>
                <div className="flex gap-2">
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFotoUrl(avatar);
                        setAvatarFile(null);
                      }}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                        fotoUrl === avatar ? 'border-brand-accent scale-105' : 'border-transparent hover:border-brand-muted/40'
                      }`}
                    >
                      <img src={avatar} alt={`Avatar Preestablecido ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Nombre */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className={`w-full bg-[#131c31] border rounded-xl py-2 px-3 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all ${
                  profileErrors.nombre_completo
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent'
                }`}
              />
              {profileErrors.nombre_completo && (
                <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {profileErrors.nombre_completo}
                </p>
              )}
            </div>

            {/* Input Correo (Deshabilitado) */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Correo electrónico (Solo lectura)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.correo || ''}
                  className="w-full border border-brand-border-dark/60 rounded-xl py-2 pl-10 pr-3.5 text-sm text-brand-muted cursor-not-allowed outline-none"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted/30" />
              </div>
            </div>

            {/* Selector de Carrera */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Carrera profesional</label>
              <select
                value={carrera}
                onChange={(e) => setCarrera(e.target.value)}
                className="w-full bg-[#131c31] border border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent rounded-xl py-2 px-3 text-sm text-brand-text outline-none cursor-pointer appearance-none animate-none"
              >
                {carreras.map((c) => (
                  <option key={c} value={c} className="bg-brand-card">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="glow-btn-primary w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-brand-text shadow-lg cursor-pointer flex items-center justify-center space-x-2"
            >
              {isUpdatingProfile ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Columna Derecha: Seguridad */}
        <form onSubmit={handleUpdatePassword} className="rounded-2xl border border-brand-border-dark bg-brand-card p-4 lg:p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-brand-text">Seguridad y Acceso</h2>
              <div className="h-px bg-brand-border-dark/50 my-2"></div>
            </div>

            {/* Contraseña Actual */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Contraseña actual</label>
              <div className="relative">
                <input
                  type={showClaveActual ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={claveActual}
                  onChange={(e) => setClaveActual(e.target.value)}
                  className={`w-full bg-[#131c31] border rounded-xl py-2 pl-10 pr-10 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all ${
                    passwordErrors.clave_actual
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent'
                  }`}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted/40" />
                <button
                  type="button"
                  onClick={() => setShowClaveActual(!showClaveActual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted/50 hover:text-brand-text cursor-pointer"
                >
                  {showClaveActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.clave_actual && (
                <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {passwordErrors.clave_actual}
                </p>
              )}
            </div>

            {/* Contraseña Nueva */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showClaveNueva ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={claveNueva}
                  onChange={(e) => setClaveNueva(e.target.value)}
                  className={`w-full bg-[#131c31] border rounded-xl py-2 pl-10 pr-10 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all ${
                    passwordErrors.clave_nueva
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent'
                  }`}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted/40" />
                <button
                  type="button"
                  onClick={() => setShowClaveNueva(!showClaveNueva)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted/50 hover:text-brand-text cursor-pointer"
                >
                  {showClaveNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.clave_nueva && (
                <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {passwordErrors.clave_nueva}
                </p>
              )}
            </div>

            {/* Confirmar Contraseña Nueva */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Confirmar nueva contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmarClave ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmarClave}
                  onChange={(e) => setConfirmarClave(e.target.value)}
                  className={`w-full bg-[#131c31] border rounded-xl py-2 pl-10 pr-10 text-sm text-brand-text placeholder-brand-muted/40 outline-none transition-all ${
                    passwordErrors.confirmar_clave
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-brand-border-dark hover:border-[#24355a] focus:border-brand-accent'
                  }`}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted/40" />
                <button
                  type="button"
                  onClick={() => setShowConfirmarClave(!showConfirmarClave)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted/50 hover:text-brand-text cursor-pointer"
                >
                  {showConfirmarClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmar_clave && (
                <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {passwordErrors.confirmar_clave}
                </p>
              )}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="glow-btn-secondary w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-brand-text shadow-lg cursor-pointer flex items-center justify-center space-x-2"
            >
              {isUpdatingPassword ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Actualizar contraseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
