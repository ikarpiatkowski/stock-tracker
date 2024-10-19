import { resolve } from "@std/path";
import * as xlsx from "xlsx";

export async function parseXLSX(
  filePath: string
): Promise<{ stocksData: any[]; openPositionsData: any[] }> {
  try {
    const absolutePath = resolve(filePath);
    const data = await Deno.readFile(absolutePath);
    const workbook = xlsx.read(data, { type: "buffer" });

    // Read data from the first sheet
    const stocksSheetName = workbook.SheetNames[0];
    const stocksSheet = workbook.Sheets[stocksSheetName];
    const stocksData = xlsx.utils.sheet_to_json(stocksSheet);

    // Read data from the second sheet
    const openPositionsSheetName = workbook.SheetNames[1];
    const openPositionsSheet = workbook.Sheets[openPositionsSheetName];
    const openPositionsData = xlsx.utils.sheet_to_json(openPositionsSheet);

    return { stocksData, openPositionsData };
  } catch (error) {
    console.error("Error parsing XLSX file:", error);
    return { stocksData: [], openPositionsData: [] };
  }
}
