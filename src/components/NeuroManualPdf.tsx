import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Svg,
  Rect,
  Line,
  Circle,
} from '@react-pdf/renderer';
import type { TemperamentResult } from '../types/temperament';
import {
  AXES_META,
  calculateBiologicalMatrixCoordinates,
  getFormattedAxes,
  getFormattedProportions,
  TEMPERAMENT_META,
} from '../lib/psychometrics';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#18191b',
    color: '#d4d4d4',
    padding: 24,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  card: {
    backgroundColor: '#252526',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#969696',
    fontSize: 7.5,
    marginBottom: 8,
  },
  headerPill: {
    color: '#78c6b5',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#d4d4d4',
    fontSize: 9,
    marginBottom: 4,
  },
  summaryText: {
    color: '#a0a0a0',
    fontSize: 8,
    lineHeight: 1.35,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  barTrack: {
    height: 18,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#383838',
    position: 'relative',
    overflow: 'hidden',
    marginTop: 3,
    marginBottom: 7,
    justifyContent: 'center',
  },
  splitBarContainer: {
    height: 16,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    marginTop: 3,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#383838',
  },
  markerCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: '#ffffff',
  },
  marker25: {
    position: 'absolute',
    left: '25%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#777777',
  },
  labelBold: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  textMuted: {
    color: '#969696',
  },
  footer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
    color: '#777777',
    fontSize: 7,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionBadge: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
  },
});

