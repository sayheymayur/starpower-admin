import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function ConversionFunnelChart() {
  const options: ApexOptions = {
    colors: ["#2a31d8", "#465fff", "#7592ff", "#c2d6ff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 400,
      stacked: true,
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
        columnWidth: "55%",
        borderRadius: 8,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "14px",
        fontFamily: "Outfit",
      },
      y: {
        formatter: (val: number) => `${val} users`,
        title: {
          formatter: (seriesName: string) => `${seriesName}:`,
        },
      },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      labels: {
        style: {
          fontSize: "13px",
          fontWeight: 500,
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      fontSize: "13px",
      fontFamily: "Outfit",
      fontWeight: 500,
      itemMargin: {
        horizontal: 15,
        vertical: 5,
      },
      markers: {
        size: 12,
      },
    },
    grid: {
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    states: {
      hover: {
        filter: {
          type: "lighten",
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: "darken",
        },
      },
    },
  };

  const series = [
    {
      name: "Ad Impression",
      data: [45, 55, 45, 65, 25, 45, 55, 40],
    },
    {
      name: "Website Session",
      data: [20, 25, 20, 15, 15, 25, 15, 25],
    },
    {
      name: "App Download",
      data: [15, 15, 20, 10, 15, 15, 15, 20],
    },
    {
      name: "New Users",
      data: [10, 10, 15, 10, 20, 10, 15, 15],
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="conversionFunnelChart" className="min-w-[700px]">
        <Chart options={options} series={series} type="bar" height={400} />
      </div>
    </div>
  );
}