import React, { ReactNode } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Download,
  FileDown,
  RefreshCw,
  Plus,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export interface ReportActionItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
}

export interface AccountixReportTemplateProps {
  reportTitle: string;
  reportSubtitle?: string;
  badgeText?: string;
  recordCountText?: string;
  topActions?: ReportActionItem[];
  onPrint?: () => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onRefresh?: () => void;
  onBack?: () => void;
  toastMessage?: { type: 'success' | 'error'; text: string } | null;
  onDismissToast?: () => void;
  filterSection?: ReactNode;
  summaryCardsSection?: ReactNode;
  children: ReactNode; // Data table or report body
  footerSummarySection?: ReactNode;
}

export const AccountixReportTemplate: React.FC<AccountixReportTemplateProps> = ({
  reportTitle,
  reportSubtitle = '· ACCOUNTIX Accounting & POS Database',
  badgeText,
  recordCountText,
  topActions,
  onPrint,
  onExportCsv,
  onExportExcel,
  onRefresh,
  onBack,
  toastMessage,
  onDismissToast,
  filterSection,
  summaryCardsSection,
  children,
  footerSummarySection,
}) => {
  return (
    <div className="flex-1 w-full bg-[#D0E7F5] min-h-[calc(100vh-2.5rem)] py-2 sm:py-3 px-2 sm:px-4 text-[#111111] font-sans antialiased select-none pb-8 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#D0E7F5]">
      <div className="w-full max-w-[1920px] mx-auto space-y-2.5">
        {/* REPORT HEADER: Title, Branding & Quick Actions */}
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer mr-1"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <h1 className="text-xl sm:text-[24px] font-bold text-[#111111] tracking-tight uppercase">
              {reportTitle}
            </h1>
            {badgeText && (
              <span className="text-[11px] font-bold px-2 py-0.5 bg-[#B6D9EA] border border-[#7F9EAD] text-[#111111] uppercase tracking-wide">
                {badgeText}
              </span>
            )}
            {reportSubtitle && (
              <span className="text-[11px] font-mono text-slate-700 hidden md:inline">
                {reportSubtitle}
              </span>
            )}
          </div>

          {/* Action Buttons in ACCOUNTIX Classic Light-Blue Style */}
          <div className="flex items-center flex-wrap gap-1.5">
            {topActions?.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                title={action.title || action.label}
                className={`inline-flex items-center gap-1.5 px-3 py-1 border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer ${
                  action.variant === 'primary'
                    ? 'bg-[#B6D9EA] hover:bg-[#A3CEE2]'
                    : action.variant === 'accent'
                    ? 'bg-[#E3EFF7] hover:bg-[#D0E7F5]'
                    : 'bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA]'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}

            {(onExportCsv || onExportExcel) && (
              <button
                type="button"
                onClick={onExportCsv || onExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Export report data to Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
                <span>Export Excel</span>
              </button>
            )}

            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Print official report"
              >
                <Printer className="w-3.5 h-3.5 text-blue-900" />
                <span>Print Report</span>
              </button>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-1 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[#111111] rounded-xs shadow-2xs transition-colors cursor-pointer"
                title="Refresh / Sync Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div
            className={`p-2.5 rounded-xs border text-xs flex items-center justify-between shadow-2xs animate-in fade-in ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-red-50 border-red-400 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-semibold">{toastMessage.text}</span>
            </div>
            {onDismissToast && (
              <button
                type="button"
                onClick={onDismissToast}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 1. FILTER SECTION */}
        {filterSection}

        {/* 2. SUMMARY CARDS SECTION */}
        {summaryCardsSection}

        {/* 3. REPORT DATA AREA (TABLE) */}
        {children}

        {/* 4. OPTIONAL FOOTER SUMMARY */}
        {footerSummarySection}
      </div>
    </div>
  );
};

export interface AccountixReportFilterCardProps {
  title?: string;
  onReset?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  headerActions?: ReactNode;
  bottomLeftControl?: ReactNode;
  children: ReactNode;
}

export const AccountixReportFilterCard: React.FC<AccountixReportFilterCardProps> = ({
  title = 'Report Filters',
  onReset,
  onExportExcel,
  onPrint,
  onDownloadPdf,
  headerActions,
  bottomLeftControl,
  children,
}) => {
  return (
    <div className="border border-[#7F9EAD] bg-[#D7EAF5] rounded-none sm:rounded-xs shadow-2xs">
      {/* SECTION HEADER: Light Blue with thin gray-blue border */}
      <div className="bg-[#B6D9EA] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between">
        <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
          {title}
        </h2>
        <div className="flex items-center gap-1.5">
          {headerActions}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-[11px] font-semibold text-[#111111] rounded-xs cursor-pointer shadow-2xs transition-colors"
              title="Reset Filters to Default"
            >
              <RotateCcw className="w-3 h-3 text-slate-700" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER BODY: Compact Accounting Filter Layout */}
      <div className="p-2.5 sm:p-3 bg-[#E5F1F8] flex flex-col gap-2.5 text-xs text-[#111111]">
        {children}

        {/* BOTTOM ROW: Search / Controls & EXPORT BUTTONS [ Excel ] [ Print ] [ PDF ] */}
        {(bottomLeftControl || onExportExcel || onPrint || onDownloadPdf) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#7F9EAD]/40">
            <div className="flex items-center gap-1.5 flex-wrap">
              {bottomLeftControl}
            </div>

            {/* FAR RIGHT: EXPORT BUTTONS */}
            {(onExportExcel || onPrint || onDownloadPdf) && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111111] text-xs">Export:</span>

                {onExportExcel && (
                  <button
                    type="button"
                    onClick={onExportExcel}
                    className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Export Report to Excel / CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Excel</span>
                  </button>
                )}

                {onPrint && (
                  <button
                    type="button"
                    onClick={onPrint}
                    className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Print Report"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-800" />
                    <span>Print</span>
                  </button>
                )}

                {onDownloadPdf && (
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    className="h-7 px-3 bg-[#D7EAF5] hover:bg-[#C5DEF0] active:bg-[#B3D3EA] border border-[#7F9EAD] text-xs font-semibold text-[#111111] rounded-none sm:rounded-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    title="Download / Print PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-red-800" />
                    <span>PDF</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export interface AccountixReportTableWrapperProps {
  title?: string;
  recordCount?: number;
  recordCountLabel?: string;
  subtitle?: string;
  headerControls?: ReactNode;
  maxHeight?: string; // Default: 'max-h-[520px]'
  children: ReactNode;
}

export const AccountixReportTableWrapper: React.FC<AccountixReportTableWrapperProps> = ({
  title = 'Report Data Table',
  recordCount,
  recordCountLabel,
  subtitle = 'Showing real-time records from ACCOUNTIX database',
  headerControls,
  maxHeight = 'max-h-[520px]',
  children,
}) => {
  return (
    <div className="border border-[#7F9EAD] bg-white rounded-xs shadow-2xs overflow-hidden flex flex-col">
      {/* SECTION HEADER BAR */}
      <div className="bg-[#B6D9EA] px-3 py-1.5 border-b border-[#7F9EAD] flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-[13px] font-bold text-[#111111] uppercase tracking-wide">
            {title}
          </h2>
          {recordCount !== undefined && (
            <span className="text-[11px] font-semibold text-[#111111] bg-[#D7EAF5] px-1.5 py-0.2 border border-[#7F9EAD]">
              {recordCount} {recordCountLabel || (recordCount === 1 ? 'Record' : 'Records')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {headerControls}
          {subtitle && (
            <span className="text-[11px] text-slate-700 hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* 
        CRITICAL: SCROLLABLE TABLE BODY AREA
        Fixed/Controlled practical height with internal vertical scroll AND horizontal scroll.
        Sticky header inside table stays pinned to the top of this container while scrolling!
      */}
      <div
        className={`overflow-x-auto overflow-y-auto ${maxHeight} min-h-[260px] [scrollbar-width:thin] [scrollbar-color:#7F9EAD_#E2EFF7] relative`}
      >
        {children}
      </div>
    </div>
  );
};
