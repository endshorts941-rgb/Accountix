import React, { useState, useEffect, useMemo } from 'react';
import { Customer, CustomerLedgerEntry, SaleInvoice } from '../sales/types';
import { salesStore } from '../sales/salesStore';
import {
  sortChronologicalAscending,
  DEFAULT_REPORT_FROM_DATE,
  getDefaultReportToDate,
  parseDDMMYYYYToDate,
} from '../../utils/dateUtils';
import {
  AccountixReportTemplate,
  AccountixReportTableWrapper,
  AccountixReportFilterCard,
} from './components/AccountixReportTemplate';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { ThermalReceiptPreviewModal } from './components/ThermalReceiptPreviewModal';
import {
  BookOpen,
  User,
  Printer,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  RotateCcw,
  Eye,
  Building,
  CreditCard,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface CustomerLedgerReportModuleProps {
  initialCustomerId?: string;
  onNavigateToSaleInvoice?: (type?: 'Cash Sale' | 'Credit Sale', invoiceNo?: string) => void;
  onNavigateBack?: () => void;
  onOpenSupplierLedger?: () => void;
}

export const CustomerLedgerReportModule: React.FC<CustomerLedgerReportModuleProps> = ({
  initialCustomerId,
  onNavigateToSaleInvoice,
  onNavigateBack,
  onOpenSupplierLedger,
}) => {
  // Store subscription
  const [storeTick, setStoreTick] = useState(0);
  useEffect(() => {
    return salesStore.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  const customers = useMemo(() => salesStore.getCustomers(), [storeTick]);
  const stores = useMemo(() => salesStore.getStores(), [storeTick]);
  const invoices = useMemo(() => salesStore.getInvoices(), [storeTick]);

  // Customer filter
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || (customers.length > 0 ? customers[0].id : '')
  );

  // Filters State
  const [filters, setFilters] = useState({
    dateFrom: DEFAULT_REPORT_FROM_DATE,
    dateTo: getDefaultReportToDate(),
    storeLocationId: 'ALL',
    searchQuery: '',
  });

  // Modal states
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<SaleInvoice | null>(null);
  const [selectedInvoiceForThermal, setSelectedInvoiceForThermal] = useState<SaleInvoice | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const currentCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || customers[0],
    [customers, selectedCustomerId]
  );

  // Raw ledger entries from store for this customer
  const rawLedgerEntries = useMemo(() => {
    if (!currentCustomer) return [];
    return salesStore
      .getCustomerLedgers()
      .filter((entry) => entry.customerId === currentCustomer.id);
  }, [currentCustomer, storeTick]);

  // Sort chronologically ascending: Opening Balance -> Oldest -> Latest
  const sortedRawEntries = useMemo(() => {
    return sortChronologicalAscending(rawLedgerEntries);
  }, [rawLedgerEntries]);

  // Running balance calculation
  const computedEntriesWithBalance = useMemo(() => {
    let runningBal = 0;
    return sortedRawEntries.map((entry) => {
      const debit = entry.debit || 0;
      const credit = entry.credit || 0;
      runningBal = runningBal + debit - credit;
      return {
        ...entry,
        balance: runningBal,
      };
    });
  }, [sortedRawEntries]);

  // Filter entries according to date range, store, and query
  const filteredLedgerEntries = useMemo(() => {
    return computedEntriesWithBalance.filter((entry) => {
      // Date filter
      if (filters.dateFrom) {
        const fromDate = parseDDMMYYYYToDate(filters.dateFrom);
        const entryDate = parseDDMMYYYYToDate(entry.date);
        if (fromDate && entryDate && entryDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = parseDDMMYYYYToDate(filters.dateTo);
        const entryDate = parseDDMMYYYYToDate(entry.date);
        if (toDate && entryDate && entryDate > toDate) return false;
      }

      // Store location filter
      if (filters.storeLocationId !== 'ALL') {
        const matchingStore = stores.find((s) => s.id === filters.storeLocationId);
        if (matchingStore && entry.storeLocationName && !entry.storeLocationName.includes(matchingStore.name)) {
          return false;
        }
      }

      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchInvoice = entry.invoiceNo?.toLowerCase().includes(q);
        const matchTxn = entry.transactionNo?.toLowerCase().includes(q);
        const matchDesc = entry.description?.toLowerCase().includes(q);
        if (!matchInvoice && !matchTxn && !matchDesc) return false;
      }

      return true;
    });
  }, [computedEntriesWithBalance, filters, stores]);

  // Totals for this filtered ledger
  const totalDebit = useMemo(
    () => filteredLedgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0),
    [filteredLedgerEntries]
  );
  const totalCredit = useMemo(
    () => filteredLedgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0),
    [filteredLedgerEntries]
  );
  const closingBalance = useMemo(() => {
    if (filteredLedgerEntries.length > 0) {
      return filteredLedgerEntries[filteredLedgerEntries.length - 1].balance;
    }
    return currentCustomer ? currentCustomer.previousBalance : 0;
  }, [filteredLedgerEntries, currentCustomer]);

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredLedgerEntries.length === 0) {
      showToast('error', 'No ledger records available to export.');
      return;
    }

    const headers = [
      'Sr #',
      'Date',
      'Exact Time',
      'Voucher / Txn No',
      'Invoice No',
      'Particulars / Description',
      'Store Location',
      'Payment Method',
      'Debit (PKR)',
      'Credit (PKR)',
      'Running Balance (PKR)',
    ];

    const rows = filteredLedgerEntries.map((e, idx) => [
      idx + 1,
      `"${e.date}"`,
      `"${e.exactTime || '10:00:00'}"`,
      `"${e.transactionNo || ''}"`,
      `"${e.invoiceNo}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.storeLocationName || 'Main Store'}"`,
      `"${e.paymentMethod || 'Credit'}"`,
      e.debit || 0,
      e.credit || 0,
      e.balance,
    ]);

    const summaryRow = [
      'TOTALS',
      '',
      '',
      '',
      '',
      `"${currentCustomer?.name} Ledger Summary"`,
      '',
      '',
      totalDebit,
      totalCredit,
      closingBalance,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ACCOUNTIX_Customer_Ledger_${currentCustomer?.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Customer ledger for ${currentCustomer?.name} exported successfully!`);
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: DEFAULT_REPORT_FROM_DATE,
      dateTo: getDefaultReportToDate(),
      storeLocationId: 'ALL',
      searchQuery: '',
    });
    showToast('success', 'Filters reset to defaults.');
  };

  const handleViewInvoiceDetails = (invoiceNo: string) => {
    const inv = invoices.find((i) => i.invoiceNo === invoiceNo);
    if (inv) {
      setSelectedInvoiceForDetails(inv);
    } else {
      showToast('error', `Invoice ${invoiceNo} details not found.`);
    }
  };

  return (
    <AccountixReportTemplate
      reportTitle="CUSTOMER LEDGER"
      reportSubtitle="· ACCOUNTIX Accounts Receivable & Party Ledger"
      badgeText={currentCustomer?.name || 'Party Statement'}
      recordCountText={`${filteredLedgerEntries.length} Entries`}
      onPrint={handlePrint}
      onExportCsv={handleExportCsv}
      onRefresh={() => setStoreTick((t) => t + 1)}
      onBack={onNavigateBack}
      toastMessage={toastMessage}
      onDismissToast={() => setToastMessage(null)}
      topActions={[
        ...(onNavigateToSaleInvoice
          ? [
              {
                id: 'new-sale',
                label: 'New Invoice',
                icon: <Plus className="w-3.5 h-3.5 text-emerald-800" />,
                onClick: () => onNavigateToSaleInvoice('Credit Sale'),
                title: 'Create new credit sale invoice',
              },
            ]
          : []),
        ...(onOpenSupplierLedger
          ? [
              {
                id: 'supplier-ledger',
                label: 'Supplier Ledger',
                icon: <BookOpen className="w-3.5 h-3.5 text-blue-800" />,
                onClick: onOpenSupplierLedger,
                title: 'Switch to Supplier Ledger',
              },
            ]
          : []),
      ]}
      filterSection={
        <AccountixReportFilterCard
          title="Report Filters"
          onReset={handleResetFilters}
          onExportExcel={handleExportCsv}
          onPrint={handlePrint}
          onDownloadPdf={handlePrint}
          bottomLeftControl={
            <div className="flex items-center gap-1.5 flex-wrap">
              <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
                Voucher / Inv Search:
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder="Inv # / Txn #..."
                  className="h-7 w-48 sm:w-64 px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                />
                <button
                  type="button"
                  onClick={() => showToast('success', `Found ${filteredLedgerEntries.length} matching entries.`)}
                  className="h-7 px-2.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-slate-800" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          }
        >
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
            {/* Customer Selector */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#111111] mb-1">
                Customer:
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="h-7 w-full px-2 bg-white border border-[#7F9EAD] text-xs font-bold text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · Bal: Rs. {c.previousBalance.toLocaleString()} {c.address ? `(${c.address})` : ''}
                  </option>
                ))}
              </select>
            </div>

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
            <div className="sm:col-span-2">
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
          </div>
        </AccountixReportFilterCard>
      }
      summaryCardsSection={
        currentCustomer && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {/* 1. Customer Name & Contact */}
            <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs col-span-2 sm:col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
                Party / Customer Profile
              </span>
              <div className="mt-0.5">
                <span className="text-sm font-bold text-[#111111] block truncate">
                  {currentCustomer.name}
                </span>
                <span className="text-[11px] text-slate-600 font-mono block">
                  {currentCustomer.phone ? `Phone: ${currentCustomer.phone}` : 'No phone registered'} · {currentCustomer.address || 'Pakistan'}
                </span>
              </div>
            </div>

            {/* 2. Opening Balance */}
            <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
                Opening Balance
              </span>
              <div className="mt-0.5">
                <span className="text-sm font-bold font-mono text-[#111111] block">
                  Rs. {(currentCustomer.previousBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Brought Forward
                </span>
              </div>
            </div>

            {/* 3. Total Debit (Sales) */}
            <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
                Total Debit (Sales)
              </span>
              <div className="mt-0.5">
                <span className="text-sm font-bold font-mono text-blue-900 block">
                  Rs. {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-blue-700 font-semibold block">
                  Total Billable
                </span>
              </div>
            </div>

            {/* 4. Total Credit (Received) */}
            <div className="border border-[#7F9EAD] bg-white p-2 rounded-none sm:rounded-xs shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
                Total Credit (Paid)
              </span>
              <div className="mt-0.5">
                <span className="text-sm font-bold font-mono text-emerald-800 block">
                  Rs. {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  Received / Cleared
                </span>
              </div>
            </div>

            {/* 5. Net Closing Receivable */}
            <div className="border border-[#7F9EAD] bg-[#FFF4F2] p-2 rounded-none sm:rounded-xs shadow-2xs">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide block">
                Closing Receivable
              </span>
              <div className="mt-0.5">
                <span className="text-sm font-extrabold font-mono text-red-700 block">
                  Rs. {closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-red-600 font-semibold block">
                  Net Balance Baqaya
                </span>
              </div>
            </div>
          </div>
        )
      }
    >
      {/* SCROLLABLE DATA TABLE IN MASTER ACCOUNTIX DESIGN */}
      <AccountixReportTableWrapper
        title="Customer Ledger Data Table"
        recordCount={filteredLedgerEntries.length}
        recordCountLabel="Entries"
        subtitle="Chronological Ledger · Opening Balance + Debits - Credits = Running Balance"
        maxHeight="max-h-[520px]"
      >
        <table className="w-full text-xs border-collapse">
          {/* STICKY LIGHT-BLUE HEADER */}
          <thead className="sticky top-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px] shadow-xs select-none">
            <tr>
              <th className="py-2 px-2 w-10 text-center border-r border-[#7F9EAD]">#</th>
              <th className="py-2 px-2.5 w-24 text-center border-r border-[#7F9EAD]">Date</th>
              <th className="py-2 px-2 w-20 text-center border-r border-[#7F9EAD]">Time</th>
              <th className="py-2 px-2.5 w-28 text-left border-r border-[#7F9EAD]">Txn / Voucher</th>
              <th className="py-2 px-2.5 w-28 text-left border-r border-[#7F9EAD]">Invoice No</th>
              <th className="py-2 px-3 min-w-[200px] text-left border-r border-[#7F9EAD]">
                Description & Particulars
              </th>
              <th className="py-2 px-2.5 w-28 text-left border-r border-[#7F9EAD]">Store</th>
              <th className="py-2 px-2.5 w-24 text-left border-r border-[#7F9EAD]">Payment</th>
              <th className="py-2 px-3 w-32 text-right border-r border-[#7F9EAD] text-blue-900">
                Debit (Rs.)
              </th>
              <th className="py-2 px-3 w-32 text-right border-r border-[#7F9EAD] text-emerald-900">
                Credit (Rs.)
              </th>
              <th className="py-2 px-3 w-36 text-right border-r border-[#7F9EAD] text-red-900">
                Balance (Rs.)
              </th>
              <th className="py-2 px-2 w-20 text-center">Action</th>
            </tr>
          </thead>

          {/* TABLE BODY: Alternating Rows with hover & visible borders */}
          <tbody className="divide-y divide-[#7F9EAD]">
            {filteredLedgerEntries.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-600 bg-white">
                  <User className="w-7 h-7 mx-auto text-slate-400 mb-1" />
                  <p className="font-semibold text-xs text-slate-700">No ledger transactions found matching criteria.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Credit sales and payments for this customer will automatically appear here.
                  </p>
                </td>
              </tr>
            ) : (
              filteredLedgerEntries.map((entry, idx) => {
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F1F7FB]';

                return (
                  <tr
                    key={entry.id || `${entry.invoiceNo}-${idx}`}
                    className={`${rowBg} hover:bg-[#E2EFF7] transition-colors`}
                  >
                    {/* # Sr */}
                    <td className="py-1.5 px-2 text-center text-slate-700 border-r border-[#7F9EAD] font-mono">
                      {idx + 1}
                    </td>

                    {/* Date */}
                    <td className="py-1.5 px-2.5 text-center text-[#111111] border-r border-[#7F9EAD] font-mono whitespace-nowrap">
                      {entry.date}
                    </td>

                    {/* Exact Time */}
                    <td className="py-1.5 px-2 text-center text-slate-600 border-r border-[#7F9EAD] font-mono text-[10px] whitespace-nowrap">
                      {entry.exactTime || '10:00:00'}
                    </td>

                    {/* Txn / Voucher No */}
                    <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                      {entry.transactionNo || '—'}
                    </td>

                    {/* Invoice No */}
                    <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] font-mono whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleViewInvoiceDetails(entry.invoiceNo)}
                        className="font-bold text-[#0b66c3] hover:underline cursor-pointer"
                        title="View Linked Invoice"
                      >
                        {entry.invoiceNo}
                      </button>
                    </td>

                    {/* Description */}
                    <td className="py-1.5 px-3 text-left border-r border-[#7F9EAD]">
                      <span className="font-medium text-[#111111] leading-tight block">
                        {entry.description}
                      </span>
                    </td>

                    {/* Store Location */}
                    <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] text-slate-800 whitespace-nowrap">
                      {entry.storeLocationName || 'Main Store'}
                    </td>

                    {/* Payment Method */}
                    <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] text-slate-800 whitespace-nowrap">
                      {entry.paymentMethod || 'Credit'}
                    </td>

                    {/* Debit */}
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-blue-900 border-r border-[#7F9EAD] whitespace-nowrap">
                      {entry.debit && entry.debit > 0
                        ? `Rs. ${entry.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'}
                    </td>

                    {/* Credit */}
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-800 border-r border-[#7F9EAD] whitespace-nowrap">
                      {entry.credit && entry.credit > 0
                        ? `Rs. ${entry.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'}
                    </td>

                    {/* Running Balance */}
                    <td className="py-1.5 px-3 text-right font-mono font-extrabold text-[#111111] border-r border-[#7F9EAD] whitespace-nowrap">
                      Rs. {entry.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Action */}
                    <td className="py-1.5 px-2 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleViewInvoiceDetails(entry.invoiceNo)}
                        className="p-1 text-blue-700 hover:bg-[#D7EAF5] rounded-xs transition-colors cursor-pointer"
                        title="View Transaction Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* STICKY TABLE FOOTER TOTALS ROW */}
          {filteredLedgerEntries.length > 0 && (
            <tfoot className="sticky bottom-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold text-xs border-t-2 border-[#7F9EAD] shadow-xs">
              <tr>
                <td colSpan={8} className="py-2 px-3 text-right uppercase border-r border-[#7F9EAD]">
                  Customer Ledger Totals ({filteredLedgerEntries.length} Records):
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 border-r border-[#7F9EAD] whitespace-nowrap">
                  Rs. {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900 border-r border-[#7F9EAD] whitespace-nowrap">
                  Rs. {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 text-right font-mono font-black text-red-950 border-r border-[#7F9EAD] whitespace-nowrap">
                  Rs. {closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-2 text-center text-slate-700 text-[10px]">
                  Net Due
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </AccountixReportTableWrapper>

      {/* TRANSACTION DETAILS MODAL */}
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

      {/* POS RECEIPT PREVIEW MODAL */}
      <ThermalReceiptPreviewModal
        isOpen={!!selectedInvoiceForThermal}
        onClose={() => setSelectedInvoiceForThermal(null)}
        invoice={selectedInvoiceForThermal}
      />
    </AccountixReportTemplate>
  );
};
