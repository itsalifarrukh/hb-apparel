import { Skeleton } from "@/components/ui/skeleton";

export function FilterSidebarSkeleton() {
  return (
    <div className="bg-white dark:bg-[#455A64] rounded-lg p-6 shadow-md border border-[#B0BEC5]/20 dark:border-[#263238]/20">
      <div className="space-y-8">
        {/* Search skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Categories skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-6 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Price Range skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Features skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-16" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Clear button skeleton */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
