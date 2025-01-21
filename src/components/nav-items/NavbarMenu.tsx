"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const menComponents: { title: string; href: string; description: string }[] = [
  {
    title: "T-Shirts",
    href: "/men/t-shirts",
    description:
      "Explore a variety of stylish and comfortable t-shirts for men, suitable for all occasions.",
  },
  {
    title: "Shirts",
    href: "/men/shirts",
    description:
      "Find a wide range of casual and formal shirts to elevate your wardrobe.",
  },
  {
    title: "Jeans",
    href: "/men/jeans",
    description:
      "Discover durable and trendy jeans for men in various fits and styles.",
  },
  {
    title: "Outerwear",
    href: "/men/outerwear",
    description:
      "Stay warm and stylish with jackets, coats, and hoodies for men.",
  },
  {
    title: "Footwear",
    href: "/men/footwear",
    description:
      "Shop for versatile footwear options, from sneakers to formal shoes.",
  },
  {
    title: "Accessories",
    href: "/men/accessories",
    description:
      "Complete your look with belts, wallets, watches, and more for men.",
  },
];

const womenComponents: { title: string; href: string; description: string }[] =
  [
    {
      title: "Dresses",
      href: "/women/dresses",
      description:
        "Explore elegant and casual dresses for all occasions and styles.",
    },
    {
      title: "Tops",
      href: "/women/tops",
      description:
        "Browse a variety of trendy and classic tops for everyday wear.",
    },
    {
      title: "Bottoms",
      href: "/women/bottoms",
      description:
        "Find skirts, pants, and leggings that combine comfort and style.",
    },
    {
      title: "Activewear",
      href: "/women/activewear",
      description:
        "Shop high-performance and stylish activewear for workouts and beyond.",
    },
    {
      title: "Footwear",
      href: "/women/footwear",
      description:
        "Discover sandals, heels, sneakers, and other footwear for women.",
    },
    {
      title: "Accessories",
      href: "/women/accessories",
      description:
        "Elevate your outfit with handbags, jewelry, scarves, and more.",
    },
  ];

const kidsComponents: { title: string; href: string; description: string }[] = [
  {
    title: "Tops & Tees",
    href: "/kids/tops-tees",
    description:
      "Explore colorful and fun t-shirts and tops for kids of all ages.",
  },
  {
    title: "Bottoms",
    href: "/kids/bottoms",
    description:
      "Find comfortable and durable pants, shorts, and skirts for kids.",
  },
  {
    title: "Outerwear",
    href: "/kids/outerwear",
    description:
      "Keep your kids warm with jackets, coats, and hoodies for any season.",
  },
  {
    title: "Footwear",
    href: "/kids/footwear",
    description:
      "Shop playful and practical footwear options, including sneakers and sandals.",
  },
  {
    title: "School Essentials",
    href: "/kids/school-essentials",
    description:
      "Discover backpacks, uniforms, and other essentials for school-going kids.",
  },
  {
    title: "Accessories",
    href: "/kids/accessories",
    description: "Complete your kid's look with hats, gloves, socks, and more.",
  },
];

export function NavbarMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/about-us" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              New Arrivals
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Men</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {menComponents.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Women</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {womenComponents.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Kids</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {kidsComponents.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/contact-us" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Contact
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
