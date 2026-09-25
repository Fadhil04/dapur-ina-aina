// frontend/src/components/admin/RevenueChart.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend)

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function RevenueChart({ chartData = [] }) {
  const data = {
    labels: chartData.map(d => d.label),
    datasets: [
      {
        label: 'Omset',
        data: chartData.map(d => d.revenue),
        fill: true,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.1)',
        tension: 0.4,
        pointBackgroundColor: '#f97316',
        pointRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${formatRupiah(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: v => `Rp ${(v / 1000).toFixed(0)}k`,
          font: { size: 11 },
        },
        grid: { color: '#f1f5f9' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 mb-4">Omset 7 Hari Terakhir</h3>
      <Line data={data} options={options} />
    </div>
  )
}
