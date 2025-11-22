# Sample DevGraph spec

```devgraph-service
name: web
type: nextjs
commands:
  dev: pnpm dev --filter web
  build: pnpm build --filter web
```

```devgraph-api
service: web
routes:
  GET /health: {}
```

```devgraph-env
service: web
vars:
  NEXT_PUBLIC_API_URL: http://localhost:3000
```
