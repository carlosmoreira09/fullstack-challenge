import { Skeleton } from "@/components/ui/skeleton"

export function KanbanSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-[200px]" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </header>

      {/* Kanban Board Skeleton */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {[1, 2, 3, 4].map((column) => (
          <div key={column} className="flex min-w-[320px] flex-1 flex-col">
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* Tasks Container */}
            <div className="flex flex-1 flex-col gap-3 rounded-lg border-2 border-dashed border-transparent bg-muted/20 p-3">
              {[1, 2, 3].map((task) => (
                <div
                  key={task}
                  className="rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
