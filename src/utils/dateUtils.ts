/**
 * Date utility functions for ACCOUNTIX
 * Standard Date Format across the complete software: DD/MM/YYYY
 */

export const DEFAULT_REPORT_FROM_DATE = '01/01/2026';

export const getDefaultReportToDate = (): string => {
  return getCurrentDateDDMMYYYY();
};

/**
 * Returns the current date in DD/MM/YYYY format
 * Example: 02/10/2026
 */
export const getCurrentDateDDMMYYYY = (date: Date = new Date()): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Returns a future date (current date + days) in DD/MM/YYYY format
 */
export const getFutureDateDDMMYYYY = (daysAhead: number = 15): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return getCurrentDateDDMMYYYY(d);
};

/**
 * Converts any date string (ISO YYYY-MM-DD or Timestamp) into DD/MM/YYYY
 */
export const formatToDDMMYYYY = (dateInput?: string | Date | null): string => {
  if (!dateInput) return getCurrentDateDDMMYYYY();
  
  if (typeof dateInput === 'string') {
    // If already in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      return dateInput;
    }
    // If in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
      const [yyyy, mm, dd] = dateInput.substring(0, 10).split('-');
      return `${dd}/${mm}/${yyyy}`;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return getCurrentDateDDMMYYYY();
  }
  return getCurrentDateDDMMYYYY(d);
};

/**
 * Converts DD/MM/YYYY to YYYY-MM-DD (for HTML input[type="date"] sync)
 */
export const ddmmToIsoDate = (ddmmyyyy: string): string => {
  if (!ddmmyyyy) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(ddmmyyyy)) return ddmmyyyy;
  
  const parts = ddmmyyyy.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return '';
};

/**
 * Converts YYYY-MM-DD from HTML date picker into DD/MM/YYYY
 */
export const isoToDdmmDate = (yyyyMmDd: string): string => {
  if (!yyyyMmDd) return getCurrentDateDDMMYYYY();
  const parts = yyyyMmDd.split('-');
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
  }
  return yyyyMmDd;
};

/**
 * Parses time string (e.g. "09:00 AM", "02:00 PM", "14:30", "10:15:30") into milliseconds from start of day
 */
export const parseTimeToMilliseconds = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  
  // Match 12-hour format: "09:00 AM" or "2:30:15 PM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10) || 0;
    const seconds = parseInt(match12[3], 10) || 0;
    const meridiem = (match12[4] || '').toUpperCase();

    if (meridiem === 'PM' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  // If ISO date string, extract time component
  if (clean.includes('T') || clean.includes('-')) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) * 1000 + d.getMilliseconds();
    }
  }

  return 0;
};

/**
 * Parses DD/MM/YYYY or DD-MM-YYYY string (optionally containing time) into a Javascript Date object at 00:00:00
 */
export const parseDDMMYYYYToDate = (ddmmyyyy: string): Date | null => {
  if (!ddmmyyyy) return null;
  const clean = ddmmyyyy.trim();

  // Check if string contains DD/MM/YYYY or DD-MM-YYYY at the start
  const matchDdMm = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (matchDdMm) {
    const dd = parseInt(matchDdMm[1], 10);
    const mm = parseInt(matchDdMm[2], 10);
    const yyyy = parseInt(matchDdMm[3], 10);
    const date = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
    return isNaN(date.getTime()) ? null : date;
  }

  // Check if string is YYYY-MM-DD
  const matchYyyyMm = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (matchYyyyMm) {
    const yyyy = parseInt(matchYyyyMm[1], 10);
    const mm = parseInt(matchYyyyMm[2], 10);
    const dd = parseInt(matchYyyyMm[3], 10);
    const date = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
    return isNaN(date.getTime()) ? null : date;
  }

  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }
  return null;
};

/**
 * ACCOUNTIX Global Chronological Transaction Sorter
 * Strict Ascending Order Rule:
 * 1. Date -> Ascending (Oldest date first)
 * 2. Same Date par Time -> Ascending (Earlier time first)
 * 3. Same Date & Time par Transaction No. -> Ascending (TXN-000001 before TXN-000002)
 */
export const compareTransactionsChronologicalAscending = (a: any, b: any): number => {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  // Check for Opening Balance precedence
  const isOpeningA = Boolean(
    (a.description && a.description.toLowerCase().includes('opening balance')) ||
    (a.invoiceNo && a.invoiceNo.startsWith('OB-'))
  );
  const isOpeningB = Boolean(
    (b.description && b.description.toLowerCase().includes('opening balance')) ||
    (b.invoiceNo && b.invoiceNo.startsWith('OB-'))
  );
  if (isOpeningA && !isOpeningB) return -1;
  if (!isOpeningA && isOpeningB) return 1;

  // 1. Resolve date
  const dateStrA = a.invoiceDate || a.date || a.dateTime || a.createdAt || '';
  const dateStrB = b.invoiceDate || b.date || b.dateTime || b.createdAt || '';

  const parsedA = parseDDMMYYYYToDate(dateStrA);
  const parsedB = parseDDMMYYYYToDate(dateStrB);

  const dayTimeA = parsedA ? parsedA.getTime() : 0;
  const dayTimeB = parsedB ? parsedB.getTime() : 0;

  if (dayTimeA !== dayTimeB) {
    return dayTimeA - dayTimeB; // Oldest date first (Ascending)
  }

  // 2. Same Date: Compare exact time / createdAt / timestamp / invoiceTime
  // Check if time is embedded in dateStr or explicit in time fields
  const extractTime = (item: any, dateStr: string): number => {
    // Check explicit time properties
    if (item.invoiceTime) return parseTimeToMilliseconds(item.invoiceTime);
    if (item.time) return parseTimeToMilliseconds(item.time);
    if (item.exactTime) return parseTimeToMilliseconds(item.exactTime);

    // Check if time is embedded in dateStr, e.g. "01-10-2026 09:00 AM" or "15/01/2026 14:30"
    const timeMatch = dateStr.match(/\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM))?)/i);
    if (timeMatch) {
      return parseTimeToMilliseconds(timeMatch[1]);
    }

    // Check createdAt / dateTime ISO timestamp
    const isoStr = item.createdAt || item.dateTime;
    if (isoStr) {
      return parseTimeToMilliseconds(isoStr);
    }

    return 0;
  };

  const timeA = extractTime(a, dateStrA);
  const timeB = extractTime(b, dateStrB);

  if (timeA !== timeB) {
    return timeA - timeB; // Earlier time first (Ascending)
  }

  // 3. Same Date & Time: Compare Transaction No / Voucher No / Invoice No (Ascending)
  const noA = (a.transactionNo || a.voucherNo || a.invoiceNo || a.id || '').toString();
  const noB = (b.transactionNo || b.voucherNo || b.invoiceNo || b.id || '').toString();

  return noA.localeCompare(noB, undefined, { numeric: true, sensitivity: 'base' });
};

/**
 * Returns a new array sorted strictly in Ascending Chronological Order
 */
export const sortChronologicalAscending = <T>(items: T[]): T[] => {
  return [...items].sort(compareTransactionsChronologicalAscending);
};

/**
 * Returns the current time in HH:mm:ss format
 * Example: 14:35:22
 */
export const getCurrentTimeHHMMSS = (date: Date = new Date()): string => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

