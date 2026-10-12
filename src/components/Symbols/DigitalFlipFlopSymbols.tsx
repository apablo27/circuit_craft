import React from 'react';
import type { CircuitComponent } from '../../types/circuit';

interface SymbolProps {
  component: CircuitComponent;
  isSelected?: boolean;
}

export const FlipFlopDSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      {/* Corpo Retangular */}
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      {/* Pinos Entrada */}
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      {/* Pinos Preset e Clear (Topo e Base) */}
      <line x1="0" y1="-40" x2="0" y2="-35" />
      <line x1="0" y1="35" x2="0" y2="40" />
      {/* Bolhas de inversão (Ativo em Baixo 0) para PRE e CLR */}
      <circle cx="0" cy="-34" r="3" fill="#f8fafc" />
      <circle cx="0" cy="34" r="3" fill="#f8fafc" />
      {/* Pinos Saída */}
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      {/* Rótulos dos Pinos */}
      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">D</text>
      <text x="0" y="-22" fontSize="9" fontWeight="bold" fill="#334155" textAnchor="middle" stroke="none">PRE</text>
      <text x="0" y="26" fontSize="9" fontWeight="bold" fill="#334155" textAnchor="middle" stroke="none">CLR</text>
      {/* Seta do Clock (Borda de Subida) */}
      <path d="M -30 15 L -22 20 L -30 25" fill="none" />
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};

export const FlipFlopJkSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="0" x2="-30" y2="0" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      {/* Pino Clear (Base) */}
      <line x1="0" y1="35" x2="0" y2="40" />
      {/* Bolha de inversão (Ativo em Baixo 0) para CLR */}
      <circle cx="0" cy="34" r="3" fill="#f8fafc" />
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">J</text>
      {/* Bolinha de inversão (Borda de descida 74HC73) + Seta do Clock */}
      <circle cx="-34" cy="0" r="3" fill="#f8fafc" />
      <path d="M -30 -5 L -22 0 L -30 5" fill="none" />
      <text x="-24" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">K</text>
      <text x="0" y="26" fontSize="9" fontWeight="bold" fill="#334155" textAnchor="middle" stroke="none">CLR</text>
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};

export const FlipFlopSrSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="0" x2="-30" y2="0" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">S</text>
      <path d="M -30 -5 L -22 0 L -30 5" fill="none" />
      <text x="-24" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">R</text>
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};

export const FlipFlopTSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">T</text>
      <path d="M -30 15 L -22 20 L -30 25" fill="none" />
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};

// --- SIMBOLOS DE BORDA DE DESCIDA (NEG) ---
export const FlipFlopDNegSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">D</text>
      {/* Bolinha de inversão + Seta do Clock */}
      <circle cx="-34" cy="20" r="3" fill="#f8fafc" />
      <path d="M -30 15 L -22 20 L -30 25" fill="none" />
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};

export const FlipFlopJkNegSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="0" x2="-30" y2="0" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">J</text>
      {/* Bolinha de inversão + Seta do Clock */}
      <circle cx="-34" cy="0" r="3" fill="#f8fafc" />
      <path d="M -30 -5 L -22 0 L -30 5" fill="none" />
      <text x="-24" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">K</text>
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};

export const FlipFlopSrNegSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="0" x2="-30" y2="0" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">S</text>
      {/* Bolinha de inversão + Seta do Clock */}
      <circle cx="-34" cy="0" r="3" fill="#f8fafc" />
      <path d="M -30 -5 L -22 0 L -30 5" fill="none" />
      <text x="-24" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">R</text>
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};

export const FlipFlopTNegSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-30" y="-35" width="60" height="70" rx="4" fill="#f8fafc" strokeLinejoin="round" />
      <line x1="-40" y1="-20" x2="-30" y2="-20" />
      <line x1="-40" y1="20" x2="-30" y2="20" />
      <line x1="30" y1="-20" x2="40" y2="-20" />
      <line x1="30" y1="20" x2="40" y2="20" />

      <text x="-24" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">T</text>
      {/* Bolinha de inversão + Seta do Clock */}
      <circle cx="-34" cy="20" r="3" fill="#f8fafc" />
      <path d="M -30 15 L -22 20 L -30 25" fill="none" />
      <text x="18" y="-16" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q</text>
      <text x="14" y="24" fontSize="11" fontWeight="bold" fill="#334155" stroke="none">Q̄</text>
    </g>
  );
};
