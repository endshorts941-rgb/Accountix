import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SaleInvoice, StoreLocation, Customer, BankAccount } from '../sales/types';
import { salesStore } from '../sales/salesStore';
import { CashSaleReportFilters, ReportFilterState } from './components/CashSaleReportFilters';
import { CashSaleReportSummaryCards } from './components/CashSaleReportSummaryCards';
import { CashSaleReportTable } from './components/CashSaleReportTable';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { ThermalReceiptPreviewModal } from './components/ThermalReceiptPreviewModal';
import { AuditPasswordModal } from './components/AuditPasswordModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { PrintableCashSaleReport } from './components/PrintableCashSaleReport';
import { WordPressIntegrationModal } from '../../components/wordpress/WordPressIntegrationModal';
import {
  parseDDMMYYYYToDate,
  DEFAULT_REPORT_FROM_DATE,
  getDefaultReportToDate,
  sortChronologicalAscending,
  compareTransactionsChronologicalAscending,
} from '../../utils/dateUtils';
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
} from 'lucide-react';

interface CashSaleReportModuleProps {
  onNavigateToSaleInvoice?: (invoiceNo?: string) => void;
  onNavigateBack?: () => void;
  onOpenCreditSaleReport?: () => void;
}

export const CashSaleReportModule: React.FC<CashSaleReportModuleProps> = ({
  onNavigateToSaleInvoice,
  onNavigateBack,
  onOpenCreditSaleReport,
}) => {
  // Store subscription
  const [storeTick, setStoreTick] = useState(0);
  useEffect(() => {
    return salesStore.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  // Raw data from salesStore
  const allInvoices = useMemo(() => salesStore.getInvoices(), [storeTick]);
  const cashSaleInvoices = useMemo(
    () => allInvoices.filter((inv) => inv.saleType === 'Cash Sale'),
    [allInvoices]
  );
  const stores = useMemo(() => salesStore.getStores(), [storeTick]);
  const customers = useMemo(() => salesStore.getCustomers(), [storeTick]);
  const banks = useMemo(() => salesStore.getBanks(), [storeTick]);
  const auditLogs = useMemo(() => salesStore.getAuditLogs(), [storeTick]);

  // Unique salesmen list
  const salesmen = useMemo(() => {
    const set = new Set<string>();
    cashSaleInvoices.forEach((inv) => {
      if (inv.salesman) set.add(inv.salesman);
    });
    if (set.size === 0) set.add('Ali Khan');
    return Array.from(set);
  }, [cashSaleInvoices]);

  // Filters State
  const [filters, setFilters] = useState<ReportFilterState>({
    dateFrom: DEFAULT_REPORT_FROM_DATE,
    dateTo: getDefaultReportToDate(),
    transactionNo: '',
    invoiceNo: '',
    customerName: '',
    storeLocationId: 'ALL',
    paymentMethod: 'ALL',
    cashOrBank: 'ALL',
    amountFrom: '',
    amountTo: '',
    salesman: 'ALL',
  });

  // Modal states
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<SaleInvoice | null>(null);
  const [selectedInvoiceForThermal, setSelectedInvoiceForThermal] = useState<SaleInvoice | null>(null);
  const [selectedInvoiceForPrintA4, setSelectedInvoiceForPrintA4] = useState<SaleInvoice | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<SaleInvoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<SaleInvoice | null>(null);
  const [auditAction, setAuditAction] = useState<{
    type: 'EDIT' | 'DELETE';
    invoice: SaleInvoice;
  } | null>(null);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form modal state
  const [editingInvoiceData, setEditingInvoiceData] = useState<SaleInvoice | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFilterChange = (key: keyof ReportFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: DEFAULT_REPORT_FROM_DATE,
      dateTo: getDefaultReportToDate(),
      transactionNo: '',
      invoiceNo: '',
      customerName: '',
      storeLocationId: 'ALL',
      paymentMethod: 'ALL',
      cashOrBank: 'ALL',
      amountFrom: '',
      amountTo: '',
      salesman: 'ALL',
    });
    showToast('success', 'Filters reset to default view.');
  };

  // Filter application logic
  const filteredInvoices = useMemo<SaleInvoice[]>(() => {
    const matched = cashSaleInvoices.filter((inv) => {
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

      // 3. Transaction No
      if (filters.transactionNo.trim()) {
        const q = filters.transactionNo.trim().toLowerCase();
        const txn = (inv.transactionNo || '').toLowerCase();
        if (!txn.includes(q)) return false;
      }

      // 4. Invoice No
      if (filters.invoiceNo.trim()) {
        const q = filters.invoiceNo.trim().toLowerCase();
        const invNo = inv.invoiceNo.toLowerCase();
        if (!invNo.includes(q)) return false;
      }

      // 5. Customer Name (blank customer allowed)
      if (filters.customerName.trim()) {
        const q = filters.customerName.trim().toLowerCase();
        const cust = (inv.customerName || 'Walk-in Cash Customer').toLowerCase();
        if (!cust.includes(q)) return false;
      }

      // 6. Store Location
      if (filters.storeLocationId !== 'ALL') {
        if (inv.storeLocationId !== filters.storeLocationId) return false;
      }

      // 7. Payment Method
      if (filters.paymentMethod !== 'ALL') {
        if (filters.paymentMethod === 'Split') {
          const cashRec = inv.cashReceivedAmount || 0;
          const bankRec = inv.bankReceivedAmount || 0;
          if (!(cashRec > 0 && bankRec > 0)) return false;
        } else if (inv.paymentMethod !== filters.paymentMethod) {
          return false;
        }
      }

      // 8. Cash / Bank Channel Filter
      if (filters.cashOrBank !== 'ALL') {
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

        if (filters.cashOrBank === 'CASH_ONLY') {
          if (cashRec <= 0 || bankRec > 0) return false;
        } else if (filters.cashOrBank === 'BANK_ONLY') {
          if (bankRec <= 0 || cashRec > 0) return false;
        } else if (filters.cashOrBank === 'BOTH') {
          if (cashRec <= 0 || bankRec <= 0) return false;
        }
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

      // 10. Salesman
      if (filters.salesman !== 'ALL') {
        if ((inv.salesman || 'Ali Khan') !== filters.salesman) return false;
      }

      return true;
    });

    // ACCOUNTIX Global Rule: All report transactions default to Chronological Ascending Order (Oldest -> Newest)
    return sortChronologicalAscending(matched);
  }, [cashSaleInvoices, filters]);

  // Aggregate Summary Metrics based on filtered invoices
  const summaryTotals = useMemo(() => {
    let totalInvoices = filteredInvoices.length;
    let totalQty = 0;
    let totalSubtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalNetSales = 0;
    let totalCashReceived = 0;
    let totalBankReceived = 0;
    let totalReceived = 0;
    let totalRemaining = 0;

    filteredInvoices.forEach((inv) => {
      const qty = inv.items.reduce((s, i) => s + (i.quantity || 0), 0);
      totalQty += qty;
      totalSubtotal += inv.subtotal || 0;
      totalDiscount += inv.overallDiscount || 0;
      totalTax += inv.overallTax || 0;
      totalNetSales += inv.netInvoiceTotal || 0;

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

      totalCashReceived += cashRec;
      totalBankReceived += bankRec;
      totalReceived += totRec;
      totalRemaining += rem;
    });

    return {
      totalInvoices,
      totalQty,
      totalSubtotal,
      totalDiscount,
      totalTax,
      totalNetSales,
      totalCashReceived,
      totalBankReceived,
      totalReceived,
      totalRemaining,
    };
  }, [filteredInvoices]);

  // Selected store name for printable report
  const selectedStoreName = useMemo(() => {
    if (filters.storeLocationId === 'ALL') return 'All Locations (Consolidated)';
    const store = stores.find((s) => s.id === filters.storeLocationId);
    return store ? store.name : 'All Locations';
  }, [filters.storeLocationId, stores]);

  // EXPORT EXCEL (CSV)
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      showToast('error', 'No Cash Sale records found to export.');
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
      'Subtotal (PKR)',
      'Discount (PKR)',
      'Tax (PKR)',
      'Net Total (PKR)',
      'Cash Received (PKR)',
      'Bank Received (PKR)',
      'Total Received (PKR)',
      'Remaining Baqaya (PKR)',
      'Payment Method',
      'Salesman / User',
      'Status',
    ];

    const rows = filteredInvoices.map((inv, idx) => {
      const qty = inv.items.reduce((s, i) => s + (i.quantity || 0), 0);
      const itemsDetail = inv.items.map((i) => `${i.productName} [Qty: ${i.quantity}]`).join('; ');
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

      return [
        idx + 1,
        `"${inv.transactionNo || 'TXN-' + inv.invoiceNo}"`,
        `"${inv.invoiceNo}"`,
        `"${inv.invoiceDate}"`,
        `"${inv.customerName || 'Walk-in Cash Customer'}"`,
        `"${inv.storeLocationName}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        qty,
        inv.subtotal,
        inv.overallDiscount,
        inv.overallTax,
        inv.netInvoiceTotal,
        cashRec,
        bankRec,
        totRec,
        rem,
        `"${inv.paymentMethod}"`,
        `"${inv.salesman || 'Ali Khan'}"`,
        `"${inv.status}"`,
      ];
    });

    // Summary row
    const summaryRow = [
      'TOTALS',
      '',
      '',
      '',
      '',
      '',
      `"${summaryTotals.totalInvoices} Invoices"`,
      summaryTotals.totalQty,
      summaryTotals.totalSubtotal,
      summaryTotals.totalDiscount,
      summaryTotals.totalTax,
      summaryTotals.totalNetSales,
      summaryTotals.totalCashReceived,
      summaryTotals.totalBankReceived,
      summaryTotals.totalReceived,
      summaryTotals.totalRemaining,
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
      `ACCOUNTIX_Cash_Sale_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Excel (CSV) report exported successfully!');
  };

  // DOWNLOAD PDF / PRINT REPORT
  const handlePrintFullReport = () => {
    setIsPrintReportModalOpen(true);
  };

  const handleDownloadPdf = () => {
    setIsPrintReportModalOpen(true);
    // After rendering print modal, user can use browser Save as PDF or Print
  };

  // ACTIONS: View Details, Edit (Audit Protected), Delete (Audit Protected), Print, Preview
  const handleViewDetails = (invoice: SaleInvoice) => {
    setSelectedInvoiceForDetails(invoice);
  };

  const handleRequestEdit = (invoice: SaleInvoice) => {
    setAuditAction({
      type: 'EDIT',
      invoice,
    });
  };

  const handleRequestDelete = (invoice: SaleInvoice) => {
    setAuditAction({
      type: 'DELETE',
      invoice,
    });
  };

  const handleAuditVerificationSuccess = (user: string, reason: string) => {
    if (!auditAction) return;
    const { type, invoice } = auditAction;

    if (type === 'EDIT') {
      // Open the edit modal with a deep copy of the invoice
      setEditingInvoiceData(JSON.parse(JSON.stringify(invoice)));
      showToast('success', `Audit verified by ${user}. You can now edit ${invoice.invoiceNo}.`);
    } else if (type === 'DELETE') {
      // Execute deletion with full accounting reversal
      const result = salesStore.deleteInvoice(invoice.invoiceNo, user);
      if (result.success) {
        showToast('success', `Transaction ${invoice.invoiceNo} deleted. Stock & Day Book reversed.`);
      } else {
        showToast('error', result.message);
      }
    }
    setAuditAction(null);
  };

  // Handle saving the edited invoice
  const handleSaveEditedInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoiceData) return;

    // Recalculate totals according to ACCOUNTIX rules
    const subtotal = editingInvoiceData.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    let overallDiscount = 0;
    if (editingInvoiceData.discountType === 'percentage') {
      overallDiscount = Math.round((subtotal * (editingInvoiceData.discountValue || 0)) / 100);
    } else {
      overallDiscount = editingInvoiceData.discountValue || 0;
    }

    const afterDiscount = Math.max(0, subtotal - overallDiscount);
    const overallTax = Math.round((afterDiscount * (editingInvoiceData.taxPercent || 0)) / 100);
    const netInvoiceTotal = Math.round(afterDiscount + overallTax);

    // Multi-payment recalculation
    const cashRec = editingInvoiceData.cashReceivedAmount || 0;
    const bankRec = editingInvoiceData.bankReceivedAmount || 0;
    const otherRec = editingInvoiceData.otherReceivedAmount || 0;
    const totalRec = cashRec + bankRec + otherRec;
    const remaining = Math.max(0, netInvoiceTotal - totalRec);

    const updatedInvoice: SaleInvoice = {
      ...editingInvoiceData,
      subtotal,
      overallDiscount,
      overallTax,
      netInvoiceTotal,
      cashReceivedAmount: cashRec,
      bankReceivedAmount: bankRec,
      totalReceivedAmount: totalRec,
      remainingBalanceAmount: remaining,
      cashReceivedAtSale: netInvoiceTotal,
      currentInvoiceRemaining: remaining,
      status: remaining === 0 ? 'PAID IN FULL' : 'PARTIAL CREDIT',
    };

    const res = salesStore.saveInvoice(updatedInvoice);
    if (res.success) {
      showToast('success', `Cash Sale ${updatedInvoice.invoiceNo} updated successfully!`);
      setEditingInvoiceData(null);
    } else {
      showToast('error', res.message);
    }
  };

  return (
    <main className="flex-1 bg-[#D0E7F5] min-h-[calc(100vh-2.5rem)] py-2 sm:py-3 px-2 sm:px-4 text-[#111111] font-sans antialiased select-none pb-8">
      <div className="w-full max-w-[1920px] mx-auto space-y-2.5">
        {/* SECTION 2: REPORT TITLE */}
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-[24px] font-bold text-[#111111] tracking-tight uppercase">
              CASH SALE REPORT
            </h1>
            <span className="text-[11px] font-mono text-slate-700 hidden md:inline">
              · ACCOUNTIX Accounting & POS Database
            </span>
          </div>

          {/* Quick Action Buttons in ACCOUNTIX Classic Light-Blue Style */}
          <div className="flex items-center flex-wrap gap-1.5">
            {onNavigateToSaleInvoice && (
              <button
                type="button"
                onClick={() => onNavigateToSaleInvoice()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Create a new Cash Sale Invoice"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-800" />
                <span>New Cash Sale</span>
              </button>
            )}

            {onOpenCreditSaleReport && (
              <button
                type="button"
                onClick={onOpenCreditSaleReport}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Switch to Credit Sale Report"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-800" />
                <span>Credit Sale Report</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAuditLogsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="View immutable audit history of creations, edits, and deletions"
            >
              <Lock className="w-3.5 h-3.5 text-[#0b66c3]" />
              <span>Audit History ({auditLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWordPressModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="View WordPress [accountix_app] shortcode & PHP code snippet"
            >
              <Code2 className="w-3.5 h-3.5 text-[#0b66c3]" />
              <span>WP Code</span>
            </button>

            <button
              type="button"
              onClick={() => setStoreTick((t) => t + 1)}
              className="p-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[#111111] rounded-none sm:rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Refresh / Sync Data"
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

        {/* 1. FILTER SECTION */}
        <CashSaleReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={() => showToast('success', `Found ${filteredInvoices.length} matching transactions.`)}
          onReset={handleResetFilters}
          onPrintReport={handlePrintFullReport}
          onExportExcel={handleExportExcel}
          onDownloadPdf={handleDownloadPdf}
          onOpenAuditLogs={() => setIsAuditLogsModalOpen(true)}
          stores={stores}
          customers={customers}
          banks={banks}
          salesmen={salesmen}
        />

        {/* 2. REAL-TIME SUMMARY CARDS */}
        <CashSaleReportSummaryCards
          totalInvoices={summaryTotals.totalInvoices}
          totalQty={summaryTotals.totalQty}
          totalSubtotal={summaryTotals.totalSubtotal}
          totalDiscount={summaryTotals.totalDiscount}
          totalTax={summaryTotals.totalTax}
          totalNetSales={summaryTotals.totalNetSales}
          totalCashReceived={summaryTotals.totalCashReceived}
          totalBankReceived={summaryTotals.totalBankReceived}
          totalReceived={summaryTotals.totalReceived}
          totalRemaining={summaryTotals.totalRemaining}
        />

        {/* 3. REPORT DATA TABLE */}
        <CashSaleReportTable
          invoices={filteredInvoices}
          onViewDetails={handleViewDetails}
          onEdit={handleRequestEdit}
          onPrint={(inv) => setSelectedInvoiceForPrintA4(inv)}
          onPreviewThermal={(inv) => setSelectedInvoiceForThermal(inv)}
          onDelete={handleRequestDelete}
        />

        {/* FOOTER AUDIT & COMPLIANCE SUMMARY NOTE */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All Cash Sales synchronize in real-time with Cash Book, Bank Book, Day Book, Stock & General Ledger.</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            ACCOUNTIX v4.8 Enterprise · WordPress Multi-Module Architecture
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW TRANSACTION DETAILS */}
      <TransactionDetailsModal
        isOpen={Boolean(selectedInvoiceForDetails)}
        onClose={() => setSelectedInvoiceForDetails(null)}
        invoice={selectedInvoiceForDetails}
        onPrint={(inv) => {
          setSelectedInvoiceForDetails(null);
          setSelectedInvoiceForPrintA4(inv);
        }}
        onOpenThermal={(inv) => {
          setSelectedInvoiceForDetails(null);
          setSelectedInvoiceForThermal(inv);
        }}
      />

      {/* MODAL 2: THERMAL RECEIPT PREVIEW (80mm / 58mm) */}
      <ThermalReceiptPreviewModal
        isOpen={Boolean(selectedInvoiceForThermal)}
        onClose={() => setSelectedInvoiceForThermal(null)}
        invoice={selectedInvoiceForThermal}
      />

      {/* MODAL 3: AUDIT PASSWORD VERIFICATION FOR EDIT / DELETE */}
      <AuditPasswordModal
        isOpen={Boolean(auditAction)}
        onClose={() => setAuditAction(null)}
        onSuccess={handleAuditVerificationSuccess}
        actionTitle={
          auditAction?.type === 'EDIT'
            ? 'Authorized Cash Sale Modification'
            : 'Authorized Cash Sale Deletion & Ledger Reversal'
        }
        actionType={auditAction?.type || 'EDIT'}
        invoiceNo={auditAction?.invoice.invoiceNo || ''}
      />

      {/* MODAL 4: AUDIT LOGS HISTORY MODAL */}
      <AuditLogsModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
        logs={auditLogs}
      />

      {/* MODAL 5: WORDPRESS CODE EXPORT MODAL */}
      <WordPressIntegrationModal
        isOpen={isWordPressModalOpen}
        onClose={() => setIsWordPressModalOpen(false)}
      />

      {/* MODAL 6: PRINT FULL CASH SALE REPORT */}
      {isPrintReportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header bar */}
            <div className="bg-[#0b66c3] px-5 py-3 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm">Printable Cash Sale Report Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-white text-blue-900 hover:bg-blue-50 transition-colors shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintReportModalOpen(false)}
                  className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 flex justify-center">
              <div className="bg-white shadow-md border border-slate-200 rounded max-w-4xl w-full">
                <PrintableCashSaleReport
                  invoices={filteredInvoices}
                  dateFrom={filters.dateFrom}
                  dateTo={filters.dateTo}
                  storeName={selectedStoreName}
                  totalSubtotal={summaryTotals.totalSubtotal}
                  totalDiscount={summaryTotals.totalDiscount}
                  totalTax={summaryTotals.totalTax}
                  totalNetSales={summaryTotals.totalNetSales}
                  totalCashReceived={summaryTotals.totalCashReceived}
                  totalBankReceived={summaryTotals.totalBankReceived}
                  totalReceived={summaryTotals.totalReceived}
                  totalRemaining={summaryTotals.totalRemaining}
                  totalQty={summaryTotals.totalQty}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT CASH SALE TRANSACTION (AUDIT PROTECTED) */}
      {editingInvoiceData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[#0b66c3] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-white" />
                <div>
                  <h3 className="font-bold text-sm">
                    Edit Cash Sale Transaction: {editingInvoiceData.invoiceNo}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Txn No: {editingInvoiceData.transactionNo || 'TXN-' + editingInvoiceData.invoiceNo} · Date: {editingInvoiceData.invoiceDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingInvoiceData(null)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditedInvoice} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Customer Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Customer Name (Blank = Walk-in):
                  </label>
                  <input
                    type="text"
                    value={editingInvoiceData.customerName || ''}
                    onChange={(e) =>
                      setEditingInvoiceData({
                        ...editingInvoiceData,
                        customerName: e.target.value,
                      })
                    }
                    placeholder="Walk-in Cash Customer"
                    className="w-full text-xs rounded border border-slate-300 py-1.5 px-2.5 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Blank customer will not create any customer ledger entry.
                  </span>
                </div>

                {/* Store Location */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Store Location:
                  </label>
                  <select
                    value={editingInvoiceData.storeLocationId}
                    onChange={(e) => {
                      const st = stores.find((s) => s.id === e.target.value);
                      setEditingInvoiceData({
                        ...editingInvoiceData,
                        storeLocationId: e.target.value,
                        storeLocationName: st ? st.name : editingInvoiceData.storeLocationName,
                      });
                    }}
                    className="w-full text-xs rounded border border-slate-300 py-1.5 px-2.5 focus:ring-1 focus:ring-blue-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Salesman */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Salesman / User:
                  </label>
                  <input
                    type="text"
                    value={editingInvoiceData.salesman || ''}
                    onChange={(e) =>
                      setEditingInvoiceData({
                        ...editingInvoiceData,
                        salesman: e.target.value,
                      })
                    }
                    className="w-full text-xs rounded border border-slate-300 py-1.5 px-2.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Items List (Editable Quantities and Rates) */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                  <span>Line Items</span>
                  <span className="text-[11px] text-slate-500">{editingInvoiceData.items.length} items</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {editingInvoiceData.items.map((item, idx) => (
                    <div key={item.id} className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <span className="font-semibold text-slate-900 block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Unit: {item.unit}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 block">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = Math.max(1, parseInt(e.target.value) || 1);
                            const updatedItems = [...editingInvoiceData.items];
                            const lineSub = newQty * item.rate;
                            const lineDisc = item.discountType === 'percentage'
                              ? Math.round((lineSub * item.discountValue) / 100)
                              : item.discountValue;
                            const lineTax = Math.round(((lineSub - lineDisc) * item.taxPercent) / 100);
                            const lineTotal = lineSub - lineDisc + lineTax;

                            updatedItems[idx] = {
                              ...item,
                              quantity: newQty,
                              discountAmount: lineDisc,
                              taxAmount: lineTax,
                              total: lineTotal,
                            };
                            setEditingInvoiceData({
                              ...editingInvoiceData,
                              items: updatedItems,
                            });
                          }}
                          className="w-full text-xs rounded border border-slate-300 py-1 px-2 text-center"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 block">Rate (PKR)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => {
                            const newRate = Math.max(0, parseFloat(e.target.value) || 0);
                            const updatedItems = [...editingInvoiceData.items];
                            const lineSub = item.quantity * newRate;
                            const lineDisc = item.discountType === 'percentage'
                              ? Math.round((lineSub * item.discountValue) / 100)
                              : item.discountValue;
                            const lineTax = Math.round(((lineSub - lineDisc) * item.taxPercent) / 100);
                            const lineTotal = lineSub - lineDisc + lineTax;

                            updatedItems[idx] = {
                              ...item,
                              rate: newRate,
                              discountAmount: lineDisc,
                              taxAmount: lineTax,
                              total: lineTotal,
                            };
                            setEditingInvoiceData({
                              ...editingInvoiceData,
                              items: updatedItems,
                            });
                          }}
                          className="w-full text-xs rounded border border-slate-300 py-1 px-2 text-right"
                        />
                      </div>
                      <div className="sm:col-span-3 text-right">
                        <label className="text-[10px] text-slate-500 block">Line Total</label>
                        <span className="font-bold text-slate-800 font-mono">
                          Rs. {item.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount, Tax and Multi-Payment Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Discount & Tax Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <h4 className="font-bold text-slate-800">Discount & Tax (ACCOUNTIX Rules)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 block mb-0.5">Discount Type</label>
                      <select
                        value={editingInvoiceData.discountType}
                        onChange={(e) =>
                          setEditingInvoiceData({
                            ...editingInvoiceData,
                            discountType: e.target.value as 'fixed' | 'percentage',
                          })
                        }
                        className="w-full text-xs rounded border border-slate-300 py-1 px-1.5 bg-white"
                      >
                        <option value="fixed">Fixed (Rs.)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block mb-0.5">Discount Value</label>
                      <input
                        type="number"
                        min="0"
                        value={editingInvoiceData.discountValue}
                        onChange={(e) =>
                          setEditingInvoiceData({
                            ...editingInvoiceData,
                            discountValue: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingInvoiceData.taxPercent}
                      onChange={(e) =>
                        setEditingInvoiceData({
                          ...editingInvoiceData,
                          taxPercent: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full text-xs rounded border border-slate-300 py-1 px-2 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">Tax is applied after discount deduction.</span>
                  </div>
                </div>

                {/* Multi-Payment Channels */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <h4 className="font-bold text-slate-800">Split / Multi-Payment Settlement</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 block mb-0.5">Cash Received (PKR)</label>
                      <input
                        type="number"
                        min="0"
                        value={editingInvoiceData.cashReceivedAmount || 0}
                        onChange={(e) =>
                          setEditingInvoiceData({
                            ...editingInvoiceData,
                            cashReceivedAmount: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block mb-0.5">Bank Received (PKR)</label>
                      <input
                        type="number"
                        min="0"
                        value={editingInvoiceData.bankReceivedAmount || 0}
                        onChange={(e) =>
                          setEditingInvoiceData({
                            ...editingInvoiceData,
                            bankReceivedAmount: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full text-xs rounded border border-slate-300 py-1 px-2 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">Target Bank Account</label>
                    <select
                      value={editingInvoiceData.bankAccountId || ''}
                      onChange={(e) => {
                        const b = banks.find((bank) => bank.id === e.target.value);
                        setEditingInvoiceData({
                          ...editingInvoiceData,
                          bankAccountId: e.target.value,
                          bankName: b ? b.bankName : undefined,
                        });
                      }}
                      className="w-full text-xs rounded border border-slate-300 py-1 px-1.5 bg-white"
                    >
                      <option value="">None / Cash Only</option>
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} - {b.accountNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                {onNavigateToSaleInvoice && (
                  <button
                    type="button"
                    onClick={() => {
                      const invNo = editingInvoiceData.invoiceNo;
                      setEditingInvoiceData(null);
                      onNavigateToSaleInvoice(invNo);
                    }}
                    className="text-xs text-blue-700 hover:underline font-semibold"
                  >
                    Open in Full Invoice Designer Screen →
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingInvoiceData(null)}
                    className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#0b66c3] hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Update Ledgers</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
