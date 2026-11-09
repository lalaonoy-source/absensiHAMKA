import { User, AttendanceRecord } from '../types';

const USERS_KEY = 'hamka_users_v1';
const CURRENT_USER_KEY = 'hamka_current_user_v1';
const ATTENDANCE_KEY = 'hamka_attendance_records_v1';

const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Ahmad Naufal',
    phone: '081234567890',
    password: 'password123',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'usr_2',
    name: 'Fatimah Zahra',
    phone: '085712345678',
    password: 'password123',
    createdAt: '2026-10-05T09:00:00Z',
  },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'att_1',
    userId: 'usr_1',
    name: 'Ahmad Naufal',
    department: 'Departemen organisasi',
    date: '2026-10-24',
    activityName: 'Rapat Koordinasi Departemen',
    status: 'Hadir',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    photoFileName: 'bukti-kehadiran-20261024-091522.jpg',
    location: {
      latitude: -6.238872,
      longitude: 106.791512,
      locationName: 'Kampus A UHAMKA (Limau), Kebayoran Baru, Jakarta Selatan',
      mapsUrl: 'https://www.google.com/maps?q=-6.238872,106.791512',
    },
    createdAt: '2026-10-24T09:15:22Z',
    deviceInfo: 'Kamera Web Terverifikasi (Chrome 128 / Windows)',
  },
  {
    id: 'att_2',
    userId: 'usr_1',
    name: 'Ahmad Naufal',
    department: 'Departemen organisasi',
    date: '2026-10-22',
    activityName: 'Kajian Rutin & Evaluasi Mingguan',
    status: 'Hadir',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    photoFileName: 'bukti-kehadiran-20261022-133010.jpg',
    location: {
      latitude: -6.307519,
      longitude: 106.866811,
      locationName: 'Kampus B UHAMKA (Pasar Rebo), Ciracas, Jakarta Timur',
      mapsUrl: 'https://www.google.com/maps?q=-6.307519,106.866811',
    },
    createdAt: '2026-10-22T13:30:10Z',
    deviceInfo: 'Kamera Web Terverifikasi (Chrome 128 / Windows)',
  },
  {
    id: 'att_3',
    userId: 'usr_1',
    name: 'Ahmad Naufal',
    department: 'Departemen organisasi',
    date: '2026-10-18',
    activityName: 'Workshop Manajemen Kepemimpinan HAMKA',
    status: 'Hadir',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    photoFileName: 'bukti-kehadiran-20261018-084501.jpg',
    location: {
      latitude: -6.216342,
      longitude: 106.901235,
      locationName: 'Kampus C UHAMKA (Klender), Duren Sawit, Jakarta Timur',
      mapsUrl: 'https://www.google.com/maps?q=-6.216342,106.901235',
    },
    createdAt: '2026-10-18T08:45:01Z',
    deviceInfo: 'Kamera Web Terverifikasi (Chrome 128 / Windows)',
  },
];

export const StorageService = {
  getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  registerUser(name: string, phone: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    const cleanName = name.trim();

    if (!cleanName) {
      return { success: false, message: 'Nama tidak boleh kosong.' };
    }
    if (cleanPhone.length < 9) {
      return { success: false, message: 'Nomor telepon minimal 9 digit angka.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter.' };
    }

    const exists = users.find(
      (u) => u.phone === cleanPhone || u.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (exists) {
      return { success: false, message: 'Nama atau Nomor telepon sudah terdaftar di sistem.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      phone: cleanPhone,
      password: password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    return { success: true, message: 'Registrasi berhasil!', user: newUser };
  },

  loginUser(name: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanName = name.trim().toLowerCase();

    const user = users.find(
      (u) =>
        (u.name.toLowerCase() === cleanName || u.phone === cleanName) &&
        u.password === password
    );

    if (!user) {
      return { success: false, message: 'Nama/No. Telepon atau password salah.' };
    }

    this.setCurrentUser(user);
    return { success: true, message: 'Login berhasil.', user };
  },

  resetPasswordByPhone(phone: string, newPassword: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const cleanPhone = phone.trim().replace(/[-\s]/g, '');

    const index = users.findIndex((u) => u.phone === cleanPhone);
    if (index === -1) {
      return {
        success: false,
        message: 'Nomor telepon tidak ditemukan dalam database HAMKA. Silakan cek kembali atau daftar baru.',
      };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter.' };
    }

    users[index].password = newPassword;
    this.saveUsers(users);

    return {
      success: true,
      message: `Password untuk akun "${users[index].name}" berhasil diperbarui! Silakan masuk kembali dengan password baru Anda.`,
    };
  },

  getAttendanceRecords(): AttendanceRecord[] {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RECORDS;
    }
  },

  saveAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'createdAt'>): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att_${Date.now()}`,
      createdAt: new Date().toISOString(),
      deviceInfo: 'Kamera Langsung Browser Terverifikasi',
    };
    records.unshift(newRecord);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    return newRecord;
  },

  clearData() {
    localStorage.removeItem(ATTENDANCE_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
