import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card } from '../ui';
import { formatRupiah } from '../../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function RevenueChart({ chartData = [] }) {
  const data = {
    labels: chartData.map((d) => d.label),
    datasets: [
      {
        label: 'Omset',
        data: chartData.map((d) => d.revenue),
        fill: true,
        borderColor: '#9f3c16',
        backgroundColor: 'rgba(159,60,22,0.1)',
        tension: 0.4,
        pointBackgroundColor: '#9f3c16',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${formatRupiah(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `Rp ${(v / 1000).toFixed(0)}k`,
          font: { size: 11 },
        },
        grid: { color: '#fbeae7' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <Card className="p-space-lg">
      <h3 className="font-title-lg text-title-lg text-on-surface mb-space-lg">Omset 7 Hari Terakhir</h3>
      <Line data={data} options={options} />
    </Card>
  );
}
