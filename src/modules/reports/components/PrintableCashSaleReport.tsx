import React from 'react';
import { SaleInvoice } from '../../sales/types';
import { sortChronologicalAscending } from '../../../utils/dateUtils';

interface PrintableCashSaleReportProps {
  invoices: SaleInvoice[];
  dateFrom: string;
  dateTo: string;
  storeName: string;
  totalSubtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalNetSales: number;
  totalCashReceived: number;
  totalBankReceived: number;
  totalReceived: number;
  totalRemaining: number;
  totalQty: number;
}

export const PrintableCashSaleReport: React.FC<PrintableCashSaleReportProps> = ({
  invoices,
  dateFrom,
  dateTo,
  storeName,
  totalSubtotal,
  totalDiscount,
  totalTax,
  totalNetSales,
  totalCashReceived,
  totalBankReceived,
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
            <p className="text-sm font-bold text-slate-800">Enterprise Accounting & ERP Solutions</p>
            <p className="text-[11px] text-slate-600">Plot 42, Blue Area Corporate District, Islamabad, Pakistan</p>
            <p className="text-[11px] text-slate-600">Tel: +92 51 111-ACCOUNTIX · NTN: 4920491-7</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide">
              CASH SALE REPORT
            </h2>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              Date Period: <span className="font-mono">{dateFrom || '01/01/2026'}</span> to <span className="font-mono">{dateTo || 'Present'}</span>
            </div>
            <div className="text-xs text-slate-600">
              Store Location: <span className="font-semibold text-slate-800">{storeName || 'All Stores'}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Generated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Matrix Box */}
      <div className="mb-4 p-3 bg-slate-50 border border-slate-300 rounded">
        <h3 className="font-bold text-[11px] text-slate-800 uppercase tracking-wider mb-2">
          Financial & Transaction Summary ({invoices.length} Invoices · {totalQty} Units Sold)
        </h3>
        <div className="grid grid-cols-6 gap-2 text-center text-[10px]">
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Total Invoices</span>
            <span className="font-bold text-xs text-slate-900 font-mono">{invoices.length}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Total Qty Sold</span>
            <span className="font-bold text-xs text-slate-900 font-mono">{totalQty}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Gross Subtotal</span>
            <span className="font-bold text-xs text-slate-900 font-mono">Rs. {totalSubtotal.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Total Discount</span>
            <span className="font-bold text-xs text-red-600 font-mono">Rs. {totalDiscount.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-white border border-slate-200 rounded">
            <span className="text-slate-500 block">Total Tax</span>
            <span className="font-bold text-xs text-slate-900 font-mono">Rs. {totalTax.toLocaleString()}</span>
          </div>
          <div className="p-1.5 bg-blue-50 border border-blue-200 rounded">
            <span className="text-blue-700 font-bold block">Net Cash Sales</span>
            <span className="font-extrabold text-xs text-blue-900 font-mono">Rs. {totalNetSales.toLocaleString()}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] mt-2 pt-2 border-t border-slate-200">
          <div>
            <span className="text-slate-500">Cash Received:</span>
            <span className="font-bold font-mono text-slate-900 ml-1">Rs. {totalCashReceived.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500">Bank Received:</span>
            <span className="font-bold font-mono text-slate-900 ml-1">Rs. {totalBankReceived.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-emerald-700 font-bold">Total Received:</span>
            <span className="font-extrabold font-mono text-emerald-800 ml-1">Rs. {totalReceived.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-red-600 font-bold">Total Remaining:</span>
            <span className="font-extrabold font-mono text-red-700 ml-1">Rs. {totalRemaining.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
            <th className="py-1 px-1.5 border-r border-slate-300 w-6 text-center">#</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16">Txn No</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16">Inv No</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16">Date</th>
            <th className="py-1 px-1.5 border-r border-slate-300">Customer</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16">Store</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-8 text-center">Qty</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16 text-right">Subtotal</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-14 text-right">Disc</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-14 text-right">Tax</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-18 text-right font-bold">Net Total</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16 text-right">Cash Recv</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16 text-right">Bank Recv</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-16 text-right font-bold">Total Recv</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-14 text-right">Baqaya</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-14">Mode</th>
            <th className="py-1 px-1.5 border-r border-slate-300 w-14">Salesman</th>
            <th className="py-1 px-1.5 w-12 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortChronologicalAscending(invoices).map((inv, idx) => {
            const qty = inv.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const cashRec = inv.cashReceivedAmount ?? (inv.paymentMethod === 'Cash' ? inv.netInvoiceTotal : 0);
            const bankRec = inv.bankReceivedAmount ?? (inv.paymentMethod === 'Bank' ? inv.netInvoiceTotal : 0);
            const totRec = inv.totalReceivedAmount ?? (cashRec + bankRec);
            const rem = inv.remainingBalanceAmount ?? Math.max(0, inv.netInvoiceTotal - totRec);

            return (
              <tr key={inv.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="py-1 px-1.5 border-r border-slate-300 text-center font-mono text-slate-500">
                  {idx + 1}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 font-mono font-medium">
                  {inv.transactionNo || 'TXN-' + inv.invoiceNo}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 font-mono font-bold text-slate-900">
                  {inv.invoiceNo}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 font-mono text-slate-700">
                  {inv.invoiceDate}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 font-medium truncate max-w-[120px]">
                  {inv.customerName || 'Walk-in Cash Customer'}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 truncate max-w-[70px]">
                  {inv.storeLocationName}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-center font-mono">
                  {qty}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono">
                  {inv.subtotal.toLocaleString()}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono text-slate-600">
                  {inv.overallDiscount > 0 ? inv.overallDiscount.toLocaleString() : '0'}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono text-slate-600">
                  {inv.overallTax > 0 ? inv.overallTax.toLocaleString() : '0'}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                  {inv.netInvoiceTotal.toLocaleString()}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono text-slate-800">
                  {cashRec.toLocaleString()}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono text-slate-800">
                  {bankRec.toLocaleString()}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono font-bold text-emerald-800">
                  {totRec.toLocaleString()}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 text-right font-mono text-red-600">
                  {rem.toLocaleString()}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 truncate">
                  {inv.paymentMethod}
                </td>
                <td className="py-1 px-1.5 border-r border-slate-300 truncate">
                  {inv.salesman || 'Ali Khan'}
                </td>
                <td className="py-1 px-1.5 text-center font-semibold text-[9px]">
                  {inv.status}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-200 font-bold border-t-2 border-slate-400 text-[10px]">
            <td colSpan={6} className="py-1.5 px-2 text-right border-r border-slate-300">
              TOTALS ({invoices.length} Invoices):
            </td>
            <td className="py-1.5 px-1.5 text-center border-r border-slate-300 font-mono">
              {totalQty}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono">
              {totalSubtotal.toLocaleString()}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono">
              {totalDiscount.toLocaleString()}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono">
              {totalTax.toLocaleString()}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono font-black text-blue-900">
              {totalNetSales.toLocaleString()}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono">
              {totalCashReceived.toLocaleString()}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono">
              {totalBankReceived.toLocaleString()}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono font-black text-emerald-900">
              {totalReceived.toLocaleString()}
            </td>
            <td className="py-1.5 px-1.5 text-right border-r border-slate-300 font-mono text-red-600">
              {totalRemaining.toLocaleString()}
            </td>
            <td colSpan={3} className="py-1.5 px-2"></td>
          </tr>
        </tfoot>
      </table>

      {/* Signature Authorization Block */}
      <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-[11px] text-slate-700">
        <div>
          <div className="border-b border-slate-400 pb-8"></div>
          <span className="font-bold block mt-1">Prepared By (Cashier)</span>
          <span className="text-[10px] text-slate-500">ACCOUNTIX Terminal</span>
        </div>
        <div>
          <div className="border-b border-slate-400 pb-8"></div>
          <span className="font-bold block mt-1">Verified By (Accountant)</span>
          <span className="text-[10px] text-slate-500">Day Book Checked</span>
        </div>
        <div>
          <div className="border-b border-slate-400 pb-8"></div>
          <span className="font-bold block mt-1">Authorized By (Audit Officer)</span>
          <span className="text-[10px] text-slate-500">Internal Audit Compliance</span>
        </div>
      </div>
    </div>
  );
};
