import { useState, type ReactNode, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Etiqueta que se muestra arriba del input en uppercase */
  label: string;
  /** Icono de Lucide que se renderiza dentro del input a la izquierda */
  icon: ReactNode;
  /** Mensaje de error. Si existe, activa el estado visual de error */
  error?: string;
  /** Valor actual del input */
  value: string;
  /** Callback al cambiar el valor */
  onChange: (value: string) => void;
  /** Si true, muestra el toggle de mostrar/ocultar contraseña */
  isPassword?: boolean;
}

export default function AuthInput({
  label,
  icon,
  error,
  value,
  onChange,
  isPassword = false,
  type = 'text',
  ...rest
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = [
    'auth-input',
    error ? 'auth-input-error' : '',
    isPassword ? 'auth-input-with-action' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col space-y-1.5">
      {/* Etiqueta */}
      <label className="text-xs font-bold text-brand-muted tracking-wider uppercase">
        {label}
      </label>

      {/* Contenedor del input */}
      <div className="relative">
        {/* Icono izquierdo */}
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : 'text-brand-muted/60'} pointer-events-none transition-colors`}>
          {icon}
        </span>

        {/* Input */}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${rest.id || label}-error` : undefined}
          {...rest}
        />

        {/* Botón toggle contraseña */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted/60 hover:text-brand-muted transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p
          id={`${rest.id || label}-error`}
          className="auth-field-error"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
