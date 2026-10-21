import type { CircuitComponent, Wire } from '../types/circuit';
import { COMPONENT_DEFINITIONS } from './componentDefinitions';
import { getAbsolutePinPosition, snapToGrid, getWireWaypoints } from './wireUtils';
import { useCircuitStore } from '../store/useCircuitStore';

function getLatexFontSize(size: number): string {
  if (size <= 9) return '\\tiny';
  if (size <= 11) return '\\footnotesize';
  if (size <= 13) return '\\small';
  if (size <= 15) return '\\normalsize';
  return '\\large';
}

/**
 * Formata valores para sintaxe matemática válida no LaTeX CircuiTikZ.
 * Substitui Ω por \Omega, µ por \mu e envolve palavras textuais em \text{...}.
 */
function formatValueForLatex(val: string): string {
  if (!val) return '';
  const trimmed = val.trim();

  let formatted = trimmed
    .replace(/Ω/g, '\\Omega ')
    .replace(/µ/g, '\\mu ')
    .replace(/([0-9])u([FfHh])/g, '$1\\mu $2')
    .replace(/≈/g, '\\approx ');

  // Se o valor contiver unidades como \muF, corrige para \mu \text{F}
  formatted = formatted.replace(/\\mu\s*([A-Za-z]+)/g, '\\mu \\text{$1}');

  if (/^[A-Za-zÀ-ÿ\s]+$/.test(trimmed)) {
    return `\\text{${trimmed}}`;
  }

  return formatted;
}

/**
 * Converte a estrutura de componentes e fios do circuito em um código LaTeX CircuiTikZ válido.
 */
