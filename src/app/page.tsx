import HerSection from "@/components/HerSection";

export default function Home() {
  return (
    <>
      <HerSection />
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">About Us</h2>
            <p className=" max-w-2xl mx-auto">
              Welcome to B Apparel, where style meets comfort and quality. We
              take pride in crafting clothing that blends timeless designs with
              modern trends. From everyday essentials to standout pieces, our
              collections are designed to inspire confidence and celebrate
              individuality.
            </p>
            <p className="max-w-2xl mx-auto mt-4">
              With a focus on premium materials, sustainable practices, and
              meticulous attention to detail, B Apparel delivers a wardrobe that
              feels as good as it looks. Discover fashion that tells your story
              with us.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
