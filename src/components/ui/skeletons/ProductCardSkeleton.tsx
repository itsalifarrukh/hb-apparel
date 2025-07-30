import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#455A64] rounded-lg shadow-md overflow-hidden border border-[#B0BEC5]/20 dark:border-[#263238]/20">
      {/* Image skeleton */}
      <div className="relative aspect-square">
        <Skeleton className="w-full h-full rounded-t-lg" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Product name */}
        <Skeleton className="h-5 w-3/4" />

        {/* Category */}
        <Skeleton className="h-4 w-1/2" />

        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
