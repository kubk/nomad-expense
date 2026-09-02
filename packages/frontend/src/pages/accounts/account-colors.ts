import type { AccountColor } from "api";

export const accountColorsPalette: Array<{
  id: AccountColor;
  bg: string;
  text: string;
}> = [
  {
    id: "blue",
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "green",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-600",
  },
  {
    id: "purple",
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "red",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-400",
  },
  {
    id: "orange",
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-500",
  },
  {
    id: "yellow",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-600",
  },
  {
    id: "pink",
    bg: "bg-pink-50 dark:bg-pink-950",
    text: "text-pink-700 dark:text-pink-400",
  },
  {
    id: "teal",
    bg: "bg-teal-50 dark:bg-teal-950",
    text: "text-teal-700 dark:text-teal-500",
  },
  {
    id: "cyan",
    bg: "bg-cyan-50 dark:bg-cyan-950",
    text: "text-cyan-700 dark:text-cyan-500",
  },
  {
    id: "lime",
    bg: "bg-lime-50 dark:bg-lime-950",
    text: "text-lime-700 dark:text-lime-600",
  },
  {
    id: "amber",
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-600",
  },
  {
    id: "emerald",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-500",
  },
  {
    id: "rose",
    bg: "bg-rose-50 dark:bg-rose-950",
    text: "text-rose-700 dark:text-rose-400",
  },
  {
    id: "gray",
    bg: "bg-gray-50 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400",
  },
];

export const getColorById = (colorId: AccountColor) => {
  return (
    accountColorsPalette.find((color) => color.id === colorId) ||
    accountColorsPalette[0]
  );
};
