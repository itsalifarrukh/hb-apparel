"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react"; // Import useSession from NextAuth
import { ModeToggle } from "../nav-items/ModeToggle";
import { UserDropDown } from "../nav-items/UserDropDown";
import Cart from "../nav-items/Cart";
import Wishlist from "../nav-items/Wishlist";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { NavbarMenu } from "../nav-items/NavbarMenu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const { data: session } = useSession(); // Get session data
  const isLoggedIn = !!session; // Check if the user is logged in

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
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
          <div className="hidden md:flex items-center space-x-4">
            <NavbarMenu />
          </div>

          {/* Right: Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && (
              <>
                <Wishlist />
                <Cart />
                <UserDropDown />
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link href="/sign-in">
                  <Button variant="outline">Login</Button>
                </Link>
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavbarMenu />
            </div>
            <div className="flex justify-center space-x-4 py-4 border-t border-gray-100">
              {isLoggedIn && (
                <>
                  <Wishlist />
                  <Cart />
                  <UserDropDown />
                </>
              )}
              <ModeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
