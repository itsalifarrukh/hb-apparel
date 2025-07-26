"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

const Footer = () => {
  const { theme } = useTheme();

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
    <footer className="py-16 bg-[#F7F7F7] dark:bg-[#263238]">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">

          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Image
              src={
                theme === "dark" ? "/hb-logo-dark.png" : "/hb-logo-light.png"
              }
              alt="HB Apparel Logo"
              width={50}
              height={50}
            />
            <p className="mt-4 text-sm text-[#455A64] dark:text-[#B0BEC5]">
              Premium clothing for those who appreciate quality and style.
            </p>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-grow">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-medium text-[#263238] dark:text-white">
                  {category}
                </h4>
                <ul className="mt-2 space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-sm text-[#455A64] dark:text-[#B0BEC5] hover:underline">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Media Section */}
          <div>
            <h4 className="font-medium text-[#263238] dark:text-white">
              Follow Us
            </h4>
            <div className="flex space-x-4 mt-2">
              <Link href="#" className="text-[#455A64] dark:text-[#B0BEC5] hover:text-[#263238] dark:hover:text-white">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-[#455A64] dark:text-[#B0BEC5] hover:text-[#263238] dark:hover:text-white">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-[#455A64] dark:text-[#B0BEC5] hover:text-[#263238] dark:hover:text-white">
                <Twitter size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 border-t border-[#B0BEC5] dark:border-[#455A64] pt-6 text-center">
          <p className="text-sm text-[#455A64] dark:text-[#B0BEC5]">
            © {new Date().getFullYear()} HB Apparel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
