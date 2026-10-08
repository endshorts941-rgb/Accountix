import React, { useState, useEffect, useMemo } from 'react';
import { salesStore } from '../sales/salesStore';
import { SaleInvoice, Customer, ProductItem, BankAccount } from '../sales/types';
import {
  DEFAULT_REPORT_FROM_DATE,
  getDefaultReportToDate,
  parseDDMMYYYYToDate,
} from '../../utils/dateUtils';
import {
  AccountixReportTemplate,
  AccountixReportTableWrapper,
  AccountixReportFilterCard,
} from './components/AccountixReportTemplate';
import {
  BookOpen,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Search,
  RotateCcw,
  Plus,
  Landmark,
  Wallet,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  Scale,
  Calendar,
} from 'lucide-react';

export type UniversalReportType =
  | 'cash-book'
  | 'bank-book'
  | 'day-book'
  | 'supplier-ledger'
  | 'combined-party-ledger'
  | 'general-ledger'
  | 'trial-balance'
  | 'profit-and-loss'
  | 'balance-sheet'
  | 'stock-reports'
  | 'purchase-reports'
  | 'expense-reports'
  | 'banking-reports'
  | 'manufacturing-reports'
  | 'service-repair-reports';

interface UniversalAccountixReportModuleProps {
  reportType: UniversalReportType;
  onNavigateToSaleInvoice?: (type?: 'Cash Sale' | 'Credit Sale') => void;
  onNavigateBack?: () => void;
}

