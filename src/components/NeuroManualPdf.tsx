import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import type { TemperamentResult } from '../types/temperament';
import { getFormattedAxes, getFormattedProportions, TEMPERAMENT_META } from '../lib/psychometrics';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#161616',
    color: '#dad8d0',
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
    paddingBottom: 14,
    marginBottom: 18,
  },
  eyebrow: {
    color: '#9e9c95',
    fontSize: 8,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    color: '#ecebe6',
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#c8c6be',
    fontSize: 11,
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#252526',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  sectionTitle: {
    color: '#ecebe6',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#2a2a28',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  paragraph: {
    color: '#c8c6be',
    lineHeight: 1.45,
    marginBottom: 6,
  },
  labelBold: {
    color: '#ecebe6',
    fontFamily: 'Helvetica-Bold',
  },
  bulletItem: {
    color: '#c8c6be',
    marginBottom: 3,
    paddingLeft: 6,
  },
  footer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
    color: '#8e8c85',
    fontSize: 8,
    textAlign: 'center',
  },
});

export function NeuroManualDocument({ result }: { result: TemperamentResult }) {
  const dom = TEMPERAMENT_META[result.dominant];
  const sec = TEMPERAMENT_META[result.secondary];
  const proportions = getFormattedProportions(result);
  const axes = getFormattedAxes(result);

  return (
    <Document title={`Manual Neurofuncional - ${result.compositeName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            4T • TEMPERAMENTOS • MANUAL NEUROFUNCIONAL PERSONALIZADO • ID #{result.id}
          </Text>
          <Text style={styles.title}>Matriz {result.compositeName}</Text>
          <Text style={styles.subtitle}>
            Dominante: {dom.name} ({result.temperaments[result.dominant]}%) • Secundário:{' '}
            {sec.name} ({result.temperaments[result.secondary]}%) • Precisão Estimada:{' '}
            {result.precisionEstimate}%
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Proporção dos 4 Temperamentos e Correlatos</Text>
          {proportions.map((p) => (
            <View key={p.key}>
              <View style={styles.row}>
                <Text style={styles.labelBold}>
                  {p.name} ({p.classicalElement}) • {p.neuroCorrelate}
                </Text>
                <Text style={styles.labelBold}>
                  {p.percentage}% (Afinidade {p.affinityScore}%)
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={{
                    width: `${Math.max(4, p.percentage)}%`,
                    height: 8,
                    backgroundColor: p.gradientFrom,
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Os 4 Eixos Neurobiológicos (PEN de Eysenck + Fisher)</Text>
          {axes.map((ax) => (
            <View key={ax.key} style={{ marginBottom: 6 }}>
              <View style={styles.row}>
                <Text style={styles.labelBold}>{ax.label}</Text>
                <Text>
                  {ax.leftPole} ({ax.leftPercent}%) vs. {ax.rightPole} ({ax.rightPercent}%)
                </Text>
              </View>
              <Text style={styles.paragraph}>{ax.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Arquitetura Dominante: {dom.name} ({dom.classicalHumor})
          </Text>
          <Text style={styles.paragraph}>{dom.summary}</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.labelBold}>Dinâmica Neuroquímica: </Text>
            {dom.neuroDynamics}
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.labelBold}>Gatilhos de Estresse: </Text>
            {dom.stressTrigger}
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.labelBold}>Protocolo de Regulação e Recarga: </Text>
            {dom.recoveryProtocol}
          </Text>
          <Text style={styles.labelBold}>Forças Operacionais:</Text>
          {dom.strengths.map((s, idx) => (
            <Text key={idx} style={styles.bulletItem}>
              • {s}
            </Text>
          ))}
          <Text style={[styles.labelBold, { marginTop: 4 }]}>Pontos de Atenção:</Text>
          {dom.blindSpots.map((b, idx) => (
            <Text key={idx} style={styles.bulletItem}>
              • {b}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Modulação Secundária: {sec.name} ({sec.classicalHumor})
          </Text>
          <Text style={styles.paragraph}>{sec.summary}</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.labelBold}>Ritmo de Trabalho Combinado: </Text>
            {sec.workRhythm}
          </Text>
        </View>

        <Text style={styles.footer}>
          Gerado no navegador via Temperamentos (4T) • Baseado nos modelos de Eysenck (PEN) e Helen Fisher (FTI).
        </Text>
      </Page>
    </Document>
  );
}

export async function downloadNeuroManualPdf(result: TemperamentResult): Promise<void> {
  const blob = await pdf(<NeuroManualDocument result={result} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `manual-neurofuncional-${result.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

