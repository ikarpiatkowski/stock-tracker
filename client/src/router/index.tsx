import type { Stock } from "../lib/types.ts";
import { Navbar } from "../components/Navbar.tsx";
import { StockTable } from "../components/StockTable.tsx";
import { Table } from "../components/Table.tsx";
import { DatePickerDemo } from "@/components/DatePicker.tsx";
// import { restClient } from "@polygon.io/client-js";
import { Button } from "@/components/Button.tsx";
import { Input } from "@/components/Input.tsx";
// const rest = restClient(Deno.env.get("POLY_API_KEY"));

export const Home = ({
  stocks,
  xlsxData,
  xlsxDataEu,
}: {
  stocks: Stock[];
  xlsxData: { stocksData: any[]; openPositionsData: any[] };
  xlsxDataEu: { stocksData: any[]; openPositionsData: any[] };
}) => {
  const lastZyskBrutto =
    xlsxData.openPositionsData
      .map((position) => parseFloat(position.__EMPTY_14))
      .filter((value) => !isNaN(value))
      .pop() || 0;

  const lastZyskBruttoEu =
    xlsxDataEu.openPositionsData
      .map((position) => parseFloat(position.__EMPTY_14))
      .filter((value) => !isNaN(value))
      .pop() || 0;

  const sum = parseFloat((lastZyskBrutto + lastZyskBruttoEu * 4.5).toFixed(2));

  // Filter out unnecessary fields and objects
  const filterOpenPositions = (data: any[]) =>
    data.filter(
      (position) =>
        position.__EMPTY_1 && position.__EMPTY_2 && position.__EMPTY_3
    );

  const filteredOpenPositions = filterOpenPositions(xlsxData.openPositionsData);
  const filteredOpenPositionsEu = filterOpenPositions(
    xlsxDataEu.openPositionsData
  );

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
          <Navbar balance={sum} />
          <div class="pt-16 mx-auto flex flex-col items-center justify-center">
            <h1 class="text-4xl font-bold">Welcome to Stock Tracker!</h1>
            <div class="pt-8">
              <Table openPositions={filteredOpenPositions} />
              <Table openPositions={filteredOpenPositionsEu} />
            </div>
            <div class="pt-8">
              <StockTable stocks={stocks} />
            </div>
            <div class="pt-8">
              <h2 class="text-2xl font-bold">Profits Chart</h2>
              {/* <DatePickerDemo /> */}
              {/* <Button /> */}
              <Button variant="rainbow">Rainbow</Button>
              <Input type="text" />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};