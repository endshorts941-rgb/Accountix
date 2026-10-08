import React, { useState, useRef, useEffect } from 'react';
import { NavMenuItem, NavDropdownItem, ActiveRouteInfo } from '../../types/navigation';
import { ACCOUNTIX_NAV_ITEMS, LOGOUT_ITEM } from '../../data/navigationData';
import { AccountixLogo } from './AccountixLogo';
import { NavDropdown } from './NavDropdown';
import {
  ChevronDown,
  LogOut,
  Menu,
  X,
  Check,
  LayoutDashboard,
  Landmark,
  Wallet,
  ShoppingCart,
  BarChart3,
  Package,
  Settings,
  User,
} from 'lucide-react';

const getMenuIcon = (id: string) => {
  switch (id) {
    case 'dashboard':
      return <LayoutDashboard className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case 'banking':
      return <Landmark className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case 'expenses':
      return <Wallet className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case 'sales':
      return <ShoppingCart className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case 'reports':
      return <BarChart3 className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case 'stock':
      return <Package className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    case 'settings':
      return <Settings className="w-3.5 h-3.5 text-slate-800 shrink-0" />;
    default:
      return null;
  }
};

interface AccountixTopNavProps {
  currentRoute: string;
  activeRouteInfo: ActiveRouteInfo;
  onRouteChange: (info: ActiveRouteInfo) => void;
  onLogoutClick?: () => void;
}

