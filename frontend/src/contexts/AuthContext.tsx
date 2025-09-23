import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type { AuthUser, LoginCredentials, AuthState } from '../types';
import { authService } from '../lib/services/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  checkAuth: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload 
      };
    
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      const result = await response.json();
      const user = result.data;
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
    } catch (error) {
      console.error('Error checking auth:', error);
      dispatch({ type: 'LOGOUT' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('refresh_token');
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Hacer llamada directa al backend
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en login');
      }

      const result = await response.json();
      const authData = result.data;
      
      dispatch({ type: 'SET_USER', payload: authData.user });
      dispatch({ type: 'SET_TOKEN', payload: authData.token });
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authData.token);
        localStorage.setItem('user_data', JSON.stringify(authData.user));
        if (authData.refreshToken) {
          localStorage.setItem('refresh_token', authData.refreshToken);
        }
      }
      
      return true;
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    try {
      authService.logout();
      dispatch({ type: 'LOGOUT' });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (user: AuthUser) => {
    dispatch({ type: 'SET_USER', payload: user });
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  };

  const value: AuthContextType = useMemo(() => ({
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuth,
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;