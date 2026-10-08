import React from 'react';
import { NavDropdownGroup, NavDropdownItem } from '../../types/navigation';
import { ChevronRight } from 'lucide-react';

interface NavDropdownProps {
  isOpen: boolean;
  groups?: NavDropdownGroup[];
  items?: NavDropdownItem[];
  currentRoute: string;
  onItemSelect: (item: NavDropdownItem, groupTitle?: string) => void;
  menuId: string;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  isOpen,
  groups,
  items,
  currentRoute,
  onItemSelect,
  menuId,
}) => {
  if (!isOpen) return null;

  // Grouped dropdown (like Transactions)
  if (groups && groups.length > 0) {
    return (
      <div
        role="menu"
        aria-label={`${menuId} menu`}
        className="absolute left-0 top-full mt-0 w-[580px] max-w-[90vw] bg-white rounded-b-lg shadow-xl shadow-blue-950/10 border border-t-2 border-slate-200 border-t-sky-500 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map((group, groupIdx) => (
            <div
              key={group.groupTitle}
              className={`flex flex-col ${
                groupIdx > 0 ? 'md:border-l md:border-slate-100 md:pl-4' : ''
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900/70 mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>{group.groupTitle}</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {group.items.length}
                </span>
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentRoute === item.route;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => onItemSelect(item, group.groupTitle)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between group ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-800'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 ${
                            isActive ? 'opacity-100 text-blue-600' : 'text-slate-400'
                          }`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Flat list dropdown (Accounts, Banking, Payroll, Manufacturing, Reports, Stock, Settings)
  if (items && items.length > 0) {
    // If list is large (like Reports with 12 items), render in 2 clean columns or a scrollable/compact column
    const isMultiColumn = items.length > 8;

    return (
      <div
        role="menu"
        aria-label={`${menuId} menu`}
        className={`absolute left-0 top-full mt-0 ${
          isMultiColumn ? 'w-80 sm:w-96' : 'w-56'
        } bg-white rounded-b-lg shadow-xl shadow-blue-950/10 border border-t-2 border-slate-200 border-t-sky-500 py-2 px-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150`}
      >
        <ul
          className={
            isMultiColumn
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-0.5 max-h-[75vh] overflow-y-auto'
              : 'space-y-0.5 max-h-[75vh] overflow-y-auto'
          }
        >
          {items.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onItemSelect(item)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-blue-50/80 hover:text-blue-800'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 ${
                      isActive ? 'opacity-100 text-blue-600' : 'text-slate-400'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return null;
};
