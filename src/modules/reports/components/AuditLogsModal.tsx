import React, { useState } from 'react';
import { AuditLogEntry } from '../../sales/types';
import {
  sortChronologicalAscending,
} from '../../../utils/dateUtils';
import { Shield, X, History, PlusCircle, Edit3, Trash2, Calendar, User, Search } from 'lucide-react';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  const [filterAction, setFilterAction] = useState<'ALL' | 'CREATE' | 'EDIT' | 'DELETE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.invoiceNo.toLowerCase().includes(q) ||
        log.transactionNo.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ACCOUNTIX Global Rule: Strict Chronological Ascending Order (Oldest -> Newest)
  const sortedLogs = sortChronologicalAscending(filteredLogs);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0b66c3] px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ACCOUNTIX Audit Log & Security Trail</h3>
              <p className="text-[11px] text-white/80">
                Immutable record of all Cash Sale creations, edits, and deletions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Action:</span>
            <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs">
              {(['ALL', 'CREATE', 'EDIT', 'DELETE'] as const).map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setFilterAction(act)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    filterAction === act
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, txn, user..."
              className="w-full text-xs rounded border border-slate-300 py-1 pl-7 pr-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {sortedLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No audit records found matching your filter</p>
              <p className="text-xs">Any Cash Sale saved, edited, or deleted will be logged here.</p>
            </div>
          ) : (
            sortedLogs.map((log) => {
              const isDelete = log.action === 'DELETE';
              const isEdit = log.action === 'EDIT';
              const isCreate = log.action === 'CREATE';

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCreate
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isEdit
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {isCreate && <PlusCircle className="w-3 h-3" />}
                        {isEdit && <Edit3 className="w-3 h-3" />}
                        {isDelete && <Trash2 className="w-3 h-3" />}
                        <span>{log.action}</span>
                      </span>

                      <span className="font-mono font-bold text-xs text-slate-800">
                        {log.invoiceNo}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {log.transactionNo}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-slate-700">{log.user}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{log.dateTime}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-2 rounded border border-slate-100">
                    {log.details}
                  </p>

                  {/* If previous vs new exists */}
                  {log.previousData && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                      <span className="font-semibold text-slate-600">Previous Amount:</span>
                      <span className="font-mono text-slate-700">
                        Rs. {log.previousData.netInvoiceTotal?.toLocaleString()}
                      </span>
                      {log.newData && (
                        <>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-slate-600">New Amount:</span>
                          <span className="font-mono font-bold text-blue-700">
                            Rs. {log.newData.netInvoiceTotal?.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Total Logged Operations: {logs.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
