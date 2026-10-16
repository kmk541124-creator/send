import { useMemo } from 'react';
import { GROUND_Y, MAP_W } from '../sim/constants';
import { sunAt } from '../sim/step';

interface Props {
  hour: number;
}

const NIGHT = [11, 19, 48];
const DAY = [135, 196, 245];
const DUSK = [244, 150, 90];

function mix(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t);
}

function skyColor(hour: number): string {
  const sun = sunAt(hour);
  let color = mix(NIGHT, DAY, Math.min(1, sun * 2.5));
  if (sun > 0 && sun < 0.35) color = mix(color, DUSK, (1 - sun / 0.35) * 0.6);
  return `rgb(${color.map(Math.round).join(',')})`;
}

function arcPosition(progress: number) {
  const x = progress * MAP_W;
  const y = GROUND_Y - Math.sin(progress * Math.PI) * (GROUND_Y - 50);
  return { x, y };
}

export default function Sky({ hour }: Props) {
  const sun = sunAt(hour);
  const isDay = hour >= 6 && hour < 18;
  const progress = isDay ? (hour - 6) / 12 : ((hour + 6) % 24) / 12;
  const body = arcPosition(progress);

  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 60; i++) {
      list.push({ x: (i * 397) % MAP_W, y: (i * 151) % (GROUND_Y - 40), r: (i % 3) * 0.5 + 0.8 });
    }
    return list;
  }, []);

  return (
    <g>
      <rect x={0} y={0} width={MAP_W} height={GROUND_Y} fill={skyColor(hour)} />

      <g opacity={Math.max(0, 1 - sun * 3)}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" />
        ))}
      </g>

      {isDay ? (
        <g>
          <circle cx={body.x} cy={body.y} r={46} fill="#ffe08a" opacity={0.35} />
          <circle cx={body.x} cy={body.y} r={28} fill="#ffd23f" />
        </g>
      ) : (
        <g>
          <circle cx={body.x} cy={body.y} r={22} fill="#f2f0e6" />
          <circle cx={body.x + 9} cy={body.y - 6} r={20} fill={skyColor(hour)} />
        </g>
      )}
    </g>
  );
}
