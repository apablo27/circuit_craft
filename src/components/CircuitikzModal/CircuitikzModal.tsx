import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Check, Upload, FileCode, AlertCircle, Sparkles } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [latexCode, setLatexCode] = useState<string>('');
  const [importCode, setImportCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const code = exportToCircuitikz(components, wires);
      setLatexCode(code);
      setCopied(false);
      setErrorMessage(null);
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

  const handleInsertSample = () => {
    const sample = `\\begin{circuitikz}[american, scale=0.9]
  \\draw (0,0) to[R, l={$R1=10k\\Omega$}] (2.5,0);
  \\draw (2.5,0) to[led, l={$LED1$}] (5,0);
  \\draw (5,0) node[ground] {};
  \\draw (0,0) node[vcc] {$+5V$};
\\end{circuitikz}`;
    setImportCode(sample);
    setErrorMessage(null);
  };

  const handleImport = () => {
    setErrorMessage(null);
    if (!importCode.trim()) {
      setErrorMessage('Cole um código LaTeX CircuiTikZ no campo acima antes de importar.');
      return;
    }

    try {
      const { components: importedComps, wires: importedWires } = importFromCircuitikz(importCode);

      if (importedComps.length > 0) {
        loadProject(
          JSON.stringify({
            components: importedComps,
            wires: importedWires,
          })
        );
        onClose();
      } else {
        setErrorMessage(
          'Nenhum componente reconhecido no código LaTeX informado. Certifique-se de incluir blocos com comandos como \\draw ... to[...] ou \\draw ... node[...].'
        );
      }
    } catch (err) {
      console.error('Erro na importação LaTeX:', err);
      setErrorMessage('Falha ao processar o código LaTeX. Verifique se o código possui sintaxe válida.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl text-slate-800 space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">LaTeX CircuiTikZ</h3>
              <p className="text-xs text-slate-500">Importação e compilação bidirecional com código acadêmico TeX</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Alternáveis */}
        <div className="flex gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            Importar Código LaTeX
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Exportar Código LaTeX
          </button>
        </div>

        {/* Conteúdo da Aba */}
        {activeTab === 'import' ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <p className="text-slate-600">
                Cole comandos <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-semibold">\draw</code> ou blocos <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-semibold">\begin&#123;circuitikz&#125;</code>:
              </p>
              <button
                type="button"
                onClick={handleInsertSample}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Colar Exemplo</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-inner">
              <textarea
                value={importCode}
                onChange={(e) => {
                  setImportCode(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={`\\begin{circuitikz}[american]\n  \\draw (0,0) to[R, l=$R1=10k\\Omega$] (2,0);\n  \\draw (2,0) to[led, l=$LED1$] (4,0);\n  \\draw (4,0) node[ground] {};\n  \\draw (0,0) node[vcc] {$+5V$};\n\\end{circuitikz}`}
                className="w-full h-52 bg-transparent font-mono text-xs text-emerald-400 placeholder-slate-600 focus:outline-none resize-none leading-relaxed selection:bg-emerald-800"
              />
            </div>

            {/* Alerta de Erro se houver */}
            {errorMessage && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="flex-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Importar Circuito para o Canvas</span>
              </button>
            </div>
          </div>
        ) : (
          /* Aba Exportar */
          <div className="space-y-3.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-inner">
              <textarea
                readOnly
                value={latexCode}
                className="w-full h-52 bg-transparent font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed selection:bg-emerald-800"
              />
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 font-mono">
              <span className="text-indigo-600 font-bold">Dica:</span>
              <span>Inclua <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-indigo-700">\usepackage[american]&#123;circuitikz&#125;</code> no preâmbulo do seu LaTeX.</span>
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopy}
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
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo .tex</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
