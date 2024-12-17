"use client";

import { useState, JSX } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StockData {
  date: string;
  price: number;
  change: string;
  changePercent: string;
  isIncrease: boolean;
  volume: number;
}

function formatPriceWithColoredDiff(
  currentPrice: number,
  previousPrice: number | null
): JSX.Element {
  const [currentWhole, currentDecimal] = currentPrice.toFixed(2).split(".");
  const [prevWhole] = previousPrice
    ? previousPrice.toFixed(2).split(".")
    : [currentWhole, currentDecimal];

  const isIncrease = previousPrice ? currentPrice > previousPrice : false;
  const hasChanged = previousPrice ? currentPrice !== previousPrice : false;
  const wholeChanged = prevWhole !== currentWhole;

  return (
    <span>
      <span
        className={
          wholeChanged && hasChanged
            ? isIncrease
              ? "text-green-600"
              : "text-red-600"
            : ""
        }
      >
        {currentWhole}
      </span>
      .
      <span
        className={
          hasChanged ? (isIncrease ? "text-green-600" : "text-red-600") : ""
        }
      >
        {currentDecimal}
      </span>
    </span>
  );
}

export default function SearchStock() {
  const { token } = useAuth();
  const [symbol, setSymbol] = useState("ELT");
  const [data, setData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getStockData(symbol: string): Promise<StockData[]> {
    try {
      console.log("Fetching data for symbol:", symbol); // Debug log
      const response = await fetch(
        `http://localhost:8080/api/stock?symbol=${symbol}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data); // Debug log
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const stockData = await getStockData(symbol);
      if (!Array.isArray(stockData)) {
        throw new Error("Invalid data format received");
      }
      setData(stockData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch stock data"
      );
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g. ELT)"
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4 p-2 border border-red-300 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">Loading stock data...</div>
      )}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4">Stock Data for {symbol}</h2>
          <table className="min-w-full text-center border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Price (PLN)</th>
                <th className="border p-2">Change (PLN / %)</th>
                <th className="border p-2">Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const previousPrice =
                  index < data.length - 1 ? data[index + 1].price : null;

                return (
                  <tr key={item.date} className="hover:bg-gray-50">
                    <td className="border p-2">{item.date}</td>
                    <td className="border p-2">
                      {formatPriceWithColoredDiff(item.price, previousPrice)}
                    </td>
                    <td
                      className={`border p-2 ${
                        parseFloat(item.change) === 0
                          ? ""
                          : item.isIncrease
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.change} ({item.changePercent}%)
                    </td>
                    <td className="border p-2">{item.volume}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
