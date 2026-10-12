# 📘 Documentação de Arquitetura e Funcionalidades — CircuitCraft Web

> **Diretriz para Agentes de IA / Desenvolvedores:** Este documento descreve a arquitetura, o contrato de estado e as regras de implementação do **CircuitCraft Web**. Todas as funcionalidades listadas como **FINALIZADAS** foram testadas e validadas. Nenhuma alteração regressiva deve ser feita nestas rotas sem preservação das assinaturas e comportamentos estabelecidos.

---

## 🛠️ 1. Visão Geral do Sistema

O **CircuitCraft Web** é uma aplicação React + TypeScript de alta precisão para projeto, edição e simulação de diagramas esquemáticos eletrônicos analógicos e digitais, com capacidade de compilação bidirecional para **LaTeX (CircuiTikZ)** e exportação gráfica de altíssima definição (PNG, PDF, SVG e JSON).

### 🧰 Stack Tecnológica
- **Core Framework:** React 19 + TypeScript.
- **Gerenciador de Estado:** Zustand (`useCircuitStore.ts`).
- **Renderização de Diagramas:** SVG Nativo reativo (`CircuitCanvas.tsx`, `ComponentSymbol.tsx`).
- **Estilização:** Tailwind CSS v4 + Design Tokens Customizados (Precision Workbench / Slate Dark-Light).
- **Ícones:** Lucide React.
- **Exportação Gráfica:** `html2canvas` + `jspdf` (`exportUtils.ts`).

---

## 🏗️ 2. Arquitetura de Estado e Dados (`src/types/circuit.ts` & `src/store/useCircuitStore.ts`)

### 📦 Estrutura de Componentes (`CircuitComponent`)
```typescript
export interface CircuitComponent {
  id: string;              // Identificador único (ex: "comp_1784851372745")
  type: ComponentType;      // Tipo de componente (ex: 'RESISTOR', 'BJT_NPN', 'GATE_OR3')
  label: string;           // Rótulo visível (ex: "R1", "Q1", "U4")
  value?: string;          // Valor nominal (ex: "10kΩ", "BC547", "100nF")
  x: number;               // Posição X no grid do Canvas (snap 20px)
  y: number;               // Posição Y no grid do Canvas (snap 20px)
  rotation: number;        // Rotação em graus (0, 90, 180, 270)
  mirrored?: boolean;      // Espelhamento horizontal (Flip H)
  color?: string;          // Cor opcional de indicação (ex: LED vermelho)
}
```

### ⚡ Estrutura de Condutores / Fios (`Wire`)
```typescript
export interface Wire {
  id: string;
  from: {
    componentId: string;   // ID do componente de origem
    pinId: string;         // ID do pino de origem (ex: "p1", "collector", "in_a")
  };
  to: {
    componentId: string;   // ID do componente de destino
    pinId: string;         // ID do pino de destino
  };
  waypoints?: Point[];     // Pontos intermediários de curvas ortogonais
  routingMode?: 'HV' | 'VH' | 'HVH'; // Modo de dobramento ortogonal
}
```

---

## 🎨 3. Catálogo de Componentes Finalizados

### 1. Passivos
- `RESISTOR` (Resistor $R$)
- `CAPACITOR` (Capacitor cerâmico/poliéster $C$)
- `CAPACITOR_POLAR` (Capacitor Eletrolítico $eC$)
- `TRANSFORMER` (Transformador de 4 pinos: `p1_in`, `p2_in`, `sec1_out`, `sec2_out`)

### 2. Diodos & Semicondutores de Potência
- `DIODE` (Diodo Retificador $D$)
- `DIODE_ZENER` (Diodo Zener $zzD$)
- `LED` (Diodo Emissor de Luz com seleção de cor)
- `THYRISTOR` (SCR / Tiristor)
- `TRIAC` (Triac de Potência)

### 3. Transistores
- `BJT_NPN` (Transistor Bipolar NPN — Pinos: `base`, `collector`, `emitter`)
- `BJT_PNP` (Transistor Bipolar PNP — Pinos: `base`, `collector`, `emitter`)
- `MOSFET_N` (MOSFET Canal N — Pinos: `gate`, `drain`, `source`)
- `MOSFET_P` (MOSFET Canal P — Pinos: `gate`, `drain`, `source`)

### 4. Analógicos
- `OPAMP` (Amplificador Operacional TL081/LM741 — Pinos: `in_minus`, `in_plus`, `out`, `v_plus`, `v_minus`)

### 5. Portas Lógicas Digitais (2 e 3 Entradas)
- `GATE_NOT` (Inversor NOT)
- `GATE_AND` (AND 2 Entradas) & `GATE_AND3` (AND 3 Entradas)
- `GATE_NAND` (NAND 2 Entradas) & `GATE_NAND3` (NAND 3 Entradas)
- `GATE_OR` (OR 2 Entradas) & `GATE_OR3` (OR 3 Entradas — Pinos: `in_a`, `in_b`, `in_c`, `out`)
- `GATE_NOR` (NOR 2 Entradas) & `GATE_NOR3` (NOR 3 Entradas)
- `GATE_XOR` (XOR 2 Entradas)
- `GATE_XNOR` (XNOR 2 Entradas)

### 6. Flip-Flops Digitais
- `FF_D` (Flip-Flop Tipo D)
- `FF_JK` (Flip-Flop Tipo JK)
- `FF_SR` (Flip-Flop Tipo SR)
- `FF_T` (Flip-Flop Tipo T)

