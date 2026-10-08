import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  invoiceNo: string;
  isDraft: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  invoiceNo,
  isDraft,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">
              Delete Transaction? (Transaction Delete Karein?)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isDraft ? (
                <>Are you sure you want to discard this unsaved draft invoice?</>
              ) : (
                <>
                  Are you sure you want to permanently delete transaction{' '}
                  <strong className="text-slate-900 font-mono font-bold">{invoiceNo}</strong>?
                  <br />
                  <span className="text-red-600 font-medium block mt-1">
                    Yeh action Store Stock, Day Book vouchers, aur Customer Ledger balances ko automatically reverse kar dega.
                  </span>
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
          >
            Cancel (Nahi)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Yes, Delete Transaction (Haan, Delete Karein)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
