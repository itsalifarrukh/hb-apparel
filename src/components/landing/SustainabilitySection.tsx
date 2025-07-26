"use client";
import Image from "next/image";
import { Leaf } from "lucide-react";

const SustainabilitySection = () => {
  return (
    <section id="sustainability" className="py-20 bg-white dark:bg-[#263238]">
      <div className="section-container grid gap-12 md:grid-cols-2 items-center">
        {/* Image */}
        <div className="order-2 md:order-1 relative">
          <Image
            src="https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&q=80&w=800"
            alt="Sustainability"
            width={600}
            height={400}
            className="rounded-lg object-cover w-full"
          />
        </div>

        {/* Text */}
        <div className="order-1 md:order-2">
          <h2 className="mb-6 flex items-center gap-2 text-3xl sm:text-4xl font-light tracking-tight text-[#263238] dark:text-white">
            <Leaf className="h-8 w-8 text-green-600" />
            Our Commitment to Sustainability
          </h2>
          <p className="mb-4 text-[#455A64] dark:text-[#B0BEC5] leading-relaxed">
            From sourcing eco-friendly fabrics to reducing waste in our
            packaging, HB Apparel is dedicated to making fashion that cares for
            the planet as much as it cares for you.
          </p>
          <p className="text-[#455A64] dark:text-[#B0BEC5] leading-relaxed">
            By choosing our products, you join us in supporting responsible
            manufacturing, fair labour practices, and a greener future.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
