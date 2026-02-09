#!/bin/bash

# Runs API tests sequentially to avoid db concurrency issues.
# Examples:
#   ./bin/test-api.sh                   # Runs all tests in ./src
#   ./bin/test-api.sh path/to/test.ts   # Runs a single specified test file

set -e

npm run test:db:migrate

# Check if a specific test file argument is provided
if [ -n "$1" ]; then
    # Check if the provided argument is a file
    if [ -f "$1" ]; then
        test_files=("$1")
    else
        echo "Error: Provided argument '$1' is not a valid file."
        exit 1
    fi
else
    # No argument provided, find all test files
    test_files=$(find ./src -name "*.test.ts" ! -name "*.eval.test.ts")
fi

for test_file in $test_files
do
    echo "Running tests in $test_file"

    npx dotenvx run -f .env.test -- vitest run "$test_file"

    if [ $? -ne 0 ]; then
        echo "Tests failed in $test_file"
        exit 1
    fi
done

echo "All tests completed successfully"
