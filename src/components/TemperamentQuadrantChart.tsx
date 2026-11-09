import { useMemo } from 'react';
import {
  calculateBiologicalMatrixCoordinates,
  TEMPERAMENT_META,
} from '../lib/psychometrics';
import type { TemperamentResult } from '../types/temperament';

interface Props {
  result: TemperamentResult;
}

export function TemperamentQuadrantChart({ result }: Props) {
  const coords = useMemo(
    () => calculateBiologicalMatrixCoordinates(result),
    [result]
  );

  const domMeta = TEMPERAMENT_META[result.dominant];

  // Mapeamento das coordenadas SVG (área útil de 48px a 352px para não cortar textos)
  const svgMin = 48;
  const svgMax = 352;
  const svgSpan = svgMax - svgMin;
  const markerX = svgMin + (coords.plotX / 100) * svgSpan;
  const markerY = svgMin + (coords.plotY / 100) * svgSpan;

  return (
    <section
      aria-labelledby="heading-quadrant-chart"
      className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-5 sm:p-7 transition-colors space-y-6"
    >
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#e2e0d6] dark:border-[#2d2d2d]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#dcf2ec] text-[#1b5247] dark:bg-[#243242] dark:text-[#9fc0e5]">
              Matriz Bidimensional
            </span>
            <span className="text-xs font-mono text-[#5c5e64] dark:text-[#969696]">
              Plano Hipocrático-Galênico
            </span>
          </div>
          <h2
            id="heading-quadrant-chart"
            className="text-lg sm:text-xl font-bold text-[#18191b] dark:text-[#ffffff]"
          >
            Gráfico Quente / Frio × Seco / Úmido
          </h2>
          <p className="text-sm text-[#4e5056] dark:text-[#969696]">
            Mapeamento da sua assinatura biológica no cruzamento de velocidade de disparo e plasticidade de retenção.
          </p>
        </div>

        <div className="self-start sm:self-auto text-right">
          <span className="inline-block px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-[#efece1] text-[#18191b] dark:bg-[#1e1e1e] dark:text-[#e2e0d8] border border-[#d5d3c8] dark:border-[#333333]">
            {coords.primaryQuality}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Gráfico Cartesiano SVG */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[420px] aspect-square rounded-2xl p-2 bg-[#f4f2e9] dark:bg-[#1a1a1a] border border-[#dcdad0] dark:border-[#2d2d2d] shadow-inner select-none">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full overflow-visible"
              role="img"
              aria-label={`Gráfico cartesiano dos 4 temperamentos. Posição atual: ${coords.quadrantName}, ${coords.primaryQuality}`}
            >
              <defs>
                {/* Gradientes sutis para cada quadrante */}
                <radialGradient id="grad-colerico" cx="20%" cy="20%" r="80%">
                  <stop offset="0%" stopColor="#d9776c" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d9776c" stopOpacity="0.04" />
                </radialGradient>
                <radialGradient id="grad-sanguineo" cx="80%" cy="20%" r="80%">
                  <stop offset="0%" stopColor="#dfc16b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#dfc16b" stopOpacity="0.04" />
                </radialGradient>
                <radialGradient id="grad-melancolico" cx="20%" cy="80%" r="80%">
                  <stop offset="0%" stopColor="#5b82b0" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#5b82b0" stopOpacity="0.04" />
                </radialGradient>
                <radialGradient id="grad-fleumatico" cx="80%" cy="80%" r="80%">
                  <stop offset="0%" stopColor="#6eb096" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6eb096" stopOpacity="0.04" />
                </radialGradient>
              </defs>

              {/* Quadrante 1: Superior Esquerdo - COLÉRICO (Quente + Seco) */}
              <rect
                x="48"
                y="48"
                width="152"
                height="152"
                rx="12"
                fill="url(#grad-colerico)"
                stroke="#d9776c"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <text
                x="62"
                y="76"
                className="fill-[#a63c30] dark:fill-[#e08e6d] font-mono text-[11px] font-extrabold tracking-wider"
              >
                COLÉRICO
              </text>
              <text
                x="62"
                y="92"
                className="fill-[#5c5e64] dark:fill-[#969696] font-mono text-[9px]"
              >
                Quente + Seco (Fogo)
              </text>

              {/* Quadrante 2: Superior Direito - SANGUÍNEO (Quente + Úmido) */}
              <rect
                x="200"
                y="48"
                width="152"
                height="152"
                rx="12"
                fill="url(#grad-sanguineo)"
                stroke="#dfc16b"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <text
                x="338"
                y="76"
                textAnchor="end"
                className="fill-[#8f681d] dark:fill-[#dfc16b] font-mono text-[11px] font-extrabold tracking-wider"
              >
                SANGUÍNEO
              </text>
              <text
                x="338"
                y="92"
                textAnchor="end"
                className="fill-[#5c5e64] dark:fill-[#969696] font-mono text-[9px]"
              >
                Quente + Úmido (Ar)
              </text>

              {/* Quadrante 3: Inferior Esquerdo - MELANCÓLICO (Frio + Seco) */}
              <rect
                x="48"
                y="200"
                width="152"
                height="152"
                rx="12"
                fill="url(#grad-melancolico)"
                stroke="#5b82b0"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <text
                x="62"
                y="322"
                className="fill-[#365f8a] dark:fill-[#6a92be] font-mono text-[11px] font-extrabold tracking-wider"
              >
                MELANCÓLICO
              </text>
              <text
                x="62"
                y="338"
                className="fill-[#5c5e64] dark:fill-[#969696] font-mono text-[9px]"
              >
                Frio + Seco (Terra)
              </text>

              {/* Quadrante 4: Inferior Direito - FLEUMÁTICO (Frio + Úmido) */}
              <rect
                x="200"
                y="200"
                width="152"
                height="152"
                rx="12"
                fill="url(#grad-fleumatico)"
                stroke="#6eb096"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <text
                x="338"
                y="322"
                textAnchor="end"
                className="fill-[#2d7365] dark:fill-[#78c6b5] font-mono text-[11px] font-extrabold tracking-wider"
              >
                FLEUMÁTICO
              </text>
              <text
                x="338"
                y="338"
                textAnchor="end"
                className="fill-[#5c5e64] dark:fill-[#969696] font-mono text-[9px]"
              >
                Frio + Úmido (Água)
              </text>

              {/* Linhas Centrais dos Eixos (Crosshair) */}
              <line
                x1="48"
                y1="200"
                x2="352"
                y2="200"
                className="stroke-[#b5b3a8] dark:stroke-[#404040]"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <line
                x1="200"
                y1="48"
                x2="200"
                y2="352"
                className="stroke-[#b5b3a8] dark:stroke-[#404040]"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* Centro de Equilíbrio (0,0) */}
              <circle
                cx="200"
                cy="200"
                r="3"
                className="fill-[#7a776e] dark:fill-[#707070]"
              />

              {/* Rótulos dos Polos nos 4 Extremos */}
              {/* Topo: QUENTE */}
              <text
                x="200"
                y="32"
                textAnchor="middle"
                className="fill-[#a63c30] dark:fill-[#e08e6d] font-mono text-[11px] font-extrabold uppercase tracking-widest"
              >
                ▲ QUENTE (Ação Rápida)
              </text>

              {/* Base: FRIO */}
              <text
                x="200"
                y="382"
                textAnchor="middle"
                className="fill-[#365f8a] dark:fill-[#6a92be] font-mono text-[11px] font-extrabold uppercase tracking-widest"
              >
                ▼ FRIO (Ponderação Cautelosa)
              </text>

              {/* Esquerda: SECO */}
              <text
                x="24"
                y="204"
                textAnchor="middle"
                className="fill-[#8a4237] dark:fill-[#d98278] font-mono text-[10px] font-extrabold uppercase tracking-wider"
                transform="rotate(-90 24 204)"
              >
                ◄ SECO (Retenção & Firmeza)
              </text>

              {/* Direita: ÚMIDO */}
              <text
                x="376"
                y="204"
                textAnchor="middle"
                className="fill-[#2d7365] dark:fill-[#78c6b5] font-mono text-[10px] font-extrabold uppercase tracking-wider"
                transform="rotate(90 376 204)"
              >
                ► ÚMIDO (Plasticidade & Vínculo)
              </text>

              {/* Linhas de Projeção até os Eixos */}
              <line
                x1={markerX}
                y1={markerY}
                x2={markerX}
                y2="200"
                stroke={domMeta.borderColor}
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.75"
              />
              <line
                x1={markerX}
                y1={markerY}
                x2="200"
                y2={markerY}
                stroke={domMeta.borderColor}
                strokeWidth="1"
                strokeDasharray="2 2"
                strokeOpacity="0.75"
              />

              {/* Marcador do Usuário (Halo Pulsante e Ponto Central) */}
              <circle
                cx={markerX}
                cy={markerY}
                r="18"
                fill={domMeta.borderColor}
                fillOpacity="0.2"
                className="animate-pulse"
              />
              <circle
                cx={markerX}
                cy={markerY}
                r="9"
                fill={domMeta.borderColor}
                stroke="#ffffff"
                strokeWidth="2.5"
                className="shadow-lg"
              />

              {/* Mini Badge Flutuante no Ponto */}
              <g
                transform={`translate(${
                  markerX > 250 ? markerX - 85 : markerX + 12
                }, ${markerY > 250 ? markerY - 26 : markerY + 16})`}
              >
                <rect
                  x="0"
                  y="0"
                  width="76"
                  height="20"
                  rx="6"
                  className="fill-[#18191b] dark:fill-[#2d2d2d] stroke-[#ffffff]/20"
                  strokeWidth="0.8"
                />
                <text
                  x="38"
                  y="13"
                  textAnchor="middle"
                  className="fill-[#ffffff] font-mono text-[9px] font-bold"
                >
                  Você está aqui
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Lado Direito: Barras de Proporção Térmica e Fluidez + Diagnóstico */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card Resumo do Quadrante */}
          <div className="rounded-xl p-4 bg-[#f0eee4] dark:bg-[#1e1e1e] border border-[#dcdad0] dark:border-[#2d2d2d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#18191b] dark:text-[#ffffff]">
                {coords.quadrantName}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#e3e1d5] dark:bg-[#252526] text-[#2c3038] dark:text-[#9fc0e5]">
                {domMeta.name} Dominante
              </span>
            </div>
            <p className="text-xs text-[#4e5056] dark:text-[#969696] leading-relaxed">
              {coords.quadrantDescription}
            </p>
          </div>

          {/* Barra 1: Eixo Térmico (Quente vs. Frio) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline font-mono text-xs">
              <span className="font-bold text-[#a63c30] dark:text-[#e08e6d]">
                Quente {coords.hotPercent}%
              </span>
              <span className="text-[11px] text-[#5c5e64] dark:text-[#969696]">
                Eixo Térmico (Reatividade)
              </span>
              <span className="font-bold text-[#365f8a] dark:text-[#6a92be]">
                Frio {coords.coldPercent}%
              </span>
            </div>

            <div className="relative h-6 w-full rounded-xl bg-[#e6e4db] dark:bg-[#1e1e1e] border border-[#d2d0c5] dark:border-[#2d2d2d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d9776c] to-[#e08e6d] rounded-l-md transition-all duration-300"
                style={{ width: `${coords.hotPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[#5b82b0] to-[#6eb096] rounded-r-md transition-all duration-300 absolute top-0 right-0"
                style={{ width: `${coords.coldPercent}%` }}
              />
              {/* Linha de centro 50% */}
              <div
                title="Equilíbrio térmico (50%)"
                className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-sm"
                style={{ left: '50%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#5c5e64] dark:text-[#808080]">
              <span>Velocidade de ação & iniciativa</span>
              <span>Cautela, análise & contenção</span>
            </div>
          </div>

          {/* Barra 2: Eixo de Fluidez (Seco vs. Úmido) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline font-mono text-xs">
              <span className="font-bold text-[#8a4237] dark:text-[#d98278]">
                Seco {coords.dryPercent}%
              </span>
              <span className="text-[11px] text-[#5c5e64] dark:text-[#969696]">
                Eixo de Fluidez (Retenção)
              </span>
              <span className="font-bold text-[#2d7365] dark:text-[#78c6b5]">
                Úmido {coords.wetPercent}%
              </span>
            </div>

            <div className="relative h-6 w-full rounded-xl bg-[#e6e4db] dark:bg-[#1e1e1e] border border-[#d2d0c5] dark:border-[#2d2d2d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#d9776c] to-[#5b82b0] rounded-l-md transition-all duration-300"
                style={{ width: `${coords.dryPercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[#dfc16b] to-[#6eb096] rounded-r-md transition-all duration-300 absolute top-0 right-0"
                style={{ width: `${coords.wetPercent}%` }}
              />
              {/* Linha de centro 50% */}
              <div
                title="Equilíbrio de retenção (50%)"
                className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-sm"
                style={{ left: '50%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#5c5e64] dark:text-[#808080]">
              <span>Marcação firme, foco em metas</span>
              <span>Plasticidade, empatia & fluxo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

