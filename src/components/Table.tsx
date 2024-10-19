/** @jsx h */
import { h } from "preact";
export const Table = ({ openPositions }: { openPositions: any[] }) => (
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Open Positions</h1>
    <table class="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead class="bg-gray-800 text-white">
        <tr>
          <th class="px-4 py-2">Symbol</th>
          <th class="px-4 py-2">Typ</th>
          <th class="px-4 py-2">Wolumen</th>
          <th class="px-4 py-2">Czas otwarcia</th>
          <th class="px-4 py-2">Cena otwarcia</th>
          <th class="px-4 py-2">Cena rynkowa</th>
          <th class="px-4 py-2">Wartość zakupu</th>
          <th class="px-4 py-2">Zysk brutto</th>
          <th class="px-4 py-2">Komentarz</th>
        </tr>
      </thead>
      <tbody>
        {openPositions.map((position, index) => (
          <tr key={index}>
            <td class="border px-4 py-2">{position.__EMPTY_1}</td>
            <td class="border px-4 py-2">{position.__EMPTY_2}</td>
            <td class="border px-4 py-2">{position.__EMPTY_3}</td>
            <td class="border px-4 py-2">{position.__EMPTY_4}</td>
            <td class="border px-4 py-2">{position.__EMPTY_5}</td>
            <td class="border px-4 py-2">{position.__EMPTY_6}</td>
            <td class="border px-4 py-2">{position.__EMPTY_7}</td>
            <td class="border px-4 py-2">{position.__EMPTY_14}</td>
            <td class="border px-4 py-2">{position.__EMPTY_15}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
