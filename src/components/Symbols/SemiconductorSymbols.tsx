import React from 'react';
import type { CircuitComponent } from '../../types/circuit';

interface SymbolProps {
  component: CircuitComponent;
  isSelected?: boolean;
}

export const DiodeSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Pinos */}
      <line x1="-40" y1="0" x2="-15" y2="0" />
      <line x1="15" y1="0" x2="40" y2="0" />
      {/* Triângulo Anodo */}
      <polygon points="-15,-15 -15,15 15,0" fill="none" strokeLinejoin="round" />
      {/* Linha Cátodo */}
      <line x1="15" y1="-15" x2="15" y2="15" />
    </g>
  );
};

export const DiodeZenerSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Pinos */}
      <line x1="-40" y1="0" x2="-15" y2="0" />
      <line x1="15" y1="0" x2="40" y2="0" />
      {/* Triângulo Anodo */}
      <polygon points="-15,-15 -15,15 15,0" fill="none" strokeLinejoin="round" />
      {/* Traço em Z do Zener no Cátodo */}
      <path d="M 10 -15 L 15 -15 L 15 15 L 20 15" fill="none" />
    </g>
  );
};

export const LEDSymbol: React.FC<SymbolProps> = ({ component, isSelected }) => {
  const ledColor = component.color || '#ef4444';
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Pinos */}
      <line x1="-40" y1="0" x2="-15" y2="0" />
      <line x1="15" y1="0" x2="40" y2="0" />
      {/* Triângulo Anodo preenchido suavemente com a cor do LED */}
      <polygon points="-15,-15 -15,15 15,0" fill={ledColor} fillOpacity="0.2" strokeLinejoin="round" />
      {/* Linha Cátodo */}
      <line x1="15" y1="-15" x2="15" y2="15" />
      {/* Setas de Emissão de Luz */}
      <g stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round">
        <line x1="-5" y1="-20" x2="5" y2="-30" />
        <path d="M 1 -30 L 5 -30 L 5 -26" fill="none" />
        <line x1="5" y1="-20" x2="15" y2="-30" />
        <path d="M 11 -30 L 15 -30 L 15 -26" fill="none" />
      </g>
    </g>
  );
};

export const BjtNpnSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Base */}
      <line x1="-30" y1="0" x2="-10" y2="0" />
      <line x1="-10" y1="-16" x2="-10" y2="16" strokeWidth="2.5" />
      {/* Coletor */}
      <line x1="-10" y1="-6" x2="30" y2="-22" />
      <line x1="30" y1="-22" x2="30" y2="-30" />
      {/* Emissor com seta NPN (saindo) */}
      <line x1="-10" y1="6" x2="30" y2="22" />
      <line x1="30" y1="22" x2="30" y2="30" />
      <polygon points="18,17 9,18 13,9" fill="#1e293b" stroke="none" />
    </g>
  );
};

export const BjtPnpSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Base */}
      <line x1="-30" y1="0" x2="-10" y2="0" />
      <line x1="-10" y1="-16" x2="-10" y2="16" strokeWidth="2.5" />
      {/* Coletor */}
      <line x1="-10" y1="-6" x2="30" y2="-22" />
      <line x1="30" y1="-22" x2="30" y2="-30" />
      {/* Emissor com seta PNP (entrando para a base) */}
      <line x1="-10" y1="6" x2="30" y2="22" />
      <line x1="30" y1="22" x2="30" y2="30" />
      <polygon points="-10,6 -5,11 -5,2" fill="#1e293b" stroke="none" />
    </g>
  );
};

