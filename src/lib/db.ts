import { Client } from "postgres";
import type { Stock } from "./types.ts";

// Initialize PostgreSQL client
export const client = new Client({
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

export async function fetchStockData(): Promise<Stock[]> {
  try {
    const result = await client.queryObject<Stock>("SELECT * FROM stocks");
    return result.rows;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return [];
  }
}
