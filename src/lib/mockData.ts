// Mock data for College Bus Tracking System
// This will be replaced with Supabase data later

export interface Bus {
  id: string;
  busNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  status: 'running' | 'stopped' | 'maintenance' | 'delayed';
  currentLocation: {
    lat: number;
    lng: number;
  };
  lastUpdated: string;
  eta: string;
  speed: number;
}

export interface EmergencyReport {
  id: string;
  type: 'breakdown' | 'accident' | 'medical' | 'women_safety';
  busNumber?: string;
  message?: string;
  studentLocation?: { lat: number; lng: number };
  createdAt: string;
  status: 'pending' | 'acknowledged' | 'resolved';
}

export interface Feedback {
  id: string;
  category: 'bus' | 'driver' | 'app' | 'safety';
  message: string;
  createdAt: string;
}

// College coordinates (example: centered around a college area)
export const COLLEGE_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
  name: "City Engineering College"
};

// Mock bus data with different locations around the college
export const mockBuses: Bus[] = [
  {
    id: '1',
    busNumber: 'CB-101',
    routeName: 'Koramangala - College',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    capacity: 45,
    status: 'running',
    currentLocation: { lat: 12.9352, lng: 77.6245 },
    lastUpdated: new Date().toISOString(),
    eta: '15 mins',
    speed: 35,
  },
  {
    id: '2',
    busNumber: 'CB-102',
    routeName: 'Indiranagar - College',
    driverName: 'Suresh Reddy',
    driverPhone: '+91 98765 43211',
    capacity: 45,
    status: 'running',
    currentLocation: { lat: 12.9784, lng: 77.6408 },
    lastUpdated: new Date().toISOString(),
    eta: '8 mins',
    speed: 42,
  },
  {
    id: '3',
    busNumber: 'CB-103',
    routeName: 'Whitefield - College',
    driverName: 'Mohammed Irfan',
    driverPhone: '+91 98765 43212',
    capacity: 50,
    status: 'delayed',
    currentLocation: { lat: 12.9698, lng: 77.7500 },
    lastUpdated: new Date().toISOString(),
    eta: '25 mins',
    speed: 28,
  },
  {
    id: '4',
    busNumber: 'CB-104',
    routeName: 'Electronic City - College',
    driverName: 'Venkatesh Prasad',
    driverPhone: '+91 98765 43213',
    capacity: 45,
    status: 'stopped',
    currentLocation: { lat: 12.8456, lng: 77.6603 },
    lastUpdated: new Date().toISOString(),
    eta: '35 mins',
    speed: 0,
  },
  {
    id: '5',
    busNumber: 'CB-105',
    routeName: 'Jayanagar - College',
    driverName: 'Pradeep Sharma',
    driverPhone: '+91 98765 43214',
    capacity: 40,
    status: 'running',
    currentLocation: { lat: 12.9250, lng: 77.5938 },
    lastUpdated: new Date().toISOString(),
    eta: '12 mins',
    speed: 38,
  },
  {
    id: '6',
    busNumber: 'CB-106',
    routeName: 'Marathahalli - College',
    driverName: 'Anil Kumar',
    driverPhone: '+91 98765 43215',
    capacity: 45,
    status: 'running',
    currentLocation: { lat: 12.9591, lng: 77.6974 },
    lastUpdated: new Date().toISOString(),
    eta: '18 mins',
    speed: 30,
  },
  {
    id: '7',
    busNumber: 'CB-107',
    routeName: 'HSR Layout - College',
    driverName: 'Ravi Teja',
    driverPhone: '+91 98765 43216',
    capacity: 45,
    status: 'maintenance',
    currentLocation: { lat: 12.9116, lng: 77.6389 },
    lastUpdated: new Date().toISOString(),
    eta: 'N/A',
    speed: 0,
  },
  {
    id: '8',
    busNumber: 'CB-108',
    routeName: 'BTM Layout - College',
    driverName: 'Kiran Raj',
    driverPhone: '+91 98765 43217',
    capacity: 40,
    status: 'running',
    currentLocation: { lat: 12.9166, lng: 77.6101 },
    lastUpdated: new Date().toISOString(),
    eta: '10 mins',
    speed: 40,
  },
];

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Get status color
export function getStatusColor(status: Bus['status']): string {
  switch (status) {
    case 'running':
      return 'bg-success';
    case 'stopped':
      return 'bg-warning';
    case 'delayed':
      return 'bg-accent';
    case 'maintenance':
      return 'bg-muted-foreground';
    default:
      return 'bg-muted';
  }
}

// Get status text
export function getStatusText(status: Bus['status']): string {
  switch (status) {
    case 'running':
      return 'On Route';
    case 'stopped':
      return 'Stopped';
    case 'delayed':
      return 'Delayed';
    case 'maintenance':
      return 'Under Maintenance';
    default:
      return 'Unknown';
  }
}
