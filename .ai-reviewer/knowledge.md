# Demand reviewer notes

## Architecture
Demand is a zero-dependency CommonJS Node.js URL shortener, exposed through both an HTTP server and a CLI. `src/server.js` composes ordered route handlers for static files, APIs, and redirects; domain logic lives in `src/services/shortener.js` and persistence in `src/services/store.js`. Data is stored as JSON files under `data/`, with browser code in `public/`.

## Conventions
- Keep the project dependency-free and use Node built-ins (`http`, `fs`, `crypto`, `path`); this is explicit in `README.md` and `package.json`.
- Use CommonJS modules and export factories/classes/functions with `module.exports`, as shown by `src/services/store.js`, `src/routes/api.js`, and `src/utils/codegen.js`.
- Route handlers use the middleware-like boolean contract: return `false` when they do not own a request, otherwise send the response and return `true` (`src/routes/api.js`, `src/routes/redirect.js`). Preserve handler ordering in `src/server.js`.
- Keep business rules in `Shortener`, not in route code. URL validation and code generation are delegated to `src/utils/validate.js` and `src/utils/codegen.js`; `src/services/shortener.js` handles collision retries, timestamps, hit increments, and persistence.
- Configuration comes from environment variables with defaults in `src/config.js` (`PORT`, `HOST`, and `DATA_FILE`); avoid hardcoding deployment-specific values.
- Stored link records use `{ url, hits, createdAt }`, keyed by generated six-character codes. Public API responses add `shortUrl` only at the API boundary (`src/routes/api.js`).
- File-backed mutations are synchronous and immediately persisted through `Store.save()` (`src/services/store.js`); follow this model unless persistence is deliberately redesigned.
- CLI commands return numeric exit codes and convert thrown errors to stderr plus exit code `1` (`src/cli.js`).

## Intentional non-standard choices
- Synchronous filesystem I/O is intentional for this tiny, dependency-free application (`src/services/store.js`, `src/services/analytics.js`).
- Codes intentionally exclude visually ambiguous characters via the alphabet in `src/utils/codegen.js`.
- The frontend uses DOM construction and `textContent` rather than templating (`public/app.js`), avoiding HTML injection when displaying stored URLs.

## Watch out for
- Preserve URL restrictions: only HTTP(S) URLs are accepted through `isValidUrl`; do not bypass validation in APIs, CLI, or admin operations.
- Validate short codes before lookup or mutation. Existing routes use `isValidCode` for stats, redirects, and admin actions.
- Treat imported admin data as untrusted: validate both codes and URLs and normalize hit counts as `src/routes/admin.js` does.
- Do not weaken admin authentication or replace `timingSafeEqual`; admin routes require `Authorization: Bearer <ADMIN_TOKEN>`, and are disabled when the token is unset (`src/routes/admin.js`).
- Review filesystem path changes for traversal and containment issues, especially static serving in `src/routes/static.js` and admin import/export in `src/routes/admin.js`.
- `src/services/analytics.js` is separate from the hit counter used by `Shortener`; changes to redirect statistics must not assume analytics is automatically wired into `src/server.js`.