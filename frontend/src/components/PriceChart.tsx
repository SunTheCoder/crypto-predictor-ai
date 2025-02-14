import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataset
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Dataset extends ChartDataset<'line', number[]> {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  pointStyle?: 'circle';
  pointRadius?: number;
}

interface PriceChartProps {
  historicalPrices: [number, number][];
  predictedRange?: { min: number; max: number; date: number };
  timeframe: string;
}

export default function PriceChart({ historicalPrices, predictedRange, timeframe }: PriceChartProps) {
  const dates = historicalPrices.map(([timestamp]) => 
    new Date(timestamp).toLocaleDateString()
  );
  
  const prices = historicalPrices.map(([, price]) => price);
  
  // Add predicted range if available
  const predictionDate = predictedRange ? new Date(predictedRange.date).toLocaleDateString() : '';

  const data = {
    labels: [...dates, predictionDate],
    datasets: [
      {
        label: 'Historical Price',
        data: prices,
        borderColor: 'rgb(75, 85, 99)',
        backgroundColor: 'rgba(75, 85, 99, 0.5)',
      } as Dataset,
      predictedRange ? {
        label: `${timeframe} Prediction Range`,
        data: [...Array(dates.length).fill(null), predictedRange.min, predictedRange.max],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        pointStyle: 'circle',
        pointRadius: 5,
      } as Dataset : null,
    ].filter(Boolean) as Dataset[],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price History & Prediction',
      },
    },
  };

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow-sm">
      <Line options={options} data={data} />
    </div>
  );
} 