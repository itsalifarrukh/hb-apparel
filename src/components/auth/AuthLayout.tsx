import React from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const AuthLayout = ({
  children,
  title,
  description,
  className,
}: AuthLayoutProps) => {
  return (
    <section className="relative flex justify-center items-center min-h-screen py-20 bg-[#F7F7F7] dark:bg-[#263238]">
      <div
        className={cn(
          "relative w-full max-w-md p-8 space-y-8 rounded-lg bg-white dark:bg-[#455A64] backdrop-blur-xl shadow-lg ring-1 ring-[#B0BEC5]/30 dark:ring-[#263238]/30",
          className
        )}
      >
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-6 text-[#263238] dark:text-white">
            {title}
          </h1>
          <p className="mb-4 text-[#455A64] dark:text-[#B0BEC5]">
            {description}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
};
