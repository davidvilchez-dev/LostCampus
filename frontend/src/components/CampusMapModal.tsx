import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CampusMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
  currentLocation: string;
}

// Coordenadas por defecto (Campus UNSCH, Ayacucho)
const DEFAULT_LAT = -13.1469724;
const DEFAULT_LNG = -74.2210106;

export default function CampusMapModal({ isOpen, onClose, onSelectLocation, currentLocation }: CampusMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [detectedLocation, setDetectedLocation] = useState<string>(currentLocation || 'Selecciona un punto en el mapa');
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  // Icono personalizado para Leaflet (evita assets rotos y añade estética premium)
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-leaflet-pin-wrapper',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
          <svg class="text-blue-500 w-8 h-8 drop-shadow-[0_4px_8px_rgba(59,130,246,0.5)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  };

  // Función para obtener la dirección real con Nominatim (OSM)
  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`
      );
      if (!response.ok) throw new Error('Error al consultar geocodificación');
      const data = await response.json();
      
      if (data && data.display_name) {
        // Recortar la dirección para que no sea excesivamente larga
        const addressParts = data.display_name.split(',');
        const simplifiedAddress = addressParts.slice(0, 3).join(',').trim();
        setDetectedLocation(simplifiedAddress);
      } else {
        setDetectedLocation(`Ubicación seleccionada (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setDetectedLocation(`Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Inicializar mapa de Leaflet
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Crear el mapa si no existe
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([coords.lat, coords.lng], 17);

      // Capa de mapas OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Crear marcador inicial
      const marker = L.marker([coords.lat, coords.lng], {
        icon: createCustomIcon(),
        draggable: true
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Evento al arrastrar el pin
      marker.on('dragend', async (event) => {
        const markerPos = event.target.getLatLng();
        setCoords({ lat: markerPos.lat, lng: markerPos.lng });
        await fetchAddress(markerPos.lat, markerPos.lng);
      });

      // Evento al hacer clic en el mapa
      map.on('click', async (event) => {
        const { lat, lng } = event.latlng;
        setCoords({ lat, lng });
        marker.setLatLng([lat, lng]);
        await fetchAddress(lat, lng);
      });

      // Consultar dirección inicial
      fetchAddress(coords.lat, coords.lng);
    }

    // Limpieza al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectLocation(detectedLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-brand-bg-dark border border-brand-border-light rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-slide-in-left">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border-dark flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-text">Seleccionar Ubicación Real en el Mapa</h3>
            <p className="text-xs text-brand-muted mt-0.5">Mueve el pin o haz clic en cualquier lugar para ubicar el objeto.</p>
          </div>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container con filtro de Modo Oscuro */}
        <div className="relative w-full aspect-auto min-h-[300px] bg-brand-bg-dark leaflet-dark-mode">
          <div ref={mapContainerRef} className="w-full h-full z-0"></div>
        </div>

        {/* Footer info & Actions */}
        <div className="px-6 py-4 bg-brand-bg-dark border-t border-brand-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5 text-sm text-brand-text self-start sm:self-auto">
            {isLoadingLocation ? (
              <>
                <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                <span className="text-brand-muted">Obteniendo dirección...</span>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 text-brand-accent shrink-0" />
                <span className="font-semibold line-clamp-1">{detectedLocation}</span>
              </>
            )}
          </div>

          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-brand-muted hover:text-brand-text border border-brand-border-dark hover:border-brand-border-light rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoadingLocation}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-brand-text bg-brand-accent hover:brightness-110 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
            >
              Confirmar ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
