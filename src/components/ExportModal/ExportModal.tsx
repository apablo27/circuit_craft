import React, { useState, useEffect } from 'react';
import { X, Download, FileImage, FileCode, FileText, Code2, Copy, Check } from 'lucide-react';
import type { ExportOptions } from '../../types/circuit';
import { useCircuitStore } from '../../store/useCircuitStore';
import { exportToCircuitikz } from '../../utils/circuitikzUtils';

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
  const { components, wires } = useCircuitStore();

  const [format, setFormat] = useState<'png' | 'svg' | 'pdf' | 'latex'>('png');
  const [scale, setScale] = useState<1 | 2 | 4>(2);
  const [background, setBackground] = useState<'transparent' | 'white'>('white');
  const [includeGrid, setIncludeGrid] = useState<boolean>(false);
  const [latexCode, setLatexCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const code = exportToCircuitikz(components, wires);
      setLatexCode(code);
      setCopied(false);
    }
  }, [isOpen, components, wires]);

  if (!isOpen) return null;

  const handleExportMedia = () => {
    if (format === 'latex') return;
    onConfirmExport({
      format,
      scale,
      background,
      includeGrid,
    });
    onClose();
  };

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuito_circuitikz.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-slate-800 space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">Exportar Circuito</h3>
              <p className="text-xs text-slate-500">Escolha o formato de saída ideal para apostilas, artigos e documentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Escolha do Formato */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-2">
            1. Formato de Exportação
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setFormat('png')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                format === 'png'
                  ? 'bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileImage className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold">PNG</span>
              <span className="text-[10px] text-slate-400">Imagem HD</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('svg')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                format === 'svg'
                  ? 'bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileCode className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold">SVG</span>
              <span className="text-[10px] text-slate-400">Vetor</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                format === 'pdf'
                  ? 'bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-5 h-5 text-red-600" />
              <span className="text-xs font-bold">PDF</span>
              <span className="text-[10px] text-slate-400">Documento</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat('latex')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                format === 'latex'
                  ? 'bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold">LaTeX</span>
              <span className="text-[10px] text-slate-400">CircuiTikZ</span>
            </button>
          </div>
        </div>

        {/* ================= SELEÇÃO: CÓDIGO LATEX / CIRCUITYKZ ================= */}
        {format === 'latex' ? (
          <div className="space-y-3 pt-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Código LaTeX / CircuiTikZ Gerado
              </label>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Pronto para compilar
              </span>
            </div>

            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto max-h-52 leading-relaxed border border-slate-800 selection:bg-emerald-800">
              {latexCode}
            </pre>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLatex}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Código Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTex}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo .tex</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= SELEÇÃO: IMAGEM (PNG / SVG / PDF) ================= */
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            {/* Opções de Resolução (se PNG) */}
            {format === 'png' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-2">
                  2. Resolução da Imagem
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Padrão (1x)', val: 1 },
                    { label: 'Alta (2x HD)', val: 2 },
                    { label: 'Ultra (4x 300 DPI)', val: 4 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setScale(item.val as 1 | 2 | 4)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        scale === item.val
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-2">
                {format === 'png' ? '3. Fundo do Circuito' : '2. Fundo do Circuito'}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => setBackground('white')}
                  className={`p-2 rounded-lg border text-xs font-medium transition-colors text-center ${
                    background === 'white'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Fundo Branco (Para Documentos)
                </button>

                <button
                  type="button"
                  onClick={() => setBackground('transparent')}
                  className={`p-2 rounded-lg border text-xs font-medium transition-colors text-center ${
                    background === 'transparent'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Fundo Transparente
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeGrid}
                  onChange={(e) => setIncludeGrid(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Incluir grade pontilhada na imagem exportada</span>
              </label>
            </div>

            {/* Botão de confirmação de mídia */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExportMedia}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar {format.toUpperCase()}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
