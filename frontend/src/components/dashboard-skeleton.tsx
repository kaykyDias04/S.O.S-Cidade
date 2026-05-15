import { Skeleton } from "@/src/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-2 items-center bg-white p-2 rounded-lg border border-stone-200 shadow-sm">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm flex flex-col justify-between h-24">
              <div className="flex justify-between items-start mb-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <div>
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col min-h-[230px]">
            <Skeleton className="h-4 w-48 mb-4" />
            <div className="flex-1 w-full flex flex-col gap-2 justify-center">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center w-full gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4" style={{ width: `${Math.max(20, Math.random() * 80)}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col items-center min-h-[230px]">
            <Skeleton className="h-4 w-40 mb-4 self-start" />
            <div className="flex-1 w-full flex items-center justify-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48 mt-4" />
          </div>

          <div className="lg:col-span-12 bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex flex-col min-h-[230px]">
            <Skeleton className="h-4 w-64 mb-6" />
            <div className="h-54 w-full flex items-end justify-between px-2 gap-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <Skeleton
                    className="w-full rounded-t-sm"
                    style={{ height: `${Math.max(40, Math.random() * 150)}px` }}
                  />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
