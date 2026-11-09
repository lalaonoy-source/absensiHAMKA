import { LocationData } from '../types';

export interface GpsStatus {
  state: 'inactive' | 'detecting' | 'active' | 'denied' | 'unsupported';
  message: string;
  accuracy?: number;
}

// Preset campus coordinates if fallback is ever needed
export const HAMKA_LOCATIONS: { name: string; lat: number; lng: number }[] = [
  {
    name: 'Universitas Muhammadiyah Prof. DR. HAMKA, Kampus A (Limau), Kebayoran Baru, Jakarta Selatan',
    lat: -6.238872,
    lng: 106.791512,
  },
  {
    name: 'Universitas Muhammadiyah Prof. DR. HAMKA, Kampus B (Pasar Rebo), Ciracas, Jakarta Timur',
    lat: -6.307519,
    lng: 106.866811,
  },
  {
    name: 'Universitas Muhammadiyah Prof. DR. HAMKA, Kampus C (Klender), Duren Sawit, Jakarta Timur',
    lat: -6.216342,
    lng: 106.901235,
  },
  {
    name: 'Universitas Muhammadiyah Prof. DR. HAMKA, Kampus FK (Ceger), Cipayung, Jakarta Timur',
    lat: -6.309121,
    lng: 106.892415,
  },
];

/**
 * Reverse-geocode latitude and longitude into high-accuracy Indonesian street address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=19&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const placeName =
          addr.university ||
          addr.school ||
          addr.building ||
          addr.amenity ||
          addr.office ||
          addr.leisure ||
          '';

        const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || '';
        const houseNo = addr.house_number ? `No. ${addr.house_number}` : '';
        const suburb = addr.suburb || addr.quarter || addr.village || '';
        const district = addr.city_district || addr.county || '';
        const city = addr.city || addr.town || addr.regency || addr.municipality || '';

        const parts: string[] = [];
        if (placeName) parts.push(placeName);
        if (road) parts.push(houseNo ? `${road} ${houseNo}` : road);
        if (suburb && suburb !== district) parts.push(suburb);
        if (district && district !== city) parts.push(district);
        if (city) parts.push(city);

        if (parts.length > 0) {
          return parts.join(', ');
        }
        if (data.display_name) {
          return data.display_name.split(',').slice(0, 4).join(', ');
        }
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding fetch error:', err);
  }

  // Fallback if network lookup timed out
  return `Koordinat GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Check if browser permission for geolocation is granted
 */
export async function checkGeolocationPermission(): Promise<PermissionState | null> {
  if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Get device high-accuracy real-time GPS location
 */
export function requestDeviceGpsLocation(): Promise<{
  success: boolean;
  data?: LocationData;
  error?: string;
  isPermissionDenied?: boolean;
}> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Perangkat atau browser Anda tidak mendukung fitur GPS Geolocation.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);

        // Reverse geocode to exact street address
        const locationName = await reverseGeocode(lat, lng);

        resolve({
          success: true,
          data: {
            latitude: lat,
            longitude: lng,
            accuracy: accuracy,
            locationName: locationName,
            mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
          },
        });
      },
      (err) => {
        let msg = 'Gagal mendeteksi lokasi.';
        let isDenied = false;

        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Izin akses lokasi ditolak. Harap izinkan akses lokasi pada browser.';
            isDenied = true;
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Sensor GPS pada HP/Laptop belum aktif atau sinyal satelit tidak tersedia. Mohon nyalakan GPS di pengaturan perangkat.';
            break;
          case err.TIMEOUT:
            msg = 'Waktu pencarian GPS habis. Mohon pastikan GPS perangkat aktif dan coba lagi.';
            break;
          default:
            msg = err.message || 'GPS perangkat belum aktif.';
        }

        resolve({
          success: false,
          error: msg,
          isPermissionDenied: isDenied,
        });
      },
      {
        enableHighAccuracy: true, // Requires device hardware GPS for maximum accuracy
        timeout: 12000,
        maximumAge: 0, // No cached positions, must be real-time
      }
    );
  });
}
