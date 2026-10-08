export interface NavDropdownItem {
  id: string;
  label: string;
  route: string;
  description?: string;
  badge?: string;
}

export interface NavDropdownGroup {
  groupTitle: string;
  items: NavDropdownItem[];
}

export interface NavMenuItem {
  id: string;
  label: string;
  route: string;
  hasDropdown: boolean;
  // If dropdown has grouped sections (e.g. Transactions -> Sales, Purchases, Other Transactions)
  groups?: NavDropdownGroup[];
  // If dropdown is a flat list (e.g. Accounts, Banking, Payroll, Manufacturing, Reports, Stock, Settings)
  items?: NavDropdownItem[];
  isSpecialAction?: boolean; // For Logout
}

export interface ActiveRouteInfo {
  menuId: string;
  itemId?: string;
  groupTitle?: string;
  label: string;
  parentLabel?: string;
  route: string;
}
