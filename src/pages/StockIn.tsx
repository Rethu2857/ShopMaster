import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, StockEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, History, Package, ArrowDownCircle } from 'lucide-react';

export default function StockIn() {
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qProducts = query(collection(db, 'products'), orderBy('name'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const qEntries = query(collection(db, 'stockEntries'), orderBy('entryDate', 'desc'));
    const unsubscribeEntries = onSnapshot(qEntries, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockEntry)));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeEntries();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'stockEntries'), {
        productId: selectedProductId,
        quantity: parseFloat(quantity),
        entryDate: new Date().toISOString(),
        ownerId: 'admin' // Hardcoded owner ID for basic login
      });
      setSelectedProductId('');
      setQuantity('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown Product';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <div>
          <h2 className="text-5xl font-black uppercase italic leading-none">Add Stock</h2>
          <p className="mt-2 font-bold text-gray-500 uppercase tracking-widest text-xs">Enter goods received in shop</p>
        </div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase">Select Product</label>
              <select
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-4 border-2 border-black font-bold uppercase focus:bg-gray-100 focus:outline-none appearance-none"
              >
                <option value="">-- CHOOSE PRODUCT --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase">Quantity</label>
              <input
                required
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-4 border-2 border-black font-bold uppercase focus:bg-gray-100 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition-colors border-2 border-black flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <PlusCircle size={20} />
                  Add to Stock
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center gap-4">
          <History size={32} />
          <h3 className="text-3xl font-black uppercase italic">Recent Entries</h3>
        </div>

        <div className="border-2 border-black bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-xs font-black tracking-widest">
                <th className="p-4 border-r border-white/20">Date</th>
                <th className="p-4 border-r border-white/20">Product</th>
                <th className="p-4">Quantity</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {entries.map((entry) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={entry.id} 
                    className="border-b-2 border-black hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-xs">
                      {new Date(entry.entryDate).toLocaleDateString()}
                      <br/>
                      <span className="opacity-50">{new Date(entry.entryDate).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="font-black uppercase">{getProductName(entry.productId)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-black font-black">
                        <ArrowDownCircle size={16} />
                        +{entry.quantity}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {entries.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center font-bold text-gray-400 uppercase tracking-widest">
                    No stock entries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
