import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  TrendingUp, 
  LogOut, 
  Store,
  Menu,
  X
} from 'lucide-react';
import { cn } from './lib/utils';

// Pages (to be implemented)
import Login from './pages/Login';
import Products from './pages/Products';
import StockIn from './pages/StockIn';
import Inventory from './pages/Inventory';
import Revenue from './pages/Revenue';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex items-center gap-3 px-6 py-4 border-b border-black transition-colors",
        active ? "bg-black text-white" : "hover:bg-gray-100"
      )}
    >
      <Icon size={20} />
      <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
    </motion.div>
  </Link>
);

const Layout = ({ children, user, onLogout }: { children: React.ReactNode, user: { email: string }, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-black">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Store className="text-black" />
          <h1 className="font-black text-xl uppercase italic">Shop Master</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 border-2 border-black">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-64 border-r-2 border-black bg-white z-40 transition-transform md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b-2 border-black hidden md:flex items-center gap-2">
          <Store size={32} />
          <h1 className="font-black text-2xl uppercase italic leading-none">Shop<br/>Master</h1>
        </div>
        
        <nav className="flex flex-col h-[calc(100vh-100px)]">
          <NavItem to="/products" icon={Package} label="Master List" active={location.pathname === '/products'} />
          <NavItem to="/stock-in" icon={PlusCircle} label="Add Stock" active={location.pathname === '/stock-in'} />
          <NavItem to="/inventory" icon={LayoutDashboard} label="Inventory" active={location.pathname === '/inventory'} />
          <NavItem to="/revenue" icon={TrendingUp} label="Revenue" active={location.pathname === '/revenue'} />
          
          <div className="mt-auto border-t-2 border-black p-6 flex flex-col gap-4">
            <div className="text-xs font-bold uppercase opacity-50 truncate">
              {user.email}
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 font-black uppercase text-sm hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem('isLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    setIsLoggedIn(authStatus);
    setUserEmail(email);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-black border-t-gray-400 rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/products" />} />
        <Route 
          path="/*" 
          element={
            isLoggedIn ? (
              <Layout user={{ email: userEmail } as any} onLogout={handleLogout}>
                <Routes>
                  <Route path="/products" element={<Products />} />
                  <Route path="/stock-in" element={<StockIn />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/revenue" element={<Revenue />} />
                  <Route path="*" element={<Navigate to="/products" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
