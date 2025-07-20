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
    <section
      id="categories"
      className="relative overflow-hidden py-20 bg-transparent"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 right-16 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-6xl p-8 md:p-14 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="mb-12 text-center text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-teal-300 sm:text-5xl">
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
                className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <h3 className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-2xl font-bold text-white drop-shadow-lg group-hover:translate-y-1 transition-transform">
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
