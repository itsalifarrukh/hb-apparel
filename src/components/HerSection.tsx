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
        "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVuJTIwY2xvdGhpbmd8ZW58MHwwfDB8fHww",
      title: "Men's Fashion",
      description:
        "Redefine your style with the latest trends in men's clothing. From classic suits to casual streetwear, discover attire that suits every occasion and reflects your personality.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fGNsb3RoaW5nfGVufDB8MHwwfHx8MA%3D%3D",
      title: "Women's Fashion",
      description:
        "Unleash your elegance with stunning women's fashion. Explore chic dresses, versatile tops, and statement pieces crafted to make you shine, day or night.",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1675183689638-a68fe7048da9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8a2lkcyUyMGNsb3RoaW5nfGVufDB8MHwwfHx8MA%3D%3D",
      title: "Kid's Fashion",
      description:
        "Dress your little ones in the cutest, comfiest, and trendiest outfits. Discover playful designs, vibrant colors, and soft fabrics perfect for kids on the move.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1561365452-adb940139ffa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fG5ldyUyMGFycml2YWxzJTIwY2xvdGhpbmd8ZW58MHwwfDB8fHww",
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
              <div className="relative h-[600px] w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  fill
                  quality={100}
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center">
                  <div className="text-white">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                      {item.title}
                    </h1>
                    <p className="text-xl mb-8">{item.description}</p>
                    <Button
                      asChild
                      className="bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      <Link href="/">Shop Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="hidden sm:block">
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 border-none" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10  border-none" />
        </div>
      </Carousel>
    </section>
  );
}

export default HeroSection;
