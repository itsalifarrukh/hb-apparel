import HeroSection from "@/components/HeroSection";
import ShopByCategorySection from "@/components/landing/ShopByCategorySection";
import AboutSection from "@/components/AboutSection";
import FeaturedProductsCarousel from "@/components/landing/FeaturedProductsCarousel";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import NewsletterCTASection from "@/components/landing/NewsletterCTASection";
import SustainabilitySection from "@/components/landing/SustainabilitySection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ShopByCategorySection />
      <FeaturedProductsCarousel />
      <TestimonialsSection />
      <SustainabilitySection />
      <NewsletterCTASection />
    </>
  );
}
