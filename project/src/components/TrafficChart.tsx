import { useEffect, useRef } from 'react';

interface DataPoint {
  time: string;
  value: number;
}

interface TrafficChartProps {
  data: DataPoint[];
  color: string;
  label: string;
  isDarkMode: boolean;
}

export function TrafficChart({ data, color, label, isDarkMode }: TrafficChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data.map(d => d.value));
    const xStep = (width - padding * 2) / (data.length - 1);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((point.value / maxValue) * (height - padding * 2));

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = isDarkMode ? '#9CA3AF' : '#6B7280'; // text-gray-400 : text-gray-500
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    data.forEach((point, i) => {
      if (i % 2 === 0) {
        const x = padding + i * xStep;
        ctx.fillText(point.time, x, height - 10);
      }
    });

    ctx.textAlign = 'right';
    ctx.fillText('0', padding - 5, height - padding + 5);
    ctx.fillText(maxValue.toString(), padding - 5, padding + 5);

  }, [data, color, isDarkMode]);

  return (
    <div className={`rounded-xl border p-6 shadow-lg ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-md' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full"
      />
    </div>
  );
}
