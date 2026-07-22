import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { haptic } from "@/shared/platform/haptics";

const skeletonWidths = [88, 112, 136, 104, 128, 96, 144, 120];

function TitleChip({
  title,
  onTitleClick,
}: {
  title: string;
  onTitleClick: (title: string) => void;
}) {
  return (
    <Badge
      asChild
      variant="outline"
      className="h-11 rounded-xl border-0 bg-card px-4 text-sm shadow-sm"
    >
      <button
        type="button"
        onClick={() => {
          haptic("selection");
          onTitleClick(title);
        }}
      >
        {title}
      </button>
    </Badge>
  );
}

export function QuickTitles({
  titles,
  isLoading,
  onTitleClick,
}: {
  titles: string[] | undefined;
  isLoading: boolean;
  onTitleClick: (title: string) => void;
}) {
  if (isLoading) {
    const skeletonRows = [
      skeletonWidths.filter((_, index) => index % 2 === 0),
      skeletonWidths.filter((_, index) => index % 2 === 1),
    ];

    return (
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max flex-col gap-2 pb-2 pt-0.5">
          {skeletonRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((width, index) => (
                <Skeleton
                  key={`${rowIndex}-${index}`}
                  className="h-11 rounded-xl"
                  style={{ width }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!titles || titles.length === 0) {
    return null;
  }

  const titleRows = [
    titles.filter((_, index) => index % 2 === 0),
    titles.filter((_, index) => index % 2 === 1),
  ];

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex w-max flex-col gap-2 pb-2 pt-0.5">
        {titleRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((title) => (
              <TitleChip
                key={title}
                title={title}
                onTitleClick={onTitleClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