export const MosfetNSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Gate */}
      <line x1="-30" y1="0" x2="-12" y2="0" />
      <line x1="-12" y1="-20" x2="-12" y2="20" strokeWidth="2.5" />
      {/* Canal isolado */}
      <line x1="-5" y1="-20" x2="-5" y2="-10" strokeWidth="2.5" />
      <line x1="-5" y1="-5" x2="-5" y2="5" strokeWidth="2.5" />
      <line x1="-5" y1="10" x2="-5" y2="20" strokeWidth="2.5" />
      {/* Dreno */}
      <line x1="-5" y1="-15" x2="30" y2="-15" />
      <line x1="30" y1="-15" x2="30" y2="-30" />
      {/* Fonte */}
      <line x1="-5" y1="15" x2="30" y2="15" />
      <line x1="30" y1="15" x2="30" y2="30" />
      {/* Substrato com seta N (entrando) */}
      <line x1="-5" y1="0" x2="30" y2="0" />
      <polygon points="6,-5 -4,0 6,5" fill="#1e293b" stroke="none" />
      <circle cx="30" cy="15" r="2.5" fill="#1e293b" />
    </g>
  );
};

export const MosfetPSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Gate */}
      <line x1="-30" y1="0" x2="-12" y2="0" />
      <line x1="-12" y1="-20" x2="-12" y2="20" strokeWidth="2.5" />
      <line x1="-5" y1="-20" x2="-5" y2="-10" strokeWidth="2.5" />
      <line x1="-5" y1="-5" x2="-5" y2="5" strokeWidth="2.5" />
      <line x1="-5" y1="10" x2="-5" y2="20" strokeWidth="2.5" />
      <line x1="-5" y1="-15" x2="30" y2="-15" />
      <line x1="30" y1="-15" x2="30" y2="-30" />
      <line x1="-5" y1="15" x2="30" y2="15" />
      <line x1="30" y1="15" x2="30" y2="30" />
      {/* Substrato com seta P (saindo) */}
      <line x1="-5" y1="0" x2="30" y2="0" />
      <polygon points="6,-5 16,0 6,5" fill="#1e293b" stroke="none" />
      <circle cx="30" cy="15" r="2.5" fill="#1e293b" />
    </g>
  );
};

export const ThyristorSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* Anodo (Esquerda) e Catodo (Direita) */}
      <line x1="-40" y1="0" x2="-15" y2="0" strokeLinecap="round" />
      <line x1="15" y1="0" x2="40" y2="0" strokeLinecap="round" />
      {/* Triângulo (Anodo -> Catodo) */}
      <polygon points="-15,-15 -15,15 15,0" fill="none" strokeLinejoin="round" />
      {/* Barra do Catodo */}
      <line x1="15" y1="-15" x2="15" y2="15" strokeLinecap="round" />
      {/* Gatilho (Gate - PINO G na parte inferior do catodo) */}
      <line x1="5" y1="5" x2="-10" y2="25" strokeLinecap="round" />
      <line x1="-10" y1="25" x2="-10" y2="30" strokeLinecap="round" />
    </g>
  );
};

export const TriacSymbol: React.FC<SymbolProps> = ({ isSelected }) => {
  return (
    <g
      stroke={isSelected ? '#4f46e5' : '#0f172a'}
      strokeWidth={isSelected ? '3' : '2'}
      className={isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-slate-900 stroke-[2]'}
    >
      {/* MT1 (Esquerda) e MT2 (Direita) */}
      <line x1="-40" y1="0" x2="-12" y2="0" strokeLinecap="round" />
      <line x1="12" y1="0" x2="40" y2="0" strokeLinecap="round" />

      {/* Triângulo Superior (apontando para a direita ->) */}
      <polygon points="-12,-16 -12,0 12,-8" fill="none" strokeLinejoin="round" />

      {/* Triângulo Inferior (apontando para a esquerda <-) */}
      <polygon points="12,0 12,16 -12,8" fill="none" strokeLinejoin="round" />

      {/* Barras Verticais Limites */}
      <line x1="-12" y1="-20" x2="-12" y2="16" strokeLinecap="round" />
      <line x1="12" y1="-16" x2="12" y2="20" strokeLinecap="round" />

      {/* Terminal de Gatilho (Gate - Pino G na parte inferior direita) */}
      <path d="M 12 10 L 2 20 L -10 20 L -10 30" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
