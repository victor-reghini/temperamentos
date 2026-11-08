import { AXES_META, getFormattedAxes, getFormattedProportions } from '../lib/psychometrics';
import type { TemperamentResult } from '../types/temperament';

interface Props {
  result: TemperamentResult;
}

export function TemperamentBars({ result }: Props) {
  const proportions = getFormattedProportions(result);
  const axes = getFormattedAxes(result);

  return (
    <div className="space-y-10">
      {/* 4 Barras Principais de Temperamento */}
      <section
        aria-labelledby="heading-proportions"
        className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-5 sm:p-7 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-[#e2e0d6] dark:border-[#2d2d2d]">
          <div>
            <h2
              id="heading-proportions"
              className="text-lg sm:text-xl font-bold text-[#18191b] dark:text-[#ffffff]"
            >
              Proporção dos 4 Temperamentos
            </h2>
            <p className="text-sm text-[#4e5056] dark:text-[#969696]">
              Distribuição percentual relativa (marcador de equilíbrio basal em 25% e centro em 50%).
            </p>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#efeee6] dark:bg-[#1e1e1e] border border-[#d5d3c8] dark:border-[#2d2d2d] text-[#2c3038] dark:text-[#969696] self-start sm:self-auto">
            Soma = 100%
          </span>
        </div>

        <div className="space-y-6">
          {proportions.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-base sm:text-lg font-bold text-[#18191b] dark:text-[#ffffff]">
                    {item.name}
                  </span>
                  <span className="text-xs font-mono text-[#5c5e64] dark:text-[#969696]">
                    ({item.classicalElement})
                  </span>
                </div>
                <div className="flex items-baseline gap-3 font-mono tabular-nums">
                  <span className="text-xs text-[#5c5e64] dark:text-[#969696]">
                    Afinidade bruta: {item.affinityScore}%
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              <div className="relative h-9 sm:h-10 w-full rounded-xl bg-[#e6e4db] dark:bg-[#1e1e1e] border border-[#d2d0c5] dark:border-[#2d2d2d] overflow-hidden">
                <div
                  className="h-full transition-all duration-200 rounded-r-sm"
                  style={{
                    width: `${Math.max(2, item.percentage)}%`,
                    backgroundImage: `linear-gradient(90deg, ${item.gradientFrom}, ${item.gradientTo})`,
                  }}
                />
                <div
                  title="Equilíbrio basal (25%)"
                  className="absolute top-0 bottom-0 w-0.5 bg-neutral-600/50 dark:bg-neutral-400/50 pointer-events-none"
                  style={{ left: '25%' }}
                />
                <div
                  title="Marcador central (50%)"
                  className="absolute top-0 bottom-0 w-0.5 bg-neutral-800/75 dark:bg-white/75 pointer-events-none"
                  style={{ left: '50%' }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none text-xs font-mono">
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[11px] text-[#f5f4ee]">
                    {item.neuroCorrelate.split('(')[0].trim()}
                  </span>
                  <span className="bg-black/65 px-2 py-0.5 rounded text-[11px] font-bold text-[#f5f4ee]">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Eixos Bipolares */}
      <section
        aria-labelledby="heading-axes"
        className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-5 sm:p-7 transition-colors"
      >
        <div className="mb-6 pb-4 border-b border-[#e2e0d6] dark:border-[#2d2d2d]">
          <h2
            id="heading-axes"
            className="text-lg sm:text-xl font-bold text-[#18191b] dark:text-[#ffffff]"
          >
            Os 4 Eixos Neurobiológicos
          </h2>
          <p className="text-sm text-[#4e5056] dark:text-[#969696]">
            Integração do modelo PEN de Eysenck (Extroversão x Neuroticismo) com o Fisher Temperament Inventory.
          </p>
        </div>

        <div className="space-y-7">
          {axes.map((ax) => {
            const meta = AXES_META[ax.key];
            return (
              <div key={ax.key} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-[#18191b] dark:text-[#ffffff]">{ax.leftPole}</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#5c5e64] dark:text-[#969696]">
                    {ax.label}
                  </span>
                  <span className="text-[#18191b] dark:text-[#ffffff] text-right">
                    {ax.rightPole}
                  </span>
                </div>

                <div className="relative h-10 sm:h-11 w-full rounded-xl bg-[#e6e4db] dark:bg-[#1e1e1e] border border-[#d2d0c5] dark:border-[#2d2d2d] overflow-hidden flex">
                  <div
                    className="h-full flex items-center justify-start pl-3 transition-all duration-200"
                    style={{
                      width: `${ax.leftPercent}%`,
                      backgroundColor: meta.leftColor,
                    }}
                  >
                    {ax.leftPercent >= 14 && (
                      <span className="font-mono font-bold text-xs sm:text-sm text-[#f5f4ee] tabular-nums bg-black/55 px-1.5 py-0.5 rounded">
                        {ax.leftPercent}%
                      </span>
                    )}
                  </div>
                  <div
                    className="h-full flex items-center justify-end pr-3 transition-all duration-200"
                    style={{
                      width: `${ax.rightPercent}%`,
                      backgroundColor: meta.rightColor,
                    }}
                  >
                    {ax.rightPercent >= 14 && (
                      <span className="font-mono font-bold text-xs sm:text-sm text-[#f5f4ee] tabular-nums bg-black/55 px-1.5 py-0.5 rounded">
                        {ax.rightPercent}%
                      </span>
                    )}
                  </div>

                  <div
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-[#faf9f4] dark:bg-[#ffffff] shadow"
                  />
                </div>

                <p className="text-xs text-[#4e5056] dark:text-[#969696] leading-relaxed">
                  {ax.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
