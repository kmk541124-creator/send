import { Part } from '../sim/types';
import { getInfo, isMetal } from '../sim/parts';
import { GEN_CAPACITY, TILE } from '../sim/constants';

interface Props {
  part: Part;
  selected: boolean;
  lampOn: boolean;
  inGroup: boolean;
}

function tempColor(temp: number): string {
  const ratio = Math.min(1, Math.max(0, temp / 100));
  const hue = 220 - 220 * ratio;
  return `hsl(${hue}, 75%, 50%)`;
}

export default function PartView({ part, selected, lampOn, inGroup }: Props) {
  const info = getInfo(part.type);
  const metal = isMetal(part.type);
  const x = part.col * TILE;
  const y = part.row * TILE;

  let fill = info.color;
  if (metal) fill = tempColor(part.temp);
  if (part.type === 'lamp' && lampOn) fill = '#ffd84a';

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={4}
        y={4}
        width={TILE - 8}
        height={TILE - 8}
        rx={metal ? 3 : 8}
        fill={fill}
        opacity={metal ? 0.8 : 1}
        stroke={selected ? '#ffffff' : metal ? info.color : '#00000066'}
        strokeWidth={selected ? 3 : 2}
        strokeDasharray={metal ? '4 2' : undefined}
      />
      <text x={TILE / 2} y={metal ? 20 : 26} textAnchor="middle" fontSize={metal ? 12 : 16} fontWeight="bold" fill="#1b1b1b">
        {info.icon}
      </text>

      {metal && (
        <text x={TILE / 2} y={32} textAnchor="middle" fontSize={9} fill="#1b1b1b">
          {Math.round(part.temp)}°
        </text>
      )}

      {inGroup && (
        <text x={TILE - 7} y={11} textAnchor="middle" fontSize={10}>
          ⚡
        </text>
      )}

      {part.type === 'generator' && (
        <g>
          <rect x={6} y={TILE - 9} width={TILE - 12} height={4} fill="#00000088" />
          <rect x={6} y={TILE - 9} width={(TILE - 12) * (part.energy / GEN_CAPACITY)} height={4} fill="#5be37a" />
        </g>
      )}
    </g>
  );
}
