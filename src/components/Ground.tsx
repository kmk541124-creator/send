import { COLS, GROUND_Y, MAP_H, MAP_W, ROWS, SKY_ROWS, TILE } from '../sim/constants';
import { sandTempAt } from '../sim/step';

interface Props {
  hour: number;
}

function groundColor(temp: number, depth: number): string {
  const t = Math.min(1, Math.max(0, (temp - 10) / 55));
  const hue = 40 - 28 * t;
  const sat = 40 + 35 * t;
  const light = 68 - depth * 1.6 - 6 * t;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

export default function Ground({ hour }: Props) {
  const layers = [];
  for (let row = SKY_ROWS; row < ROWS; row++) {
    const depth = row - SKY_ROWS;
    layers.push({ row, color: groundColor(sandTempAt(hour, depth), depth) });
  }

  return (
    <g>
      <defs>
        <pattern id="sand-grid" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          <path d={`M ${TILE} 0 L 0 0 0 ${TILE}`} fill="none" stroke="#0000001f" />
        </pattern>
      </defs>

      {layers.map((l) => (
        <rect key={l.row} x={0} y={l.row * TILE} width={MAP_W} height={TILE} fill={l.color} />
      ))}

      <rect x={0} y={GROUND_Y} width={COLS * TILE} height={MAP_H - GROUND_Y} fill="url(#sand-grid)" />
      <rect x={0} y={GROUND_Y - 3} width={MAP_W} height={6} fill="#b8894f" />
    </g>
  );
}
