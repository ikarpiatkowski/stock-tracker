import { parseXLSX } from "./xlsx.ts";
import { getMimeType } from "./mime.ts";

export async function serveXLSXData(): Promise<Response> {
  try {
    const jsonData = await parseXLSX("/src/public/data.xlsx");
    return new Response(JSON.stringify(jsonData), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error serving XLSX data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function serveStaticFile(path: string): Promise<Response> {
  try {
    const file = await Deno.readFile(path);
    const mimeType = getMimeType(path);
    return new Response(file, {
      headers: { "content-type": mimeType },
    });
  } catch (error) {
    console.error(`Error serving static file ${path}:`, error);
    return new Response("Not Found", { status: 404 });
  }
}

export async function serveCSS(): Promise<Response> {
  try {
    const css = await Deno.readTextFile("./src/output.css"); // Serve the compiled CSS globally
    return new Response(css, {
      headers: { "content-type": "text/css" },
    });
  } catch (error) {
    console.error("Error serving CSS:", error);
    return new Response("Not Found", { status: 404 });
  }
}
