# Demand reviewer notes

## Architecture

Demand is a dependency-free Node.js URL shortener using the built-in `http`, filesystem, and crypto APIs. `src/server.js` composes static, API, and redirect handlers; services contain persistence and shortening behavior, while utilities provide validation, HTTP helpers, logging, and code generation. The browser client lives in `public/`, and links are persisted in `data/links.json`.

## Conventions

- Keep runtime code dependency-free and use Node.js built-ins; `package.json` has no dependencies and starts `src/server.js` directly.
- Route handlers use a composable middleware style: return `false` when a route does not match and `true`/a response otherwise (`src/routes/api.js`, `src/routes/redirect.js`, `src/routes/static.js`).
- Business logic belongs in services rather than route modules. `Shortener` owns URL validation, code generation, hit counting, and response-shaped records (`src/services/shortener.js`); `Store` owns JSON persistence (`src/services/store.js`).
- Configuration is centralized in `src/config.js`, with environment overrides for `PORT`, `HOST`, and `DATA_FILE`; use `config.codeLength` rather than duplicating the six-character default.
- API errors are JSON objects with an `error` field and appropriate status codes, using `sendJson` (`src/routes/api.js`, `src/server.js`). Malformed JSON and bodies over 100 KB are rejected by `readBody` (`src/utils/http.js`).
- Short codes are generated with `generateCode()` and must be collision-checked through `store.has()` before saving (`src/services/shortener.js`). Validation accepts alphanumeric codes of 4–12 characters (`src/utils/validate.js`).
- Tests use the built-in `node:test` runner and isolate persistence with a temporary store (`tests/shortener.test.js`). `Store` accepts an explicit file path for this purpose.
- Use CommonJS modules and semicolon-terminated JavaScript, matching all files under `src/`, `public/`, and `tests/`.

## Intentional non-standard choices

- `Store` performs synchronous file reads and writes (`src/services/store.js`); this is intentional for the tiny, single-process application, not an accidental omission of async I/O.
- The route stack checks static files before API and redirect routes (`src/server.js`), and handlers communicate matching through boolean return values rather than a framework/router.
- The short-code alphabet intentionally omits visually ambiguous characters (`0`, `1`, `l`, `o`, `O`, `I`) in `src/utils/codegen.js`.
- Redirects use HTTP `302` rather than a permanent redirect (`src/routes/redirect.js`), and each successful resolution increments and persists `hits`.

## Watch out for

- Preserve URL safety checks: only `http:` and `https:` URLs up to 2048 characters are accepted (`src/utils/validate.js`); do not weaken this to arbitrary schemes.
- Do not bypass collision detection or alter the configured code length without updating validation and tests (`src/services/shortener.js`, `src/config.js`).
- Changes to route matching must preserve the `false`/handled contract, especially for unknown paths and `/api/stats/:code`.
- Avoid exposing filesystem paths or raw exceptions in HTTP responses; the server logs details but returns `Internal server error` (`src/server.js`).
- Be careful with static path handling: any change to `path.join` or the `startsWith(PUBLIC_DIR)` guard could introduce file disclosure (`src/routes/static.js`).