import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { ShieldCheck, ArrowLeft, RefreshCw, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import useAuthStore from '../store/authStore';
import { resendCode } from '../api/authService';

export default function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verify, isLoading, error, clearError } = useAuthStore();

  const emailParam = searchParams.get('correo') || '';
  const [correo, setCorreo] = useState(emailParam);
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentYear = new Date().getFullYear();

  // Cooldown de reenvío de código
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Enfocar el primer input al cargar
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    clearError();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // Solo números

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1); // Tomar solo el último caracter
    setPin(newPin);

    // Mover foco al siguiente input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0 && inputRefs.current[index - 1]) {
      // Mover al anterior en retroceso si el actual está vacío
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Validar que sean exactamente 6 dígitos

    const newPin = pastedData.split('');
    setPin(newPin);

    // Enfocar el último input
    if (inputRefs.current[5]) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = pin.join('');
    if (code.length !== 6) {
      toast.error('Ingresa el código completo de 6 dígitos.');
      return;
    }

    if (!correo) {
      toast.error('Correo electrónico inválido.');
      return;
    }

    const success = await verify(correo, code);
    if (success) {
      toast.success('¡Cuenta verificada con éxito!');
      navigate('/feed');
    } else {
      const storeError = useAuthStore.getState().error;
      toast.error(storeError || 'Código de verificación incorrecto.');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !correo) return;

    setIsResending(true);
    try {
      await resendCode({ correo });
      toast.success('Código reenviado. Revisa tu correo.');
      setCooldown(60); // 60 segundos de cooldown
    } catch (err: any) {
      const message = err.response?.data?.error || 'No se pudo reenviar el código.';
      toast.error(message);
    } finally {
      setIsResending(false);
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
            <div className="inline-flex p-3 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-xl mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">
              Verifica tu cuenta
            </h1>
            <p className="text-brand-muted text-xs mt-2 leading-relaxed px-4">
              Ingresa el código de 6 dígitos que hemos enviado a:
            </p>
            <p className="text-brand-text text-sm font-bold truncate mt-1">
              {correo || 'tu correo'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input de PIN */}
            <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-11 h-13 bg-[#0d1424] border border-brand-border-dark focus:border-brand-accent focus:ring-1 focus:ring-brand-accent rounded-lg text-center text-xl font-bold text-brand-text outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-btn-submit flex items-center justify-center space-x-2 w-full py-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0f172a]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4.5 h-4.5 shrink-0" />
                  <span>Verificar código</span>
                </>
              )}
            </button>
          </form>

          {/* Reenvío de código */}
          <div className="text-center pt-2">
            <p className="text-brand-muted text-xs">
              ¿No recibiste el código?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || isResending}
                className={`font-semibold inline-flex items-center space-x-1 cursor-pointer transition-colors ${
                  cooldown > 0 || isResending
                    ? 'text-brand-muted/40'
                    : 'text-brand-accent hover:text-brand-text'
                }`}
              >
                {isResending ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                <span>
                  {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
                </span>
              </button>
            </p>
          </div>

          {/* Volver al login */}
          <div className="text-center border-t border-brand-border-dark/50 pt-4">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a iniciar sesión</span>
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
