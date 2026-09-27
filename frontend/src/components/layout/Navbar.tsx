import { Link, useLocation } from 'react-router-dom';
import { Train, Activity, Users, Monitor, BarChart2, Radio, Bell, Info, LogOut } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { connected } = useWebSocket();
  const { role, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Live Trains', path: '/trains', icon: Train },
    { name: 'Passenger', path: '/passenger', icon: Users },
    { name: 'Control Room', path: '/control-room', icon: Monitor },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Network', path: '/network', icon: Radio },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'About', path: '/about', icon: Info },
  ];

  const visibleNavLinks = navLinks.filter(link =>
    role === 'passenger'
      ? ['Passenger', 'About'].includes(link.name)
      : ['Dashboard', 'Live Trains', 'Control Room', 'Analytics', 'Network', 'Alerts', 'About'].includes(link.name)
  );

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Train className="text-indigo-500 h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-white">RailPulse <span className="text-indigo-400">ETA</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {visibleNavLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-slate-800 text-indigo-400' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 text-xs font-bold tracking-wider cursor-help"
              title="Train master data and schedules are based on real railway services. Live GPS/RTIS telemetry is simulated in this prototype because authorized live railway telemetry is not connected."
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              DEMO MODE • SIMULATED TELEMETRY
            </div>
            <div className="flex items-center gap-2" title="System Health">
              <span className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Log out"
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
