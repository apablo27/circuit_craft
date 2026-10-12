import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Code, Check, Upload } from 'lucide-react';
import { useCircuitStore } from '../../store/useCircuitStore';
import { exportToCircuitikz, importFromCircuitikz } from '../../utils/circuitikzUtils';

interface CircuitikzModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CircuitikzModal: React.FC<CircuitikzModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { components, wires, loadProject } = useCircuitStore();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [latexCode, setLatexCode] = useState<string>('');
  const [importCode, setImportCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const code = exportToCircuitikz(components, wires);
      setLatexCode(code);
      setCopied(false);
    }
  }, [isOpen, components, wires]);

  if (!isOpen) return null;

  const handleCopy = () => {
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

  const handleImport = () => {
    if (!importCode.trim()) return;
    const { components: importedComps, wires: importedWires } = importFromCircuitikz(importCode);
    if (importedComps.length > 0) {
      loadProject(
        JSON.stringify({
          components: importedComps,
          wires: importedWires,
        })
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg">LaTeX CircuiTikZ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Exportar vs Importar */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'export'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar Código LaTeX
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'import'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importar Código LaTeX
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <textarea
                readOnly
                value={latexCode}
                className="w-full h-56 bg-transparent font-mono text-xs text-indigo-300 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
              <span>💡 Adicione <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">\usepackage[american]{'circuitikz'}</code> no preâmbulo do seu arquivo .tex</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código LaTeX
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadTex}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Arquivo .tex
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Cole o código LaTeX CircuiTikZ contendo comandos <code className="text-indigo-400">\begin{'circuitikz'} ... \end{'circuitikz'}</code> para importar o circuito para a tela.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <textarea
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="\begin{circuitikz}&#10;  \draw (0,0) to[R, l=$R1=10k\Omega$] (2,0);&#10;\end{circuitikz}"
                className="w-full h-56 bg-transparent font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleImport}
              disabled={!importCode.trim()}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Circuito para o Canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
