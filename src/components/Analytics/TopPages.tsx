import React from "react";
import { useTheme } from "../../context/ThemeContext";

const pages = [
  { source: "tailadmin.com", pageview: "4.7K" },
  { source: "preview.tailadmin.com", pageview: "3.4K" },
  { source: "docs.tailadmin.com", pageview: "2.9K" },
  { source: "tailadmin.com/components", pageview: "1.5K" },
];

const TopPages: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-lg p-6 shadow-sm ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700">
            <th className="text-left pb-2">Source</th>
            <th className="text-right pb-2">Pageview</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page, idx) => (
            <tr
              key={idx}
              className={`border-b border-gray-200 dark:border-gray-700 ${
                idx === pages.length - 1 ? "border-b-0" : ""
              }`}
            >
              <td className="py-2">{page.source}</td>
              <td className="py-2 text-right">{page.pageview}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className={`w-full py-2 rounded ${
          theme === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
        } font-semibold transition-colors`}
      >
        Channels Report &rarr;
      </button>
    </div>
  );
};

export default TopPages;
