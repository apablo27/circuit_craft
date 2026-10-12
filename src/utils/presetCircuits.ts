import type { CircuitComponent, Wire } from '../types/circuit';

export interface PresetResult {
  components: CircuitComponent[];
  wires: Wire[];
}

let presetIdCounter = 1;
function genId(prefix: string) {
  return `${prefix}_preset_${Date.now()}_${presetIdCounter++}`;
}

/**
 * Gerador 1: Ponte Retificadora de Diodos em Formato de Diamante
 */
export function generateBridgeRectifier(cx: number = 400, cy: number = 300): PresetResult {
  const d1Id = genId('comp_D1');
  const d2Id = genId('comp_D2');
  const d3Id = genId('comp_D3');
  const d4Id = genId('comp_D4');

  const jTopId = genId('comp_JTop');
  const jBotId = genId('comp_JBot');
  const jLeftId = genId('comp_JLeft');
  const jRightId = genId('comp_JRight');

  const components: CircuitComponent[] = [
    // 4 Nós de Junção nos vértices do losango
    { id: jTopId, type: 'JUNCTION', label: '', value: '', x: cx, y: cy - 120, rotation: 0 },
    { id: jBotId, type: 'JUNCTION', label: '', value: '', x: cx, y: cy + 120, rotation: 0 },
    { id: jLeftId, type: 'JUNCTION', label: '', value: '', x: cx - 120, y: cy, rotation: 0 },
    { id: jRightId, type: 'JUNCTION', label: '', value: '', x: cx + 120, y: cy, rotation: 0 },

    // 4 Diodos no formato clássico de losango (diagonais em 45º / 135º / 225º / 315º)
    { id: d1Id, type: 'DIODE', label: 'D1', value: '1N4007', x: cx - 60, y: cy - 60, rotation: 315 },
    { id: d2Id, type: 'DIODE', label: 'D2', value: '1N4007', x: cx + 60, y: cy - 60, rotation: 45 },
    { id: d3Id, type: 'DIODE', label: 'D3', value: '1N4007', x: cx - 60, y: cy + 60, rotation: 225 },
    { id: d4Id, type: 'DIODE', label: 'D4', value: '1N4007', x: cx + 60, y: cy + 60, rotation: 135 },
  ];

  const wires: Wire[] = [
    // Ramo Superior-Esquerdo (D1)
    { id: genId('w'), from: { componentId: jLeftId, pinId: 'p1' }, to: { componentId: d1Id, pinId: 'anode' }, routingMode: 'HV' },
    { id: genId('w'), from: { componentId: d1Id, pinId: 'cathode' }, to: { componentId: jTopId, pinId: 'p1' }, routingMode: 'HV' },

    // Ramo Superior-Direito (D2)
    { id: genId('w'), from: { componentId: jTopId, pinId: 'p1' }, to: { componentId: d2Id, pinId: 'anode' }, routingMode: 'VH' },
    { id: genId('w'), from: { componentId: d2Id, pinId: 'cathode' }, to: { componentId: jRightId, pinId: 'p1' }, routingMode: 'VH' },

    // Ramo Inferior-Esquerdo (D3)
    { id: genId('w'), from: { componentId: jBotId, pinId: 'p1' }, to: { componentId: d3Id, pinId: 'anode' }, routingMode: 'VH' },
    { id: genId('w'), from: { componentId: d3Id, pinId: 'cathode' }, to: { componentId: jLeftId, pinId: 'p1' }, routingMode: 'VH' },

    // Ramo Inferior-Direito (D4)
    { id: genId('w'), from: { componentId: jRightId, pinId: 'p1' }, to: { componentId: d4Id, pinId: 'anode' }, routingMode: 'HV' },
    { id: genId('w'), from: { componentId: d4Id, pinId: 'cathode' }, to: { componentId: jBotId, pinId: 'p1' }, routingMode: 'HV' },
  ];

  return { components, wires };
}

/**
 * Gerador 2: Circuito Básico de LED com Resistor de Proteção
 */
