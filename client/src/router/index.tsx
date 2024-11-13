import { Navbar } from "../components/Navbar.tsx";
import { Button } from "@/components/Button.tsx";
import { Input } from "@/components/Input.tsx";

interface Stock {
  symbol: string;
  time: string;
  price: string;
}

export const Home = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/stocks");
    if (!response.ok) {
      throw new Error(`Failed to fetch stocks: ${response.statusText}`);
    }
    const stocks: Stock[] = await response.json();

    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Stock Data</title>
          <link href="/output.css" rel="stylesheet" />
        </head>
        <body class="w-full h-full bg-[#86efac]">
          <Navbar />
          <div class="px-4 py-8 mx-auto">
            <div class="pt-16 mx-auto flex flex-col items-center justify-center">
              <h1 class="text-4xl font-bold">Welcome to Stock Tracker!</h1>

              <div class="pt-8 w-full max-w-4xl">
                <table class="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                  <thead class="bg-gray-800 text-white">
                    <tr>
                      <th class="px-4 py-2">Symbol</th>
                      <th class="px-4 py-2">Time</th>
                      <th class="px-4 py-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock, index) => (
                      <tr key={index} class="hover:bg-gray-100">
                        <td class="border px-4 py-2">{stock.symbol}</td>
                        <td class="border px-4 py-2">{stock.time}</td>
                        <td class="border px-4 py-2">{stock.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div class="pt-8">
                <h2 class="text-2xl font-bold">Actions</h2>
                <div class="flex gap-4 mt-4">
                  <Button variant="rainbow">Refresh</Button>
                  <Input type="text" placeholder="Search stocks..." />
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return <div>Error loading stocks data</div>;
  }
};
