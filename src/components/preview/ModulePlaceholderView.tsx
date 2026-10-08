import React from 'react';
import { ActiveRouteInfo } from '../../types/navigation';
import {
  Layers,
  Code2,
  FolderGit2,
  ExternalLink,
  Info,
  Calendar,
  Building2,
  Database,
  ArrowRight,
} from 'lucide-react';

interface ModulePlaceholderViewProps {
  activeRouteInfo: ActiveRouteInfo;
  onOpenWordPressModal: () => void;
  onOpenSaleInvoice?: (type: 'Cash Sale' | 'Credit Sale') => void;
  onOpenCashSaleReport?: () => void;
  onOpenCreditSaleReport?: () => void;
  onOpenAllSalesReport?: () => void;
  onOpenCustomerLedger?: () => void;
}

export const ModulePlaceholderView: React.FC<ModulePlaceholderViewProps> = ({
  activeRouteInfo,
  onOpenWordPressModal,
  onOpenSaleInvoice,
  onOpenCashSaleReport,
  onOpenCreditSaleReport,
  onOpenAllSalesReport,
  onOpenCustomerLedger,
}) => {
  const isDashboard = activeRouteInfo.menuId === 'dashboard';
  const isLogout = activeRouteInfo.menuId === 'logout';

  return (
    <main className="flex-1 bg-slate-50 min-h-[calc(100vh-3.5rem)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Breadcrumb & WordPress Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-800">ACCOUNTIX</span>
            <span>/</span>
            {activeRouteInfo.parentLabel && (
              <>
                <span className="text-slate-600">{activeRouteInfo.parentLabel}</span>
                <span>/</span>
              </>
            )}
            {activeRouteInfo.groupTitle && (
              <>
                <span className="text-slate-600">{activeRouteInfo.groupTitle}</span>
                <span>/</span>
              </>
            )}
            <span className="font-medium text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              {activeRouteInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenWordPressModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-md transition-colors shadow-2xs"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>WordPress Frontend Snippet & Code</span>
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Frontend Navigation Step Complete</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {isDashboard
                    ? 'ACCOUNTIX Main Dashboard'
                    : isLogout
                    ? 'ACCOUNTIX Authentication & Session'
                    : activeRouteInfo.label}
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {isDashboard
                    ? 'This is the primary Accountix Dashboard entry point. The top navigation bar is permanently mounted and ready for module routing.'
                    : isLogout
                    ? 'Prepared for future Accountix frontend login and logout handling.'
                    : `Active placeholder for ${activeRouteInfo.label}. In accordance with project instructions, module functionality will be developed step-by-step in subsequent phases.`}
                </p>
              </div>

              {/* Route Path Indicator Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1.5 min-w-[240px]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Route Configuration
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Path:</span>
                  <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                    {activeRouteInfo.route}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Module:</span>
                  <span className="font-semibold text-slate-700">
                    {activeRouteInfo.parentLabel || activeRouteInfo.label}
                  </span>
                </div>
                {activeRouteInfo.groupTitle && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Subgroup:</span>
                    <span className="text-slate-700">
                      {activeRouteInfo.groupTitle}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Access to Newly Built Sale Invoice Module */}
            {onOpenSaleInvoice && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>NEW MODULE READY: ACCOUNTIX Sale Invoice</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Fully functional Cash Sale & Credit Sale with store stock deduction, customer ledger, and Day Book integration.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenSaleInvoice('Cash Sale')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Open Cash Sale Invoice
                  </button>
                  {onOpenAllSalesReport && (
                    <button
                      type="button"
                      onClick={onOpenAllSalesReport}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-800 hover:bg-blue-900 text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Open All Sales Report
                    </button>
                  )}
                  {onOpenCashSaleReport && (
                    <button
                      type="button"
                      onClick={onOpenCashSaleReport}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Open Cash Sale Report
                    </button>
                  )}
                  {onOpenCreditSaleReport && (
                    <button
                      type="button"
                      onClick={onOpenCreditSaleReport}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Open Credit Sale Report
                    </button>
                  )}
                  {onOpenCustomerLedger && (
                    <button
                      type="button"
                      onClick={onOpenCustomerLedger}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Open Customer Ledger
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenSaleInvoice('Credit Sale')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white hover:bg-slate-100 text-blue-700 border border-blue-300 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Open Credit Sale Invoice
                  </button>
                </div>
              </div>
            )}

            {/* Quick Specs / Architectural Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="p-2 rounded bg-blue-100/60 text-blue-700 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Modular Architecture
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Navigation is cleanly separated from individual business modules for easy integration into WordPress templates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="p-2 rounded bg-sky-100/60 text-sky-700 shrink-0">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Standard Frontend
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Functions on standard WordPress frontend pages and Elementor canvases without relying on wp-admin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="p-2 rounded bg-indigo-100/60 text-indigo-700 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Step-by-Step Flow
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zero fake business logic. Module slots remain pristine until developed individually in future steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Corporate Context Footer (Accounting metadata) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-1">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-500">ACCOUNTIX</span>
            <span>·</span>
            <span>Professional Accounting & Business Management Software</span>
          </div>
          <div className="flex items-center gap-3">
            <span>WordPress Frontend Navigation</span>
            <span>·</span>
            <span className="font-mono">Ready for Module Development</span>
          </div>
        </div>
      </div>
    </main>
  );
};
