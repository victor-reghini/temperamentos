import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AXES_META, MODALITY_CONFIG, TEMPERAMENT_META } from '../lib/psychometrics';
import { getLatestLocalResult, loadQuizProgress } from '../lib/storage';
import { useSeo } from '../lib/useSeo';
import { encodeResultToBase64 } from '../lib/validation';
import type { AxisKey, QuizModality, TemperamentKey } from '../types/temperament';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Quanto tempo leva para responder?',
    answer:
      'Você escolhe o nível de profundidade: o modo Rápido leva cerca de 3 minutos (20 afirmativas), o modo Médio cerca de 6 minutos (40 afirmativas, recomendado) e o modo Completo cerca de 12 minutos (96 afirmativas).',
  },
  {
    question: 'O teste é 100% gratuito?',
    answer:
      'Sim, a avaliação completa com diagnóstico neurobiológico, proporção dos 4 temperamentos, visualização de eixos e compartilhamento é gratuita e aberta.',
  },
  {
    question: 'O que é a matriz neurobiológica dos 4 temperamentos?',
    answer:
      'Ao invés de classificar você em uma única caixa rígida, mapeamos sua resposta ao longo de 4 eixos contínuos baseados no modelo PEN de Hans Eysenck e no inventário neuroquímico de Helen Fisher, resultando na proporção precisa entre Colérico, Sanguíneo, Melancólico e Fleumático.',
  },
  {
    question: 'O que acontece com os meus dados?',
    answer:
      'Privacidade total por design: todas as respostas e cálculos são processados localmente no seu próprio navegador. Seus resultados ficam salvos apenas na sua máquina e nunca são enviados para servidores de publicidade.',
  },
  {
    question: 'Posso ter mais de um temperamento predominante?',
    answer:
      'Com certeza. Quase todas as pessoas possuem um temperamento dominante e um secundário bem definidos (como Colérico-Melancólico ou Sanguíneo-Fleumático). A matriz quantifica exatamente o peso de cada um.',
  },
  {
    question: 'Qual a diferença entre este teste e testes clássicos binários?',
    answer:
      'Testes antigos forçam escolhas do tipo A ou B em perguntas engessadas. O 4T utiliza uma escala contínua com 160 afirmativas calibradas e permite respostas nuançadas, eliminando distorções de extremos.',
  },
  {
    question: 'Este teste substitui uma avaliação psicológica clínica?',
    answer:
      'Não. O teste é um instrumento psicométrico informativo e de autoconhecimento funcional para desenvolvimento pessoal e dinâmicas de equipe, não constituindo laudo psiquiátrico ou psicológico formal.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const savedProgress = loadQuizProgress();
  const latestResult = getLatestLocalResult();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useSeo({
    title: 'Temperamentos: Teste Gratuito dos 4 Temperamentos e Matriz Humoral',
    description:
      'Descubra sua assinatura comportamental real: proporção de humores e mapeamento em 4 eixos psicométricos contínuos. Teste 100% gratuito e privado.',
    canonical: 'https://temperamentos.com.br/',
  });

  const modalities: QuizModality[] = ['rapido', 'medio', 'completo'];
  const tempKeys: TemperamentKey[] = ['colerico', 'sanguineo', 'melancolico', 'fleumatico'];
  const axisKeys: AxisKey[] = [
    'reatividade',
    'foco_direcional',
    'retencao_estimulo',
    'ativacao_energetica',
  ];

  const startModality = (mod: QuizModality) => {
    navigate(`/quiz?mode=${mod}`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="pt-2 sm:pt-6 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Lado Esquerdo: Mensagem e CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-[#dcf2ec] text-[#1b5247] border border-[#a8dec5] dark:bg-[#253242] dark:text-[#9fc0e5] dark:border-[#38526e]">
              <span className="w-2 h-2 rounded-full bg-[#3d7a6e] dark:bg-[#648fb8]" />
              <span>Matriz Neurobiológica 4T</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[46px] font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight leading-[1.15]">
              Você sabe mesmo qual é a sua{' '}
              <span className="text-[#256e60] dark:text-[#6a92be]">verdadeira natureza?</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#4a4c52] dark:text-[#b5b3ad] leading-relaxed max-w-xl">
              Descubra sua assinatura comportamental exata através de 4 eixos contínuos e veja a proporção real entre os humores Colérico, Sanguíneo, Melancólico e Fleumático.
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a
                href="#modalidades"
                className="min-h-[48px] px-6 py-3 rounded-full font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all shadow-sm bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
              >
                <span>Fazer o questionário</span>
                <span aria-hidden="true">→</span>
              </a>

              <a
                href="#exemplo"
                className="min-h-[48px] px-5 py-3 rounded-full font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors border bg-[#faf9f4] hover:bg-[#edebe2] text-[#18191b] border-[#d4d2c7] dark:bg-[#252526] dark:hover:bg-[#2e2e2f] dark:text-[#d4d4d4] dark:border-[#333333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
              >
                Ver exemplo de resultado
              </a>
            </div>

            {/* Ações de retomada se houver progresso ou resultado anterior */}
            {(savedProgress || latestResult) && (
              <div className="pt-3 flex flex-wrap gap-2.5 border-t border-[#dfddd2] dark:border-[#2d2d2d]">
                {savedProgress && (
                  <Link
                    to={`/quiz?mode=${savedProgress.modality}`}
                    className="min-h-[38px] inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-colors bg-[#d8f0ea] hover:bg-[#c5e8df] text-[#1b433b] dark:bg-[#2a3848] dark:hover:bg-[#324559] dark:text-[#b4d4f7]"
                  >
                    Retomar quiz em andamento ({Object.keys(savedProgress.answers).length} respostas)
                  </Link>
                )}
                {latestResult && (
                  <Link
                    to={`/#scores=${encodeResultToBase64(latestResult)}`}
                    className="min-h-[38px] inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold transition-colors bg-[#eae8de] hover:bg-[#dedcd0] text-[#18191b] dark:bg-[#252526] dark:hover:bg-[#2f2f30] dark:text-[#d4d4d4] border border-[#d4d2c7] dark:border-[#333333]"
                  >
                    Ver meu último resultado ({latestResult.compositeName.split(' (')[0]})
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Lado Direito: Mockup de Celular / Card de Exemplo */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-[340px] sm:max-w-[360px] rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 border-4 shadow-xl relative transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#333333]">
              {/* Top Notch Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#e5e3d8] dark:border-[#303031] text-[11px] font-mono">
                <span className="font-bold text-[#2d7365] dark:text-[#6a92be]">4T MATRIX</span>
                <span className="text-[#5c5e64] dark:text-[#969696]">#EXEMPLO</span>
              </div>

              {/* Card Interno Simulado */}
              <div className="py-4 space-y-4">
                <div className="rounded-2xl p-4 bg-[#f1efe6] dark:bg-[#1e1e1e] border border-[#dedcd2] dark:border-[#2d2d2d] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#d6eee7] text-[#17483d] dark:bg-[#253242] dark:text-[#9fc0e5]">
                      Perfil Composto
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2d7365] dark:text-[#6a92be]">
                      92% Precisão
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#18191b] dark:text-[#ffffff]">
                    Colérico-Melancólico
                  </h3>
                  <p className="text-xs text-[#4e5056] dark:text-[#969696] leading-relaxed">
                    Predomínio Colérico (38%) com modulação Melancólica (32%). Foco em execução rápida, autonomia e tenacidade analítica.
                  </p>
                </div>

                {/* 4 Barras de Humor do Exemplo */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5c5e64] dark:text-[#969696]">
                    Proporção dos 4 Humores
                  </span>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="font-semibold text-[#18191b] dark:text-[#d4d4d4]">Colérico</span>
                        <span className="font-bold text-[#18191b] dark:text-[#ffffff]">38%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[#e4e2d8] dark:bg-[#1a1a1a]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#d9776c] to-[#e08e6d] w-[38%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="font-semibold text-[#18191b] dark:text-[#d4d4d4]">Melancólico</span>
                        <span className="font-bold text-[#18191b] dark:text-[#ffffff]">32%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[#e4e2d8] dark:bg-[#1a1a1a]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6e98c4] to-[#5b82b0] w-[32%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="font-semibold text-[#18191b] dark:text-[#d4d4d4]">Sanguíneo</span>
                        <span className="font-bold text-[#18191b] dark:text-[#ffffff]">16%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[#e4e2d8] dark:bg-[#1a1a1a]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#dfc16b] to-[#cfa855] w-[16%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="font-semibold text-[#18191b] dark:text-[#d4d4d4]">Fleumático</span>
                        <span className="font-bold text-[#18191b] dark:text-[#ffffff]">14%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[#e4e2d8] dark:bg-[#1a1a1a]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6eb096] to-[#788c85] w-[14%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Botão de Exemplo */}
                <a
                  href="#modalidades"
                  className="w-full min-h-[38px] rounded-xl text-center text-xs font-bold py-2 px-3 block transition-colors bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff]"
                >
                  Descubra o seu perfil agora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. O QUE VOCÊ RECEBE */}
      <section id="o-que-recebe" className="space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2d7365] dark:text-[#6a92be]">
              DIAGNÓSTICO PSICOMÉTRICO ROBUSTO
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight">
              Um retrato completo das suas disposições comportamentais
            </h2>
          </div>
          <p className="text-sm text-[#4a4c52] dark:text-[#969696] max-w-md">
            Mapeamos sua arquitetura através de evidências neuropsicológicas consolidadas, sem reducionismos simplistas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base bg-[#dcf2ec] text-[#1b5247] dark:bg-[#243242] dark:text-[#9fc0e5]">
              01
            </div>
            <h3 className="text-lg font-bold text-[#18191b] dark:text-[#ffffff]">Reatividade Cortical</h3>
            <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
              Mede a velocidade de disparo e resposta frente a estímulos externos: ação imediata e decisiva contra ponderação cautelosa.
            </p>
          </div>

          <div className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base bg-[#dcf2ec] text-[#1b5247] dark:bg-[#243242] dark:text-[#9fc0e5]">
              02
            </div>
            <h3 className="text-lg font-bold text-[#18191b] dark:text-[#ffffff]">Foco Direcional</h3>
            <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
              Identifica se a sua atenção natural se orienta à execução lógica de metas e tarefas ou à conexão interpessoal e bem-estar do grupo.
            </p>
          </div>

          <div className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base bg-[#dcf2ec] text-[#1b5247] dark:bg-[#243242] dark:text-[#9fc0e5]">
              03
            </div>
            <h3 className="text-lg font-bold text-[#18191b] dark:text-[#ffffff]">Retenção de Estímulo</h3>
            <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
              Avalia o grau de durabilidade das impressões emocionais: traço seco de retenção prolongada versus plasticidade adaptativa rápida.
            </p>
          </div>

          <div className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base bg-[#dcf2ec] text-[#1b5247] dark:bg-[#243242] dark:text-[#9fc0e5]">
              04
            </div>
            <h3 className="text-lg font-bold text-[#18191b] dark:text-[#ffffff]">Ativação Energética</h3>
            <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
              Mapeia sua curva de vigília, ritmo metabólico e resistência à fadiga em rotinas de alta pressão ou demandas contínuas.
            </p>
          </div>

          <div className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base bg-[#dcf2ec] text-[#1b5247] dark:bg-[#243242] dark:text-[#9fc0e5]">
              05
            </div>
            <h3 className="text-lg font-bold text-[#18191b] dark:text-[#ffffff]">Proporção dos 4 Humores</h3>
            <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
              Calcula a distribuição exata em 100% entre Colérico, Sanguíneo, Melancólico e Fleumático com marcadores de equilíbrio basal.
            </p>
          </div>

          <div className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base bg-[#dcf2ec] text-[#1b5247] dark:bg-[#243242] dark:text-[#9fc0e5]">
              06
            </div>
            <h3 className="text-lg font-bold text-[#18191b] dark:text-[#ffffff]">Manual Neurofuncional</h3>
            <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
              Diretrizes práticas de comunicação, gatilhos de estresse, pontos cegos e protocolos de recarga para o seu perfil combinado.
            </p>
          </div>
        </div>
      </section>

      {/* 3. É ASSIM QUE FICA O SEU RESULTADO (MOCKUP INTERATIVO) */}
      <section id="exemplo" className="space-y-8 scroll-mt-20">
        <div className="space-y-2 text-center max-w-2xl mx-auto px-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2d7365] dark:text-[#6a92be]">
            PRÉVIA REALISTA
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight">
            É assim que fica o seu resultado
          </h2>
          <p className="text-sm text-[#4a4c52] dark:text-[#969696]">
            Um painel analítico completo, com gráficos proporcionais, eixos bipolares e exportação rápida.
          </p>
        </div>

        <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-6 sm:space-y-8 shadow-sm">
          {/* Header do Card de Exemplo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#e5e3d8] dark:border-[#333333]">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#2d7365] dark:text-[#6a92be] font-bold">
                TEMPERAMENTO COMPOSTO IDENTIFICADO
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
                Colérico-Melancólico
              </h3>
              <p className="text-sm text-[#4a4c52] dark:text-[#969696]">
                Predomínio Colérico (38%) com modulação secundária Melancólico (32%).
              </p>
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex flex-col items-center justify-center font-mono shrink-0 self-start sm:self-auto border-[#78c6b5] bg-[#dcf2ec] text-[#0e241f] dark:border-[#4a729c] dark:bg-[#1f2d3d] dark:text-[#c4dcfa]">
              <span className="text-base sm:text-lg font-extrabold leading-none">92%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold">Precisão</span>
            </div>
          </div>

          {/* Comparativo dos 4 Eixos em Split Bars */}
          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-[#5c5e64] dark:text-[#969696]">
              Matriz dos 4 Eixos Neurobiológicos (Exemplo)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#f2f0e7] dark:bg-[#1e1e1e] border border-[#dcdad0] dark:border-[#2d2d2d] space-y-2">
                <div className="flex flex-wrap justify-between text-xs font-mono font-semibold gap-1">
                  <span className="text-[#18191b] dark:text-[#d4d4d4]">Ação Imediata (74%)</span>
                  <span className="text-[#5c5e64] dark:text-[#969696]">Ponderação (26%)</span>
                </div>
                <div className="relative h-4 rounded-full overflow-hidden flex bg-[#e0ded4] dark:bg-[#161616]">
                  <div className="bg-[#d9776c] h-full" style={{ width: '74%' }} />
                  <div className="bg-[#6eb096] h-full" style={{ width: '26%' }} />
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#ffffff]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f2f0e7] dark:bg-[#1e1e1e] border border-[#dcdad0] dark:border-[#2d2d2d] space-y-2">
                <div className="flex flex-wrap justify-between text-xs font-mono font-semibold gap-1">
                  <span className="text-[#18191b] dark:text-[#d4d4d4]">Objetivos & Metas (82%)</span>
                  <span className="text-[#5c5e64] dark:text-[#969696]">Pessoas & Harmonia (18%)</span>
                </div>
                <div className="relative h-4 rounded-full overflow-hidden flex bg-[#e0ded4] dark:bg-[#161616]">
                  <div className="bg-[#d9776c] h-full" style={{ width: '82%' }} />
                  <div className="bg-[#dfc16b] h-full" style={{ width: '18%' }} />
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-[#ffffff]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <a
              href="#modalidades"
              className="min-h-[48px] w-full sm:w-auto px-8 py-3 rounded-full font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
            >
              <span>Fazer meu teste agora</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. COMO FUNCIONA (BANNER TEMÁTICO) */}
      <section
        id="como-funciona"
        className="rounded-3xl p-8 sm:p-12 transition-colors scroll-mt-20 bg-[#1e3831] text-[#f2faf7] dark:bg-[#252526] dark:text-[#d4d4d4] dark:border dark:border-[#2d2d2d]"
      >
        <div className="max-w-3xl space-y-3 mb-10">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#78c6b5] dark:text-[#6a92be]">
            MÉTODO E PROTOCOLO
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#ffffff] tracking-tight">
            Como funciona o teste de temperamentos 4T
          </h2>
          <p className="text-sm sm:text-base text-[#c3ded6] dark:text-[#969696] leading-relaxed">
            Uma abordagem sem achismos: cruzamos respostas situacionais ponderadas contra uma matriz matemática contínua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 border-l-2 pl-5 border-[#78c6b5]/60 dark:border-[#3d5f83]">
            <span className="font-mono text-xs text-[#78c6b5] dark:text-[#6a92be] font-bold">
              ETAPA 01
            </span>
            <h3 className="text-lg font-bold text-[#ffffff]">Responda às afirmativas</h3>
            <p className="text-sm text-[#c3ded6] dark:text-[#969696] leading-relaxed">
              Uma questão por vez em escala Likert equilibrada. Você tem a opção `ENTENDA` para esclarecer o contexto antes de responder.
            </p>
          </div>

          <div className="space-y-3 border-l-2 pl-5 border-[#78c6b5]/60 dark:border-[#3d5f83]">
            <span className="font-mono text-xs text-[#78c6b5] dark:text-[#6a92be] font-bold">
              ETAPA 02
            </span>
            <h3 className="text-lg font-bold text-[#ffffff]">Processamento contínuo</h3>
            <p className="text-sm text-[#c3ded6] dark:text-[#969696] leading-relaxed">
              O motor matemático pondera cada eixo e normaliza a distribuição entre os 4 humores clássicos com equilíbrio basal de 25%.
            </p>
          </div>

          <div className="space-y-3 border-l-2 pl-5 border-[#78c6b5]/60 dark:border-[#3d5f83]">
            <span className="font-mono text-xs text-[#78c6b5] dark:text-[#6a92be] font-bold">
              ETAPA 03
            </span>
            <h3 className="text-lg font-bold text-[#ffffff]">Seu mapa funcional</h3>
            <p className="text-sm text-[#c3ded6] dark:text-[#969696] leading-relaxed">
              Você recebe seu laudo instantâneo, com gráficos de sobreposição, link seguro para compartilhar e exportação em alta resolução.
            </p>
          </div>
        </div>
      </section>

      {/* 5. O QUE SIGNIFICA CADA EIXO */}
      <section id="eixos" className="space-y-8 scroll-mt-20">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2d7365] dark:text-[#6a92be]">
            OS 4 PILARES NEUROBIOLÓGICOS
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight">
            O que significa cada eixo?
          </h2>
          <p className="text-sm text-[#4a4c52] dark:text-[#969696]">
            Os 4 eixos bipolares combinados dão origem aos 4 temperamentos fundamentais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {axisKeys.map((aKey) => {
            const ax = AXES_META[aKey];
            return (
              <div
                key={ax.key}
                className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#2d7365] dark:text-[#6a92be]">
                  <span>{ax.label}</span>
                  <span>{ax.leftPole} vs. {ax.rightPole}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#18191b] dark:text-[#ffffff]">
                    {ax.leftPole}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden flex bg-[#e5e3d8] dark:bg-[#161616]">
                    <div style={{ width: '50%', backgroundColor: ax.leftColor }} />
                    <div style={{ width: '50%', backgroundColor: ax.rightColor }} />
                  </div>
                  <span className="text-sm font-semibold text-[#18191b] dark:text-[#ffffff]">
                    {ax.rightPole}
                  </span>
                </div>
                <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
                  {ax.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CONHEÇA OS 4 TEMPERAMENTOS */}
      <section id="temperamentos" className="space-y-8 scroll-mt-20">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2d7365] dark:text-[#6a92be]">
            OS 4 HUMORES CLÁSSICOS
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight">
            Descubra a anatomia de cada temperamento
          </h2>
          <p className="text-sm text-[#4a4c52] dark:text-[#969696]">
            Cores suaves e pastel, mapeadas para seus correlatos hormonais e neurotransmissores.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {tempKeys.map((k) => {
            const t = TEMPERAMENT_META[k];
            return (
              <div
                key={t.key}
                className="rounded-2xl p-6 border transition-colors bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
                    {t.name}
                  </h3>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#f0eee4] text-[#4a4c52] dark:bg-[#1e1e1e] dark:text-[#969696]">
                    {t.classicalHumor}
                  </span>
                </div>

                <div
                  className="h-2 w-full rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${t.gradientFrom}, ${t.gradientTo})`,
                  }}
                />

                <p className="text-xs font-mono font-semibold text-[#2d7365] dark:text-[#6a92be]">
                  {t.neuroCorrelate}
                </p>

                <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
                  {t.summary}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PERGUNTAS FREQUENTES (FAQ ACCORDION) */}
      <section id="faq" className="space-y-8 scroll-mt-20">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2d7365] dark:text-[#6a92be]">
            TIRA-DÚVIDAS
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-sm text-[#4a4c52] dark:text-[#969696]">
            Tudo o que você precisa saber sobre o teste, metodologia e privacidade.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border transition-colors overflow-hidden bg-[#faf9f4] border-[#dcdad0] dark:bg-[#252526] dark:border-[#2d2d2d]"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#18191b] dark:text-[#ffffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`font-mono text-lg transition-transform duration-200 text-[#2d7365] dark:text-[#6a92be] ${
                      isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed border-t border-[#f0eee4] dark:border-[#2d2d2d]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. ESCOLHA A PROFUNDIDADE (CTA FINAL) */}
      <section id="modalidades" className="space-y-8 scroll-mt-20 pt-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#2d7365] dark:text-[#6a92be]">
            PRONTO PARA COMEÇAR?
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight">
            Escolha a profundidade da avaliação
          </h2>
          <p className="text-sm text-[#4a4c52] dark:text-[#969696]">
            Selecione a extensão mais adequada para o seu momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modalities.map((mKey) => {
            const mod = MODALITY_CONFIG[mKey];
            const isRecommended = mKey === 'medio';
            return (
              <div
                key={mod.key}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between border transition-all ${
                  isRecommended
                    ? 'border-2 border-[#78c6b5] dark:border-[#4a729c] shadow-md bg-[#faf9f4] dark:bg-[#252526]'
                    : 'border border-[#dcdad0] dark:border-[#2d2d2d] bg-[#faf9f4] dark:bg-[#252526]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-extrabold text-[#18191b] dark:text-[#ffffff]">
                      Modo {mod.title}
                    </h3>
                    {isRecommended && (
                      <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold bg-[#dcf2ec] text-[#1b5247] dark:bg-[#253242] dark:text-[#9fc0e5]">
                        Recomendado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-[#4a4c52] dark:text-[#969696] bg-[#f0eee4] dark:bg-[#1e1e1e] px-3 py-2 rounded-xl">
                    <span>{mod.questionCount} itens</span>
                    <span>•</span>
                    <span>{mod.durationLabel}</span>
                    <span>•</span>
                    <span className="text-[#2d7365] dark:text-[#6a92be] font-bold">
                      ~{mod.precision}% precisão
                    </span>
                  </div>

                  <p className="text-sm text-[#4a4c52] dark:text-[#969696] leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => startModality(mod.key)}
                  className={`mt-6 min-h-[46px] w-full rounded-xl px-4 py-2.5 font-bold text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isRecommended
                      ? 'bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]'
                      : 'bg-[#eae8de] hover:bg-[#dedcd0] text-[#18191b] dark:bg-[#1e1e1e] dark:hover:bg-[#282828] dark:text-[#d4d4d4] border border-[#d4d2c7] dark:border-[#333333] focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]'
                  }`}
                >
                  Iniciar Quiz {mod.title} ({mod.questionCount} questões)
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
