import React from 'react';
import type { CircuitComponent, ComponentType } from '../../types/circuit';
import { COMPONENT_DEFINITIONS } from '../../utils/componentDefinitions';
import {
  ResistorSymbol,
  CapacitorSymbol,
  CapacitorPolarSymbol,
  TransformerSymbol,
} from '../Symbols/PassiveSymbols';
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
} from '../Symbols/SemiconductorSymbols';
import { OpAmpSymbol } from '../Symbols/AnalogSymbols';
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
} from '../Symbols/DigitalGateSymbols';
import {
  FlipFlopDSymbol,
  FlipFlopJkSymbol,
  FlipFlopSrSymbol,
  FlipFlopTSymbol,
  FlipFlopDNegSymbol,
  FlipFlopJkNegSymbol,
  FlipFlopSrNegSymbol,
  FlipFlopTNegSymbol,
} from '../Symbols/DigitalFlipFlopSymbols';
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
} from '../Symbols/PowerIOSymbols';

interface ComponentThumbnailProps {
  type: ComponentType;
}

export const ComponentThumbnail: React.FC<ComponentThumbnailProps> = ({ type }) => {
  const def = COMPONENT_DEFINITIONS[type];
  if (!def) return null;

  const dummyComponent: CircuitComponent = {
    id: 'preview',
    type,
    x: 0,
    y: 0,
    rotation: 0,
    mirrored: false,
    label: def.defaultLabel,
    value: def.defaultValue,
  };

  const renderSymbol = () => {
    switch (type) {
      case 'RESISTOR':
        return <ResistorSymbol component={dummyComponent} />;
      case 'CAPACITOR':
        return <CapacitorSymbol component={dummyComponent} />;
      case 'CAPACITOR_POLAR':
        return <CapacitorPolarSymbol component={dummyComponent} />;
      case 'TRANSFORMER':
        return <TransformerSymbol component={dummyComponent} />;
      case 'DIODE':
        return <DiodeSymbol component={dummyComponent} />;
      case 'DIODE_ZENER':
        return <DiodeZenerSymbol component={dummyComponent} />;
      case 'LED':
        return <LEDSymbol component={dummyComponent} />;
      case 'THYRISTOR':
        return <ThyristorSymbol component={dummyComponent} />;
      case 'TRIAC':
        return <TriacSymbol component={dummyComponent} />;
      case 'BJT_NPN':
        return <BjtNpnSymbol component={dummyComponent} />;
      case 'BJT_PNP':
        return <BjtPnpSymbol component={dummyComponent} />;
      case 'MOSFET_N':
        return <MosfetNSymbol component={dummyComponent} />;
      case 'MOSFET_P':
        return <MosfetPSymbol component={dummyComponent} />;
      case 'OPAMP':
        return <OpAmpSymbol component={dummyComponent} />;
      case 'GATE_NOT':
        return <GateNotSymbol component={dummyComponent} />;
      case 'GATE_AND':
        return <GateAndSymbol component={dummyComponent} />;
      case 'GATE_AND3':
        return <GateAnd3Symbol component={dummyComponent} />;
      case 'GATE_NAND':
        return <GateNandSymbol component={dummyComponent} />;
      case 'GATE_NAND3':
        return <GateNand3Symbol component={dummyComponent} />;
      case 'GATE_OR':
        return <GateOrSymbol component={dummyComponent} />;
      case 'GATE_OR3':
        return <GateOr3Symbol component={dummyComponent} />;
      case 'GATE_NOR':
        return <GateNorSymbol component={dummyComponent} />;
      case 'GATE_NOR3':
        return <GateNor3Symbol component={dummyComponent} />;
      case 'GATE_XOR':
        return <GateXorSymbol component={dummyComponent} />;
      case 'GATE_XNOR':
        return <GateXnorSymbol component={dummyComponent} />;
      case 'FF_D':
        return <FlipFlopDSymbol component={dummyComponent} />;
      case 'FF_JK':
        return <FlipFlopJkSymbol component={dummyComponent} />;
      case 'FF_SR':
        return <FlipFlopSrSymbol component={dummyComponent} />;
      case 'FF_T':
        return <FlipFlopTSymbol component={dummyComponent} />;
      case 'FF_D_NEG':
        return <FlipFlopDNegSymbol component={dummyComponent} />;
      case 'FF_JK_NEG':
        return <FlipFlopJkNegSymbol component={dummyComponent} />;
      case 'FF_SR_NEG':
        return <FlipFlopSrNegSymbol component={dummyComponent} />;
      case 'FF_T_NEG':
        return <FlipFlopTNegSymbol component={dummyComponent} />;
      case 'GND':
        return <GndSymbol component={dummyComponent} />;
      case 'VCC':
        return <VccSymbol component={dummyComponent} />;
      case 'SOURCE_DC':
        return <SourceDcSymbol component={dummyComponent} />;
      case 'SOURCE_AC':
        return <SourceAcSymbol component={dummyComponent} />;
      case 'CLOCK':
        return <ClockSymbol component={dummyComponent} />;
      case 'LOGIC_INPUT':
        return <LogicInputSymbol component={dummyComponent} />;
      case 'PROBE':
        return <ProbeSymbol component={dummyComponent} />;
      case 'PIN_TERMINAL':
        return <PinTerminalSymbol component={dummyComponent} />;
      case 'TEXT':
        return <TextSymbol component={dummyComponent} />;
      default:
        return null;
    }
  };

  const halfW = Math.max(def.width / 2 + 12, 42);
  const halfH = Math.max(def.height / 2 + 12, 32);
  const viewBox = `${-halfW} ${-halfH} ${halfW * 2} ${halfH * 2}`;

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full max-h-12 overflow-visible pointer-events-none select-none"
    >
      {renderSymbol()}
    </svg>
  );
};
