import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useTheme } from "@/context/ThemeContext";
import { PesoMensual } from "../types";

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const etiquetaMes = (mes: string) => {
  const [, month] = mes.split("-");
  const index = Number(month) - 1;
  return meses[index] ?? mes;
};

export default function WeightTrendChart({ items }: { items: PesoMensual[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No hay pesajes en los últimos 6 meses.
      </p>
    );
  }

  const options: ApexOptions = {
    colors: ["#0F766E"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      foreColor: isDark ? "#98A2B3" : "#667085",
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0 },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: isDark ? "#344054" : "#E4E7EC" },
    xaxis: { categories: items.map((item) => etiquetaMes(item.mes)) },
    yaxis: {
      labels: { formatter: (val) => `${val}` },
      title: { text: "kg" },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: { formatter: (val) => `${val} kg` },
    },
    legend: { show: false },
  };

  return (
    <Chart
      options={options}
      series={[{ name: "Peso promedio", data: items.map((item) => item.promedio_kg) }]}
      type="area"
      height={280}
    />
  );
}
