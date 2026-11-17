import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

// Assume these icons are imported from an icon library
import {
  AlertIcon,
  BoltIcon,
  CalenderIcon,
  ChevronDownIcon,
  DollarLineIcon,
  FileIcon,
  GridIcon,
  ListIcon,
  LockIcon,
  PaperPlaneIcon,
  PieChartIcon,
  PlugInIcon,
  ShootingStarIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons";


import { useSidebar } from "../context/SidebarContext";



type NavSubItem = {
  name: string;
  path: string;
  scope?: string;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  scope?: string;
  adminOnly?: boolean;
  subItems?: NavSubItem[];
};
type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        icon: <PieChartIcon />,
        name: "Analytics",
        path: "/analytics-dashboard",
        scope: "analytics:read",
      },
    ],
  },
  {
    title: "Live monitoring",
    items: [
      {
        icon: <BoltIcon />,
        name: "Realtime",
        path: "/realtime",
        scope: "monitoring:read",
      },
      {
        icon: <LockIcon />,
        name: "Login OTPs",
        path: "/login-otps",
        scope: "otp.monitor.getotps:read",
      },
      {
        icon: <GridIcon />,
        name: "Activity tracking",
        path: "/activity-tracking",
        scope: "activity:read",
      },
      {
        icon: <FileIcon />,
        name: "App logs",
        path: "/app-logs",
        scope: "app-logs:read",
      },
    ],
  },
  {
    title: "Users & listeners",
    items: [
      {
        icon: <UserCircleIcon />,
        name: "Users",
        subItems: [
          { name: "Enhanced users", path: "/enhanced-users", scope: "users:read" },
          { name: "Regular users", path: "/users", scope: "users:read" },
          { name: "Bulk update", path: "/bulk-user-update", scope: "users:write" },
          { name: "Aadhaar verifications", path: "/aadhaar", scope: "aadhaar:read" },
        ],
      },
      {
        icon: <CalenderIcon />,
        name: "Listeners",
        subItems: [
          { name: "Approval status", path: "/listener-approval-status", scope: "listeners:read" },
          { name: "Bank details", path: "/listener-banks", scope: "payouts:read" },
          { name: "Payout summary", path: "/listener-payout-summary", scope: "payouts:read" },
          { name: "Doctor management", path: "/doctor-management", scope: "doctors:read" },
          { name: "Doctor status", path: "/doctor-status-management", scope: "doctors:read" },
        ],
      },
    ],
  },
  {
    title: "Sessions",
    items: [
      {
        icon: <ListIcon />,
        name: "Session history",
        subItems: [
          { name: "All sessions", path: "/sessionhistory", scope: "sessions:read" },
          { name: "Session reports", path: "/session-reports", scope: "sessions:read" },
          { name: "Call recordings", path: "/call-recordings", scope: "call.recordings:read" },
          { name: "IVR calls", path: "/ivr-calls", scope: "ivr:read" },
        ],
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        icon: <DollarLineIcon />,
        name: "Wallet & payments",
        subItems: [
          { name: "Overview", path: "/wallet-overview", scope: "wallet:read" },
          { name: "All transactions", path: "/wallet-transactions", scope: "wallet:read" },
          { name: "Account transactions", path: "/account-transactions", scope: "wallet:read" },
          { name: "Razorpay transactions", path: "/razorpay-transactions", scope: "wallet:read" },
          { name: "Razorpay test users", path: "/razorpay-test-users", scope: "razorpay.test:read" },
          { name: "Update wallet", path: "/update-wallet", scope: "wallet:write" },
        ],
      },
      {
        icon: <FileIcon />,
        name: "Invoices",
        subItems: [
          { name: "All invoices", path: "/all-invoices", scope: "invoices:read" },
          { name: "Invoice details", path: "/invoice-details", scope: "invoices:read" },
          { name: "Invoice statistics", path: "/invoice-statistics", scope: "invoices.stats:read" },
        ],
      },
    ],
  },
  {
    title: "Content & community",
    items: [
      {
        icon: <FileIcon />,
        name: "Posts",
        subItems: [
          { name: "All posts", path: "/posts-management", scope: "posts:read" },
          { name: "Statistics", path: "/post-statistics", scope: "posts:read" },
          { name: "Reports", path: "/post-reports", scope: "posts:read" },
        ],
      },
      {
        icon: <ShootingStarIcon />,
        name: "Ratings",
        subItems: [
          { name: "All ratings", path: "/all-ratings", scope: "ratings:read" },
          { name: "Statistics", path: "/rating-statistics", scope: "ratings:read" },
          { name: "User summary", path: "/user-rating-summary", scope: "ratings:read" },
        ],
      },
      {
        icon: <PaperPlaneIcon />,
        name: "Notifications",
        subItems: [
          { name: "All notifications", path: "/all-notifications", scope: "notifications:read" },
          { name: "Send notification", path: "/send-notifications", scope: "notifications:write" },
          { name: "Statistics", path: "/notification-statistics", scope: "notifications:read" },
        ],
      },
      {
        icon: <AlertIcon />,
        name: "Support tickets",
        path: "/support-tickets",
        scope: "support:read",
      },
    ],
  },
  {
    title: "Products",
    items: [
      {
        icon: <ShootingStarIcon />,
        name: "Astro admin",
        path: "/astro",
        scope: "astro.analytics:read",
      },
      {
        icon: <TableIcon />,
        name: "Configuration",
        subItems: [
          { name: "App config", path: "/app-configuration", scope: "app.config:read" },
          { name: "Booking checkout", path: "/booking-coupons", scope: "booking.coupons:read" },
        ],
      },
    ],
  },
  {
    title: "Developer",
    items: [
      {
        icon: <PlugInIcon />,
        name: "API dashboard",
        path: "/api-dashboard",
        scope: "monitoring:read",
      },
      {
        icon: <BoltIcon />,
        name: "Infrastructure",
        subItems: [
          { name: "Service status", path: "/services-status", scope: "monitoring:read" },
          { name: "Processes", path: "/processes", scope: "monitoring:read" },
          { name: "Monitoring", path: "/monitoring", scope: "monitoring:read" },
        ],
      },
      {
        icon: <TaskIcon />,
        name: "Tasks",
        path: "/tasks",
        scope: "todos:read",
      },
    ],
  },
];

