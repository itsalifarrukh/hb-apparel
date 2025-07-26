"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";

const NewsletterCTASection = () => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <section id="newsletter" className="py-20 bg-[#F7F7F7] dark:bg-[#455A64]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-light tracking-tight text-[#263238] dark:text-white">
            Join Our Style Circle
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-[#455A64] dark:text-[#B0BEC5]">
            Subscribe to get exclusive offers, early access to new collections,
            and fashion inspiration delivered straight to your inbox.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-2 text-green-600 font-medium">
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
                className="flex-1 h-12 bg-white dark:bg-[#263238] border-[#B0BEC5] dark:border-[#455A64]"
              />
              <Button
                type="submit"
                className="h-12 px-6 bg-[#263238] text-white hover:bg-[#455A64] dark:bg-white dark:text-[#263238] dark:hover:bg-[#F7F7F7]"
              >
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTASection;
