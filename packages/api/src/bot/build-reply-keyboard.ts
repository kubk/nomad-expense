import { Keyboard } from "grammy";

export function buildReplyKeyboard(values: string[]): Keyboard {
  let keyboard = new Keyboard();

  for (const value of values) {
    keyboard = keyboard.row().text(value);
  }

  return keyboard.oneTime(true);
}
