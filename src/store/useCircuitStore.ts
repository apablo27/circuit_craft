import { create } from 'zustand';
import type { CircuitComponent, ComponentType, Wire, Point } from '../types/circuit';
import { COMPONENT_DEFINITIONS } from '../utils/componentDefinitions';
import { snapToGrid } from '../utils/wireUtils';

interface CircuitState {
  components: CircuitComponent[];
  wires: Wire[];
  selectedComponentId: string | null;
  selectedComponentIds: string[];
  selectedWireId: string | null;
  activeToolMode: 'select' | 'pan' | 'box_select';
  zoom: number;
  pan: Point;
  activeWireStart: { componentId: string; pinId: string } | null;
  activeWireWaypoints: Point[];
  mousePos: Point;

  // Histórico Undo/Redo
  history: { components: CircuitComponent[]; wires: Wire[] }[];
  historyIndex: number;

  // Ações de Componentes
  addComponent: (type: ComponentType, x: number, y: number) => void;
  updateComponent: (id: string, partial: Partial<CircuitComponent>) => void;
  removeComponent: (id: string) => void;
  removeSelected: () => void;
  rotateComponent: (id: string) => void;
  mirrorComponent: (id: string) => void;
  selectComponent: (id: string | null, isMulti?: boolean) => void;
  selectComponents: (ids: string[]) => void;
  moveComponents: (ids: string[], dx: number, dy: number) => void;
  setToolMode: (mode: 'select' | 'pan' | 'box_select') => void;

  // Ações de Fios (Wires)
  activeWireMode: 'HV' | 'VH' | 'HVH';
  toggleActiveWireMode: () => void;
  startWire: (componentId: string, pinId: string) => void;
  addWireWaypoint: (point: Point) => void;
  removeLastWireWaypoint: () => void;
  completeWire: (componentId: string, pinId: string) => void;
  connectWireToPoint: (point: Point) => void;
  cancelWire: () => void;
  removeWire: (id: string) => void;
  updateWire: (id: string, partial: Partial<Wire>) => void;
  toggleWireRoutingMode: (id?: string) => void;
  selectWire: (id: string | null) => void;

  // Canvas UI
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (pan: Point | ((prev: Point) => Point)) => void;
  setMousePos: (pos: Point) => void;
  clearCanvas: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Projeto JSON
  loadProject: (jsonString: string) => void;
  getProjectJson: () => string;

  // Circuitos Prontos / Presets
  addPresetModule: (newComponents: CircuitComponent[], newWires: Wire[], clearCanvasFirst?: boolean) => void;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  components: [
    // Circuito inicial de demonstração Didático
    {
      id: 'r1',
      type: 'RESISTOR',
      label: 'R1',
      value: '10kΩ',
      x: 200,
      y: 200,
      rotation: 0,
    },
    {
      id: 'd1',
      type: 'LED',
      label: 'LED1',
      value: 'Vermelho',
      x: 360,
      y: 200,
      rotation: 0,
      color: '#dc2626',
    },
    {
      id: 'gnd1',
      type: 'GND',
      label: 'GND',
      value: '0V',
      x: 440,
      y: 200,
      rotation: 0,
    },
    {
      id: 'vcc1',
      type: 'VCC',
      label: 'VCC',
      value: '+5V',
      x: 120,
      y: 200,
      rotation: 0,
    },
  ],
  wires: [
    {
      id: 'w1',
      from: { componentId: 'vcc1', pinId: 'p1' },
      to: { componentId: 'r1', pinId: 'p1' },
    },
    {
      id: 'w2',
      from: { componentId: 'r1', pinId: 'p2' },
      to: { componentId: 'd1', pinId: 'anode' },
    },
    {
      id: 'w3',
      from: { componentId: 'd1', pinId: 'cathode' },
      to: { componentId: 'gnd1', pinId: 'p1' },
    },
  ],
  selectedComponentId: null,
  selectedComponentIds: [],
  selectedWireId: null,
  activeToolMode: 'select',
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  activeWireStart: null,
  activeWireWaypoints: [],
  mousePos: { x: 0, y: 0 },

  history: [],
  historyIndex: -1,

  setToolMode: (mode) => {
    set({ activeToolMode: mode });
  },

  pushHistory: () => {
    const { components, wires, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    });
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  addComponent: (type, x, y) => {
    const { components, pushHistory } = get();
    pushHistory();

    const def = COMPONENT_DEFINITIONS[type];
    const count = components.filter((c) => c.type === type).length + 1;
    const label = `${def.defaultLabel.replace(/\d+$/, '')}${count}`;

    const newComponent: CircuitComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      label,
      value: def.defaultValue,
      x: snapToGrid(x),
      y: snapToGrid(y),
      rotation: 0,
    };

