import type { CircuitComponent, Point, Wire } from '../types/circuit';
import { COMPONENT_DEFINITIONS } from './componentDefinitions';

export const GRID_SIZE = 20;

export function snapToGrid(value: number, step: number = GRID_SIZE): number {
  return Math.round(value / step) * step;
}

/**
 * Calcula a posição absoluta de um pino levando em consideração a posição e rotação do componente.
 */
export function getAbsolutePinPosition(
  component: CircuitComponent,
  pinId: string
): Point {
  const def = COMPONENT_DEFINITIONS[component.type];
  if (!def) return { x: component.x, y: component.y };

  const pin = def.pins.find((p) => p.id === pinId);
  if (!pin) return { x: component.x, y: component.y };

  const rad = (component.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  let rx = pin.relX;
  let ry = pin.relY;

  if (component.mirrored) {
    rx = -rx;
  }

  // Rotaciona vetor relativo
  const absRelX = Math.round(rx * cos - ry * sin);
  const absRelY = Math.round(rx * sin + ry * cos);

  return {
    x: component.x + absRelX,
    y: component.y + absRelY,
  };
}

/**
 * Gera os pontos (waypoints) ortogonais em 90 graus ligando dois pontos.
 * Suporta modo 'HV' (Horizontal primeiro - padrão), 'VH' (Vertical primeiro) e 'HVH' (Dupla curva / MidX).
 */
export function generateOrthogonalPath(
  start: Point,
  end: Point,
  mode: 'HV' | 'VH' | 'HVH' = 'HV',
  customWaypoints?: Point[]
): Point[] {
  if (customWaypoints && customWaypoints.length > 0) {
    return [start, ...customWaypoints, end];
  }

  if (start.x === end.x || start.y === end.y) {
    return [start, end];
  }

  if (mode === 'HV') {
    return [start, { x: end.x, y: start.y }, end];
  }

  if (mode === 'VH') {
    return [start, { x: start.x, y: end.y }, end];
  }

  // HVH (MidX - Roteamento com 2 curvas)
  const midX = snapToGrid((start.x + end.x) / 2);
  return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
}

export function getWireWaypoints(wire: Wire, components: CircuitComponent[]): Point[] {
  const fromComp = components.find((c) => c.id === wire.from.componentId);
  const toComp = components.find((c) => c.id === wire.to.componentId);
  if (!fromComp || !toComp) return [];
  const start = getAbsolutePinPosition(fromComp, wire.from.pinId);
  const end = getAbsolutePinPosition(toComp, wire.to.pinId);
  return generateOrthogonalPath(start, end, wire.routingMode || 'HV', wire.waypoints);
}

/**
 * Converte um array de pontos em uma string SVG path "M x y L x y..."
 */
export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
}
