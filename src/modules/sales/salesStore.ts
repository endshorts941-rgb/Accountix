import {
  SaleInvoice,
  Customer,
  ProductItem,
  StoreLocation,
  BankAccount,
  DayBookEntry,
  CustomerLedgerEntry,
  InvoiceItemRow,
  AuditLogEntry,
  StockMovementEntry,
  ServiceItem,
} from './types';
import {
  INITIAL_INVOICES,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_STORES,
  INITIAL_BANKS,
  INITIAL_SERVICES,
} from './sampleData';
import {
  getCurrentDateDDMMYYYY,
  getFutureDateDDMMYYYY,
  formatToDDMMYYYY,
  getCurrentTimeHHMMSS,
  sortChronologicalAscending,
  compareTransactionsChronologicalAscending,
} from '../../utils/dateUtils';

const STORAGE_KEYS = {
  INVOICES: 'accountix_invoices_v1',
  CUSTOMERS: 'accountix_customers_v1',
  PRODUCTS: 'accountix_products_v1',
  STORES: 'accountix_stores_v1',
  BANKS: 'accountix_banks_v1',
  CASH_BALANCE: 'accountix_cash_balance_v1',
  DAY_BOOK: 'accountix_daybook_v1',
  CUSTOMER_LEDGERS: 'accountix_customer_ledgers_v1',
  AUDIT_LOGS: 'accountix_audit_logs_v1',
  STOCK_MOVEMENTS: 'accountix_stock_movements_v1',
  SERVICES: 'accountix_services_v1',
};

export const getTodayDateString = (): string => {
  return getCurrentDateDDMMYYYY();
};

export const createBlankItemRow = (defaultStoreLocationId: string = 'store-main'): InvoiceItemRow => {
  return {
    id: 'row-' + Math.random().toString(36).substring(2, 9),
    productId: '',
    productName: '',
    description: '',
    unit: 'Pcs',
    quantity: 1,
    rate: 0,
    discountType: 'fixed',
    discountValue: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    total: 0,
    stockNumber: '',
  };
};

