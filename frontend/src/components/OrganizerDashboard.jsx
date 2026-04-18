import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Users, Activity, ScanLine, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function OrganizerDashboard({ densities, history }) {
  const highCapacityZones = densities?.filter(d => d.status === 'red') || [];
  const mediumCapacityZones = densities?.filter(d => d.status === 'yellow') || [];

  const totalCapacity = densities?.reduce((acc, curr) => acc + curr.max_capacity, 0) || 0;
  const currentTotal = densities?.reduce((acc, curr) => acc + curr.current_occupancy, 0) || 0;
  const overallDensity = totalCapacity > 0 ? (currentTotal / totalCapacity) * 100 : 0;

  const [insight, setInsight] = useState("Awaiting remote neural uplink...");

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/insights');
        if (res.ok) {
          const data = await res.json();
          setInsight(data.insight);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInsight();
    const interval = setInterval(fetchInsight, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Recharts styling
  const ZONE_COLORS = {
    "Gates": "#38BDF8", // primary
    "Concourse A": "#C084FC", // purple
    "Concourse B": "#F472B6", // pink
    "Food Court": "#FBBF24", // warning
    "Seating": "#34D399" // success
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col h-full gap-6 relative z-10 transition-all">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 drop-shadow-md">Global Command</h2>
          <p className="text-slate-400 mt-2 font-medium text-sm">Predictive AI bottleneck analysis & crowd telemetry.</p>
        </div>
        <div className="flex glass-panel rounded-xl p-1 shadow-inner ring-1 ring-white/5">
          <div className="px-5 py-2.5 flex items-center gap-3">
            <ScanLine size={16} className="text-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-slate-200 uppercase">Live Telemetry</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {highCapacityZones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-danger/10 backdrop-blur-xl border border-danger/30 border-l-4 border-l-danger rounded-r-2xl p-6 flex items-start gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="text-danger flex-shrink-0 mt-0.5 animate-pulse" size={24} aria-hidden="true" />
            <div>
              <h3 className="font-black text-danger text-lg uppercase tracking-wide drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">Critical Matrix Alert</h3>
              <p className="text-sm text-danger/80 mt-1 font-semibold">
                {highCapacityZones.map(z => z.zone.replace("_", " ")).join(", ")} {highCapacityZones.length === 1 ? 'is' : 'are'} experiencing critical saturation. Deploy intervention teams.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Smart Crowd Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
        <div className="flex gap-4 items-start relative z-10">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Sparkles className="text-purple-400" size={24} />
          </div>
          <div>
            <h3 className="text-purple-400 font-bold tracking-widest uppercase text-xs mb-1 flex items-center gap-2">
              Gemini AI Strategic Insight
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            </h3>
            <p className="text-slate-200 text-sm font-medium leading-relaxed drop-shadow-sm transition-all duration-500 ease-in-out">
              {insight}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="glass-panel p-7 rounded-3xl flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Entities</span>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <Users size={20} className="text-primary drop-shadow-[0_0_5px_rgba(56,189,248,0.8)]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-5xl font-black relative z-10 tracking-tighter text-white">{currentTotal.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-2 font-bold relative z-10">/ {totalCapacity.toLocaleString()} theoretical capacity</div>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="glass-panel p-7 rounded-3xl flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Average Saturation</span>
            <div className="p-3 bg-success/10 border border-success/20 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <TrendingUp size={20} className="text-success drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" aria-hidden="true" />
            </div>
          </div>
          <div className="text-5xl font-black relative z-10 text-white flex items-end tracking-tighter">
            {overallDensity.toFixed(1)}<span className="text-2xl text-slate-400 font-bold mb-1 ml-1">%</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2 mt-auto relative z-10 overflow-hidden ring-1 ring-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${overallDensity}%` }}
              transition={{ duration: 1 }}
              className="bg-gradient-to-r from-success to-emerald-400 h-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" 
            />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="glass-panel p-7 rounded-3xl flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Compromised Nodes</span>
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <AlertTriangle size={20} className="text-warning drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
            </div>
          </div>
          <div className="text-5xl font-black text-white relative z-10 drop-shadow-md tracking-tighter">{highCapacityZones.length + mediumCapacityZones.length}</div>
          <div className="text-xs text-warning/70 mt-2 font-bold relative z-10 uppercase tracking-wide">Requiring supervision</div>
        </motion.div>
      </div>

      {/* Historical Density Chart */}
      <div className="glass-panel rounded-3xl shadow-2xl p-6 h-80 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-white">Telemetry Timeline</h3>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={12} tickMargin={12} minTickGap={20} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" fontSize={12} unit="%" domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(12px)', color: '#fff' }} 
                itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                labelStyle={{ color: '#94A3B8', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              {densities && densities.map((zone, i) => {
                const zName = zone.zone.replace("_", " ");
                const color = Object.values(ZONE_COLORS)[i % 5];
                return (
                  <Line 
                    key={zone.zone} 
                    type="monotone" 
                    dataKey={zone.zone} 
                    name={zName} 
                    stroke={color} 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: color, style: { filter: `drop-shadow(0 0 8px ${color})` } }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <div className="px-8 py-6 border-b border-white/5 bg-white/5">
          <h3 className="font-bold text-lg text-white">Node Saturation Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 text-slate-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-8 py-5">Node Identity</th>
                <th className="px-8 py-5">Active Volume</th>
                <th className="px-8 py-5">Max Cohort</th>
                <th className="px-8 py-5">Saturation Profile</th>
                <th className="px-8 py-5 text-right">System Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {(!densities || densities.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-500 font-medium italic">Awaiting telemetry uplink...</td>
                </tr>
              )}
              {densities && densities.map((zone) => {
                const isRed = zone.status === 'red';
                const isYellow = zone.status === 'yellow';
                return (
                  <motion.tr 
                    layout
                    key={zone.zone} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-5 font-black text-slate-100 drop-shadow-sm">
                      {zone.zone.replace("_", " ")}
                    </td>
                    <td className="px-8 py-5 font-mono text-slate-300">
                      {zone.current_occupancy.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 font-mono text-slate-500">
                      {zone.max_capacity.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-200 w-12">{zone.density_percentage.toFixed(0)}%</span>
                        <div className="w-32 bg-surface rounded-full h-2 overflow-hidden ring-1 ring-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${zone.density_percentage}%` }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className={`h-full ${isRed ? 'bg-danger shadow-[0_0_15px_rgba(239,68,68,0.8)]' : isYellow ? 'bg-warning shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'bg-success shadow-[0_0_15px_rgba(16,185,129,0.8)]'}`} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm
                        ${isRed ? 'bg-danger/20 text-danger border border-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 
                          isYellow ? 'bg-warning/20 text-warning border border-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                          'bg-success/20 text-success border border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}
                      `}>
                        {isRed ? 'Critical' : isYellow ? 'Elevated' : 'Optimal'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
