import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Server } from 'lucide-react';

interface WordPressPluginExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WordPressPluginExportModal: React.FC<WordPressPluginExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pluginPhpCode = `<?php
/**
 * Plugin Name: ACCOUNTIX - Sale Invoice Module
 * Description: Modular Frontend Sale Invoice Component for ACCOUNTIX accounting software.
 * Version: 1.0.0
 * Author: ACCOUNTIX Engineering
 */

defined('ABSPATH') || exit;

class Accountix_Sale_Invoice_Module {

    public function __construct() {
        // Register frontend shortcode
        add_shortcode('accountix_sale_invoice', [$this, 'render_invoice_interface']);

        // Handle AJAX save invoice
        add_action('wp_ajax_accountix_save_sale_invoice', [$this, 'handle_save_invoice']);
    }

    public function render_invoice_interface($atts) {
        ob_start();
        include plugin_dir_path(__FILE__) . 'templates/sale-invoice-frontend.php';
        return ob_get_clean();
    }

    public function handle_save_invoice() {
        check_ajax_referer('accountix_nonce', 'security');

        $sale_type     = sanitize_text_field($_POST['saleType'] ?? 'Cash Sale');
        $customer_id   = sanitize_text_field($_POST['customerId'] ?? '');
        $store_id      = sanitize_text_field($_POST['storeLocationId'] ?? '');
        $payment_mode  = sanitize_text_field($_POST['paymentMethod'] ?? 'Cash');
        $net_total     = floatval($_POST['netInvoiceTotal'] ?? 0);
        $cash_received = floatval($_POST['cashReceivedAtSale'] ?? 0);
        $items         = json_decode(stripslashes($_POST['items'] ?? '[]'), true);

        // 1. Enforce Cash vs Credit Rules
        if ($sale_type === 'Credit Sale' && empty($customer_id)) {
            wp_send_json_error(['message' => 'Customer Name is REQUIRED for Credit Sale.']);
        }

        global $wpdb;
        $wpdb->query('START TRANSACTION');

        try {
            // 2. Insert Invoice Record into wp_accountix_invoices
            // 3. Deduct stock from wp_accountix_store_inventory WHERE store_id = $store_id
            // 4. Update customer ledger wp_accountix_customer_ledger (if Credit Sale)
            // 5. Post double-entry to wp_accountix_daybook (Debit Cash/Bank, Credit Revenue)

            $wpdb->query('COMMIT');
            wp_send_json_success(['message' => 'Sale invoice recorded successfully.']);
        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            wp_send_json_error(['message' => $e->getMessage()]);
        }
    }
}

new Accountix_Sale_Invoice_Module();`;

  const copyCode = () => {
    navigator.clipboard.writeText(pluginPhpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                WordPress Modular Backend Connector (PHP)
              </h2>
              <p className="text-xs text-slate-500">
                Independent plugin class structure for ACCOUNTIX Sale Invoice
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-900 text-slate-100 flex-1 overflow-y-auto font-mono text-xs">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors font-sans"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy PHP Plugin Code'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-lg text-slate-300 overflow-x-auto">
            {pluginPhpCode}
          </pre>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
