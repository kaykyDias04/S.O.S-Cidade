import { Skeleton } from "@/src/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto bg-white rounded-xl md:rounded-2xl border border-stone-200 p-4 md:p-6 overflow-hidden">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-stone-100 pb-4 md:pb-6">
        <div className="w-full md:w-auto">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="flex flex-wrap w-full md:w-auto gap-3 items-center bg-stone-50 p-2 md:p-3 rounded-lg border border-stone-100">
          <div className="flex items-center gap-1.5 md:mr-2">
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-8 w-24 md:w-32 rounded-md" />
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-8 w-24 md:w-32 rounded-md" />
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {}
        <div className="bg-white border border-stone-100 rounded-xl p-4 md:p-5 flex flex-col items-center">
          <Skeleton className="h-4 w-40 mb-6" />
          <div className="h-48 md:h-56 w-full flex items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
        </div>

        {}
        <div className="bg-white border border-stone-100 rounded-xl p-4 md:p-5 flex flex-col items-center">
          <Skeleton className="h-4 w-40 mb-6" />
          <div className="h-48 md:h-56 w-full flex flex-col justify-around">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center w-full gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton
                  className="h-6"
                  style={{ width: `${Math.max(30, Math.random() * 80)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-stone-100 rounded-xl p-4 md:p-5 flex flex-col items-center">
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="h-56 md:h-64 w-full flex items-end justify-between px-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-1/12">
              <Skeleton
                className="w-full rounded-t-sm"
                style={{ height: `${Math.max(40, Math.random() * 180)}px` }}
              />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
