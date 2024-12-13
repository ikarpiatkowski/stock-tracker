"use client";

import Image from "next/image";
import { MyChart } from "@/components/MyChart";
import { FirtstChart } from "@/components/FirtstChart";
import { FileUpload } from "@/components/FileUpload";
import { StocksTable } from "@/components/StockTable";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 items-center sm:items-start">
      X
      <Skeleton className="w-full h-[90px]" />
      <FileUpload />
      <FirtstChart />
      <StocksTable />
      <Image
        src="https://img.logo.dev/xtb.pl?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
        alt="Company Logo"
        width={100}
        height={100}
        className="mb-8"
      />
      <Image
        src="https://img.logo.dev/dws.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
        alt="Company Logo"
        width={100}
        height={100}
        className="mb-8"
      />
      <Image
        src="https://img.logo.dev/blackrock.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
        alt="Company Logo"
        width={100}
        height={100}
        className="mb-8"
      />
      <Image
        src="https://img.logo.dev/vaneck.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
        alt="Company Logo"
        width={100}
        height={100}
        className="mb-8"
      />
      <MyChart />
    </main>
  );
}
