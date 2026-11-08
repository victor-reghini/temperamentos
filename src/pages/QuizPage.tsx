import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LikertScale } from '../components/LikertScale';
import {
  calculateTemperamentResult,
  getQuestionsForModality,
  QUESTIONS_BANK,
} from '../lib/psychometrics';
import {
  clearQuizProgress,
  loadQuizProgress,
  persistAndResolveRoute,
  saveQuizProgress,
} from '../lib/storage';
import { LikertValueSchema } from '../lib/validation';
import type { LikertValue, QuizModality, TemperamentQuestion } from '../types/temperament';

export function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestedMode = searchParams.get('mode') as QuizModality | null;
  const modality: QuizModality =
    requestedMode && ['rapido', 'medio', 'completo'].includes(requestedMode)
      ? requestedMode
      : 'medio';

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, LikertValue>>({});
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [swappedQuestions, setSwappedQuestions] = useState<Record<number, TemperamentQuestion>>({});
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const baseQuestions = useMemo(() => getQuestionsForModality(modality), [modality]);
  const questions = useMemo(
    () => baseQuestions.map((q, idx) => swappedQuestions[idx] ?? q),
    [baseQuestions, swappedQuestions]
  );

  const total = questions.length;
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const saved = loadQuizProgress();
    if (saved && saved.modality === modality && Object.keys(saved.answers).length > 0) {
      setAnswers(saved.answers);
      setCurrentIndex(Math.min(saved.currentIndex, baseQuestions.length - 1));
    }
  }, [modality, baseQuestions.length]);

  const handleRestart = useCallback(() => {
    clearQuizProgress();
    setAnswers({});
    setSwappedQuestions({});
    setCurrentIndex(0);
    setErrorMsg(null);
  }, []);

  useEffect(() => {
    const onRestartEvent = () => handleRestart();
    window.addEventListener('temperament:restart-quiz', onRestartEvent);
    return () => window.removeEventListener('temperament:restart-quiz', onRestartEvent);
  }, [handleRestart]);

  const handleSelectAnswer = (rawVal: LikertValue) => {
    const check = LikertValueSchema.safeParse(rawVal);
    if (!check.success) {
      setErrorMsg('Selecione uma opção válida.');
      return;
    }

    setErrorMsg(null);
    const updated: Record<string, LikertValue> = {
      ...answers,
      [String(currentQuestion.id)]: check.data as LikertValue,
    };
    setAnswers(updated);

    const nextIdx = autoAdvance && currentIndex < total - 1 ? currentIndex + 1 : currentIndex;
    saveQuizProgress({
      modality,
      currentIndex: nextIdx,
      answers: updated,
      updatedAt: new Date().toISOString(),
    });

    if (autoAdvance && currentIndex < total - 1) {
      setCurrentIndex(nextIdx);
    }
  };

  const handleSwapQuestion = () => {
    const usedIds = new Set(questions.map((q) => q.id));
    const candidates = QUESTIONS_BANK.filter(
      (q) =>
        !usedIds.has(q.id) &&
        q.temperament === currentQuestion.temperament &&
        q.primaryAxis === currentQuestion.primaryAxis
    );
    const fallbackCandidates =
      candidates.length > 0
        ? candidates
        : QUESTIONS_BANK.filter((q) => !usedIds.has(q.id));

    if (fallbackCandidates.length === 0) return;
    const replacement =
      fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)];

    const nextAnswers = { ...answers };
    delete nextAnswers[String(currentQuestion.id)];
    setAnswers(nextAnswers);
    setSwappedQuestions((prev) => ({
      ...prev,
      [currentIndex]: replacement,
    }));
  };

  const handleFinishQuiz = async () => {
    const answeredCount = questions.filter((q) => answers[String(q.id)] !== undefined).length;

    if (answeredCount < total) {
      const firstMissingIdx = questions.findIndex((q) => answers[String(q.id)] === undefined);
      setCurrentIndex(Math.max(0, firstMissingIdx));
      setErrorMsg(`Responda as ${total - answeredCount} perguntas restantes para concluir.`);
      return;
    }

    const normalizedForEngine: Record<string, LikertValue> = {};
    baseQuestions.forEach((baseQ, idx) => {
      const activeQ = questions[idx];
      normalizedForEngine[String(baseQ.id)] = answers[String(activeQ.id)] ?? 0;
    });

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = calculateTemperamentResult(modality, normalizedForEngine);
      clearQuizProgress();
      const { targetPath } = await persistAndResolveRoute(result);
      navigate(targetPath);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao calcular matriz.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExplainOpen) {
        e.preventDefault();
        setIsExplainOpen(false);
        return;
      }
      if (isExplainOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' && currentIndex < total - 1) {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, total, isExplainOpen]);

  const answeredSoFar = questions.filter((q) => answers[String(q.id)] !== undefined).length;
  const progressPct = Math.round((answeredSoFar / total) * 100);
  const selectedForCurrent = answers[String(currentQuestion.id)];
  const segmentCount = 12;
  const filledSegments = Math.max(
    answeredSoFar > 0 ? 1 : 0,
    Math.round((answeredSoFar / total) * segmentCount)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Cabeçalho de Progresso Segmentado */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm text-[#52565e] dark:text-[#a6a49d]">
          <span>
            Pergunta{' '}
            <strong className="font-bold text-[#18191b] dark:text-[#ffffff]">
              {currentIndex + 1} de {total}
            </strong>
          </span>
          <span className="tabular-nums">{progressPct}% concluído</span>
        </div>

        <div aria-hidden="true" className="grid grid-cols-12 gap-1.5 w-full">
          {Array.from({ length: segmentCount }).map((_, idx) => {
            const isFilled = idx < filledSegments;
            const isCurrentSeg =
              idx === Math.min(segmentCount - 1, Math.floor((currentIndex / total) * segmentCount));
            return (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-colors duration-200 ${
                  isFilled
                    ? 'bg-[#78c6b5] dark:bg-[#4a729c]'
                    : isCurrentSeg
                      ? 'bg-[#9ea39f] dark:bg-[#606060]'
                      : 'bg-[#dfddd2] dark:bg-[#2d2d2d]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Card Principal da Questão */}
      <section
        aria-live="polite"
        className="relative rounded-2xl p-6 sm:p-9 border border-t-4 shadow-sm overflow-hidden transition-colors duration-150 bg-[#faf9f4] border-[#e4e2d8] border-t-[#2d7365] dark:bg-[#252526] dark:border-[#2d2d2d] dark:border-t-[#4a729c]"
      >
        {/* Cabeçalho do Card: Número na esquerda e botão ENTENDA na direita */}
        <div className="relative z-10 flex items-center justify-between gap-4 mb-5">
          <span
            aria-hidden="true"
            className="font-extrabold text-5xl sm:text-6xl select-none pointer-events-none leading-none tabular-nums text-black/[0.07] dark:text-white/[0.08]"
          >
            {String(currentIndex + 1).padStart(2, '0')}
          </span>

          <button
            type="button"
            onClick={() => setIsExplainOpen(true)}
            className="min-h-[36px] inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase transition-colors bg-[#eceae0] hover:bg-[#e0ded2] border-[#d6d4c8] text-[#2c3038] dark:bg-[#1e1e1e] dark:hover:bg-[#2a2a2b] dark:border-[#333333] dark:text-[#d4d4d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
          >
            <span
              aria-hidden="true"
              className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold border-[#4a4e58] text-[#2c3038] dark:border-[#808080] dark:text-[#d4d4d4]"
            >
              ?
            </span>
            <span>ENTENDA</span>
          </button>
        </div>

        {/* Enunciado */}
        <h1 className="relative z-10 text-xl sm:text-2xl md:text-[26px] font-bold leading-snug mb-7 text-[#18191b] dark:text-[#ffffff]">
          {currentQuestion.text}
        </h1>

        {/* Lista Vertical de Opções Likert */}
        <div className="relative z-10">
          <LikertScale
            selectedValue={selectedForCurrent}
            onSelect={handleSelectAnswer}
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 p-3.5 rounded-xl bg-[#f9efee] dark:bg-[#2d1f1e] border border-[#c96f65] text-[#7a2e26] dark:text-[#f2c6c2] text-sm font-medium"
          >
            {errorMsg}
          </div>
        )}
      </section>

      {/* Barra Inferior Responsiva: Controles flexíveis no mobile e desktop */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="min-h-[44px] px-4 py-2 rounded-xl disabled:opacity-40 text-xs sm:text-sm font-semibold border inline-flex items-center gap-1.5 transition-colors bg-[#efeee6] hover:bg-[#e4e2d8] text-[#3a3e47] border-[#dcdad0] dark:bg-[#252526] dark:hover:bg-[#2e2e2f] dark:text-[#d4d4d4] dark:border-[#333333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
          >
            <span aria-hidden="true">←</span>
            <span>Voltar</span>
          </button>

          {/* Toggle Avançar ao responder */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none min-h-[44px] px-1 sm:px-2">
            <button
              type="button"
              role="switch"
              aria-checked={autoAdvance}
              onClick={() => setAutoAdvance((prev) => !prev)}
              className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full p-0.5 transition-colors border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c] ${
                autoAdvance
                  ? 'bg-[#2d7365] border-[#2d7365] dark:bg-[#3d5f83] dark:border-[#4a729c]'
                  : 'bg-[#d5d3c8] border-[#b8b6ab] dark:bg-[#1e1e1e] dark:border-[#3c3c3c]'
              }`}
            >
              <span
                className={`block w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#faf9f4] dark:bg-[#ffffff] transition-transform ${
                  autoAdvance ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs sm:text-sm font-medium text-[#4a4e58] dark:text-[#969696] whitespace-nowrap">
              Avançar auto
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwapQuestion}
            title="Substituir por outra pergunta equivalente do banco"
            className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border inline-flex items-center justify-center gap-1.5 transition-colors bg-[#faf9f4] hover:bg-[#eceae0] text-[#18191b] border-[#dcdad0] dark:bg-[#252526] dark:hover:bg-[#2e2e2f] dark:text-[#d4d4d4] dark:border-[#333333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
          >
            <span aria-hidden="true">⇄</span>
            <span>Trocar</span>
          </button>

          {currentIndex < total - 1 && answeredSoFar < total ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
              className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border inline-flex items-center justify-center gap-1.5 transition-colors bg-[#5fa899] hover:bg-[#4d9486] text-[#0e241f] border-[#4d9486] dark:bg-[#33475b] dark:hover:bg-[#3d556d] dark:text-[#ffffff] dark:border-[#425d78] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
            >
              <span>Avançar</span>
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinishQuiz}
              className="flex-1 sm:flex-initial min-h-[44px] px-5 py-2.5 rounded-xl bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] disabled:opacity-50 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
            >
              <span>{isSubmitting ? 'Calculando...' : 'Ver Resultado'}</span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal "Sobre esta pergunta" com scroll seguro no mobile */}
      {isExplainOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-explain-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm"
          onClick={() => setIsExplainOpen(false)}
        >
          <div
            className="rounded-2xl sm:rounded-3xl max-w-2xl max-h-[92dvh] overflow-y-auto w-full p-5 sm:p-8 space-y-4 sm:space-y-5 shadow-2xl border bg-[#faf9f4] border-[#dcdad0] text-[#18191b] dark:bg-[#252526] dark:border-[#333333] dark:text-[#d4d4d4]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 id="modal-explain-title" className="text-xl sm:text-2xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
                Sobre esta pergunta
              </h2>
              <button
                type="button"
                aria-label="Fechar explicação"
                onClick={() => setIsExplainOpen(false)}
                className="w-10 h-10 rounded-full border flex items-center justify-center text-lg font-bold border-[#dcdad0] bg-[#f3f2ea] hover:bg-[#e5e3d8] text-[#18191b] dark:border-[#383838] dark:bg-[#1e1e1e] dark:hover:bg-[#2a2a2a] dark:text-[#d4d4d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
              >
                ✕
              </button>
            </div>

            {/* Card 1: SE VOCÊ CONCORDA */}
            <div className="rounded-2xl border border-l-4 border-l-[#5a9e84] dark:border-l-[#78c6b5] p-5 space-y-2.5 border-[#e2e0d6] bg-[#f5f4ee] dark:border-[#2d2d2d] dark:bg-[#1e1e1e]">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-xs border-[#6eb096] bg-[#e6f2ec] text-[#2b5947] dark:border-[#78c6b5]/70 dark:bg-[#1a2e28] dark:text-[#9fe0d1]"
                >
                  ✓
                </span>
                <span className="text-xs font-extrabold tracking-wider uppercase">
                  SE VOCÊ CONCORDA
                </span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                {currentQuestion.explanation.agree}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-[#4e5056] dark:text-[#969696]">
                <strong>Exemplo:</strong> {currentQuestion.explanation.agreeExample}
              </p>
            </div>

            {/* Card 2: SE VOCÊ DISCORDA */}
            <div className="rounded-2xl border border-l-4 border-l-[#c96f65] dark:border-l-[#d9776c] p-5 space-y-2.5 border-[#e2e0d6] bg-[#f5f4ee] dark:border-[#2d2d2d] dark:bg-[#1e1e1e]">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-xs border-[#d98278] bg-[#f7e8e6] text-[#8c3b32] dark:border-[#d9776c]/70 dark:bg-[#331e1d] dark:text-[#f0a99e]"
                >
                  ✕
                </span>
                <span className="text-xs font-extrabold tracking-wider uppercase">
                  SE VOCÊ DISCORDA
                </span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                {currentQuestion.explanation.disagree}
              </p>
              <p className="text-xs sm:text-sm leading-relaxed text-[#4e5056] dark:text-[#969696]">
                <strong>Exemplo:</strong> {currentQuestion.explanation.disagreeExample}
              </p>
            </div>

            {/* Box Inferior: Vale lembrar */}
            <div className="rounded-2xl bg-[#1e3831] dark:bg-[#1f2d3d] border border-[#2d5c50] dark:border-[#324860] p-4 sm:p-5 text-xs sm:text-sm text-[#e8f5f2] dark:text-[#d6e7fa] leading-relaxed">
              <strong className="font-bold text-white">Vale lembrar:</strong>{' '}
              {currentQuestion.explanation.note}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