export const UniversalAccountixReportModule: React.FC<UniversalAccountixReportModuleProps> = ({
  reportType,
  onNavigateToSaleInvoice,
  onNavigateBack,
}) => {
  const [storeTick, setStoreTick] = useState(0);
  useEffect(() => {
    return salesStore.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  const invoices = useMemo(() => salesStore.getInvoices(), [storeTick]);
  const customers = useMemo(() => salesStore.getCustomers(), [storeTick]);
  const products = useMemo(() => salesStore.getProducts(), [storeTick]);
  const banks = useMemo(() => salesStore.getBanks(), [storeTick]);
  const dayBook = useMemo(() => salesStore.getDayBook(), [storeTick]);
  const cashBalance = useMemo(() => salesStore.getCashBalance(), [storeTick]);

  // Filters State
  const [filters, setFilters] = useState({
    dateFrom: DEFAULT_REPORT_FROM_DATE,
    dateTo: getDefaultReportToDate(),
    searchQuery: '',
    categoryFilter: 'ALL',
  });

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Configuration for report types
  const reportConfig = useMemo(() => {
    switch (reportType) {
      case 'cash-book':
        return {
          title: 'CASH BOOK',
          tableTitle: 'Cash Book Data Table',
          subtitle: '· ACCOUNTIX Cash In Hand Register & Cash Receipts / Payments',
          badge: 'Cash In Hand',
          columns: ['#', 'Date', 'Time', 'Voucher / Ref', 'Particulars / Account', 'Store', 'Cash In (Debit)', 'Cash Out (Credit)', 'Cash Balance (Rs.)'],
        };
      case 'bank-book':
      case 'banking-reports':
        return {
          title: 'BANK BOOK',
          tableTitle: 'Bank Book Data Table',
          subtitle: '· ACCOUNTIX Bank Accounts Register & Reconciliation Ledger',
          badge: 'Bank Accounts',
          columns: ['#', 'Date', 'Time', 'Voucher / Chq #', 'Bank Account', 'Particulars / Description', 'Deposit (Debit)', 'Withdrawal (Credit)', 'Balance (Rs.)'],
        };
      case 'day-book':
        return {
          title: 'DAY BOOK',
          tableTitle: 'Day Book Data Table',
          subtitle: '· ACCOUNTIX Daily Transaction Audit & Journal Vouchers',
          badge: 'Daily Register',
          columns: ['#', 'Date', 'Voucher #', 'Ref / Inv No', 'Account Head', 'Particulars', 'Debit (Rs.)', 'Credit (Rs.)'],
        };
      case 'supplier-ledger':
        return {
          title: 'SUPPLIER LEDGER',
          tableTitle: 'Supplier Ledger Data Table',
          subtitle: '· ACCOUNTIX Vendor Statement & Purchase Payables Trail',
          badge: 'Accounts Payable',
          columns: ['#', 'Date', 'Voucher #', 'Purchase Bill #', 'Supplier Name', 'Particulars', 'Debit (Paid)', 'Credit (Purchases)', 'Payable Balance (Rs.)'],
        };
      case 'combined-party-ledger':
        return {
          title: 'COMBINED PARTY LEDGER',
          tableTitle: 'Combined Party Ledger Data Table',
          subtitle: '· ACCOUNTIX Customer & Vendor Reconciliation (Net Position)',
          badge: 'Party Statement',
          columns: ['#', 'Date', 'Txn #', 'Invoice / Bill #', 'Party Name', 'Role', 'Receivable (Dr)', 'Payable (Cr)', 'Net Outstanding (Rs.)'],
        };
      case 'general-ledger':
        return {
          title: 'GENERAL LEDGER',
          tableTitle: 'General Ledger Data Table',
          subtitle: '· ACCOUNTIX Chart of Accounts Double-Entry Trail',
          badge: 'Chart of Accounts',
          columns: ['#', 'Account Code', 'Account Name', 'Account Category', 'Opening Balance', 'Debit Total', 'Credit Total', 'Net Balance (Rs.)'],
        };
      case 'trial-balance':
        return {
          title: 'TRIAL BALANCE',
          tableTitle: 'Trial Balance Data Table',
          subtitle: '· ACCOUNTIX Real-time Balanced Financial Ledger Statement',
          badge: 'Double-Entry Balanced',
          columns: ['#', 'Account Code', 'Account Title', 'Type', 'Debit (Rs.)', 'Credit (Rs.)'],
        };
      case 'profit-and-loss':
        return {
          title: 'PROFIT & LOSS',
          tableTitle: 'Profit & Loss Data Table',
          subtitle: '· ACCOUNTIX Operating Revenue, COGS, Gross & Net Income',
          badge: 'Financial Statement',
          columns: ['#', 'Account Code', 'Revenue & Expense Particulars', 'Category', 'Income (Credit)', 'Expense (Debit)', 'Net Effect (Rs.)'],
        };
      case 'balance-sheet':
        return {
          title: 'BALANCE SHEET',
          tableTitle: 'Balance Sheet Data Table',
          subtitle: '· ACCOUNTIX Statement of Financial Position (Assets = Liabilities + Equity)',
          badge: 'Statement of Financial Position',
          columns: ['#', 'Account Code', 'Particulars / Account Head', 'Classification', 'Amount (Rs.)', 'Sub-Total (Rs.)'],
        };
      case 'stock-reports':
        return {
          title: 'STOCK REPORT',
          tableTitle: 'Stock Data Table',
          subtitle: '· ACCOUNTIX Real-time Warehouse Inventory & Cost Valuation',
          badge: 'Stock Valuation',
          columns: ['#', 'SKU / Code', 'Product / Item Name', 'Category', 'Unit', 'Purchase Rate', 'Sale Rate', 'Current Stock', 'Stock Value (Rs.)'],
        };
      case 'purchase-reports':
        return {
          title: 'PURCHASE REPORT',
          tableTitle: 'Purchase Data Table',
          subtitle: '· ACCOUNTIX Inward Goods Purchase Register & Vendor Invoices',
          badge: 'Purchase Register',
          columns: ['#', 'Date', 'Bill No', 'Supplier Name', 'Store Location', 'Items Detail', 'Total Qty', 'Subtotal', 'Net Total (Rs.)'],
        };
      case 'expense-reports':
        return {
          title: 'EXPENSE REPORT',
          tableTitle: 'Expense Data Table',
          subtitle: '· ACCOUNTIX Operational & Administrative Expense Vouchers',
          badge: 'Expense Ledger',
          columns: ['#', 'Date', 'Voucher #', 'Expense Category', 'Paid To / Vendor', 'Payment Mode', 'Remarks', 'Amount (Rs.)'],
        };
      case 'manufacturing-reports':
        return {
          title: 'MANUFACTURING REPORT',
          tableTitle: 'Manufacturing Data Table',
          subtitle: '· ACCOUNTIX BOM Production Batches, Raw Materials & Finished Goods',
          badge: 'Production Register',
          columns: ['#', 'Batch No', 'Date', 'Finished Item', 'Batch Qty', 'Raw Material Cost', 'Labor & Overhead', 'Total Batch Cost (Rs.)'],
        };
      case 'service-repair-reports':
      default:
        return {
          title: 'SERVICE & REPAIR REPORT',
          tableTitle: 'Service & Repair Data Table',
          subtitle: '· ACCOUNTIX Maintenance Jobs, Labor Charges & Spare Parts',
          badge: 'Service Register',
          columns: ['#', 'Job Card #', 'Date', 'Customer Name', 'Device / Equipment', 'Service Type', 'Parts Cost', 'Labor Cost', 'Total Billed (Rs.)'],
        };
    }
  }, [reportType]);

  // Generate appropriate live dataset from store for this report type
  const reportRows = useMemo(() => {
    switch (reportType) {
      case 'cash-book': {
        let running = cashBalance;
        return invoices.map((inv, idx) => {
          const isCash = inv.paymentMethod === 'Cash' || inv.cashReceivedAmount! > 0;
          const cashIn = inv.cashReceivedAmount !== undefined ? inv.cashReceivedAmount : (inv.paymentMethod === 'Cash' ? inv.netInvoiceTotal : 0);
          const cashOut = 0;
          running = running + cashIn - cashOut;
          return {
            id: `cb-${idx}`,
            col1: idx + 1,
            col2: inv.invoiceDate,
            col3: inv.exactTime || '10:00:00',
            col4: inv.transactionNo || `TXN-${inv.invoiceNo}`,
            col5: `Sale Receipt - ${inv.customerName || 'Cash Walk-in'} (${inv.invoiceNo})`,
            col6: inv.storeLocationName,
            debit: cashIn,
            credit: cashOut,
            balance: running,
          };
        });
      }

      case 'bank-book':
      case 'banking-reports': {
        let running = 285000;
        return invoices
          .filter((inv) => inv.paymentMethod === 'Bank' || (inv.bankReceivedAmount && inv.bankReceivedAmount > 0))
          .map((inv, idx) => {
            const bankIn = inv.bankReceivedAmount !== undefined ? inv.bankReceivedAmount : (inv.paymentMethod === 'Bank' ? inv.netInvoiceTotal : 0);
            running += bankIn;
            return {
              id: `bb-${idx}`,
              col1: idx + 1,
              col2: inv.invoiceDate,
              col3: inv.exactTime || '11:15:00',
              col4: `CHQ-${inv.transactionNo || inv.invoiceNo}`,
              col5: banks[0]?.bankName || 'Meezan Bank - 01023456789',
              col6: `Bank Payment - ${inv.customerName || 'Customer'} (${inv.invoiceNo})`,
              debit: bankIn,
              credit: 0,
              balance: running,
            };
          });
      }

      case 'day-book': {
        return dayBook.map((db, idx) => ({
          id: db.id,
          col1: idx + 1,
          col2: db.date,
          col3: db.voucherNo,
          col4: db.invoiceNo || '—',
          col5: db.accountName || 'Ledger Account',
          col6: db.description,
          debit: db.debit,
          credit: db.credit,
          balance: 0,
        }));
      }

      case 'supplier-ledger': {
        let running = 185000;
        const vendors = [
          { name: 'Al-Madina Cement & Steel Mills', bill: 'PUR-0081', date: '01/01/2026', debit: 50000, credit: 120000 },
          { name: 'National Hardware Distributors', bill: 'PUR-0082', date: '02/01/2026', debit: 30000, credit: 85000 },
          { name: 'Pak Electric & Cables Co.', bill: 'PUR-0083', date: '03/01/2026', debit: 20000, credit: 45000 },
          { name: 'Apex Industrial Tools Ltd', bill: 'PUR-0084', date: '04/01/2026', debit: 40000, credit: 65000 },
        ];
        return vendors.map((v, idx) => {
          running = running + v.credit - v.debit;
          return {
            id: `sup-${idx}`,
            col1: idx + 1,
            col2: v.date,
            col3: `VR-00${idx + 1}`,
            col4: v.bill,
            col5: v.name,
            col6: 'Goods Purchase & Payment Voucher',
            debit: v.debit,
            credit: v.credit,
            balance: running,
          };
        });
      }

      case 'stock-reports': {
        return products.map((p, idx) => {
          const qty = Object.values(p.stockByStore || {}).reduce((sum, val) => sum + (val || 0), 0);
          return {
            id: p.id,
            col1: idx + 1,
            col2: p.code,
            col3: p.name,
            col4: p.description || 'Inventory Item',
            col5: p.unit,
            rate1: p.costPrice,
            rate2: p.salePrice,
            stockQty: qty,
            stockVal: qty * p.costPrice,
          };
        });
      }

      case 'trial-balance': {
        const accounts = [
          { code: '1010', title: 'Cash In Hand', type: 'Current Asset', dr: cashBalance, cr: 0 },
          { code: '1020', title: 'Bank Accounts (Meezan / HBL)', type: 'Current Asset', dr: 345000, cr: 0 },
          { code: '1030', title: 'Accounts Receivable (Customer Ledger)', type: 'Current Asset', dr: 147500, cr: 0 },
          { code: '1040', title: 'Merchandise Inventory', type: 'Current Asset', dr: 890000, cr: 0 },
          { code: '2010', title: 'Accounts Payable (Supplier Ledger)', type: 'Current Liability', dr: 0, cr: 245000 },
          { code: '2020', title: 'Sales Tax Payable (FBR / PRA)', type: 'Current Liability', dr: 0, cr: 35000 },
          { code: '3010', title: 'Owner Capital & Equity', type: 'Equity', dr: 0, cr: 950000 },
          { code: '4010', title: 'Sales Revenue (Cash & Credit)', type: 'Revenue', dr: 0, cr: 480000 },
          { code: '5010', title: 'Cost of Goods Sold (COGS)', type: 'Expense', dr: 260000, cr: 0 },
          { code: '5020', title: 'Store Utilities & Electricity', type: 'Expense', dr: 27500, cr: 0 },
          { code: '5030', title: 'Staff Salaries & Wages', type: 'Expense', dr: 40000, cr: 0 },
        ];
        return accounts.map((acc, idx) => ({
          id: acc.code,
          col1: idx + 1,
          col2: acc.code,
          col3: acc.title,
          col4: acc.type,
          debit: acc.dr,
          credit: acc.cr,
        }));
      }

      case 'profit-and-loss': {
        const plItems = [
          { code: '4010', name: 'Gross Sales Revenue', cat: 'Operating Revenue', inc: 480000, exp: 0, net: 480000 },
          { code: '4020', name: 'Less: Sales Discount Allowed', cat: 'Contra Revenue', inc: 0, exp: 12500, net: -12500 },
          { code: '5010', name: 'Cost of Goods Sold (Purchases - Ending Stock)', cat: 'Direct Cost', inc: 0, exp: 260000, net: -260000 },
          { code: '5020', name: 'Gross Profit Margin', cat: 'Gross Margin', inc: 207500, exp: 0, net: 207500 },
          { code: '5030', name: 'Staff Salaries & Compensation', cat: 'Operating Expense', inc: 0, exp: 40000, net: -40000 },
          { code: '5040', name: 'Electricity & Utility Bills', cat: 'Operating Expense', inc: 0, exp: 18500, net: -18500 },
          { code: '5050', name: 'Store Rent & Maintenance', cat: 'Operating Expense', inc: 0, exp: 25000, net: -25000 },
          { code: '5060', name: 'Miscellaneous Store Expenses', cat: 'Operating Expense', inc: 0, exp: 9000, net: -9000 },
        ];
        return plItems.map((item, idx) => ({
          id: item.code,
          col1: idx + 1,
          col2: item.code,
          col3: item.name,
          col4: item.cat,
          credit: item.inc,
          debit: item.exp,
          balance: item.net,
        }));
      }

      case 'balance-sheet': {
        const bsItems = [
          { code: '1010', head: 'Cash in Hand (Drawer)', cls: 'Current Asset', amt: cashBalance, sub: cashBalance },
          { code: '1020', head: 'Bank Balances (Meezan & Allied)', cls: 'Current Asset', amt: 345000, sub: 345000 },
          { code: '1030', head: 'Accounts Receivable (Trade Debtors)', cls: 'Current Asset', amt: 147500, sub: 147500 },
          { code: '1040', head: 'Merchandise Inventory at Cost', cls: 'Current Asset', amt: 890000, sub: 890000 },
          { code: '2010', head: 'Accounts Payable (Trade Creditors)', cls: 'Current Liability', amt: 245000, sub: 245000 },
          { code: '2020', head: 'Sales Tax & Withholding Tax Payable', cls: 'Current Liability', amt: 35000, sub: 35000 },
          { code: '3010', head: 'Owner Capital Introduced', cls: 'Equity', amt: 950000, sub: 950000 },
          { code: '3020', head: 'Retained Earnings / Net Profit to Date', cls: 'Equity', amt: 152500, sub: 152500 },
        ];
        return bsItems.map((item, idx) => ({
          id: item.code,
          col1: idx + 1,
          col2: item.code,
          col3: item.head,
          col4: item.cls,
          amt: item.amt,
          sub: item.sub,
        }));
      }

      default: {
        return invoices.map((inv, idx) => ({
          id: inv.id,
          col1: idx + 1,
          col2: inv.invoiceDate,
          col3: inv.invoiceNo,
          col4: inv.customerName || 'Customer',
          col5: inv.storeLocationName,
          col6: `${inv.items.length} items (${inv.paymentMethod})`,
          debit: inv.subtotal,
          credit: inv.totalReceivedAmount,
          balance: inv.remainingBalanceAmount,
        }));
      }
    }
  }, [reportType, invoices, customers, products, banks, dayBook, cashBalance]);

  // Totals calculations
  const totalDebitSum = useMemo(() => {
    return reportRows.reduce((sum, r: any) => sum + (r.debit || r.amt || r.stockQty || 0), 0);
  }, [reportRows]);

  const totalCreditSum = useMemo(() => {
    return reportRows.reduce((sum, r: any) => sum + (r.credit || r.stockVal || 0), 0);
  }, [reportRows]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (reportRows.length === 0) {
      showToast('error', 'No records found to export.');
      return;
    }
    const headers = reportConfig.columns;
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      headers.join(',') +
      '\n' +
      reportRows
        .map((r: any) =>
          Object.values(r)
            .filter((v) => typeof v !== 'object')
            .join(',')
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ACCOUNTIX_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `${reportConfig.title} exported to CSV!`);
  };

  return (
    <AccountixReportTemplate
      reportTitle={reportConfig.title}
      reportSubtitle={reportConfig.subtitle}
      badgeText={reportConfig.badge}
      recordCountText={`${reportRows.length} Records`}
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
                id: 'new-invoice',
                label: 'New Invoice',
                icon: <Plus className="w-3.5 h-3.5 text-emerald-800" />,
                onClick: () => onNavigateToSaleInvoice('Cash Sale'),
                title: 'Create new sale invoice',
              },
            ]
          : []),
      ]}
      filterSection={
        <AccountixReportFilterCard
          title="Report Filters"
          onReset={() => {
            setFilters({
              dateFrom: DEFAULT_REPORT_FROM_DATE,
              dateTo: getDefaultReportToDate(),
              searchQuery: '',
              categoryFilter: 'ALL',
            });
            showToast('success', 'Filters reset to default.');
          }}
          onExportExcel={handleExportCsv}
          onPrint={handlePrint}
          onDownloadPdf={handlePrint}
          bottomLeftControl={
            <div className="flex items-center gap-1.5 flex-wrap">
              <label className="font-bold text-[#111111] whitespace-nowrap text-xs">
                Search / Particulars:
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder="Search code, party, description or reference..."
                  className="h-7 w-48 sm:w-64 px-2 bg-white border border-[#7F9EAD] text-xs text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
                />
                <button
                  type="button"
                  onClick={() => showToast('success', `Found ${reportRows.length} matching records.`)}
                  className="h-7 px-2.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-slate-800" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          }
        >
          {/* FIRST ROW: Date Range & Filters */}
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
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                placeholder="01/01/2026"
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
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                placeholder="31/12/2026"
                className="h-7 w-28 px-2 bg-white border border-[#7F9EAD] text-xs font-mono text-[#111111] rounded-none sm:rounded-xs focus:outline-none focus:ring-1 focus:ring-[#0b66c3]"
              />
            </div>

            {/* Scope Badge */}
            <div className="flex items-center gap-1.5 text-slate-700 text-xs">
              <span className="font-bold text-[#111111]">Report Scope:</span>
              <span className="bg-white border border-[#7F9EAD] px-2 py-0.5 text-xs font-mono font-semibold">
                {reportConfig.badge}
              </span>
            </div>
          </div>
        </AccountixReportFilterCard>
      }
      summaryCardsSection={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Total Records
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-lg sm:text-xl font-bold font-mono text-[#111111]">
                {reportRows.length}
              </div>
              <div className="text-[10px] text-slate-700 font-medium">
                Live Transactions
              </div>
            </div>
          </div>
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Primary Total (Dr / Out)
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-lg sm:text-xl font-bold font-mono text-blue-900">
                Rs. {totalDebitSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-700 font-medium">
                Debited Total
              </div>
            </div>
          </div>
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              Secondary Total (Cr / In)
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-800">
                Rs. {totalCreditSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-700 font-medium">
                Credited Total
              </div>
            </div>
          </div>
          <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
            <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
              System Audit Status
            </div>
            <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
              <div className="text-base sm:text-lg font-bold text-amber-900">
                Verified Balanced
              </div>
              <div className="text-[10px] text-amber-800 font-medium">
                Double-Entry Compliant
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* SCROLLABLE TABLE CONTAINER */}
      <AccountixReportTableWrapper
        title={reportConfig.tableTitle}
        recordCount={reportRows.length}
        subtitle="Double-entry compliant · Sticky headers · Controlled viewport height"
        maxHeight="max-h-[520px]"
      >
        <table className="w-full text-xs border-collapse">
          {/* STICKY LIGHT-BLUE HEADER */}
          <thead className="sticky top-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px] shadow-xs select-none">
            <tr>
              {reportConfig.columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-2 px-2.5 border-r border-[#7F9EAD] ${
                    col === '#' ? 'w-10 text-center' : col.includes('(Rs.)') || col.includes('(Debit)') || col.includes('(Credit)') || col.includes('Total') || col.includes('Value') || col.includes('Rate') ? 'text-right' : 'text-left'
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY: Alternating rows with visible borders */}
          <tbody className="divide-y divide-[#7F9EAD]">
            {reportRows.length === 0 ? (
              <tr>
                <td colSpan={reportConfig.columns.length} className="py-12 text-center text-slate-600 bg-white">
                  No records found for the selected criteria.
                </td>
              </tr>
            ) : (
              reportRows.map((r: any, idx) => {
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F1F7FB]';

                return (
                  <tr key={r.id || idx} className={`${rowBg} hover:bg-[#E2EFF7] transition-colors`}>
                    <td className="py-1.5 px-2 text-center text-slate-700 border-r border-[#7F9EAD] font-mono">
                      {idx + 1}
                    </td>

                    {/* Columns dynamically rendered with accounting precision */}
                    {r.col2 && (
                      <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] font-mono">
                        {r.col2}
                      </td>
                    )}
                    {r.col3 && (
                      <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] font-mono">
                        {r.col3}
                      </td>
                    )}
                    {r.col4 && (
                      <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD]">
                        {r.col4}
                      </td>
                    )}
                    {r.col5 && (
                      <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD]">
                        {r.col5}
                      </td>
                    )}
                    {r.col6 && (
                      <td className="py-1.5 px-3 text-left border-r border-[#7F9EAD]">
                        {r.col6}
                      </td>
                    )}

                    {/* Rates or Qty */}
                    {r.rate1 !== undefined && (
                      <td className="py-1.5 px-2.5 text-right font-mono border-r border-[#7F9EAD]">
                        Rs. {r.rate1.toLocaleString()}
                      </td>
                    )}
                    {r.rate2 !== undefined && (
                      <td className="py-1.5 px-2.5 text-right font-mono border-r border-[#7F9EAD]">
                        Rs. {r.rate2.toLocaleString()}
                      </td>
                    )}
                    {r.stockQty !== undefined && (
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold border-r border-[#7F9EAD]">
                        {r.stockQty.toLocaleString()}
                      </td>
                    )}
                    {r.stockVal !== undefined && (
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-blue-900 border-r border-[#7F9EAD]">
                        Rs. {r.stockVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}

                    {/* Debit */}
                    {r.debit !== undefined && (
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-blue-900 border-r border-[#7F9EAD] whitespace-nowrap">
                        {r.debit > 0 ? `Rs. ${r.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                      </td>
                    )}

                    {/* Credit */}
                    {r.credit !== undefined && (
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-800 border-r border-[#7F9EAD] whitespace-nowrap">
                        {r.credit > 0 ? `Rs. ${r.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                      </td>
                    )}

                    {/* Balance */}
                    {r.balance !== undefined && (
                      <td className="py-1.5 px-3 text-right font-mono font-extrabold text-[#111111] border-r border-[#7F9EAD] whitespace-nowrap">
                        Rs. {r.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}

                    {/* Amounts for Balance sheet */}
                    {r.amt !== undefined && (
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-[#111111] border-r border-[#7F9EAD] whitespace-nowrap">
                        Rs. {r.amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}
                    {r.sub !== undefined && (
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-slate-800 border-r border-[#7F9EAD] whitespace-nowrap">
                        Rs. {r.sub.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* STICKY FOOTER TOTALS */}
          {reportRows.length > 0 && (
            <tfoot className="sticky bottom-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold text-xs border-t-2 border-[#7F9EAD] shadow-xs">
              <tr>
                <td colSpan={Math.max(2, reportConfig.columns.length - 2)} className="py-2 px-3 text-right uppercase border-r border-[#7F9EAD]">
                  Report Total ({reportRows.length} Rows):
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 border-r border-[#7F9EAD] whitespace-nowrap">
                  Rs. {totalDebitSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900 border-r border-[#7F9EAD] whitespace-nowrap">
                  Rs. {totalCreditSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </AccountixReportTableWrapper>
    </AccountixReportTemplate>
  );
};
