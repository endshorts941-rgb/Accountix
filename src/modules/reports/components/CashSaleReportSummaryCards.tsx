import React from 'react';

interface CashSaleReportSummaryCardsProps {
  totalInvoices: number;
  totalQty: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalNetSales: number;
  totalCashReceived: number;
  totalBankReceived: number;
  totalReceived: number;
  totalRemaining: number;
}

export const CashSaleReportSummaryCards: React.FC<CashSaleReportSummaryCardsProps> = ({
  totalInvoices,
  totalQty,
  totalNetSales,
  totalCashReceived,
  totalBankReceived,
  totalReceived,
  totalRemaining,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {/* 1. TOTAL INVOICES */}
      <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
        <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
          Total Invoices
        </div>
        <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
          <div className="text-lg sm:text-xl font-bold font-mono text-[#111111]">
            {totalInvoices}
          </div>
          <div className="text-[10px] text-slate-700 font-medium">
            {totalQty} Total Items Sold
          </div>
        </div>
      </div>

      {/* 2. TOTAL AMOUNT (RS.) */}
      <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
        <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
          Total Amount (Rs.)
        </div>
        <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
          <div className="text-lg sm:text-xl font-bold font-mono text-[#0b66c3]">
            Rs. {totalNetSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-700 font-medium">
            Gross Sales Value
          </div>
        </div>
      </div>

      {/* 3. TOTAL RECEIVED (RS.) */}
      <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
        <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
          Total Received (Rs.)
        </div>
        <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-800">
            Rs. {totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-700 font-medium">
            Cash: Rs. {totalCashReceived.toLocaleString()} · Bank: Rs. {totalBankReceived.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 4. TOTAL REMAINING / BALANCE (RS.) */}
      <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs overflow-hidden">
        <div className="bg-[#B6D9EA] px-2.5 py-1 border-b border-[#7F9EAD] text-[11px] font-bold text-[#111111] uppercase tracking-wide">
          Remaining / Balance (Rs.)
        </div>
        <div className="p-2 sm:p-2.5 text-center bg-[#E5F1F8]">
          <div className={`text-lg sm:text-xl font-bold font-mono ${totalRemaining > 0 ? 'text-red-700' : 'text-slate-800'}`}>
            Rs. {totalRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-700 font-medium">
            {totalRemaining > 0 ? 'Pending Settlement' : 'Fully Settled'}
          </div>
        </div>
      </div>
    </div>
  );
};
