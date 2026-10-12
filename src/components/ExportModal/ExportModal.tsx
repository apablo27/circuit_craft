import React, { useState } from 'react';
import { X, Download, FileImage, FileCode, FileText } from 'lucide-react';
import type { ExportOptions } from '../../types/circuit';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: (options: ExportOptions) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onConfirmExport,
}) => {
  const [format, setFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [background, setBackground] = useState<'transparent' | 'white'>('white');
  const [includeGrid, setIncludeGrid] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    onConfirmExport({
      format,
      scale,
      background,
      includeGrid,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg">Exportar Esquemático</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Escolha do Formato */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            1. Formato do Arquivo
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setFormat('png')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'png'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                  : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileImage className="w-6 h-6" />
              <span className="text-xs font-bold">PNG</span>
              <span className="text-[10px] text-slate-400">Imagem Bitmap</span>
            </button>

            <button
              onClick={() => setFormat('svg')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'svg'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                  : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-6 h-6" />
              <span className="text-xs font-bold">SVG</span>
              <span className="text-[10px] text-slate-400">Vetor Editável</span>
            </button>

            <button
              onClick={() => setFormat('pdf')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                format === 'pdf'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md'
                  : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs font-bold">PDF</span>
              <span className="text-[10px] text-slate-400">Documento</span>
            </button>
          </div>
        </div>

        {/* Opções de Resolução (se PNG) */}
        {format === 'png' && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              2. Qualidade e Resolução
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Padrão (1x)', val: 1 },
                { label: 'Alta (2x HD)', val: 2 },
                { label: 'Ultra (4x 300DPI)', val: 4 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setScale(item.val as 1 | 2 | 4)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    scale === item.val
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Opções de Fundo */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {format === 'png' ? '3. Fundo do Circuito' : '2. Fundo do Circuito'}
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => setBackground('white')}
              className={`p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                background === 'white'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              Fundo Branco (Para Documentos)
            </button>

            <button
              onClick={() => setBackground('transparent')}
              className={`p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                background === 'transparent'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              Fundo Transparente
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeGrid}
              onChange={(e) => setIncludeGrid(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            Incluir grade de fundo na imagem exportada
          </label>
        </div>

        {/* Botão de confirmação */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar Arquivo
          </button>
        </div>
      </div>
    </div>
  );
};
