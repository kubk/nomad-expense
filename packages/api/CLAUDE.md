# API Package Instructions

## Testing

### Running Tests
Always use the custom test script when running tests in the API package:

```bash
# Run all tests
./bin/test-api.sh

# Run a single test file
./bin/test-api.sh src/api/upload-statement-handler.test.ts
```

**Important**: Do NOT use `npm test` or `vitest` directly. The `test-api.sh` script:
- Handles database migrations before running tests
- Runs tests sequentially to avoid database concurrency issues
- Properly sets up the test environment with `.env.test` configuration

### AI Testing Requirements
When fixing or creating tests, you MUST:
1. Always run the test after making changes using `./bin/test-api.sh <test-file>`
2. Verify that the test passes and behaves as expected
3. Fix any test failures before considering the task complete
