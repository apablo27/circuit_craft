import type { ComponentType } from '../types/circuit';

/**
 * Normaliza e anexa a unidade de medida técnica de engenharia automaticamente
 * com base no tipo de componente e no que o usuário digitou.
 * 
 * Exemplos:
 * - Capacitor: '47u' -> '47 µF', '100n' -> '100 nF', '10p' -> '10 pF'
 * - Resistor: '10k' -> '10 kΩ', '4k7' -> '4.7 kΩ', '100' -> '100 Ω', '1M' -> '1 MΩ'
 * - Fonte/Zener: '12' -> '12 V', '5' -> '5 V', '500m' -> '500 mV'
 * - Clock: '1k' -> '1 kHz', '60' -> '60 Hz'
 */
export function formatEngineeringValue(rawValue: string, type: ComponentType): string {
  if (!rawValue) return '';
  const trimmed = rawValue.trim();
  if (!trimmed) return '';

  // Tipos de componentes resistivos
  if (type === 'RESISTOR') {
    return formatResistorValue(trimmed);
  }

  // Tipos de componentes capacitivos
  if (type === 'CAPACITOR' || type === 'CAPACITOR_POLAR') {
    return formatCapacitorValue(trimmed);
  }

  // Tipos de fontes de tensão e zener
  if (type === 'SOURCE_DC' || type === 'SOURCE_AC' || type === 'VCC' || type === 'DIODE_ZENER') {
    return formatVoltageValue(trimmed);
  }

  // Geradores de clock / pulsos
  if (type === 'CLOCK') {
    return formatFrequencyValue(trimmed);
  }

  // Para outros componentes, apenas normaliza espaços
  return trimmed;
}

function formatResistorValue(val: string): string {
  // Já possui Ω ou ohm?
  let cleaned = val.replace(/\s*(?:ohms?|ohm|Ω)\s*$/i, '');

  // Padrão tipo 4k7, 2M2, 4R7, 1k5
  const engineeringNotation = cleaned.match(/^(\d+)([kKmMrR])(\d+)$/);
  if (engineeringNotation) {
    const intPart = engineeringNotation[1];
    const prefix = engineeringNotation[2].toLowerCase();
    const decPart = engineeringNotation[3];
    const num = `${intPart}.${decPart}`;
    if (prefix === 'k') return `${num} kΩ`;
    if (prefix === 'm') return `${num} MΩ`;
    if (prefix === 'r') return `${num} Ω`;
  }

  // Padrão número + sufixo: 10k, 4.7k, 1M, 100m, 100R, 100
  const suffixMatch = cleaned.match(/^([+-]?\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?$/);
  if (suffixMatch) {
    const num = suffixMatch[1].replace(',', '.');
    const suffix = suffixMatch[2] ? suffixMatch[2].toLowerCase() : '';

    if (!suffix || suffix === 'r') {
      return `${num} Ω`;
    }
    if (suffix === 'k') {
      return `${num} kΩ`;
    }
    if (suffix === 'm' || suffix === 'meg') {
      return `${num} MΩ`;
    }
    if (suffix === 'g') {
      return `${num} GΩ`;
    }
    if (suffix === 'm' || suffix === 'milli') {
      return `${num} mΩ`;
    }
  }

  return val;
}

function formatCapacitorValue(val: string): string {
  // Limpa sufixos existentes de Farad (f, F, uf, uF, µF, nF, pF, etc.)
  let cleaned = val.replace(/\s*[fF]\s*$/, '');

  // Padrão tipo 4u7, 2n2, 1p5
  const engineeringNotation = cleaned.match(/^(\d+)([uUµnNpPmM])(\d+)$/);
  if (engineeringNotation) {
    const intPart = engineeringNotation[1];
    let prefix = engineeringNotation[2];
    const decPart = engineeringNotation[3];
    if (prefix.toLowerCase() === 'u' || prefix === 'µ') prefix = 'µ';
    else if (prefix.toLowerCase() === 'n') prefix = 'n';
    else if (prefix.toLowerCase() === 'p') prefix = 'p';
    else if (prefix.toLowerCase() === 'm') prefix = 'm';
    return `${intPart}.${decPart} ${prefix}F`;
  }

  // Padrão número + sufixo
  const match = cleaned.match(/^([+-]?\d+(?:[.,]\d+)?)\s*([a-zA-Zµ]+)?$/);
  if (match) {
    const num = match[1].replace(',', '.');
    const suffix = match[2] ? match[2].toLowerCase() : '';

    if (suffix === 'u' || suffix === 'µ' || suffix === 'micro') {
      return `${num} µF`;
    }
    if (suffix === 'n' || suffix === 'nano') {
      return `${num} nF`;
    }
    if (suffix === 'p' || suffix === 'pico') {
      return `${num} pF`;
    }
    if (suffix === 'm' || suffix === 'milli') {
      return `${num} mF`;
    }
    if (suffix === '') {
      // Se digitou apenas o número (ex: 47 ou 100), em circuitos é padrão microfarad (µF)
      return `${num} µF`;
    }
  }

  return val;
}

function formatVoltageValue(val: string): string {
  let cleaned = val.replace(/\s*[vV](?:dc|rms|ac)?\s*$/i, '');

  const match = cleaned.match(/^([+-]?\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?$/);
  if (match) {
    const num = match[1].replace(',', '.');
    const suffix = match[2] ? match[2].toLowerCase() : '';

    if (suffix === 'm' || suffix === 'mv') {
      return `${num} mV`;
    }
    if (suffix === 'k' || suffix === 'kv') {
      return `${num} kV`;
    }
    if (!suffix || suffix === 'v') {
      return `${num} V`;
    }
  }

  return val;
}

function formatFrequencyValue(val: string): string {
  let cleaned = val.replace(/\s*hz\s*$/i, '');

  const match = cleaned.match(/^([+-]?\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?$/);
  if (match) {
    const num = match[1].replace(',', '.');
    const suffix = match[2] ? match[2].toLowerCase() : '';

    if (suffix === 'k') return `${num} kHz`;
    if (suffix === 'm') return `${num} MHz`;
    if (suffix === 'g') return `${num} GHz`;
    if (!suffix) return `${num} Hz`;
  }

  return val;
}
