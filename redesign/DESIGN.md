---
name: Technical CAD Canvas
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-canvas: 1.5rem
  margin: 1rem
  margin-panel: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets electrical engineers, hardware prototypers, roboticists, and STEM students who require the surgical precision of KiCad combined with the fluid, cloud-native intuitiveness of Linear and Figma. 

The aesthetic is crisp, technical minimalism with tactile engineering cues. Interface chrome stays out of the user's way, foregrounding schematic geometry, netlists, and circuit parameters. Visual noise is systematically eliminated: structural depth relies on precise hairline dividers, soft neutral surfaces, and micro-elevation rather than heavy shadows or colorful decorative surfaces.

The emotional profile is confident, analytical, and frictionless. Users should feel an immediate sense of mechanical accuracy and clarity, supported by clean metric scales, monospace tabular data, tactile connection points, and instantaneous state responses during circuit simulations.

## Colors

The palette is engineered for prolonged analytical work under daylight and lab-grade lighting conditions:

- **Canvas & Surface Architecture**:
  - `canvas-base`: `#ffffff` — Infinite schematic background, breadboard area, and primary workspace.
  - `surface-subtle`: `#f8fafc` — Side inspectors, canvas tool palettes, dock headers, and collapsible toolbars.
  - `surface-muted`: `#f1f5f9` — Selected row strips, modal backdrops, inactive panel footers, and code view panes.
  - `border-subtle`: `#e2e8f0` — Standard 1px divider for docks, panels, and input frames.
  - `border-strong`: `#cbd5e1` — Focused controls, active splitters, and hovered schematic components.

- **Data & Typography**:
  - `text-primary`: `#0f172a` — Component titles, key schematic labels, active tool headings.
  - `text-secondary`: `#1e293b` — Parameter labels, node identifiers, inspector keys.
  - `text-muted`: `#475569` — Unfocused units, grid coordinates, shortcuts, inactive icons.
  - `text-disabled`: `#94a3b8` — Disabled toggles, unassigned pins, locked nets.

- **Functional & Accent Tokens**:
  - `primary` (`#2563eb`) & `primary-hover` (`#1d4ed8`): Primary actions, component selection bounds, routing paths in design mode, active tool highlights.
  - `secondary` (`#10b981`): Closed loops, high-logic states (`HIGH` / `1`), live continuous current paths, oscilloscope valid triggers, pass status.
  - `tertiary` (`#f59e0b`): Warning states, floating nets, didactic callouts, thermal dissipation alerts, floating pin warnings.
  - `error` (`#ef4444`): Short circuits, reverse polarity, DRC (Design Rule Check) violations, fatal simulation faults.

## Typography

The typographic hierarchy couples **Geist** for crisp human-interface ergonomics with **JetBrains Mono** for technical telemetry, electrical units, and code parameters.

- **System Typography**: Geist is set with tight letter tracking at headline sizes to emulate dense engineering HUDs. Body copy uses standard natural kerning for long-session legibility in properties and component libraries.
- **Unit & Telemetry Rule**: All physical dimensions, circuit ratings, values (e.g., `4.7 kΩ`, `12.0 V`, `350 mA`, `16.384 MHz`), coordinate pairs `(X, Y)`, pin designations, and register values must render in **JetBrains Mono** (`label-md` or `label-sm`).
- **Tabular Figures**: `font-variant-numeric: tabular-nums` is enforced across all numeric representations to prevent layout jittering during live simulation waveforms and voltage sweeps.

## Layout & Spacing

The tool employs an **App Workbench Model** arranged around a central primary canvas flanked by docked, resizable panes:

- **Workbench Grid**:
  - **Left Rail**: 280px fixed-minimum sidebar for the Component Vault, Hierarchical Netlist, and Footprint Browser.
  - **Main Canvas**: Fluid infinite workspace with a persistent orthogonal grid.
  - **Right Inspector**: 320px fixed-width parameter matrix, simulation monitor, and Design Rule Checker (DRC).
  - **Floating Dock**: Centered top/bottom tool palettes positioned with `margin: 1rem` from the viewport edge.

- **Subtle Dot Matrix Canvas**:
  - The infinite canvas renders a radial dot grid: `#cbd5e1` dots with a `1px` diameter on a `16px` by `16px` pitch. At zoom levels below 50%, dots drop to an `8px` minor / `32px` major division grid to maintain visual clarity.

- **Spacing Rhythm**:
  - Compact `0.25rem` (`space-xs`) and `0.5rem` (`space-sm`) steps govern input group spacing, pin labels, and toolbar buttons.
  - Panel headers, grouped inspector fields, and modal containers leverage `0.75rem` (`space-md`) and `1rem` (`space-lg`).

