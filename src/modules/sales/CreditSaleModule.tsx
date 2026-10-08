import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SaleInvoice,
  InvoiceItemRow,
  DiscountType,
  Customer,
  StoreLocation,
  BankAccount,
} from './types';
import { salesStore, createBlankItemRow } from './salesStore';
import { getCurrentDateDDMMYYYY, getFutureDateDDMMYYYY, formatToDDMMYYYY } from '../../utils/dateUtils';
import { InvoicePreviewModal } from './components/InvoicePreviewModal';
import { InvoicePrintDocument } from './components/InvoicePrintDocument';
import { AccountingAuditDrawer } from './components/AccountingAuditDrawer';
import { WordPressPluginExportModal } from './components/WordPressPluginExportModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CustomerLedgerModal } from './components/CustomerLedgerModal';
import { AuditPasswordModal } from '../reports/components/AuditPasswordModal';
import { ThermalReceiptPreviewModal } from '../reports/components/ThermalReceiptPreviewModal';
import { TransactionDetailsModal } from '../reports/components/TransactionDetailsModal';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Printer,
  Eye,
  Trash2,
  BookOpen,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Receipt,
  User,
  Building,
  CreditCard,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Code2,
  ShieldCheck,
  Save,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface CreditSaleModuleProps {
  initialInvoiceNo?: string;
  onNavigateBack?: () => void;
  onOpenCreditSaleReport?: () => void;
  onOpenAllSalesReport?: () => void;
}

