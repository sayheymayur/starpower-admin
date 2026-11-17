import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";

const dataSets = {
  "12 months": {
    categories: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
  },
  "30 days": {
    categories: Array.from({ length: 30 }, (_, i) => (i + 1).toString()),
    data: [160, 390, 200, 290, 180, 190, 110, 210, 270, 110,
           380, 270, 110, 210, 260, 180, 390, 110, 100, 390,
           110, 220, 280, 280, 160, 110, 110, 280, 390, 310],
  },
  "7 days": {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [210, 180, 260, 200, 230, 190, 220],
  },
  "24 hours": {
    categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    data: [15, 20, 18, 22, 30, 40, 50, 60, 55, 45, 35, 25, 20, 18, 15, 10, 8, 12, 18, 25, 30, 35, 40, 45],
  },
};

export default function AnalyticsChart() {
  const [selectedRange, setSelectedRange] = useState<keyof typeof dataSets>("30 days");

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: dataSets[selectedRange].categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: dataSets[selectedRange].data,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Analytics</h3>
        <p className="text-gray-600 dark:text-gray-400">Visitor analytics of last 30 days</p>
        <div className="flex space-x-2">
          {Object.keys(dataSets).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range as keyof typeof dataSets)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
                ${
                  selectedRange === range
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div id="Analytics" className="min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
