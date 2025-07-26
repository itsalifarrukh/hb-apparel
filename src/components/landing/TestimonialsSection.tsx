"use client";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah A.",
    role: "Fashion Enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=160",
    quote:
      "HB Apparel sets the bar high for quality and style. Every piece feels tailor-made!",
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
    <section id="testimonials" className="py-20 bg-[#F7F7F7] dark:bg-[#455A64]">
      <div className="section-container">
        <h2 className="mb-12 text-center text-4xl font-light tracking-tight text-[#263238] dark:text-white">
          What Our Customers Say
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col items-center text-center bg-white dark:bg-[#263238] rounded-lg p-6 shadow-md"
            >
              <Image
                src={t.avatar}
                alt={t.name}
                width={80}
                height={80}
                className="mb-4 h-20 w-20 rounded-full object-cover"
              />
              <blockquote className="mb-4 text-[#455A64] dark:text-[#B0BEC5] italic">
                "{t.quote}"
              </blockquote>
              <figcaption className="font-medium text-[#263238] dark:text-white">
                {t.name}
                <span className="block text-sm font-normal text-[#455A64] dark:text-[#B0BEC5]">
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