// Removed supportItems and othersItems - only keeping main navigation

function filterNavItem(
  item: NavItem,
  can: (scope: string) => boolean,
  isAdmin: boolean
): NavItem | null {
  if (item.adminOnly && !isAdmin) return null;

  if (item.subItems) {
    const subItems = item.subItems.filter(
      (sub) => !sub.scope || can(sub.scope)
    );
    if (subItems.length === 0) return null;
    return { ...item, subItems };
  }

  if (item.scope && !can(item.scope)) return null;
  return item;
}

function filterNavSections(
  sections: NavSection[],
  can: (scope: string) => boolean,
  isAdmin: boolean
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => filterNavItem(item, can, isAdmin))
        .filter((item): item is NavItem => item !== null),
    }))
    .filter((section) => section.items.length > 0);
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { can, isAdmin } = useAuth();
  const location = useLocation();

  const allSections = useMemo<NavSection[]>(() => {
    const settingsSubItems: NavSubItem[] = [
      { name: "Change Password", path: "/settings/password", scope: "auth:read" },
    ];
    if (isAdmin) {
      settingsSubItems.push(
        { name: "Admin Accounts", path: "/settings/admins" },
        { name: "Roles", path: "/settings/roles" }
      );
    }

    const settingsSection: NavSection = {
      title: "Settings",
      items: [
        {
          icon: <UserCircleIcon />,
          name: "Account",
          subItems: settingsSubItems,
        },
      ],
    };

    return filterNavSections(
      [...navSections, settingsSection],
      can,
      isAdmin
    );
  }, [can, isAdmin]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    let globalIndex = 0;
    allSections.forEach((section) => {
      section.items.forEach((nav) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: "main",
                index: globalIndex,
              });
              submenuMatched = true;
            }
          });
        }
        globalIndex += 1;
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, allSections]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderSection = (title: string, items: NavItem[], startIndex: number) => (
    <div className="flex flex-col gap-3">
      {(isExpanded || isHovered || isMobileOpen) && (
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      )}
      <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(startIndex + index, "main")}
              className={`menu-item group ${
                openSubmenu?.type === "main" && openSubmenu?.index === (startIndex + index)
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === "main" && openSubmenu?.index === (startIndex + index)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === "main" && openSubmenu?.index === (startIndex + index)
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${startIndex + index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === "main" && openSubmenu?.index === (startIndex + index)
                    ? `${subMenuHeight[`main-${startIndex + index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
      </ul>
    </div>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/dark-logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/dark-logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-5">
              {allSections.reduce<{ nodes: React.ReactNode[]; offset: number }>(
                (acc, section) => {
                  acc.nodes.push(
                    renderSection(section.title, section.items, acc.offset)
                  );
                  acc.offset += section.items.length;
                  return acc;
                },
                { nodes: [], offset: 0 }
              ).nodes}
            </div>
          </div>
        </nav>
        
      </div>
    </aside>
  );
};

export default AppSidebar;
