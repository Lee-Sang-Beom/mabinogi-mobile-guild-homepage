import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Tabs defaultValue="badges" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="mb-0">
            <TabsTrigger value="badges">뱃지</TabsTrigger>
            <TabsTrigger value="achievements" disabled>
              업적
            </TabsTrigger>
            <TabsTrigger value="collections" disabled>
              컬렉션
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>

        <TabsContent value="badges" className="mt-0">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
