import { useEffect, useState } from 'react';
import './App.css';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import Hud from './components/Hud';
import { useDragPan } from './hooks/useDragPan';
import { PartType, Tool, World } from './sim/types';
import { depthOf, sandTempAt, tick } from './sim/step';
import { HOURS_PER_SEC, SKY_ROWS, SURFACE_ROW, TICK_MS } from './sim/constants';
import { getInfo, isMetal } from './sim/parts';

const START_WORLD: World = { hour: 9, parts: [], wires: [], nextId: 1 };

function App() {
  const [world, setWorld] = useState<World>(START_WORLD);
  const [tool, setTool] = useState<Tool>(null);
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const { cam, panHandlers, wasDragged } = useDragPan();

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      const dtH = (TICK_MS / 1000) * HOURS_PER_SEC * speed;
      setWorld((prev) => tick(prev, dtH));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [speed, paused]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setTool(null);
        setSelectedGen(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function placePart(type: PartType, col: number, row: number) {
    setWorld((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        { id: prev.nextId, type, col, row, temp: sandTempAt(prev.hour, depthOf(row)), energy: 0 },
      ],
      nextId: prev.nextId + 1,
    }));
  }

  function connect(genId: number, targetId: number) {
    setWorld((prev) => ({
      ...prev,
      wires: [...prev.wires.filter((w) => w.to !== targetId), { id: prev.nextId, from: genId, to: targetId }],
      nextId: prev.nextId + 1,
    }));
  }

  function removePart(col: number, row: number) {
    setWorld((prev) => {
      const hit = prev.parts.find((p) => p.col === col && p.row === row);
      if (!hit) return prev;
      return {
        ...prev,
        parts: prev.parts.filter((p) => p.id !== hit.id),
        wires: prev.wires.filter((w) => w.from !== hit.id && w.to !== hit.id),
      };
    });
    setSelectedGen(null);
  }

  function handleTileClick(col: number, row: number) {
    if (wasDragged()) return;
    const hit = world.parts.find((p) => p.col === col && p.row === row);

    if (tool !== null) {
      if (isMetal(tool) && row < SKY_ROWS) return;
      const targetRow = isMetal(tool) ? row : SURFACE_ROW;
      const occupied = world.parts.some((p) => p.col === col && p.row === targetRow);
      if (!occupied) placePart(tool, col, targetRow);
      return;
    }

    if (hit && hit.type === 'generator') {
      setSelectedGen(hit.id);
      return;
    }

    if (selectedGen !== null && hit) connect(selectedGen, hit.id);
    setSelectedGen(null);
  }

  const totalEnergy = world.parts
    .filter((p) => p.type === 'generator')
    .reduce((sum, p) => sum + p.energy, 0);

  let hint = '드래그: 지도 이동 · 발전기 클릭 → 금속/태양열/가로등 클릭: 연결 · 우클릭: 삭제';
  if (tool !== null) {
    const where = isMetal(tool) ? '땅속 칸을 클릭하세요' : '설치할 위치의 열을 클릭하면 지표면에 놓입니다';
    hint = `${getInfo(tool).name} 설치 중 — ${where} (Esc: 취소)`;
  } else if (selectedGen !== null) {
    hint = '연결할 금속 묶음, 태양열, 가로등을 클릭하세요 (Esc: 취소)';
  }

  return (
    <div className="app">
      <MapView
        world={world}
        cam={cam}
        selectedGen={selectedGen}
        panHandlers={panHandlers}
        onTileClick={handleTileClick}
        onTileRightClick={removePart}
      />
      <SidePanel tool={tool} onSelect={setTool} />
      <Hud
        hour={world.hour}
        speed={speed}
        paused={paused}
        totalEnergy={totalEnergy}
        hint={hint}
        onSpeedChange={setSpeed}
        onTogglePause={() => setPaused(!paused)}
      />
    </div>
  );
}

export default App;
