'use client';

import { useState, useCallback, useEffect } from 'react';
import { User } from '../app/types';
import { apiRequest } from '../services/api';

interface AuthResponse {
  access_token: string;
  user: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user_profile');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user_profile');
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_profile', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_profile', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async (): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const profile = await apiRequest<User>('/auth/me');
      setUser(profile);
      localStorage.setItem('user_profile', JSON.stringify(profile));
      return profile;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    fetchProfile,
  };
}
