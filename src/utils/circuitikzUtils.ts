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

  // Mapeia os IDs internos de componente para identificadores TikZ legíveis
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

  // Helper unificado para calcular deslocamentos e âncoras exatas de textos (label e value)
  const getComponentTextPlacement = (
    c: CircuitComponent,
    def: { width: number; height: number }
  ) => {
    const isVertical = c.rotation % 180 !== 0;
    const hasLabel = Boolean(c.label && c.label.trim() !== '');
    const valRaw = c.value || '';
    const hasValue = Boolean(
      valRaw &&
      valRaw.trim() !== '' &&
      valRaw !== c.label &&
      c.type !== 'PIN_TERMINAL'
    );

    const hasLabelOffset = Boolean(c.labelOffset && (c.labelOffset.x !== 0 || c.labelOffset.y !== 0));
    const hasValueOffset = Boolean(c.valueOffset && (c.valueOffset.x !== 0 || c.valueOffset.y !== 0));

    // Posições base no sistema de coordenadas do canvas (idênticas a ComponentSymbol.tsx)
    const baseLabelX = isVertical ? (hasValue ? -def.height / 2 - 8 : 0) : 0;
    const baseLabelY = isVertical ? (hasValue ? 4 : -def.width / 2 - 8) : -def.height / 2 - 7;
    const baseValueX = isVertical ? def.height / 2 + 8 : 0;
    const baseValueY = isVertical ? 4 : def.height / 2 + 18;

    const effLabelX = baseLabelX + (c.labelOffset?.x || 0);
    const effLabelY = baseLabelY + (c.labelOffset?.y || 0);
    const effValueX = baseValueX + (c.valueOffset?.x || 0);
    const effValueY = baseValueY + (c.valueOffset?.y || 0);

    const labelPos = toTikZ(c.x + effLabelX, c.y + effLabelY);
    const valuePos = toTikZ(c.x + effValueX, c.y + effValueY);

    const anchorLabel = effLabelY > 8 ? 'north' : (effLabelY < -8 ? 'south' : (effLabelX < 0 ? 'east' : 'west'));
    const anchorValue = effValueY > 8 ? 'north' : (effValueY < -8 ? 'south' : (effValueX < 0 ? 'east' : 'west'));

    return {
      hasLabel,
      hasValue,
      valRaw,
      hasLabelOffset,
      hasValueOffset,
      labelPos,
      valuePos,
      anchorLabel,
      anchorValue,
    };
  };

  // 1. Declarar componentes multimáticos, semicondutores, analógicos e terminais
  components.forEach((c) => {
    const pos = toTikZ(c.x, c.y);
    const cId = getTikzId(c.id);
    const rotOpt = getRotOpt(c.rotation);
    const def = COMPONENT_DEFINITIONS[c.type];
    const defW = def ? def.width : 80;
    const defH = def ? def.height : 40;
    const tp = getComponentTextPlacement(c, { width: defW, height: defH });

    switch (c.type) {
      case 'BJT_NPN':
      case 'BJT_PNP':
      case 'MOSFET_N':
      case 'MOSFET_P': {
        const nodeType =
          c.type === 'BJT_NPN' ? 'npn' :
          c.type === 'BJT_PNP' ? 'pnp' :
          c.type === 'MOSFET_N' ? 'nmos' : 'pmos';
        lines.push(`  \\draw (${pos}) node[${nodeType}${rotOpt}] (${cId}) {};`);
        if (tp.hasLabel) {
          lines.push(`  \\node[anchor=${tp.anchorLabel}, font=${labelFont}\\bfseries] at (${tp.labelPos}) {$${c.label}$};`);
        }
        if (tp.hasValue) {
          lines.push(`  \\node[anchor=${tp.anchorValue}, font=${valueFont}] at (${tp.valuePos}) {$${formatValueForLatex(tp.valRaw)}$};`);
        }
        break;
      }
      case 'OPAMP': {
        lines.push(`  \\draw (${pos}) node[op amp${rotOpt}] (${cId}) {};`);
        if (tp.hasLabel) {
          lines.push(`  \\node[anchor=${tp.anchorLabel}, font=${labelFont}\\bfseries] at (${tp.labelPos}) {$${c.label}$};`);
        }
        if (tp.hasValue) {
          lines.push(`  \\node[anchor=${tp.anchorValue}, font=${valueFont}] at (${tp.valuePos}) {$${formatValueForLatex(tp.valRaw)}$};`);
        }
        break;
      }
      case 'GATE_NOT':
      case 'GATE_AND':
      case 'GATE_AND3':
      case 'GATE_NAND':
      case 'GATE_NAND3':
      case 'GATE_OR':
      case 'GATE_OR3':
      case 'GATE_NOR':
      case 'GATE_NOR3':
      case 'GATE_XOR':
      case 'GATE_XNOR': {
        const isThree = c.type.endsWith('3');
        const gateBase =
          c.type.startsWith('GATE_NOT') ? 'not port' :
          c.type.startsWith('GATE_AND') ? 'and port' :
          c.type.startsWith('GATE_NAND') ? 'nand port' :
          c.type.startsWith('GATE_OR') ? 'or port' :
          c.type.startsWith('GATE_NOR') ? 'nor port' :
          c.type.startsWith('GATE_XOR') ? 'xor port' : 'xnor port';
        const numIn = isThree ? ', number inputs=3' : '';
        lines.push(`  \\draw (${pos}) node[${gateBase}${numIn}${rotOpt}] (${cId}) {};`);
        if (tp.hasLabel) {
          lines.push(`  \\node[anchor=${tp.anchorLabel}, font=${labelFont}\\bfseries] at (${tp.labelPos}) {$${c.label}$};`);
        }
        if (tp.hasValue) {
          lines.push(`  \\node[anchor=${tp.anchorValue}, font=${valueFont}] at (${tp.valuePos}) {$${formatValueForLatex(tp.valRaw)}$};`);
        }
        break;
      }
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

        lines.push(`  \\draw (${pos}) node[draw, minimum width=1.5cm, minimum height=2.1cm${rotOpt}] (${cId}) {};`);
        if (c.label) {
          lines.push(`  \\node[above, font=\\small\\bfseries] at (${cId}.north) {$${c.label}$};`);
        }
        if (valStr) {
          lines.push(`  \\node[below, font=\\small] at (${cId}.south) {$${valStr}$};`);
        }

        if (c.type === 'FF_D') {
          lines.push(`  \\draw ([yshift=0.08cm]${cId}.north) circle (0.06cm);`);
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=north] at (${cId}.north) {PRE};`);
          lines.push(`  \\draw ([yshift=-0.08cm]${cId}.south) circle (0.06cm);`);
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=south] at (${cId}.south) {CLR};`);
        } else if (c.type === 'FF_JK') {
          lines.push(`  \\draw ([yshift=-0.08cm]${cId}.south) circle (0.06cm);`);
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=south] at (${cId}.south) {CLR};`);
        }

        lines.push(`  \\node[font=\\tiny\\bfseries, anchor=east] at ([yshift=-0.45cm]${cId}.north east) {Q};`);
        lines.push(`  \\node[font=\\tiny\\bfseries, anchor=east] at ([yshift=0.45cm]${cId}.south east) {$\\bar{\\text{Q}}$};`);

        if (c.type.startsWith('FF_D') || c.type.startsWith('FF_T')) {
          const topLabel = c.type.startsWith('FF_D') ? 'D' : 'T';
          lines.push(`  \\node[font=\\tiny\\bfseries, anchor=west] at ([yshift=-0.45cm]${cId}.north west) {${topLabel}};`);
          if (isNeg) {
            lines.push(`  \\draw ([xshift=-0.08cm, yshift=0.45cm]${cId}.south west) circle (0.06cm);`);
          }
          lines.push(`  \\draw ([yshift=0.35cm]${cId}.south west) -- ++(0.15, 0.10) -- ++(-0.15, 0.10);`);
        } else {
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
          lines.push(`  \\node[anchor=${tp.anchorLabel}, font=\\small] at (${tp.labelPos}) {$${displayLabel}$};`);
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

        const tp = getComponentTextPlacement(c, { width: def.width, height: def.height });
        const valFormatted = formatValueForLatex(tp.valRaw);

        lines.push(`  % Componente: ${c.label || def.name}${tp.valRaw ? ` (${tp.valRaw})` : ''}`);

        if (tp.hasLabelOffset || tp.hasValueOffset) {
          // Posições personalizadas definidas por arrasto manual no canvas
          lines.push(`  \\draw ${pos1} to[${tikzCode}] ${pos2};`);
          if (tp.hasLabel) {
            lines.push(`  \\node[anchor=${tp.anchorLabel}, font=${labelFont}\\bfseries, fill=white, inner sep=1pt] at (${tp.labelPos}) {$${c.label}$};`);
          }
          if (tp.hasValue) {
            lines.push(`  \\node[anchor=${tp.anchorValue}, font=${valueFont}, fill=white, inner sep=1pt] at (${tp.valuePos}) {$${valFormatted}$};`);
          }
        } else {
          // Posições padrão alinhadas ao comportamento visual do canvas:
          // label fica acima (l=), value fica abaixo (l_=)
          const labelOpts: string[] = [];
          if (tp.hasLabel && tp.hasValue) {
            // Em CircuiTikZ, l= (label) e a= (annotation) são chaves distintas que
            // permitem posicionar simultaneamente texto em ambos os lados sem sobreposição.
            labelOpts.push(`l={${labelFont} $${c.label}$}`);
            labelOpts.push(`a={${valueFont} $${valFormatted}$}`);
          } else if (tp.hasLabel) {
            labelOpts.push(`l={${labelFont} $${c.label}$}`);
          } else if (tp.hasValue) {
            labelOpts.push(`l_={${valueFont} $${valFormatted}$}`);
          }

          const optStr = labelOpts.length > 0 ? `, ${labelOpts.join(', ')}` : '';
          lines.push(`  \\draw ${pos1} to[${tikzCode}${optStr}] ${pos2};`);
        }
      }
    }
  });

  lines.push('');
  lines.push('  % Conexões de Fios e Âncoras do Circuito');

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
    .replace(/\{=\}/g, '=')
    .replace(/[\$\{\}]/g, '') // Remove $, { e }
    .replace(/\\mathrm/g, '')
    .replace(/\\text/g, '')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\mu/g, 'µ')
    .replace(/\\approx/g, '≈')
    .replace(/\\/g, '') // Remove barras invertidas residuais
    .trim();
}

export function importFromCircuitikz(latexStr: string): {
  components: CircuitComponent[];
  wires: Wire[];
} {
  const components: CircuitComponent[] = [];
  const wires: Wire[] = [];

  const scale = 80; // 1.0cm TikZ = 80px no canvas
  const originX = 200;
  const originY = 250;

  const namedCoords = new Map<string, { x: number; y: number }>();

  // Converte ponto em TikZ para coordenadas no canvas (com snap ao grid de 20px)
  const toCanvas = (pt: { x: number; y: number }) => ({
    x: snapToGrid(Math.round(originX + pt.x * scale)),
    y: snapToGrid(Math.round(originY - pt.y * scale)),
  });

  const canvasKey = (cPt: { x: number; y: number }) => `${cPt.x},${cPt.y}`;

  // Pre-processamento: remove comentários
  const lines = latexStr
    .split('\n')
    .map((l) => l.replace(/%.*$/, '').trim())
    .filter(Boolean);
  const fullText = lines.join(' ');

  // 1. Extrair definições explícitas de coordenadas: \coordinate (NAME) at (X, Y);
  const coordRegex = /\\coordinate\s*(?:\[[^\]]*\])?\s*\(([^)]+)\)\s*(?:at\s*)?\(([^)]+)\)\s*;/gi;
  let cm: RegExpExecArray | null;
  while ((cm = coordRegex.exec(fullText)) !== null) {
    const cName = cm[1].trim();
    const cValStr = cm[2].trim();
    if (cValStr.includes(',')) {
      const [cx, cy] = cValStr.split(',').map((s) => parseFloat(s.trim()));
      if (!isNaN(cx) && !isNaN(cy)) {
        namedCoords.set(cName, { x: cx, y: cy });
      }
    }
  }

  // Resolvedor flexível de pontos (suporta números, ++relativos, nomes de nós, âncoras e |- / -|)
  const resolvePoint = (
    ptStr: string,
    currentPos: { x: number; y: number } | null
  ): { x: number; y: number } | null => {
    let s = ptStr.trim();
    let isRel = false;

    if (s.startsWith('++')) {
      isRel = true;
      s = s.slice(2).trim();
    } else if (s.startsWith('+')) {
      isRel = true;
      s = s.slice(1).trim();
    }

    if (s.startsWith('(') && s.endsWith(')')) {
      s = s.slice(1, -1).trim();
    }

    // Intersecção ortogonal: A |- B ou A -| B
    if (s.includes('|-') || s.includes('-|')) {
      const isVH = s.includes('|-');
      const [pLeft, pRight] = s.split(isVH ? '|-' : '-|').map((p) => p.trim());
      const ptL = resolvePoint(pLeft, currentPos);
      const ptR = resolvePoint(pRight, currentPos);
      if (ptL && ptR) {
        return isVH ? { x: ptL.x, y: ptR.y } : { x: ptR.x, y: ptL.y };
      }
    }

    // Coordenada explícita numérica (x, y)
    if (s.includes(',')) {
      const [x, y] = s.split(',').map((v) => parseFloat(v.trim()));
      if (!isNaN(x) && !isNaN(y)) {
        if (isRel && currentPos) {
          return { x: currentPos.x + x, y: currentPos.y + y };
        }
        return { x, y };
      }
    }

    // Nome de coordenada TikZ registrada
    if (namedCoords.has(s)) {
      return namedCoords.get(s)!;
    }

    // Âncora de componente nomeado: COMP.ANCHOR (ex: A.+, A.-, A.out, Q1.C)
    if (s.includes('.')) {
      const [compId, anchor] = s.split('.');
      const comp = components.find((c) => c.id === compId);
      if (comp) {
        const cTikzX = (comp.x - originX) / scale;
        const cTikzY = (originY - comp.y) / scale;

        let relX = 0;
        let relY = 0;

        if (comp.type === 'OPAMP') {
          if (anchor === '+' || anchor === 'in_plus') { relX = -40; relY = 20; }
          else if (anchor === '-' || anchor === 'in_minus') { relX = -40; relY = -20; }
          else if (anchor === 'out') { relX = 40; relY = 0; }
          else if (anchor === 'up' || anchor === 'v_plus') { relX = 0; relY = -40; }
          else if (anchor === 'down' || anchor === 'v_minus') { relX = 0; relY = 40; }
        } else if (comp.type.startsWith('BJT')) {
          if (anchor === 'B' || anchor === 'base') { relX = -30; relY = 0; }
          else if (anchor === 'C' || anchor === 'collector') { relX = 30; relY = -30; }
          else if (anchor === 'E' || anchor === 'emitter') { relX = 30; relY = 30; }
        } else if (comp.type.startsWith('MOSFET')) {
          if (anchor === 'G' || anchor === 'gate') { relX = -30; relY = 0; }
          else if (anchor === 'D' || anchor === 'drain') { relX = 30; relY = -30; }
          else if (anchor === 'S' || anchor === 'source') { relX = 30; relY = 30; }
        } else if (comp.type.startsWith('GATE')) {
          if (anchor === 'in' || anchor === 'in 1' || anchor === 'in_a') { relX = -40; relY = -20; }
          else if (anchor === 'in 2' || anchor === 'in_b') { relX = -40; relY = 20; }
          else if (anchor === 'in 3' || anchor === 'in_c') { relX = -40; relY = 0; }
          else if (anchor === 'out') { relX = 40; relY = 0; }
        }

        const tX = cTikzX + relX / scale;
        const tY = cTikzY - relY / scale;
        return { x: tX, y: tY };
      }
    }

    return null;
  };

  let compCounter = 1;
  interface PinLoc {
    componentId: string;
    pinId: string;
    pt: { x: number; y: number };
    canvasPt: { x: number; y: number };
  }

  const pinLocations: PinLoc[] = [];
  const lineEdges: { p1: { x: number; y: number }; p2: { x: number; y: number } }[] = [];

  const registerPin = (componentId: string, pinId: string, pt: { x: number; y: number }) => {
    const canvasPt = toCanvas(pt);
    pinLocations.push({ componentId, pinId, pt, canvasPt });
  };

  // 2. Extrai e processa blocos \draw ... ;
  const drawRegex = /\\draw\s+([^;]+);/gi;
  let dm: RegExpExecArray | null;

  while ((dm = drawRegex.exec(fullText)) !== null) {
    const drawStr = dm[1].trim();

    const tokenRegex = /(to\s*\[([^\]]+)\]\s*(\+\+|\+)?\s*\(([^)]+)\))|((?:--|-\||\|-)\s*(\+\+|\+)?\s*\(([^)]+)\))|(coordinate\s*(?:\[[^\]]*\])?\s*\(([^)]+)\))|(node\s*(?:\[([^\]]*)\])?\s*(?:\(([^)]+)\))?\s*\{([^}]*)\})|(\(([^)]+)\))/g;

    let tm: RegExpExecArray | null;
    let currentPos: { x: number; y: number } | null = null;

    while ((tm = tokenRegex.exec(drawStr)) !== null) {
      if (tm[1]) {
        // to[OPTS] (DEST)
        const bipoleOpts = tm[2];
        const isRel = Boolean(tm[3]);
        const destRaw = tm[4].trim();
        const ptStr = (isRel ? tm[3] : '') + '(' + destRaw + ')';

        const destPos = resolvePoint(ptStr, currentPos);

        if (currentPos && destPos) {
          const optsParts = bipoleOpts.split(',');
          const mainTypeRaw = optsParts[0].trim();

          if (mainTypeRaw === 'short') {
            lineEdges.push({ p1: { ...currentPos }, p2: { ...destPos } });
          } else {
            let compType: CircuitComponent['type'] = 'RESISTOR';
            if (mainTypeRaw === 'R' || mainTypeRaw.includes('resistor')) compType = 'RESISTOR';
            else if (mainTypeRaw === 'C' || mainTypeRaw.includes('capacitor')) compType = 'CAPACITOR';
            else if (mainTypeRaw === 'eC') compType = 'CAPACITOR_POLAR';
            else if (mainTypeRaw === 'D' || mainTypeRaw.includes('diode')) compType = 'DIODE';
            else if (mainTypeRaw === 'zzD') compType = 'DIODE_ZENER';
            else if (mainTypeRaw === 'led') compType = 'LED';
            else if (mainTypeRaw === 'V' || mainTypeRaw === 'vsource' || mainTypeRaw.includes('battery') || mainTypeRaw === 'dcV') compType = 'SOURCE_DC';
            else if (mainTypeRaw === 'sV' || mainTypeRaw.includes('sinusoidal') || mainTypeRaw === 'sqV') compType = 'SOURCE_AC';

            const lAboveOpt = optsParts.find(
              (o) => o.trim().startsWith('l=') || o.trim().startsWith('l^=')
            );
            const lBelowOpt = optsParts.find(
              (o) => o.trim().startsWith('l_=') || o.trim().startsWith('a=') || o.trim().startsWith('a_=') || o.trim().startsWith('a^=')
            );

            let cLabel = '';
            let cValue = '';

            if (lAboveOpt && lBelowOpt) {
              const eqA = lAboveOpt.indexOf('=');
              const eqB = lBelowOpt.indexOf('=');
              cLabel = cleanLatexLabel(lAboveOpt.slice(eqA + 1));
              cValue = cleanLatexLabel(lBelowOpt.slice(eqB + 1));
            } else {
              const singleOpt = lAboveOpt || lBelowOpt;
              if (singleOpt) {
                const eqIdx = singleOpt.indexOf('=');
                const raw = cleanLatexLabel(singleOpt.slice(eqIdx + 1));
                if (raw.includes('=')) {
                  const eqI = raw.indexOf('=');
                  cLabel = raw.slice(0, eqI).trim();
                  cValue = raw.slice(eqI + 1).trim();
                } else if (singleOpt === lBelowOpt) {
                  // l_ está explicitamente abaixo -> valor
                  cValue = raw;
                } else if (/^[0-9]/.test(raw) || raw.includes('Ω') || raw === 'R' || raw === '2R') {
                  cValue = raw;
                } else {
                  cLabel = raw;
                }
              }
            }

            const c1 = toCanvas(currentPos);
            const c2 = toCanvas(destPos);

            let cx = snapToGrid(Math.round((c1.x + c2.x) / 2));
            let cy = snapToGrid(Math.round((c1.y + c2.y) / 2));
            if (c1.x === c2.x) cx = c1.x;
            if (c1.y === c2.y) cy = c1.y;

            const isPathVertical = Math.abs(c1.y - c2.y) >= Math.abs(c1.x - c2.x);
            const rotation = isPathVertical ? 90 : 0;

            const compId = `comp_tex_${Date.now()}_${compCounter++}`;
            components.push({
              id: compId,
              type: compType,
              label: cLabel,
              value: cValue,
              x: cx,
              y: cy,
              rotation,
            });

            const pin1 = 'p1';
            const pin2 = 'p2';
            let pinForStart = pin1;
            let pinForEnd = pin2;

            if (isPathVertical) {
              if (c1.y > c2.y) { pinForStart = pin2; pinForEnd = pin1; }
            } else {
              if (c1.x > c2.x) { pinForStart = pin2; pinForEnd = pin1; }
            }

            registerPin(compId, pinForStart, currentPos);
            registerPin(compId, pinForEnd, destPos);
          }

          currentPos = destPos;
        }
      } else if (tm[5]) {
        // -- (DEST) ou -| (DEST) ou |- (DEST)
        const isRel = Boolean(tm[6]);
        const destRaw = tm[7].trim();
        const ptStr = (isRel ? tm[6] : '') + '(' + destRaw + ')';

        const destPos = resolvePoint(ptStr, currentPos);
        if (currentPos && destPos) {
          lineEdges.push({ p1: { ...currentPos }, p2: { ...destPos } });
          currentPos = destPos;
        }
      } else if (tm[8]) {
        // coordinate(NAME)
        const cName = tm[9].trim();
        if (currentPos) {
          namedCoords.set(cName, { ...currentPos });
        }
      } else if (tm[10]) {
        // node[OPTS] (NAME) {LABEL}
        const nodeOpts = (tm[11] || '').toLowerCase();
        const nodeId = tm[12] ? tm[12].trim() : `comp_tex_${Date.now()}_${compCounter++}`;
        const rawLabel = cleanLatexLabel(tm[13] || '');

        if (currentPos) {
          const cPos = toCanvas(currentPos);
          const isThreeInput = nodeOpts.includes('inputs=3');

          if (nodeOpts.includes('ground')) {
            const compId = nodeId;
            components.push({
              id: compId,
              type: 'GND',
              label: '',
              value: '',
              x: cPos.x,
              y: cPos.y + 20, // offset para alinhar o terminal p1 no topo
              rotation: 0,
            });
            registerPin(compId, 'p1', currentPos);
          } else if (nodeOpts.includes('vcc')) {
            const compId = nodeId;
            components.push({
              id: compId,
              type: 'VCC',
              label: rawLabel || '+VCC',
              value: rawLabel || '5V',
              x: cPos.x,
              y: cPos.y - 20,
              rotation: 0,
            });
            registerPin(compId, 'p1', currentPos);
          } else if (nodeOpts.includes('op amp') || nodeOpts.includes('opamp')) {
            const compId = nodeId;
            components.push({
              id: compId,
              type: 'OPAMP',
              label: rawLabel || compId,
              value: 'TL081',
              x: cPos.x,
              y: cPos.y,
              rotation: 0,
            });

            registerPin(compId, 'in_plus', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            registerPin(compId, 'in_minus', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'out', { x: currentPos.x + 0.5, y: currentPos.y });
            registerPin(compId, 'v_plus', { x: currentPos.x, y: currentPos.y + 0.5 });
            registerPin(compId, 'v_minus', { x: currentPos.x, y: currentPos.y - 0.5 });
          } else if (nodeOpts.includes('npn')) {
            const compId = nodeId;
            components.push({ id: compId, type: 'BJT_NPN', label: rawLabel || 'Q1', value: 'BC547', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'base', { x: currentPos.x - 0.375, y: currentPos.y });
            registerPin(compId, 'collector', { x: currentPos.x + 0.375, y: currentPos.y + 0.375 });
            registerPin(compId, 'emitter', { x: currentPos.x + 0.375, y: currentPos.y - 0.375 });
          } else if (nodeOpts.includes('pnp')) {
            const compId = nodeId;
            components.push({ id: compId, type: 'BJT_PNP', label: rawLabel || 'Q2', value: 'BC557', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'base', { x: currentPos.x - 0.375, y: currentPos.y });
            registerPin(compId, 'collector', { x: currentPos.x + 0.375, y: currentPos.y + 0.375 });
            registerPin(compId, 'emitter', { x: currentPos.x + 0.375, y: currentPos.y - 0.375 });
          } else if (nodeOpts.includes('not port')) {
            const compId = nodeId;
            components.push({ id: compId, type: 'GATE_NOT', label: rawLabel || 'U1', value: '74HC04', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'in_a', { x: currentPos.x - 0.375, y: currentPos.y });
            registerPin(compId, 'out', { x: currentPos.x + 0.375, y: currentPos.y });
          } else if (nodeOpts.includes('and port')) {
            const compId = nodeId;
            const gateType = isThreeInput ? 'GATE_AND3' : 'GATE_AND';
            components.push({ id: compId, type: gateType, label: rawLabel || 'U2', value: '74HC08', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'in_a', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'in_b', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            if (isThreeInput) registerPin(compId, 'in_c', { x: currentPos.x - 0.5, y: currentPos.y });
            registerPin(compId, 'out', { x: currentPos.x + 0.5, y: currentPos.y });
          } else if (nodeOpts.includes('nand port')) {
            const compId = nodeId;
            const gateType = isThreeInput ? 'GATE_NAND3' : 'GATE_NAND';
            components.push({ id: compId, type: gateType, label: rawLabel || 'U3', value: '74HC00', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'in_a', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'in_b', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            if (isThreeInput) registerPin(compId, 'in_c', { x: currentPos.x - 0.5, y: currentPos.y });
            registerPin(compId, 'out', { x: currentPos.x + 0.5, y: currentPos.y });
          } else if (nodeOpts.includes('or port')) {
            const compId = nodeId;
            const gateType = isThreeInput ? 'GATE_OR3' : 'GATE_OR';
            components.push({ id: compId, type: gateType, label: rawLabel || 'U4', value: '74HC32', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'in_a', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'in_b', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            if (isThreeInput) registerPin(compId, 'in_c', { x: currentPos.x - 0.5, y: currentPos.y });
            registerPin(compId, 'out', { x: currentPos.x + 0.5, y: currentPos.y });
          } else if (nodeOpts.includes('nor port')) {
            const compId = nodeId;
            const gateType = isThreeInput ? 'GATE_NOR3' : 'GATE_NOR';
            components.push({ id: compId, type: gateType, label: rawLabel || 'U5', value: '74HC02', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'in_a', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'in_b', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            if (isThreeInput) registerPin(compId, 'in_c', { x: currentPos.x - 0.5, y: currentPos.y });
            registerPin(compId, 'out', { x: currentPos.x + 0.5, y: currentPos.y });
          } else if (nodeOpts.includes('xor port')) {
            const compId = nodeId;
            components.push({ id: compId, type: 'GATE_XOR', label: rawLabel || 'U6', value: '74HC86', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'in_a', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'in_b', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            registerPin(compId, 'out', { x: currentPos.x + 0.5, y: currentPos.y });
          } else if (nodeOpts.includes('xnor port')) {
            const compId = nodeId;
            components.push({ id: compId, type: 'GATE_XNOR', label: rawLabel || 'U7', value: '74HC266', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'in_a', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'in_b', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            registerPin(compId, 'out', { x: currentPos.x + 0.5, y: currentPos.y });
          } else if (nodeOpts.includes('transformer')) {
            const compId = nodeId;
            components.push({ id: compId, type: 'TRANSFORMER', label: rawLabel || 'T1', value: '10:1', x: cPos.x, y: cPos.y, rotation: 0 });
            registerPin(compId, 'p1_in', { x: currentPos.x - 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'p2_in', { x: currentPos.x - 0.5, y: currentPos.y - 0.25 });
            registerPin(compId, 'sec1_out', { x: currentPos.x + 0.5, y: currentPos.y + 0.25 });
            registerPin(compId, 'sec2_out', { x: currentPos.x + 0.5, y: currentPos.y - 0.25 });
          } else if (rawLabel) {
            // Anotação textual ou rótulo de terminal
            const compId = `txt_${compCounter++}`;
            let textOffsetY = 0;
            let textOffsetX = 0;
            if (nodeOpts.includes('below')) textOffsetY = 24;
            else if (nodeOpts.includes('above')) textOffsetY = -24;
            else if (nodeOpts.includes('right')) textOffsetX = 30;
            else if (nodeOpts.includes('left')) textOffsetX = -30;

            components.push({
              id: compId,
              type: 'TEXT',
              label: rawLabel,
              value: rawLabel,
              x: cPos.x + textOffsetX,
              y: cPos.y + textOffsetY,
              rotation: 0,
            });
          }
        }
      } else if (tm[14]) {
        const destRaw = tm[15].trim();
        const pt = resolvePoint(destRaw, currentPos);
        if (pt) {
          currentPos = pt;
        }
      }
    }
  }

  // 3. GRAFO DE CONECTIVIDADE E GERAÇÃO INTELIGENTE DE FIOS E JUNÇÕES
  const graph = new Map<string, Set<string>>();
  const keyToCanvas = new Map<string, { x: number; y: number }>();

  const addEdge = (ptA: { x: number; y: number }, ptB: { x: number; y: number }) => {
    const cA = toCanvas(ptA);
    const cB = toCanvas(ptB);
    const kA = canvasKey(cA);
    const kB = canvasKey(cB);

    keyToCanvas.set(kA, cA);
    keyToCanvas.set(kB, cB);

    if (!graph.has(kA)) graph.set(kA, new Set());
    if (!graph.has(kB)) graph.set(kB, new Set());

    graph.get(kA)!.add(kB);
    graph.get(kB)!.add(kA);
  };

  lineEdges.forEach(({ p1, p2 }) => {
    addEdge(p1, p2);
  });

  const pinsAtKey = new Map<string, PinLoc[]>();
  pinLocations.forEach((pRef) => {
    const k = canvasKey(pRef.canvasPt);
    keyToCanvas.set(k, pRef.canvasPt);
    if (!pinsAtKey.has(k)) pinsAtKey.set(k, []);
    pinsAtKey.get(k)!.push(pRef);
    if (!graph.has(k)) graph.set(k, new Set());
  });

  // Conecta nós compartilhados
  pinsAtKey.forEach((pins) => {
    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const kA = canvasKey(pins[i].canvasPt);
        if (!graph.has(kA)) graph.set(kA, new Set());
      }
    }
  });

  const visited = new Set<string>();
  const nets: string[][] = [];

  graph.forEach((_, k) => {
    if (!visited.has(k)) {
      const netKeys: string[] = [];
      const queue = [k];
      visited.add(k);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        netKeys.push(curr);
        const neighbors = graph.get(curr) || new Set();
        neighbors.forEach((n) => {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        });
      }

      nets.push(netKeys);
    }
  });

  const createdWireKeys = new Set<string>();
  const addWireDirect = (
    fromRef: { componentId: string; pinId: string },
    toRef: { componentId: string; pinId: string },
    waypoints?: { x: number; y: number }[]
  ) => {
    if (fromRef.componentId === toRef.componentId) return;
    const k1 = `${fromRef.componentId}:${fromRef.pinId}-${toRef.componentId}:${toRef.pinId}`;
    const k2 = `${toRef.componentId}:${toRef.pinId}-${fromRef.componentId}:${fromRef.pinId}`;
    if (!createdWireKeys.has(k1) && !createdWireKeys.has(k2)) {
      createdWireKeys.add(k1);
      createdWireKeys.add(k2);
      wires.push({
        id: `wire_tex_${Date.now()}_${wires.length + 1}`,
        from: { componentId: fromRef.componentId, pinId: fromRef.pinId },
        to: { componentId: toRef.componentId, pinId: toRef.pinId },
        waypoints: waypoints && waypoints.length > 0 ? waypoints : undefined,
      });
    }
  };

  nets.forEach((netKeys) => {
    const netPins: PinLoc[] = [];
    netKeys.forEach((k) => {
      const pins = pinsAtKey.get(k) || [];
      pins.forEach((p) => netPins.push(p));
    });

    if (netPins.length < 2) return;

    // Critério universal de JUNCTION: grau de linhas + pinos >= 3
    const junctionCandidates = netKeys.filter((k) => {
      const deg = (graph.get(k) || new Set()).size;
      const pinsHere = (pinsAtKey.get(k) || []).length;
      return deg + pinsHere >= 3;
    });

    if (junctionCandidates.length > 0) {
      const junctionMap = new Map<string, { componentId: string; pinId: string; canvasPt: { x: number; y: number } }>();
      junctionCandidates.forEach((jk) => {
        const cPt = keyToCanvas.get(jk)!;
        const jId = `junc_tex_${Date.now()}_${compCounter++}`;
        components.push({
          id: jId,
          type: 'JUNCTION',
          label: '',
          value: '',
          x: cPt.x,
          y: cPt.y,
          rotation: 0,
        });
        const jRef = { componentId: jId, pinId: 'p1', canvasPt: cPt };
        junctionMap.set(jk, jRef);
        (pinsAtKey.get(jk) || []).forEach((p) => {
          addWireDirect(p, jRef);
        });
      });

      netPins.forEach((pRef) => {
        const pKey = canvasKey(pRef.canvasPt);
        if (junctionMap.has(pKey)) return;

        const q = [{ key: pKey, path: [pRef.canvasPt] }];
        const qVis = new Set([pKey]);
        let foundJunc: { jRef: { componentId: string; pinId: string }; path: { x: number; y: number }[] } | null = null;

        while (q.length > 0) {
          const { key: curK, path } = q.shift()!;
          if (junctionMap.has(curK)) {
            foundJunc = { jRef: junctionMap.get(curK)!, path };
            break;
          }
          (graph.get(curK) || new Set()).forEach((nb) => {
            if (!qVis.has(nb)) {
              qVis.add(nb);
              q.push({ key: nb, path: [...path, keyToCanvas.get(nb)!] });
            }
          });
        }

        if (foundJunc) {
          const waypoints = foundJunc.path.slice(1, -1);
          addWireDirect(pRef, foundJunc.jRef, waypoints);
        }
      });

      const jKeys = Array.from(junctionMap.keys());
      for (let i = 0; i < jKeys.length; i++) {
        for (let j = i + 1; j < jKeys.length; j++) {
          const startK = jKeys[i];
          const endK = jKeys[j];

          const q = [{ key: startK, path: [keyToCanvas.get(startK)!] }];
          const qVis = new Set([startK]);
          let pathFound: { x: number; y: number }[] | null = null;

          while (q.length > 0) {
            const { key: curK, path } = q.shift()!;
            if (curK === endK) {
              pathFound = path;
              break;
            }
            if (curK !== startK && junctionMap.has(curK)) continue;

            (graph.get(curK) || new Set()).forEach((nb) => {
              if (!qVis.has(nb)) {
                qVis.add(nb);
                q.push({ key: nb, path: [...path, keyToCanvas.get(nb)!] });
              }
            });
          }

          if (pathFound) {
            const waypoints = pathFound.slice(1, -1);
            addWireDirect(junctionMap.get(startK)!, junctionMap.get(endK)!, waypoints);
          }
        }
      }
    } else {
      // 2 pinos simples
      const startK = canvasKey(netPins[0].canvasPt);
      const endK = canvasKey(netPins[1].canvasPt);

      const q = [{ key: startK, path: [netPins[0].canvasPt] }];
      const qVis = new Set([startK]);
      let pathFound: { x: number; y: number }[] | null = null;

      while (q.length > 0) {
        const { key: curK, path } = q.shift()!;
        if (curK === endK) {
          pathFound = path;
          break;
        }
        (graph.get(curK) || new Set()).forEach((nb) => {
          if (!qVis.has(nb)) {
            qVis.add(nb);
            q.push({ key: nb, path: [...path, keyToCanvas.get(nb)!] });
          }
        });
      }

      const waypoints = pathFound ? pathFound.slice(1, -1) : undefined;
      addWireDirect(netPins[0], netPins[1], waypoints);
    }
  });

  // 4. Normalização do Bounding Box: posiciona o circuito no espaço visual ideal do canvas
  if (components.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    components.forEach((c) => {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
    });

    const targetMinX = 140;
    const targetMinY = 140;
    const shiftX = snapToGrid(targetMinX - minX);
    const shiftY = snapToGrid(targetMinY - minY);

    if (shiftX !== 0 || shiftY !== 0) {
      components.forEach((c) => {
        c.x += shiftX;
        c.y += shiftY;
      });
      wires.forEach((w) => {
        if (w.waypoints) {
          w.waypoints.forEach((wp) => {
            wp.x += shiftX;
            wp.y += shiftY;
          });
        }
      });
    }
  }

  return { components, wires };
}
