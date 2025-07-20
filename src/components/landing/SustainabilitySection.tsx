"use client";
import Image from "next/image";
import { Leaf } from "lucide-react";

const SustainabilitySection = () => {
  return (
    <section
      id="sustainability"
      className="relative overflow-hidden py-20 bg-transparent"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-green-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-lime-300/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-6xl grid gap-8 md:grid-cols-2 p-8 md:p-14 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        {/* Image */}
        <div className="order-2 md:order-1 h-72 md:h-auto relative">
          <Image
            src="https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&q=80&w=800"
            alt="Sustainability"
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover rounded-2xl"
          />
        </div>

        {/* Text */}
        <div className="order-1 md:order-2 self-center">
          <h2 className="mb-6 flex items-center gap-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 dark:from-green-400 dark:to-lime-300">
            <Leaf className="h-8 w-8" />
            Our Commitment to Sustainability
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            From sourcing eco-friendly fabrics to reducing waste in our
            packaging, BH Apparel is dedicated to making fashion that cares for
            the planet as much as it cares for you.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            By choosing our products, you join us in supporting responsible
            manufacturing, fair labour practices, and a greener future.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
