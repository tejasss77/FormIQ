import { User, Exercise, Workout, ProgressSummary } from '../types';

// Support optional cloud API base URL override (e.g. Render/Fly.io/AWS), fallback to local proxy /api
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('formiq_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('formiq_token', token);
    } else {
      localStorage.removeItem('formiq_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('formiq-auth-expired'));
        }
      }
      const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, full_name: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(full_name: string): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ full_name }),
    });
  }

  // 2FA TOTP
  async setup2FA(): Promise<{ secret: string; otpauth_url: string; email: string; issuer: string }> {
    return this.request<{ secret: string; otpauth_url: string; email: string; issuer: string }>('/auth/2fa/setup');
  }

  async verify2FA(secret: string, code: string): Promise<{ verified: boolean; message: string }> {
    return this.request<{ verified: boolean; message: string }>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ secret, code }),
    });
  }

  async verify2FALogin(secret: string, code: string): Promise<{ verified: boolean; message: string }> {
    return this.request<{ verified: boolean; message: string }>('/auth/2fa/login-verify', {
      method: 'POST',
      body: JSON.stringify({ secret, code }),
    });
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return this.request<Exercise[]>('/exercises');
  }

  async getExercise(slug: string): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${slug}`);
  }

  // Workouts
  async createWorkout(exercise_slug: string, title?: string): Promise<Workout> {
    return this.request<Workout>('/workouts', {
      method: 'POST',
      body: JSON.stringify({ exercise_slug, title }),
    });
  }

  async listWorkouts(limit: number = 20): Promise<Workout[]> {
    return this.request<Workout[]>(`/workouts?limit=${limit}`);
  }

  async getWorkout(id: number): Promise<Workout> {
    return this.request<Workout>(`/workouts/${id}`);
  }

  async updateWorkout(id: number, updateData: Partial<Workout>): Promise<Workout> {
    return this.request<Workout>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Progress
  async getProgress(period: string = '30D'): Promise<ProgressSummary> {
    return this.request<ProgressSummary>(`/progress?period=${period}`);
  }
}

export const api = new ApiClient();
