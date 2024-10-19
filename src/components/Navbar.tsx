/** @jsx h */
import { h } from "preact";

export const Navbar = ({ balance }: { balance: number }) => {
  return (
    <nav class="fixed top-0 left-0 w-full p-4 backdrop-blur-[6px] z-10 flex items-center">
      <div class="flex w-full justify-between items-center">
        <div class="flex items-center">
          <img class="h-12 w-12 mr-4" src="/src/public/logo.webp" alt="logo" />
          <h1 class="text-xl font-bold">Stock Tracker</h1>
        </div>
        <div class="absolute left-1/2 transform -translate-x-1/2">
          <p class="font-bold">Profits: {balance} PLN</p>
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-moon"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </div>
      </div>
    </nav>
  );
};
