import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  authAPI
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setCurrentUser] = useState(() => getUser());
  const [token, setCurrentToken] = useState(() => getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getToken();
    if (storedUser && storedToken) {
      setCurrentUser(storedUser);
      setCurrentToken(storedToken);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = email?.trim().toLowerCase();
      const data = await authAPI.login({ email: cleanEmail, password });
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        setCurrentToken(data.token);
        setCurrentUser(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const cleanName = name?.trim();
      const cleanEmail = email?.trim().toLowerCase();
      const data = await authAPI.register({ name: cleanName, email: cleanEmail, password });

      try {
        const loginData = await authAPI.login({ email: cleanEmail, password });
        if (loginData.token && loginData.user) {
          setToken(loginData.token);
          setUser(loginData.user);
          setCurrentToken(loginData.token);
          setCurrentUser(loginData.user);
        }
      } catch (loginErr) {
        console.warn('Auto-login notice:', loginErr);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    removeUser();
    setCurrentToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
