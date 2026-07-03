import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../config/api';
import { registerForPushNotifications } from '../services/pushService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'arena_auth_token';

export function AuthProvider({ children }) {
  // The backend returns one merged object (auth + profile); exposed as both
  // `user` and `profile` since screens read uid/email from one and
  // username/gameUid/stats/role from the other.
  const [account, setAccount] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          const me = await api.get('/users/me');
          setAccount(me);
          registerForPushNotifications().catch(() => {});
        }
      } catch (e) {
        setAuthError(e.message);
        await AsyncStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const applySession = async ({ token, user }) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setAccount(user);
    registerForPushNotifications().catch(() => {});
  };

  const register = async ({ username, email, password, phone, gameUid }) => {
    const res = await api.post('/auth/register', { username, email, password, phone, gameUid });
    await applySession(res);
    return res.user;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    await applySession(res);
    return res.user;
  };

  const loginWithGoogle = async () => {
    throw new Error('Google login isn’t available on this backend yet — use email login instead.');
  };

  const resetPassword = (email) => api.post('/auth/forgot-password', { email });

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setAccount(null);
    setAuthError(null);
  };

  const isAdmin = account?.role === 'admin';
  const isBlocked = account?.blocked === true;

  return (
    <AuthContext.Provider
      value={{
        user: account, profile: account, initializing, authError, isAdmin, isBlocked,
        register, login, loginWithGoogle, resetPassword, logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
