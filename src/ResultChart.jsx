import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function ResultChart({ slumpData }) {
  if (!slumpData || slumpData.length === 0) return null;

  const data = {
    datasets: [
      {
        label: "差玉推移",
        data: slumpData, // {x: 回転数, y: 玉数}
        borderColor: "#00ff00",
        borderWidth: 2,
        pointRadius: 0, 
        tension: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: "linear", title: { display: true, text: "回転数" } },
      y: { title: { display: true, text: "差玉" } }
    }
  };

  return (
    <div style={{ height: "350px", backgroundColor: "#111", padding: "10px", borderRadius: "8px" }}>
      <Line data={data} options={options} />
    </div>
  );
}