import React from 'react';
import type { CircuitComponent } from '../../types/circuit';

interface SymbolProps {
  component: CircuitComponent;
  isSelected?: boolean;
}

export const ResistorSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      {/* Pinos de conexão */}
      <line x1="-40" y1="0" x2="-25" y2="0" strokeLinecap="round" />
      <line x1="25" y1="0" x2="40" y2="0" strokeLinecap="round" />
      {/* Desenho do Resistor (Zig-Zag IEEE) */}
      <path
        d="M -25 0 L -20 -10 L -10 10 L 0 -10 L 10 10 L 20 -10 L 25 0"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
};

export const CapacitorSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      {/* Pinos */}
      <line x1="-40" y1="0" x2="-8" y2="0" strokeLinecap="round" />
      <line x1="8" y1="0" x2="40" y2="0" strokeLinecap="round" />
      {/* Placas paralelas */}
      <line x1="-8" y1="-18" x2="-8" y2="18" strokeLinecap="round" />
      <line x1="8" y1="-18" x2="8" y2="18" strokeLinecap="round" />
    </g>
  );
};

export const CapacitorPolarSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      {/* Pinos */}
      <line x1="-40" y1="0" x2="-8" y2="0" strokeLinecap="round" />
      <line x1="8" y1="0" x2="40" y2="0" strokeLinecap="round" />
      {/* Placa positiva (Reta) */}
      <line x1="-8" y1="-18" x2="-8" y2="18" strokeLinecap="round" />
      {/* Placa negativa (Curva) */}
      <path d="M 8 -18 Q 0 0 8 18" fill="none" strokeLinecap="round" />
      {/* Sinal de + */}
      <text x="-16" y="-10" fontSize="12" fontWeight="bold" fill="#6366f1" stroke="none">+</text>
    </g>
  );
};

export const TransformerSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      {/* Pinos Primários (Esquerda) */}
      <line x1="-50" y1="-20" x2="-25" y2="-20" strokeLinecap="round" />
      <line x1="-50" y1="20" x2="-25" y2="20" strokeLinecap="round" />

      {/* Pinos Secundários (Direita) */}
      <line x1="25" y1="-20" x2="50" y2="-20" strokeLinecap="round" />
      <line x1="25" y1="20" x2="50" y2="20" strokeLinecap="round" />

      {/* Bobina Primária (Espirais) */}
      <path d="M -25 -20 C -12 -20 -12 -10 -25 -10 C -12 -10 -12 0 -25 0 C -12 0 -12 10 -25 10 C -12 10 -12 20 -25 20" fill="none" strokeLinecap="round" />

      {/* Núcleo de Ferro (Duas linhas centrais) */}
      <line x1="-4" y1="-22" x2="-4" y2="22" strokeLinecap="round" />
      <line x1="4" y1="-22" x2="4" y2="22" strokeLinecap="round" />

      {/* Bobina Secundária (Espirais) */}
      <path d="M 25 -20 C 12 -20 12 -10 25 -10 C 12 -10 12 0 25 0 C 12 0 12 10 25 10 C 12 10 12 20 25 20" fill="none" strokeLinecap="round" />
    </g>
  );
};
