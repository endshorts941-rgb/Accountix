import { useState } from 'react';
import { AccountixTopNav } from './components/navigation/AccountixTopNav';
import { ModulePlaceholderView } from './components/preview/ModulePlaceholderView';
import { WordPressIntegrationModal } from './components/wordpress/WordPressIntegrationModal';
import { SaleInvoiceModule } from './modules/sales/SaleInvoiceModule';
import { CreditSaleModule } from './modules/sales/CreditSaleModule';
import { CashSaleReportModule } from './modules/reports/CashSaleReportModule';
import { CreditSaleReportModule } from './modules/reports/CreditSaleReportModule';
import { AllSalesReportModule } from './modules/reports/AllSalesReportModule';
import { CustomerLedgerReportModule } from './modules/reports/CustomerLedgerReportModule';
import { UniversalAccountixReportModule } from './modules/reports/UniversalAccountixReportModule';
import { ActiveRouteInfo } from './types/navigation';
import { LogOut, CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Current active route state (defaulting to Cash Sale Invoice for immediate access, or Dashboard)
  const [activeRouteInfo, setActiveRouteInfo] = useState<ActiveRouteInfo>({
    menuId: 'transactions',
    itemId: 'cash-sale',
    groupTitle: 'Sales',
    parentLabel: 'Transactions',
    label: 'Cash Sale',
    route: '/transactions/sales/cash-sale',
  });

  // WordPress code modal state
  const [isWordPressModalOpen, setIsWordPressModalOpen] = useState(false);

  // Target invoice number for opening from reports
  const [targetInvoiceNo, setTargetInvoiceNo] = useState<string | undefined>(undefined);

  // Logout confirmation modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleRouteChange = (newRoute: ActiveRouteInfo) => {
    setActiveRouteInfo(newRoute);
  };

  const handleOpenSaleInvoice = (type: 'Cash Sale' | 'Credit Sale' = 'Cash Sale', invoiceNo?: string) => {
    const isCredit = type === 'Credit Sale';
    setTargetInvoiceNo(invoiceNo);
    setActiveRouteInfo({
      menuId: 'transactions',
      itemId: isCredit ? 'credit-sale' : 'cash-sale',
      groupTitle: 'Sales',
      parentLabel: 'Transactions',
      label: type,
      route: isCredit ? '/transactions/sales/credit-sale' : '/transactions/sales/cash-sale',
    });
  };

  const handleOpenAllSalesReport = () => {
    setActiveRouteInfo({
      menuId: 'reports',
      itemId: 'all-sales-report-menu',
      parentLabel: 'Reports',
      label: 'All Sales Report',
      route: '/reports/sales-reports',
    });
  };

  const handleOpenCashSaleReport = () => {
    setActiveRouteInfo({
      menuId: 'reports',
      itemId: 'cash-sale-report-menu',
      parentLabel: 'Reports',
      label: 'Cash Sale Report',
      route: '/reports/sales/cash-sale-report',
    });
  };

  const handleOpenCreditSaleReport = () => {
    setActiveRouteInfo({
      menuId: 'reports',
      itemId: 'credit-sale-report-menu',
      parentLabel: 'Reports',
      label: 'Credit Sale Report',
      route: '/reports/sales/credit-sale-report',
    });
  };

  const handleOpenCustomerLedger = () => {
    setActiveRouteInfo({
      menuId: 'reports',
      itemId: 'customer-ledger-report',
      parentLabel: 'Reports',
      label: 'Customer Ledger',
      route: '/accounts/customer-ledger',
    });
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    setActiveRouteInfo({
      menuId: 'logout',
      label: 'Logout',
      route: '/logout',
    });
  };

  const isCreditSaleRoute = activeRouteInfo.route === '/transactions/sales/credit-sale';
  const isCashSaleRoute =
    activeRouteInfo.route === '/transactions/sales/cash-sale' ||
    activeRouteInfo.route === '/transactions/sales/sale-invoice' ||
    activeRouteInfo.route === '/transactions/sales/sale';
  const isAllSalesReportRoute =
    activeRouteInfo.route === '/reports/sales-reports' ||
    activeRouteInfo.route === '/reports/sales/all-sales-report';
  const isCashSaleReportRoute = activeRouteInfo.route === '/reports/sales/cash-sale-report';
  const isCreditSaleReportRoute = activeRouteInfo.route === '/reports/sales/credit-sale-report';
  const isCustomerLedgerRoute =
    activeRouteInfo.route === '/accounts/customer-ledger' ||
    activeRouteInfo.itemId === 'customer-ledger-report' ||
    activeRouteInfo.label === 'Customer Ledger';
  const isDayBookRoute =
    activeRouteInfo.route === '/reports/day-book' ||
    activeRouteInfo.itemId === 'day-book-report';
  const isCashBookRoute =
    activeRouteInfo.route === '/reports/cash-book' ||
    activeRouteInfo.itemId === 'cash-book-report';
  const isBankLedgerRoute =
    activeRouteInfo.route === '/banking/bank-ledger' ||
    activeRouteInfo.route === '/banking/bank-accounts' ||
    activeRouteInfo.itemId === 'bank-ledger';
  const isStockReportsRoute =
    activeRouteInfo.route === '/reports/stock-reports' ||
    activeRouteInfo.route === '/stock/stock-ledger' ||
    activeRouteInfo.itemId === 'stock-reports';
  const isProfitLossRoute =
    activeRouteInfo.route === '/reports/profit-and-loss' ||
    activeRouteInfo.itemId === 'profit-and-loss';
  const isBalanceSheetRoute =
    activeRouteInfo.route === '/reports/balance-sheet' ||
    activeRouteInfo.itemId === 'balance-sheet';
  const isExpenseReportRoute =
    activeRouteInfo.route === '/reports/expenses' ||
    activeRouteInfo.itemId === 'expense-report';
  const isSupplierLedgerRoute =
    activeRouteInfo.route === '/accounts/supplier-ledger' ||
    activeRouteInfo.itemId === 'supplier-ledger' ||
    activeRouteInfo.label === 'Supplier Ledger';
  const isCombinedPartyLedgerRoute =
    activeRouteInfo.route === '/accounts/combined-ledger' ||
    activeRouteInfo.itemId === 'combined-party-ledger' ||
    activeRouteInfo.label === 'Combined Party Ledger';
  const isGeneralLedgerRoute =
    activeRouteInfo.route === '/accounts/general-ledger' ||
    activeRouteInfo.itemId === 'general-ledger' ||
    activeRouteInfo.label === 'General Ledger';
  const isTrialBalanceRoute =
    activeRouteInfo.route === '/reports/trial-balance' ||
    activeRouteInfo.itemId === 'trial-balance' ||
    activeRouteInfo.label === 'Trial Balance';
  const isPurchaseReportRoute =
    activeRouteInfo.route === '/reports/purchase-reports' ||
    activeRouteInfo.itemId === 'purchase-reports' ||
    activeRouteInfo.label === 'Purchase Report' ||
    activeRouteInfo.label === 'Purchase Reports';
  const isBankingReportRoute =
    activeRouteInfo.route === '/reports/banking-reports' ||
    activeRouteInfo.itemId === 'banking-reports' ||
    activeRouteInfo.label === 'Banking Reports';
  const isManufacturingReportRoute =
    activeRouteInfo.route === '/reports/manufacturing-reports' ||
    activeRouteInfo.itemId === 'manufacturing-reports' ||
    activeRouteInfo.label === 'Manufacturing Reports';
  const isServiceRepairReportRoute =
    activeRouteInfo.route === '/reports/service-repair-reports' ||
    activeRouteInfo.itemId === 'service-repair-reports' ||
    activeRouteInfo.label === 'Service/Repair Reports' ||
    activeRouteInfo.label === 'Service / Repair Reports';

  const isClassicBlueRoute =
    isCashSaleRoute ||
    isCashSaleReportRoute ||
    isCreditSaleRoute ||
    isAllSalesReportRoute ||
    isCreditSaleReportRoute ||
    isCustomerLedgerRoute ||
    isDayBookRoute ||
    isCashBookRoute ||
    isBankLedgerRoute ||
    isStockReportsRoute ||
    isProfitLossRoute ||
    isBalanceSheetRoute ||
    isExpenseReportRoute ||
    isSupplierLedgerRoute ||
    isCombinedPartyLedgerRoute ||
    isGeneralLedgerRoute ||
    isTrialBalanceRoute ||
    isPurchaseReportRoute ||
    isBankingReportRoute ||
    isManufacturingReportRoute ||
    isServiceRepairReportRoute;

  return (
    <div className={`${isClassicBlueRoute ? 'h-screen max-h-screen overflow-hidden bg-[#D0E7F5]' : 'min-h-screen bg-slate-50'} flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900`}>
      {/* 
        MAIN TOP NAVIGATION BAR 
        Structure: ACCOUNTIX | Dashboard | Transactions ▼ | Accounts ▼ | Banking ▼ | Payroll ▼ | Manufacturing ▼ | Reports ▼ | Stock ▼ | Settings ▼ | Logout 
        No left sidebar.
      */}
      <AccountixTopNav
        currentRoute={activeRouteInfo.route}
        activeRouteInfo={activeRouteInfo}
        onRouteChange={handleRouteChange}
        onLogoutClick={handleLogoutClick}
      />

      {/* Primary Dynamic Content Area: Controlled Application Workspace */}
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {isCreditSaleRoute ? (
          <SaleInvoiceModule
            initialSaleType="Credit Sale"
            initialInvoiceNo={targetInvoiceNo}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
            onOpenCashSaleReport={handleOpenCashSaleReport}
            onOpenCreditSaleReport={handleOpenCreditSaleReport}
            onOpenAllSalesReport={handleOpenAllSalesReport}
            onRouteChange={handleRouteChange}
          />
        ) : isCashSaleRoute ? (
          <SaleInvoiceModule
            initialSaleType="Cash Sale"
            initialInvoiceNo={targetInvoiceNo}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
            onOpenCashSaleReport={handleOpenCashSaleReport}
            onOpenCreditSaleReport={handleOpenCreditSaleReport}
            onOpenAllSalesReport={handleOpenAllSalesReport}
            onRouteChange={handleRouteChange}
          />
        ) : isAllSalesReportRoute ? (
          <AllSalesReportModule
            onNavigateToSaleInvoice={(type, invNo) => handleOpenSaleInvoice(type || 'Cash Sale', invNo)}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
            onOpenCashSaleReport={handleOpenCashSaleReport}
            onOpenCreditSaleReport={handleOpenCreditSaleReport}
          />
        ) : isCashSaleReportRoute ? (
          <CashSaleReportModule
            onNavigateToSaleInvoice={(invNo) => handleOpenSaleInvoice('Cash Sale', invNo)}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
            onOpenCreditSaleReport={handleOpenCreditSaleReport}
          />
        ) : isCreditSaleReportRoute ? (
          <CreditSaleReportModule
            onNavigateToCreditSale={(invNo) => handleOpenSaleInvoice('Credit Sale', invNo)}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
            onOpenCashSaleReport={handleOpenCashSaleReport}
          />
        ) : isCustomerLedgerRoute ? (
          <CustomerLedgerReportModule
            onNavigateToSaleInvoice={(type, invNo) => handleOpenSaleInvoice(type || 'Credit Sale', invNo)}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
            onOpenSupplierLedger={() =>
              setActiveRouteInfo({
                menuId: 'reports',
                itemId: 'supplier-ledger',
                parentLabel: 'Reports',
                label: 'Supplier Ledger',
                route: '/accounts/supplier-ledger',
              })
            }
          />
        ) : isDayBookRoute ? (
          <UniversalAccountixReportModule
            reportType="day-book"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isCashBookRoute ? (
          <UniversalAccountixReportModule
            reportType="cash-book"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isBankLedgerRoute ? (
          <UniversalAccountixReportModule
            reportType="bank-book"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isStockReportsRoute ? (
          <UniversalAccountixReportModule
            reportType="stock-reports"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isProfitLossRoute ? (
          <UniversalAccountixReportModule
            reportType="profit-and-loss"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isBalanceSheetRoute ? (
          <UniversalAccountixReportModule
            reportType="balance-sheet"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isExpenseReportRoute ? (
          <UniversalAccountixReportModule
            reportType="expense-reports"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isSupplierLedgerRoute ? (
          <UniversalAccountixReportModule
            reportType="supplier-ledger"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Credit Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isCombinedPartyLedgerRoute ? (
          <UniversalAccountixReportModule
            reportType="combined-party-ledger"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isPurchaseReportRoute ? (
          <UniversalAccountixReportModule
            reportType="purchase-reports"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isBankingReportRoute ? (
          <UniversalAccountixReportModule
            reportType="banking-reports"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isManufacturingReportRoute ? (
          <UniversalAccountixReportModule
            reportType="manufacturing-reports"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isServiceRepairReportRoute ? (
          <UniversalAccountixReportModule
            reportType="service-repair-reports"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isGeneralLedgerRoute ? (
          <UniversalAccountixReportModule
            reportType="general-ledger"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : isTrialBalanceRoute ? (
          <UniversalAccountixReportModule
            reportType="trial-balance"
            onNavigateToSaleInvoice={(type) => handleOpenSaleInvoice(type || 'Cash Sale')}
            onNavigateBack={() =>
              setActiveRouteInfo({
                menuId: 'dashboard',
                label: 'Dashboard',
                route: '/dashboard',
              })
            }
          />
        ) : (
          <ModulePlaceholderView
            activeRouteInfo={activeRouteInfo}
            onOpenWordPressModal={() => setIsWordPressModalOpen(true)}
            onOpenSaleInvoice={handleOpenSaleInvoice}
            onOpenCashSaleReport={handleOpenCashSaleReport}
            onOpenCreditSaleReport={handleOpenCreditSaleReport}
            onOpenAllSalesReport={handleOpenAllSalesReport}
            onOpenCustomerLedger={handleOpenCustomerLedger}
          />
        )}
      </main>

      {/* WordPress Frontend Snippet & Code Modal */}
      <WordPressIntegrationModal
        isOpen={isWordPressModalOpen}
        onClose={() => setIsWordPressModalOpen(false)}
      />

      {/* Logout Action Dialog */}
      {isLogoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-blue-700">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <LogOut className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  ACCOUNTIX Logout Action
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This navigation bar is prepared for future Accountix frontend authentication. In a live WordPress setup, this routes to <code>wp_logout_url()</code> or your Accountix session handler.
            </p>
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-md text-xs text-blue-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Menu item <strong>11. Logout</strong> verified and working correctly.</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs"
              >
                Simulate Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
