import { useState } from 'react';
import { motion } from 'motion/react';
import { Store, LogIn, User, Lock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow any input for login as requested
    if (username.trim() !== '' && password.trim() !== '') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', `${username}@shopmaster.com`);
      window.location.href = '/products';
    } else {
      setError('PLEASE ENTER BOTH USER ID AND PASSWORD');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 bg-black border-4 border-black rounded-full">
            <Store size={48} className="text-white" />
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-black uppercase italic leading-none">Shop Master</h1>
            <p className="mt-2 font-bold text-gray-500 uppercase tracking-widest text-xs">Owner Login</p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase flex items-center gap-2">
                <User size={14} /> User ID
              </label>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 border-2 border-black font-bold uppercase focus:bg-gray-100 focus:outline-none"
                placeholder="ENTER ANY USER ID"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-black font-bold uppercase focus:bg-gray-100 focus:outline-none"
                placeholder="ENTER ANY PASSWORD"
              />
            </div>

            {error && (
              <div className="w-full p-3 bg-red-100 border-2 border-red-600 text-red-600 font-bold text-xs uppercase text-center">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <LogIn size={20} />
              Login
            </motion.button>
          </form>

          <p className="text-[10px] font-bold text-gray-400 uppercase text-center">
            Enter anything to login
          </p>
        </div>
      </motion.div>
    </div>
  );
}
