"use client";
import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Men",
    href: "/men",
    img: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Women",
    href: "/women",
    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Kids",
    href: "/kids",
    img: "https://plus.unsplash.com/premium_photo-1675183690347-662b2f9f3cf7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const ShopByCategorySection = () => {
  return (
    <section id="categories" className="py-20 bg-[#F7F7F7] dark:bg-[#455A64]">
      <div className="section-container">
        <h2 className="mb-12 text-center text-4xl font-light tracking-tight text-[#263238] dark:text-white sm:text-5xl">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-shadow"
            >
              <Image
                src={cat.img}
                alt={cat.title}
                width={400}
                height={500}
                className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <h3 className="absolute bottom-6 left-6 text-2xl font-light text-white tracking-wide">
                {cat.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategorySection;