export const CreditSaleModule: React.FC<CreditSaleModuleProps> = ({
  initialInvoiceNo,
  onNavigateBack,
  onOpenCreditSaleReport,
  onOpenAllSalesReport,
}) => {
  // Store subscription
  const [storeTick, setStoreTick] = useState(0);
  useEffect(() => {
    return salesStore.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  const creditInvoices = useMemo(
    () => salesStore.getInvoices().filter((inv) => inv.saleType === 'Credit Sale'),
    [storeTick]
  );
  const customers = useMemo(() => salesStore.getCustomers(), [storeTick]);
  const products = useMemo(() => salesStore.getProducts(), [storeTick]);
  const stores = useMemo(() => salesStore.getStores(), [storeTick]);
  const banks = useMemo(() => salesStore.getBanks(), [storeTick]);
  const dayBook = useMemo(() => salesStore.getDayBook(), [storeTick]);
  const customerLedgers = useMemo(() => salesStore.getCustomerLedgers(), [storeTick]);

  // Invoice navigation pointer
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const list = salesStore.getInvoices().filter((inv) => inv.saleType === 'Credit Sale');
    return list.length > 0 ? list.length - 1 : 0;
  });

  const [isDraft, setIsDraft] = useState<boolean>(false);

  // Active working invoice state
  const [currentInvoice, setCurrentInvoice] = useState<SaleInvoice>(() => {
    const list = salesStore.getInvoices().filter((inv) => inv.saleType === 'Credit Sale');
    if (initialInvoiceNo) {
      const found = list.find((i) => i.invoiceNo === initialInvoiceNo);
      if (found) return { ...found };
    }
    if (list.length > 0) {
      return { ...list[list.length - 1] };
    }
    return salesStore.createBlankInvoiceDraft('Credit Sale');
  });

  // UI Modals & Drawers state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isThermalOpen, setIsThermalOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isCustomerLedgerOpen, setIsCustomerLedgerOpen] = useState(false);
  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [isAuditPasswordModalOpen, setIsAuditPasswordModalOpen] = useState(false);
  const [auditPendingAction, setAuditPendingAction] = useState<'EDIT' | 'DELETE' | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsInvoice, setSelectedDetailsInvoice] = useState<SaleInvoice | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Canvas View Zoom Level
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('accountix_credit_invoice_zoom');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    try {
      localStorage.setItem('accountix_credit_invoice_zoom', String(newZoom));
    } catch {}
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Recalculate invoice totals helper according to ACCOUNTIX Rules
  const recalculateInvoice = (inv: SaleInvoice): SaleInvoice => {
    // 1. Subtotal of all items
    const subtotal = inv.items.reduce((sum, item) => sum + (item.total || 0), 0);

    // 2. Overall Discount (Percentage or Fixed PKR, deducted before tax)
    let overallDiscount = 0;
    if (inv.discountType === 'percentage') {
      overallDiscount = (subtotal * (inv.discountValue || 0)) / 100;
    } else {
      overallDiscount = inv.discountValue || 0;
    }
    overallDiscount = Math.min(subtotal, Math.max(0, overallDiscount));

    // 3. Overall Tax: Taxable Amount = Amount after Discount
    const taxableAmount = Math.max(0, subtotal - overallDiscount);
    const overallTax = (taxableAmount * (inv.taxPercent || 0)) / 100;

    // 4. Net Invoice Total
    const netInvoiceTotal = Math.max(0, taxableAmount + overallTax);

    // 5. Multi-Payment Split
    const cashRec = Math.max(0, inv.cashReceivedAmount || 0);
    const bankRec = Math.max(0, inv.bankReceivedAmount || 0);
    const otherRec = Math.max(0, inv.otherReceivedAmount || 0);
    const totalReceived = cashRec + bankRec + otherRec;

    const remainingCredit = Math.max(0, netInvoiceTotal - totalReceived);
    const prevBalance = inv.previousBalance || 0;
    const finalCustomerBalance = prevBalance + remainingCredit;

    let status: 'PAID IN FULL' | 'PARTIAL CREDIT' | 'UNPAID CREDIT' = 'PAID IN FULL';
    if (remainingCredit === 0) {
      status = 'PAID IN FULL';
    } else if (totalReceived > 0) {
      status = 'PARTIAL CREDIT';
    } else {
      status = 'UNPAID CREDIT';
    }

    return {
      ...inv,
      subtotal,
      overallDiscount,
      overallTax,
      netInvoiceTotal,
      cashReceivedAmount: cashRec,
      bankReceivedAmount: bankRec,
      otherReceivedAmount: otherRec,
      totalReceivedAmount: totalReceived,
      cashReceivedAtSale: totalReceived,
      remainingBalanceAmount: remainingCredit,
      currentInvoiceRemaining: remainingCredit,
      finalCustomerBalance,
      status,
    };
  };

  // Sync active invoice when navigating index
  const loadInvoiceAtIndex = (index: number) => {
    if (index >= 0 && index < creditInvoices.length) {
      setCurrentIndex(index);
      setCurrentInvoice({ ...creditInvoices[index] });
      setIsDraft(false);
    }
  };

  // NEW Draft
  const handleNew = () => {
    const draft = salesStore.createBlankInvoiceDraft('Credit Sale');
    setCurrentInvoice(draft);
    setIsDraft(true);
    showToast('success', `Created new blank Credit Sale draft (${draft.invoiceNo}). Select Customer & items.`);
  };

  // PREVIOUS
  const handlePrevious = () => {
    if (currentIndex > 0) {
      loadInvoiceAtIndex(currentIndex - 1);
    }
  };

  // NEXT
  const handleNext = () => {
    if (currentIndex < creditInvoices.length - 1) {
      loadInvoiceAtIndex(currentIndex + 1);
    }
  };

  // CANCEL
  const handleCancel = () => {
    if (creditInvoices.length > 0) {
      loadInvoiceAtIndex(currentIndex);
      showToast('error', 'Unsaved changes cancelled.');
    } else {
      handleNew();
    }
  };

  // Customer Selection & Previous Balance Auto-population
  const handleCustomerChange = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    setCurrentInvoice((prev) => {
      const updated = {
        ...prev,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        previousBalance: cust.previousBalance, // Requirement #7: Live Previous Balance
      };
      return recalculateInvoice(updated);
    });
  };

  // Store selection
  const handleStoreChange = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return;
    setCurrentInvoice((prev) => ({
      ...prev,
      storeLocationId: store.id,
      storeLocationName: store.name,
    }));
  };

  // Line item modifications
  const handleAddItem = () => {
    setCurrentInvoice((prev) => {
      const updated = {
        ...prev,
        items: [...prev.items, createBlankItemRow(prev.storeLocationId)],
      };
      return recalculateInvoice(updated);
    });
  };

  const handleRemoveItem = (rowId: string) => {
    setCurrentInvoice((prev) => {
      if (prev.items.length <= 1) {
        return recalculateInvoice({
          ...prev,
          items: [createBlankItemRow(prev.storeLocationId)],
        });
      }
      const updated = {
        ...prev,
        items: prev.items.filter((item) => item.id !== rowId),
      };
      return recalculateInvoice(updated);
    });
  };

  const handleUpdateItem = (rowId: string, updates: Partial<InvoiceItemRow>) => {
    setCurrentInvoice((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.id !== rowId) return item;
        const merged = { ...item, ...updates };

        // Recalculate line total: LineTotal = (Qty * Rate) - LineDiscount + LineTax
        const qty = merged.quantity || 0;
        const rate = merged.rate || 0;
        const lineSubtotal = qty * rate;

        let lineDisc = 0;
        if (merged.discountType === 'percentage') {
          lineDisc = (lineSubtotal * (merged.discountValue || 0)) / 100;
        } else {
          lineDisc = merged.discountValue || 0;
        }
        lineDisc = Math.min(lineSubtotal, Math.max(0, lineDisc));

        const taxableAmount = Math.max(0, lineSubtotal - lineDisc);
        const lineTax = (taxableAmount * (merged.taxPercent || 0)) / 100;
        const lineTotal = taxableAmount + lineTax;

        return {
          ...merged,
          discountAmount: lineDisc,
          taxAmount: lineTax,
          total: lineTotal,
        };
      });

      return recalculateInvoice({ ...prev, items: newItems });
    });
  };

  // SAVE INVOICE (Requirement #8: Accounting Logic, Requirement #16: Stock Integration)
  const handleSaveInvoice = () => {
    // 1. Validation
    if (!currentInvoice.customerId || !currentInvoice.customerName) {
      showToast('error', 'Customer selection is REQUIRED for Credit Sale.');
      return;
    }

    const validItems = currentInvoice.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('error', 'Please enter at least one valid product item with quantity > 0.');
      return;
    }

    const totalRec = (currentInvoice.cashReceivedAmount || 0) + (currentInvoice.bankReceivedAmount || 0) + (currentInvoice.otherReceivedAmount || 0);
    if (totalRec > currentInvoice.netInvoiceTotal) {
      showToast('error', `Total Received (Rs. ${totalRec.toLocaleString()}) cannot exceed Net Total (Rs. ${currentInvoice.netInvoiceTotal.toLocaleString()}).`);
      return;
    }

    // Save through salesStore manager
    const result = salesStore.saveInvoice(currentInvoice);
    if (result.success && result.savedInvoice) {
      setIsDraft(false);
      setCurrentInvoice({ ...result.savedInvoice });

      // Refresh index
      const updatedList = salesStore.getInvoices().filter((i) => i.saleType === 'Credit Sale');
      const newIdx = updatedList.findIndex((i) => i.invoiceNo === result.savedInvoice?.invoiceNo);
      if (newIdx >= 0) setCurrentIndex(newIdx);

      showToast('success', result.message);
    } else {
      showToast('error', result.message);
    }
  };

  // AUDIT PROTECTED EDIT & DELETE (Requirement #15)
  const handleRequestAuditAction = (action: 'EDIT' | 'DELETE') => {
    setAuditPendingAction(action);
    setIsAuditPasswordModalOpen(true);
  };

  const handleAuditVerificationSuccess = (user: string, reason: string) => {
    if (auditPendingAction === 'DELETE') {
      const res = salesStore.deleteInvoice(currentInvoice.invoiceNo, user);
      if (res.success) {
        showToast('success', `Credit Sale ${currentInvoice.invoiceNo} deleted with full accounting & stock reversal.`);
        const remaining = salesStore.getInvoices().filter((i) => i.saleType === 'Credit Sale');
        if (remaining.length > 0) {
          loadInvoiceAtIndex(Math.max(0, currentIndex - 1));
        } else {
          handleNew();
        }
      } else {
        showToast('error', res.message);
      }
    } else if (auditPendingAction === 'EDIT') {
      showToast('success', `Audit verification approved by ${user}. You can now modify and save ${currentInvoice.invoiceNo}.`);
    }
    setAuditPendingAction(null);
  };

  // Active Customer Info
  const activeCustomer = customers.find((c) => c.id === currentInvoice.customerId);

  return (
    <div className="flex-1 bg-slate-100/70 min-h-[calc(100vh-3.5rem)] flex flex-col font-sans">
      {/* Printable Area for Browser Print (Hidden on screen, visible during window.print()) */}
      <div className="hidden print:block">
        <InvoicePrintDocument invoice={currentInvoice} />
      </div>

      {/* Screen Interface */}
      <div className="print:hidden flex-1 min-h-0 flex flex-col h-full overflow-hidden bg-slate-100/70">
        {/* TOP ACTION BAR: New | Prev | Next | Print | Preview | Save | Cancel | Delete | Zoom | Ledgers */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs shrink-0">
          {/* Left Actions */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            {/* NEW */}
            <button
              type="button"
              onClick={handleNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors active:scale-95 cursor-pointer"
              title="Create New Blank Credit Sale Invoice (Alt+N)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* PREVIOUS */}
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex <= 0}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                currentIndex > 0
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs cursor-pointer'
                  : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
              title="Open Previous Credit Invoice"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* NEXT */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= creditInvoices.length - 1}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                currentIndex < creditInvoices.length - 1
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs cursor-pointer'
                  : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
              title="Open Next Credit Invoice"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* PRINT */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Print A4 Invoice (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            {/* PREVIEW */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs transition-colors cursor-pointer"
              title="A4 Printable Invoice Preview"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Preview</span>
            </button>

            {/* THERMAL PREVIEW */}
            <button
              type="button"
              onClick={() => setIsThermalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs transition-colors cursor-pointer"
              title="POS Thermal Receipt Preview (80mm/58mm)"
            >
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Thermal</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* SAVE BUTTON */}
            <button
              type="button"
              onClick={handleSaveInvoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer active:scale-95"
              title="Save Credit Sale (F10 / Ctrl+S)"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Save</span>
            </button>

            {/* CANCEL BUTTON */}
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              title="Cancel Changes"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel</span>
            </button>

            {/* DELETE (AUDIT PROTECTED) */}
            <button
              type="button"
              onClick={() => handleRequestAuditAction('DELETE')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-2xs transition-colors cursor-pointer active:scale-95"
              title="Delete Saved Transaction (Requires Audit Password)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          {/* Right Controls: View Zoom, Invoice Badge, Customer Ledger, Report Link */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* View Scale Control */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-xs shadow-2xs">
              <Maximize2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">View:</span>
              <select
                value={zoomLevel}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-blue-700 border-none p-0 focus:ring-0 cursor-pointer"
              >
                <option value={100}>100%</option>
                <option value={90}>90%</option>
                <option value={80}>80%</option>
                <option value={75}>75% (Full Page)</option>
              </select>
            </div>

            {/* Transaction No & Invoice Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
              <span className="font-bold text-blue-800">{currentInvoice.transactionNo || 'TXN-000001'}</span>
              <span className="text-slate-400">·</span>
              <span className="font-bold text-slate-900">{currentInvoice.invoiceNo}</span>
              <span className="text-slate-400">·</span>
              {isDraft ? (
                <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded text-[10px]">
                  Draft
                </span>
              ) : (
                <span className="text-slate-500 text-[10px]">
                  {currentIndex + 1} of {creditInvoices.length}
                </span>
              )}
            </div>

            {/* Customer Ledger Quick Shortcut */}
            <button
              type="button"
              onClick={() => setIsCustomerLedgerOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-md transition-colors shadow-2xs cursor-pointer"
              title="Open Customer Ledger (Double-Entry Statement & Audit Breakdown)"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Customer Ledger</span>
            </button>

            {/* All Sales Report Link */}
            {onOpenAllSalesReport && (
              <button
                type="button"
                onClick={onOpenAllSalesReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-md transition-colors shadow-2xs cursor-pointer"
                title="Open Master All Sales Report (Consolidated Cash & Credit Sales)"
              >
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline">All Sales Report</span>
              </button>
            )}

            {/* Credit Sale Report Link */}
            {onOpenCreditSaleReport && (
              <button
                type="button"
                onClick={onOpenCreditSaleReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-md transition-colors shadow-2xs cursor-pointer"
                title="Open Credit Sale Report Module"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Credit Sale Report</span>
              </button>
            )}

            {/* Accounting Drawer */}
            <button
              type="button"
              onClick={() => setIsAuditOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors shadow-2xs cursor-pointer"
              title="View Day Book & General Ledger Entries"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xl:inline">Journal</span>
            </button>
          </div>
        </div>

        {/* TOAST ALERT BANNER */}
        {toastMessage && (
          <div
            className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                : 'bg-red-600 text-white shadow-red-900/20'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* MAIN CREDIT SALE CANVAS */}
        <div
          className="flex-1 flex flex-col justify-between p-2 sm:p-2.5 max-w-[1920px] w-full mx-auto space-y-1.5 overflow-hidden transition-transform duration-150 origin-top"
          style={{
            zoom: zoomLevel !== 100 ? `${zoomLevel}%` : undefined,
          }}
        >
          {/* SECTION 2: CREDIT SALE HEADER CARDS (3 High Density Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* CARD 1: CUSTOMER & STORE (Customer is REQUIRED) */}
            <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 space-y-1.5 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                      <User className="w-3 h-3" />
                    </div>
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                      Customer & Location Info
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded uppercase">
                    Credit Sale
                  </span>
                </div>

                {/* Customer Dropdown (Required) */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <span>Customer:</span>
                      <span className="text-red-500 font-bold">*Required</span>
                    </label>
                    {activeCustomer?.isSupplier && (
                      <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1 rounded">
                        Also Supplier (Separate Payable)
                      </span>
                    )}
                  </div>
                  <select
                    value={currentInvoice.customerId || ''}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className={`w-full text-xs font-semibold rounded border py-1 px-2 bg-white focus:outline-none focus:ring-1 ${
                      !currentInvoice.customerId
                        ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-red-500'
                        : 'border-slate-300 text-slate-900 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">-- Select Customer Account --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · Outstanding: Rs. {c.previousBalance.toLocaleString()} {c.creditLimit ? `(Limit: ${c.creditLimit.toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Store Location */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Store Location:
                  </label>
                  <select
                    value={currentInvoice.storeLocationId}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 py-1 px-2 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - {s.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Contact Details */}
                <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] text-slate-600">
                  <div className="truncate">
                    <span className="text-slate-400 block text-[10px]">Phone:</span>
                    <span className="font-mono">{currentInvoice.customerPhone || activeCustomer?.phone || '—'}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-400 block text-[10px]">Credit Limit:</span>
                    <span className="font-mono font-bold text-slate-800">
                      Rs. {(activeCustomer?.creditLimit || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: CUSTOMER BALANCE & CREDIT POSITION (Requirement #7) */}
            <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 space-y-1.5 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <CreditCard className="w-3 h-3" />
                    </div>
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                      Customer Balance & Credit Summary
                    </h2>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    currentInvoice.status === 'PAID IN FULL'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentInvoice.status === 'PARTIAL CREDIT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentInvoice.status}
                  </span>
                </div>

                {/* Balances Breakdown */}
                <div className="space-y-1 text-xs">
                  {/* Previous Balance */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Previous Balance:</span>
                    <span className="font-bold font-mono text-slate-900 text-xs">
                      Rs. {(currentInvoice.previousBalance || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Current Invoice Net Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Current Invoice:</span>
                    <span className="font-bold font-mono text-slate-900 text-xs">
                      Rs. {currentInvoice.netInvoiceTotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Received at Sale (Split Cash + Bank) */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Received at Sale:</span>
                    <span className="font-bold font-mono text-emerald-700 text-xs">
                      Rs. {(currentInvoice.totalReceivedAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Current Invoice Remaining (Baqaya) */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-0.5">
                    <span className="text-red-600 font-bold text-[11px]">Invoice Remaining:</span>
                    <span className="font-bold font-mono text-red-600 text-xs">
                      Rs. {(currentInvoice.currentInvoiceRemaining || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* NEW CUSTOMER BALANCE HIGHLIGHT (Requirement #7) */}
              <div className="mt-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-950 block text-[11px]">
                    New Customer Balance:
                  </span>
                  <span className="text-[10px] text-blue-600">
                    Previous + Current Remaining
                  </span>
                </div>
                <span className="font-black font-mono text-blue-900 text-sm">
                  Rs. {(currentInvoice.finalCustomerBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* CARD 3: INVOICE IDENTIFIERS & DUE DATES (Requirement #2) */}
            <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 space-y-1.5 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                      <FileText className="w-3 h-3" />
                    </div>
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                      Transaction & Due Date Info
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-blue-700">
                    {currentInvoice.transactionNo || 'TXN-000001'}
                  </span>
                </div>

                {/* Key Fields */}
                <div className="space-y-1">
                  {/* Transaction No */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Transaction No:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                      {currentInvoice.transactionNo || 'TXN-000001'}
                    </span>
                  </div>

                  {/* Invoice No */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Invoice No:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {currentInvoice.invoiceNo}
                    </span>
                  </div>

                  {/* Date (DD/MM/YYYY) */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Date (DD/MM/YYYY):</span>
                    <input
                      type="text"
                      value={currentInvoice.invoiceDate}
                      onChange={(e) =>
                        setCurrentInvoice((prev) => ({ ...prev, invoiceDate: e.target.value }))
                      }
                      className="font-mono text-xs text-right border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50 w-28 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Due Date (Payment Terms) */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Payment Due Date:</span>
                    <input
                      type="text"
                      value={currentInvoice.dueDate || getFutureDateDDMMYYYY(15)}
                      onChange={(e) =>
                        setCurrentInvoice((prev) => ({ ...prev, dueDate: e.target.value }))
                      }
                      className="font-mono text-xs text-right border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50 w-28 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Salesman */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-[11px]">Salesman / Rep:</span>
                    <input
                      type="text"
                      value={currentInvoice.salesman || 'Ali Khan'}
                      onChange={(e) =>
                        setCurrentInvoice((prev) => ({ ...prev, salesman: e.target.value }))
                      }
                      className="text-xs text-right border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50 w-28 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Terms: Net 15 Days</span>
                <span>Double-Entry Verified</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: PRODUCT ENTRY ITEMS TABLE (Requirement #3, #4, #5) */}
          <div className="flex-1 bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2 flex flex-col min-h-0 overflow-hidden">
            {/* Table Header with Title & Add Item button */}
            <div className="flex items-center justify-between pb-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Credit Sale Line Items ({currentInvoice.items.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  · Discounts deducted before percentage tax
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-[#0b66c3] hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Scrollable Items Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto border border-slate-200 rounded min-h-[160px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-700 font-bold border-b border-slate-200 text-[11px] shadow-2xs z-10">
                  <tr>
                    <th className="py-1.5 px-2 w-7 text-center border-r border-slate-200">#</th>
                    <th className="py-1.5 px-2.5 w-60 border-r border-slate-200">Product / Item</th>
                    <th className="py-1.5 px-2.5 min-w-[140px] border-r border-slate-200">Description</th>
                    <th className="py-1.5 px-2 w-18 text-center border-r border-slate-200">Qty</th>
                    <th className="py-1.5 px-2 w-14 text-center border-r border-slate-200">Unit</th>
                    <th className="py-1.5 px-2 w-24 text-right border-r border-slate-200">Rate (PKR)</th>
                    <th className="py-1.5 px-2 w-24 text-center border-r border-slate-200">Discount</th>
                    <th className="py-1.5 px-2 w-16 text-center border-r border-slate-200">Tax %</th>
                    <th className="py-1.5 px-2 w-20 text-right border-r border-slate-200">Tax Amt</th>
                    <th className="py-1.5 px-2.5 w-24 text-right border-r border-slate-200 font-bold text-blue-900">
                      Line Total
                    </th>
                    <th className="py-1.5 px-1.5 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentInvoice.items.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* # */}
                      <td className="py-1 px-2 text-center text-slate-400 font-mono text-[11px] border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* Product select */}
                      <td className="py-1 px-1.5 border-r border-slate-100">
                        <select
                          value={row.productId}
                          onChange={(e) => {
                            const prod = products.find((p) => p.id === e.target.value);
                            if (prod) {
                              handleUpdateItem(row.id, {
                                productId: prod.id,
                                productName: prod.name,
                                description: prod.description,
                                unit: prod.unit,
                                rate: prod.salePrice,
                              });
                            }
                          }}
                          className="w-full text-xs font-semibold rounded border border-slate-300 py-1 px-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.code}) - Rs. {p.salePrice.toLocaleString()} [Stock: {p.stockByStore[currentInvoice.storeLocationId] ?? 0}]
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Description */}
                      <td className="py-1 px-1.5 border-r border-slate-100">
                        <input
                          type="text"
                          value={row.description}
                          placeholder="Optional specifications..."
                          onChange={(e) => handleUpdateItem(row.id, { description: e.target.value })}
                          className="w-full text-xs rounded border border-slate-200 py-0.5 px-1.5 text-slate-700 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Qty */}
                      <td className="py-1 px-1.5 border-r border-slate-100">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) =>
                            handleUpdateItem(row.id, {
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-full text-xs font-bold font-mono text-center rounded border border-slate-300 py-0.5 px-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Unit */}
                      <td className="py-1 px-1 text-center font-mono text-[11px] text-slate-600 border-r border-slate-100">
                        {row.unit || 'Pcs'}
                      </td>

                      {/* Rate */}
                      <td className="py-1 px-1.5 border-r border-slate-100">
                        <input
                          type="number"
                          min="0"
                          value={row.rate}
                          onChange={(e) =>
                            handleUpdateItem(row.id, {
                              rate: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full text-xs font-mono text-right rounded border border-slate-300 py-0.5 px-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Discount (% or Fixed PKR) - Requirement #4 */}
                      <td className="py-1 px-1.5 border-r border-slate-100">
                        <div className="flex items-center gap-0.5">
                          <input
                            type="number"
                            min="0"
                            value={row.discountValue || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleUpdateItem(row.id, {
                                discountValue: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                            className="w-12 text-xs font-mono text-right rounded border border-slate-300 py-0.5 px-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <select
                            value={row.discountType}
                            onChange={(e) =>
                              handleUpdateItem(row.id, {
                                discountType: e.target.value as DiscountType,
                              })
                            }
                            className="text-[10px] rounded border border-slate-200 py-0.5 px-0.5 bg-slate-50 font-bold"
                          >
                            <option value="fixed">Rs</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                      </td>

                      {/* Tax % - Requirement #5 (Percentage only) */}
                      <td className="py-1 px-1.5 border-r border-slate-100">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.taxPercent || ''}
                          placeholder="0"
                          onChange={(e) =>
                            handleUpdateItem(row.id, {
                              taxPercent: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-full text-xs font-mono text-center rounded border border-slate-300 py-0.5 px-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* Tax Amt */}
                      <td className="py-1 px-1.5 text-right font-mono text-slate-700 text-xs border-r border-slate-100">
                        {row.taxAmount ? row.taxAmount.toFixed(0) : '0'}
                      </td>

                      {/* Line Total */}
                      <td className="py-1 px-2 text-right font-mono font-bold text-slate-900 text-xs border-r border-slate-100">
                        Rs. {row.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>

                      {/* Delete Row */}
                      <td className="py-1 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(row.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: SPLIT PAYMENT, TOTALS SUMMARY & SAVE BAR (Requirement #6, #7) */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-2.5 shrink-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              {/* Left Column: Split / Multi-Payment Inputs (col-span-5) */}
              <div className="lg:col-span-5 p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Split / Multi-Payment Settlement</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total Received: Rs. {(currentInvoice.totalReceivedAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* Cash Received */}
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">
                      Cash Received:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={currentInvoice.cashReceivedAmount === 0 ? '' : currentInvoice.cashReceivedAmount}
                        placeholder="0"
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          setCurrentInvoice((prev) =>
                            recalculateInvoice({ ...prev, cashReceivedAmount: val })
                          );
                        }}
                        className="w-full text-xs font-mono font-bold text-right rounded border border-slate-300 py-1 px-1.5 bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Bank Received */}
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">
                      Bank Received:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={currentInvoice.bankReceivedAmount === 0 ? '' : currentInvoice.bankReceivedAmount}
                        placeholder="0"
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          setCurrentInvoice((prev) =>
                            recalculateInvoice({ ...prev, bankReceivedAmount: val })
                          );
                        }}
                        className="w-full text-xs font-mono font-bold text-right rounded border border-slate-300 py-1 px-1.5 bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Target Bank Account */}
                  <div>
                    <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">
                      Target Bank Account:
                    </label>
                    <select
                      value={currentInvoice.bankAccountId || ''}
                      onChange={(e) => {
                        const bank = banks.find((b) => b.id === e.target.value);
                        setCurrentInvoice((prev) => ({
                          ...prev,
                          bankAccountId: e.target.value,
                          bankName: bank ? bank.bankName : undefined,
                        }));
                      }}
                      className="w-full text-[11px] rounded border border-slate-300 py-1 px-1 bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Choose Bank --</option>
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} ({b.accountNumber.slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes Input */}
                <div className="pt-0.5">
                  <input
                    type="text"
                    value={currentInvoice.notes || ''}
                    placeholder="Invoice Notes / Terms & Conditions..."
                    onChange={(e) =>
                      setCurrentInvoice((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full text-[11px] rounded border border-slate-200 py-0.5 px-2 bg-white text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Right Column: Financial Figures Summary & Save Action Buttons (col-span-7) */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-between gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-2 lg:pt-0 lg:pl-3">
                {/* Numbers Summary Columns */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs flex-1 w-full">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sub Total</span>
                    <span className="font-bold font-mono text-slate-800 text-xs">
                      Rs. {currentInvoice.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Discount</span>
                    <span className="font-semibold font-mono text-slate-700 text-xs">
                      -Rs. {currentInvoice.overallDiscount.toFixed(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tax</span>
                    <span className="font-semibold font-mono text-slate-700 text-xs">
                      +Rs. {currentInvoice.overallTax.toFixed(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 block">Total Amount</span>
                    <span className="font-extrabold font-mono text-blue-700 text-sm">
                      Rs. {currentInvoice.netInvoiceTotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-red-600 font-bold block">Remaining Credit</span>
                    <span className="font-black font-mono text-red-600 text-xs">
                      Rs. {(currentInvoice.currentInvoiceRemaining || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons: Save & Print */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSaveInvoice}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-98"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save Credit Sale</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0b66c3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-98"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: A4 PRINT PREVIEW */}
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={currentInvoice}
        onPrint={() => window.print()}
      />

      {/* MODAL 2: POS THERMAL RECEIPT PREVIEW (80mm & 58mm) */}
      <ThermalReceiptPreviewModal
        isOpen={isThermalOpen}
        onClose={() => setIsThermalOpen(false)}
        invoice={currentInvoice}
      />

      {/* MODAL 3: AUDIT PASSWORD VERIFICATION FOR EDIT / DELETE */}
      <AuditPasswordModal
        isOpen={isAuditPasswordModalOpen}
        onClose={() => {
          setIsAuditPasswordModalOpen(false);
          setAuditPendingAction(null);
        }}
        onSuccess={handleAuditVerificationSuccess}
        actionTitle={
          auditPendingAction === 'DELETE'
            ? 'Authorized Credit Sale Deletion & Stock Reversal'
            : 'Authorized Credit Sale Modification'
        }
        actionType={auditPendingAction || 'DELETE'}
        invoiceNo={currentInvoice.invoiceNo}
      />

      {/* MODAL 4: CUSTOMER LEDGER STATEMENT MODAL (Requirement #10) */}
      <CustomerLedgerModal
        isOpen={isCustomerLedgerOpen}
        onClose={() => setIsCustomerLedgerOpen(false)}
        customerId={currentInvoice.customerId}
        customers={customers}
        onViewTransactionDetails={(inv) => {
          setSelectedDetailsInvoice(inv);
          setIsDetailsModalOpen(true);
        }}
      />

      {/* MODAL 5: TRANSACTION DETAILS BREAKDOWN MODAL */}
      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        invoice={selectedDetailsInvoice}
        onPrint={() => window.print()}
        onOpenThermal={(inv) => {
          setIsDetailsModalOpen(false);
          setIsThermalOpen(true);
        }}
      />

      {/* MODAL 6: ACCOUNTING JOURNAL & DAY BOOK DRAWER */}
      <AccountingAuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        dayBook={dayBook}
        customerLedgers={customerLedgers}
        products={products}
        banks={banks}
        cashBalance={salesStore.getCashBalance()}
      />

      {/* MODAL 7: WORDPRESS SHORTCODE & CODE EXPORT */}
      <WordPressPluginExportModal
        isOpen={isWpModalOpen}
        onClose={() => setIsWpModalOpen(false)}
      />
    </div>
  );
};
