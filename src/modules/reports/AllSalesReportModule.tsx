import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SaleInvoice, StoreLocation, Customer, BankAccount } from '../sales/types';
import { salesStore } from '../sales/salesStore';
import {
  parseDDMMYYYYToDate,
  getCurrentDateDDMMYYYY,
  DEFAULT_REPORT_FROM_DATE,
  getDefaultReportToDate,
  compareTransactionsChronologicalAscending,
  sortChronologicalAscending,
} from '../../utils/dateUtils';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { ThermalReceiptPreviewModal } from './components/ThermalReceiptPreviewModal';
import { AuditPasswordModal } from './components/AuditPasswordModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { PrintableAllSalesReport } from './components/PrintableAllSalesReport';
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
  Trash2,
  Lock,
  Search,
  RotateCcw,
  Download,
  Filter,
  Eye,
  Edit3,
  Copy,
  BookOpen,
  ArrowUpDown,
  Building,
  User,
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
  Check,
} from 'lucide-react';

interface AllSalesReportModuleProps {
  onNavigateToSaleInvoice?: (type?: 'Cash Sale' | 'Credit Sale', invoiceNo?: string) => void;
  onNavigateBack?: () => void;
  onOpenCashSaleReport?: () => void;
  onOpenCreditSaleReport?: () => void;
}

