import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, StockEntry, Sale, InventoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Package, ArrowUpCircle, TrendingDown, Search, X } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [saleQuantity, setSaleQuantity] = useState('');

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('name')), (s) => {
      setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    const unsubStock = onSnapshot(collection(db, 'stockEntries'), (s) => {
      setStockEntries(s.docs.map(d => ({ id: d.id, ...d.data() } as StockEntry)));
    });
    const unsubSales = onSnapshot(collection(db, 'sales'), (s) => {
      setSales(s.docs.map(d => ({ id: d.id, ...d.data() } as Sale)));
    });

    return () => {
      unsubProducts();
      unsubStock();
      unsubSales();
    };
  }, []);

  const inventory: InventoryItem[] = products.map(p => {
    const totalIn = stockEntries
      .filter(e => e.productId === p.id)
      .reduce((sum, e) => sum + e.quantity, 0);
    const totalOut = sales
      .filter(s => s.productId === p.id)
      .reduce((sum, s) => sum + s.quantity, 0);
    
    return {
      ...p,
      currentStock: totalIn - totalOut,
      totalSold: totalOut
    };
  });

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !saleQuantity) return;

    const qty = parseFloat(saleQuantity);
    if (qty > selectedProduct.currentStock) {
      alert('NOT ENOUGH STOCK!');
      return;
    }

    try {
      await addDoc(collection(db, 'sales'), {
        productId: selectedProduct.id,
        quantity: qty,
        totalAmount: qty * selectedProduct.rate,
        saleDate: new Date().toISOString()
      });
      setIsSaleModalOpen(false);
      setSaleQuantity('');
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase italic leading-none">Inventory</h2>
          <p className="mt-2 font-bold text-gray-500 uppercase tracking-widest text-xs">Current stock vs goods sold</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="SEARCH INVENTORY..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-black font-bold uppercase text-sm focus:bg-gray-100 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredInventory.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id}
              className="border-2 border-black p-6 bg-white hover:bg-gray-50 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-100 border-2 border-black">
                  <Package size={24} />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedProduct(item);
                    setIsSaleModalOpen(true);
                  }}
                  className="bg-black text-white p-3 border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                >
                  <ShoppingCart size={20} />
                </motion.button>
              </div>
              
              <h3 className="text-xl font-black uppercase truncate">{item.name}</h3>
              <p className="text-xs font-bold text-gray-500 uppercase mb-6">{item.category}</p>
              
              <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase opacity-50">In Shop</span>
                  <div className="flex items-center gap-2 font-black text-2xl">
                    <ArrowUpCircle size={18} className="text-black" />
                    {item.currentStock} <span className="text-xs">{item.unit}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase opacity-50">Sold</span>
                  <div className="flex items-center gap-2 font-black text-2xl">
                    <TrendingDown size={18} className="text-red-500" />
                    {item.totalSold} <span className="text-xs">{item.unit}</span>
                  </div>
                </div>
              </div>

              {item.currentStock <= 5 && item.currentStock > 0 && (
                <div className="mt-4 p-2 bg-yellow-100 border-2 border-yellow-600 text-yellow-600 font-black text-[10px] uppercase text-center">
                  Low Stock Alert
                </div>
              )}
              {item.currentStock <= 0 && (
                <div className="mt-4 p-2 bg-red-100 border-2 border-red-600 text-red-600 font-black text-[10px] uppercase text-center">
                  Out of Stock
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sale Modal */}
      <AnimatePresence>
        {isSaleModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border-4 border-black p-8 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black uppercase italic">Record Sale</h3>
                <button onClick={() => setIsSaleModalOpen(false)} className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-100 border-2 border-black">
                <p className="text-xs font-black uppercase opacity-50">Product</p>
                <p className="text-xl font-black uppercase">{selectedProduct.name}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-bold uppercase">Rate: ₹{selectedProduct.rate}/{selectedProduct.unit}</span>
                  <span className="text-xs font-bold uppercase">Stock: {selectedProduct.currentStock} {selectedProduct.unit}</span>
                </div>
              </div>

              <form onSubmit={handleSale} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase">Quantity to Sell</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    max={selectedProduct.currentStock}
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(e.target.value)}
                    className="w-full p-4 border-2 border-black font-bold uppercase focus:bg-gray-100 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div className="p-4 border-2 border-black bg-black text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black">
                      ₹{(parseFloat(saleQuantity || '0') * selectedProduct.rate).toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition-colors border-2 border-black"
                >
                  Confirm Sale
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
