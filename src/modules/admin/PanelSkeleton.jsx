import { Card, Skeleton } from '../../components/ui/Primitives.jsx';

export default function PanelSkeleton() {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-full" rounded="rounded-xl" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-2">
            <Skeleton className="h-1 w-[50%]" />
            <Skeleton className="mt-1.5 h-3 w-[70%]" />
          </Card>
        ))}
      </div>
    </div>
  );
}
