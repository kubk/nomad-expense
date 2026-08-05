### How to run

From the repository root:

```bash
docker build -f packages/kbank-parser/Dockerfile -t kbank-app .
docker run --rm -p 3094:3094 -e PORT=3094 kbank-app
docker build -f packages/kbank-parser/Dockerfile --build-arg INSTALL_DEV=true -t kbank-app-dev .
docker run --rm kbank-app-dev pnpm run test
```
