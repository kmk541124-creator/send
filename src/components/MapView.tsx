import { MouseEvent } from 'react';
import Ground from './Ground';
import Sky from './Sky';
import PartView from './PartView';
import { World } from '../sim/types';
import { COLS, GROUND_Y, MAP_H, MAP_W, ROWS, TILE } from '../sim/constants';
import { PanHandlers } from '../hooks/useDragPan';
import { findGroups } from '../sim/groups';
import { sunAt } from '../sim/step';
import { isMetal } from '../sim/parts';

interface Props {
  world: World;
  cam: { x: number; y: number };
  selectedGen: number | null;
  panHandlers: PanHandlers;
  onTileClick: (col: number, row: number) => void;
  onTileRightClick: (col: number, row: number) => void;
}

export default function MapView({ world, cam, selectedGen, panHandlers, onTileClick, onTileRightClick }: Props) {
  const sun = sunAt(world.hour);
  const { groups, groupOf } = findGroups(world.parts);

  function toTile(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left - cam.x) / TILE);
    const row = Math.floor((e.clientY - rect.top - cam.y) / TILE);
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return null;
    return { col, row };
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const tile = toTile(e);
    if (tile) onTileClick(tile.col, tile.row);
  }

  function handleContextMenu(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    const tile = toTile(e);
    if (tile) onTileRightClick(tile.col, tile.row);
  }

  function isLampOn(lampId: number): boolean {
    const wire = world.wires.find((w) => w.to === lampId);
    if (!wire) return false;
    const gen = world.parts.find((p) => p.id === wire.from);
    return gen !== undefined && gen.energy > 0;
  }

  function isInGroup(id: number): boolean {
    const gi = groupOf.get(id);
    return gi !== undefined && groups[gi].pairs > 0;
  }

  const buried = world.parts.filter((p) => isMetal(p.type));
  const surface = world.parts.filter((p) => !isMetal(p.type));
  const lamps = surface.filter((p) => p.type === 'lamp' && isLampOn(p.id));

  return (
    <div className="map-viewport" {...panHandlers} onClick={handleClick} onContextMenu={handleContextMenu}>
      <svg width="100%" height="100%">
        <g transform={`translate(${cam.x}, ${cam.y})`}>
          <Sky hour={world.hour} />
          <Ground hour={world.hour} />

          {buried.map((p) => (
            <PartView key={p.id} part={p} selected={false} lampOn={false} inGroup={isInGroup(p.id)} />
          ))}

          {world.wires.map((w) => {
            const a = world.parts.find((p) => p.id === w.from);
            const b = world.parts.find((p) => p.id === w.to);
            if (!a || !b) return null;
            return (
              <line
                key={w.id}
                x1={a.col * TILE + TILE / 2}
                y1={a.row * TILE + TILE / 2}
                x2={b.col * TILE + TILE / 2}
                y2={b.row * TILE + TILE / 2}
                stroke="#2b2b2b"
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}

          {surface.map((p) => (
            <PartView
              key={p.id}
              part={p}
              selected={p.id === selectedGen}
              lampOn={p.type === 'lamp' && isLampOn(p.id)}
              inGroup={false}
            />
          ))}

          <rect y={GROUND_Y} width={MAP_W} height={MAP_H - GROUND_Y} fill="#0a1030" opacity={(1 - sun) * 0.5} pointerEvents="none" />

          {lamps.map((p) => (
            <circle
              key={p.id}
              cx={p.col * TILE + TILE / 2}
              cy={p.row * TILE + TILE / 2}
              r={TILE * 2}
              fill="#ffe27a"
              opacity={0.05 + 0.3 * (1 - sun)}
              pointerEvents="none"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
