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
    <section className="relative overflow-hidden py-20 bg-transparent">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-16 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-6xl p-8 md:p-14 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="mb-12 text-center text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-teal-300">
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
                <div className="group relative rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-md shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-primary dark:text-primary mb-4 font-bold">
                      {product.price}
                    </p>
                    <Button size="sm" className="w-full rounded-full">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2" />
          <CarouselNext className="right-0 translate-x-1/2" />
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedProductsCarousel;
