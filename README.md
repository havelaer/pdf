# Playwright PDF Generator

This project runs a TypeScript Node.js server and Playwright (Chromium) to render web pages to PDF.

## Local development

```bash
npm ci
npx playwright install
npm run dev
curl -o output.pdf "http://localhost:3000/generate?url=https://example.com"
```

[example.pdf](https://github.com/havelaer/pdf/blob/main/example.pdf)

## With Docker

```bash
docker build -t pdf .
docker run -p 3000:3000 pdf
curl -o output.pdf "http://localhost:3000/generate?url=https://example.com"
```

Note: Passing localhost urls won't work out of the box when dockerized.

## API

- `GET /health` -> returns service status.
- `GET /generate?url=<http(s)-url>` -> returns a generated PDF.

## Notes

- The `url` query parameter must be a valid `http://` or `https://` URL.
- Default page navigation timeout is `30000ms`. Override with `NAVIGATION_TIMEOUT_MS`.
- Response uses `application/pdf` and streams the generated PDF buffer back to the caller.