### 7. Alimentação, Sinais & Junções
- `VCC` (Alimentação Positiva — Rótulo limpo, sem GND text)
- `GND` (Terra de Referência — Sem rótulos GND1/GND2 no símbolo SVG)
- `SOURCE_DC` (Fonte de Tensão Contínua)
- `SOURCE_AC` (Fonte de Sinal Alternado AC/Senoidal)
- `CLOCK` (Gerador de Pulso Digital)
- `LOGIC_INPUT` (Entrada Lógica Nível Alto/Baixo)
- `PROBE` (Ponteira de Teste/Osciloscópio)
- `JUNCTION` (Nó de Conexão de Fios / `node[circ]` no TikZ)

---

## ⌨️ 4. Atalhos de Teclado Finalizados

| Atalho | Ação Executada |
| :--- | :--- |
| `R` | Inserir Resistor (`RESISTOR`) no centro do Canvas |
| `G` | Inserir Terra (`GND`) no Canvas |
| `V` | Inserir Fonte DC (`SOURCE_DC`) no Canvas |
| `Ctrl + R` | Rotacionar componente selecionado (90°) |
| `Delete` / `Backspace` | Excluir componente(s) ou fio(s) selecionado(s) |
| `Ctrl + Z` | Desfazer (Undo) |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Refazer (Redo) |
| `Ctrl + A` | Selecionar todos os componentes do Canvas |
| `Ctrl + C` / `Ctrl + V` | Copiar e Colar componentes |
| `Espaço + Drag` | Pan (Arrastar tela) |
| `Mouse Wheel` | Zoom in / Zoom out progressivo com foco no cursor |

---

## 📐 5. Motor de Importação e Exportação CircuiTikZ LaTeX (`src/utils/circuitikzUtils.ts`)

### 📤 5.1. Exportação LaTeX (`exportToCircuitikz`)
- **Conexão Canônica:** Exporta cada bipolo em coordenadas reais ortogonais `\draw (p1) to[R, l={$R_1 = 10k\Omega$}] (p2);`.
- **Âncoras Nominais de Semicondutores:** Mapeia pinos de transistores diretamente para as âncoras nominais do CircuiTikZ:
  - Transistores: `(Q1.B)`, `(Q1.C)`, `(Q1.E)`
  - Transformadores: `(T1.A1)`, `(T1.A2)`, `(T1.B1)`, `(T1.B2)`
  - Portas Lógicas: `(U1.in 1)`, `(U1.in 2)`, `(U1.in 3)`, `(U1.out)`
- **Símbolos Terminais sem Rótulos Poluídos:** O Terra é acoplado como `node[ground]{}` e o $V_{CC}$ como `node[vcc]{$+5V$}`.
- **Sanitização TeX (`formatValueForLatex`):** Converte unidades automaticamente:
  - $\Omega \rightarrow \text{\textbackslash Omega}$
  - $\mu \rightarrow \text{\textbackslash mu}$
  - Palavras de texto $\rightarrow \text{\textbackslash text\{...\}}$ (ex: `\text{Vermelho}`)

### 📥 5.2. Importação LaTeX (`importFromCircuitikz`)
- **Suporte a Standalone Nodes:** Interpreta comandos `\node[...] (id) at (x,y) {};` e os converte em componentes do canvas.
- **Avaliador de Intersecção Ortogonal:** Suporta expressões TikZ complexas como `(0.5, 0 |- G0.in 1)`.
- **Deteção de Portas de 3 Entradas:** Identifica a opção `number inputs=3` e instancia automaticamente os componentes `GATE_AND3`, `GATE_OR3`, etc.
- **Escala de Conversão:** Fator fixo de $80\text{px/cm}$ para evitar sobreposição ou encavalamento de componentes no canvas.

---

## 🖼️ 6. Exportação Vetorial e Imagens (`src/utils/exportUtils.ts`)

- **Cálculo de Bounding Box Preciso:** Ao exportar para **PNG** ou **PDF**, a medição da área da imagem é calculada diretamente sobre o `<g id="main-circuit-group">`, eliminando o fundo retangular de 100% da tela e enquadrando exclusivamente o circuito desenhado.

---

## 🚫 7. Regras Absolutas de Preservação para Outros Agentes de IA

> [!CAUTION]
> **REGRAS DE CÓDIGO E UX QUE NÃO PODEM SER ALTERADAS OU REMOVIDAS:**

1. **Seleção de Componentes (Hit-box transparente):**
   - No arquivo `ComponentSymbol.tsx`, o retângulo transparente `<rect fill="transparent" />` ao redor do componente DEVE ser mantido. Ele garante que clicar na área próxima do componente o selecione facilmente sem exigir clique exato na linha fina SVG.

2. **Ocultação de Rótulos do GND:**
   - Componentes do tipo `GND` NUNCA devem exibir labels como `GND1`, `GND2` no canvas ou na exportação TeX.

3. **Invariância de Âncoras do BJT:**
   - As âncoras nominais do transistor NPN/PNP (`base`, `collector`, `emitter`) correspondem estritamente a `(Q1.B)`, `(Q1.C)` e `(Q1.E)` no LaTeX. Não reescreva para coordenadas numéricas genéricas.

4. **Idioma das Respostas:**
   - Qualquer comunicação no chat DEVE ser feita em **Português Brasileiro (pt-BR)**.
