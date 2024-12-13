import { useEffect, useState } from "react";

interface Stock {
  id: number;
  symbol: string;
  time: string;
  price: number;
  shares: number;
}

interface StockQuote {
  symbol: string;
  price: number;
}

interface StockWithReturns extends Stock {
  currentPrice?: number;
  returnPercentage?: number;
  profit?: number;
  isLoading?: boolean;
  error?: string;
  isEuro?: boolean;
}

const EUR_TO_PLN = 4.32;

export function StocksTable() {
  const [stocks, setStocks] = useState<StockWithReturns[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatSymbol = (symbol: string): string => {
    return symbol.toLowerCase().endsWith(".pl")
      ? symbol.toLowerCase().slice(0, -3)
      : symbol.toLowerCase();
  };

  const calculatePriceInPLN = (price: number, symbol: string): number => {
    return symbol.toLowerCase().endsWith(".pl") ? price : price * EUR_TO_PLN;
  };

  const fetchCurrentPrice = async (symbol: string): Promise<number> => {
    try {
      const formattedSymbol = formatSymbol(symbol);
      const response = await fetch(
        `http://localhost:8080/api/quote?symbol=${formattedSymbol}`
      );
      if (!response.ok) throw new Error("Failed to fetch current price");
      const data: StockQuote = await response.json();
      return calculatePriceInPLN(data.price, symbol);
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/stocks")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch stocks");
        return response.json();
      })
      .then(async (data: Stock[] | null) => {
        if (data) {
          const stocksWithReturns: StockWithReturns[] = data.map((stock) => ({
            ...stock,
            isLoading: true,
            isEuro: !stock.symbol.toLowerCase().endsWith(".pl"),
          }));
          setStocks(stocksWithReturns);

          for (const stock of stocksWithReturns) {
            try {
              const currentPrice = await fetchCurrentPrice(stock.symbol);
              const originalPriceInPLN = stock.isEuro
                ? stock.price * EUR_TO_PLN
                : stock.price;
              const currentPriceInPLN = stock.isEuro
                ? currentPrice * EUR_TO_PLN
                : currentPrice;

              setStocks(
                (prev) =>
                  prev?.map((s) =>
                    s.id === stock.id
                      ? {
                          ...s,
                          currentPrice: stock.isEuro
                            ? currentPrice
                            : currentPriceInPLN,
                          returnPercentage:
                            ((currentPriceInPLN - originalPriceInPLN) /
                              originalPriceInPLN) *
                            100,
                          profit:
                            (currentPriceInPLN - originalPriceInPLN) * s.shares,
                          isLoading: false,
                        }
                      : s
                  ) ?? null
              );
            } catch (error) {
              setStocks(
                (prev) =>
                  prev?.map((s) =>
                    s.id === stock.id
                      ? { ...s, error: "Failed to fetch", isLoading: false }
                      : s
                  ) ?? null
              );
            }
          }
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

  const totalProfit = stocks.reduce(
    (sum, stock) => sum + (stock.profit || 0),
    0
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Symbol</th>
            <th className="px-4 py-2 border-b">Date</th>
            <th className="px-4 py-2 border-b">Buy Price</th>
            <th className="px-4 py-2 border-b">Current Price</th>
            <th className="px-4 py-2 border-b">Shares</th>
            <th className="px-4 py-2 border-b">Return %</th>
            <th className="px-4 py-2 border-b">Profit (PLN)</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b text-center">{stock.id}</td>
              <td className="px-4 py-2 border-b text-center">{stock.symbol}</td>
              <td className="px-4 py-2 border-b text-center">{stock.time}</td>
              <td className="px-4 py-2 border-b text-center">
                {stock.price.toFixed(2)} {stock.isEuro ? "€" : "PLN"}
                {stock.isEuro && (
                  <span className="text-gray-500 text-sm ml-1">
                    ({(stock.price * EUR_TO_PLN).toFixed(2)} PLN)
                  </span>
                )}
              </td>
              <td className="px-4 py-2 border-b text-center">
                {stock.isLoading ? (
                  "Loading..."
                ) : stock.error ? (
                  <span className="text-red-500">{stock.error}</span>
                ) : (
                  <>
                    {stock.currentPrice?.toFixed(2)}{" "}
                    {stock.isEuro ? "€" : "PLN"}
                    {stock.isEuro && (
                      <span className="text-gray-500 text-sm ml-1">
                        ({(stock.currentPrice! * EUR_TO_PLN).toFixed(2)} PLN)
                      </span>
                    )}
                  </>
                )}
              </td>
              <td className="px-4 py-2 border-b text-center">{stock.shares}</td>
              <td
                className={`px-4 py-2 border-b text-center ${
                  stock.returnPercentage
                    ? stock.returnPercentage > 0
                      ? "text-green-600"
                      : stock.returnPercentage < 0
                      ? "text-red-600"
                      : ""
                    : ""
                }`}
              >
                {stock.returnPercentage?.toFixed(2)}%
              </td>
              <td
                className={`px-4 py-2 border-b text-center ${
                  stock.profit
                    ? stock.profit > 0
                      ? "text-green-600"
                      : stock.profit < 0
                      ? "text-red-600"
                      : ""
                    : ""
                }`}
              >
                {stock.profit?.toFixed(2)} PLN
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-50">
            <td colSpan={7} className="px-4 py-2 border-b text-right">
              Total Profit:
            </td>
            <td
              className={`px-4 py-2 border-b text-center ${
                totalProfit > 0
                  ? "text-green-600"
                  : totalProfit < 0
                  ? "text-red-600"
                  : ""
              }`}
            >
              {totalProfit.toFixed(2)} PLN
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
