import React from "react";
import { useTheme } from "../../context/ThemeContext";

const channels = [
  { source: "Google", visitors: "4.7K" },
  { source: "Facebook", visitors: "3.4K" },
  { source: "Threads", visitors: "2.9K" },
  { source: "Google", visitors: "1.5K" },
];

const TopChannels: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-lg p-6 shadow-sm ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Top Channels</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700">
            <th className="text-left pb-2">Source</th>
            <th className="text-right pb-2">Visitors</th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel, idx) => (
            <tr
              key={idx}
              className={`border-b border-gray-200 dark:border-gray-700 ${
                idx === channels.length - 1 ? "border-b-0" : ""
              }`}
            >
              <td className="py-2">{channel.source}</td>
              <td className="py-2 text-right">{channel.visitors}</td>
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

export default TopChannels;
