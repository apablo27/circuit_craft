import React from 'react';
import { X, Keyboard, MousePointer, RotateCw, Trash2, ZoomIn, FileCode } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + R', description: 'Rotacionar componente selecionado (90°)', icon: RotateCw },
    { key: 'R', description: 'Inserir Resistor no canvas' },
    { key: 'G', description: 'Inserir Terra (GND) no canvas' },
    { key: 'V', description: 'Inserir Fonte de Tensão (DC Source) no canvas' },
    { key: 'Del / Backspace', description: 'Remover componente ou fio selecionado', icon: Trash2 },
    { key: 'Ctrl + Z', description: 'Desfazer última alteração' },
    { key: 'Ctrl + Y', description: 'Refazer alteração' },
    { key: 'Scroll do Mouse', description: 'Aumentar ou diminuir Zoom no canvas', icon: ZoomIn },
    { key: 'Arrastar Fio', description: 'Clique em um pino/terminal e solte em outro pino para conectar', icon: MousePointer },
    { key: 'LaTeX (CircuiTikZ)', description: 'Exportar/Importar circuito em código TeX acadêmico', icon: FileCode },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <Keyboard className="w-5 h-5" />
            <h2 className="text-base text-slate-900">Atalhos & Guia Rápido do Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo dos atalhos */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <p className="text-xs text-slate-500 mb-4">
            Utilize os atalhos abaixo para agilizar a criação de seus esquemas elétricos para relatórios e artigos.
          </p>

          <div className="grid gap-2.5">
            {shortcuts.map((sc, index) => {
              const Icon = sc.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4 text-indigo-600 shrink-0" />}
                    <span className="text-xs font-medium text-slate-700">{sc.description}</span>
                  </div>
                  <kbd className="px-2.5 py-1 text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md shadow-xs shrink-0">
                    {sc.key}
                  </kbd>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
