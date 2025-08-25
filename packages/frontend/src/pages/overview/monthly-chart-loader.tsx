export function MonthlyChartLoader() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center pb-[19px] min-w-[64px] pr-8"
        >
          <div className="mb-4 text-xs font-semibold text-foreground text-center">
            <div className="animate-pulse bg-muted h-3 w-12 rounded"></div>
          </div>

          <div className="relative h-[105px] flex items-end rounded-lg p-1 -m-1">
            <div className="w-10 bg-muted animate-pulse rounded-t-lg h-20" />
          </div>

          <div className="mt-2 text-xs font-medium text-foreground">
            <div className="animate-pulse bg-muted h-3 w-8 rounded"></div>
          </div>
        </div>
      ))}
    </>
  );
}