export function generateLedCircuit(cx: number = 400, cy: number = 300): PresetResult {
  const vccId = genId('comp_VCC');
  const r1Id = genId('comp_R1');
  const led1Id = genId('comp_LED1');
  const gndId = genId('comp_GND');

  const components: CircuitComponent[] = [
    { id: vccId, type: 'VCC', label: 'VCC', value: '+5V', x: cx, y: cy - 120, rotation: 0 },
    { id: r1Id, type: 'RESISTOR', label: 'R1', value: '220Ω', x: cx, y: cy - 40, rotation: 90 },
    { id: led1Id, type: 'LED', label: 'LED1', value: 'Vermelho', x: cx, y: cy + 40, rotation: 90 },
    { id: gndId, type: 'GND', label: 'GND', value: '0V', x: cx, y: cy + 120, rotation: 0 },
  ];

  const wires: Wire[] = [
    { id: genId('w'), from: { componentId: vccId, pinId: 'p1' }, to: { componentId: r1Id, pinId: 'p1' } },
    { id: genId('w'), from: { componentId: r1Id, pinId: 'p2' }, to: { componentId: led1Id, pinId: 'anode' } },
    { id: genId('w'), from: { componentId: led1Id, pinId: 'cathode' }, to: { componentId: gndId, pinId: 'p1' } },
  ];

  return { components, wires };
}

/**
 * Gerador 3: N Resistores em Paralelo
 */
export function generateParallelResistors(count: number = 3, cx: number = 400, cy: number = 300): PresetResult {
  const safeCount = Math.max(2, Math.min(10, count));
  const spacing = 100;
  const startX = cx - ((safeCount - 1) * spacing) / 2;

  const components: CircuitComponent[] = [];
  const wires: Wire[] = [];

  const topJunctions: string[] = [];
  const botJunctions: string[] = [];

  for (let i = 0; i < safeCount; i++) {
    const rx = startX + i * spacing;
    const rId = genId(`comp_R${i + 1}`);
    const jTopId = genId(`jTop_${i}`);
    const jBotId = genId(`jBot_${i}`);

    components.push(
      { id: rId, type: 'RESISTOR', label: `R${i + 1}`, value: '10kΩ', x: rx, y: cy, rotation: 90 },
      { id: jTopId, type: 'JUNCTION', label: '', value: '', x: rx, y: cy - 70, rotation: 0 },
      { id: jBotId, type: 'JUNCTION', label: '', value: '', x: rx, y: cy + 70, rotation: 0 }
    );

    topJunctions.push(jTopId);
    botJunctions.push(jBotId);

    // Fio vertical conectando o nó ao pino do resistor
    wires.push(
      { id: genId('w'), from: { componentId: jTopId, pinId: 'p1' }, to: { componentId: rId, pinId: 'p1' } },
      { id: genId('w'), from: { componentId: rId, pinId: 'p2' }, to: { componentId: jBotId, pinId: 'p1' } }
    );
  }

  // Fios horizontais interconectando o barramento superior e inferior
  for (let i = 0; i < safeCount - 1; i++) {
    wires.push(
      { id: genId('w'), from: { componentId: topJunctions[i], pinId: 'p1' }, to: { componentId: topJunctions[i + 1], pinId: 'p1' } },
      { id: genId('w'), from: { componentId: botJunctions[i], pinId: 'p1' }, to: { componentId: botJunctions[i + 1], pinId: 'p1' } }
    );
  }

  return { components, wires };
}

/**
 * Gerador 4: N Resistores em Série
 */
export function generateSeriesResistors(count: number = 3, cx: number = 400, cy: number = 300): PresetResult {
  const safeCount = Math.max(2, Math.min(10, count));
  const spacing = 120;
  const startX = cx - ((safeCount - 1) * spacing) / 2;

  const components: CircuitComponent[] = [];
  const wires: Wire[] = [];

  for (let i = 0; i < safeCount; i++) {
    const rx = startX + i * spacing;
    const rId = genId(`comp_R${i + 1}`);

    components.push({
      id: rId,
      type: 'RESISTOR',
      label: `R${i + 1}`,
      value: '10kΩ',
      x: rx,
      y: cy,
      rotation: 0,
    });
  }

  // Conecta o pino 2 de R_i ao pino 1 de R_{i+1}
  for (let i = 0; i < safeCount - 1; i++) {
    wires.push({
      id: genId('w'),
      from: { componentId: components[i].id, pinId: 'p2' },
      to: { componentId: components[i + 1].id, pinId: 'p1' },
    });
  }

  return { components, wires };
}

