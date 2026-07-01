import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'danger' | 'warning';
  isSubmitting?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  isSubmitting = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getThemeClasses = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />,
          btnConfirm: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          btnConfirm: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/10',
        };
      case 'info':
      default:
        return {
          icon: <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />,
          btnConfirm: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/10',
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={isSubmitting ? undefined : onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl z-10 animate-slide-in-left p-5">
        
        {/* Header (Icon + Title + X) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            {theme.icon}
            <h3 className="text-base font-bold text-slate-100 tracking-wide">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div className="mt-3">
          <p className="text-sm text-slate-400 font-normal leading-relaxed text-left">
            {message}
          </p>
        </div>

        {/* Footer Actions (Right aligned) */}
        <div className="flex justify-end items-center gap-3 mt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/90 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer ${theme.btnConfirm}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
