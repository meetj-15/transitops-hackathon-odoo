import {
  Car,
  ClipboardList,
  CreditCard,
  Fuel,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"],
  },
  { label: "Vehicles", to: "/vehicles", icon: Truck, roles: ["Fleet Manager"] },
  { label: "Drivers", to: "/drivers", icon: Users, roles: ["Fleet Manager", "Safety Officer"] },
  { label: "Trips", to: "/trips", icon: ClipboardList, roles: ["Fleet Manager", "Driver"] },
  { label: "Maintenance", to: "/maintenance", icon: Wrench, roles: ["Fleet Manager"] },
  { label: "Fuel Logs", to: "/fuel", icon: Fuel, roles: ["Fleet Manager", "Financial Analyst"] },
  { label: "Expenses", to: "/expenses", icon: CreditCard, roles: ["Fleet Manager", "Financial Analyst"] },
];

const pageTitles = {
  "/dashboard": "Fleet Overview",
  "/vehicles": "Vehicles",
  "/drivers": "Drivers",
  "/trips": "Trips",
  "/maintenance": "Maintenance",
  "/fuel": "Fuel Logs",
  "/expenses": "Expenses",
};

export default function DashboardLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));
  const pageTitle = pageTitles[location.pathname] ?? "TransitOps";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Car size={22} aria-hidden="true" />
          </div>
          <div>
            <h1>TransitOps</h1>
            <p>Smart transport operations</p>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} className="nav-link" to={item.to}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-profile">
          <div className="avatar" aria-hidden="true">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong>{user?.email ?? "Demo user"}</strong>
            <span>{user?.role ?? "Fleet Manager"}</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <div className="topbar">
          <div className="topbar-title">
            <button className="icon-button mobile-only" type="button" aria-label="Open navigation">
              <Menu size={20} aria-hidden="true" />
            </button>
            <div>
              <strong>{pageTitle}</strong>
              <span>TransitOps / {pageTitle}</span>
            </div>
          </div>
          <button className="button secondary" type="button" onClick={logout}>
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
