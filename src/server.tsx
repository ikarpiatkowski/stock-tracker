import render from "preact-render-to-string";
import { serveCSS, serveStaticFile, serveXLSXData, test } from "./lib/serve.ts";
import { parseXLSX } from "@/lib/xlsx.ts";
import { fetchStockData } from "@/lib/db.ts";
import { Home } from "@/router/index.tsx";
import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";

async function handleRequest(): Promise<Response> {
  try {
    const stocks = await fetchStockData();
    const xlsxData = await parseXLSX("./src/public/data.xlsx");
    const xlsxDataEu = await parseXLSX("./src/public/dataEu.xlsx");

    // Render JSX to HTML string
    const htmlString = render(
      <Home stocks={stocks} xlsxData={xlsxData} xlsxDataEu={xlsxDataEu} />
    );
    return new Response(htmlString, {
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function router(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  if (pathname === "/output.css") {
    return await serveCSS();
  }

  // Serve static files from the public directory
  if (pathname.startsWith("/src/public/")) {
    return await serveStaticFile(`.${pathname}`);
  }

  if (pathname === "/data.json") {
    return await serveXLSXData();
  }

  if (pathname === "/test") {
    return await test();
  }

  // Default to serving HTML
  return await handleRequest();
}

const routerOak = new Router();
routerOak.get("/", (ctx) => {
  ctx.response.body = `<!DOCTYPE html>
    <html>
      <head><title>Hello oak!</title><head>
      <body>
        <h1>Hello oak!</h1>
      </body>
    </html>
  `;
});

const app = new Application();
const port = 8080;

app.use(routerOak.routes());
app.use(routerOak.allowedMethods());
console.log(`Server running on http://localhost:${port}`);

app.listen({ port: port });

Deno.serve(router);
