import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { toast } from 'react-toastify';

interface ImageUploadDropzoneProps {
  images: File[];
  onChange: (images: File[]) => void;
}

export default function ImageUploadDropzone({ images, onChange }: ImageUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFiles = 3;
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    const validFiles: File[] = [...images];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      if (validFiles.length >= maxFiles) {
        toast.error(`Solo puedes subir un máximo de ${maxFiles} imágenes.`);
        break;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`El archivo "${file.name}" no es válido. Solo se admiten formatos PNG y JPG.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        toast.error(`El archivo "${file.name}" excede el límite de 5MB.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length !== images.length) {
      onChange(validFiles);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Zona de Arrastre */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`w-full aspect-auto min-h-[140px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-brand-accent bg-brand-accent/5 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[0.99]'
            : 'border-brand-border-light bg-[#131c31]/30 hover:border-brand-accent/60 hover:bg-[#1a2642]/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".png, .jpg, .jpeg"
          onChange={handleChange}
        />

        <Upload className={`w-7 h-7 mb-2 transition-colors duration-300 ${isDragActive ? 'text-brand-accent' : 'text-brand-muted/60'}`} />

        <p className="text-sm font-semibold text-brand-text mb-1">
          Arrastra tus fotos aquí o <span className="text-brand-accent hover:underline">explorar archivos</span>
        </p>
        <p className="text-xs text-brand-muted">
          PNG, JPG hasta 5MB (Máximo {maxFiles} fotos)
        </p>
      </div>

      {/* Miniaturas */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, idx) => {
            const previewUrl = URL.createObjectURL(image);
            return (
              <div key={idx} className="relative aspect-square rounded-xl border border-brand-border-dark bg-brand-card overflow-hidden group">
                <img
                  src={previewUrl}
                  alt={`Evidencia ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {/* Slots vacíos placeholder */}
          {Array.from({ length: maxFiles - images.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="aspect-square rounded-xl border border-dashed border-brand-border-dark/60 bg-[#131c31]/10 flex items-center justify-center text-brand-muted/20"
            >
              <FileImage className="w-6 h-6" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
