import type { LikertValue } from '../types/temperament';

interface LikertScaleProps {
  selectedValue?: LikertValue;
  onSelect: (value: LikertValue) => void;
}

interface LikertOption {
  value: LikertValue;
  label: string;
  tone: 'green' | 'neutral' | 'red';
}

const LIKERT_OPTIONS: LikertOption[] = [
  {
    value: 2,
    label: 'Concordo totalmente',
    tone: 'green',
  },
  {
    value: 1,
    label: 'Concordo',
    tone: 'green',
  },
  {
    value: 0,
    label: 'Neutro ou Depende',
    tone: 'neutral',
  },
  {
    value: -1,
    label: 'Discordo',
    tone: 'red',
  },
  {
    value: -2,
    label: 'Discordo totalmente',
    tone: 'red',
  },
];

export function LikertScale({ selectedValue, onSelect }: LikertScaleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Opções de resposta"
      className="flex flex-col gap-3 w-full"
    >
      {LIKERT_OPTIONS.map((opt) => {
        const isSelected = selectedValue === opt.value;

        const containerClasses =
          opt.tone === 'green'
            ? isSelected
              ? 'border-[#5a9e84] border-l-4 border-l-[#5a9e84] bg-[#eef5f1] dark:border-[#7ab89f] dark:border-l-[#7ab89f] dark:bg-[#1a2b25]'
              : 'border-[#e0ded4] border-l-4 border-l-[#7ab89f] bg-[#f6f5ef] hover:border-[#6eb096] hover:bg-[#efeee6] dark:border-[#2d2d2d] dark:border-l-[#78c6b5]/80 dark:bg-[#1e1e1e] dark:hover:border-[#78c6b5] dark:hover:bg-[#252526]'
            : opt.tone === 'red'
              ? isSelected
                ? 'border-[#c96f65] border-l-4 border-l-[#c96f65] bg-[#f9efee] dark:border-[#d98278] dark:border-l-[#d98278] dark:bg-[#2e1f1e]'
                : 'border-[#e0ded4] border-l-4 border-l-[#d98278] bg-[#f6f5ef] hover:border-[#c96f65] hover:bg-[#efeee6] dark:border-[#2d2d2d] dark:border-l-[#d9776c]/80 dark:bg-[#1e1e1e] dark:hover:border-[#d9776c] dark:hover:bg-[#252526]'
              : isSelected
                ? 'border-[#7a7972] border-l-4 border-l-[#7a7972] bg-[#eceae2] dark:border-[#808080] dark:border-l-[#808080] dark:bg-[#252526]'
                : 'border-[#e0ded4] border-l-4 border-l-[#9c9a92] bg-[#f6f5ef] hover:border-[#8a8880] hover:bg-[#efeee6] dark:border-[#2d2d2d] dark:border-l-[#808080] dark:bg-[#1e1e1e] dark:hover:border-[#969696] dark:hover:bg-[#252526]';

        const iconCircleClasses =
          opt.tone === 'green'
            ? 'border-[#6eb096] bg-[#e6f2ec] text-[#2b5947] dark:border-[#78c6b5]/70 dark:bg-[#192b24] dark:text-[#9fe0d1]'
            : opt.tone === 'red'
              ? 'border-[#d98278] bg-[#f7e8e6] text-[#8c3b32] dark:border-[#d9776c]/70 dark:bg-[#301c1b] dark:text-[#f0a99e]'
              : 'border-[#9c9a92] bg-[#e8e6dd] text-[#4a4944] dark:border-[#606060] dark:bg-[#262626] dark:text-[#d4d4d4]';

        const radioRingClasses = isSelected
          ? opt.tone === 'green'
            ? 'border-[#5a9e84] bg-[#5a9e84] dark:border-[#78c6b5] dark:bg-[#78c6b5]'
            : opt.tone === 'red'
              ? 'border-[#c96f65] bg-[#c96f65] dark:border-[#d9776c] dark:bg-[#d9776c]'
              : 'border-[#6e6d68] bg-[#6e6d68] dark:border-[#d4d4d4] dark:bg-[#d4d4d4]'
          : 'border-[#b5b3aa] dark:border-[#606060] bg-transparent';

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(opt.value)}
            className={`min-h-[56px] w-full rounded-xl px-4 py-3.5 border flex items-center justify-between gap-4 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c] ${containerClasses}`}
          >
            <div className="flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${iconCircleClasses}`}
              >
                {opt.tone === 'green' && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {opt.tone === 'neutral' && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 8H12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {opt.tone === 'red' && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>

              <span className="text-base font-bold text-[#18191b] dark:text-[#ffffff]">
                {opt.label}
              </span>
            </div>

            <span
              aria-hidden="true"
              className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${radioRingClasses}`}
            />
          </button>
        );
      })}
    </div>
  );
}
