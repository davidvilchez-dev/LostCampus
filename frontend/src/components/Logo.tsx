import { useId } from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'w-10 h-10' }: LogoProps) {
  const id = useId();
  const gradientId = `lcGrad${id}`;

  return (
    <svg
      className={className}
      viewBox="0 0 66 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LostCampus Logo"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Letra L — blanca, geométrica, gruesa */}
      <path
        d="M3 2 L3 47 L28 47 L28 39 L12 39 L12 2 Z"
        fill="white"
      />

      {/* Letra C — lente de lupa (arco azul con degradado), separada de la L */}
      <path
        d="M 46 13 A 16.5 16.5 0 1 0 46 39"
        stroke={`url(#${gradientId})`}
        strokeWidth="8.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mango de la lupa — blanco, diagonal 45° */}
      <line
        x1="45"
        y1="39"
        x2="58"
        y2="52"
        stroke="white"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Banda/anillo azul donde el mango conecta con el lente */}
      <line
        x1="43"
        y1="37"
        x2="47"
        y2="41"
        stroke="#3b82f6"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
