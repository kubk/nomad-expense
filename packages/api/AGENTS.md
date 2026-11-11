# API Package Instructions

## Testing

### Running Tests
```bash
# Run all tests
pnpm run test

# Run a single test file
pnpm run test src/api/upload-statement-handler.test.ts
```

Vitest global setup migrates the test DB from `.env.test`, then clones it into one database per worker so test files run in parallel.

### AI Testing Requirements
When fixing or creating tests, you MUST:
1. Always run the test after making changes using `pnpm run test <test-file>`
2. Verify that the test passes and behaves as expected
3. Fix any test failures before considering the task complete
