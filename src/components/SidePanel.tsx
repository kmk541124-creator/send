import { useState } from 'react';
import { Tool } from '../sim/types';
import { PART_LIST } from '../sim/parts';

interface Props {
  tool: Tool;
  onSelect: (tool: Tool) => void;
}

export default function SidePanel({ tool, onSelect }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <aside className={open ? 'panel open' : 'panel'}>
      <button className="panel-toggle" onClick={() => setOpen(!open)}>
        {open ? '▶' : '◀ 부품'}
      </button>

      {open && (
        <div className="panel-body">
          <h2>부품</h2>

          <button className={tool === null ? 'tool active' : 'tool'} onClick={() => onSelect(null)}>
            <span className="tool-icon">🖐</span>
            <span className="tool-text">
              <b>이동 / 연결</b>
              <small>드래그로 이동, 발전기 → 대상 클릭으로 연결</small>
            </span>
          </button>

          {PART_LIST.map((info) => (
            <button
              key={info.type}
              className={tool === info.type ? 'tool active' : 'tool'}
              onClick={() => onSelect(tool === info.type ? null : info.type)}
            >
              <span className="tool-icon" style={{ background: info.color }}>
                {info.icon}
              </span>
              <span className="tool-text">
                <b>{info.name}</b>
                <small>{info.desc}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