    set({
      components: [...components, newComponent],
      selectedComponentId: newComponent.id,
      selectedComponentIds: [newComponent.id],
      selectedWireId: null,
    });
  },

  updateComponent: (id, partial) => {
    const { components, pushHistory } = get();
    pushHistory();
    set({
      components: components.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    });
  },

  removeComponent: (id) => {
    const { components, wires, pushHistory } = get();
    pushHistory();
    set({
      components: components.filter((c) => c.id !== id),
      wires: wires.filter(
        (w) => w.from.componentId !== id && w.to.componentId !== id
      ),
      selectedComponentId: null,
      selectedComponentIds: [],
    });
  },

  removeSelected: () => {
    const { components, wires, selectedComponentIds, selectedComponentId, selectedWireId, pushHistory } = get();
    const targets = new Set(
      selectedComponentIds.length > 0
        ? selectedComponentIds
        : selectedComponentId
        ? [selectedComponentId]
        : []
    );

    if (targets.size === 0 && !selectedWireId) return;

    pushHistory();

    set({
      components: components.filter((c) => !targets.has(c.id)),
      wires: wires.filter(
        (w) =>
          !targets.has(w.from.componentId) &&
          !targets.has(w.to.componentId) &&
          w.id !== selectedWireId
      ),
      selectedComponentId: null,
      selectedComponentIds: [],
      selectedWireId: null,
    });
  },

  rotateComponent: (id) => {
    const { components, pushHistory } = get();
    pushHistory();
    set({
      components: components.map((c) =>
        c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
      ),
    });
  },

  mirrorComponent: (id) => {
    const { components, pushHistory } = get();
    pushHistory();
    set({
      components: components.map((c) =>
        c.id === id ? { ...c, mirrored: !c.mirrored } : c
      ),
    });
  },

  selectComponent: (id, isMulti = false) => {
    const { selectedComponentIds } = get();

    if (id === null) {
      set({ selectedComponentId: null, selectedComponentIds: [], selectedWireId: null });
      return;
    }

    if (isMulti) {
      let newIds: string[];
      if (selectedComponentIds.includes(id)) {
        newIds = selectedComponentIds.filter((item) => item !== id);
      } else {
        newIds = [...selectedComponentIds, id];
      }
      set({
        selectedComponentIds: newIds,
        selectedComponentId: newIds[0] || null,
        selectedWireId: null,
      });
    } else {
      set({
        selectedComponentId: id,
        selectedComponentIds: [id],
        selectedWireId: null,
      });
    }
  },

  selectComponents: (ids) => {
    set({
      selectedComponentIds: ids,
      selectedComponentId: ids[0] || null,
      selectedWireId: null,
    });
  },

  moveComponents: (ids, dx, dy) => {
    const { components } = get();
    const idSet = new Set(ids);
    set({
      components: components.map((c) =>
        idSet.has(c.id)
          ? {
              ...c,
              x: snapToGrid(c.x + dx),
              y: snapToGrid(c.y + dy),
            }
          : c
      ),
    });
  },

  activeWireMode: 'HV',

  toggleActiveWireMode: () => {
    const modes: ('HV' | 'VH' | 'HVH')[] = ['HV', 'VH', 'HVH'];
    const current = get().activeWireMode;
    const nextMode = modes[(modes.indexOf(current) + 1) % modes.length];
    set({ activeWireMode: nextMode });
  },

  startWire: (componentId, pinId) => {
    set({ activeWireStart: { componentId, pinId }, activeWireWaypoints: [] });
  },

  addWireWaypoint: (point) => {
    const { activeWireWaypoints } = get();
    const snapped = { x: snapToGrid(point.x), y: snapToGrid(point.y) };
    if (activeWireWaypoints.length > 0) {
      const last = activeWireWaypoints[activeWireWaypoints.length - 1];
      if (last.x === snapped.x && last.y === snapped.y) return;
    }
    set({ activeWireWaypoints: [...activeWireWaypoints, snapped] });
  },

  removeLastWireWaypoint: () => {
    const { activeWireWaypoints } = get();
    if (activeWireWaypoints.length === 0) {
      set({ activeWireStart: null, activeWireWaypoints: [] });
    } else {
      set({ activeWireWaypoints: activeWireWaypoints.slice(0, activeWireWaypoints.length - 1) });
    }
  },

  completeWire: (componentId, pinId) => {
    const { activeWireStart, activeWireWaypoints, activeWireMode, wires, pushHistory } = get();
    if (!activeWireStart) return;

    // Evita conectar o mesmo pino a si mesmo (se nenhum waypoint foi criado)
    if (
      activeWireStart.componentId === componentId &&
      activeWireStart.pinId === pinId &&
      activeWireWaypoints.length === 0
    ) {
      set({ activeWireStart: null, activeWireWaypoints: [] });
      return;
    }

    pushHistory();

    const newWire: Wire = {
      id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      from: activeWireStart,
      to: { componentId, pinId },
      routingMode: activeWireMode,
      waypoints: activeWireWaypoints.length > 0 ? [...activeWireWaypoints] : undefined,
    };

    set({
      wires: [...wires, newWire],
      activeWireStart: null,
      activeWireWaypoints: [],
    });
  },

  connectWireToPoint: (point) => {
    const { activeWireStart, activeWireWaypoints, activeWireMode, components, wires, pushHistory } = get();
    if (!activeWireStart) return;

    pushHistory();

    // Criar componente de nó de junção na posição do clique
    const junctionComp: CircuitComponent = {
      id: `comp_junc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'JUNCTION',
      label: '',
      value: '',
      x: snapToGrid(point.x),
      y: snapToGrid(point.y),
      rotation: 0,
    };

    const newWire: Wire = {
      id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      from: activeWireStart,
      to: { componentId: junctionComp.id, pinId: 'p1' },
      routingMode: activeWireMode,
      waypoints: activeWireWaypoints.length > 0 ? [...activeWireWaypoints] : undefined,
    };

    set({
      components: [...components, junctionComp],
      wires: [...wires, newWire],
      activeWireStart: null,
      activeWireWaypoints: [],
    });
  },

  cancelWire: () => {
    set({ activeWireStart: null, activeWireWaypoints: [] });
  },

  removeWire: (id) => {
    const { wires, pushHistory } = get();
    pushHistory();
    set({
      wires: wires.filter((w) => w.id !== id),
      selectedWireId: null,
    });
  },

  updateWire: (id, partial) => {
    const { wires, pushHistory } = get();
    pushHistory();
    set({
      wires: wires.map((w) => (w.id === id ? { ...w, ...partial } : w)),
    });
  },

  toggleWireRoutingMode: (wireId) => {
    const { selectedWireId, activeWireStart, wires, toggleActiveWireMode, updateWire } = get();
    const id = wireId || selectedWireId;

    if (activeWireStart || !id) {
      toggleActiveWireMode();
      return;
    }

    const wire = wires.find((w) => w.id === id);
    if (!wire) return;

    const modes: ('HV' | 'VH' | 'HVH')[] = ['HV', 'VH', 'HVH'];
    const current = wire.routingMode || 'HV';
    const nextMode = modes[(modes.indexOf(current) + 1) % modes.length];

    updateWire(id, { routingMode: nextMode, waypoints: undefined });
  },

  selectWire: (id) => {
    set({ selectedWireId: id, selectedComponentId: null });
  },

  setZoom: (zoomOrFn) => {
    set((state) => ({
      zoom: typeof zoomOrFn === 'function' ? zoomOrFn(state.zoom) : zoomOrFn,
    }));
  },

  setPan: (panOrFn) => {
    set((state) => ({
      pan: typeof panOrFn === 'function' ? panOrFn(state.pan) : panOrFn,
    }));
  },

  setMousePos: (mousePos) => {
    set({ mousePos });
  },

  clearCanvas: () => {
    const { pushHistory } = get();
    pushHistory();
    set({
      components: [],
      wires: [],
      selectedComponentId: null,
      selectedWireId: null,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= 0) {
      const state = history[historyIndex];
      set({
        components: JSON.parse(JSON.stringify(state.components)),
        wires: JSON.parse(JSON.stringify(state.wires)),
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      set({
        components: JSON.parse(JSON.stringify(state.components)),
        wires: JSON.parse(JSON.stringify(state.wires)),
        historyIndex: nextIndex,
      });
    }
  },

  loadProject: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.components && data.wires) {
        set({
          components: data.components,
          wires: data.wires,
          selectedComponentId: null,
          selectedWireId: null,
        });
      }
    } catch (e) {
      console.error('Erro ao carregar projeto JSON:', e);
    }
  },

  getProjectJson: () => {
    const { components, wires } = get();
    return JSON.stringify(
      {
        version: '1.0',
        app: 'CircuitCraft Web',
        exportedAt: new Date().toISOString(),
        components,
        wires,
      },
      null,
      2
    );
  },

  addPresetModule: (newComponents, newWires, clearCanvasFirst = false) => {
    const { pushHistory, components, wires } = get();
    pushHistory();
    if (clearCanvasFirst) {
      set({
        components: newComponents,
        wires: newWires,
        selectedComponentId: null,
        selectedComponentIds: newComponents.map((c) => c.id),
        selectedWireId: null,
      });
    } else {
      set({
        components: [...components, ...newComponents],
        wires: [...wires, ...newWires],
        selectedComponentId: null,
        selectedComponentIds: newComponents.map((c) => c.id),
        selectedWireId: null,
      });
    }
  },
}));
