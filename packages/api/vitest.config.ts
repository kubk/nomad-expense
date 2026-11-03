import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "ci",
          include: ["**/*.test.ts"],
          exclude: ["**/*.eval.test.ts", "**/node_modules/**"],
          globalSetup: ["./src/lib/testing/global-setup.ts"],
          setupFiles: ["./src/lib/testing/setup-worker-db.ts"],
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
