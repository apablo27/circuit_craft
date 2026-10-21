import React from 'react';
import type { CircuitComponent } from '../../types/circuit';
import { COMPONENT_DEFINITIONS } from '../../utils/componentDefinitions';
import { useCircuitStore } from '../../store/useCircuitStore';
import {
  ResistorSymbol,
  CapacitorSymbol,
  CapacitorPolarSymbol,
  TransformerSymbol,
} from './PassiveSymbols';
import {
  DiodeSymbol,
  DiodeZenerSymbol,
  LEDSymbol,
  ThyristorSymbol,
  TriacSymbol,
  BjtNpnSymbol,
  BjtPnpSymbol,
  MosfetNSymbol,
  MosfetPSymbol,
} from './SemiconductorSymbols';
import { OpAmpSymbol } from './AnalogSymbols';
import {
  GateNotSymbol,
  GateAndSymbol,
  GateAnd3Symbol,
  GateNandSymbol,
  GateNand3Symbol,
  GateOrSymbol,
  GateOr3Symbol,
  GateNorSymbol,
  GateNor3Symbol,
  GateXorSymbol,
  GateXnorSymbol,
} from './DigitalGateSymbols';
import {
  FlipFlopDSymbol,
  FlipFlopJkSymbol,
  FlipFlopSrSymbol,
  FlipFlopTSymbol,
  FlipFlopDNegSymbol,
  FlipFlopJkNegSymbol,
  FlipFlopSrNegSymbol,
  FlipFlopTNegSymbol,
} from './DigitalFlipFlopSymbols';
import {
  GndSymbol,
  VccSymbol,
  SourceDcSymbol,
  SourceAcSymbol,
  ClockSymbol,
  LogicInputSymbol,
  ProbeSymbol,
  PinTerminalSymbol,
  TextSymbol,
} from './PowerIOSymbols';

interface ComponentSymbolProps {
  component: CircuitComponent;
  isSelected?: boolean;
  onPinClick?: (pinId: string, e: React.MouseEvent) => void;
  onTextMouseDown?: (compId: string, type: 'label' | 'value', e: React.MouseEvent) => void;
  activePinId?: string | null;
}

