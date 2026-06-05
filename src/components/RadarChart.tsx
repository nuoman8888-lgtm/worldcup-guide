'use client';

/**
 * SVG Radar / Spider chart for team ability visualization.
 * Pure SVG, no chart library needed.
 */

interface RadarData {
  label: string;
  value: number; // 0-10
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
}

export default function RadarChart({ data, size = 200 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 5; // number of concentric rings
  const sides = data.length;
  const angleStep = (2 * Math.PI) / sides;
  // Rotate so first point is at top
  const startAngle = -Math.PI / 2;

  // Generate points for a given value scale (0-1)
  function getPoints(scale: number) {
    return data.map((_, i) => {
      const angle = startAngle + angleStep * i;
      const r = radius * scale;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
  }

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => {
    const pts = getPoints((i + 1) / levels);
    return pts.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const angle = startAngle + angleStep * i;
    const r = radius * (d.value / 10);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Label positions (slightly outside the chart)
  const labelPoints = data.map((d, i) => {
    const angle = startAngle + angleStep * i;
    const r = radius * 1.22;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      label: d.label,
      value: d.value,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto"
      role="img"
      aria-label="球队能力雷达图"
    >
      {/* Grid rings */}
      {rings.map((pts, i) => (
        <polygon
          key={`ring-${i}`}
          points={pts}
          fill="none"
          stroke={i === levels - 1 ? '#D1D5DB' : '#E5E7EB'}
          strokeWidth={i === levels - 1 ? 1.5 : 0.5}
        />
      ))}

      {/* Grid axes */}
      {data.map((_, i) => {
        const angle = startAngle + angleStep * i;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(200, 169, 81, 0.2)"
        stroke="#C8A951"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#C8A951"
          stroke="white"
          strokeWidth={1.5}
        />
      ))}

      {/* Labels */}
      {labelPoints.map((p, i) => {
        // Determine text-anchor based on position
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (p.x < cx - 15) textAnchor = 'end';
        else if (p.x > cx + 15) textAnchor = 'start';

        return (
          <text
            key={`label-${i}`}
            x={p.x}
            y={p.y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            className="fill-gray-600"
            fontSize="11"
            fontWeight={500}
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}
