import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTheme } from "@/context/ThemeContext";
import { NamedCount } from "../types";

interface DistributionChartProps {
  seriesName: string;
  items: NamedCount[];
  horizontal?: boolean;
}

export default function DistributionChart({
  seriesName,
  items,
  horizontal = true,
}: DistributionChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Sin registros para mostrar.</p>
    );
  }

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
      foreColor: isDark ? "#98A2B3" : "#667085",
    },
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 4,
        barHeight: "70%",
        columnWidth: "45%",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: isDark ? "#344054" : "#E4E7EC",
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: items.map((item) => item.label),
    },
    yaxis: {
      labels: {
        formatter: (val) => (horizontal ? String(val) : String(Math.round(Number(val)))),
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (val) => `${val}` },
    },
    legend: { show: false },
  };

  return (
    <Chart
      options={options}
      series={[{ name: seriesName, data: items.map((item) => item.total) }]}
      type="bar"
      height={Math.max(220, items.length * 36)}
    />
  );
}
