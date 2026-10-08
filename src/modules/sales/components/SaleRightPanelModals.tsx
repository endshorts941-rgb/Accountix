import React, { useState } from 'react';
import { Customer, ProductItem, StoreLocation, StockMovementEntry, SaleInvoice } from '../types';
import { salesStore } from '../salesStore';
import {
  UserPlus,
  PackagePlus,
  Wrench,
  Boxes,
  RotateCcw,
  FileSpreadsheet,
  ShoppingCart,
  Truck,
  DollarSign,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  FileText,
  User,
  Phone,
  MapPin,
  Clock,
  Printer,
} from 'lucide-react';

// ==========================================
// 1. ADD NEW CUSTOMER MODAL
// ==========================================
interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: (customer: Customer) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerAdded,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000');
  const [previousBalance, setPreviousBalance] = useState('0');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer / Party Name is required.');
      return;
    }
    const newCust = salesStore.addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      creditLimit: parseFloat(creditLimit) || 0,
      previousBalance: parseFloat(previousBalance) || 0,
    });
    onCustomerAdded(newCust);
    setName('');
    setPhone('');
    setAddress('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-md overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1875B4] px-3.5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Add New Customer / Party</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs text-[#111111]">
          {error && (
            <div className="p-2 bg-red-100 border border-red-300 text-red-800 rounded-xs text-[11px] font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold mb-0.5">
              Customer / Business Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Al-Madina Traders"
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Contact / Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Credit Limit (Rs.)</label>
              <input
                type="number"
                min="0"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-mono text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-0.5">Address / Location</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop #, Market, City"
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-0.5">Opening / Previous Receivable (Rs.)</label>
            <input
              type="number"
              min="0"
              value={previousBalance}
              onChange={(e) => setPreviousBalance(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-mono text-right font-bold text-blue-900"
            />
          </div>

          <div className="pt-2 border-t border-[#7F9EAD]/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-[#1875B4] hover:bg-[#125D91] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. ADD NEW PRODUCT MODAL
// ==========================================
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: StoreLocation[];
  onProductAdded: (product: ProductItem) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  stores,
  onProductAdded,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [salePrice, setSalePrice] = useState('1000');
  const [costPrice, setCostPrice] = useState('800');
  const [initialStock, setInitialStock] = useState('50');
  const [storeId, setStoreId] = useState(stores[0]?.id || 'store-main');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }
    const newProd = salesStore.addProduct({
      name: name.trim(),
      code: code.trim(),
      unit,
      salePrice: parseFloat(salePrice) || 0,
      costPrice: parseFloat(costPrice) || 0,
      initialStock: parseFloat(initialStock) || 0,
      storeId,
    });
    onProductAdded(newProd);
    setName('');
    setCode('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-md overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1875B4] px-3.5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Add New Product / Item</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs text-[#111111]">
          {error && (
            <div className="p-2 bg-red-100 border border-red-300 text-red-800 rounded-xs text-[11px] font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold mb-0.5">
              Product Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Wireless Barcode Scanner"
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Product Code / SKU</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="AUTO / PRD-0050"
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Measurement Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs"
              >
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Boxes">Boxes</option>
                <option value="Kg">Kg</option>
                <option value="Meters">Meters</option>
                <option value="Sets">Sets</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Sale Price (Rs.)</label>
              <input
                type="number"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-mono text-right font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Cost Price (Rs.)</label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-mono text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-mono text-right"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Store Location</label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#7F9EAD]/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-[#1875B4] hover:bg-[#125D91] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. ADD NEW SERVICE MODAL
// ==========================================
interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: (service: { name: string; code: string; rate: number; description: string }) => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onServiceAdded,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [rate, setRate] = useState('2500');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onServiceAdded({
      name: name.trim(),
      code: code.trim() || `SRV-${Date.now().toString().slice(-4)}`,
      rate: parseFloat(rate) || 0,
      description: description.trim() || name.trim(),
    });
    setName('');
    setCode('');
    setDescription('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-md overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1875B4] px-3.5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Add Service / Repair Item</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs text-[#111111]">
          <div>
            <label className="block text-[11px] font-semibold mb-0.5">Service / Repair Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptop Motherboard Repair"
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Service Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SRV-010"
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs font-mono rounded-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Standard Service Fee (Rs.)</label>
              <input
                type="number"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs font-mono text-right font-bold text-blue-900 rounded-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-0.5">Description / Scope of Work</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details of repair or maintenance service performed..."
              className="w-full bg-white border border-[#7F9EAD] p-1.5 text-xs h-16 resize-none rounded-xs focus:outline-none"
            />
          </div>

          <div className="pt-2 border-t border-[#7F9EAD]/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-[#1875B4] hover:bg-[#125D91] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              Add to Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. PRODUCT / STOCK OVERVIEW MODAL
// ==========================================
interface StockOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  stores: StoreLocation[];
  stockMovements: StockMovementEntry[];
}

export const StockOverviewModal: React.FC<StockOverviewModalProps> = ({
  isOpen,
  onClose,
  products,
  stores,
  stockMovements,
}) => {
  const [tab, setTab] = useState<'balances' | 'movements'>('balances');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-4xl max-h-[90vh] flex flex-col font-sans overflow-hidden">
        <div className="bg-[#1875B4] px-4 py-2 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Product Inventory & Stock Management</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#B3DAEB] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTab('balances')}
              className={`px-3 py-1 font-bold border rounded-xs cursor-pointer ${
                tab === 'balances'
                  ? 'bg-blue-700 text-white border-blue-900 shadow-2xs'
                  : 'bg-[#D7EAF5] text-[#111111] border-[#7F9EAD]'
              }`}
            >
              Current Stock Balances ({products.length} Products)
            </button>
            <button
              type="button"
              onClick={() => setTab('movements')}
              className={`px-3 py-1 font-bold border rounded-xs cursor-pointer ${
                tab === 'movements'
                  ? 'bg-blue-700 text-white border-blue-900 shadow-2xs'
                  : 'bg-[#D7EAF5] text-[#111111] border-[#7F9EAD]'
              }`}
            >
              Stock Ledger & Movement History ({stockMovements.length})
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-700">ACCOUNTIX Inventory Engine</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          {tab === 'balances' ? (
            <table className="w-full text-xs text-left border-collapse border border-[#7F9EAD]">
              <thead className="bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px]">
                <tr>
                  <th className="py-1 px-2 border-r border-[#7F9EAD]">#</th>
                  <th className="py-1 px-2 border-r border-[#7F9EAD]">SKU / Code</th>
                  <th className="py-1 px-2 border-r border-[#7F9EAD]">Product Name</th>
                  <th className="py-1 px-2 text-right border-r border-[#7F9EAD]">Sale Price</th>
                  {stores.map((s) => (
                    <th key={s.id} className="py-1 px-2 text-center border-r border-[#7F9EAD]">
                      {s.name}
                    </th>
                  ))}
                  <th className="py-1 px-2 text-center">Total Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7F9EAD]/40">
                {products.map((p, idx) => {
                  const totalStock = stores.reduce(
                    (sum, s) => sum + (p.stockByStore[s.id] || 0),
                    0
                  );
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/50">
                      <td className="py-1 px-2 border-r border-[#7F9EAD] text-center font-mono">{idx + 1}</td>
                      <td className="py-1 px-2 border-r border-[#7F9EAD] font-mono font-bold text-blue-900">{p.code}</td>
                      <td className="py-1 px-2 border-r border-[#7F9EAD] font-semibold">{p.name}</td>
                      <td className="py-1 px-2 border-r border-[#7F9EAD] text-right font-mono">
                        Rs. {p.salePrice.toLocaleString()}
                      </td>
                      {stores.map((s) => {
                        const storeQty = p.stockByStore[s.id] || 0;
                        return (
                          <td
                            key={s.id}
                            className={`py-1 px-2 border-r border-[#7F9EAD] text-center font-mono font-bold ${
                              storeQty <= 5 ? 'text-red-700 bg-red-50/50' : 'text-slate-800'
                            }`}
                          >
                            {storeQty} {p.unit}
                          </td>
                        );
                      })}
                      <td className="py-1 px-2 text-center font-mono font-bold text-emerald-800 bg-[#E8F8EC]">
                        {totalStock} {p.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left border-collapse border border-[#7F9EAD]">
              <thead className="bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px]">
                <tr>
                  <th className="py-1 px-2 border-r border-[#7F9EAD]">Date</th>
                  <th className="py-1 px-2 border-r border-[#7F9EAD]">Invoice / Txn</th>
                  <th className="py-1 px-2 border-r border-[#7F9EAD]">Product</th>
                  <th className="py-1 px-2 border-r border-[#7F9EAD]">Location</th>
                  <th className="py-1 px-2 text-center border-r border-[#7F9EAD]">Qty Change</th>
                  <th className="py-1 px-2 text-center border-r border-[#7F9EAD]">Remaining</th>
                  <th className="py-1 px-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7F9EAD]/40 font-mono">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-blue-50/50">
                    <td className="py-1 px-2 border-r border-[#7F9EAD]">{sm.date}</td>
                    <td className="py-1 px-2 border-r border-[#7F9EAD] font-bold text-blue-900">{sm.invoiceNo}</td>
                    <td className="py-1 px-2 border-r border-[#7F9EAD] font-sans font-medium">{sm.productName}</td>
                    <td className="py-1 px-2 border-r border-[#7F9EAD] font-sans">{sm.storeLocationName}</td>
                    <td
                      className={`py-1 px-2 border-r border-[#7F9EAD] text-center font-bold ${
                        sm.quantityChange < 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {sm.quantityChange > 0 ? `+${sm.quantityChange}` : sm.quantityChange}
                    </td>
                    <td className="py-1 px-2 border-r border-[#7F9EAD] text-center font-bold">{sm.remainingStock}</td>
                    <td className="py-1 px-2 font-sans text-slate-600 text-[11px]">{sm.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-[#B3DAEB] px-3 py-1.5 border-t border-[#7F9EAD] flex items-center justify-between shrink-0 text-xs font-semibold">
          <span>Live synchronization with Sale Invoice</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] rounded-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SALES RETURN MODAL
// ==========================================
interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: SaleInvoice[];
  onReturnSaved: (msg: string) => void;
}

export const SalesReturnModal: React.FC<SalesReturnModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onReturnSaved,
}) => {
  const [selectedInvNo, setSelectedInvNo] = useState(invoices[0]?.invoiceNo || '');
  const [returnReason, setReturnReason] = useState('Damaged / Defective');
  const [returnAmount, setReturnAmount] = useState('500');

  if (!isOpen) return null;

  const handleConfirmReturn = () => {
    onReturnSaved(`Sales Return credit voucher recorded against ${selectedInvNo} for Rs. ${returnAmount}. Stock & ledger updated.`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-md overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1875B4] px-3.5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Record Sales Return (Credit Note)</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 space-y-2.5 text-xs text-[#111111]">
          <div>
            <label className="block text-[11px] font-semibold mb-0.5">Select Original Sale Invoice</label>
            <select
              value={selectedInvNo}
              onChange={(e) => setSelectedInvNo(e.target.value)}
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none rounded-xs font-mono font-semibold"
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.invoiceNo}>
                  {inv.invoiceNo} · {inv.customerName || 'Cash Walk-in'} (Rs. {inv.netInvoiceTotal.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-0.5">Return Reason</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs focus:outline-none rounded-xs"
            >
              <option value="Damaged / Defective">Damaged / Defective goods</option>
              <option value="Customer Exchange">Customer Exchange</option>
              <option value="Wrong Item Shipped">Wrong Item Shipped</option>
              <option value="Order Cancelled">Order Cancelled at delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold mb-0.5">Return Credit Amount (Rs.)</label>
            <input
              type="number"
              min="0"
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value)}
              className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs font-mono font-bold text-right text-rose-700 rounded-xs"
            />
          </div>

          <div className="p-2 bg-[#EAF4FA] border border-[#7F9EAD]/40 text-[11px] text-slate-700">
            • Stock will be automatically restored to the respective Store Location.
            <br />
            • Customer account balance or Cash refund will be recorded via Day Book.
          </div>

          <div className="pt-2 border-t border-[#7F9EAD]/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReturn}
              className="px-4 py-1 bg-[#1875B4] hover:bg-[#125D91] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              Confirm Sales Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. QUOTATION MODAL
// ==========================================
interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoice: SaleInvoice;
  onLoadQuotation: () => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  currentInvoice,
  onLoadQuotation,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-lg overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1875B4] px-3.5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Sales Quotation (Estimate)</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs text-[#111111]">
          <div className="p-3 bg-white border border-[#7F9EAD] rounded-xs space-y-1.5">
            <div className="flex justify-between items-center font-bold">
              <span>Quotation Ref: <span className="font-mono text-blue-900">QUOT-{currentInvoice.invoiceNo.replace('SI-', '')}</span></span>
              <span>Date: {currentInvoice.invoiceDate}</span>
            </div>
            <div className="text-slate-700">
              Customer: <strong>{currentInvoice.customerName || 'Prospective Client'}</strong>
            </div>
            <div className="text-slate-700">
              Validity: <strong>15 Days from Issue Date</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 font-bold flex justify-between">
              <span>Estimated Total:</span>
              <span className="font-mono text-blue-900 text-sm">Rs. {currentInvoice.netInvoiceTotal.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-700">
            A Quotation generates an official estimate for the customer without affecting inventory stock or posting to the general ledger until converted into a confirmed Sale Invoice.
          </p>

          <div className="pt-2 border-t border-[#7F9EAD]/40 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Quotation</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoadQuotation();
                  onClose();
                }}
                className="px-4 py-1 bg-[#1875B4] hover:bg-[#125D91] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
              >
                Convert to Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. SALES ORDER MODAL
// ==========================================
interface SalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoice: SaleInvoice;
  onLoadOrder: () => void;
}

export const SalesOrderModal: React.FC<SalesOrderModalProps> = ({
  isOpen,
  onClose,
  currentInvoice,
  onLoadOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-lg overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1875B4] px-3.5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Sales Order (Pending Fulfillment)</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs text-[#111111]">
          <div className="p-3 bg-white border border-[#7F9EAD] rounded-xs space-y-1.5">
            <div className="flex justify-between items-center font-bold">
              <span>Order No: <span className="font-mono text-blue-900">SO-{currentInvoice.invoiceNo.replace('SI-', '')}</span></span>
              <span>Status: <span className="text-emerald-700">Confirmed</span></span>
            </div>
            <div className="text-slate-700">
              Customer: <strong>{currentInvoice.customerName || 'Registered Customer'}</strong>
            </div>
            <div className="text-slate-700">
              Expected Delivery: <strong>{currentInvoice.dueDate || 'Standard 3 Days'}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 font-bold flex justify-between">
              <span>Total Order Value:</span>
              <span className="font-mono text-blue-900 text-sm">Rs. {currentInvoice.netInvoiceTotal.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-700">
            A Sales Order reserves customer demands and enables warehouse dispatch preparation prior to finalized billing.
          </p>

          <div className="pt-2 border-t border-[#7F9EAD]/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onLoadOrder();
                onClose();
              }}
              className="px-4 py-1 bg-[#1875B4] hover:bg-[#125D91] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              Fulfill as Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. DELIVERY / PARTIAL DELIVERY CHALLAN MODAL
// ==========================================
interface DeliveryChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoice: SaleInvoice;
}

export const DeliveryChallanModal: React.FC<DeliveryChallanModalProps> = ({
  isOpen,
  onClose,
  currentInvoice,
}) => {
  const [driver, setDriver] = useState('Rashid Khan');
  const [vehicleNo, setVehicleNo] = useState('LES-8912');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-lg overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1875B4] px-3.5 py-2 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Delivery Challan / Dispatch Note</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs text-[#111111]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Challan No.</label>
              <input
                type="text"
                readOnly
                value={`DC-${currentInvoice.invoiceNo.replace('SI-', '')}`}
                className="w-full bg-[#EAF4FA] border border-[#7F9EAD] px-2 py-1 text-xs font-mono font-bold text-blue-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Dispatch Date</label>
              <input
                type="text"
                readOnly
                value={currentInvoice.invoiceDate}
                className="w-full bg-[#EAF4FA] border border-[#7F9EAD] px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Driver / Dispatcher</label>
              <input
                type="text"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold mb-0.5">Vehicle / Reg. No.</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full bg-white border border-[#7F9EAD] px-2 py-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="p-2.5 bg-white border border-[#7F9EAD] rounded-xs max-h-40 overflow-y-auto">
            <div className="font-bold border-b border-slate-200 pb-1 mb-1 text-[11px] flex justify-between">
              <span>Item Description</span>
              <span>Dispatched Qty</span>
            </div>
            {currentInvoice.items.map((item, i) => (
              <div key={i} className="flex justify-between py-0.5 text-slate-800">
                <span className="truncate max-w-[280px]">{item.productName}</span>
                <span className="font-mono font-bold">{item.quantity} {item.unit}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#7F9EAD]/40 flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Challan</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1 bg-[#1875B4] hover:bg-[#125D91] text-white text-xs font-bold rounded-xs cursor-pointer shadow-xs"
            >
              Confirm Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. ACCOUNTS RECEIVABLE MODAL
// ==========================================
interface AccountsReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
}

export const AccountsReceivableModal: React.FC<AccountsReceivableModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSelectCustomer,
}) => {
  if (!isOpen) return null;

  const totalReceivables = customers.reduce((sum, c) => sum + (c.previousBalance || 0), 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xl rounded-xs w-full max-w-4xl max-h-[90vh] flex flex-col font-sans overflow-hidden">
        <div className="bg-[#1875B4] px-4 py-2 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-white" />
            <span className="font-bold text-xs uppercase tracking-wider">Accounts Receivable (Customer Outstandings)</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#B3DAEB] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between shrink-0 text-xs font-bold">
          <span>Active Customers with Credit Balances ({customers.length})</span>
          <span className="font-mono text-blue-900 text-sm">
            Total Outstanding: Rs. {totalReceivables.toLocaleString()}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-white">
          <table className="w-full text-xs text-left border-collapse border border-[#7F9EAD]">
            <thead className="bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px]">
              <tr>
                <th className="py-1 px-2 border-r border-[#7F9EAD]">#</th>
                <th className="py-1 px-2 border-r border-[#7F9EAD]">Customer Name</th>
                <th className="py-1 px-2 border-r border-[#7F9EAD]">Contact</th>
                <th className="py-1 px-2 border-r border-[#7F9EAD]">Address</th>
                <th className="py-1 px-2 text-right border-r border-[#7F9EAD]">Credit Limit</th>
                <th className="py-1 px-2 text-right border-r border-[#7F9EAD]">Receivable Balance</th>
                <th className="py-1 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7F9EAD]/40">
              {customers.map((c, idx) => (
                <tr key={c.id} className="hover:bg-blue-50/50">
                  <td className="py-1 px-2 border-r border-[#7F9EAD] text-center font-mono">{idx + 1}</td>
                  <td className="py-1 px-2 border-r border-[#7F9EAD] font-bold text-blue-900">{c.name}</td>
                  <td className="py-1 px-2 border-r border-[#7F9EAD] font-mono text-slate-700">{c.phone || '—'}</td>
                  <td className="py-1 px-2 border-r border-[#7F9EAD] text-slate-600">{c.address || '—'}</td>
                  <td className="py-1 px-2 border-r border-[#7F9EAD] text-right font-mono">
                    Rs. {(c.creditLimit || 50000).toLocaleString()}
                  </td>
                  <td
                    className={`py-1 px-2 border-r border-[#7F9EAD] text-right font-mono font-bold ${
                      c.previousBalance > 0 ? 'text-rose-700' : 'text-slate-600'
                    }`}
                  >
                    Rs. {c.previousBalance.toLocaleString()}
                  </td>
                  <td className="py-1 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCustomer(c.id);
                        onClose();
                      }}
                      className="px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-[11px] font-semibold rounded-xs cursor-pointer"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#B3DAEB] px-3 py-1.5 border-t border-[#7F9EAD] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-xs font-semibold rounded-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
