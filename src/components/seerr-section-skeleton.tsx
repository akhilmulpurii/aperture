"use client";

import { Skeleton } from "./ui/skeleton";

export function SeerrSectionSkeleton() {
  return (
    <div className="mb-8 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Cards Row */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            {/* Card Image */}
            <Skeleton className="h-[216px] w-36 rounded-md" />
            {/* Card Content */}
            <div className="space-y-1.5 px-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
