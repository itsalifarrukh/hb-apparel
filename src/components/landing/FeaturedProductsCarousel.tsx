"use client";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const products = [
  {
    id: 1,
    name: "Signature Hoodie",
    price: "$49",
    img: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    name: "Classic Denim Jacket",
    price: "$89",
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    name: "Essential Tee",
    price: "$29",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    name: "Summer Dress",
    price: "$59",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    name: "Slim Fit Jeans",
    price: "$69",
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800",
  },
];

const FeaturedProductsCarousel = () => {
  const plugin = React.useMemo(() => Autoplay({ delay: 5000 }), []);
  return (
    <section className="py-20 bg-white dark:bg-[#263238]">
      <div className="section-container">
        <h2 className="mb-12 text-center text-4xl font-light tracking-tight text-[#263238] dark:text-white">
          Featured Products
        </h2>
        <Carousel
          opts={{ align: "start" }}
          plugins={[plugin]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="group relative rounded-lg bg-white dark:bg-[#455A64] shadow-lg overflow-hidden">
                  <Link href="/product/[id]" as={`/product/${product.id}`}>
                    <Image
                      src={product.img}
                      alt={product.name}
                      width={600}
                      height={700}
                      className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-[#263238] dark:text-white mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-[#455A64] dark:text-[#B0BEC5] mb-4 font-semibold">
                      {product.price}
                    </p>
                    <Button size="sm" className="w-full rounded-full text-sm">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2 text-[#455A64] dark:text-[#B0BEC5] bg-white/80 dark:bg-[#455A64]/80 border-[#B0BEC5] hover:text-[#263238] dark:hover:text-white" />
          <CarouselNext className="right-0 translate-x-1/2 text-[#455A64] dark:text-[#B0BEC5] bg-white/80 dark:bg-[#455A64]/80 border-[#B0BEC5] hover:text-[#263238] dark:hover:text-white" />
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedProductsCarousel;
