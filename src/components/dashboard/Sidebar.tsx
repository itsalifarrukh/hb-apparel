"use client";

import { cn } from "@/lib/utils";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  CreditCard,
  Settings,
  Home
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    name: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
  {
    name: "Cart",
    href: "/dashboard/cart",
    icon: ShoppingCart,
  },
  {
    name: "Address Book",
    href: "/dashboard/address-book",
    icon: MapPin,
  },
  {
    name: "Saved Cards",
    href: "/dashboard/saved-cards",
    icon: CreditCard,
  },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">HB</span>
          </div>
          <span className="font-semibold text-lg">Dashboard</span>
        </Link>
      </div>
      
      <Separator className="my-2" />
      
      <div className="flex-1 px-4 py-2">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  pathname === item.href
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="px-4 py-4">
        <Separator className="mb-4" />
        <Link
          href="/"
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-muted-foreground hover:bg-accent hover:text-accent-foreground mb-2"
        >
          <ArrowLeft className="mr-3 h-5 w-5 flex-shrink-0" />
          Back to Store
        </Link>
        <Link
          href="/dashboard/settings"
          className={cn(
            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            pathname === "/dashboard/settings"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
          Settings
        </Link>
      </div>
    </div>
  );
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r px-0">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
