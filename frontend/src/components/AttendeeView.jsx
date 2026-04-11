import { useState, useEffect } from 'react';
import { ZONES, EDGES } from '../zones';
import { Navigation2, Loader2, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';

const center = { lat: 33.9534, lng: -118.3387 }; // SoFi Stadium

const MAP_OPTIONS = {
  disableDefaultUI: true,
  gestureHandling: 'none',
  keyboardShortcuts: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#0B0F19" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0B0F19" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#38BDF8" }] },
    { featureType: "water", stylers: [{ color: "#000000" }] }
  ]
};

const STATUS_COLORS = {
  green: "bg-success/20 border-success text-success shadow-[0_0_20px_rgba(16,185,129,0.3)]",
  yellow: "bg-warning/20 border-warning text-warning shadow-[0_0_20px_rgba(245,158,11,0.3)]",
  red: "bg-danger/20 border-danger text-danger shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse",
  default: "bg-surface border-white/20 text-slate-400"
};

export default function AttendeeView({ densities, apiUrl }) {
  const [startZone, setStartZone] = useState("");
  const [endZone, setEndZone] = useState("");
  const [route, setRoute] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const densityMap = densities?.reduce((acc, curr) => {
    acc[curr.zone] = curr;
    return acc;
  }, {}) || {};

  const fetchRoute = async () => {
    if (!startZone || !endZone || startZone === endZone) return;
    setLoadingRoute(true);
    try {
      const res = await fetch(`${apiUrl}/route?start=${startZone}&end=${endZone}`);
      if (res.ok) {
        const data = await res.json();
        setRoute(data.route || []);
      } else {
        setRoute([]);
      }
    } catch (e) {
      console.error(e);
      setRoute([]);
    }
    setLoadingRoute(false);
  };

  useEffect(() => {
    fetchRoute();
  }, [startZone, endZone]);

  const handleZoneClick = (zId) => {
    if (!startZone) {
      setStartZone(zId);
    } else if (!endZone && zId !== startZone) {
      setEndZone(zId);
    } else if (startZone && endZone) {
      setStartZone(zId);
      setEndZone("");
      setRoute([]);
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto flex flex-col h-full gap-6">
      <div className="flex flex-col gap-2 relative z-10">
        <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-md">Stadium Radar</h2>
        <p className="text-slate-400 text-sm font-medium">Select two points on the map to calculate the optimal path.</p>
      </div>

      <div className="relative w-full aspect-square glass-panel rounded-3xl p-4 overflow-hidden border border-white/10 ring-1 ring-white/5" aria-label="Interactive Stadium Map">
        {/* Google Maps Base Layer */}
        {isLoaded && (
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen scale-[1.5]">
             <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={16} options={MAP_OPTIONS} />
          </div>
        )}
        
        <div className="absolute inset-0 pattern-grid-lg opacity-40 mix-blend-overlay" />
        
        {/* Radar Sweeper */}
        <div className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 origin-center animate-[spin_10s_linear_infinite] opacity-30 pointer-events-none">
          <div className="w-1/2 h-1/2 bg-gradient-to-br from-primary/40 to-transparent rounded-tl-full blur-2xl" />
        </div>
        
        {/* Draw Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {EDGES.map((edge, i) => {
            const p1 = ZONES.find(z => z.id === edge.from);
            const p2 = ZONES.find(z => z.id === edge.to);
            const isRouteEdge = route.includes(edge.from) && route.includes(edge.to) && Math.abs(route.indexOf(edge.from) - route.indexOf(edge.to)) === 1;
            
            return (
              <line 
                key={i}
                x1={`${p1.x}%`} 
                y1={`${p1.y}%`} 
                x2={`${p2.x}%`} 
                y2={`${p2.y}%`} 
                stroke={isRouteEdge ? "#38BDF8" : "rgba(255,255,255,0.1)"} 
                strokeWidth={isRouteEdge ? 6 : 2}
                strokeDasharray={isRouteEdge ? "8 6" : "none"}
                className={isRouteEdge ? "drop-shadow-[0_0_12px_rgba(56,189,248,0.9)] animate-marching-ants" : "transition-colors duration-500"}
              />
            );
          })}
        </svg>

        {/* Draw Nodes */}
        {ZONES.map((z) => {
          const dData = densityMap[z.id];
          const statusClass = dData ? STATUS_COLORS[dData.status] : STATUS_COLORS.default;
          
          let ringClass = "border border-white/10 glass-panel";
          let scaleVal = 1;
          if (startZone === z.id) {
            ringClass = "border-2 border-primary bg-primary/20 backdrop-blur-xl shadow-[0_0_25px_rgba(56,189,248,0.5)]";
            scaleVal = 1.15;
          }
          else if (endZone === z.id) {
            ringClass = "border-2 border-purple-500 bg-purple-500/20 backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.5)]";
            scaleVal = 1.15;
          }
          
          let badge = null;
          if (startZone === z.id) badge = "Start";
          if (endZone === z.id) badge = "Dest";

          return (
            <motion.div 
              key={z.id}
              onClick={() => handleZoneClick(z.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleZoneClick(z.id); }}
              role="button"
              tabIndex={0}
              aria-label={`Select ${z.name}. Current load is ${dData?.density_percentage.toFixed(0)}%`}
              className="absolute flex flex-col items-center justify-center cursor-pointer group focus:outline-none focus:ring-4 focus:ring-primary rounded-full"
              style={{ left: `${z.x}%`, top: `${z.y}%`, zIndex: 10 }}
              initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
              animate={{ scale: scaleVal, opacity: 1, x: "-50%", y: "-50%" }}
              whileHover={{ scale: 1.1, x: "-50%", y: "-50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {badge && (
                <motion.div 
                  initial={{ y: 10, opacity: 0, x: 0 }} 
                  animate={{ y: 0, opacity: 1, x: 0 }}
                  className={`absolute -top-8 px-3 py-1 text-white text-[10px] uppercase font-black tracking-widest rounded-full shadow-lg whitespace-nowrap ${badge === 'Start' ? 'bg-primary shadow-primary/40' : 'bg-purple-500 shadow-purple-500/40'}`}
                >
                  {badge}
                </motion.div>
              )}
              
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-700 ${ringClass}`}>
                <div className={`w-[80%] h-[80%] rounded-full flex flex-col items-center justify-center p-1 border ${statusClass} backdrop-blur-md transition-colors duration-700 shadow-inner`}>
                  <span className="text-[10px] sm:text-xs font-bold text-center leading-tight drop-shadow-md">{z.name}</span>
                  {dData && (
                    <motion.span 
                      key={dData.density_percentage}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[10px] sm:text-xs font-black tracking-tighter"
                    >
                      {dData.density_percentage.toFixed(0)}%
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        layout
        className="glass-panel rounded-2xl p-6 flex-1 z-10"
        aria-live="polite"
      >
        <h3 className="font-bold text-xl mb-4 flex items-center gap-3 text-white">
          <Target className="text-primary" aria-hidden="true" /> Flow Routing
        </h3>
        {!startZone && !endZone && (
          <p className="text-slate-400 text-sm font-medium">Tap on a zone in the map above to set your starting location.</p>
        )}
        {startZone && !endZone && (
          <p className="text-slate-400 text-sm font-bold animate-pulse text-primary drop-shadow-[0_0_5px_rgba(56,189,248,0.5)] mt-2">Now tap another zone to set your destination.</p>
        )}
        {loadingRoute && (
          <div className="flex items-center gap-3 text-primary font-bold">
            <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Calculating optimal matrix path...
          </div>
        )}
        
        {!loadingRoute && route.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-5"
          >
            <p className="text-sm font-medium text-slate-300">Fastest route avoiding active crowd nodes:</p>
            <div className="flex flex-wrap items-center gap-2">
              {route.map((node, i) => (
                <div key={node} className="flex items-center gap-2">
                  <span className="px-4 py-2 bg-surface border border-white/10 rounded-xl text-sm font-bold shadow-lg shadow-black/50">
                    {ZONES.find(z => z.id === node)?.name || node}
                  </span>
                  {i < route.length - 1 && <span className="text-primary font-black drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]">→</span>}
                </div>
              ))}
            </div>
            <button 
              onClick={() => { setStartZone(""); setEndZone(""); setRoute([]); }}
              className="mt-6 px-6 py-4 w-full bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white rounded-xl transition-all text-sm font-black tracking-wider uppercase disabled:opacity-50"
            >
              Clear Trajectory
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
