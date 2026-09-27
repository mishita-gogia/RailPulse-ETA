import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Train } from 'lucide-react';
import { controlRoomLogin, passengerLogin } from '../services/authApi';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [mode, setMode] = useState<'control_room' | 'passenger'>('control_room');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = mode === 'control_room'
        ? await controlRoomLogin(username, password)
        : await passengerLogin(phoneNumber, trainNumber);

      login(response);
      navigate(response.role === 'passenger' ? '/passenger' : '/', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl p-8 shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Train className="text-indigo-500 h-8 w-8" />
          <span className="text-2xl font-bold text-white">RailPulse <span className="text-indigo-400">ETA</span></span>
        </div>

        <div className="grid grid-cols-2 bg-slate-900 rounded-xl p-1 mb-6">
          <button type="button" onClick={() => setMode('control_room')} className={`rounded-lg py-2 text-sm font-medium ${mode === 'control_room' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            Control Room
          </button>
          <button type="button" onClick={() => setMode('passenger')} className={`rounded-lg py-2 text-sm font-medium ${mode === 'passenger' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            Passenger
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'control_room' ? (
            <>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
            </>
          ) : (
            <>
              <input
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                autoComplete="tel"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                required
              />
              <input
                value={trainNumber}
                onChange={e => setTrainNumber(e.target.value)}
                placeholder="Train number (optional)"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" />
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
