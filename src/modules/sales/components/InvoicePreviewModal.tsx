import React from 'react';
import { SaleInvoice } from '../types';
import { InvoicePrintDocument } from './InvoicePrintDocument';
import { X, Printer, Download } from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  invoice: SaleInvoice;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  onPrint,
  invoice,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-slate-100 rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Invoice Print Preview — {invoice.invoiceNo}
              </h2>
              <p className="text-[11px] text-slate-500">
                Official {invoice.saleType} voucher layout for paper & PDF printing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70">
          <div className="bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
            <InvoicePrintDocument invoice={invoice} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ACCOUNTIX Sales Module · Auto-formatted for standard A4 / Letter paper</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
