"use client";

import Image from "next/image";
import { MyChart } from "@/components/MyChart";
import { FirtstChart } from "@/components/FirtstChart";
import { FileUpload } from "@/components/FileUpload";
import { StocksTable } from "@/components/StockTable";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <FileUpload />
        <FirtstChart />
        <StocksTable />
        <Image
          src="https://img.logo.dev/xtb.pl?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <Image
          src="https://img.logo.dev/dws.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <Image
          src="https://img.logo.dev/blackrock.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <Image
          src="https://img.logo.dev/vaneck.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <MyChart />
      </main>
    </div>
  );
}
