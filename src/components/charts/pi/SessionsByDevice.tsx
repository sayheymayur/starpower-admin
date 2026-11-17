import React, { useState, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);



const deviceData = [
  { label: "Tablet", value: 25, colorLight: "rgba(226, 232, 240, 1)", colorDark: "rgba(203, 213, 225, 0.6)" },
  { label: "Desktop", value: 45, colorLight: "rgba(59, 130, 246, 1)", colorDark: "rgba(99, 102, 241, 1)" },
  { label: "Mobile", value: 65, colorLight: "rgba(147, 197, 253, 1)", colorDark: "rgba(147, 197, 253, 0.8)" },
];

const SessionsByDevice: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const chartRef = useRef<ChartJS<"doughnut"> | null>(null);

  const { theme } = useTheme();

  const data: ChartData<"doughnut"> = {
    labels: deviceData.map((d) => d.label),
    datasets: [
      {
        data: deviceData.map((d) => d.value),
        backgroundColor: deviceData.map((d) =>
          theme === "dark" ? d.colorDark : d.colorLight
        ),
        borderWidth: 0,
        hoverOffset: 30,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor:
          theme === "dark" ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 0.9)",
        titleColor: theme === "dark" ? "rgba(241, 245, 249, 0.9)" : "rgba(15, 23, 42, 0.9)",
        bodyColor: theme === "dark" ? "rgba(241, 245, 249, 0.7)" : "rgba(15, 23, 42, 0.7)",
        borderColor: theme === "dark" ? "rgba(71, 85, 105, 0.5)" : "rgba(226, 232, 240, 0.5)",
        borderWidth: 1,
      },
    },
    onHover: (_event, elements) => {
      if (elements.length > 0) {
        setHoveredIndex(elements[0].index);
      } else {
        setHoveredIndex(null);
      }
    },
  };

  const activeIndex = clickedIndex !== null ? clickedIndex : hoveredIndex;
  const centerLabel = activeIndex !== null ? deviceData[activeIndex].label : "Sessions";
  const centerValue = activeIndex !== null ? deviceData[activeIndex].value : "";

  const backgroundColors = deviceData.map((d, idx) =>
    theme === "dark"
      ? idx === activeIndex ? d.colorLight : d.colorDark
      : idx === activeIndex ? d.colorDark : d.colorLight
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 ${
        theme === "dark"
          ? "border-gray-800 bg-white/[0.03] text-gray-300"
          : "border-gray-200 bg-white text-gray-900"
      }`}
      style={{ userSelect: "none" }}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sessions By Device
        </h3>
        {/* Three-dot menu button */}
        <button
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </button>
        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-4 top-10 z-10 w-32 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <button className="block w-full px-4 py-2 text-left text-theme-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
              View More
            </button>
            <button className="block w-full px-4 py-2 text-left text-theme-sm text-red-600 hover:bg-gray-50 dark:text-red-500 dark:hover:bg-gray-700">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="relative h-64">
        <Doughnut 
          ref={chartRef} 
          data={{...data, datasets: [{...data.datasets[0], backgroundColor: backgroundColors}]}} 
          options={options} 
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center select-none"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-sm font-medium dark:text-white/90">{centerLabel}</div>
          <div className="text-2xl font-bold dark:text-white">{centerValue}</div>
        </div>
      </div>

      <div className="mt-6 flex justify-center space-x-6 text-sm select-none">
        {deviceData.map((device, idx) => (
          <button
            key={device.label}
            className={`flex items-center space-x-2 p-1 rounded-md transition-colors ${
              idx === activeIndex 
                ? "bg-gray-100 dark:bg-gray-800 font-semibold" 
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
            onClick={() => {
              if (clickedIndex === idx) {
                setClickedIndex(null);
              } else {
                setClickedIndex(idx);
              }
            }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span
              className="block w-3 h-3 rounded-full"
              style={{
                backgroundColor: theme === "dark" ? device.colorDark : device.colorLight,
              }}
            ></span>
            <span className="text-gray-500 dark:text-gray-400">{device.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SessionsByDevice;