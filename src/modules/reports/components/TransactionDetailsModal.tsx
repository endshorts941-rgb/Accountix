import React from 'react';
import { SaleInvoice } from '../../sales/types';
import { X, Printer, Receipt, FileText, CheckCircle2, Building2, User, Calendar, CreditCard, Banknote, ShieldAlert } from 'lucide-react';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SaleInvoice | null;
  onPrint: (invoice: SaleInvoice) => void;
  onOpenThermal: (invoice: SaleInvoice) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPrint,
  onOpenThermal,
}) => {
  if (!isOpen || !invoice) return null;

  const totalQty = invoice.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const isCashOnly = !invoice.bankReceivedAmount || invoice.bankReceivedAmount === 0;
  const isBankOnly = !invoice.cashReceivedAmount || invoice.cashReceivedAmount === 0;
  const isSplit = (invoice.cashReceivedAmount || 0) > 0 && (invoice.bankReceivedAmount || 0) > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0b66c3] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{invoice.saleType || 'Sale'} Voucher Details</h3>
                <span className="bg-white/20 text-white text-[11px] font-mono px-2 py-0.5 rounded font-bold">
                  {invoice.invoiceNo}
                </span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {invoice.status}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Transaction No: <span className="font-mono font-bold text-white">{invoice.transactionNo || 'TXN-' + invoice.invoiceNo}</span> · Recorded on {invoice.invoiceDate} at <span className="font-mono font-semibold text-white">{invoice.exactTime || '10:00:00'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenThermal(invoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="View POS Thermal Receipt (80mm/58mm)"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Thermal Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => onPrint(invoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white text-blue-800 hover:bg-blue-50 transition-colors shadow-xs"
              title="Print standard A4 invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customer Box */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-200/80 pb-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Customer Information</span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-900">
                  {invoice.customerName || 'Walk-in Cash Customer'}
                </div>
                {invoice.customerPhone && (
                  <div className="text-slate-600 font-mono">
                    Phone: {invoice.customerPhone}
                  </div>
                )}
                {invoice.customerAddress && (
                  <div className="text-slate-500 text-[11px]">
                    Address: {invoice.customerAddress}
                  </div>
                )}
                <div className="pt-1">
                  {invoice.saleType === 'Credit Sale' ? (
                    <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                      ✓ Credit Sale (Posted to Customer Ledger & Accounts Receivable)
                    </span>
                  ) : invoice.customerId ? (
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                      ✓ Cash Sale with Customer Reference ({invoice.customerName})
                    </span>
                  ) : (
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                      ✓ Walk-in Cash Sale (No Customer Ledger Debt Created)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Store & Staff Box */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-200/80 pb-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Store Location & Staff</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Store Warehouse:</span>
                  <span className="font-semibold text-slate-900">{invoice.storeLocationName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Salesman / User:</span>
                  <span className="font-semibold text-slate-900">{invoice.salesman || 'Ali Khan'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-mono text-slate-800">{invoice.reference || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {invoice.invoiceDate} · {invoice.exactTime || '10:00:00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-medium text-slate-800">{invoice.dueDate || invoice.invoiceDate}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-blue-200/60 pb-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Payment Settlement</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Payment Mode:</span>
                  <span className="font-bold text-slate-900">
                    {isSplit ? 'Split (Cash + Bank)' : invoice.paymentMethod}
                  </span>
                </div>
                {(invoice.cashReceivedAmount || 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Cash Received:</span>
                    <span className="font-bold font-mono text-emerald-700">
                      Rs. {invoice.cashReceivedAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
                {(invoice.bankReceivedAmount || 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      Bank ({invoice.bankName || 'Bank Account'}):
                    </span>
                    <span className="font-bold font-mono text-blue-700">
                      Rs. {invoice.bankReceivedAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-blue-200/60 font-bold">
                  <span className="text-slate-800">Total Received:</span>
                  <span className="font-mono text-emerald-700 text-sm">
                    Rs. {(invoice.totalReceivedAmount || invoice.netInvoiceTotal).toLocaleString()}
                  </span>
                </div>
                {(invoice.remainingBalanceAmount || 0) > 0 && (
                  <div className="flex items-center justify-between text-red-600 font-bold">
                    <span>Remaining Balance:</span>
                    <span className="font-mono">
                      Rs. {invoice.remainingBalanceAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                Line Items Breakdown ({invoice.items.length} items · {totalQty} Total Qty)
              </h4>
              <span className="text-[11px] text-slate-500">
                Stock deducts from {invoice.storeLocationName}
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-2 px-3 w-10 text-center">#</th>
                    <th className="py-2 px-3">Product Name & Description</th>
                    <th className="py-2 px-3 w-16 text-center">Unit</th>
                    <th className="py-2 px-3 w-16 text-center">Qty</th>
                    <th className="py-2 px-3 w-24 text-right">Rate</th>
                    <th className="py-2 px-3 w-20 text-right">Discount</th>
                    <th className="py-2 px-3 w-20 text-right">Tax</th>
                    <th className="py-2 px-3 w-28 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{item.productName || 'Custom Product Item'}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500">{item.description}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600">
                        {item.unit || 'Pcs'}
                      </td>
                      <td className="py-2 px-3 text-center font-bold font-mono text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-800">
                        Rs. {item.rate.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {item.discountAmount > 0 ? `-Rs. ${item.discountAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {item.taxAmount > 0 ? `+Rs. ${item.taxAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        Rs. {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">Notes & Terms:</span>
              <p className="text-slate-600 italic">
                "{invoice.notes || 'Thank you for your business!'}"
              </p>
              <div className="pt-1 text-[11px] text-slate-500 space-y-0.5">
                <div>• Accounting Day Book Voucher: CPV / CRV Generated</div>
                <div>• Stock Location: {invoice.storeLocationName} Inventory Automatically Updated</div>
                <div>• General Ledger: Sales Revenue credited (4001), Cash/Bank debited (1001/1002)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Gross Subtotal:</span>
                <span className="font-mono font-bold text-slate-800">
                  Rs. {invoice.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Overall Discount:</span>
                <span className="font-mono font-semibold text-slate-700">
                  - Rs. {invoice.overallDiscount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Overall Tax ({invoice.taxPercent}%):</span>
                <span className="font-mono font-semibold text-slate-700">
                  + Rs. {invoice.overallTax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex items-center justify-between font-bold text-sm">
                <span className="text-slate-900">Net Invoice Amount:</span>
                <span className="font-mono text-blue-700">
                  Rs. {invoice.netInvoiceTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-xs text-emerald-700">
                <span>Total Amount Received:</span>
                <span className="font-mono">
                  Rs. {(invoice.totalReceivedAmount || invoice.netInvoiceTotal).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                <span>Remaining Balance (Baqaya):</span>
                <span className={`font-mono ${invoice.remainingBalanceAmount && invoice.remainingBalanceAmount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  Rs. {(invoice.remainingBalanceAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>ACCOUNTIX Integrated Enterprise Voucher</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors shadow-2xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
