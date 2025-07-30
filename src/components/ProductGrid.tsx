"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { ProductGridProps } from "@/types/frontend";
import { ProductGridSkeleton } from "@/components/ui/skeletons/ProductCardSkeleton";

interface ExtendedProductGridProps extends ProductGridProps {
  viewMode?: "grid" | "list";
  showResultsCount?: boolean;
}

const ProductGrid: React.FC<ExtendedProductGridProps> = ({
  products,
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
  viewMode = "grid",
  showResultsCount = true,
}) => {
  if (isLoading) {
    return <ProductGridSkeleton count={12} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#F7F7F7] dark:bg-[#263238] flex items-center justify-center">
            <svg
              className="w-12 h-12 text-[#455A64] dark:text-[#B0BEC5]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H1"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#263238] dark:text-white">
            No Products Found
          </h3>
          <p className="text-[#455A64] dark:text-[#B0BEC5] max-w-md">
            We couldn&apos;t find any products matching your criteria. Try
            adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={showResultsCount ? "space-y-6" : ""}>
      {/* Results count - only show if showResultsCount is true */}
      {showResultsCount && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#455A64] dark:text-[#B0BEC5]">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Product Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-6"
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