/**
 * Gerador 5: Contador Assíncrono de 3 bits com Flip-Flop JK (74HC73)
 */
export function generateJKCounter3Bit(cx: number = 400, cy: number = 300): PresetResult {
  const clkId = genId('comp_CLK');
  const vccTopId = genId('comp_VCC_Top');
  const vccBotId = genId('comp_VCC_Bot');
  const ff0Id = genId('comp_FF0');
  const ff1Id = genId('comp_FF1');
  const ff2Id = genId('comp_FF2');
  const p0Id = genId('comp_P0');
  const p1Id = genId('comp_P1');
  const p2Id = genId('comp_P2');

  const components: CircuitComponent[] = [
    { id: clkId, type: 'CLOCK', label: 'CLK', value: '1Hz', x: cx - 320, y: cy, rotation: 0 },

    // VCC Superior para entradas J e K
    { id: vccTopId, type: 'VCC', label: 'VCC_JK', value: '+5V', x: cx, y: cy - 140, rotation: 0 },
    // VCC Inferior para entradas CLR (manter desativado em 1)
    { id: vccBotId, type: 'VCC', label: 'VCC_CLR', value: '+5V', x: cx - 320, y: cy + 110, rotation: 0 },

    // 3 Flip-Flops JK (74HC73) espaçados
    { id: ff0Id, type: 'FF_JK', label: 'FF0', value: '74HC73', x: cx - 200, y: cy, rotation: 0 },
    { id: ff1Id, type: 'FF_JK', label: 'FF1', value: '74HC73', x: cx, y: cy, rotation: 0 },
    { id: ff2Id, type: 'FF_JK', label: 'FF2', value: '74HC73', x: cx + 200, y: cy, rotation: 0 },

    // Probes para exibição das saídas (posicionados à direita de cada FF)
    { id: p0Id, type: 'PROBE', label: 'Q0 (LSB)', value: 'BIT0', x: cx - 120, y: cy + 110, rotation: 90 },
    { id: p1Id, type: 'PROBE', label: 'Q1', value: 'BIT1', x: cx + 80, y: cy + 110, rotation: 90 },
    { id: p2Id, type: 'PROBE', label: 'Q2 (MSB)', value: 'BIT2', x: cx + 280, y: cy + 110, rotation: 90 },
  ];

  const wires: Wire[] = [
    // Clock principal para o 1º Flip-Flop (FF0)
    { id: genId('w'), from: { componentId: clkId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'clk' } },

    // Barramento VCC Superior ligando J e K em HIGH
    { id: genId('w'), from: { componentId: vccTopId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'j' } },
    { id: genId('w'), from: { componentId: vccTopId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'k' } },

    { id: genId('w'), from: { componentId: vccTopId, pinId: 'p1' }, to: { componentId: ff1Id, pinId: 'j' } },
    { id: genId('w'), from: { componentId: vccTopId, pinId: 'p1' }, to: { componentId: ff1Id, pinId: 'k' } },

    { id: genId('w'), from: { componentId: vccTopId, pinId: 'p1' }, to: { componentId: ff2Id, pinId: 'j' } },
    { id: genId('w'), from: { componentId: vccTopId, pinId: 'p1' }, to: { componentId: ff2Id, pinId: 'k' } },

    // Barramento VCC Inferior ligando os pinos CLR em HIGH (desativa o Clear)
    { id: genId('w'), from: { componentId: vccBotId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'clr' } },
    { id: genId('w'), from: { componentId: vccBotId, pinId: 'p1' }, to: { componentId: ff1Id, pinId: 'clr' } },
    { id: genId('w'), from: { componentId: vccBotId, pinId: 'p1' }, to: { componentId: ff2Id, pinId: 'clr' } },

    // Cascata de Clocks (Saída Q de cada estágio entra no clock do próximo)
    { id: genId('w'), from: { componentId: ff0Id, pinId: 'q' }, to: { componentId: ff1Id, pinId: 'clk' } },
    { id: genId('w'), from: { componentId: ff1Id, pinId: 'q' }, to: { componentId: ff2Id, pinId: 'clk' } },

    // Conexões das sondas indicadoras (Probes) diretamente da saída Q de cada FF
    { id: genId('w'), from: { componentId: ff0Id, pinId: 'q' }, to: { componentId: p0Id, pinId: 'p1' } },
    { id: genId('w'), from: { componentId: ff1Id, pinId: 'q' }, to: { componentId: p1Id, pinId: 'p1' } },
    { id: genId('w'), from: { componentId: ff2Id, pinId: 'q' }, to: { componentId: p2Id, pinId: 'p1' } },
  ];

  return { components, wires };
}

