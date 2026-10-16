import { MouseEvent, useRef, useState } from 'react';

export function useDragPan() {
  const [cam, setCam] = useState({ x: 0, y: 0 });
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    camX: 0,
    camY: 0,
  });

  function onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y };
  }

  function onMouseMove(e: MouseEvent) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) setCam({ x: d.camX + dx, y: d.camY + dy });
  }

  function onMouseUp() {
    drag.current.active = false;
  }

  function wasDragged() {
    return drag.current.moved;
  }

  return {
    cam,
    panHandlers: { onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp },
    wasDragged,
  };
}

export type PanHandlers = ReturnType<typeof useDragPan>['panHandlers'];
