import React, { useState, useEffect, useMemo } from 'react';
import {
  SaleInvoice,
  SaleType,
  PaymentMethod,
  DiscountType,
  InvoiceItemRow,
  Customer,
  ProductItem,
} from './types';
import { salesStore, createBlankItemRow } from './salesStore';
import { getCurrentDateDDMMYYYY, formatToDDMMYYYY } from '../../utils/dateUtils';
import { InvoicePreviewModal } from './components/InvoicePreviewModal';
import { InvoicePrintDocument } from './components/InvoicePrintDocument';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AuditPasswordModal } from '../reports/components/AuditPasswordModal';
import {
  FileText,
  Save,
  Printer,
  Eye,
  X,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CreditCard,
  Banknote,
  Layers,
  UserPlus,
  PackagePlus,
  Wrench,
  BookOpen,
  Boxes,
  RotateCcw,
  FileSpreadsheet,
  ShoppingCart,
  Truck,
  Receipt,
  BarChart3,
  DollarSign,
  Minus,
  Square,
  Zap,
  ArrowRight,
  User,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { CustomerLedgerModal } from './components/CustomerLedgerModal';
import {
  AddCustomerModal,
  AddProductModal,
  AddServiceModal,
  StockOverviewModal,
  SalesReturnModal,
  QuotationModal,
  SalesOrderModal,
  DeliveryChallanModal,
  AccountsReceivableModal,
} from './components/SaleRightPanelModals';
import { ActiveRouteInfo } from '../../types/navigation';

interface SaleInvoiceModuleProps {
  initialSaleType?: SaleType;
  initialInvoiceNo?: string;
  onNavigateBack?: () => void;
  onOpenCashSaleReport?: () => void;
  onOpenCreditSaleReport?: () => void;
  onOpenAllSalesReport?: () => void;
  onRouteChange?: (info: ActiveRouteInfo) => void;
}

export const SaleInvoiceModule: React.FC<SaleInvoiceModuleProps> = ({
  initialSaleType = 'Cash Sale',
  initialInvoiceNo,
  onNavigateBack,
  onOpenCashSaleReport,
  onOpenCreditSaleReport,
  onOpenAllSalesReport,
  onRouteChange,
}) => {
  // Store subscription
  const [storeTick, setStoreTick] = useState(0);
  useEffect(() => {
    return salesStore.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  const invoices = useMemo(() => salesStore.getInvoices(), [storeTick]);
  const customers = useMemo(() => salesStore.getCustomers(), [storeTick]);
  const products = useMemo(() => salesStore.getProducts(), [storeTick]);
  const stores = useMemo(() => salesStore.getStores(), [storeTick]);
  const banks = useMemo(() => salesStore.getBanks(), [storeTick]);
  const services = useMemo(() => salesStore.getServices(), [storeTick]);

  // Invoice navigation pointer
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const list = salesStore.getInvoices();
    return list.length > 0 ? list.length - 1 : 0;
  });

  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Reference initial items
  const defaultReferenceItems: InvoiceItemRow[] = [
    {
      id: 'row-ref-1',
      productId: 'prod-hp-15',
      productName: 'HP Laptop 15',
      description: 'HP Laptop 15 i5',
      quantity: 1,
      unit: 'PCS',
      rate: 500.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxPercent: 10,
      taxAmount: 50,
      total: 15000.0,
      stockNumber: '500300001',
    },
    {
      id: 'row-ref-2',
      productId: 'prod-mouse-wl',
      productName: 'Mouse Wireless',
      description: 'HP Laptop 15',
      quantity: 1,
      unit: 'PCS',
      rate: 500.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: 35000.0,
      stockNumber: '500300002',
    },
    {
      id: 'row-ref-3',
      productId: 'prod-keyboard-pcs',
      productName: 'Keyboard',
      description: 'PCS',
      quantity: 1,
      unit: 'PCS',
      rate: 500.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: 50000.0,
      stockNumber: '500300003',
    },
    {
      id: 'row-ref-4',
      productId: 'prod-monitor-22',
      productName: 'Monitor 22"',
      description: 'Cash Sale',
      quantity: 1,
      unit: 'PCS',
      rate: 500.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: 91140.0,
      stockNumber: '500300004',
    },
  ];

  // Active working invoice state
  const [currentInvoice, setCurrentInvoice] = useState<SaleInvoice>(() => {
    const list = salesStore.getInvoices();
    if (list.length > 0) {
      const inv = initialInvoiceNo ? (list.find((i) => i.invoiceNo === initialInvoiceNo) || list[list.length - 1]) : list[list.length - 1];
      return {
        ...inv,
        saleType: inv.saleType || initialSaleType || 'Cash Sale',
        customerAddress: inv.customerAddress || '',
        customerName: inv.customerName || '',
        contactPerson: inv.contactPerson || '',
        paymentMethod: inv.paymentMethod === 'Bank' ? 'Bank' : 'Cash',
        isBankAccount: inv.paymentMethod === 'Bank',
        bankAccountId: inv.bankAccountId || (inv.paymentMethod === 'Bank' && banks[0] ? banks[0].id : undefined),
        descriptions: inv.descriptions || 'WordPress Accounting Solution',
        notes: inv.notes || `Sales Invoice - ${inv.invoiceNo}`,
        terms: inv.terms || 'Standard payment terms apply.',
        items: inv.items && inv.items.length > 0 ? inv.items : defaultReferenceItems,
      };
    }

    const draft = salesStore.createBlankInvoiceDraft(initialSaleType || 'Cash Sale');
    return {
      ...draft,
      saleType: initialSaleType || 'Cash Sale',
      customerAddress: '',
      customerName: '',
      contactPerson: '',
      paymentMethod: 'Cash',
      isBankAccount: false,
      bankAccountId: undefined,
      descriptions: 'WordPress Accounting Solution',
      notes: `Sales Invoice - ${draft.invoiceNo}`,
      terms: 'Standard payment terms apply.',
      previousBalance: 0,
      items: defaultReferenceItems,
    };
  });

  // Modal dialog states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAuditPasswordModalOpen, setIsAuditPasswordModalOpen] = useState(false);
  const [auditPendingAction, setAuditPendingAction] = useState<'EDIT' | 'DELETE' | null>(null);

  // Sync when initialInvoiceNo changes
  useEffect(() => {
    if (initialInvoiceNo) {
      const inv = salesStore.getInvoices().find((i) => i.invoiceNo === initialInvoiceNo);
      if (inv) {
        setCurrentInvoice({ ...inv });
        setIsDraft(false);
        setIsEditing(false);
      }
    }
  }, [initialInvoiceNo]);

  // Right Side Quick Action Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isCustomerLedgerOpen, setIsCustomerLedgerOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSalesReturnModalOpen, setIsSalesReturnModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isSalesOrderModalOpen, setIsSalesOrderModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isAccountsReceivableOpen, setIsAccountsReceivableOpen] = useState(false);
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);

  // Handle navigation to other ACCOUNTIX routes
  const handleNavigateToRoute = (route: string, label: string, menuId = 'sales', itemId?: string) => {
    if (onRouteChange) {
      onRouteChange({
        menuId,
        itemId: itemId || label.toLowerCase().replace(/\s+/g, '-'),
        parentLabel: menuId === 'reports' ? 'Reports' : 'Transactions',
        label,
        route,
      });
    }
  };

  // Toast alert
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Keyboard Shortcuts: F2 (New), F3 (Save), F4 (Edit), Alt+A (Add Line)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleNew();
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleEditClick();
      } else if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleAddItem();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInvoice]);

  // Active Customer Details & Financial Summary (Bill To / Customer & Summary box)
  const activeCustomer = useMemo(() => {
    if (currentInvoice.customerId) {
      return customers.find((c) => c.id === currentInvoice.customerId);
    }
    if (currentInvoice.customerName?.trim()) {
      return customers.find(
        (c) => c.name.toLowerCase() === currentInvoice.customerName?.trim().toLowerCase()
      );
    }
    return undefined;
  }, [currentInvoice.customerId, currentInvoice.customerName, customers]);

  // Recalculate invoice totals helper
  const recalculateInvoice = (inv: SaleInvoice): SaleInvoice => {
    const subtotal = inv.items.reduce((sum, item) => sum + (item.total || 0), 0);

    let overallDiscount = 0;
    if (inv.discountType === 'percentage') {
      overallDiscount = (subtotal * (inv.discountValue || 0)) / 100;
    } else {
      overallDiscount = inv.discountValue || 0;
    }
    overallDiscount = Math.min(subtotal, Math.max(0, overallDiscount));

    const taxableAmount = Math.max(0, subtotal - overallDiscount);
    const overallTax =
      inv.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0) ||
      (taxableAmount * (inv.taxPercent || 0)) / 100;
    const netInvoiceTotal = Math.max(0, taxableAmount + overallTax);

    // Multi-payment split calculations
    let cashRec = inv.cashReceivedAmount !== undefined ? Math.max(0, inv.cashReceivedAmount) : 0;
    let bankRec = inv.bankReceivedAmount !== undefined ? Math.max(0, inv.bankReceivedAmount) : 0;

    // For brand-new invoice with no cash/bank values specified yet:
    if (inv.cashReceivedAmount === undefined && inv.bankReceivedAmount === undefined) {
      if (inv.paymentMethod === 'Bank') {
        bankRec = inv.saleType === 'Cash Sale' ? netInvoiceTotal : 0;
        cashRec = 0;
      } else if (inv.paymentMethod === 'Credit / Remaining') {
        cashRec = 0;
        bankRec = 0;
      } else {
        cashRec = inv.saleType === 'Cash Sale' ? netInvoiceTotal : 0;
        bankRec = 0;
      }
    }

    const totalReceived = cashRec + bankRec;
    const currentInvoiceRemaining = Math.max(0, netInvoiceTotal - totalReceived);
    let finalCustomerBalance = 0;
    let status: 'PAID IN FULL' | 'PARTIAL CREDIT' | 'UNPAID CREDIT' = 'PAID IN FULL';

    if (inv.saleType === 'Cash Sale') {
      finalCustomerBalance = 0;
      status = currentInvoiceRemaining <= 0 ? 'PAID IN FULL' : 'PARTIAL CREDIT';
    } else {
      finalCustomerBalance = (inv.previousBalance || 0) + currentInvoiceRemaining;
      if (currentInvoiceRemaining === 0) {
        status = 'PAID IN FULL';
      } else if (totalReceived > 0) {
        status = 'PARTIAL CREDIT';
      } else {
        status = 'UNPAID CREDIT';
      }
    }

    // Auto-detect Payment Method if split
    let paymentMethod = inv.paymentMethod;
    if (cashRec > 0 && bankRec > 0) {
      paymentMethod = 'Split / Multi Payment';
    }

    const selectedBank = inv.bankAccountId ? banks.find((b) => b.id === inv.bankAccountId) : undefined;

    return {
      ...inv,
      subtotal,
      overallDiscount,
      overallTax,
      netInvoiceTotal,
      paymentMethod,
      bankName: selectedBank ? selectedBank.bankName : inv.bankName,
      cashReceivedAmount: cashRec,
      bankReceivedAmount: bankRec,
      totalReceivedAmount: totalReceived,
      cashReceivedAtSale: totalReceived,
      currentInvoiceRemaining,
      remainingBalanceAmount: currentInvoiceRemaining,
      finalCustomerBalance,
      status,
    };
  };

  // ACTIONS: New, Previous, Next, Save, Cancel, Print, Preview
  const handleNew = () => {
    const saleType: SaleType = 'Cash Sale';
    const draft = salesStore.createBlankInvoiceDraft(saleType);
    const newInv: SaleInvoice = {
      ...draft,
      saleType,
      customerAddress: '',
      customerName: '',
      contactPerson: '',
      paymentMethod: 'Cash',
      isBankAccount: false,
      bankAccountId: undefined,
      descriptions: 'WordPress Accounting Solution',
      notes: `Sales Invoice - ${draft.invoiceNo}`,
      terms: 'Standard payment terms apply.',
      previousBalance: 0,
      items: [
        {
          ...createBlankItemRow(draft.storeLocationId),
          stockNumber: '500300001',
          rate: 500,
          quantity: 1,
          total: 500,
        },
      ],
    };
    setCurrentInvoice(recalculateInvoice(newInv));
    setIsDraft(true);
    setIsEditing(false);
    showToast('success', `New blank Cash Sale created (${draft.invoiceNo}).`);
  };

  const handlePrevious = () => {
    if (invoices.length === 0) return;
    const currentIdx = invoices.findIndex((i) => i.invoiceNo === currentInvoice.invoiceNo);
    const targetIdx = currentIdx > 0 ? currentIdx - 1 : (currentIdx === -1 && currentIndex > 0 ? currentIndex - 1 : 0);
    if (invoices[targetIdx]) {
      setCurrentIndex(targetIdx);
      setCurrentInvoice({ ...invoices[targetIdx] });
      setIsDraft(false);
      setIsEditing(false);
      showToast('success', `Loaded Previous: ${invoices[targetIdx].invoiceNo}`);
    }
  };

  const handleNext = () => {
    if (invoices.length === 0) return;
    const currentIdx = invoices.findIndex((i) => i.invoiceNo === currentInvoice.invoiceNo);
    const targetIdx = currentIdx >= 0 && currentIdx < invoices.length - 1 ? currentIdx + 1 : (currentIdx === -1 && currentIndex < invoices.length - 1 ? currentIndex + 1 : invoices.length - 1);
    if (invoices[targetIdx]) {
      setCurrentIndex(targetIdx);
      setCurrentInvoice({ ...invoices[targetIdx] });
      setIsDraft(false);
      setIsEditing(false);
      showToast('success', `Loaded Next: ${invoices[targetIdx].invoiceNo}`);
    }
  };

  const handleSave = (andClose: boolean = false, andNew: boolean = false) => {
    const updated = recalculateInvoice(currentInvoice);

    if (updated.saleType === 'Credit Sale' && !updated.customerName?.trim() && !updated.customerId) {
      showToast('error', 'Customer selection is REQUIRED for Credit Sale. Please select or enter a customer.');
      return;
    }

    const bankRec = updated.bankReceivedAmount || 0;
    if ((bankRec > 0 || updated.paymentMethod === 'Bank') && !updated.bankAccountId) {
      showToast('error', 'Please select a Bank Account for Bank payment.');
      return;
    }

    const totalRec = (updated.cashReceivedAmount || 0) + bankRec;
    if (totalRec > updated.netInvoiceTotal) {
      showToast('error', `Total Received (Rs. ${totalRec.toLocaleString()}) cannot exceed Net Total (Rs. ${updated.netInvoiceTotal.toLocaleString()}).`);
      return;
    }

    const validItems = updated.items.filter((i) => (i.productName || i.serviceName) && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('error', 'Please add at least one line item (product or service) with quantity > 0.');
      return;
    }

    const result = salesStore.saveInvoice(updated);
    if (result.success && result.savedInvoice) {
      setCurrentInvoice({ ...result.savedInvoice });
      setIsDraft(false);
      setIsEditing(false);

      const updatedList = salesStore.getInvoices();
      const idx = updatedList.findIndex((i) => i.id === result.savedInvoice?.id);
      if (idx >= 0) setCurrentIndex(idx);

      showToast('success', result.message);

      if (andNew) {
        setTimeout(() => handleNew(), 500);
      } else if (andClose && onNavigateBack) {
        setTimeout(() => onNavigateBack(), 500);
      }
    } else {
      showToast('error', result.message || 'Failed to save invoice.');
    }
  };

  const handleCancel = () => {
    const saved = invoices.find((i) => i.invoiceNo === currentInvoice.invoiceNo);
    if (saved) {
      setCurrentInvoice({ ...saved });
      setIsEditing(false);
      setIsDraft(false);
      showToast('success', `Cancelled changes for ${saved.invoiceNo}`);
    } else {
      handleNew();
      showToast('success', 'Cleared invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    showToast(
      'success',
      `Transaction ${currentInvoice.invoiceNo} is in Edit mode. Make changes and click Save.`
    );
  };

  const handleSelectInvoiceToEdit = (invoiceNo: string) => {
    const inv = invoices.find((i) => i.invoiceNo === invoiceNo);
    if (inv) {
      const idx = invoices.findIndex((i) => i.invoiceNo === invoiceNo);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setCurrentInvoice({ ...inv });
      setIsDraft(false);
      setIsEditing(true);
      showToast('success', `Transaction ${invoiceNo} loaded.`);
    }
  };

  const handleDeleteClick = () => {
    if (isDraft && !salesStore.getInvoices().some((i) => i.invoiceNo === currentInvoice.invoiceNo)) {
      handleNew();
      showToast('success', 'Draft discarded.');
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    const res = salesStore.deleteInvoice(currentInvoice.invoiceNo, 'Admin');
    if (res.success) {
      showToast('success', `Transaction ${currentInvoice.invoiceNo} deleted successfully.`);
      const remaining = salesStore.getInvoices();
      if (remaining.length > 0) {
        const nextIdx = Math.max(0, Math.min(currentIndex, remaining.length - 1));
        setCurrentIndex(nextIdx);
        setCurrentInvoice({ ...remaining[nextIdx] });
        setIsDraft(false);
        setIsEditing(false);
      } else {
        handleNew();
      }
    } else {
      showToast('error', res.message || 'Failed to delete transaction.');
    }
    setAuditPendingAction(null);
  };

  const handleAuditVerificationSuccess = (user: string) => {
    if (auditPendingAction === 'DELETE') {
      const res = salesStore.deleteInvoice(currentInvoice.invoiceNo, user);
      if (res.success) {
        showToast('success', `Invoice ${currentInvoice.invoiceNo} deleted successfully.`);
        const remaining = salesStore.getInvoices();
        if (remaining.length > 0) {
          const nextIdx = Math.max(0, currentIndex - 1);
          setCurrentIndex(nextIdx);
          setCurrentInvoice({ ...remaining[nextIdx] });
          setIsDraft(false);
          setIsEditing(false);
        } else {
          handleNew();
        }
      } else {
        showToast('error', res.message);
      }
    }
    setAuditPendingAction(null);
  };

  // Customer selection handler
  const handleCustomerSelect = (idOrName: string) => {
    if (!idOrName) {
      const updated: SaleInvoice = {
        ...currentInvoice,
        customerId: undefined,
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        contactPerson: '',
        previousBalance: 0,
      };
      setCurrentInvoice(recalculateInvoice(updated));
      return;
    }

    const isCredit = currentInvoice.saleType === 'Credit Sale';
    const cust = customers.find(
      (c) => c.id === idOrName || c.name.toLowerCase() === idOrName.toLowerCase()
    );

    if (cust) {
      const updated: SaleInvoice = {
        ...currentInvoice,
        customerId: isCredit ? cust.id : undefined,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        contactPerson: cust.contactPerson || cust.name,
        previousBalance: isCredit ? cust.previousBalance : 0,
      };
      setCurrentInvoice(recalculateInvoice(updated));
    } else {
      setCurrentInvoice((prev) => ({
        ...prev,
        customerId: undefined,
        customerName: idOrName,
        previousBalance: 0,
      }));
    }
  };

  // Sale type change (Cash Sale vs Credit Sale)
  const handleSaleTypeChange = (type: SaleType) => {
    let updated: SaleInvoice = {
      ...currentInvoice,
      saleType: type,
    };
    if (type === 'Cash Sale') {
      updated.customerId = undefined;
      updated.previousBalance = 0;
      updated.cashReceivedAmount = updated.netInvoiceTotal;
      updated.totalReceivedAmount = updated.netInvoiceTotal;
      updated.currentInvoiceRemaining = 0;
      updated.remainingBalanceAmount = 0;
      updated.finalCustomerBalance = 0;
      updated.status = 'PAID IN FULL';
    } else if (type === 'Credit Sale') {
      if (updated.customerId) {
        const cust = customers.find((c) => c.id === updated.customerId);
        if (cust) {
          updated.previousBalance = cust.previousBalance;
        }
      }
      const totalRec = (updated.cashReceivedAmount || 0) + (updated.bankReceivedAmount || 0);
      const rem = Math.max(0, updated.netInvoiceTotal - totalRec);
      updated.currentInvoiceRemaining = rem;
      updated.remainingBalanceAmount = rem;
      updated.finalCustomerBalance = (updated.previousBalance || 0) + rem;
      updated.status = rem === 0 ? 'PAID IN FULL' : totalRec > 0 ? 'PARTIAL CREDIT' : 'UNPAID CREDIT';
    }
    setCurrentInvoice(recalculateInvoice(updated));
    showToast('success', `Sale Type changed to ${type}.`);
  };

  // Payment Mode selection (Cash, Bank, Split, Credit)
  const handleSelectPaymentMode = (mode: 'Cash' | 'Bank' | 'Split' | 'Credit') => {
    const defaultBankId = currentInvoice.bankAccountId || (banks.length > 0 ? banks[0].id : undefined);
    const defaultBank = banks.find((b) => b.id === defaultBankId);
    const net = currentInvoice.netInvoiceTotal;

    if (mode === 'Cash') {
      const updated: SaleInvoice = {
        ...currentInvoice,
        paymentMethod: 'Cash',
        isBankAccount: false,
        cashReceivedAmount: net,
        bankReceivedAmount: 0,
        totalReceivedAmount: net,
      };
      setCurrentInvoice(recalculateInvoice(updated));
      showToast('success', 'Payment Mode: 100% Cash');
    } else if (mode === 'Bank') {
      const updated: SaleInvoice = {
        ...currentInvoice,
        paymentMethod: 'Bank',
        isBankAccount: true,
        bankAccountId: defaultBankId,
        bankName: defaultBank ? defaultBank.bankName : undefined,
        cashReceivedAmount: 0,
        bankReceivedAmount: net,
        totalReceivedAmount: net,
      };
      setCurrentInvoice(recalculateInvoice(updated));
      showToast('success', `Payment Mode: 100% Bank (${defaultBank?.bankName || 'Selected Bank'})`);
    } else if (mode === 'Split') {
      const half = Math.round(net / 2);
      const remainingHalf = net - half;
      const updated: SaleInvoice = {
        ...currentInvoice,
        paymentMethod: 'Split / Multi Payment',
        isBankAccount: true,
        bankAccountId: defaultBankId,
        bankName: defaultBank ? defaultBank.bankName : undefined,
        cashReceivedAmount: (currentInvoice.cashReceivedAmount || 0) > 0 ? currentInvoice.cashReceivedAmount : half,
        bankReceivedAmount: (currentInvoice.bankReceivedAmount || 0) > 0 ? currentInvoice.bankReceivedAmount : remainingHalf,
      };
      setCurrentInvoice(recalculateInvoice(updated));
      showToast('success', 'Split / Multi Payment mode enabled. Edit Cash & Bank amounts freely.');
    } else if (mode === 'Credit') {
      const updated: SaleInvoice = {
        ...currentInvoice,
        paymentMethod: 'Credit / Remaining',
        cashReceivedAmount: 0,
        bankReceivedAmount: 0,
        totalReceivedAmount: 0,
      };
      setCurrentInvoice(recalculateInvoice(updated));
      showToast('success', 'Payment Mode: 100% Credit / Remaining');
    }
  };

  // Cash Amount edit handler
  const handleCashAmountChange = (val: number) => {
    const sanitizedVal = Math.max(0, val);
    const bankRec = currentInvoice.bankReceivedAmount || 0;
    const net = currentInvoice.netInvoiceTotal;

    if (sanitizedVal + bankRec > net) {
      showToast('error', `Total Received cannot exceed Net Total (Rs. ${net.toLocaleString()}).`);
      const cappedVal = Math.max(0, net - bankRec);
      setCurrentInvoice((prev) =>
        recalculateInvoice({
          ...prev,
          cashReceivedAmount: cappedVal,
        })
      );
      return;
    }

    setCurrentInvoice((prev) =>
      recalculateInvoice({
        ...prev,
        cashReceivedAmount: sanitizedVal,
      })
    );
  };

  // Bank Amount edit handler
  const handleBankAmountChange = (val: number) => {
    const sanitizedVal = Math.max(0, val);
    const cashRec = currentInvoice.cashReceivedAmount || 0;
    const net = currentInvoice.netInvoiceTotal;

    const defaultBankId = currentInvoice.bankAccountId || (banks.length > 0 ? banks[0].id : undefined);
    const defaultBank = banks.find((b) => b.id === defaultBankId);

    if (cashRec + sanitizedVal > net) {
      showToast('error', `Total Received cannot exceed Net Total (Rs. ${net.toLocaleString()}).`);
      const cappedVal = Math.max(0, net - cashRec);
      setCurrentInvoice((prev) =>
        recalculateInvoice({
          ...prev,
          bankReceivedAmount: cappedVal,
          bankAccountId: cappedVal > 0 ? defaultBankId : prev.bankAccountId,
          bankName: cappedVal > 0 ? defaultBank?.bankName : prev.bankName,
          isBankAccount: cappedVal > 0,
        })
      );
      return;
    }

    setCurrentInvoice((prev) =>
      recalculateInvoice({
        ...prev,
        bankReceivedAmount: sanitizedVal,
        bankAccountId: sanitizedVal > 0 ? (prev.bankAccountId || defaultBankId) : prev.bankAccountId,
        bankName: sanitizedVal > 0 ? (prev.bankName || defaultBank?.bankName) : prev.bankName,
        isBankAccount: sanitizedVal > 0,
      })
    );
  };

  // Quick fill remaining balance into Cash
  const handleFillRemainingToCash = () => {
    const bankRec = currentInvoice.bankReceivedAmount || 0;
    const net = currentInvoice.netInvoiceTotal;
    const remainingToAdd = Math.max(0, net - bankRec);
    setCurrentInvoice((prev) =>
      recalculateInvoice({
        ...prev,
        cashReceivedAmount: remainingToAdd,
      })
    );
    showToast('success', `Filled Rs. ${remainingToAdd.toLocaleString()} into Cash.`);
  };

  // Quick fill remaining balance into Bank
  const handleFillRemainingToBank = () => {
    const cashRec = currentInvoice.cashReceivedAmount || 0;
    const net = currentInvoice.netInvoiceTotal;
    const remainingToAdd = Math.max(0, net - cashRec);
    const defaultBankId = currentInvoice.bankAccountId || (banks.length > 0 ? banks[0].id : undefined);
    const defaultBank = banks.find((b) => b.id === defaultBankId);

    setCurrentInvoice((prev) =>
      recalculateInvoice({
        ...prev,
        bankReceivedAmount: remainingToAdd,
        bankAccountId: defaultBankId,
        bankName: defaultBank?.bankName,
        isBankAccount: true,
      })
    );
    showToast('success', `Filled Rs. ${remainingToAdd.toLocaleString()} into Bank.`);
  };

  // Bank account selection change
  const handleBankAccountChange = (bankId: string) => {
    const selectedBank = banks.find((b) => b.id === bankId);
    setCurrentInvoice((prev) => ({
      ...prev,
      bankAccountId: bankId,
      bankName: selectedBank ? selectedBank.bankName : prev.bankName,
      isBankAccount: true,
    }));
    if (selectedBank) {
      showToast('success', `Selected Bank: ${selectedBank.bankName}`);
    }
  };

  // Add line item (Product or Service)
  const handleAddItem = (type: 'product' | 'service' = 'product') => {
    if (type === 'service') {
      const srv = services[0];
      const newLine: InvoiceItemRow = {
        id: 'row-' + Math.random().toString(36).substring(2, 9),
        itemType: 'service',
        productId: srv ? srv.code : 'SRV-101',
        productName: srv ? srv.name : 'Computer Repairing',
        serviceName: srv ? srv.name : 'Computer Repairing',
        description: srv?.description || 'Service & Maintenance',
        unit: srv?.unit || 'Job',
        quantity: 1,
        rate: srv?.rate || 1500.0,
        discountType: 'fixed',
        discountValue: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        total: srv?.rate || 1500.0,
        stockNumber: srv?.code || 'SRV-101',
      };
      const updated = {
        ...currentInvoice,
        items: [...currentInvoice.items, newLine],
      };
      setCurrentInvoice(recalculateInvoice(updated));
      showToast('success', `Added service line (${newLine.productName}).`);
      return;
    }

    const prod = products[0];
    const newLine: InvoiceItemRow = {
      id: 'row-' + Math.random().toString(36).substring(2, 9),
      itemType: 'product',
      productId: prod?.id || '',
      productName: prod?.name || 'HP Laptop 15',
      description: prod?.description || 'HP Laptop 15 i5',
      unit: prod?.unit || 'PCS',
      quantity: 1,
      rate: prod?.salePrice || 500.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: prod?.salePrice || 500.0,
      stockNumber: prod?.code || '500300001',
    };

    const updated = {
      ...currentInvoice,
      items: [...currentInvoice.items, newLine],
    };
    setCurrentInvoice(recalculateInvoice(updated));
    showToast('success', `Added product line (${newLine.productName}).`);
  };

  // Remove line item
  const handleRemoveItem = (id: string) => {
    const remaining = currentInvoice.items.filter((item) => item.id !== id);
    const updated = {
      ...currentInvoice,
      items:
        remaining.length > 0
          ? remaining
          : [
              {
                ...createBlankItemRow(currentInvoice.storeLocationId),
                stockNumber: '500300001',
                rate: 0,
                quantity: 1,
                total: 0,
              },
            ],
    };
    setCurrentInvoice(recalculateInvoice(updated));
    showToast('success', 'Row removed.');
  };

  // Update line item
  const handleUpdateItem = (id: string, updates: Partial<InvoiceItemRow>) => {
    const newItems = currentInvoice.items.map((item) => {
      if (item.id !== id) return item;
      const merged = { ...item, ...updates };

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
      const total = taxableAmount + lineTax;

      return {
        ...merged,
        discountAmount: lineDisc,
        taxAmount: lineTax,
        total,
      };
    });

    setCurrentInvoice(recalculateInvoice({ ...currentInvoice, items: newItems }));
  };

  return (
    <div className="flex-1 min-h-0 w-full h-full bg-[#BCD2E8] font-sans text-[#111111] antialiased select-none p-1.5 sm:p-2 overflow-y-auto lg:overflow-hidden flex flex-col [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#BCD2E8]">
      {/* Hidden print document for browser window.print() */}
      <div className="hidden print:block">
        <InvoicePrintDocument invoice={currentInvoice} />
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-12 right-6 z-50 px-3 py-1.5 text-xs font-semibold flex items-center gap-2 border shadow-md ${
            toastMessage.type === 'success'
              ? 'bg-[#E8F8EC] border-emerald-500 text-emerald-900'
              : 'bg-[#FFF0F2] border-red-500 text-red-900'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 
        ========================================================================
        MAIN ROW: TOP-LEFT ALIGNED (Sale Invoice ~80% + Single Column Right Buttons)
        ========================================================================
      */}
      <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row items-stretch lg:items-start justify-start gap-2.5 overflow-hidden">
        {/* 
          ========================================================================
          1. LEFT / TOP: SALES INVOICE WINDOW (~80% Viewport Width, Top-Left)
          ========================================================================
        */}
        <div className="w-full lg:w-[80%] xl:w-[80%] 2xl:w-[80%] h-full max-h-full shrink-0 min-w-0 flex flex-col bg-[#D0E7F5] border border-[#7F9EAD] shadow-md rounded-xs overflow-hidden print:hidden">
        
        {/* DESKTOP WINDOW TITLE BAR */}
        <div className="bg-gradient-to-r from-[#1875B4] to-[#258ECE] px-2 py-0.5 text-white flex items-center justify-between shrink-0 select-none border-b border-[#135A8C]">
          <div className="flex items-center gap-1.5">
            <div className="p-0.5 bg-white/15 rounded-xs">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs uppercase tracking-wider text-white">
                Sales Invoice
              </span>
              {isEditing ? (
                <span className="bg-amber-300 text-amber-950 font-black text-[9px] px-1 py-0.2 rounded-xs uppercase">
                  Edit Mode
                </span>
              ) : isDraft ? (
                <span className="bg-blue-300 text-blue-950 font-black text-[9px] px-1 py-0.2 rounded-xs uppercase">
                  Draft
                </span>
              ) : (
                <span className="bg-emerald-300 text-emerald-950 font-black text-[9px] px-1 py-0.2 rounded-xs uppercase">
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-white/90 font-semibold mr-1 hidden md:inline">
              {currentInvoice.invoiceNo} · {currentInvoice.invoiceDate} {currentInvoice.exactTime || ''}
            </span>
            <div className="flex items-center gap-0.5 bg-black/20 p-0.5 rounded-xs">
              <button
                type="button"
                onClick={() => setIsWindowMinimized((prev) => !prev)}
                className="p-0.5 hover:bg-white/20 text-white rounded-xs transition-colors cursor-pointer"
                title={isWindowMinimized ? 'Expand Window' : 'Minimize Window'}
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('success', 'Sale Invoice maximized.');
                }}
                className="p-0.5 hover:bg-white/20 text-white rounded-xs transition-colors cursor-pointer"
                title="Maximize Window"
              >
                <Square className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateBack) onNavigateBack();
                  else handleCancel();
                }}
                className="p-0.5 hover:bg-red-600 text-white rounded-xs transition-colors cursor-pointer"
                title="Close Window"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: TOP TOOLBAR (Compact Accounting Buttons) */}
        <div className="bg-[#EAF4FA] border-b border-[#7F9EAD] px-2 py-0.5 flex flex-wrap items-center justify-between gap-1 shrink-0">
          <div className="flex flex-wrap items-center gap-0.5">
            {/* New */}
            <button
              type="button"
              onClick={handleNew}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Create New Invoice (F2)"
            >
              <FileText className="w-3 h-3 text-slate-800" />
              <span>New</span>
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Next Transaction"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3 text-slate-800" />
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Previous Transaction"
            >
              <ChevronLeft className="w-3 h-3 text-slate-800" />
              <span>Previous</span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#1875B4] hover:bg-[#125D91] border border-blue-900 text-xs font-bold text-white rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Save Invoice (F3)"
            >
              <Save className="w-3 h-3 text-white" />
              <span>Save</span>
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Cancel / Reset"
            >
              <X className="w-3 h-3 text-slate-800" />
              <span>Cancel</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Print Document (Ctrl+P)"
            >
              <Printer className="w-3 h-3 text-slate-800" />
              <span>Print</span>
            </button>

            {/* Preview */}
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Open Document Preview"
            >
              <Eye className="w-3 h-3 text-slate-800" />
              <span>Preview</span>
            </button>

            {/* View Ledger */}
            <button
              type="button"
              onClick={() => setIsCustomerLedgerOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-blue-900 rounded-xs shadow-2xs transition-colors cursor-pointer"
              title="Open Customer Ledger for Selected Customer"
            >
              <BookOpen className="w-3 h-3 text-blue-800" />
              <span>Customer Ledger</span>
            </button>
          </div>

          {/* Quick Transaction Switcher & Delete */}
          <div className="flex items-center gap-1.5 text-xs">
            {invoices.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-600">Txn:</span>
                <select
                  value={currentInvoice.invoiceNo}
                  onChange={(e) => handleSelectInvoiceToEdit(e.target.value)}
                  className="bg-[#F5FAFD] border border-[#7F9EAD] px-1 py-0.5 text-xs font-mono font-semibold text-[#111111] focus:bg-white focus:outline-none"
                  title="Select Saved Transaction"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNo}>
                      {inv.invoiceNo} · {inv.customerName || 'Cash'} · Rs.{inv.netInvoiceTotal.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-1.5 py-0.5 bg-[#D7EAF5] hover:bg-[#FCDADF] border border-[#7F9EAD] text-xs font-semibold text-red-900 rounded-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-0.5"
              title="Delete Transaction"
            >
              <Trash2 className="w-3 h-3 text-red-800" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: INVOICE WORKING BODY (Desktop Accounting Window Layout - Fit Viewport) */}
        {!isWindowMinimized && (
          <div className="flex-1 min-h-0 flex flex-col p-1 sm:p-1.5 gap-1 overflow-hidden">
            
            {/* ROW 1: COMPACT INVOICE HEADER (QuickBooks / Sage 50 style) */}
            <div className="shrink-0 border border-[#7F9EAD] bg-[#EAF4FA] shadow-2xs p-1 space-y-0.5">
              {/* Line 1: Invoice No | Date | Exact Time | Txn No | Sale Type | Store Location | Reference */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 items-end">
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-tight mb-0.5">Invoice No</label>
                  <input
                    type="text"
                    readOnly
                    value={currentInvoice.invoiceNo}
                    className="w-full bg-white border border-[#7F9EAD] px-1 py-0.5 text-xs font-mono font-bold text-blue-900 rounded-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-tight mb-0.5">Date</label>
                  <input
                    type="text"
                    value={currentInvoice.invoiceDate || getCurrentDateDDMMYYYY()}
                    onChange={(e) => setCurrentInvoice((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-white border border-[#7F9EAD] px-1 py-0.5 text-xs font-semibold text-[#111111] focus:outline-none rounded-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-tight mb-0.5">Exact Time</label>
                  <input
                    type="text"
                    value={currentInvoice.exactTime || '10:00:00'}
                    onChange={(e) => setCurrentInvoice((prev) => ({ ...prev, exactTime: e.target.value }))}
                    placeholder="HH:mm:ss"
                    className="w-full bg-white border border-[#7F9EAD] px-1 py-0.5 text-xs font-mono font-semibold text-blue-900 focus:outline-none rounded-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-tight mb-0.5">Txn No</label>
                  <input
                    type="text"
                    readOnly
                    value={currentInvoice.transactionNo || `TXN-${currentInvoice.invoiceNo}`}
                    className="w-full bg-white border border-[#7F9EAD] px-1 py-0.5 text-xs font-mono font-semibold text-slate-700 rounded-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-tight mb-0.5">Sale Type</label>
                  <select
                    value={currentInvoice.saleType}
                    onChange={(e) => handleSaleTypeChange(e.target.value as SaleType)}
                    className="w-full bg-white border border-[#7F9EAD] px-1 py-0.5 text-xs font-bold text-[#111111] focus:outline-none rounded-2xs cursor-pointer"
                  >
                    <option value="Cash Sale">Cash Sale</option>
                    <option value="Credit Sale">Credit Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-tight mb-0.5">Store Location</label>
                  <select
                    value={currentInvoice.storeLocationId}
                    onChange={(e) => {
                      const loc = stores.find((s) => s.id === e.target.value);
                      setCurrentInvoice((prev) => ({
                        ...prev,
                        storeLocationId: e.target.value,
                        storeLocationName: loc?.name || prev.storeLocationName,
                      }));
                    }}
                    className="w-full bg-white border border-[#7F9EAD] px-1 py-0.5 text-xs font-semibold text-[#111111] focus:outline-none rounded-2xs cursor-pointer"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-700 uppercase tracking-tight mb-0.5">Reference / PO</label>
                  <input
                    type="text"
                    value={currentInvoice.reference || 'PO-1025'}
                    onChange={(e) => setCurrentInvoice((prev) => ({ ...prev, reference: e.target.value }))}
                    placeholder="Reference..."
                    className="w-full bg-white border border-[#7F9EAD] px-1 py-0.5 text-xs text-[#111111] focus:outline-none rounded-2xs"
                  />
                </div>
              </div>

              {/* Line 2: Customer Selection & Details & Balance Summary */}
              <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5 border-t border-[#7F9EAD]/40 text-xs">
                <div className="flex flex-1 items-center gap-1.5 min-w-[260px]">
                  <span className="font-bold text-[10.5px] text-slate-800 whitespace-nowrap">
                    Customer {currentInvoice.saleType === 'Credit Sale' && <span className="text-red-700">*</span>}:
                  </span>
                  {currentInvoice.saleType === 'Cash Sale' ? (
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={currentInvoice.customerName || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCurrentInvoice((prev) => ({
                            ...prev,
                            customerName: val,
                            customerId: undefined,
                            previousBalance: 0,
                          }));
                        }}
                        placeholder="Walk-in Cash Customer (Optional reference name)"
                        list="cash-customers-list"
                        className="w-full bg-white border border-[#7F9EAD] px-1.5 py-0.5 text-xs text-[#111111] font-semibold focus:outline-none rounded-2xs placeholder:text-slate-400 placeholder:font-normal placeholder:italic"
                      />
                      <datalist id="cash-customers-list">
                        {customers.map((c) => (
                          <option key={c.id} value={c.name} />
                        ))}
                      </datalist>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <select
                        value={currentInvoice.customerId || ''}
                        onChange={(e) => handleCustomerSelect(e.target.value)}
                        className="w-full bg-white border border-[#7F9EAD] px-1.5 py-0.5 text-xs font-semibold text-[#111111] focus:outline-none rounded-2xs"
                      >
                        <option value="" disabled>-- Select Customer (Required for Credit) --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Bal: Rs.{c.previousBalance.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Inline Badges: Phone / Address / Code / Previous Balance / Ledger Link */}
                <div className="flex flex-wrap items-center gap-1 text-[10.5px] shrink-0">
                  <div className="flex items-center gap-1 text-slate-700 bg-white/70 px-1 py-0.2 border border-[#7F9EAD]/60 rounded-2xs">
                    <span className="text-slate-500">Code:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {activeCustomer ? (activeCustomer.cnic || `CUST-${activeCustomer.id.slice(-5)}`) : 'CUST-WALKIN'}
                    </span>
                  </div>
                  {activeCustomer && (
                    <div className="hidden sm:flex items-center gap-1 text-slate-700 bg-white/70 px-1 py-0.2 border border-[#7F9EAD]/60 rounded-2xs">
                      <span className="text-slate-500">Limit:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        Rs. {(activeCustomer.creditLimit || 50000).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-slate-700 bg-white/70 px-1 py-0.2 border border-[#7F9EAD]/60 rounded-2xs">
                    <span className="text-slate-500">Prev Bal:</span>
                    <span className="font-mono font-bold text-blue-950">
                      Rs. {(currentInvoice.saleType === 'Cash Sale' ? 0 : (currentInvoice.previousBalance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {activeCustomer && (
                    <button
                      type="button"
                      onClick={() => setIsCustomerLedgerOpen(true)}
                      className="px-1 py-0.2 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-[9.5px] font-bold text-blue-900 rounded-2xs cursor-pointer shadow-2xs"
                    >
                      [Ledger]
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 2: HORIZONTAL BALANCE SUMMARY BAR (Compact Viewport Strip) */}
            <div className="shrink-0 bg-[#B3DAEB]/40 border border-[#7F9EAD] px-2 py-0.5 text-[10.5px] font-semibold flex flex-wrap items-center justify-between gap-1 shadow-2xs rounded-2xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-600">Previous:</span>
                <span className="font-mono font-bold text-slate-900">
                  Rs. {(currentInvoice.saleType === 'Cash Sale' ? 0 : (currentInvoice.previousBalance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-slate-500 font-bold">+</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-600">Invoice:</span>
                <span className="font-mono font-bold text-blue-900">
                  Rs. {currentInvoice.netInvoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-slate-500 font-bold">-</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-600">Received:</span>
                <span className="font-mono font-bold text-emerald-800">
                  Rs. {(currentInvoice.totalReceivedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-slate-500 font-bold">=</span>
              <div className="flex items-center gap-1 bg-white px-1.5 py-0.2 border border-[#7F9EAD] rounded-2xs">
                <span className="text-slate-800 font-bold">Final Bal:</span>
                <span className={`font-mono font-bold ${currentInvoice.saleType === 'Cash Sale' ? 'text-slate-800' : 'text-blue-900'}`}>
                  Rs. {(currentInvoice.saleType === 'Cash Sale' ? 0 : currentInvoice.finalCustomerBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* ROW 3: PRODUCT & SERVICE ENTRY GRID (Auto-fits remaining viewport space, scrolls only when items exceed) */}
            <div className="flex-1 min-h-[140px] flex flex-col border border-[#7F9EAD] bg-white shadow-2xs overflow-hidden">
              <div className="bg-[#B3DAEB] border-b border-[#7F9EAD] px-2 py-0.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#111111]">
                    Product &amp; Service Entry Grid
                  </span>
                  <span className="text-[10px] bg-white/70 px-1.5 py-0.2 border border-[#7F9EAD] rounded-2xs font-semibold">
                    {currentInvoice.items.length} {currentInvoice.items.length === 1 ? 'Line Item' : 'Line Items'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAddItem('product')}
                    className="px-2 py-0.2 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-2xs cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Add Product Line (Alt+A)"
                  >
                    <Plus className="w-3 h-3 text-emerald-800 stroke-[3]" />
                    <span>Add Product</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem('service')}
                    className="px-2 py-0.2 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-2xs cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Add Service Line"
                  >
                    <Plus className="w-3 h-3 text-amber-800 stroke-[3]" />
                    <span>Add Service</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#F5FAFD] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#F5FAFD] [&::-webkit-scrollbar-thumb]:bg-[#7F9EAD]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#B6D9EA] text-[#111111] font-bold border-b border-[#7F9EAD] text-[10.5px] sticky top-0 z-10 shadow-2xs">
                    <tr>
                      <th className="w-7 py-0.5 px-1 text-center border-r border-[#7F9EAD]">#</th>
                      <th className="w-48 py-0.5 px-1.5 border-r border-[#7F9EAD]">Product / Service</th>
                      <th className="w-36 py-0.5 px-1.5 border-r border-[#7F9EAD]">Description</th>
                      <th className="w-16 py-0.5 px-1 text-center border-r border-[#7F9EAD]">Qty</th>
                      <th className="w-14 py-0.5 px-1 text-center border-r border-[#7F9EAD]">Unit</th>
                      <th className="w-20 py-0.5 px-1 text-right border-r border-[#7F9EAD]">Rate</th>
                      <th className="w-16 py-0.5 px-1 text-center border-r border-[#7F9EAD]">Disc</th>
                      <th className="w-14 py-0.5 px-1 text-center border-r border-[#7F9EAD]">Tax %</th>
                      <th className="w-24 py-0.5 px-1.5 text-right border-r border-[#7F9EAD]">Amount</th>
                      <th className="w-24 py-0.5 px-1 text-center border-r border-[#7F9EAD]">Store</th>
                      <th className="w-10 py-0.5 px-0.5 text-center border-l border-[#7F9EAD]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items.map((row, idx) => {
                      const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F5FAFD]';
                      return (
                        <tr
                          key={row.id}
                          className={`${rowBg} hover:bg-blue-50/60 border-b border-[#7F9EAD]/40`}
                        >
                          {/* # */}
                          <td className="py-1 px-1 text-center font-mono text-[11px] border-r border-[#7F9EAD]">
                            {idx + 1}
                          </td>

                          {/* Item / Product / Service */}
                          <td className="py-0.5 px-1 border-r border-[#7F9EAD]">
                            <select
                              value={row.productName || row.serviceName || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const prod = products.find((p) => p.name === val || p.id === val);
                                if (prod) {
                                  handleUpdateItem(row.id, {
                                    itemType: 'product',
                                    productId: prod.id,
                                    productName: prod.name,
                                    serviceName: undefined,
                                    description: prod.description,
                                    unit: prod.unit,
                                    rate: prod.salePrice,
                                    stockNumber: prod.code,
                                  });
                                  return;
                                }
                                const srv = services.find((s) => s.name === val || s.code === val);
                                if (srv) {
                                  handleUpdateItem(row.id, {
                                    itemType: 'service',
                                    productId: srv.code,
                                    productName: srv.name,
                                    serviceName: srv.name,
                                    description: srv.description,
                                    unit: srv.unit || 'Job',
                                    rate: srv.rate,
                                    stockNumber: srv.code,
                                  });
                                  return;
                                }
                                handleUpdateItem(row.id, { productName: val });
                              }}
                              className="w-full bg-transparent border-none py-0.5 px-1 text-xs font-semibold text-[#111111] focus:bg-white focus:outline-none"
                            >
                              <option value={row.productName || row.serviceName || ''}>
                                {row.productName || row.serviceName || '-- Select Product / Service --'}
                              </option>
                              <optgroup label="📦 Products (Inventory Stock)">
                                {products.map((p) => (
                                  <option key={p.id} value={p.name}>
                                    {p.name} (Stock: {p.stockByStore[currentInvoice.storeLocationId] ?? 0} {p.unit})
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🔧 Services (Non-Stock / Labor)">
                                {services.map((s) => (
                                  <option key={s.id} value={s.name}>
                                    {s.name} (Rate: Rs.{s.rate})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </td>

                          {/* Description */}
                          <td className="py-0.5 px-1 border-r border-[#7F9EAD]">
                            <input
                              type="text"
                              value={row.description || ''}
                              onChange={(e) => handleUpdateItem(row.id, { description: e.target.value })}
                              placeholder="Line description"
                              className="w-full bg-transparent border-none py-0.5 px-1 text-xs text-slate-700 focus:bg-white focus:outline-none"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="py-0.5 px-1 border-r border-[#7F9EAD]">
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) =>
                                handleUpdateItem(row.id, {
                                  quantity: Math.max(1, parseFloat(e.target.value) || 0),
                                })
                              }
                              className="w-full text-center font-mono bg-transparent border border-[#7F9EAD]/60 px-1 py-0.5 text-xs text-[#111111] focus:bg-white focus:outline-none font-bold"
                            />
                          </td>

                          {/* Unit */}
                          <td className="py-0.5 px-1 text-center font-mono border-r border-[#7F9EAD] text-slate-600 text-[11px]">
                            {row.unit || 'Pcs'}
                          </td>

                          {/* Rate */}
                          <td className="py-0.5 px-1 border-r border-[#7F9EAD]">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={row.rate}
                              onChange={(e) =>
                                handleUpdateItem(row.id, {
                                  rate: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full text-right font-mono bg-transparent border border-[#7F9EAD]/60 px-1 py-0.5 text-xs text-[#111111] focus:bg-white focus:outline-none font-semibold"
                            />
                          </td>

                          {/* Discount */}
                          <td className="py-0.5 px-1 border-r border-[#7F9EAD]">
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="0"
                                value={row.discountValue || 0}
                                onChange={(e) =>
                                  handleUpdateItem(row.id, {
                                    discountValue: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full text-center font-mono bg-transparent border border-[#7F9EAD]/60 px-0.5 py-0.5 text-xs text-[#111111] focus:bg-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateItem(row.id, {
                                    discountType: row.discountType === 'percentage' ? 'fixed' : 'percentage',
                                  })
                                }
                                className="text-[9px] font-bold px-1 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-l-0 border-[#7F9EAD] text-blue-900 cursor-pointer shrink-0"
                                title={`Toggle discount type: ${row.discountType === 'percentage' ? '% (Percentage)' : 'Rs. (Fixed)'}`}
                              >
                                {row.discountType === 'percentage' ? '%' : 'Rs'}
                              </button>
                            </div>
                          </td>

                          {/* Tax */}
                          <td className="py-0.5 px-1 border-r border-[#7F9EAD]">
                            <input
                              type="number"
                              min="0"
                              value={row.taxPercent || 0}
                              onChange={(e) =>
                                handleUpdateItem(row.id, {
                                  taxPercent: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full text-center font-mono bg-transparent border border-[#7F9EAD]/60 px-1 py-0.5 text-xs text-[#111111] focus:bg-white focus:outline-none"
                            />
                          </td>

                          {/* Amount */}
                          <td className="py-0.5 px-2 text-right font-mono font-bold text-xs border-r border-[#7F9EAD] text-[#111111]">
                            Rs. {row.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Store Location */}
                          <td className="py-0.5 px-1 text-center border-r border-[#7F9EAD] text-slate-700 text-[11px] truncate">
                            {currentInvoice.storeLocationName || 'Main Store'}
                          </td>

                          {/* Action */}
                          <td className="py-0.5 px-1 text-center border-l border-[#7F9EAD]">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(row.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                              title="Remove Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Placeholder rows to guarantee at least 10 rows are clearly visible at all times */}
                    {Array.from({ length: Math.max(0, 10 - currentInvoice.items.length) }).map((_, emptyIdx) => {
                      const rowNumber = currentInvoice.items.length + emptyIdx + 1;
                      const rowBg = (currentInvoice.items.length + emptyIdx) % 2 === 0 ? 'bg-white' : 'bg-[#F5FAFD]';
                      return (
                        <tr
                          key={`empty-row-${rowNumber}`}
                          onClick={() => handleAddItem('product')}
                          className={`${rowBg} hover:bg-blue-50/50 border-b border-[#7F9EAD]/30 cursor-pointer text-slate-400 group transition-colors`}
                          title="Click to Add Product Line"
                        >
                          <td className="py-1 px-1 text-center font-mono text-[11px] border-r border-[#7F9EAD]/40 text-slate-400">
                            {rowNumber}
                          </td>
                          <td className="py-1 px-2 border-r border-[#7F9EAD]/40 text-slate-400 italic text-[11px] flex items-center justify-between">
                            <span className="group-hover:text-blue-900 group-hover:font-semibold">-- Empty Row (Click to Add Product) --</span>
                            <Plus className="w-3 h-3 text-slate-300 group-hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </td>
                          <td className="py-1 px-2 border-r border-[#7F9EAD]/40 text-slate-300">--</td>
                          <td className="py-1 px-1.5 text-center border-r border-[#7F9EAD]/40 text-slate-300">--</td>
                          <td className="py-1 px-1 text-center border-r border-[#7F9EAD]/40 text-slate-300">--</td>
                          <td className="py-1 px-1.5 text-right border-r border-[#7F9EAD]/40 text-slate-300 font-mono">0.00</td>
                          <td className="py-1 px-1.5 text-center border-r border-[#7F9EAD]/40 text-slate-300">0</td>
                          <td className="py-1 px-1.5 text-center border-r border-[#7F9EAD]/40 text-slate-300">0%</td>
                          <td className="py-1 px-2 text-right border-r border-[#7F9EAD]/40 text-slate-300 font-mono">0.00</td>
                          <td className="py-1 px-1.5 text-center border-r border-[#7F9EAD]/40 text-slate-300">--</td>
                          <td className="py-1 px-1 text-center border-l border-[#7F9EAD]/40 text-slate-300">
                            <Plus className="w-3 h-3 text-slate-400 mx-auto group-hover:text-blue-700" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ROW 4: COMPACT PAYMENT & FINANCIAL TOTALS (Fixed at Viewport Bottom, Always Visible) */}
            <div className="shrink-0 border border-[#7F9EAD] bg-[#EAF4FA] shadow-2xs p-1 space-y-0.5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-1 items-stretch">
                
                {/* Left Column: Payment Mode, Inputs & Notes (7 cols) */}
                <div className="md:col-span-7 flex flex-col justify-between gap-1 border-b md:border-b-0 md:border-r border-[#7F9EAD]/50 pb-0.5 md:pb-0 md:pr-1.5">
                  {/* Payment Method Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                      <span className="text-[10.5px] font-bold text-slate-800">Payment:</span>
                      <div className="inline-flex rounded-2xs border border-[#7F9EAD] overflow-hidden bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleSelectPaymentMode('Cash')}
                          className={`px-1.5 py-0.2 text-[10.5px] font-bold cursor-pointer transition-colors ${
                            currentInvoice.paymentMethod === 'Cash'
                              ? 'bg-blue-700 text-white'
                              : 'bg-white text-slate-800 hover:bg-blue-50'
                          }`}
                        >
                          Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectPaymentMode('Bank')}
                          className={`px-1.5 py-0.2 text-[10.5px] font-bold border-l border-[#7F9EAD] cursor-pointer transition-colors ${
                            currentInvoice.paymentMethod === 'Bank'
                              ? 'bg-blue-700 text-white'
                              : 'bg-white text-slate-800 hover:bg-blue-50'
                          }`}
                        >
                          Bank
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectPaymentMode('Split')}
                          className={`px-1.5 py-0.2 text-[10.5px] font-bold border-l border-[#7F9EAD] cursor-pointer transition-colors ${
                            currentInvoice.paymentMethod === 'Split / Multi Payment' || currentInvoice.paymentMethod === 'Split'
                              ? 'bg-blue-700 text-white'
                              : 'bg-white text-slate-800 hover:bg-blue-50'
                          }`}
                        >
                          Split / Multi
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectPaymentMode('Credit')}
                          className={`px-1.5 py-0.2 text-[10.5px] font-bold border-l border-[#7F9EAD] cursor-pointer transition-colors ${
                            currentInvoice.paymentMethod === 'Credit / Remaining'
                              ? 'bg-blue-700 text-white'
                              : 'bg-white text-slate-800 hover:bg-blue-50'
                          }`}
                        >
                          Credit
                        </button>
                      </div>
                    </div>
                    <div className="text-[10.5px] font-mono font-bold text-blue-950 bg-white px-1.5 py-0.2 border border-[#7F9EAD]/60 rounded-2xs">
                      {currentInvoice.paymentMethod}
                    </div>
                  </div>

                  {/* Cash / Bank Inputs */}
                  <div className="grid grid-cols-3 gap-1 items-end">
                    <div>
                      <div className="flex items-center justify-between text-[9.5px] font-semibold text-slate-700 mb-0.5">
                        <span>Cash (Rs.)</span>
                        <button
                          type="button"
                          onClick={handleFillRemainingToCash}
                          className="text-[9px] text-blue-800 hover:underline cursor-pointer"
                        >
                          Max
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={currentInvoice.cashReceivedAmount || 0}
                        onChange={(e) => handleCashAmountChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#7F9EAD] px-1 py-0.2 text-xs font-mono font-bold text-emerald-800 text-right focus:outline-none rounded-2xs"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[9.5px] font-semibold text-slate-700 mb-0.5">
                        <span>Bank (Rs.)</span>
                        <button
                          type="button"
                          onClick={handleFillRemainingToBank}
                          className="text-[9px] text-blue-800 hover:underline cursor-pointer"
                        >
                          Max
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={currentInvoice.bankReceivedAmount || 0}
                        onChange={(e) => handleBankAmountChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-[#7F9EAD] px-1 py-0.2 text-xs font-mono font-bold text-blue-900 text-right focus:outline-none rounded-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-semibold text-slate-700 mb-0.5 truncate">
                        Bank Account
                      </label>
                      <select
                        value={currentInvoice.bankAccountId || ''}
                        onChange={(e) => handleBankAccountChange(e.target.value)}
                        className="w-full bg-white border border-[#7F9EAD] px-1 py-0.2 text-[10.5px] text-[#111111] focus:outline-none rounded-2xs truncate"
                      >
                        <option value="" disabled>-- Select Bank --</option>
                        {banks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.bankName} ({b.accountNumber.slice(-4)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes / Terms */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <label className="text-[9.5px] font-semibold text-slate-600 shrink-0">Notes:</label>
                    <input
                      type="text"
                      value={currentInvoice.notes || ''}
                      onChange={(e) => setCurrentInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Transaction terms, internal follow-up notes..."
                      className="flex-1 bg-white border border-[#7F9EAD] px-1.5 py-0.2 text-[10.5px] text-[#111111] focus:outline-none rounded-2xs"
                    />
                  </div>
                </div>

                {/* Right Column: Financial Totals Summary (5 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between pl-0 md:pl-1 text-[10.5px] gap-0.5">
                  <div className="grid grid-cols-3 gap-x-1.5 gap-y-0.5 pb-0.5 border-b border-[#7F9EAD]/40">
                    <div>
                      <span className="text-slate-500 block text-[9.5px]">Subtotal:</span>
                      <span className="font-mono font-semibold text-slate-900 text-xs">
                        Rs. {currentInvoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[9.5px] text-slate-500 mb-0.5">
                        <span>Discount:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextType = currentInvoice.discountType === 'percentage' ? 'fixed' : 'percentage';
                            setCurrentInvoice((prev) => recalculateInvoice({ ...prev, discountType: nextType }));
                          }}
                          className="text-[9px] font-bold px-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] border border-[#7F9EAD] text-blue-900 rounded-2xs cursor-pointer"
                          title="Toggle between % and Rs. discount"
                        >
                          {currentInvoice.discountType === 'percentage' ? '%' : 'Rs'}
                        </button>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          min="0"
                          value={currentInvoice.discountValue || 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                            setCurrentInvoice((prev) => recalculateInvoice({ ...prev, discountValue: val }));
                          }}
                          className="w-12 bg-white border border-[#7F9EAD] px-1 py-0.2 text-[10.5px] font-mono font-semibold text-rose-700 text-right focus:outline-none rounded-2xs"
                        />
                        <span className="font-mono font-semibold text-rose-700 text-[10px] truncate">
                          -Rs.{currentInvoice.overallDiscount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[9.5px] text-slate-500 mb-0.5">
                        <span>Tax (%):</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <input
                          type="number"
                          min="0"
                          value={currentInvoice.taxPercent || 0}
                          onChange={(e) => {
                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                            setCurrentInvoice((prev) => recalculateInvoice({ ...prev, taxPercent: val }));
                          }}
                          className="w-10 bg-white border border-[#7F9EAD] px-1 py-0.2 text-[10.5px] font-mono font-semibold text-slate-800 text-right focus:outline-none rounded-2xs"
                        />
                        <span className="font-mono font-semibold text-slate-800 text-[10px] truncate">
                          +Rs.{currentInvoice.overallTax.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-x-1 items-center pt-0.5">
                    <div>
                      <span className="text-slate-700 block text-[9.5px] font-bold">Total:</span>
                      <span className="font-mono font-bold text-blue-900 text-xs sm:text-[13px]">
                        Rs. {currentInvoice.netInvoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-800 block text-[9.5px] font-bold">Received:</span>
                      <span className="font-mono font-bold text-emerald-800 text-xs sm:text-[13px]">
                        Rs. {(currentInvoice.totalReceivedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-900 block text-[9.5px] font-bold">Remaining:</span>
                      <span className="font-mono font-bold text-red-900 text-xs sm:text-[13px]">
                        Rs. {(currentInvoice.currentInvoiceRemaining || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 5: FIXED BOTTOM ACTIONS TOOLBAR */}
            <div className="shrink-0 bg-[#B3DAEB] border border-[#7F9EAD] px-2 py-0.5 flex flex-wrap items-center justify-between gap-1 shadow-2xs rounded-2xs">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-2xs shadow-2xs cursor-pointer transition-colors"
                >
                  [Save Draft]
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="px-2.5 py-0.5 bg-[#1875B4] hover:bg-[#125D91] border border-blue-900 text-xs font-bold text-white rounded-2xs shadow-2xs cursor-pointer transition-colors"
                >
                  [Save]
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-2xs shadow-2xs cursor-pointer transition-colors"
                >
                  [Preview]
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave(false);
                    setTimeout(() => handlePrint(), 300);
                  }}
                  className="px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-2xs shadow-2xs cursor-pointer transition-colors"
                >
                  [Save &amp; Print]
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomerLedgerOpen(true)}
                  className="px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-blue-900 rounded-2xs shadow-2xs cursor-pointer transition-colors"
                >
                  [View Ledger]
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-2xs shadow-2xs cursor-pointer transition-colors"
                >
                  [Print]
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-2xs shadow-2xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="text-[11px] font-mono font-bold text-slate-700">
                Status: {isDraft ? 'Draft' : 'Saved'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        2. RIGHT SIDE PANEL: SINGLE VERTICAL COLUMN (Quick Actions & Reports)
        ========================================================================
      */}
      <div className="w-full lg:w-[19%] xl:w-[19%] 2xl:w-[19%] shrink-0 min-w-[200px] max-w-[260px] h-full max-h-full flex flex-col gap-1.5 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#BCD2E8] print:hidden">
        
        {/* RIGHT BOX 1: SALE QUICK ACTIONS (Single Vertical Column) */}
        <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xs rounded-xs overflow-hidden flex flex-col shrink-0">
          <div className="bg-[#B3DAEB] border-b border-[#7F9EAD] px-2 py-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-900" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                Sale Quick Actions
              </h3>
            </div>
            <span className="text-[9.5px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.2 rounded-2xs border border-blue-300">
              Actions
            </span>
          </div>

          <div className="p-1.5 flex flex-col gap-1">
            {/* 1. Add New Customer */}
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-blue-800 group-hover:scale-110 transition-transform" />
                <span>Add New Customer</span>
              </div>
              <span className="text-[10px] text-blue-800 font-mono font-bold">+</span>
            </button>

            {/* 2. Add New Product */}
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <PackagePlus className="w-3.5 h-3.5 text-emerald-800 group-hover:scale-110 transition-transform" />
                <span>Add New Product</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-mono font-bold">+</span>
            </button>

            {/* 3. Add New Service */}
            <button
              type="button"
              onClick={() => setIsAddServiceOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-800 group-hover:scale-110 transition-transform" />
                <span>Add New Service</span>
              </div>
              <span className="text-[10px] text-amber-800 font-mono font-bold">+</span>
            </button>

            {/* 4. Customer Ledger */}
            <button
              type="button"
              onClick={() => setIsCustomerLedgerOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-900 group-hover:scale-110 transition-transform" />
                <span>Customer Ledger</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-900" />
            </button>

            {/* 5. Product / Stock */}
            <button
              type="button"
              onClick={() => setIsStockModalOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-indigo-800 group-hover:scale-110 transition-transform" />
                <span>Product / Stock</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-800" />
            </button>

            {/* 6. Sales Return */}
            <button
              type="button"
              onClick={() => setIsSalesReturnModalOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-rose-800 group-hover:scale-110 transition-transform" />
                <span>Sales Return</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-rose-800" />
            </button>

            {/* 7. Quotation */}
            <button
              type="button"
              onClick={() => setIsQuotationModalOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-teal-800 group-hover:scale-110 transition-transform" />
                <span>Quotation</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-800" />
            </button>

            {/* 8. Sales Order */}
            <button
              type="button"
              onClick={() => setIsSalesOrderModalOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-purple-800 group-hover:scale-110 transition-transform" />
                <span>Sales Order</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-purple-800" />
            </button>

            {/* 9. Delivery / Partial Delivery */}
            <button
              type="button"
              onClick={() => setIsDeliveryModalOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-orange-800 group-hover:scale-110 transition-transform" />
                <span>Delivery / Partial Delivery</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-orange-800" />
            </button>
          </div>
        </div>

        {/* RIGHT BOX 2: SALE REPORTS (Single Vertical Column) */}
        <div className="bg-[#D0E7F5] border border-[#7F9EAD] shadow-2xs rounded-xs overflow-hidden flex flex-col shrink-0">
          <div className="bg-[#B3DAEB] border-b border-[#7F9EAD] px-2 py-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-900" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                Sale Reports
              </h3>
            </div>
            <span className="text-[9.5px] text-slate-600 font-semibold font-mono">
              Real-time
            </span>
          </div>

          <div className="p-1.5 flex flex-col gap-1">
            {/* 1. Cash Sale Reports */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCashSaleReport) onOpenCashSaleReport();
                else if (onRouteChange) handleNavigateToRoute('/reports/sales/cash-sale-report', 'Cash Sale Report', 'reports', 'cash-sale-report-menu');
                else showToast('success', 'Opening Cash Sale Reports module...');
              }}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-800 group-hover:scale-110 transition-transform" />
                <span>Cash Sale Reports</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-800" />
            </button>

            {/* 2. Credit Sale Reports */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCreditSaleReport) onOpenCreditSaleReport();
                else if (onRouteChange) handleNavigateToRoute('/reports/sales/credit-sale-report', 'Credit Sale Report', 'reports', 'credit-sale-report-menu');
                else showToast('success', 'Opening Credit Sale Reports module...');
              }}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-800 group-hover:scale-110 transition-transform" />
                <span>Credit Sale Reports</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-800" />
            </button>

            {/* 3. All Sale Reports */}
            <button
              type="button"
              onClick={() => {
                if (onOpenAllSalesReport) onOpenAllSalesReport();
                else if (onRouteChange) handleNavigateToRoute('/reports/sales-reports', 'All Sales Report', 'reports', 'all-sales-report-menu');
                else showToast('success', 'Opening All Sales Reports module...');
              }}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-800 group-hover:scale-110 transition-transform" />
                <span>All Sale Reports</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-800" />
            </button>

            {/* 4. Customer Ledger */}
            <button
              type="button"
              onClick={() => setIsCustomerLedgerOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-800 group-hover:scale-110 transition-transform" />
                <span>Customer Ledger</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-800" />
            </button>

            {/* 5. Accounts Receivable */}
            <button
              type="button"
              onClick={() => setIsAccountsReceivableOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1 bg-[#EAF4FA] hover:bg-[#D7EAF5] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-800 group-hover:scale-110 transition-transform" />
                <span>Accounts Receivable</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-800" />
            </button>
          </div>
        </div>
      </div>
    </div> {/* End Main flex-row: Sale Invoice (~80%) + Right Single Column (~19%) */}

      {/* 
        ========================================================================
        3. MODAL DIALOGS (Connected to right-side buttons and toolbar)
        ========================================================================
      */}

      {/* 1. Add New Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCustomerAdded={(newCust) => {
          setCurrentInvoice((prev) =>
            recalculateInvoice({
              ...prev,
              customerId: newCust.id,
              customerName: newCust.name,
              customerPhone: newCust.phone,
              customerAddress: newCust.address,
              previousBalance: newCust.previousBalance,
            })
          );
          showToast('success', `Customer ${newCust.name} added and selected.`);
        }}
      />

      {/* 2. Add New Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        stores={stores}
        onProductAdded={(newProd) => {
          showToast('success', `Product ${newProd.name} added to stock catalog.`);
        }}
      />

      {/* 3. Add New Service Modal */}
      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        onServiceAdded={(srv) => {
          const newRow: InvoiceItemRow = {
            id: 'row-' + Date.now(),
            itemType: 'service',
            productId: srv.code,
            productName: srv.name,
            description: srv.description,
            unit: 'Job',
            quantity: 1,
            rate: srv.rate,
            discountType: 'fixed',
            discountValue: 0,
            discountAmount: 0,
            taxPercent: 0,
            taxAmount: 0,
            total: srv.rate,
            serviceName: srv.name,
            repairDetails: srv.description,
          };
          setCurrentInvoice((prev) =>
            recalculateInvoice({
              ...prev,
              items: [...prev.items, newRow],
            })
          );
          showToast('success', `Service ${srv.name} added to invoice lines.`);
        }}
      />

      {/* 4. Customer Ledger Modal */}
      <CustomerLedgerModal
        isOpen={isCustomerLedgerOpen}
        onClose={() => setIsCustomerLedgerOpen(false)}
        customerId={currentInvoice.customerId}
        customers={customers}
        onViewTransactionDetails={(inv) => {
          setCurrentInvoice({ ...inv });
          setIsCustomerLedgerOpen(false);
          showToast('success', `Loaded transaction ${inv.invoiceNo} from ledger.`);
        }}
      />

      {/* 5. Product / Stock Overview Modal */}
      <StockOverviewModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        products={products}
        stores={stores}
        stockMovements={salesStore.getStockMovements()}
      />

      {/* 6. Sales Return Modal */}
      <SalesReturnModal
        isOpen={isSalesReturnModalOpen}
        onClose={() => setIsSalesReturnModalOpen(false)}
        invoices={invoices}
        onReturnSaved={(msg) => showToast('success', msg)}
      />

      {/* 7. Quotation Modal */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        currentInvoice={currentInvoice}
        onLoadQuotation={() => showToast('success', 'Quotation converted to active Sale Invoice.')}
      />

      {/* 8. Sales Order Modal */}
      <SalesOrderModal
        isOpen={isSalesOrderModalOpen}
        onClose={() => setIsSalesOrderModalOpen(false)}
        currentInvoice={currentInvoice}
        onLoadOrder={() => showToast('success', 'Sales Order converted to active Sale Invoice.')}
      />

      {/* 9. Delivery Challan Modal */}
      <DeliveryChallanModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        currentInvoice={currentInvoice}
      />

      {/* 10. Accounts Receivable Modal */}
      <AccountsReceivableModal
        isOpen={isAccountsReceivableOpen}
        onClose={() => setIsAccountsReceivableOpen(false)}
        customers={customers}
        onSelectCustomer={(id) => handleCustomerSelect(id)}
      />

      {/* 11. Print Preview Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={currentInvoice}
        onPrint={handlePrint}
      />

      {/* 12. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        invoiceNo={currentInvoice.invoiceNo}
        isDraft={isDraft}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* 13. Audit Password Modal */}
      <AuditPasswordModal
        isOpen={isAuditPasswordModalOpen}
        onClose={() => {
          setIsAuditPasswordModalOpen(false);
          setAuditPendingAction(null);
        }}
        onSuccess={handleAuditVerificationSuccess}
        actionTitle="Delete Sale Invoice"
        actionType="DELETE"
        invoiceNo={currentInvoice.invoiceNo}
      />
    </div>
  );
};
