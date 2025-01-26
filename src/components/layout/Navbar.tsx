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
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center ml-2">
            <Link href="/" className="flex items-center">
              <Image
                src={
                  theme === "dark" ? "/hb-logo-dark.png" : "/hb-logo-light.png"
                }
                alt="HB Apparel Logo"
                width={40}
                height={40}
                quality={100}
              />
              <span className="self-center text-xl text-custom-blue ml-1 font-semibold whitespace-nowrap dark:text-custom-blue">
                BH Apparel
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex justify-center items-center space-x-4">
            <NavbarMenu />
          </div>

          {/* Right: Icons */}
          <div className="flex justify-end items-center space-x-4">
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
                <Button variant="outline">Login</Button>
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
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
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
              width={40}
              height={40}
              quality={100}
            />
          </Link>

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
              </>
            )}
            {!isLoggedIn && (
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
