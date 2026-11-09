export type StepId = 'welcome' | 'login' | 'form' | 'success';

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin';

export type Department =
  | 'Departemen organisasi'
  | 'departemen penelitian dan pengembangan'
  | 'departemen eksternal'
  | 'departemen komunikasi dan informasi';

export interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  createdAt: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName: string;
  mapsUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  userId?: string;
  name: string;
  department: Department | string;
  date: string;
  activityName: string;
  status: AttendanceStatus;
  photoUrl: string; // base64 or blob url
  photoFileName: string;
  location?: LocationData;
  createdAt: string;
  deviceInfo?: string;
}

