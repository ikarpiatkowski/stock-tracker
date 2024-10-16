/** @jsx h */
import { h } from "https://esm.sh/preact@10.23.2";
import { render } from "https://esm.sh/preact-render-to-string@5.2.4";
import { Client } from "https://deno.land/x/postgres/mod.ts";
import { extname } from "https://deno.land/std@0.214.0/path/mod.ts";

// Initialize PostgreSQL client
const client = new Client({
  user: "ikar",
  database: "stocktracker",
  hostname: "127.0.0.1",
  port: 5432,
  password: "ikarikar",
});

await client.connect();

// Create the "stocks" table if it doesn't exist
await client.queryObject`
  CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    volume BIGINT NOT NULL,
    name TEXT NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    currency VARCHAR(3) NOT NULL
  );
`;

interface Stock {
  id: number;
  date: string;
  price: number;
  volume: number;
  name: string;
  ticker: string;
  currency: string;
}

const StockTable = ({ stocks }: { stocks: Stock[] }) => (
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Stock Data</h1>
    <table class="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead class="bg-gray-800 text-white">
        <tr>
          <th class="px-4 py-2">ID</th>
          <th class="px-4 py-2">Date</th>
          <th class="px-4 py-2">Price</th>
          <th class="px-4 py-2">Volume</th>
          <th class="px-4 py-2">Name</th>
          <th class="px-4 py-2">Ticker</th>
          <th class="px-4 py-2">Currency</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock) => (
          <tr key={stock.id}>
            <td class="border px-4 py-2">{stock.id}</td>
            <td class="border px-4 py-2">
              {new Date(stock.date).toLocaleString()}
            </td>
            <td class="border px-4 py-2">{stock.price}</td>
            <td class="border px-4 py-2">{stock.volume}</td>
            <td class="border px-4 py-2">{stock.name}</td>
            <td class="border px-4 py-2">{stock.ticker}</td>
            <td class="border px-4 py-2">{stock.currency}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Navbar = () => {
  const balance = 200;

  return (
    <nav class="fixed top-0 left-0 w-full p-4 backdrop-blur-[6px] z-10 flex items-center">
      <div class="flex w-full justify-between items-center">
        <div class="flex items-center">
          <img class="h-12 w-12 mr-4" src="/public/logo.webp" alt="logo" />
          <h1 class="text-xl font-bold">Stock Tracker</h1>
        </div>
        <div class="absolute left-1/2 transform -translate-x-1/2">
          <p class="font-bold">Profits: {balance} PLN</p>
        </div>
        <div>{Deno.env.get("GREETING")}AVATAR</div>
      </div>
    </nav>
  );
};

const Home = ({ stocks }: { stocks: Stock[] }) => {
  const bonds = 200;
  const etfs = 616.87;
  const etfsProfitInProcentage = 15;
  const etfsInPLN = 2651.22;
  const stocksSignal = 390.89;
  const cash = 3500;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Stock Data</title>
        <link href="/output.css" rel="stylesheet" />
      </head>
      <body class="w-full h-full bg-[#86efac]">
        <div class="px-4 py-8 mx-auto">
          <Navbar />
          <div class="pt-16 mx-auto flex flex-col items-center justify-center">
            <h1 class="text-4xl font-bold">Welcome to Stock Tracker!</h1>
            <div class="flex w-full justify-center pt-8 space-x-8">
              <div class="w-[300px]">
                <div class="flex justify-between">
                  <p>Bonds:</p>
                  <p>{bonds} PLN</p>
                </div>
                <div class="flex justify-between">
                  <p>Stocks:</p>
                  <p>{stocksSignal} PLN</p>
                </div>
                <div class="flex justify-between">
                  <p>Cash:</p>
                  <p>{cash} PLN</p>
                </div>
                <div class="flex justify-between pt-8">
                  <p>Summary:</p>
                  <p>
                    {(bonds + etfsInPLN + stocksSignal + cash).toFixed(2)} PLN
                  </p>
                </div>
              </div>
              <div class="w-[300px]">
                <div class="flex justify-between">
                  <p>Etfs:</p>
                  <p>
                    ({etfs} €) {etfsInPLN} PLN
                  </p>
                  <p class="text-green-800">+{etfsProfitInProcentage}%</p>
                </div>
                <div class="flex justify-between">
                  <p>Summary:</p>
                  <p>
                    {(bonds + etfsInPLN + stocksSignal + cash).toFixed(2)} PLN
                  </p>
                </div>
              </div>
            </div>
            <div class="pt-8">
              <StockTable stocks={stocks} />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

async function serveStaticFile(path: string): Promise<Response> {
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

function getMimeType(path: string): string {
  const ext = extname(path).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// Function to fetch stock data from PostgreSQL
async function fetchStockData(): Promise<Stock[]> {
  try {
    const result = await client.queryObject<Stock>("SELECT * FROM stocks");
    return result.rows;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return [];
  }
}

// Function to serve HTML with dynamic stock data
async function handleRequest(): Promise<Response> {
  try {
    const stocks = await fetchStockData();

    // Render JSX to HTML string
    const htmlString = render(<Home stocks={stocks} />);
    return new Response(htmlString, {
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Function to serve the compiled Tailwind CSS file
async function serveCSS(): Promise<Response> {
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

// Router to serve different types of content
async function router(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);

  if (pathname === "/output.css") {
    return await serveCSS();
  }

  // Serve static files from the public directory
  if (pathname.startsWith("/public/")) {
    return await serveStaticFile(`.${pathname}`);
  }

  // Default to serving HTML
  return await handleRequest();
}

Deno.serve(router);
