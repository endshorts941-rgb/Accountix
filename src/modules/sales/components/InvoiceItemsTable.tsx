import React from 'react';
import { InvoiceItemRow, ProductItem } from '../types';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

interface InvoiceItemsTableProps {
  items: InvoiceItemRow[];
  products: ProductItem[];
  selectedStoreId: string;
  selectedStoreName?: string;
  onItemChange: (index: number, updatedItem: InvoiceItemRow) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
  products,
  selectedStoreId,
  selectedStoreName = 'Main Store',
  onItemChange,
  onAddRow,
  onRemoveRow,
}) => {
  const handleProductSelect = (index: number, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    const currentItem = items[index];

    if (!selectedProd) {
      onItemChange(index, {
        ...currentItem,
        productId: '',
        productName: '',
        description: '',
        unit: 'Pcs',
        rate: 0,
        total: 0,
      });
      return;
    }

    const rate = selectedProd.salePrice;
    const qty = currentItem.quantity || 1;
    const baseAmount = qty * rate;
    const discountAmount = (baseAmount * (currentItem.discountValue || 0)) / 100;
    const afterDiscount = Math.max(0, baseAmount - discountAmount);
    const taxAmount = (afterDiscount * (currentItem.taxPercent || 0)) / 100;
    const total = afterDiscount + taxAmount;

    onItemChange(index, {
      ...currentItem,
      productId: selectedProd.id,
      productName: selectedProd.name,
      description: selectedProd.description,
      unit: selectedProd.unit,
      rate,
      discountAmount,
      taxAmount,
      total,
    });
  };

  const handleFieldChange = (
    index: number,
    field: 'quantity' | 'rate' | 'discountValue' | 'taxPercent',
    value: number
  ) => {
    const currentItem = { ...items[index], [field]: value };
    const qty = field === 'quantity' ? value : currentItem.quantity;
    const rate = field === 'rate' ? value : currentItem.rate;
    const discPct = field === 'discountValue' ? value : currentItem.discountValue;
    const taxPct = field === 'taxPercent' ? value : currentItem.taxPercent;

    const baseAmount = qty * rate;
    const discountAmount = (baseAmount * discPct) / 100;
    const afterDiscount = Math.max(0, baseAmount - discountAmount);
    const taxAmount = (afterDiscount * taxPct) / 100;
    const total = afterDiscount + taxAmount;

    onItemChange(index, {
      ...currentItem,
      quantity: qty,
      rate,
      discountValue: discPct,
      discountAmount,
      taxPercent: taxPct,
      taxAmount,
      total,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 space-y-1.5 flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Table Card Header with Title and + Add Item button */}
      <div className="flex items-center justify-between pb-0.5 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
            Invoice Items
          </h2>
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
          >
            <Plus className="w-3 h-3 text-blue-600" />
            <span>Add Item</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-400">
          Showing {items.length} {items.length === 1 ? 'row' : 'rows'}
        </span>
      </div>

      {/* Main Responsive Table with sticky header and internal scroll */}
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[90px] max-h-[200px] 2xl:max-h-[340px] border border-slate-200 rounded">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 shadow-2xs">
            <tr className="text-slate-700 font-bold border-b border-slate-200 text-[11px]">
              <th className="py-1 px-2 w-8 text-center">#</th>
              <th className="py-1 px-2 w-24">Item Code</th>
              <th className="py-1 px-2 min-w-[180px]">Item Name</th>
              <th className="py-1 px-2 w-28">Store</th>
              <th className="py-1 px-2 w-14 text-center">Unit</th>
              <th className="py-1 px-2 w-14 text-center">Qty</th>
              <th className="py-1 px-2 w-20 text-right">Rate</th>
              <th className="py-1 px-2 w-16 text-right">Disc %</th>
              <th className="py-1 px-2 w-16 text-right">Tax %</th>
              <th className="py-1 px-2 w-18 text-right">Tax Rs.</th>
              <th className="py-1 px-2 w-24 text-right">Total (Rs.)</th>
              <th className="py-1 px-2 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((row, idx) => {
              const currentProd = products.find((p) => p.id === row.productId);
              const itemCode = currentProd ? currentProd.code : '—';
              const storeStock = currentProd ? currentProd.stockByStore[selectedStoreId] ?? 0 : 0;

              return (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* # */}
                  <td className="py-1 px-2 text-center text-slate-500 font-mono text-xs">
                    {idx + 1}
                  </td>

                  {/* Item Code */}
                  <td className="py-1 px-2 text-slate-700 font-mono font-medium">
                    {itemCode}
                  </td>

                  {/* Item Name */}
                  <td className="py-1 px-2">
                    <div className="relative">
                      <select
                        value={row.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full text-xs font-medium rounded border border-slate-300 py-1 pl-2 pr-6 bg-white text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Item...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Rs. {p.salePrice.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                    </div>
                    {row.productId && (
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Stock: {storeStock} {row.unit}
                      </span>
                    )}
                  </td>

                  {/* Store Location */}
                  <td className="py-1 px-2">
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
                      {selectedStoreName}
                    </span>
                  </td>

                  {/* Unit */}
                  <td className="py-1 px-2 text-center text-slate-600 font-medium">
                    {row.unit || 'Pcs'}
                  </td>

                  {/* Qty */}
                  <td className="py-1 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onAddRow();
                      }}
                      onChange={(e) =>
                        handleFieldChange(idx, 'quantity', Math.max(1, parseFloat(e.target.value) || 1))
                      }
                      className="w-16 text-center font-mono font-semibold rounded border border-slate-300 py-0.5 px-1 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </td>

                  {/* Rate */}
                  <td className="py-1 px-2 text-right">
                    <input
                      type="number"
                      min="0"
                      value={row.rate}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onAddRow();
                      }}
                      onChange={(e) =>
                        handleFieldChange(idx, 'rate', Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-24 text-right font-mono font-medium rounded border border-slate-300 py-0.5 px-1.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </td>

                  {/* Discount % */}
                  <td className="py-1 px-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.discountValue === 0 ? '' : row.discountValue}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(
                            idx,
                            'discountValue',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="w-12 text-right font-mono rounded border border-slate-300 py-0.5 px-1 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-slate-400 font-mono text-[11px]">%</span>
                    </div>
                  </td>

                  {/* Tax % */}
                  <td className="py-1 px-2 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.taxPercent === 0 ? '' : row.taxPercent}
                        placeholder="0"
                        onChange={(e) =>
                          handleFieldChange(
                            idx,
                            'taxPercent',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="w-12 text-right font-mono rounded border border-slate-300 py-0.5 px-1 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-slate-400 font-mono text-[11px]">%</span>
                    </div>
                  </td>

                  {/* Tax Rs. */}
                  <td className="py-1 px-2 text-right font-mono text-slate-700">
                    Rs. {row.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>

                  {/* Total (Rs.) */}
                  <td className="py-1 px-2 text-right">
                    <span className="font-bold font-mono text-slate-900">
                      Rs. {row.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Action Column: + (Add New Row) and Trash (Delete Row Item) */}
                  <td className="py-1 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* + Add New Row Button */}
                      <button
                        type="button"
                        onClick={onAddRow}
                        className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 transition-colors shadow-2xs"
                        title="Add Next Row (+ Naya Item Row Add Karein)"
                        aria-label="Add new item row"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      {/* Delete Row Item Button */}
                      <button
                        type="button"
                        disabled={items.length <= 1}
                        onClick={() => onRemoveRow(idx)}
                        className={`p-1.5 rounded-md border transition-colors ${
                          items.length <= 1
                            ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                            : 'bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border-red-200 shadow-2xs'
                        }`}
                        title={items.length <= 1 ? "Minimum 1 row required" : "Delete Row Item (Row Delete Karein)"}
                        aria-label="Delete item row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
