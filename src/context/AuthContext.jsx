import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, getToken, setToken, removeToken } from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on boot
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.success && res.user) {
          const profile = {
            ...res.user,
            uid: res.user.id,
          };
          setUser(profile);
          setUserProfile(profile);
        } else {
          removeToken();
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        removeToken();
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register function
  const register = async (email, password, additionalData = {}) => {
    try {
      const fullName = additionalData.name || additionalData.fullName || email.split('@')[0];
      const role = additionalData.role || 'student';
      const res = await authAPI.register(fullName, email, password, role);

      if (res.token) {
        setToken(res.token);
      }

      const profile = {
        ...res.user,
        uid: res.user.id,
      };

      setUser(profile);
      setUserProfile(profile);
      return { user: profile, profile };
    } catch (error) {
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);

      if (res.token) {
        setToken(res.token);
      }

      const profile = {
        ...res.user,
        uid: res.user.id,
      };

      setUser(profile);
      setUserProfile(profile);
      return { user: profile, profile };
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    setUser(null);
    setUserProfile(null);
    return Promise.resolve();
  };

  // Reset password placeholder
  const resetPassword = (email) => {
    return Promise.resolve();
  };

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
