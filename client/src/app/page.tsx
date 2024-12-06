"use client";

import Image from "next/image";
import { MyChart } from "@/components/MyChart";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          src={
            "https://img.logo.dev/xtb.pl?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          }
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <Image
          src={
            "https://img.logo.dev/dws.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          }
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <Image
          src={
            "https://img.logo.dev/blackrock.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          }
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <Image
          src={
            "https://img.logo.dev/vaneck.com?token=pk_QMo9Eq-YTcm8fEcZTeinfw&retina=true"
          }
          alt="Company Logo"
          width={200}
          height={100}
          className="mb-8"
        />
        <MyChart />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
