import React, { useState } from 'react';
import type { Category, ComponentType } from '../../types/circuit';
import { COMPONENT_DEFINITIONS } from '../../utils/componentDefinitions';
import { useCircuitStore } from '../../store/useCircuitStore';
import { ComponentThumbnail } from './ComponentThumbnail';
import {
  ChevronDown,
  ChevronRight,
  Zap,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ComponentPaletteProps {
  onOpenPresetModal?: () => void;
}

interface CategoryGroup {
  id: Category;
  title: string;
  types: ComponentType[];
}

const CATEGORIES: CategoryGroup[] = [
  {
    id: 'PASSIVE',
    title: 'Passivos',
    types: ['RESISTOR', 'CAPACITOR', 'CAPACITOR_POLAR', 'TRANSFORMER'],
  },
  {
    id: 'DIODE',
    title: 'Diodos & Tiristores',
    types: ['DIODE', 'DIODE_ZENER', 'LED', 'THYRISTOR', 'TRIAC'],
  },
  {
    id: 'TRANSISTOR',
    title: 'Transistores',
    types: ['BJT_NPN', 'BJT_PNP', 'MOSFET_N', 'MOSFET_P'],
  },
  {
    id: 'ANALOG',
    title: 'Analógicos',
    types: ['OPAMP'],
  },
  {
    id: 'DIGITAL_GATES',
    title: 'Portas Lógicas',
    types: [
      'GATE_NOT',
      'GATE_AND',
      'GATE_AND3',
      'GATE_NAND',
      'GATE_NAND3',
      'GATE_OR',
      'GATE_OR3',
      'GATE_NOR',
      'GATE_NOR3',
      'GATE_XOR',
      'GATE_XNOR',
    ],
  },
  {
    id: 'DIGITAL_FLIPFLOPS',
    title: 'Flip-Flops',
    types: ['FF_D', 'FF_JK', 'FF_SR', 'FF_T'],
  },
  {
    id: 'POWER_IO',
    title: 'Alimentação & E/S',
    types: [
      'VCC',
      'GND',
      'SOURCE_DC',
      'SOURCE_AC',
      'CLOCK',
      'LOGIC_INPUT',
      'PROBE',
      'PIN_TERMINAL',
      'TEXT',
    ],
  },
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onOpenPresetModal }) => {
  const { addComponent } = useCircuitStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    PASSIVE: true,
    DIODE: true,
    TRANSISTOR: true,
    ANALOG: true,
    DIGITAL_GATES: true,
    DIGITAL_FLIPFLOPS: true,
    POWER_IO: true,
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleAddComponent = (type: ComponentType) => {
    addComponent(type, 300 + Math.random() * 40, 200 + Math.random() * 40);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-slate-50 border-r border-slate-200 text-slate-800 flex flex-col items-center py-3 h-[calc(100vh-4rem)] select-none z-10 shadow-xs transition-all duration-300">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 shadow-xs transition-all duration-150"
          title="Expandir Biblioteca de Componentes"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>

        <div className="mt-6 flex flex-col items-center gap-4 text-slate-400">
          <Layers className="w-5 h-5" />
          <div className="writing-mode-vertical text-[10px] font-bold tracking-wider uppercase text-slate-400 select-none opacity-75">
            Componentes
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-slate-50 border-r border-slate-200 text-slate-800 flex flex-col h-[calc(100vh-4rem)] select-none z-10 shrink-0 transition-all duration-300">
      {/* Cabeçalho do Painel */}
      <div className="p-3 border-b border-slate-200 bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Biblioteca de Componentes
            </h2>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Ocultar Painel"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Campo de Busca de Componentes */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar (ex: Resistor, SCR, AND)..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Componentes em Grid de 3 Colunas (Cards Quadrados) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* Banner de Atalho para Circuitos Prontos */}
        {onOpenPresetModal && !normalizedSearch && (
          <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-orange-500/10 border border-amber-200 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Circuitos Prontos</span>
              </div>
              <p className="text-[10px] text-amber-700 mt-0.5">Ponte de Diodos, LEDs, Resistores...</p>
            </div>
            <button
              onClick={onOpenPresetModal}
              className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition-colors"
            >
              Inserir
            </button>
          </div>
        )}

        {CATEGORIES.map((cat) => {
          const matchingTypes = cat.types.filter((type) => {
            if (!normalizedSearch) return true;
            const def = COMPONENT_DEFINITIONS[type];
            return (
              def.name.toLowerCase().includes(normalizedSearch) ||
              def.defaultLabel.toLowerCase().includes(normalizedSearch) ||
              type.toLowerCase().includes(normalizedSearch)
            );
          });

          if (matchingTypes.length === 0) return null;

          const isOpen = normalizedSearch ? true : openCategories[cat.id];

          return (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs"
            >
              {/* Header da Categoria */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
              >
                <span>
                  {cat.title}{' '}
                  <span className="text-[10px] font-normal text-slate-400">
                    ({matchingTypes.length})
                  </span>
                </span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Grid 3 colunas de elementos em cards quadrados */}
              {isOpen && (
                <div className="p-2.5 grid grid-cols-3 gap-2 bg-slate-50/50">
                  {matchingTypes.map((type) => {
                    const def = COMPONENT_DEFINITIONS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => handleAddComponent(type)}
                        title={`${def.name} (${def.defaultLabel}: ${def.defaultValue})`}
                        className="group aspect-square flex flex-col items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 active:shadow-xs transition-all duration-150 cursor-pointer select-none text-center"
                      >
                        {/* Miniatura do Símbolo em SVG */}
                        <div className="flex-1 w-full flex items-center justify-center p-1 bg-slate-50/70 rounded-lg group-hover:bg-indigo-50/50 transition-colors overflow-hidden">
                          <ComponentThumbnail type={type} />
                        </div>

                        {/* Nome do Componente */}
                        <span className="text-[10.5px] font-semibold text-slate-700 leading-tight line-clamp-2 mt-1.5 group-hover:text-indigo-700 transition-colors">
                          {def.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rodapé Técnico de Normas de Simbologia */}
      <div className="p-3 bg-white border-t border-slate-200 text-[11px] font-mono text-slate-500 flex items-center justify-between shrink-0">
        <span>Norma: IEC-60617</span>
        <span className="text-blue-600 hover:underline cursor-pointer font-medium">
          Trocar IEEE
        </span>
      </div>
    </aside>
  );
};
