export const Table = ({ openPositions }: { openPositions: any[] }) => {
  if (openPositions.length === 0) return null;

  const excludedHeaders = [
    "__EMPTY_8", // SL
    "__EMPTY_9", // TP
    "__EMPTY_10", // Margin
    "__EMPTY_11", // Prowizja
    "__EMPTY_12", // Swap
    "__EMPTY_13", // Rollover
    "__EMPTY_15", // Komentarz
  ];

  const headers = Object.keys(openPositions[0]).filter(
    (key) => key.startsWith("__EMPTY") && !excludedHeaders.includes(key)
  );

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">Open Positions</h1>
      <table class="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-800 text-white">
          <tr>
            {headers.map((header, index) => (
              <th key={index} class="px-4 py-2">
                {openPositions[0][header]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {openPositions.slice(1).map((position, index) => (
            <tr key={index}>
              {headers.map((header, subIndex) => (
                <td key={subIndex} class="border px-4 py-2">
                  {position[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
