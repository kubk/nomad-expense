export const accountColorsPalette = [
  { id: "blue", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-500" },
  { id: "green", bg: "bg-green-50 dark:bg-green-950", text: "text-green-500" },
  {
    id: "purple",
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-500",
  },
  { id: "red", bg: "bg-red-50 dark:bg-red-950", text: "text-red-500" },
  {
    id: "orange",
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-500",
  },
  {
    id: "yellow",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-500",
  },
  { id: "pink", bg: "bg-pink-50 dark:bg-pink-950", text: "text-pink-500" },
  { id: "teal", bg: "bg-teal-50 dark:bg-teal-950", text: "text-teal-500" },
  { id: "cyan", bg: "bg-cyan-50 dark:bg-cyan-950", text: "text-cyan-500" },
  { id: "lime", bg: "bg-lime-50 dark:bg-lime-950", text: "text-lime-500" },
  { id: "amber", bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-500" },
  {
    id: "emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-500",
  },
  { id: "rose", bg: "bg-rose-50 dark:bg-rose-950", text: "text-rose-500" },
  {
    id: "gray",
    bg: "bg-gray-50 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-300",
  },
];

export const getColorById = (colorId: string) => {
  return (
    accountColorsPalette.find((color) => color.id === colorId) ||
    accountColorsPalette[0]
  );
};
