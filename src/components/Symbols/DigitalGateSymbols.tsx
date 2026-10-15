import React from 'react';
import type { CircuitComponent } from '../../types/circuit';

interface SymbolProps {
  component: CircuitComponent;
  isSelected?: boolean;
}

export const GateNotSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-30" y1="0" x2="-15" y2="0" />
      <polygon points="-15,-15 -15,15 15,0" fill="#f8fafc" strokeLinejoin="round" />
      {/* Bolha de Inversão */}
      <circle cx="20" cy="0" r="4" fill="#f8fafc" />
      <line x1="24" y1="0" x2="30" y2="0" />
    </g>
  );
};

export const GateAndSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-20" y2="-20" />
      <line x1="-40" y1="20" x2="-20" y2="20" />
      {/* Formato AND ANSI (D invertido) */}
      <path d="M -20 -25 L 0 -25 A 25 25 0 0 1 0 25 L -20 25 Z" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="25" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateAnd3Symbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-20" y2="-20" />
      <line x1="-40" y1="0" x2="-20" y2="0" />
      <line x1="-40" y1="20" x2="-20" y2="20" />
      <path d="M -20 -30 L 0 -30 A 30 30 0 0 1 0 30 L -20 30 Z" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="30" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateNandSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-20" y2="-20" />
      <line x1="-40" y1="20" x2="-20" y2="20" />
      <path d="M -20 -25 L 0 -25 A 25 25 0 0 1 0 25 L -20 25 Z" fill="#f8fafc" strokeLinejoin="round" />
      <circle cx="29" cy="0" r="4" fill="#f8fafc" />
      <line x1="33" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateNand3Symbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-20" y2="-20" />
      <line x1="-40" y1="0" x2="-20" y2="0" />
      <line x1="-40" y1="20" x2="-20" y2="20" />
      <path d="M -20 -30 L 0 -30 A 30 30 0 0 1 0 30 L -20 30 Z" fill="#f8fafc" strokeLinejoin="round" />
      <circle cx="34" cy="0" r="4" fill="#f8fafc" />
      <line x1="38" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateOrSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-15" y2="-20" />
      <line x1="-40" y1="20" x2="-15" y2="20" />
      {/* Formato OR ANSI (Ponta curvada) */}
      <path d="M -25 -25 Q -15 0 -25 25 Q 5 25 25 0 Q 5 -25 -25 -25 Z" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="25" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateOr3Symbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-15" y2="-20" />
      <line x1="-40" y1="0" x2="-12" y2="0" />
      <line x1="-40" y1="20" x2="-15" y2="20" />
      <path d="M -25 -30 Q -15 0 -25 30 Q 5 30 25 0 Q 5 -30 -25 -30 Z" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="25" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateNor3Symbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-15" y2="-20" />
      <line x1="-40" y1="0" x2="-12" y2="0" />
      <line x1="-40" y1="20" x2="-15" y2="20" />
      <path d="M -25 -30 Q -15 0 -25 30 Q 5 30 25 0 Q 5 -30 -25 -30 Z" fill="#f8fafc" strokeLinejoin="round" />
      <circle cx="29" cy="0" r="4" fill="#f8fafc" />
      <line x1="33" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateNorSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-15" y2="-20" />
      <line x1="-40" y1="20" x2="-15" y2="20" />
      <path d="M -25 -25 Q -15 0 -25 25 Q 5 25 25 0 Q 5 -25 -25 -25 Z" fill="#f8fafc" strokeLinejoin="round" />
      <circle cx="29" cy="0" r="4" fill="#f8fafc" />
      <line x1="33" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateXorSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-20" y2="-20" />
      <line x1="-40" y1="20" x2="-20" y2="20" />
      {/* Arco de entrada extra para XOR */}
      <path d="M -30 -25 Q -20 0 -30 25" fill="none" />
      <path d="M -23 -25 Q -13 0 -23 25 Q 7 25 25 0 Q 7 -25 -23 -25 Z" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="25" y1="0" x2="40" y2="0" />
    </g>
  );
};

export const GateXnorSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      <line x1="-40" y1="-20" x2="-20" y2="-20" />
      <line x1="-40" y1="20" x2="-20" y2="20" />
      <path d="M -30 -25 Q -20 0 -30 25" fill="none" />
      <path d="M -23 -25 Q -13 0 -23 25 Q 7 25 25 0 Q 7 -25 -23 -25 Z" fill="#f8fafc" strokeLinejoin="round" />
      <circle cx="29" cy="0" r="4" fill="#f8fafc" />
      <line x1="33" y1="0" x2="40" y2="0" />
    </g>
  );
};
