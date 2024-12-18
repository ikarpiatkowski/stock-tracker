import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
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
  const { token } = useAuth();
  const [stocks, setStocks] = useState<StockWithReturns[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatSymbol = (symbol: string): string => {
    return symbol.toLowerCase().endsWith(".pl")
      ? symbol.toLowerCase().slice(0, -3)
      : symbol.toLowerCase();
  };

  const getCompanyDomain = (symbol: string): string => {
    const symbolMap: Record<string, string> = {
      "NEU.PL": "neuca.pl",
      "PKO.PL": "pkobp.pl",
      "PKN.PL": "orlen.pl",
      "KTY.PL": "grupakety.com",
      "KRU.PL": "kruk.eu",
      "GPW.PL": "gpw.pl",
      "APR.PL": "autopartner.com",
      "DCR.PL": "decora.pl",
      "AMB.PL": "ambra.com.pl",
      "PCR.PL": "rokita.pl",
      "AMC.PL": "amica.pl",
      "ABS.PL": "assecobs.pl",
      "ATC.PL": "arcticpaper.com",
      "KGH.PL": "kghm.com",
      "SNT.PL": "synektik.com.pl",
      "DNP.PL": "grupadino.pl",
      "ACP.PL": "asseco.com",
      "COG.PL": "cognorholding.eu",
      "MBR.PL": "mobruk.pl",
      "ASE.PL": "see.asseco.com",
      "TXT.PL": "text.pl",
      "DIG.PL": "digitalnetwork.pl",
      "ELT.PL": "elektrotim.pl",
      "PZU.PL": "pzu.pl",
      "WTN.PL": "wittchen.pl",
      "ASB.PL": "asbis.pl",
      "XTB.PL": "xtb.com",
      "PCO.PL": "pepco.pl",
      "XDEQ.DE": "dws.com",
      "SXRV.DE": "ishares.com",
      "SXR8.DE": "ishares.com",
      "DTLA.UK": "blackrock.com",
      "XDWT.DE": "dws.com",
      "IUSQ.DE": "ishares.com",
      "VVSM.DE": "vaneck.com",
    };
    return symbolMap[symbol.toUpperCase()] || "";
  };

  const fetchCurrentPrice = async (symbol: string): Promise<number> => {
    try {
      const formattedSymbol = formatSymbol(symbol);
      const response = await fetch(
        `http://localhost:8080/api/quote?symbol=${formattedSymbol}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch current price");
      const data: StockQuote = await response.json();
      return data.price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/api/stocks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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
              // Total investment in original currency
              const totalInvestment = stock.price * stock.shares;
              // Current value in original currency
              const currentTotalValue = currentPrice * stock.shares;

              // Convert to PLN if needed
              const totalInvestmentPLN = stock.isEuro
                ? totalInvestment * EUR_TO_PLN
                : totalInvestment;
              const currentTotalValuePLN = stock.isEuro
                ? currentTotalValue * EUR_TO_PLN
                : currentTotalValue;

              // Calculate profit and return percentage
              const profit = currentTotalValuePLN - totalInvestmentPLN;
              const returnPercentage = (profit / totalInvestmentPLN) * 100;

              setStocks(
                (prev) =>
                  prev?.map((s) =>
                    s.id === stock.id
                      ? {
                          ...s,
                          currentPrice: currentPrice,
                          returnPercentage: returnPercentage,
                          profit: profit,
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
    <table className="min-w-full border border-neutral-200 dark:border-neutral-800">
      <thead>
        <tr>
          <th className="px-4 py-2 border-b">Symbol</th>
          <th className="px-4 py-2 border-b">Buy Price</th>
          <th className="px-4 py-2 border-b">Current Price</th>
          <th className="px-4 py-2 border-b">Shares</th>
          <th className="px-4 py-2 border-b">Profit (PLN)</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock) => (
          <tr
            key={stock.id}
            className="hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <td className="px-4 py-2 border-b text-center">
              <div className="flex gap-2">
                <Image
                  src={`https://img.logo.dev/${getCompanyDomain(
                    stock.symbol
                  )}?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true`}
                  alt={`${stock.symbol} logo`}
                  width={24}
                  height={24}
                  className="rounded-md"
                />
                {stock.symbol}
              </div>
            </td>
            <td className="px-4 py-2 border-b text-center">
              {stock.price.toFixed(2)} {stock.isEuro ? "€" : "PLN"}
              {stock.isEuro && (
                <span className="text-neutral-500 text-sm ml-1">
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
                  {stock.currentPrice?.toFixed(2)} {stock.isEuro ? "€" : "PLN"}
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
                stock.profit
                  ? stock.profit > 0
                    ? "text-green-600"
                    : stock.profit < 0
                    ? "text-red-600"
                    : ""
                  : ""
              }`}
            >
              {stock.profit?.toFixed(2)} ({stock.returnPercentage?.toFixed(2)}
              %)
            </td>
          </tr>
        ))}
        <tr className="font-bold">
          <td colSpan={4} className="px-4 py-2 text-right">
            Total Profit:
          </td>
          <td
            className={`px-4 py-2 text-center ${
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
  );
}
