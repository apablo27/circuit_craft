import React, { useRef } from 'react';
import {
  Download,
  RotateCcw,
  RotateCw,
  Trash2,
  FolderOpen,
  Save,
  ZoomIn,
  ZoomOut,
  Cpu,
  Code,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useCircuitStore } from '../../store/useCircuitStore';

interface HeaderProps {
  onOpenExportModal: () => void;
  onOpenCircuitikzModal: () => void;
  onOpenShortcutsModal: () => void;
  onOpenPresetModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExportModal,
  onOpenCircuitikzModal,
  onOpenShortcutsModal,
  onOpenPresetModal,
}) => {
  const {
    undo,
    redo,
    historyIndex,
    history,
    clearCanvas,
    loadProject,
    getProjectJson,
    zoom,
    setZoom,
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
    <header className="h-16 bg-white border-b border-slate-200 text-slate-800 px-6 flex items-center justify-between shadow-sm z-20 select-none">
      {/* Esquerda: Logo e Título */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-slate-900">
            CircuitCraft <span className="text-indigo-600 font-medium text-xs bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">Web</span>
          </h1>
          <p className="text-xs text-slate-500">Desenho e Exportação Didática de Circuitos</p>
        </div>
      </div>

      {/* Centro: Ferramentas de Edição e Histórico */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={undo}
          disabled={historyIndex < 0}
          title="Desfazer (Ctrl+Z)"
          className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Refazer (Ctrl+Y)"
          className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
          title="Diminuir Zoom"
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono px-2 text-slate-700 w-12 text-center font-semibold">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
          title="Aumentar Zoom"
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        <button
          onClick={clearCanvas}
          title="Limpar Canvas"
          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Direita: Salvar, Abrir e Exportar Imagem */}
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
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          title="Abrir projeto salvo em JSON"
        >
          <FolderOpen className="w-4 h-4" />
          Abrir
        </button>

        <button
          onClick={handleSaveJson}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          title="Salvar projeto em JSON"
        >
          <Save className="w-4 h-4" />
          Salvar
        </button>

        <button
          onClick={onOpenPresetModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors shadow-xs"
          title="Inserir circuitos didáticos prontos (Ponte de diodos, LED, Resistores...)"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Circuitos Prontos
        </button>

        <button
          onClick={onOpenShortcutsModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          title="Ver atalhos de teclado e guia de uso"
        >
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          Atalhos
        </button>

        <button
          onClick={onOpenCircuitikzModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
          title="Importar/Exportar código LaTeX CircuiTikZ"
        >
          <Code className="w-4 h-4" />
          LaTeX (CircuiTikZ)
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4" />
          Exportar Imagem (PNG/SVG/PDF)
        </button>
      </div>
    </header>
  );
};