/**
 * Gerador 6: Registrador de Deslocamento SISO de 3 bits com Flip-Flop D (74HC74)
 */
export function generateSisoRegister3Bit(cx: number = 400, cy: number = 300): PresetResult {
  const inDataId = genId('comp_In');
  const clkId = genId('comp_CLK');
  const vccId = genId('comp_VCC');
  const ff0Id = genId('comp_FF0');
  const ff1Id = genId('comp_FF1');
  const ff2Id = genId('comp_FF2');
  const outDataId = genId('comp_Out');

  const components: CircuitComponent[] = [
    { id: inDataId, type: 'LOGIC_INPUT', label: 'D_in', value: '0', x: cx - 300, y: cy - 20, rotation: 0 },
    { id: clkId, type: 'CLOCK', label: 'CLK', value: '1Hz', x: cx, y: cy + 140, rotation: 0 },
    { id: vccId, type: 'VCC', label: 'VCC', value: '+5V', x: cx, y: cy - 140, rotation: 0 },

    // 3 Flip-Flops D (74HC74)
    { id: ff0Id, type: 'FF_D', label: 'FF0', value: '74HC74', x: cx - 180, y: cy, rotation: 0 },
    { id: ff1Id, type: 'FF_D', label: 'FF1', value: '74HC74', x: cx, y: cy, rotation: 0 },
    { id: ff2Id, type: 'FF_D', label: 'FF2', value: '74HC74', x: cx + 180, y: cy, rotation: 0 },

    // Saída Serial (SISO Out)
    { id: outDataId, type: 'PROBE', label: 'D_out', value: 'SISO_OUT', x: cx + 300, y: cy - 20, rotation: 0 },
  ];

  const wires: Wire[] = [
    // Entrada serial de dados para o D do 1º Flip-Flop
    { id: genId('w'), from: { componentId: inDataId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'd' } },

    // Encadeamento serial (Q_i -> D_{i+1})
    { id: genId('w'), from: { componentId: ff0Id, pinId: 'q' }, to: { componentId: ff1Id, pinId: 'd' } },
    { id: genId('w'), from: { componentId: ff1Id, pinId: 'q' }, to: { componentId: ff2Id, pinId: 'd' } },

    // Saída serial final
    { id: genId('w'), from: { componentId: ff2Id, pinId: 'q' }, to: { componentId: outDataId, pinId: 'p1' } },

    // Barramento de Clock em paralelo para sincronismo dos 3 estágios
    { id: genId('w'), from: { componentId: clkId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'clk' } },
    { id: genId('w'), from: { componentId: clkId, pinId: 'p1' }, to: { componentId: ff1Id, pinId: 'clk' } },
    { id: genId('w'), from: { componentId: clkId, pinId: 'p1' }, to: { componentId: ff2Id, pinId: 'clk' } },

    // Pinos PRE e CLR mantidos em VCC (desativados)
    { id: genId('w'), from: { componentId: vccId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'pre' } },
    { id: genId('w'), from: { componentId: vccId, pinId: 'p1' }, to: { componentId: ff0Id, pinId: 'clr' } },
    { id: genId('w'), from: { componentId: vccId, pinId: 'p1' }, to: { componentId: ff1Id, pinId: 'pre' } },
    { id: genId('w'), from: { componentId: vccId, pinId: 'p1' }, to: { componentId: ff1Id, pinId: 'clr' } },
    { id: genId('w'), from: { componentId: vccId, pinId: 'p1' }, to: { componentId: ff2Id, pinId: 'pre' } },
    { id: genId('w'), from: { componentId: vccId, pinId: 'p1' }, to: { componentId: ff2Id, pinId: 'clr' } },
  ];

  return { components, wires };
}
