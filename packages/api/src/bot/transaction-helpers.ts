import { Keyboard } from "grammy";

export const EXPENSE_BUTTON_TEXT = "Expense";
export const INCOME_BUTTON_TEXT = "Income";

export function createDescriptionKeyboard(descriptions: string[]): Keyboard {
  let keyboard = new Keyboard();

  for (const description of descriptions) {
    keyboard = keyboard.row().text(description);
  }

  return keyboard.oneTime(true);
}