export function NeuroManualDocument({ result }: { result: TemperamentResult }) {
  const dom = TEMPERAMENT_META[result.dominant];
  const sec = TEMPERAMENT_META[result.secondary];
  const proportions = getFormattedProportions(result);
  const axes = getFormattedAxes(result);
  const coords = calculateBiologicalMatrixCoordinates(result);

  // Mapeamento do SVG dos quadrantes (área útil de 15 a 185)
  const pinX = 15 + (coords.plotX / 100) * 170;
  const pinY = 15 + (coords.plotY / 100) * 170;

  return (
    <Document title={`Relatório Completo - ${result.compositeName} (4T)`}>
      {/* PÁGINA 1: MAPA GERAL E EIXOS NEUROBIOLÓGICOS */}
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho do Resultado */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.headerPill}>
              ID #{result.id} • MODALIDADE {result.modality.toUpperCase()} ({result.questionCount} ITENS)
            </Text>
            <Text style={[styles.headerPill, { color: '#6a92be' }]}>
              Precisão Psicométrica Estimada: ~{result.precisionEstimate}%
            </Text>
          </View>
          <Text style={[styles.textMuted, { fontSize: 7, textTransform: 'uppercase', letterSpacing: 1 }]}>
            TEMPERAMENTO COMPOSTO IDENTIFICADO
          </Text>
          <Text style={styles.title}>{result.compositeName}</Text>
          <Text style={styles.subtitle}>
            Predomínio <Text style={styles.labelBold}>{dom.name} ({result.temperaments[result.dominant]}%)</Text> com modulação secundária <Text style={styles.labelBold}>{sec.name} ({result.temperaments[result.secondary]}%)</Text>.
          </Text>
          <Text style={styles.summaryText}>{dom.summary}</Text>
        </View>

        {/* 1. Proporção dos 4 Temperamentos */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Proporção dos 4 Temperamentos</Text>
              <Text style={styles.cardSubtitle}>
                Distribuição relativa calibrada (marcador basal em 25% e centro em 50%).
              </Text>
            </View>
            <Text style={styles.sectionBadge}>SOMA = 100%</Text>
          </View>

          {proportions.map((item) => (
            <View key={item.key} style={{ marginBottom: 4 }}>
              <View style={styles.rowBetween}>
                <Text style={{ fontSize: 9 }}>
                  <Text style={styles.labelBold}>{item.name}</Text>{' '}
                  <Text style={styles.textMuted}>({item.classicalElement})</Text>
                </Text>
                <Text style={{ fontSize: 9 }}>
                  <Text style={styles.textMuted}>Afinidade bruta: {item.affinityScore}%   </Text>
                  <Text style={[styles.labelBold, { fontSize: 10 }]}>{item.percentage}%</Text>
                </Text>
              </View>

              {/* Barra de Progresso com Marcadores */}
              <View style={styles.barTrack}>
                <View
                  style={{
                    width: `${Math.max(3, item.percentage)}%`,
                    height: '100%',
                    backgroundColor: item.gradientFrom,
                  }}
                />
                <View style={styles.marker25} />
                <View style={styles.markerCenter} />
                <View
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: 2.5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    right: 6,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
                    {item.neuroCorrelate.split('(')[0].trim()}
                  </Text>
                  <Text style={{ color: '#ffffff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
                    {item.percentage}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 2. Os 4 Eixos Neurobiológicos */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Os 4 Eixos Neurobiológicos</Text>
              <Text style={styles.cardSubtitle}>
                Integração do modelo PEN de Eysenck com o Fisher Temperament Inventory.
              </Text>
            </View>
            <Text style={styles.sectionBadge}>4 EIXOS</Text>
          </View>

          {axes.map((ax) => {
            const meta = AXES_META[ax.key];
            return (
              <View key={ax.key} style={{ marginBottom: 6 }}>
                <View style={styles.rowBetween}>
                  <Text style={{ fontSize: 8 }}>
                    <Text style={styles.labelBold}>{ax.leftPole}</Text>{' '}
                    <Text style={{ color: meta.leftColor, fontFamily: 'Helvetica-Bold' }}>
                      ({ax.leftPercent}%)
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#969696' }}>
                    {ax.label.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 8 }}>
                    <Text style={{ color: meta.rightColor, fontFamily: 'Helvetica-Bold' }}>
                      ({ax.rightPercent}%)
                    </Text>{' '}
                    <Text style={styles.labelBold}>{ax.rightPole}</Text>
                  </Text>
                </View>

                {/* Bipolar Dual Split Bar */}
                <View style={styles.splitBarContainer}>
                  <View
                    style={{
                      width: `${ax.leftPercent}%`,
                      height: '100%',
                      backgroundColor: meta.leftColor,
                      justifyContent: 'center',
                      paddingLeft: 4,
                    }}
                  >
                    {ax.leftPercent >= 16 && (
                      <Text style={{ color: '#ffffff', fontSize: 6.5, fontFamily: 'Helvetica-Bold' }}>
                        {ax.leftPercent}%
                      </Text>
                    )}
                  </View>
                  <View
                    style={{
                      width: `${ax.rightPercent}%`,
                      height: '100%',
                      backgroundColor: meta.rightColor,
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                      paddingRight: 4,
                    }}
                  >
                    {ax.rightPercent >= 16 && (
                      <Text style={{ color: '#ffffff', fontSize: 6.5, fontFamily: 'Helvetica-Bold' }}>
                        {ax.rightPercent}%
                      </Text>
                    )}
                  </View>
                  <View style={styles.markerCenter} />
                </View>

                <Text style={[styles.textMuted, { fontSize: 6.8 }]}>{ax.description}</Text>
              </View>
            );
          })}
        </View>

        {/* Rodapé Página 1 */}
        <View style={styles.footer}>
          <Text>Temperamentos (4T) • Relatório Oficial • ID #{result.id}</Text>
          <Text>Página 1 de 2</Text>
        </View>
      </Page>

      {/* PÁGINA 2: PLANO HIPOCRÁTICO-GALÊNICO E MANUAL NEUROFUNCIONAL */}
      <Page size="A4" style={styles.page}>
        {/* 3. Matriz Bidimensional Hipocrático-Galênica (Quente/Frio x Seco/Úmido) */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Gráfico Quente / Frio × Seco / Úmido</Text>
              <Text style={styles.cardSubtitle}>
                Plano Cartesiano Hipocrático-Galênico: velocidade de ignição e retenção plástica.
              </Text>
            </View>
            <Text style={[styles.sectionBadge, { color: '#78c6b5' }]}>{coords.primaryQuality}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            {/* Gráfico SVG Cartesiano dos 4 Quadrantes */}
            <View style={{ width: 195, height: 195, alignItems: 'center', justifyContent: 'center' }}>
              <Svg viewBox="0 0 200 200" style={{ width: 190, height: 190 }}>
                {/* Fundo do Quadro */}
                <Rect x={10} y={10} width={180} height={180} rx={8} fill="#141414" stroke="#2d2d2d" strokeWidth={1} />

                {/* Quadrante 1: Topo Esquerdo (Colérico: Quente + Seco) */}
                <Rect x={15} y={15} width={82} height={82} rx={6} fill="#2c1a18" stroke="#d9776c" strokeWidth={0.8} />
                <Text x={22} y={32} style={{ fill: '#d9776c', fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>
                  COLÉRICO
                </Text>
                <Text x={22} y={42} style={{ fill: '#999999', fontSize: 5.5 }}>
                  Quente + Seco (Fogo)
                </Text>

                {/* Quadrante 2: Topo Direito (Sanguíneo: Quente + Úmido) */}
                <Rect x={103} y={15} width={82} height={82} rx={6} fill="#2c2818" stroke="#dfc16b" strokeWidth={0.8} />
                <Text x={110} y={32} style={{ fill: '#dfc16b', fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>
                  SANGUÍNEO
                </Text>
                <Text x={110} y={42} style={{ fill: '#999999', fontSize: 5.5 }}>
                  Quente + Úmido (Ar)
                </Text>

                {/* Quadrante 3: Base Esquerda (Melancólico: Frio + Seco) */}
                <Rect x={15} y={103} width={82} height={82} rx={6} fill="#18222c" stroke="#5b82b0" strokeWidth={0.8} />
                <Text x={22} y={120} style={{ fill: '#6a92be', fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>
                  MELANCÓLICO
                </Text>
                <Text x={22} y={130} style={{ fill: '#999999', fontSize: 5.5 }}>
                  Frio + Seco (Terra)
                </Text>

                {/* Quadrante 4: Base Direita (Fleumático: Frio + Úmido) */}
                <Rect x={103} y={103} width={82} height={82} rx={6} fill="#182c24" stroke="#6eb096" strokeWidth={0.8} />
                <Text x={110} y={120} style={{ fill: '#78c6b5', fontSize: 7.5, fontFamily: 'Helvetica-Bold' }}>
                  FLEUMÁTICO
                </Text>
                <Text x={110} y={130} style={{ fill: '#999999', fontSize: 5.5 }}>
                  Frio + Úmido (Água)
                </Text>

                {/* Eixos Cruzados */}
                <Line x1={100} y1={12} x2={100} y2={188} stroke="#444444" strokeWidth={1} />
                <Line x1={12} y1={100} x2={188} y2={100} stroke="#444444" strokeWidth={1} />

                {/* Rótulos dos Eixos */}
                <Text x={60} y={8} style={{ fill: '#ffffff', fontSize: 5.5, fontFamily: 'Helvetica-Bold' }}>
                  QUENTE (AÇÃO RÁPIDA)
                </Text>
                <Text x={45} y={197} style={{ fill: '#ffffff', fontSize: 5.5, fontFamily: 'Helvetica-Bold' }}>
                  FRIO (PONDERAÇÃO CAUTELOSA)
                </Text>
                <Text x={1} y={102} style={{ fill: '#ffffff', fontSize: 5, fontFamily: 'Helvetica-Bold' }}>
                  SECO
                </Text>
                <Text x={183} y={102} style={{ fill: '#ffffff', fontSize: 5, fontFamily: 'Helvetica-Bold' }}>
                  ÚMIDO
                </Text>

                {/* Linhas de Projeção do Usuário */}
                <Line x1={pinX} y1={15} x2={pinX} y2={185} stroke="#ffffff" strokeWidth={0.8} strokeDasharray="2 2" opacity={0.6} />
                <Line x1={15} y1={pinY} x2={185} y2={pinY} stroke="#ffffff" strokeWidth={0.8} strokeDasharray="2 2" opacity={0.6} />

                {/* Ponto de Posição do Usuário */}
                <Circle cx={pinX} cy={pinY} r={8} fill="#ffffff" opacity={0.2} />
                <Circle cx={pinX} cy={pinY} r={4.5} fill="#ffffff" stroke="#d9776c" strokeWidth={1.5} />
              </Svg>
            </View>

            {/* Painel Analítico dos Eixos Térmico e de Fluidez */}
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={{ color: '#ffffff', fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>
                {coords.quadrantName}
              </Text>
              <Text style={[styles.textMuted, { fontSize: 7.2, lineHeight: 1.35, marginBottom: 8 }]}>
                {coords.quadrantDescription}
              </Text>

              {/* Eixo Térmico */}
              <View style={{ marginBottom: 6 }}>
                <View style={styles.rowBetween}>
                  <Text style={{ fontSize: 7, color: '#d9776c', fontFamily: 'Helvetica-Bold' }}>
                    Quente {coords.hotPercent}%
                  </Text>
                  <Text style={{ fontSize: 6.5, color: '#969696', fontFamily: 'Helvetica-Bold' }}>
                    EIXO TÉRMICO (REATIVIDADE)
                  </Text>
                  <Text style={{ fontSize: 7, color: '#5b82b0', fontFamily: 'Helvetica-Bold' }}>
                    Frio {coords.coldPercent}%
                  </Text>
                </View>
                <View style={[styles.splitBarContainer, { height: 10 }]}>
                  <View style={{ width: `${coords.hotPercent}%`, backgroundColor: '#d9776c' }} />
                  <View style={{ width: `${coords.coldPercent}%`, backgroundColor: '#5b82b0' }} />
                  <View style={styles.markerCenter} />
                </View>
              </View>

              {/* Eixo de Fluidez */}
              <View>
                <View style={styles.rowBetween}>
                  <Text style={{ fontSize: 7, color: '#5b82b0', fontFamily: 'Helvetica-Bold' }}>
                    Seco {coords.dryPercent}%
                  </Text>
                  <Text style={{ fontSize: 6.5, color: '#969696', fontFamily: 'Helvetica-Bold' }}>
                    EIXO DE FLUIDEZ (RETENÇÃO)
                  </Text>
                  <Text style={{ fontSize: 7, color: '#6eb096', fontFamily: 'Helvetica-Bold' }}>
                    Úmido {coords.wetPercent}%
                  </Text>
                </View>
                <View style={[styles.splitBarContainer, { height: 10 }]}>
                  <View style={{ width: `${coords.dryPercent}%`, backgroundColor: '#5b82b0' }} />
                  <View style={{ width: `${coords.wetPercent}%`, backgroundColor: '#6eb096' }} />
                  <View style={styles.markerCenter} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Manual Neurofuncional e Arquitetura Comportamental */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manual Neurofuncional: {result.compositeName}</Text>
          <Text style={styles.cardSubtitle}>
            Diretrizes de regulação, gatilhos de estresse e dinâmica operacional personalizada.
          </Text>

          <View style={{ marginBottom: 6 }}>
            <Text style={{ color: '#ffffff', fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>
              Dinâmica Neuroquímica ({dom.name})
            </Text>
            <Text style={styles.summaryText}>{dom.neuroDynamics}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
            <View style={{ flex: 1, backgroundColor: '#1e1e1e', padding: 6, borderRadius: 5 }}>
              <Text style={{ color: '#f0a99e', fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>
                GATILHOS CRÍTICOS DE ESTRESSE:
              </Text>
              <Text style={[styles.textMuted, { fontSize: 7 }]}>{dom.stressTrigger}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#1e1e1e', padding: 6, borderRadius: 5 }}>
              <Text style={{ color: '#78c6b5', fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>
                PROTOCOLO DE RECUPERAÇÃO:
              </Text>
              <Text style={[styles.textMuted, { fontSize: 7 }]}>{dom.recoveryProtocol}</Text>
            </View>
          </View>

          {/* Forças e Pontos Cegos Lado a Lado */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
            <View style={{ flex: 1, backgroundColor: '#1e1e1e', padding: 6, borderRadius: 5 }}>
              <Text style={{ color: '#ffffff', fontSize: 7.5, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>
                FORÇAS PRINCIPAIS:
              </Text>
              {dom.strengths.slice(0, 4).map((s, idx) => (
                <Text key={idx} style={{ color: '#b0b0b0', fontSize: 6.8, marginBottom: 1.5 }}>
                  • {s}
                </Text>
              ))}
            </View>
            <View style={{ flex: 1, backgroundColor: '#1e1e1e', padding: 6, borderRadius: 5 }}>
              <Text style={{ color: '#ffffff', fontSize: 7.5, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>
                PONTOS DE ATENÇÃO:
              </Text>
              {dom.blindSpots.slice(0, 4).map((b, idx) => (
                <Text key={idx} style={{ color: '#b0b0b0', fontSize: 6.8, marginBottom: 1.5 }}>
                  • {b}
                </Text>
              ))}
            </View>
          </View>

          {/* Ritmo Operacional Combinado */}
          <View style={{ backgroundColor: '#1e1e1e', padding: 6, borderRadius: 5 }}>
            <Text style={{ color: '#dfc16b', fontSize: 7, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>
              INTERAÇÃO COM SECUNDÁRIO ({sec.name}) & CADÊNCIA DE TRABALHO:
            </Text>
            <Text style={[styles.textMuted, { fontSize: 7 }]}>
              {sec.neuroDynamics} Ritmo combinado: {dom.workRhythm} com {sec.workRhythm}
            </Text>
          </View>
        </View>

        {/* Rodapé Página 2 */}
        <View style={styles.footer}>
          <Text>Modelagem psicométrica baseada no modelo PEN (Eysenck) e FTI (Fisher) • 100% Processamento Local</Text>
          <Text>Página 2 de 2</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadNeuroManualPdf(result: TemperamentResult): Promise<string> {
  const blob = await pdf(<NeuroManualDocument result={result} />).toBlob();
  const url = URL.createObjectURL(blob);
  const filename = `relatorio-temperamentos-${result.id}.pdf`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';
  document.body.appendChild(link);

  try {
    link.click();
  } catch {
    window.open(url, '_blank');
  }

  setTimeout(() => {
    try {
      if (link.parentNode) link.parentNode.removeChild(link);
    } catch {}
  }, 30000);

  return url;
}
