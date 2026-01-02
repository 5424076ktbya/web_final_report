import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieDist({ dist }) {
  const labels = dist.map(p => `${p.balls}発`);
  const dataValues = dist.map(p => Number(p.rate));

  const data = {
    labels: labels,
    datasets: [{
      data: dataValues,
      backgroundColor: [
        "#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF",
        "#FF9F40", "#C9CBCF", "#7BC8A4", "#E7E7E7", "#9D84B7"
      ],
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', // 凡例を下に配置して見やすく
        labels: {
          boxWidth: 12,
          font: { size: 11 },
          padding: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed}%`
        }
      }
    }
  };

  if (dataValues.every(val => !val) || dataValues.length === 0) return null;

  return (
    <div style={{ width: "100%", height: "200px", marginTop: "15px" }}> 
      <Pie data={data} options={options} />
    </div>
  );
}