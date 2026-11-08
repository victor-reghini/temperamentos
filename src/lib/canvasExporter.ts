import { AXES_META, getFormattedAxes, getFormattedProportions, TEMPERAMENT_META } from './psychometrics';
import type { TemperamentResult } from '../types/temperament';

export type ExportCardFormat = '9:16' | '1:1';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function renderTemperamentCanvas(
  result: TemperamentResult,
  format: ExportCardFormat
): Promise<string> {
  const width = 1080;
  const height = format === '9:16' ? 1920 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Contexto 2D indisponível no navegador.');

  const isStory = format === '9:16';
  const padX = 72;

  // Fundo escuro fosco em tons de cinza neutro (Estilo VS Code Dark Theme)
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, width, height);

  // Moldura estrutural interna
  ctx.strokeStyle = '#2d2d2d';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 36, 36, width - 72, height - 72, 24);
  ctx.stroke();

  // Cabeçalho
  let y = isStory ? 115 : 92;
  ctx.fillStyle = '#969696';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('4T • TEMPERAMENTOS • MATRIZ NEUROBIOLÓGICA', padX, y);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#808080';
  ctx.font = '500 20px monospace';
  ctx.fillText(`ID #${result.id.slice(0, 8)} • ${result.precisionEstimate}% PRECISÃO`, width - padX, y);

  // Título Composto
  y += isStory ? 72 : 54;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isStory ? 64 : 50}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(result.compositeName, padX, y);

  const domMeta = TEMPERAMENT_META[result.dominant];
  y += isStory ? 44 : 34;
  ctx.fillStyle = domMeta.textColor;
  ctx.font = `600 ${isStory ? 26 : 22}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(`${domMeta.classicalHumor} • ${domMeta.neuroCorrelate}`, padX, y);

  // Seção 1: Barras dos 4 Temperamentos
  y += isStory ? 68 : 44;
  ctx.fillStyle = '#d4d4d4';
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('PROPORÇÃO DOS 4 TEMPERAMENTOS (MARCADOR CENTRAL 25%)', padX, y);

  const proportions = getFormattedProportions(result);
  const barWidth = width - padX * 2;
  const barHeight = isStory ? 48 : 34;
  const rowGap = isStory ? 105 : 74;

  y += isStory ? 28 : 20;

  for (const item of proportions) {
    // Label e percentual absoluto
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${isStory ? 28 : 23}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`${item.name} (${item.classicalElement})`, padX, y + 24);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${isStory ? 30 : 24}px monospace`;
    ctx.fillText(`${item.percentage}%  [Afinidade ${item.affinityScore}%]`, width - padX, y + 24);

    const trackY = y + (isStory ? 38 : 32);

    // Trilho de fundo
    ctx.fillStyle = '#252526';
    drawRoundedRect(ctx, padX, trackY, barWidth, barHeight, 10);
    ctx.fill();

    // Preenchimento com gradiente suave do humor
    const fillW = Math.max(18, Math.round((item.percentage / 100) * barWidth));
    const grad = ctx.createLinearGradient(padX, trackY, padX + fillW, trackY);
    grad.addColorStop(0, item.gradientFrom);
    grad.addColorStop(1, item.gradientTo);
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, padX, trackY, fillW, barHeight, 10);
    ctx.fill();

    // Marcador de equilíbrio (25% e 50%)
    const marker25X = padX + barWidth * 0.25;
    const marker50X = padX + barWidth * 0.5;
    ctx.strokeStyle = '#80808088';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marker25X, trackY - 4);
    ctx.lineTo(marker25X, trackY + barHeight + 4);
    ctx.moveTo(marker50X, trackY - 4);
    ctx.lineTo(marker50X, trackY + barHeight + 4);
    ctx.stroke();

    y += rowGap;
  }

  // Seção 2: Os 4 Eixos Neurobiológicos (Split Bar)
  y += isStory ? 36 : 16;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d4d4d4';
  ctx.font = '700 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('MATRIZ DOS 4 EIXOS NEUROBIOLÓGICOS (PEN + FISHER)', padX, y);

  y += isStory ? 30 : 20;
  const axesList = getFormattedAxes(result);
  const axisBarH = isStory ? 44 : 28;
  const axisGap = isStory ? 115 : 74;

  for (const ax of axesList) {
    const meta = AXES_META[ax.key];
    ctx.textAlign = 'left';
    ctx.fillStyle = '#d4d4d4';
    ctx.font = `700 ${isStory ? 24 : 19}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`${ax.leftPole} (${ax.leftPercent}%)`, padX, y + 20);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#969696';
    ctx.font = `600 ${isStory ? 20 : 16}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(ax.label.toUpperCase(), width / 2, y + 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#d4d4d4';
    ctx.font = `700 ${isStory ? 24 : 19}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`(${ax.rightPercent}%) ${ax.rightPole}`, width - padX, y + 20);

    const barY = y + (isStory ? 32 : 26);

    // Barra esquerda
    const leftW = Math.round((ax.leftPercent / 100) * barWidth);
    const rightW = barWidth - leftW;

    ctx.fillStyle = meta.leftColor;
    drawRoundedRect(ctx, padX, barY, Math.max(8, leftW), axisBarH, 8);
    ctx.fill();

    ctx.fillStyle = meta.rightColor;
    drawRoundedRect(ctx, padX + leftW, barY, Math.max(8, rightW), axisBarH, 8);
    ctx.fill();

    // Marcador central 50%
    const centerX = padX + barWidth / 2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, barY - 5);
    ctx.lineTo(centerX, barY + axisBarH + 5);
    ctx.stroke();

    y += axisGap;
  }

  // Bloco extra de síntese no formato 9:16 (Stories)
  if (isStory) {
    y += 20;
    ctx.fillStyle = '#252526';
    drawRoundedRect(ctx, padX, y, barWidth, 210, 16);
    ctx.fill();
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('COORDENADAS EYSENCK PEN & PERFIL NEUROQUÍMICO', padX + 32, y + 52);

    ctx.fillStyle = '#d4d4d4';
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `• Extroversão Cortical: ${result.eysenck.extroversao}%   |   Retenção / Sensibilidade: ${result.eysenck.neuroticismo}%`,
      padX + 32,
      y + 105
    );
    ctx.fillText(
      `• Dominância: ${TEMPERAMENT_META[result.dominant].name} (${result.temperaments[result.dominant]}%) + ${TEMPERAMENT_META[result.secondary].name} (${result.temperaments[result.secondary]}%)`,
      padX + 32,
      y + 155
    );
  }

  // Rodapé do Card
  ctx.textAlign = 'center';
  ctx.fillStyle = '#808080';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    'Descubra sua matriz neurobiológica em Temperamentos (4T)',
    width / 2,
    height - 64
  );

  return canvas.toDataURL('image/png');
}

export function buildWhatsAppShareUrl(result: TemperamentResult, shareLink: string): string {
  const colericoPct = result.temperaments.colerico;
  const melancolicoPct = result.temperaments.melancolico;
  const domName = TEMPERAMENT_META[result.dominant].name;
  const domPct = result.temperaments[result.dominant];
  const secName = TEMPERAMENT_META[result.secondary].name;
  const secPct = result.temperaments[result.secondary];

  const message = `Descobri minha matriz de temperamentos no Temperamentos (4T): ${colericoPct}% Colérico, ${melancolicoPct}% Melancólico (Perfil ${domName}-${secName}: ${domPct}% / ${secPct}%). Veja meu resultado: ${shareLink}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

