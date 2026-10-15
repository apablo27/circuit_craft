import jsPDF from 'jspdf';
import type { ExportOptions } from '../types/circuit';

export async function exportCircuit(
  svgElement: SVGSVGElement,
  options: ExportOptions,
  filename: string = 'circuito_esquematico'
) {
  if (!svgElement) return;

  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // 1. Remove elementos auxiliares de UI e halos de seleção no clone
  clone.querySelectorAll('.animate-pulse').forEach((h) => h.remove());

  // Remove caixas de seleção de componentes (retângulos tracejados e âncoras nos cantos)
  clone
    .querySelectorAll('rect[stroke-dasharray="4 4"], rect[strokeDasharray="4 4"]')
    .forEach((rect) => {
      const parent = rect.parentElement;
      if (parent && parent.tagName.toLowerCase() === 'g') {
        parent.remove();
      } else {
        rect.remove();
      }
    });

  // Remove caixa de seleção por área
  clone
    .querySelectorAll('rect[fill="rgba(37, 99, 235, 0.08)"]')
    .forEach((r) => r.remove());

  // Remove alças de ajuste manual de curvas de fios
  clone
    .querySelectorAll('circle[class*="cursor-grab"], circle[class*="active:cursor-grabbing"]')
    .forEach((c) => c.remove());

  // Remove elementos transparentes de hitbox
  clone
    .querySelectorAll('path[stroke="transparent"], rect[fill="transparent"], circle[fill="transparent"]')
    .forEach((el) => el.remove());

  // Normaliza cores de componentes que estavam selecionados para a cor técnica padrão
  clone.querySelectorAll('g[stroke="#4f46e5"], g[stroke="#6366f1"]').forEach((g) => {
    g.setAttribute('stroke', '#0f172a');
    if (g.getAttribute('stroke-width') === '3' || g.getAttribute('strokeWidth') === '3') {
      g.setAttribute('stroke-width', '2');
    }
  });
  clone.querySelectorAll('path[stroke="#4f46e5"]').forEach((p) => {
    p.setAttribute('stroke', '#0f172a');
    if (p.getAttribute('stroke-width') === '3' || p.getAttribute('strokeWidth') === '3') {
      p.setAttribute('stroke-width', '2');
    }
  });

  // 2. Calcula o bounding box REAL considerando apenas o grupo dos fios e componentes
  // No DOM original, mainGroup.getBBox() retorna as coordenadas locais não transformadas (sem pan/zoom)
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

  // 3. Reseta o pan/zoom do grupo clonado para coincidir com as coordenadas de gBBox
  const cloneMainGroup = clone.querySelector('g');
  if (cloneMainGroup) {
    cloneMainGroup.removeAttribute('transform');
  }

  const padding = 40;
  const x = Math.floor(bbox.x - padding);
  const y = Math.floor(bbox.y - padding);
  const width = Math.max(100, Math.ceil(bbox.width + padding * 2));
  const height = Math.max(100, Math.ceil(bbox.height + padding * 2));

  // Injeta atributos essenciais de SVG
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  clone.setAttribute('width', `${width}`);
  clone.setAttribute('height', `${height}`);

  // 4. Trata a grade pontilhada
  const gridRect = clone.querySelector('rect[fill*="grid-dots"]');
  if (!options.includeGrid) {
    if (gridRect) gridRect.remove();
    const defs = clone.querySelector('defs');
    if (defs) {
      defs.querySelectorAll('pattern[id*="grid-dots"]').forEach((p) => p.remove());
    }
  } else if (gridRect) {
    gridRect.setAttribute('x', `${x}`);
    gridRect.setAttribute('y', `${y}`);
    gridRect.setAttribute('width', `${width}`);
    gridRect.setAttribute('height', `${height}`);
  }

  // 5. Trata o fundo branco
  if (options.background === 'white') {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', `${x}`);
    bgRect.setAttribute('y', `${y}`);
    bgRect.setAttribute('width', `${width}`);
    bgRect.setAttribute('height', `${height}`);
    bgRect.setAttribute('fill', '#ffffff');
    clone.insertBefore(bgRect, clone.firstChild);
  }

  // 6. Injeta folha de estilos autônoma para garantir tipografia e traços corretos
  let defs = clone.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    clone.insertBefore(defs, clone.firstChild);
  }
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `
    text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }
    .stroke-slate-800, .stroke-slate-900 { stroke: #0f172a; stroke-width: 2px; }
    .stroke-indigo-500, .stroke-indigo-600 { stroke: #4f46e5; stroke-width: 2px; }
  `;
  defs.appendChild(styleEl);

  const svgData = new XMLSerializer().serializeToString(clone);

  if (options.format === 'svg') {
    // Exportar arquivo vetorial SVG
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${filename}.svg`);
    return;
  }

  // Renderiza SVG em uma imagem HTML para PNG e PDF
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const scale = options.scale || 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }

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

  img.onerror = (err) => {
    console.error('Erro ao renderizar SVG em imagem canvas para exportação:', err);
    URL.revokeObjectURL(url);
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
