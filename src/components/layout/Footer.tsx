"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes"; // Import theme functionality

const Footer = () => {
  const { theme } = useTheme(); // Get the current theme (light or dark)

  const footerLinks = {
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "FAQs", href: "/faqs" },
      { name: "Careers", href: "/careers" },
    ],
    Support: [
      { name: "Shipping Info", href: "/shipping" },
      { name: "Returns", href: "/returns" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Track Order", href: "/track-order" },
    ],
    Legal: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className=" bg-background py-8 ">
      <div className="container mx-auto px-4 sm:px-4 lg:px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start gap-8">
          {/* Logo Section */}
          <div className="flex-shrink-0"></div>

          {/* Links and Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 flex-grow">
            {/* About Section */}
            <div>
              <Image
                src={
                  theme === "dark" ? "/hb-logo-dark.png" : "/hb-logo-light.png"
                }
                alt="HB Apparel Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <h3 className="text-xl font-bold mb-4">HB Apparel</h3>
              <p className="text-sm leading-relaxed">
                Premium clothing for those who appreciate quality and style.
              </p>
            </div>

            {/* Links Section */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-bold text-lg mb-4">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:underline"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Info Section */}
            <div>
              <h4 className="font-bold text-lg mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm">
                <li>123 Spa Street</li>
                <li>Karachi, Pakistan</li>
                <li>Phone: (021) 123-4567</li>
                <li>Email: info@zenithspa.pk</li>
              </ul>
            </div>

            {/* Social Media Section */}
            <div>
              <h4 className="font-bold text-lg mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  aria-label="Facebook"
                  className="transition-colors"
                >
                  <Facebook size={24} />
                </Link>
                <Link
                  href="#"
                  aria-label="Instagram"
                  className="transition-colors"
                >
                  <Instagram size={24} />
                </Link>
                <Link
                  href="#"
                  aria-label="Twitter"
                  className="transition-colors"
                >
                  <Twitter size={24} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} HB Apparel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
