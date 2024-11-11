import type { Stock } from "../lib/types.ts";
export const StockTable = ({ stocks }: { stocks: Stock[] }) => (
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
