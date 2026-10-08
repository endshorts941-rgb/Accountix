import React from 'react';
import { SaleType, PaymentMethod, Customer, StoreLocation, BankAccount } from '../types';
import { FileText, Wallet, CreditCard, ChevronDown } from 'lucide-react';
import { DateInput } from '../../../components/common/DateInput';

interface InvoiceHeaderProps {
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  salesman: string;
  reference: string;
  saleType: SaleType;
  storeLocationId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;

  // Balances
  previousBalance: number;
  currentInvoiceTotal: number;
  cashReceivedAtSale: number;
  currentInvoiceRemaining: number;
  finalCustomerBalance: number;
  isDraft: boolean;

  // Options
  customers: Customer[];
  stores: StoreLocation[];
  banks: BankAccount[];

  // Change handlers
  onInvoiceDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
  onSalesmanChange: (name: string) => void;
  onReferenceChange: (ref: string) => void;
  onSaleTypeChange: (type: SaleType) => void;
  onStoreChange: (storeId: string) => void;
  onCustomerChange: (customerId: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange?: (phone: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onBankChange: (bankId: string) => void;
  onCashReceivedChange: (amount: number) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNo,
  invoiceDate,
  dueDate,
  salesman,
  reference,
  saleType,
  storeLocationId,
  customerId,
  customerName,
  customerPhone,
  customerAddress,
  paymentMethod,
  bankAccountId,
  previousBalance,
  currentInvoiceTotal,
  cashReceivedAtSale,
  currentInvoiceRemaining,
  finalCustomerBalance,
  isDraft,
  customers,
  stores,
  banks,
  onInvoiceDateChange,
  onDueDateChange,
  onSalesmanChange,
  onReferenceChange,
  onSaleTypeChange,
  onStoreChange,
  onCustomerChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onPaymentMethodChange,
  onBankChange,
  onCashReceivedChange,
}) => {
  const isCashSale = saleType === 'Cash Sale';

  // Find currently selected customer details
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const displayPhone = customerPhone || selectedCustomer?.phone || (isCashSale ? '' : '0300-1234567');
  const displayAddress = customerAddress || selectedCustomer?.address || (isCashSale ? 'Walk-in / Counter Cash Sale' : 'Main Bazaar, Lahore');
  const displayName = customerName || selectedCustomer?.name || (isCashSale ? 'Walk-in Cash Customer' : 'Select Customer');

  return (
    <div className="space-y-1.5 shrink-0">
      {/* 1. Page Title & Breadcrumb Header matching the design */}
      <div className="flex items-center justify-between pb-0.5 px-0.5">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            Sales Invoice
          </h1>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-white border border-slate-300 text-slate-600 shadow-2xs">
            {isDraft ? 'Draft' : 'Saved'}
          </span>
        </div>

        <div className="text-[11px] font-medium text-slate-500 flex items-center">
          <span>Sales</span>
          <span className="mx-1 text-slate-400">&gt;</span>
          <span>Invoices</span>
          <span className="mx-1 text-slate-400">&gt;</span>
          <span className="text-slate-800 font-semibold">{invoiceNo || 'New Invoice'}</span>
        </div>
      </div>

      {/* 2. Top Three Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* CARD 1: Sale & Customer Info */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                  <FileText className="w-3 h-3" />
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  Sale & Customer Info
                </h2>
              </div>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                {saleType}
              </span>
            </div>

            {/* Row 1: Store Location */}
            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="text-slate-600 font-medium shrink-0 w-20 text-[11px]">
                Store:
              </label>
              <div className="relative flex-1">
                <select
                  value={storeLocationId}
                  onChange={(e) => onStoreChange(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded py-1 pl-2 pr-6 text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
              </div>
            </div>

            {/* Row 2: Sale Type */}
            <div className="flex items-center justify-between gap-1.5 text-xs">
              <label className="text-slate-600 font-medium shrink-0 w-20 text-[11px]">
                Sale Type:
              </label>
              <div className="relative flex-1">
                <select
                  value={saleType}
                  onChange={(e) => onSaleTypeChange(e.target.value as SaleType)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded py-1 pl-2 pr-6 text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Credit Sale">Credit Sale</option>
                  <option value="Cash Sale">Cash Sale</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
              </div>
            </div>

            {/* Row 3: Customer Field (Cash Sale vs Credit Sale) */}
            {isCashSale ? (
              <div className="flex items-center justify-between gap-1.5 text-xs">
                <label className="text-slate-700 font-semibold shrink-0 w-20 text-[11px]">
                  Customer:
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={customerName || ''}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    placeholder="Walk-in Cash Customer"
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded py-1 px-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-1.5 text-xs">
                <label className="text-slate-700 font-medium shrink-0 w-20 text-[11px]">
                  Customer:
                </label>
                <div className="relative flex-1">
                  <select
                    value={customerId || ''}
                    onChange={(e) => onCustomerChange(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded py-1 pl-2 pr-6 text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Select Customer for Credit Ledger --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Compact Customer Badge */}
          <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800 truncate max-w-[190px]">
              {customerName ? customerName : (isCashSale ? 'Walk-in Cash Customer' : (selectedCustomer?.name || 'Select Customer'))}
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium shrink-0">
              {isCashSale ? '✓ No Ledger (Cash)' : 'Ledger Active'}
            </span>
          </div>
        </div>

        {/* CARD 2: Customer Balance Summary */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 flex flex-col justify-between">
          <div className="space-y-1.5">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <Wallet className="w-3 h-3" />
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  Customer Balance Summary
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">PKR</span>
            </div>

            {/* Balances Rows */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">Previous Balance:</span>
                <span className="font-bold font-mono text-slate-900 text-xs">
                  Rs. {previousBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">Current Invoice:</span>
                <span className="font-bold font-mono text-slate-900 text-xs">
                  Rs. {currentInvoiceTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-600 text-[11px]">Cash Received:</span>
                {isCashSale ? (
                  <span className="font-bold font-mono text-slate-900 text-xs">
                    Rs. {currentInvoiceTotal.toLocaleString()}
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-mono text-[10px]">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      max={currentInvoiceTotal}
                      value={cashReceivedAtSale === 0 ? '' : cashReceivedAtSale}
                      placeholder="0"
                      onChange={(e) =>
                        onCashReceivedChange(Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-20 text-right font-bold font-mono text-slate-900 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remaining Balance (Baqaya) Highlighted Container */}
          <div className="mt-1 px-2 py-0.5 rounded bg-emerald-50 border-l-4 border-emerald-500 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 text-[11px]">
              Remaining (Baqaya):
            </span>
            <span className="font-bold font-mono text-emerald-700 text-xs">
              Rs. {isCashSale ? 0 : currentInvoiceRemaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* CARD 3: Payment & Invoice Info */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 space-y-1.5 text-xs flex flex-col justify-between">
          <div className="space-y-1.5">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                  <CreditCard className="w-3 h-3" />
                </div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  Payment & Invoice Info
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{invoiceNo}</span>
            </div>

            {/* Key-Value Rows */}
            <div className="space-y-1">
              {/* Date (DD/MM/YYYY) */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">Date:</span>
                <DateInput
                  value={invoiceDate}
                  onChange={onInvoiceDateChange}
                />
              </div>

              {/* Payment Mode */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">Payment Mode:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={paymentMethod}
                    onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                    className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 font-medium text-slate-800 text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                  {paymentMethod === 'Bank' && (
                    <select
                      value={bankAccountId || ''}
                      onChange={(e) => onBankChange(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-[11px] font-medium text-slate-800 max-w-[110px]"
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Salesman */}
              <div className="flex items-center justify-between">
                <span className="text-slate-600 text-[11px]">Salesman:</span>
                <input
                  type="text"
                  value={salesman}
                  placeholder="Ali Khan"
                  onChange={(e) => onSalesmanChange(e.target.value)}
                  className="font-medium text-slate-900 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 p-0 text-xs w-28 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Due Date Indicator */}
          <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Due Date:</span>
            <span className="font-medium text-slate-700">{dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
