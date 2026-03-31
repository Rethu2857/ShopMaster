export interface Product {
  id: string;
  name: string;
  rate: number;
  unit: string;
  category?: string;
  updatedAt?: string;
}

export interface StockEntry {
  id: string;
  productId: string;
  quantity: number;
  entryDate: string;
  ownerId: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  saleDate: string;
}

export interface InventoryItem extends Product {
  currentStock: number;
  totalSold: number;
}
