import React from 'react';
import type { CircuitComponent } from '../../types/circuit';

interface SymbolProps {
  component: CircuitComponent;
  isSelected?: boolean;
}

export const OpAmpSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Triângulo do AmpOp */}
      <polygon points="-30,-35 -30,35 30,0" fill="#f8fafc" strokeLinejoin="round" />
      
      {/* Pinos das entradas inversora (-) e não-inversora (+) */}
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      
      {/* Pino de Saída */}
      <line x1="30" y1="0" x2="40" y2="0" />

      {/* Pinos de Alimentação V+ e V- */}
      <line x1="0" y1="-40" x2="0" y2="-18" />
      <line x1="0" y1="18" x2="0" y2="40" />

      {/* Sinais de - e + internos */}
      <text x="-25" y="-15" fontSize="14" fontWeight="bold" fill="#64748b" stroke="none">-</text>
      <text x="-26" y="25" fontSize="14" fontWeight="bold" fill="#64748b" stroke="none">+</text>
    </g>
  );
};
