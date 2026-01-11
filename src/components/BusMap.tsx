import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus as BusType } from '@/lib/mockData';

// Fix for default marker icons in Leaflet with bundlers
const createBusIcon = (status: BusType['status']) => {
  const colors: Record<BusType['status'], string> = {
    running: '#22c55e',
    stopped: '#eab308',
    delayed: '#f97316',
    maintenance: '#6b7280',
  };

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background: ${colors[status]};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
        position: relative;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"/>
          <path d="M16 6v6"/>
          <path d="M2 12h19.6"/>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H6c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 10px solid ${colors[status]};
      "></div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

const createStudentIcon = () => {
  return L.divIcon({
    className: 'custom-student-marker',
    html: `
      <div style="
        background: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          animation: pulse-ring 1.5s ease-out infinite;
          opacity: 0.5;
        "></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface BusMapProps {
  bus?: BusType;
  studentLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export function BusMap({ bus, studentLocation, className = '' }: BusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on college area
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [12.9716, 77.5946],
      zoom: 13,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when bus or student location changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds: L.LatLngExpression[] = [];

    // Add student location marker if available
    if (studentLocation) {
      const studentMarker = L.marker(
        [studentLocation.lat, studentLocation.lng],
        { icon: createStudentIcon() }
      )
        .addTo(mapInstanceRef.current)
        .bindPopup('<strong>Your Location</strong>');
      
      markersRef.current.push(studentMarker);
      bounds.push([studentLocation.lat, studentLocation.lng]);
    }

    // Add bus marker if available
    if (bus) {
      const busMarker = L.marker(
        [bus.currentLocation.lat, bus.currentLocation.lng],
        { icon: createBusIcon(bus.status) }
      )
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong style="font-size: 14px;">${bus.busNumber}</strong>
            <p style="margin: 4px 0 0; color: #666; font-size: 12px;">${bus.routeName}</p>
            <p style="margin: 4px 0 0; font-size: 12px;">
              <strong>ETA:</strong> ${bus.eta}
            </p>
          </div>
        `);
      
      markersRef.current.push(busMarker);
      bounds.push([bus.currentLocation.lat, bus.currentLocation.lng]);
    }

    // Fit map to show all markers
    if (bounds.length > 0) {
      if (bounds.length === 1) {
        mapInstanceRef.current.setView(bounds[0] as L.LatLngExpression, 15);
      } else {
        mapInstanceRef.current.fitBounds(bounds as L.LatLngBoundsExpression, {
          padding: [50, 50],
          maxZoom: 15,
        });
      }
    }
  }, [bus, studentLocation]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 md:h-80 rounded-xl overflow-hidden border border-border ${className}`}
    />
  );
}
