# 星序 · Starweave

A private project and task board with recursive subtasks, editable status, evidence, next steps, recoverable deletion and optimistic concurrency.

## Features
- Project → task → nested subtasks
- Pending, in progress, blocked, paused and done states
- Server-side D1 persistence; no browser-only task storage
- Protected user-edited fields and deletion tombstones
- MCP tools and a private service synchronization endpoint
- Chinese interface with responsive mobile layout

## Runtime
Built with React, Vinext and Cloudflare D1 for OpenAI Sites. Install locked dependencies with npm ci, generate schema migrations with npm run db:generate, then build with npm run build. Publish using the Sites workflow with a new Site identity.

IMPORTANT: This application is owner-private. /api/sync relies on the Sites dispatch access boundary and its existing platform service credential. It must not be exposed publicly or deployed behind an unauthenticated reverse proxy. Browser routes require the platform authenticated-user header. Before expanding sharing, add appropriate application-level authorization. No credentials, private task records or Site identity are included in this repository.

## Agent synchronization
Read the current board and revision before each change. Send only changed fields. A stale revision is rejected. User-protected fields must be preserved. Deleted IDs cannot be reused. Editing a status on the board does not itself stop a process or deploy a project. OpenSDLC integration is being implemented separately.