## Elevation & Depth

Visual hierarchy combines **low-contrast precision borders** with **surgical ambient micro-shadows**, ensuring that floating inspectors feel lifted above the schematic without obscuring dense circuit traces.

- **Level 0 (Workspace Canvas)**: 
  - Flat `#ffffff` surface with dot pattern. Traces, footprints, and silk markings sit directly on this plane.
- **Level 1 (Docked Sidebars & Panels)**:
  - Surface `#f8fafc`. Separated from the canvas by a crisp `1px solid #e2e8f0` stroke. No box shadow.
- **Level 2 (Floating Palettes & Toolbars - `shadow-sm`)**:
  - Surface `#ffffff`. Border `1px solid #e2e8f0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Inspector Overlays, Menus & Tooltips - `shadow-md`)**:
  - Surface `#ffffff`. Border `1px solid #cbd5e1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modal Dialogs & Simulation Probes)**:
  - Surface `#ffffff`. Border `1px solid #cbd5e1`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.

## Shapes

The interface balances sharp industrial utility with ergonomic modern software conventions:

- Base UI components (buttons, text inputs, segmented pills, dropdown triggers) use **soft corners** (`0.25rem` / `rounded-sm`).
- Inspector cards, floating canvas toolbars, and modal dialogs use **medium radii** (`0.5rem` / `rounded-lg`).
- Canvas components (IC DIP packages, breadboards, SMD pads, passive resistor/capacitor symbols) retain strict geometric, millimeter-accurate 90-degree edges, reserving rounded forms exclusively for wire junctions and solder filets.

## Components

### Buttons & Tool Triggers
- **Primary Action (Run Sim, Route Net)**: Background `#2563eb`, text `#ffffff`, border `1px solid #1d4ed8`. Hover: `#1d4ed8`. Active: `#1e40af`.
- **Secondary / Canvas Tool**: Background `#ffffff`, text `#1e293b`, border `1px solid #e2e8f0`. Hover: `#f8fafc` with border `#cbd5e1`. Active tool state uses `#f1f5f9` with text `#2563eb` and border `#2563eb`.
- **Icon Buttons**: Uniform `28px × 28px` hit target with `16px` icon size. Radius: `0.25rem`.

### Parameter Input Fields
- **Value & Unit Fields**: Composed input splitting text from unit. Input body `#ffffff`, border `1px solid #e2e8f0`, text `#0f172a` in `Geist`. The trailing unit indicator (e.g., `pF`, `kΩ`, `mA`) is rendered on a `#f8fafc` integrated badge in `JetBrains Mono` with text `#475569`.
- **Focus State**: `1px solid #2563eb` with a dual ring `0 0 0 1px #2563eb`.

### Chips & Badges
- **Status Badges**: Padding `2px 6px`, radius `0.25rem`, typography `label-sm`.
  - **Live / Simulating**: Background `#ecfdf5`, text `#065f46`, border `1px solid #a7f3d0`. Contains a pulsating `6px` circular `#10b981` node.
  - **DRC Warning**: Background `#fffbeb`, text `#92400e`, border `1px solid #fde68a`.
  - **Floating / Error**: Background `#fef2f2`, text `#991b1b`, border `1px solid #fecaca`.

### Lists & Hierarchies
- Dense row height of `28px`. Hover: `#f8fafc`. Active/Selected: `#f1f5f9` with a left indicator bar (`2px solid #2563eb`). Font size `12px` Geist with nested branch trees drawn via `#cbd5e1` hairline connectors.

### Checkboxes & Segmented Switches
- **Checkboxes**: `14px × 14px`, border `1px solid #cbd5e1`, radius `2px`. Checked: `#2563eb` with pure white checkmark icon.
- **Segmented Radio Bars**: Background `#f1f5f9`, padding `2px`, radius `0.25rem`. Selected pill: `#ffffff` with `shadow-sm` and text `#0f172a`.

### Cards & Inspector Panels
- Background `#ffffff`, border `1px solid #e2e8f0`, corner radius `0.5rem` (`rounded-lg`), subtle shadow `shadow-sm`. Header contains an explicit bottom divider `1px solid #f1f5f9`, uppercase `label-sm` title in `#475569`, and quick-action icon slots.

### Circuit Schematic Elements
- **Wires / Nets**: Standard unpowered traces are `#334155` at `1.5px` width. Active energized conductors switch to `#10b981` (`2px` width) with optional directional flow particles.
- **Junction Dots**: Solid `#0f172a` circle with `5px` diameter at three-way or four-way wire intersections.