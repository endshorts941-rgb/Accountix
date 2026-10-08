import React, { useState, useRef } from 'react';
import { SaleInvoice } from '../../sales/types';
import { X, Printer, Receipt, Check } from 'lucide-react';

interface ThermalReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SaleInvoice | null;
}

export const ThermalReceiptPreviewModal: React.FC<ThermalReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const handlePrintThermal = () => {
    window.print();
  };

  const totalQty = invoice.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0b66c3] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-bold text-sm">POS Thermal Receipt Preview</h3>
              <p className="text-[11px] text-white/80">{invoice.invoiceNo} · Cash Sale</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/20 rounded p-0.5 text-xs text-white">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  paperWidth === '80mm' ? 'bg-white text-blue-900 font-bold' : 'hover:bg-white/10'
                }`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  paperWidth === '58mm' ? 'bg-white text-blue-900 font-bold' : 'hover:bg-white/10'
                }`}
              >
                58mm
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Canvas (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div
            ref={printRef}
            className={`bg-white p-4 shadow-md border border-slate-300 font-mono text-[11px] leading-tight text-slate-900 ${
              paperWidth === '80mm' ? 'w-[300px]' : 'w-[240px]'
            }`}
          >
            {/* Store Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
              <div className="font-extrabold text-base tracking-wider uppercase">ACCOUNTIX</div>
              <div className="font-bold text-xs">RETAIL & TRADING STORE</div>
              <div className="text-[10px] text-slate-600">{invoice.storeLocationName}</div>
              <div className="text-[10px] text-slate-500">Tel: +92 51 111-222-333</div>
              <div className="text-[10px] text-slate-500">NTN / STRN: 1492049-2</div>
            </div>

            {/* Receipt Meta */}
            <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-[10px]">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>TXN NO:</span>
                <span className="font-bold">{invoice.transactionNo || 'TXN-' + invoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span className="font-bold">{invoice.invoiceDate} {invoice.exactTime || '10:00:00'}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{invoice.salesman || 'Ali Khan'}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-bold truncate max-w-[140px] text-right">
                  {invoice.customerName || 'Walk-in Cash Customer'}
                </span>
              </div>
            </div>

            {/* Items Header */}
            <div className="py-1.5 border-b border-dashed border-slate-400 font-bold text-[10px] flex justify-between">
              <span className="w-1/2">ITEM</span>
              <span className="w-1/4 text-center">QTY</span>
              <span className="w-1/4 text-right">TOTAL</span>
            </div>

            {/* Items List */}
            <div className="py-2 space-y-1.5 border-b border-dashed border-slate-400 text-[10px]">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold truncate">{item.productName || 'Custom Item'}</div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {item.quantity} {item.unit || 'pcs'} @ Rs. {item.rate.toLocaleString()}
                    </span>
                    <span className="font-bold text-slate-900">
                      Rs. {item.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 space-y-1 border-b border-dashed border-slate-400 text-[10px]">
              <div className="flex justify-between">
                <span>TOTAL ITEMS:</span>
                <span>{invoice.items.length} ({totalQty} Qty)</span>
              </div>
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>Rs. {invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.overallDiscount > 0 && (
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>- Rs. {invoice.overallDiscount.toLocaleString()}</span>
                </div>
              )}
              {invoice.overallTax > 0 && (
                <div className="flex justify-between">
                  <span>TAX ({invoice.taxPercent}%):</span>
                  <span>+ Rs. {invoice.overallTax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-extrabold pt-1 border-t border-slate-300">
                <span>NET TOTAL:</span>
                <span>Rs. {invoice.netInvoiceTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800">
                <span>CASH RECEIVED:</span>
                <span>Rs. {(invoice.cashReceivedAmount || invoice.cashReceivedAtSale || invoice.netInvoiceTotal).toLocaleString()}</span>
              </div>
              {(invoice.bankReceivedAmount || 0) > 0 && (
                <div className="flex justify-between font-bold text-slate-800">
                  <span>BANK RECEIVED:</span>
                  <span>Rs. {invoice.bankReceivedAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] font-bold text-slate-900">
                <span>REMAINING (BAQAYA):</span>
                <span>Rs. {(invoice.remainingBalanceAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="text-center pt-3 pb-1 space-y-2">
              <div className="font-bold text-[10px]">*** CASH SALE RECEIPT ***</div>
              <div className="text-[9px] text-slate-500">
                Thank you for your business!<br />
                Goods once sold cannot be returned without original cash receipt.
              </div>
              <div className="text-[8px] text-slate-400 font-mono tracking-widest pt-1">
                |||| | |||||| ||| ||||||| ||||| |||||||
              </div>
              <div className="text-[8px] text-slate-400">{invoice.invoiceNo}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">Paper size: {paperWidth} ESC/POS Standard</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrintThermal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#0b66c3] hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