export class SalesStoreManager {
  private invoices: SaleInvoice[] = [];
  private customers: Customer[] = [];
  private products: ProductItem[] = [];
  private stores: StoreLocation[] = [];
  private banks: BankAccount[] = [];
  private services: ServiceItem[] = [];
  private cashBalance: number = 45000;
  private dayBook: DayBookEntry[] = [];
  private customerLedgers: CustomerLedgerEntry[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private stockMovements: StockMovementEntry[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      const parsedInvoices: SaleInvoice[] = savedInvoices ? JSON.parse(savedInvoices) : [...INITIAL_INVOICES];
      this.invoices = parsedInvoices.map((inv) => {
        const isCash = inv.saleType === 'Cash Sale';
        const num = inv.invoiceNo.replace(/\D/g, '').padStart(6, '0') || '000001';
        const txnNo = inv.transactionNo || `TXN-${num}`;
        const cashRec = inv.cashReceivedAmount !== undefined ? inv.cashReceivedAmount : (inv.paymentMethod === 'Cash' ? (isCash ? inv.netInvoiceTotal : inv.cashReceivedAtSale) : 0);
        const bankRec = inv.bankReceivedAmount !== undefined ? inv.bankReceivedAmount : (inv.paymentMethod === 'Bank' ? (isCash ? inv.netInvoiceTotal : inv.cashReceivedAtSale) : 0);
        const otherRec = inv.otherReceivedAmount || 0;
        const totRec = inv.totalReceivedAmount !== undefined ? inv.totalReceivedAmount : (cashRec + bankRec + otherRec);
        const rem = inv.remainingBalanceAmount !== undefined ? inv.remainingBalanceAmount : Math.max(0, inv.netInvoiceTotal - totRec);

        return {
          ...inv,
          transactionNo: txnNo,
          exactTime: inv.exactTime || (inv.createdAt && inv.createdAt.includes('T') ? inv.createdAt.substring(11, 19) : '10:00:00'),
          cashReceivedAmount: cashRec,
          bankReceivedAmount: bankRec,
          otherReceivedAmount: otherRec,
          totalReceivedAmount: totRec,
          remainingBalanceAmount: rem,
          invoiceDate: formatToDDMMYYYY(inv.invoiceDate),
          dueDate: inv.dueDate ? formatToDDMMYYYY(inv.dueDate) : formatToDDMMYYYY(inv.invoiceDate),
        };
      });

      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      this.customers = savedCustomers ? JSON.parse(savedCustomers) : [...INITIAL_CUSTOMERS];

      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      this.products = savedProducts ? JSON.parse(savedProducts) : [...INITIAL_PRODUCTS];

      const savedStores = localStorage.getItem(STORAGE_KEYS.STORES);
      this.stores = savedStores ? JSON.parse(savedStores) : [...INITIAL_STORES];

      const savedBanks = localStorage.getItem(STORAGE_KEYS.BANKS);
      this.banks = savedBanks ? JSON.parse(savedBanks) : [...INITIAL_BANKS];

      const savedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
      this.services = savedServices ? JSON.parse(savedServices) : [...INITIAL_SERVICES];

      const savedCash = localStorage.getItem(STORAGE_KEYS.CASH_BALANCE);
      this.cashBalance = savedCash ? parseFloat(savedCash) : 45000;

      const savedDayBook = localStorage.getItem(STORAGE_KEYS.DAY_BOOK);
      const parsedDayBook: DayBookEntry[] = savedDayBook ? JSON.parse(savedDayBook) : this.generateInitialDayBook();
      this.dayBook = parsedDayBook.map((db) => ({
        ...db,
        date: formatToDDMMYYYY(db.date),
      }));

      const savedLedgers = localStorage.getItem(STORAGE_KEYS.CUSTOMER_LEDGERS);
      const parsedLedgers: CustomerLedgerEntry[] = savedLedgers ? JSON.parse(savedLedgers) : this.generateInitialCustomerLedgers();
      this.customerLedgers = parsedLedgers.map((cl) => {
        const matchingInv = this.invoices.find((i) => i.invoiceNo === cl.invoiceNo);
        return {
          ...cl,
          date: formatToDDMMYYYY(cl.date),
          exactTime: cl.exactTime || matchingInv?.exactTime || '10:00:00',
        };
      });

      const savedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = savedAuditLogs ? JSON.parse(savedAuditLogs) : this.generateInitialAuditLogs();

      const savedStockMovements = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
      this.stockMovements = savedStockMovements ? JSON.parse(savedStockMovements) : this.generateInitialStockMovements();
    } catch (e) {
      console.error('Error loading storage, using initial data:', e);
      this.invoices = INITIAL_INVOICES.map((inv) => {
        const isCash = inv.saleType === 'Cash Sale';
        const num = inv.invoiceNo.replace(/\D/g, '').padStart(6, '0') || '000001';
        return {
          ...inv,
          transactionNo: `TXN-${num}`,
          cashReceivedAmount: isCash ? inv.netInvoiceTotal : inv.cashReceivedAtSale,
          bankReceivedAmount: 0,
          otherReceivedAmount: 0,
          totalReceivedAmount: isCash ? inv.netInvoiceTotal : inv.cashReceivedAtSale,
          remainingBalanceAmount: isCash ? 0 : inv.currentInvoiceRemaining,
          invoiceDate: formatToDDMMYYYY(inv.invoiceDate),
          dueDate: inv.dueDate ? formatToDDMMYYYY(inv.dueDate) : formatToDDMMYYYY(inv.invoiceDate),
        };
      });
      this.customers = [...INITIAL_CUSTOMERS];
      this.products = [...INITIAL_PRODUCTS];
      this.stores = [...INITIAL_STORES];
      this.banks = [...INITIAL_BANKS];
      this.services = [...INITIAL_SERVICES];
      this.cashBalance = 45000;
      this.dayBook = this.generateInitialDayBook().map((db) => ({
        ...db,
        date: formatToDDMMYYYY(db.date),
      }));
      this.customerLedgers = this.generateInitialCustomerLedgers().map((cl) => ({
        ...cl,
        date: formatToDDMMYYYY(cl.date),
      }));
      this.auditLogs = this.generateInitialAuditLogs();
      this.stockMovements = this.generateInitialStockMovements();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(this.invoices));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(this.customers));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(this.stores));
      localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(this.banks));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(this.services));
      localStorage.setItem(STORAGE_KEYS.CASH_BALANCE, this.cashBalance.toString());
      localStorage.setItem(STORAGE_KEYS.DAY_BOOK, JSON.stringify(this.dayBook));
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_LEDGERS, JSON.stringify(this.customerLedgers));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(this.stockMovements));
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
    this.notify();
  }

  private generateInitialStockMovements(): StockMovementEntry[] {
    return [
      {
        id: 'sm-init-1',
        date: '15/09/2026',
        productId: 'prod-2',
        productName: 'Logitech Wireless Mouse',
        storeLocationId: 'store-main',
        storeLocationName: 'Main Store',
        invoiceNo: 'SI-0001',
        transactionNo: 'TXN-000001',
        quantityChange: -2,
        remainingStock: 148,
        movementType: 'SALE',
        notes: 'Cash Sale SI-0001',
      },
      {
        id: 'sm-init-2',
        date: '16/09/2026',
        productId: 'prod-1',
        productName: 'Dell Latitude Core i7 Laptop',
        storeLocationId: 'store-main',
        storeLocationName: 'Main Store',
        invoiceNo: 'SI-0002',
        transactionNo: 'TXN-000002',
        quantityChange: -1,
        remainingStock: 24,
        movementType: 'SALE',
        notes: 'Credit Sale SI-0002 (Ali Trader)',
      },
      {
        id: 'sm-init-3',
        date: '17/09/2026',
        productId: 'prod-5',
        productName: 'Super Kernel Basmati Rice (50kg)',
        storeLocationId: 'store-wh-a',
        storeLocationName: 'Warehouse A',
        invoiceNo: 'SI-0003',
        transactionNo: 'TXN-000003',
        quantityChange: -10,
        remainingStock: 120,
        movementType: 'SALE',
        notes: 'Cash Sale SI-0003',
      },
    ];
  }

  private generateInitialAuditLogs(): AuditLogEntry[] {
    return [
      {
        id: 'audit-1',
        transactionNo: 'TXN-CS-0001',
        invoiceNo: 'SI-0001',
        action: 'CREATE',
        user: 'Ali Khan (Cashier)',
        dateTime: '15/09/2026 10:15:00',
        details: 'Recorded Cash Sale for Logitech Wireless Mouse (2 pcs). Full cash payment received.',
      },
      {
        id: 'audit-2',
        transactionNo: 'TXN-CR-0002',
        invoiceNo: 'SI-0002',
        action: 'CREATE',
        user: 'Ali Khan',
        dateTime: '16/09/2026 14:30:00',
        details: 'Created Credit Sale for Ali Trader with partial cash Rs. 27,500. Ledger updated.',
      },
      {
        id: 'audit-3',
        transactionNo: 'TXN-CS-0003',
        invoiceNo: 'SI-0003',
        action: 'CREATE',
        user: 'Ali Khan',
        dateTime: '17/09/2026 11:00:00',
        details: 'Bank payment received via Meezan Bank for Super Kernel Basmati Rice (10 bags).',
      },
    ];
  }

  private generateInitialDayBook(): DayBookEntry[] {
    return [
      {
        id: 'db-1',
        date: '2026-09-15',
        voucherNo: 'CPV-001',
        invoiceNo: 'SI-0001',
        accountName: 'Cash in Hand',
        accountCode: '1001',
        description: 'Cash Sale against SI-0001',
        debit: 3000,
        credit: 0,
      },
      {
        id: 'db-2',
        date: '2026-09-15',
        voucherNo: 'CPV-001',
        invoiceNo: 'SI-0001',
        accountName: 'Sales Revenue',
        accountCode: '4001',
        description: 'Sale of Logitech Wireless Mouse (2 pcs)',
        debit: 0,
        credit: 3000,
      },
      {
        id: 'db-3',
        date: '2026-09-16',
        voucherNo: 'CRV-002',
        invoiceNo: 'SI-0002',
        accountName: 'Cash in Hand',
        accountCode: '1001',
        description: 'Partial Cash received on Credit Sale SI-0002 (Ali Trader)',
        debit: 27500,
        credit: 0,
      },
      {
        id: 'db-4',
        date: '2026-09-16',
        voucherNo: 'JV-002',
        invoiceNo: 'SI-0002',
        accountName: 'Accounts Receivable - Ali Trader',
        accountCode: '1051',
        description: 'Credit Sale Balance SI-0002',
        debit: 70000,
        credit: 0,
      },
      {
        id: 'db-5',
        date: '2026-09-16',
        voucherNo: 'JV-002',
        invoiceNo: 'SI-0002',
        accountName: 'Sales Revenue',
        accountCode: '4001',
        description: 'Credit Sale Dell Latitude Core i7 Laptop',
        debit: 0,
        credit: 97500,
      },
    ];
  }

  private generateInitialCustomerLedgers(): CustomerLedgerEntry[] {
    return [
      {
        id: 'cl-1',
        customerId: 'cust-1',
        date: '2026-09-01',
        invoiceNo: 'OB-001',
        description: 'Opening Balance',
        debit: 50000,
        credit: 0,
        balance: 50000,
      },
      {
        id: 'cl-2',
        customerId: 'cust-1',
        date: '2026-09-16',
        invoiceNo: 'SI-0002',
        description: 'Credit Sale Dell Latitude Laptop (SI-0002)',
        debit: 97500,
        credit: 27500,
        balance: 120000,
      },
    ];
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters - Default to ACCOUNTIX Global Chronological Ascending Order (Oldest -> Newest)
  public getInvoices(): SaleInvoice[] {
    return sortChronologicalAscending(this.invoices);
  }

  public getInvoiceById(id: string): SaleInvoice | undefined {
    return this.invoices.find((inv) => inv.id === id);
  }

  public getInvoiceByIndex(index: number): SaleInvoice | undefined {
    const sorted = sortChronologicalAscending(this.invoices);
    if (index >= 0 && index < sorted.length) {
      return sorted[index];
    }
    return undefined;
  }

  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  public getProducts(): ProductItem[] {
    return [...this.products];
  }

  public getProductById(id: string): ProductItem | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getStores(): StoreLocation[] {
    return [...this.stores];
  }

  public getBanks(): BankAccount[] {
    return [...this.banks];
  }

  public getServices(): ServiceItem[] {
    return [...this.services];
  }

  public getServiceById(id: string): ServiceItem | undefined {
    return this.services.find((s) => s.id === id);
  }

  public getCashBalance(): number {
    return this.cashBalance;
  }

  public getDayBook(): DayBookEntry[] {
    return sortChronologicalAscending(this.dayBook);
  }

  public getCustomerLedgers(): CustomerLedgerEntry[] {
    return sortChronologicalAscending(this.customerLedgers);
  }

  public addCustomer(data: { name: string; phone?: string; address?: string; previousBalance?: number; creditLimit?: number }): Customer {
    const id = 'cust-' + Date.now();
    const newCustomer: Customer = {
      id,
      name: data.name,
      phone: data.phone || '',
      address: data.address || '',
      previousBalance: data.previousBalance || 0,
      creditLimit: data.creditLimit || 50000,
    };
    this.customers.push(newCustomer);
    this.saveToStorage();
    this.notify();
    return newCustomer;
  }

  public addProduct(data: { name: string; code?: string; unit?: string; salePrice?: number; costPrice?: number; initialStock?: number; storeId?: string }): ProductItem {
    const id = 'prod-' + Date.now();
    const defaultStoreId = data.storeId || (this.stores[0]?.id || 'store-main');
    const newProduct: ProductItem = {
      id,
      name: data.name,
      code: data.code || `PRD-${String(this.products.length + 1).padStart(4, '0')}`,
      description: data.name,
      unit: data.unit || 'Pcs',
      salePrice: data.salePrice || 1000,
      costPrice: data.costPrice || 800,
      stockByStore: {
        [defaultStoreId]: data.initialStock || 50,
      },
    };
    this.products.push(newProduct);
    this.saveToStorage();
    this.notify();
    return newProduct;
  }

  public addService(data: { name: string; code?: string; unit?: string; rate: number; description?: string; category?: string }): ServiceItem {
    const id = 'serv-' + Date.now();
    const newService: ServiceItem = {
      id,
      name: data.name,
      code: data.code || `SRV-${String(this.services.length + 101).padStart(3, '0')}`,
      description: data.description || data.name,
      unit: data.unit || 'Job',
      rate: data.rate || 0,
      category: data.category || 'General Service',
    };
    this.services.push(newService);
    this.saveToStorage();
    this.notify();
    return newService;
  }

  // Next auto-generated invoice number
  public getNextInvoiceNumber(): string {
    let maxNumber = 0;
    this.invoices.forEach((inv) => {
      const match = inv.invoiceNo.match(/SI-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    const nextNum = maxNumber + 1;
    return `SI-${String(nextNum).padStart(4, '0')}`;
  }

  // Next auto-generated transaction number, e.g. TXN-000001
  public getNextTransactionNumber(saleType: 'Cash Sale' | 'Credit Sale' = 'Credit Sale'): string {
    let maxNumber = 0;
    this.invoices.forEach((inv) => {
      if (inv.transactionNo) {
        const match = inv.transactionNo.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    });
    const nextNum = maxNumber + 1;
    return `TXN-${String(nextNum).padStart(6, '0')}`;
  }

  // Create a brand new blank invoice draft
  public createBlankInvoiceDraft(saleType: 'Cash Sale' | 'Credit Sale' = 'Cash Sale'): SaleInvoice {
    const nextNo = this.getNextInvoiceNumber();
    const nextTxnNo = this.getNextTransactionNumber(saleType);
    const today = getTodayDateString();
    const defaultStore = this.stores[0] || INITIAL_STORES[0];

    return {
      id: 'inv-draft-' + Date.now(),
      invoiceNo: nextNo,
      transactionNo: nextTxnNo,
      invoiceDate: today,
      saleType,
      customerName: '',
      customerId: undefined,
      customerAddress: '',
      storeLocationId: defaultStore.id,
      storeLocationName: defaultStore.name,
      paymentMethod: 'Cash',
      items: [createBlankItemRow(defaultStore.id)],
      subtotal: 0,
      discountType: 'fixed',
      discountValue: 0,
      overallDiscount: 0,
      taxPercent: 0,
      overallTax: 0,
      netInvoiceTotal: 0,
      previousBalance: 0,
      cashReceivedAtSale: 0,
      cashReceivedAmount: 0,
      bankReceivedAmount: 0,
      otherReceivedAmount: 0,
      totalReceivedAmount: 0,
      remainingBalanceAmount: 0,
      currentInvoiceRemaining: 0,
      finalCustomerBalance: 0,
      status: saleType === 'Cash Sale' ? 'PAID IN FULL' : 'UNPAID CREDIT',
      notes: 'Thank you for your business!',
      dueDate: getFutureDateDDMMYYYY(15),
      salesman: 'Ali Khan',
      reference: '',
      exactTime: getCurrentTimeHHMMSS(),
      createdAt: new Date().toISOString(),
    };
  }

  // Save an invoice with full multi-module accounting and stock integration
  public saveInvoice(invoice: SaleInvoice): { success: boolean; message: string; savedInvoice?: SaleInvoice } {
    // 1. Validation
    if (!invoice.storeLocationId) {
      return { success: false, message: 'Please select a Store Location.' };
    }

    if (!invoice.items || invoice.items.length === 0) {
      return { success: false, message: 'At least one product item is required.' };
    }

    const validItems = invoice.items.filter((item) => (item.productId || item.productName || item.serviceName) && item.quantity > 0);
    if (validItems.length === 0) {
      return { success: false, message: 'Please enter at least one valid product or service line with quantity > 0.' };
    }

    if (invoice.saleType === 'Credit Sale') {
      if (!invoice.customerId && !invoice.customerName?.trim()) {
        return { success: false, message: 'Customer selection is REQUIRED for Credit Sale.' };
      }
    }

    const initialBank = invoice.bankReceivedAmount !== undefined
      ? Math.max(0, invoice.bankReceivedAmount)
      : (invoice.paymentMethod === 'Bank' ? invoice.netInvoiceTotal : 0);

    if (initialBank > 0 || invoice.paymentMethod === 'Bank') {
      if (!invoice.bankAccountId) {
        return { success: false, message: 'Please select a Bank Account when Bank payment amount is greater than zero.' };
      }
    }

    // 2. Check if editing an existing invoice
    const existingIndex = this.invoices.findIndex(
      (inv) => inv.id === invoice.id || inv.invoiceNo === invoice.invoiceNo
    );
    const isEdit = existingIndex >= 0;
    const prevInvoice = isEdit ? { ...this.invoices[existingIndex] } : undefined;

    // IF EDIT: Revert previous stock deduction, ledger, day book, cash/bank BEFORE applying new changes
    if (isEdit && prevInvoice) {
      // 2a. Revert previous stock deduction
      if (prevInvoice.items && prevInvoice.storeLocationId) {
        prevInvoice.items.forEach((item) => {
          if (item.itemType !== 'service' && item.productId && item.quantity > 0) {
            const prod = this.products.find((p) => p.id === item.productId || p.name === item.productName);
            if (prod && prod.stockByStore) {
              const currentStock = prod.stockByStore[prevInvoice.storeLocationId] || 0;
              prod.stockByStore[prevInvoice.storeLocationId] = currentStock + item.quantity;
            }
          }
        });
      }

      // 2b. Revert previous customer ledger & previous balance if Credit Sale
      if (prevInvoice.saleType === 'Credit Sale' && prevInvoice.customerId) {
        const cust = this.customers.find((c) => c.id === prevInvoice.customerId);
        if (cust) {
          const prevRemaining = prevInvoice.remainingBalanceAmount !== undefined
            ? prevInvoice.remainingBalanceAmount
            : prevInvoice.currentInvoiceRemaining;
          cust.previousBalance = Math.max(0, cust.previousBalance - (prevRemaining || 0));
        }
        this.customerLedgers = this.customerLedgers.filter((cl) => cl.invoiceNo !== prevInvoice.invoiceNo);
      }

      // 2c. Revert previous cash/bank received balances
      const prevCash = prevInvoice.cashReceivedAmount !== undefined
        ? prevInvoice.cashReceivedAmount
        : (prevInvoice.paymentMethod === 'Cash' ? (prevInvoice.saleType === 'Cash Sale' ? prevInvoice.netInvoiceTotal : prevInvoice.cashReceivedAtSale) : 0);
      const prevBank = prevInvoice.bankReceivedAmount !== undefined
        ? prevInvoice.bankReceivedAmount
        : (prevInvoice.paymentMethod === 'Bank' ? (prevInvoice.saleType === 'Cash Sale' ? prevInvoice.netInvoiceTotal : prevInvoice.cashReceivedAtSale) : 0);

      if (prevCash > 0) {
        this.cashBalance = Math.max(0, this.cashBalance - prevCash);
      }
      if (prevBank > 0 && prevInvoice.bankAccountId) {
        const targetBank = this.banks.find((b) => b.id === prevInvoice.bankAccountId);
        if (targetBank) {
          targetBank.balance = Math.max(0, targetBank.balance - prevBank);
        }
      }

      // 2d. Remove previous Day Book entries
      this.dayBook = this.dayBook.filter((db) => db.invoiceNo !== prevInvoice.invoiceNo);

      // 2e. Remove previous stock movements
      this.stockMovements = this.stockMovements.filter((sm) => sm.invoiceNo !== prevInvoice.invoiceNo);
    }

    // 3. Prepare Final Cleaned Invoice
    const cleanItems = validItems.map((item) => ({ ...item }));
    const store = this.stores.find((s) => s.id === invoice.storeLocationId) || this.stores[0];
    const bank = invoice.bankAccountId ? this.banks.find((b) => b.id === invoice.bankAccountId) : undefined;

    const isCash = invoice.saleType === 'Cash Sale';
    const txnNo = invoice.transactionNo || prevInvoice?.transactionNo || this.getNextTransactionNumber(invoice.saleType);

    // Multi-payment split calculations
    let cashRec = 0;
    let bankRec = 0;

    if (invoice.paymentMethod === 'Cash' && invoice.cashReceivedAmount === undefined && invoice.bankReceivedAmount === undefined) {
      cashRec = isCash ? invoice.netInvoiceTotal : (invoice.cashReceivedAtSale || 0);
      bankRec = 0;
    } else if (invoice.paymentMethod === 'Bank' && invoice.bankReceivedAmount === undefined && invoice.cashReceivedAmount === undefined) {
      bankRec = isCash ? invoice.netInvoiceTotal : (invoice.cashReceivedAtSale || 0);
      cashRec = 0;
    } else {
      cashRec = Math.max(0, invoice.cashReceivedAmount ?? 0);
      bankRec = Math.max(0, invoice.bankReceivedAmount ?? 0);
    }

    const otherRec = Math.max(0, invoice.otherReceivedAmount || 0);
    const totalRec = cashRec + bankRec + otherRec;

    // Do not allow Total Received to exceed the invoice total
    if (totalRec > invoice.netInvoiceTotal) {
      return {
        success: false,
        message: `Total Received (Rs. ${totalRec.toLocaleString()}) cannot exceed the Net Invoice Total (Rs. ${invoice.netInvoiceTotal.toLocaleString()}).`,
      };
    }

    if (bankRec > 0 && !invoice.bankAccountId) {
      return {
        success: false,
        message: 'Please select a Bank Account whenever Bank payment amount is greater than zero.',
      };
    }

    const remainingAmount = Math.max(0, invoice.netInvoiceTotal - totalRec);

    // Auto-detect Payment Method if multi-split
    let derivedPaymentMethod = invoice.paymentMethod;
    if (cashRec > 0 && bankRec > 0) {
      derivedPaymentMethod = 'Split / Multi Payment';
    } else if (cashRec > 0 && bankRec === 0 && (remainingAmount === 0 || isCash)) {
      derivedPaymentMethod = 'Cash';
    } else if (bankRec > 0 && cashRec === 0 && (remainingAmount === 0 || isCash)) {
      derivedPaymentMethod = 'Bank';
    } else if (totalRec === 0 && remainingAmount > 0) {
      derivedPaymentMethod = 'Credit / Remaining';
    } else if ((cashRec > 0 || bankRec > 0) && remainingAmount > 0) {
      derivedPaymentMethod = 'Split / Multi Payment';
    }

    // Status determination
    let status: 'PAID IN FULL' | 'PARTIAL CREDIT' | 'UNPAID CREDIT' = 'PAID IN FULL';
    if (remainingAmount === 0) {
      status = 'PAID IN FULL';
    } else if (totalRec > 0) {
      status = 'PARTIAL CREDIT';
    } else {
      status = 'UNPAID CREDIT';
    }

    // Customer previous and new balance
    let custPrevBalance = invoice.previousBalance || 0;
    if (invoice.saleType === 'Credit Sale' && invoice.customerId) {
      const cust = this.customers.find((c) => c.id === invoice.customerId);
      if (cust) {
        custPrevBalance = cust.previousBalance;
      }
    }
    const finalCustBalance = custPrevBalance + remainingAmount;

    const now = new Date();
    const capturedTime = invoice.exactTime || getCurrentTimeHHMMSS(now);

    let finalInvoice: SaleInvoice = {
      ...invoice,
      paymentMethod: derivedPaymentMethod,
      transactionNo: txnNo,
      invoiceDate: formatToDDMMYYYY(invoice.invoiceDate),
      exactTime: capturedTime,
      dueDate: invoice.dueDate ? formatToDDMMYYYY(invoice.dueDate) : formatToDDMMYYYY(invoice.invoiceDate),
      storeLocationName: store ? store.name : invoice.storeLocationName,
      bankName: bank ? bank.bankName : undefined,
      items: cleanItems,
      cashReceivedAtSale: totalRec,
      cashReceivedAmount: cashRec,
      bankReceivedAmount: bankRec,
      otherReceivedAmount: otherRec,
      totalReceivedAmount: totalRec,
      remainingBalanceAmount: remainingAmount,
      currentInvoiceRemaining: remainingAmount,
      previousBalance: custPrevBalance,
      finalCustomerBalance: finalCustBalance,
      status,
      createdAt: invoice.createdAt || now.toISOString(),
    };

    // 4. Deduct Stock from Selected Store Location & Record Stock Movement
    cleanItems.forEach((item) => {
      if (item.itemType === 'service') return;
      const prod = this.products.find((p) => p.id === item.productId || p.name === item.productName);
      if (prod) {
        const currentStoreStock = prod.stockByStore[finalInvoice.storeLocationId] || 0;
        const newStock = Math.max(0, currentStoreStock - item.quantity);
        prod.stockByStore[finalInvoice.storeLocationId] = newStock;

        this.stockMovements.unshift({
          id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          date: finalInvoice.invoiceDate,
          productId: prod.id,
          productName: prod.name,
          storeLocationId: finalInvoice.storeLocationId,
          storeLocationName: finalInvoice.storeLocationName,
          invoiceNo: finalInvoice.invoiceNo,
          transactionNo: finalInvoice.transactionNo || 'TXN-' + finalInvoice.invoiceNo,
          quantityChange: -item.quantity,
          remainingStock: newStock,
          movementType: 'SALE',
          notes: `${finalInvoice.saleType} invoice ${finalInvoice.invoiceNo} [Txn: ${finalInvoice.transactionNo}]`,
        });
      }
    });

    // 5. Update Customer Ledger & Customer Balance
    if (finalInvoice.saleType === 'Credit Sale' && finalInvoice.customerId) {
      const cust = this.customers.find((c) => c.id === finalInvoice.customerId);
      if (cust) {
        cust.previousBalance = finalInvoice.finalCustomerBalance;

        const itemsSummary = finalInvoice.items
          .map((i) => `${i.productName} (${i.quantity} ${i.unit} @ Rs. ${i.rate})`)
          .join(', ');
        const totalQty = finalInvoice.items.reduce((s, i) => s + (i.quantity || 0), 0);

        const ledgerEntry: CustomerLedgerEntry = {
          id: 'cl-' + Date.now(),
          customerId: cust.id,
          customerName: cust.name,
          date: finalInvoice.invoiceDate,
          exactTime: finalInvoice.exactTime,
          invoiceNo: finalInvoice.invoiceNo,
          transactionNo: finalInvoice.transactionNo || 'TXN-' + finalInvoice.invoiceNo,
          description: `Credit Sale: ${itemsSummary}`,
          debit: finalInvoice.netInvoiceTotal,
          credit: totalRec,
          balance: finalInvoice.finalCustomerBalance,
          storeLocationName: finalInvoice.storeLocationName,
          paymentMethod: finalInvoice.paymentMethod,
          itemsSummary,
          totalQty,
          subtotal: finalInvoice.subtotal,
          discountAmount: finalInvoice.overallDiscount,
          taxAmount: finalInvoice.overallTax,
          cashReceived: cashRec,
          bankReceived: bankRec,
          remainingAmount: remainingAmount,
          notes: finalInvoice.notes,
        };
        this.customerLedgers.push(ledgerEntry);
      }
    }
    // ACCOUNTIX Global Rule: For Cash Sale, entering/typing a customer name NEVER creates
    // a Customer Account, Customer Ledger, Customer Receivable, or Customer Master Record.
    // Customer Name on Cash Sale is strictly an invoice display/reference name.
    // Cash Sale -> Cash/Bank, Customer account/ledger -> NONE.

    // 6. Update Cash / Bank Accounts
    if (cashRec > 0) {
      this.cashBalance += cashRec;
    }
    if (bankRec > 0 && finalInvoice.bankAccountId) {
      const targetBank = this.banks.find((b) => b.id === finalInvoice.bankAccountId);
      if (targetBank) {
        targetBank.balance += bankRec;
      }
    }

    // 7. Create Double-Entry Day Book Records (Requirement #8)
    const voucherNo = 'VOUCH-' + finalInvoice.invoiceNo.replace('SI-', '');
    if (finalInvoice.saleType === 'Cash Sale') {
      // 1. Cash Portion Received (Debit)
      if (cashRec > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-cash',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: 'Cash in Hand (1001)',
          accountCode: '1001',
          description: `Cash payment received against ${finalInvoice.invoiceNo}${finalInvoice.customerName?.trim() ? ` (${finalInvoice.customerName})` : ''}`,
          debit: cashRec,
          credit: 0,
        });
      }

      // 2. Bank Portion Received (Debit)
      if (bankRec > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-bank',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: `${finalInvoice.bankName || 'Bank Account'} (1002)`,
          accountCode: '1002',
          description: `Bank payment received against ${finalInvoice.invoiceNo}${finalInvoice.customerName?.trim() ? ` (${finalInvoice.customerName})` : ''}`,
          debit: bankRec,
          credit: 0,
        });
      }

      // 3. Sales Discount Allowed (Debit, if applicable)
      if (finalInvoice.overallDiscount > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-disc',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: 'Sales Discount Allowed (5050)',
          accountCode: '5050',
          description: `Sales discount allowed on ${finalInvoice.invoiceNo}`,
          debit: finalInvoice.overallDiscount,
          credit: 0,
        });
      }

      // 3. Sales Tax Payable (Credit, if applicable)
      if (finalInvoice.overallTax > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-tax',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: 'Sales Tax Payable (2020)',
          accountCode: '2020',
          description: `Output sales tax on ${finalInvoice.invoiceNo}`,
          debit: 0,
          credit: finalInvoice.overallTax,
        });
      }

      // 4. Sales Revenue (Credit)
      this.dayBook.push({
        id: 'db-' + Date.now() + '-2',
        date: finalInvoice.invoiceDate,
        voucherNo,
        invoiceNo: finalInvoice.invoiceNo,
        accountName: 'Sales Revenue (4001)',
        accountCode: '4001',
        description: `Sales revenue for ${finalInvoice.invoiceNo}`,
        debit: 0,
        credit: (finalInvoice.overallDiscount > 0 || finalInvoice.overallTax > 0)
          ? finalInvoice.subtotal
          : finalInvoice.netInvoiceTotal,
      });
    } else {
      // Credit Sale Accounting Entries:
      // 1. Customer/Receivable → Debit
      this.dayBook.push({
        id: 'db-' + Date.now() + '-1',
        date: finalInvoice.invoiceDate,
        voucherNo,
        invoiceNo: finalInvoice.invoiceNo,
        accountName: `Accounts Receivable - ${finalInvoice.customerName} (1050)`,
        accountCode: '1050',
        description: `Credit Sale invoice ${finalInvoice.invoiceNo} [Txn: ${finalInvoice.transactionNo}]`,
        debit: finalInvoice.netInvoiceTotal,
        credit: 0,
      });

      // 2. Sales Discount → Debit, if applicable
      if (finalInvoice.overallDiscount > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-disc',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: 'Sales Discount Allowed (5050)',
          accountCode: '5050',
          description: `Sales discount allowed on ${finalInvoice.invoiceNo}`,
          debit: finalInvoice.overallDiscount,
          credit: 0,
        });
      }

      // 3. Tax Payable → Credit, if applicable
      if (finalInvoice.overallTax > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-tax',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: 'Sales Tax Payable (2020)',
          accountCode: '2020',
          description: `Output sales tax on ${finalInvoice.invoiceNo}`,
          debit: 0,
          credit: finalInvoice.overallTax,
        });
      }

      // 4. Sales Revenue → Credit (Subtotal)
      this.dayBook.push({
        id: 'db-' + Date.now() + '-rev',
        date: finalInvoice.invoiceDate,
        voucherNo,
        invoiceNo: finalInvoice.invoiceNo,
        accountName: 'Sales Revenue (4001)',
        accountCode: '4001',
        description: `Credit sales revenue for ${finalInvoice.invoiceNo}`,
        debit: 0,
        credit: finalInvoice.subtotal,
      });

      // 5. If payment is received at the time of sale:
      // Cash/Bank → Debit, Customer/Receivable → Credit
      if (cashRec > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-cash',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: 'Cash in Hand (1001)',
          accountCode: '1001',
          description: `Cash received at Credit Sale ${finalInvoice.invoiceNo} (${finalInvoice.customerName})`,
          debit: cashRec,
          credit: 0,
        });
        this.dayBook.push({
          id: 'db-' + Date.now() + '-rec-c',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: `Accounts Receivable - ${finalInvoice.customerName} (1050)`,
          accountCode: '1050',
          description: `Cash settlement credit against ${finalInvoice.invoiceNo}`,
          debit: 0,
          credit: cashRec,
        });
      }

      if (bankRec > 0) {
        this.dayBook.push({
          id: 'db-' + Date.now() + '-bank',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: `${finalInvoice.bankName || 'Bank Account'} (1002)`,
          accountCode: '1002',
          description: `Bank payment received at Credit Sale ${finalInvoice.invoiceNo} (${finalInvoice.customerName})`,
          debit: bankRec,
          credit: 0,
        });
        this.dayBook.push({
          id: 'db-' + Date.now() + '-rec-b',
          date: finalInvoice.invoiceDate,
          voucherNo,
          invoiceNo: finalInvoice.invoiceNo,
          accountName: `Accounts Receivable - ${finalInvoice.customerName} (1050)`,
          accountCode: '1050',
          description: `Bank settlement credit against ${finalInvoice.invoiceNo}`,
          debit: 0,
          credit: bankRec,
        });
      }
    }

    // 8. Save or Update Invoice in List
    if (isEdit) {
      this.invoices[existingIndex] = finalInvoice;
      this.addAuditLog({
        transactionNo: finalInvoice.transactionNo || `TXN-${String(this.invoices.length).padStart(6, '0')}`,
        invoiceNo: finalInvoice.invoiceNo || 'INV-UNKNOWN',
        action: 'EDIT',
        user: finalInvoice.salesman || 'Audit User',
        dateTime: new Date().toLocaleString(),
        details: `Updated ${finalInvoice.saleType} ${finalInvoice.invoiceNo} (Net Total: Rs. ${finalInvoice.netInvoiceTotal.toLocaleString()}, Remaining: Rs. ${finalInvoice.remainingBalanceAmount?.toLocaleString()})`,
        previousData: prevInvoice,
        newData: finalInvoice,
      });
    } else {
      this.invoices.push(finalInvoice);
      this.addAuditLog({
        transactionNo: finalInvoice.transactionNo || `TXN-${String(this.invoices.length).padStart(6, '0')}`,
        invoiceNo: finalInvoice.invoiceNo || 'INV-UNKNOWN',
        action: 'CREATE',
        user: finalInvoice.salesman || 'Ali Khan',
        dateTime: new Date().toLocaleString(),
        details: `Created new ${finalInvoice.saleType} ${finalInvoice.invoiceNo} (Amount: Rs. ${finalInvoice.netInvoiceTotal.toLocaleString()}, Customer: ${finalInvoice.customerName || 'Walk-in'})`,
        newData: finalInvoice,
      });
    }

    this.saveToStorage();

    return {
      success: true,
      message: `${finalInvoice.saleType} ${finalInvoice.invoiceNo} saved successfully! Stock, Day Book & Customer Ledgers updated.`,
      savedInvoice: finalInvoice,
    };
  }

  // Delete an invoice with complete reversal of stock, customer ledger, and Day Book
  public deleteInvoice(idOrInvoiceNo: string, auditUser: string = 'Audit Admin'): { success: boolean; message: string } {
    const index = this.invoices.findIndex(
      (inv) => inv.id === idOrInvoiceNo || inv.invoiceNo === idOrInvoiceNo
    );

    if (index === -1) {
      return { success: false, message: 'Transaction / Invoice not found in saved records.' };
    }

    const inv = this.invoices[index];

    // 1. Revert Stock in the specific Store Location & record stock movement reversal
    if (inv.items && inv.storeLocationId) {
      inv.items.forEach((item) => {
        if (item.productId && item.quantity > 0) {
          const product = this.products.find((p) => p.id === item.productId);
          if (product && product.stockByStore) {
            const currentStock = product.stockByStore[inv.storeLocationId] || 0;
            const newStock = currentStock + item.quantity;
            product.stockByStore[inv.storeLocationId] = newStock;

            this.stockMovements.unshift({
              id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              date: getTodayDateString(),
              productId: product.id,
              productName: product.name,
              storeLocationId: inv.storeLocationId,
              storeLocationName: inv.storeLocationName,
              invoiceNo: inv.invoiceNo,
              transactionNo: inv.transactionNo || 'TXN-' + inv.invoiceNo,
              quantityChange: item.quantity,
              remainingStock: newStock,
              movementType: 'SALE_REVERSAL',
              notes: `Stock restored on deletion of ${inv.saleType} ${inv.invoiceNo}`,
            });
          }
        }
      });
    }

    // 2. Revert Customer Ledger & Customer Balance if Credit Sale
    if (inv.saleType === 'Credit Sale' && inv.customerId) {
      const customer = this.customers.find((c) => c.id === inv.customerId);
      if (customer) {
        const remainingToRevert = inv.remainingBalanceAmount !== undefined ? inv.remainingBalanceAmount : inv.currentInvoiceRemaining;
        customer.previousBalance = Math.max(0, customer.previousBalance - remainingToRevert);
      }
      this.customerLedgers = this.customerLedgers.filter((cl) => cl.invoiceNo !== inv.invoiceNo);
    }

    // 3. Revert Cash / Bank Balance
    const cashToRevert = inv.cashReceivedAmount !== undefined
      ? inv.cashReceivedAmount
      : (inv.paymentMethod === 'Cash' ? (inv.saleType === 'Cash Sale' ? inv.netInvoiceTotal : inv.cashReceivedAtSale) : 0);
    const bankToRevert = inv.bankReceivedAmount !== undefined
      ? inv.bankReceivedAmount
      : (inv.paymentMethod === 'Bank' ? (inv.saleType === 'Cash Sale' ? inv.netInvoiceTotal : inv.cashReceivedAtSale) : 0);

    if (cashToRevert > 0) {
      this.cashBalance = Math.max(0, this.cashBalance - cashToRevert);
    }
    if (bankToRevert > 0 && inv.bankAccountId) {
      const bank = this.banks.find((b) => b.id === inv.bankAccountId);
      if (bank) {
        bank.balance = Math.max(0, bank.balance - bankToRevert);
      }
    }

    // 4. Remove Day Book entries for this invoice
    this.dayBook = this.dayBook.filter((db) => db.invoiceNo !== inv.invoiceNo);

    // 5. Audit Log Deletion
    this.addAuditLog({
      transactionNo: inv.transactionNo || `TXN-${inv.invoiceNo}`,
      invoiceNo: inv.invoiceNo,
      action: 'DELETE',
      user: auditUser,
      dateTime: new Date().toLocaleString(),
      details: `Deleted ${inv.saleType} ${inv.invoiceNo} (Amount: Rs. ${inv.netInvoiceTotal.toLocaleString()}). Stock, Day Book & Customer Ledgers reversed.`,
      previousData: inv,
    });

    // 6. Remove Invoice from List
    this.invoices.splice(index, 1);

    this.saveToStorage();

    return {
      success: true,
      message: `Transaction ${inv.invoiceNo} has been deleted successfully. Stock & Ledgers reversed.`,
    };
  }

  // Duplicate an existing invoice into a new transaction
  public duplicateInvoice(invoiceIdOrNo: string, auditUser: string = 'Ali Khan'): { success: boolean; message: string; duplicatedInvoice?: SaleInvoice } {
    const existing = this.invoices.find((i) => i.id === invoiceIdOrNo || i.invoiceNo === invoiceIdOrNo);
    if (!existing) {
      return { success: false, message: 'Original invoice not found to duplicate.' };
    }

    const nextInvoiceNo = this.getNextInvoiceNumber();
    const nextTxnNo = this.getNextTransactionNumber(existing.saleType);
    const today = getTodayDateString();

    const clonedItems: InvoiceItemRow[] = existing.items.map((item) => ({
      ...item,
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    }));

    const newInvoice: SaleInvoice = {
      ...existing,
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      invoiceNo: nextInvoiceNo,
      transactionNo: nextTxnNo,
      invoiceDate: today,
      dueDate: getFutureDateDDMMYYYY(15),
      items: clonedItems,
      createdAt: new Date().toISOString(),
    };

    const res = this.saveInvoice(newInvoice);
    if (res.success && res.savedInvoice) {
      this.addAuditLog({
        transactionNo: res.savedInvoice.transactionNo || ('TXN-' + res.savedInvoice.invoiceNo),
        invoiceNo: res.savedInvoice.invoiceNo || 'INV-0000',
        action: 'CREATE',
        user: auditUser,
        dateTime: new Date().toLocaleString(),
        details: `Duplicated transaction from original ${existing.invoiceNo} (${existing.transactionNo}) as ${res.savedInvoice.invoiceNo}.`,
        newData: res.savedInvoice,
      });
      return {
        success: true,
        message: `Successfully duplicated ${existing.invoiceNo} as new transaction ${res.savedInvoice.invoiceNo}!`,
        duplicatedInvoice: res.savedInvoice,
      };
    }

    return res;
  }

  // Audit Logs Methods - Default Chronological Ascending Order
  public getAuditLogs(): AuditLogEntry[] {
    return sortChronologicalAscending(this.auditLogs);
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id'>) {
    const newLog: AuditLogEntry = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      ...entry,
    };
    this.auditLogs.push(newLog); // append in chronological order
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(-200);
    }
  }

  public getCashSales(): SaleInvoice[] {
    return sortChronologicalAscending(this.invoices.filter((inv) => inv.saleType === 'Cash Sale'));
  }

  public getCreditSales(): SaleInvoice[] {
    return sortChronologicalAscending(this.invoices.filter((inv) => inv.saleType === 'Credit Sale'));
  }

  public getStockMovements(): StockMovementEntry[] {
    return sortChronologicalAscending(this.stockMovements);
  }

  public getCustomerLedgerByCustomerId(customerId: string): CustomerLedgerEntry[] {
    return sortChronologicalAscending(this.customerLedgers.filter((cl) => cl.customerId === customerId));
  }

  public searchTransactions(query: string, filters?: {
    saleType?: string;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    minAmount?: number;
    maxAmount?: number;
  }): SaleInvoice[] {
    const q = query.trim().toLowerCase();
    const matched = this.invoices.filter((inv) => {
      if (filters?.saleType && filters.saleType !== 'ALL' && inv.saleType !== filters.saleType) {
        return false;
      }
      if (filters?.customerId && filters.customerId !== 'ALL' && inv.customerId !== filters.customerId) {
        return false;
      }
      if (filters?.minAmount !== undefined && inv.netInvoiceTotal < filters.minAmount) {
        return false;
      }
      if (filters?.maxAmount !== undefined && inv.netInvoiceTotal > filters.maxAmount) {
        return false;
      }
      if (!q) return true;
      return (
        inv.invoiceNo.toLowerCase().includes(q) ||
        (inv.transactionNo && inv.transactionNo.toLowerCase().includes(q)) ||
        (inv.customerName && inv.customerName.toLowerCase().includes(q)) ||
        inv.invoiceDate.includes(q)
      );
    });
    return sortChronologicalAscending(matched);
  }

  // Reset to original demo data if needed
  public resetToSampleData() {
    this.invoices = [...INITIAL_INVOICES];
    this.customers = [...INITIAL_CUSTOMERS];
    this.products = [...INITIAL_PRODUCTS];
    this.stores = [...INITIAL_STORES];
    this.banks = [...INITIAL_BANKS];
    this.cashBalance = 45000;
    this.dayBook = this.generateInitialDayBook();
    this.customerLedgers = this.generateInitialCustomerLedgers();
    this.saveToStorage();
  }
}

export const salesStore = new SalesStoreManager();
