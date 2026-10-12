import React, { useState } from 'react';
import { X, Cpu, Layers, Sparkles, Plus, Minus } from 'lucide-react';
import { useCircuitStore } from '../../store/useCircuitStore';
import {
  generateBridgeRectifier,
  generateLedCircuit,
  generateParallelResistors,
  generateSeriesResistors,
  generateJKCounter3Bit,
  generateSisoRegister3Bit,
} from '../../utils/presetCircuits';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PresetType =
  | 'BRIDGE_DIODE'
  | 'LED_CIRCUIT'
  | 'PARALLEL_RESISTORS'
  | 'SERIES_RESISTORS'
  | 'JK_COUNTER_3BIT'
  | 'SISO_REGISTER_3BIT';

export const PresetModal: React.FC<PresetModalProps> = ({ isOpen, onClose }) => {
  const { addPresetModule } = useCircuitStore();
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('BRIDGE_DIODE');
  const [parallelCount, setParallelCount] = useState<number>(3);
  const [seriesCount, setSeriesCount] = useState<number>(3);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    let result = { components: [], wires: [] };
    const cx = 400;
    const cy = 300;

    switch (selectedPreset) {
      case 'BRIDGE_DIODE':
        result = generateBridgeRectifier(cx, cy);
        break;
      case 'LED_CIRCUIT':
        result = generateLedCircuit(cx, cy);
        break;
      case 'PARALLEL_RESISTORS':
        result = generateParallelResistors(parallelCount, cx, cy);
        break;
      case 'SERIES_RESISTORS':
        result = generateSeriesResistors(seriesCount, cx, cy);
        break;
      case 'JK_COUNTER_3BIT':
        result = generateJKCounter3Bit(cx, cy);
        break;
      case 'SISO_REGISTER_3BIT':
        result = generateSisoRegister3Bit(cx, cy);
        break;
    }

    addPresetModule(result.components, result.wires, replaceExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Circuitos Prontos & Módulos</h2>
              <p className="text-xs text-slate-500">Selecione e insira circuitos didáticos configuráveis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Opções de Circuitos */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Opção 1: Ponte de Diodos */}
            <div
              onClick={() => setSelectedPreset('BRIDGE_DIODE')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPreset === 'BRIDGE_DIODE'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">🌉 Ponte de Diodos</span>
                  {selectedPreset === 'BRIDGE_DIODE' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Retificador de onda completa em losango com 4 diodos (D1-D4) e 4 terminais (~, ~, -, +).
                </p>
              </div>
            </div>

            {/* Opção 2: Circuito LED */}
            <div
              onClick={() => setSelectedPreset('LED_CIRCUIT')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPreset === 'LED_CIRCUIT'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">💡 Circuito LED</span>
                  {selectedPreset === 'LED_CIRCUIT' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fonte VCC (+5V), resistor de limitação R1 (220Ω), LED vermelho e terra (GND).
                </p>
              </div>
            </div>

            {/* Opção 3: Resistores em Paralelo */}
            <div
              onClick={() => setSelectedPreset('PARALLEL_RESISTORS')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPreset === 'PARALLEL_RESISTORS'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">⏸️ Resistores Paralelo</span>
                  {selectedPreset === 'PARALLEL_RESISTORS' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Associação de N resistores interconectados em paralelo por barramento superior e inferior.
                </p>
              </div>

              {selectedPreset === 'PARALLEL_RESISTORS' && (
                <div className="pt-3 border-t border-indigo-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Qtd de Resistores:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setParallelCount((c) => Math.max(2, c - 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 font-bold text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-indigo-700 w-6 text-center">
                      {parallelCount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setParallelCount((c) => Math.min(10, c + 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 font-bold text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Opção 4: Resistores em Série */}
            <div
              onClick={() => setSelectedPreset('SERIES_RESISTORS')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPreset === 'SERIES_RESISTORS'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">➡️ Resistores Série</span>
                  {selectedPreset === 'SERIES_RESISTORS' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Associação de N resistores interconectados em série lado a lado.
                </p>
              </div>

              {selectedPreset === 'SERIES_RESISTORS' && (
                <div className="pt-3 border-t border-indigo-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Qtd de Resistores:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeriesCount((c) => Math.max(2, c - 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 font-bold text-slate-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-indigo-700 w-6 text-center">
                      {seriesCount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeriesCount((c) => Math.min(10, c + 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 font-bold text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Opção 5: Contador 3 Bits JK */}
            <div
              onClick={() => setSelectedPreset('JK_COUNTER_3BIT')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPreset === 'JK_COUNTER_3BIT'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">🔢 Contador 3 Bits (FF JK)</span>
                  {selectedPreset === 'JK_COUNTER_3BIT' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Contador assíncrono de 3 bits (0 a 7) com 3 Flip-Flops JK 74HC73 (borda de descida) e sondas indicadoras.
                </p>
              </div>
            </div>

            {/* Opção 6: Registrador SISO 3 Bits */}
            <div
              onClick={() => setSelectedPreset('SISO_REGISTER_3BIT')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPreset === 'SISO_REGISTER_3BIT'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">🔄 Registrador SISO (FF D)</span>
                  {selectedPreset === 'SISO_REGISTER_3BIT' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Registrador de deslocamento Serial-In Serial-Out de 3 bits com 3 Flip-Flops D 74HC74 e clock síncrono.
                </p>
              </div>
            </div>
          </div>

          {/* Opção Adicional: Substituir Circuito */}
          <div className="pt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="replaceExisting" className="text-xs font-medium text-slate-700 cursor-pointer">
              Limpar canvas antes de inserir este circuito
            </label>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Inserir Circuito no Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
