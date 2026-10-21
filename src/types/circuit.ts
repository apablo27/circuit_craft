export type ComponentType =
  // Passivos
  | 'RESISTOR'
  | 'CAPACITOR'
  | 'CAPACITOR_POLAR'
  | 'TRANSFORMER'
  // Semicondutores Diodos
  | 'DIODE'
  | 'DIODE_ZENER'
  | 'LED'
  | 'THYRISTOR'
  | 'TRIAC'
  // Transistores
  | 'BJT_NPN'
  | 'BJT_PNP'
  | 'MOSFET_N'
  | 'MOSFET_P'
  // Analógicos
  | 'OPAMP'
  // Portas Lógicas Digitais
  | 'GATE_NOT'
  | 'GATE_AND'
  | 'GATE_AND3'
  | 'GATE_NAND'
  | 'GATE_NAND3'
  | 'GATE_OR'
  | 'GATE_OR3'
  | 'GATE_NOR'
  | 'GATE_NOR3'
  | 'GATE_XOR'
  | 'GATE_XNOR'
  // Flip-Flops Digitais (Borda de Subida)
  | 'FF_D'
  | 'FF_JK'
  | 'FF_SR'
  | 'FF_T'
  // Flip-Flops Digitais (Borda de Descida)
  | 'FF_D_NEG'
  | 'FF_JK_NEG'
  | 'FF_SR_NEG'
  | 'FF_T_NEG'
  // Fontes, Alimentação e Entradas/Saídas
  | 'VCC'
  | 'GND'
  | 'SOURCE_DC'
  | 'SOURCE_AC'
  | 'CLOCK'
  | 'LOGIC_INPUT'
  | 'PROBE'
  // Pino / Terminal de Sinal
  | 'PIN_TERMINAL'
  // Anotação de Texto
  | 'TEXT'
  // Nó de Conexão / Junção Interativa
  | 'JUNCTION';

export type Category = 
  | 'PASSIVE'
  | 'DIODE'
  | 'TRANSISTOR'
  | 'ANALOG'
  | 'DIGITAL_GATES'
  | 'DIGITAL_FLIPFLOPS'
  | 'POWER_IO';

export interface Point {
  x: number;
  y: number;
}

export interface Pin {
  id: string;          // Ex: 'p1', 'p2', 'in_a', 'in_b', 'out', 'clk'
  label?: string;       // Ex: '+', '-', 'D', 'Q', 'CLK'
  relX: number;        // Coordenada X relativa ao centro do componente
  relY: number;        // Coordenada Y relativa ao centro do componente
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  category: Category;
  defaultLabel: string;
  defaultValue: string;
  width: number;
  height: number;
  pins: Pin[];
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  label: string;
  value: string;
  x: number;
  y: number;
  rotation: number;     // 0, 90, 180, 270
  mirrored?: boolean;
  inputsCount?: number; // Para portas lógicas (2, 3 ou 4)
  color?: string;       // Para LEDs, por exemplo ('red', 'green', 'blue')
  frequency?: string;   // Para fontes AC (ex: '60Hz')
  tolerance?: string;   // ex: '±1%', '±5%', '±10%'
  powerRating?: string; // ex: '0.25 W (1/4 W)'
  labelOffset?: Point;  // Deslocamento relativo X, Y do rótulo/identificador
  valueOffset?: Point;  // Deslocamento relativo X, Y do valor/especificação
}

export interface WireConnection {
  componentId: string;
  pinId: string;
}

export interface Wire {
  id: string;
  from: WireConnection;
  to: WireConnection;
  color?: string;
  waypoints?: Point[]; // Pontos intermediários manuais ou auto-gerados
  routingMode?: 'HV' | 'VH' | 'HVH';
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  scale: 1 | 2 | 4;     // Para PNG: 1x, 2x (High Res), 4x (Ultra HD 300DPI)
  background: 'transparent' | 'white';
  includeGrid: boolean;
}
