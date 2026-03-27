import express, { Request, Response } from "express";
import { chromium } from "playwright";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const NAVIGATION_TIMEOUT_MS = Number(process.env.NAVIGATION_TIMEOUT_MS ?? 30000);

function parseTargetUrl(value: unknown): URL | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/generate", async (req: Request, res: Response) => {
  const targetUrl = parseTargetUrl(req.query.url);

  if (!targetUrl) {
    res.status(400).json({
      error: "Invalid or missing url query parameter. Use a valid http(s) URL."
    });
    return;
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(targetUrl.toString(), {
      waitUntil: "networkidle",
      timeout: NAVIGATION_TIMEOUT_MS
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await context.close();

    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=\"document.pdf\"");
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    res.send(pdfBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Failed to generate PDF", details: message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const server = app.listen(PORT, () => {
  // Keep startup log concise for container logs.
  console.log(`PDF service listening on port ${PORT}`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`Received ${signal}, shutting down...`);
  server.close((error?: Error) => {
    if (error) {
      console.error("Error while shutting down server", error);
      process.exit(1);
      return;
    }
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
