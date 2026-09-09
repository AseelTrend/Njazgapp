import { UserProfile } from '../types';

const TOKEN_KEY = 'njaz_auth_token';
const DEVICE_ID_KEY = 'njaz_device_id';
const USER_KEY = 'njaz_user';

export class StorageService {
  static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static saveToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error(e);
    }
  }

  static deleteToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error(e);
    }
  }

  static isLoggedIn(): boolean {
    const token = this.getToken();
    return Boolean(token && token.trim().length > 0);
  }

  static getDeviceId(): string {
    try {
      let id = localStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem(DEVICE_ID_KEY, id);
      }
      return id;
    } catch {
      return 'device_default';
    }
  }

  static saveUser(user: Partial<UserProfile>): void {
    try {
      const current = this.getUser();
      const updated: UserProfile = {
        name: user.name ?? (user as any).full_name ?? (user as any).username ?? current.name ?? '',
        balance: user.balance !== undefined ? String(user.balance) : (current.balance || '0.00'),
        uid: user.uid ? String(user.uid) : (current.uid || ''),
        email: user.email ?? current.email ?? '',
        phone: user.phone ?? current.phone ?? '',
        avatar: user.avatar ?? (user as any).profile_avatar ?? current.avatar,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  static getUser(): UserProfile {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: '',
      balance: '0.00',
      uid: '',
      email: '',
      phone: '',
    };
  }

  static getSetting(key: string, defaultValue: string = ''): string {
    try {
      return localStorage.getItem(`njaz_setting_${key}`) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static saveSetting(key: string, value: string): void {
    try {
      localStorage.setItem(`njaz_setting_${key}`, value);
    } catch (e) {
      console.error(e);
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error(e);
    }
  }
}