export const AccountixTopNav: React.FC<AccountixTopNavProps> = ({
  currentRoute,
  activeRouteInfo,
  onRouteChange,
  onLogoutClick,
}) => {
  // Currently open dropdown menu ID (null if none)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Mobile drawer open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Mobile expanded dropdown accordion state
  const [mobileExpandedMenuId, setMobileExpandedMenuId] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Hover handlers with debounce to prevent sudden jitter
  const handleMouseEnter = (menuId: string, hasDropdown: boolean) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hasDropdown) {
      setOpenMenuId(menuId);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenMenuId(null);
    }, 180);
  };

  const handleMenuClick = (menu: NavMenuItem) => {
    if (menu.id === 'logout' || menu.isSpecialAction) {
      handleLogoutAction();
      return;
    }
    if (menu.hasDropdown) {
      setOpenMenuId((prev) => (prev === menu.id ? null : menu.id));
    } else {
      setOpenMenuId(null);
      onRouteChange({
        menuId: menu.id,
        label: menu.label,
        route: menu.route,
      });
    }
  };

  const handleItemSelect = (
    menu: NavMenuItem,
    item: NavDropdownItem,
    groupTitle?: string
  ) => {
    setOpenMenuId(null);
    setMobileMenuOpen(false);
    onRouteChange({
      menuId: menu.id,
      itemId: item.id,
      groupTitle,
      label: item.label,
      parentLabel: menu.label,
      route: item.route,
    });
  };

  const handleDashboardClick = () => {
    setOpenMenuId(null);
    onRouteChange({
      menuId: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
    });
  };

  const handleLogoutAction = () => {
    setOpenMenuId(null);
    setMobileMenuOpen(false);
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      onRouteChange({
        menuId: 'logout',
        label: 'Logout',
        route: '/logout',
      });
    }
  };

  return (
    <header
      ref={navRef}
      className="shrink-0 z-50 w-full bg-[#A2CFEA] border-b border-[#7F9EAD] select-none text-[#111111]"
    >
      {/* Primary Top Bar Container */}
      <div className="max-w-[1920px] mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex items-center justify-between h-9 sm:h-10">
          {/* 1. Brand Logo / Home Anchor */}
          <div className="flex items-center shrink-0 pr-2 lg:pr-3 border-r border-[#7F9EAD]/60">
            <AccountixLogo onClick={handleDashboardClick} />
          </div>

          {/* Desktop & Laptop Navigation Links */}
          <nav
            role="menubar"
            aria-label="Main Navigation"
            className="hidden lg:flex items-center flex-1 ml-1.5 lg:ml-2.5 h-full overflow-visible"
            onMouseLeave={handleMouseLeave}
          >
            {ACCOUNTIX_NAV_ITEMS.filter((i) => i.id !== 'logout').map((item) => {
              const isCurrentActive =
                activeRouteInfo.menuId === item.id ||
                currentRoute.startsWith(item.route);
              const isOpen = openMenuId === item.id;

              return (
                <div
                  key={item.id}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => handleMouseEnter(item.id, item.hasDropdown)}
                >
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup={item.hasDropdown ? 'true' : 'false'}
                    aria-expanded={isOpen}
                    onClick={() => handleMenuClick(item)}
                    className={`h-7.5 px-2 xl:px-2.5 mx-0.5 rounded flex items-center gap-1.5 text-xs font-semibold tracking-normal transition-colors whitespace-nowrap cursor-pointer ${
                      isCurrentActive
                        ? 'bg-[#82B8DC] text-[#111111] shadow-2xs font-bold'
                        : isOpen
                        ? 'bg-[#8EBFE0] text-[#111111]'
                        : 'text-[#111111] hover:bg-[#8DC3E2]'
                    }`}
                  >
                    {getMenuIcon(item.id)}
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`w-3 h-3 text-slate-700 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu Container */}
                  {item.hasDropdown && (
                    <NavDropdown
                      isOpen={isOpen}
                      menuId={item.id}
                      groups={item.groups}
                      items={item.items}
                      currentRoute={currentRoute}
                      onItemSelect={(subItem, groupTitle) =>
                        handleItemSelect(item, subItem, groupTitle)
                      }
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Controls: Admin dropdown & Logout */}
          <div className="hidden lg:flex items-center gap-1 ml-2 border-l border-[#7F9EAD]/60 pl-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenuId(openMenuId === 'admin' ? null : 'admin')}
                className="h-7.5 px-2 rounded flex items-center gap-1 text-xs font-semibold text-[#111111] hover:bg-[#8DC3E2] transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-800" />
                <span>Admin</span>
                <ChevronDown className="w-3 h-3 text-slate-700" />
              </button>
              {openMenuId === 'admin' && (
                <div className="absolute right-0 top-full mt-0.5 w-44 bg-white border border-[#7F9EAD] shadow-lg py-1 z-50 text-xs text-slate-800">
                  <div className="px-3 py-1 font-bold border-b border-slate-200 text-[11px] text-slate-500">
                    Administrator
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onRouteChange({ menuId: 'settings', itemId: 'users-permissions', label: 'Users & Permissions', route: '/settings/users-permissions' });
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50"
                  >
                    User Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRouteChange({ menuId: 'settings', itemId: 'business-company', label: 'Company Profile', route: '/settings/business-company' });
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50"
                  >
                    Company Setup
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogoutAction}
              className="h-7.5 px-2 rounded flex items-center gap-1 text-xs font-semibold text-[#111111] hover:bg-[#8DC3E2] transition-colors cursor-pointer"
              title="Logout from ACCOUNTIX"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-800" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle (hidden on desktop) */}
          <div className="lg:hidden flex items-center pl-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1 rounded text-slate-800 hover:bg-[#8DC3E2] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Full Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-blue-800 bg-[#0952a5] shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="p-3 space-y-1">
            {/* Mobile Dashboard */}
            <button
              type="button"
              onClick={handleDashboardClick}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
                activeRouteInfo.menuId === 'dashboard'
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <span>Dashboard</span>
              {activeRouteInfo.menuId === 'dashboard' && (
                <Check className="w-4 h-4 text-sky-300" />
              )}
            </button>

            {/* Mobile Dropdown Groups */}
            {ACCOUNTIX_NAV_ITEMS.filter(
              (i) => i.id !== 'dashboard' && i.id !== 'logout'
            ).map((item) => {
              const isExpanded = mobileExpandedMenuId === item.id;
              const isCurrentActive =
                activeRouteInfo.menuId === item.id ||
                currentRoute.startsWith(item.route);

              return (
                <div
                  key={item.id}
                  className="rounded-md border border-blue-800/60 overflow-hidden bg-blue-900/30"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpandedMenuId(isExpanded ? null : item.id)
                    }
                    className={`w-full text-left px-3 py-2.5 text-sm font-medium flex items-center justify-between transition-colors ${
                      isCurrentActive
                        ? 'bg-blue-700/70 text-white font-semibold'
                        : 'text-blue-100 hover:bg-blue-800/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-blue-300 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Dropdown Content on Mobile */}
                  {isExpanded && (
                    <div className="bg-white text-slate-800 p-2 border-t border-blue-200">
                      {/* Grouped menu like Transactions */}
                      {item.groups && (
                        <div className="space-y-3">
                          {item.groups.map((group) => (
                            <div key={group.groupTitle} className="space-y-1">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900/60 px-2 pt-1">
                                {group.groupTitle}
                              </div>
                              {group.items.map((subItem) => {
                                const isActive = currentRoute === subItem.route;
                                return (
                                  <button
                                    key={subItem.id}
                                    type="button"
                                    onClick={() =>
                                      handleItemSelect(item, subItem, group.groupTitle)
                                    }
                                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                                      isActive
                                        ? 'bg-blue-100 text-blue-800 font-semibold'
                                        : 'text-slate-700 hover:bg-blue-50'
                                    }`}
                                  >
                                    <span>{subItem.label}</span>
                                    {isActive && (
                                      <Check className="w-3.5 h-3.5 text-blue-600" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Flat list menus */}
                      {item.items && (
                        <div className="space-y-0.5">
                          {item.items.map((subItem) => {
                            const isActive = currentRoute === subItem.route;
                            return (
                              <button
                                key={subItem.id}
                                type="button"
                                onClick={() => handleItemSelect(item, subItem)}
                                className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-800 font-semibold'
                                    : 'text-slate-700 hover:bg-blue-50'
                                }`}
                              >
                                <span>{subItem.label}</span>
                                {isActive && (
                                  <Check className="w-3.5 h-3.5 text-blue-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Logout Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogoutAction}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center justify-between text-red-200 bg-red-950/40 border border-red-800/40 hover:bg-red-900/60"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-red-300" />
                  <span>Logout</span>
                </div>
                <span className="text-xs text-red-300">Accountix Auth</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
