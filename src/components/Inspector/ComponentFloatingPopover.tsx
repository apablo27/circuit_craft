import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../../store/useCircuitStore';
import { COMPONENT_DEFINITIONS } from '../../utils/componentDefinitions';
import { formatEngineeringValue } from '../../utils/engineeringUnits';
import {
  RotateCw,
  FlipHorizontal,
  Trash2,
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react';

export const ComponentFloatingPopover: React.FC = () => {
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
    updateWire,
  } = useCircuitStore();

  const selectedComponent = components.find((c) => c.id === selectedComponentId);
  const selectedWire = wires.find((w) => w.id === selectedWireId);

  // Estado local para digitação fluida do valor antes/durante a formatação
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (selectedComponent) {
      setInputValue(selectedComponent.value || '');
    }
  }, [selectedComponent]);

  if (!selectedComponent && !selectedWire) {
    return null;
  }

  // ===================== CASO: FIO SELECIONADO =====================
  if (selectedWire) {
    const currentMode = selectedWire.routingMode || 'HV';
    const fromComp = components.find((c) => c.id === selectedWire.from.componentId);
    const toComp = components.find((c) => c.id === selectedWire.to.componentId);

    return (
      <div className="absolute top-16 right-6 z-30 w-80 bg-white rounded-xl shadow-2xl border border-slate-200/90 text-slate-800 animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <CornerDownRight className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-slate-900 text-[13px]">Condutor / Fio</span>
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                Net
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => removeWire(selectedWire.id)}
              className="w-6 h-6 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
              title="Excluir Fio (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
            <button
              onClick={() => selectWire(null)}
              className="w-6 h-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-3.5 flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono block mb-1.5">
              Direção das Curvas
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => updateWire(selectedWire.id, { routingMode: 'HV', waypoints: undefined })}
                className={`py-1.5 px-1 rounded-md text-[11px] font-mono font-semibold border transition-all ${
                  currentMode === 'HV'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                HV (L-1)
              </button>
              <button
                type="button"
                onClick={() => updateWire(selectedWire.id, { routingMode: 'VH', waypoints: undefined })}
                className={`py-1.5 px-1 rounded-md text-[11px] font-mono font-semibold border transition-all ${
                  currentMode === 'VH'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                VH (L-2)
              </button>
              <button
                type="button"
                onClick={() => updateWire(selectedWire.id, { routingMode: 'HVH', waypoints: undefined })}
                className={`py-1.5 px-1 rounded-md text-[11px] font-mono font-semibold border transition-all ${
                  currentMode === 'HVH'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                HVH (Z)
              </button>
            </div>
          </div>

          {selectedWire.waypoints && selectedWire.waypoints.length > 0 && (
            <button
              type="button"
              onClick={() => updateWire(selectedWire.id, { waypoints: undefined })}
              className="w-full py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition-colors"
            >
              Restaurar Rota Automática
            </button>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-[10.5px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Conectado
          </span>
          <span>
            [{fromComp?.label || 'Pin'} → {toComp?.label || 'Pin'}]
          </span>
        </div>
      </div>
    );
  }

  // ===================== CASO: COMPONENTE SELECIONADO =====================
  if (!selectedComponent) {
    return null;
  }

  const def = COMPONENT_DEFINITIONS[selectedComponent.type];
  const isResistor = selectedComponent.type === 'RESISTOR';
  const isCapacitor = selectedComponent.type === 'CAPACITOR' || selectedComponent.type === 'CAPACITOR_POLAR';
  const isLED = selectedComponent.type === 'LED';
  const isSource = selectedComponent.type === 'SOURCE_DC' || selectedComponent.type === 'SOURCE_AC';

  // Verifica conexões de nós nos pinos deste componente
  const connectedWires = wires.filter(
    (w) => w.from.componentId === selectedComponent.id || w.to.componentId === selectedComponent.id
  );
  const isFullyConnected = def.pins.length > 0 && connectedWires.length >= Math.min(def.pins.length, 2);

  const handleValueBlur = () => {
    const formatted = formatEngineeringValue(inputValue, selectedComponent.type);
    setInputValue(formatted);
    updateComponent(selectedComponent.id, { value: formatted });
  };

  const handleValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="absolute top-16 right-6 z-30 w-80 bg-white rounded-xl shadow-2xl border border-slate-200/90 text-slate-800 animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Popover Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-slate-900 text-[13px]">{def.name}</span>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
              {selectedComponent.label}
            </span>
          </div>
        </div>

        {/* Quick Action Mini-Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => rotateComponent(selectedComponent.id)}
            className="w-6 h-6 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
            title="Girar 90° (R)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mirrorComponent(selectedComponent.id)}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
              selectedComponent.mirrored
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Espelhar Horizontal"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => removeComponent(selectedComponent.id)}
            className="w-6 h-6 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
            title="Excluir (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
          <button
            onClick={() => selectComponent(null)}
            className="w-6 h-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Popover Body Parameters */}
      <div className="p-3.5 flex flex-col gap-3">
        {/* Identificador / Label */}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wider font-mono">
            Identificador
          </label>
          <input
            type="text"
            value={selectedComponent.label}
            onChange={(e) => updateComponent(selectedComponent.id, { label: e.target.value })}
            className="w-24 px-2 py-1 text-right text-[12px] font-semibold bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none text-slate-900"
          />
        </div>

        {/* Campo de Valor Nominal (Texto Direto - Unidade Automática) */}
        {selectedComponent.type !== 'JUNCTION' && selectedComponent.type !== 'GND' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wider font-mono">
                {isResistor
                  ? 'Resistência Nominal'
                  : isCapacitor
                  ? 'Capacitância Nominal'
                  : isSource
                  ? 'Tensão Nominal'
                  : 'Valor / Especificação'}
              </label>
              <span className="text-[10px] text-blue-600 font-mono">Auto-unidade</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                placeholder={
                  isResistor
                    ? 'ex: 10k, 4k7, 100'
                    : isCapacitor
                    ? 'ex: 47u, 100n, 10p'
                    : isSource
                    ? 'ex: 12, 5, 500m'
                    : 'ex: valor'
                }
                onChange={(e) => {
                  setInputValue(e.target.value);
                  updateComponent(selectedComponent.id, { value: e.target.value });
                }}
                onBlur={handleValueBlur}
                onKeyDown={handleValueKeyDown}
                className="w-full px-2.5 py-1.5 text-[13px] font-mono font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              Digite o valor (ex: {isCapacitor ? '47u → 47 µF' : isResistor ? '10k → 10 kΩ' : '12 → 12 V'})
            </p>
          </div>
        )}

        {/* Chips de Tolerância (para Resistor e Capacitor) */}
        {(isResistor || isCapacitor) && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wider font-mono">
              Tolerância
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {['± 1%', '± 5%', '± 10%'].map((tol) => {
                const isSelected = (selectedComponent.tolerance || '± 1%') === tol;
                return (
                  <button
                    key={tol}
                    type="button"
                    onClick={() => updateComponent(selectedComponent.id, { tolerance: tol })}
                    className={`py-1 px-2 rounded-md font-mono text-[11px] transition-all ${
                      isSelected
                        ? 'border border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-xs'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    {tol}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Potência Máxima Nominal (para Resistor) */}
        {isResistor && (
          <div className="flex items-center justify-between text-[11px] py-1 border-t border-slate-100">
            <span className="text-slate-500 font-mono uppercase">Potência Máx</span>
            <select
              value={selectedComponent.powerRating || '0.25 W (1/4 W)'}
              onChange={(e) => updateComponent(selectedComponent.id, { powerRating: e.target.value })}
              className="text-[11px] font-mono font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border-none focus:outline-none cursor-pointer"
            >
              <option value="0.125 W (1/8 W)">0.125 W (1/8 W)</option>
              <option value="0.25 W (1/4 W)">0.25 W (1/4 W)</option>
              <option value="0.5 W (1/2 W)">0.5 W (1/2 W)</option>
              <option value="1.0 W (1 W)">1.0 W (1 W)</option>
              <option value="2.0 W (2 W)">2.0 W (2 W)</option>
            </select>
          </div>
        )}

        {/* Seletor de Cores para LED */}
        {isLED && (
          <div className="flex flex-col gap-1.5 py-1 border-t border-slate-100">
            <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wider font-mono">
              Cor de Emissão
            </label>
            <div className="flex gap-2 items-center">
              {[
                { label: 'Vermelho (635nm)', hex: '#dc2626' },
                { label: 'Verde (565nm)', hex: '#16a34a' },
                { label: 'Azul (470nm)', hex: '#2563eb' },
                { label: 'Amarelo (590nm)', hex: '#ca8a04' },
                { label: 'Laranja (610nm)', hex: '#ea580c' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => updateComponent(selectedComponent.id, { color: c.hex, value: c.label })}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedComponent.color === c.hex ? 'border-slate-800 scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popover Footer Status */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-[10.5px] font-mono text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          {isFullyConnected ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-700">Conectado</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span className="text-amber-700">Pinos Abertos</span>
            </>
          )}
        </span>
        <span>
          {connectedWires.length} fio{connectedWires.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