export const AllSalesReportModule: React.FC<AllSalesReportModuleProps> = ({
  onNavigateToSaleInvoice,
  onNavigateBack,
  onOpenCashSaleReport,
  onOpenCreditSaleReport,
}) => {
  // Store subscription
  const [storeTick, setStoreTick] = useState(0);
  useEffect(() => {
    return salesStore.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  const allInvoices = useMemo(() => salesStore.getInvoices(), [storeTick]);
  const stores = useMemo(() => salesStore.getStores(), [storeTick]);
  const customers = useMemo(() => salesStore.getCustomers(), [storeTick]);
  const banks = useMemo(() => salesStore.getBanks(), [storeTick]);
  const auditLogs = useMemo(() => salesStore.getAuditLogs(), [storeTick]);

  // Unique Salesmen
  const salesmen = useMemo(() => {
    const set = new Set<string>();
    allInvoices.forEach((inv) => {
      if (inv.salesman) set.add(inv.salesman);
    });
    if (set.size === 0) set.add('Ali Khan');
    return Array.from(set);
  }, [allInvoices]);

  // Filters State (Requirement #3)
  const [filters, setFilters] = useState({
    dateFrom: DEFAULT_REPORT_FROM_DATE,
    dateTo: getDefaultReportToDate(),
    transactionNo: '',
    invoiceNo: '',
    customer: 'ALL',
    saleType: 'ALL', // 'ALL' | 'Cash Sale' | 'Credit Sale'
    paymentMethod: 'ALL', // 'ALL' | 'Cash' | 'Bank' | 'Credit/Remaining' | 'Split/Multi Payment'
    storeLocationId: 'ALL',
    bankAccountId: 'ALL',
    salesman: 'ALL',
    amountFrom: '',
    amountTo: '',
    detailsQuery: '',
  });

  // Sorting - Default: ACCOUNTIX Global Ascending Order (Oldest -> Newest)
  const [sortField, setSortField] = useState<string>('invoiceDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination (Requirement #14)
  const [pageSize, setPageSize] = useState<number | 'ALL'>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<SaleInvoice | null>(null);
  const [selectedInvoiceForThermal, setSelectedInvoiceForThermal] = useState<SaleInvoice | null>(null);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);
  const [isCustomerLedgerOpen, setIsCustomerLedgerOpen] = useState(false);
  const [selectedLedgerCustomerId, setSelectedLedgerCustomerId] = useState<string | undefined>(undefined);
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);
  const [newSaleDropdownOpen, setNewSaleDropdownOpen] = useState(false);

  // Audit Protected Action State (Edit / Delete)
  const [auditAction, setAuditAction] = useState<{
    type: 'EDIT' | 'DELETE';
    invoice: SaleInvoice;
  } | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Matching Logic
  const filteredInvoices = useMemo<SaleInvoice[]>(() => {
    const matched = allInvoices.filter((inv) => {
      // 1. Date Range
      if (filters.dateFrom) {
        const fromDate = parseDDMMYYYYToDate(filters.dateFrom);
        const invDate = parseDDMMYYYYToDate(inv.invoiceDate);
        if (fromDate && invDate && invDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = parseDDMMYYYYToDate(filters.dateTo);
        const invDate = parseDDMMYYYYToDate(inv.invoiceDate);
        if (toDate && invDate && invDate > toDate) return false;
      }

      // 2. Transaction No
      if (filters.transactionNo.trim()) {
        const query = filters.transactionNo.trim().toLowerCase();
        const txn = (inv.transactionNo || '').toLowerCase();
        if (!txn.includes(query)) return false;
      }

      // 3. Invoice No
      if (filters.invoiceNo.trim()) {
        const query = filters.invoiceNo.trim().toLowerCase();
        const no = (inv.invoiceNo || '').toLowerCase();
        if (!no.includes(query)) return false;
      }

      // 4. Customer
      if (filters.customer !== 'ALL') {
        if (filters.customer === 'WALK_IN') {
          if (inv.customerId || (inv.customerName && inv.customerName !== 'Walk-in Cash Customer')) {
            return false;
          }
        } else {
          const matchId = inv.customerId === filters.customer;
          const matchName = inv.customerName === filters.customer;
          if (!matchId && !matchName) return false;
        }
      }

      // 5. Sale Type
      if (filters.saleType !== 'ALL') {
        if (inv.saleType !== filters.saleType) return false;
      }

      // 6. Payment Method
      if (filters.paymentMethod !== 'ALL') {
        const cashRec = inv.cashReceivedAmount || 0;
        const bankRec = inv.bankReceivedAmount || 0;
        const remaining = inv.remainingBalanceAmount || 0;
        const isSplit = (cashRec > 0 && bankRec > 0);

        if (filters.paymentMethod === 'Cash') {
          if (inv.paymentMethod !== 'Cash' && cashRec === 0) return false;
          if (bankRec > 0) return false; // not pure cash
        } else if (filters.paymentMethod === 'Bank') {
          if (inv.paymentMethod !== 'Bank' && bankRec === 0) return false;
          if (cashRec > 0) return false; // not pure bank
        } else if (filters.paymentMethod === 'Credit/Remaining') {
          if (inv.saleType !== 'Credit Sale' && remaining === 0) return false;
        } else if (filters.paymentMethod === 'Split/Multi Payment') {
          if (!isSplit) return false;
        }
      }

      // 7. Store Location
      if (filters.storeLocationId !== 'ALL') {
        if (inv.storeLocationId !== filters.storeLocationId) return false;
      }

      // 8. Bank Account
      if (filters.bankAccountId !== 'ALL') {
        if (inv.bankAccountId !== filters.bankAccountId) return false;
      }

      // 9. Salesman / User
      if (filters.salesman !== 'ALL') {
        if (inv.salesman !== filters.salesman) return false;
      }

      // 10. Amount Range
      if (filters.amountFrom) {
        const min = parseFloat(filters.amountFrom);
        if (!isNaN(min) && inv.netInvoiceTotal < min) return false;
      }
      if (filters.amountTo) {
        const max = parseFloat(filters.amountTo);
        if (!isNaN(max) && inv.netInvoiceTotal > max) return false;
      }

      // 11. Transaction Details / Item Details query
      if (filters.detailsQuery.trim()) {
        const q = filters.detailsQuery.trim().toLowerCase();
        const hasItem = inv.items.some(
          (item) =>
            item.productName.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
        );
        const hasNotes = inv.notes && inv.notes.toLowerCase().includes(q);
        const hasRef = inv.reference && inv.reference.toLowerCase().includes(q);
        if (!hasItem && !hasNotes && !hasRef) return false;
      }

      return true;
    });
    return sortChronologicalAscending(matched);
  }, [allInvoices, filters]);

  // Sorted Invoices - Global Ascending Order rule
  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      if (sortField === 'invoiceDate') {
        const cmp = compareTransactionsChronologicalAscending(a, b);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      let aVal: any = a[sortField as keyof SaleInvoice];
      let bVal: any = b[sortField as keyof SaleInvoice];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      let res = 0;
      if (aVal < bVal) res = -1;
      else if (aVal > bVal) res = 1;

      if (res !== 0) {
        return sortDirection === 'asc' ? res : -res;
      }

      // Tie-breaker: Chronological Ascending
      return compareTransactionsChronologicalAscending(a, b);
    });
  }, [filteredInvoices, sortField, sortDirection]);

  // Paginated Invoices (Requirement #14)
  const paginatedInvoices = useMemo(() => {
    if (pageSize === 'ALL') return sortedInvoices;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedInvoices.slice(startIndex, startIndex + pageSize);
  }, [sortedInvoices, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize === 'ALL' || pageSize === 0) return 1;
    return Math.ceil(sortedInvoices.length / pageSize) || 1;
  }, [sortedInvoices.length, pageSize]);

  // Summary Metrics (Requirement #9)
  const summaryTotals = useMemo(() => {
    let totalSalesCount = filteredInvoices.length;
    let totalCashSalesCount = 0;
    let totalCashSalesAmount = 0;
    let totalCreditSalesCount = 0;
    let totalCreditSalesAmount = 0;
    let totalSubtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalNetSales = 0;
    let totalCashReceived = 0;
    let totalBankReceived = 0;
    let totalReceived = 0;
    let totalCreditRemaining = 0;
    let totalOutstanding = 0;
    let totalQty = 0;

    filteredInvoices.forEach((inv) => {
      totalSubtotal += inv.subtotal || 0;
      totalDiscount += inv.overallDiscount || 0;
      totalTax += inv.overallTax || 0;
      totalNetSales += inv.netInvoiceTotal || 0;

      const itemsQty = inv.items.reduce((s, it) => s + (it.quantity || 0), 0);
      totalQty += itemsQty;

      if (inv.saleType === 'Cash Sale') {
        totalCashSalesCount++;
        totalCashSalesAmount += inv.netInvoiceTotal || 0;
      } else {
        totalCreditSalesCount++;
        totalCreditSalesAmount += inv.netInvoiceTotal || 0;
      }

      const cashRec =
        inv.cashReceivedAmount !== undefined
          ? inv.cashReceivedAmount
          : inv.paymentMethod === 'Cash'
          ? inv.netInvoiceTotal
          : 0;

      const bankRec =
        inv.bankReceivedAmount !== undefined
          ? inv.bankReceivedAmount
          : inv.paymentMethod === 'Bank'
          ? inv.netInvoiceTotal
          : 0;

      const totRec =
        inv.totalReceivedAmount !== undefined
          ? inv.totalReceivedAmount
          : cashRec + bankRec;

      const rem =
        inv.remainingBalanceAmount !== undefined
          ? inv.remainingBalanceAmount
          : Math.max(0, (inv.netInvoiceTotal || 0) - totRec);

      totalCashReceived += cashRec;
      totalBankReceived += bankRec;
      totalReceived += totRec;
      totalCreditRemaining += rem;
      totalOutstanding += inv.finalCustomerBalance || rem;
    });

    return {
      totalSalesCount,
      totalCashSalesCount,
      totalCashSalesAmount,
      totalCreditSalesCount,
      totalCreditSalesAmount,
      totalSubtotal,
      totalDiscount,
      totalTax,
      totalNetSales,
      totalCashReceived,
      totalBankReceived,
      totalReceived,
      totalCreditRemaining,
      totalOutstanding,
      totalQty,
    };
  }, [filteredInvoices]);

  // Selected Store Name
  const selectedStoreName = useMemo(() => {
    if (filters.storeLocationId === 'ALL') return 'All Store Locations';
    const store = stores.find((s) => s.id === filters.storeLocationId);
    return store ? store.name : 'Selected Store';
  }, [filters.storeLocationId, stores]);

  // Customer Filter Name
  const customerFilterName = useMemo(() => {
    if (filters.customer === 'ALL') return 'All Customers';
    if (filters.customer === 'WALK_IN') return 'Walk-in Cash Customers Only';
    const c = customers.find((cust) => cust.id === filters.customer || cust.name === filters.customer);
    return c ? c.name : filters.customer;
  }, [filters.customer, customers]);

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      dateFrom: DEFAULT_REPORT_FROM_DATE,
      dateTo: getDefaultReportToDate(),
      transactionNo: '',
      invoiceNo: '',
      customer: 'ALL',
      saleType: 'ALL',
      paymentMethod: 'ALL',
      storeLocationId: 'ALL',
      bankAccountId: 'ALL',
      salesman: 'ALL',
      amountFrom: '',
      amountTo: '',
      detailsQuery: '',
    });
    setCurrentPage(1);
    showToast('success', 'Filters have been reset.');
  };

  // Toggle Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // EXCEL EXPORT (CSV Format with exact headers and summary totals)
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      showToast('error', 'No sales transactions found to export.');
      return;
    }

    const headers = [
      'Sr #',
      'Date',
      'Transaction No',
      'Invoice No',
      'Customer Name',
      'Sale Type',
      'Store Location',
      'Subtotal (PKR)',
      'Discount (PKR)',
      'Tax (PKR)',
      'Net Total (PKR)',
      'Cash Received (PKR)',
      'Bank Received (PKR)',
      'Credit/Remaining (PKR)',
      'Total Received (PKR)',
      'Customer Balance (PKR)',
      'Payment Status',
      'Salesman/User',
      'Items Detail',
    ];

    const rows = filteredInvoices.map((inv, idx) => {
      const cashRec = inv.cashReceivedAmount ?? (inv.paymentMethod === 'Cash' ? inv.netInvoiceTotal : 0);
      const bankRec = inv.bankReceivedAmount ?? (inv.paymentMethod === 'Bank' ? inv.netInvoiceTotal : 0);
      const totRec = inv.totalReceivedAmount ?? (cashRec + bankRec);
      const rem = inv.remainingBalanceAmount ?? Math.max(0, inv.netInvoiceTotal - totRec);
      const itemsStr = inv.items.map((it) => `${it.productName} (${it.quantity} ${it.unit || 'pcs'} @ Rs.${it.rate})`).join('; ');

      return [
        idx + 1,
        `"${inv.invoiceDate}"`,
        `"${inv.transactionNo}"`,
        `"${inv.invoiceNo}"`,
        `"${inv.customerName || 'Walk-in Cash Customer'}"`,
        `"${inv.saleType}"`,
        `"${inv.storeLocationName}"`,
        inv.subtotal,
        inv.overallDiscount,
        inv.overallTax,
        inv.netInvoiceTotal,
        cashRec,
        bankRec,
        rem,
        totRec,
        inv.finalCustomerBalance || rem,
        `"${inv.status}"`,
        `"${inv.salesman || 'Ali Khan'}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
      ];
    });

    const summaryRow = [
      '"TOTALS"',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      summaryTotals.totalSubtotal,
      summaryTotals.totalDiscount,
      summaryTotals.totalTax,
      summaryTotals.totalNetSales,
      summaryTotals.totalCashReceived,
      summaryTotals.totalBankReceived,
      summaryTotals.totalCreditRemaining,
      summaryTotals.totalReceived,
      summaryTotals.totalOutstanding,
      '""',
      '""',
      '""',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(',')), summaryRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ACCOUNTIX_All_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', `Exported ${filteredInvoices.length} sales records to Excel.`);
  };

  // DUPLICATE TRANSACTION
  const handleDuplicateInvoice = (invoice: SaleInvoice) => {
    const res = salesStore.duplicateInvoice(invoice.invoiceNo, 'Ali Khan');
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
  };

  // AUDIT VERIFICATION SUCCESS (EDIT / DELETE)
  const handleAuditVerificationSuccess = (user: string, reason: string) => {
    if (!auditAction) return;
    const { type, invoice } = auditAction;

    if (type === 'DELETE') {
      const res = salesStore.deleteInvoice(invoice.invoiceNo, user);
      if (res.success) {
        showToast('success', `Transaction ${invoice.invoiceNo} successfully deleted and reversed.`);
      } else {
        showToast('error', res.message);
      }
    } else if (type === 'EDIT') {
      if (onNavigateToSaleInvoice) {
        onNavigateToSaleInvoice(invoice.saleType, invoice.invoiceNo);
      } else {
        showToast('success', `Authentication verified for editing ${invoice.invoiceNo}.`);
      }
    }

    setAuditAction(null);
  };

  // View Customer Ledger
  const handleOpenLedgerForCustomer = (custName?: string) => {
    if (!custName) return;
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
              ALL SALES REPORT
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B6D9EA] border border-[#7F9EAD] text-[#111111] uppercase tracking-wide">
              MASTER SALES REGISTER
            </span>
            <span className="text-[11px] font-mono text-slate-700 hidden md:inline">
              · ACCOUNTIX Accounting & POS Database
            </span>
          </div>

          {/* Top Action Buttons in ACCOUNTIX Classic Light-Blue Style */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* New Sale Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNewSaleDropdownOpen(!newSaleDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Create a new sale invoice"
              >
                <Plus className="w-3.5 h-3.5 text-blue-900" />
                <span>New Sale</span>
              </button>

              {newSaleDropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-1 w-48 bg-white rounded-xs shadow-lg border border-[#7F9EAD] py-1 z-30 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => {
                      setNewSaleDropdownOpen(false);
                      if (onNavigateToSaleInvoice) onNavigateToSaleInvoice('Cash Sale');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-[#D7EAF5] flex items-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    <span>New Cash Sale</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSaleDropdownOpen(false);
                      if (onNavigateToSaleInvoice) onNavigateToSaleInvoice('Credit Sale');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-[#D7EAF5] flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                    <span>New Credit Sale</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Switch to Cash Sale Report */}
            {onOpenCashSaleReport && (
              <button
                type="button"
                onClick={onOpenCashSaleReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Open Cash Sale Report Module"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden sm:inline">Cash Sale Report</span>
              </button>
            )}

            {/* Quick Switch to Credit Sale Report */}
            {onOpenCreditSaleReport && (
              <button
                type="button"
                onClick={onOpenCreditSaleReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Open Credit Sale Report Module"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-800" />
                <span className="hidden sm:inline">Credit Sale Report</span>
              </button>
            )}

            {/* Print Report */}
            <button
              type="button"
              onClick={() => setIsPrintReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="A4 Printable All Sales Report"
            >
              <Printer className="w-3.5 h-3.5 text-blue-900" />
              <span>Print</span>
            </button>

            {/* Export Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Export all filtered records to Excel (CSV)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
              <span>Export Excel</span>
            </button>

            {/* Audit History */}
            <button
              type="button"
              onClick={() => setIsAuditLogsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="View immutable audit history of transactions"
            >
              <Lock className="w-3.5 h-3.5 text-[#0b66c3]" />
              <span className="hidden sm:inline">Audit ({auditLogs.length})</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => {
                setStoreTick((t) => t + 1);
                showToast('success', 'Sales transactions synchronized.');
              }}
              className="p-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Refresh / Sync Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {/* WordPress Code */}
            <button
              type="button"
              onClick={() => setIsWordPressModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="View WordPress Module shortcode & PHP snippets"
            >
              <Code2 className="w-3.5 h-3.5 text-[#0b66c3]" />
              <span className="hidden lg:inline">WP Code</span>
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
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

        {/* SECTION 1: MASTER COMPACT FILTER PANEL */}
        <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs">
          {/* SECTION HEADER: Light Blue with thin gray-blue border */}
          <div className="bg-[#B6D9EA] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between">
            <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
              Report Filters
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAuditLogsModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-xs cursor-pointer shadow-2xs transition-colors"
                title="View Audit Logs"
              >
                <Lock className="w-3 h-3 text-[#0b66c3]" />
                <span>Audit ({auditLogs.length})</span>
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

          {/* FILTER BODY: Compact Accounting Filter Layout */}
          <div className="p-2.5 sm:p-3 bg-[#E5F1F8] flex flex-col gap-2.5 text-xs text-[#111111]">
            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              {/* From Date */}
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

              {/* To Date */}
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
                      {s.name}
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
                  <option value="WALK_IN">Walk-in Cash Customers Only</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sale Type */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Sales Type:
                </label>
                <select
                  value={filters.saleType}
                  onChange={(e) => setFilters({ ...filters, saleType: e.target.value })}
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-bold text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                >
                  <option value="ALL">All Types</option>
                  <option value="Cash Sale">Cash Sale</option>
                  <option value="Credit Sale">Credit Sale</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Payment Method:
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                >
                  <option value="ALL">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Credit/Remaining">Credit / Remaining</option>
                  <option value="Split/Multi Payment">Split / Multi</option>
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

              {/* Salesman */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Salesman / User:
                </label>
                <select
                  value={filters.salesman}
                  onChange={(e) => setFilters({ ...filters, salesman: e.target.value })}
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                >
                  <option value="ALL">All Users</option>
                  {salesmen.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Bank Account:
                </label>
                <select
                  value={filters.bankAccountId}
                  onChange={(e) => setFilters({ ...filters, bankAccountId: e.target.value })}
                  className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                >
                  <option value="ALL">All Banks</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Range */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[#111111] mb-1">
                  Amount Range (Min - Max PKR):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={filters.amountFrom}
                    onChange={(e) => setFilters({ ...filters, amountFrom: e.target.value })}
                    placeholder="Min"
                    className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                  />
                  <span className="text-slate-600 font-bold">-</span>
                  <input
                    type="number"
                    value={filters.amountTo}
                    onChange={(e) => setFilters({ ...filters, amountTo: e.target.value })}
                    placeholder="Max"
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
                    value={filters.detailsQuery}
                    onChange={(e) => setFilters({ ...filters, detailsQuery: e.target.value })}
                    placeholder="Search product name, customer, remarks..."
                    className="h-7 w-48 sm:w-72 px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setStoreTick((t) => t + 1);
                      showToast('success', `Found ${filteredInvoices.length} matching transactions.`);
                    }}
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
                  title="Export Sales Report to Excel (CSV)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintReportModalOpen(true)}
                  className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Print Official Sales Report"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-800" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintReportModalOpen(true)}
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

        {/* SECTION 2: SUMMARY METRIC CARDS (Master Accounting Blue/White Card Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Total Sales */}
          <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">Total Net Sales</span>
            <div className="mt-0.5">
              <span className="text-base font-bold text-[#111111] font-mono block">
                Rs. {summaryTotals.totalNetSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-blue-800 font-semibold">
                {summaryTotals.totalSalesCount} Invoices ({summaryTotals.totalQty} Items)
              </span>
            </div>
          </div>

          {/* Cash Sales */}
          <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">Cash Sales</span>
            <div className="mt-0.5">
              <span className="text-base font-bold text-emerald-800 font-mono block">
                Rs. {summaryTotals.totalCashSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {summaryTotals.totalCashSalesCount} Invoices
              </span>
            </div>
          </div>

          {/* Credit Sales */}
          <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">Credit Sales</span>
            <div className="mt-0.5">
              <span className="text-base font-bold text-purple-900 font-mono block">
                Rs. {summaryTotals.totalCreditSalesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-purple-700 font-semibold">
                {summaryTotals.totalCreditSalesCount} Invoices
              </span>
            </div>
          </div>

          {/* Subtotal, Discount & Tax */}
          <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">Subtotal & Deductions</span>
            <div className="mt-0.5">
              <span className="text-xs font-bold text-[#111111] font-mono block">
                Subtotal: Rs. {summaryTotals.totalSubtotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-800 font-semibold block">
                Disc: -Rs. {summaryTotals.totalDiscount.toLocaleString()} | Tax: +Rs. {summaryTotals.totalTax.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Total Received (Cash + Bank) */}
          <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">Total Received</span>
            <div className="mt-0.5">
              <span className="text-base font-bold text-blue-800 font-mono block">
                Rs. {summaryTotals.totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-600 font-medium">
                Cash: {summaryTotals.totalCashReceived.toLocaleString()} | Bank: {summaryTotals.totalBankReceived.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Total Remaining / Outstanding */}
          <div className="border border-[#7F9EAD] bg-[#FFF4F2] p-2 rounded-none sm:rounded-xs shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide block">Credit / Remaining</span>
            <div className="mt-0.5">
              <span className="text-base font-bold text-red-700 font-mono block">
                Rs. {summaryTotals.totalCreditRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-red-600 font-semibold">
                Cust Bal: Rs. {summaryTotals.totalOutstanding.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: SALES REPORT TABLE */}
        <div className="border border-[#7F9EAD] bg-white rounded-none sm:rounded-xs shadow-2xs overflow-hidden flex flex-col">
          {/* Table Header Controls: Count & Pagination Sizer */}
          <div className="px-3 py-1.5 bg-[#B6D9EA] border-b border-[#7F9EAD] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
                Sales Data Table
              </h2>
              <span className="px-1.5 py-0.2 bg-[#D7EAF5] border border-[#7F9EAD] text-[#111111] text-[11px] font-bold">
                {sortedInvoices.length} {sortedInvoices.length === 1 ? 'Transaction' : 'Transactions'}
              </span>
              <span className="text-slate-600 hidden md:inline">·</span>
              <span className="text-slate-700 text-[11px] hidden md:inline">
                Sorted by <span className="font-semibold text-blue-900">{sortField}</span> ({sortDirection.toUpperCase()})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-700 font-semibold">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                    setPageSize(val);
                    setCurrentPage(1);
                  }}
                  className="rounded-xs border border-[#7F9EAD] py-0.5 px-2 text-xs bg-white text-[#111111] focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold cursor-pointer"
                >
                  <option value={10}>10 records</option>
                  <option value={25}>25 records</option>
                  <option value={50}>50 records</option>
                  <option value={100}>100 records</option>
                  <option value="ALL">All records</option>
                </select>
              </div>

              {/* Page indicator */}
              {pageSize !== 'ALL' && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1 rounded-xs border border-[#7F9EAD] bg-[#D7EAF5] hover:bg-[#C5DEF0] text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-[#111111] px-1 font-mono font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded-xs border border-[#7F9EAD] bg-[#D7EAF5] hover:bg-[#C5DEF0] text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controlled Height Scrollable Table Body Container */}
          <div className="overflow-x-auto overflow-y-auto max-h-[520px] min-h-[260px] [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#E2EFF7] relative">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px] shadow-xs select-none">
                <tr>
                  {/* 1. Date */}
                  <th
                    onClick={() => handleSort('invoiceDate')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* 2. Transaction No */}
                  <th
                    onClick={() => handleSort('transactionNo')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Txn No</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* 3. Invoice No */}
                  <th
                    onClick={() => handleSort('invoiceNo')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Invoice No</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* 4. Customer */}
                  <th
                    onClick={() => handleSort('customerName')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Customer</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* 5. Sale Type */}
                  <th
                    onClick={() => handleSort('saleType')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Sale Type</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* 6. Store Location */}
                  <th className="py-2.5 px-3">Store</th>

                  {/* 7. Subtotal */}
                  <th
                    onClick={() => handleSort('subtotal')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Subtotal</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* 8. Discount */}
                  <th className="py-2.5 px-3 text-right">Discount</th>

                  {/* 9. Tax */}
                  <th className="py-2.5 px-3 text-right">Tax</th>

                  {/* 10. Net Total */}
                  <th
                    onClick={() => handleSort('netInvoiceTotal')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-blue-100/60 transition-colors text-blue-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Net Total</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* 11. Cash Received */}
                  <th className="py-2.5 px-3 text-right text-emerald-800">Cash Rec</th>

                  {/* 12. Bank Received */}
                  <th className="py-2.5 px-3 text-right text-blue-800">Bank Rec</th>

                  {/* 13. Credit / Remaining */}
                  <th className="py-2.5 px-3 text-right text-amber-800">Credit/Rem</th>

                  {/* 14. Total Received */}
                  <th className="py-2.5 px-3 text-right font-bold">Total Rec</th>

                  {/* 15. Balance */}
                  <th className="py-2.5 px-3 text-right">Balance</th>

                  {/* 16. Payment Status */}
                  <th className="py-2.5 px-3 text-center">Payment Status</th>

                  {/* 17. User */}
                  <th className="py-2.5 px-3">User</th>

                  {/* 18. Actions */}
                  <th className="py-2.5 px-3 text-center sticky right-0 bg-blue-50/95 shadow-sm">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="py-10 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-300" />
                        <span className="font-semibold text-sm">No sales transactions found.</span>
                        <p className="text-xs text-slate-400 max-w-sm">
                          Try adjusting your date range, customer, store, or payment filter criteria above.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold text-xs border border-blue-200"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv, idx) => {
                    const cashRec =
                      inv.cashReceivedAmount !== undefined
                        ? inv.cashReceivedAmount
                        : inv.paymentMethod === 'Cash'
                        ? inv.netInvoiceTotal
                        : 0;

                    const bankRec =
                      inv.bankReceivedAmount !== undefined
                        ? inv.bankReceivedAmount
                        : inv.paymentMethod === 'Bank'
                        ? inv.netInvoiceTotal
                        : 0;

                    const totRec =
                      inv.totalReceivedAmount !== undefined
                        ? inv.totalReceivedAmount
                        : cashRec + bankRec;

                    const rem =
                      inv.remainingBalanceAmount !== undefined
                        ? inv.remainingBalanceAmount
                        : Math.max(0, inv.netInvoiceTotal - totRec);

                    const isFullyPaid = rem === 0;
                    const isCreditSale = inv.saleType === 'Credit Sale';
                    const isSplit = (cashRec > 0 && bankRec > 0);

                    return (
                      <tr
                        key={inv.id || inv.invoiceNo}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        {/* 1. Date */}
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          <div>{inv.invoiceDate}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.exactTime || '10:00:00'}</div>
                        </td>

                        {/* 2. Transaction No */}
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                          <span
                            onClick={() => setSelectedInvoiceForDetails(inv)}
                            className="hover:underline cursor-pointer"
                            title="Click to view full voucher breakdown"
                          >
                            {inv.transactionNo || 'TXN-' + inv.invoiceNo}
                          </span>
                        </td>

                        {/* 3. Invoice No */}
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {inv.invoiceNo}
                        </td>

                        {/* 4. Customer */}
                        <td className="py-2.5 px-3 max-w-[180px] truncate">
                          {inv.customerName ? (
                            <button
                              type="button"
                              onClick={() => handleOpenLedgerForCustomer(inv.customerName)}
                              className="font-medium text-slate-900 hover:text-blue-700 hover:underline text-left cursor-pointer truncate block"
                              title="Click to view Customer Ledger"
                            >
                              {inv.customerName}
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">Walk-in Customer</span>
                          )}
                        </td>

                        {/* 5. Sale Type Badge */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCreditSale
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {inv.saleType}
                          </span>
                        </td>

                        {/* 6. Store Location */}
                        <td className="py-2.5 px-3 text-slate-600 max-w-[130px] truncate" title={inv.storeLocationName}>
                          {inv.storeLocationName}
                        </td>

                        {/* 7. Subtotal */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          Rs. {inv.subtotal.toLocaleString()}
                        </td>

                        {/* 8. Discount */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {inv.overallDiscount > 0 ? (
                            <span className="text-amber-700">-Rs. {inv.overallDiscount.toLocaleString()}</span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* 9. Tax */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                          {inv.overallTax > 0 ? (
                            <span className="text-slate-700">+Rs. {inv.overallTax.toLocaleString()}</span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* 10. Net Total */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                          Rs. {inv.netInvoiceTotal.toLocaleString()}
                        </td>

                        {/* 11. Cash Received */}
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                          {cashRec > 0 ? `Rs. ${cashRec.toLocaleString()}` : '—'}
                        </td>

                        {/* 12. Bank Received */}
                        <td className="py-2.5 px-3 text-right font-mono text-blue-700">
                          {bankRec > 0 ? (
                            <span title={inv.bankName || 'Bank'}>
                              Rs. {bankRec.toLocaleString()}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* 13. Credit / Remaining */}
                        <td className="py-2.5 px-3 text-right font-mono">
                          {rem > 0 ? (
                            <span className="font-bold text-red-600">
                              Rs. {rem.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400">Rs. 0</span>
                          )}
                        </td>

                        {/* 14. Total Received */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          Rs. {totRec.toLocaleString()}
                        </td>

                        {/* 15. Balance (Customer Outstanding / Final Balance) */}
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          Rs. {(inv.finalCustomerBalance || rem || 0).toLocaleString()}
                        </td>

                        {/* 16. Payment Status */}
                        <td className="py-2.5 px-3 text-center">
                          {isFullyPaid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Paid
                            </span>
                          ) : totRec > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Partially Paid
                            </span>
                          ) : isCreditSale ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                              Credit
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                              Remaining
                            </span>
                          )}
                        </td>

                        {/* 17. User */}
                        <td className="py-2.5 px-3 text-slate-600">
                          {inv.salesman || 'Ali Khan'}
                        </td>

                        {/* 18. Actions (View, Edit, Print, Preview, Duplicate, Delete) */}
                        <td className="py-2.5 px-3 text-center sticky right-0 bg-white shadow-sm border-l border-slate-100">
                          <div className="flex items-center justify-center gap-1">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForDetails(inv)}
                              className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="View Transaction Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                            </button>

                            {/* Edit (Audit Protected) */}
                            <button
                              type="button"
                              onClick={() => setAuditAction({ type: 'EDIT', invoice: inv })}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                              title="Edit Transaction (Audit Password Required)"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            </button>

                            {/* Print Single Invoice */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForDetails(inv)}
                              className="p-1 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                              title="Print A4 Voucher"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            </button>

                            {/* Thermal Preview */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForThermal(inv)}
                              className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                              title="POS Thermal Receipt Preview"
                            >
                              <Receipt className="w-3.5 h-3.5 text-purple-600" />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateInvoice(inv)}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              title="Duplicate as new transaction"
                            >
                              <Copy className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            {/* Delete (Audit Protected) */}
                            <button
                              type="button"
                              onClick={() => setAuditAction({ type: 'DELETE', invoice: inv })}
                              className="p-1 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Delete Transaction (Audit Password Required)"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Table Footer Totals Bar: Sticky Light Blue */}
              {paginatedInvoices.length > 0 && (
                <tfoot className="sticky bottom-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold text-xs border-t-2 border-[#7F9EAD] shadow-xs">
                  <tr className="border-t-2 border-[#7F9EAD] text-[11px] text-[#111111]">
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase border-r border-[#7F9EAD]">
                      Filtered Totals ({filteredInvoices.length} Invoices):
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono border-r border-[#7F9EAD]">
                      Rs. {summaryTotals.totalSubtotal.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-800 border-r border-[#7F9EAD]">
                      -Rs. {summaryTotals.totalDiscount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800 border-r border-[#7F9EAD]">
                      +Rs. {summaryTotals.totalTax.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900 border-r border-[#7F9EAD]">
                      Rs. {summaryTotals.totalNetSales.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800 border-r border-[#7F9EAD]">
                      Rs. {summaryTotals.totalCashReceived.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-800 border-r border-[#7F9EAD]">
                      Rs. {summaryTotals.totalBankReceived.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-800 border-r border-[#7F9EAD]">
                      Rs. {summaryTotals.totalCreditRemaining.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 border-r border-[#7F9EAD]">
                      Rs. {summaryTotals.totalReceived.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-red-700 border-r border-[#7F9EAD]">
                      Rs. {summaryTotals.totalOutstanding.toLocaleString()}
                    </td>
                    <td colSpan={3} className="py-2.5 px-3 text-center text-[10px] text-slate-700 font-semibold">
                      Automated Double-Entry Posting
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Bottom Pagination Controls */}
          {pageSize !== 'ALL' && totalPages > 1 && (
            <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-900">
                  {sortedInvoices.length === 0 ? 0 : (currentPage - 1) * (pageSize as number) + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * (pageSize as number), sortedInvoices.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-900">{sortedInvoices.length}</span> records
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
                  }
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                        currentPage === pNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="px-2 py-1 text-xs rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: VIEW TRANSACTION DETAILS (Requirement #5) */}
      <TransactionDetailsModal
        isOpen={!!selectedInvoiceForDetails}
        onClose={() => setSelectedInvoiceForDetails(null)}
        invoice={selectedInvoiceForDetails}
        onPrint={() => window.print()}
        onOpenThermal={(inv) => {
          setSelectedInvoiceForDetails(null);
          setSelectedInvoiceForThermal(inv);
        }}
      />

      {/* MODAL 2: POS THERMAL RECEIPT PREVIEW (80mm/58mm) */}
      <ThermalReceiptPreviewModal
        isOpen={!!selectedInvoiceForThermal}
        onClose={() => setSelectedInvoiceForThermal(null)}
        invoice={selectedInvoiceForThermal}
      />

      {/* MODAL 3: AUDIT PASSWORD VERIFICATION (Requirement #11) */}
      <AuditPasswordModal
        isOpen={!!auditAction}
        onClose={() => setAuditAction(null)}
        actionTitle={auditAction?.type === 'DELETE' ? 'Delete Transaction' : 'Edit Transaction'}
        actionType={auditAction?.type || 'EDIT'}
        invoiceNo={auditAction?.invoice.invoiceNo || ''}
        onSuccess={handleAuditVerificationSuccess}
      />

      {/* MODAL 4: AUDIT TRAIL LOGS */}
      <AuditLogsModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
        logs={auditLogs}
      />

      {/* MODAL 5: CUSTOMER LEDGER STATEMENT */}
      <CustomerLedgerModal
        isOpen={isCustomerLedgerOpen}
        onClose={() => {
          setIsCustomerLedgerOpen(false);
          setSelectedLedgerCustomerId(undefined);
        }}
        customerId={selectedLedgerCustomerId}
        customers={customers}
        onViewTransactionDetails={(inv) => setSelectedInvoiceForDetails(inv)}
      />

      {/* MODAL 6: A4 PRINTABLE REPORT MODAL */}
      {isPrintReportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="bg-[#0b66c3] px-6 py-3.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">A4 Printable All Sales Report Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white text-blue-900 hover:bg-blue-50 rounded font-bold text-xs shadow-xs"
                >
                  Print Report
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintReportModalOpen(false)}
                  className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div className="max-w-4xl mx-auto shadow-lg border border-slate-300 rounded overflow-hidden">
                <PrintableAllSalesReport
                  invoices={filteredInvoices}
                  dateFrom={filters.dateFrom}
                  dateTo={filters.dateTo}
                  storeName={selectedStoreName}
                  customerFilterName={customerFilterName}
                  totalSubtotal={summaryTotals.totalSubtotal}
                  totalDiscount={summaryTotals.totalDiscount}
                  totalTax={summaryTotals.totalTax}
                  totalNetSales={summaryTotals.totalNetSales}
                  totalCashSalesCount={summaryTotals.totalCashSalesCount}
                  totalCashSalesAmount={summaryTotals.totalCashSalesAmount}
                  totalCreditSalesCount={summaryTotals.totalCreditSalesCount}
                  totalCreditSalesAmount={summaryTotals.totalCreditSalesAmount}
                  totalCashReceived={summaryTotals.totalCashReceived}
                  totalBankReceived={summaryTotals.totalBankReceived}
                  totalCreditRemaining={summaryTotals.totalCreditRemaining}
                  totalReceived={summaryTotals.totalReceived}
                  totalRemaining={summaryTotals.totalOutstanding}
                  totalQty={summaryTotals.totalQty}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: WORDPRESS SHORTCODE & INTEGRATION */}
      <WordPressIntegrationModal
        isOpen={isWordPressModalOpen}
        onClose={() => setIsWordPressModalOpen(false)}
      />
    </main>
  );
};
