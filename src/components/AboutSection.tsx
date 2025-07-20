"use client";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AboutSection = () => {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-20 p-8 bg-transparent"
    >
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-2xl md:blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl grid items-center gap-12 p-8 md:p-14 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 md:grid-cols-2">
        {/* Text column */}
        <div className="animate-fadeInUp order-2 md:order-1">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-teal-300 sm:text-5xl">
            Wear Confidence,
            <br className="hidden sm:block" /> Live Bold
          </h2>
          <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
            At <span className="font-semibold">BH Apparel</span> we craft
            garments that blend timeless design with contemporary energy. Our
            mission is simple: empower you to move through life feeling
            unstoppable.
          </p>

          <ul className="mb-8 space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-3 mt-2 h-2.5 w-2.5 rounded-full bg-primary" />
              Premium, planet-friendly fabrics
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-2 h-2.5 w-2.5 rounded-full bg-secondary" />
              Thoughtful craftsmanship & details
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-2 h-2.5 w-2.5 rounded-full bg-accent" />
              Inclusive styles for every story
            </li>
          </ul>

          <Button
            asChild
            size="lg"
            className="rounded-full bg-white text-black hover:bg-white/90 font-semibold shadow-lg"
          >
            <a href="/" className="flex items-center gap-2">
              Explore Collection <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Image column */}
        <div className="relative order-1 md:order-2">
          <Image
            src="https://plus.unsplash.com/premium_photo-1681488262364-8aeb1b6aac56?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="About BH Apparel"
            width={600}
            height={750}
            className="rounded-3xl object-cover shadow-2xl ring-1 ring-white/20"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
