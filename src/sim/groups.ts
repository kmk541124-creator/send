import { Part } from './types';
import { isMetal } from './parts';

export interface MetalGroup {
  ids: number[];
  pairs: number;
  hot: number;
  cold: number;
}

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function findGroups(parts: Part[]) {
  const metals = parts.filter((p) => isMetal(p.type));
  const byPos = new Map<string, Part>();
  metals.forEach((m) => byPos.set(`${m.col},${m.row}`, m));

  const groupOf = new Map<number, number>();
  const groups: MetalGroup[] = [];

  for (const start of metals) {
    if (groupOf.has(start.id)) continue;

    const index = groups.length;
    const members: Part[] = [];
    const queue: Part[] = [start];
    groupOf.set(start.id, index);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      members.push(cur);
      for (const [dc, dr] of DIRS) {
        const next = byPos.get(`${cur.col + dc},${cur.row + dr}`);
        if (next && !groupOf.has(next.id)) {
          groupOf.set(next.id, index);
          queue.push(next);
        }
      }
    }

    let pairs = 0;
    members.forEach((m) => {
      if (m.type !== 'silver') return;
      for (const [dc, dr] of DIRS) {
        if (byPos.get(`${m.col + dc},${m.row + dr}`)?.type === 'bismuth') pairs++;
      }
    });

    const silvers = members.filter((m) => m.type === 'silver');
    const bismuths = members.filter((m) => m.type === 'bismuth');
    groups.push({ ids: members.map((m) => m.id), pairs, hot: average(silvers), cold: average(bismuths) });
  }

  return { groups, groupOf };
}

function average(list: Part[]): number {
  if (list.length === 0) return 0;
  return list.reduce((sum, p) => sum + p.temp, 0) / list.length;
}
