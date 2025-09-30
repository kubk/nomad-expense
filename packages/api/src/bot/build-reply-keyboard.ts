import { Keyboard } from "grammy";

export const EXPENSE_BUTTON_TEXT = "Expense";
export const INCOME_BUTTON_TEXT = "Income";

export function buildReplyKeyboard(values: string[]): Keyboard {
  let keyboard = new Keyboard();

  for (const value of values) {
    keyboard = keyboard.row().text(value);
  }

  return keyboard.oneTime(true);
}
