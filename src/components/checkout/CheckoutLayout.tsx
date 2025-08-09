"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface CheckoutLayoutProps {
  children: ReactNode;
}

export function CheckoutLayout({ children }: CheckoutLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Back to Cart */}
            <div className="flex items-center space-x-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Cart
                </Button>
              </Link>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    HB
                  </span>
                </div>
                <span className="font-bold text-lg text-foreground">
                  HB Apparel
                </span>
              </Link>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 p-0"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help? Contact our{" "}
              <Link
                href="/support"
                className="text-primary hover:text-primary/80 font-medium"
              >
                customer support
              </Link>{" "}
              or call{" "}
              <a
                href="tel:+1-555-0123"
                className="text-primary hover:text-primary/80 font-medium"
              >
                +1 (555) 012-3456
              </a>
            </p>
            <p className="mt-2 text-xs">
              Secure checkout powered by Stripe • Your payment information is
              encrypted and secure
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
