import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Printer, Eye, Trash2, BookOpen, RotateCcw, ZoomIn, ZoomOut, Maximize2, Receipt } from 'lucide-react';

interface InvoiceTopActionsProps {
  onNew: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPrint: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onOpenAudit: () => void;
  onOpenCashSaleReport?: () => void;
  onOpenCreditSaleReport?: () => void;
  onOpenAllSalesReport?: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  currentIndex: number;
  totalInvoices: number;
  isDraft: boolean;
  invoiceNo: string;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

export const InvoiceTopActions: React.FC<InvoiceTopActionsProps> = ({
  onNew,
  onNext,
  onPrevious,
  onPrint,
  onPreview,
  onDelete,
  onOpenAudit,
  onOpenCashSaleReport,
  onOpenCreditSaleReport,
  onOpenAllSalesReport,
  hasNext,
  hasPrevious,
  currentIndex,
  totalInvoices,
  isDraft,
  invoiceNo,
  zoomLevel,
  onZoomChange,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      {/* Left: Top Actions: New | Next | Previous | Print | Preview */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {/* NEW */}
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors active:scale-95"
          title="Create New Blank Sale Invoice (Alt+N)"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* PREVIOUS */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            hasPrevious
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
              : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
          }`}
          title="Open Previous Saved Invoice"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* NEXT */}
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            hasNext
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
              : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
          }`}
          title="Open Next Saved Invoice"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* PRINT */}
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors"
          title="Print Sale Invoice (Ctrl+P)"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Print</span>
        </button>

        {/* PREVIEW */}
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-blue-50/60 text-blue-700 border border-blue-200 shadow-2xs transition-colors"
          title="Preview Printable Invoice"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Preview</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* DELETE (Mojooda Transaction Delete Karein) */}
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 shadow-2xs transition-colors active:scale-95"
          title="Delete Current Transaction / Invoice (Mojooda Transaction Delete Karein)"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
          <span>Delete</span>
        </button>
      </div>

      {/* Center/Right: View Scale Controller (Default: 75% Full Page) & Accounting Ledger */}
      <div className="flex items-center flex-wrap gap-2.5 text-xs">
        {/* View Scale Control */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200 rounded-md px-2 py-1 text-xs shadow-2xs">
            <Maximize2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">View:</span>
            <select
              value={zoomLevel}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-blue-700 border-none p-0 focus:ring-0 cursor-pointer"
              title="Invoice View Scale"
            >
              <option value={100}>100% (Standard View)</option>
              <option value={90}>90%</option>
              <option value={85}>85% (Compact)</option>
              <option value={80}>80%</option>
              <option value={75}>75% (Full Page Fit)</option>
              <option value={70}>70% (Ultra Fit)</option>
            </select>
          </div>

          <div className="flex items-center border border-slate-200 rounded-md bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(65, zoomLevel - 5))}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Zoom Out (-5%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onZoomChange(100)}
              className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-colors ${
                zoomLevel === 100
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Reset to 100% Standard View"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(120, zoomLevel + 5))}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Zoom In (+5%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Invoice Position Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
          <span className="font-semibold text-slate-800 font-mono">{invoiceNo}</span>
          <span className="text-slate-400">·</span>
          {isDraft ? (
            <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded text-[11px]">
              Draft (Unsaved)
            </span>
          ) : (
            <span className="text-slate-600 text-[11px]">
              Invoice {currentIndex + 1} of {totalInvoices}
            </span>
          )}
        </div>

        {onOpenAllSalesReport && (
          <button
            type="button"
            onClick={onOpenAllSalesReport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-md transition-colors shadow-2xs cursor-pointer"
            title="Open Master All Sales Report (Cash, Credit & Split transactions)"
          >
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">All Sales Report</span>
          </button>
        )}

        {onOpenCashSaleReport && (
          <button
            type="button"
            onClick={onOpenCashSaleReport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-md transition-colors shadow-2xs cursor-pointer"
            title="Open Cash Sale Report Module (All cash sale records, filters, audit & summary)"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Cash Sale Report</span>
          </button>
        )}

        {onOpenCreditSaleReport && (
          <button
            type="button"
            onClick={onOpenCreditSaleReport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-md transition-colors shadow-2xs cursor-pointer"
            title="Open Credit Sale Report Module (Outstanding balances, Aging, filters & audit)"
          >
            <Receipt className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden lg:inline">Credit Sale Report</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAudit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors shadow-2xs"
          title="View Day Book & Ledgers"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden xl:inline">Accounting Journal & Ledgers</span>
        </button>
      </div>
    </div>
  );
};
