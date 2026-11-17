import React from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const dataPoints = [50, 100, 75, 150, 125, 175, 140, 160, 180, 170, 190, 200];

const ActiveUsers: React.FC = () => {
  const { theme } = useTheme();

  const data: ChartData<"line"> = {
    labels: dataPoints.map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Active Users",
        data: dataPoints,
        fill: true,
        backgroundColor:
          theme === "dark"
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.1)",
        borderColor: theme === "dark" ? "rgba(59, 130, 246, 1)" : "rgba(59, 130, 246, 0.8)",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: theme === "dark" ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)",
        titleColor: theme === "dark" ? "rgba(241, 245, 249, 0.9)" : "rgba(15, 23, 42, 0.9)",
        bodyColor: theme === "dark" ? "rgba(241, 245, 249, 0.7)" : "rgba(15, 23, 42, 0.7)",
        borderColor: theme === "dark" ? "rgba(71, 85, 105, 0.5)" : "rgba(226, 232, 240, 0.5)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  return (
    <div
      className={`rounded-lg p-6 shadow-sm ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="flex items-center space-x-2 mb-4">
        <span className="block w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
        <h3 className="text-lg font-semibold">Active Users</h3>
      </div>
      <p className="text-3xl font-bold mb-1">560</p>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Live visitors</p>
      <div className="relative h-24">
        <Line data={data} options={options} />
      </div>
      <div className="flex justify-between text-sm mt-4 text-gray-500 dark:text-gray-400">
        <div>
          <div className="font-semibold">224</div>
          <div>Avg, Daily</div>
        </div>
        <div>
          <div className="font-semibold">1.4K</div>
          <div>Avg, Weekly</div>
        </div>
        <div>
          <div className="font-semibold">22.1K</div>
          <div>Avg, Monthly</div>
        </div>
      </div>
    </div>
  );
};

export default ActiveUsers;