export const ComponentSymbol: React.FC<ComponentSymbolProps> = ({
  component,
  isSelected,
  onPinClick,
  onTextMouseDown,
  activePinId,
}) => {
  const def = COMPONENT_DEFINITIONS[component.type];
  const { labelFontSize, valueFontSize } = useCircuitStore();

  if (!def) return null;

  const renderInnerSymbol = () => {
    switch (component.type) {
      // Passivos
      case 'RESISTOR':
        return <ResistorSymbol component={component} isSelected={isSelected} />;
      case 'CAPACITOR':
        return <CapacitorSymbol component={component} isSelected={isSelected} />;
      case 'CAPACITOR_POLAR':
        return <CapacitorPolarSymbol component={component} isSelected={isSelected} />;
      case 'TRANSFORMER':
        return <TransformerSymbol component={component} isSelected={isSelected} />;

      // Semicondutores Diodos
      case 'DIODE':
        return <DiodeSymbol component={component} isSelected={isSelected} />;
      case 'DIODE_ZENER':
        return <DiodeZenerSymbol component={component} isSelected={isSelected} />;
      case 'LED':
        return <LEDSymbol component={component} isSelected={isSelected} />;
      case 'THYRISTOR':
        return <ThyristorSymbol component={component} isSelected={isSelected} />;
      case 'TRIAC':
        return <TriacSymbol component={component} isSelected={isSelected} />;

      // Transistores
      case 'BJT_NPN':
        return <BjtNpnSymbol component={component} isSelected={isSelected} />;
      case 'BJT_PNP':
        return <BjtPnpSymbol component={component} isSelected={isSelected} />;
      case 'MOSFET_N':
        return <MosfetNSymbol component={component} isSelected={isSelected} />;
      case 'MOSFET_P':
        return <MosfetPSymbol component={component} isSelected={isSelected} />;

      // Analógicos
      case 'OPAMP':
        return <OpAmpSymbol component={component} isSelected={isSelected} />;

      // Portas Lógicas Digitais
      case 'GATE_NOT':
        return <GateNotSymbol component={component} isSelected={isSelected} />;
      case 'GATE_AND':
        return <GateAndSymbol component={component} isSelected={isSelected} />;
      case 'GATE_AND3':
        return <GateAnd3Symbol component={component} isSelected={isSelected} />;
      case 'GATE_NAND':
        return <GateNandSymbol component={component} isSelected={isSelected} />;
      case 'GATE_NAND3':
        return <GateNand3Symbol component={component} isSelected={isSelected} />;
      case 'GATE_OR':
        return <GateOrSymbol component={component} isSelected={isSelected} />;
      case 'GATE_OR3':
        return <GateOr3Symbol component={component} isSelected={isSelected} />;
      case 'GATE_NOR':
        return <GateNorSymbol component={component} isSelected={isSelected} />;
      case 'GATE_NOR3':
        return <GateNor3Symbol component={component} isSelected={isSelected} />;
      case 'GATE_XOR':
        return <GateXorSymbol component={component} isSelected={isSelected} />;
      case 'GATE_XNOR':
        return <GateXnorSymbol component={component} isSelected={isSelected} />;

      // Flip-Flops Digitais
      case 'FF_D':
        return <FlipFlopDSymbol component={component} isSelected={isSelected} />;
      case 'FF_JK':
        return <FlipFlopJkSymbol component={component} isSelected={isSelected} />;
      case 'FF_SR':
        return <FlipFlopSrSymbol component={component} isSelected={isSelected} />;
      case 'FF_T':
        return <FlipFlopTSymbol component={component} isSelected={isSelected} />;
      case 'FF_D_NEG':
        return <FlipFlopDNegSymbol component={component} isSelected={isSelected} />;
      case 'FF_JK_NEG':
        return <FlipFlopJkNegSymbol component={component} isSelected={isSelected} />;
      case 'FF_SR_NEG':
        return <FlipFlopSrNegSymbol component={component} isSelected={isSelected} />;
      case 'FF_T_NEG':
        return <FlipFlopTNegSymbol component={component} isSelected={isSelected} />;

      // Alimentação e E/S
      case 'GND':
        return <GndSymbol component={component} isSelected={isSelected} />;
      case 'VCC':
        return <VccSymbol component={component} isSelected={isSelected} />;
      case 'SOURCE_DC':
        return <SourceDcSymbol component={component} isSelected={isSelected} />;
      case 'SOURCE_AC':
        return <SourceAcSymbol component={component} isSelected={isSelected} />;
      case 'CLOCK':
        return <ClockSymbol component={component} isSelected={isSelected} />;
      case 'LOGIC_INPUT':
        return <LogicInputSymbol component={component} isSelected={isSelected} />;
      case 'PROBE':
        return <ProbeSymbol component={component} isSelected={isSelected} />;
      case 'PIN_TERMINAL':
        return <PinTerminalSymbol component={component} isSelected={isSelected} />;
      case 'TEXT':
        return <TextSymbol component={component} isSelected={isSelected} />;
      case 'JUNCTION':
        return null;

      default:
        return null;
    }
  };

  const transform = `translate(${component.x}, ${component.y}) rotate(${
    component.rotation
  }) scale(${component.mirrored ? -1 : 1}, 1)`;

  return (
    <g className="select-none cursor-pointer group" transform={transform}>
      {/* Área transparente estendida de captura de clique (Hit Box) */}
      <rect
        x={-def.width / 2 - 12}
        y={-def.height / 2 - 12}
        width={def.width + 24}
        height={def.height + 24}
        fill="transparent"
        className="pointer-events-auto"
      />

      {/* Caixa de seleção estilo CAD / Tinkercad */}
      {isSelected && (
        <g className="pointer-events-none">
          <rect
            x={-def.width / 2 - 12}
            y={-def.height / 2 - 12}
            width={def.width + 24}
            height={def.height + 24}
            rx="6"
            fill="#eff6ff"
            fillOpacity="0.8"
            stroke="#2563eb"
            strokeWidth="1.8"
            strokeDasharray="4 4"
          />
          {/* Âncoras nos 4 cantos */}
          <rect x={-def.width / 2 - 15} y={-def.height / 2 - 15} width="6" height="6" rx="1" fill="#2563eb" />
          <rect x={def.width / 2 + 9} y={-def.height / 2 - 15} width="6" height="6" rx="1" fill="#2563eb" />
          <rect x={-def.width / 2 - 15} y={def.height / 2 + 9} width="6" height="6" rx="1" fill="#2563eb" />
          <rect x={def.width / 2 + 9} y={def.height / 2 + 9} width="6" height="6" rx="1" fill="#2563eb" />
        </g>
      )}

      {/* Desenho do símbolo */}
      {renderInnerSymbol()}

      {/* Rótulo (Label ex: R1) e Valor (ex: 10 kΩ ±1%) com suporte a arrasto e halo branco */}
      {component.type !== 'JUNCTION' && component.type !== 'GND' && component.type !== 'TEXT' && (() => {
        const isVertical = component.rotation % 180 !== 0;
        const displayValue = [
          component.value,
          component.tolerance ? component.tolerance : '',
          component.frequency ? `, ${component.frequency}` : '',
        ]
          .filter(Boolean)
          .join(' ');

        const hasValue = Boolean(
          displayValue &&
          component.value !== component.label &&
          component.type !== 'PIN_TERMINAL'
        );

        const labelOffsetX = component.labelOffset?.x || 0;
        const labelOffsetY = component.labelOffset?.y || 0;
        const valueOffsetX = component.valueOffset?.x || 0;
        const valueOffsetY = component.valueOffset?.y || 0;

        if (isVertical) {
          const baseLabelX = hasValue ? -def.height / 2 - 8 : 0;
          const baseLabelY = hasValue ? 4 : -def.width / 2 - 8;
          const baseValueX = def.height / 2 + 8;
          const baseValueY = 4;

          return (
            <g
              transform={`rotate(${-component.rotation}) scale(${
                component.mirrored ? -1 : 1
              }, 1)`}
              className="select-none"
            >
              <text
                x={baseLabelX + labelOffsetX}
                y={baseLabelY + labelOffsetY}
                textAnchor={hasValue ? 'end' : 'middle'}
                fontSize={labelFontSize}
                fontWeight="700"
                fill="#0f172a"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinejoin="round"
                style={{ paintOrder: 'stroke fill' }}
                className="cursor-move pointer-events-auto select-none font-sans hover:fill-blue-600 transition-colors"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onTextMouseDown?.(component.id, 'label', e);
                }}
              >
                <title>Arraste para reposicionar identificador</title>
                {component.label}
              </text>

              {hasValue && (
                <text
                  x={baseValueX + valueOffsetX}
                  y={baseValueY + valueOffsetY}
                  textAnchor="start"
                  fontSize={valueFontSize}
                  fontWeight="600"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  style={{ paintOrder: 'stroke fill' }}
                  className="cursor-move pointer-events-auto select-none font-mono hover:fill-blue-800 transition-colors"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onTextMouseDown?.(component.id, 'value', e);
                  }}
                >
                  <title>Arraste para reposicionar especificação</title>
                  {displayValue}
                </text>
              )}
            </g>
          );
        }

        const baseLabelX = 0;
        const baseLabelY = -def.height / 2 - 7;
        const baseValueX = 0;
        const baseValueY = def.height / 2 + 18;

        return (
          <g
            transform={`rotate(${-component.rotation}) scale(${
              component.mirrored ? -1 : 1
            }, 1)`}
            className="select-none"
          >
            <text
              x={baseLabelX + labelOffsetX}
              y={baseLabelY + labelOffsetY}
              textAnchor="middle"
              fontSize={labelFontSize}
              fontWeight="700"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinejoin="round"
              style={{ paintOrder: 'stroke fill' }}
              className="cursor-move pointer-events-auto select-none font-sans hover:fill-blue-600 transition-colors"
              onMouseDown={(e) => {
                e.stopPropagation();
                onTextMouseDown?.(component.id, 'label', e);
              }}
            >
              <title>Arraste para reposicionar identificador</title>
              {component.label}
            </text>

            {hasValue && (
              <text
                x={baseValueX + valueOffsetX}
                y={baseValueY + valueOffsetY}
                textAnchor="middle"
                fontSize={valueFontSize}
                fontWeight="600"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinejoin="round"
                style={{ paintOrder: 'stroke fill' }}
                className="cursor-move pointer-events-auto select-none font-mono hover:fill-blue-800 transition-colors"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onTextMouseDown?.(component.id, 'value', e);
                }}
              >
                <title>Arraste para reposicionar especificação</title>
                {displayValue}
              </text>
            )}
          </g>
        );
      })()}

      {/* Pinos de conexão (Snapping points) */}
      {def.pins.map((pin) => {
        const isActive = activePinId === pin.id;
        return (
          <g
            key={pin.id}
            transform={`translate(${pin.relX}, ${pin.relY})`}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick?.(pin.id, e);
            }}
            className="cursor-crosshair group/pin"
          >
            {/* Halo invisível ampliado para facilitar o clique */}
            <circle cx="0" cy="0" r="10" fill="transparent" />
            {/* Ponto do pino */}
            <circle
              cx="0"
              cy="0"
              r={isActive ? '6' : '4'}
              fill={isActive ? '#4f46e5' : '#0f172a'}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-150 group-hover/pin:scale-150 group-hover/pin:fill-indigo-600"
            />
          </g>
        );
      })}
    </g>
  );
};
