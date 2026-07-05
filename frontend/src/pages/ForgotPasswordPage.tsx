import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, Send, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import AuthInput from '../components/AuthInput';
import { forgotPassword } from '../api/authService';

export default function ForgotPasswordPage() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const currentYear = new Date().getFullYear();

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setError('El correo institucional es obligatorio.');
      return false;
    }

    // Expresión regular para validar formato y dominio @unsch.edu.pe
    const unschRegex = /^[a-zA-Z0-9._%+-]+@unsch\.edu\.pe$/;
    if (!unschRegex.test(email.trim())) {
      setError('Solo se admiten correos institucionales terminados en @unsch.edu.pe.');
      return false;
    }

    setError(undefined);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateEmail(correo)) {
      toast.error('Corrige el correo electrónico ingresado.');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword({ correo });
      setIsSent(true);
    } catch (err: any) {
      const message = err.response?.data?.error || 'No se pudo enviar el enlace de recuperación.';
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

        {!isSent ? (
          /* Formulario de Solicitud */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">
                Recuperar contraseña
              </h1>
              <p className="text-brand-muted text-xs mt-2 leading-relaxed">
                Ingresa tu correo institucional registrado para recibir un enlace de recuperación.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-5">
              <AuthInput
                label="Correo institucional"
                icon={<Mail className="w-4.5 h-4.5" />}
                type="email"
                placeholder="usuario@unsch.edu.pe"
                value={correo}
                onChange={(val) => {
                  setCorreo(val);
                  if (error) setError(undefined);
                }}
                error={error}
                id="recovery-email"
                autoComplete="email"
              />

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
                    <span>Enviando enlace...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 shrink-0" />
                    <span>Enviar enlace</span>
                  </>
                )}
              </button>
            </form>

            {/* Volver al login */}
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
        ) : (
          /* Confirmación de Envío Exitoso */
          <div className="space-y-6 text-center animate-slide-in-left">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full mb-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
                ¡Enlace enviado!
              </h2>
            </div>

            <div className="bg-[#131c31]/50 border border-brand-border-dark p-4 rounded-xl space-y-3">
              <p className="text-brand-muted text-xs leading-relaxed">
                Hemos enviado un correo con instrucciones para restablecer tu contraseña a:
              </p>
              <p className="text-brand-text text-sm font-bold truncate">
                {correo}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-amber-400/90 font-medium">
              <Clock className="w-4 h-4 shrink-0" />
              <span>El enlace de recuperación expirará en 15 minutos.</span>
            </div>

            <div className="pt-2 flex flex-col space-y-3">
              <Link
                to="/login"
                className="glow-btn-primary py-3 rounded-xl text-sm font-semibold text-brand-text shadow-lg text-center flex items-center justify-center"
              >
                Volver a iniciar sesión
              </Link>
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="text-xs font-bold text-brand-muted hover:text-brand-text transition-colors py-1 cursor-pointer"
              >
                Volver a intentar con otro correo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer mini */}
      <p className="text-brand-muted/40 text-xs mt-8 tracking-wider uppercase relative z-10">
        LostCampus © {currentYear}
      </p>
    </div>
  );
}
