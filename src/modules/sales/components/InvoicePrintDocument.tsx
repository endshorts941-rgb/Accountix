import React from 'react';
import { SaleInvoice } from '../types';
import { formatToDDMMYYYY } from '../../../utils/dateUtils';

interface InvoicePrintDocumentProps {
  invoice: SaleInvoice;
}

export const InvoicePrintDocument: React.FC<InvoicePrintDocumentProps> = ({ invoice }) => {
  const isCashSale = invoice.saleType === 'Cash Sale';

  return (
    <div className="accountix-printable-area bg-white text-slate-900 p-8 max-w-[800px] mx-auto text-xs leading-normal font-sans border border-slate-200 print:border-0 shadow-sm print:shadow-none print:p-0">
      {/* 1. Header with Logo & Business Info */}
      <div className="flex justify-between items-start border-b-2 border-blue-900 pb-5 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-800 text-white flex items-center justify-center font-bold text-lg font-mono">
              A
            </div>
            <span className="text-2xl font-black tracking-tight text-blue-950 font-sans">
              ACCOUNTIX
            </span>
          </div>
          <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">
            Complete Accounting & Business Management Software
          </p>
          <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
            <p>Corporate Office: Plot 42, Blue Area, Sector F-6, Islamabad, Pakistan</p>
            <p>Phone: +92 (51) 844-9200 · Email: billing@accountix.pk · Web: www.accountix.pk</p>
            <p>NTN: 8291039-4 · STRN / Sales Tax Reg: 32778761-001</p>
          </div>
        </div>

        {/* Invoice Title & Meta */}
        <div className="text-right space-y-1">
          <h1 className="text-xl font-bold uppercase tracking-wider text-blue-900">
            {invoice.saleType.toUpperCase()} INVOICE
          </h1>
          <div className="inline-block bg-slate-100 rounded px-2.5 py-1 text-slate-800 font-mono font-bold text-xs border border-slate-200">
            {invoice.invoiceNo}
          </div>
          <div className="text-[11px] text-slate-600">
            <span>Date: </span>
            <span className="font-semibold text-slate-900">{formatToDDMMYYYY(invoice.invoiceDate)}</span>
          </div>
          <div className="text-[11px] text-slate-600">
            <span>Exact Time: </span>
            <span className="font-semibold text-slate-900 font-mono">{invoice.exactTime || '10:00:00'}</span>
          </div>
          <div className="text-[10px] text-slate-500">
            <span>Store: </span>
            <span className="font-medium text-slate-800">{invoice.storeLocationName}</span>
          </div>
        </div>
      </div>

      {/* 2. Bill To & Payment Method Info */}
      <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-slate-200 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Bill To (Customer Details)
          </span>
          {invoice.customerName ? (
            <div className="space-y-0.5">
              <h2 className="font-bold text-slate-900 text-sm">{invoice.customerName}</h2>
              {invoice.customerPhone && <p className="text-slate-600">Phone: {invoice.customerPhone}</p>}
              {invoice.customerAddress && <p className="text-slate-500">{invoice.customerAddress}</p>}
            </div>
          ) : (
            <div className="space-y-0.5">
              <h2 className="font-bold text-slate-900 text-sm">—</h2>
              <p className="text-slate-500 italic">Direct Counter Cash Sale</p>
            </div>
          )}
        </div>

        <div className="text-right space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Payment & Settlement
          </span>
          <p className="text-slate-700">
            <span className="text-slate-500">Payment Mode: </span>
            <strong className="text-slate-900">{invoice.paymentMethod}</strong>
          </p>
          {invoice.paymentMethod === 'Bank' && invoice.bankName && (
            <p className="text-slate-700">
              <span className="text-slate-500">Bank Account: </span>
              <span className="font-medium text-slate-900">{invoice.bankName}</span>
            </p>
          )}
          <p className="text-slate-700">
            <span className="text-slate-500">Sale Category: </span>
            <strong className={isCashSale ? 'text-emerald-700' : 'text-blue-700'}>
              {invoice.saleType}
            </strong>
          </p>
          {invoice.dueDate && (
            <p className="text-slate-700">
              <span className="text-slate-500">Due Date: </span>
              <span className="font-semibold text-slate-900">{formatToDDMMYYYY(invoice.dueDate)}</span>
            </p>
          )}
          {invoice.salesman && (
            <p className="text-slate-700">
              <span className="text-slate-500">Salesman: </span>
              <span className="font-medium text-slate-900">{invoice.salesman}</span>
            </p>
          )}
          {invoice.reference && (
            <p className="text-slate-700">
              <span className="text-slate-500">Ref: </span>
              <span className="text-slate-900">{invoice.reference}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Items Table */}
      <table className="w-full text-left text-xs border-collapse mb-5">
        <thead>
          <tr className="bg-slate-100 text-slate-800 border-y border-slate-300 font-semibold">
            <th className="py-2 px-2 text-center w-8">#</th>
            <th className="py-2 px-3">Product Name & Specifications</th>
            <th className="py-2 px-2 text-center w-16">Qty</th>
            <th className="py-2 px-2 text-right w-24">Rate (PKR)</th>
            <th className="py-2 px-2 text-right w-20">Discount</th>
            <th className="py-2 px-2 text-right w-16">Tax %</th>
            <th className="py-2 px-3 text-right w-28">Total (PKR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {invoice.items.map((item, index) => (
            <tr key={item.id} className="text-slate-800">
              <td className="py-2 px-2 text-center text-slate-400 font-mono">{index + 1}</td>
              <td className="py-2 px-3">
                <div className="font-semibold text-slate-900">{item.productName}</div>
                {item.description && (
                  <div className="text-[10px] text-slate-500">{item.description}</div>
                )}
              </td>
              <td className="py-2 px-2 text-center font-mono">
                {item.quantity} {item.unit}
              </td>
              <td className="py-2 px-2 text-right font-mono">{item.rate.toLocaleString()}</td>
              <td className="py-2 px-2 text-right font-mono text-slate-600">
                {item.discountAmount > 0 ? item.discountAmount.toLocaleString() : '-'}
              </td>
              <td className="py-2 px-2 text-right font-mono text-slate-600">
                {item.taxPercent > 0 ? `${item.taxPercent}%` : '-'}
              </td>
              <td className="py-2 px-3 text-right font-bold font-mono text-slate-900">
                {item.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Financial Totals & Cash/Credit Breakdown */}
      <div className="grid grid-cols-2 gap-6 pt-2 mb-6">
        {/* Left: Payment Status Seal / Notes */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Payment Status
            </span>
            {/* Payment Summary Box */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Payment Settlement:</span>
                <span className="font-bold text-blue-900">{invoice.paymentMethod}</span>
              </div>
              {(invoice.cashReceivedAmount || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Cash Portion:</span>
                  <strong className="text-emerald-700 font-mono">
                    Rs. {invoice.cashReceivedAmount?.toLocaleString()}
                  </strong>
                </div>
              )}
              {(invoice.bankReceivedAmount || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Bank ({invoice.bankName || 'Bank Account'}):</span>
                  <strong className="text-blue-700 font-mono">
                    Rs. {invoice.bankReceivedAmount?.toLocaleString()}
                  </strong>
                </div>
              )}
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200 font-semibold">
                <span>Total Received:</span>
                <strong className="text-emerald-800 font-mono">
                  Rs. {(invoice.totalReceivedAmount !== undefined ? invoice.totalReceivedAmount : invoice.cashReceivedAtSale).toLocaleString()}
                </strong>
              </div>
              {(invoice.currentInvoiceRemaining || 0) > 0 ? (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Remaining / Baqaya:</span>
                  <span className="font-mono">
                    Rs. {invoice.currentInvoiceRemaining.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider text-center pt-0.5">
                  ✓ Paid in Full
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 space-y-0.5 pt-4">
            <p className="font-semibold text-slate-700 mb-0.5">Terms & Conditions:</p>
            <p>• {invoice.notes || 'Thank you for your business!'}</p>
            <p>• Payment is due by the due date mentioned above.</p>
            <p>• Goods once sold cannot be returned.</p>
            <p>• Please verify items at the time of delivery.</p>
          </div>
        </div>

        {/* Right: Detailed Totals Box */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-medium">Rs. {invoice.subtotal.toLocaleString()}</span>
          </div>

          {invoice.overallDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Overall Discount:</span>
              <span className="font-mono font-medium">- Rs. {invoice.overallDiscount.toLocaleString()}</span>
            </div>
          )}

          {invoice.overallTax > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Sales Tax ({invoice.taxPercent}%):</span>
              <span className="font-mono font-medium">+ Rs. {invoice.overallTax.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-blue-950 border-t border-slate-300 pt-1.5 mt-1.5">
            <span>Net Invoice Total:</span>
            <span className="font-mono text-base text-blue-800">Rs. {invoice.netInvoiceTotal.toLocaleString()}</span>
          </div>

          {/* Credit Sale Ledger Figures */}
          {!isCashSale && (
            <div className="border-t border-dashed border-slate-300 pt-2 mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Customer Previous Balance:</span>
                <span className="font-mono">Rs. {invoice.previousBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Received at Sale:</span>
                <span className="font-mono">- Rs. {(invoice.totalReceivedAmount !== undefined ? invoice.totalReceivedAmount : invoice.cashReceivedAtSale).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-semibold">
                <span>Current Invoice Remaining:</span>
                <span className="font-mono">+ Rs. {invoice.currentInvoiceRemaining.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-blue-900 font-bold border-t border-slate-200 pt-1 text-xs">
                <span>Final Customer Balance:</span>
                <span className="font-mono text-blue-800">Rs. {invoice.finalCustomerBalance.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Signature Footer */}
      <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-500 border-t border-slate-200">
        <div>
          <div className="border-t border-slate-300 w-48 mx-auto mb-1"></div>
          <span>Customer Signature</span>
        </div>
        <div>
          <div className="border-t border-slate-300 w-48 mx-auto mb-1"></div>
          <span>Authorized Signature / ACCOUNTIX</span>
        </div>
      </div>
    </div>
  );
};
