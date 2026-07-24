import React from "react";
import { useLocation } from "react-router-dom";
import TopNav from "./ui/Topnav";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "./ui/sidebar";
import { Link } from "react-router-dom";
import { LayoutDashboard, CreditCard } from "lucide-react";
import Headers2 from "./Headers2";
import { cn } from "../utils/Cn";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  // { to: '/admin/pricing-schedule-admin', label: 'Pricing Schedule', icon: CreditCard },
  {
    to: "/admin/property-confirm",
    label: "Property Confirm",
    icon: CreditCard,
  },
  {
    to: "/admin/block",
    label: "Block Dates",
    icon: CreditCard,
  },
  {
    to: "/admin/change-password",
    label: "Change Password",
    icon: CreditCard,
  },
];

const SidebarMenuItems = () => {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;

        return (
          <SidebarMenuItem key={link.to}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(
                "w-full rounded-lg transition-all",
                isActive
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-transparent",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Link
                to={link.to}
                className="flex items-center gap-3 px-3 py-2.5 w-full"
                aria-label={`Navigate to ${link.label}`}
                onClick={handleLinkClick}
              >
                <span
                  className={cn(
                    "font-medium",
                    isActive ? "text-white" : "text-gray-700",
                  )}
                >
                  {link.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

const Layout = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full h-screen bg-background overflow-hidden">
        <Sidebar
          collapsible="offcanvas"
          className="border-r border-gray-200 bg-white"
          variant="sidebar"
          side="left"
        >
          <SidebarHeader className="px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-15 w-40 rounded-lg overflow-hidden flex-shrink-0">
                <Link
                  to="/"
                  className="flex items-center justify-center h-full w-full"
                  aria-label="Navigate to home"
                >
                  <img
                    src="/attached_assets/CDC Logo_1753482679929.png"
                    alt="CDC Logo"
                    className="h-full w-full object-cover rounded-lg"
                    data-testid="img-cdc-logo"
                  />
                </Link>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarMenuItems />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col overflow-hidden min-w-0 flex-1">
          <Headers2 />
          <main
            className="flex-1 overflow-y-auto py-4 px-4 md:px-6 bg-gray-50 min-w-0 w-full"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
