import { Part, World } from './types';
import { findGroups } from './groups';
import { GEN_CAPACITY, LAMP_WATT, SEEBECK, SKY_ROWS, SOLAR_WATT } from './constants';

export function sunAt(hour: number): number {
  return Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
}

const DEEP_TEMP = 25;

export function sandTempAt(hour: number, depth = 0): number {
  const surface = 10 + 55 * sunAt(hour);
  return DEEP_TEMP + (surface - DEEP_TEMP) * Math.exp(-depth / 3);
}

export function depthOf(row: number): number {
  return Math.max(0, row - SKY_ROWS);
}

function approach(current: number, target: number, speed: number, dtH: number): number {
  return current + (target - current) * (1 - Math.exp(-speed * dtH));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function tick(world: World, dtH: number): World {
  const hour = (world.hour + dtH) % 24;
  const sun = sunAt(hour);

  const parts: Part[] = world.parts.map((p) => {
    if (p.type === 'silver') {
      const sand = sandTempAt(hour, depthOf(p.row));
      return { ...p, temp: approach(p.temp, sand + 20 * sun, 3, dtH) };
    }
    if (p.type === 'bismuth') {
      return { ...p, temp: approach(p.temp, 15 + 8 * sun, 0.3, dtH) };
    }
    return { ...p };
  });

  const byId = new Map<number, Part>();
  parts.forEach((p) => byId.set(p.id, p));
  const { groups, groupOf } = findGroups(parts);
  const usedGroups = new Set<number>();

  world.wires.forEach((w) => {
    const gen = byId.get(w.from);
    const target = byId.get(w.to);
    if (!gen || !target) return;

    let watt = 0;
    if (target.type === 'solar') {
      watt = SOLAR_WATT * sun;
    } else if (target.type === 'lamp') {
      watt = -LAMP_WATT;
    } else {
      const gi = groupOf.get(target.id);
      if (gi === undefined || usedGroups.has(gi)) return;
      usedGroups.add(gi);
      const g = groups[gi];
      watt = g.pairs * Math.max(0, g.hot - g.cold) * SEEBECK;
    }
    gen.energy = clamp(gen.energy + watt * dtH, 0, GEN_CAPACITY);
  });

  return { ...world, hour, parts };
}
