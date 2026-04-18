import { useState } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { LayoutDashboard, LogIn } from 'lucide-react';

export default function Login() {
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Failed to sign in with Google.");
      console.error(err);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-sm w-full p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(56,189,248,0.15)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            <LayoutDashboard size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-white mb-2">Organizer Access</h2>
          <p className="text-slate-400 text-sm mb-8 font-medium">Secure authentication required for global command dashboard access.</p>
          
          {error && (
            <div className="w-full text-xs text-danger font-bold px-4 py-3 bg-danger/10 rounded-xl border border-danger/20 mb-6 flex justify-center text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-0.5"
          >
            <LogIn size={18} />
            Sign in with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
