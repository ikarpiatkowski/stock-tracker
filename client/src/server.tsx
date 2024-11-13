import render from "preact-render-to-string";
import { serveCSS, serveStaticFile, serveXLSXData } from "./lib/serve.ts";
import { Home } from "./router/index.tsx";

async function handleRequest(): Promise<Response> {
  try {
    // Render JSX to HTML string
    const homeComponent = await Home();
    const htmlString = render(homeComponent);
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

  // Default to serving HTML
  return await handleRequest();
}

console.log(`Server running on http://localhost:800`);

Deno.serve(router);
