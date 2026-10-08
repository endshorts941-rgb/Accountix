import React from 'react';
import { SaleType } from '../types';
import { FileText, Check, Printer } from 'lucide-react';

interface InvoiceTotalsSummaryProps {
  saleType: SaleType;
  subtotal: number;
  overallDiscount: number;
  taxPercent: number;
  overallTax: number;
  netInvoiceTotal: number;

  // Credit sale balances
  previousBalance: number;
  cashReceivedAtSale: number;
  currentInvoiceRemaining: number;
  finalCustomerBalance: number;

  // Notes
  notes?: string;
  onNotesChange?: (notes: string) => void;

  // Actions
  onSave: () => void;
  onPrint: () => void;
  isSaving?: boolean;
}

export const InvoiceTotalsSummary: React.FC<InvoiceTotalsSummaryProps> = ({
  saleType,
  subtotal,
  overallDiscount,
  taxPercent,
  overallTax,
  netInvoiceTotal,
  cashReceivedAtSale,
  currentInvoiceRemaining,
  notes = 'Thank you for your business!',
  onNotesChange,
  onSave,
  onPrint,
  isSaving = false,
}) => {
  const isCashSale = saleType === 'Cash Sale';

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 shrink-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Left Column: Notes & Quick Terms (col-span-4) */}
        <div className="lg:col-span-4 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
            <FileText className="w-3 h-3 text-slate-600" />
            <span>Invoice Notes / Remarks:</span>
          </div>
          <input
            type="text"
            value={notes}
            placeholder="Thank you for your business!"
            onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
            className="w-full text-xs rounded border border-slate-300 py-1 px-2.5 text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
          />
          <div className="text-[10px] text-slate-400 flex items-center gap-2 truncate">
            <span>• Goods sold not returnable without receipt</span>
            <span>• Verified at delivery</span>
          </div>
        </div>

        {/* Right Column: Financial Figures Grid & Action Buttons (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-2 lg:pt-0 lg:pl-3">
          {/* Numbers Summary Columns */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs flex-1 w-full">
            <div>
              <span className="text-[10px] text-slate-500 block">Sub Total</span>
              <span className="font-bold font-mono text-slate-800 text-xs">
                Rs. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Discount</span>
              <span className="font-semibold font-mono text-slate-700 text-xs">
                -Rs. {overallDiscount.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Tax ({taxPercent}%)</span>
              <span className="font-semibold font-mono text-slate-700 text-xs">
                +Rs. {overallTax.toFixed(0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 block">Total Amount</span>
              <span className="font-extrabold font-mono text-blue-700 text-sm">
                Rs. {netInvoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 font-semibold block">Cash Received</span>
              <span className="font-bold font-mono text-emerald-600 text-xs">
                Rs. {(isCashSale ? netInvoiceTotal : cashReceivedAtSale).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-red-500 font-semibold block">Baqaya</span>
              <span className="font-bold font-mono text-red-600 text-xs">
                Rs. {(isCashSale ? 0 : currentInvoiceRemaining).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Action Buttons: Save & Print */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isSaving ? 'Saving...' : 'Save Invoice'}</span>
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0b66c3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-98"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
