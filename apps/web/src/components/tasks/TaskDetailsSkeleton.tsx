import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function TaskDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <Skeleton className="h-9 w-48 mb-4" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <div className="mt-2 flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-[160px]" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Task Details Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <div className="h-px bg-border" />

                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {[1, 2].map((comment) => (
                    <div key={comment} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border my-4" />

                <Skeleton className="h-24 w-full mb-3" />
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-40" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignees Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((user) => (
                    <div key={user} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* History Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((entry) => (
                    <div key={entry} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