export function exportToCircuitikz(
  components: CircuitComponent[],
  wires: Wire[],
  options?: { labelFontSize?: number; valueFontSize?: number }
): string {
  if (components.length === 0) {
    return `% Circuito Vazio\n\\begin{circuitikz}[american]\n\\end{circuitikz}`;
  }

  // Mapeia os IDs internos de componente (ex: comp_178528...) para identificadores TikZ legíveis (ex: FFJK1, FFD1, R1, C1)
  const compTikzIdMap = new Map<string, string>();
  const usedTikzIds = new Set<string>();

  components.forEach((c) => {
    let clean = (c.label || c.type)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

    if (!clean) clean = 'Comp';

    let finalId = clean;
    let counter = 1;
    while (usedTikzIds.has(finalId)) {
      finalId = `${clean}_${counter++}`;
    }

    usedTikzIds.add(finalId);
    compTikzIdMap.set(c.id, finalId);
  });

  const getTikzId = (id?: string): string => {
    if (!id) return '';
    return compTikzIdMap.get(id) || id;
  };

  let minX = Infinity;
  let minY = Infinity;

  components.forEach((c) => {
    if (c.x < minX) minX = c.x;
    if (c.y < minY) minY = c.y;
  });

  const scale = 0.025; // 40px = 1.0cm no TikZ
  const toTikZ = (x: number, y: number) => {
    const tx = ((x - minX) * scale).toFixed(2);
    const ty = (-(y - minY) * scale).toFixed(2); // Inverte eixo Y no TikZ
    return `${tx},${ty}`;
  };

    const storeState = typeof useCircuitStore !== 'undefined' ? useCircuitStore.getState?.() : undefined;
  const labelSize = options?.labelFontSize ?? storeState?.labelFontSize ?? 12;
  const valueSize = options?.valueFontSize ?? storeState?.valueFontSize ?? 11;
  const labelFont = getLatexFontSize(labelSize);
  const valueFont = getLatexFontSize(valueSize);

  const getOffsetShift = (offset?: { x: number; y: number }): string => {
    if (!offset || (offset.x === 0 && offset.y === 0)) return '';
    const xcm = (offset.x * scale).toFixed(2);
    const ycm = (-offset.y * scale).toFixed(2);
    return `, xshift=${xcm}cm, yshift=${ycm}cm`;
  };

  const resolveCompPinAnchor = (comp: CircuitComponent, pinId: string, pt: { x: number; y: number }): string => {
    const nodeName = getTikzId(comp.id);
    if (comp.type === 'BJT_NPN' || comp.type === 'BJT_PNP') {
      const bjtMap: Record<string, string> = { base: 'B', collector: 'C', emitter: 'E' };
      const anchor = bjtMap[pinId];
      if (anchor) return `(${nodeName}.${anchor})`;
    } else if (comp.type === 'MOSFET_N' || comp.type === 'MOSFET_P') {
      const mosMap: Record<string, string> = { gate: 'G', drain: 'D', source: 'S' };
      const anchor = mosMap[pinId];
      if (anchor) return `(${nodeName}.${anchor})`;
    } else if (comp.type === 'TRANSFORMER') {
      const transMap: Record<string, string> = { p1_in: 'A1', p2_in: 'A2', sec1_out: 'B1', sec2_out: 'B2' };
      const anchor = transMap[pinId];
      if (anchor) return `(${nodeName}.${anchor})`;
    } else if (comp.type === 'OPAMP') {
      const opMap: Record<string, string> = { in_minus: '-', in_plus: '+', out: 'out', v_plus: 'up', v_minus: 'down' };
      const anchor = opMap[pinId];
      if (anchor) return `(${nodeName}.${anchor})`;
    } else if (comp.type.startsWith('GATE_')) {
      const gateMap: Record<string, string> = { in_a: 'in 1', in_b: 'in 2', in_c: 'in 3', out: 'out' };
      const anchor = gateMap[pinId];
      if (anchor) return `(${nodeName}.${anchor})`;
    } else if (comp.type.startsWith('FF_')) {
      if (pinId === 'pre') return `(${nodeName}.north)`;
      if (pinId === 'clr') return `(${nodeName}.south)`;
      if (pinId === 'q') return `([yshift=0.50cm]${nodeName}.center -| ${nodeName}.east)`;
      if (pinId === 'q_bar') return `([yshift=-0.50cm]${nodeName}.center -| ${nodeName}.east)`;
      if (pinId === 'clk') {
        if (comp.type.includes('JK') || comp.type.includes('SR')) return `(${nodeName}.west)`;
        return `([yshift=-0.50cm]${nodeName}.center -| ${nodeName}.west)`;
      }
      if (pinId === 'd' || pinId === 't') return `([yshift=0.50cm]${nodeName}.center -| ${nodeName}.west)`;
      if (pinId === 'j' || pinId === 's') return `([yshift=0.50cm]${nodeName}.center -| ${nodeName}.west)`;
      if (pinId === 'k' || pinId === 'r') return `([yshift=-0.50cm]${nodeName}.center -| ${nodeName}.west)`;
      return `(${nodeName})`;
    } else if (comp.type === 'CLOCK' || comp.type === 'LOGIC_INPUT') {
      const rotMap: Record<number, string> = { 0: 'east', 90: 'south', 180: 'west', 270: 'north' };
      const anchor = rotMap[((comp.rotation % 360) + 360) % 360] || 'east';
      return `(${nodeName}.${anchor})`;
    } else if (comp.type === 'PROBE') {
      const rotMap: Record<number, string> = { 0: 'west', 90: 'south', 180: 'east', 270: 'north' };
      const anchor = rotMap[((comp.rotation % 360) + 360) % 360] || 'south';
      return `(${nodeName}.${anchor})`;
    } else if (comp.type === 'PIN_TERMINAL') {
      return `(${nodeName})`;
    } else if (comp.type === 'GND') {
      return `(${toTikZ(pt.x, pt.y)}) node[ground]{}`;
    } else if (comp.type === 'VCC') {
      const valFormatted = formatValueForLatex(comp.value || '+V_{CC}');
      return `(${toTikZ(pt.x, pt.y)}) node[vcc]{$${valFormatted}$}`;
    }
    return `(${toTikZ(pt.x, pt.y)})`;
  };

  const lines: string[] = [];
  lines.push('% =============================================');
  lines.push('% Gerado automaticamente por CircuitCraft Web');
  lines.push('% Requer no cabeçalho: \\usepackage[american]{circuitikz}');
  lines.push('% =============================================');
  lines.push('\\begin{circuitikz}[american, scale=0.9]');

  const getRotOpt = (rot?: number): string => {
    if (!rot) return '';
    const r = ((rot % 360) + 360) % 360;
    if (r === 0) return '';
    const tikzAngle = (360 - r) % 360;
    return `, rotate=${tikzAngle}`;
  };

  // 1. Declarar componentes multimáticos/semicondutores (Transistores, CI, Transformadores, etc.)
  components.forEach((c) => {
    const pos = toTikZ(c.x, c.y);
    const cId = getTikzId(c.id);
    const rotOpt = getRotOpt(c.rotation);

    switch (c.type) {
      case 'BJT_NPN':
        lines.push(`  \\draw (${pos}) node[npn${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'BJT_PNP':
        lines.push(`  \\draw (${pos}) node[pnp${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'MOSFET_N':
        lines.push(`  \\draw (${pos}) node[nmos${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'MOSFET_P':
        lines.push(`  \\draw (${pos}) node[pmos${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'OPAMP':
        lines.push(`  \\draw (${pos}) node[op amp${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_NOT':
        lines.push(`  \\draw (${pos}) node[not port${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_AND':
        lines.push(`  \\draw (${pos}) node[and port${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_AND3':
        lines.push(`  \\draw (${pos}) node[and port, number inputs=3${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_NAND':
        lines.push(`  \\draw (${pos}) node[nand port${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_NAND3':
        lines.push(`  \\draw (${pos}) node[nand port, number inputs=3${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_OR':
        lines.push(`  \\draw (${pos}) node[or port${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_OR3':
        lines.push(`  \\draw (${pos}) node[or port, number inputs=3${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_NOR':
        lines.push(`  \\draw (${pos}) node[nor port${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_NOR3':
        lines.push(`  \\draw (${pos}) node[nor port, number inputs=3${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_XOR':
        lines.push(`  \\draw (${pos}) node[xor port${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'GATE_XNOR':
        lines.push(`  \\draw (${pos}) node[xnor port${rotOpt}] (${cId}) {${c.label}};`);
        break;
      case 'CLOCK': {
        const valStr = c.value ? formatValueForLatex(c.value) : '1kHz';
        lines.push(`  \\draw (${pos}) node[draw, rectangle, rounded corners=2pt, minimum size=0.8cm${rotOpt}] (${cId}) {$\\sqcap\\!\\sqcup$};`);
        if (c.label) {
          lines.push(`  \\node[above, font=\\small\\bfseries] at (${cId}.north) {$${c.label}$};`);
        }
        if (valStr) {
          lines.push(`  \\node[below, font=\\tiny] at (${cId}.south) {$${valStr}$};`);
        }
        break;
      }
      case 'LOGIC_INPUT': {
        const valStr = c.value ? formatValueForLatex(c.value) : '1';
        lines.push(`  \\draw (${pos}) node[draw, rectangle, rounded corners=2pt, minimum size=0.7cm${rotOpt}] (${cId}) {$${valStr}$};`);
        if (c.label) {
          lines.push(`  \\node[above, font=\\small\\bfseries] at (${cId}.north) {$${c.label}$};`);
        }
        break;
      }
      case 'PROBE': {
        const displayLabel = c.label ? formatValueForLatex(c.label) : (c.value || 'OUT');
        lines.push(`  \\draw (${pos}) node[circle, draw, fill=yellow!20, minimum size=0.7cm, font=\\tiny\\bfseries${rotOpt}] (${cId}) {OUT};`);
        if (displayLabel) {
          lines.push(`  \\node[above, font=\\small\\bfseries] at (${cId}.north) {$${displayLabel}$};`);
        }
        break;
      }
      case 'FF_D':
      case 'FF_D_NEG':
      case 'FF_JK':
      case 'FF_SR':
      case 'FF_T':
      case 'FF_JK_NEG':
      case 'FF_SR_NEG':
      case 'FF_T_NEG': {
        const valStr = c.value ? formatValueForLatex(c.value) : '';
        const isNeg = c.type === 'FF_JK' || c.type.endsWith('_NEG');

        // Caixa do Flip-Flop (1.5cm x 2.1cm conforme modelo de referência)
        lines.push(`  \\draw (${pos}) node[draw, minimum width=1.5cm, minimum height=2.1cm${rotOpt}] (${cId}) {};`);
        if (c.label) {
          lines.push(`  \\node[above, font=\\small\\bfseries] at (${cId}.north) {$${c.label}$};`);
        }
        if (valStr) {
          lines.push(`  \\node[below, font=\\small] at (${cId}.south) {$${valStr}$};`);
        }

        // Rótulos de Preset (topo) e Clear (base) com bolhas de inversão (ativo em 0)
        if (c.type === 'FF_D') {
          lines.push(`  \\draw ([yshift=0.08cm]${cId}.north) circle (0.06cm);`);
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=north] at (${cId}.north) {PRE};`);
          lines.push(`  \\draw ([yshift=-0.08cm]${cId}.south) circle (0.06cm);`);
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=south] at (${cId}.south) {CLR};`);
        } else if (c.type === 'FF_JK') {
          lines.push(`  \\draw ([yshift=-0.08cm]${cId}.south) circle (0.06cm);`);
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=south] at (${cId}.south) {CLR};`);
        }

        // Saídas Q e Q_bar (lado direito)
        lines.push(`  \\node[font=\\tiny\\bfseries, anchor=east] at ([yshift=-0.45cm]${cId}.north east) {Q};`);
        lines.push(`  \\node[font=\\tiny\\bfseries, anchor=east] at ([yshift=0.45cm]${cId}.south east) {$\\bar{\\text{Q}}$};`);

        if (c.type.startsWith('FF_D') || c.type.startsWith('FF_T')) {
          const topLabel = c.type.startsWith('FF_D') ? 'D' : 'T';
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=west] at ([yshift=-0.45cm]${cId}.north west) {${topLabel}};`);

          // Seta do Clock e Bolha (se borda de descida)
          if (isNeg) {
            lines.push(`  \\draw ([xshift=-0.08cm, yshift=0.45cm]${cId}.south west) circle (0.06cm);`);
          }
          lines.push(`  \\draw ([yshift=0.35cm]${cId}.south west) -- ++(0.15, 0.10) -- ++(-0.15, 0.10);`);
        } else {
          // FF_JK ou FF_SR (J/S no topo, CLK no meio, K/R na base)
          const topLabel = c.type.startsWith('FF_JK') ? 'J' : 'S';
          const botLabel = c.type.startsWith('FF_JK') ? 'K' : 'R';

          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=west] at ([yshift=-0.45cm]${cId}.north west) {${topLabel}};`);
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=west] at ([yshift=0.45cm]${cId}.south west) {${botLabel}};`);

          if (isNeg) {
            lines.push(`  \\draw ([xshift=-0.08cm]${cId}.west) circle (0.06cm);`);
          }
          lines.push(`  \\draw ([yshift=-0.10cm]${cId}.west) -- ++(0.15, 0.10) -- ++(-0.15, 0.10);`);
        }

        break;
      }
      case 'TRANSFORMER': {
        const valStr = c.value ? formatValueForLatex(c.value) : '';
        lines.push(`  \\draw (${pos}) node[transformer] (${cId}) {};`);
        if (c.label) {
          lines.push(`  \\node[above, font=\\small] at (${cId}.north) {$${c.label}$};`);
        }
        if (valStr) {
          lines.push(`  \\node[below, font=\\small] at (${cId}.south) {$${valStr}$};`);
        }
        break;
      }
      case 'THYRISTOR':
        lines.push(`  \\draw (${pos}) node[scr] (${cId}) {${c.label}};`);
        break;
      case 'TRIAC':
        lines.push(`  \\draw (${pos}) node[triac] (${cId}) {${c.label}};`);
        break;
      case 'JUNCTION':
        lines.push(`  \\draw (${pos}) node[circ] {};`);
        break;
      case 'PIN_TERMINAL': {
        const displayLabel = formatValueForLatex(c.label || c.value || 'TERM');
        lines.push(`  \\draw (${pos}) node[circle, draw, fill=white, inner sep=2.5pt] (${cId}) {};`);
        if (displayLabel) {
          lines.push(`  \\node[above, font=\\small] at (${cId}.north) {$${displayLabel}$};`);
        }
        break;
      }
      case 'TEXT': {
        const textContent = formatValueForLatex(c.value || c.label || 'Texto');
        lines.push(`  \\node[font=\\small] at (${pos}) {${textContent}};`);
        break;
      }
      default:
        break;
    }
  });

  lines.push('');
  lines.push('  % Conexões de Fios e Componentes Bipolos');

  const bipoleTypes: Record<string, string> = {
    RESISTOR: 'R',
    CAPACITOR: 'C',
    CAPACITOR_POLAR: 'eC',
    DIODE: 'D',
    DIODE_ZENER: 'zzD',
    LED: 'led',
    SOURCE_DC: 'battery1',
    SOURCE_AC: 'sV',
  };


  // 2. Conexões de Componentes Bipolos
  components.forEach((c) => {
    const tikzCode = bipoleTypes[c.type];
    if (tikzCode) {
      const def = COMPONENT_DEFINITIONS[c.type];
      if (def && def.pins.length >= 2) {
        const p1 = getAbsolutePinPosition(c, def.pins[0].id);
        const p2 = getAbsolutePinPosition(c, def.pins[1].id);
        const pos1 = `(${toTikZ(p1.x, p1.y)})`;
        const pos2 = `(${toTikZ(p2.x, p2.y)})`;

        let valRaw = c.value || '';
        if (c.type === 'SOURCE_AC' && c.frequency) {
          valRaw = valRaw ? `${valRaw}, ${c.frequency}` : c.frequency;
        }

        const hasLabelOffset = Boolean(c.labelOffset && (c.labelOffset.x !== 0 || c.labelOffset.y !== 0));
        const hasValueOffset = Boolean(c.valueOffset && (c.valueOffset.x !== 0 || c.valueOffset.y !== 0));

        lines.push(`  % Componente: ${c.label || def.name}${valRaw ? ` (${valRaw})` : ''}`);

        if (hasLabelOffset || hasValueOffset) {
          const midPos = `(${toTikZ(c.x, c.y)})`;
          lines.push(`  \\draw ${pos1} to[${tikzCode}] ${pos2};`);
          if (c.label) {
            const lShift = getOffsetShift(c.labelOffset);
            lines.push(`  \\node[above, font=${labelFont}\\bfseries, fill=white, inner sep=1pt${lShift}] at ${midPos} {$${c.label}$};`);
          }
          if (valRaw) {
            const valFormatted = formatValueForLatex(valRaw);
            const vShift = getOffsetShift(c.valueOffset);
            lines.push(`  \\node[below, font=${valueFont}, fill=white, inner sep=1pt${vShift}] at ${midPos} {$${valFormatted}$};`);
          }
        } else {
          let labelOption = '';
          if (c.label && valRaw) {
            const valFormatted = formatValueForLatex(valRaw);
            labelOption = `l={\\shortstack{${labelFont} $${c.label}$\\\\ ${valueFont} $${valFormatted}$}}`;
          } else if (c.label) {
            labelOption = `l={${labelFont} $${c.label}$}`;
          } else if (valRaw) {
            const valFormatted = formatValueForLatex(valRaw);
            labelOption = `l={${valueFont} $${valFormatted}$}`;
          }
          lines.push(`  \\draw ${pos1} to[${tikzCode}${labelOption ? `, ${labelOption}` : ''}] ${pos2};`);
        }
      }
    }
  });

  lines.push('');
  lines.push('  % Conexões de Fios e Âncoras do Circuito');

  // Helper para obter descrição amigável do componente
  const getCompDescr = (compId?: string) => {
    if (!compId) return 'Ponto';
    const comp = components.find((c) => c.id === compId);
    if (!comp) return 'Ponto';
    const def = COMPONENT_DEFINITIONS[comp.type];
    const name = comp.label || (def ? def.name : comp.type);
    return comp.value ? `${name} (${comp.value})` : name;
  };

  // 3. Conexões de Fios e Âncoras do Circuito
  wires.forEach((w) => {
    const waypoints = getWireWaypoints(w, components);
    if (waypoints.length >= 2) {
      const tikzCoords: string[] = [];

      waypoints.forEach((pt, index) => {
        let coord = `(${toTikZ(pt.x, pt.y)})`;

        if (index === 0 && w.from.componentId) {
          const comp = components.find((c) => c.id === w.from.componentId);
          if (comp) {
            coord = resolveCompPinAnchor(comp, w.from.pinId, pt);
          }
        }

        if (index === waypoints.length - 1 && w.to.componentId) {
          const comp = components.find((c) => c.id === w.to.componentId);
          if (comp) {
            coord = resolveCompPinAnchor(comp, w.to.pinId, pt);
          }
        }

        if (tikzCoords.length === 0 || tikzCoords[tikzCoords.length - 1] !== coord) {
          tikzCoords.push(coord);
        }
      });

      if (tikzCoords.length >= 2) {
        const fromDesc = getCompDescr(w.from.componentId);
        const toDesc = getCompDescr(w.to.componentId);
        lines.push(`  % Fio conectando: ${fromDesc} -> ${toDesc}`);

        lines.push(`  \\draw ${tikzCoords.join(' -- ')};`);
      }
    }
  });

  lines.push('\\end{circuitikz}');
  return lines.join('\n');
}

/**
 * Limpa strings de fórmulas e símbolos do LaTeX para exibição no canvas.
 */
function cleanLatexLabel(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\$\{\}]/g, '') // Remove $, { e }
    .replace(/\\mathrm/g, '')
    .replace(/\\text/g, '')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\mu/g, 'µ')
    .replace(/\\approx/g, '≈')
    .replace(/\\/g, '') // Remove barras invertidas residuais
    .trim();
}

/**
 * Importa um código LaTeX CircuiTikZ e converte em componentes e fios do CircuitCraft.
 */
export function importFromCircuitikz(latexStr: string): {
  components: CircuitComponent[];
  wires: Wire[];
} {
  const components: CircuitComponent[] = [];
  const wires: Wire[] = [];

  const scale = 80; // 1.0cm TikZ = 80px no canvas para espaçamento perfeito das portas lógicas
  const originX = 200;
  const originY = 250;

  // Componentes cujos pinos padrão na definição são verticais
  const defaultVerticalTypes = new Set(['SOURCE_DC', 'SOURCE_AC', 'GND', 'VCC']);

  // Pre-processador para converter comandos standalone \node [...] (id) at (...) {label}; em \draw (...) node[...] (id) {label};
  // Suporta expressões de posição complexas, e posições relativas de nós TikZ
  const cleanLatex = latexStr
    .split('\n')
    .map((line) => line.replace(/%.*$/, ''))
    .join(' ')
    .replace(/\\node\s*\[([^\]]+)\]\s*\(([^)]+)\)\s*at\s*\(([^)]+)\)\s*\{([^}]*)\};/gi, (_match, nodeOpts, nodeId, coords, label) => {
      // Se a coordenada contiver expressões como "above=0.01cm of G0.north", pula criação de componente independente
      if (nodeOpts.includes('above=') || nodeOpts.includes('below=') || nodeOpts.includes('left') || nodeOpts.includes('right')) {
        return '';
      }
      return `\\draw (${coords}) node[${nodeOpts}] (${nodeId}) {${label}};`;
    });

  const mapBipoleType = (code: string): CircuitComponent['type'] => {
    const c = code.trim();
    if (c === 'sV' || c.includes('sinusoidal') || c === 'sqV') return 'SOURCE_AC';
    if (c === 'V' || c === 'vsource' || c.includes('battery') || c === 'dcV') return 'SOURCE_DC';
    if (c === 'R' || c.includes('resistor')) return 'RESISTOR';
    if (c === 'C' || c.includes('capacitor')) return 'CAPACITOR';
    if (c === 'eC') return 'CAPACITOR_POLAR';
    if (c === 'D' || c.includes('diode')) return 'DIODE';
    if (c === 'zzD') return 'DIODE_ZENER';
    if (c === 'led') return 'LED';
    return 'RESISTOR';
  };

  let compCounter = 1;

  interface NodePinRef {
    componentId: string;
    pinId: string;
  }

  const tikzNodeMap: Record<string, NodePinRef[]> = {};
  const straightLineSegments: { key1: string; key2: string }[] = [];

  const registerNodePin = (coordKey: string, ref: NodePinRef) => {
    if (!tikzNodeMap[coordKey]) {
      tikzNodeMap[coordKey] = [];
    }
    tikzNodeMap[coordKey].push(ref);
  };

  // Extrai blocos \draw ... ;
  const drawBlockRegex = /\\draw\s+([^;]+);/g;
  let drawMatch;

  while ((drawMatch = drawBlockRegex.exec(cleanLatex)) !== null) {
    const drawContent = drawMatch[1].trim();

    const tokenRegex = /\(([^)]+)\)|to\[([^\]]+)\]\s*\(([^)]+)\)|(?:--|-\||\|-)\s*\(([^)]+)\)|node\[([^\]]+)\]\s*(?:\(([^)]+)\))?\s*\{([^}]*)\}/g;
    let tokenMatch;
    let currentCoordKey: string | null = null;
    let currentCoordVal: { x: number; y: number } | null = null;

    while ((tokenMatch = tokenRegex.exec(drawContent)) !== null) {
      const fullToken = tokenMatch[0];

      if (fullToken.startsWith('to[')) {
        const bipoleOpts = tokenMatch[2];
        const destCoordStr = tokenMatch[3].trim();

        // Tenta resolver a coordenada de destino como (x,y) ou como (comp.anchor)
        let destCoordVal: { x: number; y: number } | null = null;

        if (destCoordStr.includes(',')) {
          const [x2, y2] = destCoordStr.split(',').map((s) => parseFloat(s.trim()));
          if (!isNaN(x2) && !isNaN(y2)) {
            destCoordVal = { x: x2, y: y2 };
          }
        } else {
          // Referência nomeada de âncora (ex: Q1.C, Q1.E)
          const [cId, anchor] = destCoordStr.split('.');
          const comp = components.find((c) => c.id === cId);
          if (comp) {
            const def = COMPONENT_DEFINITIONS[comp.type];
            const pinMap: Record<string, string> = { B: 'base', C: 'collector', E: 'emitter' };
            const targetPinId = pinMap[anchor] || 'p1';
            const pinDef = def?.pins.find((p) => p.id === targetPinId);

            // Calcula posição real no canvas convertida para escala TikZ
            const relX = pinDef ? pinDef.relX : 0;
            const relY = pinDef ? pinDef.relY : 0;
            const absX = comp.x + relX;
            const absY = comp.y + relY;

            const tikzX = (absX - originX) / scale;
            const tikzY = (originY - absY) / scale;
            destCoordVal = { x: tikzX, y: tikzY };
          }
        }

        if (currentCoordVal && destCoordVal) {
          const x2 = destCoordVal.x;
          const y2 = destCoordVal.y;
          const key1 = currentCoordKey!;
          const key2 = destCoordStr.includes(',') ? `${x2},${y2}` : destCoordStr;

          const px1 = Math.round(originX + currentCoordVal.x * scale);
          const py1 = Math.round(originY - currentCoordVal.y * scale);
          const px2 = Math.round(originX + x2 * scale);
          const py2 = Math.round(originY - y2 * scale);

          let cx = snapToGrid(Math.round((px1 + px2) / 2));
          const cy = snapToGrid(Math.round((py1 + py2) / 2));

          // Se o segmento for estritamente vertical, alinha a coordenada X ao ponto do pino/nó
          if (px1 === px2) {
            cx = px1;
          }

          const optsParts = bipoleOpts.split(',');
          const mainTypeRaw = optsParts[0].trim();
          const compType = mapBipoleType(mainTypeRaw);

          let labelVal = '';
          const labelOpt = optsParts.find((o) => o.trim().startsWith('l=') || o.trim().startsWith('l_='));
          if (labelOpt) {
            labelVal = cleanLatexLabel(labelOpt.split('=')[1]);
          }

          const def = COMPONENT_DEFINITIONS[compType];
          const compId = `comp_tex_${Date.now()}_${compCounter++}`;

          const isPathVertical = Math.abs(py1 - py2) >= Math.abs(px1 - px2);
          const isDefaultVertical = defaultVerticalTypes.has(compType);
          let rotation = 0;

          if (isPathVertical) {
            rotation = isDefaultVertical ? 0 : 90;
          } else {
            rotation = isDefaultVertical ? 90 : 0;
          }

          components.push({
            id: compId,
            type: compType,
            label: labelVal || `${def?.defaultLabel || 'X'}${compCounter}`,
            value: compType === 'SOURCE_AC' ? (labelVal || '120Vrms') : (def?.defaultValue || ''),
            x: cx,
            y: cy,
            rotation,
          });

          // Mapeamento correto de Pinos baseado na orientação e direção do vetor (start -> end)
          const pin1Def = def?.pins[0]?.id || 'p1';
          const pin2Def = def?.pins[1]?.id || 'p2';

          let pinForStart = pin1Def;
          let pinForEnd = pin2Def;

          if (isPathVertical) {
            // Em vetores verticais: py1 > py2 significa vetor subindo (start no fundo, end no topo)
            if (isDefaultVertical) {
              if (py1 > py2) {
                // start (fundo) -> pin2 (negative / bottom), end (topo) -> pin1 (positive / top)
                pinForStart = pin2Def;
                pinForEnd = pin1Def;
              } else {
                pinForStart = pin1Def;
                pinForEnd = pin2Def;
              }
            } else {
              // Componente horizontal rotacionado 90°
              if (py1 > py2) {
                pinForStart = pin2Def;
                pinForEnd = pin1Def;
              } else {
                pinForStart = pin1Def;
                pinForEnd = pin2Def;
              }
            }
          } else {
            // Vetor horizontal: px1 < px2 significa vetor para a direita (start na esquerda, end na direita)
            if (px1 > px2) {
              pinForStart = pin2Def;
              pinForEnd = pin1Def;
            } else {
              pinForStart = pin1Def;
              pinForEnd = pin2Def;
            }
          }

          registerNodePin(key1, { componentId: compId, pinId: pinForStart });
          registerNodePin(key2, { componentId: compId, pinId: pinForEnd });

          currentCoordVal = { x: x2, y: y2 };
          currentCoordKey = key2;
        }
      } else if (fullToken.startsWith('--') || fullToken.startsWith('-|') || fullToken.startsWith('|-')) {
        const destCoordStr = tokenMatch[4].trim();
        const key1 = currentCoordKey!;
        let key2 = destCoordStr;

        if (destCoordStr.includes(',')) {
          const [x2, y2] = destCoordStr.split(',').map((s) => parseFloat(s.trim()));
          if (!isNaN(x2) && !isNaN(y2)) {
            key2 = `${x2},${y2}`;
            currentCoordVal = { x: x2, y: y2 };
          }
        }

        if (key1 && key2 && key1 !== key2) {
          straightLineSegments.push({ key1, key2 });
        }

        currentCoordKey = key2;
      } else if (fullToken.startsWith('node[')) {
        const nodeTypeRaw = tokenMatch[5].toLowerCase();
        const nodeIdRaw = tokenMatch[6];
        const labelRaw = cleanLatexLabel(tokenMatch[7]);

        if (currentCoordVal && currentCoordKey) {
          const px = snapToGrid(Math.round(originX + currentCoordVal.x * scale));
          const py = snapToGrid(Math.round(originY - currentCoordVal.y * scale));

          let type: CircuitComponent['type'] | null = null;

          const isThreeInput = nodeTypeRaw.includes('number inputs=3') || nodeTypeRaw.includes('inputs=3');

          if (nodeTypeRaw.includes('ground')) type = 'GND';
          else if (nodeTypeRaw.includes('vcc')) type = 'VCC';
          else if (nodeTypeRaw.includes('npn')) type = 'BJT_NPN';
          else if (nodeTypeRaw.includes('pnp')) type = 'BJT_PNP';
          else if (nodeTypeRaw.includes('not') && nodeTypeRaw.includes('port')) type = 'GATE_NOT';
          else if (nodeTypeRaw.includes('nand') && nodeTypeRaw.includes('port')) type = isThreeInput ? 'GATE_NAND3' : 'GATE_NAND';
          else if (nodeTypeRaw.includes('and') && nodeTypeRaw.includes('port')) type = isThreeInput ? 'GATE_AND3' : 'GATE_AND';
          else if (nodeTypeRaw.includes('nor') && nodeTypeRaw.includes('port')) type = isThreeInput ? 'GATE_NOR3' : 'GATE_NOR';
          else if (nodeTypeRaw.includes('or') && nodeTypeRaw.includes('port')) type = isThreeInput ? 'GATE_OR3' : 'GATE_OR';
          else if (nodeTypeRaw.includes('xnor') && nodeTypeRaw.includes('port')) type = 'GATE_XNOR';
          else if (nodeTypeRaw.includes('xor') && nodeTypeRaw.includes('port')) type = 'GATE_XOR';
          else if (nodeTypeRaw.includes('transformer')) type = 'TRANSFORMER';
          else if (nodeTypeRaw.includes('circ')) {
            type = null;
          }

          if (type) {
            const def = COMPONENT_DEFINITIONS[type];
            const compId = nodeIdRaw || `comp_tex_${Date.now()}_${compCounter++}`;

            components.push({
              id: compId,
              type,
              label: labelRaw || `${def?.defaultLabel || 'U'}${compCounter}`,
              value: def?.defaultValue || '',
              x: px,
              y: py,
              rotation: 0,
            });

            if (type === 'TRANSFORMER') {
              registerNodePin(`${compId}.A1`, { componentId: compId, pinId: 'p1_in' });
              registerNodePin(`${compId}.A2`, { componentId: compId, pinId: 'p2_in' });
              registerNodePin(`${compId}.B1`, { componentId: compId, pinId: 'sec1_out' });
              registerNodePin(`${compId}.B2`, { componentId: compId, pinId: 'sec2_out' });
            } else if (type === 'BJT_NPN' || type === 'BJT_PNP') {
              registerNodePin(`${compId}.B`, { componentId: compId, pinId: 'base' });
              registerNodePin(`${compId}.C`, { componentId: compId, pinId: 'collector' });
              registerNodePin(`${compId}.E`, { componentId: compId, pinId: 'emitter' });
              registerNodePin(currentCoordKey, { componentId: compId, pinId: 'base' });
            } else if (type.startsWith('GATE_')) {
              registerNodePin(`${compId}.in`, { componentId: compId, pinId: 'in_a' });
              registerNodePin(`${compId}.in 1`, { componentId: compId, pinId: 'in_a' });
              registerNodePin(`${compId}.in 2`, { componentId: compId, pinId: isThreeInput ? 'in_b' : 'in_b' });
              registerNodePin(`${compId}.in 3`, { componentId: compId, pinId: isThreeInput ? 'in_c' : 'in_b' });
              registerNodePin(`${compId}.out`, { componentId: compId, pinId: 'out' });
              registerNodePin(currentCoordKey, { componentId: compId, pinId: 'out' });
            } else {
              const pin1Id = def?.pins[0]?.id || 'p1';
              registerNodePin(currentCoordKey, { componentId: compId, pinId: pin1Id });
            }
          }
        }
      } else if (fullToken.startsWith('(')) {
        const coordStr = tokenMatch[1].trim();
        if (coordStr.includes('|-') || coordStr.includes('-|')) {
          // Expressões TikZ de intersecção ortogonal como "(0.5, 0 |- G0.in 1)"
          const isVH = coordStr.includes('|-');
          const [leftPart, rightPart] = coordStr.split(isVH ? '|-' : '-|').map((s) => s.trim());
          const xVal = parseFloat(leftPart.split(',')[0] || '0');

          let yVal = 0;
          const targetAnchorKey = rightPart.trim();
          const parts = targetAnchorKey.split('.');
          const cId = parts[0];
          const anchor = parts.slice(1).join('.');

          const comp = components.find((c) => c.id === cId);
          if (comp) {
            const def = COMPONENT_DEFINITIONS[comp.type];
            const pinMap: Record<string, string> = {
              B: 'base',
              C: 'collector',
              E: 'emitter',
              in: 'in_a',
              'in 1': 'in_a',
              'in 2': 'in_b',
              'in 3': 'in_c',
              out: 'out',
            };
            const targetPinId = pinMap[anchor] || 'in_a';
            const pinDef = def?.pins.find((p) => p.id === targetPinId);

            const relY = pinDef ? pinDef.relY : 0;
            const absY = comp.y + relY;
            yVal = (originY - absY) / scale;
          }

          if (!isNaN(xVal)) {
            currentCoordVal = { x: xVal, y: yVal };
            currentCoordKey = `${xVal},${yVal}`;
          }
        } else if (coordStr.includes(',')) {
          const [x, y] = coordStr.split(',').map((s) => parseFloat(s.trim()));
          if (!isNaN(x) && !isNaN(y)) {
            currentCoordVal = { x, y };
            currentCoordKey = `${x},${y}`;
          }
        } else {
          // Trata-se de um nó/âncora nomeado no TikZ (ex: Q1.C, G0.in 1, N03.in, G0.out)
          currentCoordKey = coordStr;
          const parts = coordStr.split('.');
          const cId = parts[0];
          const anchor = parts.slice(1).join('.');

          const comp = components.find((c) => c.id === cId);
          if (comp) {
            const def = COMPONENT_DEFINITIONS[comp.type];
            const pinMap: Record<string, string> = {
              B: 'base',
              C: 'collector',
              E: 'emitter',
              in: 'in_a',
              'in 1': 'in_a',
              'in 2': 'in_b',
              'in 3': 'in_c',
              out: 'out',
            };
            const targetPinId = pinMap[anchor] || 'in_a';
            const pinDef = def?.pins.find((p) => p.id === targetPinId);

            const relX = pinDef ? pinDef.relX : 0;
            const relY = pinDef ? pinDef.relY : 0;
            const absX = comp.x + relX;
            const absY = comp.y + relY;

            const tikzX = (absX - originX) / scale;
            const tikzY = (originY - absY) / scale;
            currentCoordVal = { x: tikzX, y: tikzY };
          }
        }
      }
    }
  }

  // GERADOR AUTOMÁTICO DE FIOS DE CONEXÃO (WIRES)
  const createdWireKeys = new Set<string>();

  const addWire = (ref1: NodePinRef, ref2: NodePinRef) => {
    if (ref1.componentId === ref2.componentId) return;
    const k1 = `${ref1.componentId}:${ref1.pinId}-${ref2.componentId}:${ref2.pinId}`;
    const k2 = `${ref2.componentId}:${ref2.pinId}-${ref1.componentId}:${ref1.pinId}`;

    if (!createdWireKeys.has(k1) && !createdWireKeys.has(k2)) {
      createdWireKeys.add(k1);
      createdWireKeys.add(k2);
      wires.push({
        id: `wire_tex_${Date.now()}_${wires.length + 1}`,
        from: { componentId: ref1.componentId, pinId: ref1.pinId },
        to: { componentId: ref2.componentId, pinId: ref2.pinId },
      });
    }
  };

  // 1. Conecta todos os pinos que compartilham o mesmo Nó no TikZ
  Object.values(tikzNodeMap).forEach((pinRefs) => {
    for (let i = 0; i < pinRefs.length; i++) {
      for (let j = i + 1; j < pinRefs.length; j++) {
        addWire(pinRefs[i], pinRefs[j]);
      }
    }
  });

  // 2. Conecta pinos ligados por segmentos de linha (--, -|, |-)
  straightLineSegments.forEach(({ key1, key2 }) => {
    let pinsAt1 = tikzNodeMap[key1] || [];
    let pinsAt2 = tikzNodeMap[key2] || [];

    // Se a chave não for uma âncora explícita, procura pinos por proximidade espacial (raio de 25px no canvas)
    if (pinsAt1.length === 0 && key1.includes(',')) {
      const [x1, y1] = key1.split(',').map(Number);
      const px1 = snapToGrid(Math.round(originX + x1 * scale));
      const py1 = snapToGrid(Math.round(originY - y1 * scale));

      components.forEach((comp) => {
        const def = COMPONENT_DEFINITIONS[comp.type];
        if (def) {
          def.pins.forEach((pin) => {
            const pX = comp.x + pin.relX;
            const pY = comp.y + pin.relY;
            if (Math.hypot(px1 - pX, py1 - pY) <= 30) {
              pinsAt1.push({ componentId: comp.id, pinId: pin.id });
            }
          });
        }
      });
    }

    if (pinsAt2.length === 0 && key2.includes(',')) {
      const [x2, y2] = key2.split(',').map(Number);
      const px2 = snapToGrid(Math.round(originX + x2 * scale));
      const py2 = snapToGrid(Math.round(originY - y2 * scale));

      components.forEach((comp) => {
        const def = COMPONENT_DEFINITIONS[comp.type];
        if (def) {
          def.pins.forEach((pin) => {
            const pX = comp.x + pin.relX;
            const pY = comp.y + pin.relY;
            if (Math.hypot(px2 - pX, py2 - pY) <= 30) {
              pinsAt2.push({ componentId: comp.id, pinId: pin.id });
            }
          });
        }
      });
    }

    pinsAt1.forEach((p1) => {
      pinsAt2.forEach((p2) => {
        addWire(p1, p2);
      });
    });
  });

  return { components, wires };
}
