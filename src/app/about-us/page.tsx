import AboutSection from "@/components/AboutSection";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "About Us | BH Apparel",
};

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#263238] text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About Us", href: "/about-us" },
          ]}
        />
        <AboutSection />
      </div>
    </main>
  );
}
