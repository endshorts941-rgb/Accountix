export type SaleType = 'Cash Sale' | 'Credit Sale';
export type PaymentMethod = 'Cash' | 'Bank' | 'Split' | 'Split / Multi Payment' | 'Credit / Remaining' | 'Cash (Bank deposit)' | 'Petty Cash' | string;
export type DiscountType = 'fixed' | 'percentage';

export interface StoreLocation {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  balance: number;
}

export interface CustomerAsset {
  id: string;
  name: string;
  type: string; // 'Vehicle' | 'Laptop' | 'AC' | 'Mobile' | 'Equipment' | 'Other'
  identifier?: string; // Reg No, S/N, Model
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cnic?: string;
  contactPerson?: string;
  previousBalance: number; // in PKR (Customer Receivable)
  creditLimit?: number;
  isSupplier?: boolean; // Same party can exist as Customer & Supplier
  supplierPayableBalance?: number; // Separate Supplier Payable tracking
  linkedAssets?: CustomerAsset[];
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  rate: number;
  category?: string;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  salePrice: number;
  costPrice: number;
  // Stock by store location ID
  stockByStore: Record<string, number>;
}

export interface InvoiceItemRow {
  id: string;
  itemType?: 'product' | 'service'; // Product or Service line
  productId: string;
  productName: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  stockNumber?: string;
  
  // Service / Repair specific fields
  serviceName?: string;
  repairDetails?: string;
  problemComplaint?: string;
  workPerformed?: string;
  serviceNotes?: string;
}

export interface SaleInvoice {
  id: string;
  invoiceNo: string; // e.g. "SI-0005"
  transactionNo: string; // Globally unique TXN-XXXXXX
  invoiceDate: string; // "DD/MM/YYYY"
  exactTime?: string; // "HH:mm:ss" e.g. "14:35:22"
  userRecord?: string; // Logged-in ACCOUNTIX user
  saleType: SaleType;
  storeLocationId: string;
  storeLocationName: string;
  
  // Customer info (Optional for Cash Sale, Required for Credit Sale)
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;

  // Optional Asset / Vehicle / Device Linking
  assetId?: string;
  assetDetails?: string; // e.g. "Toyota Corolla - LEA-1234"
  assetType?: string; // "Vehicle" | "Laptop" | "AC" | etc.

  // Payment info (Cash, Bank, Split / Multi Payment, Credit)
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  bankName?: string;
  cashReceivedAmount?: number;
  bankReceivedAmount?: number;
  otherReceivedAmount?: number;
  totalReceivedAmount?: number;
  remainingBalanceAmount?: number;

  // Line items (Product + Service combination)
  items: InvoiceItemRow[];

  // Calculation breakdown
  subtotal: number;
  productRevenue?: number;
  serviceRevenue?: number;
  discountType?: DiscountType;
  discountValue?: number;
  overallDiscount: number;
  taxPercent?: number;
  overallTax: number;
  netInvoiceTotal: number;

  // Balances & Cash Received
  previousBalance: number;
  cashReceivedAtSale: number;
  currentInvoiceRemaining: number;
  finalCustomerBalance: number;

  status: 'PAID IN FULL' | 'PARTIAL CREDIT' | 'UNPAID CREDIT';
  notes?: string;
  dueDate?: string;
  salesman?: string;
  reference?: string;
  contactPerson?: string;
  fentAccount?: string;
  isBankAccount?: boolean;
  descriptions?: string;
  terms?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  transactionNo: string;
  invoiceNo: string;
  action: 'CREATE' | 'EDIT' | 'DELETE';
  user: string;
  dateTime: string;
  details: string;
  previousData?: Partial<SaleInvoice>;
  newData?: Partial<SaleInvoice>;
}

export interface DayBookEntry {
  id: string;
  date: string;
  voucherNo: string;
  invoiceNo: string;
  accountName: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  exactTime?: string;
  userRecord?: string;
  invoiceNo: string;
  transactionNo?: string;
  transactionType?: string; // e.g. "Cash Sale" | "Credit Sale" | "Service Invoice"
  description: string;
  debit: number; // Invoice total (Receivable addition)
  credit: number; // Amount received at sale
  balance: number; // Balance after transaction
  
  // Detailed breakdown for "Show Transaction Details" option
  storeLocationName?: string;
  paymentMethod?: string;
  bankName?: string;
  itemsSummary?: string;
  hasServices?: boolean;
  hasProducts?: boolean;
  totalQty?: number;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  cashReceived?: number;
  bankReceived?: number;
  remainingAmount?: number;
  notes?: string;
  assetDetails?: string;
}

export interface StockMovementEntry {
  id: string;
  date: string;
  productId: string;
  productName: string;
  storeLocationId: string;
  storeLocationName: string;
  invoiceNo: string;
  transactionNo: string;
  quantityChange: number; // negative for sales, positive for reversals
  remainingStock: number;
  movementType: 'SALE' | 'SALE_REVERSAL' | 'RETURN' | 'PURCHASE';
  notes?: string;
}
