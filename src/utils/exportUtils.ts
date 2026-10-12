import jsPDF from 'jspdf';
import type { ExportOptions } from '../types/circuit';

export async function exportCircuit(
  svgElement: SVGSVGElement,
  options: ExportOptions,
  filename: string = 'circuito_esquematico'
) {
  if (!svgElement) return;

  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Remove elementos auxiliares de UI no clone antes de exportar
  const uiGrid = clone.querySelector('#canvas-grid');
  if (uiGrid && !options.includeGrid) {
    uiGrid.remove();
  }

  // Remove halos de seleção ativos no clone
  const halos = clone.querySelectorAll('.animate-pulse');
  halos.forEach((h) => h.remove());

  // Calcula o bounding box REAL considerando apenas o grupo contendo os fios e componentes
  // (Ignora o retângulo do fundo de 100% de tela)
  const mainGroup = svgElement.querySelector('g');
  let bbox = { x: 0, y: 0, width: 800, height: 600 };

  if (mainGroup) {
    try {
      const gBBox = mainGroup.getBBox();
      if (gBBox.width > 0 && gBBox.height > 0) {
        bbox = gBBox;
      }
    } catch {
      bbox = svgElement.getBBox();
    }
  } else {
    bbox = svgElement.getBBox();
  }

  const padding = 40;
  const x = Math.floor(bbox.x - padding);
  const y = Math.floor(bbox.y - padding);
  const width = Math.max(100, Math.ceil(bbox.width + padding * 2));
  const height = Math.max(100, Math.ceil(bbox.height + padding * 2));

  // Injeta namespace SVG para renderização em canvas/imagem sem quebra
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  clone.setAttribute('width', `${width}`);
  clone.setAttribute('height', `${height}`);

  if (options.background === 'white') {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', `${x}`);
    rect.setAttribute('y', `${y}`);
    rect.setAttribute('width', `${width}`);
    rect.setAttribute('height', `${height}`);
    rect.setAttribute('fill', '#ffffff');
    clone.insertBefore(rect, clone.firstChild);
  }

  const svgData = new XMLSerializer().serializeToString(clone);

  if (options.format === 'svg') {
    // Exportar arquivo vetorial SVG
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${filename}.svg`);
    return;
  }

  // Renderiza SVG em uma imagem HTML
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const scale = options.scale || 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (options.background === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    URL.revokeObjectURL(url);

    if (options.format === 'png') {
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${filename}.png`);
      }, 'image/png');
    } else if (options.format === 'pdf') {
      const imgData = canvas.toDataURL('image/png');
      const orientation = width > height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [width, height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${filename}.pdf`);
    }
  };

  img.src = url;
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
