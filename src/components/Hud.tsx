import { sandTempAt, sunAt } from '../sim/step';

interface Props {
  hour: number;
  speed: number;
  paused: boolean;
  totalEnergy: number;
  hint: string;
  onSpeedChange: (speed: number) => void;
  onTogglePause: () => void;
}

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function Hud({ hour, speed, paused, totalEnergy, hint, onSpeedChange, onTogglePause }: Props) {
  return (
    <>
      <div className="hud">
        <div>🕒 {formatHour(hour)}</div>
        <div>☀️ 햇빛 {Math.round(sunAt(hour) * 100)}%</div>
        <div>🏜️ 지표 모래 {Math.round(sandTempAt(hour))}°C</div>
        <div>⚡ 저장 전기 {totalEnergy.toFixed(1)} Wh</div>
        <label className="speed">
          배속 {speed}x
          <input type="range" min={1} max={50} value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))} />
        </label>
        <button onClick={onTogglePause}>{paused ? '▶ 재생' : '⏸ 일시정지'}</button>
      </div>
      <div className="hint">{hint}</div>
    </>
  );
}
