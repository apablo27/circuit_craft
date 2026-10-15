import React, { useRef, useState, useEffect } from 'react';
import { useCircuitStore } from '../../store/useCircuitStore';
import { ComponentSymbol } from '../Symbols/ComponentSymbol';
import { WireRenderer } from './WireRenderer';
import {
  snapToGrid,
  getWireWaypoints,
} from '../../utils/wireUtils';
import {
  MousePointer,
  Hand,
  BoxSelect,
  Grid,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { Point } from '../../types/circuit';
import { ComponentFloatingPopover } from '../Inspector/ComponentFloatingPopover';

interface CircuitCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({ svgRef }) => {
  const {
    components,
    wires,
    selectedComponentId,
    selectedComponentIds,
    selectedWireId,
    activeToolMode,
    setToolMode,
    selectComponent,
    selectComponents,
    selectWire,
    updateComponent,
    removeSelected,
    rotateComponent,
    addComponent,
    activeWireStart,
    activeWireWaypoints,
    activeWireMode,
    startWire,
    addWireWaypoint,
    removeLastWireWaypoint,
    completeWire,
    connectWireToPoint,
    toggleWireRoutingMode,
    updateWire,
    cancelWire,
    zoom,
    pan,
    setPan,
    setZoom,
    setMousePos,
    mousePos,
  } = useCircuitStore();

  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragStartCoord, setDragStartCoord] = useState<Point | null>(null);
  const [dragGroupStarts, setDragGroupStarts] = useState<Record<string, Point>>({});

  const [draggingWireHandle, setDraggingWireHandle] = useState<{
    wireId: string;
    handleIndex: number;
  } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [boxSelectStart, setBoxSelectStart] = useState<Point | null>(null);
  const [boxSelectCurrent, setBoxSelectCurrent] = useState<Point | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Escuta Atalhos de Teclado Globais (Esc, Delete, Backspace, V, G, R, Espaço)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      const activeTag = activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeElement?.isContentEditable) {
        return;
      }

      const key = e.key;

      if (key === 'Escape') {
        e.preventDefault();
        if (activeWireStart) {
          if (activeWireWaypoints.length > 0) {
            removeLastWireWaypoint();
          } else {
            cancelWire();
          }
        } else {
          selectComponent(null);
          selectWire(null);
          setBoxSelectStart(null);
          setBoxSelectCurrent(null);
          setIsPanning(false);
          setDraggingCompId(null);
        }
      } else if (key === ' ' || key === 'Spacebar' || key === 'Tab') {
        // Espaço ou Tab -> Alterna a direção da curva no segmento ativo do fio
        if (activeWireStart || selectedWireId) {
          e.preventDefault();
          toggleWireRoutingMode();
        }
      } else if (key === 'Delete' || key === 'Backspace') {
        e.preventDefault();
        if (activeWireStart) {
          removeLastWireWaypoint();
        } else {
          removeSelected();
        }
      } else if (key === 'v' || key === 'V') {
        e.preventDefault();
        const posX = mousePos.x || 300;
        const posY = mousePos.y || 200;
        addComponent('SOURCE_DC', posX, posY);
      } else if (key === 'g' || key === 'G') {
        e.preventDefault();
        const posX = mousePos.x || 300;
        const posY = mousePos.y || 200;
        addComponent('GND', posX, posY);
      } else if (key === 'r' || key === 'R') {
        if (e.ctrlKey || e.metaKey) {
          if (selectedComponentId) {
            e.preventDefault();
            rotateComponent(selectedComponentId);
          }
        } else {
          e.preventDefault();
          const posX = mousePos.x || 300;
          const posY = mousePos.y || 200;
          addComponent('RESISTOR', posX, posY);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedComponentId,
    selectedWireId,
    activeWireStart,
    activeWireWaypoints,
    mousePos,
    removeSelected,
    rotateComponent,
    addComponent,
    toggleWireRoutingMode,
    cancelWire,
    removeLastWireWaypoint,
    selectComponent,
    selectWire,
  ]);

  // Converte coordenadas da tela para o sistema de coordenadas do SVG Canvas
  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;
    return {
      x: snapToGrid(rawX),
      y: snapToGrid(rawY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
    const isCanvasBg = targetTag === 'svg' || targetTag === 'rect';
    const coords = getCanvasCoords(e);

    // Se estiver traçando um fio e clicar no fundo do canvas, adiciona uma curva (waypoint)
    if (activeWireStart && isCanvasBg && e.button === 0) {
      addWireWaypoint(coords);
      return;
    }

    if (isCanvasBg || activeToolMode === 'pan' || activeToolMode === 'box_select') {
      if (activeToolMode === 'box_select') {
        setBoxSelectStart(coords);
        setBoxSelectCurrent(coords);
      } else if (activeToolMode === 'pan') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else {
        if (!e.ctrlKey && !e.metaKey) {
          selectComponent(null);
          selectWire(null);
          if (!activeWireStart) cancelWire();
        }

        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }

    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    setMousePos(coords);

    if (boxSelectStart) {
      setBoxSelectCurrent(coords);
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingWireHandle) {
      const wire = wires.find((w) => w.id === draggingWireHandle.wireId);
      if (wire) {
        const waypoints = getWireWaypoints(wire, components);
        const innerWaypoints = waypoints.slice(1, waypoints.length - 1);
        const idx = draggingWireHandle.handleIndex - 1;
        if (idx >= 0 && idx < innerWaypoints.length) {
          innerWaypoints[idx] = coords;
          updateWire(wire.id, { waypoints: innerWaypoints });
        }
      }
      return;
    }

    if (draggingCompId && dragStartCoord && dragGroupStarts) {
      const dx = coords.x - dragStartCoord.x;
      const dy = coords.y - dragStartCoord.y;

      Object.entries(dragGroupStarts).forEach(([id, startPos]) => {
        updateComponent(id, {
          x: snapToGrid(startPos.x + dx),
          y: snapToGrid(startPos.y + dy),
        });
      });
    }
  };

  const handleMouseUp = () => {
    if (boxSelectStart && boxSelectCurrent) {
      const minX = Math.min(boxSelectStart.x, boxSelectCurrent.x);
      const maxX = Math.max(boxSelectStart.x, boxSelectCurrent.x);
      const minY = Math.min(boxSelectStart.y, boxSelectCurrent.y);
      const maxY = Math.max(boxSelectStart.y, boxSelectCurrent.y);

      const foundIds = components
        .filter((c) => c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY)
        .map((c) => c.id);

      if (foundIds.length > 0) {
        selectComponents(foundIds);
      }
    }

    setBoxSelectStart(null);
    setBoxSelectCurrent(null);
    setDraggingCompId(null);
    setDraggingWireHandle(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((z) => Math.min(2.5, Math.max(0.4, z * zoomFactor)));
  };

  const handleCompMouseDown = (compId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiKey = e.ctrlKey || e.metaKey;

    if (isMultiKey) {
      selectComponent(compId, true);
    } else {
      if (!selectedComponentIds.includes(compId)) {
        selectComponent(compId, false);
      }
    }

    setDraggingCompId(compId);
    const coords = getCanvasCoords(e);
    setDragStartCoord(coords);

    const activeGroupIds = isMultiKey
      ? (selectedComponentIds.includes(compId) ? selectedComponentIds : [...selectedComponentIds, compId])
      : (selectedComponentIds.includes(compId) ? selectedComponentIds : [compId]);

    const initialPositions: Record<string, Point> = {};
    components.forEach((c) => {
      if (activeGroupIds.includes(c.id)) {
        initialPositions[c.id] = { x: c.x, y: c.y };
      }
    });

    setDragGroupStarts(initialPositions);
  };

  const handlePinClick = (compId: string, pinId: string) => {
    if (activeWireStart) {
      completeWire(compId, pinId);
    } else {
      startWire(compId, pinId);
    }
  };

  const handleWireClick = (wire: { id: string }, e: React.MouseEvent) => {
    if (activeWireStart) {
      const coords = getCanvasCoords(e);
      connectWireToPoint(coords);
    } else {
      selectWire(wire.id);
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`flex-1 bg-white overflow-hidden relative select-none ${
        isPanning
          ? 'cursor-grabbing'
          : activeToolMode === 'pan'
          ? 'cursor-grab'
          : activeToolMode === 'box_select'
          ? 'cursor-crosshair'
          : activeWireStart
          ? 'cursor-crosshair'
          : 'cursor-default'
      }`}
    >
      {/* Dock Flutuante Central de Ferramentas (Estilo CAD / Linear) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-lg border border-slate-200/90 flex items-center gap-1 select-none">
        <button
          type="button"
          onClick={() => setToolMode('select')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeToolMode === 'select'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Selecionar / Mover (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setToolMode('pan')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeToolMode === 'pan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Mover Tela (H / Espaço)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setToolMode('box_select')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activeToolMode === 'box_select'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Seleção por Área"
        >
          <BoxSelect className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        <button
          type="button"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-700 bg-blue-50 border border-blue-200"
          title="Grade Técnica Pontilhada Ativa"
        >
          <Grid className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Zoom +"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono px-1 text-slate-600 font-semibold min-w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Zoom -"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover Flutuante de Atributos (Estilo Tinkercad) */}
      <ComponentFloatingPopover />

      {/* Dica Flutuante para Traçado Interativo de Curvas de Fios */}
      {activeWireStart && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-3 z-30 select-none animate-fade-in">
          <div className="flex items-center gap-1.5 font-bold text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Traçando Fio ({activeWireWaypoints.length} curva{activeWireWaypoints.length !== 1 ? 's' : ''})</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <span className="text-slate-300 text-[11px]">
            Clique no canvas para <strong className="text-white">fixar curva</strong> • Clique num pino para <strong className="text-emerald-400">finalizar</strong> • <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded font-mono text-[10px] text-blue-300">Espaço</kbd> muda curva • <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] text-blue-300">Esc / Backspace</kbd> desfaz
          </span>
        </div>
      )}

      {/* Canvas SVG Interativo */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full block bg-white"
          onContextMenu={(e) => e.preventDefault()}
        >
          <defs>
            {/* Grade Pontilhada Menor */}
            <pattern
              id="grid-dots-sm"
              width={20 * zoom}
              height={20 * zoom}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${pan.x}, ${pan.y})`}
            >
              <circle
                cx={10 * zoom}
                cy={10 * zoom}
                r={1.0 * Math.max(0.7, zoom)}
                fill="#94a3b8"
                opacity="0.5"
              />
            </pattern>
            {/* Grade Maior com nós de referência destacados */}
            <pattern
              id="grid-dots-major"
              width={100 * zoom}
              height={100 * zoom}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${pan.x}, ${pan.y})`}
            >
              <rect width={100 * zoom} height={100 * zoom} fill="url(#grid-dots-sm)" />
              <circle
                cx={50 * zoom}
                cy={50 * zoom}
                r={1.6 * Math.max(0.7, zoom)}
                fill="#3b82f6"
                opacity="0.4"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid-dots-major)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <WireRenderer
              wires={wires}
              components={components}
              selectedWireId={selectedWireId ?? undefined}
              onSelectWire={selectWire}
              onWireClick={handleWireClick}
              activeWireStart={activeWireStart}
              activeWireWaypoints={activeWireWaypoints}
              activeWireMode={activeWireMode}
              mousePos={mousePos}
              onHandleMouseDown={(wireId, handleIdx) =>
                setDraggingWireHandle({ wireId, handleIndex: handleIdx })
              }
            />

            {components.map((comp) => (
              <g
                key={comp.id}
                onMouseDown={(e) => handleCompMouseDown(comp.id, e)}
              >
                <ComponentSymbol
                  component={comp}
                  isSelected={selectedComponentIds.includes(comp.id)}
                  onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  activePinId={
                    activeWireStart?.componentId === comp.id
                      ? activeWireStart.pinId
                      : null
                  }
                />
              </g>
            ))}

            {boxSelectStart && boxSelectCurrent && (
              <rect
                x={Math.min(boxSelectStart.x, boxSelectCurrent.x)}
                y={Math.min(boxSelectStart.y, boxSelectCurrent.y)}
                width={Math.abs(boxSelectCurrent.x - boxSelectStart.x)}
                height={Math.abs(boxSelectCurrent.y - boxSelectStart.y)}
                fill="rgba(37, 99, 235, 0.08)"
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="pointer-events-none"
              />
            )}
          </g>
        </svg>

        {/* Dica de Roteamento no rodapé esquerdo */}
        <div className="absolute bottom-3 left-4 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs px-3 py-1.5 rounded-lg text-xs text-slate-600 flex items-center gap-2 pointer-events-none select-none">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>
            <strong className="text-slate-900 font-semibold">Dica de Roteamento:</strong> Clique nos pinos para traçar fios em 90°. Pressione <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-700">Espaço</kbd> para alternar curva.
          </span>
        </div>
      </div>

      {/* Barra de Rodapé de Telemetria Técnica de Engenharia */}
      <div className="h-7 px-4 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500 z-20 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>X: {Math.round(mousePos.x)}px  Y: {Math.round(mousePos.y)}px</span>
          <span className="text-slate-300">|</span>
          <span>Snap: 20px (0.1")</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-medium">
            Malha: {wires.length > 0 ? 'Conectada (0 loops abertos)' : 'Aguardando condutores'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <span>Atalho: [W] Inserir Fio • [R] Girar • [Espaço] Pan • [Del] Excluir</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-medium">CircuitCraft Engine v2.4</span>
        </div>
      </div>
    </div>
  );
};
