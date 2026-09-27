import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const authApi = axios.create({ baseURL: API_BASE });

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: 'control_room' | 'passenger';
  display_name: string;
}

export interface CurrentUser {
  role: 'control_room' | 'passenger';
  username_or_phone: string;
  display_name: string;
  preferred_train_number?: string | null;
}

export const controlRoomLogin = (username: string, password: string) =>
  authApi.post<AuthResponse>('/auth/control-room/login', { username, password }).then(res => res.data);

export const passengerLogin = (phone_number: string, train_number?: string) =>
  authApi.post<AuthResponse>('/auth/passenger/login', {
    phone_number,
    train_number: train_number || undefined,
  }).then(res => res.data);

export const getCurrentUser = (token: string) =>
  authApi.get<CurrentUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
