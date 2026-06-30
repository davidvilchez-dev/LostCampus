import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import AuthInput from '../components/AuthInput';
import useAuthStore from '../store/authStore';

interface FormErrors {
  correo?: string;
  contrasena?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  /** Valida los campos del formulario y retorna true si todo es válido */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.correo = 'Ingresa un correo electrónico válido';
    }

    if (!contrasena) {
      newErrors.contrasena = 'La contraseña es obligatoria';
    } else if (contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await login({
      correo: correo.trim().toLowerCase(),
      contrasena,
    });

    if (success) {
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/feed'); // Redirige al feed principal (se implementará en la siguiente spec)
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Resplandor decorativo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-glow-radial pointer-events-none z-0"></div>

      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8 relative z-10">
        <Logo className="w-14 h-14" />
        <span className="text-3xl font-bold tracking-tight">
          <span className="text-brand-text">Lost</span>
          <span className="text-brand-accent">Campus</span>
        </span>
      </div>

      {/* Card del formulario */}
      <div className="auth-card w-full max-w-[440px] rounded-2xl p-8 relative z-10">
        <div className="text-center mb-7">
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
            Iniciar sesión
          </h2>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-5">
          {/* Correo electrónico */}
          <AuthInput
            label="Correo electrónico"
            icon={<Mail className="w-4.5 h-4.5" />}
            type="email"
            placeholder="nombre@ejemplo.com"
            value={correo}
            onChange={setCorreo}
            error={errors.correo}
            id="login-correo"
            autoComplete="email"
          />

          {/* Contraseña */}
          <AuthInput
            label="Contraseña"
            icon={<Lock className="w-4.5 h-4.5" />}
            isPassword
            placeholder="••••••••"
            value={contrasena}
            onChange={setContrasena}
            error={errors.contrasena}
            id="login-contrasena"
            autoComplete="current-password"
          />

          <div className="flex justify-end -mt-2">
            <Link
              to="/recuperar"
              className="text-xs font-semibold text-brand-muted hover:text-brand-accent transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-btn-submit mt-2"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Enlace a registro */}
        <p className="text-center text-brand-muted text-sm mt-6">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="text-brand-text font-semibold hover:text-brand-accent transition-colors"
          >
            Regístrate
          </Link>
        </p>
      </div>

      {/* Footer mini */}
      <p className="text-brand-muted/40 text-xs mt-8 tracking-wider uppercase relative z-10">
        LostCampus © {currentYear}
      </p>
    </div>
  );
}
