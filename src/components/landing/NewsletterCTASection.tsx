"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";

const NewsletterCTASection = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <section
      id="newsletter"
      className="relative overflow-hidden py-20 bg-transparent"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-4xl p-10 md:p-14 rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 text-center">
        <h2 className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-teal-300">
          Join Our Style Circle
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-gray-700 dark:text-gray-300">
          Subscribe to get exclusive offers, early access to new collections,
          and fashion inspiration delivered straight to your inbox.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
            <Check className="h-5 w-5" /> Thank you for subscribing!
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto"
          >
            <Input
              required
              type="email"
              placeholder="Your email address"
              className="flex-1 h-12 bg-white dark:bg-slate-800/60 backdrop-blur-md"
            />
            <Button
              type="submit"
              className="h-12 px-6 rounded-full font-semibold"
            >
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterCTASection;
