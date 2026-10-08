import React, { useState } from 'react';
import { Customer, CustomerLedgerEntry, SaleInvoice } from '../types';
import { salesStore } from '../salesStore';
import {
  sortChronologicalAscending,
  compareTransactionsChronologicalAscending,
} from '../../../utils/dateUtils';
import {
  X,
  BookOpen,
  User,
  Printer,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  Phone,
  MapPin,
  ShieldAlert,
} from 'lucide-react';

interface CustomerLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  customers: Customer[];
  onViewTransactionDetails?: (invoice: SaleInvoice) => void;
}

export const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customers,
  onViewTransactionDetails,
}) => {
  const [selectedCustId, setSelectedCustId] = useState<string>(
    customerId || (customers.length > 0 ? customers[0].id : '')
  );

  if (!isOpen) return null;

  const currentCustomer = customers.find((c) => c.id === selectedCustId);
  const rawLedgerEntries = salesStore
    .getCustomerLedgers()
    .filter((entry) => entry.customerId === selectedCustId);

  // ACCOUNTIX Global Rule: All ledgers follow chronological Ascending Order:
  // Opening Balance -> Oldest Transaction -> Next -> Latest
  const sortedRawEntries = sortChronologicalAscending(rawLedgerEntries);

  // Compute Running Balance chronologically:
  // Opening Balance + First Transaction = Running Balance; + Second Transaction = Running Balance...
  let runningBal = 0;
  const ledgerEntries = sortedRawEntries.map((entry) => {
    const debit = entry.debit || 0;
    const credit = entry.credit || 0;
    runningBal = runningBal + debit - credit;
    return {
      ...entry,
      balance: runningBal,
    };
  });

  // Totals for this customer ledger
  const totalDebit = ledgerEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = ledgerEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
  const outstandingReceivable = currentCustomer ? currentCustomer.previousBalance : 0;

  const handlePrintLedger = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (ledgerEntries.length === 0) return;

    const headers = [
      'Date',
      'Txn No',
      'Invoice No',
      'Description',
      'Debit (PKR)',
      'Credit (PKR)',
      'Balance (PKR)',
      'Store Location',
      'Payment Method',
    ];

    const rows = ledgerEntries.map((e) => [
      `"${e.date}"`,
      `"${e.transactionNo || ''}"`,
      `"${e.invoiceNo}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.debit,
      e.credit,
      e.balance,
      `"${e.storeLocationName || 'Main Store'}"`,
      `"${e.paymentMethod || 'Cash'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Customer_Ledger_${currentCustomer?.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#B6D9EA] px-4 py-2.5 text-[#111111] border-b border-[#7F9EAD] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#D7EAF5] border border-[#7F9EAD] rounded-xs">
              <BookOpen className="w-4 h-4 text-blue-900" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wide text-[#111111]">
                Customer Ledger Statement (Accounts Receivable)
              </h3>
              <p className="text-[10px] text-slate-700">
                Official ACCOUNTIX Double-Entry Customer Statement & Transaction Trail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrintLedger}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xs bg-[#D7EAF5] hover:bg-[#C5DEF0] text-[#111111] border border-[#7F9EAD] shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-900" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xs bg-[#D7EAF5] hover:bg-[#C5DEF0] text-[#111111] border border-[#7F9EAD] shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xs text-slate-600 hover:text-[#111111] hover:bg-[#C5DEF0] transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Selector & Profile Header Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Customer Select */}
            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Select Customer Account:
              </label>
              <div className="relative">
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-md border border-slate-300 py-1.5 pl-2.5 pr-8 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Due: Rs. {c.previousBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Metrics */}
            {currentCustomer && (
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Receivable Balance */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                    Customer Receivable
                  </span>
                  <span className="text-sm font-black font-mono text-red-600">
                    Rs. {outstandingReceivable.toLocaleString()}
                  </span>
                </div>

                {/* Credit Limit */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                    Credit Limit
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-800">
                    Rs. {(currentCustomer.creditLimit || 0).toLocaleString()}
                  </span>
                </div>

                {/* Supplier Payable (Separate Party Logic - Requirement #9) */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                    Supplier Payable
                  </span>
                  <span className="text-xs font-semibold font-mono text-amber-700">
                    {currentCustomer.isSupplier
                      ? `Rs. ${(currentCustomer.supplierPayableBalance || 0).toLocaleString()}`
                      : 'N/A (Customer Only)'}
                  </span>
                </div>

                {/* Contact */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs truncate">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                    Contact / Phone
                  </span>
                  <span className="text-xs text-slate-700 font-mono">
                    {currentCustomer.phone || 'No Phone'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ledger Table: Controlled Height Scrollable */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-4 max-h-[500px] min-h-[260px] [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#E2EFF7] relative">
          <table className="w-full text-left text-xs border-collapse border border-[#7F9EAD]">
            <thead className="sticky top-0 bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px] z-10 shadow-xs select-none">
              <tr>
                <th className="py-2 px-2.5 w-8 text-center border-r border-[#7F9EAD]">#</th>
                <th className="py-2 px-2.5 w-24 border-r border-[#7F9EAD]">Date</th>
                <th className="py-2 px-2.5 w-28 border-r border-[#7F9EAD]">Txn / Inv No</th>
                <th className="py-2 px-3 border-r border-[#7F9EAD]">Description & Transaction Details</th>
                <th className="py-2 px-2.5 w-24 text-right border-r border-[#7F9EAD] text-blue-900 font-bold">
                  Debit (Rs.)
                </th>
                <th className="py-2 px-2.5 w-24 text-right border-r border-[#7F9EAD] text-emerald-800 font-bold">
                  Credit (Rs.)
                </th>
                <th className="py-2 px-2.5 w-28 text-right border-r border-[#7F9EAD] font-extrabold text-[#111111]">
                  Balance (Rs.)
                </th>
                <th className="py-2 px-2.5 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                    <p className="font-semibold text-xs text-slate-600">No ledger entries recorded yet for this customer.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Record a Credit Sale invoice to see automatic debits, credits, and live balance.
                    </p>
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((entry, idx) => {
                  const linkedInvoice = salesStore.getInvoices().find(
                    (inv) => inv.invoiceNo === entry.invoiceNo
                  );

                  return (
                    <tr key={entry.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-2.5 text-center font-mono text-slate-400 border-r border-slate-100 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-slate-700 border-r border-slate-100 text-[11px]">
                        <div>{entry.date}</div>
                        {entry.exactTime && (
                          <div className="text-[10px] text-slate-400 font-mono">{entry.exactTime}</div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-100">
                        <div className="font-mono font-bold text-blue-700 text-xs">
                          {entry.invoiceNo}
                        </div>
                        {entry.transactionNo && (
                          <span className="font-mono text-[10px] text-slate-500 block">
                            {entry.transactionNo}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-100">
                        <div className="text-slate-800 font-medium leading-relaxed">
                          {entry.description}
                        </div>
                        {entry.storeLocationName && (
                          <div className="text-[10px] text-slate-500 mt-0.5 space-x-1.5">
                            <span>Location: {entry.storeLocationName}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">Method: {entry.paymentMethod || 'Credit'}</span>
                            {(entry.cashReceived || 0) > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-mono font-medium">Cash: Rs. {entry.cashReceived?.toLocaleString()}</span>
                              </>
                            )}
                            {(entry.bankReceived || 0) > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-blue-700 font-mono font-medium">Bank: Rs. {entry.bankReceived?.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900 border-r border-slate-100">
                        {entry.debit > 0 ? entry.debit.toLocaleString() : '—'}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-700 border-r border-slate-100">
                        {entry.credit > 0 ? entry.credit.toLocaleString() : '—'}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-black text-blue-900 border-r border-slate-100">
                        Rs. {entry.balance.toLocaleString()}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        {linkedInvoice && onViewTransactionDetails ? (
                          <button
                            type="button"
                            onClick={() => {
                              onViewTransactionDetails(linkedInvoice);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            title="Show Transaction Details (Complete Line-Item Breakdown)"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {ledgerEntries.length > 0 && (
              <tfoot className="sticky bottom-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold text-xs border-t-2 border-[#7F9EAD] shadow-xs">
                <tr>
                  <td colSpan={4} className="py-2 px-3 text-right uppercase border-r border-[#7F9EAD]">
                    Customer Ledger Totals:
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-blue-900 border-r border-[#7F9EAD] whitespace-nowrap">
                    Rs. {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-emerald-800 border-r border-[#7F9EAD] whitespace-nowrap">
                    Rs. {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-black text-red-900 border-r border-[#7F9EAD] whitespace-nowrap">
                    Rs. {outstandingReceivable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2.5 text-center text-slate-700 text-[10px]">Net Due</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Customer Receivable updates automatically upon every Credit Sale or Payment voucher.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
