# Dockerized Playwright PDF API

This project runs a TypeScript Node.js server in Docker and uses Playwright (Chromium) to render web pages to PDF.

## Build and run with Docker

```bash
docker build -t pdf .
docker run -p 3000:3000 pdf
```

Then call:

```bash
curl -o output.pdf "http://localhost:3000/generate?url=https://example.com"
```

## Local development

```bash
npm install
npm run dev
```

## API

- `GET /health` -> returns service status.
- `GET /generate?url=<http(s)-url>` -> returns a generated PDF.

## Notes

- The `url` query parameter must be a valid `http://` or `https://` URL.
- Default page navigation timeout is `30000ms`. Override with `NAVIGATION_TIMEOUT_MS`.
- Response uses `application/pdf` and streams the generated PDF buffer back to the caller.
