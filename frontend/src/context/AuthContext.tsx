import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  demoLogin: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = api.getToken();
        const savedCustom = localStorage.getItem('formiq_user_profile');
        const customData = savedCustom ? JSON.parse(savedCustom) : {};

        if (storedToken) {
          try {
            const me = await api.getCurrentUser();
            setUser({ ...me, ...customData });
            setToken(storedToken);
          } catch (err) {
            console.warn('Stored session invalid or expired. Resetting to unauthenticated visitor.');
            api.setToken(null);
            setUser(null);
            setToken(null);
          }
        } else {
          // By default, user is NOT logged in until they authenticate
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('formiq-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('formiq-auth-expired', handleAuthExpired);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      const savedCustom = localStorage.getItem('formiq_user_profile');
      const customData = savedCustom ? JSON.parse(savedCustom) : {};
      setUser({ ...res.user, ...customData });
      setToken(res.access_token);
      api.setToken(res.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, fullName);
      setUser(res.user);
      setToken(res.access_token);
      api.setToken(res.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    try {
      const res = await api.login('athlete@formiq.com', 'formiq2026!');
      const savedCustom = localStorage.getItem('formiq_user_profile');
      const customData = savedCustom ? JSON.parse(savedCustom) : {};
      setUser({ ...res.user, ...customData });
      setToken(res.access_token);
      api.setToken(res.access_token);
    } catch {
      // Offline fallback demo profile
      const demoUser: User = {
        id: 1,
        email: 'athlete@formiq.com',
        full_name: 'Marcus Vance',
        is_active: true,
        created_at: new Date().toISOString(),
        handle: '@marcus_vance',
        bio: 'Elite hybrid athlete focusing on biomechanical symmetry, Olympic lifting, and barbell velocity.',
        height: '184 cm',
        weight: '82.5 kg',
        wingspan: '189 cm',
        discipline: 'Strength & Conditioning',
        tier: 'Tier 1 Pro Athlete',
      };
      setUser(demoUser);
      setToken('demo-token-60fps');
      api.setToken('demo-token-60fps');
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('formiq_user_profile', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save profile to localStorage:', err);
      }
      return updated;
    });
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('formiq_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, demoLogin, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
