import { setEnv } from "../src/services/env";

try {
  setEnv(process.env);
  console.log("✓ Environment validation passed");
  process.exit(0);
} catch (error) {
  console.error("✗ Environment validation failed");
  console.error(error);
  process.exit(1);
}
