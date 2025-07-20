"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";

function HeroSection() {
  const plugin = React.useMemo(() => Autoplay({ delay: 4000 }), []);

  const carouselItems = [
    {
      image:
        "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=1080&auto=format&fit=crop&q=80",
      title: "Men's Fashion",
      description:
        "Redefine your style with the latest trends in men's clothing. From classic suits to casual streetwear, discover attire that suits every occasion and reflects your personality.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=1080&auto=format&fit=crop&q=80",
      title: "Women's Fashion",
      description:
        "Unleash your elegance with stunning women's fashion. Explore chic dresses, versatile tops, and statement pieces crafted to make you shine, day or night.",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1675183689638-a68fe7048da9?w=1080&auto=format&fit=crop&q=80",
      title: "Kid's Fashion",
      description:
        "Dress your little ones in the cutest, comfiest, and trendiest outfits. Discover playful designs, vibrant colors, and soft fabrics perfect for kids on the move.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1561365452-adb940139ffa?w=1080&auto=format&fit=crop&q=80",
      title: "New Arrivals",
      description:
        "Stay ahead of the fashion curve with our newest collections. Fresh styles, bold designs, and innovative trends await to upgrade your wardrobe.",
    },
  ];

  return (
    <section className="w-full relative">
      <Carousel className="w-full" plugins={[plugin]}>
        <CarouselContent>
          {carouselItems.map((item, index) => (
            <CarouselItem key={index}>
              {/* Group for subtle zoom animation */}
              <div className="group relative h-[680px] md:h-[760px] w-full overflow-hidden">
                {/* Background image with slow zoom effect */}
                <Image
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform [transition-duration:10000ms] group-hover:scale-105"
                  fill
                  quality={100}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : undefined}
                  sizes="(min-width: 1024px) 100vw, 100vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black/90" />

                {/* Caption */}
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                  <div className="text-white max-w-3xl animate-fadeInUp">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-xl">
                      {item.title}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl mb-10 opacity-90">
                      {item.description}
                    </p>
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-10 py-6 shadow-lg transition-transform hover:-translate-y-1"
                    >
                      <Link href="/">Shop Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation arrows (hidden on mobile) */}
        <div className="hidden sm:block">
          <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 z-10 border-none bg-black/40 text-white hover:bg-black/60" />
          <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 z-10 border-none bg-black/40 text-white hover:bg-black/60" />
        </div>
      </Carousel>
    </section>
  );
}

export default HeroSection;
