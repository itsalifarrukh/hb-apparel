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
        "Redefine your style with the latest trends in men's clothing. From classic suits to casual streetwear, discover attire that suits every occasion.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=1080&auto=format&fit=crop&q=80",
      title: "Women's Fashion",
      description:
        "Unleash your elegance with stunning women's fashion. Explore chic dresses, versatile tops, and statement pieces crafted to make you shine.",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1675183689638-a68fe7048da9?w=1080&auto=format&fit=crop&q=80",
      title: "Kid's Fashion",
      description:
        "Dress your little ones in the cutest, comfiest, and trendiest outfits. Discover playful designs, vibrant colors, and soft fabrics.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1561365452-adb940139ffa?w=1080&auto=format&fit=crop&q=80",
      title: "New Arrivals",
      description:
        "Stay ahead of the fashion curve with our newest collections. Fresh styles, bold designs, and innovative trends await.",
    },
  ];

  return (
    <section className="w-full relative">
      <Carousel className="w-full" plugins={[plugin]}>
        <CarouselContent>
          {carouselItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="group relative h-[600px] md:h-[700px] w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform [transition-duration:8000ms] group-hover:scale-105"
                  fill
                  quality={90}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : undefined}
                  sizes="100vw"
                />

                {/* Minimalist overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Caption */}
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div className="max-w-2xl text-white">
                    <h1 className="text-4xl sm:text-6xl font-light mb-4 tracking-wide">
                      {item.title}
                    </h1>
                    <p className="text-base sm:text-lg mb-8 text-white/90 font-light leading-relaxed">
                      {item.description}
                    </p>
                    <Button
                      asChild
                      className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-sm uppercase tracking-wider font-medium transition-all hover:scale-105"
                    >
                      <Link href="/">Shop Collection</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Clean navigation arrows */}
        <div className="hidden sm:block">
          <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm" />
          <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm" />
        </div>
      </Carousel>
    </section>
  );
}

export default HeroSection;
