import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Layers, BookOpen } from 'lucide-react';

interface WordPressIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordPressIntegrationModal: React.FC<WordPressIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'php' | 'shortcode' | 'json' | 'notes'>('php');

  if (!isOpen) return null;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const phpTemplateCode = `<?php
/**
 * ACCOUNTIX Frontend Top Navigation Bar
 * Template File: template-parts/accountix-navigation.php
 *
 * Usage in your WordPress Theme or Accountix Plugin:
 * <?php get_template_part('template-parts/accountix-navigation'); ?>
 */

defined('ABSPATH') || exit;

$current_uri = sanitize_text_field($_SERVER['REQUEST_URI'] ?? '');
?>
<header id="accountix-top-nav" class="accountix-nav-wrapper">
  <div class="accountix-nav-container">
    <!-- Brand Logo Area -->
    <div class="accountix-brand">
      <a href="<?php echo esc_url(home_url('/accountix/dashboard')); ?>" class="accountix-logo-link">
        <span class="accountix-logo-icon">A</span>
        <span class="accountix-brand-title">ACCOUNTIX</span>
      </a>
    </div>

    <!-- Top Horizontal Navigation -->
    <nav class="accountix-menu-bar">
      <!-- 2. Dashboard -->
      <a href="<?php echo esc_url(home_url('/accountix/dashboard')); ?>" class="accountix-nav-item">Dashboard</a>

      <!-- 3. Transactions -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Transactions <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu multi-column">
          <div class="column">
            <h4>Sales</h4>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/sales/cash-sale')); ?>">Cash Sale</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/sales/credit-sale')); ?>">Credit Sale</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/sales/services-sale')); ?>">Services Sale</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/sales/sales-return')); ?>">Sales Return</a>
          </div>
          <div class="column">
            <h4>Purchases</h4>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/purchases/cash-purchase')); ?>">Cash Purchase</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/purchases/credit-purchase')); ?>">Credit Purchase</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/purchases/purchase-return')); ?>">Purchase Return</a>
          </div>
          <div class="column">
            <h4>Other Transactions</h4>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/other/receiving')); ?>">Receiving</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/other/payment')); ?>">Payment</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/other/expenses')); ?>">Expenses</a>
            <a href="<?php echo esc_url(home_url('/accountix/transactions/other/day-book')); ?>">Day Book</a>
          </div>
        </div>
      </div>

      <!-- 4. Accounts -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Accounts <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu">
          <a href="<?php echo esc_url(home_url('/accountix/accounts/customers')); ?>">Customers</a>
          <a href="<?php echo esc_url(home_url('/accountix/accounts/suppliers')); ?>">Suppliers</a>
          <a href="<?php echo esc_url(home_url('/accountix/accounts/customer-ledger')); ?>">Customer Ledger</a>
          <a href="<?php echo esc_url(home_url('/accountix/accounts/supplier-ledger')); ?>">Supplier Ledger</a>
          <a href="<?php echo esc_url(home_url('/accountix/accounts/chart-of-accounts')); ?>">Chart of Accounts</a>
          <a href="<?php echo esc_url(home_url('/accountix/accounts/cash-and-bank')); ?>">Cash & Bank</a>
          <a href="<?php echo esc_url(home_url('/accountix/accounts/general-entry')); ?>">General Entry</a>
        </div>
      </div>

      <!-- 5. Banking -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Banking <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu">
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-accounts')); ?>">Bank Accounts</a>
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-deposit')); ?>">Bank Deposit</a>
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-withdrawal')); ?>">Bank Withdrawal</a>
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-transfer')); ?>">Bank Transfer</a>
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-payment')); ?>">Bank Payment</a>
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-receiving')); ?>">Bank Receiving</a>
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-reconciliation')); ?>">Bank Reconciliation</a>
          <a href="<?php echo esc_url(home_url('/accountix/banking/bank-ledger')); ?>">Bank Ledger</a>
        </div>
      </div>

      <!-- 6. Payroll -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Payroll <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu">
          <a href="<?php echo esc_url(home_url('/accountix/payroll/employees')); ?>">Employees</a>
          <a href="<?php echo esc_url(home_url('/accountix/payroll/employee-accounts')); ?>">Employee Accounts</a>
          <a href="<?php echo esc_url(home_url('/accountix/payroll/salary-setup')); ?>">Salary Setup</a>
          <a href="<?php echo esc_url(home_url('/accountix/payroll/salary-processing')); ?>">Salary Processing</a>
          <a href="<?php echo esc_url(home_url('/accountix/payroll/salary-payment')); ?>">Salary Payment</a>
          <a href="<?php echo esc_url(home_url('/accountix/payroll/payroll-ledger')); ?>">Payroll Ledger</a>
          <a href="<?php echo esc_url(home_url('/accountix/payroll/payroll-reports')); ?>">Payroll Reports</a>
        </div>
      </div>

      <!-- 7. Manufacturing -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Manufacturing <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu">
          <a href="<?php echo esc_url(home_url('/accountix/manufacturing/raw-materials')); ?>">Raw Materials</a>
          <a href="<?php echo esc_url(home_url('/accountix/manufacturing/finished-goods')); ?>">Finished Goods</a>
          <a href="<?php echo esc_url(home_url('/accountix/manufacturing/bom')); ?>">BOM</a>
          <a href="<?php echo esc_url(home_url('/accountix/manufacturing/manufacturing-entry')); ?>">Manufacturing Entry</a>
        </div>
      </div>

      <!-- 8. Reports -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Reports <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu two-column">
          <a href="<?php echo esc_url(home_url('/accountix/reports/sales-reports')); ?>">Sales Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/purchase-reports')); ?>">Purchase Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/customer-reports')); ?>">Customer Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/supplier-reports')); ?>">Supplier Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/banking-reports')); ?>">Banking Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/payroll-reports')); ?>">Payroll Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/manufacturing-reports')); ?>">Manufacturing Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/stock-reports')); ?>">Stock Reports</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/day-book')); ?>">Day Book</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/cash-book')); ?>">Cash Book</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/profit-and-loss')); ?>">Profit & Loss</a>
          <a href="<?php echo esc_url(home_url('/accountix/reports/balance-sheet')); ?>">Balance Sheet</a>
        </div>
      </div>

      <!-- 9. Stock -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Stock <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu">
          <a href="<?php echo esc_url(home_url('/accountix/stock/products')); ?>">Products</a>
          <a href="<?php echo esc_url(home_url('/accountix/stock/stock-in')); ?>">Stock In</a>
          <a href="<?php echo esc_url(home_url('/accountix/stock/stock-out')); ?>">Stock Out</a>
          <a href="<?php echo esc_url(home_url('/accountix/stock/stock-adjustment')); ?>">Stock Adjustment</a>
          <a href="<?php echo esc_url(home_url('/accountix/stock/stock-ledger')); ?>">Stock Ledger</a>
          <a href="<?php echo esc_url(home_url('/accountix/stock/outstanding-stock')); ?>">Outstanding Stock</a>
        </div>
      </div>

      <!-- 10. Settings -->
      <div class="accountix-dropdown-group">
        <button type="button" class="accountix-nav-item has-dropdown">Settings <span class="arrow">&#9662;</span></button>
        <div class="accountix-dropdown-menu">
          <a href="<?php echo esc_url(home_url('/accountix/settings/business-company')); ?>">Business / Company</a>
          <a href="<?php echo esc_url(home_url('/accountix/settings/financial-year')); ?>">Financial Year</a>
          <a href="<?php echo esc_url(home_url('/accountix/settings/users-permissions')); ?>">Users & Permissions</a>
          <a href="<?php echo esc_url(home_url('/accountix/settings/invoice-settings')); ?>">Invoice Settings</a>
          <a href="<?php echo esc_url(home_url('/accountix/settings/tax-settings')); ?>">Tax Settings</a>
          <a href="<?php echo esc_url(home_url('/accountix/settings/currency-settings')); ?>">Currency Settings</a>
          <a href="<?php echo esc_url(home_url('/accountix/settings/backup-restore')); ?>">Backup & Restore</a>
        </div>
      </div>

      <!-- 11. Logout -->
      <a href="<?php echo esc_url(wp_logout_url(home_url('/accountix/login'))); ?>" class="accountix-nav-item">Logout</a>
    </nav>
  </div>
</header>`;

  const shortcodeCode = `// Add this to your child theme's functions.php or Accountix custom plugin:
function accountix_render_navigation_shortcode() {
    ob_start();
    get_template_part('template-parts/accountix-navigation');
    return ob_get_clean();
}
add_shortcode('accountix_navigation', 'accountix_render_navigation_shortcode');

// In Elementor or any WordPress page, simply insert:
// [accountix_navigation]`;

  const jsonHierarchy = JSON.stringify(
    {
      name: 'ACCOUNTIX',
      structure: [
        'Dashboard',
        {
          Transactions: {
            Sales: ['Cash Sale', 'Credit Sale', 'Services Sale', 'Sales Return'],
            Purchases: ['Cash Purchase', 'Credit Purchase', 'Purchase Return'],
            'Other Transactions': ['Receiving', 'Payment', 'Expenses', 'Day Book'],
          },
        },
        {
          Accounts: [
            'Customers',
            'Suppliers',
            'Customer Ledger',
            'Supplier Ledger',
            'Chart of Accounts',
            'Cash & Bank',
            'General Entry',
          ],
        },
        {
          Banking: [
            'Bank Accounts',
            'Bank Deposit',
            'Bank Withdrawal',
            'Bank Transfer',
            'Bank Payment',
            'Bank Receiving',
            'Bank Reconciliation',
            'Bank Ledger',
          ],
        },
        {
          Payroll: [
            'Employees',
            'Employee Accounts',
            'Salary Setup',
            'Salary Processing',
            'Salary Payment',
            'Payroll Ledger',
            'Payroll Reports',
          ],
        },
        {
          Manufacturing: [
            'Raw Materials',
            'Finished Goods',
            'BOM',
            'Manufacturing Entry',
          ],
        },
        {
          Reports: [
            'Sales Reports',
            'Purchase Reports',
            'Customer Reports',
            'Supplier Reports',
            'Banking Reports',
            'Payroll Reports',
            'Manufacturing Reports',
            'Stock Reports',
            'Day Book',
            'Cash Book',
            'Profit & Loss',
            'Balance Sheet',
          ],
        },
        {
          Stock: [
            'Products',
            'Stock In',
            'Stock Out',
            'Stock Adjustment',
            'Stock Ledger',
            'Outstanding Stock',
          ],
        },
        {
          Settings: [
            'Business / Company',
            'Financial Year',
            'Users & Permissions',
            'Invoice Settings',
            'Tax Settings',
            'Currency Settings',
            'Backup & Restore',
          ],
        },
        'Logout',
      ],
    },
    null,
    2
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                WordPress Frontend Integration Snippets
              </h2>
              <p className="text-xs text-slate-500">
                Seamlessly embed ACCOUNTIX top navigation into any WordPress theme or plugin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('php')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
              activeTab === 'php'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            PHP Template Part
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shortcode')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
              activeTab === 'shortcode'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            WordPress Shortcode
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Menu Structure (JSON)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-md border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            WordPress Guidelines
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed">
          {activeTab === 'php' && (
            <div className="relative">
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => copyCode(phpTemplateCode, 'php')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors font-sans"
                >
                  {copiedTab === 'php' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy PHP Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 bg-slate-950 rounded-lg text-slate-300">
                {phpTemplateCode}
              </pre>
            </div>
          )}

          {activeTab === 'shortcode' && (
            <div className="relative">
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => copyCode(shortcodeCode, 'shortcode')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors font-sans"
                >
                  {copiedTab === 'shortcode' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 bg-slate-950 rounded-lg text-slate-300">
                {shortcodeCode}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="relative">
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => copyCode(jsonHierarchy, 'json')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors font-sans"
                >
                  {copiedTab === 'json' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 bg-slate-950 rounded-lg text-sky-300">
                {jsonHierarchy}
              </pre>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 font-sans text-slate-200">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  1. Dedicated Frontend Interface (No wp-admin)
                </h3>
                <p className="text-slate-300 text-xs">
                  ACCOUNTIX operates exclusively as a frontend web app. WordPress admin dashboards are not used for business workflows. The top nav mounts on your custom page template (e.g. <code>page-accountix.php</code>) or full-width Elementor canvas.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  2. z-index & Stacking Context
                </h3>
                <p className="text-slate-300 text-xs">
                  The dropdowns use <code>z-index: 50</code> and overflow is kept visible on ancestor wrappers to prevent dropdown menus from getting trapped behind WordPress elements or sliders.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  3. Elementor Compatibility
                </h3>
                <p className="text-slate-300 text-xs">
                  You can paste the shortcode <code>[accountix_navigation]</code> directly into any Elementor "Shortcode" widget, or add it to an Elementor Theme Builder Header template. It requires no external dependencies.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="font-semibold text-white text-sm mb-1">
                  4. Modular Development Protocol
                </h3>
                <p className="text-slate-300 text-xs">
                  All menu routes map to placeholder endpoints. As we develop each module (Sales, Purchases, Banking, Payroll, Manufacturing, etc.) in subsequent steps, they plug directly into these established routes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ACCOUNTIX v1.0.0 · WordPress ERP Top Navigation
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
