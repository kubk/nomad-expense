### Dependency Management
Always install dependencies in their respective workspace package.json files, not in the root package.json
- For frontend-specific packages: `npm install package-name -w=frontend`
- For backend-specific packages: `npm install package-name -w=api`
- For landing-specific packages: `npm install package-name -w=landing`
- Only install packages in the root package.json if they are truly shared across workspaces or needed for monorepo management

### File Naming
- ONLY use kebab-case for all file names across all the packages

### TypeScript

- Don't duplicate types in frontend and backend, infer types from backend instead export import them from "api" package
- Avoid using "any" if it's not difficult to type by yourself. Only use "any" as last resort when you can't fix it otherwise
- Never use default exports, only use named exports
- Prefer typescript types over interfaces
- Run `npm run typecheck` to check types after you finished with task

### Testing
- NEVER start servers or build anything when testing
- ONLY use `npm run typecheck` for testing/validation
- TypeScript checking is sufficient to verify implementation

