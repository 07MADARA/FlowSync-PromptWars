import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import AttendeeView from './components/AttendeeView';
import OrganizerDashboard from './components/OrganizerDashboard';
import { LayoutDashboard, Map as MapIcon, Activity } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import { AnimatePresence, motion } from 'framer-motion';
const API_URL = import.meta.env.PROD ? "" : "http://127.0.0.1:8000";

function Navigation() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  return (
    <nav className="fixed bottom-0 w-full glass-panel border-t border-white/5 pb-safe sm:relative sm:border-none sm:pb-0 z-[100] sm:bg-transparent sm:shadow-none sm:backdrop-blur-none">
      <div className="flex sm:justify-center p-3 sm:p-6 gap-4">
        <Link 
          to="/" 
          className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 ${!isDashboard ? 'bg-primary text-background shadow-[0_0_20px_rgba(56,189,248,0.5)]' : 'bg-surface/50 text-slate-400 hover:text-white hover:bg-surface border border-white/5'}`}
        >
          <MapIcon size={20} />
          <span>Attendee Map</span>
        </Link>
        <Link 
          to="/dashboard" 
          className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 ${isDashboard ? 'bg-primary text-background shadow-[0_0_20px_rgba(56,189,248,0.5)]' : 'bg-surface/50 text-slate-400 hover:text-white hover:bg-surface border border-white/5'}`}
        >
          <LayoutDashboard size={20} />
          <span>Organizer</span>
        </Link>
      </div>
    </nav>
  );
}

function PageWrapper({ children }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [densities, setDensities] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDensities = async () => {
      try {
        const res = await fetch(`${API_URL}/zones/density`);
        if (!res.ok) throw new Error('Failed to fetch from backend');
        const data = await res.json();
        
        setDensities(data);
        setError(null);

        if (data && data.length > 0) {
          const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
          const historyPoint = { time: timeStr };
          data.forEach(zone => {
            historyPoint[zone.zone] = zone.density_percentage;
          });

          setHistory(prev => {
            const newHistory = [...prev, historyPoint];
            if (newHistory.length > 25) newHistory.shift();
            return newHistory;
          });
        }
      } catch (err) {
        setError("Unable to connect to analytics engine.");
      }
    };

    fetchDensities();
    const interval = setInterval(fetchDensities, 2000); // Polling faster to match backend task
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-primary/30">
        <header className="glass-panel sticky top-0 z-50 p-4 border-b border-white/5 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center font-black text-xl text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-pulse-glow">
              F
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">Flow<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Sync</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {error ? (
              <div className="text-xs text-danger font-bold px-3 py-1.5 bg-danger/10 rounded-lg border border-danger/20 animate-pulse">{error}</div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-primary text-xs font-bold px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                <Activity size={14} className="animate-pulse" /> LIVE
              </div>
            )}
          </div>
        </header>
        
        <main className="flex-1 relative overflow-x-hidden overflow-y-auto pb-24 sm:pb-0">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><AttendeeView densities={densities} apiUrl={API_URL} /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper>
                {authLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : user ? (
                  <OrganizerDashboard densities={densities} history={history} />
                ) : (
                  <Login />
                )}
              </PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>

        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
