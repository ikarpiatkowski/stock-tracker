"use client";

import { FileUpload } from "@/components/FileUpload";
import { StocksTable } from "@/components/StockTable";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="flex flex-col gap-8 sm:items-start">
        <StocksTable />
        <FileUpload />
      </main>
    </ProtectedRoute>
  );
}
