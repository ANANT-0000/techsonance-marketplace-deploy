import { Skeleton } from "../ui/skeleton";

export  function VendorProfileSkeleton() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="w-full  space-y-6">

        {/* Header */}
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 rounded-2xl" />

              <div className="space-y-3">
                <Skeleton className="h-7 w-56 rounded-xl" />
                <Skeleton className="h-4 w-36 rounded-xl" />

                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>

            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Company Details */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-lg">
            <Skeleton className="mb-6 h-6 w-40 rounded-xl" />

            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-24 rounded-lg" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Stats */}
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
              <Skeleton className="mb-5 h-5 w-24 rounded-xl" />

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-16 w-full rounded-2xl"
                  />
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
              <Skeleton className="mb-5 h-5 w-28 rounded-xl" />

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-12 w-full rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg"
            >
              <Skeleton className="mb-5 h-5 w-36 rounded-xl" />

              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-3/4 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}