import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser } from '../services/authApi';

export type UserRole = 'control_room' | 'passenger';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  displayName: string | null;
  preferredTrainNumber: string | null;
}

interface AuthContextValue extends AuthState {
  loading: boolean;
  login: (data: {
    access_token: string;
    role: UserRole;
    display_name: string;
    preferred_train_number?: string | null;
  }) => void;
  logout: () => void;
}

const TOKEN_KEY = 'railpulse_auth_token';
const ROLE_KEY = 'railpulse_auth_role';
const DISPLAY_NAME_KEY = 'railpulse_auth_display_name';
const TRAIN_KEY = 'railpulse_auth_preferred_train';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem(TOKEN_KEY),
    role: (localStorage.getItem(ROLE_KEY) as UserRole | null) || null,
    displayName: localStorage.getItem(DISPLAY_NAME_KEY),
    preferredTrainNumber: localStorage.getItem(TRAIN_KEY),
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const clearStoredAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(DISPLAY_NAME_KEY);
    localStorage.removeItem(TRAIN_KEY);
    setState({ token: null, role: null, displayName: null, preferredTrainNumber: null });
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((user) => {
        localStorage.setItem(ROLE_KEY, user.role);
        localStorage.setItem(DISPLAY_NAME_KEY, user.display_name);
        if (user.preferred_train_number) {
          localStorage.setItem(TRAIN_KEY, user.preferred_train_number);
        } else {
          localStorage.removeItem(TRAIN_KEY);
        }
        setState({
          token,
          role: user.role,
          displayName: user.display_name,
          preferredTrainNumber: user.preferred_train_number ?? null,
        });
      })
      .catch(() => clearStoredAuth())
      .finally(() => setLoading(false));
  }, []);

  const login = (data: {
    access_token: string;
    role: UserRole;
    display_name: string;
    preferred_train_number?: string | null;
  }) => {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(ROLE_KEY, data.role);
    localStorage.setItem(DISPLAY_NAME_KEY, data.display_name);
    if (data.preferred_train_number) {
      localStorage.setItem(TRAIN_KEY, data.preferred_train_number);
    } else {
      localStorage.removeItem(TRAIN_KEY);
    }
    setState({
      token: data.access_token,
      role: data.role,
      displayName: data.display_name,
      preferredTrainNumber: data.preferred_train_number ?? null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, loading, login, logout: clearStoredAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
