import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Sale, Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { IndianRupee, TrendingUp, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Revenue() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('saleDate', 'desc')), (s) => {
      setSales(s.docs.map(d => ({ id: d.id, ...d.data() } as Sale)));
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), (s) => {
      setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    return () => {
      unsubSales();
      unsubProducts();
    };
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const todaySales = sales.filter(s => {
    const today = new Date().toLocaleDateString();
    return new Date(s.saleDate).toLocaleDateString() === today;
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown Product';

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-5xl font-black uppercase italic leading-none">Revenue</h2>
        <p className="mt-2 font-bold text-gray-500 uppercase tracking-widest text-xs">Financial performance of your shop</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black text-white p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-black text-white border-2 border-white rounded-full">
              <IndianRupee size={32} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm opacity-70">Total Revenue</span>
          </div>
          <h3 className="text-6xl font-black italic tracking-tighter">₹{totalRevenue.toLocaleString()}</h3>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white text-black p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-100 text-black border-2 border-black rounded-full">
              <TrendingUp size={32} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm opacity-70">Today's Sales</span>
          </div>
          <h3 className="text-6xl font-black italic tracking-tighter">₹{todayRevenue.toLocaleString()}</h3>
          <p className="mt-2 font-bold uppercase text-xs opacity-50">{todaySales.length} Transactions</p>
        </motion.div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Calendar size={32} />
          <h3 className="text-3xl font-black uppercase italic">Recent Transactions</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {sales.slice(0, 10).map((sale) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={sale.id}
                className="flex items-center justify-between p-6 border-2 border-black bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex p-3 bg-gray-100 border-2 border-black">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-lg">{getProductName(sale.productId)}</h4>
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {new Date(sale.saleDate).toLocaleDateString()} • {new Date(sale.saleDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase opacity-50">Quantity</p>
                    <p className="font-black uppercase">{sale.quantity}</p>
                  </div>
                  <ArrowRight className="opacity-20 hidden sm:block" />
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase opacity-50">Amount</p>
                    <p className="text-2xl font-black text-black">₹{sale.totalAmount}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sales.length === 0 && (
            <div className="p-12 border-2 border-dashed border-black text-center font-bold text-gray-400 uppercase tracking-widest">
              No transactions recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
