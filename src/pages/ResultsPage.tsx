import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { TemperamentBars } from '../components/TemperamentBars';
import {
  buildWhatsAppShareUrl,
  type ExportCardFormat,
  renderTemperamentCanvas,
} from '../lib/canvasExporter';
import { TEMPERAMENT_META } from '../lib/psychometrics';
import {
  fetchResultByIdOrHash,
  getLatestLocalResult,
  isStripeConfigured,
  isSupabaseConfigured,
} from '../lib/storage';
import { encodeResultToBase64 } from '../lib/validation';
import type { TemperamentResult } from '../types/temperament';

export function ResultsPage() {
  const { id: routeId } = useParams<{ id?: string }>();
  const location = useLocation();

  const [result, setResult] = useState<TemperamentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [canvasFormat, setCanvasFormat] = useState<ExportCardFormat>('9:16');
  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  const stripeLive = isStripeConfigured();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const hashParam = location.hash ? location.hash.replace(/^#/, '') : '';
        const found = await fetchResultByIdOrHash({
          id: routeId,
          hash: hashParam || undefined,
        });

        if (active) {
          if (found) {
            setResult(found);
          } else {
            const latest = getLatestLocalResult();
            setResult(latest ?? null);
          }
        }
      } catch (err) {
        if (active) {
          setErrorMsg(err instanceof Error ? err.message : 'Falha ao carregar matriz.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [routeId, location.hash]);

  useEffect(() => {
    if (!result) return;
    let active = true;
    setIsGeneratingCanvas(true);
    renderTemperamentCanvas(result, canvasFormat)
      .then((dataUrl) => {
        if (active) {
          setCanvasDataUrl(dataUrl);
          setIsGeneratingCanvas(false);
        }
      })
      .catch(() => {
        if (active) setIsGeneratingCanvas(false);
      });
    return () => {
      active = false;
    };
  }, [result, canvasFormat]);

  if (loading) {
    return (
      <div
        role="status"
        className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-10 text-center space-y-3"
      >
        <p className="font-mono text-sm uppercase tracking-wider text-[#2f5c4a] dark:text-[#86c2aa]">
          Processando Dados Psicométricos
        </p>
        <p className="text-base text-[#4e5056] dark:text-[#b5b3ad]">
          Decodificando vetores dos 4 temperamentos e montando os gráficos...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div
        role="alert"
        className="bg-[#faf9f4] dark:bg-[#252526] border border-[#c96f65] rounded-2xl p-8 text-center space-y-4"
      >
        <h1 className="text-xl font-bold text-[#18191b] dark:text-[#ecebe6]">
          Não foi possível ler a matriz
        </h1>
        <p className="text-sm text-[#8c3b32] dark:text-[#e29587]">{errorMsg}</p>
        <Link
          to="/"
          className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl bg-[#28473b] text-white font-bold text-sm"
        >
          Voltar para o Início
        </Link>
      </div>
    );
  }

  if (!result) {
    return <Navigate to="/" replace />;
  }

  const hash = encodeResultToBase64(result);
  const shareUrl = `${window.location.origin}/#scores=${hash}`;
  const supabaseActive = isSupabaseConfigured();
  const whatsAppHref = buildWhatsAppShareUrl(result, shareUrl);

  const domMeta = TEMPERAMENT_META[result.dominant];
  const secMeta = TEMPERAMENT_META[result.secondary];

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setCopiedLink(false);
    }
  };

  const handleDownloadCanvas = () => {
    if (!canvasDataUrl) return;
    const a = document.createElement('a');
    a.href = canvasDataUrl;
    a.download = `temperamentos-${result.id}-${canvasFormat.replace(':', 'x')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { downloadNeuroManualPdf } = await import('../components/NeuroManualPdf');
      await downloadNeuroManualPdf(result);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleStripeCheckout = async () => {
    setCheckoutStatus('Conectando ao gateway de pagamento...');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId: result.id,
          compositeName: result.compositeName,
          returnUrl: window.location.href,
        }),
      });
      const data = (await res.json()) as { mode?: string; url?: string; message?: string };
      if (data.mode === 'live' && data.url) {
        window.location.href = data.url;
        return;
      }
      setCheckoutStatus(
        data.message || 'Modo de Demonstração ativo: relatório completo liberado gratuitamente.'
      );
    } catch {
      setCheckoutStatus('Modo Offline ativo: relatório completo liberado em Modo de Demonstração.');
    }
  };

  return (
    <div className="space-y-10">
      {/* Cabeçalho do Resultado Composto */}
      <section className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-6 sm:p-8 space-y-5 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-[#efeee6] dark:bg-[#1e1e1e] text-[#2c3038] dark:text-[#969696] border border-[#d5d3c8] dark:border-[#2d2d2d]">
            ID #{result.id} • Modalidade {result.modality.toUpperCase()} ({result.questionCount} itens)
          </span>
          <span className="font-mono text-xs font-bold text-[#2d7365] dark:text-[#6a92be]">
            Precisão Psicométrica Estimada: ~{result.precisionEstimate}%
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-[#5c5e64] dark:text-[#969696]">
            TEMPERAMENTO COMPOSTO IDENTIFICADO
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#18191b] dark:text-[#ffffff] tracking-tight">
            {result.compositeName}
          </h1>
          <p className="text-base sm:text-lg font-medium text-[#2c3038] dark:text-[#d4d4d4]">
            Predomínio <strong className="text-[#18191b] dark:text-white">{domMeta.name}</strong> ({result.temperaments[result.dominant]}%) com modulação secundária{' '}
            <strong className="text-[#18191b] dark:text-white">{secMeta.name}</strong> ({result.temperaments[result.secondary]}%).
          </p>
        </div>

        <p className="text-sm sm:text-base text-[#4e5056] dark:text-[#969696] leading-relaxed border-t border-[#e2e0d6] dark:border-[#2d2d2d] pt-4">
          {domMeta.summary}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-xl bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] font-bold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
          >
            Compartilhar no WhatsApp Direct
          </a>

          <button
            type="button"
            onClick={handleCopyShareLink}
            className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-xl bg-[#eae8de] dark:bg-[#1e1e1e] hover:bg-[#dedcd0] dark:hover:bg-[#282828] text-[#18191b] dark:text-[#d4d4d4] border border-[#c8c6ba] dark:border-[#333333] font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
          >
            {copiedLink ? 'Link Copiado!' : 'Copiar Link do Resultado'}
          </button>

          {supabaseActive && (
            <Link
              to={`/compare?data1=${hash}`}
              className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-xl bg-[#eae8de] dark:bg-[#1e1e1e] hover:bg-[#dedcd0] dark:hover:bg-[#282828] text-[#2d7365] dark:text-[#6a92be] border border-[#a8dec5] dark:border-[#38526e] font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
            >
              Comparar com Amigo / Equipe
            </Link>
          )}
        </div>
      </section>

      {/* Barras de Temperamento e 4 Eixos Bipolares */}
      <TemperamentBars result={result} />

      {/* Exportador HTML5 Canvas */}
      <section
        aria-labelledby="canvas-exporter-heading"
        className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-6 sm:p-8 space-y-6 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e0d6] dark:border-[#2d2d2d] pb-4">
          <div>
            <h2
              id="canvas-exporter-heading"
              className="text-xl font-bold text-[#18191b] dark:text-[#ffffff]"
            >
              Gerador de Cards para Redes Sociais (HTML5 Canvas)
            </h2>
            <p className="text-sm text-[#4e5056] dark:text-[#969696]">
              Renderizado 100% no seu navegador sem envio de imagem para servidores externos.
            </p>
          </div>

          <div className="flex items-center gap-2" role="group" aria-label="Formato do Card">
            <button
              type="button"
              onClick={() => setCanvasFormat('9:16')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-mono text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c] ${
                canvasFormat === '9:16'
                  ? 'bg-[#78c6b5] text-[#0e241f] dark:bg-[#3d5f83] dark:text-[#ffffff]'
                  : 'bg-[#eae8de] dark:bg-[#1e1e1e] text-[#18191b] dark:text-[#d4d4d4] border border-[#c8c6ba] dark:border-[#333333]'
              }`}
            >
              Stories (9:16)
            </button>
            <button
              type="button"
              onClick={() => setCanvasFormat('1:1')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-mono text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c] ${
                canvasFormat === '1:1'
                  ? 'bg-[#78c6b5] text-[#0e241f] dark:bg-[#3d5f83] dark:text-[#ffffff]'
                  : 'bg-[#eae8de] dark:bg-[#1e1e1e] text-[#18191b] dark:text-[#d4d4d4] border border-[#c8c6ba] dark:border-[#333333]'
              }`}
            >
              Feed / WhatsApp (1:1)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="bg-[#efeee6] dark:bg-[#1e1e1e] border border-[#d5d3c8] dark:border-[#2d2d2d] rounded-2xl p-4 flex items-center justify-center min-h-[280px]">
            {isGeneratingCanvas ? (
              <span className="font-mono text-xs text-[#4e5056] dark:text-[#969696]">
                Desenhando matriz no Canvas...
              </span>
            ) : canvasDataUrl ? (
              <img
                src={canvasDataUrl}
                alt={`Card ${canvasFormat} da matriz ${result.compositeName}`}
                className="max-h-[420px] w-auto rounded-xl border border-[#c8c6ba] dark:border-[#333333] shadow-md"
              />
            ) : (
              <span className="font-mono text-xs text-[#4e5056] dark:text-[#969696]">
                Pré-visualização indisponível
              </span>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#18191b] dark:text-[#ffffff]">
              Pronto para Stories, Status ou Grupos de Equipe
            </h3>
            <p className="text-sm text-[#4e5056] dark:text-[#969696] leading-relaxed">
              O card inclui suas 4 barras cromáticas com marcadores de equilíbrio, os 4 eixos neurobiológicos bipolares e seu identificador único.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canvasDataUrl}
                onClick={handleDownloadCanvas}
                className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] disabled:opacity-50 font-bold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
              >
                Baixar Imagem PNG ({canvasFormat})
              </button>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] inline-flex items-center px-5 py-2.5 rounded-xl bg-[#eae8de] dark:bg-[#1e1e1e] hover:bg-[#dedcd0] dark:hover:bg-[#282828] text-[#18191b] dark:text-[#d4d4d4] border border-[#c8c6ba] dark:border-[#333333] font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
              >
                Enviar Texto Formatado no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Manual Neurofuncional Completo */}
      <section
        aria-labelledby="manual-heading"
        className="bg-[#faf9f4] dark:bg-[#252526] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-2xl p-6 sm:p-8 space-y-6 transition-colors"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e0d6] dark:border-[#2d2d2d] pb-4">
          <div>
            <h2
              id="manual-heading"
              className="text-xl sm:text-2xl font-extrabold text-[#18191b] dark:text-[#ffffff]"
            >
              Manual Neurofuncional: {result.compositeName}
            </h2>
            <p className="text-sm text-[#4e5056] dark:text-[#969696]">
              Análise de dinâmica neuroquímica, gatilhos sob estresse, protocolo de recarga e exportação em PDF.
            </p>
          </div>

          {!stripeLive ? (
            <span className="font-mono text-xs uppercase px-3 py-1.5 rounded-full bg-[#dcf2ec] dark:bg-[#253242] text-[#1b5247] dark:text-[#9fc0e5] border border-[#a8dec5] dark:border-[#38526e] font-bold">
              Modo de Demonstração (Acesso Liberado)
            </span>
          ) : (
            <span className="font-mono text-xs uppercase px-3 py-1.5 rounded-full bg-[#78c6b5] text-[#0e241f] dark:bg-[#3d5f83] dark:text-[#ffffff] font-bold">
              Stripe Checkout Ativo
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#efeee6] dark:bg-[#1e1e1e] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-[#18191b] dark:text-[#ffffff]">
              Dinâmica Neuroquímica ({domMeta.name})
            </h3>
            <p className="text-sm text-[#4e5056] dark:text-[#969696] leading-relaxed">
              {domMeta.neuroDynamics}
            </p>
            <div className="pt-2 space-y-1">
              <p className="text-xs font-mono uppercase text-[#8c3b32] dark:text-[#f0a99e] font-semibold">
                Gatilhos Críticos de Estresse:
              </p>
              <p className="text-sm text-[#4e5056] dark:text-[#969696]">{domMeta.stressTrigger}</p>
            </div>
            <div className="pt-2 space-y-1">
              <p className="text-xs font-mono uppercase text-[#2d7365] dark:text-[#6a92be] font-semibold">
                Protocolo de Regulação e Recarga:
              </p>
              <p className="text-sm text-[#4e5056] dark:text-[#969696]">
                {domMeta.recoveryProtocol}
              </p>
            </div>
          </div>

          <div className="bg-[#efeee6] dark:bg-[#1e1e1e] border border-[#dcdad0] dark:border-[#2d2d2d] rounded-xl p-5 space-y-3">
            <h3 className="text-base font-bold text-[#18191b] dark:text-[#ffffff]">
              Interação com Secundário ({secMeta.name}) & Ritmo Operacional
            </h3>
            <p className="text-sm text-[#4e5056] dark:text-[#969696] leading-relaxed">
              {secMeta.neuroDynamics}
            </p>
            <div className="pt-2 space-y-1">
              <p className="text-xs font-mono uppercase text-[#705824] dark:text-[#dfc16b] font-semibold">
                Cadência Ideal de Trabalho:
              </p>
              <p className="text-sm text-[#4e5056] dark:text-[#969696]">
                {domMeta.workRhythm} Combinado a: {secMeta.workRhythm}
              </p>
            </div>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-mono uppercase text-[#18191b] dark:text-[#ffffff] font-bold mb-1">
                  Forças Principais
                </p>
                <ul className="text-xs text-[#4e5056] dark:text-[#969696] space-y-1 list-disc list-inside">
                  {domMeta.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono uppercase text-[#18191b] dark:text-[#ffffff] font-bold mb-1">
                  Pontos Cegos
                </p>
                <ul className="text-xs text-[#4e5056] dark:text-[#969696] space-y-1 list-disc list-inside">
                  {domMeta.blindSpots.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e0d6] dark:border-[#2d2d2d]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] disabled:opacity-50 font-bold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
            >
              {isGeneratingPdf
                ? 'Renderizando PDF no Cliente...'
                : 'Baixar Manual Neurofuncional em PDF'}
            </button>

            <button
              type="button"
              onClick={handleStripeCheckout}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#eae8de] dark:bg-[#1e1e1e] hover:bg-[#dedcd0] dark:hover:bg-[#282828] text-[#18191b] dark:text-[#d4d4d4] border border-[#c8c6ba] dark:border-[#333333] font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
            >
              {stripeLive
                ? 'Adquirir Versão Premium via Stripe'
                : 'Testar Fluxo de Checkout (Modo Simulação)'}
            </button>
          </div>

          <span className="font-mono text-xs text-[#5c5e64] dark:text-[#969696]">
            Coordenadas PEN: Extroversão {result.eysenck.extroversao}% • Sensibilidade {result.eysenck.neuroticismo}%
          </span>
        </div>

        {checkoutStatus && (
          <div
            role="status"
            className="p-3 rounded-xl bg-[#efeee6] dark:bg-[#1e1e1e] border border-[#a8dec5] dark:border-[#38526e] text-[#18191b] dark:text-[#9fc0e5] text-xs font-mono"
          >
            {checkoutStatus}
          </div>
        )}
      </section>
    </div>
  );
}
