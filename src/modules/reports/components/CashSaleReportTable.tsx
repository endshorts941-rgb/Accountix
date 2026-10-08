import React, { useState } from 'react';
import { SaleInvoice } from '../../sales/types';
import {
  compareTransactionsChronologicalAscending,
} from '../../../utils/dateUtils';
import {
  Eye,
  Printer,
  Receipt,
  Edit2,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';

interface CashSaleReportTableProps {
  invoices: SaleInvoice[];
  onViewDetails: (invoice: SaleInvoice) => void;
  onEdit: (invoice: SaleInvoice) => void;
  onPrint: (invoice: SaleInvoice) => void;
  onPreviewThermal: (invoice: SaleInvoice) => void;
  onDelete: (invoice: SaleInvoice) => void;
}

export const CashSaleReportTable: React.FC<CashSaleReportTableProps> = ({
  invoices,
  onViewDetails,
  onEdit,
  onPrint,
  onPreviewThermal,
  onDelete,
}) => {
  // Default Sorting: ACCOUNTIX Global Rule: Date Ascending -> Time Ascending -> Txn No Ascending
  const [sortField, setSortField] = useState<string>('invoiceDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (sortField === 'invoiceDate') {
      const cmp = compareTransactionsChronologicalAscending(a, b);
      return sortDirection === 'asc' ? cmp : -cmp;
    }

    let aVal: any = (a as any)[sortField];
    let bVal: any = (b as any)[sortField];

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

    // Tie-breaker: Always Chronological Ascending
    return compareTransactionsChronologicalAscending(a, b);
  });

  // Calculate table totals
  const totalAmountSum = invoices.reduce((sum, inv) => sum + (inv.netInvoiceTotal || 0), 0);
  const totalReceivedSum = invoices.reduce((sum, inv) => {
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
    const tot =
      inv.totalReceivedAmount !== undefined
        ? inv.totalReceivedAmount
        : cashRec + bankRec;
    return sum + tot;
  }, 0);

  return (
    <div className="border border-[#7F9EAD] bg-white rounded-none sm:rounded-xs shadow-2xs overflow-hidden flex flex-col">
      {/* SECTION HEADER: Cash Sale Data Table */}
      <div className="bg-[#B6D9EA] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
            Cash Sale Data Table
          </h2>
          <span className="text-[11px] font-semibold text-[#111111] bg-[#D7EAF5] px-1.5 py-0.2 border border-[#7F9EAD]">
            {invoices.length} {invoices.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>
        <span className="text-[11px] text-slate-700 hidden sm:inline">
          Showing real-time records from ACCOUNTIX database
        </span>
      </div>

      {/* TABLE CONTAINER: Controlled Height Scrollable Desktop Appearance */}
      <div className="overflow-x-auto overflow-y-auto max-h-[520px] min-h-[260px] [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#E2EFF7] relative">
        <table className="w-full text-xs border-collapse">
          {/* TABLE HEADER: Sticky Light Blue, Black Bold text, thin gray-blue borders */}
          <thead className="sticky top-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[11px] shadow-xs">
            <tr>
              <th className="py-1.5 px-2 w-10 text-center border-r border-[#7F9EAD]">#</th>
              <th
                onClick={() => handleSort('invoiceDate')}
                className="py-1.5 px-2.5 w-28 text-center border-r border-[#7F9EAD] cursor-pointer hover:bg-[#A3CEE2]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-700" />
                </div>
              </th>
              <th
                onClick={() => handleSort('invoiceNo')}
                className="py-1.5 px-2.5 w-28 text-left border-r border-[#7F9EAD] cursor-pointer hover:bg-[#A3CEE2]"
              >
                <div className="flex items-center gap-1">
                  <span>Invoice No</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-700" />
                </div>
              </th>
              <th
                onClick={() => handleSort('customerName')}
                className="py-1.5 px-3 text-left border-r border-[#7F9EAD] cursor-pointer hover:bg-[#A3CEE2]"
              >
                <div className="flex items-center gap-1">
                  <span>Customer Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-700" />
                </div>
              </th>
              <th
                onClick={() => handleSort('paymentMethod')}
                className="py-1.5 px-2.5 w-36 text-left border-r border-[#7F9EAD] cursor-pointer hover:bg-[#A3CEE2]"
              >
                <div className="flex items-center gap-1">
                  <span>Payment Method</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-700" />
                </div>
              </th>
              <th
                onClick={() => handleSort('netInvoiceTotal')}
                className="py-1.5 px-3 w-40 text-right border-r border-[#7F9EAD] cursor-pointer hover:bg-[#A3CEE2]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Amount (Rs.)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-700" />
                </div>
              </th>
              <th className="py-1.5 px-3 w-40 text-right border-r border-[#7F9EAD]">
                Received Amount (Rs.)
              </th>
              <th className="py-1.5 px-2 w-28 text-center border-r border-[#7F9EAD]">
                Status
              </th>
              <th className="py-1.5 px-2 w-24 text-center">
                Action
              </th>
            </tr>
          </thead>

          {/* TABLE BODY: subtle alternating rows, thin gray-blue borders */}
          <tbody className="divide-y divide-[#7F9EAD]">
            {sortedInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-600 bg-white">
                  No cash sale transactions found matching the selected filters.
                </td>
              </tr>
            ) : (
              sortedInvoices.map((inv, idx) => {
                // Determine received amount
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

                const isPaid = rem <= 0 || inv.status === 'PAID IN FULL';
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F1F7FB]';

                return (
                  <tr
                    key={inv.id || inv.invoiceNo}
                    className={`${rowBg} hover:bg-[#E2EFF7] transition-colors`}
                  >
                    {/* # Column */}
                    <td className="py-1.5 px-2 text-center text-slate-700 border-r border-[#7F9EAD] font-mono">
                      {idx + 1}
                    </td>

                    {/* Date: Centered */}
                    <td className="py-1.5 px-2.5 text-center text-[#111111] border-r border-[#7F9EAD] font-mono whitespace-nowrap">
                      <div>{inv.invoiceDate}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{inv.exactTime || '10:00:00'}</div>
                    </td>

                    {/* Invoice No: Left aligned */}
                    <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewDetails(inv)}
                        className="font-mono font-bold text-[#0b66c3] hover:underline cursor-pointer"
                        title="View Transaction Details"
                      >
                        {inv.invoiceNo}
                      </button>
                    </td>

                    {/* Customer Name: Left aligned */}
                    <td className="py-1.5 px-3 text-left border-r border-[#7F9EAD]">
                      <span className="font-medium text-[#111111]">
                        {inv.customerName?.trim() ? inv.customerName : 'Walk-in'}
                      </span>
                    </td>

                    {/* Payment Method: Left aligned */}
                    <td className="py-1.5 px-2.5 text-left border-r border-[#7F9EAD] text-slate-800 whitespace-nowrap">
                      {inv.paymentMethod}
                    </td>

                    {/* Total Amount (Rs.): Right aligned */}
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-[#111111] border-r border-[#7F9EAD] whitespace-nowrap">
                      Rs. {inv.netInvoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Received Amount (Rs.): Right aligned */}
                    <td className="py-1.5 px-3 text-right font-mono font-semibold text-emerald-800 border-r border-[#7F9EAD] whitespace-nowrap">
                      Rs. {totRec.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status: Centered or neatly styled badge */}
                    <td className="py-1 px-2 text-center border-r border-[#7F9EAD] whitespace-nowrap">
                      {isPaid ? (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-bold bg-[#E8F8EC] text-emerald-900 border border-emerald-400 rounded-none sm:rounded-xs">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-bold bg-[#FFF9E6] text-amber-900 border border-amber-400 rounded-none sm:rounded-xs">
                          Partially Paid
                        </span>
                      )}
                    </td>

                    {/* Row Actions: View, Thermal, Print, Edit, Delete */}
                    <td className="py-1 px-1.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => onViewDetails(inv)}
                          className="p-1 text-blue-700 hover:bg-[#D7EAF5] rounded-xs transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPreviewThermal(inv)}
                          className="p-1 text-slate-700 hover:bg-[#D7EAF5] rounded-xs transition-colors cursor-pointer"
                          title="Thermal Slip (POS)"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrint(inv)}
                          className="p-1 text-slate-700 hover:bg-[#D7EAF5] rounded-xs transition-colors cursor-pointer"
                          title="Print A4"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(inv)}
                          className="p-1 text-blue-800 hover:bg-[#D7EAF5] rounded-xs transition-colors cursor-pointer"
                          title="Edit Transaction (Audit Log)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(inv)}
                          className="p-1 text-red-700 hover:bg-[#FCDADF] rounded-xs transition-colors cursor-pointer"
                          title="Delete Transaction"
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

          {/* TABLE TOTALS FOOTER ROW: Sticky Light Blue with thin gray-blue border */}
          {sortedInvoices.length > 0 && (
            <tfoot className="sticky bottom-0 z-10 bg-[#B6D9EA] text-[#111111] font-bold text-xs border-t-2 border-[#7F9EAD] shadow-xs">
              <tr>
                <td colSpan={5} className="py-2 px-3 text-right uppercase border-r border-[#7F9EAD]">
                  Total ({sortedInvoices.length} Transactions):
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-[#111111] border-r border-[#7F9EAD] whitespace-nowrap">
                  Rs. {totalAmountSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900 border-r border-[#7F9EAD] whitespace-nowrap">
                  Rs. {totalReceivedSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan={2} className="py-2 px-3 text-center text-slate-700 font-mono text-[11px]">
                  Balance: Rs. {Math.max(0, totalAmountSum - totalReceivedSum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
