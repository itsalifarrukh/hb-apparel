"use client";
import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Men",
    href: "/men",
    img: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Women",
    href: "/women",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Kids",
    href: "/kids",
    img: "https://images.unsplash.com/photo-1588769338077-451574d0609f?auto=format&fit=crop&q=80&w=600",
  },
];

const CategoryGrid = () => {
  return (
    <section className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8 bg-[#E3F2FD]">
      <h2 className="mb-10 text-center text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1565C0] dark:text-[#E3F2FD]">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group relative overflow-hidden rounded-3xl shadow-lg"
          >
            <Image
              src={cat.img}
              alt={cat.title}
              width={600}
              height={700}
              className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0" />
            <h3 className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-2xl font-bold text-white drop-shadow-lg group-hover:translate-y-1 transition-transform">
              {cat.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
