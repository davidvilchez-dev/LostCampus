import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import AuthInput from '../components/AuthInput';
import useAuthStore from '../store/authStore';

interface FormErrors {
  nombre?: string;
  correo?: string;
  contrasena?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const currentYear = new Date().getFullYear();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  /** Valida los campos del formulario y retorna true si todo es válido */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre completo es obligatorio';
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

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

    const success = await register({
      nombre_completo: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      contrasena,
    });

    if (success) {
      toast.success('Cuenta creada');
      navigate('/login');
    } else {
      toast.error('Error al registrar');
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
        <h2 className="text-2xl font-extrabold text-brand-text text-center tracking-tight mb-7">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-5">
          {/* Nombre completo */}
          <AuthInput
            label="Nombre completo"
            icon={<User className="w-4.5 h-4.5" />}
            placeholder="Tu nombre completo"
            value={nombre}
            onChange={setNombre}
            error={errors.nombre}
            id="register-nombre"
            autoComplete="name"
          />

          {/* Correo electrónico */}
          <AuthInput
            label="Correo electrónico"
            icon={<Mail className="w-4.5 h-4.5" />}
            type="email"
            placeholder="ejemplo@unsch.edu.pe"
            value={correo}
            onChange={setCorreo}
            error={errors.correo}
            id="register-correo"
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
            id="register-contrasena"
            autoComplete="new-password"
          />

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-btn-submit mt-2"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        {/* Enlace a login */}
        <p className="text-center text-brand-muted text-sm mt-6">
          Ya tengo una cuenta →{' '}
          <Link
            to="/login"
            className="text-brand-text font-semibold hover:text-brand-accent transition-colors"
          >
            Iniciar sesión
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
