import React from "react";

const orders = [
  {
    product: "TailGrids",
    category: "UI Kit",
    countryFlag: "/images/country/country-01.svg",
    cr: "Dashboard",
    value: "$12,499",
  },
  {
    product: "GrayGrids",
    category: "Templates",
    countryFlag: "/images/country/country-02.svg",
    cr: "Dashboard",
    value: "$5,498",
  },
  {
    product: "Uideck",
    category: "Templates",
    countryFlag: "/images/country/country-03.svg",
    cr: "Dashboard",
    value: "$4,521",
  },
  {
    product: "FormBold",
    category: "SaaS",
    countryFlag: "/images/country/country-04.svg",
    cr: "Dashboard",
    value: "$13,843",
  },
  {
    product: "NextAdmin",
    category: "Dashboard",
    countryFlag: "/images/country/country-05.svg",
    cr: "Dashboard",
    value: "$7,523",
  },
  {
    product: "Form Builder",
    category: "SaaS",
    countryFlag: "/images/country/country-06.svg",
    cr: "Dashboard",
    value: "$1,377",
  },
  {
    product: "AyroUI",
    category: "UI Kit",
    countryFlag: "/images/country/country-07.svg",
    cr: "Dashboard",
    value: "$599",
  },
];

const RecentOrders: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <div className="flex space-x-2">
          <button className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10h18M9 16h6"
              />
            </svg>
            Filter
          </button>
          <button className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700">
            See all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 font-semibold text-gray-700 dark:text-gray-300">Products</th>
              <th className="py-2 font-semibold text-gray-700 dark:text-gray-300">Category</th>
              <th className="py-2 font-semibold text-gray-700 dark:text-gray-300">Country</th>
              <th className="py-2 font-semibold text-gray-700 dark:text-gray-300">CR</th>
              <th className="py-2 font-semibold text-gray-700 dark:text-gray-300">Value</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(({ product, category, countryFlag, cr, value }) => (
              <tr
                key={product}
                className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <td className="py-3 font-semibold text-gray-900 dark:text-white">{product}</td>
                <td className="py-3 text-gray-600 dark:text-gray-400">{category}</td>
                <td className="py-3">
                  <img
                    src={countryFlag}
                    alt={`${product} country flag`}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                </td>
                <td className="py-3 text-gray-600 dark:text-gray-400">{cr}</td>
                <td className="py-3 font-semibold text-green-600 dark:text-green-400">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
