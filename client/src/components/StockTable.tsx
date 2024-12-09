import { useEffect, useState } from "react";

interface Stock {
  id: number;
  symbol: string;
  time: string;
  price: string;
}

export function StocksTable() {
  const [stocks, setStocks] = useState<Stock[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/stocks")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch stocks");
        }
        return response.json();
      })
      .then((data: Stock[] | null) => {
        if (data) {
          setStocks(data);
        } else {
          setError("No stocks available.");
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center">Loading stocks...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!stocks || stocks.length === 0) {
    return <div className="text-center">No stocks available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Symbol</th>
            <th className="px-4 py-2 border-b">Date</th>
            <th className="px-4 py-2 border-b">Price</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b text-center">{stock.id}</td>
              <td className="px-4 py-2 border-b text-center">{stock.symbol}</td>
              <td className="px-4 py-2 border-b text-center">{stock.time}</td>
              <td className="px-4 py-2 border-b text-center">{stock.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
