"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./nav-items/ModeToggle";
import { UserDropDown } from "./nav-items/UserDropDown";
import Cart from "./nav-items/Cart";
import Wishlist from "./nav-items/Wishlist";
import Image from "next/image";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Example user logged-in state
  const isLoggedIn = true; // Replace with actual logic for checking if the user is logged in

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Teachers", path: "/teachers" },
    { name: "Pricing", path: "/pricing" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
    { name: "Book Demo", path: "/book-demo" },
  ];

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center p-2">
              <Image
                src={"/hb.png"}
                alt="logo"
                width={100}
                height={100}
                quality={100}
              />
              <span className="self-center text-xl text-custom-blue -ml-6 font-semibold whitespace-nowrap dark:text-custom-blue">
                BH Apparel
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            {/* Conditional Rendering for Logged In User */}
            {isLoggedIn && (
              <>
                <Wishlist />
                <Cart />
                <UserDropDown />
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Conditional Rendering for Logged In User */}
            {isLoggedIn && (
              <>
                <Wishlist />
                <Cart />
                <UserDropDown />
              </>
            )}
            <ModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
