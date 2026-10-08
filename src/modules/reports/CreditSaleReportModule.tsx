import React, { useState, useEffect, useMemo } from 'react';
import { SaleInvoice, StoreLocation, Customer, BankAccount } from '../sales/types';
import { salesStore } from '../sales/salesStore';
import {
  parseDDMMYYYYToDate,
  DEFAULT_REPORT_FROM_DATE,
  getDefaultReportToDate,
  compareTransactionsChronologicalAscending,
  sortChronologicalAscending,
} from '../../utils/dateUtils';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { ThermalReceiptPreviewModal } from './components/ThermalReceiptPreviewModal';
import { AuditPasswordModal } from './components/AuditPasswordModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { CustomerLedgerModal } from '../sales/components/CustomerLedgerModal';
import { WordPressIntegrationModal } from '../../components/wordpress/WordPressIntegrationModal';
import {
  FileSpreadsheet,
  Printer,
  Plus,
  RefreshCw,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  X,
  Save,
  Trash2,
  Lock,
  Search,
  RotateCcw,
  Download,
  Filter,
  Eye,
  Edit3,
  BookOpen,
  ArrowUpDown,
  Building,
  User,
  TrendingUp,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

interface CreditSaleReportModuleProps {
  onNavigateToCreditSale?: (invoiceNo?: string) => void;
  onNavigateBack?: () => void;
  onOpenCashSaleReport?: () => void;
}

export const CreditSaleReportModule: React.FC<CreditSaleReportModuleProps> = ({
  onNavigateToCreditSale,
  onNavigateBack,
  onOpenCashSaleReport,
}) => {
  // Store subscription
  const [storeTick, setStoreTick] = useState(0);
  useEffect(() => {
    return salesStore.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  const allInvoices = useMemo(() => salesStore.getInvoices(), [storeTick]);
  const creditSaleInvoices = useMemo(
    () => allInvoices.filter((inv) => inv.saleType === 'Credit Sale'),
    [allInvoices]
  );
  const stores = useMemo(() => salesStore.getStores(), [storeTick]);
  const customers = useMemo(() => salesStore.getCustomers(), [storeTick]);
  const banks = useMemo(() => salesStore.getBanks(), [storeTick]);
  const auditLogs = useMemo(() => salesStore.getAuditLogs(), [storeTick]);

  // Filters State (Requirement #12)
  const [filters, setFilters] = useState({
    dateFrom: DEFAULT_REPORT_FROM_DATE,
    dateTo: getDefaultReportToDate(),
    customer: 'ALL',
    invoiceNo: '',
    transactionNo: '',
    storeLocationId: 'ALL',
    paymentMethod: 'ALL',
    status: 'ALL',
    amountFrom: '',
    amountTo: '',
    descriptionQuery: '',
  });

  // Sorting - Default: ACCOUNTIX Global Ascending Order (Oldest -> Newest)
  const [sortField, setSortField] = useState<string>('invoiceDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<SaleInvoice | null>(null);
  const [selectedInvoiceForThermal, setSelectedInvoiceForThermal] = useState<SaleInvoice | null>(null);
  const [auditAction, setAuditAction] = useState<{
    type: 'EDIT' | 'DELETE';
    invoice: SaleInvoice;
  } | null>(null);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);
  const [isCustomerLedgerOpen, setIsCustomerLedgerOpen] = useState(false);
  const [selectedLedgerCustomerId, setSelectedLedgerCustomerId] = useState<string | undefined>(undefined);
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick edit modal state
  const [editingInvoiceData, setEditingInvoiceData] = useState<SaleInvoice | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: DEFAULT_REPORT_FROM_DATE,
      dateTo: getDefaultReportToDate(),
      customer: 'ALL',
      invoiceNo: '',
      transactionNo: '',
      storeLocationId: 'ALL',
      paymentMethod: 'ALL',
      status: 'ALL',
      amountFrom: '',
      amountTo: '',
      descriptionQuery: '',
    });
    showToast('success', 'Filters reset to default view.');
  };

  // Filter Matching Logic
  const filteredInvoices = useMemo<SaleInvoice[]>(() => {
    const matched = creditSaleInvoices.filter((inv) => {
      // 1. Date From
      if (filters.dateFrom.trim()) {
        const fromDate = parseDDMMYYYYToDate(filters.dateFrom.trim());
        const invDate = parseDDMMYYYYToDate(inv.invoiceDate);
        if (fromDate && invDate && invDate < fromDate) return false;
      }

      // 2. Date To
      if (filters.dateTo.trim()) {
        const toDate = parseDDMMYYYYToDate(filters.dateTo.trim());
        const invDate = parseDDMMYYYYToDate(inv.invoiceDate);
        if (toDate && invDate && invDate > toDate) return false;
      }

      // 3. Customer
      if (filters.customer !== 'ALL') {
        if (inv.customerId !== filters.customer) return false;
      }

      // 4. Invoice No
      if (filters.invoiceNo.trim()) {
        if (!inv.invoiceNo.toLowerCase().includes(filters.invoiceNo.trim().toLowerCase())) {
          return false;
        }
      }

      // 5. Transaction No
      if (filters.transactionNo.trim()) {
        const txn = (inv.transactionNo || '').toLowerCase();
        if (!txn.includes(filters.transactionNo.trim().toLowerCase())) {
          return false;
        }
      }

      // 6. Store Location
      if (filters.storeLocationId !== 'ALL') {
        if (inv.storeLocationId !== filters.storeLocationId) return false;
      }

      // 7. Payment Method
      if (filters.paymentMethod !== 'ALL') {
        if (inv.paymentMethod !== filters.paymentMethod) return false;
      }

      // 8. Status
      if (filters.status !== 'ALL') {
        if (inv.status !== filters.status) return false;
      }

      // 9. Amount Range
      if (filters.amountFrom.trim()) {
        const minVal = parseFloat(filters.amountFrom);
        if (!isNaN(minVal) && inv.netInvoiceTotal < minVal) return false;
      }
      if (filters.amountTo.trim()) {
        const maxVal = parseFloat(filters.amountTo);
        if (!isNaN(maxVal) && inv.netInvoiceTotal > maxVal) return false;
      }

      // 10. Description / Details Query
      if (filters.descriptionQuery.trim()) {
        const q = filters.descriptionQuery.trim().toLowerCase();
        const itemsText = inv.items.map((i) => `${i.productName} ${i.description}`).join(' ').toLowerCase();
        const notesText = (inv.notes || '').toLowerCase();
        const custText = (inv.customerName || '').toLowerCase();
        if (!itemsText.includes(q) && !notesText.includes(q) && !custText.includes(q)) {
          return false;
        }
      }

      return true;
    });
    return sortChronologicalAscending(matched);
  }, [creditSaleInvoices, filters]);

  // Sorting - Default: ACCOUNTIX Global Ascending Order (Oldest -> Newest)
  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      if (sortField === 'invoiceDate') {
        const cmp = compareTransactionsChronologicalAscending(a, b);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      let aVal: any = (a as any)[sortField];
      let bVal: any = (b as any)[sortField];

      if (sortField === 'totalQty') {
        aVal = a.items.reduce((s, i) => s + (i.quantity || 0), 0);
        bVal = b.items.reduce((s, i) => s + (i.quantity || 0), 0);
      }

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      let res = 0;
      if (typeof aVal === 'string') {
        res = aVal.localeCompare(bVal);
      } else {
        res = aVal - bVal;
      }

      if (res !== 0) {
        return sortDirection === 'asc' ? res : -res;
      }

      // Tie-breaker: Chronological Ascending
      return compareTransactionsChronologicalAscending(a, b);
    });
  }, [filteredInvoices, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Aggregated Totals
  const summaryTotals = useMemo(() => {
    let totalInvoices = filteredInvoices.length;
    let totalQty = 0;
    let totalCreditSales = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    filteredInvoices.forEach((inv) => {
      const qty = inv.items.reduce((s, i) => s + (i.quantity || 0), 0);
      totalQty += qty;
      totalCreditSales += inv.netInvoiceTotal || 0;

      const cashRec = inv.cashReceivedAmount || 0;
      const bankRec = inv.bankReceivedAmount || 0;
      const otherRec = inv.otherReceivedAmount || 0;
      const totRec = inv.totalReceivedAmount !== undefined ? inv.totalReceivedAmount : (cashRec + bankRec + otherRec);
      const rem = inv.remainingBalanceAmount !== undefined ? inv.remainingBalanceAmount : (inv.currentInvoiceRemaining || 0);

      totalReceived += totRec;
      totalOutstanding += rem;
      totalDiscount += inv.overallDiscount || 0;
      totalTax += inv.overallTax || 0;
    });

    return {
      totalInvoices,
      totalQty,
      totalCreditSales,
      totalReceived,
      totalOutstanding,
      totalDiscount,
      totalTax,
    };
  }, [filteredInvoices]);

  // EXPORT EXCEL (CSV) - Requirement #12
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      showToast('error', 'No Credit Sale records found to export.');
      return;
    }

    const headers = [
      'Sr #',
      'Transaction No',
      'Invoice No',
      'Date',
      'Customer Name',
      'Store Location',
      'Line Items Details',
      'Total Quantity',
      'Net Total (PKR)',
      'Total Received (PKR)',
      'Remaining Credit / Baqaya (PKR)',
      'Payment Method',
      'Salesman',
      'Status',
    ];

    const rows = filteredInvoices.map((inv, idx) => {
      const qty = inv.items.reduce((s, i) => s + (i.quantity || 0), 0);
      const itemsDetail = inv.items.map((i) => `${i.productName} (Qty: ${i.quantity})`).join('; ');
      const totRec = inv.totalReceivedAmount !== undefined ? inv.totalReceivedAmount : (inv.cashReceivedAtSale || 0);
      const rem = inv.remainingBalanceAmount !== undefined ? inv.remainingBalanceAmount : (inv.currentInvoiceRemaining || 0);

      return [
        idx + 1,
        `"${inv.transactionNo || 'TXN-' + inv.invoiceNo}"`,
        `"${inv.invoiceNo}"`,
        `"${inv.invoiceDate}"`,
        `"${inv.customerName || 'Customer'}"`,
        `"${inv.storeLocationName}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        qty,
        inv.netInvoiceTotal,
        totRec,
        rem,
        `"${inv.paymentMethod}"`,
        `"${inv.salesman || 'Ali Khan'}"`,
        `"${inv.status}"`,
      ];
    });

    // Summary Row
    const summaryRow = [
      'TOTALS',
      '',
      '',
      '',
      '',
      '',
      `"${summaryTotals.totalInvoices} Invoices"`,
      summaryTotals.totalQty,
      summaryTotals.totalCreditSales,
      summaryTotals.totalReceived,
      summaryTotals.totalOutstanding,
      '',
      '',
      '',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(',')), summaryRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ACCOUNTIX_Credit_Sale_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Credit Sale Report exported to CSV/Excel successfully!');
  };

  // AUDIT PROTECTED EDIT & DELETE
  const handleRequestAuditAction = (type: 'EDIT' | 'DELETE', invoice: SaleInvoice) => {
    setAuditAction({ type, invoice });
  };

  const handleAuditVerificationSuccess = (user: string, reason: string) => {
    if (!auditAction) return;
    const { type, invoice } = auditAction;

    if (type === 'EDIT') {
      if (onNavigateToCreditSale) {
        onNavigateToCreditSale(invoice.invoiceNo);
      } else {
        setEditingInvoiceData(JSON.parse(JSON.stringify(invoice)));
      }
      showToast('success', `Audit verified by ${user}. Opening editor for ${invoice.invoiceNo}.`);
    } else if (type === 'DELETE') {
      const res = salesStore.deleteInvoice(invoice.invoiceNo, user);
      if (res.success) {
        showToast('success', `Credit Sale ${invoice.invoiceNo} deleted with full accounting & stock reversal.`);
      } else {
        showToast('error', res.message);
      }
    }
    setAuditAction(null);
  };

  const openCustomerLedger = (custName?: string) => {
    const cust = customers.find((c) => c.name === custName);
    setSelectedLedgerCustomerId(cust?.id);
    setIsCustomerLedgerOpen(true);
  };

  return (
    <main className="flex-1 bg-[#D0E7F5] min-h-[calc(100vh-2.5rem)] py-2 sm:py-3 px-2 sm:px-4 text-[#111111] font-sans antialiased select-none pb-8 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#D0E7F5]">
      <div className="w-full max-w-[1920px] mx-auto space-y-2.5">
        {/* TOP HEADER: Branding & Action Buttons */}
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-[24px] font-bold text-[#111111] tracking-tight uppercase">
              CREDIT SALE REPORT
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B6D9EA] border border-[#7F9EAD] text-[#111111] uppercase tracking-wide">
              ACCOUNTS RECEIVABLE
            </span>
            <span className="text-[11px] font-mono text-slate-700 hidden md:inline">
              · ACCOUNTIX Accounting & POS Database
            </span>
          </div>

          {/* Quick Actions in ACCOUNTIX Classic Light-Blue Style */}
          <div className="flex items-center flex-wrap gap-1.5">
            {onNavigateToCreditSale && (
              <button
                type="button"
                onClick={() => onNavigateToCreditSale()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Create New Credit Sale Invoice"
              >
                <Plus className="w-3.5 h-3.5 text-blue-900" />
                <span>New Credit Sale</span>
              </button>
            )}

            {onOpenCashSaleReport && (
              <button
                type="button"
                onClick={onOpenCashSaleReport}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Switch to Cash Sale Report"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-800" />
                <span>Cash Sale Report</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCustomerLedgerOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Open Complete Customer Ledgers"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-800" />
              <span>Customer Ledgers</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuditLogsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="View Audit History"
            >
              <Lock className="w-3.5 h-3.5 text-[#0b66c3]" />
              <span>Audit Trail ({auditLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWordPressModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="View WordPress [accountix_credit_sale] snippet"
            >
              <Code2 className="w-3.5 h-3.5 text-[#0b66c3]" />
              <span>WP Code</span>
            </button>

            <button
              type="button"
              onClick={() => setStoreTick((t) => t + 1)}
              className="p-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Refresh / Sync"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TOAST ALERT NOTIFICATION */}
        {toastMessage && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between shadow-xs animate-in fade-in ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-semibold">{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. FILTER SECTION: MASTER COMPACT ACCOUNTIX FILTER PANEL */}
        <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs">
          {/* SECTION HEADER: Light Blue with thin gray-blue border */}
          <div className="bg-[#B6D9EA] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between">
            <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
              Report Filters
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCustomerLedgerOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-xs cursor-pointer shadow-2xs transition-colors"
                title="Open Customer Ledgers"
              >
                <BookOpen className="w-3 h-3 text-[#0b66c3]" />
                <span className="hidden sm:inline">Customer Ledgers</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-xs cursor-pointer shadow-2xs transition-colors"
                title="Reset Filters to Default"
              >
                <RotateCcw className="w-3 h-3 text-slate-700" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Filter Inputs Grid */}
          <div className="p-2.5 sm:p-3 bg-[#E5F1F8] flex flex-col gap-2.5 text-xs text-[#111111]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              {/* Date From */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  From Date:
                </label>
                <input
                  type="text"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  placeholder="01/01/2026"
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  To Date:
                </label>
                <input
                  type="text"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  placeholder="31/12/2026"
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                />
              </div>

              {/* Store Location */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Store Location:
                </label>
                <select
                  value={filters.storeLocationId}
                  onChange={(e) => setFilters({ ...filters, storeLocationId: e.target.value })}
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                >
                  <option value="ALL">All Stores</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Customer:
                </label>
                <select
                  value={filters.customer}
                  onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                >
                  <option value="ALL">All Customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Due: Rs. {c.previousBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice No */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Invoice No:
                </label>
                <input
                  type="text"
                  value={filters.invoiceNo}
                  onChange={(e) => setFilters({ ...filters, invoiceNo: e.target.value })}
                  placeholder="SI-..."
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Credit Status:
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UNPAID CREDIT">Unpaid Credit</option>
                  <option value="PARTIAL CREDIT">Partial Credit</option>
                  <option value="PAID IN FULL">Paid in Full</option>
                </select>
              </div>

              {/* Transaction No */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Transaction No:
                </label>
                <input
                  type="text"
                  value={filters.transactionNo}
                  onChange={(e) => setFilters({ ...filters, transactionNo: e.target.value })}
                  placeholder="TXN-..."
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                />
              </div>

              {/* Amount Range */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Amount Range (Min - Max PKR):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={filters.amountFrom}
                    onChange={(e) => setFilters({ ...filters, amountFrom: e.target.value })}
                    placeholder="Min PKR"
                    className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                  />
                  <span className="text-slate-600 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    value={filters.amountTo}
                    onChange={(e) => setFilters({ ...filters, amountTo: e.target.value })}
                    placeholder="Max PKR"
                    className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                  />
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Search Filter & EXPORT BUTTONS [ Excel ] [ Print ] [ PDF ] */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#7F9EAD]/40">
              {/* Item / Transaction Search */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
                  Search / Details:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={filters.descriptionQuery}
                    onChange={(e) => setFilters({ ...filters, descriptionQuery: e.target.value })}
                    placeholder="Search item name, specs, customer or remarks..."
                    className="h-7 w-48 sm:w-72 px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                  />
                  <button
                    type="button"
                    onClick={() => showToast('success', `Found ${filteredInvoices.length} matching Credit Sale records.`)}
                    className="h-7 px-2.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    title="Search Filter"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-800" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* FAR RIGHT: EXPORT BUTTONS */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111111] text-xs">Export:</span>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Export Credit Sale Report to Excel (CSV)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Print Report"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-800" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Download / Print PDF"
                >
                  <Download className="w-3.5 h-3.5 text-red-800" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SUMMARY CARDS (Master Accounting Light-Blue Two-Tone Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Card 1: Total Credit Sales */}
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Total Credit Sales
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-base sm:text-lg font-bold font-mono text-[#111111]">
                Rs. {summaryTotals.totalCreditSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-700 font-medium">
                {summaryTotals.totalInvoices} Invoices · {summaryTotals.totalQty} Units
              </span>
            </div>
          </div>

          {/* Card 2: Total Received at Sale */}
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Total Received (Rs.)
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-800">
                Rs. {summaryTotals.totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-700 font-medium">
                Settled via Cash / Bank
              </span>
            </div>
          </div>

          {/* Card 3: Total Outstanding (Accounts Receivable) */}
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Total Outstanding Credit
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-base sm:text-lg font-bold font-mono text-red-700">
                Rs. {summaryTotals.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-red-600 font-semibold">
                Customer Receivable Baqaya
              </span>
            </div>
          </div>

          {/* Card 4: Total Discount */}
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Sales Discount
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-base sm:text-lg font-bold font-mono text-[#111111]">
                Rs. {summaryTotals.totalDiscount.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-700 font-medium">
                P&L Discount Expense
              </span>
            </div>
          </div>

          {/* Card 5: Total Sales Tax */}
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Output Sales Tax
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-base sm:text-lg font-bold font-mono text-[#111111]">
                Rs. {summaryTotals.totalTax.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-700 font-medium">
                Output Tax Payable
              </span>
            </div>
          </div>
        </div>

        {/* 3. CREDIT SALE TABLE */}
        <div className="border border-[#7F9EAD] bg-white rounded-none sm:rounded-xs shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#B6D9EA] px-3 py-1.5 border-b border-[#7F9EAD] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
                Credit Sale Data Table
              </h2>
              <span className="px-1.5 py-0.2 bg-[#D7EAF5] border border-[#7F9EAD] text-[#111111] text-[11px] font-bold">
                {sortedInvoices.length} {sortedInvoices.length === 1 ? 'Transaction' : 'Transactions'}
              </span>
            </div>

            <div className="text-[11px] text-slate-700 hidden sm:block">
              * Credit sales automatically create Customer Receivable, Day Book, and Customer Ledger entries.
            </div>
          </div>

          {/* Table Container: Controlled Height Scrollable */}
          <div className="overflow-x-auto overflow-y-auto max-h-[520px] min-h-[260px] [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#E2EFF7] relative">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] shadow-xs text-[11px] select-none">
                <tr>
                  <th className="py-2 px-2.5 w-8 text-center border-r border-[#7F9EAD]">#</th>
                  <th
                    onClick={() => handleSort('transactionNo')}
                    className="py-2 px-2.5 w-24 cursor-pointer hover:bg-[#A3CEE2] border-r border-[#7F9EAD]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Txn No</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-700" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('invoiceNo')}
                    className="py-2 px-2.5 w-24 cursor-pointer hover:bg-[#A3CEE2] border-r border-[#7F9EAD]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Invoice No</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-700" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('invoiceDate')}
                    className="py-2 px-2.5 w-24 cursor-pointer hover:bg-[#A3CEE2] border-r border-[#7F9EAD]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-700" />
                    </div>
                  </th>
                  <th className="py-2 px-3 min-w-[170px] border-r border-[#7F9EAD]">
                    Customer Name
                  </th>
                  <th className="py-2 px-2.5 w-28 border-r border-[#7F9EAD]">
                    Store Location
                  </th>
                  <th className="py-2 px-3 min-w-[200px] border-r border-[#7F9EAD]">
                    Items / Details
                  </th>
                  <th
                    onClick={() => handleSort('totalQty')}
                    className="py-2 px-2 w-14 text-center cursor-pointer hover:bg-slate-200/70 border-r border-slate-200"
                  >
                    Qty
                  </th>
                  <th
                    onClick={() => handleSort('netInvoiceTotal')}
                    className="py-2 px-3 w-28 text-right cursor-pointer hover:bg-slate-200/70 border-r border-slate-200 font-extrabold text-blue-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Net Total</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2 px-2.5 w-24 text-right border-r border-slate-200 font-bold text-emerald-800">
                    Received
                  </th>
                  <th className="py-2 px-2.5 w-24 text-right border-r border-slate-200 font-extrabold text-red-600">
                    Remaining
                  </th>
                  <th className="py-2 px-2.5 w-20 border-r border-slate-200">
                    Method
                  </th>
                  <th className="py-2 px-2 w-20 text-center border-r border-slate-200">
                    Status
                  </th>
                  <th className="py-2 px-3 w-36 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-slate-400">
                      <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-sm">No Credit Sale Transactions found</p>
                      <p className="text-xs">Adjust your search criteria or create a new Credit Sale.</p>
                    </td>
                  </tr>
                ) : (
                  sortedInvoices.map((inv, idx) => {
                    const totalQty = inv.items.reduce((s, i) => s + (i.quantity || 0), 0);
                    const itemsSummary = inv.items
                      .map((i) => `${i.productName} (${i.quantity})`)
                      .join(', ');
                    const totRec = inv.totalReceivedAmount !== undefined ? inv.totalReceivedAmount : (inv.cashReceivedAtSale || 0);
                    const remaining = inv.remainingBalanceAmount !== undefined ? inv.remainingBalanceAmount : (inv.currentInvoiceRemaining || 0);

                    return (
                      <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="py-2 px-2.5 text-center font-mono text-slate-400 border-r border-slate-100 text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2.5 font-mono font-medium text-slate-700 border-r border-slate-100 text-[11px]">
                          {inv.transactionNo || 'TXN-' + inv.invoiceNo}
                        </td>
                        <td className="py-2 px-2.5 font-mono font-bold text-blue-700 border-r border-slate-100 text-[11px]">
                          {inv.invoiceNo}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-slate-600 border-r border-slate-100 text-[11px]">
                          <div>{inv.invoiceDate}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.exactTime || '10:00:00'}</div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100">
                          <button
                            type="button"
                            onClick={() => openCustomerLedger(inv.customerName)}
                            className="font-semibold text-slate-900 hover:text-blue-700 hover:underline text-left block truncate max-w-[160px] cursor-pointer"
                            title="Open Customer Ledger"
                          >
                            {inv.customerName}
                          </button>
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 border-r border-slate-100 text-[11px] truncate max-w-[110px]">
                          {inv.storeLocationName}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-100 text-[11px]">
                          <div className="text-slate-700 truncate max-w-[220px]" title={itemsSummary}>
                            {itemsSummary || '—'}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {inv.items.length} line items
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 border-r border-slate-100 text-[11px]">
                          {totalQty}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900 border-r border-slate-100 text-xs">
                          Rs. {inv.netInvoiceTotal.toLocaleString()}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-extrabold text-emerald-700 border-r border-slate-100 text-[11px]">
                          {totRec.toLocaleString()}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-black text-red-600 border-r border-slate-100 text-[11px]">
                          {remaining.toLocaleString()}
                        </td>
                        <td className="py-2 px-2.5 border-r border-slate-100 text-[11px] font-medium text-slate-700">
                          {inv.paymentMethod}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-100 text-[10px]">
                          <span className={`inline-block px-1.5 py-0.5 rounded font-bold ${
                            inv.status === 'PAID IN FULL'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'PARTIAL CREDIT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForDetails(inv)}
                              className="p-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="View Complete Invoice Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Customer Ledger */}
                            <button
                              type="button"
                              onClick={() => openCustomerLedger(inv.customerName)}
                              className="p-1 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                              title="View Customer Ledger Statement"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit (Audit Protected) */}
                            <button
                              type="button"
                              onClick={() => handleRequestAuditAction('EDIT', inv)}
                              className="p-1 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                              title="Edit Transaction (Requires Audit Password)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="p-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Print A4 Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Thermal */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForThermal(inv)}
                              className="p-1 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                              title="Thermal POS Receipt Preview"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete (Audit Protected) */}
                            <button
                              type="button"
                              onClick={() => handleRequestAuditAction('DELETE', inv)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete Transaction (Requires Audit Password)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Totals Bar: Light Blue Header & Border */}
          <div className="bg-[#B6D9EA] border-t-2 border-[#7F9EAD] p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-bold shrink-0 text-[#111111]">
            <div className="flex items-center gap-2 text-[#111111]">
              <span className="uppercase tracking-wider">Report Totals:</span>
              <span className="font-mono text-[#111111]">{summaryTotals.totalInvoices} Invoices</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-[#111111]">{summaryTotals.totalQty} Units Sold</span>
            </div>

            <div className="flex items-center flex-wrap gap-5 text-xs font-mono">
              <div>
                <span className="text-slate-700 font-sans text-[11px] block">Total Credit Sales:</span>
                <span className="font-black text-blue-900 text-sm">
                  Rs. {summaryTotals.totalCreditSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-700 font-sans text-[11px] block">Total Received:</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  Rs. {summaryTotals.totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-red-700 font-sans text-[11px] font-bold block">Total Outstanding:</span>
                <span className="font-black text-red-700 text-sm">
                  Rs. {summaryTotals.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <TransactionDetailsModal
        isOpen={Boolean(selectedInvoiceForDetails)}
        onClose={() => setSelectedInvoiceForDetails(null)}
        invoice={selectedInvoiceForDetails}
        onPrint={() => window.print()}
        onOpenThermal={(inv) => {
          setSelectedInvoiceForDetails(null);
          setSelectedInvoiceForThermal(inv);
        }}
      />

      <ThermalReceiptPreviewModal
        isOpen={Boolean(selectedInvoiceForThermal)}
        onClose={() => setSelectedInvoiceForThermal(null)}
        invoice={selectedInvoiceForThermal}
      />

      <CustomerLedgerModal
        isOpen={isCustomerLedgerOpen}
        onClose={() => setIsCustomerLedgerOpen(false)}
        customerId={selectedLedgerCustomerId}
        customers={customers}
        onViewTransactionDetails={(inv) => {
          setIsCustomerLedgerOpen(false);
          setSelectedInvoiceForDetails(inv);
        }}
      />

      <AuditPasswordModal
        isOpen={Boolean(auditAction)}
        onClose={() => setAuditAction(null)}
        onSuccess={handleAuditVerificationSuccess}
        actionTitle={
          auditAction?.type === 'DELETE'
            ? 'Authorized Credit Sale Deletion & Ledger Reversal'
            : 'Authorized Credit Sale Modification'
        }
        actionType={auditAction?.type || 'DELETE'}
        invoiceNo={auditAction?.invoice.invoiceNo || ''}
      />

      <AuditLogsModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
        logs={auditLogs}
      />

      <WordPressIntegrationModal
        isOpen={isWordPressModalOpen}
        onClose={() => setIsWordPressModalOpen(false)}
      />
    </main>
  );
};
