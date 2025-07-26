"use client";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ModeToggle } from "../nav-items/ModeToggle";
import { UserDropDown } from "../nav-items/UserDropDown";
import Cart from "../nav-items/Cart";
import Wishlist from "../nav-items/Wishlist";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";
import { NavbarMenu } from "../nav-items/NavbarMenu";

const Navbar = () => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-[#263238]/80 backdrop-blur-md">
      <div className="section-container">
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={
                  theme === "dark" ? "/hb-logo-dark.png" : "/hb-logo-light.png"
                }
                alt="HB Apparel Logo"
                width={32}
                height={32}
                quality={100}
              />
              <span className="text-lg font-medium text-[#263238] dark:text-white">
                HB Apparel
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center">
            <NavbarMenu />
          </div>

          {/* Right: Icons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && (
              <>
                <Link href="/wishlist">
                  <Wishlist />
                </Link>
                <Link href="/cart">
                  <Cart />
                </Link>
                <UserDropDown />
              </>
            )}
            {!isLoggedIn && (
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="text-sm"
                >
                  Sign In
                </Button>
              </Link>
            )}
            <ModeToggle />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex justify-between items-center h-16">
          {/* Left: Menu Drawer Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#263238] dark:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] bg-white dark:bg-[#263238]"
            >
              <SheetHeader>
                <NavbarMenu />
              </SheetHeader>
            </SheetContent>
          </Sheet>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2"
          >
            <Image
              src={
                theme === "dark" ? "/hb-logo-dark.png" : "/hb-logo-light.png"
              }
              alt="HB Apparel Logo"
              width={32}
              height={32}
              quality={100}
            />
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center space-x-3">
            {isLoggedIn && (
              <>
                <Link href="/wishlist">
                  <Wishlist />
                </Link>
                <Link href="/cart">
                  <Cart />
                </Link>
              </>
            )}
            {!isLoggedIn && (
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Sign In
                </Button>
              </Link>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
