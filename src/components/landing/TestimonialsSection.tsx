"use client";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah A.",
    role: "Fashion Enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=160",
    quote:
      "BH Apparel sets the bar high for quality and style. Every piece feels tailor-made!",
  },
  {
    name: "Daniel K.",
    role: "Entrepreneur",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=160",
    quote:
      "The comfort of their hoodies is unmatched. I practically live in mine!",
  },
  {
    name: "Amna R.",
    role: "Designer",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160",
    quote:
      "Love their sustainable approach. Stylish clothing that feels good to wear and buy.",
  },
];

const TestimonialsSection = () => {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-20 bg-transparent"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-6xl p-8 md:p-14 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="mb-12 text-center text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-teal-300 sm:text-5xl">
          What Our Customers Say
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col items-center text-center bg-white/80 dark:bg-slate-800/60 rounded-2xl p-6 shadow-lg backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10"
            >
              <Image
                src={t.avatar}
                alt={t.name}
                width={80}
                height={80}
                className="mb-4 h-20 w-20 rounded-full object-cover"
              />
              <blockquote className="mb-4 text-gray-700 dark:text-gray-300 italic">
                “{t.quote}”
              </blockquote>
              <figcaption className="font-semibold text-gray-900 dark:text-white">
                {t.name}
                <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">
                  {t.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
