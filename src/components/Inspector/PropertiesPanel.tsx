import React, { useState, useEffect, useRef } from 'react';
import { useCircuitStore } from '../../store/useCircuitStore';
import { RotateCw, FlipHorizontal, Trash2, Settings, Info, Tag } from 'lucide-react';
import { COMPONENT_DEFINITIONS } from '../../utils/componentDefinitions';

interface AutocompleteInputProps {
  labelName: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  suggestions: string[];
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  labelName,
  value,
  onChange,
  placeholder,
  suggestions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = value.trim().toLowerCase();
  // Autocomplete ativa quando o usuário digita mais de 3 letras (> 3 caracteres)
  const shouldSuggest = trimmed.length > 3;
  const filteredSuggestions = shouldSuggest
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(trimmed) && s.toLowerCase() !== trimmed
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {labelName}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-44 overflow-y-auto py-1 custom-scrollbar">
          <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-500" />
            <span>Sugestões no circuito (&gt; 3 letras)</span>
          </div>
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(suggestion);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors flex items-center justify-between group"
            >
              <span>{suggestion}</span>
              <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                Usar
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const PropertiesPanel: React.FC = () => {
  const {
    components,
    wires,
    selectedComponentId,
    selectedWireId,
    updateComponent,
    rotateComponent,
    mirrorComponent,
    removeComponent,
    removeWire,
    selectComponent,
    selectWire,
  } = useCircuitStore();

  const selectedComponent = components.find((c) => c.id === selectedComponentId);
  const selectedWire = wires.find((w) => w.id === selectedWireId);

  // Coleta sugestões únicas de rótulos e nomes de sinal dos outros componentes do circuito
  const existingSuggestions = Array.from(
    new Set(
      components
        .flatMap((c) => [c.label, c.value])
        .filter((val): val is string => Boolean(val && val.trim().length > 0))
    )
  );

  if (!selectedComponent && !selectedWire) {
    return (
      <aside className="w-64 bg-white border-l border-slate-200 text-slate-600 p-5 flex flex-col justify-between h-[calc(100vh-4rem)] select-none z-10">
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Settings className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">Propriedades</h2>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-start gap-2 text-indigo-600">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs font-semibold text-slate-800">Atalhos de Teclado</p>
            </div>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li className="flex justify-between items-center"><span className="font-medium">Excluir item:</span> <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">Del</kbd></li>
              <li className="flex justify-between items-center"><span className="font-medium">Adicionar Resistor:</span> <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">R</kbd></li>
              <li className="flex justify-between items-center"><span className="font-medium">Fonte de Tensão:</span> <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">V</kbd></li>
              <li className="flex justify-between items-center"><span className="font-medium">Terra (GND):</span> <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">G</kbd></li>
              <li className="flex justify-between items-center"><span className="font-medium">Girar 90°:</span> <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">Ctrl+R</kbd></li>
            </ul>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 pt-3">
          CircuitCraft Web • Tema Claro
        </div>
      </aside>
    );
  }

  if (selectedWire) {
    const currentMode = selectedWire.routingMode || 'HV';

    return (
      <aside className="w-64 bg-white border-l border-slate-200 text-slate-800 p-5 flex flex-col justify-between h-[calc(100vh-4rem)] select-none z-10">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-slate-900">Fio de Conexão</h2>
            <button
              onClick={() => selectWire(null)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1">ID da Conexão:</span>
              <span className="font-mono text-slate-800 font-medium">{selectedWire.id}</span>
            </div>

            {/* Seletor de Modo de Curva do Fio */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">
                Direção das Curvas
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    useCircuitStore.getState().updateWire(selectedWire.id, {
                      routingMode: 'HV',
                      waypoints: undefined,
                    })
                  }
                  className={`py-1.5 px-1 rounded text-[11px] font-medium border transition-colors ${
                    currentMode === 'HV'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Horizontal primeiro, depois Vertical"
                >
                  HV (L-1)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useCircuitStore.getState().updateWire(selectedWire.id, {
                      routingMode: 'VH',
                      waypoints: undefined,
                    })
                  }
                  className={`py-1.5 px-1 rounded text-[11px] font-medium border transition-colors ${
                    currentMode === 'VH'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Vertical primeiro, depois Horizontal"
                >
                  VH (L-2)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    useCircuitStore.getState().updateWire(selectedWire.id, {
                      routingMode: 'HVH',
                      waypoints: undefined,
                    })
                  }
                  className={`py-1.5 px-1 rounded text-[11px] font-medium border transition-colors ${
                    currentMode === 'HVH'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Dupla curva no meio"
                >
                  HVH (Z)
                </button>
              </div>

              {selectedWire.waypoints && selectedWire.waypoints.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    useCircuitStore.getState().updateWire(selectedWire.id, {
                      waypoints: undefined,
                    })
                  }
                  className="w-full mt-2 py-1 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-medium transition-colors"
                >
                  Restaurar Rota Automática
                </button>
              )}
            </div>

            <button
              onClick={() => removeWire(selectedWire.id)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Fio
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (!selectedComponent) return null;

  const def = COMPONENT_DEFINITIONS[selectedComponent.type];

  return (
    <aside className="w-64 bg-white border-l border-slate-200 text-slate-800 p-5 flex flex-col justify-between h-[calc(100vh-4rem)] select-none z-10">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-sm text-slate-900">{def.name}</h2>
            <span className="text-[10px] text-indigo-600 font-mono font-medium">
              {selectedComponent.type}
            </span>
          </div>
          <button
            onClick={() => selectComponent(null)}
            className="text-xs text-slate-400 hover:text-slate-700"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-4">
          {/* Caixa Informativa para Pino / Terminal de Sinal */}
          {selectedComponent.type === 'PIN_TERMINAL' && (
            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs space-y-1 text-indigo-950">
              <div className="font-bold flex items-center gap-1.5 text-indigo-700">
                <Tag className="w-3.5 h-3.5" />
                <span>Pino / Terminal de Sinal</span>
              </div>
              <p className="text-[11px] text-indigo-700/90 leading-tight">
                Permite conectar sinais lógicos ou analógicos com rótulos compartilhados (ex: <strong>LOGIC_A</strong>, <strong>CLK_BUS</strong>).
              </p>
            </div>
          )}

          {/* Rótulo do Componente com Autocomplete (> 3 letras) */}
          <AutocompleteInput
            labelName="Rótulo / Nome do Sinal"
            value={selectedComponent.label}
            placeholder="ex: Sinal_A, CLK, OUT"
            onChange={(newValue) =>
              updateComponent(selectedComponent.id, { label: newValue })
            }
            suggestions={existingSuggestions}
          />

          {/* Seletor específico para Fonte de Tensão (DC vs AC) */}
          {(selectedComponent.type === 'SOURCE_DC' || selectedComponent.type === 'SOURCE_AC') && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Tipo de Fonte de Tensão
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateComponent(selectedComponent.id, {
                      type: 'SOURCE_DC',
                      value: selectedComponent.value.includes('V') ? selectedComponent.value : '12V',
                    })
                  }
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedComponent.type === 'SOURCE_DC'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Fonte DC
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateComponent(selectedComponent.id, {
                      type: 'SOURCE_AC',
                      value: '120Vrms',
                      frequency: '60Hz',
                    })
                  }
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                    selectedComponent.type === 'SOURCE_AC'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Fonte AC
                </button>
              </div>

              {selectedComponent.type === 'SOURCE_AC' && (
                <div className="space-y-2.5 pt-1 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Tensão RMS
                    </label>
                    <input
                      type="text"
                      value={selectedComponent.value}
                      placeholder="ex: 120Vrms ou 12V"
                      onChange={(e) =>
                        updateComponent(selectedComponent.id, {
                          value: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Frequência
                    </label>
                    <input
                      type="text"
                      value={selectedComponent.frequency || '60Hz'}
                      placeholder="ex: 60Hz ou 1kHz"
                      onChange={(e) =>
                        updateComponent(selectedComponent.id, {
                          frequency: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Valor Padrão para outros componentes com Autocomplete (> 3 letras) */}
          {selectedComponent.type !== 'SOURCE_AC' && (
            <AutocompleteInput
              labelName="Valor / Especificação"
              value={selectedComponent.value}
              placeholder="ex: 10k, 100nF, Sinal_A"
              onChange={(newValue) =>
                updateComponent(selectedComponent.id, { value: newValue })
              }
              suggestions={existingSuggestions}
            />
          )}

          {/* Seletor de cor para LED */}
          {selectedComponent.type === 'LED' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cor do LED</label>
              <div className="flex gap-2">
                {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateComponent(selectedComponent.id, { color })}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      selectedComponent.color === color
                        ? 'border-slate-800 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ações: Rotação e Espelhamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Orientação e Posição
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => rotateComponent(selectedComponent.id)}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Girar 90° ({selectedComponent.rotation}°)
              </button>

              <button
                onClick={() => mirrorComponent(selectedComponent.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 border rounded-lg text-xs font-medium transition-colors ${
                  selectedComponent.mirrored
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                Espelhar
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => removeComponent(selectedComponent.id)}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-medium transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Excluir Componente
      </button>
    </aside>
  );
};
