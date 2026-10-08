import React from 'react';
import { StoreLocation, Customer, BankAccount } from '../../sales/types';
import { Search, RotateCcw, Printer, FileSpreadsheet, FileDown, ShieldCheck } from 'lucide-react';

export interface ReportFilterState {
  dateFrom: string;
  dateTo: string;
  transactionNo: string;
  invoiceNo: string;
  customerName: string;
  storeLocationId: string;
  paymentMethod: string; // 'ALL' | 'Cash' | 'Bank' | 'Split'
  cashOrBank: string; // 'ALL' | 'CASH_ONLY' | 'BANK_ONLY' | 'BOTH'
  amountFrom: string;
  amountTo: string;
  salesman: string;
}

interface CashSaleReportFiltersProps {
  filters: ReportFilterState;
  onFilterChange: (key: keyof ReportFilterState, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onPrintReport: () => void;
  onExportExcel: () => void;
  onDownloadPdf: () => void;
  onOpenAuditLogs?: () => void;
  stores: StoreLocation[];
  customers: Customer[];
  banks?: BankAccount[];
  salesmen?: string[];
}

export const CashSaleReportFilters: React.FC<CashSaleReportFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  onPrintReport,
  onExportExcel,
  onDownloadPdf,
  onOpenAuditLogs,
  stores,
  salesmen = [],
}) => {
  return (
    <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs">
      {/* SECTION HEADER: Light Blue with thin gray-blue border */}
      <div className="bg-[#B6D9EA] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between">
        <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
          Report Filters
        </h2>
        <div className="flex items-center gap-1.5">
          {onOpenAuditLogs && (
            <button
              type="button"
              onClick={onOpenAuditLogs}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-xs cursor-pointer shadow-2xs"
              title="Audit Logs"
            >
              <ShieldCheck className="w-3 h-3 text-[#0b66c3]" />
              <span>Audit Log</span>
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-xs cursor-pointer shadow-2xs"
            title="Reset Filters to Default"
          >
            <RotateCcw className="w-3 h-3 text-slate-700" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* FILTER BODY: Compact Accounting Filter Layout */}
      <div className="p-2.5 sm:p-3 bg-[#E5F1F8] flex flex-col gap-2.5 text-xs text-[#111111]">
        {/* FIRST ROW: Date Range [ From Date ] To Date [ To Date ] Store Location [ Select Store ▼ ] */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range: From Date */}
          <div className="flex items-center gap-1.5">
            <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
              Date Range:
            </label>
            <span className="text-[11px] text-slate-700">From</span>
            <input
              type="text"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              placeholder="01/01/2024"
              className="h-7 w-28 px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-1.5">
            <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
              To Date:
            </label>
            <input
              type="text"
              value={filters.dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              placeholder="31/12/2026"
              className="h-7 w-28 px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
            />
          </div>

          {/* Store Location */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
              Store Location:
            </label>
            <select
              value={filters.storeLocationId}
              onChange={(e) => onFilterChange('storeLocationId', e.target.value)}
              className="h-7 px-2 flex-1 max-w-xs bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
            >
              <option value="ALL">Select Store ▼ (All Stores)</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method filter */}
          <div className="flex items-center gap-1.5">
            <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
              Payment:
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => onFilterChange('paymentMethod', e.target.value)}
              className="h-7 px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
            >
              <option value="ALL">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Deposit</option>
              <option value="Petty Cash">Petty Cash</option>
            </select>
          </div>
        </div>

        {/* SECOND ROW: Customer Name [ Customer Search Input ] [ 🔍 Search ] ... Export [ Excel ] [ Print ] [ PDF ] */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#7F9EAD]/40">
          {/* Customer Name Search */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
              Customer Name:
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={filters.customerName}
                onChange={(e) => onFilterChange('customerName', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearch();
                }}
                placeholder="Customer Name / Walk-in..."
                className="h-7 w-48 sm:w-64 px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
              />
              <button
                type="button"
                onClick={onSearch}
                className="h-7 px-2.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Search Filter"
              >
                <Search className="w-3.5 h-3.5 text-slate-800" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* FAR RIGHT: EXPORT BUTTONS [ Excel ] [ Print ] [ PDF ] */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111111] text-xs">Export:</span>

            {/* Excel Button */}
            <button
              type="button"
              onClick={onExportExcel}
              className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Export Cash Sale Report to Excel (CSV)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
              <span>Excel</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={onPrintReport}
              className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Open Print-Friendly Report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-800" />
              <span>Print</span>
            </button>

            {/* PDF Button */}
            <button
              type="button"
              onClick={onDownloadPdf}
              className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Generate / Download PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-red-800" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
