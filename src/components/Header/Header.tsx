import React, { useRef } from 'react';
import {
  Download,
  RotateCcw,
  RotateCw,
  Trash2,
  FolderOpen,
  Save,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import { useCircuitStore } from '../../store/useCircuitStore';

interface HeaderProps {
  onOpenExportModal: () => void;
  onOpenShortcutsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExportModal,
  onOpenShortcutsModal,
}) => {
  const {
    undo,
    redo,
    historyIndex,
    history,
    clearCanvas,
    loadProject,
    getProjectJson,
    labelFontSize,
    valueFontSize,
    setLabelFontSize,
    setValueFontSize,
  } = useCircuitStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveJson = () => {
    const jsonStr = getProjectJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuito_projeto.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) loadProject(content);
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-800 px-6 flex items-center justify-between shadow-xs z-20 select-none">
      {/* Esquerda: Logo e Título Técnico */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base leading-tight text-slate-900 tracking-tight">
              CircuitCraft
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              Didático / Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Desenho e Exportação Didática de Circuitos</p>
        </div>
      </div>

      {/* Centro: Ferramentas de Histórico, Limpeza e Ajuste Global de Fontes */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={undo}
          disabled={historyIndex < 0}
          title="Desfazer (Ctrl+Z)"
          className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Refazer (Ctrl+Y)"
          className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-0.5" />

        <button
          onClick={clearCanvas}
          title="Limpar Bancada"
          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-500 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-0.5" />

        {/* Ajuste Global: Identificador (Label: R1, C1...) */}
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200/90 shadow-2xs">
          <span
            className="text-[10.5px] font-mono font-bold text-slate-600 select-none mr-0.5"
            title="Tamanho global da fonte dos Identificadores (R1, C1...)"
          >
            ID
          </span>
          <button
            onClick={() => setLabelFontSize((prev) => Math.max(8, prev - 1))}
            title="Diminuir fonte dos Identificadores (-1px)"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer select-none"
          >
            -
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-900 min-w-4 text-center select-none">
            {labelFontSize}
          </span>
          <button
            onClick={() => setLabelFontSize((prev) => Math.min(26, prev + 1))}
            title="Aumentar fonte dos Identificadores (+1px)"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer select-none"
          >
            +
          </button>
        </div>

        {/* Ajuste Global: Valor / Especificação (10k, 100uF...) */}
        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200/90 shadow-2xs">
          <span
            className="text-[10.5px] font-mono font-bold text-blue-600 select-none mr-0.5"
            title="Tamanho global da fonte das Especificações e Valores (10k, 100uF...)"
          >
            VAL
          </span>
          <button
            onClick={() => setValueFontSize((prev) => Math.max(8, prev - 1))}
            title="Diminuir fonte dos Valores (-1px)"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer select-none"
          >
            -
          </button>
          <span className="text-[11px] font-mono font-bold text-blue-700 min-w-4 text-center select-none">
            {valueFontSize}
          </span>
          <button
            onClick={() => setValueFontSize((prev) => Math.min(26, prev + 1))}
            title="Aumentar fonte dos Valores (+1px)"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer select-none"
          >
            +
          </button>
        </div>
      </div>

      {/* Direita: Salvar, Abrir, Atalhos e Exportar */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLoadJson}
          accept=".json"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="Abrir projeto salvo em JSON"
        >
          <FolderOpen className="w-4 h-4 text-slate-600" />
          <span>Abrir</span>
        </button>

        <button
          onClick={handleSaveJson}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="Salvar projeto em JSON"
        >
          <Save className="w-4 h-4 text-slate-600" />
          <span>Salvar</span>
        </button>

        <button
          onClick={onOpenShortcutsModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          title="Ver atalhos de teclado e guia de uso"
        >
          <HelpCircle className="w-4 h-4 text-slate-600" />
          <span>Atalhos</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium">Sincronizado</span>
        </div>

        {/* Botão Único de Exportação */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Exportar esquemático (PNG, SVG, PDF ou Código LaTeX)"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};
