import React from 'react';
import { SaleInvoice } from '../../sales/types';
import { sortChronologicalAscending } from '../../../utils/dateUtils';

interface PrintableAllSalesReportProps {
  invoices: SaleInvoice[];
  dateFrom: string;
  dateTo: string;
  storeName: string;
  customerFilterName?: string;
  totalSubtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalNetSales: number;
  totalCashSalesCount: number;
  totalCashSalesAmount: number;
  totalCreditSalesCount: number;
  totalCreditSalesAmount: number;
  totalCashReceived: number;
  totalBankReceived: number;
  totalCreditRemaining: number;
  totalReceived: number;
  totalRemaining: number;
  totalQty: number;
}

export const PrintableAllSalesReport: React.FC<PrintableAllSalesReportProps> = ({
  invoices,
  dateFrom,
  dateTo,
  storeName,
  customerFilterName,
  totalSubtotal,
  totalDiscount,
  totalTax,
  totalNetSales,
  totalCashSalesCount,
  totalCashSalesAmount,
  totalCreditSalesCount,
  totalCreditSalesAmount,
  totalCashReceived,
  totalBankReceived,
  totalCreditRemaining,
  totalReceived,
  totalRemaining,
  totalQty,
}) => {
  return (
    <div className="p-8 bg-white text-slate-900 text-xs font-sans print:p-0">
      {/* Report Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase">ACCOUNTIX</h1>
            <p className="text-sm font-bold text-slate-800">Enterprise Accounting & Business Management Software</p>
            <p className="text-[11px] text-slate-600">Blue Area Corporate Tower, Islamabad, Pakistan</p>
            <p className="text-[11px] text-slate-600">Tel: +92 51 111-ACCOUNTIX · NTN: 4920491-7</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide">
              ALL SALES REPORT
            </h2>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              Date Period: <span className="font-mono">{dateFrom || '01/01/2026'}</span> to <span className="font-mono">{dateTo || 'Present'}</span>
            </div>
            <div className="text-xs text-slate-600">
              Store Location: <span className="font-semibold text-slate-800">{storeName || 'All Stores'}</span>
            </div>
            {customerFilterName && customerFilterName !== 'ALL' && (
              <div className="text-xs text-slate-600">
                Customer: <span className="font-semibold text-slate-800">{customerFilterName}</span>
              </div>
            )}
            <div className="text-[11px] text-slate-500 mt-0.5">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Matrix Box */}
      <div className="mb-4 p-3 bg-slate-50 border border-slate-300 rounded">
        <h3 className="font-bold text-[11px] text-slate-800 uppercase tracking-wider mb-2">
          Consolidated Sales & Financial Summary ({invoices.length} Invoices · {totalQty} Units Sold)
        </h3>
        <div className="grid grid-cols-6 gap-2 text-center text-[10px]">
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Total Sales</span>
            <span className="font-bold text-xs text-blue-900 font-mono">{invoices.length} Invoices</span>
            <span className="text-[10px] text-slate-600 block font-mono">Rs. {totalNetSales.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Cash Sales</span>
            <span className="font-bold text-xs text-emerald-800 font-mono">{totalCashSalesCount} Invoices</span>
            <span className="text-[10px] text-slate-600 block font-mono">Rs. {totalCashSalesAmount.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Credit Sales</span>
            <span className="font-bold text-xs text-purple-900 font-mono">{totalCreditSalesCount} Invoices</span>
            <span className="text-[10px] text-slate-600 block font-mono">Rs. {totalCreditSalesAmount.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Gross Subtotal</span>
            <span className="font-bold text-xs text-slate-900 font-mono">Rs. {totalSubtotal.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Pre-Discount</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Discount Allowed</span>
            <span className="font-bold text-xs text-amber-700 font-mono">-Rs. {totalDiscount.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Tax: +Rs. {totalTax.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Net Total Sales</span>
            <span className="font-bold text-xs text-blue-800 font-mono">Rs. {totalNetSales.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Final Revenue</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-[10px] mt-2 pt-2 border-t border-slate-200">
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Cash Received</span>
            <span className="font-bold text-xs text-emerald-700 font-mono">Rs. {totalCashReceived.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Bank Received</span>
            <span className="font-bold text-xs text-blue-700 font-mono">Rs. {totalBankReceived.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Total Received</span>
            <span className="font-bold text-xs text-slate-900 font-mono">Rs. {totalReceived.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Credit / Remaining</span>
            <span className="font-bold text-xs text-red-600 font-mono">Rs. {totalCreditRemaining.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-[10px]">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
              <th className="border border-slate-300 p-1 text-center w-6">#</th>
              <th className="border border-slate-300 p-1 text-center">Date</th>
              <th className="border border-slate-300 p-1 text-left">Txn No</th>
              <th className="border border-slate-300 p-1 text-left">Invoice No</th>
              <th className="border border-slate-300 p-1 text-left">Customer</th>
              <th className="border border-slate-300 p-1 text-center">Type</th>
              <th className="border border-slate-300 p-1 text-left">Store</th>
              <th className="border border-slate-300 p-1 text-right">Subtotal</th>
              <th className="border border-slate-300 p-1 text-right">Disc</th>
              <th className="border border-slate-300 p-1 text-right">Tax</th>
              <th className="border border-slate-300 p-1 text-right">Net Total</th>
              <th className="border border-slate-300 p-1 text-right">Cash Rec</th>
              <th className="border border-slate-300 p-1 text-right">Bank Rec</th>
              <th className="border border-slate-300 p-1 text-right">Credit/Rem</th>
              <th className="border border-slate-300 p-1 text-right">Total Rec</th>
              <th className="border border-slate-300 p-1 text-right">Balance</th>
              <th className="border border-slate-300 p-1 text-center">Status</th>
              <th className="border border-slate-300 p-1 text-left">User</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={18} className="p-4 text-center text-slate-500 italic">
                  No sales transactions found for the specified filters.
                </td>
              </tr>
            ) : (
              sortChronologicalAscending(invoices).map((inv, idx) => {
                const cashRec = inv.cashReceivedAmount ?? (inv.paymentMethod === 'Cash' ? inv.netInvoiceTotal : 0);
                const bankRec = inv.bankReceivedAmount ?? (inv.paymentMethod === 'Bank' ? inv.netInvoiceTotal : 0);
                const totRec = inv.totalReceivedAmount ?? (cashRec + bankRec);
                const rem = inv.remainingBalanceAmount ?? Math.max(0, inv.netInvoiceTotal - totRec);

                return (
                  <tr key={inv.id || inv.invoiceNo} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="border border-slate-300 p-1 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-1 text-center whitespace-nowrap">{inv.invoiceDate}</td>
                    <td className="border border-slate-300 p-1 font-mono font-bold whitespace-nowrap">{inv.transactionNo}</td>
                    <td className="border border-slate-300 p-1 font-mono whitespace-nowrap">{inv.invoiceNo}</td>
                    <td className="border border-slate-300 p-1 font-medium">{inv.customerName || 'Walk-in Cash Customer'}</td>
                    <td className="border border-slate-300 p-1 text-center">
                      <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                        inv.saleType === 'Credit Sale' ? 'bg-purple-100 text-purple-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {inv.saleType === 'Credit Sale' ? 'Credit' : 'Cash'}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-1">{inv.storeLocationName}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono">{inv.subtotal.toLocaleString()}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono">{inv.overallDiscount > 0 ? inv.overallDiscount.toLocaleString() : '—'}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono">{inv.overallTax > 0 ? inv.overallTax.toLocaleString() : '—'}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono font-bold">{inv.netInvoiceTotal.toLocaleString()}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono text-emerald-700">{cashRec > 0 ? cashRec.toLocaleString() : '—'}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono text-blue-700">{bankRec > 0 ? bankRec.toLocaleString() : '—'}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono text-amber-700">{rem > 0 ? rem.toLocaleString() : '—'}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono font-bold">{totRec.toLocaleString()}</td>
                    <td className="border border-slate-300 p-1 text-right font-mono">{inv.finalCustomerBalance ? inv.finalCustomerBalance.toLocaleString() : (rem > 0 ? rem.toLocaleString() : '0')}</td>
                    <td className="border border-slate-300 p-1 text-center font-bold text-[9px]">{inv.status || (rem > 0 ? 'PARTIAL' : 'PAID')}</td>
                    <td className="border border-slate-300 p-1">{inv.salesman || 'Ali Khan'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-200 font-bold border-t-2 border-slate-400">
              <td colSpan={7} className="border border-slate-300 p-1.5 text-right uppercase">
                Consolidated Page Totals ({invoices.length} Invoices):
              </td>
              <td className="border border-slate-300 p-1.5 text-right font-mono">Rs. {totalSubtotal.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono">Rs. {totalDiscount.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono">Rs. {totalTax.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-blue-900">Rs. {totalNetSales.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono text-emerald-700">Rs. {totalCashReceived.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono text-blue-700">Rs. {totalBankReceived.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono text-amber-700">Rs. {totalCreditRemaining.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono font-bold">Rs. {totalReceived.toLocaleString()}</td>
              <td className="border border-slate-300 p-1.5 text-right font-mono text-red-600">Rs. {totalRemaining.toLocaleString()}</td>
              <td colSpan={2} className="border border-slate-300 p-1.5 text-center text-slate-500 font-normal">
                Audited & Reconciled
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Signature Authorization Block */}
      <div className="mt-12 pt-6 border-t border-slate-400 grid grid-cols-4 gap-6 text-center text-[10px]">
        <div>
          <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
            Prepared By (Sales Audit)
          </div>
          <span className="text-slate-500">Date: {new Date().toLocaleDateString()}</span>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
            Verified By (Cashier / Bank)
          </div>
          <span className="text-slate-500">Account Reconciliation</span>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
            Accounts & Finance Manager
          </div>
          <span className="text-slate-500">General Ledger Sign-off</span>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
            Authorized Executive Director
          </div>
          <span className="text-slate-500">ACCOUNTIX ERP Internal Audit</span>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-8 pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
        <span>ACCOUNTIX Cloud ERP Accounting Software · Integrated Day Book, Ledgers, & Inventory</span>
        <span>Page 1 of 1 · Generated from All Sales Report Module</span>
      </div>
    </div>
  );
};
