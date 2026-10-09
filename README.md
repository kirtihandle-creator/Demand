# shortie

A tiny URL shortener built with plain Node.js. No dependencies.

## Run

```
npm start
```

Open http://localhost:3000, paste a URL, get a short link.

## API

| Method | Path             | Body / Result                                      |
|--------|------------------|----------------------------------------------------|
| POST   | /api/shorten     | `{ "url": "https://..." }` returns `{ code, shortUrl }` |
| GET    | /api/links       | list all links                                     |
| GET    | /api/stats/:code | hit count for one code                             |
| GET    | /:code           | redirects to the original URL                      |

Links are stored in `data/links.json`.

## Test

```
npm test
```
