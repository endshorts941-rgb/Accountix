import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, X, KeyRound } from 'lucide-react';

interface AuditPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: string, reason: string) => void;
  actionTitle: string;
  actionType: 'EDIT' | 'DELETE';
  invoiceNo: string;
}

export const AuditPasswordModal: React.FC<AuditPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle,
  actionType,
  invoiceNo,
}) => {
  const [password, setPassword] = useState('');
  const [auditUser, setAuditUser] = useState('Audit Officer');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default audit password is audit123 or admin123
    if (password === 'audit123' || password === 'admin123' || password === 'accountix') {
      onSuccess(auditUser.trim() || 'Audit Officer', reason.trim() || `${actionType} transaction ${invoiceNo}`);
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Invalid ACCOUNTIX Audit Password. (Default demo password: audit123)');
    }
  };

  const isDelete = actionType === 'DELETE';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between text-white ${
          isDelete ? 'bg-red-600' : 'bg-[#0b66c3]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ACCOUNTIX Audit Verification</h3>
              <p className="text-[11px] text-white/80">{actionTitle} ({invoiceNo})</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Security & Audit Compliance:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Modifying or deleting financial cash records requires senior audit authorization. An indelible audit log entry will be recorded with timestamp and authorized user name.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            {/* Authorized User */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized By / Supervisor Name:
              </label>
              <input
                type="text"
                value={auditUser}
                onChange={(e) => setAuditUser(e.target.value)}
                placeholder="e.g. Audit Manager / Muhammad Farhan"
                className="w-full text-xs rounded border border-slate-300 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-900"
                required
              />
            </div>

            {/* Audit Reason */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for {actionType === 'DELETE' ? 'Deletion' : 'Modification'}:
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={isDelete ? 'e.g. Customer returned items / Wrong entry' : 'e.g. Customer requested invoice detail correction'}
                className="w-full text-xs rounded border border-slate-300 py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                required
              />
            </div>

            {/* Audit Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Audit Password:
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Demo: audit123</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter audit password..."
                  className="w-full text-xs rounded border border-slate-300 py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-wider"
                  autoFocus
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-md shadow-xs transition-colors cursor-pointer ${
                isDelete
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Authorize & Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
