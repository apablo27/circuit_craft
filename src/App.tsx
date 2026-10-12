import React, { useRef, useState } from 'react';
import { Header } from './components/Header/Header';
import { ComponentPalette } from './components/Sidebar/ComponentPalette';
import { CircuitCanvas } from './components/Canvas/CircuitCanvas';
import { PropertiesPanel } from './components/Inspector/PropertiesPanel';
import { ExportModal } from './components/ExportModal/ExportModal';
import { CircuitikzModal } from './components/CircuitikzModal/CircuitikzModal';
import { ShortcutsModal } from './components/ShortcutsModal/ShortcutsModal';
import { PresetModal } from './components/PresetModal/PresetModal';
import { exportCircuit } from './utils/exportUtils';
import type { ExportOptions } from './types/circuit';

export const App: React.FC = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCircuitikzModalOpen, setIsCircuitikzModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleConfirmExport = (options: ExportOptions) => {
    if (svgRef.current) {
      exportCircuit(svgRef.current, options);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      {/* Barra de Navegação Superior */}
      <Header
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCircuitikzModal={() => setIsCircuitikzModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
      />

      {/* Área Principal: Sidebar | Canvas Interativo | Painel de Propriedades */}
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette onOpenPresetModal={() => setIsPresetModalOpen(true)} />
        <CircuitCanvas svgRef={svgRef} />
        <PropertiesPanel />
      </div>

      {/* Modal de Exportação de Imagem */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirmExport={handleConfirmExport}
      />

      {/* Modal de LaTeX CircuiTikZ */}
      <CircuitikzModal
        isOpen={isCircuitikzModalOpen}
        onClose={() => setIsCircuitikzModalOpen(false)}
      />

      {/* Modal de Guia de Atalhos */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Modal de Circuitos Prontos & Módulos */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
      />
    </div>
  );
};

export default App;
