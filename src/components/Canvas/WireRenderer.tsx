import React from 'react';
import type { Wire, CircuitComponent, Point } from '../../types/circuit';
import {
  getAbsolutePinPosition,
  generateOrthogonalPath,
  pointsToSvgPath,
  getWireWaypoints,
} from '../../utils/wireUtils';

interface WireRendererProps {
  wires: Wire[];
  components: CircuitComponent[];
  selectedWireId?: string | null;
  onSelectWire?: (id: string) => void;
  onWireClick?: (wire: Wire, e: React.MouseEvent) => void;
  activeWireStart?: { componentId: string; pinId: string } | null;
  activeWireWaypoints?: Point[];
  activeWireMode?: 'HV' | 'VH' | 'HVH';
  mousePos?: Point;
  onHandleMouseDown?: (wireId: string, handleIndex: number, e: React.MouseEvent) => void;
}

export const WireRenderer: React.FC<WireRendererProps> = ({
  wires,
  components,
  selectedWireId,
  onSelectWire,
  onWireClick,
  activeWireStart,
  activeWireWaypoints = [],
  activeWireMode = 'HV',
  mousePos,
  onHandleMouseDown,
}) => {
  // Mapa de posições para detectar nós de junção (Junction Dots)
  const pointCounts: Record<string, number> = {};

  const renderedWires = wires.map((wire) => {
    const fromComp = components.find((c) => c.id === wire.from.componentId);
    const toComp = components.find((c) => c.id === wire.to.componentId);

    if (!fromComp || !toComp) return null;

    const start = getAbsolutePinPosition(fromComp, wire.from.pinId);
    const end = getAbsolutePinPosition(toComp, wire.to.pinId);

    const waypoints = getWireWaypoints(wire, components);
    const pathD = pointsToSvgPath(waypoints);

    // Registra os pontos inicial e final para cálculo de nós
    [start, end].forEach((p) => {
      const key = `${p.x},${p.y}`;
      pointCounts[key] = (pointCounts[key] || 0) + 1;
    });

    const isSelected = selectedWireId === wire.id;
    const intermediatePoints = waypoints.slice(1, waypoints.length - 1);

    return (
      <g key={wire.id} className="group cursor-pointer">
        {/* Halo invisível para facilitar a seleção ou clique no fio */}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth="14"
          onClick={(e) => {
            e.stopPropagation();
            if (onWireClick) {
              onWireClick(wire, e);
            } else {
              onSelectWire?.(wire.id);
            }
          }}
        />

        {/* Linha do Fio */}
        <path
          d={pathD}
          fill="none"
          stroke={isSelected ? '#4f46e5' : '#0f172a'}
          strokeWidth={isSelected ? '3' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors group-hover:stroke-indigo-600"
          onClick={(e) => {
            e.stopPropagation();
            if (onWireClick) {
              onWireClick(wire, e);
            } else {
              onSelectWire?.(wire.id);
            }
          }}
        />

        {/* Alças de Controle Interativas para Ajuste Manual de Curvas de Fios Selecionados */}
        {isSelected &&
          intermediatePoints.map((pt: Point, idx: number) => (
            <circle
              key={`handle_${wire.id}_${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="5"
              fill="#4f46e5"
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
              onMouseDown={(e) => {
                e.stopPropagation();
                onHandleMouseDown?.(wire.id, idx + 1, e);
              }}
            />
          ))}
      </g>
    );
  });

  // Fio em progresso sendo traçado interativamente pelo usuário
  let activeWirePreview = null;
  if (activeWireStart && mousePos) {
    const fromComp = components.find((c) => c.id === activeWireStart.componentId);
    if (fromComp) {
      const startPinPos = getAbsolutePinPosition(fromComp, activeWireStart.pinId);
      const waypoints = activeWireWaypoints || [];
      const lastPoint = waypoints.length > 0 ? waypoints[waypoints.length - 1] : startPinPos;

      const activeSegment = generateOrthogonalPath(lastPoint, mousePos, activeWireMode);

      const fullWaypoints = [
        startPinPos,
        ...waypoints,
        ...activeSegment.slice(1),
      ];
      const previewPathD = pointsToSvgPath(fullWaypoints);
      const establishedPathD = pointsToSvgPath([startPinPos, ...waypoints]);

      activeWirePreview = (
        <g className="pointer-events-none">
          {/* Trecho do fio já fixado em cliques anteriores */}
          {waypoints.length > 0 && (
            <path
              d={establishedPathD}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Trecho pontilhado móvel acompanhando o cursor */}
          <path
            d={previewPathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />

          {/* Marcadores circulares nos pontos de dobra já consolidados */}
          {waypoints.map((pt, i) => (
            <circle
              key={`wp_preview_${i}`}
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="#4f46e5"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
        </g>
      );
    }
  }

  // Gera os nós de junção (bolinhas pretas nos cruzamentos com 3+ conexões)
  const junctionDots = Object.entries(pointCounts)
    .filter(([_, count]) => count >= 3)
    .map(([key]) => {
      const [x, y] = key.split(',').map(Number);
      return (
        <circle
          key={key}
          cx={x}
          cy={y}
          r="4"
          fill="#0f172a"
          stroke="#ffffff"
          strokeWidth="1.5"
        />
      );
    });

  return (
    <g className="pointer-events-auto">
      {renderedWires}
      {activeWirePreview}
      {junctionDots}
    </g>
  );
};
