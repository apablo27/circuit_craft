import React from 'react';
import type { CircuitComponent } from '../../types/circuit';

interface SymbolProps {
  component: CircuitComponent;
  isSelected?: boolean;
}

export const GndSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <line x1="0" y1="-20" x2="0" y2="0" strokeLinecap="round" />
      {/* 3 Linhas Decrescentes do Terra */}
      <line x1="-16" y1="0" x2="16" y2="0" strokeLinecap="round" />
      <line x1="-10" y1="6" x2="10" y2="6" strokeLinecap="round" />
      <line x1="-4" y1="12" x2="4" y2="12" strokeLinecap="round" />
    </g>
  );
};

export const VccSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <line x1="0" y1="20" x2="0" y2="0" strokeLinecap="round" />
      {/* Seta para Cima VCC */}
      <polygon points="0,-15 -10,0 10,0" fill="#6366f1" stroke="#4f46e5" strokeLinejoin="round" />
    </g>
  );
};

export const SourceDcSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <line x1="0" y1="-40" x2="0" y2="-18" />
      <line x1="0" y1="18" x2="0" y2="40" />
      <circle cx="0" cy="0" r="18" fill="#f8fafc" />
      <text x="-4" y="-5" fontSize="12" fontWeight="bold" fill="#334155" stroke="none">+</text>
      <text x="-3" y="12" fontSize="12" fontWeight="bold" fill="#334155" stroke="none">-</text>
    </g>
  );
};

export const SourceAcSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <line x1="0" y1="-40" x2="0" y2="-18" />
      <line x1="0" y1="18" x2="0" y2="40" />
      <circle cx="0" cy="0" r="18" fill="#f8fafc" />
      {/* Onda Senoidal */}
      <path d="M -10 0 Q -5 -10 0 0 Q 5 10 10 0" fill="none" strokeWidth="2" />
    </g>
  );
};

export const ClockSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-20" y="-15" width="35" height="30" rx="3" fill="#f8fafc" />
      <line x1="15" y1="0" x2="40" y2="0" />
      {/* Pulso Quadrado de Clock */}
      <path d="M -15 5 L -15 -5 L -5 -5 L -5 5 L 5 5 L 5 -5 L 10 -5" fill="none" strokeWidth="1.5" />
    </g>
  );
};

export const LogicInputSymbol: React.FC<SymbolProps> = ({ component, isSelected }) => {
  const val = component.value.includes('0') || component.value.toLowerCase().includes('low') ? '0' : '1';
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <rect x="-20" y="-15" width="35" height="30" rx="3" fill={val === '1' ? '#dcfce7' : '#f1f5f9'} />
      <line x1="15" y1="0" x2="40" y2="0" />
      <text x="-6" y="5" fontSize="14" fontWeight="bold" fill={val === '1' ? '#166534' : '#475569'} stroke="none">
        {val}
      </text>
    </g>
  );
};

export const ProbeSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <line x1="-40" y1="0" x2="-15" y2="0" />
      <circle cx="0" cy="0" r="15" fill="#fef08a" />
      <text x="-4" y="5" fontSize="12" fontWeight="bold" fill="#854d0e" stroke="none">OUT</text>
    </g>
  );
};

export const PinTerminalSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g className={isSelected ? 'stroke-indigo-500 stroke-[3]' : 'stroke-slate-800 stroke-[2]'}>
      <line x1="-40" y1="0" x2="-14" y2="0" strokeLinecap="round" />
      <circle cx="0" cy="0" r="14" fill="#ffffff" />
    </g>
  );
};

export const TextSymbol: React.FC<SymbolProps> = ({ component, isSelected }) => {
  const textContent = component.value || component.label || 'Texto';
  return (
    <g className="select-none cursor-pointer">
      {isSelected && (
        <rect
          x="-45"
          y="-16"
          width="90"
          height="32"
          rx="6"
          fill="rgba(99, 102, 241, 0.08)"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      )}
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="#0f172a"
        stroke="none"
      >
        {textContent}
      </text>
    </g>
  );
};
