export function LoadingShimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`shimmer rounded-lg ${className}`} style={{ height: '100%' }} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <LoadingShimmer className="h-6 w-3/4" />
      <LoadingShimmer className="h-4 w-1/2" />
      <LoadingShimmer className="h-20 w-full" />
    </div>
  );
}
