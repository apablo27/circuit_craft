---
name: CircuitCraft Web
description: Editor visual moderno e didático para desenho e exportação de esquemas elétricos e eletrônicos para uso acadêmico.
colors:
  primary: "#4f46e5"
  primary-deep: "#4338ca"
  primary-light: "#e0e7ff"
  neutral-bg: "#f8fafc"
  surface-card: "#ffffff"
  sidebar-bg: "#f1f5f9"
  border: "#e2e8f0"
  text-primary: "#0f172a"
  text-muted: "#64748b"
  accent-danger: "#dc2626"
  accent-success: "#16a34a"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: "1.25"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-secondary:
    backgroundColor: "{colors.sidebar-bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: CircuitCraft Web

## 1. Overview

**Creative North Star: "Precision Workbench"**

O CircuitCraft Web é uma aplicação voltada para a produtividade de estudantes e professores de engenharia. A interface adota uma postura **Técnica, Limpa e Moderna**, em que as ferramentas e o canvas assumem o papel central sem poluição visual. Diferente de softwares CAD/EDA legados da década de 1990, o sistema substitui menus sanfonados cinza por barras de ferramentas com atalhos diretos, feedback visual tátil em tempo real e um contraste nítido otimizado para exportação acadêmica (PNG, SVG, PDF e LaTeX/CircuiTikZ).

A estética prioriza clareza operacional sobre ornamentação excessiva. O canvas utiliza uma grade pontilhada neutra (dot-grid) com fundo suave, permitindo rápida orientação espacial no alinhamento de componentes passivos, semicondutores e fios. 

### Key Characteristics:
- **Ferramenta Invisível:** O foco permanece 100% no esquema elétrico; a UI ao redor é contida e altamente estruturada.
- **Rigor Técnico com Roupagem Moderna:** Símbolos elétricos padronizados (NEMA / IEEE / IEC) desenhados com traços limpos em SVG vetorizado.
- **Ergonomia e Alto Contraste:** Hierarquia de cinzas frios (`slate-50` a `slate-900`) com destaques em índigo vibrante (`#4f46e5`) para indicar estados ativos e ferramentas selecionadas.

---

## 2. Colors

A paleta de cores do CircuitCraft Web é estritamente **Restrita** (Restrained), garantindo que cores saturadas sejam reservadas exclusivamente para ação principal, seleção ativa, sinalização de conexão válida ou estado de erro.

### Primary
- **Indigo Primary** (`#4f46e5` / `oklch(55% 0.22 265)`): Cor de marca e ação primária. Utilizada no botão principal de exportação, destaque da logo e bordas de componentes/fios selecionados no canvas.
- **Indigo Deep** (`#4338ca`): Estado de `:hover` para botões primários.
- **Indigo Tint** (`#e0e7ff`): Fundo suave de chips, tags de versão e destaques de seleção secundários.

### Neutral
- **App Background / Canvas Base** (`#f8fafc`): Fundo limpo e neutro do canvas de desenho para maximizar a legibilidade dos símbolos.
- **Sidebar & Toolbar Surface** (`#f1f5f9`): Painéis laterais de componentes e caixas de ferramentas com sutil separação do canvas.
- **Card Surface** (`#ffffff`): Superfície branca de alta pureza para modais, popovers e painel de propriedades.
- **Border & Divider** (`#e2e8f0`): Divisórias suaves de 1px entre painéis e contornos de botões secundários.
- **Text Primary** (`#0f172a`): Texto principal de títulos e rótulos de alto contraste (cumpre WCAG AAA em fundo branco).
- **Text Muted** (`#64748b`): Rótulos secundários, descrições e unidades de medida.

### Accent / Semantics
- **Danger Red** (`#dc2626`): Botão de remoção/limpeza do canvas e indicação de erros de conexão.
- **Success Green** (`#16a34a`): Indicador de nós elétricos conectados corretamente e confirmações.

### Named Rules
**The One Accent Rule.** A cor Indigo (`#4f46e5`) nunca deve cobrir mais de 10% de qualquer tela. Sua raridade é o que garante ao usuário identificação instantânea do foco de ação.

---

## 3. Typography

O sistema utiliza exclusivamente a família **Inter** (com pilha fallback do sistema), priorizando escaneabilidade em interfaces de dados compactos e labels de engenharia.

