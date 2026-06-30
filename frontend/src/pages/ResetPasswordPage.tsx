import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import AuthInput from '../components/AuthInput';

import { useSearchParams } from 'react-router';
import { resetPassword } from '../api/authService';

interface FormErrors {
  clave_nueva?: string;
  confirmar_clave?: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [claveNueva, setClaveNueva] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [showClaveNueva, setShowClaveNueva] = useState(false);
  const [showConfirmarClave, setShowConfirmarClave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const currentYear = new Date().getFullYear();

  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!claveNueva) {
      tempErrors.clave_nueva = 'La nueva contraseña es obligatoria.';
      isValid = false;
    } else if (claveNueva.length < 6) {
      tempErrors.clave_nueva = 'La contraseña debe tener al menos 6 caracteres.';
      isValid = false;
    }

    if (!confirmarClave) {
      tempErrors.confirmar_clave = 'Debes confirmar la contraseña.';
      isValid = false;
    } else if (claveNueva !== confirmarClave) {
      tempErrors.confirmar_clave = 'Las contraseñas no coinciden.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Corrige los errores del formulario.');
      return;
    }

    if (!token) {
      toast.error('El token de recuperación no es válido o no está presente en la URL.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, nueva_contrasena: claveNueva });
      toast.success('¡Contraseña restablecida correctamente!');
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.error || 'No se pudo restablecer la contraseña.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-brand-bg flex flex-col items-center justify-center p-4 relative select-none">
      {/* Background blobs decorativos */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-brand-card border border-brand-border-dark p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo className="w-12 h-12" />
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">
              Restablecer contraseña
            </h1>
            <p className="text-brand-muted text-xs mt-2 leading-relaxed">
              Crea una nueva contraseña segura para tu cuenta de LostCampus.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-5">
            {/* Contraseña Nueva */}
            <div className="relative">
              <AuthInput
                label="Nueva contraseña"
                icon={<Lock className="w-4.5 h-4.5" />}
                type={showClaveNueva ? 'text' : 'password'}
                placeholder="••••••••"
                value={claveNueva}
                onChange={(val) => {
                  setClaveNueva(val);
                  if (errors.clave_nueva) setErrors((prev) => ({ ...prev, clave_nueva: undefined }));
                }}
                error={errors.clave_nueva}
                id="reset-new-password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowClaveNueva(!showClaveNueva)}
                className="absolute right-3.5 top-[38px] text-brand-muted/50 hover:text-brand-text cursor-pointer z-10"
              >
                {showClaveNueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirmar Contraseña Nueva */}
            <div className="relative">
              <AuthInput
                label="Confirmar nueva contraseña"
                icon={<Lock className="w-4.5 h-4.5" />}
                type={showConfirmarClave ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmarClave}
                onChange={(val) => {
                  setConfirmarClave(val);
                  if (errors.confirmar_clave) setErrors((prev) => ({ ...prev, confirmar_clave: undefined }));
                }}
                error={errors.confirmar_clave}
                id="reset-confirm-password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmarClave(!showConfirmarClave)}
                className="absolute right-3.5 top-[38px] text-brand-muted/50 hover:text-brand-text cursor-pointer z-10"
              >
                {showConfirmarClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-btn-submit flex items-center justify-center space-x-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0f172a]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Restableciendo...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span>Restablecer contraseña</span>
                </>
              )}
            </button>
          </form>

          {/* Enlace de regreso */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al inicio de sesión</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer mini */}
      <p className="text-brand-muted/40 text-xs mt-8 tracking-wider uppercase relative z-10">
        LostCampus © {currentYear}
      </p>
    </div>
  );
}
