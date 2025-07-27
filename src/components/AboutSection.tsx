"use client";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-[#263238]">
      <div className="section-container">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Text column */}
          <div className="order-2 md:order-1">
            <h2 className="mb-6 text-4xl font-light tracking-tight text-[#263238] dark:text-white sm:text-5xl">
              Wear Confidence,
              <br className="hidden sm:block" /> Live Bold
            </h2>
            <p className="mb-6 text-lg text-[#455A64] dark:text-[#B0BEC5] leading-relaxed">
              At{" "}
              <span className="font-medium text-[#263238] dark:text-white">
                HB Apparel
              </span>{" "}
              we craft garments that blend timeless design with contemporary
              energy. Our mission is simple: empower you to move through life
              feeling unstoppable.
            </p>

            <ul className="mb-8 space-y-3 text-[#455A64] dark:text-[#B0BEC5]">
              <li className="flex items-start">
                <span className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-[#263238] dark:bg-white" />
                Premium, planet-friendly fabrics
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-[#263238] dark:bg-white" />
                Thoughtful craftsmanship & details
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-[#263238] dark:bg-white" />
                Inclusive styles for every story
              </li>
            </ul>

            <Button
              asChild
              className="bg-[#263238] text-white hover:bg-[#455A64] dark:bg-white dark:text-[#263238] dark:hover:bg-[#F7F7F7] px-6 py-6 text-sm uppercase tracking-wider"
            >
              <Link href="/" className="flex items-center gap-2">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Image column */}
          <div className="relative order-1 md:order-2">
            <Image
              src="https://plus.unsplash.com/premium_photo-1681488262364-8aeb1b6aac56?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="About HB Apparel"
              width={600}
              height={750}
              className="rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