**Display / Headings:** Inter (Bold 700 / SemiBold 600)  
**Body & UI Text:** Inter (Regular 400 / Medium 500)  
**Monospace / Values:** Fontes com numerais tabulares para coordenadas X/Y, ângulos e valores elétricos (ex: `10kΩ`, `5V`).

### Hierarchy
- **Display** (Bold, 1.125rem / 18px, line-height 1.25): Título da aplicação no Header.
- **Title / Section Header** (SemiBold, 0.875rem / 14px, line-height 1.4): Títulos das categorias da paleta de componentes e cabeçalhos do inspector.
- **Body** (Regular, 0.875rem / 14px, line-height 1.5): Textos explicativos em modais e labels principais.
- **Label / Small** (Medium, 0.75rem / 12px, letter-spacing 0.02em): Rótulos de propriedades, valores de resistores/capacitores, atalhos de teclado e porcentagem de zoom.

### Named Rules
**The Fixed Scale Rule.** Por se tratar de um software de produtividade/CAD, a tipografia segue escala fixa em `rem/px` em vez de escalas fluidas (`clamp()`). A previsibilidade dos tamanhos em painéis de propriedades é indispensável para evitar quebra de layout em diferentes resoluções.

---

## 4. Elevation

O CircuitCraft Web adota um modelo híbrido com foco em **Camadas Tonalizadas e Bordas Finas (Tonal Layering)** no estado de repouso, aplicando sombras difusas sutis apenas em elementos flutuantes e modais.

### Shadow Vocabulary
- **Subtle Card Shadow** (`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Aplicada ao Header e ao painel de propriedades.
- **Floating Modal Shadow** (`0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Reservada para os modais de Exportação de Imagem e LaTeX CircuiTikZ.
- **Focus Glow** (`0 0 0 2px #e0e7ff`): Anel de foco para acessibilidade via teclado.

### Named Rules
**The Flat Canvas Rule.** Elementos desenhados dentro da área de trabalho (fios, componentes elétricos, nós de junção) são 100% flat e vetoriais sem sombras projetadas, garantindo fidelidade perfeita para exportação em vetores limpos para publicações acadêmicas.

---

## 5. Components

### Primary Buttons
- **Shape:** Arredondado suave (6px a 8px radius).
- **Style:** Fundo Indigo (`#4f46e5`), texto branco em negrito técnico (12px/14px).
- **Hover/Active:** `:hover` com escurecimento (`#4338ca`), `:active` com efeito sutil de escala (`scale(0.98)`).

### Secondary & Tool Buttons
- **Shape:** Arredondado (8px radius).
- **Style:** Fundo cinza suave (`#f1f5f9`), texto `slate-700`, borda sutil `slate-200`.
- **Hover:** Transição suave para fundo `slate-200`.

### Component Drag Palette (Sidebar)
- **Container:** Painel lateral fixo (`w-64` ou `w-72`), fundo `slate-100/80` com barra de rolagem customizada e fina.
- **Items:** Cards de componentes em formato de grade (2 colunas) com pré-visualização vetorial SVG centralizada e rótulo explicativo.

### Canvas Grid & Terminals
- **Grid:** Padrão de pontos a cada 20px (`dot-grid`) para alinhamento ortogonal automático dos condutores.
- **Terminais / Pinos:** Círculos de conexão (`r=4px`) que destacam em verde ou azul ao passar o cursor com a ferramenta Fio ativa.

---

## 6. Do's and Don'ts

### Do:
- **Do** Manter traços e textos em alto contraste (`slate-900` sobre `slate-50` ou branco) garantindo aprovação em testes de impressão acadêmica.
- **Do** Garantir que todos os botões de ação e ferramentas possuam estados claros de `:hover`, `:disabled` e `:focus-visible`.
- **Do** Manter as exportações em SVG e PNG limpas sem renderizar artefatos de UI do editor (ex: seletores de manipulação ou grade de fundo, a menos que solicitado).

### Don't:
- **Don't** Utilizar paletas de cinza escuro opaco/monótono dos anos 90 sem variação tonal moderna.
- **Don't** Usar gradientes decorativos no texto ou nas linhas dos circuitos.
- **Don't** Utilizar fontes decorativas ou cursivas nos rótulos de componentes ou na interface do editor.
- **Don't** Ocultar funcionalidades essenciais atrás de menus suspensos profundos; manter ações frequentes na barra superior visível.
