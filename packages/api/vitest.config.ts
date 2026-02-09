import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "ci",
          include: ["**/*.test.ts"],
          exclude: ["**/*.eval.test.ts", "**/node_modules/**"],
        },
      },
      {
        test: {
          name: "eval",
          include: ["**/*.eval.test.ts"],
          testTimeout: 60000,
        },
      },
    ],
  },
});
